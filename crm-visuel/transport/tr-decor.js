// Décor et modèles 3D de la démo « Transports Modèle » (données fictives) : le dépôt en rendu réaliste.
// Toutes les textures sont dessinées dans le navigateur (canvas : bruit, nervures, cartes de relief), rien n'est téléchargé
// à part le ciel (assets/quarry_01_1k.hdr, Poly Haven, CC0) chargé par la page.
//
//   PLAN                                     -> coordonnées utiles (quais, places, atelier, lavage, gasoil, boucle de circulation)
//   texturesSol(THREE)                       -> sol du dépôt (marquages usés), route, panneau d'entrée
//   construireDecor(ctx)                     -> terrain, entrepôt à quais, atelier, lavage, gasoil, bureaux sur 2 niveaux, clôture,
//                                               lampadaires, arbres, voisinage. Renvoie { toits } : les « couvercles » (toits et hauts
//                                               de murs) que la page cache quand on zoome dedans, pour voir l'intérieur.
//   geosTracteur · geosRemorque · geosPorteur · geosFourgon (THREE, assembler)
//                                            -> { teinte, fixe, metal, vitre, deco } (une géométrie par matière, dessinée en instances)
//   LIVREE(THREE)                            -> texture des bâches et caisses (logo fictif « Transports Modèle »)
//
// Repère : x vers l'est, z vers la route (sud), y vers le haut ; 1 unité = 1 m. Un véhicule a l'avant vers +z quand rotation.y = 0.
import { RoundedBoxGeometry } from '../vendor/jsm/geometries/RoundedBoxGeometry.js';

export const PLAN = {
  site: [-58, -41, 116, 72],                   // x0, z0, largeur, profondeur (le sol du dépôt)
  quais: [-51, -45.5, -40, -34.5, -29, -23.5],  // x des 6 portes de quai (façade sud de l'entrepôt, z = -22)
  zQuai: -22.3,
  places: Array.from({ length: 13 }, (_, i) => -8 + i * 3.8), // parking poids lourds : x des places, z de -16 à 2
  zPlaceAvant: 1.5,
  placesU: Array.from({ length: 8 }, (_, i) => -4 + i * 3.4), // fourgons : x des places, z de 8,5 à 16
  zPlaceUAvant: 15.6,
  baies: [-7, 1],                              // atelier : x des deux baies (portes au sud, z = -24)
  zBaieAvant: -37.4,
  lavage: [13, -20], gasoil: [30, -20],
  boucle: [[-12, 5.5], [46, 5.5], [51.5, 1], [51.5, -16], [47.5, -20], [-9, -20], [-14, -15], [-14, 1]],
  portail: [46, 31],
};

// ---------- outils : hasard, bruit, toiles ----------
function hasard(graine) { let s = graine >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// bruit fractal tuilable (valeurs 0..1), px × py, période de base en cellules
function bruit(px, py, cell, oct, graine) {
  const out = new Float32Array(px * py); let amp = 1, tot = 0;
  for (let o = 0; o < oct; o++) {
    const nx = cell << o, ny = Math.max(1, Math.round(cell * py / px) << o), r = hasard(graine + o * 7919), G = new Float32Array(nx * ny);
    for (let i = 0; i < G.length; i++) G[i] = r();
    for (let y = 0; y < py; y++) {
      const fy = (y / py) * ny, iy = Math.floor(fy), ty = fy - iy, sy = ty * ty * (3 - 2 * ty), y0 = iy % ny, y1 = (iy + 1) % ny;
      for (let x = 0; x < px; x++) {
        const fx = (x / px) * nx, ix = Math.floor(fx), tx = fx - ix, sx = tx * tx * (3 - 2 * tx), x0 = ix % nx, x1 = (ix + 1) % nx;
        const a = G[y0 * nx + x0] + (G[y0 * nx + x1] - G[y0 * nx + x0]) * sx, b = G[y1 * nx + x0] + (G[y1 * nx + x1] - G[y1 * nx + x0]) * sx;
        out[y * px + x] += (a + (b - a) * sy) * amp;
      }
    }
    tot += amp; amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= tot;
  return out;
}
function toile(THREE, px, py, dessin, couleur = true) {
  const c = document.createElement('canvas'); c.width = px; c.height = py;
  dessin(c.getContext('2d'), px, py);
  const t = new THREE.CanvasTexture(c); t.colorSpace = couleur ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 8; return t;
}
const rep = (THREE, t, u = 1, v = u) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(u, v); return t; };
// remplit une toile pixel par pixel : f(x, y) -> [r, g, b]
function pixels(g, w, h, f) { const d = g.createImageData(w, h), p = d.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = f(x, y), i = (y * w + x) * 4; p[i] = c[0]; p[i + 1] = c[1]; p[i + 2] = c[2]; p[i + 3] = 255; } g.putImageData(d, 0, 0); }
// carte de relief (normal map) tirée d'une hauteur tuilable
function normale(THREE, H, w, h, force) {
  return toile(THREE, w, h, (g) => pixels(g, w, h, (x, y) => {
    const dx = H[y * w + (x + 1) % w] - H[y * w + (x - 1 + w) % w], dy = H[((y + 1) % h) * w + x] - H[((y - 1 + h) % h) * w + x];
    let nx = -dx * force, ny = dy * force; const l = Math.hypot(nx, ny, 1); return [(nx / l * 0.5 + 0.5) * 255, (ny / l * 0.5 + 0.5) * 255, (1 / l * 0.5 + 0.5) * 255];
  }), false);
}
function texte(g, txt, x, y, taille, couleur = 'rgba(245,245,240,.9)', rot = 0, poids = 700) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = couleur; g.font = `${poids} ${taille}px Inter, "Helvetica Neue", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 0); g.restore();
}
function fleche(g, x, y, l, rot, couleur) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = couleur; g.beginPath();
  g.moveTo(l / 2, 0); g.lineTo(l / 8, -l / 4); g.lineTo(l / 8, -l / 10); g.lineTo(-l / 2, -l / 10); g.lineTo(-l / 2, l / 10); g.lineTo(l / 8, l / 10); g.lineTo(l / 8, l / 4); g.closePath(); g.fill(); g.restore();
}
// peinture au sol usée : on dessine sur une toile à part, on la ronge avec du bruit, puis on la pose
function peintureUsee(g, w, h, dessin, graine) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const p = c.getContext('2d'); dessin(p);
  const d = p.getImageData(0, 0, w, h), a = d.data, r = hasard(graine);
  for (let i = 3; i < a.length; i += 4) if (a[i]) { const k = r(); a[i] *= k < 0.12 ? 0.15 : k < 0.3 ? 0.6 : 0.92; }
  p.putImageData(d, 0, 0); g.drawImage(c, 0, 0);
}
// taches (huile, pneus, rapiéçages)
function taches(g, r, n, x0, y0, w, h, rmin, rmax, couleur) {
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * w, y = y0 + r() * h, R = rmin + r() * (rmax - rmin), gr = g.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, couleur(r)); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
}

// ---------- matières de détail (tuilables) ----------
let CACHE = null;
function details(THREE) {
  if (CACHE) return CACHE;
  const D = {};
  // asphalte : granulats, relief fin
  { const w = 512, Hh = bruit(w, w, 64, 3, 11), r = hasard(4); for (let i = 0; i < Hh.length; i++) Hh[i] = Hh[i] * 0.6 + r() * 0.4;
    D.asphalteN = normale(THREE, Hh, w, w, 3.2); }
  // béton : gros grain doux
  { const w = 256, Hh = bruit(w, w, 16, 4, 21); D.betonN = normale(THREE, Hh, w, w, 2.2);
    D.beton = toile(THREE, w, w, (g) => pixels(g, w, w, (x, y) => { const v = 182 + (Hh[y * w + x] - 0.5) * 46 + ((x * 7 + y * 13) % 5); return [v, v - 2, v - 6]; })); }
  // herbe : nuances, brins
  { const w = 512, A = bruit(w, w, 8, 5, 31), B = bruit(w, w, 128, 2, 37);
    D.herbe = toile(THREE, w, w, (g) => pixels(g, w, w, (x, y) => { const a = A[y * w + x], b = B[y * w + x]; return [72 + a * 34 + b * 16, 86 + a * 30 + b * 18, 50 + a * 12 + b * 6]; }));
    D.herbeN = normale(THREE, B, w, w, 4); }
  // bardage nervuré (1 tuile = 1 m, 4 nervures trapézoïdales)
  { const w = 256, H = new Float32Array(w * w), prof = (x) => { const u = (x % 64) / 64; return u < 0.32 ? 1 : u < 0.42 ? 1 - (u - 0.32) / 0.1 : u < 0.9 ? 0 : (u - 0.9) / 0.1; }, N = bruit(w, w, 4, 3, 41);
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) H[y * w + x] = prof(x);
    D.bardageN = normale(THREE, H, w, w, 9);
    D.bardage = toile(THREE, w, w, (g) => pixels(g, w, w, (x, y) => { const v = 226 + H[y * w + x] * 16 + (N[y * w + x] - 0.5) * 18; return [v, v + 1, v + 3]; })); }
  // membrane de toiture
  { const w = 256, N = bruit(w, w, 8, 4, 51);
    D.toit = toile(THREE, w, w, (g) => { pixels(g, w, w, (x, y) => { const v = 150 + (N[y * w + x] - 0.5) * 34; return [v, v + 2, v + 4]; }); g.fillStyle = 'rgba(80,84,90,.35)'; for (let k = 0; k < 4; k++) g.fillRect(0, k * 64, w, 2); }); }
  // porte sectionnelle (1 porte = 1 tuile : 3 × 3,2 m, 5 panneaux, rangée de hublots)
  { const w = 256;
    D.porte = toile(THREE, w, w, (g) => { g.fillStyle = '#c9ced6'; g.fillRect(0, 0, w, w);
      for (let k = 0; k < 5; k++) { const y = k * w / 5; const gr = g.createLinearGradient(0, y, 0, y + w / 5); gr.addColorStop(0, '#dfe3e9'); gr.addColorStop(0.9, '#b9bfc8'); gr.addColorStop(1, '#8e959f'); g.fillStyle = gr; g.fillRect(0, y, w, w / 5 - 2); }
      g.fillStyle = '#1d2733'; for (let k = 0; k < 5; k++) g.fillRect(20 + k * 46, w / 5 * 1 + 12, 34, 24); }); }
  // grillage soudé (alpha)
  { const w = 128; D.grillage = toile(THREE, w, w, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, w); g.fillStyle = '#fff'; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 3, w); for (let y = 0; y < w; y += 64) g.fillRect(0, y, w, 4); g.fillRect(0, 30, w, 3); g.fillRect(0, 94, w, 3); }, false); }
  // façade vitrée : meneaux, reflets, allèges (1 tuile = 1,35 m × 3,5 m)
  { const w = 128, h = 256;
    D.vitrage = toile(THREE, w, h, (g) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2c3e52'); gr.addColorStop(1, '#1b2836'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#3b4250'; g.fillRect(0, 0, w, 40); g.fillStyle = '#9aa3ad'; g.fillRect(0, 0, 5, h); g.fillRect(0, 38, w, 4); g.fillRect(0, h - 4, w, 4); g.fillRect(0, 150, w, 3); }); }
  CACHE = D; return D;
}

// ---------- sol du dépôt (marquages), route, panneau ----------
export function texturesSol(THREE) {
  const T = {}, PPM = 16, [x0, z0, W, H] = PLAN.site, X = (x) => (x - x0) * PPM, Z = (z) => (z - z0) * PPM;
  const BLANC = 'rgba(236,236,228,.92)', JAUNE = 'rgba(236,190,40,.92)';
  T.site = toile(THREE, W * PPM, H * PPM, (g, w, h) => {
    const r = hasard(7);
    // enrobé : teinte de fond, grandes variations, granulats
    g.fillStyle = '#4f5257'; g.fillRect(0, 0, w, h);
    taches(g, r, 260, 0, 0, w, h, 40, 220, (r) => (r() > 0.5 ? `rgba(255,255,255,${0.02 + r() * 0.04})` : `rgba(0,0,0,${0.03 + r() * 0.05})`));
    // aire de béton devant les quais et l'atelier (dalles sciées tous les 5 m)
    const beton = (xa, za, xb, zb) => { g.fillStyle = '#8d8c87'; g.fillRect(X(xa), Z(za), X(xb) - X(xa), Z(zb) - Z(za));
      taches(g, r, 40, X(xa), Z(za), X(xb) - X(xa), Z(zb) - Z(za), 20, 90, (r) => `rgba(${r() > 0.5 ? '255,255,250' : '40,40,40'},${0.04 + r() * 0.05})`);
      g.fillStyle = 'rgba(40,40,40,.35)'; for (let x = xa; x <= xb; x += 5) g.fillRect(X(x), Z(za), 1, Z(zb) - Z(za)); for (let z = za; z <= zb; z += 5) g.fillRect(X(xa), Z(z), X(xb) - X(xa), 1); };
    beton(-56, -22, -16, 2); beton(-12, -24, 6, -17);
    // rapiéçages et fissures colmatées
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(30,31,34,${0.25 + r() * 0.2})`; g.fillRect(X(-10 + r() * 60), Z(-18 + r() * 40), (2 + r() * 5) * PPM, (1.5 + r() * 3) * PPM); }
    g.strokeStyle = 'rgba(20,20,22,.55)'; g.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
    // taches d'huile sous les places et aux quais, traces de pneus sur la boucle
    for (const x of PLAN.places) taches(g, r, 3, X(x - 1), Z(-8), 2 * PPM, 6 * PPM, 8, 30, (r) => `rgba(10,10,12,${0.18 + r() * 0.2})`);
    for (const x of PLAN.quais) taches(g, r, 4, X(x - 1), Z(-21), 2 * PPM, 8 * PPM, 8, 26, (r) => `rgba(10,10,12,${0.15 + r() * 0.2})`);
    g.strokeStyle = 'rgba(15,15,17,.10)'; g.lineWidth = 10;
    for (const d of [-1, 1]) { g.beginPath(); PLAN.boucle.forEach(([x, z], i) => { const px = X(x) + d * 14, pz = Z(z) + d * 14; i ? g.lineTo(px, pz) : g.moveTo(px, pz); }); g.closePath(); g.stroke(); }
    // granulats
    const d = g.getImageData(0, 0, w, h), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const n = (r() - 0.5) * 22 + (r() > 0.985 ? 26 : 0); p[i] += n; p[i + 1] += n; p[i + 2] += n; }
    g.putImageData(d, 0, 0);
    // marquages (peinture usée)
    peintureUsee(g, w, h, (g) => {
      g.fillStyle = BLANC;
      for (const x of [...PLAN.places.map((p) => p - 1.9), PLAN.places[12] + 1.9]) g.fillRect(X(x) - 1.5, Z(-16), 3, Z(2) - Z(-16));
      PLAN.places.forEach((x, i) => texte(g, String(i + 1), X(x), Z(-14.6), 20, BLANC));
      for (const x of [...PLAN.placesU.map((p) => p - 1.7), PLAN.placesU[7] + 1.7]) g.fillRect(X(x) - 1.5, Z(8.5), 3, Z(16) - Z(8.5));
      PLAN.placesU.forEach((x, i) => texte(g, 'F' + (i + 1), X(x), Z(9.6), 15, BLANC));
      for (let i = 0; i <= 6; i++) g.fillRect(X(22 + i * 2.6) - 1.2, Z(12), 2.4, Z(17) - Z(12));
      for (let i = 0; i <= 6; i++) g.fillRect(X(22 + i * 2.6) - 1.2, Z(21), 2.4, Z(26) - Z(21));
      g.fillStyle = JAUNE;
      for (const x of PLAN.quais) { g.fillRect(X(x - 1.5) - 2, Z(-22), 4, Z(-9) - Z(-22)); g.fillRect(X(x + 1.5) - 2, Z(-22), 4, Z(-9) - Z(-22)); }
      PLAN.quais.forEach((x, i) => texte(g, 'QUAI ' + (i + 1), X(x), Z(-7.6), 17, JAUNE));
      g.fillRect(X(-56), Z(-22) - 3, X(-18) - X(-56), 6);
      g.fillStyle = BLANC; for (let k = 0; k < 7; k++) g.fillRect(X(-30 + k * 1.2), Z(6.8), 0.6 * PPM, Z(9) - Z(6.8));
      for (const x of [-4, 12, 28]) fleche(g, X(x), Z(5.5), 40, 0, BLANC);
      for (const x of [40, 24, 4]) fleche(g, X(x), Z(-20), 40, Math.PI, BLANC);
      for (const z of [-10, -4]) fleche(g, X(51.5), Z(z), 40, -Math.PI / 2, BLANC);
      fleche(g, X(-14), Z(-8), 40, Math.PI / 2, BLANC);
      for (let k = 0; k < 8; k++) g.fillRect(X(42 + k * 1.1), Z(28), 0.55 * PPM, 2 * PPM);
      texte(g, 'SORTIE', X(44.5), Z(25), 16, BLANC); texte(g, 'ENTRÉE', X(49), Z(25), 16, BLANC);
      g.fillRect(X(47) - 1, Z(8), 2, Z(28) - Z(8));
    }, 3);
    // station de lavage : sol mouillé
    { const gr = g.createRadialGradient(X(13), Z(-20), 4, X(13), Z(-20), 7 * PPM); gr.addColorStop(0, 'rgba(18,22,30,.45)'); gr.addColorStop(1, 'rgba(18,22,30,0)'); g.fillStyle = gr; g.fillRect(X(4), Z(-27), 18 * PPM, 14 * PPM); }
  });
  T.route = toile(THREE, 1856, 144, (g, w, h) => {
    const r = hasard(3); g.fillStyle = '#45484d'; g.fillRect(0, 0, w, h);
    taches(g, r, 60, 0, 0, w, h, 20, 80, (r) => `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.03 + r() * 0.04})`);
    g.fillStyle = 'rgba(20,20,22,.12)'; g.fillRect(0, h * 0.18, w, h * 0.1); g.fillRect(0, h * 0.34, w, h * 0.08); g.fillRect(0, h * 0.58, w, h * 0.08); g.fillRect(0, h * 0.72, w, h * 0.1);
    const d = g.getImageData(0, 0, w, h), p = d.data; for (let i = 0; i < p.length; i += 4) { const n = (r() - 0.5) * 22; p[i] += n; p[i + 1] += n; p[i + 2] += n; } g.putImageData(d, 0, 0);
    peintureUsee(g, w, h, (g) => { g.fillStyle = BLANC; for (let x = 0; x < w; x += 64) g.fillRect(x, h / 2 - 2, 36, 4); g.fillRect(0, 6, w, 3); g.fillRect(0, h - 9, w, 3); }, 9);
  });
  T.panneau = toile(THREE, 512, 192, (g, w, h) => {
    g.fillStyle = '#0f2a5c'; g.fillRect(0, 0, w, h); g.fillStyle = '#f59e0b'; g.fillRect(0, h - 22, w, 22);
    texte(g, 'TRANSPORTS MODÈLE', w / 2, 74, 46, '#ffffff'); texte(g, 'Dépôt · démo fictive', w / 2, 128, 26, '#cbd5e1');
  });
  return T;
}

// enseignes et numéros de quai (une seule texture, découpée)
function enseignes(THREE) {
  const t = toile(THREE, 1024, 512, (g) => {
    g.fillStyle = '#0f2a5c'; g.fillRect(0, 0, 1024, 128); g.fillStyle = '#f59e0b'; g.fillRect(0, 112, 1024, 16);
    texte(g, 'TRANSPORTS MODÈLE', 512, 58, 78, '#ffffff', 0, 800);
    g.fillStyle = '#ffffff'; g.fillRect(0, 128, 1024, 128); texte(g, 'ATELIER  ·  ENTRETIEN', 512, 192, 64, '#7f1d1d', 0, 800);
    for (let k = 0; k < 8; k++) { g.fillStyle = '#facc15'; g.fillRect(k * 128, 256, 128, 128); g.fillStyle = '#111'; g.fillRect(k * 128 + 4, 260, 120, 120); texte(g, String(k + 1), k * 128 + 64, 322, 96, '#facc15', 0, 800); }
    g.fillStyle = '#ffffff'; g.fillRect(0, 384, 1024, 128); texte(g, 'TRANSPORTS MODÈLE', 512, 430, 60, '#0f2a5c', 0, 800); texte(g, 'Accueil · Exploitation', 512, 482, 34, '#475569', 0, 600);
  });
  return t;
}
function planUV(THREE, l, h, [u0, v0, u1, v1]) { // v en pixels depuis le haut (toile 1024 × 512)
  const g = new THREE.PlaneGeometry(l, h), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (u0 + uv.getX(i) * (u1 - u0)) / 1024, 1 - (v1 - uv.getY(i) * (v1 - v0)) / 512);
  return g;
}

// ---------- décor ----------
export function construireDecor(ctx) {
  const { THREE, scene, T } = ctx;
  const D = details(THREE), [sx0, sz0, sW, sH] = PLAN.site, r = hasard(5);
  const M = {}, std = (o) => new THREE.MeshStandardMaterial(o);
  M.herbe = std({ map: rep(THREE, D.herbe, 160), normalMap: rep(THREE, D.herbeN.clone(), 160), roughness: 0.95 }); M.herbe.normalMap.needsUpdate = true;
  M.site = std({ map: T.site, normalMap: D.asphalteN, roughness: 0.9 }); M.site.normalMap = rep(THREE, D.asphalteN.clone(), sW / 3, sH / 3); M.site.normalMap.needsUpdate = true;
  M.route = std({ map: rep(THREE, T.route, 12, 1), roughness: 0.88 }); M.route.normalMap = rep(THREE, D.asphalteN.clone(), 1600 / 3, 3); M.route.normalMap.needsUpdate = true;
  M.beton = std({ map: rep(THREE, D.beton), normalMap: rep(THREE, D.betonN), roughness: 0.85 });
  M.bardage = std({ map: rep(THREE, D.bardage), normalMap: rep(THREE, D.bardageN), color: 0xe9ecef, roughness: 0.5, metalness: 0.35 });
  M.bardageB = std({ map: D.bardage, normalMap: D.bardageN, color: 0x2a4a7a, roughness: 0.45, metalness: 0.4 });
  M.bardageR = std({ map: D.bardage, normalMap: D.bardageN, color: 0x7a2626, roughness: 0.45, metalness: 0.4 });
  M.bardageG = std({ map: D.bardage, normalMap: D.bardageN, color: 0x9aa1a9, roughness: 0.5, metalness: 0.35 });
  M.toit = std({ map: rep(THREE, D.toit), roughness: 0.92 });
  M.porte = std({ map: D.porte, roughness: 0.5, metalness: 0.3 });
  M.vitrage = std({ map: rep(THREE, D.vitrage), roughness: 0.06, metalness: 0.75, envMapIntensity: 1.4 });
  M.vitre = std({ color: 0x23303d, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.38, envMapIntensity: 1.6, depthWrite: false });
  M.grillage = std({ color: 0x2f4a38, alphaMap: rep(THREE, D.grillage), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.3 });
  M.acier = std({ color: 0x8b929b, roughness: 0.35, metalness: 0.9 });
  M.galva = std({ color: 0xb9bec4, roughness: 0.4, metalness: 0.85 });
  M.caoutchouc = std({ color: 0x17191c, roughness: 0.85 });
  M.enseigne = std({ map: enseignes(THREE), roughness: 0.4, metalness: 0.1 });
  M.panneau = std({ map: T.panneau, roughness: 0.5 });
  M.lampe = std({ color: 0xfaf7ee, emissive: 0xfff1d0, emissiveIntensity: 0.6, roughness: 0.3 });
  const mc = new Map(), col = (c, o = {}) => { const k = c + JSON.stringify(o); if (!mc.has(k)) mc.set(k, std({ color: c, roughness: 0.8, metalness: 0, ...o })); return mc.get(k); };

  // boîte avec UV « au mètre » (les textures tuilées gardent la même échelle partout)
  function bloc(l, h, p, m, x, y, z, { parent = scene, ombre = true, e = 1, ry = 0 } = {}) {
    const g = new THREE.BoxGeometry(l, h, p), uv = g.attributes.uv, dims = [[p, h], [p, h], [l, p], [l, p], [l, h], [l, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / e, uv.getY(i) * dims[f][1] / e); }
    const o = new THREE.Mesh(g, typeof m === 'number' ? col(m) : m); o.position.set(x, y + h / 2, z); o.rotation.y = ry; o.castShadow = ombre; o.receiveShadow = true; parent.add(o); return o;
  }
  function sol(l, p, m, x, y, z, parent = scene) { const o = new THREE.Mesh(new THREE.PlaneGeometry(l, p), m); o.rotation.x = -Math.PI / 2; o.position.set(x, y, z); o.receiveShadow = true; parent.add(o); return o; }
  function cyl(rh, rb, h, m, x, y, z, { seg = 16, rx = 0, rz = 0, parent = scene, ombre = true } = {}) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rh, rb, h, seg), typeof m === 'number' ? col(m) : m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.castShadow = ombre; o.receiveShadow = true; parent.add(o); return o; }
  function affiche(l, h, zone, x, y, z, ry = 0, parent = scene) { const o = new THREE.Mesh(planUV(THREE, l, h, zone), M.enseigne); o.position.set(x, y, z); o.rotation.y = ry; parent.add(o); return o; }
  const couvercle = () => { const g = new THREE.Group(); g.userData.conteneur = true; scene.add(g); return g; };
  const toits = [];

  // ---- terrain, sol du dépôt, route, trottoirs ----
  sol(1800, 1800, M.herbe, 0, -0.02, 0);
  sol(sW, sH, M.site, sx0 + sW / 2, 0.06, sz0 + sH / 2);
  sol(1600, 9, M.route, 0, 0.05, 36.5);
  for (const [xa, xb] of [[-800, 41], [52, 800]]) bloc(xb - xa, 0.16, 0.3, M.beton, (xa + xb) / 2, 0, 31.85, { ombre: false });
  bloc(1600, 0.16, 0.3, M.beton, 0, 0, 41.15, { ombre: false }); bloc(1600, 0.14, 2.2, M.beton, 0, 0, 42.4, { ombre: false });
  // chemin d'accès au portail (enrobé entre le site et la route)
  sol(11, 1, M.site, 46.5, 0.055, 31.5);

  // ---- entrepôt à quais ----
  const EX0 = -56, EX1 = -18, EZ0 = -39, EZ1 = -22, HQ = 1.2, HT = 11, HC = HQ + 3.8; // HC : hauteur de coupe quand on zoome
  { const cv = couvercle(); toits.push({ groupe: cv, zone: [EX0 - 4, EZ0 - 2, EX1 + 4, EZ1 + 14] });
    bloc(EX1 - EX0, HQ, EZ1 - EZ0 + 0.4, M.beton, (EX0 + EX1) / 2, 0, (EZ0 + EZ1) / 2 + 0.2);             // dalle à hauteur de quai
    bloc(EX1 - EX0 - 0.6, 0.02, EZ1 - EZ0 - 0.6, col(0xa8aaa6, { roughness: 0.6 }), (EX0 + EX1) / 2, HQ, (EZ0 + EZ1) / 2, { ombre: false });
    bloc(EX1 - EX0, HT, 0.3, M.bardage, (EX0 + EX1) / 2, 0, EZ0);                                          // mur nord
    bloc(0.3, HT, EZ1 - EZ0, M.bardage, EX0, 0, (EZ0 + EZ1) / 2);                                          // pignon ouest
    bloc(0.3, HC, EZ1 - EZ0, M.bardage, EX1, 0, (EZ0 + EZ1) / 2);                                          // pignon est, bas
    bloc(0.3, HT - HC, EZ1 - EZ0, M.bardage, EX1, HC, (EZ0 + EZ1) / 2, { parent: cv });                   //  … haut
    // façade des quais : trumeaux, portes, sas d'étanchéité, butoirs, niveleurs, feux
    const bords = [EX0, ...PLAN.quais.flatMap((x) => [x - 1.5, x + 1.5]), EX1];
    for (let k = 0; k < bords.length; k += 2) { const a = bords[k], b = bords[k + 1]; if (b - a > 0.05) bloc(b - a, HC - HQ, 0.3, M.bardage, (a + b) / 2, HQ, EZ1); }
    bloc(EX1 - EX0, HT - HC, 0.3, M.bardage, (EX0 + EX1) / 2, HC, EZ1, { parent: cv });
    bloc(EX1 - EX0 + 0.1, 1.4, 0.34, M.bardageB, (EX0 + EX1) / 2, HT - 1.4, EZ1, { parent: cv }); bloc(EX1 - EX0 + 0.1, 1.4, 0.34, M.bardageB, (EX0 + EX1) / 2, HT - 1.4, EZ0, { parent: cv });
    bloc(0.34, 1.4, EZ1 - EZ0, M.bardageB, EX0, HT - 1.4, (EZ0 + EZ1) / 2, { parent: cv }); bloc(0.34, 1.4, EZ1 - EZ0, M.bardageB, EX1, HT - 1.4, (EZ0 + EZ1) / 2, { parent: cv });
    affiche(14, 1.75, [0, 0, 1024, 128], (EX0 + EX1) / 2 + 6, HT - 3.2, EZ1 + 0.17, 0, cv);
    // auvent au-dessus des quais
    bloc(EX1 - EX0 - 2, 0.25, 2.6, col(0xd5d8dc, { metalness: 0.5, roughness: 0.4 }), (EX0 + EX1) / 2, HQ + 4.3, EZ1 + 1.3, { parent: cv });
    for (let x = EX0 + 1.4; x < EX1; x += 5.4) { bloc(0.08, 0.08, 2.9, M.acier, x, HQ + 4.55, EZ1 + 1.4, { parent: cv }); }
    for (const [i, x] of PLAN.quais.entries()) {
      bloc(3.0, 0.5, 0.4, M.porte, x, HQ + 3.0, EZ1 - 0.15);                                             // porte relevée (tablier visible en haut)
      bloc(0.4, 3.4, 0.7, M.caoutchouc, x - 1.7, HQ - 0.1, EZ1 + 0.35); bloc(0.4, 3.4, 0.7, M.caoutchouc, x + 1.7, HQ - 0.1, EZ1 + 0.35); bloc(3.8, 0.55, 0.75, M.caoutchouc, x, HQ + 3.25, EZ1 + 0.38);
      bloc(0.3, 0.42, 0.25, M.caoutchouc, x - 1.1, 0.72, EZ1 + 0.13); bloc(0.3, 0.42, 0.25, M.caoutchouc, x + 1.1, 0.72, EZ1 + 0.13);
      bloc(2.4, 0.05, 1.6, M.acier, x, HQ - 0.03, EZ1 - 0.7, { ombre: false });                       // niveleur
      bloc(0.12, 0.06, 6, col(0xf2c200, { roughness: 0.5 }), x - 1.55, 0.06, EZ1 + 3.2, { ombre: false }); bloc(0.12, 0.06, 6, col(0xf2c200, { roughness: 0.5 }), x + 1.55, 0.06, EZ1 + 3.2, { ombre: false });
      bloc(0.18, 0.4, 0.08, col(0x111111), x + 2.05, HQ + 1.5, EZ1 + 0.2, { ombre: false }); cyl(0.05, 0.05, 0.03, M.lampe, x + 2.05, HQ + 1.8, EZ1 + 0.25, { rx: Math.PI / 2, seg: 10, ombre: false });
      cyl(0.05, 0.05, 0.03, col(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 1.2 }), x + 2.05, HQ + 1.6, EZ1 + 0.25, { rx: Math.PI / 2, seg: 10, ombre: false });
      affiche(0.7, 0.7, [i * 128, 256, i * 128 + 128, 384], x, HQ + 3.95, EZ1 + 0.42);
    }
    // escalier piéton et garde-corps en bout de quai
    for (let k = 0; k < 6; k++) bloc(1.2, 0.2, 0.3, M.beton, EX1 + 0.9, k * 0.2, EZ1 + 2.2 - k * 0.3, { ombre: false });
    // toiture : membrane, lanterneaux, groupes de ventilation, exutoires
    bloc(EX1 - EX0 - 0.4, 0.2, EZ1 - EZ0 - 0.4, M.toit, (EX0 + EX1) / 2, HT - 0.6, (EZ0 + EZ1) / 2, { parent: cv });
    for (let x = EX0 + 4; x < EX1 - 2; x += 6) bloc(1.6, 0.35, EZ1 - EZ0 - 5, col(0xdfe8ee, { roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85 }), x, HT - 0.4, (EZ0 + EZ1) / 2, { parent: cv, ombre: false });
    for (const [x, z] of [[-50, -36], [-27, -36.5]]) { bloc(2.6, 1.3, 1.8, M.galva, x, HT - 0.4, z, { parent: cv }); cyl(0.5, 0.5, 0.2, col(0x2b2f35), x, HT + 0.95, z, { parent: cv }); }
    for (const x of [-46, -34, -22]) bloc(1.2, 0.5, 1.2, M.galva, x, HT - 0.4, -25.5, { parent: cv });
  }
  // racks à palettes et palettes (intérieur)
  const COUL_COLIS = [0xb58b5c, 0xa67c4f, 0xc9a77a, 0xd8d2c4, 0xe7e5df, 0x9a7a52];
  for (const zr of [-37.6, -33.6, -29.6]) for (let x = EX0 + 1.2; x < EX1 - 3; x += 2.8) {
    bloc(0.1, 6.2, 1.1, col(0x2c5aa0, { metalness: 0.4, roughness: 0.5 }), x, HQ, zr);
    if (x + 2.8 < EX1 - 3) for (const y of [0, 2, 4]) {
      bloc(2.8, 0.12, 0.1, col(0xe0661a, { metalness: 0.3, roughness: 0.5 }), x + 1.4, HQ + y + 1.8, zr - 0.5, { ombre: false }); bloc(2.8, 0.12, 0.1, col(0xe0661a, { metalness: 0.3, roughness: 0.5 }), x + 1.4, HQ + y + 1.8, zr + 0.5, { ombre: false });
      for (const dx of [0.75, 2.05]) if (r() > 0.2) { const yy = HQ + y + (y ? 1.92 : 0); bloc(1.1, 0.14, 1.0, col(0xb08455), x + dx, yy, zr, { ombre: false }); bloc(1.0, 1.0 + r() * 0.5, 0.95, col(COUL_COLIS[Math.floor(r() * 6)]), x + dx, yy + 0.14, zr); }
    }
  }
  for (const x of PLAN.quais) for (let k = 0; k < 4; k++) if (r() > 0.25) { const xx = x - 0.65 + (k % 2) * 1.3, zz = -24 - Math.floor(k / 2) * 1.4; bloc(1.15, 0.14, 1.15, col(0xb08455), xx, HQ, zz, { ombre: false }); bloc(1.05, 0.8 + r() * 0.7, 1.05, col(COUL_COLIS[Math.floor(r() * 6)]), xx, HQ + 0.14, zz); }
  const chariot = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, HQ, z); g.rotation.y = ry; scene.add(g);
    bloc(1.1, 1.0, 1.9, col(0xe8a10c, { roughness: 0.4, metalness: 0.1 }), 0, 0.25, 0, { parent: g }); bloc(0.08, 2.1, 0.08, M.acier, -0.45, 0.25, 0.95, { parent: g }); bloc(0.08, 2.1, 0.08, M.acier, 0.45, 0.25, 0.95, { parent: g }); bloc(1.0, 0.06, 1.1, M.acier, 0, 0.12, 1.55, { parent: g }); bloc(1.0, 0.08, 1.0, col(0x1f2937), 0, 2.2, -0.2, { parent: g });
    for (const [dx, dz] of [[-0.5, 0.6], [0.5, 0.6], [-0.5, -0.6], [0.5, -0.6]]) cyl(0.25, 0.25, 0.22, M.caoutchouc, dx, 0.25, dz, { rz: Math.PI / 2, parent: g }); };
  chariot(-47, -27.5, 0.4); chariot(-26, -28.5, -0.6);

  // ---- atelier d'entretien (2 baies ouvertes) ----
  const AX0 = -12, AX1 = 6, AZ0 = -39, AZ1 = -24, HA = 8, HCA = 5.2;
  { const cv = couvercle(); toits.push({ groupe: cv, zone: [AX0 - 3, AZ0 - 2, AX1 + 3, AZ1 + 10] });
    bloc(AX1 - AX0, 0.14, AZ1 - AZ0, col(0x9fa3a8, { roughness: 0.55 }), (AX0 + AX1) / 2, 0, (AZ0 + AZ1) / 2);
    bloc(AX1 - AX0, HA, 0.3, M.bardage, (AX0 + AX1) / 2, 0, AZ0); bloc(0.3, HA, AZ1 - AZ0, M.bardage, AX0, 0, (AZ0 + AZ1) / 2);
    bloc(0.3, HCA, AZ1 - AZ0, M.bardage, AX1, 0, (AZ0 + AZ1) / 2); bloc(0.3, HA - HCA, AZ1 - AZ0, M.bardage, AX1, HCA, (AZ0 + AZ1) / 2, { parent: cv });
    const b = PLAN.baies, bords = [AX0, b[0] - 2.4, b[0] + 2.4, b[1] - 2.4, b[1] + 2.4, AX1];
    for (let k = 0; k < bords.length; k += 2) bloc(bords[k + 1] - bords[k], HCA, 0.3, M.bardage, (bords[k] + bords[k + 1]) / 2, 0, AZ1);
    bloc(AX1 - AX0, HA - HCA, 0.3, M.bardage, (AX0 + AX1) / 2, HCA, AZ1, { parent: cv });
    for (const x of b) { bloc(4.8, 0.6, 0.4, M.porte, x, HCA - 0.6, AZ1 - 0.2); bloc(0.2, HCA, 0.36, M.bardageR, x - 2.5, 0, AZ1); bloc(0.2, HCA, 0.36, M.bardageR, x + 2.5, 0, AZ1); }
    bloc(AX1 - AX0 + 0.1, 1.2, 0.34, M.bardageR, (AX0 + AX1) / 2, HA - 1.2, AZ1, { parent: cv }); bloc(AX1 - AX0 + 0.1, 1.2, 0.34, M.bardageR, (AX0 + AX1) / 2, HA - 1.2, AZ0, { parent: cv });
    bloc(0.34, 1.2, AZ1 - AZ0, M.bardageR, AX0, HA - 1.2, (AZ0 + AZ1) / 2, { parent: cv }); bloc(0.34, 1.2, AZ1 - AZ0, M.bardageR, AX1, HA - 1.2, (AZ0 + AZ1) / 2, { parent: cv });
    affiche(9, 1.1, [0, 128, 1024, 256], (AX0 + AX1) / 2, HA - 2.4, AZ1 + 0.17, 0, cv);
    bloc(AX1 - AX0 - 0.4, 0.2, AZ1 - AZ0 - 0.4, M.toit, (AX0 + AX1) / 2, HA - 0.5, (AZ0 + AZ1) / 2, { parent: cv });
    for (const x of [-8, 2]) bloc(1.4, 0.3, AZ1 - AZ0 - 4, col(0xdfe8ee, { roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85 }), x, HA - 0.3, (AZ0 + AZ1) / 2, { parent: cv, ombre: false });
    bloc(2, 1, 1.5, M.galva, 4, HA - 0.3, -36, { parent: cv });
  }
  for (const x of PLAN.baies) { bloc(1.1, 0.03, 9, col(0x1f2329), x, 0.15, -31.5, { ombre: false }); bloc(1.3, 0.04, 9.2, col(0xe0b40f), x, 0.145, -31.5, { ombre: false }); }
  bloc(4, 0.9, 0.7, col(0x56606c, { metalness: 0.4 }), -8, 0.14, -38.3); bloc(4, 0.9, 0.7, col(0x56606c, { metalness: 0.4 }), 2, 0.14, -38.3);
  bloc(0.7, 1.9, 2.4, col(0xb91c1c, { roughness: 0.4, metalness: 0.3 }), -11.3, 0.14, -30); bloc(0.7, 1.9, 2.4, col(0xb91c1c, { roughness: 0.4, metalness: 0.3 }), -11.3, 0.14, -27);
  for (let k = 0; k < 5; k++) cyl(0.5, 0.5, 0.32, M.caoutchouc, 4.6, 0.32 + k * 0.33, -37.6, { seg: 20 });

  // ---- station de lavage ----
  { const [x, z] = PLAN.lavage, BL = col(0xf1f3f5, { metalness: 0.5, roughness: 0.35 });
    bloc(0.5, 5.4, 0.5, BL, x, 0, z - 3.4); bloc(0.5, 5.4, 0.5, BL, x, 0, z + 3.4); bloc(0.8, 0.7, 7.4, BL, x, 5.2, z); bloc(0.82, 0.18, 7.42, col(0x0369a1, { roughness: 0.4 }), x, 5.45, z);
    for (const dz of [-2.15, 2.15]) cyl(0.45, 0.45, 4.2, col(0x2f8fd6, { roughness: 0.95 }), x + 1.2, 2.3, z + dz, { seg: 18 });
    cyl(0.42, 0.42, 4.6, col(0x2f8fd6, { roughness: 0.95 }), x - 1, 4.7, z, { rx: Math.PI / 2, seg: 18 });
    bloc(1.6, 2.4, 1.6, M.bardageG, x + 4, 0, z - 4.6); bloc(1.7, 0.2, 1.7, col(0x0369a1), x + 4, 2.4, z - 4.6);
    bloc(9, 0.1, 0.3, M.acier, x, 0.05, z - 3.9, { ombre: false }); bloc(9, 0.1, 0.3, M.acier, x, 0.05, z + 3.9, { ombre: false }); }

  // ---- cuve gasoil (bac de rétention) et pompe sous auvent ----
  { const [x] = PLAN.gasoil;
    bloc(10, 0.9, 5.4, M.beton, x, 0, -31.5); bloc(9.2, 0.92, 4.6, col(0x7c7f85, { roughness: 0.7 }), x, 0.02, -31.5, { ombre: false });
    cyl(1.45, 1.45, 7.4, col(0xe8ebe6, { roughness: 0.4, metalness: 0.3 }), x, 2.25, -31.5, { rz: Math.PI / 2, seg: 32 });
    cyl(1.47, 1.47, 0.5, col(0x166534, { roughness: 0.4, metalness: 0.3 }), x - 3, 2.25, -31.5, { rz: Math.PI / 2, seg: 32 }); cyl(1.47, 1.47, 0.5, col(0x166534, { roughness: 0.4, metalness: 0.3 }), x + 3, 2.25, -31.5, { rz: Math.PI / 2, seg: 32 });
    for (const dx of [-2.6, 2.6]) bloc(0.4, 1.0, 2.4, M.acier, x + dx, 0.9, -31.5);
    bloc(0.3, 0.6, 0.3, col(0xfacc15), x + 3.7, 3.4, -31.5);
    bloc(2.4, 0.22, 1.1, M.beton, x, 0, -23.7); bloc(0.7, 1.7, 0.5, col(0x166534, { roughness: 0.4, metalness: 0.2 }), x, 0.22, -23.7); bloc(0.5, 0.4, 0.52, col(0x0b0f14, { roughness: 0.1 }), x, 1.3, -23.45, { ombre: false });
    for (const dx of [-1.8, 1.8]) { bloc(0.25, 5.4, 0.25, M.galva, x + dx, 0, -24.2); cyl(0.35, 0.35, 1.2, col(0xf2c200), x + dx, 0.6, -24.2, { seg: 12 }); }
    bloc(5.4, 0.35, 3.4, col(0xf3f4f6, { metalness: 0.4, roughness: 0.3 }), x, 5.4, -23.4); bloc(5.42, 0.36, 0.06, col(0x166534), x, 5.4, -21.7, { ombre: false });
    bloc(4.8, 0.03, 2.8, M.lampe, x, 5.38, -23.4, { ombre: false }); }

  // ---- bureaux d'exploitation sur 2 niveaux (rez-de-chaussée aménagé, coupé quand on zoome) ----
  const BX0 = -56, BX1 = -32, BZ0 = 11, BZ1 = 29, H1 = 3.5, H2 = 7.2;
  { const cv = couvercle(); toits.push({ groupe: cv, zone: [BX0 - 4, BZ0 - 3, BX1 + 6, BZ1 + 6] });
    bloc(BX1 - BX0, 0.2, BZ1 - BZ0, M.beton, (BX0 + BX1) / 2, 0, (BZ0 + BZ1) / 2);
    bloc(BX1 - BX0 - 0.4, 0.02, BZ1 - BZ0 - 0.4, col(0x8e9196, { roughness: 0.9 }), (BX0 + BX1) / 2, 0.2, (BZ0 + BZ1) / 2, { ombre: false });
    // façades nord et ouest pleines ; sud et est : allège basse toujours là, vitrage complet dans le couvercle
    const vit = (l, p, x, z, y0, h, parent) => bloc(l, h, p, M.vitrage, x, y0, z, { parent, e: 1 });
    vit(BX1 - BX0, 0.3, (BX0 + BX1) / 2, BZ0, 0.2, H1 - 0.2, scene); vit(0.3, BZ1 - BZ0, BX0, (BZ0 + BZ1) / 2, 0.2, H1 - 0.2, scene);
    bloc(BX1 - BX0, 0.9, 0.3, M.bardageG, (BX0 + BX1) / 2, 0.2, BZ1); bloc(0.3, 0.9, BZ1 - BZ0 - 3, M.bardageG, BX1, 0.2, (BZ0 + BZ1) / 2 - 1.5);
    vit(BX1 - BX0, 0.28, (BX0 + BX1) / 2, BZ1, 1.1, H1 - 1.1, cv); vit(0.28, BZ1 - BZ0 - 3, BX1, (BZ0 + BZ1) / 2 - 1.5, 1.1, H1 - 1.1, cv);
    bloc(0.28, H1 - 0.2, 2.8, M.vitre, BX1, 0.2, BZ1 - 1.5, { parent: cv, ombre: false });                     // porte d'entrée vitrée
    // étage
    bloc(BX1 - BX0 + 0.4, 0.4, BZ1 - BZ0 + 0.4, M.bardageG, (BX0 + BX1) / 2, H1, (BZ0 + BZ1) / 2, { parent: cv });
    for (const [l, p, x, z] of [[BX1 - BX0, 0.3, (BX0 + BX1) / 2, BZ0], [BX1 - BX0, 0.3, (BX0 + BX1) / 2, BZ1], [0.3, BZ1 - BZ0, BX0, (BZ0 + BZ1) / 2], [0.3, BZ1 - BZ0, BX1, (BZ0 + BZ1) / 2]]) vit(l, p, x, z, H1 + 0.4, H2 - H1 - 0.4, cv);
    for (const [l, p, x, z] of [[BX1 - BX0 + 0.5, 0.35, (BX0 + BX1) / 2, BZ0], [BX1 - BX0 + 0.5, 0.35, (BX0 + BX1) / 2, BZ1], [0.35, BZ1 - BZ0, BX0, (BZ0 + BZ1) / 2], [0.35, BZ1 - BZ0, BX1, (BZ0 + BZ1) / 2]]) bloc(l, 0.9, p, M.bardageG, x, H2, z, { parent: cv });
    bloc(BX1 - BX0, 0.1, BZ1 - BZ0, M.toit, (BX0 + BX1) / 2, H2, (BZ0 + BZ1) / 2, { parent: cv });
    bloc(3, 1.4, 2, M.galva, -50, H2 + 0.3, 15, { parent: cv }); bloc(1.6, 1, 1.6, M.galva, -38, H2 + 0.3, 14, { parent: cv });
    affiche(9, 1.13, [0, 384, 1024, 512], -44, H2 + 0.45, BZ1 + 0.27, 0, cv);
    // auvent d'entrée
    bloc(4.2, 0.22, 3.2, col(0xd5d8dc, { metalness: 0.5, roughness: 0.4 }), BX1 + 1.1, H1 - 0.5, BZ1 - 1.5, { parent: cv });
    for (const dz of [-1.4, 1.4]) cyl(0.08, 0.08, H1 - 0.5, M.acier, BX1 + 3, (H1 - 0.5) / 2, BZ1 - 1.5 + dz, { parent: cv });
  }
  // aménagement du rez-de-chaussée
  const cloison = (l, p, x, z) => bloc(l, 1.3, p, col(0xf1f2f5), x, 0.2, z);
  cloison(0.15, BZ1 - BZ0, -44, (BZ0 + BZ1) / 2); cloison(12, 0.15, -50, 20); cloison(12, 0.15, -38, 21);
  const bureau = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0.2, z); g.rotation.y = ry; scene.add(g);
    bloc(1.6, 0.04, 0.8, col(0xe8e2d6, { roughness: 0.6 }), 0, 0.72, 0, { parent: g }); bloc(0.05, 0.72, 0.7, M.acier, -0.75, 0, 0, { parent: g }); bloc(0.05, 0.72, 0.7, M.acier, 0.75, 0, 0, { parent: g });
    bloc(0.6, 0.38, 0.04, col(0x0f172a, { roughness: 0.2 }), -0.35, 0.8, -0.28, { parent: g }); bloc(0.6, 0.38, 0.04, col(0x0f172a, { roughness: 0.2 }), 0.35, 0.8, -0.28, { parent: g }); bloc(0.5, 0.45, 0.5, col(0x2b3240), 0, 0, 0.65, { parent: g }); };
  bureau(-40, 14.2); bureau(-36.5, 14.2); bureau(-40, 17.6, Math.PI);
  bloc(3.6, 1.6, 0.08, col(0x0b1220), -38.2, 1.0, 11.25); bloc(3.4, 1.4, 0.02, col(0x1d4ed8, { emissive: 0x1d4ed8, emissiveIntensity: 0.5 }), -38.2, 1.1, 11.3, { ombre: false });
  bureau(-50, 14.2); bureau(-53, 17.4, Math.PI / 2); bureau(-50, 24.4); bureau(-53.2, 24.4);
  bloc(4.2, 0.05, 1.4, col(0xc8b48e, { roughness: 0.6 }), -38, 0.75, 25); bloc(0.1, 0.75, 1.2, col(0x6b5b40), -39.9, 0.2, 25); bloc(0.1, 0.75, 1.2, col(0x6b5b40), -36.1, 0.2, 25);
  bloc(0.6, 1.5, 0.5, col(0x111827), -43, 0.2, 28.3); for (let k = 0; k < 6; k++) bloc(0.55, 1.9, 0.5, col(k % 2 ? 0x64748b : 0x475569, { metalness: 0.4 }), -42 + k * 0.6, 0.2, 21.6);
  for (const [x, z] of [[-31, 26.5], [-31, 22.5]]) { cyl(0.45, 0.35, 0.6, col(0x3c3f44), x, 0.3, z); blob(x, 0.9, z, 0.55, 0x4d6b35, 1); }

  // ---- panneau d'entrée, loge, clôture, portail ----
  bloc(0.16, 2.6, 0.16, M.acier, 37.6, 0, 30.2); bloc(0.16, 2.6, 0.16, M.acier, 41.4, 0, 30.2);
  { const o = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.4), M.panneau); o.position.set(39.5, 2.6, 30.3); scene.add(o); }
  bloc(3.9, 1.5, 0.12, col(0x0f2a5c), 39.5, 1.95, 30.2);
  const tronçon = (xa, za, xb, zb) => { const l = Math.hypot(xb - xa, zb - za), n = Math.max(1, Math.round(l / 2.5)), ry = -Math.atan2(zb - za, xb - xa);
    for (let k = 0; k <= n; k++) bloc(0.07, 2.05, 0.07, M.grillage.color.getHex(), xa + (xb - xa) * k / n, 0, za + (zb - za) * k / n, { ombre: false });
    const g = new THREE.PlaneGeometry(l, 2), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * l / 2.5);
    const o = new THREE.Mesh(g, M.grillage); o.position.set((xa + xb) / 2, 1.0, (za + zb) / 2); o.rotation.y = ry; o.receiveShadow = true; scene.add(o); };
  tronçon(-58, 31, 41, 31); tronçon(52, 31, 58, 31); tronçon(-58, -41, 58, -41); tronçon(-58, -41, -58, 31); tronçon(58, -41, 58, 31);
  bloc(11, 1.8, 0.1, col(0x9ca3af, { metalness: 0.6, roughness: 0.4 }), 57.5, 0.1, 31.4, { ombre: false });
  bloc(2.4, 2.7, 2.4, M.bardageG, 54.6, 0, 27.5); bloc(2.44, 1.1, 2.44, M.vitrage, 54.6, 1.2, 27.5, { e: 1 }); bloc(2.8, 0.22, 2.8, col(0x0f2a5c), 54.6, 2.7, 27.5);
  bloc(3.8, 0.12, 0.12, col(0xdc2626), 50.8, 1.0, 29.6, { ombre: false });                                     // barrière levante

  // ---- lampadaires ----
  const lampadaire = (x, z, ry) => { cyl(0.09, 0.14, 9, M.galva, x, 4.5, z, { seg: 10 }); const g = new THREE.Group(); g.position.set(x, 9, z); g.rotation.y = ry; scene.add(g);
    bloc(1.4, 0.08, 0.08, M.galva, 0.7, -0.05, 0, { parent: g }); bloc(0.7, 0.12, 0.32, col(0x4b5058, { metalness: 0.6, roughness: 0.4 }), 1.4, -0.1, 0, { parent: g }); bloc(0.6, 0.02, 0.26, M.lampe, 1.4, -0.12, 0, { parent: g, ombre: false }); };
  for (const x of [-10, 10, 30, 48]) lampadaire(x, 8.2, Math.PI / 2);
  for (const x of [-10, 12, 34]) lampadaire(x, -18, -Math.PI / 2);
  lampadaire(54, -8, Math.PI); lampadaire(-15.5, -8, 0); lampadaire(30, 19, Math.PI / 2); lampadaire(-28, 10, Math.PI / 2);
  for (const x of [-40, -10, 20, 70, -70]) lampadaire(x, 43.2, -Math.PI / 2);

  // ---- végétation ----
  function blob(x, y, z, rr, c, graine) {
    const g = new THREE.IcosahedronGeometry(rr, rr > 1.2 ? 3 : 2), P = g.attributes.position, v = new THREE.Vector3(), rnd = hasard(graine * 977 + 13), a = rnd() * 6, b = rnd() * 6;
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const n = 1 + 0.16 * Math.sin(v.x * 3.1 / rr + a) * Math.sin(v.y * 2.7 / rr + b) + 0.08 * Math.sin(v.z * 5.3 / rr + a + b); v.multiplyScalar(n); if (v.y < -rr * 0.35) v.y = -rr * 0.35 + (v.y + rr * 0.35) * 0.3; P.setXYZ(i, v.x, v.y, v.z); }
    const Nn = g.attributes.normal; for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); v.y *= 0.8; v.normalize(); Nn.setXYZ(i, v.x, v.y + 0.15, v.z); }  // normales lisses (feuillage arrondi)
    const o = new THREE.Mesh(g, col(c, { roughness: 0.95 })); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o;
  }
  const VERTS = [0x33462a, 0x3c5130, 0x465a35, 0x2e4126, 0x4e6136, 0x5c6232, 0x6a6534];
  let ng = 1;
  const arbre = (x, z, s = 1, peuplier = false) => {
    const h = (peuplier ? 3.2 : 2.2) * s; cyl(0.12 * s, 0.2 * s, h, col(0x5b4636, { roughness: 1 }), x, h / 2, z, { seg: 7 });
    const c = VERTS[Math.floor(r() * VERTS.length)];
    if (peuplier) { for (let k = 0; k < 4; k++) blob(x + (r() - 0.5) * 0.4 * s, h + k * 1.6 * s, z + (r() - 0.5) * 0.4 * s, (1.3 - k * 0.18) * s, c, ng++); return; }
    blob(x, h + 1.4 * s, z, 1.9 * s, c, ng++);
    for (let k = 0; k < 5; k++) { const a = r() * Math.PI * 2, d = (0.9 + r() * 0.7) * s; blob(x + Math.cos(a) * d, h + (0.7 + r() * 1.4) * s, z + Math.sin(a) * d, (1.0 + r() * 0.5) * s, VERTS[Math.floor(r() * VERTS.length)], ng++); }
  };
  for (let x = -62; x <= 62; x += 8.5) arbre(x + (r() - 0.5) * 2, 46.5 + (r() - 0.5) * 2, 1 + r() * 0.35);
  for (let z = -38; z <= 26; z += 7.5) { arbre(-63 + (r() - 0.5) * 2, z, 1.05 + r() * 0.3, r() > 0.6); arbre(63 + (r() - 0.5) * 2, z + 3, 1.05 + r() * 0.3, r() > 0.6); }
  for (let x = -54; x <= 54; x += 7) arbre(x + (r() - 0.5) * 2, -45.5 + (r() - 0.5) * 2, 1.1 + r() * 0.3, r() > 0.7);
  for (const [x, z] of [[-28, 27], [-24, 20], [18, 27], [10, 21.5], [-16, 28]]) arbre(x, z, 0.95);
  for (let k = 0; k < 26; k++) { const x = -56 + k * 4.3 + r(); if (x > 38 && x < 54) continue; blob(x, 0.5, 32.9 + r() * 0.5, 0.9 + r() * 0.3, VERTS[k % VERTS.length], ng++); } // haie côté route
  // bosquets plus loin
  for (let k = 0; k < 70; k++) { const a = r() * Math.PI * 2, d = 90 + r() * 160, x = Math.cos(a) * d * 1.3, z = Math.sin(a) * d - 20; if (z > 30 && z < 50) continue; if (Math.abs(x) < 150 && z > -95 && z < -60) continue; arbre(x, z, 1.2 + r() * 0.8, r() > 0.75); }

  // ---- voisinage : autres entrepôts de la zone d'activité ----
  const voisin = (x, z, l, p, h, mB) => { bloc(l, h, p, M.bardage, x, 0, z, { e: 1 }); bloc(l + 0.2, 1.2, p + 0.2, mB, x, h - 1.2, z); bloc(l - 0.6, 0.15, p - 0.6, M.toit, x, h - 0.4, z, { ombre: false }); sol(l + 16, p + 22, M.site, x, 0.03, z + 6); };
  voisin(-30, -112, 70, 30, 11, M.bardageG); voisin(125, -80, 55, 38, 10, M.bardageB); voisin(-165, -40, 40, 60, 11, M.bardageG);
  voisin(110, 85, 70, 36, 9, M.bardageG); voisin(-60, 90, 54, 30, 10, M.bardageB);
  for (const [x, z] of [[-60, 70], [110, 64]]) sol(10, 26, M.route, x, 0.04, z);

  return { toits };
}

// ---------- livrée des bâches et caisses (texture partagée) ----------
let LIV = null;
export function LIVREE(THREE) {
  if (LIV) return LIV;
  LIV = toile(THREE, 1024, 1024, (g) => {
    const bache = (x, y, w, h, plis) => {
      g.fillStyle = '#f2f3f4'; g.fillRect(x, y, w, h);
      if (plis) for (let k = 0; k < w; k += 18) { const gr = g.createLinearGradient(x + k, 0, x + k + 18, 0); gr.addColorStop(0, 'rgba(0,0,0,.05)'); gr.addColorStop(0.5, 'rgba(255,255,255,.06)'); gr.addColorStop(1, 'rgba(0,0,0,.07)'); g.fillStyle = gr; g.fillRect(x + k, y, 18, h); }
      // bande orange et logo
      g.fillStyle = '#f59e0b'; g.beginPath(); g.moveTo(x, y + h * 0.78); g.bezierCurveTo(x + w * 0.35, y + h * 0.62, x + w * 0.65, y + h * 0.86, x + w, y + h * 0.66); g.lineTo(x + w, y + h * 0.76); g.bezierCurveTo(x + w * 0.65, y + h * 0.96, x + w * 0.35, y + h * 0.72, x, y + h * 0.88); g.fill();
      g.fillStyle = '#0f2a5c'; g.fillRect(x, y + h * 0.9, w, h * 0.1);
      texte(g, 'TRANSPORTS MODÈLE', x + w * 0.5, y + h * 0.36, Math.round(h * 0.26), '#0f2a5c', 0, 800);
      texte(g, 'Transport · Logistique · Distribution', x + w * 0.5, y + h * 0.56, Math.round(h * 0.085), '#334155', 0, 600);
      if (plis) { g.fillStyle = 'rgba(40,44,52,.55)'; for (let k = 30; k < w; k += 43) { g.fillRect(x + k, y + h * 0.9, 4, h * 0.1); g.fillRect(x + k - 2, y + h * 0.88, 8, 5); } }
    };
    bache(0, 0, 1024, 207, true);        // côté de semi-remorque (13,4 × 2,6 m)
    bache(0, 256, 720, 256, false);       // côté de porteur (7,2 × 2,5 m)
    bache(0, 512, 512, 230, false);       // côté de fourgon 20 m³ (4,6 × 2,1 m)
    // arrière (portes) : gris clair, logo réduit
    g.fillStyle = '#e4e6e9'; g.fillRect(512, 512, 256, 256); g.fillStyle = '#c9ccd1'; g.fillRect(638, 512, 4, 256);
    texte(g, 'TRANSPORTS', 640, 600, 30, '#0f2a5c', 0, 800); texte(g, 'MODÈLE', 640, 636, 30, '#0f2a5c', 0, 800);
    g.fillStyle = '#f59e0b'; g.fillRect(512, 740, 256, 10);
  });
  return LIV;
}
const ZL = { semi: [0, 0, 1024, 207], porteur: [0, 256, 720, 512], util: [0, 512, 512, 742], arriere: [512, 512, 768, 768] };
function panneauLivree(THREE, l, h, zone) { const g = new THREE.PlaneGeometry(l, h), uv = g.attributes.uv, [u0, y0, u1, y1] = zone;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (u0 + uv.getX(i) * (u1 - u0)) / 1024, 1 - (y1 - uv.getY(i) * (y1 - y0)) / 1024); return g; }

// ---------- modèles de véhicules ----------
const RB = (l, h, p, r = 0.05, s = 2) => new RoundedBoxGeometry(l, h, p, s, Math.min(r, l / 2 - 0.001, h / 2 - 0.001, p / 2 - 0.001));
// profil latéral (z, y) extrudé sur la largeur, arêtes arrondies
function profil(THREE, pts, larg, b = 0.06) {
  const sh = new THREE.Shape(); pts.forEach(([z, y], i) => (i ? sh.lineTo(z, y) : sh.moveTo(z, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: larg - 2 * b, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 4 });
  g.rotateY(-Math.PI / 2); g.translate((larg - 2 * b) / 2, 0, 0); return g;
}
// roue : pneu (profil arrondi) + jante
function pneu(THREE, R, w) {
  const e = Math.min(0.06, w * 0.2), rr = R * 0.56, pts = [[rr, -w / 2], [R - e * 1.4, -w / 2], [R - e * 0.3, -w / 2 + e * 0.4], [R, -w / 2 + e * 1.2], [R, w / 2 - e * 1.2], [R - e * 0.3, w / 2 - e * 0.4], [R - e * 1.4, w / 2], [rr, w / 2]];
  return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 28);
}
function roues(THREE, R, W, zs, double = false, wl = 0.32) {
  const out = { fixe: [], metal: [] };
  for (const z of zs) for (const s of [-1, 1]) {
    const n = double ? 2 : 1, ext = s * (W / 2 - 0.02);
    for (let k = 0; k < n; k++) { const x = ext - s * (wl / 2 + k * (wl + 0.03)); out.fixe.push({ geo: pneu(THREE, R, wl), x, y: R, z, rz: Math.PI / 2, couleur: 0x1b1c1f }); }
    const xo = ext - s * 0.03;                                                                                  // jante côté extérieur
    out.metal.push({ geo: new THREE.CylinderGeometry(R * 0.55, R * 0.55, 0.04, 24), x: xo - s * 0.06, y: R, z, rz: Math.PI / 2, couleur: 0xc9ced6 });
    out.metal.push({ geo: new THREE.CylinderGeometry(R * 0.2, R * 0.24, 0.1, 12), x: xo - s * 0.02, y: R, z, rz: Math.PI / 2, couleur: 0x8d939b });
    out.fixe.push({ geo: new THREE.CylinderGeometry(R * 0.5, R * 0.5, double ? 2 * wl : wl, 16), x: ext - s * (double ? wl : wl / 2), y: R, z, rz: Math.PI / 2, couleur: 0x2a2d31 });
  }
  return out;
}
const garde = (THREE, R, W, z, larg) => [-1, 1].map((s) => ({ geo: new THREE.CylinderGeometry(R + 0.1, R + 0.1, larg, 18, 1, true, 0, Math.PI), x: s * (W / 2 - larg / 2 + 0.02), y: R, z, rz: Math.PI / 2, couleur: 0x1d1f23 }));
const DOUBLE = (THREE) => ({ side: THREE.DoubleSide });

// cabine avancée européenne : avant en zf, largeur W, plancher y0, profondeur P, haut toit hT, déflecteur jusqu'à hD (0 = sans)
function cabine(THREE, zf, W, y0, P, hT, hD) {
  const teinte = [], fixe = [], metal = [], vitre = [];
  const pente = 0.14;
  teinte.push({ geo: profil(THREE, [[zf, y0], [zf, y0 + 1.15], [zf - pente, hT - 0.12], [zf - pente - 0.18, hT], [zf - P, hT], [zf - P, y0]], W, 0.09) });
  if (hD) { teinte.push({ geo: profil(THREE, [[zf - pente - 0.3, hT - 0.02], [zf - P * 0.62, hD], [zf - P + 0.05, hD], [zf - P + 0.05, hT - 0.02]], W - 0.2, 0.08) });
    for (const s of [-1, 1]) teinte.push({ geo: RB(0.06, hT - y0 - 0.4, 0.5, 0.02), x: s * (W / 2 + 0.08), y: (hT + y0 + 0.4) / 2, z: zf - P - 0.15 }); }
  // pare-brise incliné et son joint noir, vitres latérales
  const yb = y0 + 1.2, yh = hT - 0.22, yc = (yb + yh) / 2, rx = -Math.atan(pente / (hT - y0 - 1.15));
  fixe.push({ geo: RB(W - 0.12, yh - yb + 0.12, 0.04, 0.03), y: yc, z: zf + 0.06 - pente * (yc - y0 - 1.15) / (hT - y0 - 1.15), rx, couleur: 0x0d0f12 });
  vitre.push({ geo: RB(W - 0.26, yh - yb, 0.04, 0.03), y: yc, z: zf + 0.085 - pente * (yc - y0 - 1.15) / (hT - y0 - 1.15), rx });
  for (const s of [-1, 1]) { vitre.push({ geo: RB(0.04, 0.78, 1.0, 0.04), x: s * (W / 2 + 0.07), y: yh - 0.42, z: zf - 0.68 }); fixe.push({ geo: RB(0.03, 0.86, 1.08, 0.04), x: s * (W / 2 + 0.06), y: yh - 0.42, z: zf - 0.68, couleur: 0x0d0f12 }); }
  // pare-soleil, feux de gabarit
  fixe.push({ geo: RB(W - 0.1, 0.07, 0.32, 0.03), y: hT - 0.05, z: zf + 0.05, couleur: 0x15171a });
  for (const x of [-0.6, -0.2, 0.2, 0.6]) fixe.push({ geo: RB(0.12, 0.05, 0.05, 0.02), x, y: hT + 0.01, z: zf + 0.17, couleur: 0xf59e0b });
  // calandre (lames chromées), écusson, pare-chocs, phares, antibrouillards, plaque
  fixe.push({ geo: RB(W - 0.7, 0.95, 0.05, 0.03), y: y0 + 0.62, z: zf + 0.08, couleur: 0x1a1c20 });
  for (let k = 0; k < 5; k++) metal.push({ geo: RB(W - 0.78, 0.045, 0.04, 0.015), y: y0 + 0.25 + k * 0.19, z: zf + 0.11, couleur: 0xd7dbe0 });
  metal.push({ geo: RB(0.5, 0.12, 0.03, 0.03), y: y0 + 1.05, z: zf + 0.12, couleur: 0xeef1f4 });
  fixe.push({ geo: RB(W + 0.04, 0.5, 0.36, 0.1, 3), y: y0 - 0.3, z: zf + 0.0, couleur: 0x2f3237 });
  for (const s of [-1, 1]) {
    metal.push({ geo: RB(0.44, 0.17, 0.06, 0.04), x: s * (W / 2 - 0.36), y: y0 - 0.15, z: zf + 0.18, couleur: 0xf4f6f8 });
    fixe.push({ geo: RB(0.46, 0.19, 0.04, 0.04), x: s * (W / 2 - 0.36), y: y0 - 0.15, z: zf + 0.165, couleur: 0x0d0f12 });
    metal.push({ geo: new THREE.CylinderGeometry(0.06, 0.06, 0.04, 14), x: s * (W / 2 - 0.25), y: y0 - 0.42, z: zf + 0.18, rx: Math.PI / 2, couleur: 0xf4f6f8 });
    // rétroviseurs (bras, coque, grand-angle)
    metal.push({ geo: RB(0.3, 0.04, 0.04, 0.015), x: s * (W / 2 + 0.17), y: yh - 0.1, z: zf - 0.12, couleur: 0x9aa0a8 });
    fixe.push({ geo: RB(0.1, 0.5, 0.24, 0.04), x: s * (W / 2 + 0.33), y: yh - 0.35, z: zf - 0.12, couleur: 0x15171a });
    fixe.push({ geo: RB(0.1, 0.2, 0.2, 0.04), x: s * (W / 2 + 0.33), y: yh - 0.78, z: zf - 0.1, couleur: 0x15171a });
    // marchepieds et poignée
    fixe.push({ geo: RB(0.34, 0.06, 0.32, 0.02), x: s * (W / 2 - 0.2), y: y0 - 0.2, z: zf - P + 0.45, couleur: 0x2b2e33 });
    fixe.push({ geo: RB(0.34, 0.06, 0.32, 0.02), x: s * (W / 2 - 0.2), y: y0 - 0.55, z: zf - P + 0.45, couleur: 0x2b2e33 });
    metal.push({ geo: RB(0.03, 0.6, 0.04, 0.01), x: s * (W / 2 + 0.1), y: y0 + 0.9, z: zf - P + 0.2, couleur: 0xc0c5cc });
    teinte.push({ geo: RB(0.08, 0.7, 0.5, 0.03), x: s * (W / 2 - 0.02), y: y0 - 0.25, z: zf - P + 0.45 });
  }
  return { teinte, fixe, metal, vitre };
}
const fusion = (THREE, assembler, liste, c = 0xffffff) => assembler(THREE, liste.map((p) => ({ couleur: c, ...p })));

// Tracteur routier (6 m, avant +z en z = 3) ; sellette à z = -1.3
export function geosTracteur(THREE, assembler) {
  const W = 2.48, c = cabine(THREE, 3, W, 1.15, 2.3, 3.62, 3.98), R = 0.52, av = roues(THREE, R, W, [1.85]), ar = roues(THREE, R, W, [-1.7], true, 0.3);
  const fixe = [...c.fixe, ...av.fixe, ...ar.fixe, ...garde(THREE, R, W, 1.85, 0.42), ...garde(THREE, R, W, -1.7, 0.7),
    { geo: RB(1.0, 0.3, 6.1, 0.03), y: 0.92, z: -0.05, couleur: 0x1b1d21 },
    { geo: new THREE.CylinderGeometry(0.62, 0.62, 0.12, 24), y: 1.3, z: -1.3, couleur: 0x2a2d31 }, { geo: RB(1.9, 0.12, 1.4, 0.03), y: 1.2, z: -1.3, couleur: 0x2a2d31 },
    { geo: RB(0.5, 0.55, 0.9, 0.05), x: -0.98, y: 0.82, z: -0.4, couleur: 0x2b2e33 },
    { geo: RB(2.3, 0.08, 0.04, 0.02), y: 0.5, z: -2.4, couleur: 0x111214 }, ...[-1, 1].map((s) => ({ geo: RB(0.62, 0.55, 0.02, 0.01), x: s * 0.92, y: 0.55, z: -2.38, couleur: 0x111214 })),
    ...[-1, 1].map((s) => ({ geo: RB(0.3, 0.12, 0.06, 0.02), x: s * 0.95, y: 0.92, z: -3.05, couleur: 0xb3121b })),
    { geo: RB(0.5, 0.12, 0.03, 0.01), y: 0.42, z: 3.2, couleur: 0xf4f4f0 }];
  const metal = [...c.metal, ...av.metal, ...ar.metal,
    { geo: new THREE.CylinderGeometry(0.34, 0.34, 1.3, 24), x: 0.98, y: 0.78, z: -0.45, rx: Math.PI / 2, couleur: 0xd4d8dd },
    { geo: new THREE.CylinderGeometry(0.1, 0.1, 0.7, 10), x: -0.6, y: 3.95, z: 0.62, couleur: 0x9aa0a8 }];
  return { teinte: fusion(THREE, assembler, c.teinte), fixe: fusion(THREE, assembler, fixe), metal: fusion(THREE, assembler, metal), vitre: fusion(THREE, assembler, c.vitre) };
}
// Semi-remorque bâchée (13,6 m, centre à l'origine, avant +z en z = 6,8)
export function geosRemorque(THREE, assembler) {
  const W = 2.55, R = 0.5, rw = roues(THREE, R, W, [-3.0, -4.3, -5.6], false, 0.38), yb = 1.32, yh = 4.0, L = 13.6;
  const teinte = [{ geo: RB(W, yh - yb, 0.1, 0.03), y: (yb + yh) / 2, z: L / 2 - 0.05 }, { geo: RB(W, 0.08, L, 0.03), y: yh, z: 0 }];
  const fixe = [...rw.fixe,
    { geo: RB(1.1, 0.4, L - 0.3, 0.03), y: 1.0, z: 0, couleur: 0x1b1d21 }, { geo: RB(W, 0.08, L, 0.02), y: yb - 0.04, z: 0, couleur: 0x2a2d31 },
    { geo: RB(W - 0.1, yh - yb - 0.1, 0.06, 0.02), y: (yb + yh) / 2, z: -L / 2 + 0.02, couleur: 0xe6e8eb },
    ...[-1, 1].flatMap((s) => [{ geo: RB(0.12, 0.95, 0.12, 0.02), x: s * 0.85, y: 0.5, z: 4.2, couleur: 0x2b2e33 }, { geo: RB(0.3, 0.05, 0.3, 0.02), x: s * 0.85, y: 0.03, z: 4.2, couleur: 0x2b2e33 },
      { geo: RB(0.42, 0.04, 4.1, 0.02), x: s * (W / 2 - 0.2), y: 1.1, z: -4.3, couleur: 0x15171a },
      { geo: RB(0.32, 0.14, 0.05, 0.02), x: s * 0.95, y: 0.72, z: -L / 2 + 0.02, couleur: 0xb3121b }, { geo: RB(0.12, 0.14, 0.05, 0.02), x: s * 0.68, y: 0.72, z: -L / 2 + 0.02, couleur: 0xe08a00 }]),
    { geo: RB(W - 0.1, 0.16, 0.12, 0.03), y: 0.55, z: -L / 2 + 0.05, couleur: 0x2a2d31 }, { geo: RB(0.52, 0.12, 0.02, 0.01), y: 0.78, z: -L / 2 - 0.02, couleur: 0xf4f4f0 }];
  const metal = [...rw.metal,
    ...[-1, 1].flatMap((s) => [{ geo: RB(0.05, 0.14, L, 0.02), x: s * W / 2, y: yh - 0.06, z: 0, couleur: 0xc9ced6 }, { geo: RB(0.06, 0.22, L, 0.02), x: s * W / 2, y: yb + 0.09, z: 0, couleur: 0xc9ced6 },
      { geo: RB(0.08, yh - yb, 0.1, 0.02), x: s * (W / 2 - 0.03), y: (yb + yh) / 2, z: -L / 2 + 0.03, couleur: 0xb9bec4 },
      { geo: RB(0.04, 0.12, 5.2, 0.02), x: s * 1.2, y: 0.78, z: 1.0, couleur: 0xb9bec4 }, { geo: RB(0.04, 0.12, 5.2, 0.02), x: s * 1.2, y: 0.45, z: 1.0, couleur: 0xb9bec4 }]),
    ...[-0.75, -0.25, 0.25, 0.75].map((x) => ({ geo: new THREE.CylinderGeometry(0.025, 0.025, yh - yb - 0.2, 8), x, y: (yb + yh) / 2, z: -L / 2 - 0.03, couleur: 0xaab0b8 }))];
  const deco = [{ geo: panneauLivree(THREE, L - 0.2, yh - yb - 0.12, ZL.semi), x: W / 2 + 0.006, y: (yb + yh) / 2, z: 0, ry: Math.PI / 2 }, { geo: panneauLivree(THREE, L - 0.2, yh - yb - 0.12, ZL.semi), x: -W / 2 - 0.006, y: (yb + yh) / 2, z: 0, ry: -Math.PI / 2 },
    { geo: panneauLivree(THREE, W - 0.2, yh - yb - 0.2, ZL.arriere), y: (yb + yh) / 2, z: -L / 2 - 0.015, ry: Math.PI }];
  return { teinte: fusion(THREE, assembler, teinte), fixe: fusion(THREE, assembler, fixe), metal: fusion(THREE, assembler, metal), deco: fusion(THREE, assembler, deco) };
}
// Porteur 19 t (10 m, avant +z en z = 5) : cabine courte teintée, caisse fourgon avec logo, hayon
export function geosPorteur(THREE, assembler) {
  const W = 2.48, c = cabine(THREE, 5, W, 1.1, 1.85, 3.25, 0), R = 0.5, av = roues(THREE, R, W, [3.85]), ar = roues(THREE, R, W, [-2.2], true, 0.3);
  const yb = 1.3, yh = 3.9, zc = -1.25, Lc = 7.3;
  const fixe = [...c.fixe, ...av.fixe, ...ar.fixe, ...garde(THREE, R, W, 3.85, 0.42), ...garde(THREE, R, W, -2.2, 0.7),
    { geo: RB(W + 0.04, yh - yb, Lc, 0.06, 3), y: (yb + yh) / 2, z: zc, couleur: 0xf1f2f3 },
    { geo: RB(1.0, 0.3, 9.4, 0.03), y: 0.88, z: 0, couleur: 0x1b1d21 }, { geo: RB(W - 0.1, 0.1, 0.7, 0.02), y: 0.6, z: -4.95, couleur: 0x2f3237 },
    ...[-1, 1].flatMap((s) => [{ geo: RB(0.3, 0.12, 0.05, 0.02), x: s * 0.95, y: 0.95, z: -4.95, couleur: 0xb3121b }, { geo: RB(0.5, 0.5, 0.9, 0.05), x: s * 0.98, y: 0.82, z: 0.9, couleur: 0x2b2e33 }])];
  const metal = [...c.metal, ...av.metal, ...ar.metal, ...[-1, 1].flatMap((s) => [{ geo: RB(0.05, 0.15, Lc, 0.02), x: s * (W / 2 + 0.03), y: yh - 0.06, z: zc, couleur: 0xc9ced6 }, { geo: RB(0.04, 0.1, 3.6, 0.02), x: s * 1.2, y: 0.62, z: 0.95, couleur: 0xb9bec4 }])];
  const deco = [{ geo: panneauLivree(THREE, Lc - 0.3, yh - yb - 0.3, ZL.porteur), x: W / 2 + 0.03, y: (yb + yh) / 2, z: zc, ry: Math.PI / 2 }, { geo: panneauLivree(THREE, Lc - 0.3, yh - yb - 0.3, ZL.porteur), x: -W / 2 - 0.03, y: (yb + yh) / 2, z: zc, ry: -Math.PI / 2 },
    { geo: panneauLivree(THREE, W - 0.2, yh - yb - 0.2, ZL.arriere), y: (yb + yh) / 2, z: zc - Lc / 2 - 0.02, ry: Math.PI }];
  return { teinte: fusion(THREE, assembler, c.teinte), fixe: fusion(THREE, assembler, fixe), metal: fusion(THREE, assembler, metal), vitre: fusion(THREE, assembler, c.vitre), deco: fusion(THREE, assembler, deco) };
}
// Fourgon 20 m³ (caisse avec capucine sur châssis-cabine, 6,6 m, avant +z en z = 3,3)
export function geosFourgon(THREE, assembler) {
  const W = 2.02, WC = 2.2, R = 0.36, av = roues(THREE, R, W, [2.35]), ar = roues(THREE, R, W, [-1.85], true, 0.22);
  const teinte = [{ geo: profil(THREE, [[3.25, 0.5], [3.3, 0.95], [3.08, 1.22], [2.62, 1.38], [1.86, 2.38], [1.62, 2.44], [1.45, 2.44], [1.45, 0.5]], W, 0.09) }];
  const a = Math.atan2(2.62 - 1.86, 2.38 - 1.38), cz = (2.62 + 1.86) / 2 + Math.cos(a) * 0.1, cy = (1.38 + 2.38) / 2 + Math.sin(a) * 0.1, lg = Math.hypot(0.76, 1.0);
  const vitre = [{ geo: RB(W - 0.28, lg - 0.16, 0.03, 0.04), y: cy, z: cz, rx: -a }, ...[-1, 1].map((s) => ({ geo: RB(0.03, 0.55, 0.62, 0.05), x: s * (W / 2 + 0.07), y: 1.95, z: 1.95 }))];
  const fixe = [...av.fixe, ...ar.fixe, ...garde(THREE, R, W, 2.35, 0.3),
    { geo: RB(W - 0.22, lg - 0.06, 0.02, 0.04), y: cy, z: cz - 0.012, rx: -a, couleur: 0x0d0f12 },
    { geo: RB(WC, 2.32, 4.8, 0.07, 3), y: 2.0, z: -0.95, couleur: 0xf3f4f5 }, { geo: RB(WC, 0.72, 0.75, 0.22, 3), y: 2.78, z: 1.75, couleur: 0xf3f4f5 },
    { geo: RB(W + 0.04, 0.32, 0.25, 0.08, 3), y: 0.55, z: 3.28, couleur: 0x2f3237 }, { geo: RB(W - 0.6, 0.3, 0.04, 0.04), y: 0.92, z: 3.3, couleur: 0x1a1c20 },
    { geo: RB(W - 0.3, 0.18, 4.6, 0.02), y: 0.72, z: -0.4, couleur: 0x1b1d21 }, { geo: RB(WC - 0.1, 0.08, 0.55, 0.02), y: 0.5, z: -3.4, couleur: 0x2f3237 },
    ...[-1, 1].flatMap((s) => [{ geo: RB(0.08, 0.36, 0.2, 0.03), x: s * (W / 2 + 0.2), y: 1.9, z: 2.4, couleur: 0x15171a }, { geo: RB(0.22, 0.12, 0.05, 0.02), x: s * 0.9, y: 0.95, z: -3.36, couleur: 0xb3121b }]),
    { geo: RB(0.5, 0.11, 0.02, 0.01), y: 0.55, z: 3.42, couleur: 0xf4f4f0 }];
  const metal = [...av.metal, ...ar.metal, ...[-1, 1].flatMap((s) => [{ geo: RB(0.38, 0.14, 0.06, 0.04), x: s * 0.7, y: 1.04, z: 3.2, ry: s * 0.2, couleur: 0xf4f6f8 }, { geo: RB(0.24, 0.03, 0.03, 0.01), x: s * (W / 2 + 0.1), y: 1.95, z: 2.4, couleur: 0x9aa0a8 }])];
  const deco = [{ geo: panneauLivree(THREE, 4.6, 2.1, ZL.util), x: WC / 2 + 0.005, y: 2.0, z: -0.95, ry: Math.PI / 2 }, { geo: panneauLivree(THREE, 4.6, 2.1, ZL.util), x: -WC / 2 - 0.005, y: 2.0, z: -0.95, ry: -Math.PI / 2 },
    { geo: panneauLivree(THREE, WC - 0.2, 2.1, ZL.arriere), y: 2.0, z: -3.36, ry: Math.PI }];
  return { teinte: fusion(THREE, assembler, teinte), fixe: fusion(THREE, assembler, fixe), metal: fusion(THREE, assembler, metal), vitre: fusion(THREE, assembler, vitre), deco: fusion(THREE, assembler, deco) };
}
void DOUBLE;
