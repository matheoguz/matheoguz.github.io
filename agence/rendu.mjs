// Rendu HTML des sites clients (page d'accueil + mentions légales).
// Design : voir ../Repos-/cerveau/Agence/Style de l'agence.md et Repos-/taste-skill (règles anti « site fait par une IA »).

import { THEMES } from './themes.mjs';
import { banquePour, unsplash } from './photos.mjs';

export const PORTFOLIO = 'https://matheoguz.github.io/sites/';
const ICONES = 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css';

// Les tirets longs sont remplacés partout : c'est la signature n°1 d'un texte écrit par une IA.
const propre = (s) => String(s ?? '').replace(/\s*[—–]\s*/g, ' - ');
export const esc = (s) => propre(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function telHref(tel) {
  let d = String(tel || '').replace(/[^\d+]/g, '');
  if (d.startsWith('00')) d = '+' + d.slice(2);
  if (/^0\d{9}$/.test(d)) d = '+33' + d.slice(1);
  return d;
}

const mapsHref = (b) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${b.nom} ${b.adresse || ''} ${b.code_postal || ''} ${b.ville || ''}`.trim());

// Photos : celles du client d'abord, sinon la banque du métier.
function photosPour(b) {
  const banque = banquePour(b) || {};
  const p = b.photos || {};
  const img = (v, w) => (typeof v === 'string' ? { src: v, alt: '' } : v?.src ? v : v?.id ? { src: unsplash(v.id, w), alt: v.alt } : null);
  return {
    hero: img(p.hero, 1600) || img(banque.hero, 1600),
    about: img(p.about, 1200) || img(banque.about, 1200),
    galerie: (p.galerie?.length ? p.galerie : banque.galerie || []).map((g) => img(g, 1200)).filter(Boolean),
  };
}

function tokens(t, b) {
  const light = { ...t.light, ...(b.couleurs?.accent ? { accent: b.couleurs.accent, onAccent: b.couleurs.onAccent || '#ffffff' } : {}) };
  const decl = (c) => Object.entries(c).map(([k, v]) => `--${k}:${v}`).join(';');
  const dark = { ...t.dark, ...(b.couleurs?.accentSombre ? { accent: b.couleurs.accentSombre, onAccent: b.couleurs.onAccentSombre || '#111111' } : {}) };
  return `:root{${decl(light)};--head:${t.head};--body:${t.body};color-scheme:light dark}
@media(prefers-color-scheme:dark){:root{${decl(dark)}}}`;
}

const CSS = `*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:var(--body);background:var(--bg);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased;font-size:1rem}
h1,h2,h3{font-family:var(--head);font-weight:700;line-height:1.1;letter-spacing:-.02em;text-wrap:balance}
p{text-wrap:pretty}
a{color:inherit}
img{display:block;width:100%;height:100%;object-fit:cover}
.wrap{width:min(1180px,100% - 40px);margin:0 auto}
.preview{background:var(--ink);color:var(--bg);text-align:center;font-size:.8rem;padding:8px 16px}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--onAccent);text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:600;font-size:.95rem;border:0;cursor:pointer;font-family:var(--body);white-space:nowrap;transition:transform .15s,opacity .15s}
.btn:hover{opacity:.92}
.btn:active{transform:scale(.98)}
.btn.line{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--line)}
.btn.line:hover{box-shadow:inset 0 0 0 1.5px var(--ink)}
.btn i{font-size:1.15em}
header.nav{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
header.nav .wrap{display:flex;align-items:center;justify-content:space-between;gap:24px;height:68px}
.logo{font-family:var(--head);font-weight:700;font-size:1.2rem;text-decoration:none;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
header.nav nav{display:flex;gap:28px;font-size:.92rem;color:var(--muted)}
header.nav nav a{text-decoration:none}
header.nav nav a:hover{color:var(--ink)}
.hero{padding:48px 0 56px}
.hero .wrap{display:grid;grid-template-columns:1.05fr 1fr;gap:56px;align-items:center}
.eyebrow{font-size:.85rem;font-weight:600;color:var(--accent);margin-bottom:18px}
.hero h1{font-size:clamp(2rem,3.2vw,2.9rem)}
.hero p.sub{font-size:1.15rem;color:var(--muted);margin:22px 0 32px;max-width:46ch}
.actions{display:flex;gap:12px;flex-wrap:wrap}
.hero figure{aspect-ratio:4/5;max-height:640px;border-radius:16px;overflow:hidden;background:var(--surface)}
.faits{border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.faits .wrap{display:grid;grid-template-columns:repeat(3,1fr)}
.faits div{display:flex;gap:14px;align-items:flex-start;padding:24px 24px 24px 0}
.faits div+div{border-left:1px solid var(--line);padding-left:24px}
.faits i{font-size:1.4rem;color:var(--accent);margin-top:2px}
.faits b{display:block;font-size:.95rem}
.faits span,.faits a{font-size:.92rem;color:var(--muted);text-decoration:none}
section{padding:96px 0}
h2{font-size:clamp(1.9rem,3.4vw,2.7rem);margin-bottom:20px}
.lead{color:var(--muted);max-width:60ch;font-size:1.05rem}
.apropos .wrap{display:grid;grid-template-columns:.9fr 1.1fr;gap:72px;align-items:center}
.apropos figure{aspect-ratio:1;border-radius:16px;overflow:hidden;background:var(--surface)}
.apropos p{color:var(--muted);margin-bottom:16px;max-width:60ch}
.forts{list-style:none;display:grid;gap:12px;margin-top:28px}
.forts li{display:flex;gap:12px;align-items:center;font-weight:500}
.forts i{color:var(--accent);font-size:1.25rem}
.services{background:var(--surface);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.groupes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:48px 64px;margin-top:48px}
.groupes h3{font-size:1.2rem;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.item{display:flex;justify-content:space-between;align-items:baseline;gap:20px;padding:9px 0}
.item b{font-weight:600}
.item span{display:block;font-size:.88rem;color:var(--muted)}
.item .prix{font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums}
.note{margin-top:40px;font-size:.92rem;color:var(--muted)}
.galerie{display:grid;gap:14px;margin-top:40px;grid-auto-rows:260px}
.galerie figure{border-radius:16px;overflow:hidden;background:var(--surface)}
.galerie.n1{grid-template-columns:1fr;grid-auto-rows:460px}
.galerie.n2{grid-template-columns:1fr 1fr;grid-auto-rows:420px}
.galerie.n3{grid-template-columns:2fr 1fr}.galerie.n3 figure:first-child{grid-row:span 2}
.galerie.n4{grid-template-columns:2fr 1fr 1fr}.galerie.n4 figure:first-child{grid-row:span 2}.galerie.n4 figure:nth-child(4){grid-column:span 2}
.galerie.n5,.galerie.n6{grid-template-columns:repeat(3,1fr)}.galerie.n5 figure:first-child{grid-row:span 2}
.avis .wrap{display:grid;grid-template-columns:1.3fr 1fr;gap:64px;align-items:start}
.note-google{display:flex;align-items:baseline;gap:10px;margin-bottom:28px;color:var(--muted)}
.note-google b{font-family:var(--head);font-size:3rem;color:var(--ink);line-height:1}
blockquote.une p{font-family:var(--head);font-size:clamp(1.5rem,2.6vw,2.1rem);line-height:1.25;letter-spacing:-.01em;font-weight:500}
blockquote footer,.autres footer{margin-top:16px;font-size:.92rem;color:var(--muted)}
blockquote footer b,.autres footer b{color:var(--ink);font-weight:600}
.autres{display:grid;gap:32px;padding-top:12px}
.autres blockquote{padding-left:20px;border-left:2px solid var(--accent)}
.autres p{color:var(--ink)}
.stars{color:var(--accent);letter-spacing:2px;font-size:.9rem;margin-bottom:10px}
.contact{border-top:1px solid var(--line)}
.contact .wrap{display:grid;grid-template-columns:1fr 1.1fr;gap:72px}
.contact dl{display:grid;gap:28px;margin-top:32px}
.contact dt{display:flex;gap:10px;align-items:center;font-weight:600}
.contact dt i{color:var(--accent);font-size:1.2rem}
.contact dd{color:var(--muted);margin-top:6px;padding-left:30px}
.contact dd a{color:var(--ink)}
form{display:grid;gap:18px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:32px}
form h3{font-size:1.3rem}
label{display:grid;gap:8px;font-size:.92rem;font-weight:500}
input,textarea{font:inherit;font-size:1rem;padding:13px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}
input:focus,textarea:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:transparent}
textarea{min-height:130px;resize:vertical}
.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
footer.pied{border-top:1px solid var(--line);padding:32px 0;font-size:.88rem;color:var(--muted)}
footer.pied .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
footer.pied a{color:var(--muted)}
.legal{padding:64px 0 96px}
.legal h1{font-size:clamp(2rem,4vw,2.8rem);margin-bottom:40px}
.legal h2{font-size:1.15rem;margin:36px 0 10px}
.legal p{color:var(--muted);max-width:68ch}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@media(max-width:900px){
  header.nav nav{display:none}
  .hero{padding:28px 0 40px}
  .hero .wrap,.apropos .wrap,.avis .wrap,.contact .wrap{grid-template-columns:1fr;gap:36px}
  .hero figure{aspect-ratio:4/3}
  .faits .wrap{grid-template-columns:1fr}
  .faits div{padding:18px 0}.faits div+div{border-left:0;border-top:1px solid var(--line);padding-left:0}
  section{padding:72px 0}
  .apropos figure{aspect-ratio:4/3}
  .galerie,.galerie.n1,.galerie.n2,.galerie.n3,.galerie.n4,.galerie.n5,.galerie.n6{grid-template-columns:1fr 1fr;grid-auto-rows:180px}
  .galerie figure:first-child{grid-column:span 2;grid-row:span 1}
  .galerie.n4 figure:nth-child(4){grid-column:span 1}
  .row{grid-template-columns:1fr}
  form{padding:22px}
}
@media(max-width:420px){header.nav .btn{padding:10px 16px;font-size:.88rem}.logo{font-size:1rem}header.nav .wrap{gap:12px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}`;

function head(b, t, { title, description, noindex, jsonld, image }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
${image ? `<meta property="og:image" content="${esc(image)}">\n` : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${t.fonts}&display=swap" rel="stylesheet">
<link href="${ICONES}" rel="stylesheet">
<style>
${tokens(t, b)}
${CSS}
</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>\n` : ''}</head>`;
}

const formulaire = (b) => b.formule !== 'essentiel' && Boolean(b.email);
const estApercu = (suivi) => !['livre', 'paye'].includes(suivi?.statut);
const bandeau = '<div class="preview">Aperçu de votre futur site, en attente de votre validation</div>\n';
const figure = (p, extra = '', eager = false) => (p ? `<figure${extra}><img src="${esc(p.src)}" alt="${esc(p.alt || '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></figure>` : '');
const reseauIcone = { instagram: 'ph-instagram-logo', facebook: 'ph-facebook-logo', tiktok: 'ph-tiktok-logo', linkedin: 'ph-linkedin-logo' };

export function renderIndex(b, suivi) {
  const t = THEMES[b.theme];
  const L = { ...t.labels, ...(b.libelles || {}) };
  const tel = telHref(b.telephone);
  const cta = b.cta?.texte || L.cta;
  const ctaHref = b.cta?.lien || (tel ? `tel:${tel}` : '#contact');
  const ph = photosPour(b);
  const groupes = (b.services?.groupes || [])
    .map((g) => ({ ...g, items: (g.items || []).filter((i) => i.nom) }))
    .filter((g) => g.nom && g.items.length);
  const avis = (b.avis || []).filter((a) => a.texte);
  const galerie = ph.galerie.length >= 2 ? ph.galerie.slice(0, 6) : [];
  const contactForm = formulaire(b);
  const servicesTitre = b.services?.titre || L.services;
  const ville = [b.code_postal, b.ville].filter(Boolean).join(' ');

  const liens = [
    b.histoire?.length && ['#apropos', L.about],
    groupes.length && ['#services', b.services?.menu || servicesTitre.split(/\s+(?:et|&)\s+/)[0]],
    galerie.length && ['#photos', 'Photos'],
    avis.length && ['#avis', 'Avis'],
    ['#contact', 'Contact'],
  ].filter(Boolean);

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': b.schema_type || 'LocalBusiness',
    name: b.nom,
    description: b.description_seo || b.accroche,
    telephone: tel || undefined,
    email: b.email || undefined,
    address: b.adresse ? { '@type': 'PostalAddress', streetAddress: b.adresse, addressLocality: b.ville, postalCode: b.code_postal, addressCountry: 'FR' } : undefined,
    openingHours: b.horaires_schema || undefined,
    url: b.url || undefined,
    image: ph.hero?.src,
    aggregateRating: b.note_google && b.nb_avis_google ? { '@type': 'AggregateRating', ratingValue: String(b.note_google).replace(',', '.'), reviewCount: b.nb_avis_google } : undefined,
  };

  const title = b.titre_seo || `${b.nom} | ${b.activite}${b.ville ? ' à ' + b.ville : ''}`;
  const description = b.description_seo || b.accroche;
  const [une, ...autres] = avis;
  const auteur = (a) => `<footer><b>${esc(a.auteur)}</b>${a.source ? `, ${esc(a.source)}` : ''}</footer>`;

  return `${head(b, t, { title, description, noindex: estApercu(suivi), jsonld, image: ph.hero?.src })}
<body>
${estApercu(suivi) ? bandeau : ''}<header class="nav"><div class="wrap">
  <a href="#" class="logo">${esc(b.nom)}</a>
  <nav aria-label="Sections">${liens.map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join('')}</nav>
  <a href="${esc(ctaHref)}" class="btn">${esc(cta)}</a>
</div></header>

<main>
<section class="hero" aria-label="Présentation"><div class="wrap">
  <div>
    <p class="eyebrow">${esc(b.activite)}${b.ville ? ' à ' + esc(b.ville) : ''}</p>
    <h1>${esc(b.slogan)}</h1>
    <p class="sub">${esc(b.accroche)}</p>
    <div class="actions"><a href="${esc(ctaHref)}" class="btn"><i class="ph ph-phone" aria-hidden="true"></i>${esc(cta)}</a>${groupes.length ? `<a href="#services" class="btn line">${esc(servicesTitre)}</a>` : ''}</div>
  </div>
  ${figure(ph.hero, '', true)}
</div></section>

<div class="faits"><div class="wrap">
${b.adresse ? `  <div><i class="ph ph-map-pin" aria-hidden="true"></i><p><b>${esc(b.adresse)}</b><a href="${esc(mapsHref(b))}" target="_blank" rel="noopener">${esc(ville)}, voir l'itinéraire</a></p></div>\n` : ''}${b.horaires?.length ? `  <div><i class="ph ph-clock" aria-hidden="true"></i><p><b>Horaires</b><span>${b.horaires.filter((h) => !/ferm/i.test(h)).map(esc).join('<br>')}</span></p></div>\n` : ''}${b.telephone ? `  <div><i class="ph ph-phone" aria-hidden="true"></i><p><b>${esc(b.telephone)}</b><a href="tel:${tel}">Appeler maintenant</a></p></div>\n` : b.email ? `  <div><i class="ph ph-envelope-simple" aria-hidden="true"></i><p><b>E-mail</b><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></p></div>\n` : ''}</div></div>
${b.histoire?.length ? `
<section id="apropos" class="apropos"><div class="wrap">
  ${figure(ph.about)}
  <div>
    <h2>${esc(b.histoire_titre || L.about)}</h2>
    ${b.histoire.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
${b.points_forts?.length ? `    <ul class="forts">${b.points_forts.map((p) => `<li><i class="ph ph-check-circle" aria-hidden="true"></i>${esc(p)}</li>`).join('')}</ul>\n` : ''}  </div>
</div></section>
` : ''}${groupes.length ? `
<section id="services" class="services"><div class="wrap">
  <h2>${esc(servicesTitre)}</h2>
  <div class="groupes">
${groupes.map((g) => `    <div>
      <h3>${esc(g.nom)}</h3>
${g.items.map((i) => `      <div class="item"><div><b>${esc(i.nom)}</b>${i.detail ? `<span>${esc(i.detail)}</span>` : ''}</div>${i.prix ? `<div class="prix">${esc(i.prix)}</div>` : ''}</div>`).join('\n')}
    </div>`).join('\n')}
  </div>
${b.services?.note ? `  <p class="note">${esc(b.services.note)}</p>\n` : ''}</div></section>
` : ''}${galerie.length ? `
<section id="photos"><div class="wrap">
  <h2>${esc(b.galerie_titre || 'En images')}</h2>
  <div class="galerie n${galerie.length}">${galerie.map((g) => figure(g)).join('')}</div>
</div></section>
` : ''}${une ? `
<section id="avis" class="avis"><div class="wrap">
  <div>
    ${b.note_google ? `<p class="note-google"><b>${esc(b.note_google)}</b>sur 5 sur Google${b.nb_avis_google ? `, ${esc(b.nb_avis_google)} avis` : ''}</p>` : '<h2>Ce que disent nos clients</h2>'}
    <blockquote class="une"><div class="stars" aria-label="${une.note || 5} étoiles sur 5">${'★'.repeat(une.note || 5)}</div><p>“${esc(une.texte)}”</p>${auteur(une)}</blockquote>
  </div>
${autres.length ? `  <div class="autres">${autres.slice(0, 3).map((a) => `<blockquote><p>“${esc(a.texte)}”</p>${auteur(a)}</blockquote>`).join('')}</div>\n` : ''}</div></section>
` : ''}
<section id="contact" class="contact"><div class="wrap">
  <div>
    <h2>${esc(b.contact_titre || 'Nous rendre visite')}</h2>
    <dl>
${b.adresse ? `      <div><dt><i class="ph ph-map-pin" aria-hidden="true"></i>Adresse</dt><dd>${esc(b.adresse)}, ${esc(ville)}<br><a href="${esc(mapsHref(b))}" target="_blank" rel="noopener">Ouvrir dans Google Maps</a></dd></div>\n` : ''}${b.horaires?.length ? `      <div><dt><i class="ph ph-clock" aria-hidden="true"></i>Horaires</dt><dd>${b.horaires.map(esc).join('<br>')}</dd></div>\n` : ''}      <div><dt><i class="ph ph-phone" aria-hidden="true"></i>Contact</dt><dd>${[b.telephone && `<a href="tel:${tel}">${esc(b.telephone)}</a>`, b.email && `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>`].filter(Boolean).join('<br>')}</dd></div>
${b.reseaux && Object.keys(b.reseaux).length ? `      <div><dt><i class="ph ph-share-network" aria-hidden="true"></i>Réseaux</dt><dd>${Object.entries(b.reseaux).map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener"><i class="ph ${reseauIcone[k] || 'ph-link'}" aria-hidden="true"></i> ${esc(k[0].toUpperCase() + k.slice(1))}</a>`).join('<br>')}</dd></div>\n` : ''}    </dl>
  </div>
${contactForm ? `  <form action="https://formsubmit.co/${esc(b.email)}" method="post">
    <input type="hidden" name="_subject" value="Nouveau message depuis le site ${esc(b.nom)}">
    <input type="hidden" name="_template" value="table">
    <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">
    <h3>Écrivez-nous</h3>
    <div class="row"><label>Nom<input name="nom" required autocomplete="name"></label><label>Téléphone<input name="telephone" type="tel" autocomplete="tel"></label></div>
    <label>E-mail<input name="email" type="email" required autocomplete="email"></label>
    <label>Message<textarea name="message" required></textarea></label>
    <button class="btn" type="submit">Envoyer le message</button>
  </form>\n` : `  ${figure(galerie[0] || ph.about)}\n`}</div></section>
</main>

<footer class="pied"><div class="wrap">
  <span>© ${new Date().getFullYear()} ${esc(b.nom)}</span>
  <span><a href="mentions-legales.html">Mentions légales</a> · Site réalisé par <a href="${PORTFOLIO}" target="_blank" rel="noopener">Matheo Guzzi</a></span>
</div></footer>
</body>
</html>
`;
}

export function renderLegal(b, suivi) {
  const t = THEMES[b.theme];
  const l = b.legal || {};
  const ville = [b.code_postal, b.ville].filter(Boolean).join(' ');
  const photosUnsplash = JSON.stringify(photosPour(b)).includes('images.unsplash.com');
  return `${head(b, t, { title: `Mentions légales | ${b.nom}`, description: `Mentions légales du site de ${b.nom}.`, noindex: true })}
<body>
${estApercu(suivi) ? bandeau : ''}<header class="nav"><div class="wrap"><a href="index.html" class="logo">${esc(b.nom)}</a><a href="index.html" class="btn line">Retour au site</a></div></header>
<main class="legal"><div class="wrap">
  <h1>Mentions légales</h1>
  <h2>Éditeur du site</h2>
  <p>${esc(l.raison_sociale || b.nom)}${l.forme ? `, ${esc(l.forme)}` : ''}<br>
  Responsable de la publication : ${esc(l.responsable || 'À COMPLÉTER')}<br>
  ${b.adresse ? `${esc(b.adresse)}, ${esc(ville)}<br>` : ''}
  SIRET : ${esc(l.siret || 'À COMPLÉTER')}<br>
  ${[b.telephone && 'Téléphone : ' + esc(b.telephone), b.email && 'E-mail : ' + esc(b.email)].filter(Boolean).join('<br>')}</p>
  <h2>Hébergement</h2>
  <p>${esc(l.hebergeur || 'GitHub Pages, GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (pages.github.com)')}</p>
  <h2>Conception</h2>
  <p>Site conçu et réalisé par Matheo Guzzi (${PORTFOLIO}).</p>
  <h2>Propriété intellectuelle</h2>
  <p>Les textes, logos et photographies de ce site appartiennent à ${esc(b.nom)} ou sont utilisés avec autorisation. Certaines photos proviennent d'Unsplash (licence libre, usage commercial autorisé). Toute reproduction sans accord est interdite.</p>
  <h2>Données personnelles</h2>
  <p>Ce site ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience. Pour afficher les polices et les icônes, votre navigateur contacte Google Fonts et unpkg.com${photosUnsplash ? ', et images.unsplash.com pour les photos' : ''}, qui reçoivent alors votre adresse IP.${formulaire(b) ? " Le formulaire de contact est transmis par e-mail via le service FormSubmit (formsubmit.co)." : ''} Les informations que vous envoyez servent uniquement à répondre à votre demande et ne sont ni vendues ni utilisées à d'autres fins. Vous pouvez demander leur suppression à tout moment${b.email ? ' à ' + esc(b.email) : ''}.</p>
</div></main>
<footer class="pied"><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(b.nom)}</span></div></footer>
</body>
</html>
`;
}
