// Étapes d'une commande qui touchent à l'argent :
//  - confirm : l'acheteur a reçu une paire conforme → le vendeur est payé
//  - cancel  : le vendeur annule, ou l'acheteur annule après 5 jours sans envoi → remboursement
//  - verify / reject : la modération valide ou refuse l'authenticité → envoi à l'acheteur ou remboursement
//  - auto-release : tâche planifiée, confirme les commandes restées sans réponse (voir README)
import { admin, body, currentUser, HttpError, isAdmin, payout, refund, SELLER_SHIP_DAYS, serve } from "../_shared/common.ts";

const AUTO_CONFIRM_DAYS = 14; // sans litige ni confirmation, l'argent part au vendeur

serve(async (req) => {
  const input = await body<{ orderId?: string; action: string }>(req);

  if (input.action === "auto-release") {
    if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET") || !Deno.env.get("CRON_SECRET")) throw new HttpError(403, "Accès refusé.");
    const limit = new Date(Date.now() - AUTO_CONFIRM_DAYS * 86_400_000).toISOString();
    const { data } = await admin.from("orders").select("*").in("status", ["shipped", "verified"]).lt("shipped_at", limit);
    let released = 0;
    for (const o of data ?? []) {
      if (o.status === "shipped" && o.auth) continue; // attend la vérification
      await admin.from("orders").update({ status: "done", delivered_at: new Date().toISOString() }).eq("id", o.id);
      await payout(o); released++;
    }
    return { released };
  }

  const user = await currentUser(req);
  const { data: order } = await admin.from("orders").select("*").eq("id", input.orderId ?? "").maybeSingle();
  if (!order) throw new HttpError(404, "Commande introuvable.");
  const buyer = order.buyer_id === user.id, seller = order.seller_id === user.id;
  const now = new Date().toISOString();

  switch (input.action) {
    case "confirm": {
      if (!buyer) throw new HttpError(403, "Seul l’acheteur peut confirmer la réception.");
      const ok = (order.status === "shipped" && !order.auth) || order.status === "verified";
      if (!ok) throw new HttpError(409, "Cette commande ne peut pas encore être confirmée.");
      await admin.from("orders").update({ status: "done", delivered_at: now, updated_at: now }).eq("id", order.id);
      await payout(order);
      return { status: "done" };
    }
    case "cancel": {
      if (order.status !== "paid") throw new HttpError(409, "La paire est déjà partie : ouvre un litige depuis la messagerie.");
      const late = Date.now() - new Date(order.created_at).getTime() > SELLER_SHIP_DAYS * 86_400_000;
      if (!seller && !(buyer && late)) throw new HttpError(403, `Tu pourras annuler si le vendeur n’a pas envoyé la paire sous ${SELLER_SHIP_DAYS} jours.`);
      await refund(order, "cancelled");
      if (order.listing_id) await admin.from("listings").update({ status: "active", buyer_id: null, reserved_by: null, reserved_until: null }).eq("id", order.listing_id).eq("status", "sold");
      return { status: "cancelled" };
    }
    case "verify":
    case "reject": {
      if (!(await isAdmin(user.id))) throw new HttpError(403, "Réservé à l’équipe d’authentification.");
      if (!order.auth || order.status !== "shipped") throw new HttpError(409, "Cette commande n’attend pas de vérification.");
      if (input.action === "verify") {
        await admin.from("orders").update({ status: "verified", updated_at: now }).eq("id", order.id);
        return { status: "verified" };
      }
      await refund(order, "rejected");
      if (order.listing_id) await admin.from("listings").update({ status: "removed" }).eq("id", order.listing_id);
      return { status: "rejected" };
    }
    default:
      throw new HttpError(400, "Action inconnue.");
  }
});
