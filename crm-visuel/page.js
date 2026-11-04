// Pages pleines des démos « CRM visuel 3D » (RH, Chiffres, Équipe, Élèves, Moniteurs, Planning) : briques communes.
// Module ES sans dépendance. Le style est dans interface.css (classes pg-*, pp-*, tiroir).
//
//   avatar(nom, { taille, f })      // photo crm-visuel/portraits/<slug>.jpg si elle est listée dans portraits/portraits.json,
//                                   // sinon visage illustré en SVG, toujours le même pour un même nom
//   slug(nom) · photo(nom)          // « Léa Bonnet » -> « lea-bonnet » · URL de la photo ou null
//   source(texte)                   // petite icône « Ça vient d'où ? » (survol, clic ou focus)
//   kpi({ ic, c, cd, label, val, det })
//   carteGraphe(titre, sous, corps, classe)
//   barres({ lib, val, coul, format, passe })   // histogramme vertical (passe[i] = false : heure pas encore écoulée)
//   courbes({ x, xLib, series: [{ nom, val, coul, aire }], format })
//   barresH([{ label, val, max, coul, txt, cle }])
//   anneau(pct, coul, centre, sous)
//   tiroir.ouvrir(html, cle) · tiroir.maj(html) · tiroir.fermer() · tiroir.cle()

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- photos (portraits générés, personnes fictives) ----------
// Les photos sont déclarées dans portraits/portraits.json ({ "disponibles": ["lea-bonnet", …] }) : on ne demande
// jamais une image absente (pas d'erreur 404 dans la console). Sans le fichier, on garde les avatars dessinés.
export const slug = (nom) => String(nom).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const DOSSIER_PHOTOS = new URL('./portraits/', import.meta.url);
let PHOTOS = new Set();
try { const r = await fetch(new URL('portraits.json', DOSSIER_PHOTOS), { cache: 'no-cache' }); if (r.ok) PHOTOS = new Set((await r.json()).disponibles || []); } catch { /* hors ligne : avatars dessinés */ }
export const photo = (nom) => (PHOTOS.has(slug(nom)) ? new URL(slug(nom) + '.jpg', DOSSIER_PHOTOS).href : null);

// ---------- « Ça vient d'où ? » ----------
const IC_SRC = '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.4"/><path d="M8 7.2v4M8 4.9v.1"/></svg>';
export const source = (texte) => `<span class="src" tabindex="0" role="note" aria-label="Ça vient d'où ? ${esc(texte)}" data-src="${esc(texte)}">${IC_SRC}</span>`;
// clic ou toucher : affiche la source sans déclencher la carte qui la contient (capture, avant les autres gestionnaires)
if (typeof document !== 'undefined') document.addEventListener('click', (ev) => {
  const s = ev.target.closest && ev.target.closest('.src');
  document.querySelectorAll('.src.vu').forEach((x) => { if (x !== s) x.classList.remove('vu'); });
  if (!s) return;
  ev.stopPropagation(); ev.preventDefault(); s.classList.toggle('vu');
}, true);

// ---------- info-bulle des graphiques (data-tip) ----------
if (typeof document !== 'undefined') {
  let tip = null;
  const montrer = (ev) => {
    const el = ev.target.closest && ev.target.closest('.pg-svg [data-tip]');
    if (!el) { if (tip) tip.hidden = true; return; }
    if (!tip) { tip = document.createElement('div'); tip.className = 'pg-tip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
    tip.textContent = el.dataset.tip; tip.hidden = false;
    tip.classList.toggle('nuit', !!el.closest('.app.nuit'));
    const r = el.getBoundingClientRect(), x = ev.clientX || r.left + r.width / 2, y = el.classList.contains('pg-zone') ? ev.clientY : r.top;
    tip.style.left = Math.max(60, Math.min(innerWidth - 60, x)) + 'px'; tip.style.top = Math.max(40, y) + 'px';
  };
  document.addEventListener('pointermove', montrer, { passive: true });
  document.addEventListener('pointerleave', () => { if (tip) tip.hidden = true; });
}

// ---------- avatars illustrés ----------
function hache(s) { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const FOND = ['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3', '#ede9fe', '#cffafe', '#ffedd5', '#e2e8f0', '#fee2e2', '#d1fae5', '#e0e7ff', '#fae8ff'];
const PEAU = ['#f8dcc8', '#f1c7a5', '#e3ad86', '#cf9468', '#b47650', '#93593a', '#6f4129'];
const CHEVEUX = ['#1f2937', '#2b1d16', '#4a2e1d', '#6b4226', '#8b5a2b', '#b7793e', '#d9b46f', '#7c2d12', '#9ca3af'];
const HAUT = ['#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#0891b2', '#ea580c', '#0f766e', '#be123c', '#475569', '#ca8a04', '#1e293b', '#db2777'];
// prénoms féminins des deux démos (pour choisir une coupe vraisemblable ; les autres sont dessinés au hasard)
const PRENOMS_F = new Set('Claire Laura Sarah Inès Yasmine Nathalie Amandine Léa Emma Chloé Manon Sophie Sophie Nadia Chloé Jade Lina Camille Zoé Alice Mia Rose Lou Justine Aurélie Élodie Lucie Pauline Fatou Margaux Clara'.split(' '));
export const estFeminin = (nom) => PRENOMS_F.has(nom.split(' ')[0]);

export function avatar(nom, { taille = 48, f = estFeminin(nom) } = {}) {
  const ph = photo(nom);
  if (ph) return `<img class="av av-photo" src="${ph}" width="${taille}" height="${taille}" alt="Photo de ${esc(nom)} (personne fictive)" loading="lazy" decoding="async">`;
  const h = hache(nom), r = (n, k) => Math.floor(h / k) % n;
  const fond = FOND[r(FOND.length, 1)], peau = PEAU[r(PEAU.length, 13)];
  let ch = CHEVEUX[r(CHEVEUX.length - 1, 97)];
  if (r(9, 7) === 0) ch = CHEVEUX[8]; // quelques cheveux gris
  const haut = HAUT[r(HAUT.length, 1013)], lunettes = r(4, 31) === 0, style = r(4, 211), barbe = !f && r(4, 57) === 0;
  const fonce = peau === PEAU[5] || peau === PEAU[6];
  let arriere = '', avant = '';
  if (f) {
    if (style === 0) { arriere = `<path d="M17 30C16 15 26 10 32 10s16 5 15 20l3 24c-8 5-28 5-36 0z" fill="${ch}"/>`; avant = `<path d="M20 31C18 16 27 11 33 11c9 0 14 7 11 21-1-8-5-12-11-14-3 5-8 9-13 13z" fill="${ch}"/>`; }
    else if (style === 1) { arriere = `<path d="M18 31C17 16 26 11 32 11s15 5 14 20l2 12c-6 3-26 3-32 0z" fill="${ch}"/>`; avant = `<path d="M20 30C19 16 27 12 32 12s13 4 12 18c-3-6-8-10-12-10s-9 4-12 10z" fill="${ch}"/>`; }
    else if (style === 2) { avant = `<circle cx="32" cy="10" r="6" fill="${ch}"/><path d="M20 29C19 16 26 13 32 13s13 3 12 16c-3-6-7-9-12-9s-9 3-12 9z" fill="${ch}"/>`; }
    else { arriere = `<g fill="${ch}"><circle cx="18" cy="26" r="6"/><circle cx="46" cy="26" r="6"/><circle cx="17" cy="36" r="6"/><circle cx="47" cy="36" r="6"/><circle cx="19" cy="45" r="5"/><circle cx="45" cy="45" r="5"/></g>`; avant = `<g fill="${ch}"><circle cx="22" cy="20" r="6"/><circle cx="29" cy="15" r="6.5"/><circle cx="36" cy="15" r="6.5"/><circle cx="42" cy="20" r="6"/></g>`; }
  } else {
    if (style === 0) avant = `<path d="M20 27C19 15 26 12 33 12c8 0 13 5 11 15-2-6-8-8-12-8-5 0-9 2-12 8z" fill="${ch}"/>`;
    else if (style === 1) avant = `<path d="M20 28C18 14 30 10 38 13c6 2 8 8 6 15-2-6-6-9-14-8-4 0-8 3-10 8z" fill="${ch}"/>`;
    else if (style === 2) avant = `<path d="M21 25c0-9 6-11 11-11 6 0 11 2 11 11-3-5-19-5-22 0z" fill="${ch}" opacity=".85"/>`;
    else avant = `<g fill="${ch}"><circle cx="22" cy="21" r="4.6"/><circle cx="27" cy="16.5" r="5"/><circle cx="33" cy="15.5" r="5"/><circle cx="39" cy="17" r="5"/><circle cx="43" cy="22" r="4.4"/></g>`;
  }
  const yeux = fonce ? '#111827' : '#1f2937';
  return `<svg class="av" viewBox="0 0 64 64" width="${taille}" height="${taille}" role="img" aria-label="Illustration de ${esc(nom)}"><defs><clipPath id="avc"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#avc)"><rect width="64" height="64" fill="${fond}"/>${arriere}`
    + `<path d="M8 66c0-13 11-20 24-20s24 7 24 20z" fill="${haut}"/><path d="M27 38h10v9c0 2-10 2-10 0z" fill="${peau}"/><path d="M27 43c3 2 7 2 10 0v4c-3 1-7 1-10 0z" fill="#000" opacity=".08"/>`
    + `<circle cx="20.6" cy="30.5" r="2.6" fill="${peau}"/><circle cx="43.4" cy="30.5" r="2.6" fill="${peau}"/><ellipse cx="32" cy="29" rx="11.2" ry="13" fill="${peau}"/>`
    + `${barbe ? `<path d="M21 30c1 11 6 14 11 14s10-3 11-14c-2 6-6 8-11 8s-9-2-11-8z" fill="${ch}" opacity=".9"/>` : ''}`
    + `<circle cx="27.5" cy="29.5" r="1.4" fill="${yeux}"/><circle cx="36.5" cy="29.5" r="1.4" fill="${yeux}"/><path d="M25.5 26.2h4M34.5 26.2h4" stroke="${ch === CHEVEUX[8] ? '#6b7280' : ch}" stroke-width="1.2" stroke-linecap="round"/>`
    + `<path d="M28.6 35.2q3.4 2.6 6.8 0" fill="none" stroke="#9a3f2f" stroke-width="1.3" stroke-linecap="round"/>`
    + `${avant}${lunettes ? '<g fill="none" stroke="#1f2937" stroke-width="1.1"><rect x="23.6" y="26.6" width="7.6" height="5.6" rx="2"/><rect x="32.8" y="26.6" width="7.6" height="5.6" rx="2"/><path d="M31.2 29h1.6"/></g>' : ''}</g></svg>`;
}

// ---------- briques de page ----------
// « 44 296 € » -> nombre en grand, unité plus petite (seulement pour un texte simple, sans balise)
const unite = (v) => { const m = typeof v === 'string' && !/[<>]/.test(v) && v.match(/^(.*\d)\s*(€|%|h|min|j|jours?|ans?|km|palettes?)$/); return m ? `${m[1]}<span class="u">${m[2]}</span>` : v; };
export const kpi = ({ ic, c, cd, label, val, det = '', id = '', src = '' }) => `<article class="pg-kpi" ${id ? `id="${id}"` : ''} style="--c:${c};--cd:${cd}"><span class="pg-kpi-ic">${ic}</span><div><b>${unite(val)}</b><small>${label}</small>${det ? `<em>${det}</em>` : ''}</div>${src ? source(src) : ''}</article>`;
export const carteGraphe = (titre, sous, corps, classe = '') => `<section class="pg-carte ${classe}"><div class="pg-ch"><h3>${titre}</h3>${sous ? `<small>${sous}</small>` : ''}</div>${corps}</section>`;
export const legende = (l) => `<div class="pg-leg">${l.map(([t, c]) => `<span><i style="background:${c}"></i>${t}</span>`).join('')}</div>`;

const W = 600, H = 220, G = 40, B = 26;
function axeY(max, format) {
  const pas = [0, 0.5, 1];
  return pas.map((k) => { const y = H - B - k * (H - B - 12); return `<line x1="${G}" x2="${W}" y1="${y}" y2="${y}" class="pg-grille-l"/><text x="${G - 6}" y="${y + 4}" text-anchor="end">${format(max * k)}</text>`; }).join('');
}
const arrondiMax = (m) => { if (m <= 0) return 1; const p = 10 ** Math.floor(Math.log10(m)), n = m / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; };

export function barres({ lib, val, coul = '#2563eb', format = (n) => Math.round(n), passe = null, max = null, titreBarre = null }) {
  const m = arrondiMax(max ?? Math.max(...val, 0)), n = val.length, l = (W - G) / n, bw = Math.min(28, l * 0.6);
  const bars = val.map((v, i) => { const hh = Math.max(0, (v / m) * (H - B - 12)), x = G + i * l + (l - bw) / 2, ok = !passe || passe[i]; return `<rect x="${x.toFixed(1)}" y="${(H - B - hh).toFixed(1)}" width="${bw.toFixed(1)}" height="${hh.toFixed(1)}" rx="${Math.min(6, bw / 2.5).toFixed(1)}" fill="${ok ? coul : '#e2e8f0'}" data-tip="${esc(titreBarre ? titreBarre(i) : lib[i] + ' : ' + format(v))}"></rect>`; }).join('');
  const libs = lib.map((t, i) => (n > 12 && i % 2 ? '' : `<text x="${(G + i * l + l / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${t}</text>`)).join('');
  return `<svg class="pg-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img">${axeY(m, format)}${bars}${libs}</svg>`;
}

let numDeg = 0;
export function courbes({ x, xLib, series, format = (n) => Math.round(n), max = null }) {
  const m = arrondiMax(max ?? Math.max(...series.flatMap((s) => s.val), 0)), x0 = x[0], x1 = x[x.length - 1] || x0 + 1;
  const px = (v) => G + ((v - x0) / (x1 - x0 || 1)) * (W - G - 8), py = (v) => H - B - (v / m) * (H - B - 12);
  const traces = series.map((s) => {
    const pts = s.val.map((v, i) => [px(s.x ? s.x[i] : x[i]), py(v)]).filter((p) => !Number.isNaN(p[1]));
    if (!pts.length) return '';
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const gid = 'pgd' + (++numDeg);
    const aire = s.aire ? `<defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${s.coul}" stop-opacity=".32"/><stop offset="1" stop-color="${s.coul}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${pts[pts.length - 1][0].toFixed(1)} ${H - B} L${pts[0][0].toFixed(1)} ${H - B}Z" fill="url(#${gid})"/>` : '';
    const [lx, ly] = pts[pts.length - 1];
    return `${aire}<path d="${d}" fill="none" stroke="${s.coul}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3.5" fill="${s.coul}"/>`;
  }).join('');
  const libs = xLib.map(([v, t]) => `<text x="${px(v).toFixed(1)}" y="${H - 8}" text-anchor="${px(v) > W - 24 ? 'end' : 'middle'}">${t}</text>`).join('');
  // zones de survol : une colonne par point, info-bulle avec la valeur de chaque série
  const proche = (v) => { let best = null; for (const [xv, t] of xLib) if (best === null || Math.abs(xv - v) < Math.abs(best[0] - v)) best = [xv, t]; return best && Math.abs(best[0] - v) < 1e-9 ? best[1] : null; };
  const pas = (W - G - 8) / Math.max(1, x.length - 1);
  const zones = x.map((xv, i) => {
    const vals = series.map((s) => [s.nom, s.x ? null : s.val[i]]).filter(([, v]) => v != null && !Number.isNaN(v));
    if (!vals.length) return '';
    const tip = [proche(xv), ...vals.map(([nom, v]) => (nom ? nom + ' : ' : '') + format(v))].filter(Boolean).join('\n');
    return `<rect class="pg-zone" x="${(px(xv) - pas / 2).toFixed(1)}" y="12" width="${pas.toFixed(1)}" height="${H - B - 12}" data-tip="${esc(tip)}"/>`;
  }).join('');
  return `<svg class="pg-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img">${axeY(m, format)}${traces}${libs}${zones}</svg>`;
}

export const barresH = (lignes) => `<ul class="pg-bh">${lignes.map((l) => `<li ${l.cle ? `data-cle="${l.cle}"` : ''}><span>${l.label}</span><b>${l.txt}</b><i><u style="width:${Math.max(0, Math.min(100, (l.val / (l.max || 1)) * 100)).toFixed(1)}%;background:${l.coul}"></u></i></li>`).join('')}</ul>`;

export function anneau(pct, coul, centre, sous) {
  const r = 52, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pct));
  return `<div class="pg-anneau"><svg viewBox="0 0 140 140" width="150" height="150" aria-hidden="true"><circle cx="70" cy="70" r="${r}" fill="none" stroke="#eef2f7" stroke-width="12"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${coul}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${((p / 100) * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 70 70)"/></svg><div><b style="color:${coul}">${centre}</b><small>${sous}</small></div></div>`;
}

// ---------- tiroir (fiche détaillée dans une page pleine) ----------
let voile = null, cleOuverte = null, avantFocus = null;
function construire() {
  voile = document.createElement('div'); voile.className = 'tiroir-voile'; voile.hidden = true;
  voile.innerHTML = '<aside class="tiroir" role="dialog" aria-modal="true" aria-label="Fiche"><button type="button" class="tiroir-x" aria-label="Fermer la fiche"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="tiroir-c"></div></aside>';
  document.body.appendChild(voile);
  voile.addEventListener('click', (ev) => { if (ev.target === voile || ev.target.closest('.tiroir-x')) tiroir.fermer(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && voile && !voile.hidden) { ev.stopPropagation(); tiroir.fermer(); } }, true);
}
export const tiroir = {
  ouvrir(html, cle) {
    if (!voile) construire();
    if (voile.hidden) avantFocus = document.activeElement;
    cleOuverte = cle; const c = voile.querySelector('.tiroir-c'); c.innerHTML = html; c._h = html; c.scrollTop = 0;
    voile.hidden = false; document.body.classList.add('tiroir-ouvert');
    voile.querySelector('.tiroir-x').focus({ preventScroll: true });
  },
  maj(html) { if (!voile || voile.hidden) return; const c = voile.querySelector('.tiroir-c'); if (c._h !== html) { c.innerHTML = html; c._h = html; } },
  fermer() { if (!voile || voile.hidden) return; voile.hidden = true; cleOuverte = null; document.body.classList.remove('tiroir-ouvert'); if (avantFocus && avantFocus.isConnected) avantFocus.focus({ preventScroll: true }); },
  cle: () => cleOuverte,
  element: () => (voile ? voile.querySelector('.tiroir-c') : null),
};
