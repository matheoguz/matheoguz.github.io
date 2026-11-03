// Briques communes aux deux démos « CRM visuel 3D » : fenêtre (aperçu PDF, résumé du soir), journal des actions,
// sélecteur « Voir en tant que » (accès par rôle). Module ES sans dépendance ; le style est dans interface.css.
//
//   fenetre.ouvrir({ titre, sous, corps, pied, large, cle }) · fenetre.maj(corps) · fenetre.fermer() · fenetre.cle()
//   const J = creerJournal({ hh })   // J.ajouter({ h, qui, role, type, texte }) · J.entrees() · J.vider() · J.rendrePage(corps)
//     type : 'action' (fait par quelqu'un depuis l'écran) | 'alerte' (calculée) | 'journee' (événement de la simulation) | 'acces'
//   const R = installerRoles({ roles, defaut, surChangement })   // R.role() ; roles = [{ id, label, qui, resume }]
//   mailResume({ de, a, objet, intro, blocs: [{ titre, lignes: [[libellé, valeur]], items: [texte] }], pied })  -> HTML

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const X = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

// ---------- fenêtre ----------
let voile = null, cleF = null, avantF = null;
function construire() {
  voile = document.createElement('div'); voile.className = 'fen-voile'; voile.hidden = true;
  voile.innerHTML = `<div class="fen" role="dialog" aria-modal="true" aria-labelledby="fen-titre"><div class="fen-tete"><div><h2 id="fen-titre"></h2><p class="fen-sous"></p></div><button type="button" class="fen-x" aria-label="Fermer">${X}</button></div><div class="fen-corps"></div><div class="fen-pied"></div></div>`;
  document.body.appendChild(voile);
  voile.addEventListener('click', (ev) => { if (ev.target === voile || ev.target.closest('.fen-x')) fenetre.fermer(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && voile && !voile.hidden) { ev.stopPropagation(); fenetre.fermer(); } }, true);
}
export const fenetre = {
  ouvrir({ titre, sous = '', corps = '', pied = '', large = false, cle = '' }) {
    if (!voile) construire();
    if (voile.hidden) avantF = document.activeElement;
    cleF = cle;
    const f = voile.firstElementChild; f.classList.toggle('large', large);
    f.querySelector('#fen-titre').textContent = titre; f.querySelector('.fen-sous').textContent = sous;
    f.querySelector('.fen-corps').innerHTML = corps; f.querySelector('.fen-pied').innerHTML = pied; f.querySelector('.fen-pied').hidden = !pied;
    voile.hidden = false; document.body.classList.add('rh-bloque', 'fen-ouverte');
    f.querySelector('.fen-x').focus({ preventScroll: true });
  },
  maj(corps) { if (voile && !voile.hidden) { const c = voile.querySelector('.fen-corps'); if (c._h !== corps) { c.innerHTML = corps; c._h = corps; } } },
  fermer() {
    if (!voile || voile.hidden) return;
    voile.hidden = true; cleF = null; voile.querySelector('.fen-corps').innerHTML = '';
    document.body.classList.remove('fen-ouverte'); if (!document.querySelector('.rh-voile:not([hidden])')) document.body.classList.remove('rh-bloque');
    if (avantF && avantF.isConnected) avantF.focus({ preventScroll: true });
  },
  cle: () => cleF,
};

// ---------- journal ----------
const TYPES = { action: ['Action', '#2563eb', '#dbeafe'], alerte: ['Alerte', '#ea580c', '#ffedd5'], journee: ['Journée', '#0f766e', '#ccfbf1'], acces: ['Accès', '#7c3aed', '#ede9fe'] };
export function creerJournal({ hh }) {
  const E = []; let n = 0;
  const F = { type: '', qui: '', q: '' };
  let racine = null;
  const ajouter = (x) => { E.push({ n: n++, ...x }); };
  const triees = () => [...E].sort((a, b) => b.h - a.h || b.n - a.n);
  const sans = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function rendrePage(corps) {
    if (!racine || !corps.contains(racine)) {
      racine = document.createElement('div'); racine.className = 'jr';
      racine.innerHTML = '<div class="pg-kpis" data-z="kpis"></div><div class="pg-outils jr-outils"><select data-jf="type" aria-label="Type d\'entrée"></select><select data-jf="qui" aria-label="Qui"></select><input type="search" data-jf="q" placeholder="Rechercher dans le journal…" aria-label="Rechercher dans le journal"><span class="jr-compte" data-z="compte"></span></div><div data-z="liste"></div><p class="pg-note">Journal horodaté (heure de la démo) : chaque action faite depuis l\'écran, avec la personne et son rôle, chaque alerte calculée et les événements de la journée. Données fictives. Dans un vrai déploiement, le journal ne s\'efface pas et sa durée de conservation est fixée au contrat.</p>';
      corps.replaceChildren(racine);
      racine.addEventListener('input', (ev) => { const el = ev.target.closest('[data-jf]'); if (el) { F[el.dataset.jf] = el.value; maj(); } });
      racine.querySelector('[data-jf="q"]').value = F.q;
    }
    maj();
  }
  const poser = (el, h) => { if (el && el._h !== h) { el.innerHTML = h; el._h = h; } };
  function maj() {
    if (!racine) return;
    const z = (k) => racine.querySelector(`[data-z="${k}"]`), tous = triees();
    const nb = (t) => E.filter((x) => x.type === t).length;
    poser(z('kpis'), [['Entrées', E.length, 'depuis l\'ouverture', '#0f172a', '#e2e8f0'], ['Actions', nb('action'), 'faites depuis l\'écran', ...TYPES.action.slice(1)], ['Alertes', nb('alerte'), 'apparues dans la journée', ...TYPES.alerte.slice(1)], ['Événements', nb('journee'), 'livraisons, services, leçons…', ...TYPES.journee.slice(1)]]
      .map(([l, v, d, c, cd]) => `<article class="pg-kpi" style="--c:${c};--cd:${cd}"><span class="pg-kpi-ic"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg></span><div><b>${v}</b><small>${l}</small><em>${d}</em></div></article>`).join(''));
    const st = racine.querySelector('[data-jf="type"]'), sq = racine.querySelector('[data-jf="qui"]');
    poser(st, `<option value="">Tous les types</option>${Object.entries(TYPES).map(([k, [l]]) => `<option value="${k}" ${F.type === k ? 'selected' : ''}>${l}${k === 'action' ? 's' : k === 'alerte' ? 's' : k === 'journee' ? ' (simulation)' : ''}</option>`).join('')}`);
    const quis = [...new Set(E.map((x) => x.qui))].sort((a, b) => a.localeCompare(b, 'fr'));
    poser(sq, `<option value="">Tout le monde</option>${quis.map((q) => `<option value="${esc(q)}" ${F.qui === q ? 'selected' : ''}>${esc(q)}</option>`).join('')}`);
    const q = sans(F.q.trim());
    const l = tous.filter((x) => (!F.type || x.type === F.type) && (!F.qui || x.qui === F.qui) && (!q || sans(`${x.texte} ${x.qui} ${x.role || ''}`).includes(q)));
    poser(z('compte'), `${l.length} sur ${E.length}`);
    poser(z('liste'), l.length ? `<div class="pg-carte pg-table-l"><table class="pg-table jr-table"><thead><tr><th>Heure</th><th>Type</th><th>Qui</th><th>Ce qui s'est passé</th></tr></thead><tbody>${l.slice(0, 300).map((x) => { const [tl, c, cd] = TYPES[x.type] || TYPES.journee; return `<tr><td class="jr-h">${hh(x.h)}</td><td><span class="jr-type" style="--c:${c};--cd:${cd}">${tl}</span></td><td><b>${esc(x.qui)}</b>${x.role ? `<br><small>${esc(x.role)}</small>` : ''}</td><td>${esc(x.texte)}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="pg-vide">Aucune entrée ne correspond à ces filtres.</div>');
  }
  return { ajouter, entrees: triees, vider: () => { E.length = 0; }, rendrePage, maj };
}

// ---------- « Voir en tant que » ----------
export function installerRoles({ roles, defaut, surChangement = () => {} }) {
  const hote = document.getElementById('role'), mention = document.getElementById('role-mention');
  let courant = roles.find((r) => r.id === defaut) || roles[0];
  hote.innerHTML = `<label class="role-sel"><span class="role-l">Voir en tant que</span><svg class="role-ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg><select id="role-choix" aria-label="Voir l'écran en tant que">${roles.map((r) => `<option value="${r.id}" ${r === courant ? 'selected' : ''}>${esc(r.label)}</option>`).join('')}</select></label>`;
  const ecrire = () => { if (mention) mention.innerHTML = `Vous voyez ce que voit : <b>${esc(courant.label)}</b> (${esc(courant.qui)}) · accès gérés par rôle (RGPD)`; document.documentElement.dataset.role = courant.id; };
  ecrire();
  hote.querySelector('select').addEventListener('change', (ev) => { const avant = courant; courant = roles.find((r) => r.id === ev.target.value) || roles[0]; ecrire(); surChangement(courant, avant); });
  return { role: () => courant, choisir: (id) => { const s = hote.querySelector('select'); s.value = id; s.dispatchEvent(new Event('change')); } };
}

// ---------- résumé du soir (aperçu d'un mail) ----------
export function mailResume({ de, a, objet, intro, blocs, pied }) {
  return `<div class="mail"><dl class="mail-tete"><div><dt>De</dt><dd>${esc(de)}</dd></div><div><dt>À</dt><dd>${esc(a)}</dd></div><div><dt>Objet</dt><dd><b>${esc(objet)}</b></dd></div></dl><div class="mail-corps"><p class="mail-fictif">Données fictives · aperçu calculé sur la simulation, rien n'est envoyé.</p><p>${intro}</p>`
    + blocs.map((b) => `<section class="mail-bloc"><h3>${esc(b.titre)}</h3>${b.lignes ? `<table class="mail-t">${b.lignes.map(([l, v]) => `<tr><td>${l}</td><td>${v}</td></tr>`).join('')}</table>` : ''}${b.items ? (b.items.length ? `<ul>${b.items.map((x) => `<li>${x}</li>`).join('')}</ul>` : `<p class="mail-vide">${b.vide || 'Rien.'}</p>`) : ''}</section>`).join('')
    + `<p class="mail-pied">${pied}</p></div></div>`;
}
