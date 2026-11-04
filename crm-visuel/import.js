// « Essayez avec vos données » : le visiteur dépose un fichier CSV ou Excel (.xlsx), la démo se recalcule avec.
// TOUT reste dans le navigateur : les fichiers sont lus ici (FileReader, DecompressionStream pour le .xlsx),
// aucune requête réseau n'est faite pendant l'import. Les données passent à la page par sessionStorage
// (effacé à la fermeture de l'onglet) ; localStorage seulement si le visiteur coche « Garder sur cet appareil ».
// Module ES sans dépendance ; le style est dans interface.css (classes imp-*).
//
//   lireImport(cle)        // { donnees, sources, date } importées pour cette démo, ou null
//   installerImport({ cle, nom, tableaux, apercu, bouton })  // bouton d'en-tête + écran d'import ; ?import=1 l'ouvre
//     tableaux : [{ id, nom, alias: [noms de fichier ou d'onglet], colonnes: [{ id, nom, alias, type, requis, min, max }],
//                  max: lignes, modele: 'contenu CSV de l'exemple' }]
//     type : texte | nombre | entier | pct | heure | date | euros
//     apercu(donnees) -> [notes] : ce que la démo va faire de ces données (adaptations à la maquette)

import { fenetre } from './commun.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const sans = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%€/]+/g, ' ').trim();

// ---------- stockage (jamais de données importées en localStorage sans la case cochée) ----------
const CLE = (cle) => 'crm-donnees-' + cle;
export function lireImport(cle) {
  for (const s of ['sessionStorage', 'localStorage']) {
    try { const v = JSON.parse(window[s].getItem(CLE(cle)) || 'null'); if (v && v.v === 1 && v.donnees) return { ...v, garde: s === 'localStorage' }; } catch { /* stockage bloqué */ }
  }
  return null;
}
function ecrire(cle, val, garder) {
  const txt = JSON.stringify(val);
  try { sessionStorage.setItem(CLE(cle), txt); } catch { /* */ }
  try { if (garder) localStorage.setItem(CLE(cle), txt); else localStorage.removeItem(CLE(cle)); } catch { /* */ }
}
export function effacerImport(cle) {
  for (const s of ['sessionStorage', 'localStorage']) { try { window[s].removeItem(CLE(cle)); } catch { /* */ } }
}

// ---------- lecture CSV ----------
function decoder(buf) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch { return new TextDecoder('windows-1252').decode(buf); }
}
export function lireCSV(texte) {
  texte = texte.replace(/^﻿/, '');
  const l1 = texte.split(/\r?\n/, 1)[0] || '';
  const sep = [';', ',', '\t'].map((c) => [c, l1.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
  const lignes = []; let ligne = [], champ = '', q = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (q) { if (c === '"') { if (texte[i + 1] === '"') { champ += '"'; i++; } else q = false; } else champ += c; continue; }
    if (c === '"' && champ === '') q = true;
    else if (c === sep) { ligne.push(champ); champ = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && texte[i + 1] === '\n') i++; ligne.push(champ); lignes.push(ligne); ligne = []; champ = ''; }
    else champ += c;
  }
  if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  return lignes;
}

// ---------- lecture XLSX (zip + XML, sans librairie : DecompressionStream du navigateur) ----------
async function inflate(octets) {
  const flux = new Blob([octets]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(flux).arrayBuffer());
}
function dezipper(buf) {
  const v = new DataView(buf), u8 = new Uint8Array(buf), td = new TextDecoder();
  let e = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (v.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('Ce fichier n\'est pas un classeur .xlsx lisible.');
  const n = v.getUint16(e + 10, true), F = {}; let p = v.getUint32(e + 16, true);
  for (let k = 0; k < n && v.getUint32(p, true) === 0x02014b50; k++) {
    const ln = v.getUint16(p + 28, true), lx = v.getUint16(p + 30, true), lc = v.getUint16(p + 32, true);
    F[td.decode(u8.subarray(p + 46, p + 46 + ln))] = { meth: v.getUint16(p + 10, true), taille: v.getUint32(p + 20, true), off: v.getUint32(p + 42, true) };
    p += 46 + ln + lx + lc;
  }
  return async (nom) => {
    const f = F[nom]; if (!f) return null;
    const d0 = f.off + 30 + v.getUint16(f.off + 26, true) + v.getUint16(f.off + 28, true), d = u8.subarray(d0, d0 + f.taille);
    return td.decode(f.meth === 0 ? d : await inflate(d));
  };
}
const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
const tags = (n, t) => [...n.getElementsByTagName(t)];
export async function lireXLSX(buf) {
  const lire = dezipper(buf);
  const wb = await lire('xl/workbook.xml'); if (!wb) throw new Error('Classeur Excel sans feuille lisible.');
  const rels = xml((await lire('xl/_rels/workbook.xml.rels')) || '<r/>'), cible = {};
  for (const r of tags(rels, 'Relationship')) cible[r.getAttribute('Id')] = r.getAttribute('Target');
  const ss = await lire('xl/sharedStrings.xml'), partages = ss ? tags(xml(ss), 'si').map((si) => tags(si, 't').map((t) => t.textContent).join('')) : [];
  const feuilles = [];
  for (const s of tags(xml(wb), 'sheet')) {
    const id = s.getAttribute('r:id') || [...s.attributes].find((a) => /:id$/.test(a.name))?.value;
    let chemin = cible[id] || ''; chemin = chemin.startsWith('/') ? chemin.slice(1) : 'xl/' + chemin.replace(/^\.\//, '');
    const src = await lire(chemin); if (!src) continue;
    const lignes = [];
    for (const row of tags(xml(src), 'row')) {
      const r = (+row.getAttribute('r') || lignes.length + 1) - 1, L = (lignes[r] = []);
      tags(row, 'c').forEach((c, k) => {
        const ref = c.getAttribute('r'), col = ref ? [...ref.replace(/\d+/g, '')].reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1 : k;
        const t = c.getAttribute('t'), vv = tags(c, 'v')[0]?.textContent ?? '';
        L[col] = t === 's' ? partages[+vv] ?? '' : t === 'inlineStr' ? tags(c, 't').map((x) => x.textContent).join('') : t === 'str' || t === 'b' || t === 'e' ? vv : vv === '' ? '' : Number(vv);
      });
    }
    feuilles.push({ nom: s.getAttribute('name') || 'Feuille', lignes: Array.from(lignes, (l) => Array.from(l || [], (x) => x ?? '')) });
  }
  return feuilles;
}

// ---------- conversion des valeurs ----------
const pad = (n) => String(n).padStart(2, '0');
const nombre = (v) => {
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[\s  €]/g, '').replace(/h$/i, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
};
const CONV = {
  texte: (v) => ({ val: String(v).trim() }),
  nombre: (v) => { const n = nombre(v); return Number.isNaN(n) ? { err: `« ${v} » n'est pas un nombre` } : { val: n }; },
  entier: (v) => { const n = nombre(v); return Number.isNaN(n) ? { err: `« ${v} » n'est pas un nombre entier` } : { val: Math.round(n) }; },
  euros: (v) => { const n = nombre(v); return Number.isNaN(n) ? { err: `« ${v} » n'est pas un montant en euros` } : { val: Math.round(n * 100) / 100 }; },
  pct: (v) => {
    const pc = /%/.test(String(v)), n = nombre(String(v).replace('%', ''));
    if (Number.isNaN(n)) return { err: `« ${v} » n'est pas un pourcentage (ex. 82 %)` };
    const f = pc ? n / 100 : n <= 1 ? n : n / 100;
    return f < 0 || f > 1 ? { err: `« ${v} » doit être entre 0 et 100 %` } : { val: Math.round(f * 1000) / 1000 };
  },
  heure: (v) => {
    let h = NaN;
    if (typeof v === 'number') h = v < 1 ? v * 24 : v;
    else {
      const m = String(v).trim().toLowerCase().match(/^(\d{1,2})\s*(?:([h:.,])\s*(\d{1,2})?(?::\d{2})?)?$/);
      if (m) h = +m[1] + (m[3] ? (/[.,]/.test(m[2]) && m[3].length === 1 ? +m[3] / 10 : +m[3] / 60) : 0);
    }
    return Number.isNaN(h) || h < 0 || h > 24 ? { err: `« ${v} » n'est pas une heure (ex. 8:30 ou 8h30)` } : { val: Math.round(h * 60) / 60 };
  },
  date: (v) => {
    let d = null;
    if (typeof v === 'number' && v > 20000 && v < 80000) d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 864e5);
    else {
      const s = String(v).trim(), a = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/), b = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
      if (a) d = new Date(Date.UTC(+a[1], +a[2] - 1, +a[3]));
      else if (b) d = new Date(Date.UTC(+b[3] < 100 ? 2000 + +b[3] : +b[3], +b[2] - 1, +b[1]));
      if (d && (a ? d.getUTCDate() !== +a[3] : d.getUTCDate() !== +b[1])) d = null;
    }
    return d && !Number.isNaN(+d) ? { val: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` } : { err: `« ${v} » n'est pas une date (ex. 04/12/2026)` };
  },
};
export const FORMAT = {
  texte: (v) => v, nombre: (v) => String(v).replace('.', ','), entier: (v) => v.toLocaleString('fr-FR'), euros: (v) => v.toLocaleString('fr-FR') + ' €',
  pct: (v) => Math.round(v * 100) + ' %', heure: (h) => `${Math.floor(h)}h${pad(Math.round((h % 1) * 60))}`, date: (d) => d.split('-').reverse().join('/'),
};

// ---------- reconnaître un tableau et ses colonnes ----------
function associer(entetes, tab) {
  const E = entetes.map(sans), paires = [];
  tab.colonnes.forEach((c, ci) => [c.nom, ...(c.alias || [])].map(sans).forEach((a) => E.forEach((h, hi) => {
    if (!h) return;
    const s = h === a ? 3 : h.startsWith(a + ' ') || h.startsWith(a + '(') ? 2 : a.length > 3 && h.includes(a) ? 1 : 0;
    if (s) paires.push([s + a.length / 100, ci, hi]);
  })));
  paires.sort((a, b) => b[0] - a[0]);
  const col = {}, pris = new Set();
  for (const [, ci, hi] of paires) if (!(tab.colonnes[ci].id in col) && !pris.has(hi)) { col[tab.colonnes[ci].id] = hi; pris.add(hi); }
  return col;
}
// feuilles : [{ fichier, nom, lignes }] -> { donnees, sources, erreurs }
export function analyser(feuilles, tableaux) {
  const donnees = {}, sources = [], erreurs = [];
  for (const f of feuilles) {
    const lignes = f.lignes.filter((l) => l && l.some((x) => String(x).trim() !== ''));
    const ou = f.nom && f.nom !== f.fichier ? `${f.fichier} (onglet « ${f.nom} »)` : f.fichier;
    if (!lignes.length) continue;
    const entetes = lignes[0].map((x) => String(x).trim()), nomF = sans(`${f.nom || ''} ${f.fichier}`);
    const cands = tableaux.map((t) => {
      const col = associer(entetes, t), manque = t.colonnes.filter((c) => c.requis && !(c.id in col));
      const parNom = [t.nom, t.id, ...(t.alias || [])].some((a) => nomF.includes(sans(a)));
      return { t, col, manque, score: Object.keys(col).length + (parNom ? 2 : 0) - manque.length * 3 };
    }).sort((a, b) => b.score - a.score);
    const best = cands[0];
    if (!best || Object.keys(best.col).length === 0) { erreurs.push(`${ou} : tableau non reconnu (en-têtes lus : ${entetes.filter(Boolean).map((x) => `« ${x} »`).join(', ') || 'aucun'}). Attendu : ${tableaux.map((t) => t.nom).join(', ')}. Partez d'un modèle ci-dessus.`); continue; }
    const { t, col, manque } = best;
    if (manque.length) { erreurs.push(`${ou} (lu comme « ${t.nom} ») : colonne${manque.length > 1 ? 's' : ''} ${manque.map((c) => `« ${c.nom} »`).join(', ')} introuvable${manque.length > 1 ? 's' : ''} (en-têtes lus : ${entetes.filter(Boolean).map((x) => `« ${x} »`).join(', ')}).`); continue; }
    if (donnees[t.id]) { erreurs.push(`${ou} : le tableau « ${t.nom} » est déjà fourni par ${sources.find((s) => s.table === t.id).ou}. Gardez un seul fichier par tableau.`); continue; }
    const rows = [], idxL = f.lignes.indexOf(lignes[0]);
    for (let k = 1; k < lignes.length; k++) {
      const L = lignes[k], n = f.lignes.indexOf(L, idxL) + 1, o = {};
      for (const c of t.colonnes) {
        if (!(c.id in col)) continue;
        const brut = L[col[c.id]] ?? '', vide = String(brut).trim() === '';
        if (vide) { if (c.requis) erreurs.push(`${t.nom} · ligne ${n} · colonne « ${entetes[col[c.id]]} » : valeur manquante.`); continue; }
        const r = CONV[c.type || 'texte'](brut);
        if (r.err) { erreurs.push(`${t.nom} · ligne ${n} · colonne « ${entetes[col[c.id]]} » : ${r.err}.`); continue; }
        if ((c.min !== undefined && r.val < c.min) || (c.max !== undefined && r.val > c.max)) { erreurs.push(`${t.nom} · ligne ${n} · colonne « ${entetes[col[c.id]]} » : ${FORMAT[c.type](r.val)} est hors limites (${c.min ?? '…'} à ${c.max ?? '…'}).`); continue; }
        o[c.id] = r.val;
      }
      o._ligne = n; rows.push(o);
    }
    if (t.verifier) for (const o of rows) { const m = t.verifier(o); if (m) erreurs.push(`${t.nom} · ligne ${o._ligne} : ${m}`); }
    const garde = t.max ? rows.slice(0, t.max) : rows;
    donnees[t.id] = garde;
    sources.push({ ou, table: t.id, nom: t.nom, lignes: rows.length, coupe: rows.length - garde.length, colonnes: Object.keys(col).map((id) => [t.colonnes.find((c) => c.id === id).nom, entetes[col[id]]]) });
  }
  return { donnees, sources, erreurs };
}

// ---------- écran d'import ----------
const IC = (d, w = 16) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const IC_IMPORT = IC('<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>');
const IC_FICHIER = IC('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>');
const IC_CADENAS = IC('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>');

export function installerImport({ cle, nom, tableaux, apercu = () => [], hote }) {
  const params = new URLSearchParams(location.search), actif = lireImport(cle);
  // bouton d'en-tête
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'bt-entete bt-import'; b.id = 'btn-import'; b.title = 'Essayez avec vos données (rien n\'est envoyé)';
  b.innerHTML = `${IC_IMPORT}<span>Vos données</span>`;
  hote.prepend(b);
  b.addEventListener('click', () => ouvrir());
  // bandeau « Vos données »
  if (actif) {
    const band = document.querySelector('.bandeau-demo');
    if (band) {
      band.classList.add('vos-donnees');
      band.innerHTML = `${IC_CADENAS}<b>Vos données</b> · uniquement dans ce navigateur${actif.garde ? ' (gardées sur cet appareil)' : ''}<span>— ${esc(actif.sources.map((s) => s.nom).join(', '))} importé${actif.sources.length > 1 ? 's' : ''} ; le reste de la démo reste fictif</span><button type="button" class="bd-retour" id="bd-retour">Revenir à la démo</button>`;
      band.querySelector('#bd-retour').addEventListener('click', () => { effacerImport(cle); location.replace(sansParam('import')); });
    }
  }
  const etat = { feuilles: [], res: null, lecture: 0 };
  function ouvrir() {
    fenetre.ouvrir({
      titre: 'Essayez avec vos données', sous: `${nom} · vos fichiers sont lus dans ce navigateur, rien n'est envoyé`, large: true, cle: 'import',
      corps: `<div class="imp">
        <p class="imp-garantie">${IC_CADENAS}<span><b>Rien ne quitte votre navigateur.</b> Le fichier est lu ici, sur votre appareil : il n'est envoyé à aucun serveur, ni à nous. Fermez l'onglet et tout disparaît (sauf si vous cochez « Garder sur cet appareil »).</span></p>
        <label class="imp-depot" id="imp-depot" tabindex="0"><input type="file" id="imp-fichier" accept=".csv,.txt,.xlsx" multiple hidden>${IC_IMPORT.replace(/16/g, '28')}<b>Déposez vos fichiers CSV ou Excel (.xlsx)</b><small>ou cliquez pour les choisir · un fichier par tableau, ou un classeur avec un onglet par tableau</small></label>
        <div class="imp-modeles"><span>Modèles à remplir :</span>${tableaux.map((t) => `<a href="#" data-modele="${t.id}">${IC_FICHIER}${esc(t.nom)}.csv</a>`).join('')}<button type="button" class="imp-exemple" data-exemple>Essayer l'exemple</button></div>
        <div class="imp-attendu">${tableaux.map((t) => `<div><b>${esc(t.nom)}</b><small>${t.colonnes.map((c) => esc(c.nom) + (c.requis ? '' : ' <i>(facultatif)</i>')).join(' · ')}</small></div>`).join('')}</div>
        <div id="imp-res" aria-live="polite"></div>
      </div>`,
      pied: `<label class="imp-garder"><input type="checkbox" id="imp-garder"> Garder sur cet appareil</label><button type="button" class="pg-bt" data-imp-vider>Effacer</button><button type="button" class="pg-bt prim" data-imp-appliquer disabled>Appliquer à la démo</button>`,
    });
    const voile = document.querySelector('.fen-voile');
    if (!voile._imp) { voile._imp = true; brancher(voile); }
    rendre();
  }
  function brancher(voile) {
    voile.addEventListener('change', (ev) => { if (ev.target.id === 'imp-fichier') { ajouter([...ev.target.files]); ev.target.value = ''; } });
    voile.addEventListener('click', (ev) => {
      if (fenetre.cle() !== 'import') return;
      const m = ev.target.closest('[data-modele]');
      if (m) { ev.preventDefault(); const t = tableaux.find((x) => x.id === m.dataset.modele); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + t.modele], { type: 'text/csv;charset=utf-8' })); a.download = `${t.nom}.csv`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); return; }
      if (ev.target.closest('[data-exemple]')) { etat.feuilles = tableaux.map((t) => ({ fichier: `${t.nom}.csv (exemple)`, nom: '', lignes: lireCSV(t.modele) })); rendre(); return; }
      if (ev.target.closest('[data-imp-vider]')) { etat.feuilles = []; rendre(); return; }
      if (ev.target.closest('[data-imp-appliquer]') && etat.res && !etat.res.erreurs.length) appliquer();
    });
    for (const t of ['dragenter', 'dragover']) voile.addEventListener(t, (ev) => { const d = ev.target.closest && ev.target.closest('#imp-depot'); if (d) { ev.preventDefault(); d.classList.add('survol'); } });
    voile.addEventListener('dragleave', (ev) => { const d = ev.target.closest && ev.target.closest('#imp-depot'); if (d) d.classList.remove('survol'); });
    voile.addEventListener('drop', (ev) => { const d = ev.target.closest && ev.target.closest('#imp-depot'); if (!d) return; ev.preventDefault(); d.classList.remove('survol'); ajouter([...ev.dataTransfer.files]); });
    voile.addEventListener('keydown', (ev) => { if (ev.target.id === 'imp-depot' && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); voile.querySelector('#imp-fichier').click(); } });
  }
  async function ajouter(fichiers) {
    const n = ++etat.lecture, nouvelles = [], erreursLecture = [];
    for (const f of fichiers) {
      try {
        const buf = await f.arrayBuffer();
        if (/\.xlsx$/i.test(f.name)) (await lireXLSX(buf)).forEach((s) => nouvelles.push({ fichier: f.name, nom: s.nom, lignes: s.lignes }));
        else if (/\.(csv|txt)$/i.test(f.name)) nouvelles.push({ fichier: f.name, nom: '', lignes: lireCSV(decoder(buf)) });
        else erreursLecture.push(`${f.name} : format non pris en charge. Enregistrez-le en .csv ou .xlsx (un ancien .xls ou un .ods se réenregistre depuis Excel ou LibreOffice).`);
      } catch (e) { erreursLecture.push(`${f.name} : lecture impossible (${e.message || 'fichier abîmé'}).`); }
    }
    if (n !== etat.lecture) return;
    const noms = new Set(nouvelles.map((x) => x.fichier));
    etat.feuilles = [...etat.feuilles.filter((x) => !noms.has(x.fichier) && !/\(exemple\)$/.test(x.fichier)), ...nouvelles];
    etat.erreursLecture = erreursLecture;
    rendre();
  }
  function rendre() {
    const zone = document.getElementById('imp-res'), bt = document.querySelector('[data-imp-appliquer]');
    if (!zone) return;
    const lect = etat.erreursLecture || []; etat.erreursLecture = [];
    if (!etat.feuilles.length && !lect.length) { etat.res = null; zone.innerHTML = ''; bt.disabled = true; return; }
    const r = analyser(etat.feuilles, tableaux); r.erreurs.unshift(...lect); etat.res = r;
    const ok = !r.erreurs.length && r.sources.length;
    let h = `<h3 class="imp-h">Aperçu avant d'appliquer</h3><ul class="imp-sources">${r.sources.map((s) => `<li>${IC_FICHIER}<span><b>${esc(s.ou)}</b> → ${esc(s.nom)} · ${s.lignes} ligne${s.lignes > 1 ? 's' : ''}${s.coupe ? ` (${s.coupe} au-delà de la limite ignorée${s.coupe > 1 ? 's' : ''})` : ''}<small>${s.colonnes.map(([a, b]) => a === b ? esc(a) : `${esc(a)} ← « ${esc(b)} »`).join(' · ')}</small></span></li>`).join('')}</ul>`;
    if (r.erreurs.length) h += `<div class="imp-erreurs" role="alert"><b>${r.erreurs.length} erreur${r.erreurs.length > 1 ? 's' : ''} à corriger dans le fichier, puis déposez-le à nouveau :</b><ul>${r.erreurs.slice(0, 30).map((e) => `<li>${esc(e)}</li>`).join('')}${r.erreurs.length > 30 ? `<li>… et ${r.erreurs.length - 30} autres.</li>` : ''}</ul></div>`;
    if (ok) {
      let notes = []; try { notes = apercu(r.donnees) || []; } catch (e) { notes = ['Aperçu indisponible : ' + e.message]; }
      if (notes.length) h += `<div class="imp-notes"><b>Ce que la démo va faire de vos données</b><ul>${notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
      h += r.sources.map((s) => { const t = tableaux.find((x) => x.id === s.table), cols = t.colonnes.filter((c) => r.donnees[t.id].some((o) => c.id in o)), L = r.donnees[t.id];
        return `<div class="imp-table"><b>${esc(t.nom)}</b><div class="imp-defile"><table><thead><tr>${cols.map((c) => `<th>${esc(c.nom)}</th>`).join('')}</tr></thead><tbody>${L.slice(0, 8).map((o) => `<tr>${cols.map((c) => `<td>${c.id in o ? esc(FORMAT[c.type || 'texte'](o[c.id])) : '—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${L.length > 8 ? `<small>… et ${L.length - 8} autres lignes</small>` : ''}</div>`; }).join('');
    }
    zone.innerHTML = h; bt.disabled = !ok;
  }
  function appliquer() {
    const garder = document.getElementById('imp-garder').checked, r = etat.res;
    ecrire(cle, { v: 1, date: new Date().toISOString(), sources: r.sources.map(({ ou, table, nom, lignes }) => ({ ou, table, nom, lignes })), donnees: r.donnees }, garder);
    location.replace(sansParam('import'));
  }
  if (params.get('import') === '1') requestAnimationFrame(() => ouvrir());
  return { ouvrir, actif };
}
export function sansParam(p) { const u = new URL(location.href); u.searchParams.delete(p); return u.pathname + (u.search || '') + u.hash; }
