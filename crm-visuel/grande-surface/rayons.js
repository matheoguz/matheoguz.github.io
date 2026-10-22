// Rayons réalistes de la démo « Hyper Modèle » : gondoles double face, étagères, produits rangés en facings,
// têtes de gondole, étiquettes prix, vitrines réfrigérées, étals de fruits et légumes.
// Module sans import : THREE est passé dans ctx. Tout est en InstancedMesh (une forme = un dessin, couleur par instance).
//
//   construireRayon(ctx, r, i) -> { g, z, x0, l, majStock(frac), instances }
//   ctx = { THREE, scene, boite, mat, texte, clic }
//
// majStock(frac) (0,15 à 1) : chaque produit a un rang fixe tiré au départ (graine = id du rayon) ;
// seuls les produits de rang < frac restent visibles, donc les trous sont stables d'un appel à l'autre.

const Y0 = 0.2;                       // dessus du sol du magasin
const XA = -36.1, XB = -7.9;          // corps de la gondole (les têtes occupent -37..-36,1 et -7,9..-7)
const NIV = [0.13, 0.5, 0.86, 1.22, 1.58];          // hauteur des tablettes (au-dessus de Y0)
const PROF = [0.62, 0.56, 0.52, 0.48, 0.44];        // les tablettes du bas sont plus profondes
const HMAX = [0.33, 0.33, 0.33, 0.33, 0.25];        // place sous la tablette du dessus (haut ≤ 2,06)
const HAUT = 1.85;                                  // haut du fond de gondole (≤ 2,1)

// ---------- hasard stable ----------
function graine(txt) { let h = 2166136261; for (const c of txt) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function alea(s) { return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- catalogue (couleurs sobres, emballages courants) ----------
const T = {
  // Épicerie
  cereales: { f: 'boite', w: [0.19, 0.24], h: [0.26, 0.3], c: [0xd97706, 0xb91c1c, 0x1e40af, 0xeab308, 0x7c2d12, 0x65a30d], n: [3, 6] },
  pates: { f: 'boite', w: [0.1, 0.13], h: [0.2, 0.25], c: [0x1d4ed8, 0xfacc15, 0xf5f5f4, 0xdc2626], n: [4, 7] },
  riz: { f: 'boite', w: [0.14, 0.16], h: [0.19, 0.22], c: [0xfbbf24, 0xf5f5f4, 0x0f766e, 0xb45309], n: [3, 6] },
  sucre: { f: 'boite', w: [0.12, 0.14], h: [0.18, 0.21], c: [0xf5f5f4, 0x2563eb, 0xe7e5e4], n: [4, 7] },
  conserves: { f: 'cyl', w: [0.085, 0.09], h: [0.11, 0.12], c: [0x15803d, 0xb91c1c, 0xca8a04, 0x9ca3af, 0x1e3a8a], n: [4, 8], rangs: 2, pile: 2 },
  bocaux: { f: 'cyl', w: [0.085, 0.095], h: [0.13, 0.15], c: [0xb91c1c, 0x854d0e, 0x65a30d, 0xea580c], n: [4, 7], rangs: 2 },
  huile: { f: 'bouteille', w: [0.08, 0.09], h: [0.29, 0.31], c: [0xeab308, 0x84cc16, 0xca8a04], n: [4, 7], rangs: 2, brillant: true },
  biscuits: { f: 'boite', w: [0.2, 0.25], h: [0.06, 0.075], c: [0x92400e, 0x1e3a8a, 0xdc2626, 0xf59e0b, 0x7c2d12], n: [3, 5], pile: 3 },
  cafe: { f: 'boite', w: [0.09, 0.11], h: [0.16, 0.19], c: [0x111827, 0x7c2d12, 0xb91c1c, 0x1f2937, 0xa16207], n: [4, 7] },
  lots: { f: 'pack', w: [0.3, 0.4], h: [0.25, 0.3], c: [0xf5f5f4, 0xfef3c7], b: [0xd97706, 0x1e40af, 0xb91c1c], n: [3, 5] },
  // Boissons
  eau: { f: 'pack', w: [0.3, 0.32], h: [0.29, 0.3], c: [0xe0f2fe, 0xdbeafe, 0xecfeff], b: [0x2563eb, 0x0ea5e9, 0xdc2626, 0x16a34a], n: [4, 7], rangs: 2 },
  soda: { f: 'bouteille', w: [0.09, 0.095], h: [0.3, 0.31], c: [0x3b1d14, 0xf97316, 0x16a34a, 0xeab308, 0xdc2626], n: [4, 8], rangs: 2, brillant: true },
  vin: { f: 'bouteille', w: [0.075, 0.08], h: [0.29, 0.3], c: [0x3f1d1d, 0x14532d, 0x4a044e, 0xfda4af, 0xfef3c7], n: [4, 7], rangs: 2, brillant: true },
  jus: { f: 'boite', w: [0.09, 0.1], h: [0.23, 0.25], c: [0xf97316, 0xfacc15, 0xdc2626, 0x16a34a, 0xfef3c7], n: [4, 7] },
  bieres: { f: 'boite', w: [0.25, 0.27], h: [0.22, 0.24], c: [0xd97706, 0x1e3a8a, 0x14532d, 0xfbbf24, 0x7f1d1d], n: [3, 5] },
  canettes: { f: 'boite', w: [0.26, 0.28], h: [0.12, 0.13], c: [0xdc2626, 0x111827, 0x16a34a, 0x2563eb, 0x9ca3af], n: [3, 5] },
  // Frais et surgelés
  yaourts: { f: 'boite', w: [0.11, 0.13], h: [0.075, 0.085], c: [0xf8fafc, 0xfce7f3, 0xdbeafe, 0xfef9c3], n: [4, 8], pile: 2 },
  lait: { f: 'boite', w: [0.085, 0.09], h: [0.21, 0.23], c: [0xf8fafc, 0x3b82f6, 0x22c55e, 0xf1f5f9], n: [5, 9] },
  fromage: { f: 'boite', w: [0.11, 0.13], h: [0.05, 0.06], c: [0xfde68a, 0xfef3c7, 0xea580c, 0xf8fafc], n: [4, 7], pile: 3 },
  jambon: { f: 'boite', w: [0.15, 0.17], h: [0.03, 0.035], c: [0xfda4af, 0xfecdd3, 0xf8fafc], n: [3, 6], pile: 4 },
  sachets: { f: 'boite', w: [0.18, 0.22], h: [0.22, 0.27], c: [0x1d4ed8, 0x0e7490, 0x16a34a, 0xdc2626, 0xf8fafc], n: [3, 6] },
  pizzas: { f: 'boite', w: [0.29, 0.31], h: [0.04, 0.045], c: [0xb91c1c, 0x1e3a8a, 0xf8fafc, 0x166534], n: [2, 4], pile: 5 },
  glaces: { f: 'cyl', w: [0.13, 0.14], h: [0.11, 0.12], c: [0xfef3c7, 0x7c2d12, 0xfbcfe8, 0xf8fafc], n: [3, 6], rangs: 2, pile: 2 },
  // Hygiène et entretien
  shampooing: { f: 'flacon', w: [0.08, 0.09], h: [0.2, 0.23], c: [0x0ea5e9, 0xf8fafc, 0xec4899, 0x22c55e, 0x1e3a8a, 0xfacc15], n: [4, 7], rangs: 2, plat: 0.55, brillant: true },
  gel: { f: 'flacon', w: [0.075, 0.085], h: [0.22, 0.25], c: [0x06b6d4, 0xf97316, 0xa855f7, 0xf8fafc, 0x16a34a], n: [4, 7], rangs: 2, plat: 0.5, brillant: true },
  lessive: { f: 'flacon', w: [0.15, 0.17], h: [0.27, 0.3], c: [0x2563eb, 0x16a34a, 0xf97316, 0xdc2626], n: [3, 5], rangs: 2, plat: 0.65, brillant: true },
  adoucissant: { f: 'flacon', w: [0.12, 0.13], h: [0.26, 0.29], c: [0xc084fc, 0x93c5fd, 0xfbcfe8, 0xf8fafc], n: [3, 6], rangs: 2, plat: 0.6, brillant: true },
  papier: { f: 'pack', w: [0.38, 0.42], h: [0.28, 0.31], c: [0xf8fafc, 0xf1f5f9], b: [0x0ea5e9, 0xec4899, 0x16a34a], n: [3, 5], rangs: 2 },
  dentifrice: { f: 'boite', w: [0.045, 0.05], h: [0.18, 0.2], c: [0xf8fafc, 0xdc2626, 0x2563eb, 0x0d9488], n: [5, 9] },
  mouchoirs: { f: 'boite', w: [0.23, 0.25], h: [0.09, 0.1], c: [0x93c5fd, 0xf8fafc, 0xfbcfe8, 0x86efac], n: [3, 5], pile: 2 },
  spray: { f: 'bouteille', w: [0.08, 0.085], h: [0.24, 0.26], c: [0xfacc15, 0x22c55e, 0xef4444, 0x38bdf8, 0xf8fafc], n: [4, 7], rangs: 2, brillant: true },
  // Maison et bazar
  cartons: { f: 'boite', w: [0.35, 0.55], h: [0.25, 0.32], c: [0xb08a5a, 0xa47c4f, 0xc4a074], n: [2, 4] },
  electro: { f: 'pack', w: [0.3, 0.45], h: [0.25, 0.32], c: [0xf8fafc, 0xe5e7eb], b: [0xdc2626, 0x1e3a8a, 0x111827, 0x0f766e], n: [2, 4] },
  seaux: { f: 'cyl', w: [0.28, 0.3], h: [0.24, 0.27], c: [0x2563eb, 0xdc2626, 0x16a34a, 0x6b7280, 0xf8fafc], n: [2, 5], rangs: 1 },
  rangement: { f: 'boite', w: [0.38, 0.42], h: [0.19, 0.21], c: [0xe2e8f0, 0xcbd5e1, 0x94a3b8], n: [2, 5] },
  vaisselle: { f: 'boite', w: [0.24, 0.26], h: [0.11, 0.13], c: [0xf8fafc, 0x0f766e, 0x7c2d12, 0x1e3a8a], n: [3, 5], pile: 2 },
  ampoules: { f: 'boite', w: [0.07, 0.075], h: [0.11, 0.12], c: [0xfacc15, 0x1e40af, 0xf8fafc], n: [5, 8], pile: 2 },
  coussins: { f: 'boite', w: [0.38, 0.42], h: [0.13, 0.14], c: [0x64748b, 0x991b1b, 0xd6d3d1, 0x0f766e, 0xa16207], n: [2, 4], pile: 2 },
};

// Ce qu'on range à chaque étage (0 = en bas). Fonction (niveau, position dans la gondole 0..1).
const PLANS = {
  r1: (n) => [['lots', 'huile'], ['conserves', 'bocaux', 'huile'], ['pates', 'riz', 'sucre'], ['cereales', 'cafe'], ['biscuits', 'cafe', 'pates']][n],
  r2: (n) => [['eau'], ['soda'], ['vin', 'jus'], ['bieres', 'jus'], ['canettes']][n],
  r3: (n, u) => (u < 0.5 ? [['lait'], ['lait', 'yaourts'], ['yaourts', 'fromage'], ['fromage', 'jambon'], ['jambon', 'yaourts']] : [['sachets'], ['pizzas', 'sachets'], ['glaces'], ['sachets', 'pizzas'], ['pizzas']])[n],
  r4: (n) => [['papier', 'lessive'], ['lessive', 'adoucissant'], ['shampooing', 'gel'], ['spray', 'gel', 'dentifrice'], ['mouchoirs', 'dentifrice']][n],
  r5: (n) => [['cartons', 'electro', 'seaux'], ['rangement', 'electro'], ['vaisselle', 'coussins'], ['vaisselle', 'ampoules'], ['ampoules', 'coussins']][n],
};
const TETES = { r0: 'DE SAISON', r1: 'PROMO', r2: 'LES LOTS', r3: 'PRIX FRAIS', r4: 'PROMO', r5: 'NOUVEAUTÉS' };
const PROMO = { r1: 'biscuits', r4: 'papier', r5: 'cartons' };
const FRUITS = [ // couleur, rayon, allongement, nombre par cagette (x, z)
  { c: [0xdc2626, 0xb91c1c], r: 0.045, nx: 4, nz: 3 },          // tomates
  { c: [0x65a30d, 0x84cc16], r: 0.045, nx: 4, nz: 3 },          // pommes vertes
  { c: [0xb91c1c, 0x9f1239, 0xca8a04], r: 0.045, nx: 4, nz: 3 },// pommes
  { c: [0xf97316, 0xea580c], r: 0.047, nx: 4, nz: 3 },          // oranges
  { c: [0xfacc15, 0xeab308], r: 0.04, nx: 4, nz: 3 },           // citrons
  { c: [0xfde047, 0xfacc15], r: 0.04, ax: 2.6, nx: 2, nz: 4 },  // bananes
  { c: [0x4c1d95, 0x581c87], r: 0.04, ax: 2.2, nx: 2, nz: 4 },  // aubergines
  { c: [0xea580c, 0xf97316], r: 0.025, ax: 5, nx: 2, nz: 6 },   // carottes
  { c: [0x4d7c0f, 0x65a30d], r: 0.075, nx: 3, nz: 2 },          // salades
  { c: [0xa16207, 0x92400e], r: 0.042, nx: 4, nz: 3 },           // pommes de terre
  { c: [0xd4a373, 0xc08552], r: 0.042, nx: 4, nz: 3 },          // oignons
  { c: [0x365314, 0x3f6212], r: 0.04, ax: 1.3, nx: 4, nz: 3 },  // avocats
  { c: [0x15803d, 0x166534], r: 0.035, ax: 3.2, nx: 2, nz: 5 }, // courgettes
  { c: [0x6d28d9, 0x4c1d95, 0x84cc16], r: 0.045, ax: 1.4, nx: 3, nz: 3 }, // raisin (grappes)
];

// ---------- géométries et matières partagées ----------
let PART = null;
function partage(THREE) {
  if (PART && PART.THREE === THREE) return PART;
  const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 10).translate(0, 0.5, 0);
  const tour = (pts) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 7);
  const bouteille = tour([[0, 0], [0.5, 0], [0.5, 0.58], [0.4, 0.72], [0.18, 0.84], [0.17, 1], [0, 1]]);
  const flacon = tour([[0, 0], [0.5, 0], [0.5, 0.78], [0.3, 0.87], [0.22, 1], [0, 1]]);
  const boule = new THREE.IcosahedronGeometry(0.5, 0);
  const S = (o) => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62, metalness: 0, ...o });
  // fond de gondole perforé
  const c = document.createElement('canvas'); c.width = c.height = 32; const k = c.getContext('2d');
  k.fillStyle = '#eef0f1'; k.fillRect(0, 0, 32, 32); k.fillStyle = '#b9bec4';
  for (const [x, y] of [[8, 8], [24, 8], [8, 24], [24, 24]]) { k.beginPath(); k.arc(x, y, 2.2, 0, 7); k.fill(); }
  // réglette porte-étiquettes : étiquettes prix jaunes (quelques promos orange), motif de 1,6 m répété
  const c2 = document.createElement('canvas'); c2.width = 512; c2.height = 16; const k2 = c2.getContext('2d');
  k2.fillStyle = '#c7ccd3'; k2.fillRect(0, 0, 512, 16);
  for (const [x, w, o] of [[6, 16, 0], [58, 16, 0], [97, 16, 1], [150, 16, 0], [214, 16, 0], [262, 16, 0], [301, 16, 0], [355, 16, 1], [410, 16, 0], [462, 16, 0]]) { k2.fillStyle = o ? '#f97316' : '#fde047'; k2.fillRect(x, 2, w, 12); }
  const reglette = new THREE.CanvasTexture(c2); reglette.wrapS = THREE.RepeatWrapping; reglette.colorSpace = THREE.SRGBColorSpace; reglette.anisotropy = 4;
  const perfo = new THREE.CanvasTexture(c); perfo.wrapS = perfo.wrapT = THREE.RepeatWrapping; perfo.colorSpace = THREE.SRGBColorSpace; perfo.anisotropy = 4;
  PART = {
    THREE, box, cyl, bouteille, flacon, boule, perfo, reglette,
    struct: S({ roughness: 0.55, metalness: 0.15 }), prod: S({}), brillant: S({ roughness: 0.3 }), fruit: S({ roughness: 0.5 }), bois: S({ roughness: 0.85 }),
    froid: S({ emissive: 0x9cc8ee, emissiveIntensity: 0.12 }), // produits sous la lumière froide des vitrines
    verre: new THREE.MeshStandardMaterial({ color: 0xcfe6f7, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1, depthWrite: false }),
    led: new THREE.MeshBasicMaterial({ color: 0xe8f4ff }),
    invisible: new THREE.MeshBasicMaterial({ visible: false }),
  };
  return PART;
}

// ---------- le rayon ----------
export function construireRayon(ctx, r, i) {
  const { THREE, scene, boite, mat, texte, clic } = ctx;
  const P = partage(THREE);
  const z = -26 + i * 4.2, x0 = -37, l = 30;
  const g = new THREE.Group(); g.name = 'rayon-' + r.id; scene.add(g);
  const rnd = alea(graine('rayon-' + r.id));
  const entre = ([a, b]) => a + (b - a) * rnd();
  const choix = (t) => t[Math.floor(rnd() * t.length)];
  const teinte = (hex, v = 0.05) => new THREE.Color(hex).offsetHSL(0, -0.12, (rnd() - 0.5) * v); // un peu désaturé : rendu maquette sobre

  // lots d'instances : une géométrie + une matière = un dessin
  const lots = new Map();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pv = new THREE.Vector3(), sv = new THREE.Vector3();
  const lot = (cle, geo, m, ombre) => { if (!lots.has(cle)) lots.set(cle, { geo, m, ombre, items: [] }); return lots.get(cle); };
  const L = {
    struct: () => lot('struct', P.box, P.struct, true),
    bois: () => lot('bois', P.box, P.bois, true),
    led: () => lot('led', P.box, P.led, false),
    verre: () => lot('verre', P.box, P.verre, false),
    etiq: () => lot('etiq', P.box, P.prod, false),
  };
  const formeLot = (t) => (t.f === 'cyl' ? lot('cyl', P.cyl, r.id === 'r3' ? P.froid : P.prod) : t.f === 'bouteille' ? lot('bouteille', P.bouteille, P.brillant) : t.f === 'flacon' ? lot('flacon', P.flacon, P.brillant) : lot('boite', P.box, r.id === 'r3' ? P.froid : P.prod));
  // pose une instance : position du bas, tailles, couleur, rang (-1 = toujours là), rotation éventuelle (x puis y)
  function poser(lt, x, y, zz, sx, sy, sz, couleur, rang = -1, rx = 0, ry = 0) {
    e.set(rx, ry, 0); q.setFromEuler(e); m4.compose(pv.set(x, y, zz), q, sv.set(sx, sy, sz));
    lt.items.push({ m: m4.clone(), c: couleur instanceof THREE.Color ? couleur : new THREE.Color(couleur), r: rang });
  }
  function poserM(lt, base, lx, ly, lz, sx, sy, sz, couleur, rang = -1) { // dans le repère d'un objet incliné (cagette)
    m4.compose(pv.set(lx, ly, lz), q.identity(), sv.set(sx, sy, sz)); m4.premultiply(base);
    lt.items.push({ m: m4.clone(), c: couleur instanceof THREE.Color ? couleur : new THREE.Color(couleur), r: rang });
  }
  const cube = (lt, l_, h, p, x, y, zz, c, rang) => poser(lt, x, y, zz, l_, h, p, c, rang);
  const JAUNE = 0xfde047, ORANGE = 0xf97316;
  const etiquette = (x, y, zz, cote, promo, surX = 0) => (surX ? cube(L.etiq(), 0.004, 0.032, 0.05, x + surX * 0.002, y, zz, promo ? ORANGE : JAUNE) : cube(L.etiq(), 0.05, 0.032, 0.004, x, y, zz + cote * 0.002, promo ? ORANGE : JAUNE));

  // ----- un produit (un facing) posé sur une tablette -----
  function facing(t, x, w, h, y, zf, D, cote, couleur, rang, bande, haut) { // haut : tablette vue du dessus, on remplit en profondeur
    const lt = formeLot(t), boite = t.f === 'boite' || (t.f === 'pack' && !t.rangs), pile = boite ? 1 : t.pile || 1;
    if (boite && t.pile) h *= t.pile; // une pile de boîtes identiques = un seul bloc (moins d'instances)
    for (let p = 0; p < pile; p++) {
      const yy = y + p * h;
      if (boite) {
        poser(lt, x, yy, zf - cote * D / 2, w - 0.006, h - 0.004, D, couleur, rang);
        if (t.f === 'pack') poser(lot('boite', P.box, P.prod), x, yy + h * 0.35, zf - cote * D / 2, w - 0.002, h * 0.28, D + 0.004, bande, rang);
      } else if (t.f === 'pack') { // fardeaux : rangées de packs sous film, avec bandeau de marque
        const n = t.rangs, d = Math.min(D / n, 0.3);
        for (let k = 0; k < n; k++) {
          const zc = zf - cote * (k + 0.5) * d;
          poser(lot('boite', P.box, P.prod), x, yy, zc, w - 0.008, h - 0.006, d - 0.01, couleur, rang + k * 0.04);
          poser(lot('boite', P.box, P.prod), x, yy + h * 0.32, zc, w - 0.004, h * 0.3, d - 0.006, bande, rang + k * 0.04);
        }
      } else { // cylindres, bouteilles, flacons : rangées en profondeur depuis l'avant
        const n = haut ? t.rangs || 2 : 1, dia = w * 0.92, pas = dia * (t.plat || 1) + 0.01;
        for (let k = 0; k < n; k++) poser(lt, x, yy, zf - cote * (pas / 2 + k * pas), dia, h - 0.004, dia * (t.plat || 1), couleur, rang + k * 0.03);
      }
    }
  }
  // ----- remplir une tablette entre x1 et x2 -----
  function remplir(x1, x2, y, cote, D, niveau, u) {
    const plan = PLANS[r.id](niveau, u), zf = z + cote * (0.04 + D - 0.015); // front des produits (léger retrait)
    let x = x1 + 0.015;
    for (let essai = 0; essai < 60; essai++) {
      const t = T[choix(plan)], w = entre(t.w), pile = t.pile || 1;
      const h = Math.min(entre(t.h), (HMAX[niveau] - 0.01) / pile);
      const nf = Math.round(entre([t.n[0], t.n[1] + 0.99]) - 0.49);
      if (x + w > x2 - 0.01) break;
      const couleur = teinte(choix(t.c)), bande = t.b ? teinte(choix(t.b)) : null, rang = rnd();
      for (let f = 0; f < nf && x + w <= x2 - 0.01; f++) { facing(t, x + w / 2, w, h, Y0 + NIV[niveau] + 0.025, zf, D - 0.05, cote, couleur, Math.min(0.999, rang + (rnd() - 0.5) * 0.1), bande, niveau === 4); x += w + 0.004; }
      x += 0.012;
    }
  }

  // ----- gondole classique double face (r1, r2, r4, r5) et vitrines réfrigérées (r3) -----
  function gondole(frigo) {
    const S = L.struct(), lc = XB - XA, xc = (XA + XB) / 2, nb = Math.round(lc / 1.33), bw = lc / nb;
    const regMat = new THREE.MeshStandardMaterial({ map: P.reglette.clone(), roughness: 0.6 }); regMat.map.repeat.set(lc / 1.6, 1); regMat.map.needsUpdate = true;
    const prof = frigo ? [0.56, 0.56, 0.56, 0.56, 0.56] : PROF;
    cube(S, lc, 0.12, 2 * (0.04 + prof[0]), xc, Y0, z, 0x4b5563);                 // plinthe
    const fond = new THREE.Mesh(P.box, new THREE.MeshStandardMaterial({ map: P.perfo.clone(), roughness: 0.7 }));
    fond.material.map.repeat.set(lc / 0.2, HAUT / 0.2); fond.material.map.needsUpdate = true;
    fond.scale.set(lc, HAUT - 0.12, 0.05); fond.position.set(xc, Y0 + 0.12, z); fond.castShadow = fond.receiveShadow = true; g.add(fond);
    cube(S, lc + 0.04, 0.04, 0.1, xc, Y0 + HAUT - 0.02, z, 0x9ca3af);             // lisse du haut
    for (let b = 0; b <= nb; b++) cube(S, 0.05, HAUT - 0.12, 0.09, XA + b * bw, Y0 + 0.12, z, 0x8b929b); // montants
    for (const cote of [1, -1]) {
      for (let n = 0; n < 5; n++) {
        const D = prof[n], y = Y0 + NIV[n];
        if (n > 0 || frigo) cube(S, lc, 0.025, D, xc, y, z + cote * (0.04 + D / 2), frigo ? 0xd9dee3 : 0xe5e7eb); // tablette
        cube(lot('reglette', P.box, regMat, false), lc, 0.045, 0.012, xc, y - 0.025, z + cote * (0.04 + D + 0.006), 0xffffff); // porte-étiquettes et prix
        for (let b = 0; b < nb; b++) remplir(XA + b * bw + 0.03, XA + (b + 1) * bw - 0.03, y, cote, D, n, (b + 0.5) / nb);
      }
      if (frigo) { // meuble froid : caisson, bandeau lumineux, portes vitrées à LED
        const zv = z + cote * 0.7, nd = Math.round(lc / 0.7), dw = lc / nd;
        cube(S, lc, 0.02, 0.72, xc, Y0 + 1.88, z + cote * 0.36, 0xf3f4f6);                                   // toit du meuble
        cube(S, lc, 0.18, 0.04, xc, Y0 + 1.72, zv, 0xf3f4f6);                                                // bandeau haut
        cube(L.led(), lc, 0.03, 0.006, xc, Y0 + 1.75, zv + cote * 0.023, 0xe8f4ff);                          // lumière froide
        cube(S, lc, 0.08, 0.06, xc, Y0 + 0.04, zv, 0x374151);                                                // bas de caisse
        cube(L.verre(), lc, 1.6, 0.016, xc, Y0 + 0.12, zv, 0xffffff);                                        // vitrage bleuté
        for (let d = 0; d <= nd; d++) {
          const xd = XA + d * dw;
          cube(S, 0.035, 1.6, 0.03, xd, Y0 + 0.12, zv, 0x4b5563);                                    // montant de porte
          cube(L.led(), 0.012, 1.52, 0.006, xd, Y0 + 0.16, zv + cote * 0.017, 0xdbeafe);             // LED froide
          if (d < nd) cube(S, 0.018, 0.34, 0.03, xd + dw - 0.07, Y0 + 0.75, zv + cote * 0.03, 0xcbd5e1);    // poignée
        }
        for (const s of [XA, XB]) cube(S, 0.04, 1.9, 1.44, s, Y0, z, 0xe5e7eb);                       // joues
      }
    }
  }

  // ----- étals inclinés de fruits et légumes (r0) -----
  function etal() {
    const S = L.struct(), B = L.bois(), lc = XB - XA, xc = (XA + XB) / 2;
    cube(S, lc, 0.1, 1.44, xc, Y0, z, 0x3f3f46);                                     // socle
    cube(S, lc, 1.08, 0.07, xc, Y0 + 0.1, z, 0x52525b);                              // dosseret
    cube(S, lc + 0.04, 0.04, 0.12, xc, Y0 + 1.18, z, 0x3f3f46);
    const nc = Math.floor(lc / 0.6), cw = lc / nc;
    for (let b = 0; b <= nc; b += 4) cube(S, 0.04, 1.08, 0.09, XA + b * cw, Y0 + 0.1, z, 0x3f3f46);
    const gradins = [{ z: 0.545, y: 0.62, p: 0.38, prof: 0.33 }, { z: 0.205, y: 0.94, p: 0.3, prof: 0.27 }];
    for (const cote of [1, -1]) for (const gr of gradins) {
      const a = Math.atan2(0.16, gr.p), zc = z + cote * gr.z;
      poser(S, xc, Y0 + gr.y - 0.06, zc, lc, 0.03, gr.p / Math.cos(a), 0x3f3f46, -1, cote * a);             // plateau incliné
      if (gr.y < 0.8) cube(S, lc, gr.y - 0.24, 0.03, xc, Y0 + 0.1, z + cote * (gr.z + gr.p / 2 - 0.02), 0x52525b); // façade
      let fr = choix(FRUITS), rangF = rnd();
      for (let c = 0; c < nc; c++) {
        if (c % 2 === 0) { fr = choix(FRUITS); rangF = rnd(); }
        const xm = XA + (c + 0.5) * cw, w = cw - 0.04, d = gr.prof, hc = 0.12;
        e.set(cote * a, 0, 0); q.setFromEuler(e);
        const base = new THREE.Matrix4().compose(pv.set(xm, Y0 + gr.y - 0.03, zc), q, sv.set(1, 1, 1));
        const bois = teinte(0xc9a46c, 0.08);
        poserM(B, base, 0, 0, 0, w, 0.015, d, bois);                                  // fond de cagette
        for (const s of [1, -1]) poserM(B, base, 0, 0, s * (d / 2 - 0.008), w, hc, 0.016, bois);   // côtés longs
        for (const s of [1, -1]) poserM(B, base, s * (w / 2 - 0.008), 0, 0, 0.016, hc, d - 0.03, teinte(0xb08a5a, 0.06)); // têtes
        poserM(L.etiq(), base, 0, 0.03, cote * (d / 2 + 0.01), 0.07, 0.045, 0.004, rnd() < 0.15 ? ORANGE : JAUNE); // prix
        const nx = fr.nx, nz = fr.nz, px = (w - 0.03) / nx, pz = (d - 0.03) / nz, ax = fr.ax || 1;
        for (let a1 = 0; a1 < nx; a1++) for (let b1 = 0; b1 < nz; b1++) {
          const rr = fr.r * (0.9 + rnd() * 0.2), col = teinte(choix(fr.c), 0.08);
          const lx = -w / 2 + 0.015 + (a1 + 0.5) * px + (rnd() - 0.5) * 0.01, lz = -d / 2 + 0.015 + (b1 + 0.5) * pz + (rnd() - 0.5) * 0.01;
          const sx = Math.min(rr * 2 * ax, px * 0.95), sz = Math.min(rr * 2, pz * 1.05);
          poserM(lot('fruit', P.boule, P.fruit), base, lx, 0.015 + hc * 0.55, lz, sx, rr * 1.9, sz, col, Math.min(0.999, rangF * 0.6 + rnd() * 0.4));
        }
      }
    }
  }

  // ----- têtes de gondole (deux bouts) -----
  function tete(sens) { // sens -1 = bout ouest (x -37), +1 = bout est (x -7)
    const S = L.struct(), xi = sens < 0 ? XA : XB, xe = sens < 0 ? x0 : x0 + l, xm = (xi + xe) / 2, pr = Math.abs(xe - xi) - 0.06;
    const xf = (k) => xi + sens * k; // k = distance depuis la gondole
    const promo = (y) => { // panneau promo en haut, texte vers l'extérieur
      const tx = new THREE.MeshStandardMaterial({ map: texte(TETES[r.id], { w: 512, h: 112, fond: '#dc2626', couleur: '#ffffff', taille: 62 }), roughness: 0.6 });
      const rouge = mat(0xdc2626), pan = new THREE.Mesh(P.box, sens > 0 ? [tx, rouge, rouge, rouge, rouge, rouge] : [rouge, tx, rouge, rouge, rouge, rouge]);
      pan.scale.set(0.04, 0.26, 1.3); pan.position.set(xf(0.06), y, z); pan.castShadow = true; g.add(pan);
    };
    if (r.id === 'r0') { // grand bac bois (palox) de saison : potirons à l'est, pastèques à l'ouest
      const B = L.bois(), bw = 0.78, bp = 1.3, hb = 0.55, bois = teinte(0xb08a5a, 0.05);
      cube(B, bw, 0.1, bp, xm, Y0, z, 0x8b6b43); cube(B, bw - 0.06, 0.02, bp - 0.06, xm, Y0 + 0.36, z, 0x6b4f2e); // faux fond
      for (const s of [1, -1]) { cube(B, bw, hb, 0.04, xm, Y0 + 0.1, z + s * (bp / 2 - 0.02), bois); cube(B, 0.04, hb, bp, xm + s * (bw / 2 - 0.02), Y0 + 0.1, z, bois); }
      const pot = sens > 0, rb = pot ? 0.13 : 0.12;
      for (let c = 0; c < 3; c++) for (let a = 0; a < 2; a++) for (let b = 0; b < 4; b++) {
        if (c > 0 && (a + b + c) % 2) continue;
        const col = pot ? teinte(c === 2 ? 0xc2410c : 0xea580c, 0.08) : teinte(0x166534, 0.06);
        poser(lot('fruit', P.boule, P.fruit), xm + (a - 0.5) * 0.34 + (c % 2) * 0.06, Y0 + 0.36 + c * 0.15, z + (b - 1.5) * 0.3 + (c % 2) * 0.05, rb * 2.1 * (pot ? 1 : 1.3), rb * (pot ? 1.5 : 1.9), rb * 2.1, col, Math.min(0.999, 0.15 + c * 0.3 + rnd() * 0.25));
      }
      cube(S, 0.03, 1.0, 0.03, xf(0.06), Y0 + 0.6, z + 0.6, 0x6b7280); promo(Y0 + 1.58);
      etiquette(xm + sens * 0.395, Y0 + 0.4, z, 0, true, sens);
      return;
    }
    cube(S, pr + 0.03, 0.12, 1.32, xm, Y0, z, 0x4b5563);                               // socle
    if (r.id === 'r2') { // palette de packs d'eau (mise en avant)
      cube(L.bois(), 0.8, 0.13, 1.2, xm, Y0 + 0.12, z, 0xc8a26b);
      for (let c = 0; c < 4; c++) for (let a = 0; a < 2; a++) for (let b = 0; b < 3; b++) {
        const rang = Math.min(0.999, 0.12 + c * 0.22 + rnd() * 0.2);
        cube(lot('boite', P.box, P.prod), 0.37, 0.28, 0.38, xm + (a - 0.5) * 0.39, Y0 + 0.25 + c * 0.285, z + (b - 1) * 0.39, teinte(0xe0f2fe, 0.03), rang);
        cube(lot('boite', P.box, P.prod), 0.374, 0.08, 0.384, xm + (a - 0.5) * 0.39, Y0 + 0.34 + c * 0.285, z + (b - 1) * 0.39, 0x2563eb, rang);
      }
      cube(S, 0.03, 1.4, 0.03, xf(0.06), Y0 + 0.12, z + 0.62, 0x6b7280); promo(Y0 + 1.58);
      etiquette(xm + sens * 0.4, Y0 + 0.17, z - 0.3, 0, true, sens);
      return;
    }
    if (r.id === 'r3') { // coffre de surgelés à couvercle vitré
      const bw = pr - 0.04, bp = 1.28, hb = 0.82;
      cube(S, bw, 0.38, bp, xm, Y0 + 0.12, z, 0xf3f4f6);
      for (const s of [1, -1]) { cube(S, bw, hb - 0.12, 0.05, xm, Y0 + 0.12, z + s * (bp / 2 - 0.025), 0xf3f4f6); cube(S, 0.05, hb - 0.12, bp, xm + s * (bw / 2 - 0.025), Y0 + 0.12, z, 0xf3f4f6); }
      for (const s of [1, -1]) { cube(S, bw + 0.01, 0.03, 0.05, xm, Y0 + hb - 0.03, z + s * (bp / 2), 0x6b7280); cube(S, 0.05, 0.03, bp, xm + s * (bw / 2), Y0 + hb - 0.03, z, 0x6b7280); }
      cube(L.verre(), bw - 0.04, 0.012, bp - 0.04, xm, Y0 + hb - 0.015, z, 0xffffff);
      cube(L.led(), bw - 0.12, 0.01, 0.02, xm, Y0 + hb - 0.05, z + 0.6, 0xe8f4ff);
      const t = T.glaces;
      for (let a = 0; a < 4; a++) for (let b = 0; b < 8; b++) for (let c = 0; c < 2; c++) poser(lot('cyl', P.cyl, P.froid), xm + (a - 1.5) * 0.16, Y0 + 0.5 + c * 0.12, z + (b - 3.5) * 0.145, 0.14, 0.115, 0.14, teinte(choix(t.c)), Math.min(0.999, c * 0.4 + rnd() * 0.6));
      cube(S, 0.03, 0.8, 0.03, xf(0.06), Y0 + hb, z + 0.6, 0x6b7280); promo(Y0 + 1.58);
      return;
    }
    // tête classique : fond couleur du rayon, 3 tablettes remplies d'un seul produit en promo
    const fondT = new THREE.Mesh(P.box, mat(r.couleur, { roughness: 0.7 })); fondT.scale.set(0.05, HAUT - 0.12, 1.36); fondT.position.set(xi + sens * 0.025, Y0 + 0.12, z); fondT.castShadow = true; g.add(fondT);
    for (const s of [1, -1]) cube(S, pr, HAUT - 0.12, 0.03, xm, Y0 + 0.12, z + s * 0.665, 0x9ca3af);   // joues
    const t = T[PROMO[r.id]], hs = [0.12, 0.6, 1.08], couleur = teinte(choix(t.c)), bande = t.b ? teinte(choix(t.b)) : null;
    for (let n = 0; n < 3; n++) {
      const y = Y0 + hs[n];
      if (n) cube(S, pr, 0.025, 1.3, xm, y, z, 0xe5e7eb);
      cube(S, 0.012, 0.045, 1.3, xe - sens * 0.04, y - 0.025, z, 0xc7ccd3);
      etiquette(xe - sens * 0.032, y - 0.02, z + 0.3, 0, true, sens);
      const w = (t.w[0] + t.w[1]) / 2, h = Math.min((t.h[0] + t.h[1]) / 2, 0.44 / (t.pile || 1)), nz = Math.floor(1.24 / (w + 0.006)), nx = Math.max(1, Math.floor((pr - 0.06) / 0.33)), dx = (pr - 0.06) / nx;
      const pile = Math.max(t.pile || 1, Math.floor(0.44 / h));
      for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) for (let c = 0; c < pile; c++) {
        const yy = y + 0.025 + c * h, xx = xi + sens * (0.08 + (a + 0.5) * dx), zz = z + (b - (nz - 1) / 2) * (w + 0.006), rang = Math.min(0.999, 0.1 + c * 0.25 + rnd() * 0.5);
        cube(lot('boite', P.box, P.prod), dx - 0.01, h - 0.005, w, xx, yy, zz, couleur, rang);
        if (bande) cube(lot('boite', P.box, P.prod), dx - 0.006, h * 0.28, w + 0.004, xx, yy + h * 0.35, zz, bande, rang);
      }
    }
    promo(Y0 + HAUT - 0.27);
  }

  // ----- construction -----
  if (r.id === 'r0') etal(); else gondole(r.id === 'r3');
  tete(-1); tete(1);
  // panneau suspendu du rayon (même rendu qu'avant), lisible des deux côtés
  const hexa = '#' + r.couleur.toString(16).padStart(6, '0');
  const face = new THREE.MeshStandardMaterial({ map: texte(r.nom.toUpperCase(), { fond: hexa, couleur: '#fff', taille: 54 }) });
  const panneau = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.9, 0.08), [mat(r.couleur), mat(r.couleur), mat(r.couleur), mat(r.couleur), face, face]);
  panneau.position.set(x0 + 4, 3.2, z); g.add(panneau);
  const hautSupport = r.id === 'r0' ? 1.22 : r.id === 'r3' ? 1.9 : HAUT;
  boite(0.06, 3.2 - 0.45 - Y0 - hautSupport, 0.06, 0x9ca3af, x0 + 4, Y0 + hautSupport, z, g);

  // InstancedMesh : produits triés par rang pour que majStock n'ait qu'à régler .count
  const stock = []; let instances = 0;
  for (const [cle, lt] of lots) {
    if (!lt.items.length) continue;
    for (const it of lt.items) if (it.r >= 0) it.r = Math.min(0.999, it.r);
    lt.items.sort((a, b) => a.r - b.r);
    const im = new THREE.InstancedMesh(lt.geo, lt.m, lt.items.length);
    lt.items.forEach((it, k) => { im.setMatrixAt(k, it.m); im.setColorAt(k, it.c); });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = lt.ombre; im.receiveShadow = cle !== 'verre' && cle !== 'led';
    if (cle === 'verre') im.renderOrder = 2;
    im.computeBoundingSphere(); im.raycast = () => {}; // le clic passe par la boîte invisible ci-dessous
    im.name = r.id + '-' + cle; g.add(im); instances += lt.items.length;
    const fixes = lt.items.filter((it) => it.r < 0).length, rangs = lt.items.slice(fixes).map((it) => it.r);
    if (rangs.length) stock.push({ im, fixes, rangs });
  }
  boite(l, 2, 1.5, P.invisible, x0 + l / 2, Y0, z, g, false);   // zone de clic
  clic(g, r.id);

  function majStock(frac) {
    const f = Math.max(0, Math.min(1, frac));
    for (const s of stock) { let a = 0, b = s.rangs.length; while (a < b) { const m = (a + b) >> 1; if (s.rangs[m] < f) a = m + 1; else b = m; } s.im.count = s.fixes + a; }
  }
  majStock(1);
  return { g, z, x0, l, majStock, instances };
}
