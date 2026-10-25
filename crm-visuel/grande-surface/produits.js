// Emballages des produits de la démo « Hyper Modèle » : une seule texture (atlas) dessinée au chargement,
// avec une case par produit et par couleur (boîte, paquet, bouteille, flacon, conserve, pack sous film).
// Module ES sans import. Rien n'est téléchargé : tout est dessiné dans un canvas.
//
//   const A = atlasProduits(THREE)
//   A.texture                      // CanvasTexture partagée par tous les rayons
//   A.case(nom, hex, forme, v)     // -> [u0, v0, du, dv] (coin bas gauche et taille, en coordonnées de texture)
//   A.blanc                        // case blanche unie (étiquettes, bandeaux : la couleur vient de l'instance)
//   A.materiau(base)               // matière qui lit la case de chaque instance (attribut aAtlas)

const W = 2048, H = 1024, C = 64, NX = W / C, NY = H / C, M = 2; // cases de 64 px, marge de 2 px

function graine(txt) { let h = 2166136261; for (const c of txt) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function alea(s) { return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
function rgb(n) { return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mel(n, m, k) { const a = rgb(n), b = rgb(m); return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * k)).join(',')})`; }
const clair = (n) => (rgb(n).reduce((s, x) => s + x, 0) / 3 > 170);
const MARQUES = ['BIO', 'MAX', 'LUX', 'FIN', 'TOP', 'NOV', 'VIA', 'ORA', 'SOL', 'ECO', 'ALP', 'DUO', 'KIO', 'ZEN', 'PUR', 'NEO'];
const VIFS = [0xdc2626, 0x1d4ed8, 0x16a34a, 0xf59e0b, 0x7c3aed, 0x0891b2, 0xea580c, 0xdb2777, 0x111827, 0xfacc15];

export function atlasProduits(THREE) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
  const cases = new Map(); let n = 1; // case 0 : blanche
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
  const uvDe = (k) => { const cx = k % NX, cy = Math.floor(k / NX); return [(cx * C + M) / W, 1 - ((cy + 1) * C - M) / H, (C - 2 * M) / W, (C - 2 * M) / H]; };

  // ---------- dessins ----------
  function boite(x, y, w, h, c, r) { // face avant d'une boîte ou d'un paquet
    const v = Math.floor(r() * 4), acc = VIFS[Math.floor(r() * VIFS.length)], txt = clair(c) ? '#1f2937' : '#ffffff';
    g.fillStyle = hex(c); g.fillRect(x, y, w, h);
    g.fillStyle = mel(c, 0x000000, 0.25); g.fillRect(x, y, w, h * 0.1);                 // dessus plus sombre
    if (v === 0) { // bandeau de marque + fenêtre produit
      g.fillStyle = hex(acc); g.fillRect(x, y + h * 0.12, w, h * 0.2);
      g.fillStyle = mel(c, 0xffffff, 0.5); g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.62, w * 0.32, h * 0.2, 0, 0, 7); g.fill();
      g.fillStyle = mel(acc, 0xffffff, 0.3); g.beginPath(); g.arc(x + w * 0.5, y + h * 0.62, Math.min(w, h) * 0.14, 0, 7); g.fill();
    } else if (v === 1) { // grande vignette ronde
      g.fillStyle = mel(c, 0xffffff, 0.55); g.beginPath(); g.arc(x + w * 0.55, y + h * 0.58, Math.min(w, h) * 0.3, 0, 7); g.fill();
      g.fillStyle = hex(acc); g.beginPath(); g.arc(x + w * 0.55, y + h * 0.58, Math.min(w, h) * 0.17, 0, 7); g.fill();
    } else if (v === 2) { // diagonale
      g.fillStyle = hex(acc); g.beginPath(); g.moveTo(x, y + h * 0.75); g.lineTo(x + w, y + h * 0.45); g.lineTo(x + w, y + h * 0.62); g.lineTo(x, y + h * 0.92); g.fill();
      g.fillStyle = mel(c, 0xffffff, 0.7); g.fillRect(x + w * 0.15, y + h * 0.3, w * 0.7, h * 0.12);
    } else { // étiquette blanche centrale
      g.fillStyle = mel(c, 0xffffff, 0.6); g.fillRect(x + w * 0.12, y + h * 0.3, w * 0.76, h * 0.42);
      g.fillStyle = hex(acc); g.fillRect(x + w * 0.12, y + h * 0.3, w * 0.76, h * 0.1);
      g.fillStyle = mel(c, 0xffffff, 0.2); g.fillRect(x + w * 0.2, y + h * 0.48, w * 0.6, h * 0.05); g.fillRect(x + w * 0.2, y + h * 0.58, w * 0.45, h * 0.05);
    }
    g.fillStyle = v === 0 ? '#ffffff' : txt; g.font = `800 ${Math.round(h * 0.17)}px Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(MARQUES[Math.floor(r() * MARQUES.length)], x + w / 2, y + h * (v === 0 ? 0.22 : 0.2));
    g.fillStyle = mel(c, 0x000000, 0.35); g.fillRect(x, y + h * 0.9, w, h * 0.1);       // bas
    if (r() < 0.35) { g.fillStyle = '#facc15'; g.beginPath(); g.arc(x + w * 0.8, y + h * 0.82, w * 0.09, 0, 7); g.fill(); } // pastille promo
  }
  // bouteille (tour) : v de bas en haut = fond, corps (1/6 à 2/6), épaule, goulot, bouchon
  function bouteille(x, y, w, h, c, r, bandes) {
    const acc = VIFS[Math.floor(r() * VIFS.length)], [b0, b1, b2, b3] = bandes; // limites en part de hauteur (depuis le bas)
    const Y = (f) => y + h * (1 - f);
    g.fillStyle = hex(c); g.fillRect(x, y, w, h);
    g.fillStyle = mel(c, 0x000000, 0.3); g.fillRect(x, Y(b0), w, h * b0);                     // fond
    g.fillStyle = r() < 0.3 ? '#f8fafc' : hex(acc); g.fillRect(x, Y(b1 - 0.01), w, (b1 - b0 - 0.02) * h); // étiquette sur le corps
    g.fillStyle = hex(c); for (let k = 0; k < 4; k++) g.fillRect(x + (k * w) / 4 + 3, Y((b0 + b1) / 2) - 2, w / 8, 4); // logos répétés autour
    g.fillStyle = mel(c, 0xffffff, 0.25); g.fillRect(x, Y(b2), w, (b2 - b1) * h);           // épaule (reflet)
    g.fillStyle = hex(r() < 0.5 ? acc : 0x111827); g.fillRect(x, y, w, (1 - b3) * h + 1);    // bouchon
  }
  function conserve(x, y, w, h, c, r) { // cylindre : tour complet + couvercles (cercle centré)
    const acc = VIFS[Math.floor(r() * VIFS.length)];
    g.fillStyle = '#c9cdd2'; g.fillRect(x, y, w, h);                                           // métal
    g.fillStyle = hex(c); g.fillRect(x, y + h * 0.12, w, h * 0.76);
    g.fillStyle = mel(c, 0xffffff, 0.65); g.fillRect(x, y + h * 0.4, w, h * 0.22);
    g.fillStyle = hex(acc); for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + (k + 0.5) * w / 3, y + h * 0.51, h * 0.08, 0, 7); g.fill(); }
    g.fillStyle = '#dfe3e7'; g.beginPath(); g.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, 0, 7); g.fill(); // couvercle (vu du dessus)
  }
  function film(x, y, w, h, c) { // pack sous film : bouteilles visibles par transparence
    g.fillStyle = hex(c); g.fillRect(x, y, w, h);
    for (let k = 0; k < 3; k++) { const bx = x + (k + 0.5) * w / 3; g.fillStyle = mel(c, 0x60a5fa, 0.35); g.fillRect(bx - w / 9, y + h * 0.2, (2 * w) / 9, h * 0.75); g.fillStyle = mel(c, 0x1e3a8a, 0.3); g.fillRect(bx - w / 22, y + h * 0.08, w / 11, h * 0.12); }
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y, w * 0.18, h);
  }

  function caseDe(nom, couleur, forme, v = 0) {
    const cle = nom + ':' + couleur + ':' + forme + ':' + v;
    if (cases.has(cle)) return cases.get(cle);
    if (n >= NX * NY) return uvDe(0);
    const k = n++, x = (k % NX) * C, y = Math.floor(k / NX) * C, r = alea(graine(cle));
    g.save(); g.beginPath(); g.rect(x, y, C, C); g.clip();
    if (forme === 'bouteille') bouteille(x, y, C, C, couleur, r, [1 / 6, 2 / 6, 3 / 6, 5 / 6]);
    else if (forme === 'flacon') bouteille(x, y, C, C, couleur, r, [0.2, 0.4, 0.6, 0.8]);
    else if (forme === 'cyl') conserve(x, y, C, C, couleur, r);
    else if (forme === 'film') film(x, y, C, C, couleur);
    else boite(x, y, C, C, couleur, r);
    g.restore();
    const uv = uvDe(k); cases.set(cle, uv); tex.needsUpdate = true;
    return uv;
  }

  // la matière lit sa case dans l'atlas grâce à un attribut par instance (aAtlas = u0, v0, du, dv)
  const materiaux = new Map();
  function materiau(base) {
    if (materiaux.has(base)) return materiaux.get(base);
    const m = base.clone(); m.map = tex; m.color.setRGB(1, 1, 1);
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec4 aAtlas;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\n  vMapUv = aAtlas.xy + fract(clamp(vMapUv, 0.0, 0.9999)) * aAtlas.zw;');
    };
    m.customProgramCacheKey = () => 'atlas-produits';
    materiaux.set(base, m); return m;
  }
  return { texture: tex, case: caseDe, blanc: uvDe(0), materiau };
}
