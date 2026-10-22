// Premier étage des locaux du personnel (au-dessus de x 2 → 18, z -10 → 6) et escalier complet.
// Module sans import : THREE et les aides de la maquette sont passés dans ctx.
// construireEtage({ THREE, scene, boite, mat, texte, clic, zone }) → { groupe, montrer, postes, zones, escalier }
export function construireEtage(ctx) {
  const { THREE, scene, boite, mat, texte, zone } = ctx;
  const G = new THREE.Group(); G.name = 'etage'; scene.add(G);
  const ESC = new THREE.Group(); ESC.name = 'escalier'; scene.add(ESC);

  // Repères
  const X0 = 2, X1 = 18, Z0 = -10, Z1 = 6;
  const Y = 3.2;              // dessus du plancher de l'étage
  const DALLE = 0.27;         // épaisseur de la dalle béton
  const YB = Y - DALLE - 0.02; // dessous de la dalle
  const H = 1.4;              // murs coupés à 1,4 m au-dessus du plancher
  const EP = 0.3, EC = 0.12;  // mur extérieur, cloison
  const RDC = 1.6;            // haut des murs coupés du rez-de-chaussée
  const MUR = 0xfafaf8, CLOISON = 0xf1f1ee, BETON = 0xb9b6ae, BOIS = 0x8b6b4a, BOIS_C = 0xc9a77c, GRIS = 0x9ca3af, FONCE = 0x374151, NOIR = 0x111827, BLANC = 0xf8fafc;
  const verre = new THREE.MeshStandardMaterial({ color: 0x9cc3d9, transparent: true, opacity: 0.42, roughness: 0.08, metalness: 0.1 });
  const inox = mat(0xb8bcc2, { roughness: 0.35, metalness: 0.6 });
  const b = (l, h, p, m, x, y, z, parent = G, ombre = true) => boite(l, h, p, m, x, y, z, parent, ombre);
  const groupe = (x, z, rot = 0, y = Y, parent = G) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; parent.add(g); return g; };
  const cyl = (r, h, m, x, y, z, parent, seg = 16) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), typeof m === 'number' ? mat(m) : m); c.position.set(x, y + h / 2, z); c.castShadow = true; c.receiveShadow = true; parent.add(c); return c; };

  // ---------- Murs avec ouvertures ----------
  // axe 'x' : mur le long de x, de a0 à a1, à z = c ; axe 'z' : le long de z, à x = c.
  // ouvertures : { a, b, t: 'porte' | 'fenetre' | 'vitre', cote: +1/-1 (côté où la porte s'ouvre) }
  function mur(axe, a0, a1, c, ep, ouvertures = [], { y0 = Y, h = H, m = MUR, etage = true } = {}) {
    const piece = (u0, u1, yy, hh, mm, ombre = true, e = ep) => {
      const l = u1 - u0; if (l <= 0.001) return;
      if (axe === 'x') b(l, hh, e, mm, (u0 + u1) / 2, yy, c, G, ombre); else b(e, hh, l, mm, c, yy, (u0 + u1) / 2, G, ombre);
    };
    const ops = [...ouvertures].sort((p, q) => p.a - q.a);
    let u = a0;
    for (const o of ops) {
      piece(u, o.a, y0, h, m);
      if (o.t === 'porte') porte(axe, o.a, o.b, c, o.cote || 1, y0, o.angle);
      else if (etage) { // fenêtre d'étage : allège à 0,9 m, vitrage au-dessus (coupé à 1,4 m)
        const allege = o.t === 'vitre' ? 0.75 : 0.9;
        piece(o.a, o.b, y0, allege, m);
        piece(o.a - 0.02, o.b + 0.02, y0 + allege, 0.04, mat(0xe5e7eb), false, ep + 0.08); // tablette
        piece(o.a, o.b, y0 + allege + 0.04, h - allege - 0.04, verre, false, 0.05);
        for (let k = 1; k < Math.round((o.b - o.a) / 1.2); k++) { const uu = o.a + k * (o.b - o.a) / Math.round((o.b - o.a) / 1.2); piece(uu - 0.03, uu + 0.03, y0 + allege, h - allege, mat(0x6b7280), false, 0.08); }
        piece(o.a, o.a + 0.06, y0 + allege, h - allege, mat(0x6b7280), false, 0.1); piece(o.b - 0.06, o.b, y0 + allege, h - allege, mat(0x6b7280), false, 0.1);
      } else { // haut du rez-de-chaussée : vitrage puis linteau
        const hv = Math.min(0.85, h - 0.3);
        piece(o.a, o.b, y0, hv, verre, false, 0.05);
        piece(o.a, o.b, y0 + hv, h - hv, m);
        piece(o.a - 0.02, o.b + 0.02, y0 + hv - 0.03, 0.05, mat(0x6b7280), false, ep + 0.04);
      }
      u = o.b;
    }
    piece(u, a1, y0, h, m);
  }
  // porte ouverte (battant en bois + huisserie)
  function porte(axe, a, bb, c, cote, y0, angle = 1.1) {
    const l = bb - a, base = axe === 'x' ? 0 : -Math.PI / 2;
    const g = new THREE.Group();
    if (axe === 'x') g.position.set(a, y0, c); else g.position.set(c, y0, a);
    g.rotation.y = axe === 'x' ? -cote * angle : base + cote * angle;
    b(l - 0.06, 1.3, 0.05, mat(BOIS_C), (l - 0.06) / 2 + 0.03, 0, 0, g);
    b(0.04, 0.04, 0.12, inox, l - 0.18, 0.62, 0, g, false); // poignée
    G.add(g);
    for (const u of [a, bb]) { if (axe === 'x') b(0.06, 1.38, EC + 0.06, mat(0x6b7280), u, y0, c, G, false); else b(EC + 0.06, 1.38, 0.06, mat(0x6b7280), c, y0, u, G, false); }
  }
  // plaque de porte lisible des deux côtés (posée sur le haut du mur)
  function plaque(txt, axe, u, c, l = 1.7, fond = '#374151') {
    const h = l / 4.4, tilt = 0.55;
    const m = new THREE.MeshBasicMaterial({ map: texte(txt, { w: 640, h: 146, fond, couleur: '#fff', taille: 56 }) });
    const pied = new THREE.Group(); G.add(pied);
    if (axe === 'x') pied.position.set(u, Y + H, c); else { pied.position.set(c, Y + H, u); pied.rotation.y = Math.PI / 2; }
    for (const s of [1, -1]) { // chevalet : une face lisible de chaque côté du mur
      const pivot = new THREE.Group(); pivot.rotation.y = s > 0 ? 0 : Math.PI; pied.add(pivot);
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(l, h), m);
      pl.position.set(0, (h / 2) * Math.cos(tilt), 0.03 + (h / 2) * Math.sin(tilt)); pl.rotation.x = -tilt; pivot.add(pl);
      const dos = new THREE.Mesh(new THREE.PlaneGeometry(l, h), mat(0x1f2937)); dos.position.copy(pl.position); dos.position.z -= 0.004; dos.rotation.x = -tilt; dos.rotation.y = Math.PI; pivot.add(dos);
    }
    b(l, 0.03, 0.14, mat(0x1f2937), 0, 0, 0, pied, false);
  }

  // ---------- Haut des murs du rez-de-chaussée (de 1,6 m au dessous de la dalle) ----------
  const hb = YB - RDC;
  mur('x', X0 - EP / 2, X1 + EP / 2, Z1, EP, [{ a: 6.4, b: 8.4, t: 'f' }, { a: 10, b: 12.4, t: 'f' }, { a: 14.6, b: 16.6, t: 'f' }], { y0: RDC, h: hb, etage: false });
  mur('z', Z0, Z1, X1, EP, [{ a: -8.6, b: -5.2, t: 'f' }, { a: 2.2, b: 4.6, t: 'f' }], { y0: RDC, h: hb, etage: false });
  mur('z', Z0, Z1, X0, EP, [], { y0: RDC, h: hb });
  mur('x', X0, X1, Z0, EP, [], { y0: RDC, h: hb });

  // ---------- Dalle avec la trémie de l'escalier ----------
  const TX0 = X0 + EP / 2, TX1 = 4.15, TZ = 1.3; // trémie : x 2,15 → 4,15, z 1,3 → 5,85
  const dalle = (x0, x1, z0, z1) => b(x1 - x0, DALLE, z1 - z0, BETON, (x0 + x1) / 2, YB, (z0 + z1) / 2);
  dalle(X0 - EP / 2, X1 + EP / 2, Z0 - EP / 2, TZ);
  dalle(TX1, X1 + EP / 2, TZ, Z1 + EP / 2);
  dalle(X0 - EP / 2, TX0, TZ, Z1 + EP / 2);
  dalle(TX0, TX1, Z1 - EP / 2, Z1 + EP / 2);
  b(X1 - X0 + EP + 0.1, 0.05, 0.08, mat(0x6b7280), (X0 + X1) / 2, YB - 0.05, Z1 + EP / 2 + 0.02, G, false); // nez de dalle en façade
  // revêtements de sol (2 cm) par pièce
  const SOL_COULOIR = 0xd4d6d9, SOL_BUREAU = 0xd8c6a6, SOL_REUNION = 0xaeb6c2, SOL_CARRELAGE = 0xe9edf0, SOL_TECH = 0xc3c6ca;
  const sol = (x0, x1, z0, z1, c) => b(x1 - x0, 0.02, z1 - z0, c, (x0 + x1) / 2, Y - 0.02, (z0 + z1) / 2, G, false);
  sol(TX0, X1 - EP / 2, -1, TZ, SOL_COULOIR); sol(TX1, 5.2, TZ, Z1 - EP / 2, SOL_COULOIR); // couloir et palier
  sol(5.2, 7.5, 1, Z1 - EP / 2, SOL_CARRELAGE);   // sanitaires
  sol(7.5, 12.5, 1, Z1 - EP / 2, SOL_BUREAU);     // RH
  sol(12.5, X1 - EP / 2, 1, Z1 - EP / 2, SOL_BUREAU); // compta
  sol(TX0, 9, Z0 + EP / 2, -1, SOL_BUREAU);       // open space
  sol(9, X1 - EP / 2, Z0 + EP / 2, -4.5, SOL_REUNION); // réunion
  sol(9, 12, -4.5, -1, SOL_TECH);                 // archives / serveur
  sol(12, 13.5, -4.5, -1, SOL_COULOIR);           // dégagement
  sol(13.5, X1 - EP / 2, -4.5, -1, SOL_BUREAU);   // gérant adjoint
  for (let x = 3; x < 18; x += 1.2) b(0.01, 0.005, 2, mat(0xc4c7cb), x, Y, 0, G, false); // joints du couloir

  // ---------- Murs extérieurs de l'étage ----------
  mur('x', X0 - EP / 2, X1 + EP / 2, Z1, EP, [{ a: 5.6, b: 6.9, t: 'f' }, { a: 8.4, b: 11.6, t: 'f' }, { a: 13.2, b: 17.2, t: 'f' }]); // façade (côté parking)
  mur('z', Z0 - EP / 2, Z1 + EP / 2, X1, EP, [{ a: -9.3, b: -5.2, t: 'f' }, { a: -4, b: -1.6, t: 'f' }, { a: 1.8, b: 5.2, t: 'f' }]); // pignon est
  mur('x', X0 - EP / 2, X1 + EP / 2, Z0, EP, [{ a: 10.5, b: 16.5, t: 'vitre' }]);  // vue sur la réserve
  mur('z', Z0 - EP / 2, Z1 + EP / 2, X0, EP, [{ a: -8.8, b: -2.4, t: 'vitre' }]); // vue sur la surface de vente

  // ---------- Cloisons et portes ----------
  // couloir z -1 → 1 ; palier à l'ouest (arrivée de l'escalier)
  mur('x', 5.2, X1 - EP / 2, 1, EC, [{ a: 8.1, b: 9.0, t: 'porte', cote: 1 }, { a: 13.0, b: 13.9, t: 'porte', cote: 1 }], { m: CLOISON });
  mur('z', 1, Z1 - EP / 2, 5.2, EC, [{ a: 2.0, b: 2.85, t: 'porte', cote: 1 }], { m: CLOISON });   // palier | sanitaires
  mur('z', 1, Z1 - EP / 2, 7.5, EC, [], { m: CLOISON });   // sanitaires | RH
  mur('z', 1, Z1 - EP / 2, 12.5, EC, [], { m: CLOISON });  // RH | compta
  mur('x', TX0, X1 - EP / 2, -1, EC, [{ a: 5.0, b: 6.0, t: 'porte', cote: -1 }, { a: 10.2, b: 11.05, t: 'porte', cote: -1 }, { a: 12.3, b: 13.2, t: 'porte', cote: -1, angle: 1.4 }, { a: 14.3, b: 15.2, t: 'porte', cote: -1 }], { m: CLOISON });
  mur('z', Z0 + EP / 2, -1, 9, EC, [], { m: CLOISON });    // open space | réunion
  mur('x', 9, X1 - EP / 2, -4.5, EC, [{ a: 12.3, b: 13.2, t: 'porte', cote: -1 }], { m: CLOISON }); // réunion
  mur('z', -4.5, -1, 12, EC, [], { m: CLOISON });
  mur('z', -4.5, -1, 13.5, EC, [], { m: CLOISON });
  // plaques de porte
  plaque('RESSOURCES HUMAINES', 'x', 10.5, 1, 2.2);
  plaque('COMPTABILITÉ', 'x', 15.4, 1, 1.9);
  plaque('SANITAIRES', 'z', 3.9, 5.2, 1.5);
  plaque('OPEN SPACE', 'x', 3.6, -1, 1.6);
  plaque('ARCHIVES · SERVEUR', 'x', 10.6, -1, 1.9, '#4b5563');
  plaque('GÉRANT ADJOINT', 'x', 16.4, -1, 1.9);
  plaque('SALLE DE RÉUNION', 'x', 15.2, -4.5, 2.1, '#1e3a8a');

  // ---------- Mobilier ----------
  function bureau(x, z, rot, { l = 1.6, p = 0.8, ecran = true, double = false } = {}) {
    const g = groupe(x, z, rot);
    b(l, 0.04, p, mat(BOIS_C), 0, 0.71, 0, g);
    for (const s of [-1, 1]) b(0.04, 0.71, p - 0.06, mat(0xd1d5db), s * (l / 2 - 0.04), 0, 0, g);
    b(l - 0.1, 0.35, 0.02, mat(0xd1d5db), 0, 0.36, -p / 2 + 0.05, g, false); // voile de fond
    b(0.42, 0.6, 0.55, mat(0xe5e7eb), l / 2 - 0.3, 0, 0, g); // caisson
    if (ecran) {
      const n = double ? [-0.3, 0.3] : [0];
      for (const dx of n) { b(0.56, 0.34, 0.03, mat(NOIR), dx, 0.86, -p / 2 + 0.2, g); b(0.52, 0.29, 0.005, mat(0x3b82f6, { emissive: 0x1e3a8a, emissiveIntensity: 0.35 }), dx, 0.885, -p / 2 + 0.2165, g, false); b(0.05, 0.12, 0.05, mat(NOIR), dx, 0.75, -p / 2 + 0.18, g, false); b(0.2, 0.01, 0.15, mat(NOIR), dx, 0.75, -p / 2 + 0.18, g, false); }
      b(0.45, 0.02, 0.15, mat(0xe5e7eb), 0, 0.75, 0.05, g, false); // clavier
    }
    return g;
  }
  function fauteuil(x, z, rot, c = FONCE) { // fauteuil de bureau ; la personne regarde vers -z local
    const g = groupe(x, z, rot);
    cyl(0.28, 0.04, NOIR, 0, 0.02, 0, g, 5); cyl(0.03, 0.38, GRIS, 0, 0.05, 0, g, 8);
    b(0.5, 0.08, 0.48, c, 0, 0.43, 0, g); b(0.46, 0.5, 0.07, c, 0, 0.52, 0.24, g);
    return g;
  }
  function chaise(x, z, rot, c = 0x0f766e) { // chaise visiteur 4 pieds
    const g = groupe(x, z, rot);
    for (const sx of [-0.19, 0.19]) for (const sz of [-0.19, 0.19]) b(0.03, 0.43, 0.03, mat(GRIS), sx, 0, sz, g, false);
    b(0.46, 0.05, 0.46, c, 0, 0.43, 0, g); b(0.44, 0.4, 0.04, c, 0, 0.5, 0.22, g);
    return g;
  }
  function armoire(x, z, rot, l = 1.6, h = 1.25, avecDossiers = true) {
    const g = groupe(x, z, rot);
    b(l, h, 0.05, mat(0xd1d5db), 0, 0, -0.2, g);
    for (const s of [-1, 1]) b(0.04, h, 0.45, mat(0xd1d5db), s * (l / 2 - 0.02), 0, 0, g);
    for (const yy of [0, h / 3, (2 * h) / 3, h - 0.03]) b(l, 0.03, 0.45, mat(0xd1d5db), 0, yy, 0, g, false);
    if (avecDossiers) {
      const C = [0x1e3a8a, 0xb91c1c, 0x15803d, 0xd97706, 0x6b21a8, 0x0f766e];
      for (let r = 0; r < 3; r++) for (let k = 0; k < Math.floor((l - 0.12) / 0.09); k++) b(0.075, h / 3 - 0.1, 0.32, mat(C[(k + r * 2) % C.length]), -l / 2 + 0.1 + k * 0.09, r * (h / 3) + 0.03, 0.02, g, false);
    }
    return g;
  }
  const plante = (x, z, s = 1) => { const g = groupe(x, z); cyl(0.16 * s, 0.32 * s, 0xe7e5e4, 0, 0, 0, g); const f = new THREE.Mesh(new THREE.SphereGeometry(0.3 * s, 14, 10), mat(0x3f7d4f)); f.position.y = 0.6 * s; f.scale.y = 1.3; f.castShadow = true; g.add(f); };
  const imprimante = (x, z, rot) => { const g = groupe(x, z, rot); b(0.6, 0.85, 0.55, mat(0xe5e7eb), 0, 0, 0, g); b(0.5, 0.08, 0.4, mat(0x6b7280), 0, 0.85, 0, g, false); };

  // Palier : arrivée de l'escalier, plante, extincteur, plan d'évacuation
  plante(4.75, 5.4, 0.9);
  cyl(0.08, 0.45, 0xb91c1c, 2.35, Y + 0.25, -0.75, G);
  // Sanitaires : deux cabines + lavabos
  for (const x0 of [5.3, 6.4]) b(0.04, 1.2, 1.5, mat(0xd1d5db), x0, Y, 5.1);
  b(2.2, 1.2, 0.04, mat(0xd1d5db), 6.35, Y, 4.35, G); // façade des cabines (portes fermées)
  for (const x of [5.85, 6.95]) { b(0.38, 0.4, 0.55, mat(0xffffff), x, Y, 5.5); b(0.4, 0.45, 0.15, mat(0xffffff), x, Y, 5.8, G); }
  b(0.5, 0.82, 1.6, mat(0xffffff), 7.15, Y, 2.4); b(0.05, 0.6, 1.4, mat(0xdbeafe, { roughness: 0.1, metalness: 0.3 }), 7.4, Y + 0.85, 2.4, G, false); // vasques et miroir
  // Bureau RH : entretiens d'embauche
  bureau(10, 3.85, 0, { l: 1.7 });
  fauteuil(10, 4.6, 0);
  chaise(9.55, 3.0, Math.PI); chaise(10.45, 3.0, Math.PI);
  armoire(7.84, 3.6, Math.PI / 2, 2.0);
  plante(12.05, 5.45);
  b(0.9, 0.6, 0.45, mat(0xe5e7eb), 11.9, Y, 1.5); // petit meuble bas
  // Comptabilité : 2 postes avec écrans
  bureau(14.1, 2.9, 0, { double: true }); fauteuil(14.1, 3.6, 0);
  bureau(16.6, 2.9, 0, { double: true }); fauteuil(16.6, 3.6, 0);
  armoire(15.2, 5.6, Math.PI, 3.2, 0.8);          // rangements bas sous la fenêtre
  imprimante(17.4, 1.5, 0);
  // Open space : îlot de 4 postes + reprographie + coin
  for (const x of [4.3, 6.05]) { bureau(x, -6.0, 0, { l: 1.7 }); fauteuil(x, -5.3, 0); bureau(x, -6.8, Math.PI, { l: 1.7 }); fauteuil(x, -7.5, Math.PI); }
  imprimante(8.4, -9.3, 0); armoire(6.9, -9.62, 0, 2.2, 1.25);
  plante(2.6, -1.6); plante(8.5, -1.6, 0.8);
  // Archives / serveur
  { const g = groupe(9.5, -3.9); b(0.65, 1.32, 0.9, mat(0x1f2937), 0, 0, 0, g); for (let k = 0; k < 7; k++) b(0.5, 0.03, 0.01, mat(k % 3 ? 0x22c55e : 0x60a5fa, { emissive: k % 3 ? 0x16a34a : 0x2563eb, emissiveIntensity: 0.9 }), 0, 0.2 + k * 0.15, 0.455, g, false); }
  armoire(11.7, -2.8, -Math.PI / 2, 2.6, 1.3);
  b(0.8, 0.5, 0.6, mat(0xc8a97e), 10.2, Y, -2.0); // cartons d'archives
  b(0.6, 0.3, 0.4, mat(0xb08d64), 10.2, Y + 0.5, -2.0, G);
  // Bureau du gérant adjoint
  bureau(15.9, -3.1, 0, { l: 1.7 }); fauteuil(15.9, -2.35, 0); chaise(15.4, -3.95, Math.PI, 0x475569); chaise(16.4, -3.95, Math.PI, 0x475569);
  armoire(17.65, -2.2, -Math.PI / 2, 1.6);
  // Salle de réunion : table de 8, écran mural
  const TXr = 13.8, TZr = -7.25;
  b(3.8, 0.05, 1.4, mat(BOIS), TXr, Y + 0.71, TZr);
  for (const dx of [-1.4, 1.4]) b(0.12, 0.71, 0.9, mat(FONCE), TXr + dx, Y, TZr);
  const reunion = [];
  for (const dx of [-1.2, 0, 1.2]) for (const s of [-1, 1]) { chaise(TXr + dx, TZr + s * 1.05, s > 0 ? 0 : Math.PI, 0x334155); reunion.push(new THREE.Vector3(TXr + dx, Y, TZr + s * 1.05)); }
  for (const s of [-1, 1]) { chaise(TXr + s * 2.3, TZr, s > 0 ? Math.PI / 2 : -Math.PI / 2, 0x334155); reunion.push(new THREE.Vector3(TXr + s * 2.3, Y, TZr)); }
  // écran sur la cloison ouest (face à la table)
  b(0.06, 0.95, 1.9, mat(NOIR), 9.12, Y + 0.38, TZr); b(0.01, 0.85, 1.78, mat(0x1e3a8a, { emissive: 0x1e40af, emissiveIntensity: 0.45 }), 9.155, Y + 0.43, TZr, G, false);
  b(0.4, 0.55, 1.6, mat(0xe5e7eb), 9.3, Y, TZr); // meuble technique sous l'écran
  plante(17.5, -9.5); b(1.4, 0.8, 0.45, mat(0xe5e7eb), 13.8, Y, -9.6); // desserte

  // ---------- Escalier complet du rez-de-chaussée à l'étage ----------
  // 17 hauteurs de 17,6 cm, 16 girons de 27 cm : de z 5,62 (en bas, y 0,2) à z 1,3 (bord de dalle, y 3,2)
  const NM = 17, r = (Y - 0.2) / NM, giron = 0.27, EL = 1.9, EX = TX0 + EL / 2; // x 2,15 → 4,05
  for (let k = 0; k < NM - 1; k++) {
    const zc = TZ + (NM - 2 - k) * giron + giron / 2, top = 0.2 + r * (k + 1);
    b(EL, top - 0.2 - 0.03, giron, mat(0xd6d3d1), EX, 0.2, zc, ESC);         // béton
    b(EL + 0.02, 0.03, giron + 0.03, mat(BOIS_C), EX, top - 0.03, zc - 0.015, ESC); // marche bois
    b(EL, 0.012, 0.03, mat(0x4b5563), EX, top - 0.012, zc - giron / 2 + 0.02, ESC, false); // nez antidérapant
  }
  const pente = Math.atan2(r, giron), longueur = Math.hypot((NM - 1) * giron, Y - 0.2 - r);
  const incline = (l, h, p, m, x, y, z, parent) => { const o = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), mat(m)); o.position.set(x, y, z); o.rotation.x = pente; o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const zBas = TZ + (NM - 1) * giron, yBas = 0.2 + r, xRamp = EX + EL / 2 - 0.05;
  // main courante côté vide : poteaux, lisse et main courante inclinées
  const HR = 0.92;
  for (let k = 0; k < NM - 1; k += 3) { const zc = TZ + (NM - 2 - k) * giron + giron / 2, top = 0.2 + r * (k + 1); b(0.04, HR, 0.04, mat(0x4b5563), xRamp, top, zc, ESC, false); }
  b(0.05, HR + 0.05, 0.05, mat(0x4b5563), xRamp, 0.2 + r * NM, TZ + 0.1, ESC, false);
  const zm = (zBas + TZ) / 2, ym = (yBas + Y) / 2;
  incline(0.06, 0.05, longueur + 0.3, 0x4b5563, xRamp, ym + HR, zm, ESC);
  incline(0.03, 0.03, longueur, 0x6b7280, xRamp, ym + HR / 2, zm, ESC);
  const vitreR = new THREE.Mesh(new THREE.BoxGeometry(0.02, HR - 0.15, longueur - 0.2), verre); vitreR.position.set(xRamp, ym + HR / 2, zm); vitreR.rotation.x = pente; ESC.add(vitreR);
  // main courante côté mur (les murs du rez-de-chaussée sont coupés : elle est portée par des poteaux)
  const xMur = TX0 + 0.08;
  for (let k = 0; k < NM - 1; k += 3) { const zc = TZ + (NM - 2 - k) * giron + giron / 2, top = 0.2 + r * (k + 1); b(0.04, HR, 0.04, mat(0x6b7280), xMur, top, zc, ESC, false); }
  incline(0.05, 0.05, longueur + 0.3, 0x6b7280, xMur, ym + HR, zm, ESC);
  // garde-corps du palier autour de la trémie (verre + main courante)
  const gcx = TX1 + 0.03, gz0 = TZ, gz1 = Z1 - EP / 2;
  b(0.06, 0.05, gz1 - gz0, mat(0x4b5563), gcx, Y + 1.0, (gz0 + gz1) / 2, G, false);
  b(0.02, 0.85, gz1 - gz0 - 0.1, verre, gcx, Y + 0.08, (gz0 + gz1) / 2, G, false);
  for (let z = gz0 + 0.03; z <= gz1; z += (gz1 - gz0 - 0.06) / 4) b(0.05, 1.02, 0.05, mat(0x4b5563), gcx, Y, z, G, false);
  b(0.1, 0.1, gz1 - gz0, mat(0x9ca3af), gcx, Y, (gz0 + gz1) / 2, G, false); // plinthe
  // bande podotactile en haut de l'escalier
  b(EL, 0.01, 0.4, mat(0xe5e7eb), EX, Y, TZ - 0.4, G, false);

  // ---------- Zones cliquables, postes ----------
  const Z = {
    'etage-rh': [5, Z1 - EP / 2 - 1, 10, (1 + Z1 - EP / 2) / 2],
    'etage-compta': [X1 - EP / 2 - 12.5, Z1 - EP / 2 - 1, (12.5 + X1 - EP / 2) / 2, (1 + Z1 - EP / 2) / 2],
    'etage-reunion': [X1 - EP / 2 - 9, -4.5 - (Z0 + EP / 2), (9 + X1 - EP / 2) / 2, (-4.5 + Z0 + EP / 2) / 2],
  };
  const zones = {}, zonesMesh = [];
  for (const [cle, [l, p, x, z]] of Object.entries(Z)) { const m = zone(l, p, x, z, cle, Y + 0.02); if (m) { m.parent?.remove(m); G.add(m); zonesMesh.push(m); } zones[cle] = [x, z]; }
  const postes = {
    rh: new THREE.Vector3(10, Y, 4.6),
    rhVisiteur: new THREE.Vector3(9.55, Y, 3.0),
    rhVisiteur2: new THREE.Vector3(10.45, Y, 3.0),
    compta1: new THREE.Vector3(14.1, Y, 3.6),
    compta2: new THREE.Vector3(16.6, Y, 3.6),
    gerantAdjoint: new THREE.Vector3(15.9, Y, -2.35),
    openSpace: [new THREE.Vector3(4.3, Y, -5.3), new THREE.Vector3(6.05, Y, -5.3), new THREE.Vector3(4.3, Y, -7.5), new THREE.Vector3(6.05, Y, -7.5)],
    reunion,
    palier: new THREE.Vector3(3.4, Y, 0.3),
  };

  // ombres : tout projette et reçoit
  G.traverse((o) => { if (o.isMesh && o.material !== verre && !o.material.map) o.receiveShadow = true; });
  const montrer = (oui) => { G.visible = !!oui; };
  return { groupe: G, montrer, postes, zones, escalier: ESC };
}
