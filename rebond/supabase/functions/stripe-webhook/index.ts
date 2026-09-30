// Reçoit les notifications de Stripe (paiement réussi, session expirée, compte vendeur mis à jour).
// À déployer avec --no-verify-jwt : Stripe n'envoie pas de jeton Supabase, la signature Stripe fait foi.
import Stripe from "npm:stripe@17.7.0";
import { admin, payPending, SHIPPING, stripe } from "../_shared/common.ts";

// Deux points de terminaison Stripe peuvent viser cette fonction : celui du compte plateforme (paiements)
// et celui des comptes connectés (account.updated). Chacun a sa propre clé de signature.
const secrets = [Deno.env.get("STRIPE_WEBHOOK_SECRET"), Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET")].filter((s): s is string => !!s);
const crypto = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const sig = req.headers.get("Stripe-Signature");
  const raw = await req.text();
  let event: Stripe.Event | null = null;
  for (const secret of secrets) {
    try { event = await stripe.webhooks.constructEventAsync(raw, sig ?? "", secret, undefined, crypto); break; } catch { /* essaie la clé suivante */ }
  }
  if (!event) return new Response("Signature invalide", { status: 400 });

  try {
    if (event.type === "checkout.session.completed") await onPaid(event.data.object as Stripe.Checkout.Session);
    else if (event.type === "checkout.session.expired") await onExpired(event.data.object as Stripe.Checkout.Session);
    else if (event.type === "account.updated") await onAccount(event.data.object as Stripe.Account);
  } catch (e) {
    console.error(e);
    return new Response("Erreur de traitement", { status: 500 }); // Stripe réessaiera
  }
  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});

async function onPaid(s: Stripe.Checkout.Session) {
  if (s.payment_status !== "paid") return;
  const { data: existing } = await admin.from("orders").select("id").eq("stripe_session_id", s.id).maybeSingle();
  if (existing) return; // déjà traité (Stripe peut envoyer deux fois)
  const m = s.metadata ?? {};
  const paymentIntent = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
  const { data: listing } = await admin.from("listings").select("*").eq("id", m.listing_id).maybeSingle();

  // Cas rares : la paire est déjà vendue (réservation expirée puis rachetée, ou deuxième paiement
  // d'une session abandonnée) ou retirée. On rembourse ce paiement.
  const takenByOther = listing?.status === "reserved" && listing.reserved_by && listing.reserved_by !== m.buyer_id;
  if (!listing || !["reserved", "active"].includes(listing.status) || takenByOther) {
    if (paymentIntent) await stripe.refunds.create({ payment_intent: paymentIntent }, { idempotencyKey: `refund_session_${s.id}` });
    return;
  }
  const { data: sold } = await admin.from("listings").update({ status: "sold", buyer_id: m.buyer_id, reserved_until: null, reserved_by: null })
    .eq("id", listing.id).in("status", ["reserved", "active"]).select("id");
  if (!sold?.length) {
    if (paymentIntent) await stripe.refunds.create({ payment_intent: paymentIntent }, { idempotencyKey: `refund_session_${s.id}` });
    return;
  }
  await admin.from("orders").insert({
    listing_id: listing.id, title: listing.title, size: listing.size, thumb: listing.thumb,
    seller_id: m.seller_id, buyer_id: m.buyer_id,
    price: Number(m.price), protection: Number(m.protection),
    ship_method: m.ship_method, ship_label: SHIPPING[m.ship_method]?.label ?? "", ship_price: Number(m.ship_price),
    auth: m.auth === "1", auth_price: Number(m.auth_price), total: (s.amount_total ?? 0) / 100,
    shipping_name: m.shipping_name ?? "", shipping_address: m.shipping_address ?? "", shipping_zip: m.shipping_zip ?? "",
    status: "paid", stripe_session_id: s.id, stripe_payment_intent: paymentIntent,
  });
  // Prévient le vendeur dans la conversation, s'il y en a une.
  const { data: thread } = await admin.from("threads").select("id").eq("listing_id", listing.id).eq("buyer_id", m.buyer_id).maybeSingle();
  if (thread) {
    await admin.from("messages").insert({ thread_id: thread.id, from_id: m.buyer_id, kind: "msg", body: "Paiement effectué. Tu as 5 jours pour envoyer la paire." });
  }
}

async function onExpired(s: Stripe.Checkout.Session) {
  const id = s.metadata?.listing_id;
  const buyer = s.metadata?.buyer_id;
  if (id && buyer) await admin.from("listings").update({ status: "active", reserved_until: null, reserved_by: null }).eq("id", id).eq("status", "reserved").eq("reserved_by", buyer);
}

async function onAccount(a: Stripe.Account) {
  const ready = !!a.payouts_enabled && a.capabilities?.transfers === "active";
  const { data: row } = await admin.from("seller_accounts").select("user_id").eq("stripe_account_id", a.id).maybeSingle();
  if (!row) return;
  await admin.from("profiles").update({ payouts_ready: ready }).eq("id", row.user_id);
  if (ready) await payPending(row.user_id);
}
