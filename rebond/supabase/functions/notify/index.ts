// E-mails automatiques, déclenchés par la base (voir supabase/notifications.sql) et envoyés avec Resend.
// À déployer avec --no-verify-jwt : l'appel vient de la base, authentifié par x-notify-secret.
import { admin, HttpError, SELLER_SHIP_DAYS, serve, SITE_URL } from "../_shared/common.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "Rebond <notifications@rebond.example>";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";
const AUTH_ADDRESS = Deno.env.get("AUTH_ADDRESS") ?? "l’adresse d’authentification indiquée dans ta commande";

type Row = Record<string, any>;
type Payload = { table: string; type: "INSERT" | "UPDATE"; record: Row; old_record: Row | null };

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const eur = (n: unknown) => Number(n).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const TRACK: Record<string, (n: string) => string> = {
  mondialrelay: n => `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${encodeURIComponent(n)}`,
  colissimo: n => `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(n)}`,
  laposte: n => `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(n)}`,
  chronopost: n => `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${encodeURIComponent(n)}`,
};

serve(async (req) => {
  if (!Deno.env.get("NOTIFY_SECRET") || req.headers.get("x-notify-secret") !== Deno.env.get("NOTIFY_SECRET")) throw new HttpError(403, "Accès refusé.");
  const p = await req.json() as Payload;
  if (p.table === "messages" && p.type === "INSERT") await onMessage(p.record);
  else if (p.table === "orders") await onOrder(p.record, p.type);
  else if (p.table === "reports" && p.type === "INSERT") await onReport(p.record);
  return { ok: true };
});

async function emailOf(userId: string | null) {
  if (!userId) return null;
  const { data } = await admin.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}
async function nameOf(userId: string | null) {
  if (!userId) return "un membre";
  const { data } = await admin.from("profiles").select("username").eq("id", userId).maybeSingle();
  return data?.username ?? "un membre";
}
async function wantsMessages(userId: string) {
  const { data } = await admin.from("user_settings").select("email_notifs").eq("user_id", userId).maybeSingle();
  return data?.email_notifs !== false;
}

function layout(title: string, paragraphs: string[], cta?: { label: string; url: string }) {
  const body = paragraphs.map(t => `<p style="margin:0 0 14px">${t}</p>`).join("");
  const button = cta ? `<p style="margin:22px 0"><a href="${esc(cta.url)}" style="background:#1D4ED8;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;display:inline-block">${esc(cta.label)}</a></p>` : "";
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#F3F4F6;font:16px/1.5 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#121417">
<div style="max-width:560px;margin:0 auto;padding:24px 16px"><div style="font-weight:800;font-size:22px;letter-spacing:-.5px;margin-bottom:16px">rebond<span style="color:#1D4ED8">.</span></div>
<div style="background:#fff;border-radius:12px;padding:24px"><h1 style="font-size:20px;margin:0 0 14px">${esc(title)}</h1>${body}${button}</div>
<p style="font-size:12px;color:#666E76;margin:16px 4px">Tu reçois cet e-mail parce que tu as un compte Rebond. Tu peux couper les e-mails de messagerie dans Profil &gt; Paramètres du compte.</p></div></body></html>`;
}
const plain = (title: string, paragraphs: string[], cta?: { label: string; url: string }) =>
  [title, "", ...paragraphs.map(t => t.replace(/<[^>]+>/g, "")), cta ? `${cta.label} : ${cta.url}` : ""].join("\n");

async function send(to: string | null, subject: string, paragraphs: string[], cta?: { label: string; url: string }) {
  if (!to) return;
  if (!RESEND_API_KEY) { console.log(`[e-mail non envoyé, RESEND_API_KEY absente] ${to} : ${subject}`); return; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, html: layout(subject, paragraphs, cta), text: plain(subject, paragraphs, cta) }),
  });
  if (!res.ok) console.error("Resend", res.status, await res.text());
}

async function onMessage(m: Row) {
  const { data: t } = await admin.from("threads").select("*").eq("id", m.thread_id).maybeSingle();
  if (!t) return;
  const to = m.from_id === t.buyer_id ? t.seller_id : t.buyer_id;
  if (!to || !(await wantsMessages(to))) return;
  // Pas plus d'un e-mail toutes les 10 minutes par conversation et par expéditeur.
  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await admin.from("messages").select("id", { count: "exact", head: true })
    .eq("thread_id", m.thread_id).eq("from_id", m.from_id).lt("id", m.id).gt("created_at", since);
  if ((count ?? 0) > 0) return;
  const who = esc(await nameOf(m.from_id)), item = esc(t.listing_title);
  const url = `${SITE_URL}#/messages/${t.id}`;
  if (m.kind === "offer") await send(await emailOf(to), `Nouvelle offre de ${eur(m.amount)} pour ${t.listing_title}`, [`<b>${who}</b> te propose <b>${eur(m.amount)}</b> pour « ${item} ».`, "Accepte ou refuse l’offre depuis la conversation."], { label: "Répondre à l’offre", url });
  else await send(await emailOf(to), `Nouveau message de ${await nameOf(m.from_id)}`, [`<b>${who}</b> t’a écrit à propos de « ${item} » :`, `<i>${esc(String(m.body).slice(0, 300))}</i>`], { label: "Répondre", url });
}

async function onOrder(o: Row, type: "INSERT" | "UPDATE") {
  const item = esc(o.title), orders = `${SITE_URL}#/commandes/`;
  const [buyer, seller] = await Promise.all([emailOf(o.buyer_id), emailOf(o.seller_id)]);
  const toSeller = Number(o.price) + Number(o.ship_price || 0);
  if (type === "INSERT" && o.status === "paid") {
    const where = o.ship_method === "hand" ? "Convenez du rendez-vous par message." : o.auth ? `Envoie-la à : <b>${esc(AUTH_ADDRESS)}</b> (vérification d’authenticité demandée).` : `Envoie-la à : <b>${esc([o.shipping_name, o.shipping_address, o.shipping_zip].filter(Boolean).join(", "))}</b>.`;
    await send(seller, `Ta paire est vendue : ${o.title}`, [`Bonne nouvelle, « ${item} » est vendue ${eur(o.price)}.`, where, `Tu as <b>${SELLER_SHIP_DAYS} jours</b> pour l’envoyer et saisir le numéro de suivi. Tu recevras ${eur(toSeller)} quand l’acheteur aura confirmé la réception.`], { label: "Voir la vente", url: orders + "ventes" });
    await send(buyer, `Commande confirmée : ${o.title}`, [`Merci ! Tu as payé ${eur(o.total)} pour « ${item} ».`, `Le vendeur a ${SELLER_SHIP_DAYS} jours pour l’envoyer. Ton argent reste bloqué jusqu’à ce que tu confirmes la réception.`], { label: "Suivre ma commande", url: orders + "achats" });
    return;
  }
  switch (o.status) {
    case "shipped": {
      const link = o.tracking && TRACK[o.carrier] ? { label: "Suivre le colis", url: TRACK[o.carrier](o.tracking) } : { label: "Voir ma commande", url: orders + "achats" };
      const lines = o.auth ? [`« ${item} » est partie chez Rebond pour la vérification d’authenticité. On te prévient dès qu’elle est validée.`]
        : o.ship_method === "hand" ? [`Le vendeur indique t’avoir remis « ${item} ». Vérifie-la, puis confirme la réception dans l’appli.`]
        : [`« ${item} » est en route.${o.tracking ? ` Numéro de suivi : <b>${esc(o.tracking)}</b>.` : ""}`, "Quand tu la reçois, vérifie-la puis confirme la réception. En cas de problème, ouvre un litige avant de confirmer."];
      await send(buyer, o.auth ? "Ta paire part en vérification" : "Ta paire est en route", lines, link);
      break;
    }
    case "verified":
      await send(buyer, "Paire authentifiée ✓", [`Notre équipe a vérifié « ${item} » : elle est authentique. Elle part maintenant chez toi.`], { label: "Voir ma commande", url: orders + "achats" });
      break;
    case "done": {
      const { data: prof } = await admin.from("profiles").select("payouts_ready").eq("id", o.seller_id).maybeSingle();
      await send(seller, prof?.payouts_ready ? `${eur(toSeller)} versés pour ${o.title}` : `Active ton porte-monnaie pour recevoir ${eur(toSeller)}`,
        [prof?.payouts_ready ? `L’acheteur a confirmé la réception de « ${item} ». ${eur(toSeller)} sont versés sur ton porte-monnaie.` : `L’acheteur a confirmé la réception de « ${item} ». Active ton porte-monnaie pour recevoir ${eur(toSeller)}.`],
        { label: prof?.payouts_ready ? "Voir mes ventes" : "Activer mon porte-monnaie", url: prof?.payouts_ready ? orders + "ventes" : `${SITE_URL}#/compte` });
      break;
    }
    case "cancelled":
      await send(buyer, `Commande annulée : ${o.title}`, [`La commande « ${item} » est annulée. Tu es remboursé·e de ${eur(o.total)} sur ton moyen de paiement (sous 5 à 10 jours).`], { label: "Voir mes commandes", url: orders + "achats" });
      await send(seller, `Vente annulée : ${o.title}`, [`La vente de « ${item} » est annulée et l’acheteur est remboursé.${o.dispute_resolution ? ` Motif : ${esc(o.dispute_resolution)}` : ""}`], { label: "Voir mes ventes", url: orders + "ventes" });
      break;
    case "rejected":
      await send(buyer, "Paire refusée à la vérification", [`Notre équipe a jugé que « ${item} » n’est pas authentique. Tu es remboursé·e intégralement (${eur(o.total)}).`], { label: "Voir mes commandes", url: orders + "achats" });
      await send(seller, "Paire refusée à la vérification", [`« ${item} » n’a pas passé la vérification d’authenticité. L’acheteur est remboursé et l’annonce est retirée.`, "Pour contester, réponds à cet e-mail avec tes preuves d’achat."], { label: "Voir mes ventes", url: orders + "ventes" });
      break;
    case "disputed":
      await send(seller, `Litige ouvert : ${o.title}`, [`L’acheteur signale un problème avec « ${item} ». L’argent reste bloqué pendant l’examen.`, `Motif : <i>${esc(o.dispute_details)}</i>`, "Réponds-lui dans la conversation : notre équipe examine les deux versions."], { label: "Voir la vente", url: orders + "ventes" });
      if (ADMIN_EMAIL) await send(ADMIN_EMAIL, `[Litige] ${o.title}`, [`Motif : ${esc(o.dispute_reason)} — ${esc(o.dispute_details)}`], { label: "Ouvrir la modération", url: `${SITE_URL}#/moderation/litiges` });
      break;
  }
}

async function onReport(r: Row) {
  if (!ADMIN_EMAIL) return;
  const { data: l } = await admin.from("listings").select("title").eq("id", r.listing_id).maybeSingle();
  await send(ADMIN_EMAIL, `[Signalement] ${l?.title ?? "annonce"}`, [`Motif : ${esc(r.reason)}`, esc(r.details || "(sans détail)")], { label: "Ouvrir la modération", url: `${SITE_URL}#/moderation` });
}
