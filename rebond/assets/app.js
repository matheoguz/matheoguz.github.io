/* Rebond — marketplace de sneakers de seconde main.
   Deux modes, même interface :
   - démo : données dans le navigateur (localStorage), paiement simulé ;
   - live : Supabase (comptes, base, photos, temps réel) + Stripe via les fonctions serveur.
   Le mode live s'active dès que config.js contient l'URL et la clé publique Supabase. */
(() => {
"use strict";

const CFG = window.REBOND_CONFIG || {};
const LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);

/* ================= Règles métier (identiques côté serveur : supabase/functions/_shared/common.ts) ================= */
const FEES = { buyerRate: 0.03, buyerCap: 5 };
const AUTH = { price: 7.9, minPrice: 80 };
const SELLER_SHIP_DAYS = 5;
const SHIPPING = [
  { id: "relay", label: "Point relais", sub: "3 à 5 jours ouvrés · suivi", price: 3.49 },
  { id: "home",  label: "Livraison à domicile", sub: "2 à 3 jours ouvrés · suivi", price: 5.99 },
  { id: "hand",  label: "Remise en main propre", sub: "Vous convenez du lieu par message", price: 0 },
];
const STYLES = [
  { id: "lifestyle", label: "Lifestyle" }, { id: "running", label: "Running" }, { id: "basket", label: "Basketball" },
  { id: "skate", label: "Skate" }, { id: "outdoor", label: "Outdoor & trail" }, { id: "enfant", label: "Enfant" },
];
const BRANDS = ["Nike","Jordan","Adidas","New Balance","Asics","Salomon","Vans","Converse","Puma","Veja","On","Hoka","Reebok","Autre"];
const SIZES = ["28","30","32","34","35","36","36.5","37.5","38","38.5","39","40","40.5","41","42","42.5","43","44","44.5","45","45.5","46","47","47.5","48.5"];
const US = { "38.5":"6","39":"6.5","40":"7","40.5":"7.5","41":"8","42":"8.5","42.5":"9","43":"9.5","44":"10","44.5":"10.5","45":"11","45.5":"11.5","46":"12","47":"12.5","47.5":"13","48.5":"14" };
const CONDS = [
  ["Neuve (DS)", "Jamais portée, dans sa boîte, étiquettes d’origine."],
  ["Portée 1 à 2 fois", "Aucune marque visible sur la tige ni la semelle."],
  ["Très bon état", "Légères traces d’usure, rien d’abîmé."],
  ["Bon état", "Usure visible (plis, semelle), en bon état de marche."],
  ["Usée", "Traces marquées, décrites et photographiées."],
];
const COLORS = ["Blanc","Noir","Gris","Beige","Marron","Rouge","Bleu","Vert","Jaune","Orange","Rose","Violet","Multicolore"];
const CARRIERS = {
  mondialrelay: { label: "Mondial Relay", url: n => `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${encodeURIComponent(n)}` },
  colissimo: { label: "Colissimo", url: n => `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(n)}` },
  chronopost: { label: "Chronopost", url: n => `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${encodeURIComponent(n)}` },
  laposte: { label: "La Poste (lettre suivie)", url: n => `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(n)}` },
  autre: { label: "Autre transporteur", url: null },
};
const REASONS = { contrefacon: "Contrefaçon", interdit: "Objet interdit ou dangereux", arnaque: "Arnaque ou tentative de fraude", inapproprie: "Contenu inapproprié ou offensant", autre: "Autre problème" };
const CONTACT = CFG.contactEmail || "contact@rebond.example";

/* ================= Outils ================= */
const $ = (s, r = document) => r.querySelector(s);
const eur = n => (Math.round(n * 100) / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const protect = p => Math.min(FEES.buyerCap, Math.round(p * FEES.buyerRate * 100) / 100);
const sz = s => String(s).replace(".", ",");
const styleLabel = id => (STYLES.find(s => s.id === id) || {}).label || "Sneakers";
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const DAY = 86_400_000;
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "svg") e.innerHTML = v;              // icônes statiques uniquement, jamais de texte utilisateur
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat(9)) if (k != null && k !== false && k !== "") e.append(k instanceof Node ? k : String(k));
  return e;
}
function ago(t) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "à l’instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 30) return `il y a ${Math.floor(s / 86400)} j`;
  return new Date(t).toLocaleDateString("fr-FR");
}
function toast(msg) { const host = $("#toastHost"); host.replaceChildren(h("div", { class: "toast", role: "status" }, msg)); clearTimeout(toast.t); toast.t = setTimeout(() => host.replaceChildren(), 3200); }
const I = {
  heart: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  chev: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="m6 9 6 6 6-6"/></svg>',
  shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
  coin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15 9.5a3 3 0 1 0 0 5M8 11h5M8 13h5"/></svg>',
  info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 5l-7 7 7 7"/></svg>',
  x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  flag: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 21V4h11l-1.5 4L16 12H5"/></svg>',
};
const icon = (name, style) => h("span", { svg: I[name], style: "display:grid;" + (style || ""), "aria-hidden": "true" });

// Messages d'erreur lisibles : les nôtres sont en français, ceux des services sont traduits ou remplacés.
const uerr = msg => Object.assign(new Error(msg), { user: true });   // message prévu pour l'utilisateur
function friendly(e) {
  if (e?.user || e?.code === "P0001") return e.message;              // nos messages (appli, fonctions serveur, RPC)
  const m = String(e?.message || e || "");
  const map = [
    [/Invalid login credentials/i, "E-mail ou mot de passe incorrect."],
    [/User already registered/i, "Un compte existe déjà avec cet e-mail. Connecte-toi."],
    [/Email not confirmed/i, "Confirme d’abord ton e-mail : clique sur le lien reçu."],
    [/Password should be at least/i, "Mot de passe trop court : 8 caractères minimum."],
    [/rate limit|too many/i, "Trop de tentatives. Attends une minute avant de réessayer."],
    [/profiles_username_key|duplicate key.*username/i, "Ce pseudo est déjà pris."],
    [/profiles_username_check/i, "Pseudo : 3 à 24 caractères, lettres minuscules, chiffres, point, tiret ou underscore."],
    [/row-level security|permission denied|JWT/i, "Action non autorisée. Reconnecte-toi si besoin."],
    [/Failed to fetch|NetworkError|Load failed/i, "Connexion impossible. Vérifie ton réseau."],
    [/Payload too large|exceeded the maximum/i, "Photo trop lourde."],
  ];
  for (const [re, txt] of map) if (re.test(m)) return txt;
  return "Une erreur est survenue. Réessaie dans un instant.";
}

/* ================= Illustrations de baskets (annonces sans photo) ================= */
function shoePath(type) {
  const p = new Path2D();
  if (type === "high") {
    p.moveTo(46, 320); p.bezierCurveTo(40, 290, 70, 272, 122, 264); p.lineTo(172, 236);
    p.bezierCurveTo(200, 200, 225, 150, 245, 112); p.bezierCurveTo(275, 104, 315, 102, 342, 110);
    p.bezierCurveTo(352, 180, 368, 250, 366, 320); p.closePath();
  } else if (type === "runner") {
    p.moveTo(44, 318); p.bezierCurveTo(38, 294, 70, 276, 124, 268); p.lineTo(176, 246);
    p.bezierCurveTo(206, 224, 244, 206, 280, 198); p.bezierCurveTo(302, 192, 322, 194, 338, 206);
    p.bezierCurveTo(360, 222, 366, 260, 362, 306); p.lineTo(60, 316); p.closePath();
  } else {
    p.moveTo(46, 320); p.bezierCurveTo(40, 290, 70, 270, 120, 262); p.lineTo(170, 240);
    p.bezierCurveTo(200, 215, 240, 195, 275, 186); p.bezierCurveTo(300, 180, 320, 182, 336, 195);
    p.bezierCurveTo(360, 215, 368, 260, 366, 320); p.closePath();
  }
  return p;
}
function drawShoe(x, o) {
  const line = "rgba(0,0,0,.28)";
  x.lineJoin = "round"; x.lineCap = "round";
  const hi = o.type === "high", run = o.type === "runner";
  x.fillStyle = o.tongue || o.upper; x.strokeStyle = line; x.lineWidth = 2;
  const tg = new Path2D();
  if (hi) { tg.moveTo(200, 180); tg.bezierCurveTo(205, 120, 225, 92, 250, 92); tg.bezierCurveTo(262, 94, 262, 108, 255, 118); tg.lineTo(240, 170); tg.closePath(); }
  else { tg.moveTo(168, 240); tg.bezierCurveTo(170, 214, 196, 196, 222, 192); tg.bezierCurveTo(236, 192, 238, 204, 230, 210); tg.lineTo(200, 236); tg.closePath(); }
  x.fill(tg); x.stroke(tg);
  const up = shoePath(o.type); x.fillStyle = o.upper; x.fill(up); x.stroke(up);
  x.save(); x.clip(up);
  x.fillStyle = o.overlay;
  x.beginPath(); x.moveTo(40, 322); x.bezierCurveTo(36, 290, 70, 268, 122, 262); x.bezierCurveTo(134, 280, 128, 304, 112, 322); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(hi ? 330 : 322, hi ? 150 : 192); x.bezierCurveTo(360, 200, 372, 260, 370, 322); x.lineTo(292, 322); x.bezierCurveTo(300, 270, 300, 230, hi ? 330 : 322, hi ? 150 : 192); x.closePath(); x.fill(); x.stroke();
  x.beginPath();
  if (hi) { x.moveTo(150, 262); x.bezierCurveTo(185, 220, 215, 160, 238, 112); x.lineTo(262, 116); x.bezierCurveTo(240, 170, 212, 232, 176, 276); }
  else { x.moveTo(150, 262); x.bezierCurveTo(190, 232, 235, 206, 282, 190); x.lineTo(290, 208); x.bezierCurveTo(245, 222, 200, 248, 170, 276); }
  x.closePath(); x.fill(); x.stroke();
  x.fillStyle = o.stripe;
  x.beginPath();
  if (run) { x.moveTo(150, 302); x.bezierCurveTo(200, 286, 260, 250, 318, 226); x.lineTo(326, 246); x.bezierCurveTo(270, 272, 214, 300, 168, 316); }
  else { x.moveTo(160, 304); x.bezierCurveTo(210, 290, 262, 262, 318, 232); x.lineTo(324, 254); x.bezierCurveTo(272, 280, 220, 306, 178, 318); }
  x.closePath(); x.fill(); x.stroke();
  if (hi) { x.beginPath(); x.moveTo(245, 150); x.bezierCurveTo(280, 150, 320, 148, 350, 150); x.lineTo(352, 176); x.bezierCurveTo(320, 174, 280, 176, 240, 178); x.closePath(); x.fillStyle = o.overlay; x.fill(); x.stroke(); }
  x.restore();
  x.strokeStyle = line; x.lineWidth = 2; x.stroke(up);
  x.strokeStyle = o.lace || "#FFFFFF"; x.lineWidth = 6;
  const pts = hi ? [[176, 250], [190, 228], [202, 204], [213, 180], [224, 156], [234, 132]] : run ? [[182, 250], [204, 236], [226, 224], [248, 213], [270, 204]] : [[178, 250], [200, 236], [222, 222], [246, 210], [268, 199]];
  for (const [a, b] of pts) { x.beginPath(); x.moveTo(a - 8, b + 2); x.lineTo(a + 10, b + 15); x.stroke(); }
  x.lineWidth = 2; x.strokeStyle = line;
  const ms = new Path2D();
  if (run) { ms.moveTo(30, 332); ms.bezierCurveTo(30, 314, 50, 308, 80, 310); ms.lineTo(300, 300); ms.bezierCurveTo(345, 296, 376, 300, 376, 322); ms.lineTo(374, 346); ms.bezierCurveTo(372, 354, 364, 358, 352, 358); ms.lineTo(56, 358); ms.bezierCurveTo(40, 358, 30, 350, 30, 332); }
  else { ms.moveTo(34, 330); ms.bezierCurveTo(34, 318, 44, 314, 56, 314); ms.lineTo(356, 314); ms.bezierCurveTo(368, 314, 374, 322, 374, 332); ms.lineTo(374, 346); ms.bezierCurveTo(374, 354, 368, 358, 358, 358); ms.lineTo(50, 358); ms.bezierCurveTo(40, 358, 34, 352, 34, 344); }
  ms.closePath(); x.fillStyle = o.sole; x.fill(ms); x.stroke(ms);
  if (run) { x.strokeStyle = "rgba(0,0,0,.14)"; x.lineWidth = 3; x.beginPath(); x.moveTo(110, 336); x.bezierCurveTo(170, 326, 250, 330, 330, 322); x.stroke(); }
  x.fillStyle = o.outsole; x.strokeStyle = line; x.lineWidth = 2;
  x.beginPath(); x.moveTo(40, 352); x.lineTo(368, 352); x.bezierCurveTo(370, 362, 364, 368, 354, 368); x.lineTo(54, 368); x.bezierCurveTo(44, 368, 38, 362, 40, 352); x.closePath(); x.fill(); x.stroke();
  if (run) { x.fillStyle = o.overlay; x.fillRect(344, 196, 12, 30); }
}
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v + 255 * pct / 100)));
  return "#" + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, "0")).join("");
}
const illoCache = {};
function sneakerImg(o) {
  const key = JSON.stringify(o); if (illoCache[key]) return illoCache[key];
  const c = document.createElement("canvas"); c.width = 400; c.height = 500; const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 500); g.addColorStop(0, o.bg || "#E9ECF0"); g.addColorStop(1, shade(o.bg || "#E9ECF0", -8));
  x.fillStyle = g; x.fillRect(0, 0, 400, 500);
  x.fillStyle = "rgba(0,0,0,.10)"; x.beginPath(); x.ellipse(205, 400, 170, 16, 0, 0, 7); x.fill();
  x.save(); x.translate(0, 30); drawShoe(x, o); x.restore();
  return (illoCache[key] = c.toDataURL("image/png"));
}
const DEFAULT_ILLO = { type: "low", upper: "#F2F2F0", overlay: "#FFFFFF", stripe: "#D9DCE0", sole: "#FFFFFF", outsole: "#E6E6E6", lace: "#FFFFFF", bg: "#E9ECF0" };
const imgOf = l => l.thumb || sneakerImg(l.illo || DEFAULT_ILLO);

/* ================= Photos : compression dans le navigateur ================= */
function loadImg(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = r.result; };
    r.onerror = rej; r.readAsDataURL(file);
  });
}
function resized(img, maxW) {
  const k = Math.min(1, maxW / img.width), c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c;
}
const toBlob = (canvas, q) => new Promise(res => canvas.toBlob(res, "image/jpeg", q));
async function preparePhoto(file) {
  const img = await loadImg(file);
  const small = resized(img, 440), big = resized(img, LIVE ? 1400 : 900);
  return {
    thumb: small.toDataURL("image/jpeg", .72),
    full: LIVE ? "" : big.toDataURL("image/jpeg", .7),
    thumbBlob: LIVE ? await toBlob(small, .75) : null,
    fullBlob: LIVE ? await toBlob(big, .82) : null,
  };
}

/* ================= État ================= */
const blankFilters = () => ({ q: "", style: "", brands: [], sizes: [], conds: [], colors: [], box: false, auth: false, min: "", max: "", sort: "recent" });
const S = {
  mode: "loading", me: null, email: "",
  profile: { username: "", city: "", isAdmin: false, payoutsReady: false },
  profiles: {}, listings: [], orders: [], threads: [], reviews: [], reports: [],
  mySize: "", seen: {},
  route: { name: "home" }, f: blankFilters(), pop: null, built: "",
};

/* ================= Données : mode démo ================= */
const DEMO_PEOPLE = { d_ines: ["ines.kicks", "Lyon"], d_karim: ["karim_sole", "Marseille"], d_lea: ["lea.paires", "Lille"], d_tom: ["tom.runs", "Nantes"], d_yanis: ["yanis.hoops", "Paris"] };
const toArr = o => Object.entries(o || {}).map(([id, v]) => ({ id, ...v }));

const Demo = {
  key: "rebond.demo.v2", data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.key)); } catch { this.data = null; }
    if (!this.data || !this.data.profile) { this.data = demoData(); this.save(); }
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch { toast("Le stockage du navigateur est plein : supprime quelques annonces."); } },
  pull() {
    const d = this.data;
    S.listings = toArr(d.listings); S.orders = toArr(d.orders); S.threads = toArr(d.threads);
    S.reviews = toArr(d.reviews); S.reports = toArr(d.reports);
    S.mySize = d.mySize || ""; S.seen = { ...(d.seen || {}) }; S.profile = { ...d.profile };
    S.profiles = Object.fromEntries(Object.entries(DEMO_PEOPLE).map(([id, [username, city]]) => [id, { username, city }]));
    S.profiles.moi = { username: d.profile.username, city: d.profile.city };
    render();
  },
  commit() { this.save(); this.pull(); },
  async start() { S.mode = "demo"; S.me = "moi"; this.load(); this.pull(); },
  photosOf(l) { return (this.data.photos || {})[l.id] || []; },
  async saveSettings() { this.data.mySize = S.mySize; this.data.seen = S.seen; this.save(); },
  async saveProfile(p) { Object.assign(this.data.profile, p); this.commit(); },
  async createListing(fields, photos) {
    const id = rid();
    this.data.photos[id] = photos.map(p => p.full).slice(0, 3);   // le navigateur a peu de place : 3 grandes photos max en démo
    this.data.listings[id] = { ...fields, sellerId: "moi", thumb: photos[0]?.thumb || "", illo: photos.length ? null : DEFAULT_ILLO, likedBy: [], status: "active", createdAt: Date.now() };
    this.commit(); return id;
  },
  async removeListing(l) { this.data.listings[l.id].status = "removed"; delete this.data.photos[l.id]; this.commit(); },
  async toggleLike(l) {
    const x = this.data.listings[l.id], set = new Set(x.likedBy || []);
    set.has("moi") ? set.delete("moi") : set.add("moi"); x.likedBy = [...set]; this.commit();
  },
  async openThread(l) {
    const id = l.id + "--moi";
    if (!this.data.threads[id]) this.data.threads[id] = { listingId: l.id, title: l.title, buyerId: "moi", sellerId: l.sellerId, messages: [], updatedAt: Date.now() };
    this.commit(); return id;
  },
  async post(tid, m) {
    const t = this.data.threads[tid], now = Date.now();
    t.messages.push({ id: now, from: "moi", kind: m.kind, text: m.text || "", amount: m.amount ?? null, state: m.kind === "offer" ? "pending" : null, at: now });
    t.updatedAt = now; S.seen[tid] = now; this.data.seen = S.seen; this.commit();
    this.fakeSeller(tid, m);
  },
  // En démo, les vendeurs fictifs répondent tout seuls pour montrer le parcours complet.
  fakeSeller(tid, m) {
    const t = this.data.threads[tid]; if (!t || !t.sellerId.startsWith("d_")) return;
    const l = this.data.listings[t.listingId];
    setTimeout(() => {
      const now = Date.now();
      if (m.kind === "offer") {
        const ok = m.amount >= l.price * 0.85, off = [...t.messages].reverse().find(x => x.kind === "offer" && x.state === "pending");
        if (!off) return;
        off.state = ok ? "accepted" : "declined"; if (ok) t.acceptedPrice = off.amount;
        t.messages.push({ id: now, from: t.sellerId, kind: "msg", text: ok ? `C’est d’accord pour ${eur(off.amount)}. Tu peux acheter à ce prix.` : `Désolé, je ne descends pas sous ${eur(Math.ceil(l.price * 0.85))}.`, at: now });
      } else if (t.messages.filter(x => x.from === t.sellerId).length === 0) {
        t.messages.push({ id: now, from: t.sellerId, kind: "msg", text: "Salut ! Oui, toujours disponible. Demande-moi si tu veux d’autres photos ou les mesures.", at: now });
      } else return;
      t.updatedAt = now; this.commit();
    }, 1800);
  },
  async answerOffer(t, m, ok) {
    const th = this.data.threads[t.id], off = th.messages.find(x => x.id === m.id), now = Date.now();
    off.state = ok ? "accepted" : "declined"; if (ok) th.acceptedPrice = off.amount;
    th.messages.push({ id: now, from: "moi", kind: "msg", text: ok ? `C’est d’accord pour ${eur(off.amount)}. Tu peux acheter à ce prix.` : "Désolé, je ne peux pas descendre à ce prix.", at: now });
    th.updatedAt = now; this.commit();
  },
  async checkout({ listing: l, price, ship, auth, name, address, zip }) {
    const s = SHIPPING.find(x => x.id === ship), oid = rid(), fee = protect(price);
    this.data.orders[oid] = { listingId: l.id, title: l.title, size: l.size, thumb: (l.thumb || "").length < 80000 ? l.thumb || "" : "", illo: l.illo || null,
      sellerId: l.sellerId, buyerId: "moi", price, protection: fee, shipping: ship, shipLabel: s.label, shipPrice: s.price, auth, authPrice: auth ? AUTH.price : 0,
      total: Math.round((price + fee + s.price + (auth ? AUTH.price : 0)) * 100) / 100, status: "paid", payoutStatus: "held",
      shippingName: name, shippingAddress: address, shippingZip: zip, createdAt: Date.now() };
    this.data.listings[l.id].status = "sold"; this.data.listings[l.id].buyerId = "moi";
    this.commit();
    if (l.sellerId.startsWith("d_")) setTimeout(() => {
      const o = this.data.orders[oid]; if (!o || o.status !== "paid") return;
      Object.assign(o, ship === "hand" ? { status: "shipped", shippedAt: Date.now() } : { status: "shipped", carrier: "mondialrelay", tracking: "DEMO" + Math.floor(Math.random() * 1e8), shippedAt: Date.now() });
      this.commit(); toast(`${nameOf(l.sellerId)} a ${ship === "hand" ? "confirmé la remise" : "expédié ta paire"} (démo).`);
    }, 4000);
    return { done: true };
  },
  async markShipped(o, carrier, tracking) { Object.assign(this.data.orders[o.id], { status: "shipped", carrier: carrier || null, tracking: tracking || null, shippedAt: Date.now() }); this.commit(); },
  async orderAction(o, action) {
    const x = this.data.orders[o.id], l = this.data.listings[o.listingId];
    if (action === "confirm") Object.assign(x, { status: "done", payoutStatus: this.data.profile.payoutsReady || o.sellerId !== "moi" ? "paid" : "awaiting_seller" });
    if (action === "cancel") { Object.assign(x, { status: "cancelled", payoutStatus: "refunded" }); if (l) { l.status = "active"; l.buyerId = null; } }
    if (action === "verify") x.status = "verified";
    if (action === "reject") { Object.assign(x, { status: "rejected", payoutStatus: "refunded" }); if (l) l.status = "removed"; }
    this.commit();
  },
  async review(o, stars, text) { this.data.reviews[o.id] = { sellerId: o.sellerId, buyerId: "moi", stars, text, at: Date.now() }; this.commit(); },
  async report(listingId, reason, details) { this.data.reports[rid()] = { reporterId: "moi", listingId, reason, details, status: "open", at: Date.now() }; this.commit(); },
  async handleReport(r, remove, decision) {
    Object.assign(this.data.reports[r.id], { status: remove ? "actioned" : "dismissed", decision, handledAt: Date.now() });
    if (remove && this.data.listings[r.listingId]) Object.assign(this.data.listings[r.listingId], { status: "removed", moderationNote: decision });
    this.commit();
  },
  async wallet(action) {
    if (action === "start") { this.data.profile.payoutsReady = true; for (const o of Object.values(this.data.orders)) if (o.payoutStatus === "awaiting_seller") o.payoutStatus = "paid"; this.commit(); toast("Démo : porte-monnaie activé. En vrai, Stripe te demande ton identité et ton IBAN."); }
    return { ready: this.data.profile.payoutsReady };
  },
  async exportData() { return { mode: "démo", ...this.data, photos: undefined }; },
  async deleteAccount() { try { localStorage.removeItem(this.key); } catch {} location.hash = ""; location.reload(); },
};

/* ================= Données : mode live (Supabase) ================= */
const mapListing = r => ({ id: r.id, sellerId: r.seller_id, title: r.title, description: r.description, style: r.style, brand: r.brand, model: r.model, colorway: r.colorway,
  color: r.color, sku: r.sku, box: r.box, size: r.size, condition: r.condition, price: Number(r.price), photos: r.photos || [], thumb: r.thumb, status: r.status,
  reservedBy: r.reserved_by, moderationNote: r.moderation_note, buyerId: r.buyer_id, createdAt: Date.parse(r.created_at), likedBy: [] });
const mapOrder = r => ({ id: r.id, listingId: r.listing_id, title: r.title, size: r.size, thumb: r.thumb, sellerId: r.seller_id, buyerId: r.buyer_id,
  price: Number(r.price), protection: Number(r.protection), shipping: r.ship_method, shipLabel: r.ship_label, shipPrice: Number(r.ship_price), auth: r.auth,
  authPrice: Number(r.auth_price), total: Number(r.total), status: r.status, payoutStatus: r.payout_status, carrier: r.carrier, tracking: r.tracking,
  shippingName: r.shipping_name, shippingAddress: r.shipping_address, shippingZip: r.shipping_zip, createdAt: Date.parse(r.created_at), shippedAt: r.shipped_at ? Date.parse(r.shipped_at) : null });

const Live = {
  sb: null, raw: [], likes: [], timers: {},
  async start() {
    S.mode = "live";
    this.sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data: { session } } = await this.sb.auth.getSession();
    this.setUser(session);
    this.sb.auth.onAuthStateChange((event, sess) => {
      if (event === "PASSWORD_RECOVERY") setTimeout(() => openAuth("newpass"), 50);
      if ((sess?.user?.id || null) !== S.me) { this.setUser(sess); this.loadAll(); }
    });
    await this.loadAll();
    this.subscribe();
  },
  setUser(sess) { S.me = sess?.user?.id || null; S.email = sess?.user?.email || ""; },
  async loadAll() {
    $("#loadingBar").hidden = false;
    await Promise.all(["profiles", "listings", "likes", "reviews", "threads", "orders", "reports", "settings"].map(k => this.load(k)));
    $("#loadingBar").hidden = true;
    S.built = ""; render();
  },
  async q(p) { const { data, error } = await p; if (error) throw error; return data; },
  async load(k) {
    const sb = this.sb;
    try {
      if (k === "profiles") {
        const rows = await this.q(sb.from("profiles").select("id,username,city,is_admin,payouts_ready"));
        S.profiles = Object.fromEntries(rows.map(p => [p.id, { username: p.username, city: p.city }]));
        const me = rows.find(p => p.id === S.me);
        S.profile = me ? { username: me.username, city: me.city, isAdmin: me.is_admin, payoutsReady: me.payouts_ready } : { username: "", city: "", isAdmin: false, payoutsReady: false };
      } else if (k === "listings") {
        this.raw = await this.q(sb.from("listings").select("*").order("created_at", { ascending: false }).limit(1000)); this.merge();
      } else if (k === "likes") {
        this.likes = await this.q(sb.from("likes").select("user_id,listing_id").limit(20000)); this.merge();
      } else if (k === "reviews") {
        S.reviews = (await this.q(sb.from("reviews").select("*"))).map(r => ({ id: r.order_id, sellerId: r.seller_id, buyerId: r.buyer_id, stars: r.stars, text: r.body, at: Date.parse(r.created_at) }));
      } else if (!S.me) {
        if (k === "threads") S.threads = []; if (k === "orders") S.orders = []; if (k === "reports") S.reports = []; if (k === "settings") { S.mySize = ""; S.seen = {}; }
      } else if (k === "threads") {
        const [ts, ms] = await Promise.all([this.q(sb.from("threads").select("*")), this.q(sb.from("messages").select("*").order("id").limit(5000))]);
        const by = {}; for (const m of ms) (by[m.thread_id] ||= []).push({ id: m.id, from: m.from_id, kind: m.kind, text: m.body, amount: m.amount == null ? null : Number(m.amount), state: m.state, at: Date.parse(m.created_at) });
        S.threads = ts.map(t => ({ id: t.id, listingId: t.listing_id, title: t.listing_title, buyerId: t.buyer_id, sellerId: t.seller_id, acceptedPrice: t.accepted_price == null ? null : Number(t.accepted_price), updatedAt: Date.parse(t.updated_at), messages: by[t.id] || [] }));
      } else if (k === "orders") {
        S.orders = (await this.q(sb.from("orders").select("*").order("created_at", { ascending: false }))).map(mapOrder);
      } else if (k === "reports") {
        S.reports = (await this.q(sb.from("reports").select("*").order("created_at", { ascending: false }))).map(r => ({ id: r.id, reporterId: r.reporter_id, listingId: r.listing_id, reason: r.reason, details: r.details, status: r.status, decision: r.decision, at: Date.parse(r.created_at), handledAt: r.handled_at ? Date.parse(r.handled_at) : null }));
      } else if (k === "settings") {
        const row = await this.q(sb.from("user_settings").select("*").eq("user_id", S.me).maybeSingle());
        S.mySize = row?.my_size || ""; S.seen = row?.seen || {};
      }
    } catch (e) { console.warn("Chargement", k, e); }
  },
  merge() {
    const by = {}; for (const x of this.likes) (by[x.listing_id] ||= []).push(x.user_id);
    S.listings = this.raw.map(r => ({ ...mapListing(r), likedBy: by[r.id] || [] }));
  },
  subscribe() {
    const ch = this.sb.channel("rebond-live");
    const tables = { profiles: "profiles", listings: "listings", likes: "likes", threads: "threads", messages: "threads", orders: "orders", reviews: "reviews", reports: "reports" };
    for (const [table, key] of Object.entries(tables)) ch.on("postgres_changes", { event: "*", schema: "public", table }, () => this.later(key));
    ch.subscribe();
  },
  later(k) { clearTimeout(this.timers[k]); this.timers[k] = setTimeout(async () => { await this.load(k); render(); }, 350); },
  async fn(name, body) {
    const { data, error } = await this.sb.functions.invoke(name, { body });
    if (error) { let msg = "Le serveur ne répond pas. Réessaie dans un instant."; try { const j = await error.context.json(); if (j?.error) msg = j.error; } catch {} throw uerr(msg); }
    return data;
  },
  photosOf(l) { return l.photos || []; },
  async saveSettings() { if (S.me) await this.sb.from("user_settings").upsert({ user_id: S.me, my_size: S.mySize, seen: S.seen, updated_at: new Date().toISOString() }); },
  async saveProfile(p) { await this.q(this.sb.from("profiles").update({ username: p.username, city: p.city }).eq("id", S.me)); await this.load("profiles"); render(); },
  async upload(path, blob) {
    const st = this.sb.storage.from("photos");
    const { error } = await st.upload(path, blob, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
    if (error) throw error;
    return st.getPublicUrl(path).data.publicUrl;
  },
  async createListing(f, photos) {
    const id = crypto.randomUUID(), urls = [];
    for (const [i, p] of photos.entries()) urls.push(await this.upload(`${S.me}/${id}/${i}.jpg`, p.fullBlob));
    const thumb = photos[0] ? await this.upload(`${S.me}/${id}/thumb.jpg`, photos[0].thumbBlob) : "";
    await this.q(this.sb.from("listings").insert({ id, seller_id: S.me, title: f.title, description: f.description, style: f.style, brand: f.brand, model: f.model,
      colorway: f.colorway, color: f.color, sku: f.sku, box: f.box, size: f.size, condition: f.condition, price: f.price, photos: urls, thumb }));
    await this.load("listings"); return id;
  },
  async removeListing(l) {
    await this.q(this.sb.from("listings").update({ status: "removed" }).eq("id", l.id));
    const st = this.sb.storage.from("photos"), dir = `${S.me}/${l.id}`;
    const { data: files } = await st.list(dir);
    if (files?.length) await st.remove(files.map(f => `${dir}/${f.name}`));
    await this.load("listings");
  },
  async toggleLike(l) {
    if (liked(l)) await this.q(this.sb.from("likes").delete().eq("user_id", S.me).eq("listing_id", l.id));
    else await this.q(this.sb.from("likes").insert({ user_id: S.me, listing_id: l.id }));
    await this.load("likes");
  },
  async openThread(l) {
    const ex = S.threads.find(t => t.listingId === l.id && t.buyerId === S.me); if (ex) return ex.id;
    const row = await this.q(this.sb.from("threads").insert({ listing_id: l.id, listing_title: l.title, buyer_id: S.me, seller_id: l.sellerId }).select("id").single());
    await this.load("threads"); return row.id;
  },
  async post(tid, m) {
    await this.q(this.sb.from("messages").insert({ thread_id: tid, from_id: S.me, kind: m.kind, body: m.text || "", amount: m.kind === "offer" ? m.amount : null, state: m.kind === "offer" ? "pending" : null }));
    S.seen[tid] = Date.now(); this.saveSettings(); await this.load("threads");
  },
  async answerOffer(t, m, ok) { await this.q(this.sb.rpc("answer_offer", { p_message_id: m.id, p_accept: ok })); await this.load("threads"); },
  async checkout(o) {
    const res = await this.fn("create-checkout", { listingId: o.listing.id, shipping: o.ship, auth: o.auth, name: o.name, address: o.address, zip: o.zip });
    location.href = res.url; return { redirect: true };
  },
  async markShipped(o, carrier, tracking) { await this.q(this.sb.rpc("mark_shipped", { p_order: o.id, p_carrier: carrier || "", p_tracking: tracking || "" })); await this.load("orders"); },
  async orderAction(o, action) { await this.fn("order-action", { orderId: o.id, action }); await Promise.all([this.load("orders"), this.load("listings")]); },
  async review(o, stars, text) { await this.q(this.sb.from("reviews").insert({ order_id: o.id, seller_id: o.sellerId, buyer_id: S.me, stars, body: text })); await this.load("reviews"); },
  async report(listingId, reason, details) { await this.q(this.sb.from("reports").insert({ reporter_id: S.me, listing_id: listingId, reason, details })); await this.load("reports"); },
  async handleReport(r, remove, decision) { await this.q(this.sb.rpc("handle_report", { p_report: r.id, p_remove: remove, p_decision: decision })); await Promise.all([this.load("reports"), this.load("listings")]); },
  async wallet(action) {
    const res = await this.fn("connect-onboarding", { action });
    if (res.url) { location.href = res.url; return res; }
    await this.load("profiles"); return res;
  },
  async exportData() {
    return { exporte_le: new Date().toISOString(), compte: { id: S.me, email: S.email, pseudo: S.profile.username, ville: S.profile.city }, reglages: { pointure: S.mySize },
      annonces: S.listings.filter(l => l.sellerId === S.me), favoris: S.listings.filter(liked).map(l => ({ id: l.id, titre: l.title })),
      conversations: myThreads(), commandes: S.orders, avis_recus: S.reviews.filter(r => r.sellerId === S.me), avis_donnes: S.reviews.filter(r => r.buyerId === S.me),
      signalements: S.reports.filter(r => r.reporterId === S.me) };
  },
  async deleteAccount() {
    if (S.orders.some(o => ["paid", "shipped", "verified"].includes(o.status))) throw uerr("Termine d’abord tes commandes en cours.");
    const st = this.sb.storage.from("photos");
    const { data: dirs } = await st.list(S.me);
    for (const d of dirs || []) { const { data: files } = await st.list(`${S.me}/${d.name}`); if (files?.length) await st.remove(files.map(f => `${S.me}/${d.name}/${f.name}`)); }
    await this.q(this.sb.rpc("delete_my_account"));
    await this.sb.auth.signOut();
  },
  redirectUrl() { return location.origin + location.pathname; },
  async signUp({ email, password, username }) { const { error } = await this.sb.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: this.redirectUrl() } }); if (error) throw error; },
  async signIn({ email, password }) { const { error } = await this.sb.auth.signInWithPassword({ email, password }); if (error) throw error; },
  async resetPassword(email) { const { error } = await this.sb.auth.resetPasswordForEmail(email, { redirectTo: this.redirectUrl() }); if (error) throw error; },
  async newPassword(password) { const { error } = await this.sb.auth.updateUser({ password }); if (error) throw error; },
  async signOut() { await this.sb.auth.signOut(); },
};

let Api = LIVE ? Live : Demo;

/* ================= Personnes ================= */
const nameOf = id => (S.profiles[id]?.username) || (id === S.me ? S.profile.username || "toi" : "membre");
const cityOf = id => S.profiles[id]?.city || "";
function colorOf(id) { let n = 7; for (const c of String(id)) n = (n * 31 + c.charCodeAt(0)) % 360; return `hsl(${n} 42% 44%)`; }
const avatar = (id, size = 24) => h("span", { class: "av", style: `width:${size}px;height:${size}px;background:${colorOf(id)};font-size:${Math.round(size * .45)}px`, "aria-hidden": "true" }, (nameOf(id)[0] || "?").toUpperCase());
function rating(id) { const rs = S.reviews.filter(r => r.sellerId === id); return rs.length ? { avg: rs.reduce((a, r) => a + r.stars, 0) / rs.length, n: rs.length } : { avg: 0, n: 0 }; }
const stars = a => "★★★★★".slice(0, Math.round(a)) + "☆☆☆☆☆".slice(0, 5 - Math.round(a));

/* ================= Garde-fous ================= */
function ready() { if (S.mode === "loading") { toast("Chargement en cours…"); return false; } return true; }
function needAuth(why) {
  if (!ready()) return false;
  if (S.mode === "live" && !S.me) { openAuth("login", why); return false; }
  return true;
}
async function attempt(fn, okMsg) {
  try { const r = await fn(); if (okMsg) toast(okMsg); return r ?? true; }
  catch (e) { console.warn(e); toast(friendly(e)); return false; }
}

/* ================= Dérivés ================= */
const L = id => S.listings.find(l => l.id === id);
const likes = l => (l.likedBy || []).length;
const liked = l => !!S.me && (l.likedBy || []).includes(S.me);
const myThreads = () => S.threads.filter(t => t.buyerId === S.me || t.sellerId === S.me).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
const isUnread = t => (t.updatedAt || 0) > (S.seen[t.id] || 0) && (t.messages || []).slice(-1)[0]?.from !== S.me;
const pendingSales = () => S.orders.filter(o => o.sellerId === S.me && o.status === "paid").length;
const visible = l => l.status !== "removed";
function modelStats(l) {
  const same = S.listings.filter(x => visible(x) && x.id !== l.id && x.model && l.model && x.brand === l.brand && x.model.toLowerCase() === l.model.toLowerCase());
  if (!same.length) return null;
  return { avg: same.reduce((a, x) => a + x.price, 0) / same.length, n: same.length };
}
function applyFilters(list, f) {
  const q = f.q.trim().toLowerCase();
  let r = list.filter(visible);
  if (f.style) r = r.filter(l => l.style === f.style);
  if (f.brands.length) r = r.filter(l => f.brands.includes(l.brand));
  if (f.sizes.length) r = r.filter(l => f.sizes.includes(l.size));
  if (f.conds.length) r = r.filter(l => f.conds.includes(l.condition));
  if (f.colors.length) r = r.filter(l => f.colors.includes(l.color));
  if (f.box) r = r.filter(l => l.box);
  if (f.auth) r = r.filter(l => l.price >= AUTH.minPrice);
  if (f.min) r = r.filter(l => l.price >= +f.min);
  if (f.max) r = r.filter(l => l.price <= +f.max);
  if (q) r = r.filter(l => [l.title, l.brand, l.model, l.colorway, l.color, l.sku, styleLabel(l.style)].join(" ").toLowerCase().includes(q));
  const sorts = { recent: (a, b) => b.createdAt - a.createdAt, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, liked: (a, b) => likes(b) - likes(a) };
  r.sort(sorts[f.sort] || sorts.recent);
  return r.sort((a, b) => (a.status === "sold") - (b.status === "sold"));
}

/* ================= Navigation (adresse #/… : le bouton retour du navigateur marche) ================= */
function toHash(r) {
  const m = { home: "", catalog: "#/catalogue", favs: "#/favoris", sell: "#/vendre", account: "#/compte", settings: "#/parametres" };
  if (r.name === "admin") return `#/moderation${r.tab ? "/" + r.tab : ""}`;
  if (r.name in m) return m[r.name];
  if (r.name === "item") return `#/article/${r.id}`;
  if (r.name === "member") return `#/membre/${r.id}${r.tab ? "/" + r.tab : ""}`;
  if (r.name === "inbox") return r.id ? `#/messages/${r.id}${r.offer ? "/offre" : ""}` : "#/messages";
  if (r.name === "orders") return `#/commandes/${r.tab || "achats"}`;
  if (r.name === "checkout") return `#/paiement/${r.id}`;
  return "";
}
function fromHash(hash) {
  const p = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  if (!p.length || /access_token|error/.test(hash)) return { name: "home" };
  const [a, b, c] = p;
  const simple = { catalogue: "catalog", favoris: "favs", vendre: "sell", compte: "account", parametres: "settings" };
  if (simple[a]) return { name: simple[a] };
  if (a === "moderation") return b ? { name: "admin", tab: b } : { name: "admin" };
  if (a === "article" && b) return { name: "item", id: b };
  if (a === "membre" && b) return { name: "member", id: b, tab: c };
  if (a === "messages") return b ? { name: "inbox", id: b, offer: c === "offre" ? 1 : undefined } : { name: "inbox" };
  if (a === "commandes") return { name: "orders", tab: b === "ventes" ? "ventes" : "achats" };
  if (a === "paiement" && b) return { name: "checkout", id: b };
  return { name: "home" };
}
function go(name, params = {}, opts = {}) {
  const r = { name, ...params }; Object.keys(r).forEach(k => r[k] === undefined && delete r[k]);
  const hash = toHash(r);
  S.route = r; S.pop = null; S.built = ""; closeLayer();
  const url = location.pathname + location.search + hash;
  if (opts.replace) history.replaceState(null, "", url); else history.pushState(null, "", url);
  render(); if (!opts.keepScroll) window.scrollTo({ top: 0 });
}
window.addEventListener("popstate", () => { S.route = fromHash(location.hash); S.pop = null; S.built = ""; closeLayer(); render(); });
function browse(patch) { S.f = { ...blankFilters(), ...patch }; $("#q").value = S.f.q; go("catalog"); }

/* ================= Rendu ================= */
function render() {
  const r = S.route.name;
  document.querySelectorAll("[data-go]").forEach(b => { const g = b.dataset.go; b.setAttribute("aria-current", String(g === r || (g === "account" && ["settings", "admin"].includes(r)) || (g === "account" && r === "member" && S.route.id === S.me))); });
  const unread = S.mode === "loading" ? 0 : myThreads().filter(isUnread).length, pend = S.mode === "loading" ? 0 : pendingSales();
  document.querySelectorAll('[data-go="inbox"]').forEach(b => { b.querySelector(".badge")?.remove(); if (unread) b.append(h("span", { class: "badge" }, unread)); });
  document.querySelectorAll('[data-go="orders"]').forEach(b => { b.querySelector(".badge")?.remove(); if (pend) b.append(h("span", { class: "badge" }, pend)); });
  const loggedOut = S.mode === "live" && !S.me;
  $("#meBtn").hidden = loggedOut; $("#loginBtn").hidden = !loggedOut;
  if (!loggedOut) $("#meBtn").replaceChildren(avatar(S.me || "invite", 30));
  $("#demoPill").hidden = S.mode !== "demo";
  renderNav();

  const key = JSON.stringify(S.route);
  // Les pages avec saisie sont construites une fois ; les données en direct ne rafraîchissent que leurs parties dynamiques.
  if (S.built === key && ["sell", "checkout", "settings"].includes(r)) return;
  if (S.built === key && r === "inbox") { paintInbox(); return; }
  const page = { home: pageHome, catalog: pageCatalog, favs: pageFavs, item: pageItem, sell: pageSell, inbox: pageInbox, member: pageMember, orders: pageOrders,
    account: pageAccount, settings: pageSettings, admin: pageAdmin, checkout: pageCheckout }[r] || pageHome;
  $("#main").replaceChildren(...[].concat(page()).filter(Boolean));
  S.built = key;
  if (r === "inbox") paintInbox();
}
function renderNav() {
  const f = S.f, onCat = S.route.name === "catalog";
  const btn = (label, cur, fn) => h("button", { "aria-current": String(cur), onclick: fn }, label);
  $("#nav").replaceChildren(
    btn("Toutes les paires", onCat && !f.style && !f.brands.length, () => browse({})),
    ...STYLES.map(s => btn(s.label, onCat && f.style === s.id && !f.brands.length, () => browse({ style: s.id }))),
    h("span", { class: "sep nav-desktop-only" }),
    ...["Nike", "Jordan", "Adidas", "New Balance", "Asics", "Salomon"].map(b => btn(b, onCat && f.brands.length === 1 && f.brands[0] === b && !f.style, () => browse({ brands: [b] }))));
}
const loadingState = () => h("div", { class: "empty", style: "margin-top:24px" }, h("h2", null, "Chargement…"));
const signInPrompt = (title, text) => h("div", { class: "empty", style: "margin-top:24px" }, h("h2", null, title), h("p", { class: "muted", style: "margin:0;max-width:46ch" }, text),
  h("div", { class: "actions-end", style: "justify-content:center" }, h("button", { class: "btn ghost", onclick: () => openAuth("login") }, "Se connecter"), h("button", { class: "btn primary", onclick: () => openAuth("signup") }, "Créer un compte")));

/* ---------- Carte article ---------- */
function card(l) {
  const auth = l.price >= AUTH.minPrice && l.status === "active";
  return h("article", { class: "card" },
    h("button", { class: "card-user", onclick: () => go("member", { id: l.sellerId }) }, avatar(l.sellerId, 22), h("span", null, nameOf(l.sellerId))),
    h("div", { class: "ph" },
      h("button", { "aria-label": `${l.title}, ${eur(l.price)}`, onclick: () => go("item", { id: l.id }) }, h("img", { src: imgOf(l), alt: "", loading: "lazy" })),
      h("div", { class: "flag" }, l.demo ? h("span", null, "Exemple") : null, auth ? h("span", { class: "auth" }, "Authentifiable") : null),
      l.status === "sold" ? h("div", { class: "soldout" }, "Vendue") : l.status === "reserved" ? h("div", { class: "soldout" }, "Réservée") : null,
      likeBtn(l)),
    h("div", { class: "price num" }, eur(l.price)),
    h("div", { class: "incl num" }, `${eur(l.price + protect(l.price))} incl.`),
    h("div", { class: "sub" }, `${sz(l.size)} EU · ${l.brand}`),
    h("div", { class: "sub" }, l.model || l.title));
}
function likeBtn(l) {
  return h("button", { class: "like", "aria-pressed": String(liked(l)), "aria-label": liked(l) ? "Retirer des favoris" : "Ajouter aux favoris", onclick: e => { e.stopPropagation(); toggleLike(l); } }, icon("heart"), likes(l) || "");
}
async function toggleLike(l) {
  if (!needAuth("Connecte-toi pour garder tes paires préférées.")) return;
  const was = liked(l);
  await attempt(() => Api.toggleLike(l), was ? "Retirée de tes favoris" : "Ajoutée à tes favoris");
}
const grid = list => h("div", { class: "grid" }, list.map(card));

/* ---------- Accueil ---------- */
let heroArt = null;
function heroCanvas() {
  if (!heroArt) {
    const c = document.createElement("canvas"); c.width = 1400; c.height = 520; const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 1400, 520); g.addColorStop(0, "#D9E3F6"); g.addColorStop(1, "#F2E4D6");
    x.fillStyle = g; x.fillRect(0, 0, 1400, 520);
    x.fillStyle = "rgba(255,255,255,.5)"; x.fillRect(0, 410, 1400, 110);
    for (const [tx, ty, s, o] of [
      [470, 60, 1, { type: "high", upper: "#FFFFFF", overlay: "#C8102E", stripe: "#1A1A1A", sole: "#FFFFFF", outsole: "#C8102E", lace: "#FFFFFF" }],
      [790, 140, .88, { type: "runner", upper: "#C9CED6", overlay: "#9AA3AE", stripe: "#23395B", sole: "#F2EFE8", outsole: "#6B7380", lace: "#EDEDED" }],
      [1060, 110, .92, { type: "low", upper: "#FFFFFF", overlay: "#1B1B1B", stripe: "#1B1B1B", sole: "#FFFFFF", outsole: "#DADADA", lace: "#FFFFFF" }],
    ]) { x.save(); x.translate(tx, ty); x.scale(s, s); x.fillStyle = "rgba(0,0,0,.12)"; x.beginPath(); x.ellipse(205, 372, 170, 14, 0, 0, 7); x.fill(); drawShoe(x, o); x.restore(); }
    heroArt = c;
  }
  const cv = document.createElement("canvas"); cv.width = heroArt.width; cv.height = heroArt.height; cv.getContext("2d").drawImage(heroArt, 0, 0); cv.setAttribute("aria-hidden", "true");
  return cv;
}
function pageHome() {
  const out = [];
  out.push(h("section", { class: "hero" }, heroCanvas(), h("div", { class: "hero-card" },
    h("h1", null, "Tes paires dorment dans leur boîte ?"),
    h("p", { class: "muted", style: "margin:0" }, "Vends-les en 2 minutes. Tu gardes 100 % du prix : zéro commission vendeur."),
    h("button", { class: "btn primary block", onclick: () => go("sell") }, "Vendre maintenant"),
    h("button", { class: "linkbtn", onclick: () => browse({}) }, "Voir toutes les paires"))));
  out.push(h("div", { class: "trust" },
    h("div", null, icon("coin", "color:var(--accent)"), h("div", null, h("b", null, "0 % de commission"), h("span", { class: "small muted" }, "Le vendeur touche le prix affiché, au centime près."))),
    h("div", null, icon("check", "color:var(--accent)"), h("div", null, h("b", null, "Authenticité vérifiée"), h("span", { class: "small muted" }, `Dès ${AUTH.minPrice} €, la paire passe par notre contrôle avant de t’arriver (+${eur(AUTH.price)}).`))),
    h("div", null, icon("shield", "color:var(--accent)"), h("div", null, h("b", null, "Protection plafonnée à 5 €"), h("span", { class: "small muted" }, "3 % du prix, jamais plus de 5 €. L’argent est bloqué jusqu’à ce que tu confirmes la réception.")))));
  out.push(h("div", { class: "sec-h" }, h("h2", null, S.mySize ? `Dans ta pointure (${sz(S.mySize)} EU)` : "Quelle est ta pointure ?"),
    S.mySize ? h("button", { class: "linkbtn", onclick: () => setSize("") }, "Changer") : null));
  if (!S.mySize) {
    out.push(h("div", { class: "sizebar" }, h("b", null, "Choisis-la une fois, on te montre les paires qui te vont :"),
      ["38", "39", "40", "40.5", "41", "42", "42.5", "43", "44", "44.5", "45", "46"].map(s => h("button", { class: "chip", onclick: () => { setSize(s); toast(`Pointure ${sz(s)} enregistrée`); } }, sz(s)))));
  } else {
    const mine = applyFilters(S.listings, { ...blankFilters(), sizes: [S.mySize] }).filter(l => l.status === "active").slice(0, 10);
    out.push(mine.length ? grid(mine) : h("div", { class: "empty" }, h("h2", null, `Pas encore de paire en ${sz(S.mySize)}`), h("p", { class: "muted", style: "margin:0" }, "Reviens bientôt ou regarde les pointures voisines."), h("button", { class: "btn ghost", onclick: () => browse({}) }, "Voir toutes les paires")));
  }
  out.push(h("div", { class: "sec-h" }, h("h2", null, "Marques populaires")));
  out.push(h("div", { class: "brands" }, BRANDS.filter(b => b !== "Autre").map(b => h("button", { class: "brand-tile", onclick: () => browse({ brands: [b] }) }, b))));
  const feed = applyFilters(S.listings, blankFilters());
  out.push(h("div", { class: "sec-h" }, h("h2", null, "Fil d’actu"), feed.length ? h("button", { class: "linkbtn", onclick: () => browse({}) }, "Tout voir") : null));
  if (S.mode === "loading") out.push(loadingState());
  else if (!feed.length) out.push(h("div", { class: "empty" }, h("h2", null, "La première paire, c’est la tienne"), h("p", { class: "muted", style: "margin:0;max-width:46ch" }, "Aucune annonce pour l’instant. Prends 4 photos (profil, semelle, étiquette de taille, boîte), fixe ton prix, c’est en ligne."), h("button", { class: "btn primary", onclick: () => go("sell") }, "Mettre une paire en vente")));
  else out.push(grid(feed.slice(0, 24)));
  return out;
}
function setSize(s) { S.mySize = s; S.built = ""; render(); Api.saveSettings().catch(() => {}); }

/* ---------- Catalogue ---------- */
function pageCatalog() {
  const f = S.f, list = applyFilters(S.listings, f);
  const title = f.q ? `« ${f.q} »` : f.brands.length === 1 && !f.style ? `Sneakers ${f.brands[0]}` : f.style ? `Sneakers ${styleLabel(f.style).toLowerCase()}` : "Toutes les paires";
  const out = [
    h("div", { class: "crumbs" }, h("button", { onclick: () => go("home") }, "Accueil"), "/", h("span", null, "Sneakers"), f.style ? ["/", h("span", null, styleLabel(f.style))] : null),
    h("h1", { class: "page-h" }, title), filterPills(), activeFilters(),
    h("div", { class: "cat-bar" }, h("span", { class: "muted small num" }, S.mode === "loading" ? "Chargement…" : `${list.length} paire${list.length > 1 ? "s" : ""}`)),
  ];
  if (S.mode !== "loading" && !list.length) out.push(h("div", { class: "empty" }, h("h2", null, "Aucune paire ne correspond"), h("p", { class: "muted", style: "margin:0" }, "Élargis la pointure, le prix ou la marque."), h("button", { class: "btn ghost", onclick: () => browse({}) }, "Effacer les filtres")));
  else out.push(grid(list));
  return out;
}
function setF(patch) { Object.assign(S.f, patch); S.built = ""; render(); }
function toggleIn(key, v) { const a = new Set(S.f[key]); a.has(v) ? a.delete(v) : a.add(v); setF({ [key]: [...a] }); }
function pill(id, label, on, content) {
  return h("div", { class: "pw" },
    h("button", { class: "pill" + (on ? " on" : ""), "aria-expanded": String(S.pop === id), onclick: e => { e.stopPropagation(); S.pop = S.pop === id ? null : id; S.built = ""; render(); } }, label, icon("chev")),
    S.pop === id ? h("div", { class: "pop", onclick: e => e.stopPropagation() }, content()) : null);
}
function checks(key, values) {
  return h("div", { class: "opts" }, values.map(v => h("label", { class: "o" }, h("input", { type: "checkbox", checked: S.f[key].includes(v), onchange: () => toggleIn(key, v) }), v)));
}
function filterPills() {
  const f = S.f, n = (k, base) => f[k].length ? `${base} (${f[k].length})` : base;
  const sortLabels = { recent: "Plus récentes", low: "Prix croissant", high: "Prix décroissant", liked: "Les plus aimées" };
  return h("div", { class: "pills" },
    pill("size", n("sizes", "Pointure"), f.sizes.length, () => [h("b", null, "Pointure EU"),
      h("div", { class: "sizes" }, SIZES.map(s => h("button", { "aria-pressed": String(f.sizes.includes(s)), onclick: () => toggleIn("sizes", s) }, sz(s), US[s] ? h("small", null, `US ${US[s]}`) : null))),
      S.mySize ? h("button", { class: "linkbtn", style: "justify-self:start", onclick: () => setF({ sizes: [S.mySize] }) }, `Seulement ma pointure (${sz(S.mySize)})`) : null]),
    pill("brand", n("brands", "Marque"), f.brands.length, () => checks("brands", BRANDS)),
    pill("cond", n("conds", "État"), f.conds.length, () => checks("conds", CONDS.map(c => c[0]))),
    pill("price", f.min || f.max ? `${f.min || 0} – ${f.max || "∞"} €` : "Prix", f.min || f.max, () => {
      const a = h("input", { type: "number", min: "0", inputmode: "numeric", placeholder: "Min €", value: f.min, "aria-label": "Prix minimum" });
      const b = h("input", { type: "number", min: "0", inputmode: "numeric", placeholder: "Max €", value: f.max, "aria-label": "Prix maximum" });
      return [h("div", { class: "row" }, a, "–", b), h("button", { class: "btn primary sm", onclick: () => { S.pop = null; setF({ min: a.value, max: b.value }); } }, "Appliquer")];
    }),
    pill("color", n("colors", "Couleur"), f.colors.length, () => checks("colors", COLORS)),
    h("button", { class: "pill" + (f.box ? " on" : ""), "aria-pressed": String(f.box), onclick: () => setF({ box: !f.box }) }, "Avec boîte"),
    h("button", { class: "pill" + (f.auth ? " on" : ""), "aria-pressed": String(f.auth), onclick: () => setF({ auth: !f.auth }) }, "Authentifiables"),
    pill("sort", `Trier : ${sortLabels[f.sort]}`, false, () => h("div", { class: "opts" }, Object.entries(sortLabels).map(([k, t]) => h("label", { class: "o" }, h("input", { type: "radio", name: "sort", checked: f.sort === k, onchange: () => { S.pop = null; setF({ sort: k }); } }), t)))));
}
function activeFilters() {
  const f = S.f, chips = [];
  const x = (label, fn) => chips.push(h("button", { onclick: fn, "aria-label": `Retirer le filtre ${label}` }, label, " ×"));
  f.sizes.forEach(s => x(`${sz(s)} EU`, () => toggleIn("sizes", s)));
  f.brands.forEach(b => x(b, () => toggleIn("brands", b)));
  f.conds.forEach(c => x(c, () => toggleIn("conds", c)));
  f.colors.forEach(c => x(c, () => toggleIn("colors", c)));
  if (f.min || f.max) x(`${f.min || 0} – ${f.max || "∞"} €`, () => setF({ min: "", max: "" }));
  if (f.q) x(`« ${f.q} »`, () => { $("#q").value = ""; setF({ q: "" }); });
  if (chips.length > 1) chips.push(h("button", { onclick: () => browse({ style: f.style }) }, "Tout effacer"));
  return chips.length ? h("div", { class: "active-f" }, chips) : null;
}
document.addEventListener("click", e => { if (S.pop && !e.target.closest(".pw")) { S.pop = null; S.built = ""; render(); } });

/* ---------- Favoris ---------- */
function pageFavs() {
  if (S.mode === "live" && !S.me) return signInPrompt("Garde tes paires préférées", "Connecte-toi pour ajouter des paires en favoris et les retrouver sur tous tes appareils.");
  const list = S.listings.filter(l => visible(l) && liked(l));
  return [h("h1", { class: "page-h", style: "margin-top:22px" }, "Mes favoris"),
    list.length ? grid(list) : h("div", { class: "empty" }, h("h2", null, "Aucun favori"), h("p", { class: "muted", style: "margin:0" }, "Touche le cœur d’une paire pour la suivre ici."), h("button", { class: "btn primary", onclick: () => browse({}) }, "Parcourir les paires"))];
}

/* ---------- Page article ---------- */
function pageItem() {
  const l = L(S.route.id);
  if (!l || (l.status === "removed" && l.sellerId !== S.me)) return S.mode === "loading" ? loadingState() : h("div", { class: "empty", style: "margin-top:30px" }, h("h2", null, "Cette annonce n’existe plus"), h("button", { class: "btn ghost", onclick: () => browse({}) }, "Voir d’autres paires"));
  const photos = Api.photosOf(l), pics = photos.length ? photos : [imgOf(l)];
  const mine = l.sellerId === S.me, sold = l.status === "sold", reserved = l.status === "reserved", auth = l.price >= AUTH.minPrice;
  const rt = rating(l.sellerId), ms = modelStats(l);
  const neg = S.threads.find(t => t.listingId === l.id && t.buyerId === S.me)?.acceptedPrice;
  const more = S.listings.filter(x => x.sellerId === l.sellerId && x.id !== l.id && x.status === "active").slice(0, 6);
  const similar = S.listings.filter(x => x.id !== l.id && x.sellerId !== l.sellerId && x.status === "active" && (x.brand === l.brand || x.style === l.style)).slice(0, 6);
  let buttons;
  if (mine) buttons = l.status === "active" ? [h("button", { class: "btn danger block", onclick: () => confirmDelete(l) }, "Retirer l’annonce")] : [h("button", { class: "btn block", disabled: true }, l.status === "removed" ? "Annonce retirée" : sold ? "Vendue" : "Paiement en cours")];
  else if (sold) buttons = [h("button", { class: "btn block", disabled: true }, "Cette paire est vendue")];
  else if (reserved && l.reservedBy !== S.me) buttons = [h("button", { class: "btn block", disabled: true }, "Réservée : un paiement est en cours")];
  else buttons = [h("button", { class: "btn primary block", onclick: () => startCheckout(l) }, reserved ? "Reprendre mon paiement" : neg ? `Acheter à ${eur(neg)}` : "Acheter"),
    h("button", { class: "btn outline block", onclick: () => openThread(l, "offer") }, "Faire une offre"),
    h("button", { class: "btn outline block", onclick: () => openThread(l) }, "Envoyer un message")];
  const walletHint = mine && S.mode === "live" && !S.profile.payoutsReady && l.status === "active"
    ? h("div", { class: "insight" }, icon("coin", "color:var(--accent)"), h("span", null, "Active ton porte-monnaie pour recevoir l’argent quand la paire sera vendue. ", h("button", { class: "linkbtn", onclick: startWallet }, "Activer maintenant"))) : null;
  const modNote = mine && l.status === "removed" ? h("div", { class: "notice" }, "Annonce retirée", l.moderationNote ? ` par la modération. Motif : ${l.moderationNote}` : ".", " Pour contester cette décision, écris à ", CONTACT, ".") : null;
  return [
    modNote,
    h("div", { class: "crumbs" }, h("button", { onclick: () => go("home") }, "Accueil"), "/", h("button", { onclick: () => browse({ style: l.style }) }, styleLabel(l.style)), "/", h("button", { onclick: () => browse({ brands: [l.brand] }) }, l.brand), l.model ? ["/", h("span", null, l.model)] : null),
    h("div", { class: "item" },
      h("div", { style: "min-width:0;display:grid;gap:28px" },
        h("div", { class: "gal" }, pics.slice(0, 5).map((p, i) => h("button", { "aria-label": `Agrandir la photo ${i + 1}`, onclick: () => lightbox(p) }, h("img", { src: p, alt: i ? "" : l.title })))),
        more.length ? h("section", null, h("div", { class: "sec-h", style: "margin-top:0" }, h("h2", null, `Autres paires de ${nameOf(l.sellerId)}`), h("button", { class: "linkbtn", onclick: () => go("member", { id: l.sellerId }) }, "Voir tout")), grid(more)) : null,
        similar.length ? h("section", null, h("div", { class: "sec-h", style: "margin-top:0" }, h("h2", null, "Paires similaires")), grid(similar)) : null),
      h("aside", { class: "buybox" },
        h("div", { class: "box" },
          h("div", null,
            h("div", { class: "p-big num" }, eur(l.price)),
            h("div", { class: "p-incl num", title: "3 % du prix, plafonnée à 5 €" }, `${eur(l.price + protect(l.price))} incl. protection acheteur`, icon("info"))),
          h("dl", { class: "details" },
            h("dt", null, "Marque"), h("dd", null, h("button", { class: "linkbtn", onclick: () => browse({ brands: [l.brand] }) }, l.brand)),
            l.model ? [h("dt", null, "Modèle"), h("dd", null, l.model)] : null,
            h("dt", null, "Pointure"), h("dd", null, `${sz(l.size)} EU${US[l.size] ? ` · US ${US[l.size]}` : ""}`),
            h("dt", null, "État"), h("dd", null, l.condition),
            h("dt", null, "Coloris"), h("dd", null, l.colorway || l.color || "—"),
            h("dt", null, "Boîte d’origine"), h("dd", null, l.box ? "Oui" : "Non"),
            l.sku ? [h("dt", null, "Référence"), h("dd", null, l.sku)] : null,
            h("dt", null, "Ajoutée"), h("dd", null, ago(l.createdAt)),
            h("dt", null, "Favoris"), h("dd", null, `${likes(l)} ♥`)),
          h("div", null, h("div", { class: "item-title" }, l.title), l.description ? h("p", { class: "desc muted", style: "margin-top:6px" }, l.description) : null),
          ms ? h("div", { class: "insight" }, icon("info", "padding-top:2px"), h("span", null, `Prix moyen des ${l.model} sur Rebond : `, h("b", { class: "num" }, eur(ms.avg)), ` (${ms.n} autre${ms.n > 1 ? "s" : ""} annonce${ms.n > 1 ? "s" : ""}).`)) : null,
          auth && l.status === "active" ? h("div", { class: "okline" }, icon("check"), h("span", null, h("b", null, "Vérification d’authenticité disponible. "), `Au moment de payer, fais contrôler la paire par Rebond (+${eur(AUTH.price)}).`)) : null,
          walletHint,
          h("div", { class: "small muted" }, `Livraison à partir de ${eur(3.49)} · envoi sous ${SELLER_SHIP_DAYS} jours`),
          buttons,
          !mine ? h("button", { class: "btn ghost block", "aria-pressed": String(liked(l)), onclick: () => toggleLike(l) }, liked(l) ? "♥ Dans tes favoris" : "♡ Ajouter aux favoris") : null),
        h("div", { class: "box" },
          h("button", { style: "all:unset;cursor:pointer;display:flex;gap:12px;align-items:center", onclick: () => go("member", { id: l.sellerId }) },
            avatar(l.sellerId, 48),
            h("div", null, h("b", null, mine ? "toi" : nameOf(l.sellerId)),
              h("div", { class: "small muted" }, rt.n ? [h("span", { class: "stars" }, stars(rt.avg)), ` ${rt.n} évaluation${rt.n > 1 ? "s" : ""}`] : "Aucune évaluation"),
              cityOf(l.sellerId) ? h("div", { class: "xs muted" }, cityOf(l.sellerId)) : null)),
          h("div", { class: "okline", style: "background:var(--soft)" }, icon("shield", "color:var(--accent)"), h("span", { class: "small" }, h("b", null, "Protection acheteur. "), "Le vendeur est payé seulement quand tu confirmes que la paire est conforme.")),
          !mine ? h("button", { class: "linkbtn small", style: "display:flex;gap:6px;align-items:center;color:var(--muted);justify-self:start", onclick: () => reportDialog(l) }, icon("flag"), "Signaler l’annonce") : null)))];
}
function modal(title, ...content) {
  const box = h("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": title, onclick: e => { if (e.target === box) closeLayer(); } },
    h("div", { class: "box" }, h("div", { style: "display:flex;justify-content:space-between;gap:12px;align-items:center" }, h("h2", null, title), h("button", { class: "ibtn", svg: I.x, "aria-label": "Fermer", onclick: closeLayer })), ...content));
  $("#layer").replaceChildren(box);
  setTimeout(() => (box.querySelector("input,textarea,select") || box.querySelector("button")).focus(), 30);
  return box;
}
function lightbox(src) {
  const box = h("div", { class: "lightbox", role: "dialog", "aria-label": "Photo", onclick: e => { if (e.target === box) closeLayer(); } },
    h("img", { src, alt: "" }), h("button", { class: "ibtn", svg: I.x, "aria-label": "Fermer", onclick: closeLayer }));
  $("#layer").replaceChildren(box); box.querySelector("button").focus();
}
function closeLayer() { $("#layer").replaceChildren(); }
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeLayer(); if (S.pop) { S.pop = null; S.built = ""; render(); } } });
function confirmDelete(l) {
  modal("Retirer cette annonce ?", h("p", { class: "muted", style: "margin:0" }, `« ${l.title} » disparaîtra pour tout le monde. Les photos seront supprimées.`),
    h("div", { class: "actions-end" }, h("button", { class: "btn ghost", onclick: closeLayer }, "Annuler"),
      h("button", { class: "btn danger", onclick: async () => { if (await attempt(() => Api.removeListing(l), "Annonce retirée")) { closeLayer(); go("member", { id: S.me }, { replace: true }); } } }, "Retirer")));
}
function reportDialog(l) {
  if (S.mode === "live" && !S.me) {
    modal("Signaler l’annonce", h("p", { style: "margin:0" }, "Connecte-toi pour signaler cette annonce, ou écris-nous sans compte à ", h("b", null, CONTACT), " en indiquant le lien de l’annonce et le problème."),
      h("div", { class: "actions-end" }, h("button", { class: "btn primary", onclick: () => openAuth("login") }, "Se connecter")));
    return;
  }
  let reason = "contrefacon";
  const details = h("textarea", { id: "repDetails", maxlength: "1000", placeholder: "Explique ce qui ne va pas (ex. logo mal placé, étiquette différente de l’originale…)" });
  const msg = h("div", { class: "formmsg", hidden: true });
  modal("Signaler l’annonce",
    h("p", { class: "small muted", style: "margin:0" }, "Chaque signalement est examiné par notre équipe. Tu seras informé·e de la décision. Un signalement abusif peut entraîner la suspension du compte."),
    h("div", { class: "conds", role: "radiogroup", "aria-label": "Motif" }, Object.entries(REASONS).map(([k, t]) => h("label", null, h("input", { type: "radio", name: "rep", checked: k === reason, onchange: () => reason = k }), h("span", null, t)))),
    h("label", { class: "field", for: "repDetails" }, "Détails", details), msg,
    h("div", { class: "actions-end" }, h("button", { class: "btn ghost", onclick: closeLayer }, "Annuler"),
      h("button", { class: "btn primary", onclick: async () => {
        if (reason === "autre" && !details.value.trim()) { msg.hidden = false; msg.className = "formmsg err"; msg.textContent = "Décris le problème en quelques mots."; return; }
        if (await attempt(() => Api.report(l.id, reason, details.value.trim().slice(0, 1000)), "Merci, ton signalement a été transmis à la modération.")) closeLayer();
      } }, "Envoyer le signalement")));
}

/* ---------- Vendre ---------- */
function pageSell() {
  if (S.mode === "loading") return loadingState();
  if (S.mode === "live" && !S.me) return signInPrompt("Vends tes paires en 2 minutes", "Crée ton compte gratuit pour publier une annonce. Zéro commission vendeur.");
  const photos = [];
  const drop = h("div", { class: "drop" });
  const fileIn = h("input", { type: "file", accept: "image/*", multiple: true, id: "sPh" });
  const add = h("label", { class: "addph", for: "sPh" }, fileIn, "+ Photos");
  const paint = () => {
    drop.classList.toggle("has", photos.length > 0);
    drop.replaceChildren(...(photos.length
      ? [h("div", { class: "thumbs" }, photos.map((p, i) => h("div", { class: "t" }, h("img", { src: p.thumb, alt: `Photo ${i + 1}` }), i === 0 ? h("span", { class: "cover" }, "Couverture") : null, h("button", { type: "button", "aria-label": `Retirer la photo ${i + 1}`, onclick: () => { photos.splice(i, 1); paint(); } }, "×"))), photos.length < 5 ? add : null)]
      : [h("b", null, "Ajoute jusqu’à 5 photos"), h("span", { class: "small muted" }, "Profil extérieur, semelle, étiquette de taille (sous la languette), boîte. Les acheteurs regardent d’abord la semelle."), add]));
  };
  fileIn.addEventListener("change", async () => {
    for (const f of [...fileIn.files].slice(0, 5 - photos.length)) { try { photos.push(await preparePhoto(f)); } catch { toast("Cette image n’a pas pu être lue."); } }
    fileIn.value = ""; paint();
  });
  paint();
  const title = h("input", { id: "sTitle", maxlength: "70", placeholder: "Ex. Nike Dunk Low Panda" });
  const desc = h("textarea", { id: "sDesc", maxlength: "1200", placeholder: "Portées combien de fois ? Défauts ? Semelle ? Lacets d’origine ? Achetées où ?" });
  const style = h("select", { id: "sStyle" }, STYLES.map(s => h("option", { value: s.id }, s.label)));
  const brand = h("select", { id: "sBrand" }, BRANDS.map(b => h("option", { value: b }, b)));
  const model = h("input", { id: "sModel", maxlength: "40", placeholder: "Ex. Dunk Low, Samba OG, 550" });
  const colorway = h("input", { id: "sCw", maxlength: "40", placeholder: "Ex. Blanc / Noir" });
  const color = h("select", { id: "sColor" }, COLORS.map(c => h("option", { value: c }, c)));
  const sku = h("input", { id: "sSku", maxlength: "20", placeholder: "Ex. DD1391-100" });
  const box = h("input", { id: "sBox", type: "checkbox", checked: true });
  let size = S.mySize || "";
  const sizeGrid = h("div", { class: "sizes", role: "group", "aria-label": "Pointure" });
  const paintSizes = () => sizeGrid.replaceChildren(...SIZES.map(s => h("button", { type: "button", "aria-pressed": String(size === s), onclick: () => { size = s; paintSizes(); } }, sz(s), US[s] ? h("small", null, `US ${US[s]}`) : null)));
  paintSizes();
  const conds = h("div", { class: "conds" }, CONDS.map(([c, d], i) => h("label", null, h("input", { type: "radio", name: "sCond", value: c, checked: i === 2 }), h("span", null, h("b", null, c), h("br"), h("span", { class: "small muted" }, d)))));
  const price = h("input", { id: "sPrice", type: "number", min: "1", max: "10000", step: "1", inputmode: "decimal", placeholder: "0 €" });
  const earn = h("b", { class: "num" }, eur(0));
  const hint = h("div", { class: "hint" }, "Astuce : un prix juste et rond part plus vite.");
  const authHint = h("div", { class: "hint" });
  const confirmLegit = h("input", { id: "sLegit", type: "checkbox" });
  const refresh = () => {
    const p = +price.value || 0; earn.textContent = eur(p);
    authHint.textContent = p >= AUTH.minPrice ? "Ta paire sera proposée avec vérification d’authenticité : ça rassure les acheteurs." : "";
    const ms = model.value.trim() && modelStats({ id: "", brand: brand.value, model: model.value.trim() });
    hint.textContent = ms ? `${model.value.trim()} sur Rebond : prix moyen ${eur(ms.avg)} sur ${ms.n} annonce${ms.n > 1 ? "s" : ""}.` : "Astuce : un prix juste et rond part plus vite.";
  };
  price.addEventListener("input", refresh); model.addEventListener("input", refresh); brand.addEventListener("change", refresh);
  const submit = h("button", { class: "btn primary", type: "submit" }, "Mettre en vente");
  const row = (label, forId, ...kids) => h("div", { class: "frow" }, forId ? h("label", { for: forId }, label) : h("div", { class: "lbl" }, label), h("div", { style: "min-width:0" }, kids));
  const form = h("form", { class: "form-page", novalidate: true, onsubmit: async e => {
    e.preventDefault();
    const p = Math.round(+price.value * 100) / 100;
    if (title.value.trim().length < 3) { toast("Ajoute un titre d’au moins 3 caractères."); title.focus(); return; }
    if (!size) { toast("Choisis la pointure."); sizeGrid.querySelector("button").focus(); return; }
    if (!(p >= 1 && p <= 10000)) { toast("Indique un prix entre 1 € et 10 000 €."); price.focus(); return; }
    if (!confirmLegit.checked) { toast("Confirme que la paire est authentique et t’appartient."); confirmLegit.focus(); return; }
    if (!needAuth()) return;
    submit.disabled = true; submit.textContent = "Publication…";
    const fields = { title: title.value.trim(), description: desc.value.trim(), style: style.value, brand: brand.value, model: model.value.trim(),
      colorway: colorway.value.trim(), color: color.value, sku: sku.value.trim().toUpperCase(), box: box.checked, size, condition: form.querySelector('input[name="sCond"]:checked').value, price: p };
    const id = await attempt(() => Api.createListing(fields, photos));
    if (id) { toast("Ta paire est en ligne !"); go("item", { id }, { replace: true }); }
    else { submit.disabled = false; submit.textContent = "Mettre en vente"; }
  } },
    h("h1", null, "Vends tes paires"),
    h("div", { class: "fcard", style: "padding:18px" }, drop),
    h("div", { class: "fcard" }, row("Titre", "sTitle", title), row("Décris ta paire", "sDesc", desc)),
    h("div", { class: "fcard" },
      row("Style", "sStyle", style), row("Marque", "sBrand", brand), row("Modèle", "sModel", model, h("div", { class: "hint" }, "Le nom exact aide les acheteurs à te trouver.")),
      row("Pointure EU", null, sizeGrid), row("État", null, conds),
      row("Coloris", "sCw", colorway), row("Couleur principale", "sColor", color),
      row("Référence (SKU)", "sSku", sku, h("div", { class: "hint" }, "Sur l’étiquette sous la languette. Facultatif, mais ça rassure.")),
      row("Boîte d’origine", "sBox", h("div", { class: "switch" }, box, h("span", null, "Je fournis la boîte")))),
    h("div", { class: "fcard" }, row("Prix", "sPrice", price, hint, authHint, h("div", { class: "earn" }, h("span", null, "Tu reçois", h("br"), h("span", { class: "xs muted" }, "0 % de commission")), earn))),
    h("label", { class: "check", for: "sLegit" }, confirmLegit, h("span", null, "Je certifie que cette paire est authentique, qu’elle m’appartient et qu’elle respecte les ", h("a", { href: "legal/regles.html", target: "_blank", rel: "noopener" }, "règles de la communauté"), ".")),
    h("div", { class: "actions-end" }, h("button", { type: "button", class: "btn ghost", onclick: () => history.back() }, "Annuler"), submit));
  return form;
}

/* ---------- Messagerie ---------- */
async function openThread(l, mode) {
  if (!needAuth("Connecte-toi pour écrire au vendeur.")) return;
  if (l.sellerId === S.me) { toast("C’est ton annonce."); return; }
  const id = await attempt(() => Api.openThread(l));
  if (id) go("inbox", mode === "offer" ? { id, offer: 1 } : { id });
}
function pageInbox() {
  if (S.mode === "live" && !S.me) return signInPrompt("Tes messages", "Connecte-toi pour discuter avec les vendeurs et les acheteurs.");
  const wrap = h("div", { class: "inbox" + (S.route.id ? " open" : "") },
    h("div", { class: "tlist" }, h("h2", null, "Boîte de réception"), h("div", { id: "tl" })),
    h("section", { class: "conv", id: "conv" }));
  const conv = wrap.querySelector("#conv");
  if (!S.route.id) { conv.append(h("div", { class: "conv-empty" }, h("div", null, h("b", null, "Choisis une conversation"), h("p", { class: "small", style: "margin:4px 0 0" }, "Tes échanges avec les vendeurs et les acheteurs apparaissent ici.")))); return wrap; }
  const input = h("input", { id: "chatIn", placeholder: "Écris ton message", autocomplete: "off", maxlength: "600", "aria-label": "Message" });
  const composer = h("form", { class: "composer", onsubmit: async e => {
    e.preventDefault(); const t = input.value.trim(); if (!t) return; input.value = "";
    if (!(await attempt(() => Api.post(S.route.id, { kind: "msg", text: t })))) input.value = t;
  } }, input, h("button", { class: "btn primary", type: "submit" }, "Envoyer"));
  conv.append(h("div", { class: "conv-h", id: "ch" }), h("div", { class: "msgs", id: "msgs" }), h("div", { id: "offerSlot" }), composer);
  return wrap;
}
function paintInbox() {
  const tl = $("#tl"); if (!tl) return;
  const ts = myThreads();
  tl.replaceChildren(...(ts.length ? ts.map(t => {
    const other = t.buyerId === S.me ? t.sellerId : t.buyerId, last = (t.messages || []).slice(-1)[0], l = L(t.listingId);
    return h("button", { class: "trow", "aria-current": String(S.route.id === t.id), onclick: () => go("inbox", { id: t.id }, { replace: true, keepScroll: true }) },
      avatar(other, 40),
      h("div", { class: "grow" }, h("div", null, h("b", null, nameOf(other)), " ", h("span", { class: "xs muted" }, t.updatedAt ? ago(t.updatedAt) : "")),
        h("div", { class: "last" }, last ? (last.kind === "offer" ? `Offre : ${eur(last.amount)}` : last.text) : t.title)),
      isUnread(t) ? h("span", { class: "unread", "aria-label": "Non lu" }) : null,
      h("img", { class: "it", src: l ? imgOf(l) : sneakerImg(DEFAULT_ILLO), alt: "" }));
  }) : [h("p", { class: "muted small", style: "padding:16px;margin:0" }, "Aucune conversation. Pose une question ou fais une offre depuis une annonce.")]));
  const id = S.route.id; if (!id) return;
  const t = S.threads.find(x => x.id === id), ch = $("#ch"), msgs = $("#msgs"), slot = $("#offerSlot");
  if (!ch) return;
  if (!t) { msgs.replaceChildren(h("p", { class: "muted" }, S.mode === "loading" ? "Chargement…" : "Conversation introuvable.")); return; }
  const l = L(t.listingId), seller = t.sellerId === S.me, other = seller ? t.buyerId : t.sellerId;
  ch.replaceChildren(
    h("button", { class: "ibtn", svg: I.back, "aria-label": "Retour aux conversations", onclick: () => go("inbox", {}, { replace: true }) }),
    h("img", { src: l ? imgOf(l) : sneakerImg(DEFAULT_ILLO), alt: "" }),
    h("div", { class: "grow" }, h("b", null, nameOf(other)), h("div", { class: "small muted" }, l ? `${l.title} · ${t.acceptedPrice ? `${eur(t.acceptedPrice)} (négocié)` : eur(l.price)}` : t.title)),
    l && !seller && (l.status === "active" || (l.status === "reserved" && l.reservedBy === S.me)) ? h("button", { class: "btn primary sm", onclick: () => startCheckout(l) }, t.acceptedPrice ? `Acheter ${eur(t.acceptedPrice)}` : "Acheter")
      : l && l.status === "sold" ? h("span", { class: "st" }, "Vendue") : l ? h("button", { class: "btn ghost sm", onclick: () => go("item", { id: l.id }) }, "Voir l’annonce") : null);
  const list = (t.messages || []).map(m => {
    if (m.kind === "offer") {
      const mine = m.from === S.me;
      const kids = [h("span", { class: "small muted" }, mine ? "Ton offre" : `Offre de ${nameOf(m.from)}`), h("b", { class: "num" }, eur(m.amount))];
      if (m.state === "pending") kids.push(seller ? h("div", { class: "actions-end", style: "justify-content:center" },
        h("button", { class: "btn ghost sm", onclick: () => attempt(() => Api.answerOffer(t, m, false), "Offre refusée") }, "Refuser"),
        h("button", { class: "btn primary sm", onclick: () => attempt(() => Api.answerOffer(t, m, true), "Offre acceptée") }, "Accepter")) : h("span", { class: "st warn" }, "En attente de réponse"));
      else kids.push(h("span", { class: "st " + (m.state === "accepted" ? "good" : "") }, m.state === "accepted" ? "Offre acceptée" : "Offre refusée"));
      return h("div", { class: "offer" }, kids);
    }
    return h("div", { class: "msg" + (m.from === S.me ? " me" : "") }, m.text, h("time", null, ago(m.at)));
  });
  msgs.replaceChildren(...(list.length ? list : [h("p", { class: "muted small", style: "text-align:center;margin:auto" }, seller ? "Aucun message pour l’instant." : "Dis bonjour, pose ta question ou propose un prix. Ne paie jamais en dehors de Rebond et ne partage pas tes coordonnées bancaires.")]));
  msgs.scrollTop = msgs.scrollHeight;
  if (!seller && l && l.status === "active") {
    if (!slot.childNodes.length) {
      const amt = h("input", { id: "offerAmt", type: "number", min: "1", step: "1", inputmode: "decimal", placeholder: `${Math.round(l.price * .85)} €`, "aria-label": "Montant de l’offre" });
      slot.append(h("div", { class: "offerbar" }, h("b", { class: "small" }, "Faire une offre"), amt,
        h("button", { class: "btn primary sm", onclick: async () => {
          const a = Math.round(+amt.value * 100) / 100;
          if (!(a >= 1)) { toast("Indique un montant."); amt.focus(); return; }
          if (a >= l.price) { toast("L’offre doit être inférieure au prix affiché."); return; }
          if (await attempt(() => Api.post(t.id, { kind: "offer", amount: a }), "Offre envoyée")) amt.value = "";
        } }, "Envoyer l’offre"), h("span", { class: "xs muted" }, `Prix affiché ${eur(l.price)}`)));
      if (S.route.offer) setTimeout(() => amt.focus(), 50);
    }
  } else slot.replaceChildren();
  if (isUnread(t)) { S.seen[t.id] = t.updatedAt; Api.saveSettings().catch(() => {}); setTimeout(render, 0); }
}

/* ---------- Paiement ---------- */
function startCheckout(l) {
  if (!needAuth("Connecte-toi pour acheter cette paire.")) return;
  if (l.status === "sold") { toast("Cette paire vient d’être vendue."); return; }
  go("checkout", { id: l.id });
}
function pageCheckout() {
  if (S.mode === "loading") return loadingState();
  if (S.mode === "live" && !S.me) return signInPrompt("Connecte-toi pour acheter", "Ton compte te permet de suivre ta commande et d’être remboursé·e en cas de problème.");
  const l = L(S.route.id);
  const available = l && (l.status === "active" || (l.status === "reserved" && l.reservedBy === S.me)) && l.sellerId !== S.me;
  if (!available) return h("div", { class: "empty", style: "margin-top:30px" }, h("h2", null, "Cette paire n’est plus disponible"), h("button", { class: "btn ghost", onclick: () => browse({}) }, "Voir d’autres paires"));
  const neg = S.threads.find(t => t.listingId === l.id && t.buyerId === S.me)?.acceptedPrice;
  const price = neg || l.price, canAuth = price >= AUTH.minPrice;
  let ship = "relay", auth = canAuth;
  const sum = h("div", { class: "sum num" });
  const addr = h("div", { class: "fcard" });
  const nameIn = h("input", { id: "coName", autocomplete: "name", placeholder: "Prénom et nom", maxlength: "80" });
  const streetIn = h("input", { id: "coStreet", autocomplete: "street-address", placeholder: "Numéro, rue, ville", maxlength: "160" });
  const zipIn = h("input", { id: "coZip", autocomplete: "postal-code", inputmode: "numeric", maxlength: "5", placeholder: "75011" });
  const pay = h("button", { class: "btn primary block" });
  const total = () => price + protect(price) + SHIPPING.find(s => s.id === ship).price + (auth ? AUTH.price : 0);
  const paint = () => {
    const s = SHIPPING.find(x => x.id === ship);
    sum.replaceChildren(...[
      h("div", null, h("span", null, neg ? "Paire (prix négocié)" : "Paire"), h("span", null, eur(price))),
      h("div", null, h("span", null, "Protection acheteur"), h("span", null, eur(protect(price)))),
      h("div", null, h("span", null, s.label), h("span", null, s.price ? eur(s.price) : "Gratuit")),
      auth ? h("div", null, h("span", null, "Vérification d’authenticité"), h("span", null, eur(AUTH.price))) : null,
      h("div", { class: "tot" }, h("span", null, "Total"), h("span", null, eur(total())))].filter(Boolean));
    addr.replaceChildren(...(ship === "hand" ? [h("p", { class: "small muted", style: "margin:14px 0" }, "Tu conviendras du lieu de rendez-vous avec le vendeur par message. Vérifie la paire avant de confirmer la remise.")]
      : [h("div", { class: "frow" }, h("label", { for: "coName" }, "Nom"), nameIn), ship === "home" ? h("div", { class: "frow" }, h("label", { for: "coStreet" }, "Adresse"), streetIn) : null, h("div", { class: "frow" }, h("label", { for: "coZip" }, ship === "relay" ? "Code postal (point relais le plus proche)" : "Code postal"), zipIn)].filter(Boolean)));
    pay.textContent = S.mode === "live" ? `Payer ${eur(total())} avec Stripe` : `Payer ${eur(total())}`;
  };
  pay.addEventListener("click", async () => {
    if (ship !== "hand") {
      if (!nameIn.value.trim()) { toast("Indique ton nom pour la livraison."); nameIn.focus(); return; }
      if (ship === "home" && !streetIn.value.trim()) { toast("Indique ton adresse."); streetIn.focus(); return; }
      if (!/^\d{5}$/.test(zipIn.value.trim())) { toast("Le code postal doit contenir 5 chiffres."); zipIn.focus(); return; }
    }
    pay.disabled = true; pay.textContent = S.mode === "live" ? "Redirection vers le paiement sécurisé…" : "Paiement…";
    const res = await attempt(() => Api.checkout({ listing: l, price, ship, auth, name: nameIn.value.trim(), address: streetIn.value.trim(), zip: zipIn.value.trim() }));
    if (res && res.done) { toast(`Commande payée ! Le vendeur a ${SELLER_SHIP_DAYS} jours pour expédier.`); go("orders", { tab: "achats" }, { replace: true }); }
    else if (!res) { pay.disabled = false; paint(); }
  });
  const shipOpts = h("div", { class: "ship", role: "radiogroup", "aria-label": "Mode de livraison" }, SHIPPING.map(s => h("label", null, h("input", { type: "radio", name: "ship", checked: s.id === ship, onchange: () => { ship = s.id; paint(); } }), h("span", { class: "grow" }, h("b", null, s.label), h("br"), h("span", { class: "small muted" }, s.sub)), h("b", { class: "num" }, s.price ? eur(s.price) : "Gratuit"))));
  const authBox = canAuth ? h("label", { class: "okline", style: "cursor:pointer" }, h("input", { type: "checkbox", checked: auth, onchange: e => { auth = e.target.checked; paint(); }, style: "width:18px;height:18px;accent-color:var(--good);margin-top:2px;flex:none" }),
    h("span", null, h("b", null, `Vérification d’authenticité · ${eur(AUTH.price)}`), h("br"), h("span", { class: "small" }, "La paire passe par Rebond, est contrôlée (coutures, étiquette, semelle, boîte), puis t’est envoyée. Fausse paire : remboursement intégral."))) : null;
  paint();
  return h("div", { class: "co" },
    h("div", { style: "display:grid;gap:16px;min-width:0" },
      h("h1", { class: "page-h", style: "margin:0" }, "Paiement"),
      h("div", { class: "fcard", style: "padding:14px 18px" }, h("div", { class: "mini" }, h("img", { src: imgOf(l), alt: "" }), h("div", null, h("b", null, l.title), h("div", { class: "small muted" }, `${sz(l.size)} EU · ${l.condition}`), h("div", { class: "small muted" }, `Vendue par ${nameOf(l.sellerId)}`)))),
      h("h2", { style: "font-size:1.1rem" }, "Livraison"), shipOpts, addr,
      authBox,
      h("h2", { style: "font-size:1.1rem" }, "Moyen de paiement"),
      h("div", { class: "fcard", style: "padding:14px 18px" }, S.mode === "live"
        ? [h("b", null, "Carte bancaire, Apple Pay ou Google Pay"), h("div", { class: "small muted" }, "Tu vas être redirigé·e vers la page de paiement sécurisée de Stripe. Rebond ne voit jamais ton numéro de carte.")]
        : [h("b", null, "Carte bancaire"), h("div", { class: "small muted" }, "Mode démo : aucune carte n’est demandée ni débitée.")]),
      h("p", { class: "xs muted", style: "margin:0" }, "En payant, tu acceptes les ", h("a", { href: "legal/cgu.html", target: "_blank", rel: "noopener" }, "conditions d’utilisation"), ". Achat entre particuliers : le droit de rétractation de 14 jours ne s’applique pas, mais la protection acheteur te rembourse si la paire n’est pas conforme.")),
    h("aside", { class: "box" }, h("b", null, "Récapitulatif"), sum, pay,
      h("div", { class: "small muted", style: "display:flex;gap:8px" }, icon("shield", "color:var(--accent);flex:none"), "L’argent reste bloqué jusqu’à ce que tu confirmes la réception.")));
}

/* ---------- Commandes ---------- */
function steps(o) {
  const s = ["Payée", o.shipping === "hand" ? "Remise" : "Expédiée"]; if (o.auth) s.push("Authentifiée"); s.push("Reçue");
  const idx = { paid: 0, shipped: 1, verified: 2, done: s.length - 1 }[o.status] ?? 0;
  return { s, idx };
}
function pageOrders() {
  if (S.mode === "live" && !S.me) return signInPrompt("Tes commandes", "Connecte-toi pour suivre tes achats et tes ventes.");
  const tab = S.route.tab === "ventes" ? "ventes" : "achats";
  const buys = S.orders.filter(o => o.buyerId === S.me).sort((a, b) => b.createdAt - a.createdAt);
  const sales = S.orders.filter(o => o.sellerId === S.me).sort((a, b) => b.createdAt - a.createdAt);
  const list = tab === "achats" ? buys : sales;
  return [h("h1", { class: "page-h", style: "margin-top:22px" }, "Mes commandes"),
    h("div", { class: "tabs", role: "tablist" },
      h("button", { role: "tab", "aria-selected": String(tab === "achats"), onclick: () => go("orders", { tab: "achats" }, { replace: true }) }, `Achats (${buys.length})`),
      h("button", { role: "tab", "aria-selected": String(tab === "ventes"), onclick: () => go("orders", { tab: "ventes" }, { replace: true }) }, `Ventes (${sales.length})${pendingSales() ? " •" : ""}`)),
    list.length ? h("div", { class: "olist" }, list.map(o => orderRow(o, tab === "achats" ? "buyer" : "seller")))
      : h("div", { class: "empty" }, h("h2", null, tab === "achats" ? "Aucun achat" : "Aucune vente"), h("p", { class: "muted", style: "margin:0" }, tab === "achats" ? "Tes commandes et leur suivi s’afficheront ici." : "Quand quelqu’un achète ta paire, tu la retrouves ici avec les étapes d’envoi."), h("button", { class: "btn primary", onclick: () => tab === "achats" ? browse({}) : go("sell") }, tab === "achats" ? "Trouver une paire" : "Vendre une paire"))];
}
function statusLabel(o, role) {
  if (o.status === "paid") return role === "seller" ? ["À expédier", "warn"] : ["Payée · en attente d’envoi", "warn"];
  if (o.status === "shipped") return o.auth ? ["En route vers la vérification", "blue"] : [o.shipping === "hand" ? "Remise déclarée" : "Expédiée", "blue"];
  if (o.status === "verified") return ["Authentifiée · en route", "blue"];
  if (o.status === "done") return ["Terminée", "good"];
  if (o.status === "rejected") return ["Refusée à l’authentification · remboursée", ""];
  return ["Annulée · remboursée", ""];
}
function payoutLine(o) {
  const map = { held: "L’argent est bloqué jusqu’à la confirmation de l’acheteur.", awaiting_seller: `Active ton porte-monnaie pour recevoir ${eur(o.price + (o.shipPrice || 0))}.`, paid: `${eur(o.price + (o.shipPrice || 0))} versés sur ton porte-monnaie.`, refunded: "L’acheteur a été remboursé." };
  return h("div", { class: "payout muted" }, map[o.payoutStatus || "held"], o.payoutStatus === "awaiting_seller" ? [" ", h("button", { class: "linkbtn", onclick: startWallet }, "Activer")] : null);
}
function orderRow(o, role) {
  const { s, idx } = steps(o), acts = [], [label, cls] = statusLabel(o, role);
  const late = Date.now() - o.createdAt > SELLER_SHIP_DAYS * DAY;
  const threadWith = () => { const t = S.threads.find(x => x.listingId === o.listingId && x.buyerId === o.buyerId); return t ? go("inbox", { id: t.id }) : toast(`Écris-nous à ${CONTACT} en indiquant ta commande.`); };
  if (role === "seller" && o.status === "paid") {
    acts.push(h("button", { class: "btn primary sm", onclick: () => shipDialog(o) }, o.shipping === "hand" ? "J’ai remis la paire" : "J’ai envoyé la paire"));
    acts.push(h("button", { class: "btn ghost sm", onclick: () => confirmAction(o, "cancel", "Annuler la vente ?", "L’acheteur sera remboursé intégralement et ta paire sera remise en vente.") }, "Annuler la vente"));
  }
  if (role === "buyer" && o.status === "paid" && late) acts.push(h("button", { class: "btn ghost sm", onclick: () => confirmAction(o, "cancel", "Annuler et être remboursé·e ?", `Le vendeur n’a pas envoyé la paire sous ${SELLER_SHIP_DAYS} jours. Tu seras remboursé·e intégralement.`) }, "Annuler et être remboursé·e"));
  if (role === "buyer" && ((o.status === "shipped" && !o.auth) || o.status === "verified")) {
    acts.push(h("button", { class: "btn primary sm", onclick: () => confirmAction(o, "confirm", "Tout est conforme ?", "En confirmant, tu indiques que la paire correspond à l’annonce. Le vendeur reçoit alors son argent : tu ne pourras plus demander de remboursement.") }, "J’ai reçu ma paire, tout est OK"));
    acts.push(h("button", { class: "btn ghost sm", onclick: threadWith }, "Signaler un problème"));
  }
  if (role === "buyer" && o.status === "shipped" && o.auth) acts.push(h("span", { class: "small muted" }, "Notre équipe contrôle la paire dès son arrivée, puis te l’envoie."),
    S.profile.isAdmin && S.mode === "demo" ? h("button", { class: "btn ghost sm", onclick: () => go("admin", { tab: "authentification" }) }, "Faire le contrôle (démo)") : null);
  if (role === "buyer" && o.status === "done" && !S.reviews.some(r => r.id === o.id)) acts.push(h("button", { class: "btn outline sm", onclick: () => reviewDialog(o) }, "Évaluer le vendeur"));
  const other = role === "buyer" ? o.sellerId : o.buyerId, trk = o.carrier && o.tracking && CARRIERS[o.carrier];
  const ended = ["cancelled", "rejected"].includes(o.status);
  return h("div", { class: "order" },
    h("img", { src: o.thumb || sneakerImg(o.illo || DEFAULT_ILLO), alt: "" }),
    h("div", { class: "grow" },
      h("b", null, o.title), h("div", { class: "small muted" }, `${sz(o.size || "")} EU · ${role === "buyer" ? "vendue par" : "achetée par"} ${nameOf(other)} · ${o.shipLabel} · ${ago(o.createdAt)}`),
      h("div", { class: "small num" }, role === "buyer" ? `Payé ${eur(o.total)}${o.auth ? " · avec vérification" : ""}` : `Tu reçois ${eur(o.price + (o.shipPrice || 0))}${o.shipPrice ? " (paire + frais de port)" : ""}`),
      role === "seller" && o.status === "paid" && o.shipping !== "hand" ? h("div", { class: "small" }, "Envoyer à : ", h("b", null, o.auth ? CFG.authAddress || "l’adresse d’authentification Rebond" : [o.shippingName, o.shippingAddress, o.shippingZip].filter(Boolean).join(", "))) : null,
      trk ? h("div", { class: "small" }, `${trk.label} · ${o.tracking} `, trk.url ? h("a", { class: "track-link", href: trk.url(o.tracking), target: "_blank", rel: "noopener" }, "Suivre le colis") : null) : null,
      !ended ? h("div", { class: "track", "aria-label": `Étape : ${s[idx]}` }, s.map((_, i) => h("i", { class: i <= idx ? "on" : "" }))) : null,
      !ended ? h("div", { class: "xs muted", style: "display:flex;justify-content:space-between;gap:6px;margin-top:4px" }, s.map((x, i) => h("span", { style: i === idx ? "color:var(--ink);font-weight:700" : "" }, x))) : null,
      role === "seller" ? payoutLine(o) : null),
    h("span", { class: "st " + cls }, label),
    acts.length ? h("div", { class: "order-actions" }, acts) : null);
}
function shipDialog(o) {
  if (o.shipping === "hand") { confirmAction(o, "ship", "Paire remise ?", "Confirme que tu as remis la paire à l’acheteur. Il devra ensuite confirmer que tout est conforme."); return; }
  const carrier = h("select", { id: "shipCarrier" }, Object.entries(CARRIERS).map(([k, c]) => h("option", { value: k }, c.label)));
  const tracking = h("input", { id: "shipTracking", maxlength: "40", placeholder: "Numéro de suivi", autocomplete: "off" });
  const msg = h("div", { class: "formmsg err", hidden: true });
  modal(o.auth ? "Envoi à l’authentification" : "Déclarer l’envoi",
    o.auth ? h("p", { class: "small", style: "margin:0" }, "Envoie la paire à : ", h("b", null, CFG.authAddress || "l’adresse d’authentification Rebond"), ". Notre équipe la contrôle puis l’envoie à l’acheteur.") : h("p", { class: "small muted", style: "margin:0" }, "L’acheteur reçoit le lien de suivi."),
    h("label", { class: "field", for: "shipCarrier" }, "Transporteur", carrier), h("label", { class: "field", for: "shipTracking" }, "Numéro de suivi", tracking), msg,
    h("div", { class: "actions-end" }, h("button", { class: "btn ghost", onclick: closeLayer }, "Annuler"),
      h("button", { class: "btn primary", onclick: async () => {
        if (!tracking.value.trim()) { msg.hidden = false; msg.textContent = "Indique le numéro de suivi."; tracking.focus(); return; }
        if (await attempt(() => Api.markShipped(o, carrier.value, tracking.value.trim()), "Envoi enregistré, l’acheteur est prévenu.")) closeLayer();
      } }, "Confirmer l’envoi")));
}
function confirmAction(o, action, title, text) {
  modal(title, h("p", { style: "margin:0" }, text),
    h("div", { class: "actions-end" }, h("button", { class: "btn ghost", onclick: closeLayer }, "Retour"),
      h("button", { class: "btn primary", onclick: async e => {
        e.target.disabled = true;
        const ok = action === "ship" ? await attempt(() => Api.markShipped(o, "", ""), "Remise enregistrée.") : await attempt(() => Api.orderAction(o, action), { confirm: "Merci ! Le vendeur reçoit son argent.", cancel: "Commande annulée, remboursement lancé.", verify: "Paire validée, envoi à l’acheteur.", reject: "Paire refusée, acheteur remboursé." }[action]);
        if (ok) closeLayer(); else e.target.disabled = false;
      } }, "Confirmer")));
}
function reviewDialog(o) {
  let n = 5;
  const pick = h("div", { class: "starpick", role: "radiogroup", "aria-label": "Note" });
  const paint = () => pick.replaceChildren(...[1, 2, 3, 4, 5].map(i => h("button", { type: "button", class: i <= n ? "on" : "", role: "radio", "aria-checked": String(i === n), "aria-label": `${i} étoile${i > 1 ? "s" : ""}`, onclick: () => { n = i; paint(); } }, "★")));
  paint();
  const txt = h("textarea", { id: "rv", maxlength: "400", placeholder: "Envoi rapide, paire conforme…" });
  modal("Évaluer le vendeur", h("p", { class: "muted", style: "margin:0" }, `Comment s’est passée ta commande avec ${nameOf(o.sellerId)} ?`), pick,
    h("label", { class: "field", for: "rv" }, "Commentaire (facultatif)", txt),
    h("div", { class: "actions-end" }, h("button", { class: "btn ghost", onclick: closeLayer }, "Annuler"),
      h("button", { class: "btn primary", onclick: async () => { if (await attempt(() => Api.review(o, n, txt.value.trim()), "Merci pour ton évaluation !")) closeLayer(); } }, "Publier")));
}

/* ---------- Profil membre ---------- */
function pageMember() {
  const id = S.route.id, me = id === S.me, tab = S.route.tab === "evaluations" ? "evaluations" : "dressing";
  const items = S.listings.filter(l => l.sellerId === id && (visible(l) || me)).sort((a, b) => (a.status === "sold") - (b.status === "sold") || b.createdAt - a.createdAt);
  const rs = S.reviews.filter(r => r.sellerId === id).sort((a, b) => b.at - a.at), rt = rating(id);
  const onSale = items.filter(l => l.status === "active").length, sold = items.filter(l => l.status === "sold").length;
  return [
    h("div", { class: "prof" }, avatar(id, 88),
      h("div", { style: "flex:1;min-width:0" }, h("h1", null, me ? `${nameOf(id)} (toi)` : nameOf(id)),
        h("div", { class: "muted" }, rt.n ? [h("span", { class: "stars" }, stars(rt.avg)), ` ${rt.avg.toFixed(1)} · ${rt.n} évaluation${rt.n > 1 ? "s" : ""}`] : "Aucune évaluation pour l’instant"),
        h("div", { class: "small muted" }, [cityOf(id), `${onSale} paire${onSale > 1 ? "s" : ""} en vente`, `${sold} vendue${sold > 1 ? "s" : ""}`].filter(Boolean).join(" · "))),
      me ? h("button", { class: "btn primary", onclick: () => go("sell") }, "Vendre une paire") : null),
    h("div", { class: "tabs", role: "tablist", style: "margin-top:10px" },
      h("button", { role: "tab", "aria-selected": String(tab === "dressing"), onclick: () => go("member", { id, tab: "dressing" }, { replace: true, keepScroll: true }) }, `Dressing (${items.length})`),
      h("button", { role: "tab", "aria-selected": String(tab === "evaluations"), onclick: () => go("member", { id, tab: "evaluations" }, { replace: true, keepScroll: true }) }, `Évaluations (${rs.length})`)),
    tab === "dressing"
      ? (items.length ? grid(items) : h("div", { class: "empty" }, h("h2", null, me ? "Ton dressing est vide" : "Aucune paire en vente"), me ? h("button", { class: "btn primary", onclick: () => go("sell") }, "Mettre une paire en vente") : null))
      : (rs.length ? h("div", { class: "olist" }, rs.map(r => h("div", { class: "order" }, avatar(r.buyerId, 40), h("div", { class: "grow" }, h("div", null, h("b", null, nameOf(r.buyerId)), " ", h("span", { class: "stars" }, stars(r.stars))), r.text ? h("div", { class: "desc" }, r.text) : null, h("div", { class: "xs muted" }, ago(r.at))))))
        : h("div", { class: "empty" }, h("h2", null, "Pas encore d’évaluation"), h("p", { class: "muted", style: "margin:0" }, "Les acheteurs évaluent le vendeur après avoir reçu leur paire.")))];
}

/* ---------- Compte ---------- */
async function startWallet() {
  if (!needAuth()) return;
  await attempt(() => Api.wallet("start"));
}
function pageAccount() {
  if (S.mode === "loading") return loadingState();
  if (S.mode === "live" && !S.me) return signInPrompt("Bienvenue sur Rebond", "Crée ton compte pour vendre, acheter, discuter et suivre tes commandes. C’est gratuit.");
  const earned = S.orders.filter(o => o.sellerId === S.me && o.payoutStatus === "paid").reduce((a, o) => a + o.price + (o.shipPrice || 0), 0);
  const onSale = S.listings.filter(l => l.sellerId === S.me && l.status === "active").length;
  const item = (label, sub, fn) => h("button", { onclick: fn }, h("span", null, label, sub ? h("span", { class: "small muted", style: "display:block;font-weight:500" }, sub) : null), h("span", { class: "muted", "aria-hidden": "true" }, "›"));
  const wallet = S.profile.payoutsReady
    ? h("div", { class: "wallet ok" }, icon("check", "color:var(--good)"), h("div", { class: "grow" }, h("b", null, "Porte-monnaie actif"), h("div", { class: "small" }, "L’argent de tes ventes est versé sur ton compte bancaire via Stripe.")),
        S.mode === "live" ? h("button", { class: "btn ghost sm", onclick: () => attempt(() => Api.wallet("dashboard")) }, "Voir mes virements") : null)
    : h("div", { class: "wallet" }, icon("coin", "color:var(--accent)"), h("div", { class: "grow" }, h("b", null, "Active ton porte-monnaie"), h("div", { class: "small muted" }, "Pour recevoir l’argent de tes ventes. Stripe vérifie ton identité et ton IBAN : Rebond ne voit jamais tes coordonnées bancaires.")),
        h("button", { class: "btn primary sm", onclick: startWallet }, "Activer"));
  return [
    h("div", { class: "prof" }, avatar(S.me || "invite", 64), h("div", null, h("h1", null, nameOf(S.me)), S.email ? h("div", { class: "small muted" }, S.email) : null, h("button", { class: "linkbtn", onclick: () => go("member", { id: S.me }) }, "Voir mon profil public"))),
    h("div", { class: "stats", style: "margin-top:16px" },
      h("div", { class: "stat" }, h("b", { class: "num" }, onSale), h("span", null, "en vente")),
      h("div", { class: "stat" }, h("b", { class: "num" }, S.orders.filter(o => o.sellerId === S.me && !["cancelled", "rejected"].includes(o.status)).length), h("span", null, "vendues")),
      h("div", { class: "stat" }, h("b", { class: "num" }, eur(earned)), h("span", null, "versés"))),
    wallet,
    h("div", { class: "menu" },
      item("Mon dressing", `${onSale} paire${onSale > 1 ? "s" : ""} en vente`, () => go("member", { id: S.me })),
      item("Mes commandes", pendingSales() ? `${pendingSales()} vente${pendingSales() > 1 ? "s" : ""} à expédier` : "Achats et ventes", () => go("orders", { tab: pendingSales() ? "ventes" : "achats" })),
      item("Mes favoris", null, () => go("favs")),
      item("Ma pointure", S.mySize ? `${sz(S.mySize)} EU · toucher pour changer` : "Non renseignée", () => { setSize(""); go("home"); }),
      item("Paramètres du compte", "Pseudo, ville, données personnelles, suppression", () => go("settings")),
      S.profile.isAdmin ? item("Modération", `${S.reports.filter(r => r.status === "open").length} signalement(s) · ${S.orders.filter(o => o.auth && o.status === "shipped").length} paire(s) à authentifier`, () => go("admin")) : null,
      item("Aide, règles et signalement", null, () => { location.href = "legal/regles.html"; }),
      S.mode === "live" ? item("Se déconnecter", null, async () => { await attempt(() => Api.signOut(), "À bientôt !"); go("home", {}, { replace: true }); }) : null)];
}
function pageSettings() {
  if (S.mode === "loading") return loadingState();
  if (S.mode === "live" && !S.me) return signInPrompt("Paramètres", "Connecte-toi pour gérer ton compte.");
  const uname = h("input", { id: "setUser", value: S.profile.username, maxlength: "24", autocomplete: "username" });
  const city = h("input", { id: "setCity", value: S.profile.city || "", maxlength: "60", placeholder: "Ex. Lyon" });
  const msg = h("div", { class: "formmsg", hidden: true });
  const confirmDel = h("input", { id: "delConfirm", placeholder: "Tape SUPPRIMER", autocomplete: "off" });
  return h("div", { class: "form-page" },
    h("h1", null, "Paramètres du compte"),
    h("div", { class: "fcard" },
      h("div", { class: "frow" }, h("label", { for: "setUser" }, "Pseudo"), h("div", null, uname, h("div", { class: "hint" }, "3 à 24 caractères : lettres minuscules, chiffres, point, tiret, underscore."))),
      h("div", { class: "frow" }, h("label", { for: "setCity" }, "Ville"), h("div", null, city, h("div", { class: "hint" }, "Facultatif. Affichée sur ton profil pour les remises en main propre.")))),
    msg,
    h("div", { class: "actions-end" }, h("button", { class: "btn primary", onclick: async () => {
      const u = uname.value.trim().toLowerCase();
      if (!/^[a-z0-9._-]{3,24}$/.test(u)) { msg.hidden = false; msg.className = "formmsg err"; msg.textContent = "Pseudo : 3 à 24 caractères, lettres minuscules, chiffres, point, tiret ou underscore."; return; }
      if (await attempt(() => Api.saveProfile({ username: u, city: city.value.trim() }))) { msg.hidden = false; msg.className = "formmsg ok"; msg.textContent = "Profil enregistré."; }
    } }, "Enregistrer")),
    h("h2", { class: "section-title" }, "Mes données"),
    h("div", { class: "fcard", style: "padding:16px 18px;display:grid;gap:10px" },
      h("p", { style: "margin:0" }, "Télécharge une copie de tes données (profil, annonces, messages, commandes, avis) au format JSON. C’est ton droit d’accès et de portabilité (RGPD)."),
      h("div", null, h("button", { class: "btn ghost", onclick: exportMyData }, "Télécharger mes données")),
      h("p", { class: "small muted", style: "margin:0" }, "Cookies et stockage : ", h("button", { class: "linkbtn", onclick: () => window.RebondConsent?.open() }, "gérer mes choix"), " · ", h("a", { href: "legal/confidentialite.html" }, "politique de confidentialité"))),
    myReports(),
    h("h2", { class: "section-title" }, "Supprimer mon compte"),
    h("div", { class: "danger-zone" },
      h("p", { style: "margin:0" }, "Ton profil, tes annonces, tes photos, tes favoris et tes messages seront supprimés. Les commandes passées sont conservées de façon anonymisée pour nos obligations comptables. Termine d’abord tes commandes en cours."),
      h("label", { class: "field", for: "delConfirm" }, "Pour confirmer, tape SUPPRIMER", confirmDel),
      h("div", null, h("button", { class: "btn danger", onclick: async () => {
        if (confirmDel.value.trim().toUpperCase() !== "SUPPRIMER") { toast("Tape SUPPRIMER pour confirmer."); confirmDel.focus(); return; }
        if (await attempt(() => Api.deleteAccount(), "Ton compte a été supprimé.")) go("home", {}, { replace: true });
      } }, "Supprimer définitivement mon compte"))));
}
function myReports() {
  const rs = S.reports.filter(r => r.reporterId === S.me);
  if (!rs.length) return null;
  const label = { open: ["En cours d’examen", "warn"], actioned: ["Annonce retirée", "good"], dismissed: ["Classé sans suite", ""] };
  return [h("h2", { class: "section-title" }, "Mes signalements"),
    h("div", { class: "olist" }, rs.map(r => h("div", { class: "admin-card" },
      h("div", null, h("span", { class: "reason" }, REASONS[r.reason] || r.reason), " ", h("span", { class: "st " + label[r.status][1] }, label[r.status][0]), " ", h("span", { class: "small muted" }, ago(r.at))),
      h("div", { class: "small" }, L(r.listingId)?.title || "Annonce supprimée"),
      r.decision ? h("div", { class: "small muted" }, "Décision : ", r.decision) : null)))];
}
async function exportMyData() {
  const data = await attempt(() => Api.exportData()); if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = h("a", { href: URL.createObjectURL(blob), download: `rebond-mes-donnees-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- Modération ---------- */
function pageAdmin() {
  if (S.mode === "loading") return loadingState();
  if (!S.profile.isAdmin) return h("div", { class: "empty", style: "margin-top:30px" }, h("h2", null, "Réservé à l’équipe de modération"));
  const tab = S.route.tab || "signalements";
  const open = S.reports.filter(r => r.status === "open"), done = S.reports.filter(r => r.status !== "open");
  const toAuth = S.orders.filter(o => o.auth && o.status === "shipped");
  const T = (id, label) => h("button", { role: "tab", "aria-selected": String(tab === id), onclick: () => go("admin", { tab: id }, { replace: true, keepScroll: true }) }, label);
  const out = [h("h1", { class: "page-h", style: "margin-top:22px" }, "Modération", S.mode === "demo" ? h("span", { class: "demo-pill" }, "Démo") : null),
    h("div", { class: "tabs", role: "tablist" }, T("signalements", `Signalements (${open.length})`), T("authentification", `Authentification (${toAuth.length})`), T("historique", `Historique (${done.length})`))];
  if (tab === "signalements") {
    out.push(open.length ? h("div", { class: "olist" }, open.map(r => {
      const l = L(r.listingId), dec = h("textarea", { "aria-label": "Motif de la décision", placeholder: "Motif de la décision (affiché au vendeur et à l’auteur du signalement)", maxlength: "500" });
      return h("div", { class: "admin-card" },
        h("div", { class: "mini" }, h("img", { src: l ? imgOf(l) : sneakerImg(DEFAULT_ILLO), alt: "" }), h("div", null, h("b", null, l ? l.title : "Annonce supprimée"), h("div", { class: "small muted" }, l ? `${eur(l.price)} · vendue par ${nameOf(l.sellerId)}` : ""), l ? h("button", { class: "linkbtn small", onclick: () => go("item", { id: l.id }) }, "Voir l’annonce") : null)),
        h("div", null, h("span", { class: "reason" }, REASONS[r.reason] || r.reason), " ", h("span", { class: "small muted" }, `signalé par ${nameOf(r.reporterId)} · ${ago(r.at)}`)),
        r.details ? h("p", { class: "desc", style: "margin:0" }, r.details) : null,
        h("label", { class: "field" }, dec),
        h("div", { class: "order-actions" },
          h("button", { class: "btn danger sm", onclick: () => decide(r, true, dec) }, "Retirer l’annonce"),
          h("button", { class: "btn ghost sm", onclick: () => decide(r, false, dec) }, "Classer sans suite")));
    })) : h("div", { class: "empty" }, h("h2", null, "Aucun signalement en attente")));
  } else if (tab === "authentification") {
    out.push(toAuth.length ? h("div", { class: "olist" }, toAuth.map(o => h("div", { class: "admin-card" },
      h("div", { class: "mini" }, h("img", { src: o.thumb || sneakerImg(o.illo || DEFAULT_ILLO), alt: "" }), h("div", null, h("b", null, o.title), h("div", { class: "small muted" }, `${sz(o.size)} EU · ${eur(o.price)} · ${nameOf(o.sellerId)} → ${nameOf(o.buyerId)}`),
        o.tracking ? h("div", { class: "small muted" }, `Colis entrant : ${CARRIERS[o.carrier]?.label || ""} ${o.tracking}`) : null)),
      h("p", { class: "small muted", style: "margin:0" }, "Contrôle : étiquette de taille et SKU, coutures, logo, semelle et marquages, odeur de colle, boîte et papier."),
      h("div", { class: "order-actions" },
        h("button", { class: "btn primary sm", onclick: () => confirmAction(o, "verify", "Paire authentique ?", "La paire est validée et part chez l’acheteur.") }, "Authentique : envoyer à l’acheteur"),
        h("button", { class: "btn danger sm", onclick: () => confirmAction(o, "reject", "Refuser la paire ?", "L’acheteur est remboursé intégralement et l’annonce est retirée. Conserve des photos du contrôle.") }, "Refuser et rembourser"))))) : h("div", { class: "empty" }, h("h2", null, "Aucune paire à authentifier")));
  } else {
    out.push(done.length ? h("div", { class: "olist" }, done.map(r => h("div", { class: "admin-card" },
      h("div", null, h("span", { class: "reason" }, REASONS[r.reason] || r.reason), " ", h("span", { class: "st " + (r.status === "actioned" ? "warn" : "") }, r.status === "actioned" ? "Annonce retirée" : "Classé sans suite"), " ", h("span", { class: "small muted" }, r.handledAt ? ago(r.handledAt) : "")),
      h("div", { class: "small" }, L(r.listingId)?.title || "Annonce supprimée"),
      r.decision ? h("div", { class: "small muted" }, "Motif : ", r.decision) : null))) : h("div", { class: "empty" }, h("h2", null, "Aucune décision pour l’instant")));
  }
  return out;
}
async function decide(r, remove, dec) {
  const d = dec.value.trim();
  if (!d) { toast("Indique le motif de la décision (obligation de transparence)."); dec.focus(); return; }
  await attempt(() => Api.handleReport(r, remove, d), remove ? "Annonce retirée." : "Signalement classé.");
}

/* ---------- Connexion / inscription ---------- */
function openAuth(mode, why) {
  if (S.mode === "demo") { toast("Mode démo : pas besoin de compte, tu es déjà connecté·e."); return; }
  const msg = h("div", { class: "formmsg", hidden: !why }, why || "");
  const show = (text, kind) => { msg.hidden = false; msg.className = "formmsg " + (kind || ""); msg.textContent = text; };
  const email = h("input", { id: "auEmail", type: "email", autocomplete: "email", placeholder: "toi@exemple.fr", maxlength: "120" });
  const pass = h("input", { id: "auPass", type: "password", autocomplete: mode === "signup" || mode === "newpass" ? "new-password" : "current-password", placeholder: mode === "login" ? "" : "8 caractères minimum", minlength: "8" });
  const btn = (label) => h("button", { class: "btn primary block", type: "submit" }, label);
  const link = (label, m) => h("button", { type: "button", class: "linkbtn small", onclick: () => openAuth(m) }, label);
  const run = async (e, fn) => { e.preventDefault(); const b = e.target.querySelector("button[type=submit]"); b.disabled = true; try { await fn(); } catch (err) { show(friendly(err), "err"); } finally { b.disabled = false; } };
  if (mode === "login") {
    modal("Se connecter", h("form", { style: "display:grid;gap:12px", onsubmit: e => run(e, async () => {
      await Api.signIn({ email: email.value.trim(), password: pass.value }); closeLayer(); toast("Content de te revoir !");
    }) }, msg, h("label", { class: "field", for: "auEmail" }, "E-mail", email), h("label", { class: "field", for: "auPass" }, "Mot de passe", pass), btn("Se connecter"),
      h("div", { style: "display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap" }, link("Mot de passe oublié ?", "forgot"), link("Pas de compte ? S’inscrire", "signup"))));
  } else if (mode === "signup") {
    const uname = h("input", { id: "auUser", autocomplete: "username", placeholder: "ex. ines.kicks", maxlength: "24" });
    const adult = h("input", { id: "auAdult", type: "checkbox" }), terms = h("input", { id: "auTerms", type: "checkbox" });
    modal("Créer un compte", h("form", { style: "display:grid;gap:12px", onsubmit: e => run(e, async () => {
      const u = uname.value.trim().toLowerCase();
      if (!/^[a-z0-9._-]{3,24}$/.test(u)) throw uerr("Pseudo : 3 à 24 caractères, lettres minuscules, chiffres, point, tiret ou underscore.");
      if (pass.value.length < 8) throw uerr("Mot de passe trop court : 8 caractères minimum.");
      if (!adult.checked) throw uerr("Rebond est réservé aux personnes majeures (paiements et virements).");
      if (!terms.checked) throw uerr("Accepte les conditions d’utilisation pour créer ton compte.");
      if (Object.values(S.profiles).some(p => p.username === u)) throw uerr("Ce pseudo est déjà pris.");
      await Api.signUp({ email: email.value.trim(), password: pass.value, username: u });
      show(`C’est presque fini : on t’a envoyé un e-mail à ${email.value.trim()}. Clique sur le lien pour activer ton compte.`, "ok");
      e.target.querySelector("button[type=submit]").hidden = true;
    }) }, msg, h("label", { class: "field", for: "auUser" }, "Pseudo", uname), h("label", { class: "field", for: "auEmail" }, "E-mail", email), h("label", { class: "field", for: "auPass" }, "Mot de passe", pass),
      h("label", { class: "check", for: "auAdult" }, adult, h("span", null, "J’ai 18 ans ou plus.")),
      h("label", { class: "check", for: "auTerms" }, terms, h("span", null, "J’accepte les ", h("a", { href: "legal/cgu.html", target: "_blank", rel: "noopener" }, "conditions d’utilisation"), " et j’ai lu la ", h("a", { href: "legal/confidentialite.html", target: "_blank", rel: "noopener" }, "politique de confidentialité"), ".")),
      btn("Créer mon compte"), link("Déjà inscrit·e ? Se connecter", "login")));
  } else if (mode === "forgot") {
    modal("Mot de passe oublié", h("form", { style: "display:grid;gap:12px", onsubmit: e => run(e, async () => {
      await Api.resetPassword(email.value.trim());
      show("Si un compte existe avec cet e-mail, tu vas recevoir un lien pour choisir un nouveau mot de passe.", "ok");
    }) }, msg, h("label", { class: "field", for: "auEmail" }, "E-mail", email), btn("Recevoir le lien"), link("Retour à la connexion", "login")));
  } else if (mode === "newpass") {
    modal("Nouveau mot de passe", h("form", { style: "display:grid;gap:12px", onsubmit: e => run(e, async () => {
      if (pass.value.length < 8) throw uerr("Mot de passe trop court : 8 caractères minimum.");
      await Api.newPassword(pass.value); closeLayer(); toast("Mot de passe modifié.");
    }) }, msg, h("label", { class: "field", for: "auPass" }, "Nouveau mot de passe", pass), btn("Enregistrer")));
  }
}

/* ================= Contenu de démo (mode démo uniquement) ================= */
function demoData() {
  const now = Date.now(), H = 3600e3, W = "#FFFFFF";
  const P = (id, sellerId, o, hrs, likedN, illo) => [id, { sellerId, likedBy: Array.from({ length: likedN }, (_, i) => "d_fan" + i), createdAt: now - hrs * H, illo, demo: true, status: "active", ...o }];
  const listings = Object.fromEntries([
    P("p1", "d_ines", { title: "Nike Dunk Low Panda", brand: "Nike", model: "Dunk Low", style: "lifestyle", size: "40", condition: "Portée 1 à 2 fois", colorway: "Blanc / Noir", color: "Noir", sku: "DD1391-100", box: true, price: 85, description: "Portées deux fois en soirée, aucune pliure. Boîte et lacets d’origine." }, 1, 14, { type: "low", upper: W, overlay: "#1B1B1B", stripe: "#1B1B1B", sole: W, outsole: "#DADADA", lace: W, bg: "#E8EBF0" }),
    P("p2", "d_karim", { title: "Adidas Samba OG blanche", brand: "Adidas", model: "Samba OG", style: "lifestyle", size: "42.5", condition: "Très bon état", colorway: "Blanc / Noir / Gomme", color: "Blanc", sku: "B75806", box: true, price: 68, description: "Semelle gomme propre, un léger pli sur le bout." }, 3, 22, { type: "low", upper: "#F6F4EE", overlay: "#EDE9DF", stripe: "#161616", sole: "#F0EBE0", outsole: "#B57A43", lace: W, bg: "#EFE9E1" }),
    P("p3", "d_lea", { title: "New Balance 550 White Green", brand: "New Balance", model: "550", style: "basket", size: "38", condition: "Neuve (DS)", colorway: "Blanc / Vert", color: "Vert", sku: "BB550WT1", box: true, price: 95, description: "Neuves, jamais portées, mauvaise taille. Facture disponible." }, 5, 9, { type: "low", upper: W, overlay: "#EDEDEA", stripe: "#2F6B45", sole: "#F3F1EA", outsole: "#E2E0D8", lace: W, bg: "#E4EEE7" }),
    P("p4", "d_yanis", { title: "Jordan 1 Mid Chicago", brand: "Jordan", model: "Air Jordan 1 Mid", style: "basket", size: "44", condition: "Très bon état", colorway: "Blanc / Rouge / Noir", color: "Rouge", box: false, price: 110, description: "Portées une saison. Col légèrement marqué. Sans boîte." }, 7, 31, { type: "high", upper: W, overlay: "#C8102E", stripe: "#161616", sole: W, outsole: "#C8102E", lace: W, bg: "#F3E3E3" }),
    P("p5", "d_tom", { title: "Asics Gel-1130 argent", brand: "Asics", model: "Gel-1130", style: "running", size: "42", condition: "Portée 1 à 2 fois", colorway: "Blanc / Argent pur", color: "Gris", sku: "1201A256-114", box: true, price: 72, description: "Très confortables, trop petites pour moi." }, 10, 17, { type: "runner", upper: "#E6E8EB", overlay: "#B7BEC7", stripe: "#23395B", sole: "#F3F2EE", outsole: "#8E96A1", lace: "#F1F1F1", bg: "#E6EAF0" }),
    P("p6", "d_karim", { title: "Salomon XT-6 noire", brand: "Salomon", model: "XT-6", style: "outdoor", size: "43", condition: "Bon état", colorway: "Noir / Phantom", color: "Noir", box: false, price: 98, description: "Utilisées en ville, semelle encore très bonne." }, 14, 12, { type: "runner", upper: "#2A2B2E", overlay: "#18191B", stripe: "#6A6F77", sole: "#1F2023", outsole: "#101113", lace: "#3A3C40", bg: "#DADDE2" }),
    P("p7", "d_lea", { title: "Vans Old Skool noire", brand: "Vans", model: "Old Skool", style: "skate", size: "39", condition: "Bon état", colorway: "Noir / Blanc", color: "Noir", box: false, price: 25, description: "Skatées quelques mois, toile intacte." }, 20, 4, { type: "low", upper: "#1C1C1C", overlay: "#262626", stripe: W, sole: W, outsole: "#1C1C1C", lace: "#1C1C1C", bg: "#E9E6E1" }),
    P("p8", "d_ines", { title: "New Balance 9060 Rain Cloud", brand: "New Balance", model: "9060", style: "running", size: "41", condition: "Très bon état", colorway: "Gris / Beige", color: "Gris", sku: "U9060GRY", box: true, price: 105, description: "Portées 5 fois. Aucun défaut." }, 26, 19, { type: "runner", upper: "#C9C6BF", overlay: "#A9A59C", stripe: "#E7E3DA", sole: "#EFEAE0", outsole: "#8B877F", lace: "#E9E6DF", bg: "#EEEAE4" }),
    P("p9", "d_yanis", { title: "Converse Chuck 70 Hi noire", brand: "Converse", model: "Chuck 70", style: "lifestyle", size: "45", condition: "Très bon état", colorway: "Noir / Parchemin", color: "Noir", box: true, price: 45, description: "Toile épaisse, semelle crème. Très peu portées." }, 34, 7, { type: "high", upper: "#1A1A1A", overlay: "#232323", stripe: "#232323", sole: "#EFE6CF", outsole: "#2A2A2A", lace: "#EFE6CF", bg: "#E7E2D7" }),
    P("p10", "d_tom", { title: "Nike Pegasus 40 bleue", brand: "Nike", model: "Pegasus 40", style: "running", size: "44.5", condition: "Bon état", colorway: "Bleu / Blanc", color: "Bleu", box: false, price: 48, description: "Environ 200 km. Idéales pour débuter." }, 48, 3, { type: "runner", upper: "#2F5BD3", overlay: "#264AB0", stripe: W, sole: W, outsole: "#1E2A4A", lace: W, bg: "#E3EAF7" }),
    P("p11", "d_karim", { title: "Adidas Gazelle verte", brand: "Adidas", model: "Gazelle", style: "lifestyle", size: "42", condition: "Neuve (DS)", colorway: "Vert / Blanc / Gomme", color: "Vert", sku: "IG0669", box: true, price: 79, description: "Neuves avec étiquettes." }, 60, 11, { type: "low", upper: "#2E7D4F", overlay: "#276B43", stripe: W, sole: "#F0EBE0", outsole: "#B57A43", lace: W, bg: "#E4EEE7" }),
    P("p12", "d_lea", { title: "Nike Air Max 90 enfant", brand: "Nike", model: "Air Max 90", style: "enfant", size: "32", condition: "Très bon état", colorway: "Blanc / Rose", color: "Rose", box: false, price: 30, description: "Taille enfant, portées une saison." }, 72, 2, { type: "runner", upper: W, overlay: "#F2B7C9", stripe: "#E0708F", sole: W, outsole: "#E0708F", lace: W, bg: "#F6E6EC" }),
    P("p13", "d_ines", { title: "Nike Dunk Low Panda", brand: "Nike", model: "Dunk Low", style: "lifestyle", size: "42", condition: "Bon état", colorway: "Blanc / Noir", color: "Noir", box: false, price: 70, description: "Plis sur le bout, semelle propre." }, 90, 6, { type: "low", upper: W, overlay: "#1B1B1B", stripe: "#1B1B1B", sole: W, outsole: "#DADADA", lace: W, bg: "#E8EBF0" }),
    P("p14", "d_yanis", { title: "Jordan 4 Retro Military Black", brand: "Jordan", model: "Air Jordan 4", style: "basket", size: "43", condition: "Portée 1 à 2 fois", colorway: "Blanc / Noir / Gris", color: "Blanc", box: true, price: 190, description: "Vendue.", status: "sold" }, 120, 40, { type: "high", upper: W, overlay: "#8C9199", stripe: "#161616", sole: W, outsole: "#161616", lace: W, bg: "#E8EBF0" }),
  ]);
  const reviews = {
    r1: { sellerId: "d_ines", buyerId: "d_tom", stars: 5, text: "Envoi le lendemain, paire nickel et bien emballée.", at: now - 80 * H },
    r2: { sellerId: "d_karim", buyerId: "d_lea", stars: 4, text: "Conforme à la description.", at: now - 100 * H },
    r3: { sellerId: "d_yanis", buyerId: "d_ines", stars: 5, text: "Authentifiée, rien à redire.", at: now - 140 * H },
    r4: { sellerId: "d_ines", buyerId: "d_yanis", stars: 5, text: "", at: now - 200 * H },
  };
  const reports = { rp1: { reporterId: "d_tom", listingId: "p6", reason: "contrefacon", details: "Le logo sur la languette ne ressemble pas à celui des vraies XT-6.", status: "open", at: now - 5 * H } };
  return { profile: { username: "toi", city: "", isAdmin: true, payoutsReady: false }, listings, photos: {}, orders: {}, threads: {}, reviews, reports, mySize: "", seen: {} };
}

/* ================= Démarrage ================= */
document.addEventListener("click", e => {
  const g = e.target.closest("[data-go]"); if (!g) return;
  const n = g.dataset.go;
  if (n === "catalog") browse({ q: S.f.q });
  else if (n === "orders") go("orders", { tab: pendingSales() ? "ventes" : "achats" });
  else go(n);
});
$("#logo").addEventListener("click", () => go("home"));
$("#loginBtn").addEventListener("click", () => openAuth("login"));
$("#cookieBtn").addEventListener("click", () => window.RebondConsent?.open());
let qT; $("#q").addEventListener("input", e => { clearTimeout(qT); qT = setTimeout(() => { const v = e.target.value; if (S.route.name !== "catalog") { S.f = { ...blankFilters(), q: v }; go("catalog"); $("#q").focus(); } else setF({ q: v }); }, 220); });

async function boot() {
  S.route = fromHash(location.hash);
  render();
  try { await Api.start(); }
  catch (e) { console.error(e); Api = Demo; toast("Connexion au serveur impossible : passage en mode démo."); await Demo.start(); }
  $("#loadingBar").hidden = true;
  $("#modeNote").textContent = S.mode === "live"
    ? `Besoin d’aide ? Écris-nous à ${CONTACT}.`
    : "Mode démo : les données restent dans ce navigateur, les annonces « Exemple » sont fictives et le paiement est simulé.";
  // Retours de Stripe et des e-mails de connexion
  const qs = new URLSearchParams(location.search);
  const clean = () => history.replaceState(null, "", location.pathname + toHash(S.route));
  if (/error_description=/.test(location.hash)) { const d = new URLSearchParams(location.hash.slice(1)).get("error_description"); toast(d && /expired/i.test(d) ? "Ce lien a expiré. Demande-en un nouveau." : "Ce lien n’est plus valide."); S.route = { name: "home" }; clean(); }
  if (/access_token=/.test(location.hash)) { S.route = { name: "home" }; clean(); toast("Ton compte est activé. Bienvenue sur Rebond !"); }
  if (qs.get("checkout") === "success") { S.route = { name: "orders", tab: "achats" }; clean(); toast("Paiement confirmé ! Ta commande apparaît dans quelques secondes."); }
  else if (qs.get("checkout") === "cancel") { S.route = qs.get("listing") ? { name: "item", id: qs.get("listing") } : { name: "home" }; clean(); toast("Paiement annulé. La paire reste réservée pour toi 30 minutes."); }
  else if (qs.get("wallet") === "return") { S.route = { name: "account" }; clean(); const r = await attempt(() => Api.wallet("status")); if (r) toast(r.ready ? "Porte-monnaie activé ! Tu recevras l’argent de tes ventes." : "Il manque encore des informations à Stripe pour activer ton porte-monnaie."); }
  else if (qs.get("wallet") === "refresh") { clean(); startWallet(); }
  else if (qs.toString()) clean();
  S.built = ""; render();
}
boot();

if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
