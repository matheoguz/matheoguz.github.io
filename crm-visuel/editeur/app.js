// Éditeur de maquette « depuis un plan » : assemble la vue 2D, la vue 3D, la bibliothèque, le panneau des propriétés,
// l'historique, la sauvegarde locale et les imports / exports. Tout reste dans le navigateur.
import { FAMILLES, MODELES, TYPES, dessiner2d } from './catalogue.js';
import { vide, normaliser, versJSON, creerHistorique, sauverLocal, lireLocal, cloner, nouvelId, dist, surface } from './modele.js';
import { creerPlan2d } from './plan2d.js';
import { planExemple, magasinExemple, BARRE, COINS } from './exemple.js';

const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const MOBILE = matchMedia('(max-width: 899px)');
const LIB_TYPES = { rayon: 'Rayon', caisse: 'Caisse', froid: 'Froid', stockage: 'Stockage', comptoir: 'Comptoir / accueil', poste: 'Poste de travail', mobilier: 'Mobilier', salle: 'Salle', vehicule: 'Véhicule', parking: 'Place de parking', cuisine: 'Cuisine', circulation: 'Circulation', decor: 'Décor', ecran: 'Écran', sanitaire: 'Sanitaires', personne: 'Personne / poste', zone: 'Zone' };
const TYPES_ZONE = { zone: 'Zone', vente: 'Surface de vente', accueil: 'Accueil', reserve: 'Réserve', bureau: 'Bureau', atelier: 'Atelier', parking: 'Parking', cuisine: 'Cuisine', salle: 'Salle', circulation: 'Circulation' };
const AIDES = { selection: 'Sélection : cliquer un élément, glisser pour déplacer, Maj pour en choisir plusieurs, glisser dans le vide pour encadrer.', main: 'Se déplacer : glisser pour bouger la vue, molette pour zoomer.',
  mur: 'Mur : un clic à chaque angle ; Maj = angle droit ; double-clic, Entrée ou Échap pour finir ; revenir au premier point ferme le contour.', porte: 'Porte : survoler un mur et cliquer.', fenetre: 'Fenêtre : survoler un mur et cliquer.',
  zone: 'Zone : un clic à chaque angle ; revenir au premier point, double-clic ou Entrée pour finir, puis la nommer à droite.', mesure: 'Mesurer : deux clics.', echelle: 'Échelle : cliquer deux points du plan dont vous connaissez la distance (une cote, la barre d\'échelle), puis saisir la vraie distance.' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const n2 = (v) => (Math.round(v * 100) / 100);
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'maquette';

let vue3d = null; // chargée à la demande (Three.js)
const historique = creerHistorique();
const ed = { doc: vide(), sel: new Set(), outil: 'selection', accroche: true, nuit: false, mode: '2d', rappels: {} };
const plan = creerPlan2d($('#plan'), ed);

// ---------- valider / aperçu ----------
let t3d = 0, tSauve = 0;
function maj3d(vite) { if (!vue3d || ed.mode === '2d') return; clearTimeout(t3d); t3d = setTimeout(() => vue3d.maj(ed.doc), vite ? 0 : 180); }
function valider(libelle, { props = true, garderDate = false } = {}) {
  if (!garderDate) ed.doc.modifie = new Date().toISOString();
  historique.pousser(ed.doc); boutonsHisto();
  clearTimeout(tSauve); tSauve = setTimeout(sauver, 300);
  if (props) proprietes();
  plan.dessiner(); maj3d(); accueil();
}
function sauver() {
  const r = sauverLocal(ed.doc), h = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  $('#sauvegarde').textContent = r === 'ok' ? `Sauvegardé dans ce navigateur à ${h}` : r === 'sans-plan' ? `Sauvegardé à ${h}, sans l'image du plan (trop lourde) : pensez à exporter le projet` : 'Sauvegarde locale impossible ici : exportez le projet (.json)';
}
ed.rappels = {
  valider: (l) => valider(l),
  apercu: () => { maj3d(); if (ed.sel.size === 1) majChampsSel(); },
  selection: () => { proprietes(); plan.dessiner(); },
  echelle: (a, b) => demanderEchelle(a, b),
  zoneCreee: () => { choisirOutil('selection'); proprietes(); setTimeout(() => { const i = $('#p-nom'); if (i) { i.focus(); i.select(); } }, 0); },
};
function remplacerDoc(doc, libelle) { ed.doc = doc; ed.sel = new Set(); plan.annulerTrace(); valider(libelle, { garderDate: true }); $('#nom').value = doc.nom; calquesUI(); plan.cadrer(); if (vue3d) { vue3d.maj(doc); vue3d.cadrer(); } }
function boutonsHisto() { $('#b-annuler').disabled = !historique.peutAnnuler; $('#b-retablir').disabled = !historique.peutRetablir; }
function deplacerHisto(d) {
  if (!d) return; ed.doc = d; const ids = new Set([...d.murs, ...d.ouvertures, ...d.zones, ...d.objets].map((e) => e.id)); ed.sel = new Set([...ed.sel].filter((i) => ids.has(i)));
  plan.annulerTrace(); boutonsHisto(); clearTimeout(tSauve); tSauve = setTimeout(sauver, 300); $('#nom').value = d.nom; calquesUI(); proprietes(); plan.dessiner(); maj3d(true); accueil();
}
const annuler = () => deplacerHisto(historique.annuler()), retablir = () => deplacerHisto(historique.retablir());

function toast(txt, ms = 4200) { const t = $('#toast'); t.textContent = txt; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), ms); }
function accueil() { const d = ed.doc; $('#accueil').hidden = !!(d.plan || d.murs.length || d.objets.length || d.zones.length); }

// ---------- outils, modes, calques ----------
function choisirOutil(o) {
  if (o === 'echelle' && !ed.doc.plan) { toast('Importez d\'abord un plan (Fichier › Importer un plan, ou Exemples › Plan d\'exemple).'); return; }
  plan.annulerTrace(); ed.outil = o; $$('#outils button').forEach((b) => b.classList.toggle('actif', b.dataset.outil === o));
  $('#aide-outil').textContent = AIDES[o]; $('#plan').style.cursor = o === 'selection' ? '' : o === 'main' ? 'grab' : 'crosshair'; $('#f-echelle').hidden = true; plan.dessiner();
}
$$('#outils button').forEach((b) => b.addEventListener('click', () => choisirOutil(b.dataset.outil)));
$('#accroche').addEventListener('change', (e) => { ed.accroche = e.target.checked; });
async function choisirMode(m) {
  if (MOBILE.matches) m = '3d';
  ed.mode = m; $('#vues').className = 'vues mode-' + m; $$('.modes button').forEach((b) => b.classList.toggle('actif', b.dataset.mode === m));
  if (m !== '2d') { if (!vue3d) { const { creerVue3d } = await import('./vue3d.js'); vue3d = creerVue3d($('#vue3d')); vue3d.theme(ed.nuit); vue3d.maj(ed.doc); window.editeur.vue3d = vue3d; } else maj3d(true); }
  // la taille des vues change : on recadre les deux
  requestAnimationFrame(() => { plan.cadrer(); if (vue3d && m !== '2d') { vue3d.taille(); vue3d.cadrer(); } });
}
$$('.modes button').forEach((b) => b.addEventListener('click', () => choisirMode(b.dataset.mode)));
function calquesUI() { $$('#calques input').forEach((i) => (i.checked = ed.doc.calques[i.dataset.calque])); }
$$('#calques input').forEach((i) => i.addEventListener('change', () => { ed.doc.calques[i.dataset.calque] = i.checked; if (!i.checked) ed.sel = new Set(); valider('Calque'); }));
$('#b-cadrer3d').addEventListener('click', () => vue3d && vue3d.cadrer());

// ---------- bibliothèque ----------
function vignette(modele) {
  const M = MODELES[modele], c = document.createElement('canvas'); c.width = 144; c.height = 80; const g = c.getContext('2d');
  if (M.outil) { g.strokeStyle = '#1f2b4d'; g.lineWidth = 8; g.beginPath(); g.moveTo(8, 60); g.lineTo(136, 60); g.stroke(); g.strokeStyle = M.outil === 'porte' ? '#475569' : '#38bdf8'; g.clearRect(48, 50, 48, 20); g.fillStyle = '#fff'; g.fillRect(48, 54, 48, 12); g.lineWidth = 2; g.beginPath(); if (M.outil === 'porte') { g.moveTo(48, 60); g.lineTo(48, 14); g.arc(48, 60, 46, -Math.PI / 2, 0); } else { g.moveTo(48, 57); g.lineTo(96, 57); g.moveTo(48, 63); g.lineTo(96, 63); } g.stroke(); return c; }
  const o = { id: modele, modele, largeur: M.l, profondeur: M.p, couleur: M.couleur }, k = Math.min(128 / M.l, 64 / M.p, 60);
  g.translate(72, 40); g.scale(k, k); dessiner2d(g, o, 1 / k); return c;
}
$('#biblio').innerHTML = FAMILLES.map((f, i) => `<details${i < 2 ? ' open' : ''}><summary>${esc(f.nom)}</summary><div class="items">${f.modeles.map((m) => `<div class="item" draggable="true" data-modele="${m}" role="button" tabindex="0" title="${esc(MODELES[m].nom)}${MODELES[m].l ? ` · ${MODELES[m].l} × ${MODELES[m].p} m` : ''}"><span class="vig"></span>${esc(MODELES[m].nom)}</div>`).join('')}</div></details>`).join('');
$$('#biblio .item').forEach((el) => {
  el.querySelector('.vig').replaceWith(vignette(el.dataset.modele));
  const M = MODELES[el.dataset.modele];
  const poser = () => { if (M.outil) { choisirOutil(M.outil); return; } if (ed.mode === '3d') choisirMode('split'); choisirOutil('selection'); plan.poser(el.dataset.modele); };
  el.addEventListener('click', poser); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poser(); } });
  el.addEventListener('dragstart', (e) => { if (M.outil) { e.preventDefault(); choisirOutil(M.outil); return; } e.dataTransfer.setData('text/x-modele', el.dataset.modele); e.dataTransfer.effectAllowed = 'copy'; });
});

// ---------- propriétés ----------
const trouver = (id) => { for (const k of ['objets', 'murs', 'ouvertures', 'zones']) { const e = ed.doc[k].find((x) => x.id === id); if (e) return [k, e]; } return [null, null]; };
const choisis = () => [...ed.sel].map(trouver).filter(([k]) => k);
const champ = (lib, html) => `<label class="champ"><span>${lib}</span>${html}</label>`;
const num = (cle, v, { min = 0, max = 1000, pas = 0.05 } = {}) => `<input type="number" data-c="${cle}" value="${n2(v)}" min="${min}" max="${max}" step="${pas}">`;
const sel = (cle, v, options) => `<select data-c="${cle}">${Object.entries(options).map(([k, l]) => `<option value="${k}"${k === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
function proprietes() {
  const s = choisis(), P = $('#props'), d = ed.doc;
  if (!s.length) {
    const pl = d.plan, longueur = d.murs.reduce((a, m) => a + dist(m.a, m.b), 0), surf = d.zones.reduce((a, z) => a + surface(z.points), 0);
    const parType = {}; d.objets.forEach((o) => (parType[o.type] = (parType[o.type] || 0) + 1));
    P.innerHTML = `<div class="groupe"><h3>Projet</h3>
      ${champ('Hauteur murs', num('r.hauteurMurs', d.reglages.hauteurMurs, { min: 1, max: 12, pas: 0.1 }))}
      ${champ('Épaisseur', num('r.epaisseurMurs', d.reglages.epaisseurMurs, { min: 0.05, max: 1.5, pas: 0.05 }))}
      <p class="note">L'épaisseur sert aux prochains murs tracés. Hauteur en mètres.</p></div>
      <div class="groupe"><h3>Plan de fond</h3>${pl ? `
        ${champ('Opacité', `<input type="range" data-c="p.opacite" min="0" max="1" step="0.05" value="${pl.opacite}">`)}
        ${champ('Rotation', `<input type="range" data-c="p.rotation" min="-180" max="180" step="0.5" value="${pl.rotation}">`)}
        <div class="btns" style="margin-bottom:8px"><button data-a="rot-90">−90°</button><button data-a="rot+90">+90°</button><button data-a="rot0">0°</button></div>
        <p class="note">Recadrer (part retirée de chaque bord)</p>
        <div class="duo">${['gauche', 'droite', 'haut', 'bas'].map((k) => champ(k[0].toUpperCase(), `<input type="range" data-c="p.r.${k}" min="0" max="0.45" step="0.01" value="${pl.recadrage[k]}" aria-label="Recadrer ${k}">`)).join('')}</div>
        <div class="btns"><button class="principal" data-a="echelle">Régler l'échelle (2 clics)</button></div>
        <p class="note ${pl.echelleFixee ? 'ok' : 'att'}">${pl.echelleFixee ? `Échelle réglée : 1 m = ${Math.round(1 / pl.echelle)} pixels du plan` : 'Échelle pas encore réglée : cliquez deux points connus du plan.'}</p>
        <div class="btns" style="margin-top:8px"><button data-a="plan-import">Remplacer</button><button class="danger" data-a="plan-retirer">Retirer</button></div>`
        : `<p class="note">Une photo du plan d'évacuation ou un croquis, à décalquer.</p><div class="btns"><button class="principal" data-a="plan-import">Importer un plan</button><button data-a="ex-plan">Plan d'exemple</button></div>`}</div>
      <div class="groupe"><h3>Résumé</h3>
        <div class="stat"><span>Murs</span><b>${d.murs.length} · ${n2(longueur).toLocaleString('fr-FR')} m</b></div>
        <div class="stat"><span>Portes et fenêtres</span><b>${d.ouvertures.length}</b></div>
        <div class="stat"><span>Zones</span><b>${d.zones.length} · ${Math.round(surf)} m²</b></div>
        <div class="stat"><span>Objets</span><b>${d.objets.length}</b></div>
        ${Object.entries(parType).map(([t, n]) => `<div class="stat" style="padding-left:10px;color:var(--doux)"><span>${esc(LIB_TYPES[t] || t)}</span><b>${n}</b></div>`).join('')}
      </div>`;
  } else if (s.length > 1) {
    const objs = s.filter(([k]) => k === 'objets').length;
    P.innerHTML = `<div class="groupe"><h2>${s.length} éléments choisis</h2><p class="sous">${objs} objet${objs > 1 ? 's' : ''}</p>
      ${objs > 1 ? `<h3>Aligner</h3><div class="aligner"><button data-a="al-g" title="À gauche">Gauche</button><button data-a="al-ch" title="Centrer horizontalement">Centre ↔</button><button data-a="al-d" title="À droite">Droite</button><button data-a="rep-h" title="Répartir horizontalement">Répartir ↔</button>
      <button data-a="al-h" title="En haut">Haut</button><button data-a="al-cv" title="Centrer verticalement">Centre ↕</button><button data-a="al-b" title="En bas">Bas</button><button data-a="rep-v" title="Répartir verticalement">Répartir ↕</button></div>` : ''}
      <div class="btns" style="margin-top:12px"><button data-a="dupliquer">Dupliquer (Ctrl+D)</button><button class="danger" data-a="supprimer">Supprimer</button></div></div>`;
  } else {
    const [k, e] = s[0];
    if (k === 'objets') P.innerHTML = `<div class="groupe"><h2>${esc(e.nom)}</h2><p class="sous">${esc(MODELES[e.modele].nom)}</p>
      ${champ('Nom', `<input id="p-nom" data-c="nom" value="${esc(e.nom)}" maxlength="120">`)}
      ${champ('Type', sel('type', e.type, Object.fromEntries(TYPES.map((t) => [t, LIB_TYPES[t]]))))}
      <p class="note">Le type sert à brancher les données ensuite (ventes d'un rayon, file d'une caisse…).</p></div>
      <div class="groupe"><h3>Position</h3><div class="duo">${champ('X', num('x', e.x, { min: -1000, pas: 0.1 }))}${champ('Y', num('y', e.y, { min: -1000, pas: 0.1 }))}</div>
      ${champ('Rotation', num('rotation', e.rotation, { min: -360, max: 360, pas: 15 }))}</div>
      <div class="groupe"><h3>Dimensions (m)</h3>${champ(e.type === 'rayon' ? 'Longueur' : 'Largeur', num('largeur', e.largeur, { min: 0.05, pas: 0.1 }))}${champ('Profondeur', num('profondeur', e.profondeur, { min: 0.05, pas: 0.1 }))}${champ('Hauteur', num('hauteur', e.hauteur, { min: 0.01, max: 20, pas: 0.1 }))}
      ${champ('Couleur', `<input type="color" data-c="couleur" value="${e.couleur}">`)}</div>
      <div class="groupe btns"><button data-a="tourner">Tourner 90° (R)</button><button data-a="dupliquer">Dupliquer (Ctrl+D)</button><button class="danger" data-a="supprimer">Supprimer</button></div>`;
    if (k === 'murs') P.innerHTML = `<div class="groupe"><h2>Mur</h2><p class="sous">${d.ouvertures.filter((o) => o.mur === e.id).length} ouverture(s)</p>
      ${champ('Longueur', num('longueur', dist(e.a, e.b), { min: 0.05, pas: 0.05 }))}${champ('Épaisseur', num('epaisseur', e.epaisseur, { min: 0.05, max: 1.5, pas: 0.05 }))}
      <p class="note">Changer la longueur déplace la 2ᵉ extrémité. Poignées : glisser les bouts (les murs reliés suivent).</p></div>
      <div class="groupe btns"><button data-a="porte-milieu">Porte au milieu</button><button data-a="fenetre-milieu">Fenêtre au milieu</button><button class="danger" data-a="supprimer">Supprimer</button></div>`;
    if (k === 'ouvertures') P.innerHTML = `<div class="groupe"><h2>${e.type === 'porte' ? 'Porte' : 'Fenêtre'}</h2><p class="sous">Sur un mur de ${n2(dist(...(([m]) => [m.a, m.b])(d.murs.filter((m) => m.id === e.mur)))).toLocaleString('fr-FR')} m</p>
      ${champ('Type', sel('type', e.type, { porte: 'Porte', fenetre: 'Fenêtre' }))}${champ('Largeur', num('largeur', e.largeur, { min: 0.3, max: 20 }))}${champ('Hauteur', num('hauteur', e.hauteur, { min: 0.2, max: 10 }))}
      ${e.type === 'fenetre' ? champ('Allège', num('allege', e.allege, { min: 0, max: 5 })) : ''}${champ('Position', num('position', e.position, { min: 0, pas: 0.05 }))}
      <p class="note">Position du milieu, depuis le début du mur. On peut aussi la glisser le long du mur.</p></div>
      <div class="groupe btns"><button class="danger" data-a="supprimer">Supprimer</button></div>`;
    if (k === 'zones') P.innerHTML = `<div class="groupe"><h2>${esc(e.nom)}</h2><p class="sous">${n2(surface(e.points)).toLocaleString('fr-FR')} m² · ${e.points.length} angles</p>
      ${champ('Nom', `<input id="p-nom" data-c="nom" value="${esc(e.nom)}" maxlength="120" placeholder="Réserve, Accueil…">`)}${champ('Type', sel('type', e.type, TYPES_ZONE))}${champ('Couleur', `<input type="color" data-c="couleur" value="${e.couleur}">`)}
      <p class="note">Glisser les poignées pour ajuster les angles.</p></div>
      <div class="groupe btns"><button data-a="dupliquer">Dupliquer</button><button class="danger" data-a="supprimer">Supprimer</button></div>`;
  }
}
function majChampsSel() { const [k, e] = choisis()[0] || []; if (k !== 'objets') return; for (const c of ['x', 'y', 'rotation', 'largeur', 'profondeur']) { const i = $(`#props [data-c="${c}"]`); if (i && document.activeElement !== i) i.value = n2(e[c]); } }
function appliquerChamp(i, final) {
  const c = i.dataset.c, d = ed.doc, v = i.type === 'number' || i.type === 'range' ? Number(i.value) : i.value;
  if ((i.type === 'number' || i.type === 'range') && !Number.isFinite(v)) return;
  if (c.startsWith('r.')) { d.reglages[c.slice(2)] = Math.max(Number(i.min) || 0, v); }
  else if (c.startsWith('p.')) { if (c.startsWith('p.r.')) d.plan.recadrage[c.slice(4)] = v; else d.plan[c.slice(2)] = v; }
  else {
    const [k, e] = choisis()[0]; if (!e) return;
    if (k === 'murs' && c === 'longueur') { const L = dist(e.a, e.b) || 1, f = Math.max(0.05, v) / L; e.b = { x: n2(e.a.x + (e.b.x - e.a.x) * f), y: n2(e.a.y + (e.b.y - e.a.y) * f) }; }
    else if (typeof v === 'number') e[c] = c === 'rotation' ? ((v % 360) + 360) % 360 : v; else e[c] = v;
    if (final && c === 'nom') { const h = $('#props h2'); if (h) h.textContent = v; }
  }
  if (final) valider('Propriété', { props: c === 'type' && i.closest('#props') && choisis()[0] && choisis()[0][0] === 'ouvertures' }); else { plan.dessiner(); maj3d(); }
}
$('#props').addEventListener('input', (e) => { if (e.target.dataset.c) appliquerChamp(e.target, false); });
$('#props').addEventListener('change', (e) => { if (e.target.dataset.c) appliquerChamp(e.target, true); });
$('#props').addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b) action(b.dataset.a); });

// ---------- actions ----------
function etendue(o) { const a = o.rotation * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)); return { hx: (c * o.largeur + s * o.profondeur) / 2, hy: (s * o.largeur + c * o.profondeur) / 2 }; }
function aligner(sens) {
  const os = choisis().filter(([k]) => k === 'objets').map(([, o]) => o); if (os.length < 2) return;
  const E = os.map((o) => ({ o, ...etendue(o) }));
  const g = Math.min(...E.map((e) => e.o.x - e.hx)), dr = Math.max(...E.map((e) => e.o.x + e.hx)), h = Math.min(...E.map((e) => e.o.y - e.hy)), b = Math.max(...E.map((e) => e.o.y + e.hy));
  const mx = E.reduce((a, e) => a + e.o.x, 0) / E.length, my = E.reduce((a, e) => a + e.o.y, 0) / E.length;
  for (const e of E) { if (sens === 'al-g') e.o.x = n2(g + e.hx); if (sens === 'al-d') e.o.x = n2(dr - e.hx); if (sens === 'al-ch') e.o.x = n2(mx); if (sens === 'al-h') e.o.y = n2(h + e.hy); if (sens === 'al-b') e.o.y = n2(b - e.hy); if (sens === 'al-cv') e.o.y = n2(my); }
  if (sens.startsWith('rep') && E.length > 2) { const ax = sens === 'rep-h' ? 'x' : 'y'; E.sort((p, q) => p.o[ax] - q.o[ax]); const a0 = E[0].o[ax], a1 = E[E.length - 1].o[ax]; E.forEach((e, i) => (e.o[ax] = n2(a0 + (a1 - a0) * i / (E.length - 1)))); }
  valider('Alignement');
}
function dupliquer() {
  const d = ed.doc, nouv = new Set();
  for (const [k, e] of choisis()) {
    if (k === 'objets') { const c = cloner(e); c.id = nouvelId(d, 'o'); c.x = n2(e.x + 0.5); c.y = n2(e.y + 0.5); c.nom = e.nom.replace(/( \d+)?$/, (m, n) => ' ' + ((n ? Number(n) : 1) + 1)); d.objets.push(c); nouv.add(c.id); }
    if (k === 'zones') { const c = cloner(e); c.id = nouvelId(d, 'z'); c.points = e.points.map((p) => ({ x: n2(p.x + 0.5), y: n2(p.y + 0.5) })); c.nom = e.nom + ' (copie)'; d.zones.push(c); nouv.add(c.id); }
  }
  if (nouv.size) { ed.sel = nouv; valider('Duplication'); }
}
function supprimer() {
  if (!ed.sel.size) return; const d = ed.doc, s = ed.sel;
  d.objets = d.objets.filter((o) => !s.has(o.id)); d.zones = d.zones.filter((z) => !s.has(z.id)); d.murs = d.murs.filter((m) => !s.has(m.id));
  const murs = new Set(d.murs.map((m) => m.id)); d.ouvertures = d.ouvertures.filter((o) => !s.has(o.id) && murs.has(o.mur));
  ed.sel = new Set(); valider('Suppression');
}
function tourner(pas) { let n = 0; for (const [k, e] of choisis()) if (k === 'objets') { e.rotation = (((e.rotation + pas) % 360) + 360) % 360; n++; } if (n) valider('Rotation'); }
function pousser(dx, dy) {
  let n = 0; for (const [k, e] of choisis()) { if (k === 'objets') { e.x = n2(e.x + dx); e.y = n2(e.y + dy); } else if (k === 'murs') { for (const c of ['a', 'b']) e[c] = { x: n2(e[c].x + dx), y: n2(e[c].y + dy) }; } else if (k === 'zones') e.points = e.points.map((p) => ({ x: n2(p.x + dx), y: n2(p.y + dy) })); else continue; n++; }
  if (n) valider('Déplacement');
}
function ouvertureMilieu(type) { const [, m] = choisis()[0], d = ed.doc, porte = type === 'porte'; const o = { id: nouvelId(d, 'ou'), type, mur: m.id, position: n2(dist(m.a, m.b) / 2), largeur: porte ? 0.9 : 1.2, hauteur: porte ? 2.1 : 1.2, allege: porte ? 0 : 0.9 }; d.ouvertures.push(o); ed.sel = new Set([o.id]); valider(porte ? 'Porte' : 'Fenêtre'); }
function action(a) {
  const P = ed.doc.plan;
  if (a === 'supprimer') supprimer(); else if (a === 'dupliquer') dupliquer(); else if (a === 'tourner') tourner(90);
  else if (a.startsWith('al-') || a.startsWith('rep-')) aligner(a);
  else if (a === 'porte-milieu') ouvertureMilieu('porte'); else if (a === 'fenetre-milieu') ouvertureMilieu('fenetre');
  else if (a === 'rot-90' || a === 'rot+90') { P.rotation = ((P.rotation + (a === 'rot+90' ? 90 : -90) + 540) % 360) - 180; valider('Plan tourné'); }
  else if (a === 'rot0') { P.rotation = 0; valider('Plan tourné'); }
  else if (a === 'echelle') choisirOutil('echelle');
  else if (a === 'plan-import') $('#in-plan').click();
  else if (a === 'plan-retirer') { ed.doc.plan = null; if (ed.outil === 'echelle') choisirOutil('selection'); valider('Plan retiré'); }
  else if (a === 'ex-plan') chargerPlanExemple();
}

// ---------- échelle ----------
let echellePts = null;
function demanderEchelle(a, b) {
  echellePts = [a, b]; const f = $('#f-echelle'), s = plan.versEcran((a.x + b.x) / 2, (a.y + b.y) / 2), r = $('#plan').getBoundingClientRect();
  f.hidden = false; f.style.left = Math.max(8, Math.min(innerWidth - 310, r.left + s.x - 150)) + 'px'; f.style.top = Math.max(64, Math.min(innerHeight - 140, r.top + s.y + 24)) + 'px';
  $('#f-echelle-info').textContent = `Mesuré sur le plan : ${n2(dist(a, b)).toLocaleString('fr-FR')} m avec l'échelle actuelle.`;
  const i = $('#f-echelle-m'); i.value = ''; i.focus();
}
$('#f-echelle').addEventListener('submit', (e) => {
  e.preventDefault(); const D = Number($('#f-echelle-m').value), P = ed.doc.plan; if (!(D > 0) || !P || !echellePts) return;
  const [a, b] = echellePts, f = D / Math.max(1e-6, dist(a, b));
  P.echelle *= f; P.x = a.x + (P.x - a.x) * f; P.y = a.y + (P.y - a.y) * f; P.echelleFixee = true;
  $('#f-echelle').hidden = true; echellePts = null; choisirOutil('selection'); valider('Échelle réglée'); plan.cadrer();
  toast(`Échelle réglée : 1 m = ${Math.round(1 / P.echelle)} pixels du plan. Tracez maintenant les murs (M).`);
});
$('#f-echelle-annuler').addEventListener('click', () => { $('#f-echelle').hidden = true; plan.annulerTrace(); });

// ---------- plan de fond ----------
function poserPlan({ image, largeurPx, hauteurPx }, largeurM = 20) {
  const e = largeurM / largeurPx;
  ed.doc.plan = { image, largeurPx, hauteurPx, echelle: e, x: largeurPx * e / 2, y: hauteurPx * e / 2, rotation: 0, opacite: 0.6, recadrage: { gauche: 0, droite: 0, haut: 0, bas: 0 }, echelleFixee: false };
  ed.sel = new Set(); valider('Plan importé'); plan.cadrer(); choisirOutil('echelle');
  toast('Plan posé. Réglez l\'échelle : cliquez deux points dont vous connaissez la distance, puis saisissez-la.', 6000);
}
$('#in-plan').addEventListener('change', (ev) => {
  const f = ev.target.files[0]; ev.target.value = ''; if (!f) return;
  if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) { toast('Un PDF ne se lit pas directement ici : ouvrez-le, faites une capture d\'écran de la page (ou « Exporter en image »), puis importez l\'image.', 7000); return; }
  const url = URL.createObjectURL(f), img = new Image();
  img.onload = () => {
    const k = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
    poserPlan({ image: c.toDataURL('image/jpeg', 0.86), largeurPx: w, hauteurPx: h });
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast('Cette image ne s\'ouvre pas. Essayez une photo JPG ou PNG.'); };
  img.src = url;
});
function chargerPlanExemple() { poserPlan(planExemple(), 30); }
function chargerMagasinExemple() {
  const d = magasinExemple(), p = planExemple(), e = 1 / 40;
  d.plan = { ...p, echelle: e, x: (p.largeurPx / 2 - 100) * e, y: (p.hauteurPx / 2 - 100) * e, rotation: 0, opacite: 0.3, recadrage: { gauche: 0, droite: 0, haut: 0, bas: 0 }, echelleFixee: true };
  choisirOutil('selection'); remplacerDoc(normaliser(d), 'Magasin d\'exemple');
}

// ---------- fichiers ----------
function telecharger(blob, nom) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nom; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
function exporterJSON() { telecharger(new Blob([versJSON(ed.doc)], { type: 'application/json' }), slug(ed.doc.nom) + '.json'); toast('Projet exporté (.json) : gardez-le, il se réimporte tel quel.'); }
function importerTexte(txt) { const d = normaliser(JSON.parse(txt)); choisirOutil('selection'); remplacerDoc(d, 'Projet importé'); return d; }
$('#in-projet').addEventListener('change', (ev) => { const f = ev.target.files[0]; ev.target.value = ''; if (!f) return; f.text().then((t) => { try { importerTexte(t); toast('Projet importé.'); } catch (e) { toast('Import impossible : ' + e.message); } }); });
async function exporterImage() {
  if (ed.mode === '2d') { await choisirMode('split'); await new Promise((r) => setTimeout(r, 400)); }
  clearTimeout(t3d); vue3d.maj(ed.doc); const b = await vue3d.image(); telecharger(b, slug(ed.doc.nom) + '-3d.png'); toast('Image PNG de la vue 3D enregistrée.');
  return b;
}
const menus = $$('.menu'); menus.forEach((m) => m.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); const l = m.querySelector('.menu-liste'), ouvrir = l.hidden; menus.forEach((x) => (x.querySelector('.menu-liste').hidden = true)); l.hidden = !ouvrir; }));
addEventListener('click', () => menus.forEach((x) => (x.querySelector('.menu-liste').hidden = true)));
$('#b-nouveau').addEventListener('click', () => { if (ed.doc.murs.length + ed.doc.objets.length + ed.doc.zones.length && !confirm('Commencer une nouvelle maquette ? (Annuler avec Ctrl+Z reste possible)')) return; remplacerDoc(vide(), 'Nouvelle maquette'); });
$('#b-importer-plan').addEventListener('click', () => $('#in-plan').click()); $('#acc-plan').addEventListener('click', () => $('#in-plan').click());
$('#b-importer').addEventListener('click', () => $('#in-projet').click());
$('#b-exporter').addEventListener('click', exporterJSON);
$('#b-image').addEventListener('click', exporterImage); $('#b-image-vite').addEventListener('click', exporterImage);
$('#b-ex-plan').addEventListener('click', chargerPlanExemple); $('#acc-ex-plan').addEventListener('click', chargerPlanExemple);
$('#b-ex-magasin').addEventListener('click', chargerMagasinExemple); $('#acc-ex-mag').addEventListener('click', chargerMagasinExemple);
$('#b-annuler').addEventListener('click', annuler); $('#b-retablir').addEventListener('click', retablir);
$('#nom').addEventListener('change', (e) => { ed.doc.nom = e.target.value.trim() || 'Maquette'; valider('Nom'); });
$('#b-aide').addEventListener('click', () => $('#d-aide').showModal());
function theme(nuit) { ed.nuit = nuit; document.body.classList.toggle('nuit', nuit); $('#b-theme').setAttribute('aria-pressed', String(nuit)); try { localStorage.setItem('crm-visuel-editeur-theme', nuit ? 'nuit' : 'clair'); } catch (e) {} if (vue3d) { vue3d.theme(nuit); maj3d(true); } plan.dessiner(); }
$('#b-theme').addEventListener('click', () => theme(!ed.nuit));

// ---------- clavier ----------
addEventListener('keydown', (ev) => {
  const champ = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || $('#d-aide').open, ctrl = ev.ctrlKey || ev.metaKey, k = ev.key.toLowerCase();
  if (ctrl && k === 'z' && !ev.shiftKey && !champ) { ev.preventDefault(); annuler(); return; }
  if (ctrl && (k === 'y' || (k === 'z' && ev.shiftKey)) && !champ) { ev.preventDefault(); retablir(); return; }
  if (champ) { if (ev.key === 'Escape') document.activeElement.blur(); return; }
  if (ctrl && k === 'd') { ev.preventDefault(); dupliquer(); return; }
  if (ctrl && k === 'a') { ev.preventDefault(); const d = ed.doc, C = d.calques; ed.sel = new Set([...(C.objets ? d.objets : []), ...(C.zones ? d.zones : []), ...(C.murs ? d.murs : [])].map((e) => e.id)); proprietes(); plan.dessiner(); return; }
  if (ctrl && k === 's') { ev.preventDefault(); exporterJSON(); return; }
  if (ctrl || ev.altKey) return;
  if (ev.key === 'Escape') { if (!plan.annulerTrace()) { if (ed.outil !== 'selection') choisirOutil('selection'); else { ed.sel = new Set(); proprietes(); plan.dessiner(); } } $('#f-echelle').hidden = true; return; }
  if (ev.key === 'Enter') { plan.finirTrace(); return; }
  if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); supprimer(); return; }
  if (ev.key.startsWith('Arrow') && ed.sel.size) { ev.preventDefault(); const p = ev.shiftKey ? 1 : 0.1; pousser(ev.key === 'ArrowLeft' ? -p : ev.key === 'ArrowRight' ? p : 0, ev.key === 'ArrowUp' ? -p : ev.key === 'ArrowDown' ? p : 0); return; }
  if (k === 'r') { tourner(ev.shiftKey ? 15 : 90); return; }
  const o = { v: 'selection', h: 'main', m: 'mur', p: 'porte', f: 'fenetre', z: 'zone', c: 'mesure', e: 'echelle' }[k]; if (o) { choisirOutil(o); return; }
  if (k === '1' || k === '2' || k === '3') { choisirMode(['2d', 'split', '3d'][Number(k) - 1]); return; }
  if (k === '0') { plan.cadrer(); vue3d && vue3d.cadrer(); return; }
  if (ev.key === '?') $('#d-aide').showModal();
});

// ---------- démarrage ----------
window.editeur = { ed, plan, historique, versJSON: () => versJSON(ed.doc), importerTexte, exporterImage, chargerPlanExemple, chargerMagasinExemple, BARRE, COINS, choisirMode, vue3d: null };
let themeSauve = null; try { themeSauve = localStorage.getItem('crm-visuel-editeur-theme'); } catch (e) {}
theme(themeSauve === 'nuit');
const local = lireLocal();
if (local) { ed.doc = local; } else if (MOBILE.matches) { ed.doc = magasinExemple(); }
historique.pousser(ed.doc); boutonsHisto(); $('#nom').value = ed.doc.nom; calquesUI(); proprietes(); accueil(); choisirOutil('selection');
requestAnimationFrame(() => plan.cadrer());
if (local) $('#sauvegarde').textContent = 'Maquette reprise de la sauvegarde de ce navigateur';
if (MOBILE.matches) choisirMode('3d');
MOBILE.addEventListener('change', () => choisirMode(MOBILE.matches ? '3d' : '2d'));
