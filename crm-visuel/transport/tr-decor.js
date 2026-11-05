// Décor et modèles 3D de la démo « Transports Modèle » (données fictives) : le dépôt vu en maquette.
// Module ES sans import : THREE et les petites fonctions de construction de la page sont passés en paramètre.
//
//   PLAN                                     -> coordonnées utiles (quais, places, atelier, lavage, gasoil, boucle de circulation)
//   texturesSol(THREE)                       -> sol peint du dépôt, route, panneau d'entrée
//   construireDecor(ctx)                     -> entrepôt à quais, atelier, station de lavage, cuve gasoil, bureaux, parkings,
//                                               clôture, arbres (immobile : fusionné ensuite par fusionnerStatique)
//   geosTracteur · geosRemorque · geosPorteur · geosFourgon (THREE, assembler) -> { teinte, fixe, vitre } (une géométrie par matière)
//
// Repère : x vers l'est, z vers la route (sud), y vers le haut ; 1 unité = 1 m. Un véhicule a l'avant vers +z quand rotation.y = 0.

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
  // boucle de circulation (sens unique) : allée sud vers l'est, voie est vers le nord, voie nord vers l'ouest, voie ouest vers le sud
  boucle: [[-12, 5.5], [46, 5.5], [51.5, 1], [51.5, -16], [47.5, -20], [-9, -20], [-14, -15], [-14, 1]],
  portail: [46, 31],
};

function hasard(graine) { let s = graine >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function toile(THREE, px, py, dessin) {
  const c = document.createElement('canvas'); c.width = px; c.height = py;
  dessin(c.getContext('2d'), px, py);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function grain(g, w, h, base, amp, graine, taches = 0) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const r = hasard(graine);
  for (let i = 0; i < taches; i++) {
    const x = r() * w, y = r() * h, R = 20 + r() * 120, a = 0.03 + r() * 0.05, gr = g.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, r() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
  const d = g.getImageData(0, 0, w, h), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const n = (r() - 0.5) * amp; p[i] += n; p[i + 1] += n; p[i + 2] += n; }
  g.putImageData(d, 0, 0);
}
function texte(g, txt, x, y, taille, couleur = 'rgba(245,245,240,.9)', rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = couleur; g.font = `700 ${taille}px Inter, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 0); g.restore();
}
function fleche(g, x, y, l, rot, couleur = 'rgba(245,245,240,.8)') {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = couleur; g.beginPath();
  g.moveTo(l / 2, 0); g.lineTo(l / 8, -l / 4); g.lineTo(l / 8, -l / 10); g.lineTo(-l / 2, -l / 10); g.lineTo(-l / 2, l / 10); g.lineTo(l / 8, l / 10); g.lineTo(l / 8, l / 4); g.closePath(); g.fill(); g.restore();
}

export function texturesSol(THREE) {
  const T = {}, PPM = 16, [x0, z0, W, H] = PLAN.site, X = (x) => (x - x0) * PPM, Z = (z) => (z - z0) * PPM;
  T.site = toile(THREE, W * PPM, H * PPM, (g, w, h) => {
    grain(g, w, h, '#585d65', 14, 7, 140);
    // aire de manœuvre des quais (béton plus clair)
    g.fillStyle = 'rgba(190,188,180,.32)'; g.fillRect(X(-56), Z(-22), X(-16) - X(-56), Z(2) - Z(-22));
    g.fillStyle = 'rgba(247,247,242,.9)';
    // places poids lourds
    for (const x of [...PLAN.places.map((p) => p - 1.9), PLAN.places[12] + 1.9]) g.fillRect(X(x) - 1.5, Z(-16), 3, Z(2) - Z(-16));
    PLAN.places.forEach((x, i) => texte(g, String(i + 1), X(x), Z(-14.6), 20));
    // places fourgons
    for (const x of [...PLAN.placesU.map((p) => p - 1.7), PLAN.placesU[7] + 1.7]) g.fillRect(X(x) - 1.5, Z(8.5), 3, Z(16) - Z(8.5));
    PLAN.placesU.forEach((x, i) => texte(g, 'F' + (i + 1), X(x), Z(9.6), 15));
    // parking du personnel
    for (let i = 0; i <= 6; i++) g.fillRect(X(22 + i * 2.6) - 1.2, Z(12), 2.4, Z(17) - Z(12));
    for (let i = 0; i <= 6; i++) g.fillRect(X(22 + i * 2.6) - 1.2, Z(21), 2.4, Z(26) - Z(21));
    // quais : guides jaunes et numéros
    g.fillStyle = 'rgba(250,204,21,.85)';
    for (const x of PLAN.quais) { g.fillRect(X(x - 1.5) - 2, Z(-22), 4, Z(-9) - Z(-22)); g.fillRect(X(x + 1.5) - 2, Z(-22), 4, Z(-9) - Z(-22)); }
    PLAN.quais.forEach((x, i) => texte(g, 'QUAI ' + (i + 1), X(x), Z(-7.6), 17, 'rgba(250,204,21,.9)'));
    // bandes jaunes : bord de quai, passage piéton vers les bureaux
    g.fillRect(X(-56), Z(-22) - 3, X(-18) - X(-56), 6);
    for (let k = 0; k < 7; k++) { g.fillStyle = 'rgba(247,247,242,.85)'; g.fillRect(X(-30 + k * 1.2), Z(6.8), 0.6 * PPM, Z(9) - Z(6.8)); }
    // sens de circulation
    for (const x of [-4, 12, 28]) fleche(g, X(x), Z(5.5), 40, 0);
    for (const x of [40, 24, 4]) fleche(g, X(x), Z(-20), 40, Math.PI);
    for (const z of [-10, -4]) fleche(g, X(51.5), Z(z), 40, -Math.PI / 2);
    fleche(g, X(-14), Z(-8), 40, Math.PI / 2);
    // station de lavage : sol mouillé
    { const gr = g.createRadialGradient(X(13), Z(-20), 4, X(13), Z(-20), 7 * PPM); gr.addColorStop(0, 'rgba(30,58,90,.45)'); gr.addColorStop(1, 'rgba(30,58,90,0)'); g.fillStyle = gr; g.fillRect(X(4), Z(-27), 18 * PPM, 14 * PPM); }
    // portail : zébra et « STOP »
    g.fillStyle = 'rgba(247,247,242,.85)'; for (let k = 0; k < 8; k++) g.fillRect(X(42 + k * 1.1), Z(28), 0.55 * PPM, 2 * PPM);
    texte(g, 'SORTIE', X(44.5), Z(25), 16); texte(g, 'ENTRÉE', X(49), Z(25), 16);
    g.fillRect(X(47) - 1, Z(8), 2, Z(28) - Z(8));
  });
  T.route = toile(THREE, 1856, 144, (g, w, h) => {
    grain(g, w, h, '#4b4f56', 14, 3, 30);
    g.fillStyle = 'rgba(247,247,242,.85)'; for (let x = 0; x < w; x += 64) g.fillRect(x, h / 2 - 2, 36, 4);
    g.fillRect(0, 6, w, 3); g.fillRect(0, h - 9, w, 3);
  });
  T.panneau = toile(THREE, 512, 192, (g, w, h) => {
    g.fillStyle = '#0f2a5c'; g.fillRect(0, 0, w, h); g.fillStyle = '#f59e0b'; g.fillRect(0, h - 22, w, 22);
    texte(g, 'TRANSPORTS MODÈLE', w / 2, 74, 46, '#ffffff'); texte(g, 'Dépôt · démo fictive', w / 2, 128, 26, '#cbd5e1');
  });
  T.panneau.userData.lumineux = false;
  return T;
}

export function construireDecor(ctx) {
  const { THREE, scene, boite, mat, plan, T } = ctx;
  const [sx0, sz0, sW, sH] = PLAN.site;
  // ---- socle, pelouse, sol du dépôt, route ----
  boite(132, 1.5, 104, 0x8fae79, 0, -1.5, 0);
  plan(sW, sH, T.site, sx0 + sW / 2, 0.06, sz0 + sH / 2);
  plan(132, 9, T.route, 0, 0.05, 36.5);
  boite(132, 0.2, 1.4, 0xc9c6be, 0, 0, 31.6, scene, false); boite(132, 0.2, 1.4, 0xc9c6be, 0, 0, 41.6, scene, false);

  // ---- entrepôt à quais (coupé : on voit l'intérieur) ----
  const EX0 = -56, EX1 = -18, EZ0 = -39, EZ1 = -22, HQ = 1.2, HE = 6.5, MUR = 0xd8dde6, BARDAGE = 0x31507e;
  boite(EX1 - EX0, HQ, EZ1 - EZ0, 0xcfccc4, (EX0 + EX1) / 2, 0, (EZ0 + EZ1) / 2);           // dalle à hauteur de quai
  boite(EX1 - EX0, HE, 0.3, MUR, (EX0 + EX1) / 2, HQ, EZ0);                                     // mur nord
  boite(0.3, HE, EZ1 - EZ0, MUR, EX0, HQ, (EZ0 + EZ1) / 2);                                     // pignon ouest
  boite(0.3, HE * 0.55, EZ1 - EZ0, MUR, EX1, HQ, (EZ0 + EZ1) / 2);                              // pignon est (coupé)
  boite(EX1 - EX0, 0.5, 0.32, BARDAGE, (EX0 + EX1) / 2, HQ + HE, EZ0);                          // acrotère
  // façade des quais : trumeaux entre les portes, sas d'étanchéité noirs, butoirs, niveleurs
  const bordsPortes = [EX0, ...PLAN.quais.flatMap((x) => [x - 1.7, x + 1.7]), EX1];
  for (let k = 0; k < bordsPortes.length; k += 2) { const a = bordsPortes[k], b = bordsPortes[k + 1]; if (b - a > 0.05) boite(b - a, 2.6, 0.3, BARDAGE, (a + b) / 2, HQ, EZ1); }
  for (const x of PLAN.quais) {
    boite(0.25, 3.2, 0.5, 0x1f2329, x - 1.75, HQ - 0.2, EZ1 + 0.2); boite(0.25, 3.2, 0.5, 0x1f2329, x + 1.75, HQ - 0.2, EZ1 + 0.2); boite(3.75, 0.35, 0.5, 0x1f2329, x, HQ + 2.95, EZ1 + 0.2);
    boite(3.0, 0.5, 0.25, 0x2a2d33, x, HQ + 2.5, EZ1 - 0.05);                                    // porte sectionnelle relevée
    boite(0.35, 0.35, 0.25, 0x111827, x - 1.1, 0.75, EZ1 + 0.15); boite(0.35, 0.35, 0.25, 0x111827, x + 1.1, 0.75, EZ1 + 0.15); // butoirs
    boite(2.6, 0.06, 1.4, 0x6b7280, x, HQ - 0.02, EZ1 - 0.6, scene, false);                       // niveleur
    boite(0.2, 0.2, 0.06, 0x22c55e, x + 2.0, HQ + 1.6, EZ1 + 0.18, scene, false);                 // feu de quai
  }
  // racks à palettes et palettes au sol
  const r = hasard(5), COUL_COLIS = [0xc8a071, 0xb8915f, 0xd9b98c, 0x93c5fd, 0xe5e7eb, 0xa3b18a];
  for (const zr of [-37.6, -33.6]) {
    for (let x = EX0 + 1.2; x < EX1 - 3; x += 2.8) {
      boite(0.12, 5.2, 1.1, 0xea580c, x, HQ, zr); if (x + 2.8 < EX1 - 3) for (const y of [0, 1.7, 3.4]) boite(2.8, 0.12, 1.1, 0x2563eb, x + 1.4, HQ + y + 1.4, zr, scene, false);
      if (x + 2.8 < EX1 - 3) for (const y of [0, 1.55, 3.25]) if (r() > 0.18) { boite(1.1, 0.14, 1.0, 0xb08455, x + 0.75, HQ + y, zr, scene, false); boite(1.0, 1.0 + r() * 0.3, 0.95, COUL_COLIS[Math.floor(r() * 6)], x + 0.75, HQ + y + 0.14, zr); if (r() > 0.3) { boite(1.1, 0.14, 1.0, 0xb08455, x + 2.05, HQ + y, zr, scene, false); boite(1.0, 1.0, 0.95, COUL_COLIS[Math.floor(r() * 6)], x + 2.05, HQ + y + 0.14, zr); } }
    }
  }
  for (const x of PLAN.quais) for (let k = 0; k < 4; k++) if (r() > 0.25) { const xx = x - 0.65 + (k % 2) * 1.3, zz = -24 - Math.floor(k / 2) * 1.4; boite(1.15, 0.14, 1.15, 0xb08455, xx, HQ, zz, scene, false); boite(1.05, 0.8 + r() * 0.7, 1.05, COUL_COLIS[Math.floor(r() * 6)], xx, HQ + 0.14, zz); }
  // chariots élévateurs (garés)
  const chariot = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, HQ, z); g.rotation.y = ry; scene.add(g);
    boite(1.1, 1.0, 1.9, 0xf59e0b, 0, 0.25, 0, g); boite(0.08, 2.1, 0.08, 0x1f2937, -0.45, 0.25, 0.95, g); boite(0.08, 2.1, 0.08, 0x1f2937, 0.45, 0.25, 0.95, g); boite(1.0, 0.06, 1.1, 0x374151, 0, 0.12, 1.55, g); boite(1.0, 0.08, 1.0, 0x1f2937, 0, 2.2, -0.2, g);
    for (const [dx, dz] of [[-0.5, 0.6], [0.5, 0.6], [-0.5, -0.6], [0.5, -0.6]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.22, 12), mat(0x111827)); w.rotation.z = Math.PI / 2; w.position.set(dx, 0.25, dz); g.add(w); } };
  chariot(-47, -27.5, 0.4); chariot(-26, -28.5, -0.6);

  // ---- atelier d'entretien (2 baies, fosses, établis) ----
  const AX0 = -12, AX1 = 6, AZ0 = -39, AZ1 = -24, HA = 5.2;
  boite(AX1 - AX0, 0.14, AZ1 - AZ0, 0xbfc3c9, (AX0 + AX1) / 2, 0, (AZ0 + AZ1) / 2);
  boite(AX1 - AX0, HA, 0.3, MUR, (AX0 + AX1) / 2, 0.14, AZ0); boite(0.3, HA, AZ1 - AZ0, MUR, AX0, 0.14, (AZ0 + AZ1) / 2); boite(0.3, HA * 0.5, AZ1 - AZ0, MUR, AX1, 0.14, (AZ0 + AZ1) / 2);
  { const b = PLAN.baies, bords = [AX0, b[0] - 2.4, b[0] + 2.4, b[1] - 2.4, b[1] + 2.4, AX1]; for (let k = 0; k < bords.length; k += 2) boite(bords[k + 1] - bords[k], 1.6, 0.3, 0x7f1d1d, (bords[k] + bords[k + 1]) / 2, 0.14, AZ1); }
  boite(AX1 - AX0, 0.4, 0.32, 0x7f1d1d, (AX0 + AX1) / 2, 0.14 + HA, AZ0);
  for (const x of PLAN.baies) { boite(1.1, 0.03, 9, 0x1f2329, x, 0.15, -31.5, scene, false); boite(1.3, 0.04, 9.2, 0xfacc15, x, 0.145, -31.5, scene, false); }
  boite(4, 0.9, 0.7, 0x475569, -8, 0.14, -38.3); boite(4, 0.9, 0.7, 0x475569, 2, 0.14, -38.3);       // établis
  boite(0.7, 1.9, 2.4, 0xb91c1c, -11.3, 0.14, -30); boite(0.7, 1.9, 2.4, 0xb91c1c, -11.3, 0.14, -27); // armoires à outils
  for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.32, 16), mat(0x16181d)); p.position.set(4.6, 0.32 + k * 0.33, -37.6); p.castShadow = true; p.receiveShadow = true; scene.add(p); }

  // ---- station de lavage (portique au-dessus de la voie nord) ----
  { const [x, z] = PLAN.lavage, BL = 0x0369a1;
    boite(0.5, 5.2, 0.5, BL, x, 0, z - 3.4); boite(0.5, 5.2, 0.5, BL, x, 0, z + 3.4); boite(0.7, 0.6, 7.3, BL, x, 5.2, z);
    for (const dz of [-2.15, 2.15]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 4.2, 14), mat(0x38bdf8, { roughness: 0.95 })); b.position.set(x + 1.2, 2.3, z + dz); b.castShadow = true; scene.add(b); }
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 4.6, 14), mat(0x38bdf8, { roughness: 0.95 })); h.rotation.x = Math.PI / 2; h.position.set(x - 1, 4.7, z); h.castShadow = true; scene.add(h);
    boite(1.6, 2.4, 1.6, 0xe2e8f0, x + 4, 0, z - 4.6); boite(1.7, 0.2, 1.7, BL, x + 4, 2.4, z - 4.6); }

  // ---- cuve gasoil (bac de rétention) et pompe ----
  { const [x] = PLAN.gasoil;
    boite(10, 0.9, 5.4, 0xb4b7bd, x, 0, -31.5); boite(9.2, 0.92, 4.6, 0x9ca3af, x, 0.02, -31.5, scene, false);
    const cuve = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 7.4, 24), mat(0x166534, { roughness: 0.5, metalness: 0.2 })); cuve.rotation.z = Math.PI / 2; cuve.position.set(x, 2.25, -31.5); cuve.castShadow = true; cuve.receiveShadow = true; scene.add(cuve);
    for (const dx of [-2.6, 2.6]) boite(0.4, 1.0, 2.4, 0x6b7280, x + dx, 0.9, -31.5);
    boite(0.3, 0.6, 0.3, 0xfacc15, x + 3.7, 3.4, -31.5);
    boite(2.4, 0.22, 1.1, 0xcfccc4, x, 0, -23.7); boite(0.7, 1.7, 0.5, 0x166534, x, 0.22, -23.7); boite(0.5, 0.4, 0.52, 0xf8fafc, x, 1.3, -23.45, scene, false);
    for (const dx of [-1.8, 1.8]) boite(0.22, 5.4, 0.22, 0x9ca3af, x + dx, 0, -24.2);
    boite(5, 0.25, 3.2, 0xe2e8f0, x, 5.4, -23.4); boite(5.02, 0.3, 0.06, 0x166534, x, 5.4, -21.8, scene, false); }

  // ---- bureaux d'exploitation (coupés à 1 m côté cour) ----
  const BX0 = -56, BX1 = -32, BZ0 = 11, BZ1 = 29, HB = 3.1, BAS = 1.0, NUIT = 0x22305a, CHANT = 0xe9edf5;
  boite(BX1 - BX0, 0.2, BZ1 - BZ0, 0xd4d6dc, (BX0 + BX1) / 2, 0, (BZ0 + BZ1) / 2);
  boite(BX1 - BX0 - 0.4, 0.02, BZ1 - BZ0 - 0.4, 0xe7e3da, (BX0 + BX1) / 2, 0.2, (BZ0 + BZ1) / 2, scene, false);
  const murB = (l, p, x, z, h) => { boite(l, h, p, NUIT, x, 0.2, z); boite(l + 0.02, 0.05, p + 0.02, CHANT, x, 0.2 + h, z, scene, false); };
  murB(BX1 - BX0, 0.3, (BX0 + BX1) / 2, BZ0, HB); murB(0.3, BZ1 - BZ0, BX0, (BZ0 + BZ1) / 2, HB);
  murB(BX1 - BX0, 0.3, (BX0 + BX1) / 2, BZ1, BAS); murB(0.3, BZ1 - BZ0 - 3, BX1, (BZ0 + BZ1) / 2 - 1.5, BAS);
  const cloison = (l, p, x, z) => boite(l, BAS + 0.3, p, 0xf1f2f5, x, 0.2, z);
  cloison(0.15, BZ1 - BZ0, -44, (BZ0 + BZ1) / 2); cloison(12, 0.15, -50, 20); cloison(12, 0.15, -38, 21);
  const bureau = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0.2, z); g.rotation.y = ry; scene.add(g);
    boite(1.6, 0.05, 0.8, 0xe5e7eb, 0, 0.72, 0, g); boite(0.05, 0.72, 0.7, 0x94a3b8, -0.75, 0, 0, g); boite(0.05, 0.72, 0.7, 0x94a3b8, 0.75, 0, 0, g);
    boite(0.6, 0.38, 0.04, 0x0f172a, -0.35, 0.8, -0.28, g); boite(0.6, 0.38, 0.04, 0x0f172a, 0.35, 0.8, -0.28, g); boite(0.5, 0.45, 0.5, 0x334155, 0, 0, 0.65, g); };
  // salle d'exploitation : 3 postes et l'écran mural du suivi des tournées
  bureau(-40, 14.2); bureau(-36.5, 14.2); bureau(-40, 17.6, Math.PI);
  boite(3.6, 1.6, 0.08, 0x0b1220, -38.2, 1.0, 11.25); boite(3.4, 1.4, 0.02, 0x1d4ed8, -38.2, 1.1, 11.3, scene, false);
  bureau(-50, 14.2); bureau(-53, 17.4, Math.PI / 2);   // direction · administration
  bureau(-50, 24.4); bureau(-53.2, 24.4);              // commercial · facturation
  // salle des chauffeurs : grande table, machine à café, casiers
  boite(4.2, 0.05, 1.4, 0xd6c7a8, -38, 0.75, 25, scene); boite(0.1, 0.75, 1.2, 0x8b7a5a, -39.9, 0.2, 25); boite(0.1, 0.75, 1.2, 0x8b7a5a, -36.1, 0.2, 25);
  boite(0.6, 1.5, 0.5, 0x111827, -43, 0.2, 28.3); for (let k = 0; k < 6; k++) boite(0.55, 1.9, 0.5, k % 2 ? 0x64748b : 0x475569, -42 + k * 0.6, 0.2, 21.6);
  // panneau « Transports Modèle » à l'entrée
  boite(0.16, 2.6, 0.16, 0x334155, 37.6, 0, 30.2); boite(0.16, 2.6, 0.16, 0x334155, 41.4, 0, 30.2);
  plan(3.8, 1.4, T.panneau, 39.5, 2.6, 30.32, true);
  boite(3.9, 1.5, 0.12, 0x0f2a5c, 39.5, 1.95, 30.2);

  // ---- clôture et portail ----
  const CL = 0x6b7280;
  const tronçon = (xa, za, xb, zb) => { const l = Math.hypot(xb - xa, zb - za), n = Math.max(1, Math.round(l / 4));
    for (let k = 0; k <= n; k++) boite(0.12, 1.9, 0.12, CL, xa + (xb - xa) * k / n, 0, za + (zb - za) * k / n, scene, false);
    const rail = boite(Math.abs(xb - xa) || 0.06, 0.06, Math.abs(zb - za) || 0.06, CL, (xa + xb) / 2, 1.85, (za + zb) / 2, scene, false); void rail; };
  tronçon(-58, 31, 41, 31); tronçon(52, 31, 58, 31); tronçon(-58, -41, 58, -41); tronçon(-58, -41, -58, 31); tronçon(58, -41, 58, 31);
  boite(11, 1.7, 0.1, 0x9ca3af, 57.5, 0.1, 31.4, scene, false); // portail coulissant ouvert
  boite(2.2, 2.6, 2.2, 0xe2e8f0, 54.6, 0, 27.5); boite(2.4, 0.2, 2.4, 0x0f2a5c, 54.6, 2.6, 27.5); // loge

  // ---- arbres ----
  const arbre = (x, z, s = 1) => {
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * s, 0.2 * s, 1.8 * s, 8), mat(0x7a5a3e)); tr.position.set(x, 0.9 * s, z); tr.castShadow = true; scene.add(tr);
    for (const [dx, dy, dz, rr, c] of [[0, 2.6, 0, 1.4, 0x6c9a5a], [0.6, 2.2, 0.4, 1.0, 0x5d8c4e], [-0.6, 2.3, -0.3, 1.05, 0x7aa766]]) {
      const f = new THREE.Mesh(new THREE.IcosahedronGeometry(rr * s, 1), mat(c)); f.position.set(x + dx * s, dy * s, z + dz * s); f.castShadow = true; f.receiveShadow = true; scene.add(f);
    }
  };
  for (let x = -62; x <= 62; x += 9) arbre(x + (x % 2 ? 1 : 0), 45.5, 1.1);
  for (let z = -36; z <= 26; z += 10) { arbre(-62, z, 1.2); arbre(62, z + 4, 1.2); }
  for (let x = -50; x <= 50; x += 12) arbre(x, -45, 1.15);
  for (const [x, z] of [[-28, 27], [-24, 20], [18, 27], [10, 21.5], [-16, 28]]) arbre(x, z, 1);
  return {};
}

// ---------- modèles ----------
const B = (THREE, l, h, p) => new THREE.BoxGeometry(l, h, p);
const roue = (THREE, r, l) => new THREE.CylinderGeometry(r, r, l, 16);
function roues(THREE, R, W, zs, double = false) {
  return zs.flatMap((z) => [-1, 1].flatMap((s) => {
    const l = double ? 0.62 : 0.34;
    return [{ geo: roue(THREE, R, l), x: s * (W / 2 - l / 2 + 0.04), y: R, z, rz: Math.PI / 2, couleur: 0x16181d }, { geo: roue(THREE, R * 0.5, l + 0.02), x: s * (W / 2 - l / 2 + 0.05), y: R, z, rz: Math.PI / 2, couleur: 0xb6bcc6 }];
  }));
}
// cabine de camion avancée (tracteur et porteur) : avant de la cabine en zf, largeur W
function cabine(THREE, zf, W, y0) {
  const teinte = [
    { geo: B(THREE, W, 1.95, 2.05), y: y0 + 1.2, z: zf - 1.05 },
    { geo: B(THREE, W - 0.1, 0.55, 1.8), y: y0 + 2.42, z: zf - 1.2 },                         // déflecteur de toit
    { geo: B(THREE, 0.1, 0.5, 0.12), x: W / 2 + 0.06, y: y0 + 1.7, z: zf - 0.1 }, { geo: B(THREE, 0.1, 0.5, 0.12), x: -W / 2 - 0.06, y: y0 + 1.7, z: zf - 0.1 }, // rétros
  ].map((p) => ({ ...p, couleur: 0xffffff }));
  const fixe = [
    { geo: B(THREE, W - 0.2, 0.55, 0.12), y: y0 + 0.5, z: zf + 0.02, couleur: 0x1f2329 },      // calandre
    { geo: B(THREE, 0.42, 0.16, 0.06), x: -W / 2 + 0.4, y: y0 + 0.3, z: zf + 0.04, couleur: 0xfffbe8 }, { geo: B(THREE, 0.42, 0.16, 0.06), x: W / 2 - 0.4, y: y0 + 0.3, z: zf + 0.04, couleur: 0xfffbe8 },
    { geo: B(THREE, W + 0.02, 0.32, 0.25), y: y0 + 0.05, z: zf - 0.1, couleur: 0x2a2d33 },     // pare-chocs
    { geo: B(THREE, 0.52, 0.12, 0.03), y: y0 + 0.12, z: zf + 0.04, couleur: 0xf8fafc },        // plaque
  ];
  const vitre = [
    { geo: B(THREE, W - 0.24, 0.9, 0.06), y: y0 + 1.6, z: zf + 0.0, rx: -0.06 },
    { geo: B(THREE, 0.06, 0.75, 1.0), x: W / 2 + 0.005, y: y0 + 1.65, z: zf - 0.6 }, { geo: B(THREE, 0.06, 0.75, 1.0), x: -W / 2 - 0.005, y: y0 + 1.65, z: zf - 0.6 },
  ].map((p) => ({ ...p, couleur: 0xffffff }));
  return { teinte, fixe, vitre };
}
// Tracteur routier (6 m, avant +z en z = 3) ; sellette à z = -1.3
export function geosTracteur(THREE, assembler) {
  const W = 2.5, c = cabine(THREE, 3, W, 0.75);
  return {
    teinte: assembler(THREE, c.teinte),
    fixe: assembler(THREE, [...c.fixe, { geo: B(THREE, 1.1, 0.35, 5.6), y: 0.75, z: 0.2, couleur: 0x1f2329 }, { geo: B(THREE, 1.6, 0.18, 1.4), y: 1.05, z: -1.3, couleur: 0x374151 },
      { geo: B(THREE, 0.6, 0.6, 1.2), x: 1.0, y: 0.55, z: 0.4, couleur: 0xc0c5cc }, { geo: B(THREE, 0.5, 0.5, 0.9), x: -1.0, y: 0.6, z: 0.5, couleur: 0x2a2d33 }, // réservoirs
      { geo: B(THREE, 0.14, 1.4, 0.14), x: -0.9, y: 2.6, z: 0.4, couleur: 0x9ca3af },
      ...roues(THREE, 0.52, W, [1.9]), ...roues(THREE, 0.52, W, [-1.7], true)]),
    vitre: assembler(THREE, c.vitre),
  };
}
// Semi-remorque (13,6 m, centre à l'origine, avant +z en z = 6,8) : caisse teintée (bâche), châssis et essieux fixes
export function geosRemorque(THREE, assembler) {
  const W = 2.55;
  return {
    teinte: assembler(THREE, [{ geo: B(THREE, W, 2.75, 13.6), y: 2.62, couleur: 0xffffff }]),
    fixe: assembler(THREE, [
      { geo: B(THREE, W + 0.02, 0.14, 13.62), y: 1.22, couleur: 0x9ca3af }, { geo: B(THREE, W + 0.02, 0.1, 13.62), y: 4.0, couleur: 0xd1d5db },
      { geo: B(THREE, W + 0.04, 0.22, 0.6), y: 2.9, z: 0, couleur: 0xf59e0b }, { geo: B(THREE, W + 0.04, 0.22, 13.64), y: 1.5, couleur: 0x0f2a5c }, // bande de couleur
      { geo: B(THREE, 1.2, 0.4, 12), y: 0.95, z: -0.4, couleur: 0x1f2329 },
      { geo: B(THREE, 0.12, 0.9, 0.12), x: 0.9, y: 0.45, z: 4.2, couleur: 0x374151 }, { geo: B(THREE, 0.12, 0.9, 0.12), x: -0.9, y: 0.45, z: 4.2, couleur: 0x374151 }, // béquilles
      { geo: B(THREE, W, 0.18, 0.08), y: 1.1, z: -6.8, couleur: 0xdc2626 },
      ...roues(THREE, 0.5, W, [-3.6, -4.9, -6.2]),
    ]),
  };
}
// Porteur 19 t (10 m, avant +z en z = 5) : cabine teintée, caisse blanche
export function geosPorteur(THREE, assembler) {
  const W = 2.5, c = cabine(THREE, 5, W, 0.7);
  return {
    teinte: assembler(THREE, [...c.teinte, { geo: B(THREE, W + 0.03, 0.4, 7.3), y: 1.3, z: -1.25, couleur: 0xffffff }]),
    fixe: assembler(THREE, [...c.fixe,
      { geo: B(THREE, W, 2.6, 7.3), y: 2.6, z: -1.25, couleur: 0xf5f5f4 }, { geo: B(THREE, W + 0.04, 0.24, 2.4), y: 2.9, z: -0.8, couleur: 0x0f2a5c },
      { geo: B(THREE, 1.1, 0.35, 9.4), y: 0.72, z: 0, couleur: 0x1f2329 }, { geo: B(THREE, 2.3, 0.1, 0.6), y: 0.55, z: -4.95, couleur: 0x4b5563 }, // hayon replié
      ...roues(THREE, 0.5, W, [3.6]), ...roues(THREE, 0.5, W, [-2.2], true)]),
    vitre: assembler(THREE, c.vitre),
  };
}
// Fourgon 3,5 t (6,6 m, avant +z en z = 3,3)
export function geosFourgon(THREE, assembler) {
  const W = 2.1;
  return {
    teinte: assembler(THREE, [{ geo: B(THREE, W, 1.15, 1.25), y: 1.0, z: 2.6, couleur: 0xffffff }, { geo: B(THREE, W - 0.05, 0.3, 0.5), y: 0.7, z: 3.1, couleur: 0xffffff },
      { geo: B(THREE, W, 2.5, 4.9), y: 1.85, z: -0.8, couleur: 0xffffff }]),
    fixe: assembler(THREE, [
      { geo: B(THREE, W + 0.03, 0.25, 4.92), y: 1.25, z: -0.8, couleur: 0x0f2a5c }, { geo: B(THREE, W + 0.02, 0.26, 0.2), y: 0.45, z: 3.25, couleur: 0x2a2d33 },
      { geo: B(THREE, 0.3, 0.12, 0.05), x: -0.7, y: 0.85, z: 3.36, couleur: 0xfffbe8 }, { geo: B(THREE, 0.3, 0.12, 0.05), x: 0.7, y: 0.85, z: 3.36, couleur: 0xfffbe8 },
      { geo: B(THREE, W - 0.2, 0.25, 6.4), y: 0.45, z: 0, couleur: 0x1f2329 },
      ...roues(THREE, 0.36, W, [2.3]), ...roues(THREE, 0.36, W, [-1.9], true)]),
    vitre: assembler(THREE, [{ geo: B(THREE, W - 0.2, 0.7, 0.06), y: 1.95, z: 3.0, rx: -0.5 }, { geo: B(THREE, 0.05, 0.5, 0.8), x: W / 2, y: 1.85, z: 2.5 }, { geo: B(THREE, 0.05, 0.5, 0.8), x: -W / 2, y: 1.85, z: 2.5 }].map((p) => ({ ...p, couleur: 0xffffff }))),
  };
}
