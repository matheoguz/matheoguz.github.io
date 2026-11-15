// Le Bestiaire — style 2 : décors de maison (pavillon au bord de la forêt). s2_maison, s2_chambre, s2_escalier, s2_cuisine, s2_porte.
(function (G) {
  const W = 1080, H = 1920, TAU = Math.PI * 2, LIGNE = '#141526';
  const ell = (c, x, y, rx, ry, r = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, r, 0, TAU); };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const vg = (c, y0, y1, cols) => { const g = c.createLinearGradient(0, y0, 0, y1); cols.forEach((k, i) => g.addColorStop(i / (cols.length - 1), k)); return g; };
  const rg = (c, x, y, r0, r1, cols) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); cols.forEach((k, i) => g.addColorStop(i / (cols.length - 1), k)); return g; };
  const rnd = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const P = (c, pts) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };
  const remplir = (c, col, lw = 7) => { c.fillStyle = col; c.fill(); c.strokeStyle = LIGNE; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); };
  const lumiere = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, x, y, 5, r, [`rgba(${col},${a})`, `rgba(${col},0)`]); c.fillRect(0, 0, W, H); c.restore(); };
  const sapin = (c, x, y, h, col) => { c.beginPath(); c.moveTo(x, y - h); for (let i = 1; i <= 4; i++) { const k = i / 4; c.lineTo(x - h * .27 * k, y - h + h * k * .92); c.lineTo(x - h * .16 * k, y - h + h * k * .92); } c.lineTo(x - h * .3, y); c.lineTo(x + h * .3, y); for (let i = 4; i >= 1; i--) { const k = i / 4; c.lineTo(x + h * .16 * k, y - h + h * k * .92); c.lineTo(x + h * .27 * k, y - h + h * k * .92); } c.closePath(); c.fillStyle = col; c.fill(); };
  const skin = () => G.BESTIAIRE_ART.skinwalker_v2.dessin;
  const fenetreNuit = (c, x, y, w, h, t, ombre) => { rr(c, x, y, w, h, 8); remplir(c, '#101634'); c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    const r = rnd(5); for (let i = 0; i < 6; i++) sapin(c, x + r() * w, y + h + 20, 140 + r() * 120, '#070a1c');
    c.fillStyle = '#fff4d6'; ell(c, x + w * .75, y + h * .25, 16, 16); c.fill();
    if (ombre) { c.globalAlpha = ombre; c.save(); c.translate(x + w * .45, y + h + 340); c.scale(.42, .42); skin()(c, t, {}); c.restore(); c.globalAlpha = 1; c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x, y, w, h); }
    c.restore(); c.strokeStyle = LIGNE; c.lineWidth = 10; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke(); };

  // ---------- la maison au bord de la forêt ----------
  function maison(c, t, p) {
    const aube = p.aube;
    c.fillStyle = aube ? vg(c, 0, 1100, ['#3a3a78', '#b0708a', '#f2b080']) : vg(c, 0, 1100, ['#05060f', '#0f1230', '#1d2050']); c.fillRect(0, 0, W, H);
    if (!aube) { const r = rnd(2); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(255,255,255,${.3 + r() * .6})`; c.fillRect(r() * W, r() * 700, 2, 2); } c.save(); c.shadowColor = '#fff6d8'; c.shadowBlur = 40; c.fillStyle = '#fff4d6'; ell(c, 860, 300, 46, 46); c.fill(); c.restore(); }
    const r = rnd(8); for (let L = 0; L < 3; L++) for (let i = 0; i < 12; i++) sapin(c, r() * W, 1060 + L * 40, 260 + L * 90 + r() * 120, aube ? ['#4a4a7a', '#3a3a68', '#2c2c58'][L] : ['#0f1128', '#0b0d20', '#080918'][L]);
    if (p.guetteur) { const g = p.guetteur, a = Math.max(0, Math.min(1, (t - (g.apparait || 0)) / .8)); if (a) { c.save(); c.globalAlpha = a; c.translate(g.x, g.y); c.scale(g.echelle, g.echelle); skin()(c, t, {}); c.restore();
      c.save(); c.globalAlpha = a * .5; c.fillStyle = '#05061a'; c.fillRect(g.x - 260 * g.echelle, g.y - 1250 * g.echelle, 520 * g.echelle, 1260 * g.echelle); c.restore();
      c.save(); c.globalAlpha = a; c.shadowColor = '#8dff70'; c.shadowBlur = 14; c.fillStyle = '#c4ff9e'; ell(c, g.x - 24 * g.echelle, g.y - 906 * g.echelle, 5, 5); c.fill(); ell(c, g.x + 26 * g.echelle, g.y - 918 * g.echelle, 5, 5); c.fill(); c.restore(); } }
    c.fillStyle = aube ? '#3a4a5a' : '#10142a'; c.fillRect(0, 1180, W, H - 1180);
    c.save(); c.translate(540, 1560);
    P(c, [[-360, 0], [360, 0], [360, -420], [-360, -420]]); remplir(c, aube ? '#d8c8b0' : '#3a3a58');
    P(c, [[-410, -410], [0, -680], [410, -410]]); remplir(c, aube ? '#7a4a40' : '#24223a');
    const lum = !aube;
    [[-270, -340], [130, -340]].forEach(([x, y], i) => { rr(c, x, y, 140, 120, 6); remplir(c, lum && (i === 0 || p.etage) ? '#ffcf73' : '#141838'); c.strokeStyle = LIGNE; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 70, y); c.lineTo(x + 70, y + 120); c.stroke(); });
    [[-270, -180], [130, -180]].forEach(([x, y]) => { rr(c, x, y, 140, 120, 6); remplir(c, lum && p.rdc ? '#ffcf73' : '#141838'); });
    rr(c, -60, -200, 120, 200, 6); remplir(c, aube ? '#5a3a2a' : '#1a1428');
    c.restore();
    if (!aube) { lumiere(c, 340, 1280, 220, '255,200,110', .35); if (p.rdc) lumiere(c, 540, 1440, 320, '255,200,110', .3); }
    if (p.voiture) { const x = 120 - (t * 120); c.save(); c.translate(x, 1820); rr(c, -140, -90, 280, 70, 30); remplir(c, '#5a6a8a'); rr(c, -90, -140, 170, 60, 20); remplir(c, '#4a5a7a'); ell(c, -80, -16, 32, 32); remplir(c, '#1a1a22'); ell(c, 80, -16, 32, 32); remplir(c, '#1a1a22'); c.restore(); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, x - 150, 1770, 5, 260, ['rgba(255,60,40,.5)', 'rgba(255,60,40,0)']); c.fillRect(0, 1400, W, 520); c.restore(); }
  }

  // ---------- la chambre de Noé ----------
  function chambre(c, t, p) {
    c.fillStyle = '#2a2f5a'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#2e3462' : '#283058'; c.fillRect(i * 80, 0, 80, 1300); }
    c.fillStyle = '#3a2e44'; c.fillRect(0, 1300, W, H - 1300); c.strokeStyle = '#2a2034'; c.lineWidth = 4; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(0, 1340 + i * 60); c.lineTo(W, 1340 + i * 60); c.stroke(); }
    fenetreNuit(c, 600, 380, 340, 420, t, p.ombreFenetre);
    rr(c, 600, 800, 340, 20, 4); remplir(c, '#e8e0d0', 5);
    rr(c, 90, 360, 160, 220, 6); remplir(c, '#e0a93a', 6); c.fillStyle = LIGNE; c.font = '900 40px Inter'; c.textAlign = 'center'; c.fillText('★', 170, 490);
    rr(c, 80, 760, 120, 520, 10); remplir(c, '#5a4a6a'); ell(c, 180, 1020, 8, 8); remplir(c, '#c9a050', 4);
    rr(c, 820, 1020, 160, 120, 10); remplir(c, '#6a5a4a'); c.fillStyle = '#ffd27a'; P(c, [[860, 1020], [940, 1020], [960, 960], [840, 960]]); c.fill();
    if (p.lampe !== false) lumiere(c, 900, 990, 520, '255,200,120', .4);
    if (p.commode) { rr(c, 60, 1080, 300, 300, 10); remplir(c, '#7a5a3a'); [1130, 1210, 1290].forEach(y => { rr(c, 80, y, 260, 64, 6); remplir(c, '#8a6a4a', 5); }); }
    if (p.filet) { c.fillStyle = 'rgba(255,220,160,.7)'; c.fillRect(80, 1276, 120, 8); if (p.pieds) { c.fillStyle = '#000'; c.fillRect(105, 1276, 24, 8); c.fillRect(150, 1276, 24, 8); } }
  }
  function chambreAvant(c, t, p) {
    rr(c, 300, 1360, 560, 140, 20); remplir(c, '#4a3a5a'); rr(c, 300, 1210, 60, 300, 14); remplir(c, '#4a3a5a');
    c.beginPath(); c.moveTo(330, 1350); c.quadraticCurveTo(580, 1290, 850, 1360); c.lineTo(860, 1460); c.lineTo(320, 1460); c.closePath(); remplir(c, '#5a8ac0');
    c.fillStyle = '#7aa4d4'; for (let i = 0; i < 5; i++) { ell(c, 400 + i * 100, 1400, 14, 14); c.fill(); }
    if (p.nuit) { c.fillStyle = 'rgba(4,6,20,.45)'; c.fillRect(0, 0, W, H); }
  }

  // ---------- l'escalier qui descend dans le noir ----------
  function escalier(c, t, p) {
    c.fillStyle = '#1a1d3a'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#20244a'; P(c, [[0, 0], [300, 300], [300, 1100], [0, 1500]]); c.fill(); P(c, [[W, 0], [780, 300], [780, 1100], [W, 1500]]); c.fill();
    c.fillStyle = '#0a0b18'; c.fillRect(300, 300, 480, 800);
    if (p.cuisineLum) { c.fillStyle = '#ffd890'; P(c, [[560, 820], [740, 820], [740, 1100], [560, 1100]]); c.fill(); lumiere(c, 650, 980, 520, '255,210,140', .35); }
    for (let i = 0; i < 12; i++) { const k = i / 12, y0 = 1100 + k * k * 820, y1 = 1100 + ((i + 1) / 12) ** 2 * 820, w0 = 480 + k * 600, w1 = 480 + (i + 1) / 12 * 600;
      P(c, [[540 - w0 / 2, y0], [540 + w0 / 2, y0], [540 + w1 / 2, y1], [540 - w1 / 2, y1]]); c.fillStyle = i % 2 ? '#3a2e2a' : '#4a3a32'; c.fill(); c.strokeStyle = LIGNE; c.lineWidth = 4; c.stroke(); }
    c.strokeStyle = '#5a4a3a'; c.lineWidth = 14; c.beginPath(); c.moveTo(300, 1100); c.lineTo(-60, 1900); c.stroke();
    if (p.ombreBas) { c.fillStyle = 'rgba(0,0,0,.9)'; c.save(); c.translate(650, 1100); c.scale(.28, .28); skin()(c, t, {}); c.restore(); }
  }

  // ---------- la cuisine : le frigo ouvert ----------
  function cuisine(c, t, p) {
    c.fillStyle = '#1a2030'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#222a3e'; c.fillRect(0, 0, W, 1200);
    for (let i = 0; i < 6; i++) { rr(c, 40 + i * 170, 300, 150, 260, 6); remplir(c, '#2e3650', 5); }
    rr(c, 0, 1000, W, 60, 0); remplir(c, '#4a5068', 6); for (let i = 0; i < 6; i++) { rr(c, 40 + i * 170, 1060, 150, 300, 6); remplir(c, '#2e3650', 5); }
    c.fillStyle = '#2a2a38'; c.fillRect(0, 1360, W, H - 1360); c.strokeStyle = '#20202c'; c.lineWidth = 4; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(i * 100, 1360); c.lineTo(i * 140 - 300, H); c.stroke(); }
    rr(c, 640, 380, 300, 980, 12); remplir(c, '#c9cdd6');
    if (p.frigo !== false) { rr(c, 660, 400, 260, 940, 8); remplir(c, '#e8f2ff', 5); lumiere(c, 790, 860, 900, '200,225,255', .55); c.fillStyle = '#9ab'; [600, 800, 1000].forEach(y => c.fillRect(670, y, 240, 8)); }
    [[200, 1420, '#c0392b'], [300, 1450, '#e0a93a'], [420, 1410, '#4a7a5a']].forEach(([x, y, col]) => { ell(c, x, y, 50, 30); remplir(c, col, 5); });
    rr(c, 130, 1380, 160, 120, 10); remplir(c, '#d8c8a0', 5);
    c.fillStyle = 'rgba(5,8,20,.35)'; c.fillRect(0, 0, W, H);
    if (p.transfo) { const T = p.transfo, k = Math.max(0, Math.min(1, (t - T.t0) / T.dur)); G.S2_TRANSFO(c, t, T.inverse ? 1 - k : k, (G.EP_COURANT || {persos:{}}).persos[T.id], T); }
  }

  // ---------- la porte de la chambre, de l'intérieur ----------
  function porte(c, t, p) {
    c.fillStyle = '#262b52'; c.fillRect(0, 0, W, H);
    rr(c, 260, 220, 560, 1340, 10); remplir(c, '#5a4a6a'); [[320, 280, 440, 520], [320, 880, 440, 600]].forEach(([x, y, w, h]) => { rr(c, x, y, w, h, 8); remplir(c, '#6a5a7a', 5); });
    ell(c, 760, 920, 22, 22); remplir(c, '#c9a050', 5);
    c.fillStyle = 'rgba(255,220,160,.85)'; c.fillRect(260, 1556, 560, 12);
    if (p.pieds) { const a = Math.max(0, Math.min(1, (t - .3) / .8)); c.fillStyle = `rgba(0,0,0,${a})`; c.fillRect(420, 1556, 50, 12); c.fillRect(580, 1556, 50, 12); }
    if (p.commode) { rr(c, 200, 1300, 680, 420, 12); remplir(c, '#7a5a3a'); [1360, 1480, 1600].forEach(y => { rr(c, 230, y, 620, 100, 8); remplir(c, '#8a6a4a', 5); }); }
    c.fillStyle = '#3a2e44'; c.fillRect(0, 1720, W, H - 1720);
    if (p.coups) { const k = (t * 2.2) % 1; if (k < .12) { c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(0, 0, W, H); } }
    c.fillStyle = 'rgba(4,6,20,.4)'; c.fillRect(0, 0, W, H);
  }

  Object.assign(G.DECORS = G.DECORS || {}, {
    s2_maison: { fond: maison }, s2_chambre: { fond: chambre, avant: chambreAvant }, s2_escalier: { fond: escalier }, s2_cuisine: { fond: cuisine }, s2_porte: { fond: porte },
  });
})(window);
