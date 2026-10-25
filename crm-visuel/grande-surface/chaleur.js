// Carte de chaleur de l'affluence et parcours des clients (démo « Hyper Modèle »)
// Module ES sans import : on lui passe THREE.
//   const ch = creerChaleur({ THREE, scene, boucles });
//   ch.ajouter(points, poids, age) // positions réelles des clients simulés (Vector3), poids = secondes écoulées, age = il y a combien de minutes
//   ch.minute(m)                // fait glisser la fenêtre (m = minute de démo), garde les 30 dernières minutes
//   ch.dessiner()               // recalcule la texture (appelé quelques fois par seconde quand elle est visible)
//   ch.montrer(oui) / ch.parcours(oui) / ch.vider()
//   ch.zones()                  // [{ x, z, part }] : les endroits les plus fréquentés (part de la présence totale)
// Surface couverte : la surface de vente (x de -40 à 2, z de -27 à 3), maille de 50 cm.

export function creerChaleur({ THREE, scene, boucles }) {
  const X0 = -40, Z0 = -27, L = 42, P = 30, PAS = 0.5, NX = L / PAS, NZ = P / PAS, FENETRE = 30;
  const seaux = Array.from({ length: FENETRE }, () => new Float32Array(NX * NZ));
  const somme = new Float32Array(NX * NZ);
  let courant = 0, derniere = null;
  // noyau gaussien 7 × 7 (sigma 1,6 maille, soit 80 cm)
  const R = 3, NOYAU = [];
  for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) NOYAU.push([i, j, Math.exp(-(i * i + j * j) / (2 * 1.6 * 1.6))]);

  function ajouter(points, poids = 1, age = 0) {
    const s = seaux[(courant - Math.min(FENETRE - 1, age) + FENETRE) % FENETRE];
    for (const p of points) {
      const ci = Math.floor((p.x - X0) / PAS), cj = Math.floor((p.z - Z0) / PAS);
      if (ci < -R || cj < -R || ci >= NX + R || cj >= NZ + R) continue;
      for (const [di, dj, k] of NOYAU) {
        const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= NX || j >= NZ) continue;
        const n = j * NX + i, v = k * poids; s[n] += v; somme[n] += v;
      }
    }
  }
  function minute(m) {
    if (derniere === null) { derniere = m; return; }
    let pas = m - derniere; if (pas <= 0) { if (pas < 0) vider(); derniere = m; return; }
    pas = Math.min(pas, FENETRE);
    for (let k = 0; k < pas; k++) { courant = (courant + 1) % FENETRE; const s = seaux[courant]; for (let n = 0; n < s.length; n++) { somme[n] -= s[n]; s[n] = 0; } }
    for (let n = 0; n < somme.length; n++) if (somme[n] < 1e-6) somme[n] = 0;
    derniere = m;
  }
  function vider() { for (const s of seaux) s.fill(0); somme.fill(0); derniere = null; }

  // texture : bleu (faible) -> jaune -> rouge (forte), transparente là où personne ne passe
  const toile = document.createElement('canvas'); toile.width = NX; toile.height = NZ;
  const g2 = toile.getContext('2d'), img = g2.createImageData(NX, NZ);
  const tex = new THREE.CanvasTexture(toile); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter;
  const RAMPE = [[0, [37, 99, 235]], [0.35, [6, 182, 212]], [0.6, [250, 204, 21]], [0.8, [249, 115, 22]], [1, [220, 38, 38]]];
  function couleur(v) {
    for (let k = 1; k < RAMPE.length; k++) if (v <= RAMPE[k][0]) { const [a, ca] = RAMPE[k - 1], [b, cb] = RAMPE[k], f = (v - a) / (b - a); return ca.map((c, i) => c + (cb[i] - c) * f); }
    return RAMPE[RAMPE.length - 1][1];
  }
  let maxi = 0;
  function dessiner() {
    maxi = 0; for (let n = 0; n < somme.length; n++) if (somme[n] > maxi) maxi = somme[n];
    const d = img.data;
    for (let n = 0; n < somme.length; n++) {
      const v = maxi ? Math.pow(somme[n] / maxi, 0.45) : 0, [r, g, b] = couleur(v);
      d[n * 4] = r; d[n * 4 + 1] = g; d[n * 4 + 2] = b; d[n * 4 + 3] = v < 0.05 ? (v / 0.05) * 80 : Math.min(225, 95 + v * 130);
    }
    g2.putImageData(img, 0, 0); tex.needsUpdate = true;
  }
  const plan = new THREE.Mesh(new THREE.PlaneGeometry(L, P), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  plan.rotation.x = -Math.PI / 2; plan.position.set(X0 + L / 2, 0.235, Z0 + P / 2); plan.renderOrder = 2; plan.visible = false; scene.add(plan);

  // parcours : les boucles réellement suivies par les clients, en pointillés avec le sens de marche
  const traces = new THREE.Group(); traces.visible = false; scene.add(traces);
  const matLigne = new THREE.LineDashedMaterial({ color: 0x1e3a8a, dashSize: 0.7, gapSize: 0.45, transparent: true, opacity: 0.9, depthWrite: false });
  const fleche = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0.45), new THREE.Vector2(0.32, -0.25), new THREE.Vector2(-0.32, -0.25)]));
  fleche.rotateX(-Math.PI / 2);
  const matFleche = new THREE.MeshBasicMaterial({ color: 0x1e3a8a, side: THREE.DoubleSide, depthWrite: false });
  for (const b of boucles) {
    const pts = b.getSpacedPoints(240).map((p) => new THREE.Vector3(p.x, 0.32, p.z));
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), matLigne); l.computeLineDistances(); l.renderOrder = 3; traces.add(l);
    for (const u of [0.1, 0.35, 0.6, 0.85]) {
      const p = b.getPointAt(u), tg = b.getTangentAt(u), m = new THREE.Mesh(fleche, matFleche);
      m.position.set(p.x, 0.33, p.z); m.rotation.y = Math.atan2(tg.x, tg.z) + Math.PI; m.renderOrder = 3; traces.add(m);
    }
  }

  function zones(n = 3) {
    // les mailles les plus chargées, regroupées à 4 m près
    let tot = 0; for (const v of somme) tot += v; if (!tot) return [];
    const idx = [...somme.keys()].sort((a, b) => somme[b] - somme[a]), res = [];
    for (const k of idx) {
      if (res.length >= n || somme[k] <= 0) break;
      const x = X0 + ((k % NX) + 0.5) * PAS, z = Z0 + (Math.floor(k / NX) + 0.5) * PAS;
      if (res.some((r) => Math.hypot(r.x - x, r.z - z) < 4)) continue;
      let part = 0; for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) { const ii = (k % NX) + i, jj = Math.floor(k / NX) + j; if (ii >= 0 && jj >= 0 && ii < NX && jj < NZ) part += somme[jj * NX + ii]; }
      res.push({ x, z, part: part / tot });
    }
    return res;
  }

  return {
    ajouter, minute, dessiner, vider, zones,
    montrer(oui) { plan.visible = oui; if (oui) dessiner(); },
    parcours(oui) { traces.visible = oui; },
    get visible() { return plan.visible; },
    get total() { let s = 0; for (const v of somme) s += v; return s; },
  };
}
