// DE 0 À ROI — Épisode 1 « La livraison » — rendu image par image
const W = 720, H = 1280, FPS = 30;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ease = u => u * u * (3 - 2 * u);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
let T = 0;
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const out = document.getElementById('out'); out.width = W; out.height = H;
const ctx = out.getContext('2d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 900);

const gm = new THREE.DataTexture(new Uint8Array([105, 105, 105, 255, 185, 185, 185, 255, 255, 255, 255, 255]), 3, 1);
gm.needsUpdate = true; gm.minFilter = gm.magFilter = THREE.NearestFilter;
const toon = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: gm, ...o });
const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
const OUT = basic(0x111111, { side: THREE.BackSide });
const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
function skyTex(stops) { const [c, x] = cnv(4, 512); const g = x.createLinearGradient(0, 0, 0, 512); stops.forEach(([p, col]) => g.addColorStop(p, col)); x.fillStyle = g; x.fillRect(0, 0, 4, 512); return tex(c); }
const SKY = {
  day: skyTex([[0, '#2c86e0'], [.55, '#7cc4f5'], [1, '#d8f0ff']]),
  sunset: skyTex([[0, '#2b1d63'], [.35, '#8a3f9e'], [.62, '#ff6f61'], [.85, '#ffb46b'], [1, '#ffd89a']]),
  night: skyTex([[0, '#03040e'], [.55, '#0e1638'], [1, '#3a2156']]),
};
const hemi = new THREE.HemisphereLight(0xcfe6ff, 0xc9a27a, 1.3); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 2.6); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 200 });
sun.shadow.bias = -0.0008; scene.add(sun, sun.target);
const FILL = new THREE.PointLight(0xfff4e6, 0, 0, 0); scene.add(FILL);
const add = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; scene.add(m); return m; };
const box = (w, h, d, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return add(m, cast); };
function plane(w, d, col, x, y, z, mat) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat || toon(col)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); return add(m, false); }

// ---------- la ville : Porto Soleil ----------
plane(900, 900, 0xd6cbbb, 0, 0, 0);                 // sol
plane(12, 520, 0, 0, .02, -50, toon(0x3b3f48));      // boulevard
plane(8, 520, 0xead3c6, 10, .03, -50);               // promenade
plane(60, 520, 0xf2dca8, 44, .025, -50);             // plage
const SEA = toon(0x2aa7cf, { emissive: 0x06384a }); plane(800, 900, 0, 470, .04, -50, SEA);
for (const z of [40, -40, -130]) plane(90, 10, 0, -45, .021, z, toon(0x3b3f48));
plane(12, 26, 0, 11, .035, 92, toon(0x55595f));      // parking de la plage
{ // pointillés
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(.18, .02, 2.2), basic(0xf4e9c8), 90); const m4 = new THREE.Matrix4();
  for (let i = 0; i < 90; i++) { m4.makeTranslation(0, .04, 200 - i * 5.6); im.setMatrixAt(i, m4); } scene.add(im);
  const pk = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, .02, 4.5), basic(0xffffff), 6);
  for (let i = 0; i < 6; i++) { m4.makeTranslation(9.5 + (i % 2) * 3, .045, 82 + Math.floor(i / 2) * 7); pk.setMatrixAt(i, m4); } scene.add(pk);
}
// fenêtres : texture jour / nuit
const [wd, wx] = cnv(128, 128), [wn, wnx] = cnv(128, 128);
wx.fillStyle = '#fff'; wx.fillRect(0, 0, 128, 128); wnx.fillStyle = '#000'; wnx.fillRect(0, 0, 128, 128);
for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
  wx.fillStyle = '#5b86a8'; wx.fillRect(10 + i * 30, 12 + j * 30, 18, 20);
  wnx.fillStyle = rnd() < .55 ? (rnd() < .5 ? '#ffd38a' : '#ffe9c2') : '#1a1a2a'; wnx.fillRect(10 + i * 30, 12 + j * 30, 18, 20);
}
const WIN_D = tex(wd), WIN_N = tex(wn);
const buildings = []; const FOOT = [];
const PASTEL = [0xf6b3c8, 0x9fe0d0, 0xfff1d6, 0x8fd3f0, 0xf9d48a, 0xe8b4f0, 0xffffff, 0xf3a79a];
function building(x, z, w, d, h, col) {
  if (x + w / 2 > -78 && x - w / 2 < -46 && z + d / 2 > 44 && z - d / 2 < 76) return null;
  const mk = () => { const a = WIN_D.clone(), b = WIN_N.clone(); [a, b].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; }); return [a, b]; };
  const [a1, b1] = mk(), [a2, b2] = mk();
  a1.repeat.set(Math.max(1, Math.round(d / 5)), Math.max(1, Math.round(h / 4))); b1.repeat.copy(a1.repeat);
  a2.repeat.set(Math.max(1, Math.round(w / 5)), Math.max(1, Math.round(h / 4))); b2.repeat.copy(a2.repeat);
  const s1 = toon(col, { map: a1, emissive: 0xffd28a, emissiveMap: b1, emissiveIntensity: 0 });
  const s2 = toon(col, { map: a2, emissive: 0xffd28a, emissiveMap: b2, emissiveIntensity: 0 });
  const top = toon(new THREE.Color(col).multiplyScalar(.75));
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [s1, s1, top, top, s2, s2]); m.position.set(x, h / 2, z); add(m);
  buildings.push(s1, s2); FOOT.push([x, z, w, d]);
  if (h < 26) box(w + .4, .5, d + .4, toon(PASTEL[(Math.abs(x * 7 + z) | 0) % PASTEL.length]), x, h + .25, z); // corniche art déco
  return m;
}
for (let z = 186; z > -300; z -= 21) {
  if ([40, -40, -130].some(c => Math.abs(z - c) < 9)) continue;
  const down = z < -140, w = 12 + rnd() * 6, h = down ? 28 + rnd() * 45 : 9 + rnd() * 14;
  building(-12 - w / 2, z, w, 15, h, PASTEL[Math.floor(rnd() * PASTEL.length)]);
  const w2 = 14 + rnd() * 8; building(-40 - w2 / 2, z + rnd() * 6, w2, 17, (down ? 45 : 22) + rnd() * 40, PASTEL[Math.floor(rnd() * PASTEL.length)]);
  building(-75 - rnd() * 10, z, 16, 16, 30 + rnd() * 60, PASTEL[Math.floor(rnd() * PASTEL.length)]);
}
const TOWER = building(-34, -205, 16, 16, 92, 0xdff3ff);
box(17, 1.2, 17, toon(0xb9c8d6), -34, 92.6, -205); // toit
// néons
function neon(text, col, w, h, x, y, z, ry, font = 90) {
  const [c, x2] = cnv(1024, 256); x2.fillStyle = 'rgba(10,8,20,.92)'; x2.beginPath(); x2.roundRect(8, 8, 1008, 240, 40); x2.fill();
  x2.strokeStyle = col; x2.lineWidth = 10; x2.shadowColor = col; x2.shadowBlur = 30; x2.stroke();
  x2.font = `900 ${font}px Inter`; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.fillStyle = '#fff'; x2.shadowBlur = 40; x2.fillText(text, 512, 132); x2.fillText(text, 512, 132);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic(0xffffff, { map: tex(c), transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m;
}
// garage du Pélican (façade vers +x)
building(-17, 60, 14, 13, 7, 0xf9d48a);
box(.1, 4.2, 7, basic(0x1d1f26), -9.95, 2.1, 60, false);
neon('GARAGE DU PÉLICAN', '#3ee0ff', 7.5, 1.9, -9.85, 5.6, 60, Math.PI / 2, 92);
box(1.6, .9, 1, toon(0x7a5232), -8.4, .45, 61.6); // établi
const PKG = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(.5, .4, .5), toon(0xb98a55)); PKG.add(b);
  const t = new THREE.Mesh(new THREE.BoxGeometry(.52, .41, .1), toon(0xe9dcc0)); PKG.add(t); PKG.traverse(o => o.castShadow = true); scene.add(PKG); }
const LID = new THREE.Mesh(new THREE.BoxGeometry(.52, .05, .52), toon(0xa97a48)); PKG.add(LID); LID.position.y = .22;
const GLOW = new THREE.Mesh(new THREE.SphereGeometry(.35, 16, 12), basic(0xffd75a, { transparent: true, opacity: .8, depthWrite: false })); PKG.add(GLOW);
const GLOWL = new THREE.PointLight(0xffc640, 0, 10, 1.6); PKG.add(GLOWL);
// club de Madame Ruby (façade vers +x)
building(-18, -120, 16, 16, 12, 0x3b2a55);
box(.1, 3.2, 2.4, basic(0x0b0b12), -9.95, 1.6, -120, false);
neon('RUBY CLUB', '#ff3fa4', 9, 2.4, -9.85, 7.5, -120, Math.PI / 2, 130);
neon('MOTEL', '#ffd23f', 4, 1.2, -9.85, 6, 100, Math.PI / 2, 120);
neon('PORTO SOLEIL', '#ff8a3d', 10, 2.5, -9.85, 9, 15, Math.PI / 2, 110);
// tapis rouge
box(2.2, .03, 3, toon(0xb2223c), -8.8, .03, -120, false);
// palmiers
{
  const P = []; for (let z = 190; z > -290; z -= 13) P.push([8.5, z]); for (let z = 180; z > -290; z -= 19) P.push([-8.6, z + 6]);
  for (let i = 0; i < 25; i++) P.push([20 + rnd() * 22, 160 - i * 18 + rnd() * 6]);
  const seg = new THREE.InstancedMesh(new THREE.CylinderGeometry(.2, .26, 2.4, 7), toon(0x9b7650), P.length * 4);
  const leaf = new THREE.InstancedMesh(new THREE.ConeGeometry(.55, 3.6, 4), toon(0x3f9e4a), P.length * 8);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); let si = 0, li = 0; const c = new THREE.Color();
  P.forEach(([x, z], k) => {
    const lean = (rnd() - .5) * .5, h = 6 + rnd() * 3, L = h / 4;
    for (let sg = 0; sg < 4; sg++) { q.setFromEuler(e.set(0, 0, -lean * .35 * (sg + .5)));
      m4.compose(V(x + lean * (sg + .5) * (sg + .5) * .25, L * (sg + .5), z), q, V(1 - sg * .1, L / 2.4, 1 - sg * .1)); seg.setMatrixAt(si++, m4); }
    const top = V(x + lean * 4, h, z);
    for (let l = 0; l < 8; l++) { const ang = l / 8 * Math.PI * 2 + rnd() * .3;
      q.setFromEuler(e.set(0, -ang, 0)); const qq = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -Math.PI / 2 - .35)); q.multiply(qq);
      m4.compose(V(top.x + Math.cos(ang) * 1.6, top.y - .2, top.z + Math.sin(ang) * 1.6), q, V(1, 1, .25)); leaf.setMatrixAt(li, m4); leaf.setColorAt(li++, c.set(l % 2 ? 0x3f9e4a : 0x5cb85c)); }
  });
  seg.castShadow = leaf.castShadow = true; scene.add(seg, leaf);
}
// lampadaires
const BULB = basic(0xfff3c8);
{ const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(.08, .1, 6, 6), toon(0x2b2f38), 80), bulb = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 10, 8), BULB, 80); const m4 = new THREE.Matrix4(); let i = 0;
  for (let z = 196; z > -290 && i < 80; z -= 12.5) for (const x of [-6.6, 6.6]) { if (i >= 80) break; m4.makeTranslation(x, 3, z); pole.setMatrixAt(i, m4); m4.makeTranslation(x * .9, 6.05, z); bulb.setMatrixAt(i, m4); i++; }
  scene.add(pole, bulb); }
// cartons
const CARTONS = []; for (let i = 0; i < 9; i++) { const b = box(.8, .8, .8, toon(i % 2 ? 0xc0925e : 0xa97b4a), 0, 0, 0); b.userData.base = V(-5.4 + (i % 3) * .85 - .85, .4 + Math.floor(i / 3) * .82, -58 + (i % 2) * .3); CARTONS.push(b); }

// ---------- voitures ----------
function car({ col, convertible, black }) {
  const g = new THREE.Group(); const body = toon(col);
  const b = new THREE.Mesh(new THREE.BoxGeometry(2.1, .7, 4.6), body); b.position.y = .75; g.add(b);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(2.0, .25, 1.3), body); nose.position.set(0, 1.2, -1.6); nose.rotation.x = .08; g.add(nose);
  if (convertible) {
    for (const x of [-.45, .45]) { const s = new THREE.Mesh(new THREE.BoxGeometry(.7, .7, .3), toon(0x7a2e22)); s.position.set(x, 1.3, .55); g.add(s); }
    const ws = new THREE.Mesh(new THREE.BoxGeometry(1.9, .55, .06), basic(0xbfe6ff, { transparent: true, opacity: .45 })); ws.position.set(0, 1.4, -.65); ws.rotation.x = -.35; g.add(ws);
    const sw = new THREE.Mesh(new THREE.TorusGeometry(.17, .035, 6, 16), toon(0x111111)); sw.position.set(-.45, 1.32, -.3); sw.rotation.x = -1; g.add(sw);
    for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.CircleGeometry(.12 + rnd() * .12, 6), toon(0x8a4a2a)); r.position.set(1.051, .6 + rnd() * .35, -2 + i * .8); r.rotation.y = Math.PI / 2; g.add(r); } // rouille
  } else {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, .7, 2.3), toon(0x0c0d10)); cab.position.set(0, 1.45, .3); g.add(cab);
  }
  for (const [x, z] of [[-1.02, 1.45], [1.02, 1.45], [-1.02, -1.45], [1.02, -1.45]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .3, 14), toon(0x1a1a1a)); w.rotation.z = Math.PI / 2; w.position.set(x, .42, z); g.add(w); }
  for (const x of [-.7, .7]) { const h = new THREE.Mesh(new THREE.BoxGeometry(.4, .18, .05), basic(0xfff6d0)); h.position.set(x, .85, -2.31); g.add(h);
    const r = new THREE.Mesh(new THREE.BoxGeometry(.4, .16, .05), basic(0xff2a2a)); r.position.set(x, .85, 2.31); g.add(r); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g;
}
const HERO = car({ col: 0xe07a3a, convertible: true });
const BLACK = car({ col: 0x16171b });

// ---------- personnages ----------
const faceCache = {};
function faceTex(expr, must, kind = '') {
  const key = expr + must + kind; if (faceCache[key]) return faceCache[key];
  const [c, x] = cnv(1024, 512); const cx = 256, cy = 250; x.lineCap = x.lineJoin = 'round'; x.strokeStyle = x.fillStyle = '#111'; x.lineWidth = 8;
  const P = (a, b) => [cx + a, cy + b];
  const dot = (a, b, r = 14) => { x.fillStyle = '#111'; x.beginPath(); x.arc(...P(a, b), r, 0, 7); x.fill(); };
  const line = (a, b, c2, d, w = 8) => { x.lineWidth = w; x.beginPath(); x.moveTo(...P(a, b)); x.lineTo(...P(c2, d)); x.stroke(); };
  const [eyes, mouth] = {
    neutral: ['dot', 'flat'], smile: ['dot', 'smile'], smug: ['lid', 'smirk'], laugh: ['happy', 'laugh'], talk: ['dot', 'talk'],
    happy: ['big', 'grin'], determined: ['angry', 'flat'], grin: ['angry', 'grin'], blink: ['closed', 'flat'], sleep: ['closed', 'O'],
    surprised: ['big', 'O'], shock: ['big', 'talk'], cool: ['shades', 'smirk'], cooltalk: ['shades', 'talk'],
  }[expr];
  if (eyes === 'shades') { x.fillStyle = '#111'; x.beginPath(); x.roundRect(cx - 86, cy - 44, 74, 44, 14); x.roundRect(cx + 12, cy - 44, 74, 44, 14); x.fill(); line(-12, -30, 12, -30, 8);
    x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(cx - 74, cy - 38, 18, 8); x.fillRect(cx + 24, cy - 38, 18, 8); }
  else for (const s of [-1, 1]) {
    const ex = s * 48, ey = -22;
    if (eyes === 'dot') dot(ex, ey);
    if (eyes === 'big') { x.fillStyle = '#fff'; x.beginPath(); x.arc(...P(ex, ey), 30, 0, 7); x.fill(); x.lineWidth = 6; x.stroke(); dot(ex - s * 3, ey + 2, 12); }
    if (eyes === 'lid') { dot(ex, ey, 15); x.fillStyle = '#fff'; x.fillRect(cx + ex - 20, cy + ey - 20, 40, 19); line(ex - 20, ey - 1, ex + 20, ey - 1, 7); }
    if (eyes === 'happy') { x.lineWidth = 8; x.beginPath(); x.arc(...P(ex, ey + 8), 16, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); }
    if (eyes === 'closed') line(ex - 15, ey, ex + 15, ey, 7);
    if (eyes === 'angry') { dot(ex, ey, 13); line(ex - s * 22, ey - 40, ex + s * 18, ey - 26, 8); }
  }
  const my = must ? 52 : 46; x.lineWidth = 8; x.beginPath();
  if (mouth === 'flat') line(-22, my, 22, my);
  if (mouth === 'smile') { x.arc(...P(0, my - 26), 30, Math.PI * .2, Math.PI * .8); x.stroke(); }
  if (mouth === 'smirk') { x.moveTo(...P(-24, my + 4)); x.quadraticCurveTo(...P(6, my + 12), ...P(28, my - 8)); x.stroke(); }
  if (mouth === 'laugh') { x.ellipse(cx, cy + my - 10, 40, 38, 0, 0, Math.PI); x.closePath(); x.fill(); }
  if (mouth === 'talk') { x.ellipse(cx, cy + my, 15, 12, 0, 0, 7); x.fill(); }
  if (mouth === 'O') { x.arc(...P(0, my), 11, 0, 7); x.stroke(); }
  if (mouth === 'grin') { x.fillStyle = '#fff'; x.beginPath(); x.roundRect(cx - 42, cy + my - 16, 84, 32, 14); x.fill(); x.lineWidth = 6; x.stroke(); line(-42, my, 42, my, 4); for (const t of [-21, 0, 21]) line(t, my - 16, t, my + 16, 4); }
  if (must) { x.fillStyle = '#2a1a10'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(cx + s * 24, cy + 28, 28, 10, s * -0.3, 0, 7); x.fill(); } }
  if (kind === 'lina' && eyes !== 'shades') for (const s of [-1, 1]) { line(s * 62, -30, s * 74, -40, 5); line(s * 54, -36, s * 60, -48, 5); }
  if (kind === 'maxi') { x.fillStyle = 'rgba(20,14,10,.9)'; x.beginPath(); x.ellipse(cx, cy + 82, 22, 16, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(cx - 20, cy + 32, 22, 6, .15, 0, 7); x.ellipse(cx + 20, cy + 32, 22, 6, -.15, 0, 7); x.fill(); }
  if (kind === 'nico') { x.fillStyle = 'rgba(40,25,15,.18)'; x.beginPath(); x.ellipse(cx, cy + 70, 70, 34, 0, 0, Math.PI); x.fill(); }
  if (eyes === 'dot' || eyes === 'big' || eyes === 'lid') for (const s of [-1, 1]) line(s * 34, -50, s * 64, -54, 6);
  return (faceCache[key] = tex(c));
}
function outlined(geo, mat, s = 1.06) { const g = new THREE.Group(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; g.add(m); const o = new THREE.Mesh(geo, OUT); o.scale.setScalar(s); g.add(o); return g; }
const chars = [];
function makeChar({ shirt, pants = 0x2f4f86, shoes = 0xf2f2f2, skin = 0xe0ac7e, sleeve, hat, hatCol, hatBack, hairStyle, hairCol = 0x1a120d, kind = '', must = false, scale = 1, chain = false }) {
  const g = new THREE.Group(); const ch = { g, must, kind, scale }; g.scale.setScalar(scale);
  const S = toon(skin), P = toon(pants), SH = toon(shirt), SL = toon(sleeve ?? shirt);
  const torso = outlined(new THREE.CapsuleGeometry(.3, .34, 6, 16), SH, 1.06); torso.position.y = 1.04; torso.scale.set(1, 1, .8); g.add(torso);
  const hips = outlined(new THREE.CylinderGeometry(.27, .25, .2, 16), P, 1.06); hips.position.y = .8; g.add(hips);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .16, 10), S); neck.position.y = 1.44; g.add(neck);
  ch.legs = [-1, 1].map(s => { const h = new THREE.Group(); h.position.set(s * .13, .76, 0);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(.08, .07, .7, 10), P); l.position.y = -.35; h.add(l);
    const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(.075, .16, 4, 8), toon(shoes)); shoe.rotation.x = Math.PI / 2; shoe.position.set(0, -.71, .07); h.add(shoe);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(.15, .03, .33), toon(0xffffff)); sole.position.set(0, -.775, .07); h.add(sole); g.add(h); return h; });
  ch.arms = [1, -1].map(s => { const h = new THREE.Group(); h.position.set(s * .31, 1.26, 0);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(.075, .065, .3, 10), SL); up.position.y = -.15; h.add(up);
    const fo = new THREE.Mesh(new THREE.CylinderGeometry(.055, .05, .28, 10), S); fo.position.y = -.42; h.add(fo);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), S); hand.position.y = -.58; h.add(hand); ch['hand' + (s > 0 ? 'L' : 'R')] = hand; g.add(h); return h; });
  const head = new THREE.Group(); head.position.y = 1.78; g.add(head); ch.head = head;
  head.add(outlined(new THREE.SphereGeometry(.52, 36, 24), S, 1.05));
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), S); ear.scale.set(.5, 1, .8); ear.position.set(s * .51, -.02, 0); head.add(ear); }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), toon(new THREE.Color(skin).multiplyScalar(.9))); nose.scale.set(.9, 1.1, .8); nose.position.set(0, -.06, .52); head.add(nose);
  ch.faceMat = basic(0xffffff, { map: faceTex('neutral', must, kind), transparent: true, depthWrite: false });
  head.add(new THREE.Mesh(new THREE.SphereGeometry(.523, 48, 24), ch.faceMat));
  const H = toon(hairCol);
  if (hairStyle === 'court') { const c = outlined(new THREE.SphereGeometry(.545, 28, 16, 0, Math.PI * 2, 0, Math.PI * .5), H, 1.03); c.rotation.x = -.35; c.position.set(0, .02, -.03); head.add(c); }
  if (hairStyle === 'long') {
    const c = outlined(new THREE.SphereGeometry(.56, 28, 16, 0, Math.PI * 2, 0, Math.PI * .5), H, 1.03); c.rotation.x = -.5; c.position.set(0, .02, -.03); head.add(c);
    const back = outlined(new THREE.CapsuleGeometry(.4, .62, 6, 14), H, 1.04); back.scale.z = .55; back.position.set(0, -.42, -.3); head.add(back);
    for (const s of [-1, 1]) { const st = outlined(new THREE.CapsuleGeometry(.12, .55, 4, 10), H, 1.06); st.position.set(s * .42, -.4, -.2); st.rotation.z = s * .12; head.add(st);
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(.08, .014, 6, 18), toon(0xf2c230, { emissive: 0x403000 })); hoop.position.set(s * .53, -.2, .05); hoop.rotation.y = Math.PI / 2; head.add(hoop); }
    const fringe = outlined(new THREE.CapsuleGeometry(.12, .5, 4, 10), H, 1.05); fringe.rotation.z = Math.PI / 2 - .3; fringe.position.set(-.1, .43, .3); fringe.scale.setScalar(.8); head.add(fringe);
    const lunettes = new THREE.Mesh(new THREE.BoxGeometry(.6, .1, .08), toon(0x111111)); lunettes.position.set(0, .48, .16); lunettes.rotation.x = -.6; head.add(lunettes); }
  if (hairStyle === 'gomina') { const c = outlined(new THREE.SphereGeometry(.555, 28, 16, 0, Math.PI * 2, 0, Math.PI * .45), H, 1.03); c.rotation.x = -.55; c.position.set(0, .04, -.05); head.add(c);
    const q = outlined(new THREE.SphereGeometry(.28, 16, 10), H, 1.05); q.scale.set(1.3, .6, 1); q.position.set(0, .46, .16); head.add(q); }
  const hg = new THREE.Group(); head.add(hg); ch.hat = hg;
  if (hat === 'cap') { const k = outlined(new THREE.SphereGeometry(.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(hatCol), 1.04); k.scale.y = .6; k.position.y = .2; hg.add(k);
    const v = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .035, 20, 1, false, -Math.PI / 2, Math.PI), toon(hatCol)); v.position.set(0, .22, .32); hg.add(v);
    const logo = new THREE.Mesh(new THREE.CircleGeometry(.09, 12), toon(0xffd21f)); logo.position.set(0, .3, -.52); logo.rotation.y = Math.PI; hg.add(logo); if (hatBack) hg.rotation.y = Math.PI; }
  if (chain) { const t = new THREE.Mesh(new THREE.TorusGeometry(.2, .028, 6, 24), toon(0xf2c230, { emissive: 0x4a3600 })); t.position.set(0, 1.32, .1); t.rotation.x = 1.2; g.add(t);
    const pend = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), toon(0xf2c230, { emissive: 0x4a3600 })); pend.position.set(0, 1.17, .27); g.add(pend); }
  g.traverse(o => { if (o.isMesh && o.material !== OUT && o.material !== ch.faceMat) o.castShadow = true; });
  scene.add(g); chars.push(ch); ch.setFace = e => { ch.faceMat.map = faceTex(e, must, kind); }; return ch;
}

const NICO = makeChar({ shirt: 0xd8443a, sleeve: 0xd8443a, pants: 0x2f4f86, shoes: 0xffffff, skin: 0xe2ad80, hat: 'cap', hatCol: 0x1f2a44, hatBack: true, hairStyle: 'court', chain: true, kind: 'nico' });
{ const tee = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 8), toon(0xffffff)); tee.scale.set(1, 1.2, .4); tee.position.set(0, 1.3, .2); NICO.g.add(tee);
  const hood = outlined(new THREE.TorusGeometry(.2, .09, 8, 18), toon(0xb8362e), 1.06); hood.position.set(0, 1.38, -.18); hood.rotation.x = 1.2; NICO.g.add(hood);
  for (const s of [-1, 1]) { const cord = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .22), toon(0xffffff)); cord.position.set(s * .08, 1.2, .24); NICO.g.add(cord); } }
const LINA = makeChar({ shirt: 0x7a45c2, sleeve: 0x151515, pants: 0x3b6aa8, shoes: 0x151515, skin: 0xc68a5c, hairStyle: 'long', hairCol: 0x24160f, kind: 'lina' });
{ for (const s of [-1, 1]) { const veste = outlined(new THREE.BoxGeometry(.2, .55, .5), toon(0x151515), 1.05); veste.position.set(s * .27, 1.1, 0); veste.rotation.z = s * .1; LINA.g.add(veste); }
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(.285, .285, .06, 16), toon(0x6b3f22)); belt.position.y = .9; LINA.g.add(belt);
  const boucle = new THREE.Mesh(new THREE.BoxGeometry(.08, .06, .02), toon(0xf2c230)); boucle.position.set(0, .9, .285); LINA.g.add(boucle); }
const MAXI = makeChar({ shirt: 0xf4f1ea, sleeve: 0xf4f1ea, pants: 0xf4f1ea, shoes: 0x6b3f22, skin: 0xeec49a, hairStyle: 'gomina', hairCol: 0x14100e, kind: 'maxi', chain: true, scale: 1.1 });
{ const chem = new THREE.Mesh(new THREE.ConeGeometry(.13, .4, 3), toon(0x151515)); chem.rotation.x = Math.PI; chem.position.set(0, 1.24, .235); chem.scale.z = .3; MAXI.g.add(chem);
  const poch = new THREE.Mesh(new THREE.BoxGeometry(.1, .06, .02), toon(0xc8102e)); poch.position.set(.15, 1.18, .245); MAXI.g.add(poch);
  for (const h of [MAXI.handL, MAXI.handR]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.04, .014, 6, 12), toon(0xf2c230, { emissive: 0x4a3600 })); r.position.set(0, .02, .05); h.add(r); }
  const montre = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .05, 12), toon(0xf2c230, { emissive: 0x4a3600 })); montre.position.y = -.5; MAXI.arms[0].add(montre); }
const SUIT = makeChar({ shirt: 0x1b1b22, pants: 0x1b1b22, shoes: 0x111111, skin: 0xd9a57a, hairStyle: 'court' });
const PELI = SUIT;
{ const cig = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .34, 8), toon(0x6b3f22)); cig.rotation.z = Math.PI / 2 - .25; cig.rotation.y = -.5; cig.position.set(.24, -.2, .47); MAXI.head.add(cig);
  const braise = new THREE.Mesh(new THREE.SphereGeometry(.04, 8, 6), basic(0xff7a2a)); braise.position.set(.38, -.16, .55); MAXI.head.add(braise); }
const SMOKE = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), basic(0xdddddd, { transparent: true, opacity: .5, depthWrite: false })); scene.add(m); SMOKE.push(m); }
function smoke(origin, t) { SMOKE.forEach((m, i) => { const k = ((t * .45 + i / 8) % 1); m.visible = true; m.position.set(origin.x + Math.sin(i * 3 + t) * .2 * k, origin.y + k * 1.4, origin.z + k * .2); m.scale.setScalar(.6 + k * 2.2); m.material.opacity = .45 * (1 - k); }); }
const PHONE = new THREE.Mesh(new THREE.BoxGeometry(.08, .16, .03), basic(0x111111)); NICO.arms[1].add(PHONE); PHONE.position.set(0, -.62, .05);

function pose(ch, x, z, ry, face, y = 0) {
  ch.g.visible = true; ch.g.position.set(x, y, z); ch.g.rotation.set(0, ry, 0);
  ch.legs.forEach(l => l.rotation.set(0, 0, 0)); ch.arms[0].rotation.set(0, 0, .3); ch.arms[1].rotation.set(0, 0, -.3);
  ch.head.rotation.set(0, 0, 0); ch.setFace(face); ch.g.position.y = y + Math.sin(T * 2.2 + x) * .012;
}
function walk(ch, ph, amp = .55) { ch.legs[0].rotation.x = Math.sin(ph) * amp; ch.legs[1].rotation.x = -Math.sin(ph) * amp;
  ch.arms[0].rotation.x = -Math.sin(ph) * amp * .8; ch.arms[1].rotation.x = Math.sin(ph) * amp * .8; ch.g.position.y += Math.abs(Math.cos(ph)) * .07; }
function blinkAt(ch, face, t, every = 2.6) { if ((t % every) < .12) ch.setFace('blink'); }
function seat(ch, carG, side, face) { // assis dans la décapotable (avant = -z)
  const p = carG.localToWorld(V(side * .45, .52, .55)); pose(ch, p.x, p.z, carG.rotation.y + Math.PI, face, p.y);
  ch.legs.forEach(l => l.rotation.x = -1.45); ch.arms[0].rotation.set(-.9, 0, .15); ch.arms[1].rotation.set(-.9, 0, -.15);
}
function talkFace(ch, t, a = 'talk', b = 'neutral') { ch.setFace(Math.floor(t * 7) % 2 ? a : b); }

// ---------- ambiance ----------
function mode(m) {
  scene.background = SKY[m];
  if (m === 'day') { scene.fog = new THREE.Fog(0xd8eefc, 120, 520); hemi.intensity = 1.35; hemi.color.set(0xcfe6ff); sun.intensity = 2.6; sun.color.set(0xfff1dc); }
  if (m === 'sunset') { scene.fog = new THREE.Fog(0xff9a6e, 90, 460); hemi.intensity = 1.0; hemi.color.set(0xffb38a); sun.intensity = 2.4; sun.color.set(0xffa25a); }
  if (m === 'night') { scene.fog = new THREE.Fog(0x1a1836, 80, 520); hemi.intensity = .55; hemi.color.set(0x6a78c8); sun.intensity = .35; sun.color.set(0x9fb4ff); }
  buildings.forEach(b => b.emissiveIntensity = m === 'night' ? 1 : m === 'sunset' ? .35 : 0);
  BULB.color.set(m === 'day' ? 0xd9d9d9 : 0xfff3c8);
  SEA.emissive.set(m === 'night' ? 0x041828 : 0x06384a); SEA.color.set(m === 'night' ? 0x123a5a : m === 'sunset' ? 0x3a7fb8 : 0x2aa7cf);
  FILL.intensity = m === 'night' ? 1.6 : 0;
  scene.userData.mode = m;
}
function cam(p0, p1, l0, l1, u, fov = 50, sway = 1) {
  const e = ease(u); camera.position.lerpVectors(p0, p1, e); camera.position.x += Math.sin(T * 1.1) * .03 * sway; camera.position.y += Math.sin(T * 1.6) * .02 * sway;
  camera.lookAt(new THREE.Vector3().lerpVectors(l0, l1, e)); camera.fov = fov; camera.updateProjectionMatrix();
}
let PLAYER = V(0, 0, 0);
function focus(p) { PLAYER.copy(p); const m = scene.userData.mode; const o = m === 'sunset' ? V(40, 18, -10) : V(22, 40, 16); sun.position.copy(p).add(o); sun.target.position.copy(p); }
const rel = (g, x, y, z) => g.localToWorld(V(x, y, z));

// ---------- HUD (écran de jeu) ----------
const HUD = { intro: null, gps: true, route: false, maxi: false, msg: 0, vote: 0, money: 0, stars: 0, map: false, timer: null, popup: null, red: 0, card: null, phone: 0, zz: [] };
function stroked(txt, x, y, font, fill, lw = 12, align = 'center') { ctx.save(); ctx.font = font; ctx.textAlign = align; ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = '#000'; ctx.strokeText(txt, x, y); ctx.fillStyle = fill; ctx.fillText(txt, x, y); ctx.restore(); }
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
function star(x, y, r, filled) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath();
  ctx.lineWidth = 6; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.fillStyle = filled ? '#ffffff' : 'rgba(255,255,255,.18)'; ctx.fill(); if (filled) { ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.stroke(); } }
function drawHUD() {
  stroked('DE 0 À ROI · ÉPISODE 1', W / 2, 118, '900 34px Inter', '#ffd21f', 10);
  const sc = 1 + HUD.red * .18;
  ctx.save(); ctx.translate(W - 34, 238); ctx.scale(sc, sc); stroked(fmt(HUD.money), 0, 0, '900 56px Inter', HUD.red > .05 ? '#ff3b3b' : '#5be36f', 13, 'right'); ctx.restore();
  for (let i = 0; i < 5; i++) star(W - 50 - (4 - i) * 44, 285, 17, i < HUD.stars);
  if (HUD.gps !== false) drawMinimap();
  if (HUD.popup) { const { title, sub, col, k } = HUD.popup; const y = 430 - (1 - ease(clamp(k))) * 40; ctx.save(); ctx.globalAlpha = clamp(k * 3);
    ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.beginPath(); ctx.roundRect(60, y - 70, W - 120, sub ? 140 : 100, 18); ctx.fill();
    ctx.fillStyle = col; ctx.fillRect(60, y - 70, W - 120, 8);
    stroked(title, W / 2, y - 8, '900 46px Inter', col, 10); if (sub) stroked(sub, W / 2, y + 44, '800 32px Inter', '#fff', 8); ctx.restore(); }
  if (HUD.phone) { const k = HUD.phone; const y = 430; ctx.save(); ctx.globalAlpha = clamp(k * 4);
    ctx.fillStyle = 'rgba(15,15,20,.88)'; ctx.beginPath(); ctx.roundRect(110, y - 64, W - 220, 128, 30); ctx.fill();
    ctx.fillStyle = '#2bd15a'; ctx.beginPath(); ctx.arc(190, y, 36 + Math.sin(T * 18) * 4, 0, 7); ctx.fill(); stroked('📞', 190, y + 14, '40px "Noto Color Emoji"', '#fff', 0);
    stroked('Numéro masqué', 250, y - 6, '900 38px Inter', '#fff', 0, 'left'); stroked('nouveau message', 250, y + 32, '700 26px Inter', '#9fe8b0', 0, 'left');
    if (HUD.msg) { const k2 = clamp(HUD.msg * 4); ctx.globalAlpha = k2; ctx.fillStyle = '#2bd15a'; ctx.beginPath(); ctx.roundRect(130, y + 84, W - 260, 116, 26); ctx.fill();
      stroked('« Vieux garage du port.', W / 2, y + 132, '800 30px Inter', '#06210f', 0); stroked('Minuit. Venez seuls. »', W / 2, y + 172, '800 30px Inter', '#06210f', 0); }
    ctx.restore(); }
  if (HUD.card) { const { name, sub, col, k } = HUD.card; const x0 = -W + ease(clamp(k * 3)) * W; ctx.save(); ctx.translate(x0, 0);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 640); ctx.lineTo(W * .82, 620); ctx.lineTo(W * .76, 760); ctx.lineTo(0, 770); ctx.fill();
    stroked(name, 40, 710, 'italic 900 78px Inter', '#fff', 12, 'left'); stroked(sub, 44, 752, '800 30px Inter', '#ffd21f', 8, 'left'); ctx.restore(); }
  for (const z of HUD.zz) stroked(z.t, z.x, z.y, `900 ${z.s}px Inter`, '#fff', 8);
}

// mini-carte GPS façon GTA (en bas à gauche, tourne avec la caméra)
const ROUTE = [[25, 104], [8, 100], [0, 96], [0, 41], [-58, 41], [-62, 46], [-62, 54]];
function drawMinimap() {
  const cx = 138, cy = 1000, r = 108, sc = 1.15;
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir); const yaw = Math.atan2(dir.x, -dir.z);
  const P = PLAYER;
  const tr = (x, z) => { const dx = (x - P.x) * sc, dz = (z - P.z) * sc; const c = Math.cos(-yaw), s2 = Math.sin(-yaw); return [cx + dx * c - dz * s2, cy + dx * s2 + dz * c]; };
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.closePath(); ctx.fillStyle = '#28323c'; ctx.fill(); ctx.clip();
  const poly = (pts, fill) => { ctx.beginPath(); pts.forEach(([x, z], i) => { const [a, b] = tr(x, z); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  const rect = (x0, z0, x1, z1, fill) => poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], fill);
  rect(70, -320, 600, 320, '#2e6f9e'); rect(14, -320, 70, 320, '#c9b07a');
  for (const [x, z, w, d] of FOOT) rect(x - w / 2, z - d / 2, x + w / 2, z + d / 2, '#465260');
  rect(-72, 52, -52, 68, '#5a4a3a');
  ctx.strokeStyle = '#e8edf2'; ctx.lineCap = 'round';
  const road = (pts, w) => { ctx.lineWidth = w * sc; ctx.beginPath(); pts.forEach(([x, z], i) => { const [a, b] = tr(x, z); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); ctx.stroke(); };
  road([[0, 300], [0, -300]], 12); for (const z of [40, -40, -130]) road([[0, z], [-95, z]], 9); road([[0, 96], [12, 96]], 8);
  if (HUD.route) { ctx.strokeStyle = '#b84dff'; ctx.lineWidth = 6; ctx.beginPath(); let started = false;
    ROUTE.forEach(([x, z]) => { const [a, b] = tr(x, z); started ? ctx.lineTo(a, b) : ctx.moveTo(a, b); started = true; }); ctx.stroke(); }
  const blip = (x, z, txt, col) => { let [a, b] = tr(x, z); const d = Math.hypot(a - cx, b - cy); if (d > r - 16) { a = cx + (a - cx) / d * (r - 16); b = cy + (b - cy) / d * (r - 16); }
    ctx.beginPath(); ctx.arc(a, b, 13, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke();
    ctx.font = '900 15px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(txt, a, b + 1); };
  blip(25, 112, '⌂', '#5be36f'); if (HUD.maxi) blip(-62, 58, 'M', '#ffd21f');
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = '#0b0b10'; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - 13); ctx.lineTo(cx + 10, cy + 10); ctx.lineTo(cx, cy + 5); ctx.lineTo(cx - 10, cy + 10); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000'; ctx.stroke();
  const n = tr(P.x, P.z - 999); const na = Math.atan2(n[1] - cy, n[0] - cx); stroked('N', cx + Math.cos(na) * (r - 2), cy + Math.sin(na) * (r - 2) + 7, '900 20px Inter', '#fff', 5);
  // barres de vie / armure façon jeu
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(cx - r, cy + r + 12, r * 2, 10); ctx.fillStyle = '#5be36f'; ctx.fillRect(cx - r + 2, cy + r + 14, r - 4, 6); ctx.fillStyle = '#3ea8ff'; ctx.fillRect(cx + 2, cy + r + 14, (r - 4) * .35, 6);
}

function drawIntro({ name, l1, l2, col, k, droite }) {
  const a = ease(clamp(k));
  ctx.save(); ctx.filter = 'saturate(1.45) contrast(1.18)'; ctx.drawImage(out, 0, 0); ctx.restore();
  ctx.save(); const g = ctx.createLinearGradient(droite ? W : 0, 0, droite ? 0 : W, 0); g.addColorStop(0, col + 'cc'); g.addColorStop(.55, col + '00'); ctx.globalAlpha = a * .85; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (k < .25) { ctx.fillStyle = `rgba(255,255,255,${(1 - k / .25) * .7})`; ctx.fillRect(0, 0, W, H); } // flash du gel d'image
  ctx.save(); const x0 = droite ? W - 40 : 40, al = droite ? 'right' : 'left'; const off = (1 - a) * (droite ? 120 : -120);
  ctx.translate(off, 0); ctx.globalAlpha = a;
  stroked(name, x0, 520, 'italic 900 150px Inter', '#ffffff', 18, al);
  ctx.fillStyle = '#ffd21f'; ctx.fillRect(droite ? x0 - 330 : x0, 546, 330, 8);
  stroked(l1, x0, 600, 'italic 900 38px Inter', '#ffd21f', 10, al);
  stroked(l2, x0, 648, '800 32px Inter', '#ffffff', 8, al);
  ctx.restore();
}
function screen(v) { const p = v.clone().project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; }


// ---------- nouveaux décors : le cabanon et le garage abandonné ----------
const GOLD = car({ col: 0xd4a52b });
GOLD.traverse(o => { if (o.isMesh && o.material.color && o.material.color.getHex() === 0xd4a52b) o.material = new THREE.MeshToonMaterial({ color: 0xe0b23a, gradientMap: gm, emissive: 0x3a2800 }); });
const GOLDL = new THREE.SpotLight(0xfff2c8, 0, 40, .5, .5, 1.2); GOLD.add(GOLDL); GOLDL.position.set(0, 1, -2.4); const GT = new THREE.Object3D(); GOLD.add(GT); GT.position.set(0, 0, -12); GOLDL.target = GT;
function planks(col, w = 256) { const [c, x] = cnv(w, w); x.fillStyle = col; x.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) { x.fillStyle = `rgba(0,0,0,${.08 + (i % 3) * .05})`; x.fillRect(0, i * w / 8, w, 3); } for (let i = 0; i < 30; i++) { x.fillStyle = 'rgba(60,30,10,.25)'; x.fillRect(rnd() * w, rnd() * w, 2, 10 + rnd() * 30); } const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
const CAB = new THREE.Group(); scene.add(CAB); CAB.position.set(26, 0, 112);
{ const woodT = planks('#a8774c'); woodT.repeat.set(2, 1.5); const wood = toon(0xffffff, { map: woodT });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(8, .35, 6.5), toon(0x8a5c36)); deck.position.y = .7; CAB.add(deck);
  for (const [x, z] of [[-3.8, -3], [3.8, -3], [-3.8, 3], [3.8, 3], [0, 3], [0, -3]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .9, 6), toon(0x6b4628)); p.position.set(x, .45, z); CAB.add(p); }
  const walls = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 4), wood); walls.position.set(0, 2.4, .8); CAB.add(walls);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(7.2, .18, 6.4), toon(0x8a9aa8)); roof.position.set(0, 4.15, -.1); roof.rotation.x = -.12; CAB.add(roof);
  const roof2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, .2, 1.4), toon(0xb8643a)); roof2.position.set(-1.8, 4.3, .3); roof2.rotation.set(-.12, .2, .05); CAB.add(roof2); // rustine
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, .1), toon(0x3f8f9e)); door.position.set(.8, 1.95, -1.22); CAB.add(door);
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, .9, .1), basic(0xffd38a)); win.position.set(-1.5, 2.6, -1.22); CAB.add(win); CAB.userData.win = win;
  const plank = new THREE.Mesh(new THREE.BoxGeometry(1.5, .12, .1), toon(0x6b4628)); plank.position.set(-1.5, 2.6, -1.29); plank.rotation.z = .5; CAB.add(plank); // planche clouée
  for (const x of [-2.6, -1.4]) { const ch = new THREE.Mesh(new THREE.BoxGeometry(.7, .5, .7), toon(0xe9dcc0)); ch.position.set(x + 4.3, 1.15, -2.2); CAB.add(ch); }
  const surf = new THREE.Mesh(new THREE.CapsuleGeometry(.28, 1.9, 4, 10), toon(0x3ee0ff)); surf.scale.z = .25; surf.position.set(2.7, 2.1, -1.35); surf.rotation.z = .18; CAB.add(surf);
  const sign = neon('CHEZ NOUS', '#ffd23f', 2.6, .65, 0, 3.55, -1.25, Math.PI, 120); scene.remove(sign); CAB.add(sign); sign.rotation.y = Math.PI; sign.position.z = -1.32;
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), basic([0xff3fa4, 0xffd21f, 0x3ee0ff][i % 3])); b.position.set(-3.6 + i * .9, 3.75 - Math.sin(i / 8 * Math.PI) * .35, -3.25); CAB.add(b); }
  CAB.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }
const GAR = new THREE.Group(); scene.add(GAR); GAR.position.set(-62, 0, 60);
const GLAMP = new THREE.PointLight(0xffb45a, 0, 22, 1.4); GAR.add(GLAMP); GLAMP.position.set(0, 5.6, 0);
{ const tin = (() => { const [c, x] = cnv(256, 256); x.fillStyle = '#56606c'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#4a535e' : '#606b78'; x.fillRect(i * 16, 0, 8, 256); }
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(140,70,30,${.2 + rnd() * .3})`; x.beginPath(); x.ellipse(rnd() * 256, rnd() * 256, 4 + rnd() * 18, 3 + rnd() * 30, 0, 0, 7); x.fill(); }
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 1); return t; })();
  const wallM = toon(0xffffff, { map: tin, side: THREE.DoubleSide });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), wallM); back.position.set(0, 4, 8); back.rotation.y = Math.PI; GAR.add(back);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), wallM); w.position.set(s * 10, 4, 0); w.rotation.y = -s * Math.PI / 2; GAR.add(w); }
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), toon(0x3a4048, { side: THREE.DoubleSide })); roof.rotation.x = Math.PI / 2; roof.position.y = 8; GAR.add(roof);
  for (const x of [-6, 4]) { const hole = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), basic(0x0a0f22, { side: THREE.DoubleSide })); hole.rotation.x = Math.PI / 2; hole.position.set(x, 7.98, 3); GAR.add(hole); }
  for (const x of [-10, 10]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 8), wallM); f.position.set(x - Math.sign(x) * 1.25, 4, -8); GAR.add(f); }
  const top = new THREE.Mesh(new THREE.PlaneGeometry(20, 2.2), wallM); top.position.set(0, 6.9, -8); GAR.add(top);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), toon(0x3d3a38)); floor.rotation.x = -Math.PI / 2; floor.position.y = .03; GAR.add(floor);
  for (let i = 0; i < 6; i++) { const o = new THREE.Mesh(new THREE.CircleGeometry(.5 + rnd(), 12), basic(0x15110f, { transparent: true, opacity: .55 })); o.rotation.x = -Math.PI / 2; o.position.set(-6 + rnd() * 12, .04, -4 + rnd() * 9); GAR.add(o); } // taches d'huile
  const lampF = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 2.2), toon(0x111111)); lampF.position.set(0, 6.9, 0); GAR.add(lampF);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(.5, .4, 16, 1, true), toon(0x2f4a3a, { side: THREE.DoubleSide })); shade.position.set(0, 5.75, 0); GAR.add(shade);
  const bulbG = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), basic(0xffd59a)); bulbG.position.set(0, 5.58, 0); GAR.add(bulbG); GAR.userData.bulb = bulbG;
  for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 1.2, 14), toon([0x2f5a8a, 0x8a2a2a, 0x556b2f][i % 3])); b.position.set(7.8 - (i % 2) * .9, .6, 5.6 - Math.floor(i / 2) * .9); if (i === 4) { b.rotation.z = Math.PI / 2; b.position.set(6.2, .42, 2.6); } GAR.add(b); }
  for (let i = 0; i < 5; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(.42, .17, 8, 20), toon(0x151515)); t.rotation.x = Math.PI / 2; t.position.set(-8, .17 + i * .34, 6); GAR.add(t); }
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), toon(0x9a7448)); c.position.set(-7.8 + (i % 2) * 1.15, .55 + Math.floor(i / 2) * 1.1, -2.5); c.rotation.y = rnd() * .3; GAR.add(c); }
  const tag = neon('REQUINS', '#5be36f', 4, 1, 9.95, 3.4, 1.5, -Math.PI / 2, 140); scene.remove(tag); GAR.add(tag); tag.position.set(9.9, 3.4, 1.5); tag.rotation.y = -Math.PI / 2; tag.material.opacity = .55;
  GAR.traverse(o => { if (o.isMesh) { o.receiveShadow = true; o.castShadow = true; } }); }

// le port : conteneurs et grues
{ const im = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, 2.6, 6), toon(0xffffff), 80); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(); let n = 0;
  const COLS = [0xc8402e, 0x2f6fa8, 0x3f8f4a, 0xe0a030, 0x7a4ab0, 0x2aa7cf];
  for (let x = -92; x < -46 && n < 80; x += 3.2) for (let z = 46; z < 92 && n < 80; z += 7) {
    if (x > -75 && x < -49 && z > 48 && z < 72) continue; if (rnd() < .35) continue;
    const h = 1 + Math.floor(rnd() * 3); for (let k = 0; k < h && n < 80; k++) { q.setFromEuler(new THREE.Euler(0, (rnd() - .5) * .08, 0)); m4.compose(V(x, 1.3 + k * 2.6, z), q, V(1, 1, 1)); im.setMatrixAt(n, m4); im.setColorAt(n++, c.set(COLS[Math.floor(rnd() * COLS.length)])); } }
  im.count = n; im.castShadow = im.receiveShadow = true; scene.add(im);
  for (const [x, z] of [[-88, 82], [-46, 88]]) { const g = new THREE.Group(); const y = toon(0xf2c230);
    const mat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 26, 1.2), y); mat.position.y = 13; g.add(mat);
    const boom = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 1), y); boom.position.set(6, 25, 0); g.add(boom);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2, 2.4), toon(0xe9e2d0)); cab.position.set(0, 23.5, 0); g.add(cab);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(.35, 8, 6), basic(0xff3030)); lamp.position.set(16.5, 25.7, 0); g.add(lamp);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 12), toon(0x222222)); cable.position.set(14, 19, 0); g.add(cable);
    g.position.set(x, 0, z); g.rotation.y = rnd() * 3; g.traverse(o => o.castShadow = true); scene.add(g); }
}
const WRECK = car({ col: 0x6b4a3a }); WRECK.position.set(-68, -.25, 64); WRECK.rotation.set(0, .7, .06);
const FOLD = ['A', 'B'].map((L, i) => { const [c, x] = cnv(256, 320); x.fillStyle = i ? '#c8402e' : '#e9c46a'; x.fillRect(0, 0, 256, 320); x.fillStyle = 'rgba(0,0,0,.75)'; x.font = '900 200px Inter'; x.textAlign = 'center'; x.fillText(L, 128, 230);
  x.fillStyle = '#111'; x.fillRect(20, 20, 216, 18); x.font = '900 30px Inter'; x.fillStyle = '#fff'; x.fillText('CONFIDENTIEL', 128, 300);
  const m = new THREE.Mesh(new THREE.BoxGeometry(.5, .03, .64), [toon(0x333), toon(0x333), toon(0xffffff, { map: tex(c) }), toon(0x333), toon(0x333), toon(0x333)]); m.castShadow = true; scene.add(m); return m; });
function hood(g, i) { return rel(g, (i ? .4 : -.4), 1.13, 1.55); }

// ---------- le découpage ----------
const SHOTS = [
  { d: 3.8, txt: ['Dans *un an*,', 'cette *ville*', 'sera *à eux*.'], f(u, t) {
    mode('night'); HUD.money = 8400000; HUD.stars = 5;
    pose(NICO, -35.7, -197.9, 0, 'smug', 93.2); pose(LINA, -33.1, -198.0, 0, 'smile', 93.2);
    LINA.head.rotation.y = .3; NICO.arms[1].rotation.set(0, 0, -.8);
    cam(V(-34.4, 96.4, -202.2), V(-34.4, 96.6, -201.2), V(-28, 76, -160), V(-27, 74, -158), u, 62, .4); focus(V(-34, 92, -199)); } },
  { d: 4.4, txt: ['Mais *aujourd\'hui*...', 'ils ont', '*zéro* euro.'], f(u, t) {
    mode('day'); HUD.red = u > .6 ? Math.abs(Math.sin((u - .6) * 22)) * (1 - (u - .6) * 2) : 0;
    HERO.position.set(20.5, 0, 107); HERO.rotation.y = -.5;
    pose(NICO, 25.2, 109.3, Math.PI, 'sleep', 1.0); pose(LINA, 27.1, 109.4, Math.PI, 'neutral', 1.0); NICO.legs.forEach(l => l.rotation.x = -1.4); NICO.g.position.y = .78; NICO.head.rotation.z = .35;
    LINA.arms[0].rotation.set(-1.4, 0, .1); LINA.arms[1].rotation.set(-1.4, 0, -.1);
    cam(V(17, 3.6, 97), V(18.5, 2.9, 99.5), V(24, 2, 110), V(24, 2, 110), u, 52); focus(V(24, 0, 108));
    const hp = screen(rel(NICO.head, 0, .6, 0)); HUD.zz = [0, 1, 2].map(i => { const k = ((t * .8 + i / 3) % 1); return { t: 'Z', x: hp[0] + 20 + k * 50, y: hp[1] - 10 - k * 100, s: 24 + k * 26 }; }); } },
  { d: 5.2, txt: ['Leur maison :', 'un *cabanon*', 'qui prend l\'eau.', 'Leur voiture :', 'une épave *rouillée*.'], f(u, t) {
    mode('day'); HERO.position.set(20.5, 0, 107); HERO.rotation.y = -.5;
    if (u < .5) { pose(LINA, 27.0, 107.5, 0, 'neutral', 1.0); LINA.head.rotation.x = -.5; LINA.arms[1].rotation.set(0, 0, -2.4);
      const drop = ((t * 1.6) % 1); FOLD[0].visible = false;
      cam(V(25.6, 2.6, 102.6), V(25.9, 2.5, 103.4), V(26.4, 3.4, 108.5), V(26.4, 3.0, 108.5), u * 2, 52); }
    else { pose(NICO, 22.4, 105.8, -1.2, u < .78 ? 'smile' : 'surprised'); if (u > .62 && u < .75) NICO.arms[1].rotation.set(-1.6, 0, -.2);
      if (u > .7) smoke(rel(HERO, 0, 1.2, -1.8), (u - .7) * 8);
      cam(V(17.6, 2.3, 101.2), V(17.9, 2.3, 101.6), V(21.6, 1.3, 105.6), V(21.6, 1.3, 105.6), (u - .5) * 2, 50); }
    focus(V(23, 0, 107)); } },
  { d: 5.4, intro: 'nico', txt: ['Vous allez être *Nico*.', 'Le pilote.', 'Il fonce', 'sans *réfléchir*.'], f(u, t) {
    mode('day'); HERO.position.set(20.5, 0, 107); HERO.rotation.y = -.5; HUD.gps = false; const tf = Math.min(t, .7);
    pose(NICO, 22.4, 104.6, Math.PI - .5, 'grin'); NICO.arms[1].rotation.set(0, 0, -2.6 + Math.sin(tf * 8) * .25); NICO.g.position.y = 0;
    pose(LINA, 25, 104.8, Math.PI + .3, 'smile');
    const z = t < .7 ? 0 : ease(clamp((t - .7) / .5)) * .5;
    cam(V(21.0, 1.9, 100.6 + z), V(21.0, 1.9, 100.6 + z), V(23.15, 1.5, 104.6), V(23.15, 1.5, 104.6), 0, 46, 0);
    HUD.intro = t > .7 ? { name: 'NICO', l1: '22 ANS · LE PILOTE', l2: 'Fonce sans réfléchir.', col: '#d8443a', k: (t - .7) / .5 } : null; focus(V(23, 0, 105)); } },
  { d: 5.4, intro: 'lina', txt: ['Et vous allez être *Lina*.', 'Le cerveau.', 'Pas un plan', 'ne lui *échappe*.'], f(u, t) {
    mode('day'); HERO.position.set(20.5, 0, 107); HERO.rotation.y = -.5; HUD.gps = false; const tf = Math.min(t, .7);
    pose(LINA, 25, 104.8, Math.PI + .3 - (1 - ease(clamp(tf / .7))) * .6, 'smug'); LINA.arms[0].rotation.set(-1.5, -.6, .9); LINA.arms[1].rotation.set(-1.5, .6, -.9); LINA.g.position.y = 0;
    pose(NICO, 22.4, 104.6, Math.PI - .5, 'neutral');
    const z = t < .7 ? 0 : ease(clamp((t - .7) / .5)) * .5;
    cam(V(26.2, 1.9, 100.9 + z), V(26.2, 1.9, 100.9 + z), V(24.25, 1.5, 104.8), V(24.25, 1.5, 104.8), 0, 46, 0);
    HUD.intro = t > .7 ? { name: 'LINA', l1: '21 ANS · LE CERVEAU', l2: 'Pas un plan ne lui échappe.', col: '#7a45c2', k: (t - .7) / .5, droite: true } : null; focus(V(23, 0, 105)); } },
  { d: 4.8, txt: ['Un soir,', 'un *message* arrive.', '*Numéro masqué*.'], f(u, t) {
    mode('sunset'); HERO.position.set(20.5, 0, 107); HERO.rotation.y = -.5; HUD.phone = u + .01; HUD.msg = u > .35 ? u - .35 : 0; HUD.route = HUD.maxi = u > .5;
    pose(NICO, 25.2, 108.8, Math.PI, u < .4 ? 'neutral' : 'surprised', 1.0); NICO.arms[1].rotation.set(-1.2, 0, -.5); PHONE.visible = true;
    pose(LINA, 26.6, 108.9, Math.PI + .5, u < .5 ? 'neutral' : 'determined', 1.0); LINA.head.rotation.y = .4;
    cam(V(25.4, 2.9, 104.6), V(25.5, 2.8, 105.2), V(25.6, 2.4, 108.8), V(25.6, 2.4, 108.8), u, 46); focus(V(25, 0, 108)); } },
  { d: 5.8, txt: ['*Minuit*.', 'Le vieux garage', 'du port nord.'], f(u, t) {
    mode('night'); GLAMP.intensity = 25 + Math.sin(t * 40) * 6 * (Math.sin(t * 3) > .7 ? 1 : 0);
    if (u < .55) { // conduite : caméra derrière la voiture, comme dans GTA
      const k = u / .55, x = -14 - k * 44; HUD.route = HUD.maxi = true;
      HERO.position.set(x, 0, 41.2); HERO.rotation.y = Math.PI / 2 + Math.sin(t * 2.2) * .015;
      seat(NICO, HERO, -1, 'determined'); seat(LINA, HERO, 1, 'neutral');
      camera.position.set(x + 9.2, 3.3, 41.2 + Math.sin(t * .8) * .25); camera.lookAt(x - 8, 1.2, 41.2); camera.fov = 58; camera.updateProjectionMatrix(); focus(V(x, 0, 41));
    } else { // à pied : caméra à l'épaule, derrière Nico
      HUD.route = HUD.maxi = true; const k = (u - .55) / .45, z = 45.5 + k * 5.2; HERO.position.set(-57.6, 0, 43.5); HERO.rotation.y = Math.PI;
      pose(NICO, -61.3, z, 0, 'determined'); walk(NICO, t * 7.5, .5); pose(LINA, -60.0, z - .5, 0, 'neutral'); walk(LINA, t * 7.5 + 1.5, .5);
      camera.position.set(-60.4, 2.9, z - 4.4); camera.lookAt(-61.0, 1.6, z + 5); camera.fov = 58; camera.updateProjectionMatrix(); focus(V(-61, 0, z)); }
  } },
  { d: 4.4, txt: ['Et là...', 'une voiture *en or*', 'entre dans le garage.'], f(u, t) {
    mode('night'); GLAMP.intensity = 25; HUD.maxi = true;
    HERO.position.set(-58, 0, 52); HERO.rotation.y = Math.PI;
    pose(NICO, -61.2, 51.6, Math.PI, 'surprised'); pose(LINA, -59.8, 51.4, Math.PI, 'surprised');
    const gz = 34 + ease(clamp(u * 1.2)) * 24; GOLD.position.set(-63, 0, gz); GOLD.rotation.y = Math.PI; GOLDL.intensity = 60;
    cam(V(-60.5, 1.7, 63.5), V(-60.6, 1.7, 63), V(-61.5, 1.4, 50), V(-62.5, 1.2, 54), u, 52); focus(V(-61, 0, 55)); } },
  { d: 4.6, txt: ['*Maximo*.', 'Le patron', 'du *quartier du port*.'], f(u, t) {
    mode('night'); GLAMP.intensity = 25; HUD.maxi = true; GOLD.position.set(-63, 0, 58); GOLD.rotation.y = Math.PI; GOLDL.intensity = 30;
    HERO.position.set(-58, 0, 52); HERO.rotation.y = Math.PI;
    const mz = 55.6 - ease(clamp(u * 1.5)) * 1.2; pose(MAXI, -61.6, mz, Math.PI, 'cool'); if (u < .66) walk(MAXI, t * 6, .35);
    smoke(rel(MAXI.head, .4, -.1, .56), t);
    HUD.card = { name: 'MAXIMO', sub: 'le patron du quartier du port', col: '#c99a1e', k: u * 1.6 };
    cam(V(-61.2, 1.05, 50.2), V(-61.3, 1.2, 50.6), V(-61.6, 2.1, mz), V(-61.6, 2.1, mz), u, 46); focus(V(-61, 0, 55)); } },
  { d: 5.2, txt: ['Le port,', 'c\'est *son* quartier.', 'Et ce n\'est que', 'le *premier* chef...'], f(u, t) {
    mode('night'); GLAMP.intensity = 25; HUD.maxi = true; GOLD.position.set(-63, 0, 58); GOLD.rotation.y = Math.PI; HERO.position.set(-57.6, 0, 43.5); HERO.rotation.y = Math.PI;
    const e = ease(u); camera.position.set(lerp(-28, -22, e), lerp(34, 46, e), lerp(96, 70, e));
    camera.lookAt(lerp(-62, -34, e), lerp(2, 40, e), lerp(58, -205, e)); camera.fov = 58; camera.updateProjectionMatrix(); focus(V(-62, 0, 58)); } },
  { d: 5.8, txt: ['« Personne', 'ne vous *connaît*.', 'C\'est *parfait*.', 'J\'ai *deux* boulots', 'pour vous. »'], f(u, t) {
    mode('night'); GLAMP.intensity = 25; HUD.maxi = true; GOLD.position.set(-63, 0, 58); GOLD.rotation.y = Math.PI; GOLDL.intensity = 30;
    HERO.position.set(-58, 0, 52); HERO.rotation.y = Math.PI;
    pose(MAXI, -61.6, 54.4, Math.PI, 'cool'); talkFace(MAXI, t, 'cooltalk', 'cool'); MAXI.arms[0].rotation.set(-.9 - Math.sin(t * 3) * .2, 0, .3);
    pose(NICO, -61.2, 51.6, 0, u < .6 ? 'neutral' : 'grin'); pose(LINA, -59.8, 51.4, -.2, 'determined');
    smoke(rel(MAXI.head, .4, -.1, .56), t);
    if (u < .55) cam(V(-62.2, 2.25, 52.0), V(-62.3, 2.2, 52.3), V(-61.6, 2.1, 54.4), V(-61.6, 2.1, 54.4), u / .55, 44);
    else cam(V(-60.3, 2.2, 54.6), V(-60.4, 2.15, 54.3), V(-60.5, 1.8, 51.5), V(-60.5, 1.8, 51.5), (u - .55) / .45, 46);
    focus(V(-61, 0, 54)); } },
  { d: 5.4, txt: ['Il pose', '*deux missions*', 'sur sa voiture.', '« Une seule.', 'Choisissez *bien*. »'], f(u, t) {
    mode('night'); GLAMP.intensity = 25; HUD.maxi = true; GOLD.position.set(-63, 0, 58); GOLD.rotation.y = Math.PI; GOLDL.intensity = 30;
    pose(MAXI, -61.6, 55.2, Math.PI + .3, 'cool'); if (u > .6) talkFace(MAXI, t, 'cooltalk', 'cool');
    FOLD.forEach((f, i) => { f.visible = true; const k = ease(clamp((u - .1 - i * .12) / .2)); const end = hood(GOLD, i); f.position.set(lerp(-61.6, end.x, k), lerp(2.6, end.y, k) + Math.sin(k * Math.PI) * .5, lerp(55.0, end.z, k)); f.rotation.set(0, Math.PI + (i ? .15 : -.1), 0); });
    if (u < .6) cam(V(-64.2, 3.9, 52.4), V(-64.0, 3.8, 52.8), V(-62.8, 1.3, 56.2), V(-62.8, 1.3, 56.2), u / .6, 46);
    else { pose(NICO, -61.2, 51.6, 0, 'grin'); pose(LINA, -59.8, 51.4, -.2, 'smug'); smoke(rel(MAXI.head, .4, -.1, .56), t);
      cam(V(-60.6, 1.9, 48.4), V(-60.7, 1.95, 48.8), V(-61.6, 1.8, 55.2), V(-61.6, 1.8, 55.2), (u - .6) / .4, 50); }
    focus(V(-62, 0, 55)); } },
  { d: 5.0, txt: [], f(u, t) {
    mode('night'); GLAMP.intensity = 25; HUD.maxi = true; GOLD.position.set(-63, 0, 58); GOLD.rotation.y = Math.PI; GOLDL.intensity = 30;
    FOLD.forEach((f, i) => { f.visible = true; f.position.copy(hood(GOLD, i)); f.rotation.set(0, Math.PI + (i ? .15 : -.1), 0); });
    cam(V(-63.8, 3.6, 53.0), V(-63.6, 3.3, 53.6), V(-62.8, 1.2, 56.3), V(-62.8, 1.2, 56.3), u, 46); HUD.vote = u + .01; HUD.gps = false; focus(V(-62, 0, 56)); } },
];

function drawVote(k) {
  ctx.save(); ctx.globalAlpha = clamp(k * 5); ctx.fillStyle = 'rgba(8,6,18,.72)'; ctx.fillRect(0, 0, W, H);
  stroked('À TOI DE CHOISIR', W / 2, 300, 'italic 900 66px Inter', '#ffd21f', 14);
  stroked('Épisode 2 : quelle mission ?', W / 2, 352, '800 32px Inter', '#fff', 8);
  [['A', 'LE FOURGON', 'BLINDÉ', 'Braquage · gros butin', '#e9c46a'], ['B', 'LA GUERRE', 'DES DOCKS', 'Le gang des Requins', '#e0533e']].forEach(([L, t1, t2, sub, col], i) => {
    const kk = ease(clamp(k * 4 - .3 - i * .25)); const x = 40 + i * 330, y = 420 + (1 - kk) * 60; ctx.globalAlpha = kk;
    ctx.fillStyle = 'rgba(20,16,40,.95)'; ctx.beginPath(); ctx.roundRect(x, y, 310, 400, 22); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
    stroked(L, x + 155, y + 170, '900 160px Inter', col, 14); stroked(t1, x + 155, y + 250, 'italic 900 40px Inter', '#fff', 10); stroked(t2, x + 155, y + 296, 'italic 900 40px Inter', '#fff', 10);
    stroked(sub, x + 155, y + 352, '800 24px Inter', '#cfc8e8', 6); });
  ctx.globalAlpha = clamp(k * 3 - 1.2); const pulse = 1 + Math.sin(T * 8) * .04; ctx.translate(W / 2, 920); ctx.scale(pulse, pulse);
  stroked('Écris A ou B', 0, 0, '900 54px Inter', '#5be36f', 12); stroked('en commentaire 👇', 0, 62, '900 46px Inter', '#fff', 10);
  ctx.restore();
}
let acc = 0; SHOTS.forEach(s => { s.t0 = acc; acc += s.d; });
const TOTAL = acc; window.TOTAL = TOTAL; window.FPS = FPS;
const CHUNKS = [];
SHOTS.forEach(s => { const lens = s.txt.map(x => x.replace(/\*/g, '').length + 6); const sum = lens.reduce((a, b) => a + b, 0); let a = s.t0 + .05;
  s.txt.forEach((x, i) => { const d = (s.d - .1) * lens[i] / sum; CHUNKS.push({ t0: a, t1: a + d, x }); a += d; }); });
window.CHUNKS = CHUNKS;
function caption(t) {
  const c = CHUNKS.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const k = clamp((t - c.t0) / .12); const sc = .82 + .18 * ease(k) + Math.sin(k * Math.PI) * .06;
  const words = c.x.split(' ').map(w => ({ hi: w.includes('*'), w: w.replace(/\*/g, '') }));
  ctx.save(); ctx.font = '900 62px Inter'; ctx.lineJoin = 'round'; const space = 16; let lines = [[]], lw = [0];
  for (const w of words) { const wd = ctx.measureText(w.w).width; if (lw[lw.length - 1] + wd > W * .84 && lines[lines.length - 1].length) { lines.push([]); lw.push(0); } lines[lines.length - 1].push(w); lw[lw.length - 1] += wd + space; }
  ctx.translate(W / 2, H * .66 - (lines.length - 1) * 38); ctx.scale(sc, sc);
  lines.forEach((ln, li) => { let x = -(lw[li] - space) / 2; const y = li * 76;
    for (const w of ln) { const wd = ctx.measureText(w.w).width; ctx.lineWidth = 14; ctx.strokeStyle = '#000'; ctx.strokeText(w.w, x, y); ctx.fillStyle = w.hi ? '#ffd21f' : '#fff'; ctx.fillText(w.w, x, y); x += wd + space; } });
  ctx.restore();
}
window.renderFrame = function (i) {
  T = i / FPS; const s = SHOTS.find(s => T >= s.t0 && T < s.t0 + s.d) || SHOTS[SHOTS.length - 1];
  chars.forEach(c => c.g.visible = false); [HERO, BLACK].forEach(c => { c.position.set(0, -50, 0); c.rotation.set(0, 0, 0); });
  GOLD.position.set(0, -50, 0); GOLDL.intensity = 0; GLAMP.intensity = 0; WRECK.visible = true; FOLD.forEach(f => f.visible = false); SMOKE.forEach(m => m.visible = false);
  PKG.visible = false; PKG.rotation.set(0, 0, 0); PHONE.visible = false; CARTONS.forEach(b => { b.position.copy(b.userData.base); b.rotation.set(0, 0, 0); });
  Object.assign(HUD, { intro: null, gps: true, route: false, maxi: false, msg: 0, vote: 0, money: 0, stars: 0, map: false, timer: null, popup: null, red: 0, card: null, phone: 0, zz: [] });
  const t = T - s.t0; s.f(clamp(t / s.d), t);
  FILL.position.copy(camera.position).add(V(0, 1.5, 0));
  renderer.render(scene, camera); ctx.drawImage(glCanvas, 0, 0);
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (T < .25) { ctx.fillStyle = `rgba(255,255,255,${1 - T / .25})`; ctx.fillRect(0, 0, W, H); }
  if (HUD.intro) drawIntro(HUD.intro);
  drawHUD(); caption(T); if (HUD.vote) drawVote(HUD.vote);
  const end = TOTAL - T;
  if (false) { ctx.fillStyle = `rgba(0,0,0,${clamp((1.7 - end) / .5)})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = clamp((1.4 - end) / .3); stroked('ÉPISODE 2', W / 2, H / 2 - 20, '900 84px Inter', '#ffd21f', 14); stroked('BIENTÔT...', W / 2, H / 2 + 60, '900 50px Inter', '#fff', 10); ctx.restore(); }
  return out.toDataURL('image/jpeg', .92);
};
