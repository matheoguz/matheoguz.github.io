// Cartes de chiffres clés de la démo « Hyper Modèle » : icône dans une pastille, grand chiffre qui défile,
// tendance (écart avec l'heure précédente) et mini-courbe de la journée. Tout vient de la simulation :
// chaque carte donne une fonction valeur(h) qui recalcule le chiffre à n'importe quelle heure de la journée.
// Module ES sans import, réutilisable (seul le DOM est touché).
//
//   const K = creerKpis({ cartes, rangee, plus, ouverture, hTxt, reduit })
//   cartes = [{ id, label, icone (SVG), couleur, doux, sens: 1 (monter = bien) | -1 (monter = mal) | 0,
//               valeur(h) -> nombre | null (null = pas connu à cette heure), maintenant() -> nombre (facultatif),
//               format(n) -> texte, ecart(n) -> texte (facultatif), detail() -> texte, enPlus (dans le menu « Plus »),
//               pas (heures entre deux points de la courbe, 0,25 par défaut), couleurDyn() (facultatif),
//               source (« Ça vient d'où ? » : texte affiché au survol de l'icône info, facultatif) }]
//   K.maj(t)        // à appeler chaque minute de démo
//   K.valeurs()     // { id: valeur affichée } (tests)

import { source as iconeSource } from '../page.js';

const FLECHE = {
  haut: '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>',
  bas: '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v10M3.5 8.5 8 13l4.5-4.5"/></svg>',
  plat: '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10"/></svg>',
};

export function creerKpis({ cartes, rangee, plus, ouverture, hTxt, reduit = () => false }) {
  const els = new Map(), affiche = new Map(), anims = new Map();
  for (const c of cartes) {
    const el = document.createElement('article');
    el.className = 'kpi'; el.id = `k-${c.id}-c`;
    el.style.setProperty('--k', c.couleur); el.style.setProperty('--kd', c.doux);
    el.innerHTML = `<div class="kpi-h"><span class="kpi-ic">${c.icone}</span><span class="kpi-l">${c.label}</span>${c.source ? iconeSource(c.source) : ''}</div>`
      + `<div class="kpi-m"><b id="k-${c.id}">-</b><svg class="spark" width="84" height="30" viewBox="0 0 84 30" aria-hidden="true"><defs><linearGradient id="g-${c.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".22"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path class="aire" fill="url(#g-${c.id})"/><path class="ligne" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><circle r="2.4" fill="currentColor"/></svg></div>`
      + `<div class="kpi-b"><span class="tend" id="k-${c.id}-t"></span><em id="k-${c.id}-d"></em></div>`;
    (c.enPlus ? plus : rangee).appendChild(el);
    els.set(c.id, el);
  }
  const $ = (c, s) => els.get(c.id).querySelector(s);

  function serie(c, t) {
    const pas = c.pas || 0.25, pts = [];
    for (let h = ouverture; h < t - 1e-6; h += pas) { const v = c.valeur(h); if (v !== null && v !== undefined) pts.push([h, v]); }
    const v = c.maintenant ? c.maintenant() : c.valeur(t); if (v !== null && v !== undefined) pts.push([t, v]);
    return pts;
  }
  function courbe(c, pts) {
    const svg = $(c, '.spark');
    if (pts.length < 2) { svg.style.visibility = 'hidden'; return; }
    svg.style.visibility = '';
    const h0 = pts[0][0], h1 = pts[pts.length - 1][0], vs = pts.map((p) => p[1]);
    let lo = Math.min(...vs), hi = Math.max(...vs); if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    const X = (h) => 2 + ((h - h0) / Math.max(1e-6, h1 - h0)) * 78, Y = (v) => 26 - ((v - lo) / (hi - lo)) * 22;
    const d = pts.map(([h, v], i) => `${i ? 'L' : 'M'}${X(h).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
    $(c, '.ligne').setAttribute('d', d);
    $(c, '.aire').setAttribute('d', `${d}L${X(h1).toFixed(1)} 30L${X(h0).toFixed(1)} 30Z`);
    const dot = $(c, '.spark circle'); dot.setAttribute('cx', X(h1).toFixed(1)); dot.setAttribute('cy', Y(pts[pts.length - 1][1]).toFixed(1));
  }
  // le chiffre défile de l'ancienne valeur à la nouvelle (0,6 s), sauf si l'utilisateur limite les animations
  function poserNombre(c, v) {
    const el = $(c, `#k-${c.id}`), avant = affiche.get(c.id);
    affiche.set(c.id, v);
    if (avant === undefined || avant === v || reduit() || typeof v !== 'number') { anims.delete(c.id); el.textContent = c.format(v); return; }
    anims.set(c.id, { el, de: avant, vers: v, t0: performance.now(), c });
    if (anims.size === 1) requestAnimationFrame(pas);
  }
  function pas(now) {
    for (const [id, a] of anims) {
      const k = Math.min(1, (now - a.t0) / 600), e = 1 - Math.pow(1 - k, 3);
      a.el.textContent = a.c.format(k >= 1 ? a.vers : a.de + (a.vers - a.de) * e);
      if (k >= 1) anims.delete(id);
    }
    if (anims.size) requestAnimationFrame(pas);
  }
  function maj(t) {
    for (const c of cartes) {
      const v = c.maintenant ? c.maintenant() : c.valeur(t);
      poserNombre(c, v);
      if (c.couleurDyn) { const k = c.couleurDyn(); els.get(c.id).style.setProperty('--k', k[0]); els.get(c.id).style.setProperty('--kd', k[1]); }
      const pts = serie(c, t);
      courbe(c, pts);
      // tendance : écart avec la valeur d'il y a une heure (ou depuis le premier point connu, si plus récent)
      const ref = t - 1 >= ouverture ? [t - 1, c.valeur(t - 1)] : null;
      const base = ref && ref[1] !== null && ref[1] !== undefined ? ref : pts.length > 1 ? pts[0] : null;
      const tend = $(c, '.tend');
      if (!base || typeof v !== 'number') { tend.className = 'tend'; tend.innerHTML = `<span>suivi depuis ${hTxt(t)}</span>`; }
      else {
        const d = v - base[1], seuil = Math.abs(base[1]) * 0.005 + 1e-9, sens = Math.abs(d) <= seuil ? 0 : Math.sign(d);
        const ton = !sens || !c.sens ? 'neutre' : sens * c.sens > 0 ? 'bien' : 'mal';
        tend.className = 'tend ' + ton;
        tend.innerHTML = `${sens > 0 ? FLECHE.haut : sens < 0 ? FLECHE.bas : FLECHE.plat}<b>${sens ? (d > 0 ? '+' : '−') + (c.ecart || c.format)(Math.abs(d)) : 'stable'}</b><span>${t - 1 >= ouverture && base === ref ? 'vs ' + hTxt(base[0]) : 'depuis ' + hTxt(base[0])}</span>`;
      }
      $(c, `#k-${c.id}-d`).textContent = c.detail ? c.detail() : '';
      els.get(c.id).title = `${c.label} : ${c.format(v)}${c.detail ? ' · ' + c.detail() : ''}`;
    }
  }
  return { maj, valeurs: () => Object.fromEntries(affiche) };
}
