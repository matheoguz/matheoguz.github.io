// Décor de la démo « Hyper Modèle » : ce qui rend la maquette plus réaliste sans coûter de dessins.
// Module ES sans import : THREE est passé en paramètre. Chaque fonction ajoute UN maillage à la scène.
//
//   ombresContact(THREE, scene, { x0, z0, l, p, y, rects })  -> Mesh
//     Ombre douce « cuite » au sol sous les meubles (occlusion ambiante dessinée une fois dans un canvas) :
//     rects = [{ x0, x1, z0, z1, a, flou }] en mètres (a = opacité 0..1, flou en mètres).
//   halo(THREE, scene, { x0, x1, z0, z1, y, couleur, force }) -> Mesh
//     Flaque de lumière froide au sol devant les vitrines (dégradé additif, du mur vers l'allée).
//   creerVoile(THREE, scene, camera, { couleur }) -> { maj(boite, opacite), mesh }
//     Voile clair posé devant tout ce qui sort d'une boîte (ex. la surface de vente) : le reste du site est
//     atténué. boite = [x0, x1, y0, y1, z0, z1]. Le trou suit la caméra (enveloppe convexe des 8 coins projetés).

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

export function ombresContact(THREE, scene, { x0, z0, l, p, y = 0.226, rects, ppm = 32 }) {
  const W = Math.min(4096, Math.round(l * ppm)), H = Math.min(4096, Math.round(p * ppm)), kx = W / l, kz = H / p;
  const [c, g] = canvas(W, H);
  for (const r of rects) {
    const f = Math.max(1, (r.flou ?? 0.35) * kx);
    g.filter = `blur(${f.toFixed(1)}px)`;
    g.fillStyle = `rgba(15,23,42,${r.a ?? 0.45})`;
    g.fillRect((r.x0 - x0) * kx, (r.z0 - z0) * kz, (r.x1 - r.x0) * kx, (r.z1 - r.z0) * kz);
  }
  g.filter = 'none';
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(l, p), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x0 + l / 2, y, z0 + p / 2); m.renderOrder = 1; m.userData.dyn = true; m.raycast = () => {};
  scene.add(m); return m;
}

export function halo(THREE, scene, { x0, x1, z0, z1, y = 0.23, couleur = '#9fd0ff', force = 0.5, taches = [] }) {
  const [c, g] = canvas(512, 128);
  const d = g.createLinearGradient(0, 0, 0, 128); d.addColorStop(0, couleur); d.addColorStop(0.35, couleur + '99'); d.addColorStop(1, couleur + '00');
  g.fillStyle = d; g.fillRect(0, 0, 512, 128);
  // taches plus claires sous chaque spot (u de 0 à 1 le long du mur)
  for (const u of taches) { const r = g.createRadialGradient(u * 512, 8, 2, u * 512, 8, 90); r.addColorStop(0, '#ffffffaa'); r.addColorStop(1, '#ffffff00'); g.fillStyle = r; g.fillRect(0, 0, 512, 128); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: force, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.renderOrder = 3; m.userData.dyn = true; m.raycast = () => {};
  scene.add(m); return m;
}

function enveloppe(pts) { // enveloppe convexe (chaîne monotone), sens trigonométrique
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const bas = [], haut = [];
  for (const p of pts) { while (bas.length >= 2 && x(bas[bas.length - 2], bas[bas.length - 1], p) <= 0) bas.pop(); bas.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (haut.length >= 2 && x(haut[haut.length - 2], haut[haut.length - 1], p) <= 0) haut.pop(); haut.push(p); }
  return bas.slice(0, -1).concat(haut.slice(0, -1));
}

export function creerVoile(THREE, scene, camera, { couleur = 0xeef0f3 } = {}) {
  if (!camera.parent) scene.add(camera);
  const mat = new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  mesh.position.z = -(camera.near + 0.5); mesh.renderOrder = 15; mesh.frustumCulled = false; mesh.visible = false; mesh.userData.dyn = true; mesh.raycast = () => {};
  camera.add(mesh);
  const v = new THREE.Vector3(); let cle = '';
  function maj(b, opacite) {
    mat.opacity = opacite; mesh.visible = opacite > 0.01;
    if (!mesh.visible) return;
    const pts = [];
    for (const x of [b[0], b[1]]) for (const y of [b[2], b[3]]) for (const z of [b[4], b[5]]) { v.set(x, y, z).project(camera); pts.push([Math.max(-90, Math.min(90, v.x)), Math.max(-90, Math.min(90, v.y))]); }
    const h = enveloppe(pts), k = h.map((p) => p[0].toFixed(4) + ',' + p[1].toFixed(4)).join(';') + '|' + camera.zoom + '|' + camera.right + '|' + camera.top;
    if (k === cle) return; cle = k;
    const sx = camera.right / camera.zoom, sy = camera.top / camera.zoom;
    const forme = new THREE.Shape([[-100, -100], [100, -100], [100, 100], [-100, 100]].map(([a, c]) => new THREE.Vector2(a * sx, c * sy)));
    forme.holes.push(new THREE.Path(h.slice().reverse().map(([a, c]) => new THREE.Vector2(a * sx, c * sy))));
    mesh.geometry.dispose(); mesh.geometry = new THREE.ShapeGeometry(forme);
  }
  return { maj, mesh };
}
