#!/usr/bin/env node
// Outil de l'agence : crée, vérifie et suit les sites des clients.
//
//   node agence/agence.mjs nouveau <slug>            crée clients/<slug>/ avec un brief vide
//   node agence/agence.mjs build <slug>              génère le site depuis brief.json
//   node agence/agence.mjs verifier <slug>           contrôle qualité (+ captures si Playwright)
//   node agence/agence.mjs statut <slug> <etape> [note]   avance le client dans le pipeline
//   node agence/agence.mjs index                     met à jour clients/index.json (cockpit)
//
// Aucune dépendance : Node 18+ suffit. Playwright est utilisé s'il est installé.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { THEMES } from './themes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLIENTS = path.join(ROOT, 'clients');
const PORTFOLIO = 'https://matheoguz.github.io/sites/';

export const ETAPES = {
  brief: 'Brief reçu',
  build: 'En construction',
  verification: 'En vérification',
  apercu: 'Aperçu envoyé',
  modifs: 'Modifications',
  livre: 'Livré',
  paye: 'Payé',
};

const today = () => new Date().toISOString().slice(0, 10);
const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJSON = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
const dir = (slug) => path.join(CLIENTS, slug);

function fail(msg) {
  console.error('✗ ' + msg);
  process.exit(1);
}

function needClient(slug) {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) fail('slug invalide (minuscules, chiffres et tirets) : ' + slug);
  if (!fs.existsSync(path.join(dir(slug), 'brief.json'))) fail(`clients/${slug}/brief.json introuvable`);
}

// ---------- helpers HTML ----------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nl = (s) => esc(s).replace(/\n/g, '<br>');

export function telHref(tel) {
  let d = String(tel || '').replace(/[^\d+]/g, '');
  if (d.startsWith('00')) d = '+' + d.slice(2);
  if (/^0\d{9}$/.test(d)) d = '+33' + d.slice(1);
  return d;
}

function mapsHref(b) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${b.nom} ${b.adresse || ''} ${b.ville || ''}`.trim());
}

function css(t, c) {
  return `*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:${c.bg};--ink:${c.ink};--accent:${c.accent};--accent2:${c.accent2};--muted:${c.muted};--card:${c.card};--head:${t.head};--body:${t.body}}
html{scroll-behavior:smooth}
body{font-family:var(--body);background:var(--bg);color:var(--ink);line-height:1.7;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:var(--head);font-weight:700;line-height:1.15;letter-spacing:-.01em}
a{color:inherit}
img{display:block;width:100%;height:100%;object-fit:cover}
.preview{background:var(--ink);color:#fff;text-align:center;font-size:.8rem;padding:.45rem 1rem}
nav{position:sticky;top:0;z-index:10;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.9rem 5vw;background:color-mix(in srgb,var(--bg) 94%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid rgba(0,0,0,.07)}
.logo{font-family:var(--head);font-size:1.25rem;font-weight:700;text-decoration:none}
nav ul{display:flex;gap:1.6rem;list-style:none}
nav ul a{text-decoration:none;font-size:.9rem;color:var(--muted)}
nav ul a:hover{color:var(--accent)}
.btn{display:inline-block;background:var(--accent);color:#fff;text-decoration:none;padding:.8rem 1.5rem;border-radius:50px;font-weight:600;font-size:.95rem;border:0;cursor:pointer;transition:transform .2s,box-shadow .2s;font-family:var(--body)}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.15)}
.btn.ghost{background:transparent;border:1px solid currentColor}
.hero{min-height:84vh;display:flex;align-items:center;padding:5rem 5vw;color:#fff;background:var(--hero)}
.hero .inner{max-width:680px}
.hero small{letter-spacing:.22em;text-transform:uppercase;color:var(--accent2);font-size:.78rem;font-weight:600}
.hero h1{font-size:clamp(2.3rem,6vw,4.2rem);margin:1rem 0}
.hero p{font-size:1.1rem;opacity:.88;margin-bottom:2rem;max-width:56ch}
.actions{display:flex;gap:1rem;flex-wrap:wrap}
section{padding:5rem 5vw}
.title{text-align:center;margin-bottom:3rem}
.title small{color:var(--accent);letter-spacing:.2em;text-transform:uppercase;font-size:.75rem;font-weight:700}
.title h2{font-size:clamp(1.8rem,4vw,2.6rem);margin-top:.5rem}
.wrap{max-width:1100px;margin:auto}
.forts{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.2rem;max-width:1100px;margin:-3.5rem auto 0;padding:0 5vw;position:relative}
.forts div{background:var(--card);border-radius:14px;padding:1.5rem;box-shadow:0 12px 30px rgba(0,0,0,.08);font-weight:500}
.forts div::before{content:'';display:block;width:28px;height:3px;background:var(--accent2);border-radius:2px;margin-bottom:.8rem}
.about{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.about .visual{aspect-ratio:4/5;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,var(--accent),var(--ink));box-shadow:0 30px 60px rgba(0,0,0,.18)}
.about .visual.mono{display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--head);font-size:clamp(3rem,8vw,6rem)}
.about p{color:var(--muted);margin-bottom:1rem}
.about .title{text-align:left;margin-bottom:1.5rem}
.services{background:var(--card)}
.groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:3rem}
.groups h3{color:var(--accent);border-bottom:1px solid var(--accent2);padding-bottom:.5rem;margin-bottom:1.2rem;font-size:1.25rem}
.item{display:flex;justify-content:space-between;gap:1rem;margin-bottom:1.1rem}
.item b{font-weight:600}
.item span{display:block;font-size:.88rem;color:var(--muted)}
.item .prix{font-family:var(--head);color:var(--accent);white-space:nowrap;font-weight:700}
.band{height:420px;background:var(--ink)}
.galerie{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.galerie div{aspect-ratio:1;border-radius:10px;overflow:hidden;background:var(--accent)}
.reviews{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.review{background:var(--card);padding:1.8rem;border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,.05)}
.stars{color:var(--accent2);letter-spacing:2px}
.review p{font-style:italic;margin:.8rem 0;color:var(--muted)}
.contact form{display:grid;gap:1rem;max-width:640px;margin:auto}
.contact label{display:grid;gap:.35rem;font-size:.9rem;font-weight:500}
.contact input,.contact textarea{font:inherit;padding:.8rem 1rem;border:1px solid rgba(0,0,0,.15);border-radius:10px;background:var(--card);color:var(--ink)}
.contact textarea{min-height:130px;resize:vertical}
.contact .row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.infos{background:var(--ink);color:#fff}
.infos .title small{color:var(--accent2)}
.info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.info-grid>div{border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:1.8rem}
.info-grid h3{color:var(--accent2);font-size:1.1rem;margin-bottom:.8rem}
.info-grid p{opacity:.85;font-size:.95rem}
.info-grid .btn{margin-top:1.2rem}
footer{text-align:center;padding:2rem 5vw;font-size:.82rem;color:var(--muted)}
footer a{color:var(--muted)}
.legal{max-width:760px;margin:auto;padding:4rem 5vw}
.legal h1{font-size:2.2rem;margin-bottom:2rem}
.legal h2{font-size:1.2rem;margin:2rem 0 .6rem;color:var(--accent)}
.legal p{color:var(--muted)}
:focus-visible{outline:3px solid var(--accent2);outline-offset:2px}
@media(max-width:760px){nav ul{display:none}.about{grid-template-columns:1fr;gap:2rem}.about .visual{aspect-ratio:16/10}.contact .row{grid-template-columns:1fr}.band{height:260px}nav .btn{padding:.6rem 1rem;font-size:.85rem}}`;
}

function heroBackground(img) {
  const shade = 'linear-gradient(90deg,rgba(15,12,10,.86) 0%,rgba(15,12,10,.55) 55%,rgba(15,12,10,.3) 100%)';
  if (img) return `${shade},url('${img}') center/cover,var(--ink)`;
  return 'radial-gradient(circle at 85% 20%,color-mix(in srgb,var(--accent2) 45%,transparent) 0,transparent 45%),radial-gradient(circle at 10% 90%,color-mix(in srgb,var(--accent) 70%,transparent) 0,transparent 55%),linear-gradient(135deg,var(--ink),color-mix(in srgb,var(--accent) 60%,var(--ink)))';
}

function head(b, t, c, { title, description, noindex, jsonld }) {
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
${b.photos?.hero || t.images.hero ? `<meta property="og:image" content="${esc(b.photos?.hero || t.images.hero)}">\n` : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?${t.fonts}&display=swap" rel="stylesheet">
<style>
${css(t, c)}
.hero{--hero:${heroBackground(b.photos?.hero ?? t.images.hero)}}
</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ''}</head>`;
}

function renderIndex(b, suivi) {
  const t = THEMES[b.theme];
  const c = { ...t.colors, ...(b.couleurs || {}) };
  const L = { ...t.labels, ...(b.libelles || {}) };
  const tel = telHref(b.telephone);
  const cta = b.cta?.texte || L.cta;
  const ctaHref = b.cta?.lien || (tel ? `tel:${tel}` : '#infos');
  const preview = !['livre', 'paye'].includes(suivi?.statut);
  const photos = b.photos || {};
  const aboutImg = photos.about ?? t.images.about;
  const bandImg = photos.band ?? t.images.band;
  const groupes = (b.services?.groupes || [])
    .map((g) => ({ ...g, items: (g.items || []).filter((i) => i.nom) }))
    .filter((g) => g.nom && g.items.length);
  const avis = b.avis || [];
  const galerie = photos.galerie || [];
  const contactForm = b.formule !== 'essentiel' && b.email;

  const links = [
    b.histoire?.length && ['#apropos', L.about],
    groupes.length && ['#services', b.services?.titre || L.services],
    avis.length && ['#avis', 'Avis'],
    contactForm && ['#contact', 'Contact'],
    ['#infos', 'Infos pratiques'],
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
    image: photos.hero || t.images.hero || undefined,
  };

  const title = b.titre_seo || `${b.nom} — ${b.activite}${b.ville ? ' à ' + b.ville : ''}`;
  const description = b.description_seo || b.accroche;

  return `${head(b, t, c, { title, description, noindex: preview, jsonld })}
<body>
${preview ? `<div class="preview">Aperçu de votre futur site — en attente de votre validation</div>\n` : ''}<nav>
  <a href="#" class="logo">${esc(b.nom)}</a>
  <ul>${links.map(([h, l]) => `<li><a href="${h}">${esc(l)}</a></li>`).join('')}</ul>
  <a href="${esc(ctaHref)}" class="btn">${esc(cta)}</a>
</nav>

<header class="hero">
  <div class="inner">
    <small>${esc(b.activite)}${b.ville ? ' · ' + esc(b.ville) : ''}</small>
    <h1>${esc(b.slogan)}</h1>
    <p>${esc(b.accroche)}</p>
    <div class="actions"><a href="${esc(ctaHref)}" class="btn">${esc(cta)}</a>${groupes.length ? `<a href="#services" class="btn ghost">${esc(b.services?.titre || L.services)}</a>` : ''}</div>
  </div>
</header>
${b.points_forts?.length ? `\n<div class="forts">${b.points_forts.map((p) => `<div>${esc(p)}</div>`).join('')}</div>\n` : ''}
${b.histoire?.length ? `<section id="apropos">
  <div class="about wrap">
    ${aboutImg ? `<div class="visual"><img src="${esc(aboutImg)}" alt="${esc(photos.about_alt || t.alts.about || b.nom)}" loading="lazy"></div>` : `<div class="visual mono" aria-hidden="true">${esc(b.nom.trim()[0])}</div>`}
    <div>
      <div class="title"><small>${esc(L.about)}</small><h2>${esc(b.histoire_titre || b.nom)}</h2></div>
      ${b.histoire.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
    </div>
  </div>
</section>\n` : ''}
${groupes.length ? `<section id="services" class="services">
  <div class="title"><small>${esc(L.servicesKicker)}</small><h2>${esc(b.services?.titre || L.services)}</h2></div>
  <div class="groups wrap">
${groupes.map((g) => `    <div>
      <h3>${esc(g.nom)}</h3>
${(g.items || []).map((i) => `      <div class="item"><div><b>${esc(i.nom)}</b>${i.detail ? `<span>${esc(i.detail)}</span>` : ''}</div>${i.prix ? `<div class="prix">${esc(i.prix)}</div>` : ''}</div>`).join('\n')}
    </div>`).join('\n')}
  </div>
${b.services?.note ? `  <p class="wrap" style="text-align:center;color:var(--muted);margin-top:2rem;font-size:.9rem">${esc(b.services.note)}</p>\n` : ''}</section>\n` : ''}
${bandImg ? `<div class="band"><img src="${esc(bandImg)}" alt="${esc(photos.band_alt || t.alts.band || b.nom)}" loading="lazy"></div>\n` : ''}
${galerie.length ? `<section id="galerie">
  <div class="title"><small>En images</small><h2>${esc(b.galerie_titre || 'Galerie')}</h2></div>
  <div class="galerie wrap">${galerie.map((g) => `<div><img src="${esc(g.src || g)}" alt="${esc(g.alt || b.nom)}" loading="lazy"></div>`).join('')}</div>
</section>\n` : ''}
${avis.length ? `<section id="avis">
  <div class="title"><small>Ils nous font confiance</small><h2>${esc(b.note_google ? `${b.note_google} / 5 sur Google` : 'Ce que disent nos clients')}</h2></div>
  <div class="reviews wrap">
${avis.map((a) => `    <div class="review"><div class="stars" aria-label="${a.note || 5} étoiles sur 5">${'★'.repeat(a.note || 5)}</div><p>« ${esc(a.texte)} »</p><b>${esc(a.auteur)}</b></div>`).join('\n')}
  </div>
</section>\n` : ''}
${contactForm ? `<section id="contact" class="contact">
  <div class="title"><small>Contact</small><h2>${esc(b.contact_titre || 'Écrivez-nous')}</h2></div>
  <form action="mailto:${esc(b.email)}" method="post" enctype="text/plain">
    <div class="row"><label>Nom<input name="nom" required autocomplete="name"></label><label>Téléphone<input name="telephone" type="tel" autocomplete="tel"></label></div>
    <label>E-mail<input name="email" type="email" required autocomplete="email"></label>
    <label>Message<textarea name="message" required></textarea></label>
    <button class="btn" type="submit">Envoyer le message</button>
  </form>
</section>\n` : ''}
<section id="infos" class="infos">
  <div class="title"><small>Nous trouver</small><h2>Infos pratiques</h2></div>
  <div class="info-grid wrap">
${b.adresse ? `    <div><h3>Adresse</h3><p>${esc(b.adresse)}<br>${esc([b.code_postal, b.ville].filter(Boolean).join(' '))}</p><a class="btn ghost" href="${esc(mapsHref(b))}" target="_blank" rel="noopener">Itinéraire</a></div>\n` : ''}${b.horaires?.length ? `    <div><h3>Horaires</h3><p>${b.horaires.map(esc).join('<br>')}</p></div>\n` : ''}    <div><h3>Contact</h3><p>${[b.telephone && esc(b.telephone), b.email && esc(b.email)].filter(Boolean).join('<br>')}</p>${tel ? `<a href="tel:${tel}" class="btn">Appeler</a>` : ''}</div>
${b.reseaux && Object.keys(b.reseaux).length ? `    <div><h3>Suivez-nous</h3><p>${Object.entries(b.reseaux).map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(k[0].toUpperCase() + k.slice(1))}</a>`).join('<br>')}</p></div>\n` : ''}  </div>
</section>
<footer>© ${new Date().getFullYear()} ${esc(b.nom)} · <a href="mentions-legales.html">Mentions légales</a> · Site réalisé par <a href="${PORTFOLIO}" target="_blank" rel="noopener">Matheo Guzzi</a></footer>
</body>
</html>
`;
}

function renderLegal(b, suivi) {
  const t = THEMES[b.theme];
  const c = { ...t.colors, ...(b.couleurs || {}) };
  const l = b.legal || {};
  const preview = !['livre', 'paye'].includes(suivi?.statut);
  return `${head(b, t, c, { title: `Mentions légales — ${b.nom}`, description: `Mentions légales du site de ${b.nom}.`, noindex: true })}
<body>
${preview ? `<div class="preview">Aperçu de votre futur site — en attente de votre validation</div>\n` : ''}<nav><a href="index.html" class="logo">${esc(b.nom)}</a><a href="index.html" class="btn">Retour au site</a></nav>
<main class="legal">
  <h1>Mentions légales</h1>
  <h2>Éditeur du site</h2>
  <p>${esc(l.raison_sociale || b.nom)}${l.forme ? ' — ' + esc(l.forme) : ''}<br>
  Responsable de la publication : ${esc(l.responsable || 'À COMPLÉTER')}<br>
  ${b.adresse ? `${esc(b.adresse)}, ${esc([b.code_postal, b.ville].filter(Boolean).join(' '))}<br>` : ''}
  ${l.siret ? `SIRET : ${esc(l.siret)}<br>` : 'SIRET : À COMPLÉTER<br>'}
  ${[b.telephone && 'Téléphone : ' + esc(b.telephone), b.email && 'E-mail : ' + esc(b.email)].filter(Boolean).join('<br>')}</p>
  <h2>Hébergement</h2>
  <p>${nl(l.hebergeur || 'GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis — https://pages.github.com')}</p>
  <h2>Conception</h2>
  <p>Site conçu et réalisé par Matheo Guzzi — ${PORTFOLIO}</p>
  <h2>Propriété intellectuelle</h2>
  <p>Les textes, logos et photographies de ce site appartiennent à ${esc(b.nom)} ou sont utilisés avec autorisation (photos libres de droits Unsplash le cas échéant). Toute reproduction sans accord est interdite.</p>
  <h2>Données personnelles</h2>
  <p>Ce site ne dépose pas de cookies publicitaires et ne collecte aucune donnée automatiquement. Les informations envoyées via le formulaire de contact ou par e-mail servent uniquement à répondre à votre demande et ne sont jamais transmises à des tiers. Vous pouvez demander leur suppression à tout moment${b.email ? ' à ' + esc(b.email) : ''}.</p>
</main>
<footer>© ${new Date().getFullYear()} ${esc(b.nom)}</footer>
</body>
</html>
`;
}

// ---------- brief ----------

const REQUIRED = ['nom', 'activite', 'theme', 'slogan', 'accroche', 'formule'];

function checkBrief(b) {
  const errors = REQUIRED.filter((k) => !b[k]).map((k) => `champ "${k}" manquant`);
  if (b.theme && !THEMES[b.theme]) errors.push(`thème inconnu "${b.theme}" (choix : ${Object.keys(THEMES).join(', ')})`);
  if (!b.telephone && !b.email) errors.push('il faut au moins un téléphone ou un e-mail');
  if (b.formule && !['essentiel', 'standard', 'premium'].includes(b.formule)) errors.push('formule : essentiel | standard | premium');
  return errors;
}

function loadSuivi(slug) {
  const p = path.join(dir(slug), 'suivi.json');
  return fs.existsSync(p) ? readJSON(p) : null;
}

// ---------- commandes ----------

function cmdNouveau(slug) {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) fail('usage : nouveau <slug> (ex. boulangerie-dupont)');
  const d = dir(slug);
  if (fs.existsSync(d)) fail(`clients/${slug} existe déjà`);
  fs.mkdirSync(d, { recursive: true });
  const modele = readJSON(path.join(ROOT, 'agence', 'templates', 'brief.exemple.json'));
  writeJSON(path.join(d, 'brief.json'), modele);
  writeJSON(path.join(d, 'suivi.json'), {
    slug, nom: '', statut: 'brief', formule: '', prix: 0, plateforme: '', cree_le: today(), echeance: '', test: false,
    historique: [{ date: today(), etape: 'brief', note: 'Dossier créé' }],
  });
  console.log(`✓ clients/${slug}/ créé — remplis brief.json puis lance : build ${slug}`);
}

function cmdBuild(slug) {
  needClient(slug);
  const b = readJSON(path.join(dir(slug), 'brief.json'));
  const errors = checkBrief(b);
  if (errors.length) fail('brief incomplet :\n  - ' + errors.join('\n  - '));
  const suivi = loadSuivi(slug);
  fs.writeFileSync(path.join(dir(slug), 'index.html'), renderIndex(b, suivi));
  fs.writeFileSync(path.join(dir(slug), 'mentions-legales.html'), renderLegal(b, suivi));
  console.log(`✓ site généré : clients/${slug}/index.html (+ mentions-legales.html)`);
  console.log(`  en ligne après publication : https://matheoguz.github.io/clients/${slug}/`);
}

async function cmdVerifier(slug) {
  needClient(slug);
  const d = dir(slug);
  const b = readJSON(path.join(d, 'brief.json'));
  const ok = [], warn = [], ko = [];
  const check = (cond, msg, level = ko) => (cond ? ok.push(msg) : level.push(msg));

  checkBrief(b).forEach((e) => ko.push('Brief : ' + e));
  for (const f of ['index.html', 'mentions-legales.html']) {
    if (!fs.existsSync(path.join(d, f))) { ko.push(`${f} absent — lance build ${slug}`); }
  }
  if (ko.length) return report(slug, ok, warn, ko);

  const html = fs.readFileSync(path.join(d, 'index.html'), 'utf8');
  const legal = fs.readFileSync(path.join(d, 'mentions-legales.html'), 'utf8');
  const text = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');

  check(/<html lang="fr">/.test(html), 'Langue de la page déclarée');
  check(/name="viewport"/.test(html), 'Adapté au mobile (viewport)');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  check(title.length >= 15 && title.length <= 70, `Titre Google : ${title.length} caractères (idéal 15-70)`, warn);
  const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1] || '';
  check(desc.length >= 50 && desc.length <= 160, `Description Google : ${desc.length} caractères (idéal 50-160)`, warn);
  check(!/undefined|null|NaN|\{\{|\}\}|\[object Object\]/.test(text), 'Aucun texte cassé (undefined, {{ }}…)');
  check(!/lorem ipsum/i.test(text), 'Pas de faux texte (lorem ipsum)');
  const imgs = html.match(/<img\b[^>]*>/g) || [];
  check(imgs.every((i) => /alt="[^"]+"/.test(i)), `Toutes les images ont un texte alternatif (${imgs.length})`);
  const tels = [...html.matchAll(/href="tel:([^"]*)"/g)].map((m) => m[1]);
  check(tels.every((t) => /^\+\d{8,15}$/.test(t)), `Liens d'appel valides (${tels.length})`);
  check(!b.email || /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(b.email), 'E-mail au bon format');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  const broken = anchors.filter((a) => !ids.has(a));
  check(!broken.length, broken.length ? `Liens internes cassés : ${broken.join(', ')}` : 'Liens internes OK');
  check(/mentions-legales\.html/.test(html), 'Lien vers les mentions légales');
  check(!/À COMPLÉTER/.test(legal), 'Mentions légales complètes (responsable, SIRET)', warn);
  check(/schema\.org/.test(html), 'Fiche Google (données structurées LocalBusiness)');
  const kb = Buffer.byteLength(html) / 1024;
  check(kb < 150, `Poids de la page : ${kb.toFixed(0)} Ko`, warn);
  if (b.formule !== 'essentiel') check(/<form/.test(html) || !b.email, 'Formulaire de contact (formule ' + b.formule + ')', warn);
  check(!b.avis?.some((a) => a.invente), 'Aucun avis inventé', ko);

  await screenshots(slug, ok, warn, ko);
  return report(slug, ok, warn, ko);
}

async function screenshots(slug, ok, warn, ko) {
  let chromium;
  try {
    const req = createRequire(import.meta.url);
    const globalRoot = process.env.NODE_PATH || (await import('node:child_process')).execSync('npm root -g').toString().trim();
    chromium = req(req.resolve('playwright', { paths: [ROOT, globalRoot] })).chromium;
  } catch {
    warn.push('Captures d’écran ignorées (Playwright non installé : npm i -g playwright)');
    return;
  }
  const out = path.join(dir(slug), '.apercu');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const [name, vp] of [['mobile', { width: 390, height: 844 }], ['ordinateur', { width: 1440, height: 900 }]]) {
      const page = await browser.newPage({ viewport: vp });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(pathToFileURL(path.join(dir(slug), 'index.html')).href, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) ko.push(`Débordement horizontal sur ${name} : ${overflow}px`);
      else ok.push(`Pas de débordement sur ${name}`);
      if (errors.length) ko.push(`Erreurs JavaScript (${name}) : ${errors.join(' | ')}`);
      await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
      await page.close();
    }
    ok.push(`Captures enregistrées dans clients/${slug}/.apercu/`);
  } finally {
    await browser.close();
  }
}

function report(slug, ok, warn, ko) {
  const lines = [`# Vérification — ${slug} (${today()})`, ''];
  lines.push(ko.length ? `**❌ ${ko.length} problème(s) bloquant(s)**` : warn.length ? `**🟡 OK avec ${warn.length} point(s) à regarder**` : '**✅ Tout est bon**', '');
  ko.forEach((m) => lines.push('- ❌ ' + m));
  warn.forEach((m) => lines.push('- 🟡 ' + m));
  ok.forEach((m) => lines.push('- ✅ ' + m));
  const md = lines.join('\n') + '\n';
  fs.writeFileSync(path.join(dir(slug), 'verification.md'), md);
  console.log(md);
  if (ko.length) process.exitCode = 2;
}

function cmdStatut(slug, etape, note) {
  needClient(slug);
  if (!ETAPES[etape]) fail(`étape inconnue "${etape}" (choix : ${Object.keys(ETAPES).join(', ')})`);
  const p = path.join(dir(slug), 'suivi.json');
  const s = readJSON(p);
  s.statut = etape;
  s.historique = [...(s.historique || []), { date: today(), etape, note: note || ETAPES[etape] }];
  writeJSON(p, s);
  console.log(`✓ ${slug} → ${ETAPES[etape]}`);
  cmdIndex();
}

function cmdIndex() {
  const clients = fs.existsSync(CLIENTS)
    ? fs.readdirSync(CLIENTS, { withFileTypes: true })
        .filter((e) => e.isDirectory() && fs.existsSync(path.join(CLIENTS, e.name, 'suivi.json')))
        .map((e) => {
          const s = readJSON(path.join(CLIENTS, e.name, 'suivi.json'));
          const b = fs.existsSync(path.join(CLIENTS, e.name, 'brief.json')) ? readJSON(path.join(CLIENTS, e.name, 'brief.json')) : {};
          const last = (s.historique || []).at(-1) || {};
          return {
            slug: e.name, nom: s.nom || b.nom || e.name, activite: b.activite || '', theme: b.theme || '',
            statut: s.statut, formule: s.formule || b.formule || '', prix: s.prix || 0, plateforme: s.plateforme || '',
            cree_le: s.cree_le, echeance: s.echeance || '', test: !!s.test, derniere_action: last.note || '', maj: last.date || s.cree_le,
            a_valider: s.a_valider || [],
          };
        })
    : [];
  writeJSON(path.join(CLIENTS, 'index.json'), { genere_le: new Date().toISOString(), etapes: ETAPES, clients });
  console.log(`✓ clients/index.json : ${clients.length} client(s)`);
}

const [cmd, ...args] = process.argv.slice(2);
const cmds = { nouveau: cmdNouveau, build: cmdBuild, verifier: cmdVerifier, statut: cmdStatut, index: cmdIndex };
if (!cmds[cmd]) {
  console.log('Commandes : nouveau <slug> | build <slug> | verifier <slug> | statut <slug> <etape> [note] | index');
  console.log('Étapes : ' + Object.keys(ETAPES).join(' → '));
  process.exit(cmd ? 1 : 0);
}
await cmds[cmd](...args);
