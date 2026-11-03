// Petit générateur de PDF (PDF 1.4), sans librairie : polices standard Helvetica et Helvetica-Bold
// (encodage WinAnsi : accents français, €, ’, –, œ), rectangles, traits, cercles et images JPEG (DCTDecode).
// Coordonnées en points depuis le HAUT de la page (A4 : 595 × 842), le générateur retourne l'axe.
//
//   const d = creerPdf({ titre, auteur });
//   d.page();                                      // nouvelle page A4
//   d.texte(x, y, 'Texte', { taille, gras, couleur: '#0f172a', align: 'gauche'|'droite'|'centre' });
//   y = d.paragraphe(x, y, largeur, 'Long texte…', { taille, gras, couleur, interligne });  // y après le bloc
//   d.rect(x, y, l, h, '#eef2ff') · d.trait(x1, y1, x2, y2, '#cbd5e1', 0.8) · d.cercle(cx, cy, r, '#2563eb')
//   d.image(octetsJpeg, x, y, l, h, { rond: true })  // Uint8Array d'un JPEG (bande ronde possible)
//   d.largeur('Texte', taille, gras) · d.octets() -> Uint8Array · d.blob() -> Blob application/pdf

const L_HELV = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,761,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500];
const L_HELV_B = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,761,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556];
// Unicode -> WinAnsi (cp1252) pour les caractères hors Latin-1
const CP1252 = { 0x20ac: 0x80, 0x201a: 0x82, 0x192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x2c6: 0x88, 0x2030: 0x89, 0x160: 0x8a, 0x2039: 0x8b, 0x152: 0x8c, 0x17d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x2dc: 0x98, 0x2122: 0x99, 0x161: 0x9a, 0x203a: 0x9b, 0x153: 0x9c, 0x17e: 0x9e, 0x178: 0x9f };
const REMPLACE = { 0x202f: 0x20, 0x2009: 0x20, 0x2007: 0x20, 0x2011: 0x2d, 0x2010: 0x2d, 0x2212: 0x2d, 0x2032: 0x27, 0x2715: 0x78 };
export function versWinAnsi(s) {
  const o = [];
  for (const ch of String(s).normalize('NFC')) {
    const c = ch.codePointAt(0);
    if (c === 0xa0) o.push(0x20);
    else if ((c >= 0x20 && c < 0x7f) || (c >= 0xa1 && c <= 0xff)) o.push(c);
    else if (CP1252[c]) o.push(CP1252[c]);
    else if (REMPLACE[c]) o.push(REMPLACE[c]);
    else if (c === 0x0a || c === 0x09) o.push(0x20);
    else { const base = ch.normalize('NFD')[0].codePointAt(0); o.push(base < 0x7f && base >= 0x20 ? base : 0x3f); }
  }
  return o;
}
const hex2 = (n) => n.toString(16).padStart(2, '0');
const num = (n) => (Math.round(n * 100) / 100).toString();
function rgb(c) { const h = c.replace('#', ''); const v = h.length === 3 ? h.split('').map((x) => x + x).join('') : h; return [0, 2, 4].map((i) => num(parseInt(v.slice(i, i + 2), 16) / 255)).join(' '); }

// taille et nombre de composantes d'un JPEG (lecture des marqueurs SOF)
export function infosJpeg(o) {
  if (o[0] !== 0xff || o[1] !== 0xd8) throw new Error('Pas un JPEG');
  let i = 2;
  while (i < o.length) {
    if (o[i] !== 0xff) { i++; continue; }
    const m = o[i + 1], len = (o[i + 2] << 8) | o[i + 3];
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: (o[i + 5] << 8) | o[i + 6], l: (o[i + 7] << 8) | o[i + 8], comp: o[i + 9] };
    i += 2 + len;
  }
  throw new Error('JPEG sans dimensions');
}

export function creerPdf({ titre = 'Document', auteur = '' } = {}) {
  const LARG = 595.28, HAUT = 841.89;
  const pages = [], images = [];
  let flux = null;
  const y_ = (y) => num(HAUT - y);
  const largeur = (s, taille = 10, gras = false) => { const t = gras ? L_HELV_B : L_HELV; return versWinAnsi(s).reduce((n, c) => n + (t[c - 32] || 556), 0) * taille / 1000; };
  const d = {
    LARG, HAUT, largeur,
    page() { flux = []; pages.push(flux); return d; },
    texte(x, y, s, { taille = 10, gras = false, couleur = '#0f172a', align = 'gauche' } = {}) {
      const w = largeur(s, taille, gras), x0 = align === 'droite' ? x - w : align === 'centre' ? x - w / 2 : x;
      flux.push(`BT /${gras ? 'F2' : 'F1'} ${num(taille)} Tf ${rgb(couleur)} rg ${num(x0)} ${y_(y)} Td <${versWinAnsi(s).map(hex2).join('')}> Tj ET`);
      return w;
    },
    // coupe le texte en lignes qui tiennent dans la largeur ; y = ligne de base de la première ligne
    lignes(s, l, taille = 10, gras = false) {
      const out = [];
      for (const para of String(s).split('\n')) {
        let cur = '';
        for (const mot of para.split(/\s+/).filter(Boolean)) {
          const essai = cur ? cur + ' ' + mot : mot;
          if (largeur(essai, taille, gras) <= l || !cur) cur = essai; else { out.push(cur); cur = mot; }
        }
        out.push(cur);
      }
      return out;
    },
    paragraphe(x, y, l, s, { taille = 10, gras = false, couleur = '#0f172a', interligne = 1.38 } = {}) {
      for (const ligne of d.lignes(s, l, taille, gras)) { if (ligne) d.texte(x, y, ligne, { taille, gras, couleur }); y += taille * interligne; }
      return y;
    },
    rect(x, y, l, h, couleur) { flux.push(`${rgb(couleur)} rg ${num(x)} ${num(HAUT - y - h)} ${num(l)} ${num(h)} re f`); return d; },
    trait(x1, y1, x2, y2, couleur = '#cbd5e1', ep = 0.8) { flux.push(`${rgb(couleur)} RG ${num(ep)} w ${num(x1)} ${y_(y1)} m ${num(x2)} ${y_(y2)} l S`); return d; },
    cercle(cx, cy, r, couleur) { flux.push(`${rgb(couleur)} rg ${chemCercle(cx, HAUT - cy, r)} f`); return d; },
    image(o, x, y, l, h, { rond = false } = {}) {
      const inf = infosJpeg(o), n = images.length; images.push({ o, ...inf });
      // recadrage « cover » : l'image remplit le cadre en gardant ses proportions
      const k = Math.max(l / inf.l, h / inf.h), il = inf.l * k, ih = inf.h * k, ix = x + (l - il) / 2, iy = HAUT - y - h + (h - ih) / 2;
      const clip = rond ? `${chemCercle(x + l / 2, HAUT - y - h / 2, Math.min(l, h) / 2)} W n` : `${num(x)} ${num(HAUT - y - h)} ${num(l)} ${num(h)} re W n`;
      flux.push(`q ${clip} ${num(il)} 0 0 ${num(ih)} ${num(ix)} ${num(iy)} cm /Im${n} Do Q`);
      return d;
    },
    octets() {
      const ch = [], offs = [];
      let pos = 0;
      const ecrire = (x) => { const b = typeof x === 'string' ? Uint8Array.from(x, (c) => c.charCodeAt(0) & 255) : x; ch.push(b); pos += b.length; };
      const objets = []; // [contenu (string | [string, Uint8Array, string])]
      const ajouter = (c) => { objets.push(c); return objets.length; };
      const catalogue = ajouter(null), arbre = ajouter(null);
      const f1 = ajouter('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
      const f2 = ajouter('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
      const ims = images.map((im) => ajouter([`<< /Type /XObject /Subtype /Image /Width ${im.l} /Height ${im.h} /ColorSpace /${im.comp === 1 ? 'DeviceGray' : im.comp === 4 ? 'DeviceCMYK' : 'DeviceRGB'} /BitsPerComponent 8${im.comp === 4 ? ' /Decode [1 0 1 0 1 0 1 0]' : ''} /Filter /DCTDecode /Length ${im.o.length} >>\nstream\n`, im.o, '\nendstream']));
      const xo = images.length ? ` /XObject << ${ims.map((id, i) => `/Im${i} ${id} 0 R`).join(' ')} >>` : '';
      const ress = ajouter(`<< /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >>${xo} /ProcSet [/PDF /Text /ImageC /ImageB] >>`);
      const kids = pages.map((p) => { const c = p.join('\n'); const cid = ajouter(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`); return ajouter(`<< /Type /Page /Parent ${arbre} 0 R /MediaBox [0 0 ${num(LARG)} ${num(HAUT)}] /Resources ${ress} 0 R /Contents ${cid} 0 R >>`); });
      objets[catalogue - 1] = `<< /Type /Catalog /Pages ${arbre} 0 R >>`;
      objets[arbre - 1] = `<< /Type /Pages /Kids [${kids.map((k) => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
      const infoTxt = (s) => '<FEFF' + [...String(s)].map((c) => { const u = c.codePointAt(0); return u > 0xffff ? '003F' : u.toString(16).padStart(4, '0'); }).join('') + '>';
      const info = ajouter(`<< /Title ${infoTxt(titre)} /Author ${infoTxt(auteur)} /Producer (CRM visuel 3D, generateur de demonstration) >>`);
      ecrire('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
      objets.forEach((c, i) => { offs.push(pos); ecrire(`${i + 1} 0 obj\n`); if (Array.isArray(c)) c.forEach(ecrire); else ecrire(c); ecrire('\nendobj\n'); });
      const xref = pos;
      ecrire(`xref\n0 ${objets.length + 1}\n0000000000 65535 f \n${offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`);
      ecrire(`trailer\n<< /Size ${objets.length + 1} /Root ${catalogue} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
      const out = new Uint8Array(pos); let k = 0; for (const b of ch) { out.set(b, k); k += b.length; }
      return out;
    },
    blob() { return new Blob([d.octets()], { type: 'application/pdf' }); },
  };
  return d;
}
// cercle en 4 courbes de Bézier (coordonnées PDF)
function chemCercle(cx, cy, r) {
  const k = 0.5523 * r;
  return `${num(cx + r)} ${num(cy)} m ${num(cx + r)} ${num(cy + k)} ${num(cx + k)} ${num(cy + r)} ${num(cx)} ${num(cy + r)} c ${num(cx - k)} ${num(cy + r)} ${num(cx - r)} ${num(cy + k)} ${num(cx - r)} ${num(cy)} c ${num(cx - r)} ${num(cy - k)} ${num(cx - k)} ${num(cy - r)} ${num(cx)} ${num(cy - r)} c ${num(cx + k)} ${num(cy - r)} ${num(cx + r)} ${num(cy - k)} ${num(cx + r)} ${num(cy)} c`;
}
