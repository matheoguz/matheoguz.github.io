// Bibliothèque d'objets de l'éditeur de maquette : familles, dimensions par défaut, dessin 2D et construction 3D.
// Module ES sans import (THREE est passé dans le contexte 3D).
//
//   FAMILLES : [{ id, nom, modeles: [id] }]
//   MODELES[id] = { nom, type, l, p, h, couleur, motif, outil? }
//     l = largeur (m, axe x local), p = profondeur (m, axe z local), h = hauteur (m). La face « avant » est +z.
//     outil : l'élément ne pose pas d'objet mais active un outil (porte, fenêtre).
//   TYPES : les types possibles d'un objet (servent à brancher les données plus tard : rayon, caisse, poste…).
//   dessiner2d(g, o, px) : dessine l'objet o dans le repère local (1 unité = 1 m, centre en 0,0) ; px = taille d'un pixel en m.
//   construire3d(c, o) : ajoute les volumes de l'objet au groupe c.groupe via c.boite(l, h, p, couleur, x, y, z, opts) et
//     c.cyl(r, h, couleur, x, y, z, opts) ; repère local, y vers le haut, sol en 0.

export const TYPES = ['rayon', 'caisse', 'froid', 'stockage', 'comptoir', 'poste', 'mobilier', 'salle', 'vehicule', 'parking', 'cuisine', 'circulation', 'decor', 'ecran', 'sanitaire', 'personne', 'zone'];

export const MODELES = {
  // Commerce
  gondole: { nom: 'Gondole (rayon)', type: 'rayon', l: 3, p: 0.9, h: 1.8, couleur: '#e5e7eb', motif: 'etageres' },
  'tete-gondole': { nom: 'Tête de gondole', type: 'rayon', l: 1, p: 0.9, h: 1.6, couleur: '#fde68a', motif: 'tete' },
  caisse: { nom: 'Caisse', type: 'caisse', l: 1.8, p: 0.9, h: 1, couleur: '#1e3a8a', motif: 'caisse' },
  frigo: { nom: 'Frigo / vitrine', type: 'froid', l: 2.5, p: 0.8, h: 2, couleur: '#bae6fd', motif: 'froid' },
  bac: { nom: 'Bac', type: 'rayon', l: 1.2, p: 0.9, h: 0.9, couleur: '#a16207', motif: 'bac' },
  comptoir: { nom: 'Comptoir', type: 'comptoir', l: 2, p: 0.7, h: 1.05, couleur: '#c8a27a', motif: 'comptoir' },
  palette: { nom: 'Palette', type: 'stockage', l: 1.2, p: 0.8, h: 1.2, couleur: '#c9a46b', motif: 'palette' },
  rack: { nom: 'Rack de stockage', type: 'stockage', l: 2.7, p: 1.1, h: 3, couleur: '#f97316', motif: 'rack' },
  // Bureau
  bureau: { nom: 'Bureau', type: 'poste', l: 1.4, p: 0.7, h: 0.75, couleur: '#e7d8c3', motif: 'bureau' },
  chaise: { nom: 'Chaise', type: 'mobilier', l: 0.5, p: 0.5, h: 0.9, couleur: '#334155', motif: 'chaise' },
  'table-reunion': { nom: 'Table de réunion', type: 'salle', l: 2.4, p: 1.1, h: 0.75, couleur: '#f8fafc', motif: 'reunion' },
  armoire: { nom: 'Armoire', type: 'stockage', l: 1, p: 0.45, h: 1.9, couleur: '#cbd5e1', motif: 'armoire' },
  'poste-info': { nom: 'Poste informatique', type: 'poste', l: 1.2, p: 0.7, h: 1.2, couleur: '#e7d8c3', motif: 'posteinfo' },
  // Auto-école / garage
  voiture: { nom: 'Voiture', type: 'vehicule', l: 4.2, p: 1.8, h: 1.5, couleur: '#2563eb', motif: 'voiture' },
  moto: { nom: 'Moto', type: 'vehicule', l: 2.1, p: 0.8, h: 1.2, couleur: '#dc2626', motif: 'moto' },
  parking: { nom: 'Place de parking', type: 'parking', l: 2.5, p: 5, h: 0.02, couleur: '#ffffff', motif: 'parking' },
  'salle-code': { nom: 'Salle de code', type: 'salle', l: 5, p: 4, h: 1.6, couleur: '#475569', motif: 'code' },
  // Restauration
  'table-resto': { nom: 'Table (4 places)', type: 'mobilier', l: 1.4, p: 1.4, h: 0.75, couleur: '#c8a27a', motif: 'table' },
  cuisine: { nom: 'Cuisine (plan de travail)', type: 'cuisine', l: 3, p: 0.8, h: 0.9, couleur: '#d1d5db', motif: 'cuisine' },
  bar: { nom: 'Bar', type: 'comptoir', l: 3, p: 1.4, h: 1.1, couleur: '#3f2a1d', motif: 'bar' },
  // Général
  porte: { nom: 'Porte (sur un mur)', type: 'circulation', outil: 'porte' },
  fenetre: { nom: 'Fenêtre (sur un mur)', type: 'circulation', outil: 'fenetre' },
  escalier: { nom: 'Escalier', type: 'circulation', l: 1.2, p: 3, h: 2.8, couleur: '#cbd5e1', motif: 'escalier' },
  plante: { nom: 'Plante', type: 'decor', l: 0.6, p: 0.6, h: 1.3, couleur: '#16a34a', motif: 'plante' },
  ecran: { nom: 'Écran', type: 'ecran', l: 1.2, p: 0.3, h: 1.7, couleur: '#0f172a', motif: 'ecran' },
  sanitaires: { nom: 'Sanitaires', type: 'sanitaire', l: 2, p: 1.6, h: 2.2, couleur: '#e2e8f0', motif: 'wc' },
  // Personnes
  'repere-poste': { nom: 'Repère de poste', type: 'personne', l: 0.7, p: 0.7, h: 1.7, couleur: '#7c3aed', motif: 'personne' },
};

export const FAMILLES = [
  { id: 'commerce', nom: 'Commerce', modeles: ['gondole', 'tete-gondole', 'caisse', 'frigo', 'bac', 'comptoir', 'palette', 'rack'] },
  { id: 'bureau', nom: 'Bureau', modeles: ['bureau', 'chaise', 'table-reunion', 'armoire', 'poste-info'] },
  { id: 'garage', nom: 'Auto-école / garage', modeles: ['voiture', 'moto', 'parking', 'salle-code'] },
  { id: 'resto', nom: 'Restauration', modeles: ['table-resto', 'cuisine', 'bar'] },
  { id: 'general', nom: 'Général', modeles: ['porte', 'fenetre', 'escalier', 'plante', 'ecran', 'sanitaires'] },
  { id: 'personnes', nom: 'Personnes', modeles: ['repere-poste'] },
];

const PRODUITS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#eab308', '#0ea5e9', '#f43f5e'];
// hasard reproductible (même objet = mêmes produits à chaque reconstruction)
function graine(s) { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }

// ---------- 2D ----------
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2)) : g.rect(x, y, w, h); }
function teinte(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

export function dessiner2d(g, o, px) {
  const L = o.largeur, P = o.profondeur, x0 = -L / 2, z0 = -P / 2, c = o.couleur || '#94a3b8';
  const M = MODELES[o.modele] || {}, motif = M.motif;
  g.lineWidth = 1.2 * px; g.strokeStyle = '#475569';
  const fond = (col = c, a = 0.85, r = 0.06) => { rr(g, x0, z0, L, P, r); g.fillStyle = teinte(col, a); g.fill(); g.stroke(); };
  const ligne = (ax, az, bx, bz) => { g.beginPath(); g.moveTo(ax, az); g.lineTo(bx, bz); g.stroke(); };
  switch (motif) {
    case 'etageres': case 'tete': {
      fond('#e5e7eb', 1); const r = graine(o.id);
      const bandes = motif === 'tete' ? 1 : 2, pp = P / bandes;
      for (let b = 0; b < bandes; b++) for (let x = x0 + 0.05; x < -x0 - 0.1;) { const w = Math.min(-x0 - 0.05 - x, 0.25 + r() * 0.4); g.fillStyle = PRODUITS[Math.floor(r() * PRODUITS.length)]; g.fillRect(x, z0 + b * pp + 0.06, w - 0.03, pp - (bandes === 2 ? 0.1 : 0.12)); x += w; }
      if (bandes === 2) ligne(x0, 0, -x0, 0);
      break;
    }
    case 'caisse': fond('#ffffff', 1); g.fillStyle = c; g.fillRect(x0, z0, L, P * 0.28); g.fillStyle = '#334155'; g.fillRect(x0 + L * 0.62, z0 + P * 0.4, L * 0.3, P * 0.45); g.fillStyle = '#94a3b8'; g.fillRect(x0 + L * 0.08, z0 + P * 0.42, L * 0.48, P * 0.4); break;
    case 'froid': fond('#f8fafc', 1); g.fillStyle = teinte(c, 0.9); g.fillRect(x0 + 0.05, z0 + P * 0.45, L - 0.1, P * 0.5); for (let x = x0 + L / 3; x < -x0 - 0.1; x += L / 3) ligne(x, z0 + P * 0.45, x, -z0); break;
    case 'bac': { fond(c, 0.9, 0.08); const r = graine(o.id); for (let i = 0; i < 4; i++) { g.fillStyle = ['#f97316', '#84cc16', '#ef4444', '#facc15'][(i + Math.floor(r() * 4)) % 4]; g.fillRect(x0 + 0.08 + i * (L - 0.16) / 4, z0 + 0.08, (L - 0.16) / 4 - 0.03, P - 0.16); } break; }
    case 'comptoir': case 'bar': fond(c, 1, 0.08); if (motif === 'bar') { g.fillStyle = '#64748b'; for (let x = x0 + 0.4; x < -x0 - 0.2; x += 0.6) { g.beginPath(); g.arc(x, -z0 - 0.25, 0.18, 0, 7); g.fill(); } } break;
    case 'palette': fond('#d6b48a', 1, 0.02); g.fillStyle = c; g.fillRect(x0 + 0.06, z0 + 0.06, L - 0.12, P - 0.12); ligne(0, z0 + 0.06, 0, -z0 - 0.06); ligne(x0 + 0.06, 0, -x0 - 0.06, 0); break;
    case 'rack': fond('#e2e8f0', 1, 0.02); g.fillStyle = '#1e40af'; for (const x of [x0, -x0 - 0.08]) g.fillRect(x, z0, 0.08, P); g.fillStyle = c; g.fillRect(x0, z0, L, 0.06); g.fillRect(x0, -z0 - 0.06, L, 0.06); g.fillStyle = '#c9a46b'; for (let x = x0 + 0.15; x < -x0 - 0.9; x += 0.9) g.fillRect(x, z0 + 0.12, 0.8, P - 0.24); break;
    case 'bureau': case 'posteinfo': fond(c, 1, 0.04); if (motif === 'posteinfo') { g.fillStyle = '#0f172a'; g.fillRect(-0.3, z0 + 0.08, 0.6, 0.06); g.fillStyle = '#64748b'; g.fillRect(-0.22, z0 + 0.3, 0.44, 0.15); } break;
    case 'chaise': rr(g, x0 + 0.05, z0 + 0.05, L - 0.1, P - 0.1, 0.1); g.fillStyle = teinte(c, 0.9); g.fill(); g.stroke(); g.fillStyle = '#0f172a'; g.fillRect(x0 + 0.05, -z0 - 0.12, L - 0.1, 0.07); break;
    case 'reunion': fond(c, 1, 0.4); g.fillStyle = '#334155'; for (let x = x0 + 0.4; x < -x0 - 0.2; x += 0.7) for (const z of [z0 - 0.3, -z0 + 0.1]) { rr(g, x - 0.2, z, 0.4, 0.2, 0.06); g.fill(); } break;
    case 'armoire': fond(c, 1, 0.02); ligne(0, z0, 0, -z0); break;
    case 'voiture': rr(g, x0, z0, L, P, 0.45); g.fillStyle = c; g.fill(); g.stroke(); g.fillStyle = '#0f172a'; rr(g, x0 + L * 0.28, z0 + 0.15, L * 0.42, P - 0.3, 0.2); g.fill(); g.fillStyle = teinte(c, 1); rr(g, x0 + L * 0.38, z0 + 0.22, L * 0.22, P - 0.44, 0.1); g.fill(); break;
    case 'moto': rr(g, x0 + 0.1, -0.15, L - 0.2, 0.3, 0.15); g.fillStyle = c; g.fill(); g.stroke(); g.fillStyle = '#0f172a'; g.fillRect(x0 + L * 0.68, z0 + 0.05, 0.08, P - 0.1); break;
    case 'parking': g.strokeStyle = '#94a3b8'; g.lineWidth = Math.max(0.1, 2 * px); g.setLineDash([]); ligne(x0, z0, x0, -z0); ligne(-x0, z0, -x0, -z0); ligne(x0, z0, -x0, z0); g.fillStyle = 'rgba(148,163,184,.12)'; g.fillRect(x0, z0, L, P); g.lineWidth = 1.2 * px; g.strokeStyle = '#475569'; break;
    case 'code': { g.fillStyle = 'rgba(71,85,105,.08)'; g.fillRect(x0, z0, L, P); g.setLineDash([4 * px, 3 * px]); g.strokeRect(x0, z0, L, P); g.setLineDash([]); g.fillStyle = '#0f172a'; g.fillRect(-0.8, z0 + 0.1, 1.6, 0.1); g.fillStyle = '#e7d8c3'; for (let z = z0 + 1; z < -z0 - 0.5; z += 1) { g.fillRect(x0 + 0.4, z, L - 0.8, 0.45); } break; }
    case 'table': g.fillStyle = '#334155'; for (const [a, b] of [[0, z0 + 0.12], [0, -z0 - 0.12], [x0 + 0.12, 0], [-x0 - 0.12, 0]]) { g.beginPath(); g.arc(a, b, 0.17, 0, 7); g.fill(); } g.beginPath(); g.arc(0, 0, Math.min(L, P) * 0.32, 0, 7); g.fillStyle = c; g.fill(); g.stroke(); break;
    case 'cuisine': fond(c, 1, 0.02); g.fillStyle = '#111827'; for (const x of [x0 + 0.35, x0 + 0.85]) for (const z of [-0.18, 0.18]) { g.beginPath(); g.arc(x, z, 0.12, 0, 7); g.fill(); } g.fillStyle = '#94a3b8'; g.fillRect(-x0 - 1, -0.25, 0.6, 0.5); break;
    case 'escalier': fond(c, 1, 0.02); for (let z = z0 + P / 12; z < -z0; z += P / 12) ligne(x0, z, -x0, z); g.beginPath(); g.moveTo(0, -z0 - 0.2); g.lineTo(0, z0 + 0.3); g.lineTo(-0.15, z0 + 0.5); g.moveTo(0, z0 + 0.3); g.lineTo(0.15, z0 + 0.5); g.stroke(); break;
    case 'plante': g.fillStyle = '#a16207'; g.beginPath(); g.arc(0, 0, Math.min(L, P) * 0.3, 0, 7); g.fill(); g.fillStyle = teinte(c, 0.9); for (let i = 0; i < 6; i++) { const a = i * 1.05; g.beginPath(); g.arc(Math.cos(a) * L * 0.2, Math.sin(a) * P * 0.2, Math.min(L, P) * 0.22, 0, 7); g.fill(); } break;
    case 'ecran': g.fillStyle = '#0f172a'; g.fillRect(x0, -0.05, L, 0.1); g.fillStyle = '#64748b'; g.fillRect(-0.2, z0, 0.4, P); break;
    case 'wc': fond(c, 1, 0.02); ligne(0, z0, 0, -z0); g.fillStyle = '#fff'; for (const x of [x0 + L / 4, -x0 - L / 4]) { g.beginPath(); g.ellipse(x, z0 + 0.35, 0.18, 0.25, 0, 0, 7); g.fill(); g.stroke(); } break;
    case 'personne': g.fillStyle = teinte(c, 0.18); g.beginPath(); g.arc(0, 0, Math.min(L, P) / 2, 0, 7); g.fill(); g.strokeStyle = c; g.stroke(); g.fillStyle = c; g.beginPath(); g.arc(0, 0, Math.min(L, P) * 0.22, 0, 7); g.fill(); break;
    default: fond();
  }
  // repère de l'avant (petit trait), utile pour la rotation
  if (motif !== 'parking' && motif !== 'personne') { g.strokeStyle = 'rgba(15,23,42,.5)'; g.lineWidth = 2 * px; ligne(-Math.min(0.2, L / 4), -z0 + 2.5 * px, Math.min(0.2, L / 4), -z0 + 2.5 * px); }
}

// ---------- 3D ----------
export function construire3d(c, o) {
  const L = o.largeur, P = o.profondeur, H = o.hauteur, col = o.couleur || '#94a3b8', B = c.boite, C = c.cyl;
  const motif = (MODELES[o.modele] || {}).motif, r = graine(o.id);
  const rayonnage = (faces, hBase = 0.12) => {
    B(L, hBase, P, '#94a3b8', 0, 0, 0);
    if (faces === 2) B(L, H - hBase, 0.05, '#cbd5e1', 0, hBase, 0); else B(L, H - hBase, 0.05, '#cbd5e1', 0, hBase, -P / 2 + 0.03);
    const niveaux = Math.max(2, Math.round((H - 0.3) / 0.4)), pp = faces === 2 ? P / 2 - 0.05 : P - 0.08;
    for (let n = 0; n < niveaux; n++) {
      const y = hBase + 0.02 + n * ((H - hBase - 0.25) / niveaux);
      for (const s of faces === 2 ? [-1, 1] : [1]) {
        const zc = faces === 2 ? s * (P / 4 + 0.012) : 0.02;
        B(L - 0.02, 0.025, pp, '#f1f5f9', 0, y, zc);
        for (let x = -L / 2 + 0.03; x < L / 2 - 0.08;) { const w = Math.min(L / 2 - 0.03 - x, 0.22 + r() * 0.38); const hp = 0.18 + r() * 0.14; B(w - 0.02, hp, pp * (0.7 + r() * 0.25), PRODUITS[Math.floor(r() * PRODUITS.length)], x + w / 2, y + 0.025, zc); x += w; }
      }
    }
    B(L, 0.12, faces === 2 ? 0.08 : 0.06, col === '#e5e7eb' ? '#1e3a8a' : col, 0, H - 0.12, faces === 2 ? 0 : -P / 2 + 0.03, { emissif: 0.15 });
  };
  switch (motif) {
    case 'etageres': rayonnage(2); break;
    case 'tete': rayonnage(1); B(L, 0.3, 0.04, col, 0, H, -P / 2 + 0.03, { emissif: 0.3 }); break;
    case 'caisse': B(L, 0.85, P * 0.55, '#ffffff', 0, 0, -P * 0.2); B(L, 0.12, P * 0.56, col, 0, 0.6, -P * 0.2); B(L * 0.55, 0.04, P * 0.5, '#334155', -L * 0.2, 0.85, -P * 0.2); B(0.35, 0.3, 0.05, '#0f172a', L * 0.3, 0.9, -P * 0.35, { emissif: 0.2 }); C(0.04, 1.2, '#94a3b8', L * 0.45, 0, -P * 0.4); B(0.35, 0.28, 0.06, col, L * 0.45, 1.2, -P * 0.4, { emissif: 0.4 }); B(0.45, 0.5, 0.45, '#64748b', L * 0.25, 0, P * 0.28); break;
    case 'froid': B(L, H, P * 0.35, '#f8fafc', 0, 0, -P * 0.32); B(L, 0.5, P * 0.65, '#e2e8f0', 0, 0, P * 0.17); for (let n = 0; n < 4; n++) { const y = 0.55 + n * 0.32; for (let x = -L / 2 + 0.05; x < L / 2 - 0.1;) { const w = Math.min(L / 2 - 0.05 - x, 0.2 + r() * 0.3); B(w - 0.02, 0.2, P * 0.3, PRODUITS[Math.floor(r() * PRODUITS.length)], x + w / 2, y, -P * 0.3); x += w; } } B(L, H - 0.55, 0.02, col, 0, 0.55, P * 0.12, { verre: true }); B(L, 0.15, P * 0.4, '#1e3a8a', 0, H - 0.15, -P * 0.1, { emissif: 0.3 }); break;
    case 'bac': B(L, H * 0.8, P, col, 0, 0, 0); for (let i = 0; i < 4; i++) { const cc = ['#f97316', '#84cc16', '#ef4444', '#facc15'][(i + Math.floor(r() * 4)) % 4]; for (let k = 0; k < 3; k++) C(0.12, 0.14, cc, -L / 2 + 0.15 + i * (L - 0.2) / 4 + k * 0.07, H * 0.8, -P / 4 + k * P / 4, { seg: 8 }); B((L - 0.16) / 4 - 0.03, 0.08, P - 0.1, cc, -L / 2 + 0.08 + (i + 0.5) * (L - 0.16) / 4, H * 0.8, 0); } break;
    case 'comptoir': B(L, H - 0.05, P - 0.1, col, 0, 0, 0.03); B(L + 0.04, 0.05, P, '#f8fafc', 0, H - 0.05, 0); break;
    case 'bar': B(L, H - 0.05, 0.5, col, 0, 0, -P / 2 + 0.25); B(L + 0.05, 0.05, 0.62, '#1f2937', 0, H - 0.05, -P / 2 + 0.3); for (let x = -L / 2 + 0.4; x < L / 2 - 0.2; x += 0.6) { C(0.03, 0.72, '#94a3b8', x, 0, P / 2 - 0.25); C(0.18, 0.06, '#64748b', x, 0.72, P / 2 - 0.25, { seg: 16 }); } break;
    case 'palette': B(L, 0.14, P, '#b98b5a', 0, 0, 0); { const nx = 2, nz = 2, ny = Math.max(1, Math.round((H - 0.15) / 0.35)); for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) B(L / nx - 0.03, 0.33, P / nz - 0.03, j % 2 ? '#c9a46b' : '#d4b483', -L / 2 + (i + 0.5) * L / nx, 0.14 + j * 0.35, -P / 2 + (k + 0.5) * P / nz); } break;
    case 'rack': for (const x of [-L / 2 + 0.04, L / 2 - 0.04]) for (const z of [-P / 2 + 0.04, P / 2 - 0.04]) B(0.08, H, 0.08, '#1e40af', x, 0, z); for (let y = 0.1; y < H; y += 1) { for (const z of [-P / 2 + 0.04, P / 2 - 0.04]) B(L, 0.1, 0.06, col, 0, y, z); B(L - 0.1, 0.03, P - 0.1, '#e2e8f0', 0, y + 0.1, 0); if (y + 0.9 < H) for (let x = -L / 2 + 0.55; x < L / 2 - 0.4; x += 0.9) if (r() > 0.2) { B(0.8, 0.12, P - 0.15, '#b98b5a', x, y + 0.13, 0); B(0.76, 0.5 + r() * 0.2, P - 0.2, '#c9a46b', x, y + 0.25, 0); } } break;
    case 'bureau': case 'posteinfo': B(L, 0.04, P, col, 0, 0.71, 0); for (const x of [-L / 2 + 0.04, L / 2 - 0.04]) B(0.04, 0.71, P - 0.08, '#64748b', x, 0, 0); if (motif === 'posteinfo') { B(0.6, 0.36, 0.03, '#0f172a', 0, 0.85, -P / 2 + 0.12, { emissif: 0.1 }); B(0.6, 0.33, 0.005, '#60a5fa', 0, 0.865, -P / 2 + 0.137, { emissif: 0.8 }); B(0.06, 0.12, 0.06, '#334155', 0, 0.75, -P / 2 + 0.1); B(0.44, 0.02, 0.15, '#334155', 0, 0.75, -P / 2 + 0.38); chaise3d(B, C, 0, P / 2 + 0.15, '#334155'); } break;
    case 'chaise': chaise3d(B, C, 0, 0, col); break;
    case 'reunion': B(L, 0.05, P, col, 0, 0.7, 0); B(L * 0.6, 0.7, 0.1, '#94a3b8', 0, 0, 0); for (let x = -L / 2 + 0.4; x < L / 2 - 0.2; x += 0.7) { chaise3d(B, C, x, -P / 2 - 0.2, '#334155', Math.PI); chaise3d(B, C, x, P / 2 + 0.2, '#334155'); } break;
    case 'armoire': B(L, H, P, col, 0, 0, 0); B(0.01, H - 0.1, 0.01, '#64748b', 0, 0.05, P / 2 + 0.005); for (const x of [-0.06, 0.06]) B(0.02, 0.2, 0.02, '#334155', x, H * 0.5, P / 2 + 0.01); break;
    case 'voiture': { const hc = H * 0.45; B(L, hc, P, col, 0, 0.25, 0, { metal: true }); B(L * 0.5, H - hc - 0.25, P * 0.86, '#1e293b', -L * 0.04, 0.25 + hc, 0, { verre: true }); B(L * 0.46, 0.04, P * 0.84, col, -L * 0.04, H - 0.04, 0, { metal: true }); for (const x of [-L * 0.32, L * 0.32]) for (const z of [-P / 2 + 0.12, P / 2 - 0.12]) C(0.32, 0.22, '#111827', x, 0.32, z, { axeZ: true, seg: 16 }); B(0.05, 0.12, P * 0.7, '#fef9c3', L / 2, 0.5, 0, { emissif: 0.6 }); break; }
    case 'moto': for (const x of [-L / 2 + 0.33, L / 2 - 0.33]) C(0.32, 0.12, '#111827', x, 0.32, 0, { axeZ: true, seg: 16 }); B(L * 0.55, 0.3, 0.3, col, 0, 0.45, 0, { metal: true }); B(0.5, 0.1, 0.28, '#111827', -L * 0.12, 0.75, 0); B(0.06, 0.5, 0.6, '#94a3b8', L * 0.3, 0.6, 0); break;
    case 'parking': for (const x of [-L / 2, L / 2]) B(0.1, 0.012, P, '#ffffff', x, 0, 0, { ombre: false }); B(L, 0.012, 0.1, '#ffffff', 0, 0, -P / 2, { ombre: false }); break;
    case 'code': B(1.8, 1.05, 0.06, '#0f172a', 0, 0.6, -P / 2 + 0.1, { emissif: 0.1 }); B(1.7, 0.95, 0.01, '#60a5fa', 0, 0.65, -P / 2 + 0.135, { emissif: 0.7 }); for (let z = -P / 2 + 1; z < P / 2 - 0.5; z += 1) { B(L - 0.8, 0.04, 0.45, '#e7d8c3', 0, 0.71, z); for (let x = -L / 2 + 0.7; x < L / 2 - 0.5; x += 0.65) chaise3d(B, C, x, z + 0.45, '#334155'); } break;
    case 'table': { const R = Math.min(L, P) * 0.32; C(R, 0.04, col, 0, 0.71, 0, { seg: 24 }); C(0.05, 0.71, '#334155', 0, 0, 0); [[0, -P / 2 + 0.2, Math.PI], [0, P / 2 - 0.2, 0], [-L / 2 + 0.2, 0, -Math.PI / 2], [L / 2 - 0.2, 0, Math.PI / 2]].forEach(([x, z, a]) => chaise3d(B, C, x, z, '#334155', a)); break; }
    case 'cuisine': B(L, H - 0.04, P - 0.05, '#e5e7eb', 0, 0, 0.02); B(L, 0.04, P, '#9ca3af', 0, H - 0.04, 0, { metal: true }); for (const x of [-L / 2 + 0.35, -L / 2 + 0.85]) for (const z of [-0.18, 0.18]) C(0.11, 0.015, '#111827', x, H, z, { seg: 16 }); B(0.6, 0.02, 0.5, '#cbd5e1', L / 2 - 0.7, H, 0, { metal: true }); B(L, 0.7, 0.4, '#d1d5db', 0, 1.5, -P / 2 + 0.2); break;
    case 'escalier': { const n = Math.max(6, Math.round(H / 0.18)); for (let i = 0; i < n; i++) B(L, (i + 1) * H / n, P / n, col, 0, 0, P / 2 - (i + 0.5) * P / n); for (const x of [-L / 2, L / 2]) B(0.04, 0.9, P, '#64748b', x, H * 0.5, 0, { ombre: false }); break; }
    case 'plante': C(Math.min(L, P) * 0.3, 0.4, '#a16207', 0, 0, 0, { seg: 16 }); for (let i = 0; i < 6; i++) c.boule(Math.min(L, P) * 0.24 * (0.8 + r() * 0.4), i % 2 ? col : '#15803d', Math.cos(i) * L * 0.15, 0.5 + r() * (H - 0.75), Math.sin(i * 1.7) * P * 0.15); break;
    case 'ecran': B(0.5, 0.04, 0.3, '#334155', 0, 0, 0); B(0.06, H - 0.7, 0.06, '#64748b', 0, 0.04, 0); B(L, 0.7, 0.06, '#0f172a', 0, H - 0.7, 0); B(L - 0.06, 0.64, 0.01, '#60a5fa', 0, H - 0.67, 0.035, { emissif: 0.8 }); break;
    case 'wc': B(L, H, 0.06, col, 0, 0, -P / 2 + 0.03); B(0.05, H, P, col, 0, 0, 0); for (const x of [-L / 2 + 0.03, L / 2 - 0.03]) B(0.05, H, P, col, x, 0, 0); B(L, 2, 0.04, '#94a3b8', 0, 0.1, P / 2 - 0.02); for (const x of [-L / 4, L / 4]) { B(0.38, 0.4, 0.55, '#ffffff', x, 0, -P / 2 + 0.35); B(0.38, 0.35, 0.15, '#ffffff', x, 0.4, -P / 2 + 0.12); } break;
    case 'personne': C(Math.min(L, P) / 2, 0.02, col, 0, 0, 0, { seg: 32, emissif: 0.25 }); C(0.17, 0.85, '#334155', 0, 0.02, 0, { seg: 12 }); C(0.2, 0.6, col, 0, 0.85, 0, { seg: 12 }); c.boule(0.13, '#f1c9a5', 0, 1.6, 0); break;
    default: B(L, H, P, col, 0, 0, 0);
  }
}
function chaise3d(B, C, x, z, col, a = 0) { const s = Math.sin(a), co = Math.cos(a), rz = (dx, dz) => [x + dx * co + dz * s, z - dx * s + dz * co]; let [px, pz] = rz(0, 0); B(0.44, 0.06, 0.44, col, px, 0.44, pz); C(0.025, 0.44, '#64748b', px, 0, pz); [px, pz] = rz(0, 0.2); B(Math.abs(co) > 0.5 ? 0.44 : 0.05, 0.42, Math.abs(co) > 0.5 ? 0.05 : 0.44, col, px, 0.5, pz); }
