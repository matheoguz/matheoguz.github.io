// Crée une session de paiement Stripe Checkout pour une paire.
// Le prix est relu en base (ou le prix négocié accepté par le vendeur) : le navigateur ne décide d'aucun montant.
import { admin, AUTH, cents, currentUser, body, HttpError, protect, RESERVATION_MINUTES, serve, SHIPPING, SITE_URL, stripe, round2 } from "../_shared/common.ts";

type Input = { listingId: string; shipping: string; auth: boolean; name?: string; address?: string; zip?: string };

serve(async (req) => {
  const user = await currentUser(req);
  const input = await body<Input>(req);
  const ship = SHIPPING[input.shipping];
  if (!ship) throw new HttpError(400, "Mode de livraison inconnu.");
  const name = (input.name ?? "").trim().slice(0, 80);
  const address = (input.address ?? "").trim().slice(0, 160);
  const zip = (input.zip ?? "").trim();
  if (input.shipping !== "hand") {
    if (!name) throw new HttpError(400, "Indique ton nom pour la livraison.");
    if (!/^\d{5}$/.test(zip)) throw new HttpError(400, "Le code postal doit contenir 5 chiffres.");
    if (input.shipping === "home" && !address) throw new HttpError(400, "Indique ton adresse.");
  }

  await admin.rpc("release_expired_reservations");
  const { data: listing } = await admin.from("listings").select("*").eq("id", input.listingId).maybeSingle();
  const mine = listing?.status === "reserved" && listing.reserved_by === user.id; // relance après un paiement abandonné
  if (!listing || (listing.status !== "active" && !mine)) throw new HttpError(409, "Cette paire n’est plus disponible.");
  if (listing.seller_id === user.id) throw new HttpError(400, "Tu ne peux pas acheter ta propre paire.");

  const { data: thread } = await admin.from("threads").select("accepted_price").eq("listing_id", listing.id).eq("buyer_id", user.id).maybeSingle();
  const price = Number(thread?.accepted_price ?? listing.price);
  const withAuth = !!input.auth && price >= AUTH.minPrice;
  const fee = protect(price);

  // Réserve la paire le temps du paiement (évite qu'elle soit vendue deux fois).
  const until = new Date(Date.now() + RESERVATION_MINUTES * 60_000).toISOString();
  const { data: reserved } = await admin.from("listings").update({ status: "reserved", reserved_until: until, reserved_by: user.id })
    .eq("id", listing.id).eq("status", listing.status).select("id");
  if (!reserved?.length) throw new HttpError(409, "Quelqu’un est en train d’acheter cette paire. Réessaie dans 30 minutes.");

  const line = (label: string, eur: number) => ({ quantity: 1, price_data: { currency: "eur", unit_amount: cents(eur), product_data: { name: label } } });
  const items = [line(`${listing.title} · ${String(listing.size).replace(".", ",")} EU`, price), line("Protection acheteur", fee)];
  if (ship.price) items.push(line(ship.label, ship.price));
  if (withAuth) items.push(line("Vérification d’authenticité", AUTH.price));

  const metadata = {
    listing_id: listing.id, buyer_id: user.id, seller_id: listing.seller_id,
    price: String(price), protection: String(fee), ship_method: input.shipping, ship_price: String(ship.price),
    auth: withAuth ? "1" : "0", auth_price: String(withAuth ? AUTH.price : 0),
    shipping_name: name, shipping_address: address, shipping_zip: zip,
  };
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      customer_email: user.email,
      line_items: items,
      metadata,
      payment_intent_data: { transfer_group: `listing_${listing.id}`, metadata: { listing_id: listing.id } },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${SITE_URL}?checkout=success`,
      cancel_url: `${SITE_URL}?checkout=cancel&listing=${listing.id}`,
    });
    return { url: session.url, total: round2(price + fee + ship.price + (withAuth ? AUTH.price : 0)) };
  } catch (e) {
    await admin.from("listings").update({ status: "active", reserved_until: null, reserved_by: null }).eq("id", listing.id).eq("status", "reserved");
    throw e;
  }
});
