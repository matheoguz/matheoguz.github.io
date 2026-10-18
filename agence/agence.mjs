#!/usr/bin/env node
// Outil de l'agence : crée, vérifie et suit les sites des clients.
//
//   node agence/agence.mjs nouveau <slug>            crée clients/<slug>/ avec un brief vide
//   node agence/agence.mjs build <slug>              génère le site depuis brief.json
//   node agence/agence.mjs verifier <slug>           contrôle qualité (+ captures si Playwright)
//   node agence/agence.mjs statut <slug> <etape> [note]   avance le client dans le pipeline
//   node agence/agence.mjs index                     met à jour clients/index.json (cockpit)
//   node agence/agence.mjs apercu <dossier> [slug]   copies autonomes à ouvrir dans un aperçu
//   node agence/agence.mjs cerveau <dossier>         fiches entreprises à envoyer dans le Cerveau (ArtifactData)
//
// Aucune dépendance : Node 18+ suffit. Playwright est utilisé s'il est installé.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { THEMES } from './themes.mjs';
import { renderIndex, renderLegal } from './rendu.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLIENTS = path.join(ROOT, 'clients');

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
  check(!/[—–]/.test(text + desc + title), 'Aucun tiret long (signature des textes écrits par une IA)');
  check(/class="hero"[\s\S]*?<img /.test(html), 'Vraie photo dans le haut de page', warn);
  const nbImg = (html.match(/<img\b/g) || []).length;
  check(nbImg >= 3, `Au moins 3 vraies photos sur la page (${nbImg})`, warn);
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
            a_valider: s.a_valider || [], historique: s.historique || [],
          };
        })
    : [];
  writeJSON(path.join(CLIENTS, 'index.json'), { genere_le: new Date().toISOString(), etapes: ETAPES, clients });
  console.log(`✓ clients/index.json : ${clients.length} client(s)`);
}

// Copies autonomes (sans fichiers à côté) du questionnaire et du site d'un client.
function cmdApercu(out, slug) {
  if (!out) fail('usage : apercu <dossier> [slug]');
  fs.mkdirSync(out, { recursive: true });
  const files = [['questionnaire.html', fs.readFileSync(path.join(ROOT, 'sites', 'brief', 'index.html'), 'utf8')]];
  if (slug) {
    needClient(slug);
    files.push([`site-${slug}.html`, fs.readFileSync(path.join(dir(slug), 'index.html'), 'utf8')]);
  }
  for (const [name, html] of files) fs.writeFileSync(path.join(out, name), html);
  files.forEach(([name]) => console.log(path.join(out, name)));
}

// Le Cerveau (page privée claude.ai) reçoit une copie des fiches et de la mémoire.
// Les personnes, réponses et messages n'existent QUE dans le Cerveau : jamais dans ce dépôt public.
const SITE_PUBLIC = (slug) => `https://matheoguz.github.io/clients/${slug}/`;
function cmdCerveau(out) {
  if (!out) fail('usage : cerveau <dossier>');
  cmdIndex();
  const idx = readJSON(path.join(CLIENTS, 'index.json'));
  const ecrire = (col, id, data) => {
    fs.mkdirSync(path.join(out, col), { recursive: true });
    writeJSON(path.join(out, col, id + '.json'), data);
    console.log(`${col}/${id} -> ${path.join(out, col, id + '.json')}`);
  };
  for (const c of idx.clients) {
    const b = readJSON(path.join(dir(c.slug), 'brief.json'));
    ecrire('entreprises', c.slug, {
      nom: c.nom, activite: c.activite, metier: b.metier || '', theme: c.theme, ville: b.ville || '', code_postal: b.code_postal || '',
      adresse: b.adresse || '', telephone: b.telephone || '', email: b.email || '', formule: c.formule, prix: c.prix,
      plateforme: c.plateforme, statut: c.statut, echeance: c.echeance, cree_le: c.cree_le, test: c.test,
      a_valider: c.a_valider, historique: c.historique, site: process.env.CERVEAU_SITE_BASE ? `${process.env.CERVEAU_SITE_BASE}/clients/${c.slug}/index.html` : SITE_PUBLIC(c.slug),
    });
  }
  // La mémoire (règles, tarifs, style, leçons) vit dans le coffre Repos-/cerveau et part dans le Cerveau
  // avec les autres notes : node ../Repos-/cerveau/.outils/vers-cerveau.mjs <dossier>
}

const [cmd, ...args] = process.argv.slice(2);
const cmds = { nouveau: cmdNouveau, build: cmdBuild, verifier: cmdVerifier, statut: cmdStatut, index: cmdIndex, apercu: cmdApercu, cerveau: cmdCerveau };
if (!cmds[cmd]) {
  console.log('Commandes : nouveau <slug> | build <slug> | verifier <slug> | statut <slug> <etape> [note] | index | apercu <dossier> [slug] | cerveau <dossier>');
  console.log('Étapes : ' + Object.keys(ETAPES).join(' → '));
  process.exit(cmd ? 1 : 0);
}
await cmds[cmd](...args);
