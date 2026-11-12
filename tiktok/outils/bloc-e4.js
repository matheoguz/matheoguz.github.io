/* ---------- Épisode 4 : nouveaux éléments ---------- */
lettre3d.visible = false;
piscine.children[0].material = new THREE.MeshStandardMaterial({ color: "#3a9be0", emissive: "#0f4f8a", emissiveIntensity: 0.3, roughness: 0.3 });
// des personnages simples (même style que Malo)
function creerPersonne(o) {
  const g = new THREE.Group(), corps = groupe(); g.add(corps);
  const peau = o.peau || "#e9b48e", jambes = [], bras = [];
  for (const s of [-1, 1]) {
    const j = groupe(s * 0.17, 1.05, 0);
    j.add(pose(bloc(0.26, 0.85, 0.28, o.pantalon, 0.02), 0, -0.43, 0), pose(bloc(0.3, 0.15, 0.44, o.chaussures || "#2a2a2a", 0.02), 0, -0.95, 0.06));
    corps.add(j); jambes.push(j);
  }
  corps.add(pose(bloc(0.74, 0.98, 0.44, o.veste, 0.03), 0, 1.52, 0));
  if (o.chemise) corps.add(pose(bloc(0.2, 0.62, 0.03, o.chemise, 0), 0, 1.68, 0.22));
  if (o.cravate) corps.add(pose(bloc(0.08, 0.5, 0.03, o.cravate, 0), 0, 1.66, 0.24));
  if (o.echarpe) ["#1f3fa8", "#f2f2f2", "#d62828"].forEach((c, i) => corps.add(pose(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.15, 0.03), mat(c)), -0.1 + i * 0.1, 1.5, 0.245, 0, 0, 0.62)));
  for (const s of [-1, 1]) {
    const b = groupe(s * 0.47, 1.96, 0);
    b.add(pose(bloc(0.21, 0.8, 0.24, o.veste, 0.02), 0, -0.38, 0), pose(bloc(0.18, 0.18, 0.18, peau, 0.02), 0, -0.84, 0));
    corps.add(b); bras.push(b);
  }
  if (o.blocNotes) { const bn = groupe(0, -0.85, 0.16); bn.add(pose(bloc(0.36, 0.46, 0.04, "#8a6a42", 0), 0, 0, 0), pose(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.36, 0.01), mat("#f6f1e4")), 0, -0.02, 0.025)); bras[1].add(bn); }
  const tete = groupe(0, 2.02, 0); corps.add(tete);
  tete.add(pose(bloc(0.24, 0.16, 0.24, peau, 0.01), 0, 0.02, 0), pose(bloc(0.62, 0.62, 0.56, peau, 0.03), 0, 0.4, 0));
  tete.add(pose(bloc(0.66, 0.17, 0.6, o.cheveux, 0.03), 0, 0.74, -0.02), pose(bloc(0.66, 0.4, 0.14, o.cheveux, 0.03), 0, 0.55, -0.24));
  if (o.longs) tete.add(pose(bloc(0.7, 0.75, 0.2, o.cheveux, 0.03), 0, 0.3, -0.24));
  const yeux = [-1, 1].map((s) => { const y = pose(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.02), mat("#1b1b1b")), s * 0.14, 0.46, 0.285); tete.add(y); return y; });
  const sourcils = [-1, 1].map((s) => { const y = pose(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.02), mat(o.cheveux)), s * 0.14, 0.58, 0.29); tete.add(y); return y; });
  const bouche = pose(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), mat("#7a3b2a")), 0, 0.26, 0.285); tete.add(bouche);
  if (o.moustache) tete.add(pose(bloc(0.3, 0.07, 0.04, o.cheveux, 0), 0, 0.33, 0.29));
  g.userData = { corps, jambes, bras, tete, yeux, sourcils, bouche };
  g.scale.setScalar(0.72 * (o.taille || 1));
  return ombre(g);
}
const maire = creerPersonne({ veste: "#2c3550", pantalon: "#2c3550", cheveux: "#a3a3a3", chemise: "#f2f2f2", cravate: "#7a1f2b", echarpe: true, moustache: true }); scene.add(maire);
const inspecteur = creerPersonne({ veste: "#c9b48a", pantalon: "#4a4a52", cheveux: "#2b2b2b", chemise: "#dfe6ee", blocNotes: true }); scene.add(inspecteur);
const papa = creerPersonne({ veste: "#3b6ea5", pantalon: "#2b2b33", cheveux: "#3a2a1c" }); scene.add(papa);
const maman = creerPersonne({ veste: "#c2577a", pantalon: "#33476e", cheveux: "#6b3b1f", longs: true }); scene.add(maman);
const gamin = creerPersonne({ veste: "#f2b632", pantalon: "#33476e", cheveux: "#8a5a2b", chaussures: "#d8432f", taille: 0.62 }); scene.add(gamin);
// la voiture de la famille
const voiture = groupe(-24, 0, 0.1); scene.add(voiture);
voiture.add(pose(bloc(2.7, 0.62, 1.35, "#c0392b", 0.03), 0, 0.62, 0), pose(bloc(1.5, 0.52, 1.25, "#a83226", 0.03), -0.15, 1.18, 0));
voiture.add(pose(new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.34, 1.27), mat("#1d2a3a")), -0.15, 1.2, 0));
const roues = [];
for (const x of [-0.85, 0.85]) for (const z of [-0.62, 0.62]) { const r = ombre(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 10), mat("#1b1b1b"))); r.rotation.x = Math.PI / 2; r.position.set(x, 0.3, z); voiture.add(r); roues.push(r); }
for (const z of [-0.42, 0.42]) voiture.add(pose(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.26), new THREE.MeshStandardMaterial({ color: "#fff6c8", emissive: "#fff1b0", emissiveIntensity: 1.5 })), 1.36, 0.66, z));
const phares = new THREE.PointLight("#fff1b0", 0, 7, 1.4); phares.position.set(2.4, 0.8, 0.6); voiture.add(phares);
// la barrière de la piscine
const barriere = groupe(23, 0, 0); scene.add(barriere);
const cote = (x0, x1, z) => { for (let x = x0; x <= x1 + 1e-6; x += 0.45) barriere.add(pose(bloc(0.06, 1.0, 0.06, "#eef1f4", 0), x, 0.5, z)); barriere.add(pose(bloc(x1 - x0 + 0.1, 0.08, 0.08, "#d9dee5", 0), (x0 + x1) / 2, 1.0, z), pose(bloc(x1 - x0 + 0.1, 0.06, 0.06, "#d9dee5", 0), (x0 + x1) / 2, 0.15, z)); };
cote(-3.3, 3.3, 1.5); cote(-3.3, 3.3, -1.8);
for (const x of [-3.3, 3.3]) for (let z = -1.35; z < 1.5; z += 0.45) barriere.add(pose(bloc(0.06, 1.0, 0.06, "#eef1f4", 0), x, 0.5, z));
barriere.scale.y = 0.001;
// les 10 extincteurs
const EXT_X = [...MH_X.map((x) => x + 1.9), -1.6, 19.4, 28.7, 31.9, 45.3];
const extincteurs = EXT_X.map((x) => {
  const g = groupe(x, 0, 1.3); scene.add(g);
  g.add(pose(bloc(0.07, 0.32, 0.07, "#6b6f75", 0), 0, 0.16, 0), pose(ombre(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.48, 8), mat("#d62828"))), 0, 0.56, 0));
  g.add(pose(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), mat("#1b1b1b")), 0, 0.85, 0), pose(bloc(0.2, 0.06, 0.04, "#1b1b1b", 0), 0.1, 0.88, 0));
  g.scale.setScalar(0.001); return g;
});
// les 12 bornes solaires
const BORNES_X = [-2.2, 2.1, 6.3, 10.5, 15.4, 19.0, 26.8, 29.6, 32.4, 36.0, 39.5, 43.0];
const capMat = new THREE.MeshStandardMaterial({ color: "#fff4c4", emissive: "#ffd36b", emissiveIntensity: 0 });
const haloMat = new THREE.MeshBasicMaterial({ color: "#ffd77a", transparent: true, opacity: 0, depthWrite: false });
const bornes = BORNES_X.map((x) => {
  const g = groupe(x, 0, 1.45); scene.add(g);
  g.add(pose(bloc(0.16, 0.7, 0.16, "#3b4048", 0.01), 0, 0.35, 0), pose(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.2), capMat), 0, 0.77, 0), pose(bloc(0.26, 0.04, 0.26, "#22262c", 0), 0, 0.86, 0));
  g.add(pose(new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), haloMat), 0, 0.6, 0.15));
  g.scale.setScalar(0.001); return g;
});
// panneau « baignade interdite »
const texBaignade = texteTexture([["BAIGNADE", 46, 58], ["INTERDITE", 46, 112]], "#d62828", "#ffffff", 280, 160);
const panneauLac = groupe(51.0, 0, 1.1); scene.add(panneauLac);
panneauLac.add(pose(bloc(0.1, 1.5, 0.1, "#5b4128", 0), 0, 0.75, 0));
panneauLac.add(pose(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.06), [mat("#d62828"), mat("#d62828"), mat("#d62828"), mat("#d62828"), new THREE.MeshStandardMaterial({ map: texBaignade, emissive: "#ffffff", emissiveMap: texBaignade, emissiveIntensity: 0.15 }), mat("#d62828")]), 0, 1.45, 0.05));
panneauLac.scale.setScalar(0.001);

/* ---------- Mise en scène ---------- */
const COUPES = [P("rappel"), P("dechire"), P("p1"), P("etlac"), P("ouvrir"), P("voiture"), P("choix")];
const PLANS = [
  [0, -4.8, 1.15, 0.01],
  [P("rappel"), 10, 0.72, 0.01],
  [P("dechire"), -3.2, 1.25, 0.01],
  [P("maire"), -4.8, 1.1, 0.8],
  [P("p1"), 22.3, 1.05, 0.01],
  [P("p2"), 8, 0.72, 0.9],
  [P("p3"), 12, 0.6, 0.9],
  [P("plustard"), 22.8, 0.85, 0.01],
  [P("etlac"), 52.4, 0.85, 0.01],
  [P("ouvrir"), 22.8, 0.85, 0.01],
  [P("voiture"), -6.2, 0.95, 0.01],
  [P("choix"), 53.6, 0.72, 0.01],
  [FIN_VOIX + 0.2, 54.4, 0.72, 1.4],
];
function plan(t) {
  let x = PLANS[0][1], z = PLANS[0][2];
  for (const [kt, kx, kz, kd] of PLANS) { if (t < kt) break; const p = ease(t, kt, kd); x = lerp(x, kx, p); z = lerp(z, kz, p); }
  return { x, z };
}
function trajet(cles, t) {
  let x = cles[0][1], v = 0, dir = 0;
  for (const [kt, kx, kd] of cles) { if (t < kt) break; const p = ease(t, kt, kd); if (p > 0 && p < 1 && Math.abs(kx - x) > 0.05) { v = 1; dir = Math.sign(kx - x); } x = lerp(x, kx, p); }
  return { x, v, dir };
}
const TRAJ_MALO = [[0, -2.7, 0.01], [P("rappel"), 10.6, 0.01], [P("dechire"), -2.5, 0.01], [P("p1"), 19.0, 0.01], [P("p2", 0.1), 11.6, 1.6], [P("plustard"), 27.0, 0.01],
  [P("etlac"), 48.9, 0.01], [P("ouvrir"), 27.0, 0.01], [P("voiture"), -2.4, 0.01], [P("choix"), 49.0, 0.01]];
const TRAJ_ROGER = [[0, -1.9, 0.01], [P("rappel"), 11.6, 0.01], [P("dechire"), -1.6, 0.01], [P("p1"), 18.2, 0.01], [P("p2", 0.3), 12.5, 1.6], [P("plustard"), 27.8, 0.01],
  [P("etlac"), 48.1, 0.01], [P("ouvrir"), 27.8, 0.01], [P("voiture"), -1.5, 0.01], [P("choix"), 48.2, 0.01]];
const TRAJ_MAIRE = [[0, -7.4, 0.01], [P("maire", 0.1), -12, 0.01], [P("maire", 0.15), -7.4, 1.3], [P("dix", 0.2), -14, 2.2]];
const TRAJ_INSP = [[0, 15, 0.01], [P("plustard", 1.0), 18.8, 1.8]];
const TRAJ_FAM = [[[0, -9.6, 0.01], [P("famille", -0.1), -6.3, 1.4]], [[0, -9.2, 0.01], [P("famille", 0.1), -5.6, 1.4]], [[0, -8.8, 0.01], [P("famille", 0.3), -4.7, 1.3]]];
function humeur(t) {
  const H = [[0, "inquiet"], [P("rappel"), "content"], [P("condition"), "concentre"], [P("vote"), "joie"], [P("argent"), "content"], [P("gain"), "joie"], [P("budget"), "content"],
    [P("dechire"), "concentre"], [P("dechire", 1.5), "joie"], [P("maire"), "surpris"], [P("inspection", 1.0), "inquiet"], [P("ferme"), "choque"], [P("dix"), "inquiet"],
    [P("p1"), "concentre"], [P("total"), "reflechit"], [P("plustard"), "inquiet"], [P("conforme", 0.7), "content"], [P("etlac"), "inquiet"], [P("interdite"), "grimace"],
    [P("ouvrir"), "joie"], [P("voiture"), "surpris"], [P("famille"), "joie"], [P("question"), "surpris"], [P("choix"), "reflechit"], [P("comment"), "joie"]];
  let h = "content"; for (const [ht, v] of H) if (t >= ht) h = v; return h;
}
const EXPR = {
  content: { sr: 0, sy: 0, coin: 0.45, ouv: 1, lar: 1, oy: 1 }, joie: { sr: 0, sy: 0.03, coin: 0.7, ouv: 3.2, lar: 1.3, oy: 0.35 },
  inquiet: { sr: 0.35, sy: 0.02, coin: -0.4, ouv: 1, lar: 0.8, oy: 1 }, grimace: { sr: -0.38, sy: -0.02, coin: -0.25, ouv: 2.2, lar: 1.5, oy: 0.8 },
  concentre: { sr: -0.2, sy: -0.01, coin: 0, ouv: 0.8, lar: 0.7, oy: 0.85 }, choque: { sr: 0.15, sy: 0.06, coin: -0.2, ouv: 4, lar: 0.9, oy: 1.2 },
  surpris: { sr: 0.1, sy: 0.05, coin: 0, ouv: 2.4, lar: 0.6, oy: 1.15 }, reflechit: { sr: 0.25, sy: 0.03, coin: 0.15, ouv: 1, lar: 0.8, oy: 0.95 },
};
let ex = { ...EXPR.content };
const nuitP3 = (t) => ease(t, P("p3", 0.5), 0.6) * (1 - ease(t, P("total", 0.5), 0.7));
const soir = (t) => (t >= P("voiture") - 0.05 ? 1 : 0);
const jourDe = (t) => 1 - nuitP3(t);
function animerMalo(t, dt) {
  const u = malo.userData, tr = trajet(TRAJ_MALO, t), h = humeur(t);
  malo.position.set(tr.x, 0.06, 0.9);
  const m = tr.v ? t * 9 : 0;
  const coupe = COUPES.some((c) => Math.abs(t - c) < 0.05);
  const versGauche = (t < P("rappel")) || (t >= P("maire") && t < P("p1")) || (t >= P("plustard") && t < P("etlac")) || (t >= P("ouvrir") && t < P("choix"));
  const repos = versGauche ? -0.7 : 0.15;
  malo.rotation.y = coupe ? repos : lerp(malo.rotation.y, tr.v ? tr.dir * Math.PI / 2 : repos, clamp(dt * 9));
  u.corps.position.y = tr.v ? Math.abs(Math.sin(m)) * 0.08 : Math.sin(t * 2.2) * 0.012;
  u.jambes[0].rotation.x = tr.v ? Math.sin(m) * 0.6 : 0; u.jambes[1].rotation.x = -u.jambes[0].rotation.x;
  let b0 = [tr.v ? -Math.sin(m) * 0.5 : -0.25, 0.09], b1 = [tr.v ? Math.sin(m) * 0.5 : 0.05, -0.09];
  u.pouce.visible = false;
  if ((t >= P("gain") && t < P("budget")) || (t >= P("ouvrir", 0.3) && t < P("voiture"))) { b1 = [-2.1, 0.25]; u.pouce.visible = true; }
  if (h === "reflechit") b1 = [-2.5, 0.55];
  if (h === "choque") { b0 = [-0.6, 0.5]; b1 = [-0.6, -0.5]; }
  if (t >= P("dechire", 0.6) && t < P("maire")) { const o = ease(t, P("dechire", 1.6), 0.25); b0 = [-1.4, 0.15 + o * 0.6]; b1 = [-1.4, -0.15 - o * 0.6]; }
  if (t >= P("une") && t < P("garcon")) { b0 = [0, 2.6 + Math.sin(t * 9) * 0.2]; b1 = [0, -2.6 - Math.sin(t * 9) * 0.2]; }
  if (t >= P("comment")) b1 = [0, -2.6 + Math.sin(t * 9) * 0.35];
  u.bras[0].rotation.set(b0[0], 0, b0[1]); u.bras[1].rotation.set(b1[0], 0, b1[1]);
  u.tete.rotation.y = tr.v ? 0 : Math.sin(t * 0.8) * 0.12; u.tete.rotation.x = h === "reflechit" ? -0.12 : 0; u.tete.rotation.z = h === "reflechit" ? 0.12 : 0;
  const e = EXPR[h]; for (const k in e) ex[k] = lerp(ex[k], e[k], clamp(dt * 10));
  u.sourcils.forEach((s, i) => { const sg = i ? 1 : -1; s.rotation.z = sg * -ex.sr + (h === "reflechit" && i ? 0.3 : 0); s.position.y = 0.15 + ex.sy; });
  const cligne = h !== "joie" && (t % 3.4) < 0.12; u.yeux.forEach((o) => { o.scale.y = cligne ? 0.1 : ex.oy; });
  u.centre.scale.set(ex.lar, ex.ouv, 1); u.coins.forEach((c, i) => { const sg = i ? 1 : -1; c.position.x = sg * 0.05 * ex.lar; c.rotation.z = sg * ex.coin; });
  const nuit = nuitP3(t);
  u.lanterne.visible = nuit > 0.4; u.flamme.intensity = 9 * nuit * (0.92 + Math.sin(t * 13) * 0.05);
}
function animerRoger(t, dt) {
  const u = roger.userData, tr = trajet(TRAJ_ROGER, t);
  const saut = t >= P("une") && t < P("garcon") ? Math.abs(Math.sin((t - P("une")) * 7)) * 0.35 : 0;
  roger.position.set(tr.x, 0.06 + saut, 1.1);
  const coupe = COUPES.some((c) => Math.abs(t - c) < 0.05);
  const versGauche = (t < P("rappel")) || (t >= P("maire") && t < P("p1")) || (t >= P("plustard") && t < P("etlac")) || (t >= P("ouvrir") && t < P("choix"));
  const repos = versGauche ? -2.4 : -0.55;
  roger.rotation.y = coupe ? repos : lerp(roger.rotation.y, tr.v ? (tr.dir > 0 ? 0 : Math.PI) : repos, clamp(dt * 8));
  const m = t * 12;
  u.pattes.forEach((p, i) => { p.rotation.z = tr.v ? Math.sin(m + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 : 0; });
  u.corps.rotation.z = 0;
  u.corps.position.y = tr.v ? Math.abs(Math.sin(m)) * 0.05 : 0;
  const grogne = t >= P("maire") && t < P("dix");
  u.queue.rotation.x = Math.sin(t * (tr.v ? 18 : grogne ? 0 : saut ? 22 : 7)) * 0.6;
  u.tete.rotation.z = grogne ? -0.15 : 0;
}
function animerPersonne(p, tr, t, dt, repos, ouVisible) {
  const u = p.userData;
  p.visible = ouVisible;
  if (!ouVisible) return;
  p.position.x = tr.x;
  const m = tr.v ? t * 9 : 0;
  p.rotation.y = lerp(p.rotation.y, tr.v ? tr.dir * Math.PI / 2 : repos, clamp(dt * 9));
  if (dt > 0.2) p.rotation.y = tr.v ? tr.dir * Math.PI / 2 : repos;
  u.corps.position.y = tr.v ? Math.abs(Math.sin(m)) * 0.08 : Math.sin(t * 2.2) * 0.012;
  u.jambes[0].rotation.x = tr.v ? Math.sin(m) * 0.6 : 0; u.jambes[1].rotation.x = -u.jambes[0].rotation.x;
  u.bras[0].rotation.set(tr.v ? -Math.sin(m) * 0.5 : -0.1, 0, 0.08); u.bras[1].rotation.set(tr.v ? Math.sin(m) * 0.5 : -0.1, 0, -0.08);
  u.yeux.forEach((o) => { o.scale.y = (t + p.position.x) % 3.1 < 0.12 ? 0.1 : 1; });
}
function animerMaire(t, dt) {
  const vis1 = t < P("rappel"), vis2 = t >= P("maire") && t < P("p1");
  const tr = trajet(TRAJ_MAIRE, t), u = maire.userData;
  maire.position.z = 0.9;
  animerPersonne(maire, tr, t, dt, 0.7, vis1 || vis2);
  if (!maire.visible) return;
  const colere = vis1 || t >= P("inspection");
  u.sourcils[0].rotation.z = colere ? -0.45 : 0; u.sourcils[1].rotation.z = colere ? 0.45 : 0;
  u.bouche.scale.set(colere ? 0.8 : 1, t >= P("inspection") && t < P("dix") && Math.sin(t * 18) > 0 ? 3 : 1, 1);
  if (!tr.v && (vis1 || (t >= P("maire", 1.4) && t < P("inspection", 1.2)))) { u.bras[0].rotation.set(-1.25, 0, -0.95); u.bras[1].rotation.set(-1.25, 0, 0.95); }
  if (!tr.v && t >= P("ferme", 1.3) && t < P("dix", 0.2)) u.bras[1].rotation.set(-1.7, 0, -0.2);
}
function animerInspecteur(t, dt) {
  const ok = (t >= P("plustard") && t < P("etlac")) || (t >= P("ouvrir") && t < P("voiture"));
  const tr = trajet(TRAJ_INSP, t), u = inspecteur.userData;
  inspecteur.position.z = 0.9;
  animerPersonne(inspecteur, tr, t, dt, 0.5, ok);
  if (!ok || tr.v) return;
  u.bras[1].rotation.set(-1.15, 0, 0.35);
  if (t >= P("note") && t < P("etlac")) u.bras[0].rotation.set(-1.0 + Math.sin(t * 16) * 0.12, 0, -0.45);
  u.tete.rotation.x = t >= P("note") && t < P("conforme") ? 0.25 : 0;
  if (t >= P("ouvrir")) { u.bras[0].rotation.set(-2.6 + ease(t, P("ouvrir", 0.1), 0.2) * 1.4, 0, -0.45); }
}
function animerFamille(t, dt) {
  const ok = t >= P("famille", -0.2) && t < P("choix");
  [papa, maman, gamin].forEach((p, i) => {
    const tr = trajet(TRAJ_FAM[i], t);
    p.position.z = [0.95, 1.2, 1.25][i];
    animerPersonne(p, tr, t, dt, 0.6, ok);
    if (ok) { const k = 0.72 * [1, 0.95, 0.62][i] * (0.3 + 0.7 * ease(t, P("famille", -0.2 + i * 0.2), 0.2)); p.scale.setScalar(k); }
  });
  if (ok && t >= P("question") - 0.2) { const u = gamin.userData; u.bras[1].rotation.set(-2.7, 0, -0.2); u.tete.rotation.x = -0.15; }
}
function ambiance(t) {
  const n = nuitP3(t), s = soir(t);
  const haut = new THREE.Color("#4f9fdc").lerp(new THREE.Color("#4a3f86"), s).lerp(new THREE.Color("#141f44"), n);
  const bas = new THREE.Color("#c4e6f5").lerp(new THREE.Color("#f2a768"), s).lerp(new THREE.Color("#2e4680"), n);
  peindreCiel("#" + haut.getHexString(), "#" + bas.getHexString());
  scene.fog.color.copy(bas); scene.fog.near = 40; scene.fog.far = 120;
  etoiles.material.opacity = clamp(n * 1.2 + s * 0.25); lune.material.opacity = clamp(n * 1.2);
  hemi.intensity = lerp(lerp(2.0, 1.55, s), 1.7, n); hemi.color.set(n > 0.5 ? "#9ab0ee" : s ? "#f0d2c0" : "#cfe3ff");
  luneL.intensity = 1.6 * n; luneL.castShadow = n > 0.5;
  soleil.intensity = lerp(lerp(2.6, 1.5, s), 0, n); soleil.color.set(s ? "#ffa860" : "#ffe2b0"); soleil.castShadow = n <= 0.5;
  lumRoger.intensity = 5 * n;
  renderer.toneMappingExposure = lerp(lerp(1.05, 1.12, s), 1.3, n);
}
function decor(t) {
  mobilHomes.forEach((mh, i) => etatMobilHome(mh, i < 4 ? 1 : 0, t));
  flux.forEach((m, i) => { m.position.x = -6 + ((t * 5 + i * 2.25) % 36); m.visible = m.position.x < 19.6; });
  porteB.rotation.y = -1.6; lumB.intensity = 0;
  reflet.material.opacity = 0.55 + Math.sin(t * 2) * 0.15;
  const pop = (a) => { const p = clamp((t - a) / 0.22); return p <= 0 ? 0.001 : p < 1 ? 1 + Math.sin(p * Math.PI) * 0.25 : 1; };
  barriere.scale.y = Math.max(0.001, ease(t, P("p1", 2.0), 1.1));
  extincteurs.forEach((g, i) => g.scale.setScalar(pop(P("p2", 1.3) + i * 0.12)));
  const s = soir(t), n = nuitP3(t);
  bornes.forEach((g, i) => g.scale.setScalar(pop(P("p3b", 0.1) + i * 0.08)));
  const allume = t >= P("p3b", 0.4) ? 1 : 0;
  capMat.emissiveIntensity = allume * lerp(0.6, 2.5, Math.max(n, s)); haloMat.opacity = allume * 0.35 * Math.max(n, s * 0.7);
  panneauLac.scale.setScalar(pop(P("interdite", 0.2)));
  // la voiture
  const xv = lerp(-24, -9.3, ease(t, P("voiture", 0.2), 2.1));
  voiture.position.x = xv; voiture.visible = t >= P("voiture") - 0.05; roues.forEach((r) => (r.rotation.y = -xv / 0.3));
  phares.intensity = 4 * s;
}

/* ---------- Interface ---------- */
@@ECRAN_BULLE@@
const SONDAGE = "@@SONDAGE@@";
const SAUTS = [[FP("gain"), 4484, 93, 0], [P("total", 0.4), 984, 93, 0], [P("plustard", 0.6), 984, 83, 0], [P("une", 0.1), 984, 83, 1]];
function hud(t) {
  const oA = vis(t, 2.6, 1e9, 0.3);
  if (oA <= 0) return "";
  let budget = 4328, delai = 93, fam = 0, pb = 4328, pd = 93, pf = 0, delta = null, deltaF = null;
  for (const [ts, b, d, f] of SAUTS) {
    const p = ease(t, ts, 0.7);
    if (t >= ts) { budget = lerp(pb, b, p); delai = Math.round(lerp(pd, d, p)); fam = f; if (t < ts + 2 && b !== pb) delta = { v: b - pb, o: vis(t, ts, ts + 2, 0.2) }; if (t < ts + 2.5 && f !== pf) deltaF = vis(t, ts, ts + 2.5, 0.2); }
    pb = b; pd = d; pf = f;
  }
  const eclat = (tm) => clamp(1 - Math.abs(t - tm - 0.5) / 0.7);
  const hiB = Math.max(eclat(FP("gain")), eclat(P("budget")), eclat(P("total", 0.4))), hiD = Math.max(eclat(P("condition", 1.6)), eclat(P("budget", 2.4)), eclat(P("dix")), eclat(P("plustard", 0.6))), hiF = Math.max(eclat(P("condition", 0.6)), eclat(P("une", 0.1)));
  const boite = (cx, lab, val, col, o, hi = 0) => `<g opacity="${o}" transform="translate(${cx},340) scale(${(0.85 + 0.15 * o) * (1 + 0.12 * hi)})">
    ${hi > 0 ? `<rect x="-128" y="-66" width="256" height="124" rx="24" fill="${col}" opacity="${0.35 * hi}"/>` : ""}
    <rect x="-118" y="-56" width="236" height="104" rx="18" fill="${hi > 0.3 ? col : "#121828"}" fill-opacity="${hi > 0.3 ? 0.35 : 1}" stroke="${col}" stroke-width="5"/>
    <text x="0" y="-21" text-anchor="middle" font-family="Inter" font-weight="800" font-size="20" fill="#b9c0d0" letter-spacing="3">${lab}</text>
    <text x="0" y="28" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="${col}">${val}</text></g>`;
  let s = boite(285, "DÉLAI", `${delai} JOURS`, "#ff5a5f", oA, hiD) + boite(540, "FAMILLES", `${fam} / 50`, "#4ade80", oA, hiF) + boite(795, "BUDGET", `${euros(budget)} €`, "#ffc93c", oA, hiB);
  if (delta) s += `<text x="795" y="426" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="${delta.v < 0 ? "#ff5a5f" : "#4ade80"}" opacity="${delta.o}">${delta.v < 0 ? "−" : "+"}${euros(Math.abs(delta.v))} €</text>`;
  if (deltaF) s += `<text x="540" y="426" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#4ade80" opacity="${deltaF}">+1 FAMILLE</text>`;
  s += `<g opacity="${oA}" transform="translate(540,${deltaF ? 470 : 452})"><rect x="-170" y="-18" width="340" height="36" rx="18" fill="#121828" stroke="#ff3b5c" stroke-width="3"/><text x="0" y="7" text-anchor="middle" font-family="Inter" font-weight="900" font-size="19" fill="#ffffff">❤ 1 LIKE / 1 ABONNÉ = +1 €</text></g>`;
  return s;
}
function titre(t) {
  const o = vis(t, 0.05, 2.9, 0.2); if (o <= 0) return "";
  const k = 0.85 + 0.15 * easeIO(clamp(t / 0.25));
  return `<g opacity="${o}" transform="translate(540,560) scale(${k})" font-family="Inter" font-weight="900" text-anchor="middle" stroke="#0b1020" stroke-width="12" paint-order="stroke" stroke-linejoin="round">
    <text x="0" y="0" font-size="56" fill="#ffc93c">ÉPISODE 4</text><text x="0" y="100" font-size="88" fill="#ffffff">LE MAIRE EST VENU</text></g>`;
}
function carteRappel(t) {
  const o = vis(t, P("rappel"), P("vote", -0.1), 0.25); if (o <= 0) return "";
  const l = (a) => clamp((t - a) / 0.3);
  const L = [["CAMPING CÉDÉ POUR", "1 €", "#ffc93c", P("rappel", 1.6)], ["OBJECTIF", "50 FAMILLES", "#4ade80", P("condition", 0.9)], ["DÉLAI", "120 JOURS", "#ff5a5f", P("condition", 1.9)]];
  let s = `<g opacity="${o}" transform="translate(540,${690 + (1 - o) * -30}) scale(${0.85 + 0.15 * o})">
    <rect x="-330" y="-170" width="660" height="390" rx="24" fill="#121828" stroke="#ffffff" stroke-width="6"/>
    <rect x="-110" y="-196" width="220" height="52" rx="26" fill="#ff3b5c"/><text x="0" y="-160" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#fff" letter-spacing="4">RAPPEL</text>`;
  L.forEach(([a, b, c, tm], i) => { s += `<g opacity="${l(tm)}"><text x="-290" y="${-80 + i * 80}" font-family="Inter" font-weight="800" font-size="34" fill="#d5dae5">${a}</text><text x="290" y="${-80 + i * 80}" text-anchor="end" font-family="Inter" font-weight="900" font-size="44" fill="${c}">${b}</text></g>`; });
  s += `<g opacity="${l(P("condition", 2.6))}"><line x1="-290" y1="128" x2="290" y2="128" stroke="#3a4258" stroke-width="3"/><text x="0" y="186" text-anchor="middle" font-family="Inter" font-weight="900" font-size="36" fill="#ff5a5f">SINON → LA MAIRIE LE REPREND</text></g></g>`;
  return s;
}
function sondage(t) {
  const o = vis(t, P("vote", -0.1), P("argent", -0.1), 0.25); if (o <= 0) return "";
  return `<g opacity="${o}" transform="translate(540,${740 + (1 - o) * 30})"><rect x="-386" y="-152" width="772" height="304" rx="26" fill="#000" opacity=".35" transform="translate(6,8)"/>
    <clipPath id="clipS"><rect x="-386" y="-152" width="772" height="304" rx="26"/></clipPath><image href="${SONDAGE}" x="-386" y="-152" width="772" height="304" clip-path="url(#clipS)" preserveAspectRatio="xMidYMid slice"/></g>`;
}
function carteArgent(t) {
  const o = vis(t, P("argent"), P("dechire", -0.2), 0.25); if (o <= 0) return "";
  const l1 = clamp((t - P("argent", 1.1)) / 0.3), l2 = clamp((t - P("argent", 2.0)) / 0.3), l3 = clamp((t - P("gain")) / 0.3);
  return `<g opacity="${o}" transform="translate(540,${660 + (1 - o) * -30}) scale(${0.85 + 0.15 * o})">
    <rect x="-300" y="-120" width="600" height="300" rx="24" fill="#121828" stroke="#ffc93c" stroke-width="7"/>
    <text x="0" y="-62" text-anchor="middle" font-family="Inter" font-weight="900" font-size="38" fill="#ffc93c" letter-spacing="2">L'ARGENT DE L'ÉPISODE 3</text>
    <text x="0" y="0" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="#ffffff" opacity="${l1}"><tspan fill="#ff3b5c">❤</tspan> 96 LIKES = +96 €</text>
    <text x="0" y="60" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="#ffffff" opacity="${l2}"><tspan fill="#4ade80">+</tspan> 60 ABONNÉS = +60 €</text>
    <g opacity="${l3}"><line x1="-240" y1="96" x2="240" y2="96" stroke="#3a4258" stroke-width="3"/><text x="0" y="148" text-anchor="middle" font-family="Inter" font-weight="900" font-size="42" fill="#4ade80">TOTAL : +156 €</text></g></g>`;
}
function carteLettre(t) {
  const o = vis(t, P("dechire", 0.1), P("maire", -0.2), 0.25); if (o <= 0) return "";
  const d = ease(t, P("dechire", 1.65), 0.35);
  const moitie = (sg, clip) => `<g transform="translate(${sg * d * 70},${d * 40}) rotate(${sg * d * 9})" clip-path="url(#${clip})">
    <rect x="-310" y="-200" width="620" height="400" rx="6" fill="#ffffff"/>
    <rect x="-310" y="-200" width="620" height="70" rx="6" fill="#1f3a6b"/><text x="0" y="-152" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#ffffff" letter-spacing="3">MAIRIE</text>
    <text x="-270" y="-80" font-family="Inter" font-weight="800" font-size="24" fill="#4a4f5c">Objet : rachat du lac</text>
    <text x="-270" y="-30" font-family="Inter" font-weight="600" font-size="24" fill="#4a4f5c">La commune propose d'acheter</text>
    <text x="-270" y="5" font-family="Inter" font-weight="600" font-size="24" fill="#4a4f5c">le lac et ses abords pour :</text>
    <text x="0" y="95" text-anchor="middle" font-family="Inter" font-weight="900" font-size="72" fill="#1f3a6b">150 000 €</text>
    <text x="270" y="165" text-anchor="end" font-family="Liberation Serif, serif" font-style="italic" font-size="26" fill="#4a4f5c">— Le maire</text></g>`;
  return `<g opacity="${o}" transform="translate(540,${720 + (1 - o) * -30}) rotate(1.5) scale(${0.85 + 0.15 * o})">
    <defs><clipPath id="dG"><path d="M-320 -210 L12 -210 L-14 -120 L18 -40 L-10 40 L16 120 L-8 210 L-320 210 Z"/></clipPath><clipPath id="dD"><path d="M12 -210 L320 -210 L320 210 L-8 210 L16 120 L-10 40 L18 -40 L-14 -120 Z"/></clipPath></defs>
    <rect x="-310" y="-200" width="620" height="400" rx="6" fill="#000" opacity="${0.3 * (1 - d)}" transform="translate(8,10)"/>
    ${moitie(-1, "dG")}${moitie(1, "dD")}</g>`;
}
function carteAvis(t) {
  const o = vis(t, P("inspection", 1.3), P("p1", -0.2), 0.25); if (o <= 0) return "";
  const f = clamp((t - P("ferme", 1.4)) / 0.25);
  return `<g opacity="${o}" transform="translate(540,${690 + (1 - o) * -30}) rotate(-1.5) scale(${0.85 + 0.15 * o})">
    <rect x="-300" y="-170" width="600" height="340" rx="6" fill="#000" opacity=".3" transform="translate(8,10)"/>
    <rect x="-300" y="-170" width="600" height="340" rx="6" fill="#ffffff"/><rect x="-300" y="-170" width="600" height="64" rx="6" fill="#1f3a6b"/>
    <text x="0" y="-127" text-anchor="middle" font-family="Inter" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="3">AVIS DE LA MAIRIE</text>
    <text x="0" y="-50" text-anchor="middle" font-family="Inter" font-weight="900" font-size="36" fill="#1f3a6b">INSPECTION DE SÉCURITÉ</text>
    <text x="0" y="40" text-anchor="middle" font-family="Inter" font-weight="900" font-size="76" fill="#d62828">DANS 10 JOURS</text>
    <g opacity="${f}" transform="translate(0,118) rotate(-4) scale(${1 + 0.4 * (1 - f)})"><rect x="-250" y="-34" width="500" height="64" rx="8" fill="none" stroke="#d62828" stroke-width="6"/><text x="0" y="12" text-anchor="middle" font-family="Inter" font-weight="900" font-size="32" fill="#d62828">NON CONFORME = FERMETURE</text></g></g>`;
}
function liste(t) {
  const o = vis(t, P("p1", 0.3), P("plustard", -0.2), 0.25); if (o <= 0) return "";
  const L = [["Barrière piscine", "2 000 €", P("p1", 3.4)], ["10 extincteurs", "600 €", P("p2", 2.5)], ["12 bornes solaires", "900 €", P("p3b", 1.0)]];
  const h = 120 + 3 * 56 + 70;
  let s = `<g opacity="${o}" transform="translate(540,${510 + (1 - o) * -30}) rotate(-2)">
    <rect x="-300" y="0" width="600" height="${h}" rx="6" fill="#000" opacity=".25" transform="translate(8,10)"/><rect x="-300" y="0" width="600" height="${h}" rx="6" fill="#fbf7ec"/>`;
  for (let y = 70; y < h; y += 56) s += `<line x1="-300" y1="${y}" x2="300" y2="${y}" stroke="#cdd9ee" stroke-width="2"/>`;
  s += `<line x1="-240" y1="0" x2="-240" y2="${h}" stroke="#ef9a9a" stroke-width="3"/><text x="0" y="52" text-anchor="middle" font-family="Inter" font-weight="900" font-size="32" fill="#1b1b1b" letter-spacing="2">AVANT L'INSPECTION</text>`;
  L.forEach(([a, b, tm], i) => { const y = 116 + i * 56; s += `<g opacity="${clamp((t - tm) / 0.2)}"><text x="-222" y="${y}" font-family="Inter" font-weight="800" font-size="27" fill="#2b2b2b">${a}</text><text x="272" y="${y}" text-anchor="end" font-family="Inter" font-weight="900" font-size="28" fill="#2b2b2b">${b}</text></g>`; });
  const yt = 116 + 3 * 56 + 6;
  s += `<g opacity="${clamp((t - P("total", 0.2)) / 0.2)}"><line x1="-222" y1="${yt - 36}" x2="272" y2="${yt - 36}" stroke="#1b1b1b" stroke-width="3"/><text x="-222" y="${yt + 4}" font-family="Inter" font-weight="900" font-size="28" fill="#e23b3b">TOTAL</text><text x="272" y="${yt + 4}" text-anchor="end" font-family="Inter" font-weight="900" font-size="32" fill="#e23b3b">3 500 €</text></g>`;
  return s + `</g>`;
}
function rapport(t) {
  const o = vis(t, P("conforme", -0.1), P("voiture", -0.1), 0.25); if (o <= 0) return "";
  const L = [["Barrière piscine", P("conforme", 0.7), 1], ["Extincteurs", P("conforme", 2.3), 1], ["Éclairage", P("conforme", 3.85), 1], ["Lac : baignade", P("interdite", 0.3), 0]];
  const h = 120 + 4 * 56 + 20;
  let s = `<g opacity="${o}" transform="translate(540,${510 + (1 - o) * -30}) rotate(2)">
    <rect x="-300" y="0" width="600" height="${h}" rx="6" fill="#000" opacity=".25" transform="translate(8,10)"/><rect x="-300" y="0" width="600" height="${h}" rx="6" fill="#ffffff"/>
    <rect x="-300" y="0" width="600" height="72" rx="6" fill="#3b4048"/><text x="0" y="48" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#ffffff" letter-spacing="2">RAPPORT D'INSPECTION</text>`;
  L.forEach(([a, tm, ok], i) => {
    const y = 128 + i * 56, oi = clamp((t - tm) / 0.2);
    s += `<g opacity="${oi}"><text x="-262" y="${y}" font-family="Inter" font-weight="800" font-size="29" fill="#2b2b2b">${a}</text>
      ${ok ? `<text x="200" y="${y}" text-anchor="end" font-family="Inter" font-weight="900" font-size="26" fill="#22a55a">CONFORME</text><path d="M218 ${y - 14} l 14 16 l 30 -34" stroke="#22a55a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<text x="200" y="${y}" text-anchor="end" font-family="Inter" font-weight="900" font-size="26" fill="#d62828">INTERDITE</text><path d="M222 ${y - 22} l 26 26 M248 ${y - 22} l -26 26" stroke="#d62828" stroke-width="7" stroke-linecap="round"/>`}</g>`;
  });
  const st = clamp((t - P("ouvrir", 0.3)) / 0.18);
  if (st > 0) s += `<g opacity="${st}" transform="translate(40,${h - 40}) rotate(-10) scale(${1 + 0.5 * (1 - st)})"><rect x="-230" y="-48" width="460" height="92" rx="10" fill="#ffffff" fill-opacity=".85" stroke="#22a55a" stroke-width="8"/><text x="0" y="16" text-anchor="middle" font-family="Inter" font-weight="900" font-size="42" fill="#22a55a">AUTORISÉ À OUVRIR</text></g>`;
  return s + `</g>`;
}
function plusTard(t) {
  const o = vis(t, P("plustard", -0.25), P("plustard", 1.3), 0.25); if (o <= 0) return "";
  return `<g opacity="${o}"><rect width="1080" height="1920" fill="#0b0f1c"/><text x="540" y="930" text-anchor="middle" font-family="Inter" font-weight="900" font-size="96" fill="#ffffff">10 JOURS</text><text x="540" y="1030" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" fill="#ffc93c">PLUS TARD…</text></g>`;
}
const ETIQUETTES = [["1ʳᵉ FAMILLE !", "une", 0.1, "question", 640, "#22a55a"]];
function etiquettes(t) {
  let s = "";
  for (const [txt, a, d, b, y, col] of ETIQUETTES) {
    const o = vis(t, P(a, d), P(b), 0.15); if (o <= 0) continue;
    const w = txt.length * 26 + 50, k = 1 + 0.4 * (1 - easeIO(clamp((t - P(a, d)) / 0.18)));
    s += `<g opacity="${o}" transform="translate(560,${y}) rotate(-6) scale(${k})"><rect x="${-w / 2}" y="-34" width="${w}" height="66" rx="10" fill="${col}" stroke="#ffffff" stroke-width="5"/><text x="0" y="14" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="#ffffff" letter-spacing="1">${txt}</text></g>`;
  }
  return s;
}
function choix(t) {
  const a = P("choix"), b = DUREE - 2.6; let s = "";
  const carte = (cx, titre, sous, col, ic, o) => o <= 0 ? "" : `<g opacity="${o}" transform="translate(${cx},640) scale(${0.8 + 0.2 * o})"><rect x="-205" y="-120" width="410" height="240" rx="24" fill="#121828" stroke="${col}" stroke-width="7"/>${ic}
    <text x="0" y="58" text-anchor="middle" font-family="Inter" font-weight="900" font-size="36" fill="${col}">${titre}</text><text x="0" y="96" text-anchor="middle" font-family="Inter" font-weight="800" font-size="20" fill="#b9c0d0" letter-spacing="2">${sous}</text></g>`;
  const bouee = `<g transform="translate(0,-40)"><circle r="40" fill="none" stroke="#ffffff" stroke-width="20"/><circle r="40" fill="none" stroke="#e63946" stroke-width="20" stroke-dasharray="31.4 31.4"/></g>`;
  const poisson = `<g transform="translate(-6,-40)"><path d="M-46 0 q 36 -36 74 0 q -38 36 -74 0 Z" fill="#7cc4ff"/><path d="M26 0 l 26 -22 l 0 44 Z" fill="#7cc4ff"/><circle cx="-26" cy="-6" r="5" fill="#121828"/></g>`;
  s += carte(280, "MAÎTRE-NAGEUR", "2 000 € PAR MOIS", "#ff5a5f", bouee, vis(t, a, b, 0.25));
  s += carte(800, "PÊCHE & PÉDALOS", "PAS DE BAIGNADE", "#4fa3ff", poisson, vis(t, P("choix2"), b, 0.25));
  const oo = vis(t, P("choix2", -0.3), b, 0.2); if (oo > 0) s += `<g opacity="${oo}"><circle cx="540" cy="640" r="44" fill="#ffffff"/><text x="540" y="654" text-anchor="middle" font-family="Inter" font-weight="900" font-size="36" fill="#1b1b1b">OU</text></g>`;
  const oc = vis(t, P("comment"), b, 0.25); if (oc > 0) s += `<g opacity="${oc}" transform="translate(540,860) scale(${0.85 + 0.15 * oc})"><rect x="-400" y="-38" width="800" height="76" rx="38" fill="#ff3b5c"/><text x="0" y="12" text-anchor="middle" font-family="Inter" font-weight="900" font-size="29" fill="#fff">ÉCRIS « MAÎTRE-NAGEUR » OU « PÊCHE »</text></g>`;
  return s;
}
@@SOUSTITRES@@
function carteFin(t) {
  const a = DUREE - 2.6, o = clamp((t - a) / 0.35); if (o <= 0) return "";
  return `<g opacity="${o}"><rect width="1080" height="1920" fill="#0b0f1c" opacity=".88"/>
    <text x="540" y="760" text-anchor="middle" font-family="Inter" font-weight="900" font-size="38" fill="#4ade80" letter-spacing="6">LES PINS PERDUS · SAISON 1</text>
    <text x="540" y="860" text-anchor="middle" font-family="Inter" font-weight="900" font-size="88" fill="#ffffff">ÉPISODE 5</text>
    <text x="540" y="950" text-anchor="middle" font-family="Inter" font-weight="900" font-size="88" fill="#ffc93c">BIENTÔT</text>
    <g transform="translate(540,1120)"><rect x="-360" y="-44" width="720" height="88" rx="44" fill="#ff3b5c"/><text x="0" y="14" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="#fff">+ ABONNE-TOI = +1 € POUR LE CAMPING</text></g></g>`;
}
function vignette(t) {
  const n = nuitP3(t); if (n <= 0.01) return "";
  return `<defs><radialGradient id="vg" cx="50%" cy="48%" r="70%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".65"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#vg)" opacity="${n.toFixed(3)}"/>`;
}
const FLASHS = [P("une")];
function interface_(t) {
  let s = vignette(t);
  const [mx, my] = ecran(malo, 3.6), [rx, ry] = ecran(roger, 1.6), [ax, ay] = ecran(maire, 3.4), [ix, iy] = ecran(inspecteur, 3.4), [gx, gy] = ecran(gamin, 3.4);
  const Bb = (x, y, txt, c, o) => bulle(clamp(x, 220, 860), clamp(y, 560, 1000), txt, c, o);
  s += titre(t) + hud(t) + etiquettes(t) + carteRappel(t) + sondage(t) + carteArgent(t) + carteLettre(t) + carteAvis(t) + liste(t) + rapport(t);
  s += choix(t);
  s += Bb(ax, ay, "VOUS REFUSEZ ?", "#ffffff", vis(t, P("inspection"), P("inspection", 1.2), 0.15));
  s += Bb(ax, ay, "JE LE FERME.", "#ffffff", vis(t, P("ferme", 1.4), P("dix", 0.2), 0.15));
  s += Bb(mx, my, "NON MERCI !", "#ffffff", vis(t, P("dechire", 1.7), P("maire"), 0.15));
  s += Bb(ix, iy, "HMM…", "#ffffff", vis(t, P("note", 0.2), P("conforme"), 0.15));
  s += Bb(rx, ry, "WOUF !", "#ffffff", vis(t, P("une", 0.3), P("garcon"), 0.2));
  s += Bb(gx, gy, "ON PEUT SE BAIGNER ?", "#4fa3ff", vis(t, P("question"), P("choix"), 0.2));
  s += sousTitres(t);
  for (const ft of FLASHS) { const o = 0.45 * clamp(1 - (t - ft) / 0.3); if (t >= ft && o > 0) s += `<rect width="1080" height="1920" fill="#ffffff" opacity="${o.toFixed(3)}"/>`; }
  for (const c of COUPES) { const o = clamp(1 - Math.abs(t - c) / 0.25); if (o > 0) s += `<rect width="1080" height="1920" fill="#000" opacity="${(o * 0.9).toFixed(3)}"/>`; }
  s += plusTard(t) + carteFin(t);
  document.getElementById("ui").innerHTML = s;
}

/* ---------- Bruitages ---------- */
const EVENEMENTS = [];
const ev = (t, type, d = 0) => { if (t >= 0) EVENEMENTS.push({ t: +t.toFixed(3), type, d }); };
[P("rappel"), P("vote"), P("argent"), P("inspection", 1.3), P("p1", 0.3), P("conforme"), P("choix"), P("comment")].forEach((t) => ev(t, "pop"));
ev(FP("gain"), "kaching"); ev(P("dechire", 1.65), "whoosh"); ev(P("ferme", 1.4), "tampon");
ev(P("p2", 1.3), "pop"); ev(P("p3b", 0.4), "ding"); ev(P("total", 0.4), "kaching");
[P("conforme", 0.7), P("conforme", 2.3), P("conforme", 3.85)].forEach((t) => ev(t, "coche"));
ev(P("interdite", 0.3), "tampon"); ev(P("ouvrir", 0.3), "tampon");
ev(P("voiture", 0.2), "moteur", 2.2); ev(P("une", 0.1), "ding"); ev(P("une", 0.8), "wouf");
ev(DUREE - 2.6, "fin");
window.EVENEMENTS = EVENEMENTS;
