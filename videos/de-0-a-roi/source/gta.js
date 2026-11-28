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
const buildings = [];
const PASTEL = [0xf6b3c8, 0x9fe0d0, 0xfff1d6, 0x8fd3f0, 0xf9d48a, 0xe8b4f0, 0xffffff, 0xf3a79a];
function building(x, z, w, d, h, col) {
  const mk = () => { const a = WIN_D.clone(), b = WIN_N.clone(); [a, b].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; }); return [a, b]; };
  const [a1, b1] = mk(), [a2, b2] = mk();
  a1.repeat.set(Math.max(1, Math.round(d / 5)), Math.max(1, Math.round(h / 4))); b1.repeat.copy(a1.repeat);
  a2.repeat.set(Math.max(1, Math.round(w / 5)), Math.max(1, Math.round(h / 4))); b2.repeat.copy(a2.repeat);
  const s1 = toon(col, { map: a1, emissive: 0xffd28a, emissiveMap: b1, emissiveIntensity: 0 });
  const s2 = toon(col, { map: a2, emissive: 0xffd28a, emissiveMap: b2, emissiveIntensity: 0 });
  const top = toon(new THREE.Color(col).multiplyScalar(.75));
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [s1, s1, top, top, s2, s2]); m.position.set(x, h / 2, z); add(m);
  buildings.push(s1, s2);
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
function faceTex(expr, must) {
  const key = expr + must; if (faceCache[key]) return faceCache[key];
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
  return (faceCache[key] = tex(c));
}
function outlined(geo, mat, s = 1.06) { const g = new THREE.Group(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; g.add(m); const o = new THREE.Mesh(geo, OUT); o.scale.setScalar(s); g.add(o); return g; }
const chars = [];
function makeChar({ body, hat, hatCol, hatBack, hair, must = false, scale = 1, chain = false, buttons = 0xf2c230 }) {
  const g = new THREE.Group(); const ch = { g, must, scale }; g.scale.setScalar(scale);
  const bodyG = outlined(new THREE.CapsuleGeometry(.3, .32, 6, 14), toon(body), 1.07); bodyG.position.y = 1.0; bodyG.scale.set(1, 1, .85); g.add(bodyG);
  if (buttons) for (let i = 0; i < 2; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), toon(buttons)); b.position.set(0, 1.12 - i * .17, .262); g.add(b); }
  if (chain) { const t = new THREE.Mesh(new THREE.TorusGeometry(.2, .03, 6, 20), toon(0xf2c230, { emissive: 0x403000 })); t.position.set(0, 1.22, .12); t.rotation.x = 1.25; g.add(t); }
  const black = toon(0x161616);
  ch.legs = [-1, 1].map(s => { const h = new THREE.Group(); h.position.set(s * .13, .74, 0);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .72, 6), black); l.position.y = -.36; h.add(l);
    const f = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 6), black); f.scale.set(1, .6, 1.6); f.position.set(0, -.72, .06); h.add(f); g.add(h); return h; });
  ch.arms = [1, -1].map(s => { const h = new THREE.Group(); h.position.set(s * .29, 1.2, 0);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .55, 6), black); l.position.y = -.275; h.add(l);
    const f = new THREE.Mesh(new THREE.SphereGeometry(.065, 8, 6), black); f.position.y = -.56; h.add(f); g.add(h); return h; });
  const head = new THREE.Group(); head.position.y = 1.74; g.add(head); ch.head = head;
  head.add(outlined(new THREE.SphereGeometry(.52, 36, 24), toon(0xffffff), 1.05));
  ch.faceMat = basic(0xffffff, { map: faceTex('neutral', must), transparent: true, depthWrite: false });
  head.add(new THREE.Mesh(new THREE.SphereGeometry(.523, 48, 24), ch.faceMat));
  if (hair) { const hm = toon(hair);
    const cap = outlined(new THREE.SphereGeometry(.55, 28, 16, 0, Math.PI * 2, 0, Math.PI * .5), hm, 1.04); cap.rotation.x = -.45; cap.position.set(0, .03, -.04); head.add(cap);
    const tail = outlined(new THREE.SphereGeometry(.2, 14, 10), hm, 1.08); tail.position.set(0, .15, -.6); head.add(tail);
    const tail2 = outlined(new THREE.SphereGeometry(.15, 12, 8), hm, 1.08); tail2.position.set(0, -.12, -.68); head.add(tail2); }
  const hg = new THREE.Group(); head.add(hg); ch.hat = hg;
  if (hat === 'cap') { const k = outlined(new THREE.SphereGeometry(.52, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(hatCol), 1.04); k.scale.y = .6; k.position.y = .2; hg.add(k);
    const v = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .035, 20, 1, false, -Math.PI / 2, Math.PI), toon(hatCol)); v.position.set(0, .22, .3); hg.add(v); if (hatBack) hg.rotation.y = Math.PI; }
  g.traverse(o => { if (o.isMesh && o.material !== OUT && o.material !== ch.faceMat) o.castShadow = true; });
  scene.add(g); chars.push(ch); ch.setFace = e => { ch.faceMat.map = faceTex(e, must); }; return ch;
}
const NICO = makeChar({ body: 0xd8443a, hat: 'cap', hatCol: 0x1f2a44, hatBack: true, buttons: 0 });
const LINA = makeChar({ body: 0x7a45c2, hair: 0x2a1a14, buttons: 0xffffff });
const PELI = makeChar({ body: 0xf27aa6, chain: true, scale: 1.18, buttons: 0x6fd3ff });
const SUIT = makeChar({ body: 0x1b1b22, buttons: 0xff3fa4 });
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
function focus(p) { const m = scene.userData.mode; const o = m === 'sunset' ? V(40, 18, -10) : V(22, 40, 16); sun.position.copy(p).add(o); sun.target.position.copy(p); }
const rel = (g, x, y, z) => g.localToWorld(V(x, y, z));

// ---------- HUD (écran de jeu) ----------
const HUD = { money: 0, stars: 0, map: false, timer: null, popup: null, red: 0, card: null, phone: 0, zz: [] };
function stroked(txt, x, y, font, fill, lw = 12, align = 'center') { ctx.save(); ctx.font = font; ctx.textAlign = align; ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = '#000'; ctx.strokeText(txt, x, y); ctx.fillStyle = fill; ctx.fillText(txt, x, y); ctx.restore(); }
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
function star(x, y, r, filled) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath();
  ctx.lineWidth = 6; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.fillStyle = filled ? '#ffffff' : 'rgba(255,255,255,.18)'; ctx.fill(); if (filled) { ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.stroke(); } }
function drawHUD() {
  stroked('DE 0 À ROI · ÉPISODE 1', W / 2, 118, '900 34px Inter', '#ffd21f', 10);
  const sc = 1 + HUD.red * .18;
  ctx.save(); ctx.translate(W - 34, 238); ctx.scale(sc, sc); stroked(fmt(HUD.money), 0, 0, '900 56px Inter', HUD.red > .05 ? '#ff3b3b' : '#5be36f', 13, 'right'); ctx.restore();
  for (let i = 0; i < 5; i++) star(W - 50 - (4 - i) * 44, 285, 17, i < HUD.stars);
  if (HUD.map) {
    const cx = 112, cy = 250, r = 82; ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = 'rgba(20,28,40,.85)'; ctx.fill(); ctx.clip();
    const off = (T * 40) % 60; ctx.strokeStyle = 'rgba(200,210,225,.55)'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
    for (let k = -2; k < 4; k++) { const y = cy - r + k * 60 + off; ctx.beginPath(); ctx.moveTo(cx - r, y); ctx.lineTo(cx, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(60,170,220,.8)'; ctx.fillRect(cx + 30, cy - r, 60, 2 * r);
    ctx.strokeStyle = '#ffd21f'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - r); ctx.stroke();
    ctx.restore(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - 13); ctx.lineTo(cx + 10, cy + 10); ctx.lineTo(cx, cy + 5); ctx.lineTo(cx - 10, cy + 10); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke();
    if (HUD.timer) stroked('⏱ ' + HUD.timer, cx, cy + r + 46, '900 38px Inter', HUD.timer === '23:59' ? '#ff4d4d' : '#ffffff', 10);
  }
  if (HUD.popup) { const { title, sub, col, k } = HUD.popup; const y = 430 - (1 - ease(clamp(k))) * 40; ctx.save(); ctx.globalAlpha = clamp(k * 3);
    ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.beginPath(); ctx.roundRect(60, y - 70, W - 120, sub ? 140 : 100, 18); ctx.fill();
    ctx.fillStyle = col; ctx.fillRect(60, y - 70, W - 120, 8);
    stroked(title, W / 2, y - 8, '900 46px Inter', col, 10); if (sub) stroked(sub, W / 2, y + 44, '800 32px Inter', '#fff', 8); ctx.restore(); }
  if (HUD.phone) { const k = HUD.phone; const y = 430; ctx.save(); ctx.globalAlpha = clamp(k * 4);
    ctx.fillStyle = 'rgba(15,15,20,.88)'; ctx.beginPath(); ctx.roundRect(110, y - 64, W - 220, 128, 30); ctx.fill();
    ctx.fillStyle = '#2bd15a'; ctx.beginPath(); ctx.arc(190, y, 36 + Math.sin(T * 18) * 4, 0, 7); ctx.fill(); stroked('📞', 190, y + 14, '40px "Noto Color Emoji"', '#fff', 0);
    stroked('Le Pélican', 250, y - 6, '900 40px Inter', '#fff', 0, 'left'); stroked('appel entrant...', 250, y + 34, '700 28px Inter', '#9fe8b0', 0, 'left'); ctx.restore(); }
  if (HUD.card) { const { name, sub, col, k } = HUD.card; const x0 = -W + ease(clamp(k * 3)) * W; ctx.save(); ctx.translate(x0, 0);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 520); ctx.lineTo(W * .82, 500); ctx.lineTo(W * .76, 640); ctx.lineTo(0, 650); ctx.fill();
    stroked(name, 40, 590, 'italic 900 78px Inter', '#fff', 12, 'left'); stroked(sub, 44, 632, '800 30px Inter', '#ffd21f', 8, 'left'); ctx.restore(); }
  for (const z of HUD.zz) stroked(z.t, z.x, z.y, `900 ${z.s}px Inter`, '#fff', 8);
}
function screen(v) { const p = v.clone().project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; }

// ---------- le découpage ----------
const SHOTS = [
  { d: 3.8, txt: ['Dans *un an*,', 'cette *ville*', 'sera *à eux*.'], f(u, t) { // le futur : en haut de la plus haute tour
    mode('night'); HUD.money = 8400000; HUD.stars = 5;
    pose(NICO, -35.7, -197.9, 0, 'smug', 93.2); pose(LINA, -33.1, -198.0, 0, 'smile', 93.2);
    LINA.head.rotation.y = .3; NICO.arms[1].rotation.set(0, 0, -.8);
    cam(V(-34.4, 96.4, -202.2), V(-34.4, 96.6, -201.2), V(-28, 76, -160), V(-27, 74, -158), u, 62, .4); focus(V(-34, 92, -199)); } },
  { d: 4.2, txt: ['Mais *aujourd\'hui*...', 'ils ont', '*zéro* euro.'], f(u, t) {
    mode('day'); HUD.money = 0; HUD.stars = 0; HUD.red = u > .62 ? Math.abs(Math.sin((u - .62) * 22)) * (1 - (u - .62) * 2) : 0;
    HERO.position.set(11, 0, 92); HERO.rotation.y = 0; seat(NICO, HERO, -1, 'sleep'); seat(LINA, HERO, 1, 'blink');
    NICO.head.rotation.set(.25, 0, .35); LINA.head.rotation.set(.1, 0, -.4); NICO.arms[0].rotation.set(-2.6, 0, .4); NICO.arms[1].rotation.set(-2.6, 0, -.4);
    cam(V(13.5, 2.6, 85.5), V(12.8, 2.3, 86.7), V(11, 1.5, 92), V(11, 1.5, 92), u, 48);
    const hp = screen(rel(NICO.head, 0, .6, 0)); HUD.zz = [0, 1, 2].map(i => { const k = ((t * .8 + i / 3) % 1); return { t: 'Z', x: hp[0] + 30 + k * 60, y: hp[1] - 20 - k * 120, s: 30 + k * 30 }; });
    focus(V(11, 0, 92)); } },
  { d: 6.4, txt: ['Lui, c\'est *Nico*.', 'Il fonce', 'sans *réfléchir*.', 'Elle, c\'est *Lina*.', 'Elle réfléchit', 'pour *deux*.'], f(u, t) {
    mode('day'); HERO.position.set(11, 0, 92); HERO.rotation.y = 0;
    if (u < .5) { pose(NICO, 9.3, 89.5, .5, 'grin'); NICO.arms[1].rotation.set(0, 0, -2.6 + Math.sin(t * 8) * .25); pose(LINA, 12.6, 88, -.3, 'smile');
      cam(V(8.6, 1.95, 85.8), V(8.9, 1.95, 86.3), V(9.3, 1.6, 89.5), V(9.3, 1.6, 89.5), u * 2, 44); HUD.card = { name: 'NICO', sub: 'fonce sans réfléchir', col: '#d8443a', k: u * 2 }; }
    else { pose(LINA, 12.6, 88, -.3, 'smug'); LINA.arms[0].rotation.set(-1.5, -.6, .9); LINA.arms[1].rotation.set(-1.5, .6, -.9); pose(NICO, 9.3, 89.5, .5, 'neutral');
      cam(V(13.6, 1.95, 84.5), V(13.3, 1.95, 85), V(12.6, 1.6, 88), V(12.6, 1.6, 88), (u - .5) * 2, 44); HUD.card = { name: 'LINA', sub: 'réfléchit pour deux', col: '#7a45c2', k: (u - .5) * 2 }; }
    blinkAt(LINA, '', t + .7); focus(V(11, 0, 90)); } },
  { d: 3.6, txt: ['Un matin,', 'le *téléphone* sonne.', 'C\'est le *Pélican*.'], f(u, t) {
    mode('day'); HERO.position.set(11, 0, 92); HERO.rotation.y = 0; HUD.phone = u < .55 ? u + .01 : 0;
    pose(NICO, 9.3, 89.5, .2, u < .55 ? 'surprised' : 'talk'); if (u >= .55) talkFace(NICO, t);
    if (u >= .35) { PHONE.visible = true; NICO.arms[1].rotation.set(-.5, 0, -2.45); }
    pose(LINA, 12.4, 88.6, -.5, 'neutral'); LINA.head.rotation.y = -.4;
    cam(V(9.0, 1.95, 85.6), V(9.2, 1.9, 86.3), V(9.7, 1.6, 89.5), V(9.7, 1.6, 89.5), u, 46); focus(V(11, 0, 90)); } },
  { d: 6.2, txt: ['« Un *colis*.', 'Livré', 'avant *minuit*.', 'Et surtout...', 'vous ne l\'ouvrez *pas*. »'], f(u, t) {
    mode('day'); pose(PELI, -9.2, 60.4, Math.PI / 2 - .2, 'cool'); talkFace(PELI, t, 'cooltalk', 'cool');
    PELI.arms[1].rotation.set(-.9, 0, -.2);
    PKG.visible = true; PKG.position.set(-8.4, 1.12, 61.6); GLOW.visible = false; GLOWL.intensity = 0; LID.rotation.set(0, 0, 0); LID.position.set(0, .22, 0);
    pose(NICO, -5.3, 62.8, -1.9, 'neutral'); pose(LINA, -5.2, 61.0, -1.4, 'determined');
    if (u < .5) cam(V(-4.2, 2.4, 66.5), V(-4.6, 2.3, 65.8), V(-8.2, 1.4, 60.8), V(-8.2, 1.5, 60.8), u * 2, 48);
    else { cam(V(-6.4, 2.05, 62.4), V(-6.6, 2.05, 62.1), V(-9.2, 2.0, 60.4), V(-9.2, 2.05, 60.4), (u - .5) * 2, 44); if (u > .8) PELI.arms[0].rotation.set(-1.4, 0, .1); }
    focus(V(-8, 0, 61)); } },
  { d: 4.6, txt: ['*Mission* acceptée.', 'Ils traversent', 'toute la *ville*.'], f(u, t) {
    mode('sunset'); HUD.map = true; HUD.timer = '23:' + String(Math.floor(lerp(35, 41, u))).padStart(2, '0');
    HUD.popup = u < .55 ? { title: 'NOUVELLE MISSION', sub: 'Livrer le colis avant minuit', col: '#ffd21f', k: u * 3 } : null;
    const z = 40 - t * 11; HERO.position.set(-2.6, 0, z); HERO.rotation.y = Math.sin(t * 1.3) * .03;
    seat(NICO, HERO, -1, 'grin'); seat(LINA, HERO, 1, 'smile'); LINA.arms[0].rotation.set(-2.7, 0, .5); NICO.arms[0].rotation.set(-1.2, 0, .1); NICO.arms[1].rotation.set(-1.2, 0, -.1);
    cam(V(1.6 - 2.6, 1.8, z - 8.5), V(3.2 - 2.6, 1.4, z - 7.6), V(-2.6, 1.2, z), V(-2.6, 1.3, z), u, 50, .5); focus(V(0, 0, z)); } },
  { d: 5.2, txt: ['Mais une voiture *noire*', 'les suit', 'depuis le port.', 'Nico *accélère*.'], f(u, t) {
    mode('sunset'); HUD.map = true; HUD.timer = '23:' + String(Math.floor(lerp(44, 50, u))).padStart(2, '0'); HUD.stars = 0;
    const z = -10 - t * 12; HERO.position.set(-2.6, 0, z); BLACK.position.set(-2.2 + Math.sin(t * 2) * .4, 0, z + 11 - (u > .6 ? (u - .6) * 18 : 0)); BLACK.rotation.y = Math.sin(t * 2) * .05;
    if (u < .6) { seat(NICO, HERO, -1, 'neutral'); seat(LINA, HERO, 1, u > .25 ? 'surprised' : 'neutral'); if (u > .25) LINA.head.rotation.y = Math.PI * .75;
      cam(V(-3.6, 2.3, z - 7), V(-3.4, 2.4, z - 7.5), V(-2.4, 1.2, z + 5), V(-2.4, 1.2, z + 5), u / .6, 50, .6); }
    else { seat(NICO, HERO, -1, 'grin'); seat(LINA, HERO, 1, 'shock'); NICO.head.rotation.z = .1;
      cam(V(-3.5, 2.05, z - 2.4), V(-3.4, 2.0, z - 2.1), V(-3.05, 1.9, z + .5), V(-3.05, 1.9, z + .5), (u - .6) / .4, 42, 1.6); }
    focus(V(0, 0, z)); } },
  { d: 4.0, txt: ['Virage *serré*...', 'et la voiture noire', 'finit dans les *cartons*.'], f(u, t) {
    mode('sunset'); HUD.map = true; HUD.timer = '23:53';
    const zc = -58; const hz = zc + 22 - t * 15; HERO.position.set(-2.6 + Math.sin(clamp((22 - t * 15) / 22 + 1) * Math.PI) * -1.6, 0, hz); HERO.rotation.y = Math.cos(clamp(u * 1.6) * Math.PI) * .15;
    seat(NICO, HERO, -1, 'grin'); seat(LINA, HERO, 1, 'shock');
    const ti = 1.9, bz = zc + 34 - Math.min(t, ti) * 15 + (t > ti ? -(1 - Math.exp(-(t - ti) * 3)) * 4 : 0);
    BLACK.position.set(-2.4 - (t > ti - .5 ? (1 - Math.exp(-(t - ti + .5) * 2.5)) * 3 : 0), 0, bz); BLACK.rotation.y = t > ti - .5 ? (1 - Math.exp(-(t - ti + .5) * 2.2)) * 2.4 : 0;
    CARTONS.forEach((b, i) => { b.visible = true; const p = b.userData.base; if (t < ti) { b.position.copy(p); b.rotation.set(0, 0, 0); return; }
      const dt = t - ti, vx = (-2 - (i % 3)) , vy = 4 + (i % 4) * 1.3, vz = ((i * 37) % 7 - 3) * .9; const y = Math.max(.4, p.y + vy * dt - 9.8 * dt * dt / 2);
      b.position.set(p.x + vx * Math.min(dt, 1.2), y, p.z + vz * Math.min(dt, 1.2)); b.rotation.set(dt * (i + 2), dt * 3, dt * (5 - i % 3)); });
    cam(V(6.5, 3.2, zc + 9), V(6.0, 3.0, zc + 8), V(-3, 1, zc + 2), V(-3, 1, zc), u, 52, .5); focus(V(-2, 0, zc)); } },
  { d: 5.0, txt: ['*23 h 59*.', 'Colis *livré*.', '*Cinq cents* euros.'], f(u, t) {
    mode('night'); HUD.map = u < .45; HUD.timer = '23:59';
    HERO.position.set(-3.2, 0, -116.5); seat(LINA, HERO, 1, 'smile'); LINA.head.rotation.y = -.8;
    pose(SUIT, -9.0, -120, Math.PI / 2, 'cool'); pose(NICO, -7.4, -119.6, -Math.PI / 2 + .15, u < .45 ? 'neutral' : 'grin');
    PKG.visible = true; GLOW.visible = false; GLOWL.intensity = 0; LID.position.set(0, .22, 0); LID.rotation.set(0, 0, 0);
    const k = clamp((u - .15) / .3); PKG.position.copy(rel(NICO.g, 0, 1.0, .45).lerp(rel(SUIT.g, 0, 1.0, .45), ease(k)));
    NICO.arms[0].rotation.set(-1.3 * (1 - k), 0, .2); NICO.arms[1].rotation.set(-1.3 * (1 - k), 0, -.2); SUIT.arms[0].rotation.set(-1.3 * k, 0, .2); SUIT.arms[1].rotation.set(-1.3 * k, 0, -.2);
    if (u > .45) { const m = clamp((u - .5) / .3); HUD.money = Math.round(ease(m) * 500); HUD.stars = u > .8 ? 1 : 0;
      HUD.popup = { title: 'MISSION RÉUSSIE', sub: '+500 €', col: '#5be36f', k: (u - .45) * 3 }; NICO.arms[1].rotation.set(0, 0, -2.6 + Math.sin(t * 10) * .2); }
    cam(V(-3.8, 2.3, -125.5), V(-4.1, 2.2, -124.6), V(-8.2, 1.6, -119.8), V(-8.2, 1.6, -119.8), u, 48); focus(V(-8, 0, -120)); } },
  { d: 5.0, txt: ['Mais en partant,', '*Lina* voit', 'ce qu\'il y avait', 'dans le *colis*...'], f(u, t) {
    mode('night'); HUD.money = 500; HUD.stars = 1;
    HERO.position.set(-3.2, 0, -116.5); seat(LINA, HERO, 1, u < .5 ? 'neutral' : 'surprised'); seat(NICO, HERO, -1, 'smile');
    pose(SUIT, -9.0, -120, Math.PI / 2 + .3, 'cool'); SUIT.arms[0].rotation.set(-1.2, 0, .2); SUIT.arms[1].rotation.set(-1.2, 0, -.2);
    PKG.visible = true; PKG.position.copy(rel(SUIT.g, 0, 1.0, .45)); PKG.rotation.y = SUIT.g.rotation.y;
    const o = clamp((u - .2) / .3); LID.position.set(0, .22 + o * .1, -o * .2); LID.rotation.x = -o * 1.8;
    GLOW.visible = o > 0; GLOW.scale.setScalar(.3 + o * (1 + Math.sin(t * 9) * .08)); GLOW.position.y = .2; GLOWL.intensity = o * 18;
    if (u < .5) cam(V(-4.8, 2.3, -114.4), V(-5.1, 2.2, -114.8), V(-9.0, 1.3, -119.8), V(-9.0, 1.4, -119.8), u * 2, 44);
    else { LINA.head.rotation.y = -1.15; cam(V(-4.1, 1.95, -118.4), V(-4.0, 1.95, -118.1), rel(LINA.head, 0, 0, 0), rel(LINA.head, 0, 0, 0), (u - .5) * 2, 44); }
    focus(V(-6, 0, -118)); } },
  { d: 3.8, txt: ['« *Nico*...', 'on a un *problème*. »'], f(u, t) {
    mode('night'); HUD.money = 500; HUD.stars = 1;
    HERO.position.set(-3.2, 0, -116.5); seat(LINA, HERO, 1, 'shock'); talkFace(LINA, t, 'shock', 'surprised'); LINA.head.rotation.y = .5;
    seat(NICO, HERO, -1, u < .55 ? 'smile' : 'surprised'); NICO.head.rotation.y = u < .55 ? 0 : -.5;
    cam(V(-3.2, 2.0, -120.6), V(-3.2, 2.0, -120.1), V(-3.2, 1.75, -116), V(-3.2, 1.75, -116), u, 46); focus(V(-3, 0, -117)); } },
  { d: 1.9, txt: [], f(u, t) { SHOTS[10].f(1, 3.8 + t); } },
];
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
  PKG.visible = false; PKG.rotation.set(0, 0, 0); PHONE.visible = false; CARTONS.forEach(b => { b.position.copy(b.userData.base); b.rotation.set(0, 0, 0); });
  Object.assign(HUD, { money: 0, stars: 0, map: false, timer: null, popup: null, red: 0, card: null, phone: 0, zz: [] });
  const t = T - s.t0; s.f(clamp(t / s.d), t);
  FILL.position.copy(camera.position).add(V(0, 1.5, 0));
  renderer.render(scene, camera); ctx.drawImage(glCanvas, 0, 0);
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (T < .25) { ctx.fillStyle = `rgba(255,255,255,${1 - T / .25})`; ctx.fillRect(0, 0, W, H); }
  drawHUD(); caption(T);
  const end = TOTAL - T;
  if (end < 1.7) { ctx.fillStyle = `rgba(0,0,0,${clamp((1.7 - end) / .5)})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = clamp((1.4 - end) / .3); stroked('ÉPISODE 2', W / 2, H / 2 - 20, '900 84px Inter', '#ffd21f', 14); stroked('BIENTÔT...', W / 2, H / 2 + 60, '900 50px Inter', '#fff', 10); ctx.restore(); }
  return out.toDataURL('image/jpeg', .92);
};
