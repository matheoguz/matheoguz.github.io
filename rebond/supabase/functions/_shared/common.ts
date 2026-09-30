// Code partagé par les fonctions serveur de Rebond (Supabase Edge Functions, Deno).
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

// Client « service » : ignore les règles RLS. Ne jamais l'exposer au navigateur.
export const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

export const SITE_URL = (Deno.env.get("SITE_URL") ?? "https://matheoguz.github.io/rebond/").replace(/\/?$/, "/");

// Mêmes règles que dans config.js côté appli. Le serveur recalcule toujours les montants.
export const FEES = { buyerRate: 0.03, buyerCap: 5 };
export const AUTH = { price: 7.9, minPrice: 80 };
export const SHIPPING: Record<string, { label: string; price: number }> = {
  relay: { label: "Point relais", price: 3.49 },
  home: { label: "Livraison à domicile", price: 5.99 },
  hand: { label: "Remise en main propre", price: 0 },
};
export const RESERVATION_MINUTES = 31; // une session Stripe Checkout dure au moins 30 minutes
export const SELLER_SHIP_DAYS = 5;     // délai d'envoi avant que l'acheteur puisse annuler

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const cents = (eur: number) => Math.round(eur * 100);
export const protect = (price: number) => Math.min(FEES.buyerCap, round2(price * FEES.buyerRate));

export const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

// Enveloppe commune : CORS, erreurs lisibles en français, pas de fuite de détails internes.
export function serve(fn: (req: Request) => Promise<unknown>) {
  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
    try {
      return json(await fn(req));
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: "Erreur serveur, réessaie dans un instant." }, 500);
    }
  });
}

export async function currentUser(req: Request) {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "Connecte-toi pour continuer.");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Ta session a expiré, reconnecte-toi.");
  return data.user;
}

export async function isAdmin(userId: string) {
  const { data } = await admin.from("profiles").select("is_admin").eq("id", userId).single();
  return !!data?.is_admin;
}

export async function body<T>(req: Request): Promise<T> {
  try { return await req.json() as T; } catch { throw new HttpError(400, "Requête invalide."); }
}

// Verse au vendeur le prix de la paire + les frais de port qu'il a avancés.
// Rebond garde la protection acheteur et la vérification (qui couvrent les frais Stripe).
export async function payout(order: Record<string, any>) {
  if (order.payout_status === "paid" || order.payout_status === "refunded") return;
  const { data: acct } = await admin.from("seller_accounts").select("stripe_account_id").eq("user_id", order.seller_id).maybeSingle();
  const { data: prof } = await admin.from("profiles").select("payouts_ready").eq("id", order.seller_id).maybeSingle();
  if (!acct || !prof?.payouts_ready) {
    await admin.from("orders").update({ payout_status: "awaiting_seller", updated_at: new Date().toISOString() }).eq("id", order.id);
    return;
  }
  const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent);
  const transfer = await stripe.transfers.create({
    amount: cents(Number(order.price) + Number(order.ship_price)),
    currency: "eur",
    destination: acct.stripe_account_id,
    source_transaction: typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id,
    transfer_group: `listing_${order.listing_id}`,
    metadata: { order_id: order.id },
  }, { idempotencyKey: `payout_${order.id}` });
  await admin.from("orders").update({ payout_status: "paid", transfer_id: transfer.id, updated_at: new Date().toISOString() }).eq("id", order.id);
}

export async function payPending(sellerId: string) {
  const { data } = await admin.from("orders").select("*").eq("seller_id", sellerId).eq("status", "done").eq("payout_status", "awaiting_seller");
  for (const o of data ?? []) await payout(o);
}

export async function refund(order: Record<string, any>, status: "cancelled" | "rejected") {
  if (order.payout_status !== "refunded") {
    await stripe.refunds.create({ payment_intent: order.stripe_payment_intent }, { idempotencyKey: `refund_${order.id}` });
  }
  await admin.from("orders").update({ status, payout_status: "refunded", updated_at: new Date().toISOString() }).eq("id", order.id);
}

export async function isPayoutReady(accountId: string) {
  const a = await stripe.accounts.retrieve(accountId);
  return !!a.payouts_enabled && a.capabilities?.transfers === "active";
}
