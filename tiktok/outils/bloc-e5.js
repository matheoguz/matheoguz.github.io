/* ---------- Épisode 5 : état de départ = fin de l'épisode 4 ---------- */
barriere.scale.y = 1; extincteurs.forEach((g) => g.scale.setScalar(1)); bornes.forEach((g) => g.scale.setScalar(1)); panneauLac.scale.setScalar(1);
voiture.position.x = -9.3; inspecteur.visible = false;
const ines = creerPersonne({ veste: "#d62828", pantalon: "#e3ad8c", chaussures: "#e3ad8c", cheveux: "#1d1d1d", longs: true }); scene.add(ines);
const nouveaux = [["#2f8f5b", "#2b2b33", "#6b3b1f"], ["#7b4fb0", "#33476e", "#c9a25a"], ["#e07b39", "#2b2b33", "#2a2a2a"]].map(([v, p, c]) => { const q = creerPersonne({ veste: v, pantalon: p, cheveux: c }); scene.add(q); return q; });
// la chaise haute de la maître-nageuse
const chaise = groupe(49.4, 0, 0.1); scene.add(chaise);
for (const x of [-0.35, 0.35]) for (const z of [-0.3, 0.3]) chaise.add(pose(bloc(0.08, 1.7, 0.08, "#f2f2f2", 0), x, 0.85, z));
chaise.add(pose(bloc(0.85, 0.08, 0.75, "#d62828", 0), 0, 1.7, 0), pose(bloc(0.85, 0.6, 0.08, "#d62828", 0), 0, 2.0, -0.35));
for (let y = 0.35; y < 1.6; y += 0.35) chaise.add(pose(bloc(0.75, 0.05, 0.05, "#f2f2f2", 0), 0, y, 0.32));
// la caisse au fond du lac
const texCaisse = texteTexture([["13", 110, 80]], "#4a4f56", "#c9ced6", 200, 160);
const caisse = groupe(57.2, -0.55, AVANT + 0.14); scene.add(caisse);
caisse.add(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.6, 0.12), [mat("#4a4f56"), mat("#4a4f56"), mat("#5b6168"), mat("#3a3f45"), new THREE.MeshStandardMaterial({ map: texCaisse, roughness: 0.6, metalness: 0.3 }), mat("#4a4f56")]));
for (const x of [-0.3, 0.3]) caisse.add(pose(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.14), mat("#2b2f34")), x, 0, 0));
for (let i = 0; i < 9; i++) caisse.add(pose(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 4, 8), mat("#7c838c")), -0.48 + i * 0.12, 0.1 - (i % 2) * 0.02, 0.08, 0, i % 2 ? Math.PI / 2 : 0, 0));
const chaineSol = []; for (let i = 0; i < 5; i++) { const m = pose(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 4, 8), mat("#7c838c")), 56.55 - i * 0.11, -0.8 + i * 0.01, AVANT + 0.16, 0, i % 2 ? Math.PI / 2 : 0, 0); scene.add(m); chaineSol.push(m); }
const bulles = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05 + (i % 3) * 0.02, 6, 4), new THREE.MeshBasicMaterial({ color: "#e8f6ff", transparent: true, opacity: 0.8 })); scene.add(m); bulles.push(m); }
// le téléphone de Malo (dans sa main)
const tel = pose(bloc(0.16, 0.28, 0.04, "#1b1b1b", 0), 0, -0.95, 0.15); malo.userData.bras[1].add(tel);

/* ---------- Mise en scène ---------- */
const COUPES = [P("maire"), P("rappel"), P("probleme"), P("famille1"), P("annonce"), P("trois"), P("ines"), P("choix")];
const PLANS = [
  [0, 55.6, 1.4, 0.01],
  [P("maire"), -4.8, 1.15, 0.01],
  [P("rappel"), 10, 0.72, 0.01],
  [P("probleme"), 52.4, 0.85, 0.01],
  [P("famille1"), 3, 1.1, 0.01],
  [P("annonce"), 9, 0.9, 0.01],
  [P("trois"), 8, 0.72, 0.01],
  [P("ines"), 52.4, 0.85, 0.01],
  [P("verifier", 1.5), 55, 1.0, 1.4],
  [P("sort", 0.3), 52.8, 1.05, 1.2],
  [P("choix"), 19, 0.72, 0.01],
  [FIN_VOIX + 0.2, 20, 0.72, 1.4],
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
const TRAJ_MALO = [[0, 50.0, 0.01], [P("maire"), 12, 0.01], [P("rappel"), 10.6, 0.01], [P("probleme"), 48.9, 0.01], [P("famille1"), 2.9, 0.01], [P("annonce"), 9.6, 0.01],
  [P("ines"), 48.6, 0.01], [P("sort", 0.2), 50.0, 0.8], [P("choix"), 18.4, 0.01]];
const TRAJ_ROGER = [[0, 49.2, 0.01], [P("maire"), 13, 0.01], [P("rappel"), 11.5, 0.01], [P("probleme"), 48.1, 0.01], [P("famille1"), 3.7, 0.01], [P("annonce"), 10.4, 0.01],
  [P("ines"), 47.8, 0.01], [P("sort", 0.3), 49.2, 0.8], [P("choix"), 17.6, 0.01]];
const TRAJ_INES = [[0, 45.5, 0.01], [P("ines", 0.1), 50.4, 1.6], [P("verifier", 0.6), 54.3, 1.8]];
function humeur(t) {
  const H = [[0, "concentre"], [P("rappel"), "content"], [P("vote"), "joie"], [P("argent"), "content"], [P("gain"), "joie"], [P("budget"), "content"], [P("probleme"), "inquiet"],
    [P("famille1"), "content"], [P("pasassez"), "inquiet"], [P("annonce"), "concentre"], [P("resa"), "surpris"], [P("trois"), "joie"], [P("verifier"), "content"],
    [P("remonte"), "inquiet"], [P("caisse"), "choque"], [P("sort"), "concentre"], [P("bungalow"), "choque"], [P("prochain"), "reflechit"], [P("place"), "surpris"], [P("choix"), "reflechit"], [P("comment"), "joie"]];
  let h = "content"; for (const [ht, v] of H) if (t >= ht) h = v; return h;
}
const EXPR = {
  content: { sr: 0, sy: 0, coin: 0.45, ouv: 1, lar: 1, oy: 1 }, joie: { sr: 0, sy: 0.03, coin: 0.7, ouv: 3.2, lar: 1.3, oy: 0.35 },
  inquiet: { sr: 0.35, sy: 0.02, coin: -0.4, ouv: 1, lar: 0.8, oy: 1 }, grimace: { sr: -0.38, sy: -0.02, coin: -0.25, ouv: 2.2, lar: 1.5, oy: 0.8 },
  concentre: { sr: -0.2, sy: -0.01, coin: 0, ouv: 0.8, lar: 0.7, oy: 0.85 }, choque: { sr: 0.15, sy: 0.06, coin: -0.2, ouv: 4, lar: 0.9, oy: 1.2 },
  surpris: { sr: 0.1, sy: 0.05, coin: 0, ouv: 2.4, lar: 0.6, oy: 1.15 }, reflechit: { sr: 0.25, sy: 0.03, coin: 0.15, ouv: 1, lar: 0.8, oy: 0.95 },
};
let ex = { ...EXPR.content };
const soir = (t) => (t >= P("soir") - 0.05 && t < P("trois") ? 1 : 0);
const jourDe = (t) => 1;
const nuitP3 = (t) => 0;
const auLac = (t) => t < P("maire") || (t >= P("probleme") && t < P("famille1")) || (t >= P("ines") && t < P("choix"));
function animerMalo(t, dt) {
  const u = malo.userData, tr = trajet(TRAJ_MALO, t), h = humeur(t);
  malo.position.set(tr.x, 0.06, 0.9);
  const m = tr.v ? t * 9 : 0;
  const coupe = COUPES.some((c) => Math.abs(t - c) < 0.05);
  const versGauche = t >= P("famille1") && t < P("annonce");
  const repos = versGauche ? -0.7 : auLac(t) ? 0.5 : 0.15;
  malo.rotation.y = coupe ? repos : lerp(malo.rotation.y, tr.v ? tr.dir * Math.PI / 2 : repos, clamp(dt * 9));
  u.corps.position.y = tr.v ? Math.abs(Math.sin(m)) * 0.08 : Math.sin(t * 2.2) * 0.012;
  u.jambes[0].rotation.x = tr.v ? Math.sin(m) * 0.6 : 0; u.jambes[1].rotation.x = -u.jambes[0].rotation.x;
  let b0 = [tr.v ? -Math.sin(m) * 0.5 : -0.25, 0.09], b1 = [tr.v ? Math.sin(m) * 0.5 : 0.05, -0.09];
  u.pouce.visible = false;
  const telOn = t >= P("annonce") && t < P("trois");
  tel.visible = telOn;
  if (telOn) b1 = [-1.5, -0.1];
  if ((t >= P("gain") && t < P("budget")) || (t >= P("trois", 0.4) && t < P("ines"))) { b1 = [-2.1, 0.25]; u.pouce.visible = true; }
  if (h === "reflechit") b1 = [-2.5, 0.55];
  if (h === "choque") { b0 = [-0.6, 0.5]; b1 = [-0.6, -0.5]; }
  if (t >= P("famille1", 1.2) && t < P("pasassez")) b1 = [-1.3, -0.1];
  if (t >= P("comment")) b1 = [0, -2.6 + Math.sin(t * 9) * 0.35];
  u.bras[0].rotation.set(b0[0], 0, b0[1]); u.bras[1].rotation.set(b1[0], 0, b1[1]);
  u.tete.rotation.y = tr.v ? 0 : Math.sin(t * 0.8) * 0.12; u.tete.rotation.x = telOn ? 0.3 : h === "reflechit" ? -0.12 : 0; u.tete.rotation.z = h === "reflechit" ? 0.12 : 0;
  const e = EXPR[h]; for (const k in e) ex[k] = lerp(ex[k], e[k], clamp(dt * 10));
  u.sourcils.forEach((s, i) => { const sg = i ? 1 : -1; s.rotation.z = sg * -ex.sr + (h === "reflechit" && i ? 0.3 : 0); s.position.y = 0.15 + ex.sy; });
  const cligne = h !== "joie" && (t % 3.4) < 0.12; u.yeux.forEach((o) => { o.scale.y = cligne ? 0.1 : ex.oy; });
  u.centre.scale.set(ex.lar, ex.ouv, 1); u.coins.forEach((c, i) => { const sg = i ? 1 : -1; c.position.x = sg * 0.05 * ex.lar; c.rotation.z = sg * ex.coin; });
  u.lanterne.visible = false; u.flamme.intensity = 0;
}
function animerRoger(t, dt) {
  const u = roger.userData, tr = trajet(TRAJ_ROGER, t);
  const saut = t >= P("trois") && t < P("ines") ? Math.abs(Math.sin((t - P("trois")) * 7)) * 0.35 : 0;
  roger.position.set(tr.x, 0.06 + saut, 1.1);
  const coupe = COUPES.some((c) => Math.abs(t - c) < 0.05);
  const repos = t >= P("famille1") && t < P("annonce") ? -2.4 : -0.55;
  roger.rotation.y = coupe ? repos : lerp(roger.rotation.y, tr.v ? (tr.dir > 0 ? 0 : Math.PI) : repos, clamp(dt * 8));
  const m = t * 12;
  u.pattes.forEach((p, i) => { p.rotation.z = tr.v ? Math.sin(m + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 : 0; });
  u.corps.rotation.z = 0; u.corps.position.y = tr.v ? Math.abs(Math.sin(m)) * 0.05 : 0;
  const grogne = t >= P("caisse") && t < P("prochain");
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
  u.corps.rotation.z = 0; p.rotation.z = 0; p.rotation.x = 0;
  u.yeux.forEach((o) => { o.scale.y = (t + p.position.x) % 3.1 < 0.12 ? 0.1 : 1; });
}
function animerMaire(t, dt) {
  const ok = t >= P("maire") && t < P("rappel"), u = maire.userData;
  maire.position.z = 0.9;
  animerPersonne(maire, { x: -7.4, v: 0, dir: 0 }, t, dt, 0.9, ok);
  if (!ok) return;
  u.sourcils[0].rotation.z = -0.3; u.sourcils[1].rotation.z = 0.3;
  u.bras[0].rotation.set(0.5, 0, 0.15); u.bras[1].rotation.set(0.5, 0, -0.15);
  u.tete.rotation.y = 0.6 + Math.sin(t * 1.5) * 0.05;
}
function animerInspecteur(t, dt) { inspecteur.visible = false; }
function animerFamille(t, dt) {
  // la 1re famille vit au camping, près du premier mobil-home
  [papa, maman, gamin].forEach((p, i) => {
    p.position.z = [0.95, 1.2, 1.25][i]; p.position.y = 0;
    animerPersonne(p, { x: [1.0, 0.3, -0.4][i], v: 0, dir: 0 }, t, dt, 0.7, true);
  });
  if (t >= P("famille1", 1.0) && t < P("pasassez")) papa.userData.bras[1].rotation.set(-1.3, 0, 0.1);
  // les 3 nouvelles familles
  nouveaux.forEach((p, i) => {
    const a = P("trois", 0.2 + i * 0.35);
    p.position.z = 1.05;
    animerPersonne(p, { x: MH_X[i + 1] + 1.0, v: 0, dir: 0 }, t, dt, 0.3, t >= a);
    if (t >= a) { p.scale.setScalar(0.72 * (0.3 + 0.7 * ease(t, a, 0.2))); if (t < P("ines")) p.userData.bras[1].rotation.set(0, 0, -2.6 + Math.sin(t * 8 + i) * 0.2); }
  });
  // Inès
  const ok = t >= P("ines") && t < P("choix");
  const tr = trajet(TRAJ_INES, t), u = ines.userData;
  animerPersonne(ines, tr, t, dt, 0.4, ok);
  if (!ok) return;
  const dP = P("plonge"), dR = P("remonte");
  let y = 0, z = 0.9, rz = 0;
  if (tr.x > 50.3 && t < dP) y = 0.24 * ease(tr.x, 50.2, 0.3);
  if (t >= dP) {
    const sous = ease(t, dP, 1.0) * (1 - ease(t, dR - 0.2, 0.9));
    ines.position.x = lerp(54.3, 54.4, ease(t, dP, 1.0));
    y = lerp(0.24, -0.45, sous); z = lerp(0.9, AVANT + 0.3, clamp(sous * 4));
    rz = t < dR - 0.2 ? -Math.PI / 2 * clamp(sous * 3) : 0;
    if (t >= dR - 0.2 && t < P("sort")) { ines.position.x = lerp(54.4, 53.8, ease(t, dR - 0.2, 0.9)); }
    if (t >= P("sort")) { ines.position.x = 53.4; y = 0.24; z = 0.9; rz = 0; }
    if (sous > 0.05) { u.bras[0].rotation.set(0, 0, 2.8); u.bras[1].rotation.set(0, 0, -2.8); u.jambes[0].rotation.x = Math.sin(t * 10) * 0.4; u.jambes[1].rotation.x = -u.jambes[0].rotation.x; }
  }
  ines.position.y = y; ines.position.z = z; ines.rotation.z = rz;
  if (rz) ines.rotation.y = 0;
  if (t >= P("sort") && t < P("choix")) { u.bras[0].rotation.set(-1.3, 0, 0); u.bras[1].rotation.set(-1.3, 0, 0); }
}
function ambiance(t) {
  const s = soir(t);
  const haut = new THREE.Color("#4f9fdc").lerp(new THREE.Color("#4a3f86"), s), bas = new THREE.Color("#c4e6f5").lerp(new THREE.Color("#f2a768"), s);
  peindreCiel("#" + haut.getHexString(), "#" + bas.getHexString());
  scene.fog.color.copy(bas); scene.fog.near = 40; scene.fog.far = 120;
  etoiles.material.opacity = s * 0.25; lune.material.opacity = 0;
  hemi.intensity = lerp(2.0, 1.55, s); hemi.color.set(s ? "#f0d2c0" : "#cfe3ff");
  luneL.intensity = 0; luneL.castShadow = false;
  soleil.intensity = lerp(2.6, 1.5, s); soleil.color.set(s ? "#ffa860" : "#ffe2b0"); soleil.castShadow = true;
  lumRoger.intensity = 0;
  renderer.toneMappingExposure = lerp(1.05, 1.12, s);
}
function decor(t) {
  mobilHomes.forEach((mh, i) => etatMobilHome(mh, i < 4 ? 1 : 0, t));
  flux.forEach((m, i) => { m.position.x = -6 + ((t * 5 + i * 2.25) % 36); m.visible = m.position.x < 19.6; });
  porteB.rotation.y = -1.6; lumB.intensity = 0;
  reflet.material.opacity = 0.55 + Math.sin(t * 2) * 0.15;
  const s = soir(t); capMat.emissiveIntensity = lerp(0.6, 2.5, s); haloMat.opacity = 0.35 * s * 0.7;
  voiture.position.x = -9.3; voiture.visible = true; phares.intensity = 0;
  // la caisse : au fond, puis sortie sur le ponton
  const up = ease(t, P("sort"), 0.9);
  caisse.position.set(lerp(57.2, 52.0, up), lerp(-0.55, 0.62, up), lerp(AVANT + 0.14, 0.6, clamp(up * 3)));
  caisse.rotation.z = up > 0 && up < 1 ? Math.sin(t * 6) * 0.1 : 0;
  chaineSol.forEach((m) => (m.visible = up < 0.05));
  // bulles quand Inès est sous l'eau
  const dP = P("plonge"), sousEau = t > dP + 0.3 && t < P("remonte", 0.8);
  bulles.forEach((b, i) => { b.visible = sousEau; if (!sousEau) return; const k = ((t * 0.9 + i * 0.137) % 1); b.position.set(ines.position.x + Math.sin(i * 7.1 + t * 3) * 0.25, lerp(ines.position.y + 0.8, -0.05, k), AVANT + 0.35); b.material.opacity = 0.8 * (1 - k); });
}

/* ---------- Interface ---------- */
@@ECRAN_BULLE@@
const SONDAGE = "@@SONDAGE@@";
const SAUTS = [[FP("gain"), 1064, 83, 1], [P("famille1", 2.0), 1714, 82, 1], [P("trois", 1.0), 3664, 82, 1], [P("reste", 0.2), 1664, 81, 1], [P("quatre", 0.3), 1664, 81, 4]];
function hud(t) {
  const oA = vis(t, 2.4, 1e9, 0.3);
  if (oA <= 0) return "";
  let budget = 984, delai = 83, fam = 1, pb = 984, pd = 83, pf = 1, delta = null, deltaF = null;
  for (const [ts, b, d, f] of SAUTS) {
    const p = ease(t, ts, 0.7);
    if (t >= ts) { budget = lerp(pb, b, p); delai = Math.round(lerp(pd, d, p)); fam = f; if (t < ts + 2 && b !== pb) delta = { v: b - pb, o: vis(t, ts, ts + 2, 0.2) }; if (t < ts + 2.5 && f !== pf) deltaF = { v: f - pf, o: vis(t, ts, ts + 2.5, 0.2) }; }
    pb = b; pd = d; pf = f;
  }
  const eclat = (tm) => clamp(1 - Math.abs(t - tm - 0.5) / 0.7);
  const hiB = Math.max(...SAUTS.slice(0, 4).map(([ts]) => eclat(ts)), eclat(P("probleme", 1.2))), hiD = eclat(P("condition", 1.0)), hiF = Math.max(eclat(P("condition", 0.1)), eclat(P("quatre", 0.3)));
  const boite = (cx, lab, val, col, o, hi = 0) => `<g opacity="${o}" transform="translate(${cx},340) scale(${(0.85 + 0.15 * o) * (1 + 0.12 * hi)})">
    ${hi > 0 ? `<rect x="-128" y="-66" width="256" height="124" rx="24" fill="${col}" opacity="${0.35 * hi}"/>` : ""}
    <rect x="-118" y="-56" width="236" height="104" rx="18" fill="${hi > 0.3 ? col : "#121828"}" fill-opacity="${hi > 0.3 ? 0.35 : 1}" stroke="${col}" stroke-width="5"/>
    <text x="0" y="-21" text-anchor="middle" font-family="Inter" font-weight="800" font-size="20" fill="#b9c0d0" letter-spacing="3">${lab}</text>
    <text x="0" y="28" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="${col}">${val}</text></g>`;
  let s = boite(285, "DÉLAI", `${delai} JOURS`, "#ff5a5f", oA, hiD) + boite(540, "FAMILLES", `${fam} / 50`, "#4ade80", oA, hiF) + boite(795, "BUDGET", `${euros(budget)} €`, "#ffc93c", oA, hiB);
  if (delta) s += `<text x="795" y="426" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="${delta.v < 0 ? "#ff5a5f" : "#4ade80"}" opacity="${delta.o}">${delta.v < 0 ? "−" : "+"}${euros(Math.abs(delta.v))} €</text>`;
  if (deltaF) s += `<text x="540" y="426" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#4ade80" opacity="${deltaF.o}">+${deltaF.v} FAMILLES</text>`;
  s += `<g opacity="${oA}" transform="translate(540,${deltaF || delta ? 470 : 452})"><rect x="-170" y="-18" width="340" height="36" rx="18" fill="#121828" stroke="#ff3b5c" stroke-width="3"/><text x="0" y="7" text-anchor="middle" font-family="Inter" font-weight="900" font-size="19" fill="#ffffff">❤ 1 LIKE / 1 ABONNÉ = +1 €</text></g>`;
  return s;
}
function titre(t) {
  const o = vis(t, 0.05, P("maire", -0.1), 0.2); if (o <= 0) return "";
  const k = 0.85 + 0.15 * easeIO(clamp(t / 0.25));
  return `<g opacity="${o}" transform="translate(540,560) scale(${k})" font-family="Inter" font-weight="900" text-anchor="middle" stroke="#0b1020" stroke-width="12" paint-order="stroke" stroke-linejoin="round">
    <text x="0" y="0" font-size="56" fill="#ffc93c">ÉPISODE 5</text><text x="0" y="96" font-size="80" fill="#ffffff">IL Y A QUELQUE CHOSE</text><text x="0" y="186" font-size="80" fill="#ffffff">AU FOND DU LAC</text></g>`;
}
function carteRappel(t) {
  const o = vis(t, P("rappel"), P("vote", -0.1), 0.25); if (o <= 0) return "";
  const l = (a) => clamp((t - a) / 0.3);
  const L = [["CAMPING CÉDÉ POUR", "1 €", "#ffc93c", P("rappel", 1.8)], ["OBJECTIF", "50 FAMILLES", "#4ade80", P("condition", 0.1)], ["DÉLAI", "120 JOURS", "#ff5a5f", P("condition", 0.9)]];
  let s = `<g opacity="${o}" transform="translate(540,${690 + (1 - o) * -30}) scale(${0.85 + 0.15 * o})">
    <rect x="-330" y="-170" width="660" height="390" rx="24" fill="#121828" stroke="#ffffff" stroke-width="6"/>
    <rect x="-110" y="-196" width="220" height="52" rx="26" fill="#ff3b5c"/><text x="0" y="-160" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#fff" letter-spacing="4">RAPPEL</text>`;
  L.forEach(([a, b, c, tm], i) => { s += `<g opacity="${l(tm)}"><text x="-290" y="${-80 + i * 80}" font-family="Inter" font-weight="800" font-size="34" fill="#d5dae5">${a}</text><text x="290" y="${-80 + i * 80}" text-anchor="end" font-family="Inter" font-weight="900" font-size="44" fill="${c}">${b}</text></g>`; });
  s += `<g opacity="${l(P("condition", 1.6))}"><line x1="-290" y1="128" x2="290" y2="128" stroke="#3a4258" stroke-width="3"/><text x="0" y="186" text-anchor="middle" font-family="Inter" font-weight="900" font-size="36" fill="#ff5a5f">SINON → LA MAIRIE LE REPREND</text></g></g>`;
  return s;
}
function sondage(t) {
  const o = vis(t, P("vote", -0.1), P("argent", -0.1), 0.25); if (o <= 0) return "";
  return `<g opacity="${o}" transform="translate(540,${740 + (1 - o) * 30})"><rect x="-386" y="-152" width="772" height="304" rx="26" fill="#000" opacity=".35" transform="translate(6,8)"/>
    <clipPath id="clipS"><rect x="-386" y="-152" width="772" height="304" rx="26"/></clipPath><image href="${SONDAGE}" x="-386" y="-152" width="772" height="304" clip-path="url(#clipS)" preserveAspectRatio="xMidYMid slice"/></g>`;
}
function carteArgent(t) {
  const o = vis(t, P("argent"), P("probleme", -0.2), 0.25); if (o <= 0) return "";
  const l1 = clamp((t - P("argent", 1.0)) / 0.3), l2 = clamp((t - P("argent", 1.9)) / 0.3), l3 = clamp((t - P("gain")) / 0.3);
  return `<g opacity="${o}" transform="translate(540,${660 + (1 - o) * -30}) scale(${0.85 + 0.15 * o})">
    <rect x="-300" y="-120" width="600" height="300" rx="24" fill="#121828" stroke="#ffc93c" stroke-width="7"/>
    <text x="0" y="-62" text-anchor="middle" font-family="Inter" font-weight="900" font-size="38" fill="#ffc93c" letter-spacing="2">L'ARGENT DE L'ÉPISODE 4</text>
    <text x="0" y="0" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="#ffffff" opacity="${l1}"><tspan fill="#ff3b5c">❤</tspan> 70 LIKES = +70 €</text>
    <text x="0" y="60" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="#ffffff" opacity="${l2}"><tspan fill="#4ade80">+</tspan> 10 ABONNÉS = +10 €</text>
    <g opacity="${l3}"><line x1="-240" y1="96" x2="240" y2="96" stroke="#3a4258" stroke-width="3"/><text x="0" y="148" text-anchor="middle" font-family="Inter" font-weight="900" font-size="42" fill="#4ade80">TOTAL : +80 €</text></g></g>`;
}
function telephone(t) {
  const o = vis(t, P("annonce", 0.3), P("trois", 0.6), 0.25); if (o <= 0) return "";
  const notif = (i, tm) => { const p = clamp((t - tm) / 0.25); return p <= 0 ? "" : `<g opacity="${p}" transform="translate(0,${78 + i * 74 - (1 - p) * 20})"><rect x="-150" y="-30" width="300" height="60" rx="14" fill="#ffffff"/><circle cx="-120" cy="0" r="14" fill="#22a55a"/><path d="M-127 0 l5 6 l10 -12" stroke="#fff" stroke-width="4" fill="none"/><text x="-96" y="-4" font-family="Inter" font-weight="900" font-size="18" fill="#1b1b1b">Nouvelle réservation</text><text x="-96" y="18" font-family="Inter" font-weight="700" font-size="15" fill="#6b7280">Mobil-home · 1 semaine · 650 €</text></g>`; };
  return `<g opacity="${o}" transform="translate(540,${720 + (1 - o) * 40}) rotate(-3) scale(${0.85 + 0.15 * o})">
    <rect x="-180" y="-300" width="360" height="600" rx="44" fill="#000" opacity=".3" transform="translate(8,10)"/>
    <rect x="-180" y="-300" width="360" height="600" rx="44" fill="#111"/><rect x="-164" y="-284" width="328" height="568" rx="32" fill="${soir(t) ? "#2a2f45" : "#eef2f7"}"/>
    <rect x="-40" y="-276" width="80" height="18" rx="9" fill="#111"/>
    <g transform="translate(0,-160)"><rect x="-150" y="-90" width="300" height="200" rx="14" fill="#ffffff"/><rect x="-140" y="-80" width="280" height="110" rx="8" fill="#3a82c4"/><path d="M-140 0 q 40 -24 80 0 t 80 0 t 80 0 t 40 0 L 140 30 L -140 30 Z" fill="#2f74b8"/><rect x="-140" y="-80" width="280" height="40" rx="8" fill="#9fd0f0"/><path d="M-120 -40 l 20 -30 l 20 30 Z M -90 -40 l 16 -24 l 16 24 Z" fill="#245a3a"/>
      <text x="-138" y="58" font-family="Inter" font-weight="900" font-size="19" fill="#1b1b1b">Camping au bord</text><text x="-138" y="82" font-family="Inter" font-weight="900" font-size="19" fill="#1b1b1b">d'un lac privé 🌊</text><text x="138" y="82" text-anchor="end" font-family="Inter" font-weight="900" font-size="18" fill="#22a55a">650 €/sem.</text></g>
    ${notif(0, P("resa"))}${notif(1, P("resa", 0.95))}${notif(2, P("resa", 1.5))}</g>`;
}
function calcul(t) {
  const o = vis(t, P("trois", 0.7), P("verifier", -0.2), 0.25); if (o <= 0) return "";
  const L = [["Budget", "1 064 €", P("trois", 0.7)], ["1re famille", "+ 650 €", P("trois", 1.0)], ["3 nouvelles familles", "+ 1 950 €", P("trois", 1.4)], ["Inès (1 mois)", "− 2 000 €", P("ines", 1.0)]];
  const h = 120 + L.length * 56 + 70;
  let s = `<g opacity="${o}" transform="translate(540,${510 + (1 - o) * -30}) rotate(-2)">
    <rect x="-300" y="0" width="600" height="${h}" rx="6" fill="#000" opacity=".25" transform="translate(8,10)"/><rect x="-300" y="0" width="600" height="${h}" rx="6" fill="#fbf7ec"/>`;
  for (let y = 70; y < h; y += 56) s += `<line x1="-300" y1="${y}" x2="300" y2="${y}" stroke="#cdd9ee" stroke-width="2"/>`;
  s += `<line x1="-240" y1="0" x2="-240" y2="${h}" stroke="#ef9a9a" stroke-width="3"/><text x="0" y="52" text-anchor="middle" font-family="Inter" font-weight="900" font-size="32" fill="#1b1b1b" letter-spacing="2">LE CALCUL</text>`;
  L.forEach(([a, b, tm], i) => { const y = 116 + i * 56; s += `<g opacity="${clamp((t - tm) / 0.2)}"><text x="-222" y="${y}" font-family="Inter" font-weight="800" font-size="27" fill="#2b2b2b">${a}</text><text x="272" y="${y}" text-anchor="end" font-family="Inter" font-weight="900" font-size="28" fill="${b[0] === "−" ? "#e23b3b" : "#2b2b2b"}">${b}</text></g>`; });
  const yt = 116 + L.length * 56 + 6;
  s += `<g opacity="${clamp((t - P("reste", 0.2)) / 0.2)}"><line x1="-222" y1="${yt - 36}" x2="272" y2="${yt - 36}" stroke="#1b1b1b" stroke-width="3"/><text x="-222" y="${yt + 4}" font-family="Inter" font-weight="900" font-size="28" fill="#22a55a">IL RESTE</text><text x="272" y="${yt + 4}" text-anchor="end" font-family="Inter" font-weight="900" font-size="32" fill="#22a55a">1 664 €</text></g>`;
  return s + `</g>`;
}
function profondeur(t) {
  const o = vis(t, P("plonge"), P("caisse"), 0.25); if (o <= 0) return "";
  const d = clamp(-ines.position.y / 0.45) * 4;
  return `<g opacity="${o}" transform="translate(965,1080)"><rect x="-40" y="-20" width="80" height="250" rx="16" fill="#121828" opacity=".85"/><rect x="-6" y="0" width="12" height="200" rx="6" fill="#3a4258"/><rect x="-6" y="0" width="12" height="${d * 50}" rx="6" fill="#4fa3ff"/>
    <text x="0" y="-30" text-anchor="middle" font-family="Inter" font-weight="900" font-size="22" fill="#ffffff" stroke="#0b1020" stroke-width="5" paint-order="stroke">${d.toFixed(1).replace(".", ",")} m</text><text x="0" y="222" text-anchor="middle" font-family="Inter" font-weight="900" font-size="18" fill="#9fb3cf">4 m</text></g>`;
}
function carteCaisse(t) {
  const o = vis(t, P("dessus", 0.1), P("prochain", 1.0), 0.25); if (o <= 0) return "";
  const g = clamp((t - P("dessus", 1.2)) / 0.3);
  let ch = ""; for (let i = 0; i < 12; i++) ch += `<ellipse cx="${-250 + i * 46}" cy="${-30 + (i % 2) * 6}" rx="${i % 2 ? 22 : 9}" ry="${i % 2 ? 9 : 16}" fill="none" stroke="#9aa1aa" stroke-width="7"/>`;
  return `<g opacity="${o}" transform="translate(540,${700 + (1 - o) * -30}) rotate(-2) scale(${0.85 + 0.15 * o})">
    <rect x="-270" y="-170" width="540" height="340" rx="18" fill="#000" opacity=".3" transform="translate(8,10)"/>
    <rect x="-270" y="-170" width="540" height="340" rx="18" fill="#59606a" stroke="#2b2f34" stroke-width="10"/>
    <rect x="-150" y="-170" width="36" height="340" fill="#3a3f45"/><rect x="114" y="-170" width="36" height="340" fill="#3a3f45"/>
    ${[[-240, -140], [240, -140], [-240, 140], [240, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#2b2f34"/>`).join("")}
    <path d="M-200 60 q 40 -20 80 10 M 90 -100 q 50 30 100 0" stroke="#7b5b3a" stroke-width="10" fill="none" opacity=".6"/>
    ${ch}
    <g opacity="${g}" transform="scale(${1 + 0.3 * (1 - g)})"><text x="0" y="70" text-anchor="middle" font-family="Liberation Serif, serif" font-weight="700" font-size="190" fill="#2b2f34" opacity=".55" transform="translate(4,5)">13</text><text x="0" y="70" text-anchor="middle" font-family="Liberation Serif, serif" font-weight="700" font-size="190" fill="#c9ced6">13</text></g></g>`;
}
const ETIQUETTES = [["IL MANQUE 936 €", "manque", 0.4, "famille1", 640, "#e63946"], ["BAIGNADE OUVERTE ?", "verifier", 0.3, "plonge", 640, "#2b7bd6"], ["UNE CAISSE ENCHAÎNÉE", "caisse", 0.2, "dessus", 640, "#e63946"], ["LE BUNGALOW 13 ?!", "bungalow", 0.1, "place", 1010, "#e63946"], ["12 FAMILLES EN ATTENTE", "place", 0.6, "choix", 640, "#e63946"]];
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
    <text x="0" y="58" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="${col}">${titre}</text><text x="0" y="96" text-anchor="middle" font-family="Inter" font-weight="800" font-size="20" fill="#b9c0d0" letter-spacing="2">${sous}</text></g>`;
  const cc = `<g transform="translate(0,-40)"><rect x="-70" y="-30" width="130" height="56" rx="10" fill="#f2f2f2"/><rect x="40" y="-14" width="34" height="40" rx="6" fill="#f2f2f2"/><rect x="-56" y="-18" width="34" height="18" rx="3" fill="#4fa3ff"/><rect x="-14" y="-18" width="34" height="18" rx="3" fill="#4fa3ff"/><rect x="-70" y="6" width="144" height="8" fill="#ffc93c"/><circle cx="-40" cy="30" r="12" fill="#1b1b1b"/><circle cx="44" cy="30" r="12" fill="#1b1b1b"/></g>`;
  const mh = `<g transform="translate(0,-40)"><rect x="-80" y="-24" width="160" height="56" rx="6" fill="#e8e2d4"/><path d="M-88 -24 L0 -50 L88 -24 Z" fill="#7a5b3a"/><rect x="-60" y="-10" width="30" height="22" fill="#4fa3ff"/><rect x="30" y="-6" width="24" height="38" fill="#4a7a4a"/></g>`;
  s += carte(280, "CAMPING-CAR", "1 200 € L'EMPLACEMENT", "#ffc93c", cc, vis(t, a, b, 0.25));
  s += carte(800, "MOBIL-HOME", "9 000 € LA RÉNOVATION", "#4ade80", mh, vis(t, P("choix", 2.2), b, 0.25));
  const oo = vis(t, P("choix", 1.9), b, 0.2); if (oo > 0) s += `<g opacity="${oo}"><circle cx="540" cy="640" r="44" fill="#ffffff"/><text x="540" y="654" text-anchor="middle" font-family="Inter" font-weight="900" font-size="36" fill="#1b1b1b">OU</text></g>`;
  const oc = vis(t, P("comment"), b, 0.25); if (oc > 0) s += `<g opacity="${oc}" transform="translate(540,860) scale(${0.85 + 0.15 * oc})"><rect x="-400" y="-38" width="800" height="76" rx="38" fill="#ff3b5c"/><text x="0" y="12" text-anchor="middle" font-family="Inter" font-weight="900" font-size="29" fill="#fff">ÉCRIS « CAMPING-CAR » OU « MOBIL-HOME »</text></g>`;
  const on = vis(t, P("noms"), b, 0.25); if (on > 0) s += `<g opacity="${on}" transform="translate(540,960) rotate(-3) scale(${0.85 + 0.15 * on})"><rect x="-410" y="-46" width="820" height="92" rx="14" fill="#ffc93c" stroke="#ffffff" stroke-width="5"/><text x="0" y="-6" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#1b1b1b">LES 3 PREMIERS COMMENTAIRES</text><text x="0" y="30" text-anchor="middle" font-family="Inter" font-weight="900" font-size="26" fill="#1b1b1b">= LE NOM DES NOUVEAUX EMPLACEMENTS</text></g>`;
  return s;
}
@@SOUSTITRES@@
function carteFin(t) {
  const a = DUREE - 2.6, o = clamp((t - a) / 0.35); if (o <= 0) return "";
  return `<g opacity="${o}"><rect width="1080" height="1920" fill="#0b0f1c" opacity=".88"/>
    <text x="540" y="740" text-anchor="middle" font-family="Inter" font-weight="900" font-size="38" fill="#4ade80" letter-spacing="6">LES PINS PERDUS · SAISON 1</text>
    <text x="540" y="840" text-anchor="middle" font-family="Inter" font-weight="900" font-size="88" fill="#ffffff">ÉPISODE 6</text>
    <text x="540" y="930" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" fill="#ffc93c">ON OUVRE LA CAISSE</text>
    <g transform="translate(540,1100)"><rect x="-360" y="-44" width="720" height="88" rx="44" fill="#ff3b5c"/><text x="0" y="14" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="#fff">+ ABONNE-TOI = +1 € POUR LE CAMPING</text></g></g>`;
}
const FLASHS = [P("dessus", 1.2), P("trois", 0.2)];
function interface_(t) {
  let s = "";
  const [mx, my] = ecran(malo, 3.6), [rx, ry] = ecran(roger, 1.6), [ax, ay] = ecran(maire, 3.4), [ix, iy] = ecran(ines, 3.4), [px, py] = ecran(papa, 3.4);
  const Bb = (x, y, txt, c, o) => bulle(clamp(x, 220, 860), clamp(y, 560, 1000), txt, c, o);
  s += titre(t) + hud(t) + etiquettes(t) + carteRappel(t) + sondage(t) + carteArgent(t) + telephone(t) + calcul(t) + carteCaisse(t) + profondeur(t);
  s += choix(t);
  s += Bb(ax, ay, "…", "#ffffff", vis(t, P("maire", 0.2), P("rappel"), 0.15));
  s += Bb(px, py, "+650 €", "#4ade80", vis(t, P("famille1", 1.4), P("pasassez"), 0.15));
  s += Bb(mx, my, "DRING !", "#ffffff", vis(t, P("soir", 1.0), P("resa"), 0.15));
  s += Bb(ix, iy, "JE VÉRIFIE LE FOND", "#ffffff", vis(t, P("verifier", 0.8), P("plonge", -0.2), 0.15));
  s += Bb(rx, ry, "GRRR…", "#ffffff", vis(t, P("sort", 0.8), P("bungalow"), 0.2));
  s += sousTitres(t);
  for (const ft of FLASHS) { const o = 0.45 * clamp(1 - (t - ft) / 0.3); if (t >= ft && o > 0) s += `<rect width="1080" height="1920" fill="#ffffff" opacity="${o.toFixed(3)}"/>`; }
  for (const c of COUPES) { const o = clamp(1 - Math.abs(t - c) / 0.22); if (o > 0) s += `<rect width="1080" height="1920" fill="#000" opacity="${(o * 0.9).toFixed(3)}"/>`; }
  s += carteFin(t);
  document.getElementById("ui").innerHTML = s;
}

/* ---------- Bruitages ---------- */
const EVENEMENTS = [];
const ev = (t, type, d = 0) => { if (t >= 0) EVENEMENTS.push({ t: +t.toFixed(3), type, d }); };
[P("rappel"), P("vote"), P("argent"), P("annonce", 0.3), P("trois", 0.7), P("choix"), P("comment"), P("noms")].forEach((t) => ev(t, "pop"));
ev(FP("gain"), "kaching"); ev(P("manque", 0.4), "tampon"); ev(P("famille1", 2.0), "kaching");
[P("resa"), P("resa", 0.95), P("resa", 1.5)].forEach((t) => ev(t, "ding"));
ev(P("trois", 1.0), "kaching"); ev(P("quatre", 0.3), "coche");
ev(P("plonge", 0.3), "eau", 1.2); ev(P("caisse", 0.2), "tampon"); ev(P("sort"), "eau", 0.9);
ev(P("dessus", 1.2), "ding"); ev(P("sort", 0.9), "wouf");
ev(DUREE - 2.6, "fin");
window.EVENEMENTS = EVENEMENTS;
