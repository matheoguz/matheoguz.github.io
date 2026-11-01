// Interface commune des démos « CRM visuel 3D » (auto-école et grande surface) :
// barre de rubriques à gauche (barre d'onglets en bas sur téléphone), panneau de la rubrique à droite
// (tiroir sur téléphone), fiche d'un élément dans ce même panneau. La page garde la main sur le contenu
// et sur la 3D : elle reçoit surChangement(id) à chaque changement de rubrique.
//
//   const ui = creerInterface({ rubriques: [{ id, label, titre?, icone }], surChangement(id) })
//   ui.aller(id)          // ouvre une rubrique ('accueil' ferme le panneau)
//   ui.rubrique()         // rubrique en cours
//   ui.fiche(oui)         // une fiche est ouverte (le panneau s'ouvre pour elle)
//   ui.badge(id, n, ton)  // pastille de nombre sur une rubrique (ton : 'rouge' | 'orange' | '')
//   ui.plein()            // la rubrique en cours est une page pleine (rubrique { plein: true, sous })
//   ui.page()             // { corps, actions } de la page pleine (en-tête : titre et sous-titre de la rubrique)
//
// Page pleine : la maquette 3D et le panneau sont masqués (la scène n'est pas recréée), la page prend toute
// la largeur à droite de la barre de rubriques. La page hôte met son rendu 3D en pause tant que ui.plein().
//
// Balisage attendu : .app > #rubriques (nav), #panneau > .pan-tete (#pan-retour, #pan-titre, #pan-fermer),
// #fiche (avec son bouton #fermer), #contenu.

const svg = (d) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICONES_UI = {
  accueil: svg('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  traiter: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
  stocks: svg('<path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>'),
  affluence: svg('<path d="M12 3c3 4 6 6.5 6 10.5a6 6 0 0 1-12 0C6 10 8 8 9 6c.6 2 1.6 3 3 3.5C12 7 12 5 12 3z"/>'),
  caisses: svg('<rect x="3" y="10" width="18" height="10" rx="2"/><path d="M7 10V5h10v5M7 15h4"/>'),
  equipe: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.7c1.8.8 3 2.5 3 5.3"/>'),
  livraisons: svg('<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
  rh: svg('<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 17c.6-2 2-3 3.5-3s2.9 1 3.5 3M14 10h4M14 14h4"/>'),
  chiffres: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  planning: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7 14h3M7 17h6"/>'),
  vehicules: svg('<path d="M5 17h14M3 17v-4l2-5h14l2 5v4"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M5 13h14"/>'),
  moniteurs: svg('<circle cx="12" cy="7.5" r="3.5"/><path d="M4.5 21c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5"/><path d="M9.5 15l2.5 3 2.5-3"/>'),
  eleves: svg('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c2 2 10 2 12 0v-5"/><path d="M22 9v6"/>'),
  code: svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M8 9l2 2 4-4"/>'),
  replier: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 10l-2 2 2 2"/>'),
  retour: svg('<path d="M15 6l-6 6 6 6"/>'),
  fermer: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
};

export function creerInterface({ rubriques, surChangement = () => {}, defaut = 'accueil' }) {
  const app = document.querySelector('.app'), nav = document.getElementById('rubriques');
  const titre = document.getElementById('pan-titre'), retour = document.getElementById('pan-retour'), fermer = document.getElementById('pan-fermer');
  nav.innerHTML = rubriques.map((r) => `<button type="button" data-rub="${r.id}" title="${r.label}"><span class="rub-ic">${r.icone || ICONES_UI[r.id] || ''}</span><span class="rub-l">${r.label}</span><span class="rub-n" id="rub-n-${r.id}" hidden></span></button>`).join('')
    + `<button type="button" class="rub-replier" id="rub-replier" title="Réduire la barre" aria-label="Réduire la barre" aria-pressed="false"><span class="rub-ic">${ICONES_UI.replier}</span><span class="rub-l">Réduire</span></button>`;
  retour.innerHTML = ICONES_UI.retour + '<span></span>';
  fermer.innerHTML = ICONES_UI.fermer;
  let page = document.getElementById('page');
  if (!page) {
    page = document.createElement('section'); page.className = 'page'; page.id = 'page'; page.setAttribute('aria-labelledby', 'page-titre');
    page.innerHTML = '<div class="page-tete"><div><h1 id="page-titre"></h1><p id="page-sous"></p></div><div class="page-actions" id="page-actions"></div></div><div class="page-corps" id="page-corps"></div>';
    nav.after(page);
  }
  let courante = defaut;
  const redimensionner = () => dispatchEvent(new Event('resize')); // la maquette 3D se recale sur sa nouvelle place
  function ouvrir(oui) {
    if (app.classList.contains('panneau-ouvert') === oui) return;
    app.classList.toggle('panneau-ouvert', oui);
    redimensionner();
  }
  function libelle(id) { const r = rubriques.find((x) => x.id === id); return r ? r.titre || r.label : ''; }
  function aller(id) {
    if (!rubriques.some((r) => r.id === id)) return;
    const R = rubriques.find((r) => r.id === id), plein = !!R.plein, change = app.classList.contains('plein') !== plein;
    courante = id; app.dataset.rubrique = id;
    app.classList.toggle('plein', plein);
    if (plein) { document.getElementById('page-titre').textContent = R.titre || R.label; document.getElementById('page-sous').textContent = R.sous || ''; document.getElementById('page-actions').innerHTML = ''; page.scrollTop = 0; }
    nav.querySelectorAll('[data-rub]').forEach((b) => { const a = b.dataset.rub === id; b.classList.toggle('actif', a); if (a) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    titre.textContent = libelle(id);
    retour.querySelector('span').textContent = id === 'accueil' ? 'Fermer la fiche' : libelle(id);
    if (app.classList.contains('avec-fiche')) { const f = document.getElementById('fermer'); if (f) f.click(); }
    ouvrir(id !== 'accueil' && !plein);
    if (change) redimensionner();
    const b = nav.querySelector(`[data-rub="${id}"]`); if (b && nav.scrollWidth > nav.clientWidth) b.scrollIntoView({ block: 'nearest', inline: 'center' });
    surChangement(id);
    const c = document.getElementById('contenu'); if (c) c.scrollTop = 0;
  }
  function fiche(oui) {
    oui = !!oui;
    if (app.classList.contains('avec-fiche') !== oui) app.classList.toggle('avec-fiche', oui);
    ouvrir(oui || (courante !== 'accueil' && !app.classList.contains('plein')));
  }
  function badge(id, n, ton = '') {
    const el = document.getElementById('rub-n-' + id); if (!el) return;
    el.hidden = !n; el.textContent = n; el.className = 'rub-n ' + ton;
  }
  nav.onclick = (ev) => {
    const r = ev.target.closest('[data-rub]');
    if (r) { aller(r.dataset.rub === courante && r.dataset.rub !== 'accueil' && !app.classList.contains('plein') && !app.classList.contains('avec-fiche') ? 'accueil' : r.dataset.rub); return; }
    if (ev.target.closest('#rub-replier')) { const oui = app.classList.toggle('replie'); document.getElementById('rub-replier').setAttribute('aria-pressed', oui); redimensionner(); }
  };
  retour.onclick = () => { const f = document.getElementById('fermer'); if (f) f.click(); };
  fermer.onclick = () => aller('accueil');
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && app.classList.contains('panneau-ouvert') && !document.body.classList.contains('rh-bloque')) { if (app.classList.contains('avec-fiche')) retour.onclick(); else aller('accueil'); } });
  app.dataset.rubrique = courante;
  nav.querySelector(`[data-rub="${courante}"]`)?.classList.add('actif');
  const pageEl = { corps: document.getElementById('page-corps'), actions: document.getElementById('page-actions') };
  return { aller, rubrique: () => courante, fiche, badge, plein: () => app.classList.contains('plein'), page: () => pageEl };
}

// Remplace le contenu d'un élément seulement s'il a changé, en gardant les blocs repliables ouverts
// (le panneau est redessiné chaque minute de démo).
export function poserGarde(el, html) {
  if (el._h === html) return;
  const ouverts = new Set([...el.querySelectorAll('details[data-pli][open]')].map((d) => d.dataset.pli));
  el.innerHTML = html; el._h = html;
  for (const d of el.querySelectorAll('details[data-pli]')) if (ouverts.has(d.dataset.pli)) d.open = true;
}
