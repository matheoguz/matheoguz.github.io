// Vue 3D en direct de l'éditeur : murs extrudés (ouvertures découpées), sol, zones colorées, objets de la bibliothèque.
// Rendu dans le style des démos (murs bleu nuit à dessus clair, environnement doux, ombres) ; on ne dessine qu'à la demande.
//   creerVue3d(conteneur) -> { maj(doc), cadrer(), image() -> Promise<Blob>, taille(), theme(nuit), info() }
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { fusionnerStatique } from '../grande-surface/rendu.js';
import { construire3d } from './catalogue.js';
import { geometrieMur, centre } from './modele.js';

const NUIT = 0x1f2b4d, NUIT_HAUT = 0x8b98bb;

function texteSol(txt, couleur) {
  const c = document.createElement('canvas'), g = c.getContext('2d'); g.font = '700 56px Inter, Arial, sans-serif';
  const w = Math.min(2048, Math.ceil(g.measureText(txt).width) + 96); c.width = w; c.height = 96;
  g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.roundRect ? g.roundRect(4, 8, w - 8, 80, 40) : g.rect(4, 8, w - 8, 80); g.fill();
  g.fillStyle = couleur; g.beginPath(); g.arc(40, 48, 12, 0, 7); g.fill();
  g.font = '700 56px Inter, Arial, sans-serif'; g.fillStyle = '#0f172a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2 + 14, 50);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { t, ratio: w / 96 };
}

export function creerVue3d(conteneur) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.85;
  conteneur.prepend(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xeef0f3);
  { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture; pm.dispose(); }
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 800);
  camera.position.set(10, 25, 30);
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.1, maxPolarAngle: 1.45, minDistance: 2, maxDistance: 300, screenSpacePanning: false });
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd3da, 0.4));
  const soleil = new THREE.DirectionalLight(0xfff8ef, 1.8); soleil.castShadow = true; soleil.shadow.mapSize.set(2048, 2048); soleil.shadow.bias = -0.0004; soleil.shadow.normalBias = 0.04; soleil.shadow.radius = 3;
  scene.add(soleil, soleil.target);
  let racine = null, sale = true, boite = null, nuit = false, n = { dessins: 0 };

  const mats = new Map();
  const mat = (col, o = {}) => {
    const k = col + JSON.stringify(o); if (mats.has(k)) return mats.get(k);
    const m = new THREE.MeshStandardMaterial({ color: col, roughness: o.metal ? 0.35 : o.verre ? 0.08 : 0.8, metalness: o.metal ? 0.35 : 0 });
    if (o.verre) { m.transparent = true; m.opacity = 0.32; m.depthWrite = false; }
    if (o.emissif) { m.emissive = new THREE.Color(col); m.emissiveIntensity = o.emissif; }
    mats.set(k, m); return m;
  };
  const geoBoite = new THREE.BoxGeometry(1, 1, 1);

  function construire(doc) {
    if (racine) { racine.traverse((o) => { if (o.userData.fusion || o.userData.jetable) { o.geometry.dispose(); if (o.material.vertexColors || o.userData.jetable) { o.material.map && o.material.map.dispose(); o.material.dispose(); } } }); scene.remove(racine); }
    racine = new THREE.Group(); scene.add(racine);
    const C = doc.calques, H = doc.reglages.hauteurMurs;
    // emprise : murs, zones, objets
    const b = new THREE.Box2(); const etendre = (x, y) => b.expandByPoint(new THREE.Vector2(x, y));
    if (C.murs) for (const m of doc.murs) { etendre(m.a.x, m.a.y); etendre(m.b.x, m.b.y); }
    if (C.zones) for (const z of doc.zones) for (const p of z.points) etendre(p.x, p.y);
    if (C.objets) for (const o of doc.objets) { const r = Math.hypot(o.largeur, o.profondeur) / 2; etendre(o.x - r, o.y - r); etendre(o.x + r, o.y + r); }
    if (b.isEmpty()) { etendre(-5, -5); etendre(5, 5); }
    boite = b.clone();
    const cx = (b.min.x + b.max.x) / 2, cz = (b.min.y + b.max.y) / 2, lx = b.max.x - b.min.x, lz = b.max.y - b.min.y;
    // sol : grand fond + carrelage clair sous l'emprise
    const sol = new THREE.Mesh(new THREE.PlaneGeometry(lx + 60, lz + 60), new THREE.MeshStandardMaterial({ color: nuit ? 0x1a2236 : 0xe4e8ee, roughness: 0.95 }));
    sol.rotation.x = -Math.PI / 2; sol.position.set(cx, -0.01, cz); sol.receiveShadow = true; sol.userData = { jetable: true, dyn: true }; racine.add(sol);
    { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'); g.fillStyle = '#f7f8fa'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#dde2ea'; g.lineWidth = 2; g.strokeRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((lx + 1) / 0.6, (lz + 1) / 0.6); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      const dalle = new THREE.Mesh(new THREE.PlaneGeometry(lx + 1, lz + 1), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); dalle.rotation.x = -Math.PI / 2; dalle.position.set(cx, 0, cz); dalle.receiveShadow = true; dalle.userData = { jetable: true, dyn: true }; racine.add(dalle); }
    // zones : sol teinté + nom couché au sol
    if (C.zones) doc.zones.forEach((z, i) => {
      const forme = new THREE.Shape(z.points.map((p) => new THREE.Vector2(p.x, -p.y)));
      const col = new THREE.Color(z.couleur).lerp(new THREE.Color(0xffffff), 0.4);
      const m = new THREE.Mesh(new THREE.ShapeGeometry(forme), new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, transparent: true, opacity: 0.9, polygonOffset: true, polygonOffsetFactor: -1 - i % 3, polygonOffsetUnits: -1 }));
      m.rotation.x = -Math.PI / 2; m.position.y = 0.004 + (i % 3) * 0.001; m.receiveShadow = true; m.userData = { jetable: true, dyn: true }; racine.add(m);
      const c = centre(z.points), { t, ratio } = texteSol(z.nom, z.couleur);
      // étiquette flottante, toujours lisible (pas cachée par les meubles)
      const et = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); et.scale.set(0.9 * ratio, 0.9, 1);
      et.position.set(c.x, Math.min(H, 2.2) + 0.6, c.y); et.renderOrder = 5; et.userData = { jetable: true, dyn: true }; racine.add(et);
    });
    // murs : morceaux pleins entre les ouvertures, linteaux, allèges et vitres
    if (C.murs) {
      const mm = [mat(NUIT), mat(NUIT), mat(NUIT_HAUT), mat(NUIT), mat(NUIT), mat(NUIT)];
      for (const mur of doc.murs) {
        const G = geometrieMur(mur, doc.ouvertures); if (G.L < 0.01) continue;
        const e = mur.epaisseur, ang = Math.atan2(G.uy, G.ux);
        const morceau = (t0, t1, y0, y1, m = mm) => { if (t1 - t0 < 0.005 || y1 - y0 < 0.005) return; const b = new THREE.Mesh(geoBoite, m); b.scale.set(t1 - t0, y1 - y0, e); const t = (t0 + t1) / 2; b.position.set(mur.a.x + G.ux * t, (y0 + y1) / 2, mur.a.y + G.uy * t); b.rotation.y = -ang; b.castShadow = b.receiveShadow = true; racine.add(b); };
        let t = -e / 2;
        for (const { o, debut, fin } of G.ouv) {
          morceau(t, debut, 0, H); const hh = Math.min(H, o.allege + o.hauteur);
          morceau(debut, fin, hh, H);
          if (o.type === 'fenetre') { morceau(debut, fin, 0, o.allege); const v = new THREE.Mesh(geoBoite, mat('#93c5fd', { verre: true })); v.scale.set(fin - debut, hh - o.allege, 0.03); const tc = (debut + fin) / 2; v.position.set(mur.a.x + G.ux * tc, (o.allege + hh) / 2, mur.a.y + G.uy * tc); v.rotation.y = -ang; racine.add(v); }
          t = Math.max(t, fin);
        }
        morceau(t, G.L + e / 2, 0, H);
      }
    }
    // objets
    if (C.objets) for (const o of doc.objets) {
      const grp = new THREE.Group(); grp.position.set(o.x, 0, o.y); grp.rotation.y = -o.rotation * Math.PI / 180; racine.add(grp);
      const ajout = (geo, m, x, y, z, opts) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = opts.ombre !== false; me.receiveShadow = true; grp.add(me); return me; };
      construire3d({
        boite: (l, h, p, col, x, y, z, opts = {}) => { const me = ajout(new THREE.BoxGeometry(Math.max(0.005, l), Math.max(0.005, h), Math.max(0.005, p)), mat(col, opts), x, y + h / 2, z, opts); return me; },
        cyl: (r, h, col, x, y, z, opts = {}) => { const me = ajout(new THREE.CylinderGeometry(r, r, h, opts.seg || 12), mat(col, opts), x, opts.axeZ ? y : y + h / 2, z, opts); if (opts.axeZ) me.rotation.x = Math.PI / 2; return me; },
        boule: (r, col, x, y, z) => ajout(new THREE.IcosahedronGeometry(r, 1), mat(col), x, y, z, {}),
      }, o);
    }
    const f = fusionnerStatique(THREE, racine);
    // les géométries d'origine des objets ne servent plus
    n.avant = f.avant; n.apres = f.apres;
    // lumière et ombres réglées sur l'emprise
    const R = Math.max(lx, lz) / 2 + 4;
    soleil.target.position.set(cx, 0, cz); soleil.position.set(cx - R * 0.8, R * 2.2, cz + R * 0.9);
    Object.assign(soleil.shadow.camera, { left: -R * 1.3, right: R * 1.3, top: R * 1.3, bottom: -R * 1.3, near: 1, far: R * 6 }); soleil.shadow.camera.updateProjectionMatrix();
    sale = true;
  }

  function cadrer() {
    if (!boite) return;
    const cx = (boite.min.x + boite.max.x) / 2, cz = (boite.min.y + boite.max.y) / 2, r = Math.max(4, Math.hypot(boite.max.x - boite.min.x, boite.max.y - boite.min.y) / 2);
    const v = camera.fov * Math.PI / 180, hz = 2 * Math.atan(Math.tan(v / 2) * camera.aspect), d = r / Math.sin(Math.min(v, hz) / 2) * 0.92;
    controls.target.set(cx, 0, cz);
    camera.position.set(cx + d * Math.sin(0.25) * Math.cos(0.95), d * Math.sin(0.95), cz + d * Math.cos(0.25) * Math.cos(0.95));
    controls.update(); sale = true;
  }

  function taille() {
    const w = conteneur.clientWidth, h = conteneur.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px';
    camera.aspect = w / h; camera.updateProjectionMatrix(); sale = true;
  }
  new ResizeObserver(taille).observe(conteneur);
  controls.addEventListener('change', () => { sale = true; });
  (function boucle() {
    requestAnimationFrame(boucle);
    if (!conteneur.clientWidth) return;
    controls.update();
    if (sale) { sale = false; renderer.render(scene, camera); n.dessins = renderer.info.render.calls; }
  })();

  let premier = true;
  return {
    maj(doc) { construire(doc); if (premier) { premier = false; taille(); cadrer(); } },
    cadrer,
    taille,
    theme(v) { nuit = v; scene.background = new THREE.Color(v ? 0x0e1424 : 0xeef0f3); sale = true; },
    // image PNG de la vue, deux fois plus fine que l'écran
    image() {
      return new Promise((ok) => {
        const pr = renderer.getPixelRatio(); renderer.setPixelRatio(2); taille(); renderer.render(scene, camera);
        renderer.domElement.toBlob((b) => { renderer.setPixelRatio(pr); taille(); ok(b); }, 'image/png');
      });
    },
    info: () => ({ ...n }),
    scene,
  };
}
