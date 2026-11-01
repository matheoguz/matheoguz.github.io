// Décor et modèles 3D de la démo « Auto-école Modèle » (données fictives).
// Module ES sans import : THREE et les petites fonctions de construction de index.html sont passés en paramètre.
//
//   texturesSol(THREE)                       -> textures peintes (parking, rue, plateau, pelouse, sols intérieurs, écrans)
//   construireDecor(ctx)                     -> bâtiment en coupe, parking, rue, plateau moto, arbres (tout est immobile :
//                                               fusionné ensuite par fusionnerStatique d'ae-rendu.js)
//   geosVoiture(THREE, assembler)            -> { carrosserie, vitres, noir, clair, panneau } (une géométrie par matière)
//   geosPersonne(THREE, assembler, assis)    -> { fixe, haut }
//   geoMoto(THREE, assembler, couleur)       -> une géométrie à couleurs de sommets
//
// Repère : x vers l'est (parking), z vers la rue (sud), y vers le haut ; 1 unité = 1 m.

// ---------- petites aides de dessin ----------
function hasard(graine) { let s = graine >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function toile(THREE, px, py, dessin, { repete = null } = {}) {
  const c = document.createElement('canvas'); c.width = px; c.height = py;
  const g = c.getContext('2d'); dessin(g, px, py);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repete) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repete[0], repete[1]); }
  return t;
}
// grain fin (asphalte, moquette) : bruit par pixel + quelques taches douces
function grain(g, w, h, base, amp, graine, taches = 0) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const r = hasard(graine);
  for (let i = 0; i < taches; i++) {
    const x = r() * w, y = r() * h, R = 20 + r() * 90, a = 0.03 + r() * 0.05;
    const gr = g.createRadialGradient(x, y, 0, x, y, R); const clair = r() > 0.5;
    gr.addColorStop(0, clair ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
  const d = g.getImageData(0, 0, w, h), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const n = (r() - 0.5) * amp; p[i] += n; p[i + 1] += n; p[i + 2] += n; }
  g.putImageData(d, 0, 0);
}
function texteSol(g, txt, x, y, taille, couleur = 'rgba(245,245,240,.92)', rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = couleur; g.font = `700 ${taille}px Inter, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 0); g.restore();
}
function fleche(g, x, y, l, rot, couleur = 'rgba(245,245,240,.85)') {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = couleur; g.beginPath();
  g.moveTo(l / 2, 0); g.lineTo(l / 8, -l / 4); g.lineTo(l / 8, -l / 10); g.lineTo(-l / 2, -l / 10); g.lineTo(-l / 2, l / 10); g.lineTo(l / 8, l / 10); g.lineTo(l / 8, l / 4); g.closePath(); g.fill(); g.restore();
}

// Zones peintes (en mètres) : [x0, z0, largeur, profondeur]
export const ZONES = {
  parking: [-4.5, -10, 30, 15],
  rue: [-33, 14, 66, 8],
  plateau: [-4, -19, 26, 9],
};

export function texturesSol(THREE) {
  const T = {};
  const PPM = 40;
  // ---- parking : asphalte, places numérotées, place électrique, zone motos, flèches ----
  {
    const [x0, z0, W, H] = ZONES.parking, X = (x) => (x - x0) * PPM, Z = (z) => (z - z0) * PPM;
    T.parking = toile(THREE, W * PPM, H * PPM, (g, w, h) => {
      grain(g, w, h, '#50555d', 16, 11, 60);
      g.fillStyle = 'rgba(247,247,242,.92)';
      for (let i = 0; i <= 7; i++) { const x = -2.5 + i * 2.7; g.fillRect(X(x) - 2, Z(-8), 4, 5 * PPM); }
      g.fillRect(X(-2.5), Z(-8) - 2, 7 * 2.7 * PPM, 4);
      // place 7 : borne de recharge (vert)
      g.fillStyle = 'rgba(34,197,94,.22)'; g.fillRect(X(-2.5 + 6 * 2.7) + 3, Z(-8) + 3, 2.7 * PPM - 6, 5 * PPM - 3);
      for (let i = 0; i < 7; i++) texteSol(g, String(i + 1), X(-2.5 + i * 2.7 + 1.35), Z(-7.35), 30);
      // éclair peint sur la place électrique
      g.save(); g.translate(X(16.2 - 1.35 + 1.35), Z(-3.6)); g.fillStyle = 'rgba(247,247,242,.9)'; g.beginPath(); g.moveTo(-6, -18); g.lineTo(8, -18); g.lineTo(1, -2); g.lineTo(10, -2); g.lineTo(-8, 20); g.lineTo(-2, 3); g.lineTo(-10, 3); g.closePath(); g.fill(); g.restore();
      // zone motos
      g.strokeStyle = 'rgba(247,247,242,.9)'; g.lineWidth = 4; g.strokeRect(X(20.4), Z(-10) + 4, 3.6 * PPM, 1.3 * PPM);
      texteSol(g, 'MOTOS', X(22.2), Z(-8.35), 16);
      // flèches de circulation et inscriptions
      for (const x of [2, 9, 15]) fleche(g, X(x), Z(0.2), 1.8 * PPM, 0);
      fleche(g, X(22), Z(3.4), 1.6 * PPM, Math.PI / 2);
      texteSol(g, 'RÉSERVÉ AUTO-ÉCOLE', X(6.5), Z(-1.8), 22, 'rgba(247,247,242,.55)');
      // bordure
      g.strokeStyle = 'rgba(205,203,196,1)'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    });
  }
  // ---- rue : bandes, ligne médiane, passages piétons ----
  {
    const [x0, z0, W, H] = ZONES.rue, P = 28, X = (x) => (x - x0) * P, Z = (z) => (z - z0) * P;
    T.rue = toile(THREE, W * P, H * P, (g, w, h) => {
      grain(g, w, h, '#42474f', 14, 23, 80);
      g.fillStyle = 'rgba(245,245,240,.9)';
      g.fillRect(0, Z(14.45), w, 3); g.fillRect(0, Z(21.55), w, 3);
      for (let x = -32; x <= 32; x += 4.5) if (x < -13 || x > -5) g.fillRect(X(x), Z(18) - 2, 2.4 * P, 4);
      for (const cx of [-12, 9]) for (let i = 0; i < 6; i++) g.fillRect(X(cx + i) - 0.25 * P, Z(14.7), 0.5 * P, 6.6 * P);
      // ligne d'arrêt et marquage « vélo »
      g.fillRect(X(-13.3), Z(14.7), 4, 3.2 * P); g.fillRect(X(-4.7), Z(18.1), 4, 3.2 * P);
    });
  }
  // ---- plateau moto : enrobé clair, parcours en 8, plots ----
  {
    const [x0, z0, W, H] = ZONES.plateau, X = (x) => (x - x0) * PPM, Z = (z) => (z - z0) * PPM;
    T.plateau = toile(THREE, W * PPM, H * PPM, (g, w, h) => {
      grain(g, w, h, '#7a8088', 14, 37, 50);
      g.strokeStyle = 'rgba(247,247,242,.95)'; g.lineWidth = 5; g.strokeRect(0.3 * PPM, 0.3 * PPM, w - 0.6 * PPM, h - 0.6 * PPM);
      // trajectoire de la démo (même formule que l'animation de la moto), en pointillés
      g.setLineDash([14, 12]); g.strokeStyle = 'rgba(250,204,21,.9)'; g.lineWidth = 4; g.beginPath();
      for (let k = 0; k <= 400; k++) { const a = (k / 400) * Math.PI * 2, x = 9 + Math.sin(a) * 10, z = -14.5 + Math.sin(a * 2) * 2.4; k ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)); }
      g.closePath(); g.stroke(); g.setLineDash([]);
      // couloir de freinage et zone de départ
      g.strokeStyle = 'rgba(247,247,242,.9)'; g.lineWidth = 4;
      g.strokeRect(X(19.2), Z(-18.2), 2.2 * PPM, 3 * PPM); texteSol(g, 'DÉPART', X(20.3), Z(-16.7), 16);
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(249,115,22,.55)'; g.beginPath(); g.arc(X(i * 2.2), Z(-14.5 + (i % 2 ? 1.6 : -1.6)), 9, 0, 7); g.fill(); }
      texteSol(g, 'PLATEAU MOTO', X(-1.6), Z(-14.5), 20, 'rgba(247,247,242,.75)', -Math.PI / 2);
    });
  }
  // ---- textures répétées ----
  T.pelouse = toile(THREE, 256, 256, (g, w, h) => {
    g.fillStyle = '#a3bf86'; g.fillRect(0, 0, w, h); const r = hasard(5);
    for (let i = 0; i < 2200; i++) { const v = r(); g.fillStyle = v > 0.5 ? 'rgba(120,160,90,.18)' : 'rgba(235,245,215,.22)'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 2 + r() * 4); }
  }, { repete: [11, 8] });
  T.paves = toile(THREE, 256, 256, (g, w, h) => {
    const r = hasard(9); g.fillStyle = '#c9c6bf'; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) { const v = 214 + Math.floor(r() * 14); g.fillStyle = `rgb(${v},${v - 2},${v - 7})`; g.fillRect(i * 64 + (j % 2) * 32 + 2, j * 32 + 2, 60, 28); g.fillRect(i * 64 + (j % 2) * 32 - 254, j * 32 + 2, 60, 28); }
  }, { repete: [1, 1] });
  T.carrelage = toile(THREE, 512, 512, (g, w) => {
    const n = 4, pas = w / n, r = hasard(3);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const v = 236 + Math.floor(r() * 6); g.fillStyle = `rgb(${v},${v - 1},${v - 4})`; g.fillRect(i * pas, j * pas, pas, pas); }
    g.strokeStyle = '#d6d4ce'; g.lineWidth = 3; for (let k = 0; k <= n; k++) { g.beginPath(); g.moveTo(k * pas, 0); g.lineTo(k * pas, w); g.stroke(); g.beginPath(); g.moveTo(0, k * pas); g.lineTo(w, k * pas); g.stroke(); }
  }, { repete: [4, 1.5] });
  T.moquette = toile(THREE, 256, 256, (g, w, h) => grain(g, w, h, '#9aa6b8', 22, 17, 10), { repete: [3, 2] });
  T.parquet = toile(THREE, 512, 512, (g, w, h) => {
    const r = hasard(21);
    for (let j = 0; j < 8; j++) { let x = -r() * 200; while (x < w) { const l = 140 + r() * 120, v = r(); g.fillStyle = `rgb(${200 + v * 20},${164 + v * 18},${118 + v * 14})`; g.fillRect(x, j * 64, l, 64); g.fillStyle = 'rgba(90,60,30,.18)'; g.fillRect(x, j * 64, 2, 64); x += l; } g.fillStyle = 'rgba(90,60,30,.22)'; g.fillRect(0, j * 64, w, 2); }
  }, { repete: [2, 2] });
  // ---- écrans ----
  T.tv = toile(THREE, 640, 256, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, '#0f1f3d'); d.addColorStop(1, '#13294f'); g.fillStyle = d; g.fillRect(0, 0, w, h);
    // photo de situation (route, ciel, panneau)
    const cx = 18, cy = 30, cw = 330, ch = 196;
    const ciel = g.createLinearGradient(0, cy, 0, cy + ch); ciel.addColorStop(0, '#9cc9f0'); ciel.addColorStop(0.55, '#d9ecfb'); ciel.addColorStop(0.56, '#8fb57a'); ciel.addColorStop(1, '#6f9a5c');
    g.fillStyle = ciel; g.fillRect(cx, cy, cw, ch);
    g.fillStyle = '#5a5f66'; g.beginPath(); g.moveTo(cx + cw * 0.46, cy + ch * 0.56); g.lineTo(cx + cw * 0.54, cy + ch * 0.56); g.lineTo(cx + cw * 0.92, cy + ch); g.lineTo(cx + cw * 0.08, cy + ch); g.closePath(); g.fill();
    g.fillStyle = '#f5f5f0'; for (let k = 0; k < 4; k++) { const y0 = cy + ch * (0.6 + k * 0.1); g.fillRect(cx + cw * 0.5 - 2 - k, y0, 4 + 2 * k, 10 + k * 4); }
    g.fillStyle = '#e5e7eb'; g.fillRect(cx + cw * 0.75, cy + ch * 0.3, 5, ch * 0.4);
    g.fillStyle = '#dc2626'; g.beginPath(); for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + (k * Math.PI) / 4; g.lineTo(cx + cw * 0.755 + Math.cos(a) * 30, cy + ch * 0.27 + Math.sin(a) * 30); } g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.font = '700 17px Inter, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STOP', cx + cw * 0.755, cy + ch * 0.27 + 1);
    g.textAlign = 'left'; g.fillStyle = '#93c5fd'; g.font = '600 18px Inter, Arial'; g.fillText('CODE DE LA ROUTE · SÉRIE 12', 372, 44);
    g.fillStyle = '#fff'; g.font = '700 26px Inter, Arial'; g.fillText('Question 18 / 40', 372, 80);
    g.font = '500 17px Inter, Arial'; g.fillStyle = '#dbeafe'; g.fillText('Je dois marquer l\'arrêt :', 372, 112);
    ['A  Oui', 'B  Non', 'C  Seulement si un', '   véhicule arrive'].forEach((s, i) => { g.fillStyle = i < 3 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,0)'; if (i < 3) g.fillRect(372, 128 + i * 34, 246, 28); g.fillStyle = '#fff'; g.fillText(s, 382, 143 + i * (i < 3 ? 34 : 30)); });
  });
  T.ecran = toile(THREE, 256, 160, (g, w, h) => {
    g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d4ed8'; g.fillRect(0, 0, w, 22); g.fillStyle = '#e2e8f0'; g.fillRect(0, 22, 46, h - 22);
    const c = ['#dbeafe', '#ffedd5', '#dcfce7', '#ede9fe'];
    for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) { g.fillStyle = c[(i + k) % 4]; g.fillRect(56 + i * 49, 32 + k * 31 + (i % 2) * 8, 42, 22); }
  });
  T.tableau = toile(THREE, 512, 256, (g, w, h) => {
    g.fillStyle = '#fbfbf9'; g.fillRect(0, 0, w, h); g.strokeStyle = '#cbd5e1'; g.lineWidth = 2;
    for (let i = 0; i <= 6; i++) { g.beginPath(); g.moveTo(40 + i * 75, 36); g.lineTo(40 + i * 75, h - 14); g.stroke(); }
    for (let k = 0; k <= 5; k++) { g.beginPath(); g.moveTo(40, 36 + k * 40); g.lineTo(w - 22, 36 + k * 40); g.stroke(); }
    g.fillStyle = '#1e3a8a'; g.font = '700 22px Inter, Arial'; g.fillText('PLANNING SEMAINE', 40, 26);
    const r = hasard(8), cs = ['#93c5fd', '#fdba74', '#86efac', '#c4b5fd', '#fca5a5'];
    for (let i = 0; i < 18; i++) { g.fillStyle = cs[i % 5]; g.fillRect(44 + Math.floor(r() * 6) * 75, 40 + Math.floor(r() * 5) * 40, 66, 32); }
  });
  T.affiche = toile(THREE, 256, 360, (g, w, h) => {
    g.fillStyle = '#1d4ed8'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 40px Inter, Arial'; g.textAlign = 'center';
    g.fillText('PERMIS B', w / 2, 70); g.font = '600 22px Inter, Arial'; g.fillText('Code + 20 h', w / 2, 112); g.fillText('de conduite', w / 2, 140);
    g.fillStyle = '#facc15'; g.fillRect(28, 180, w - 56, 4); g.fillStyle = '#fff'; g.font = '800 30px Inter, Arial'; g.fillText('Conduite', w / 2, 236); g.fillText('accompagnée', w / 2, 272);
    g.font = '500 18px Inter, Arial'; g.fillText('dès 15 ans', w / 2, 310);
  });
  T.enseigne = toile(THREE, 1024, 128, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, '#2563eb'); d.addColorStop(1, '#1d4ed8'); g.fillStyle = d; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.beginPath(); (g.roundRect ? g.roundRect(26, 22, 84, 84, 16) : g.rect(26, 22, 84, 84)); g.fill(); g.fillStyle = '#1d4ed8'; g.font = '800 64px Inter, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', 68, 68);
    g.fillStyle = '#fff'; g.font = '800 60px Inter, Arial'; g.textAlign = 'left'; g.fillText('AUTO-ÉCOLE MODÈLE', 140, 68);
  });
  T.logo = toile(THREE, 128, 128, (g, w, h) => {
    g.fillStyle = '#1d4ed8'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.beginPath(); (g.roundRect ? g.roundRect(14, 14, 100, 100, 18) : g.rect(14, 14, 100, 100)); g.fill();
    g.fillStyle = '#1d4ed8'; g.font = '800 76px Inter, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', 64, 68);
  });
  T.toit = toile(THREE, 256, 64, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#dc2626'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#dc2626'; g.font = '800 34px Inter, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('AUTO-ÉCOLE', w / 2, h / 2 + 2);
  });
  for (const k of ['tv', 'ecran', 'enseigne', 'logo']) T[k].userData.lumineux = true;
  return T;
}

// ---------- construction du décor (objets immobiles) ----------
// ctx : { THREE, scene, boite(l,h,p,m,x,y,z,parent,ombre), mat(couleur, options), plan(l, p, texture, x, y, z), zone(...), T }
export function construireDecor(ctx) {
  const { THREE, scene, boite, mat, plan, T } = ctx;
  const out = {};

  // ---- socle, pelouse, sols peints ----
  boite(66, 1.5, 50, 0xdedbd3, 0, -1.5, 0);
  plan(66, 50, T.pelouse, 0, 0.01, 0);
  const [px0, pz0, pW, pH] = ZONES.parking; plan(pW, pH, T.parking, px0 + pW / 2, 0.07, pz0 + pH / 2);
  boite(pW + 0.3, 0.05, pH + 0.3, 0xcfccc4, px0 + pW / 2, 0, pz0 + pH / 2, scene, false); // bordure
  boite(5, 0.06, 7.2, 0x50555d, 22, 0.0, 8.8, scene, false); // allée vers la rue
  const [rx0, rz0, rW, rH] = ZONES.rue; plan(rW, rH, T.rue, 0, 0.05, rz0 + rH / 2);
  const [qx0, qz0, qW, qH] = ZONES.plateau; plan(qW, qH, T.plateau, qx0 + qW / 2, 0.06, qz0 + qH / 2);
  // trottoirs en pavés + bordures
  const trottoir = (z) => { const m = plan(66, 1.8, T.paves, 0, 0.21, z); m.material.map.repeat.set(33, 1); boite(66, 0.18, 1.8, 0xcac7bf, 0, 0.02, z, scene, false); boite(66, 0.2, 0.12, 0xb9b6ae, 0, 0.02, z + (z < 18 ? 0.9 : -0.9), scene, false); };
  trottoir(13.1); trottoir(22.9);
  boite(5, 0.05, 1.8, 0x8e9198, 22, 0.17, 13.1, scene, false); // bateau devant l'allée
  // parvis de l'agence
  { const m = plan(16, 4.2, T.paves.clone(), -16, 0.07, 10.1); m.material.map.repeat.set(8, 2); m.material.map.needsUpdate = true; }

  // ---- bâtiment de l'agence, coupé à 1,5 m (maquette d'architecte) ----
  const BX0 = -24, BX1 = -8, BZ0 = -4, BZ1 = 8, HM = 1.5, EM = 0.35, NUIT = 0x22305a, CHANT = 0xe9edf5;
  boite(BX1 - BX0 + 0.4, 0.2, BZ1 - BZ0 + 0.4, 0xd4d6dc, (BX0 + BX1) / 2, 0, (BZ0 + BZ1) / 2);
  { const m = plan(16, 6, T.carrelage, -16, 0.21, 5); m.material.map.repeat.set(5, 2); }
  plan(10, 6, T.moquette, -13, 0.21, -1);
  plan(6, 6, T.parquet, -21, 0.21, -1);
  const murExt = (l, p, x, z) => { boite(l, HM, p, NUIT, x, 0.2, z); boite(l + 0.02, 0.05, p + 0.02, CHANT, x, 0.2 + HM, z, scene, false); };
  const cloison = (l, p, x, z) => { boite(l, HM - 0.1, p, 0xf1f2f5, x, 0.2, z); boite(l + 0.02, 0.04, p + 0.02, 0x9aa3b5, x, 0.1 + HM, z, scene, false); };
  murExt(BX1 - BX0 + EM, EM, (BX0 + BX1) / 2, BZ0);
  murExt(EM, BZ1 - BZ0, BX0, (BZ0 + BZ1) / 2);
  murExt(EM, BZ1 - BZ0, BX1, (BZ0 + BZ1) / 2);
  // façade vitrée sur rue : allèges, montants, vitrages, porte
  const verre = new THREE.MeshStandardMaterial({ color: 0xb9d6e8, transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.2, depthWrite: false });
  murExt(0.6, EM, BX0 + 0.3, BZ1); murExt(0.6, EM, BX1 - 0.3, BZ1);
  for (const [a, b] of [[-23.7, -17.2], [-14.8, -8.3]]) {
    boite(b - a, 0.35, EM * 0.8, NUIT, (a + b) / 2, 0.2, BZ1);                      // allège
    boite(b - a, HM - 0.35, 0.05, verre, (a + b) / 2, 0.55, BZ1, scene, false);       // vitrage
    for (let x = a; x <= b + 0.01; x += (b - a) / 4) boite(0.08, HM, 0.12, NUIT, x, 0.2, BZ1); // montants
    boite(b - a, 0.06, 0.14, NUIT, (a + b) / 2, 0.2 + HM - 0.06, BZ1, scene, false);
  }
  boite(0.08, HM, 0.12, NUIT, -17.2, 0.2, BZ1); boite(0.08, HM, 0.12, NUIT, -14.8, 0.2, BZ1);
  boite(1.1, HM - 0.05, 0.05, verre, -16.6, 0.2, BZ1 + 0.25, scene, false);           // porte entrouverte
  boite(2.2, 0.03, 1.2, 0x374151, -16, 0.2, BZ1 + 0.8, scene, false);                // tapis d'entrée
  // cloisons intérieures (avec portes)
  cloison(0.15, 6, -18, -1);
  cloison(4.4, 0.15, -21.8, 2); cloison(6.6, 0.15, -14.3, 2); cloison(0.6, 0.15, -8.5, 2);
  // enseigne lumineuse sur deux poteaux, sur le parvis
  boite(0.14, 2.0, 0.14, 0x334155, -20, 0.07, 9.1); boite(0.14, 2.0, 0.14, 0x334155, -12, 0.07, 9.1);
  boite(8.4, 0.9, 0.2, 0x1d4ed8, -16, 1.95, 9.1);
  plan(8.2, 0.82, T.enseigne, -16, 2.4, 9.205, true);

  // ---- mobilier ----
  const bois = 0xc49a6c, blanc = 0xf8fafc, gris = 0x9ca3af, anthracite = 0x374151, bleu = 0x1d4ed8;
  const chaise = (x, z, r = 0, c = anthracite) => {
    const g = new THREE.Group(); boite(0.46, 0.06, 0.46, c, 0, 0.44, 0, g); boite(0.46, 0.46, 0.06, c, 0, 0.5, -0.21, g);
    boite(0.06, 0.44, 0.06, gris, 0, 0, 0, g); boite(0.42, 0.04, 0.42, gris, 0, 0, 0, g, false);
    g.position.set(x, 0.2, z); g.rotation.y = r; scene.add(g); return g;
  };
  const table = (l, p, x, z, c = 0xf5f5f4, pied = gris) => { boite(l, 0.05, p, c, x, 0.92, z); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) boite(0.05, 0.72, 0.05, pied, x + a * (l / 2 - 0.08), 0.2, z + b * (p / 2 - 0.08)); };
  const ecranPose = (x, z, r = 0, l = 0.6) => { const g = new THREE.Group(); boite(l, 0.38, 0.04, 0x111827, 0, 0.12, 0, g); boite(0.05, 0.12, 0.05, 0x111827, 0, 0, -0.02, g); boite(0.24, 0.02, 0.16, 0x111827, 0, 0, -0.02, g, false); const s = plan(l - 0.05, 0.33, T.ecran, 0, 0.31, 0.022, true, g); s.castShadow = false; g.position.set(x, 1.17, z); g.rotation.y = r; scene.add(g); };
  const plante = (x, z, s = 1) => { boite(0.42 * s, 0.42 * s, 0.42 * s, 0xe7e5e4, x, 0.2, z); for (const [dx, dy, dz, r] of [[0, 0.8, 0, 0.36], [0.14, 0.62, 0.1, 0.26], [-0.13, 0.66, -0.08, 0.26]]) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 1), mat(0x4f8a4b)); f.position.set(x + dx * s, 0.2 + dy * s + 0.1, z + dz * s); f.castShadow = true; scene.add(f); } };
  // accueil : comptoir en L
  boite(3.4, 1.05, 0.6, blanc, -11.6, 0.2, 4.3); boite(0.6, 1.05, 1.7, blanc, -9.6, 0.2, 4.85);
  boite(3.5, 0.05, 0.75, bois, -11.6, 1.25, 4.35, scene, false); boite(0.75, 0.05, 1.75, bois, -9.6, 1.25, 4.85, scene, false);
  boite(3.4, 0.12, 0.02, bleu, -11.6, 0.95, 4.61, scene, false);
  boite(2.2, 0.04, 0.6, 0xf1f5f9, -11.6, 0.95, 3.85, scene, false); // plan de travail côté secrétaire
  ecranPose(-12.2, 3.7, Math.PI * 0.94); ecranPose(-11.1, 3.7, Math.PI * 1.06);
  chaise(-11.7, 3.1, Math.PI * 0, 0x1e293b);
  boite(0.8, 1.2, 0.4, 0xe5e7eb, -8.5, 0.2, 2.5); // armoire à dossiers
  boite(0.5, 0.9, 0.35, 0x94a3b8, -15.5, 0.2, 7.5); boite(0.46, 0.04, 0.3, 0xffffff, -15.5, 1.12, 7.5, scene, false); // présentoir brochures
  plante(-8.7, 7.4); plante(-15.6, 2.6, 0.8);
  // salle d'attente : canapés, table basse, affiches
  boite(3.2, 0.42, 0.85, 0x5b6b8c, -20.2, 0.2, 7.3); boite(3.2, 0.42, 0.22, 0x4b5a7a, -20.2, 0.62, 7.62);
  boite(0.85, 0.42, 2.6, 0x5b6b8c, -23.3, 0.2, 5.1); boite(0.22, 0.42, 2.6, 0x4b5a7a, -23.62, 0.62, 5.1);
  boite(1.3, 0.04, 0.7, bois, -20.5, 0.55, 5.3); for (const [a, b] of [[-0.55, -0.27], [0.55, -0.27], [-0.55, 0.27], [0.55, 0.27]]) boite(0.05, 0.35, 0.05, anthracite, -20.5 + a, 0.2, 5.3 + b);
  boite(0.35, 1.1, 0.35, 0xe2e8f0, -17, 0.2, 2.6); boite(0.28, 0.35, 0.28, 0x93c5fd, -17, 1.3, 2.6); // fontaine à eau
  plante(-23.2, 7.4, 0.9);
  plan(0.9, 1.26, T.affiche, -23.79, 1.0, 4.2, true, scene, -Math.PI / 2 + Math.PI); // affiche sur le mur ouest (face à l'est)
  // salle de code : 12 postes, écran TV, bureau de l'enseignant
  boite(4.4, 1.9, 0.12, 0x0b1220, -13, 0.25, -3.72);
  plan(4.2, 1.68, T.tv, -13, 1.2, -3.655, true);
  boite(1.4, 0.05, 0.6, 0xf5f5f4, -9.4, 0.92, -3.1); ecranPose(-9.4, -3.2, 0, 0.5);
  out.postesCode = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = -16.4 + c * 2.3, z = -1.6 + r * 1.35;
    table(1.5, 0.55, x, z, 0xfafaf9, 0x6b7280);
    boite(0.3, 0.03, 0.2, 0x111827, x + 0.35, 0.97, z - 0.05, scene, false); // boîtier de réponse
    chaise(x, z + 0.55, Math.PI, 0x334155);
    out.postesCode.push(new THREE.Vector3(x, 0.2, z + 0.5));
  }
  // bureau des moniteurs : 4 bureaux, écrans, tableau de planning, étagères, armoire à clés
  for (const [x, z] of [[-22.6, -2.4], [-20.2, -2.4], [-22.6, 0.6], [-20.2, 0.6]]) {
    table(1.4, 0.7, x, z, 0xf5f5f4); ecranPose(x, z - 0.15, 0); chaise(x, z + 0.55, Math.PI, 0x1e293b);
  }
  boite(3.4, 1.0, 0.05, 0xe5e7eb, -21.2, 0.45, -3.79); plan(3.3, 0.92, T.tableau, -21.2, 0.95, -3.76, true);
  boite(0.4, 1.3, 1.8, 0xe2e8f0, -23.6, 0.2, -0.9);
  for (let k = 0; k < 6; k++) boite(0.3, 0.32, 0.12, [0x2563eb, 0xdc2626, 0x16a34a, 0xf59e0b, 0x7c3aed, 0x0ea5e9][k], -23.55, 0.6 + (k % 2) * 0.42, -1.6 + Math.floor(k / 2) * 0.5, scene, false);
  boite(0.5, 0.6, 0.12, 0x475569, -18.2, 0.8, -3.75); // armoire à clés
  plante(-18.6, 1.5, 0.75);

  // ---- parking : poteaux d'éclairage, borne, totem ----
  boite(0.36, 1.3, 0.3, 0xe5e7eb, 16.25, 0.06, -8.45); boite(0.24, 0.3, 0.04, 0x22c55e, 16.25, 0.85, -8.29, scene, false);
  for (const x of [-3.5, 25]) for (const z of [-9.6, 4.4]) { boite(0.12, 3.6, 0.12, 0x4b5563, x, 0.06, z); boite(0.5, 0.1, 0.25, 0x374151, x, 3.6, z); }
  boite(1.4, 2.3, 0.25, 0x1d4ed8, 25.6, 0.2, 11.2); plan(1.1, 1.1, T.logo, 25.6, 1.85, 11.33, true);

  // ---- rue : lampadaires, bancs ----
  for (const x of [-27, -7, 13, 30]) { boite(0.14, 4.4, 0.14, 0x4b5563, x, 0.2, 12.5); boite(1.3, 0.1, 0.22, 0x4b5563, x + 0.6, 4.6, 12.5); boite(0.5, 0.08, 0.3, 0xfef3c7, x + 1.1, 4.52, 12.5, scene, false); }
  for (const x of [-30, 4]) { boite(1.6, 0.08, 0.45, bois, x, 0.6, 23.4); boite(1.6, 0.4, 0.06, bois, x, 0.68, 23.6); boite(0.08, 0.4, 0.4, anthracite, x - 0.7, 0.2, 23.4); boite(0.08, 0.4, 0.4, anthracite, x + 0.7, 0.2, 23.4); }

  // ---- clôture du fond, haies ----
  for (let x = -32; x <= 32; x += 2.5) boite(0.08, 1.1, 0.08, 0x8b95a5, x, 0, -23.6);
  boite(64, 0.06, 0.06, 0x8b95a5, 0, 1.05, -23.6, scene, false); boite(64, 0.06, 0.06, 0x8b95a5, 0, 0.55, -23.6, scene, false);
  for (const [l, x, z, rot] of [[14, -28, 0, 1], [9, 13, 6.4, 0]]) boite(rot ? 0.8 : l, 0.75, rot ? l : 0.8, 0x5f8b52, x, 0.02, z);

  // ---- arbres (tronc + houppier en trois boules) ----
  const arbre = (x, z, s = 1) => {
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 1.6 * s, 8), mat(0x7a5a3e)); tr.position.set(x, 0.8 * s, z); tr.castShadow = true; scene.add(tr);
    for (const [dx, dy, dz, r, c] of [[0, 2.35, 0, 1.15, 0x6c9a5a], [0.55, 2.0, 0.35, 0.8, 0x5d8c4e], [-0.5, 2.1, -0.3, 0.85, 0x7aa766]]) {
      const f = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 2), mat(c)); f.position.set(x + dx * s, dy * s, z + dz * s); f.castShadow = true; f.receiveShadow = true; scene.add(f);
    }
  };
  [[-28, -20], [-28, -8], [-28, 4], [28, -20], [28, -6], [-4, 10.5], [4, 10.5], [10, 10.5], [-27, 10.5], [-1, -21], [18, -21], [-14, -8.5], [-20, -9], [29, 3]].forEach(([x, z], i) => arbre(x, z, i % 3 ? 1 : 1.2));
  for (const x of [-22, -10, 2, 16, 27]) arbre(x, 24.2, 0.85);

  return out;
}

// ---------- modèles ----------
// Voiture compacte (≈ Clio) : 4,1 m × 1,78 m × 1,45 m, avant vers +z. Une géométrie par matière pour l'instanciation.
export function geosVoiture(THREE, assembler) {
  const W = 1.74, R0 = 0.33, ARCHE = 0.42;
  const profil = new THREE.Shape();
  const bas = 0.3, arches = [-1.3, 1.3];
  profil.moveTo(-2.0, bas);
  for (const c of arches) { profil.lineTo(c - ARCHE, bas); profil.absarc(c, R0, ARCHE, Math.PI, 0, true); }
  [[2.02, bas], [2.09, 0.45], [2.07, 0.62], [1.97, 0.74], [1.7, 0.83], [1.2, 0.9], [0.72, 0.95], [-1.72, 0.98], [-1.95, 0.94], [-2.05, 0.8], [-2.07, 0.55], [-2.03, 0.35]].forEach(([u, v]) => profil.lineTo(u, v));
  const ext = (shape, prof, bevel, seg = 3) => { const g = new THREE.ExtrudeGeometry(shape, { depth: prof, bevelEnabled: !!bevel, bevelSize: bevel, bevelThickness: bevel, bevelSegments: seg, curveSegments: 10 }); g.translate(0, 0, -prof / 2); g.rotateY(-Math.PI / 2); return g; };
  const corps = ext(profil, W - 0.2, 0.1, 4);
  const cab = new THREE.Shape(); [[0.72, 0.94], [0.05, 1.36], [-1.25, 1.40], [-1.8, 1.05], [-1.74, 0.94]].forEach(([u, v], i) => (i ? cab.lineTo(u, v) : cab.moveTo(u, v)));
  const vitres = ext(cab, W - 0.42, 0.06, 2);
  const toit = new THREE.Shape(); [[0.1, 1.35], [-1.24, 1.385], [-1.28, 1.44], [0.0, 1.415]].forEach(([u, v], i) => (i ? toit.lineTo(u, v) : toit.moveTo(u, v)));
  const toitG = ext(toit, W - 0.4, 0.05, 2);
  const B = (l, h, p) => new THREE.BoxGeometry(l, h, p);
  const C = (r, l, n = 18) => new THREE.CylinderGeometry(r, r, l, n);
  const carrosserie = assembler(THREE, [
    { geo: corps }, { geo: toitG },
    { geo: B(0.06, 0.44, 0.08), x: W / 2 - 0.16, y: 1.17, z: -0.42, rz: -0.12 }, { geo: B(0.06, 0.44, 0.08), x: -W / 2 + 0.16, y: 1.17, z: -0.42, rz: 0.12 }, // montants
    { geo: B(0.16, 0.1, 0.2), x: W / 2 + 0.02, y: 1.0, z: 0.62 }, { geo: B(0.16, 0.1, 0.2), x: -W / 2 - 0.02, y: 1.0, z: 0.62 }, // rétroviseurs
  ].map((p) => ({ ...p, couleur: 0xffffff })));
  const vitresG = assembler(THREE, [{ geo: vitres, couleur: 0xffffff }]);
  const roues = [[-0.78, 1.3], [0.78, 1.3], [-0.78, -1.3], [0.78, -1.3]];
  const noir = assembler(THREE, [
    ...roues.map(([x, z]) => ({ geo: C(R0, 0.22), x, y: R0, z, rz: Math.PI / 2, couleur: 0x1b1d22 })),
    { geo: B(1.5, 0.16, 0.12), y: 0.4, z: 2.08, couleur: 0x2a2d33 }, { geo: B(1.5, 0.16, 0.12), y: 0.4, z: -2.05, couleur: 0x2a2d33 },
    { geo: B(0.9, 0.13, 0.05), y: 0.62, z: 2.1, couleur: 0x15171b },                                                   // calandre
    { geo: B(W - 0.02, 0.1, 3.0), y: 0.33, couleur: 0x30333a },                                                       // bas de caisse
  ]);
  const clair = assembler(THREE, [
    ...roues.map(([x, z]) => ({ geo: C(0.2, 0.235, 12), x, y: R0, z, rz: Math.PI / 2, couleur: 0xc9ced6 })),
    { geo: B(0.36, 0.11, 0.06), x: -0.56, y: 0.72, z: 2.07, couleur: 0xfffbe8 }, { geo: B(0.36, 0.11, 0.06), x: 0.56, y: 0.72, z: 2.07, couleur: 0xfffbe8 },
    { geo: B(0.3, 0.12, 0.06), x: -0.6, y: 0.78, z: -2.05, couleur: 0xd32222 }, { geo: B(0.3, 0.12, 0.06), x: 0.6, y: 0.78, z: -2.05, couleur: 0xd32222 },
    { geo: B(0.52, 0.12, 0.02), y: 0.48, z: 2.15, couleur: 0xf8fafc }, { geo: B(0.52, 0.12, 0.02), y: 0.55, z: -2.12, couleur: 0xf8fafc }, // plaques
  ]);
  // bandes latérales « double commande » (rouges) : seulement sur les voitures de l'école, avec le panneau de toit
  const bandes = [W / 2 - 0.035, -W / 2 + 0.035].map((x) => ({ geo: B(0.02, 0.07, 2.9), x: x + Math.sign(x) * 0.04, y: 0.66, z: 0.05, couleur: 0xdc2626 }));
  const pan = new THREE.BoxGeometry(0.13, 0.24, 0.84); pan.translate(0, 1.58, -0.5);
  // le texte n'est que sur les flancs (±x) : les autres faces prennent un coin blanc de la texture
  const uv = pan.attributes.uv; for (let f = 2; f < 6; f++) for (let k = 0; k < 4; k++) uv.setXY(f * 4 + k, f === 2 ? 0.012 : 0.06, f === 2 ? 0.5 : 0.3); // dessus rouge
  const pieds = assembler(THREE, [{ geo: B(0.08, 0.06, 0.08), y: 1.45, z: -0.2, couleur: 0x111827 }, { geo: B(0.08, 0.06, 0.08), y: 1.45, z: -0.8, couleur: 0x111827 }, ...bandes]);
  return { carrosserie, vitres: vitresG, noir, clair, panneau: pan, ecole: pieds };
}

// Personne (1,75 m) : « fixe » = jambes, mains, tête, cheveux ; « haut » = buste et bras (teinte par instance)
export function geosPersonne(THREE, assembler, assis = false) {
  const Cap = (r, l) => new THREE.CapsuleGeometry(r, l, 3, 10);
  const S = (r) => new THREE.SphereGeometry(r, 14, 10);
  const B = (l, h, p) => new THREE.BoxGeometry(l, h, p);
  const PEAU = 0xd9a77f, PANT = 0x2b3445, CHEV = 0x3b2a20;
  const y0 = assis ? -0.38 : 0;
  const jambes = assis
    ? [-0.1, 0.1].flatMap((x) => [{ geo: Cap(0.075, 0.36), x, y: 0.47, z: 0.2, rx: Math.PI / 2, couleur: PANT }, { geo: Cap(0.07, 0.36), x, y: 0.24, z: 0.4, couleur: PANT }, { geo: B(0.11, 0.07, 0.24), x, y: 0.04, z: 0.46, couleur: 0x1f2937 }])
    : [-0.1, 0.1].flatMap((x) => [{ geo: Cap(0.075, 0.68), x, y: 0.46, couleur: PANT }, { geo: B(0.11, 0.07, 0.24), x, y: 0.035, z: 0.04, couleur: 0x1f2937 }]);
  const fixe = assembler(THREE, [
    ...jambes,
    { geo: S(0.115), y: 1.62 + y0, couleur: PEAU }, { geo: Cap(0.05, 0.05), y: 1.47 + y0, couleur: PEAU },
    { geo: S(0.12), y: 1.67 + y0, z: -0.025, sy: 0.75, couleur: CHEV },
    { geo: S(0.05), x: 0.27, y: assis ? 0.92 : 0.86 + y0, z: assis ? 0.22 : 0, couleur: PEAU }, { geo: S(0.05), x: -0.27, y: assis ? 0.92 : 0.86 + y0, z: assis ? 0.22 : 0, couleur: PEAU },
  ]);
  const bras = assis
    ? [0.25, -0.25].map((x) => ({ geo: Cap(0.06, 0.42), x, y: 1.04, z: 0.13, rx: -0.75, couleur: 0xffffff }))
    : [0.25, -0.25].map((x) => ({ geo: Cap(0.06, 0.48), x, y: 1.1 + y0, rz: Math.sign(x) * 0.08, couleur: 0xffffff }));
  const haut = assembler(THREE, [{ geo: Cap(0.19, 0.4), y: 1.17 + y0, sz: 0.75, couleur: 0xffffff }, ...bras]);
  return { fixe, haut };
}

// Moto routière A2 (≈ 2,05 m), avant vers +z
export function geoMoto(THREE, assembler, couleur) {
  const B = (l, h, p) => new THREE.BoxGeometry(l, h, p);
  const T = (r, t) => new THREE.TorusGeometry(r, t, 8, 20);
  const C = (r, l) => new THREE.CylinderGeometry(r, r, l, 12);
  return assembler(THREE, [
    { geo: T(0.27, 0.07), y: 0.34, z: 0.72, ry: Math.PI / 2, couleur: 0x16181d }, { geo: T(0.27, 0.07), y: 0.34, z: -0.7, ry: Math.PI / 2, couleur: 0x16181d },
    { geo: C(0.15, 0.08), y: 0.34, z: 0.72, rz: Math.PI / 2, couleur: 0x9ca3af }, { geo: C(0.15, 0.08), y: 0.34, z: -0.7, rz: Math.PI / 2, couleur: 0x9ca3af },
    { geo: B(0.22, 0.32, 0.62), y: 0.55, z: 0.05, couleur: 0x4b5563 },                 // moteur
    { geo: B(0.34, 0.24, 0.5), y: 0.86, z: 0.25, couleur },                           // réservoir
    { geo: B(0.28, 0.1, 0.62), y: 0.88, z: -0.3, couleur: 0x111827 },                 // selle
    { geo: B(0.24, 0.12, 0.34), y: 0.78, z: -0.66, rx: -0.3, couleur },               // coque arrière
    { geo: B(0.05, 0.5, 0.05), y: 0.58, z: 0.62, rx: 0.45, couleur: 0x9ca3af }, { geo: B(0.05, 0.5, 0.05), x: 0.1, y: 0.58, z: 0.62, rx: 0.45, couleur: 0x9ca3af },
    { geo: B(0.66, 0.04, 0.04), y: 1.04, z: 0.5, couleur: 0x111827 },                 // guidon
    { geo: B(0.22, 0.2, 0.12), y: 0.98, z: 0.66, rx: 0.4, couleur },                  // tête de fourche
    { geo: B(0.12, 0.08, 0.04), y: 0.95, z: 0.74, couleur: 0xfffbe8 },
    { geo: B(0.08, 0.08, 0.5), x: 0.16, y: 0.42, z: -0.45, couleur: 0x9ca3af },       // pot
  ]);
}
