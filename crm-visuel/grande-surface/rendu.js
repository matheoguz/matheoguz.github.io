// Rendu de la démo « Hyper Modèle » : moins de dessins pour la carte graphique, sans rien changer à la logique.
// Module ES sans import : THREE est passé en paramètre.
//
//   fusionnerStatique(THREE, scene, { conteneurs, cliquables }) -> { maillages, avant, apres }
//     Après la construction, toutes les boîtes immobiles qui partagent le même type de matière (rugosité, métal,
//     émission, transparence, texture) sont réunies en un seul maillage, la couleur passant dans les sommets.
//     Les objets marqués userData.dyn (et leurs enfants) ne sont pas touchés. Un groupe marqué userData.conteneur
//     (ex. l'étage, qu'on cache ou montre) garde ses propres maillages fusionnés, qui suivent sa visibilité.
//     Les maillages d'origine cliquables restent dans la scène sur le calque 1 : invisibles pour la caméra
//     et les ombres, mais toujours touchés par le clic (raycaster.layers.enableAll()).
//
//   creerFoule(THREE, scene) -> { type(nom, geo, mat, max, ombre), ajouter(nom, obj, couleur), maj() }
//     Des objets animés identiques (personnes, chariots, voitures, palettes) dessinés en un seul InstancedMesh par
//     type. Chaque objet reste un Object3D (position, rotation, échelle, visible, parent) : maj() recopie sa
//     matrice monde à chaque image. Un objet retiré de la scène est oublié.

const CLES_MAT = ['roughness', 'metalness', 'transparent', 'opacity', 'flatShading', 'side', 'depthWrite', 'emissiveIntensity', 'toneMapped'];

function cleMatiere(m) {
  if (m.map || m.type !== 'MeshStandardMaterial' || m.vertexColors) return 'u:' + m.uuid; // texturée : à part
  return m.type + '|' + CLES_MAT.map((k) => (typeof m[k] === 'number' ? Math.round(m[k] * 1000) : m[k])).join('|') + '|' + m.emissive.getHexString();
}

function fusionnerGeos(THREE, liste, couleurs) {
  // liste : [{ geo, matrice, couleur }] ; toutes indexées ou non, avec position, normal, uv
  let nv = 0, ni = 0;
  for (const it of liste) { nv += it.geo.attributes.position.count; ni += it.geo.index ? it.geo.index.count : it.geo.attributes.position.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), col = couleurs ? new Float32Array(nv * 3) : null;
  const IdxT = nv > 65535 ? Uint32Array : Uint16Array, idx = new IdxT(ni);
  const v = new THREE.Vector3(), nm = new THREE.Matrix3();
  let ov = 0, oi = 0;
  for (const it of liste) {
    const g = it.geo, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, n = P.count;
    nm.getNormalMatrix(it.matrice);
    const miroir = it.matrice.determinant() < 0;
    for (let k = 0; k < n; k++) {
      v.fromBufferAttribute(P, k).applyMatrix4(it.matrice); pos.set([v.x, v.y, v.z], (ov + k) * 3);
      if (N) { v.fromBufferAttribute(N, k).applyMatrix3(nm).normalize(); nor.set([v.x, v.y, v.z], (ov + k) * 3); }
      if (U) uv.set([U.getX(k), U.getY(k)], (ov + k) * 2);
      if (col) col.set([it.couleur.r, it.couleur.g, it.couleur.b], (ov + k) * 3);
    }
    if (g.index) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { idx[oi++] = I[k] + ov; idx[oi++] = miroir ? I[k + 2] + ov : I[k + 1] + ov; idx[oi++] = miroir ? I[k + 1] + ov : I[k + 2] + ov; } }
    else for (let k = 0; k < n; k++) idx[oi++] = ov + k;
    ov += n;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  if (col) out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere(); out.computeBoundingBox();
  return out;
}

export function fusionnerStatique(THREE, scene, { cliquables = [] } = {}) {
  scene.updateMatrixWorld(true);
  const clic = new Set(cliquables);
  const groupes = new Map(); // conteneur -> Map(cle -> { mat, ombre, items })
  const aRetirer = new Set();
  let avant = 0;
  const visiter = (o, conteneur) => {
    if (o.userData.dyn || o.isInstancedMesh || o.isSprite || o.isLine || o.isPoints) return;
    if (o !== scene && o.userData.conteneur) conteneur = o;
    if (o.visible === false) return; // un objet caché au départ (camion, zones) reste tel quel
    for (const c of [...o.children]) visiter(c, conteneur);
    if (!o.isMesh || Array.isArray(o.material) || !o.material.visible) return;
    const g = o.geometry; if (!g.attributes.position || !g.attributes.normal || g.morphAttributes.position) return;
    avant++;
    const m = o.material, cle = cleMatiere(m) + '|' + (o.castShadow ? 1 : 0) + '|' + (o.receiveShadow ? 1 : 0) + '|' + o.renderOrder;
    if (!groupes.has(conteneur)) groupes.set(conteneur, new Map());
    const G = groupes.get(conteneur);
    if (!G.has(cle)) G.set(cle, { mat: m, ombre: o.castShadow, recoit: o.receiveShadow, ordre: o.renderOrder, items: [] });
    const inv = new THREE.Matrix4().copy(conteneur.matrixWorld).invert();
    G.get(cle).items.push({ o, geo: g, matrice: inv.multiply(o.matrixWorld), couleur: m.color ? m.color.clone() : new THREE.Color(1, 1, 1) });
    aRetirer.add(o);
  };
  visiter(scene, scene);
  // on ne fusionne pas un lot d'un seul objet (rien à gagner)
  const maillages = [];
  const matsVC = new Map();
  for (const [conteneur, G] of groupes) for (const [cle, lot] of G) {
    if (lot.items.length < 2) { for (const it of lot.items) aRetirer.delete(it.o); continue; }
    const texturee = cle.startsWith('u:');
    let m = lot.mat;
    if (!texturee) {
      const k = cle.split('|').slice(0, -3).join('|');
      if (!matsVC.has(k)) { const c = lot.mat.clone(); c.color.setRGB(1, 1, 1); c.vertexColors = true; matsVC.set(k, c); }
      m = matsVC.get(k);
    }
    const geo = fusionnerGeos(THREE, lot.items, !texturee);
    const mesh = new THREE.Mesh(geo, m);
    mesh.castShadow = lot.ombre; mesh.receiveShadow = lot.recoit; mesh.renderOrder = lot.ordre; mesh.matrixAutoUpdate = false;
    mesh.raycast = () => {}; mesh.userData.fusion = true;
    conteneur.add(mesh); maillages.push(mesh);
  }
  // les originaux : retirés, sauf ceux qu'on clique (gardés sur le calque 1, hors rendu)
  for (const o of aRetirer) {
    if (clic.has(o)) { o.layers.set(1); continue; }
    o.parent && o.parent.remove(o);
  }
  return { maillages, avant, apres: maillages.length };
}

// ---------- foule : objets animés dessinés en InstancedMesh ----------
export function creerFoule(THREE, scene) {
  const types = new Map();
  const m4 = new THREE.Matrix4(), blanc = new THREE.Color(1, 1, 1);
  function type(nom, geo, mat, max, ombre = true) {
    const im = new THREE.InstancedMesh(geo, mat, max);
    im.count = 0; im.castShadow = ombre; im.receiveShadow = true; im.frustumCulled = false; im.raycast = () => {};
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.setColorAt(0, blanc); im.instanceColor.setUsage(THREE.DynamicDrawUsage);
    scene.add(im);
    types.set(nom, { im, max, objets: new Map() }); // objet -> couleur
  }
  function ajouter(nom, obj, couleur = 0xffffff) {
    const t = types.get(nom), c = new THREE.Color(couleur); t.objets.set(obj, c);
    if (!obj.userData.couleurFoule) obj.userData.couleurFoule = c; // la première couleur posée (ex. voiture : peindre())
    return obj;
  }
  function visibleDansScene(o) { let p = o; while (p) { if (!p.visible) return false; if (p === scene) return true; p = p.parent; } return null; }
  function maj() {
    for (const t of types.values()) {
      let n = 0;
      for (const [o, c] of t.objets) {
        const v = visibleDansScene(o);
        if (v === null) { t.objets.delete(o); continue; } // retiré de la scène
        if (!v || n >= t.max) continue;
        t.im.setMatrixAt(n, o.matrixWorld); t.im.setColorAt(n, c); n++;
      }
      t.im.count = n;
      t.im.instanceMatrix.needsUpdate = true; t.im.instanceColor.needsUpdate = true;
    }
  }
  return { type, ajouter, maj, types, m4 };
}

// ---------- fabriquer une géométrie unique à partir de morceaux colorés ----------
// morceaux : [{ geo, x, y, z, rx, ry, rz, sx, sy, sz, couleur }] -> BufferGeometry avec couleurs de sommets
export function assembler(THREE, morceaux) {
  const items = morceaux.map((p) => {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(p.x || 0, p.y || 0, p.z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(p.rx || 0, p.ry || 0, p.rz || 0)), new THREE.Vector3(p.sx ?? 1, p.sy ?? 1, p.sz ?? 1));
    return { geo: p.geo, matrice: m, couleur: new THREE.Color(p.couleur ?? 0xffffff) };
  });
  return fusionnerGeos(THREE, items, true);
}

// ---------- sol carrelé clair (texture générée) ----------
export function textureCarrelage(THREE, { joint = '#d9d8d2', n = 4, px = 512 } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = px; const g = c.getContext('2d');
  const pas = px / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const v = 226 + ((i * 7 + j * 13) % 5) - 2; // légères nuances d'un carreau à l'autre
    g.fillStyle = `rgb(${v},${v - 1},${v - 5})`; g.fillRect(i * pas, j * pas, pas, pas);
  }
  g.strokeStyle = joint; g.lineWidth = 3;
  for (let k = 0; k <= n; k++) { g.beginPath(); g.moveTo(k * pas, 0); g.lineTo(k * pas, px); g.stroke(); g.beginPath(); g.moveTo(0, k * pas); g.lineTo(px, k * pas); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
