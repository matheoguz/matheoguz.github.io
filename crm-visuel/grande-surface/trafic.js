// Trafic du parking clients et de la route : des voitures arrivent par la route, entrent, roulent dans l'allée,
// se garent en marche avant ; d'autres sortent de leur place en marche arrière (en deux temps), puis repartent
// par l'allée, l'entrée et la route. Quelques voitures passent aussi sur la route sans entrer.
// Module sans import : THREE et les aides de la maquette sont passés dans ctx.
// creerTrafic({ THREE, scene, PLACES, voiture, couleurs, graine? })
//   → { maj(dt), viser(n), placerDirect(n), occupees(), voitures, etat() }
// Même approche que la démo auto-école : courbes Catmull-Rom centripètes (virages arrondis), parcourues à vitesse
// constante avec accélération et freinage doux, orientation sur la tangente.
export function creerTrafic(ctx) {
  const { THREE, scene, PLACES, voiture, couleurs } = ctx;

  // ---- Repères (ceux de index.html) ----
  const ALLEE = 15.5;              // milieu de l'allée entre les deux rangées (rangées à z 11,4 et 19,6)
  const EX = 30;                   // milieu de l'entrée du parking (boîte 6 × 6 en x 27 → 33, z 18 → 24)
  const VOIE_O = 27, VOIE_E = 31;  // route : voie vers l'ouest (côté parking) et voie vers l'est (on roule à droite)
  const BOUT = 48;                 // les voitures naissent et disparaissent hors du socle (x ±46)
  const Y = PLACES[0].y;
  const HL = 2.13, HW = 0.94;      // demi-longueur et demi-largeur d'une voiture
  // vitesses en m/s (allée lente, route plus rapide), accélérations en m/s²
  const V_PARC = 3.5, V_ROUTE = 11, V_RECUL = 1.2, ALAT = 2, FREIN = 1.6, ACC = 1.8;
  const MAX_ROULENT = 3;           // voitures du parking qui roulent en même temps (hors circulation)
  // places des deux bouts laissées libres : à l'est, trop près du virage d'entrée pour s'y garer en marche avant ;
  // à l'ouest, pas la place de braquer en sortant sans frôler la voisine ni mordre sur la pelouse
  const EXCLUES = new Set([0, 21, 22, 43]);

  // hasard reproductible
  let graine = (ctx.graine ?? 20261022) >>> 0;
  const rng = () => { graine = (graine + 0x6d2b79f5) >>> 0; let t = graine; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // ---- Tracés : lignes droites + virages en arc de cercle, lissés par une Catmull-Rom centripète ----
  function trace(pts, rayons = []) {
    const out = [];
    const add = (x, z) => { const l = out[out.length - 1]; if (!l || Math.hypot(l.x - x, l.z - z) > 0.05) out.push(new THREE.Vector3(x, Y, z)); };
    let cx = pts[0][0], cz = pts[0][1]; add(cx, cz);
    const droite = (x, z) => { const d = Math.hypot(x - cx, z - cz), n = Math.max(1, Math.ceil(d / 1)); for (let k = 1; k <= n; k++) add(cx + ((x - cx) * k) / n, cz + ((z - cz) * k) / n); cx = x; cz = z; };
    for (let i = 1; i < pts.length; i++) {
      const [px, pz] = pts[i], R = rayons[i];
      if (i === pts.length - 1 || !R) { droite(px, pz); continue; }
      const [qx, qz] = pts[i - 1], [nx, nz] = pts[i + 1];
      let ax = px - qx, az = pz - qz, la = Math.hypot(ax, az); ax /= la; az /= la;
      let bx = nx - px, bz = nz - pz, lb = Math.hypot(bx, bz); bx /= lb; bz /= lb;
      const phi = Math.acos(Math.max(-1, Math.min(1, ax * bx + az * bz)));
      if (phi < 1e-3) { droite(px, pz); continue; }
      const t = R * Math.tan(phi / 2), s = Math.sign(ax * bz - az * bx);
      const sx = px - ax * t, sz = pz - az * t;
      droite(sx, sz);
      const ox = sx - s * az * R, oz = sz + s * ax * R; // centre du virage
      const a0 = Math.atan2(sz - oz, sx - ox), n = Math.max(3, Math.ceil((R * phi) / 0.3));
      for (let k = 1; k <= n; k++) { const a = a0 + (s * phi * k) / n; add(ox + R * Math.cos(a), oz + R * Math.sin(a)); }
      cx = px + bx * t; cz = pz + bz * t;
    }
    return out;
  }
  const PAS = 0.25;
  const REG = { PIV: 0, DECAL: 0, R_PLACE: 3.3, ...(ctx.reglages || {}) }, PIV = REG.PIV;
  const fond = (p) => [p.x, p.z + (p.z < ALLEE ? PIV : -PIV)]; // essieu arrière quand la voiture est garée
  // un trajet : courbe, longueur, profil de vitesse (virages, zone, arrêt au bout), points où céder le passage
  function chemin(points, { recul = false, arret = true, cedez = [] } = {}) {
    let Lp = 0; for (let i = 1; i < points.length; i++) Lp += points[i].distanceTo(points[i - 1]);
    const c = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    c.arcLengthDivisions = Math.max(200, Math.ceil(Lp / 0.1));
    const L = c.getLength(), n = Math.max(2, Math.ceil(L / PAS)), prof = new Float32Array(n + 1), pos = [];
    const tg = [];
    for (let i = 0; i <= n; i++) { const u = i / n; pos.push(c.getPointAt(u)); tg.push(c.getTangentAt(Math.min(u, 0.9999))); }
    const ds = L / n;
    for (let i = 0; i <= n; i++) {
      const a = tg[Math.max(0, i - 1)], b = tg[Math.min(n, i + 1)], da = Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.z * b.z)));
      const k = da / (ds * (Math.min(n, i + 1) - Math.max(0, i - 1)));
      const vz = recul ? V_RECUL : pos[i].z > 24.6 ? V_ROUTE : V_PARC;
      prof[i] = Math.min(vz, k > 1e-4 ? Math.sqrt(ALAT / k) : vz);
    }
    if (arret) prof[n] = 0;
    for (let i = n - 1; i >= 0; i--) prof[i] = Math.min(prof[i], Math.sqrt(prof[i + 1] * prof[i + 1] + 2 * FREIN * ds));
    // point d'arrêt pour céder le passage : premier point du trajet qui vérifie la condition
    const cedes = cedez.map((cd) => { const i = pos.findIndex(cd.ou); return { ...cd, s: i < 0 ? -1 : i * ds }; });
    return { c, L, recul, arret, prof, ds, n, cedes, v: (s) => { const f = Math.min(n, Math.max(0, s / ds)), i = Math.min(n - 1, Math.floor(f)); return prof[i] + (prof[i + 1] - prof[i]) * (f - i); } };
  }
  function pose(seg, s, p = {}) {
    const u = Math.min(1, Math.max(0, s / seg.L)), pt = seg.c.getPointAt(u), t = seg.c.getTangentAt(Math.min(u, 0.9999));
    p.rot = seg.recul ? Math.atan2(-t.x, -t.z) : Math.atan2(t.x, t.z);
    // le tracé est celui de l'essieu arrière (comme une vraie voiture) : la caisse est PIV m plus loin vers l'avant
    p.x = pt.x + Math.sin(p.rot) * PIV; p.z = pt.z + Math.cos(p.rot) * PIV;
    return p;
  }

  // ---- Collisions : rectangles orientés (séparation des axes) ----
  function chevauche(a, b) {
    const ca = Math.cos(a.rot), sa = Math.sin(a.rot), cb = Math.cos(b.rot), sb = Math.sin(b.rot);
    // axe avant (sin r, cos r), axe de côté (cos r, -sin r)
    const axes = [[sa, ca], [ca, -sa], [sb, cb], [cb, -sb]];
    const dx = b.x - a.x, dz = b.z - a.z;
    for (const [ux, uz] of axes) {
      const ra = a.hl * Math.abs(sa * ux + ca * uz) + a.hw * Math.abs(ca * ux - sa * uz);
      const rb = b.hl * Math.abs(sb * ux + cb * uz) + b.hw * Math.abs(cb * ux - sb * uz);
      if (Math.abs(dx * ux + dz * uz) > ra + rb) return false;
    }
    return true;
  }

  // ---- Les voitures ----
  const voitures = [];
  let nId = 0, horloge = 0;
  function prendre() {
    let v = voitures.find((x) => x.etat === 'libre');
    if (!v) {
      const o = voiture(couleurs[nId % couleurs.length]); o.visible = false; scene.add(o);
      v = { o, id: nId++, etat: 'libre' }; voitures.push(v);
    }
    Object.assign(v, { type: null, place: -1, segs: [], k: 0, s: 0, v: 0, pause: 0, x: 0, z: 0, rot: 0, vcap: V_ROUTE, sorti: false, bloque: 0, croiseE: false, avantCede: false });
    if (v.o.userData.peindre) v.o.userData.peindre(couleurs[Math.floor(rng() * couleurs.length)]); // voiture dessinée en instances (rendu.js)
    else v.o.traverse((m) => { if (m.isMesh && m.geometry.type === 'ExtrudeGeometry' && m.material.metalness > 0.2) m.material = matCaisse(couleurs[Math.floor(rng() * couleurs.length)], m.material); });
    return v;
  }
  // une couleur au hasard à chaque voiture (matériau partagé par couleur)
  const matsCaisse = new Map();
  function matCaisse(c, base) { if (!matsCaisse.has(c)) { const m = base.clone(); m.color.setHex(c); matsCaisse.set(c, m); } return matsCaisse.get(c); }
  function liberer(v) { v.etat = 'libre'; v.o.visible = false; if (v.place >= 0 && occupant[v.place] === v) occupant[v.place] = null; v.place = -1; }
  const occupant = PLACES.map(() => null);
  const rotGaree = (i) => (PLACES[i].z < ALLEE ? Math.PI : 0); // garée en marche avant : le nez vers le bord du parking

  function hauteur(x, z) { // le trottoir (z 23,4 → 25, 7 cm plus haut) : petite montée douce
    const m = (a, b, t) => Math.min(1, Math.max(0, (t - a) / (b - a)));
    return Y + 0.07 * Math.min(m(23.0, 23.4, z), 1 - m(25.0, 25.4, z));
  }
  function afficher(v) {
    v.o.position.set(v.x, hauteur(v.x, v.z), v.z); v.o.rotation.y = v.rot;
    const f = Math.min(1, Math.max(0, (46.3 - Math.abs(v.x)) / 2.5)); // fondu aux bouts de la route
    v.o.scale.setScalar(Math.max(f, 0.001)); v.o.visible = f > 0.02;
  }
  function garer(v, i) {
    v.etat = 'garee'; v.place = i; occupant[i] = v; v.depuis = horloge; v.segs = [];
    v.x = PLACES[i].x; v.z = PLACES[i].z; v.rot = rotGaree(i); afficher(v);
  }

  // voie occupée : une voiture qui roule sur cette voie, dans son sens, entre x0 et x1
  const surVoie = (moi, voie, sens, x0, x1) => voitures.some((o) => o !== moi && o.etat === 'roule' && Math.abs(o.z - voie) < 1.6 && Math.sin(o.rot) * sens > 0.7 && o.x >= x0 && o.x <= x1);
  const CEDE_O = (x0, x1) => (moi) => surVoie(moi, VOIE_O, -1, x0, x1);
  const CEDE_E = (x0, x1) => (moi) => surVoie(moi, VOIE_E, 1, x0, x1);

  // ---- Trajets ----
  // Pour entrer dans une place ou en sortir, on se décale vers le côté opposé de l'allée : le virage est plus large
  // et la voiture ne frôle pas ses voisines.
  const { DECAL, R_PLACE } = REG;
  const ligneAllee = (p) => ALLEE + (p.z < ALLEE ? DECAL : -DECAL);
  function trajetArrivee(i, depuisEst) {
    const p = PLACES[i], A2 = ligneAllee(p);
    const debut = depuisEst ? [[BOUT, VOIE_O], [EX, VOIE_O]] : [[-BOUT, VOIE_E], [EX, VOIE_E]];
    const pts = [...debut, [EX, 22.4], [25, 20], [25, A2], [p.x, A2], fond(p)];
    const R = [0, depuisEst ? 3 : 4, 2.5, 2.5, 2.3, R_PLACE];
    // venant de l'ouest, on tourne à gauche : on laisse passer ceux qui viennent en face
    const cedez = depuisEst ? [] : [{ ou: (q) => q.x > 25, libre: CEDE_O(24, 52) }];
    return [chemin(trace(pts, R), { cedez })];
  }
  function trajetDepart(i, versEst) {
    const p = PLACES[i], A2 = ligneAllee(p), Rr = R_PLACE;
    // 1) recule tout droit hors de la place, 2) continue à reculer en braquant : le nez se tourne vers la sortie
    const recul = chemin(trace([fond(p), [p.x, A2], [p.x - Rr, A2]], [0, Rr]), { recul: true });
    const fin = versEst ? [[EX, VOIE_E], [BOUT, VOIE_E]] : [[EX, VOIE_O], [-BOUT, VOIE_O]];
    const pts = [[p.x - Rr, A2], [25, A2], [25, 20], [EX, 22.4], ...fin];
    const R = [0, 2.3, 2.5, 2.5, versEst ? 4 : 3];
    const cede = versEst ? (moi) => CEDE_O(26, 52)(moi) || CEDE_E(4, 33)(moi) : CEDE_O(27, 52);
    const avant = chemin(trace(pts, R), { arret: false, cedez: [{ ou: (q) => q.z > 22.8, libre: cede }] });
    return [recul, avant];
  }
  const ROUTE_O = chemin(trace([[BOUT, VOIE_O], [-BOUT, VOIE_O]]), { arret: false });
  const ROUTE_E = chemin(trace([[-BOUT, VOIE_E], [BOUT, VOIE_E]]), { arret: false });

  function demarrer(v, type, segs) {
    v.etat = 'roule'; v.type = type; v.segs = segs; v.k = 0; v.s = 0; v.v = type === 'depart' ? 0 : v.vcap * 0.8;
    pose(segs[0], 0, v); afficher(v);
  }
  const departLibre = (x, voie) => !voitures.some((o) => o.etat === 'roule' && Math.abs(o.z - voie) < 1.6 && Math.abs(o.x - x) < 12);

  function lancerArrivee() {
    const libres = PLACES.map((_, i) => i).filter((i) => !occupant[i] && !EXCLUES.has(i));
    if (!libres.length) return false;
    // près de la porte du magasin (x ≈ -10) de préférence, avec du hasard
    libres.sort((a, b) => Math.abs(PLACES[a].x + 10) + rng() * 28 - (Math.abs(PLACES[b].x + 10) + rng() * 28));
    let est = rng() < 0.5;
    if (!departLibre(est ? BOUT : -BOUT, est ? VOIE_O : VOIE_E)) { est = !est; if (!departLibre(est ? BOUT : -BOUT, est ? VOIE_O : VOIE_E)) return false; }
    const v = prendre(), i = libres[0];
    v.vcap = 9 + rng() * 2; v.place = i; occupant[i] = v;
    v.croiseE = !est; demarrer(v, 'arrivee', trajetArrivee(i, est));
    return true;
  }
  function lancerDepart() {
    // une voiture qui sort déjà roule vers l'est dans l'allée : on ne recule que derrière elle (à l'ouest)
    const sortantes = voitures.filter((v) => v.etat === 'roule' && v.type === 'depart' && !v.sorti);
    const garees = voitures.filter((v) => v.etat === 'garee' && sortantes.every((o) => o.k > 0 && o.x > PLACES[v.place].x + 7));
    if (!garees.length) return false;
    garees.sort((a, b) => (horloge - b.depuis) + rng() * 60 - ((horloge - a.depuis) + rng() * 60));
    const v = garees[0], i = v.place;
    occupant[i] = null; v.place = -1; v.vcap = 9 + rng() * 2;
    v.croiseE = rng() < 0.5; demarrer(v, 'depart', trajetDepart(i, v.croiseE));
    return true;
  }
  function lancerPassage(est) {
    if (!departLibre(est ? BOUT : -BOUT, est ? VOIE_O : VOIE_E)) return false;
    const v = prendre(); v.vcap = 8.5 + rng() * 3;
    demarrer(v, 'passage', [est ? ROUTE_O : ROUTE_E]);
    return true;
  }

  // ---- Avancer une voiture qui roule ----
  const VISEE = [0.2, 0.6, 1.2, 2, 3, 4.5, 6.5, 9, 12, 16, 21, 27, 34];
  const tmp = { hl: HL + 0.15, hw: HW + 0.12 }, autre = { hl: HL, hw: HW };
  function obstacle(v, p) {
    const sens = v.segs[v.k].recul ? -1 : 1, fx = Math.sin(v.rot) * sens, fz = Math.cos(v.rot) * sens;
    // le rectangle « futur » est poussé de 15 cm vers l'avant du mouvement
    const ps = { hl: tmp.hl, hw: tmp.hw, rot: p.rot, x: p.x + Math.sin(p.rot) * sens * 0.15, z: p.z + Math.cos(p.rot) * sens * 0.15 };
    for (const o of voitures) {
      if (o === v || o.etat !== 'roule' || !o.o.visible && Math.abs(o.x) > 47) continue;
      if ((o.x - v.x) * fx + (o.z - v.z) * fz < -0.5) continue; // derrière moi : pas mon problème
      autre.x = o.x; autre.z = o.z; autre.rot = o.rot;
      if (chevauche(ps, autre)) return o;
    }
    return null;
  }
  const fut = {};
  function avancer(v, h) {
    if (v.pause > 0) { v.pause -= h; return; }
    const seg = v.segs[v.k];
    let libre = Infinity;
    const portee = Math.max(3.5, (v.v * v.v) / 3 + 4);
    let avant = 0;
    for (const d of VISEE) {
      if (d > portee) break;
      const sd = Math.min(seg.L, v.s + d); pose(seg, sd, fut);
      if (obstacle(v, fut)) { // on affine la distance libre (pas de saut de vitesse)
        let a = avant, b = d;
        for (let k = 0; k < 5; k++) { const m = (a + b) / 2; pose(seg, Math.min(seg.L, v.s + m), fut); if (obstacle(v, fut)) b = m; else a = m; }
        libre = b; break;
      }
      avant = d;
      if (sd >= seg.L) break;
    }
    v.avantCede = false;
    for (const cd of seg.cedes) if (cd.s >= 0 && v.s < cd.s) { v.avantCede = true; if (cd.libre(v)) libre = Math.min(libre, cd.s - 0.1 - v.s + 0.6); }
    // sur la route : on s'arrête avant le carrefour de l'entrée quand une voiture y tourne
    if (v.type === 'passage') {
      const ouest = v.segs[0] === ROUTE_O, ligne = ouest ? 37.6 : 22.4;
      if (ouest ? v.x > ligne : v.x < ligne) {
        const occupe = voitures.some((o) => o.etat === 'roule' && o.type !== 'passage' && !o.avantCede && o.x > 25.5 && o.x < 35.5 && o.z > 23.5 && o.z < 33 && (ouest || o.croiseE));
        if (occupe) libre = Math.min(libre, Math.abs(v.x - ligne) + 0.6);
      }
    }
    let vt = Math.min(Math.max(seg.v(v.s), 0.35), v.vcap);
    if (libre < Infinity) vt = Math.min(vt, Math.sqrt(3.6 * Math.max(0, libre - 1)));
    v.v = vt > v.v ? Math.min(vt, v.v + ACC * h) : Math.max(vt, v.v - 7 * h);
    let ds = v.v * h;
    if (libre < Infinity) ds = Math.min(ds, Math.max(0, libre - 0.6));
    v.libre = libre; v.bloque = ds < 1e-4 ? v.bloque + h : 0;
    v.s = Math.min(seg.L, v.s + ds);
    pose(seg, v.s, v);
    if (v.type === 'depart' && v.k === v.segs.length - 1 && v.z > 24) v.sorti = true;
    if (v.s >= seg.L - 1e-4) {
      if (v.k < v.segs.length - 1) { v.k++; v.s = 0; v.v = 0; v.pause = 0.5; } // on passe la marche avant
      else if (v.type === 'arrivee') garer(v, v.place);
      else { liberer(v); return; }
    }
    afficher(v);
  }

  // ---- Pilotage ----
  let cible = 0, tLancer = 0;
  const tPassage = [2 + rng() * 4, 5 + rng() * 5];
  const occupees = () => voitures.filter((v) => v.etat === 'garee' || (v.etat === 'roule' && v.type === 'arrivee')).length;
  function viser(n) { cible = Math.max(0, Math.min(PLACES.length - EXCLUES.size, Math.round(n))); }
  function placerDirect(n) {
    for (const v of voitures) if (v.type !== 'passage' || v.etat === 'garee') liberer(v);
    occupant.fill(null);
    viser(n);
    const ordre = PLACES.map((_, i) => i).sort((a, b) => (EXCLUES.has(a) - EXCLUES.has(b)) * 1000 + Math.abs(PLACES[a].x + 10) + rng() * 40 - Math.abs(PLACES[b].x + 10) - rng() * 40);
    for (let k = 0; k < cible; k++) { const v = prendre(); garer(v, ordre[k]); v.depuis = horloge - rng() * 120; }
    tLancer = 1.5;
  }
  function pas(h) {
    horloge += h;
    const roulent = voitures.filter((v) => v.etat === 'roule' && v.type !== 'passage');
    tLancer -= h;
    if (tLancer <= 0 && roulent.length < MAX_ROULENT) {
      const occ = occupees();
      const departsDansParc = roulent.some((v) => v.type === 'depart' && !v.sorti);
      const arrivees = roulent.some((v) => v.type === 'arrivee');
      // l'allée n'a qu'une voie : on fait entrer ou sortir, pas les deux à la fois ; une seule sortie à la fois
      if (cible > occ && !departsDansParc && lancerArrivee()) tLancer = 1.8 + rng() * 2.2;
      else if (cible < occ && !arrivees && lancerDepart()) tLancer = 1.2 + rng() * 1.5;
      else tLancer = 0.5;
    }
    // circulation sur la route, dans les deux sens
    for (let s = 0; s < 2; s++) {
      tPassage[s] -= h;
      if (tPassage[s] <= 0) { const n = voitures.filter((v) => v.etat === 'roule' && v.type === 'passage').length; if (n >= 4 || !lancerPassage(s === 0)) tPassage[s] = 1; else tPassage[s] = 5 + rng() * 9; }
    }
    for (const v of voitures) if (v.etat === 'roule') avancer(v, h);
  }
  function maj(dt) {
    let reste = Math.max(0, Math.min(dt, 0.25));
    while (reste > 1e-6) { const h = Math.min(0.05, reste); pas(h); reste -= h; }
  }
  const etat = () => voitures.filter((v) => v.etat !== 'libre').map((v) => ({ id: v.id, etat: v.etat, type: v.type, place: v.place, x: +v.x.toFixed(3), z: +v.z.toFixed(3), rot: +v.rot.toFixed(4), v: +v.v.toFixed(2), visible: v.o.visible, bloque: +v.bloque.toFixed(2), recul: !!(v.segs[v.k] && v.segs[v.k].recul), libre: v.libre, k: v.k, s: v.s }));
  return { maj, viser, placerDirect, occupees, voitures, etat, dims: { HL, HW } };
}
