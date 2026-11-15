// Le Bestiaire — décors (1080x1920). Chaque décor : fond(c, t, p) et éventuellement avant(c, t, p) dessiné par-dessus les personnages.
(function (G) {
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const ell = (c, x, y, rx, ry, r = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, r, 0, TAU); };
  const vg = (c, y0, y1, cols) => { const g = c.createLinearGradient(0, y0, 0, y1); cols.forEach((k, i) => g.addColorStop(i / (cols.length - 1), k)); return g; };
  const rnd = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const nuitVoile = (c, a, col = '8,12,30') => { c.fillStyle = `rgba(${col},${a})`; c.fillRect(0, 0, W, H); };

  // ---------- campagne japonaise en été ----------
  function campagne(c, t, p) {
    const soir = p.soir;
    c.fillStyle = soir ? vg(c, 0, 1000, ['#2b2a4a', '#a35a5a', '#f2a65a']) : vg(c, 0, 1000, ['#3d8fd1', '#8cc6ef', '#e6f2f7']); c.fillRect(0, 0, W, H);
    c.fillStyle = soir ? 'rgba(255,200,160,.5)' : '#ffffff';
    [[260, 420, 1], [760, 330, 1.3]].forEach(([x, y, k]) => { for (let i = 0; i < 6; i++) { ell(c, x + Math.cos(i) * 90 * k + Math.sin(t * .1) * 10, y - i * 40 * k, 120 * k, 90 * k); c.fill(); } });
    [['#6b8f72', 860, 300], ['#4f7a58', 930, 220], ['#3c6646', 990, 160]].forEach(([col, y, a], i) => { c.fillStyle = soir ? `rgb(${60 - i * 10},${50 - i * 8},${70 - i * 10})` : col; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 60) c.lineTo(x, y - Math.abs(Math.sin(x * .004 + i * 2)) * a); c.lineTo(W, 1100); c.lineTo(0, 1100); c.fill(); });
    c.fillStyle = soir ? '#3a3a2a' : '#8fbf5a'; c.fillRect(0, 1060, W, H - 1060);
    for (let r = 0; r < 9; r++) { const y = 1080 + r * r * 11 + r * 30; c.fillStyle = soir ? 'rgba(255,180,120,.25)' : `rgba(160,210,230,${.5 - r * .03})`; c.fillRect(0, y, W, 8 + r * 2); c.fillStyle = soir ? '#2f3a22' : '#5f9a3c'; for (let x = (r % 2) * 20; x < W; x += 34 - r) c.fillRect(x, y - 10 - r, 4 + r * .4, 12 + r * 2); }
    c.fillStyle = soir ? '#5a4a3a' : '#c9b48a'; c.beginPath(); c.moveTo(500, 1060); c.lineTo(580, 1060); c.lineTo(900, H); c.lineTo(180, H); c.fill();
    c.fillStyle = soir ? '#2a2a33' : '#4a5a6e'; [[150, 1040, .7], [900, 1050, .55]].forEach(([x, y, k]) => { c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = soir ? '#3a3036' : '#e8e2d2'; c.fillRect(-140, -120, 280, 120); c.fillStyle = soir ? '#1d1d26' : '#3e4f66'; c.beginPath(); c.moveTo(-190, -110); c.quadraticCurveTo(0, -260, 190, -110); c.fill(); if (soir) { c.fillStyle = '#ffc56a'; c.fillRect(-60, -90, 50, 40); } c.restore(); });
    c.strokeStyle = '#3a3a3a'; c.lineWidth = 10; [[90, 600, 1180], [980, 680, 1120]].forEach(([x, y0, y1]) => { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); c.beginPath(); c.moveTo(x - 50, y0 + 30); c.lineTo(x + 50, y0 + 30); c.stroke(); });
    c.lineWidth = 2; c.beginPath(); c.moveTo(0, 650); c.quadraticCurveTo(300, 720, 540, 690); c.quadraticCurveTo(800, 660, W, 730); c.moveTo(0, 680); c.quadraticCurveTo(300, 750, 540, 720); c.quadraticCurveTo(800, 690, W, 760); c.stroke();
    if (!soir) { c.fillStyle = 'rgba(255,240,200,.08)'; for (let i = 0; i < 6; i++) c.fillRect(0, 1000 + i * 4 + Math.sin(t * 3 + i) * 3, W, 2); }
  }

  // ---------- statues Jizō à l'entrée du village ----------
  function jizo(c, t, p) {
    const soir = p.soir;
    c.fillStyle = soir ? vg(c, 0, 1200, ['#1a1a33', '#6a3a4a', '#d07a4a']) : vg(c, 0, 1200, ['#4c9ad8', '#a6d2f0', '#eef6f8']); c.fillRect(0, 0, W, H);
    c.fillStyle = soir ? '#1e2a1e' : '#4f7a3e'; c.beginPath(); c.moveTo(0, 900); for (let x = 0; x <= W; x += 40) c.lineTo(x, 900 - 80 - Math.sin(x * .02) * 30 - (x * 7 % 50)); c.lineTo(W, 1300); c.lineTo(0, 1300); c.fill();
    c.fillStyle = soir ? '#3a332a' : '#b9a27a'; c.fillRect(0, 1250, W, H - 1250);
    c.fillStyle = soir ? '#2a251e' : '#9a865f'; const r = rnd(4); for (let i = 0; i < 80; i++) { ell(c, r() * W, 1270 + r() * 650, 6 + r() * 10, 3 + r() * 4); c.fill(); }
    c.fillStyle = soir ? '#4a3a2a' : '#7a5a3a'; c.fillRect(110, 1060, 860, 40); c.fillRect(140, 1100, 24, 220); c.fillRect(916, 1100, 24, 220);
    for (let i = 0; i < 4; i++) {
      const x = 240 + i * 200, y = 1520, casse = p.casse != null ? i === p.casse : false;
      c.save(); c.translate(x, y);
      c.fillStyle = '#7d7a72'; c.beginPath(); c.roundRect(-70, -30, 140, 40, 8); c.fill();
      c.fillStyle = '#a19d92'; c.beginPath(); c.moveTo(-60, -30); c.quadraticCurveTo(-70, -200, -40, -230); c.lineTo(40, -230); c.quadraticCurveTo(70, -200, 60, -30); c.fill();
      c.fillStyle = '#b8261f'; c.beginPath(); c.moveTo(-56, -220); c.lineTo(56, -220); c.lineTo(40, -130); c.quadraticCurveTo(0, -110, -40, -130); c.fill();
      if (!casse) { c.fillStyle = '#aaa69b'; ell(c, 0, -280, 52, 58); c.fill(); c.strokeStyle = '#6b685f'; c.lineWidth = 4; c.beginPath(); c.arc(-18, -282, 10, .2, Math.PI - .2); c.arc(18, -282, 10, .2, Math.PI - .2); c.stroke(); c.beginPath(); c.arc(0, -258, 10, .3, Math.PI - .3); c.stroke(); }
      else { c.fillStyle = '#8d897e'; c.beginPath(); c.moveTo(-40, -230); c.lineTo(-20, -250); c.lineTo(0, -232); c.lineTo(22, -256); c.lineTo(40, -230); c.fill();
        c.fillStyle = '#aaa69b'; c.save(); c.translate(120, 10); c.rotate(1.9); ell(c, 0, 0, 52, 58); c.fill(); c.strokeStyle = '#6b685f'; c.lineWidth = 4; c.beginPath(); c.arc(-18, -2, 10, .2, Math.PI - .2); c.arc(18, -2, 10, .2, Math.PI - .2); c.stroke(); c.restore();
        c.strokeStyle = '#4a4740'; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, -220); c.lineTo(-10, -170); c.lineTo(-24, -120); c.stroke(); }
      c.restore();
    }
    if (soir) nuitVoile(c, .25);
  }

  // ---------- la haie de deux mètres ----------
  function haie(c, t, p) {
    c.fillStyle = vg(c, 0, 1000, p.soir ? ['#3a3460', '#b0705a', '#f0b070'] : ['#5aa6dc', '#a8d4ee', '#f2f6ee']); c.fillRect(0, 0, W, H);
    c.fillStyle = '#4c6a7a'; c.beginPath(); c.moveTo(0, 900); for (let x = 0; x <= W; x += 60) c.lineTo(x, 760 - Math.abs(Math.sin(x * .005)) * 120); c.lineTo(W, 900); c.fill();
    c.fillStyle = '#b9a98a'; c.fillRect(0, 1380, W, H - 1380); c.fillStyle = '#a3936f'; const r = rnd(9); for (let i = 0; i < 120; i++) { ell(c, r() * W, 1390 + r() * 530, 5, 3); c.fill(); }
    c.fillStyle = '#8a6a4a'; c.fillRect(0, 1640, W, 30); for (let x = 20; x < W; x += 120) { c.fillStyle = '#c9b48a'; c.beginPath(); c.roundRect(x, 1690, 90, 46, 12); c.fill(); }
  }
  function haieAvant(c, t, p) {
    const top = 880, r = rnd(13);
    c.fillStyle = '#2f5a2a'; c.fillRect(0, top + 40, W, 520);
    for (let i = 0; i < 520; i++) { const x = r() * W, y = top + r() * 560, s = 10 + r() * 16; c.fillStyle = ['#3e7436', '#2e5f2a', '#4c8a40', '#26502a'][i % 4]; ell(c, x + Math.sin(t * 1.5 + i) * (y < top + 80 ? 3 : 1), y, s, s * .7, r() * 3); c.fill(); }
    if (p.soir) nuitVoile(c, .15, '60,20,40');
  }

  // ---------- salon japonais (tatamis, shōji) ----------
  function salon(c, t, p) {
    c.fillStyle = '#d9c8a6'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#5a3c24'; c.fillRect(0, 0, W, 90); c.fillRect(0, 1180, W, 30);
    [[60, 460], [560, 460]].forEach(([x0, w]) => { c.fillStyle = p.nuit ? '#4a4252' : '#f1e6c8'; c.fillRect(x0, 160, w, 1020); c.strokeStyle = '#5a3c24'; c.lineWidth = 12; c.strokeRect(x0, 160, w, 1020); c.lineWidth = 6; for (let x = x0 + w / 4; x < x0 + w; x += w / 4) { c.beginPath(); c.moveTo(x, 160); c.lineTo(x, 1180); c.stroke(); } for (let y = 160 + 1020 / 6; y < 1180; y += 1020 / 6) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + w, y); c.stroke(); } });
    c.fillStyle = vg(c, 1210, H, ['#b9b06a', '#8e8650']); c.fillRect(0, 1210, W, H - 1210);
    c.strokeStyle = '#6a6238'; c.lineWidth = 6; [1210, 1450, 1760].forEach(y => { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }); [[540, 1210, 1450], [300, 1450, 1760], [800, 1450, 1760], [540, 1760, H]].forEach(([x, a, b]) => { c.beginPath(); c.moveTo(x, a); c.lineTo(x + (x - 540) * .3, b); c.stroke(); });
    const g = c.createRadialGradient(540, 300, 30, 540, 300, 900); g.addColorStop(0, 'rgba(255,220,150,.45)'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#2a1a10'; c.lineWidth = 4; c.beginPath(); c.moveTo(540, 90); c.lineTo(540, 230); c.stroke(); c.fillStyle = '#f6e3b0'; c.beginPath(); c.moveTo(470, 300); c.lineTo(610, 300); c.lineTo(580, 230); c.lineTo(500, 230); c.fill();
    if (p.nuit) nuitVoile(c, .35);
  }
  function salonAvant(c, t, p) {
    c.fillStyle = '#4a2c18'; c.beginPath(); c.roundRect(220, 1560, 640, 60, 14); c.fill(); c.fillRect(260, 1620, 40, 120); c.fillRect(780, 1620, 40, 120);
    c.fillStyle = '#f2efe6'; [[340, 1550], [540, 1548], [740, 1550]].forEach(([x, y]) => { ell(c, x, y, 54, 14); c.fill(); });
    c.fillStyle = '#c75b3a'; ell(c, 540, 1545, 30, 9); c.fill();
    if (p.baguettes) { c.strokeStyle = '#8a5a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(300, 1540); c.lineTo(250, 1610); c.moveTo(320, 1540); c.lineTo(290, 1620); c.stroke(); }
  }

  // ---------- la chambre scellée (sel, talismans, statuette) ----------
  function chambre(c, t, p) {
    c.fillStyle = '#c9bea4'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#5a3c24'; c.fillRect(0, 0, W, 70); c.fillRect(0, 1240, W, 26); c.fillRect(0, 70, 40, 1180); c.fillRect(W - 40, 70, 40, 1180);
    c.fillStyle = '#20263a'; c.fillRect(320, 300, 440, 520); c.strokeStyle = '#5a3c24'; c.lineWidth = 18; c.strokeRect(320, 300, 440, 520); c.lineWidth = 8; c.beginPath(); c.moveTo(540, 300); c.lineTo(540, 820); c.stroke();
    if (p.silhouette) { c.save(); c.beginPath(); c.rect(320, 300, 440, 520); c.clip(); c.globalAlpha = p.silhouette; c.fillStyle = '#05060a'; c.beginPath(); c.ellipse(560, 420, 60, 80, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(470, 480); c.lineTo(650, 480); c.lineTo(700, 900); c.lineTo(420, 900); c.fill(); c.fillStyle = '#0b0c12'; ell(c, 560, 330, 170, 28); c.fill(); c.restore(); }
    c.fillStyle = 'rgba(240,235,220,.18)'; c.fillRect(330, 310, 200, 500);
    for (let i = 0; i < 5; i++) { const x = 360 + i * 82, a = Math.sin(t * 2 + i) * (p.vent ? .08 : .01); c.save(); c.translate(x, 330); c.rotate(a); c.fillStyle = '#efe4c4'; c.fillRect(-18, 0, 36, 150); c.fillStyle = '#a3241c'; c.fillRect(-10, 16, 20, 10); for (let k = 0; k < 4; k++) c.fillRect(-6 + (k % 2) * 4, 40 + k * 22, 12, 6); c.restore(); }
    c.fillStyle = vg(c, 1266, H, ['#a8a062', '#7e7846']); c.fillRect(0, 1266, W, H - 1266);
    c.strokeStyle = '#5e5832'; c.lineWidth = 6; [1266, 1560].forEach(y => { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }); c.beginPath(); c.moveTo(540, 1266); c.lineTo(540, 1560); c.stroke();
    const noir = p.selNoir != null ? Math.max(0, Math.min(1, (t - (p.selDebut || 0)) / 2.5)) * p.selNoir : (p.selDeja ? 1 : 0);
    [[110, 1300, .6], [970, 1300, .6], [130, 1840, 1], [950, 1840, 1]].forEach(([x, y, k], i) => { c.save(); c.translate(x, y); c.scale(k, k);
      c.fillStyle = '#e8e4da'; ell(c, 0, 0, 70, 20); c.fill(); const n = Math.max(0, Math.min(1, noir * 1.4 - i * .12));
      const sel = `rgb(${Math.round(245 - 225 * n)},${Math.round(243 - 225 * n)},${Math.round(238 - 222 * n)})`; c.fillStyle = sel; c.beginPath(); c.moveTo(-50, -4); c.quadraticCurveTo(0, -80, 50, -4); c.fill(); c.restore(); });
    c.save(); c.translate(860, 1240); c.fillStyle = '#4a2c18'; c.fillRect(-80, -20, 160, 20); c.fillStyle = '#c9a24a'; ell(c, 0, -60, 26, 40); c.fill(); ell(c, 0, -112, 16, 18); c.fill(); c.restore();
    const fl = .9 + Math.sin(t * 13) * .06 + Math.sin(t * 7) * .04;
    c.save(); c.translate(220, 1230); c.fillStyle = '#efe4c4'; c.fillRect(-10, -70, 20, 70); c.fillStyle = '#ffc860'; c.beginPath(); c.moveTo(0, -110 + Math.sin(t * 11) * 3); c.quadraticCurveTo(10, -84, 0, -72); c.quadraticCurveTo(-10, -84, 0, -110); c.fill(); c.restore();
    nuitVoile(c, p.nuit === false ? 0 : .55);
    const g = c.createRadialGradient(220, 1130, 10, 220, 1130, 900); g.addColorStop(0, `rgba(255,190,100,${.42 * fl})`); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }

  // ---------- la fenêtre, la nuit (vue de près) ----------
  function fenetre(c, t, p) {
    c.fillStyle = '#16120e'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#121a2e'; c.fillRect(120, 280, 840, 1260);
    c.save(); c.beginPath(); c.rect(120, 280, 840, 1260); c.clip();
    const lune = c.createRadialGradient(700, 500, 20, 700, 500, 700); lune.addColorStop(0, 'rgba(160,180,220,.35)'); lune.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = lune; c.fillRect(0, 0, W, H);
    if (p.ombre) { const a = Math.max(0, Math.min(1, (t - (p.ombreDebut || 0)) / 1.2)); c.globalAlpha = a * .95; c.fillStyle = '#03040a';
      c.beginPath(); c.moveTo(380, 760); c.lineTo(700, 760); c.lineTo(820, 1600); c.lineTo(260, 1600); c.fill(); ell(c, 540, 650, 80, 110); c.fill(); ell(c, 540, 520, 270, 46); c.fill(); c.beginPath(); c.moveTo(450, 520); c.quadraticCurveTo(450, 400, 540, 395); c.quadraticCurveTo(630, 400, 630, 520); c.fill();
      if (p.main) { c.fillStyle = 'rgba(210,205,200,.85)'; c.save(); c.translate(720, 1000 + (1 - a) * 80); ell(c, 0, 0, 46, 56); c.fill(); for (let k = 0; k < 4; k++) { c.beginPath(); c.roundRect(-40 + k * 22, -130, 16, 90, 8); c.fill(); } c.restore(); }
      c.globalAlpha = 1; }
    c.restore();
    c.fillStyle = 'rgba(230,230,240,.12)'; c.fillRect(140, 300, 360, 1220);
    c.strokeStyle = '#3a2618'; c.lineWidth = 30; c.strokeRect(120, 280, 840, 1260); c.lineWidth = 16; c.beginPath(); c.moveTo(540, 280); c.lineTo(540, 1540); c.moveTo(120, 910); c.lineTo(960, 910); c.stroke();
    for (let i = 0; i < 4; i++) { const x = 220 + i * 210, a = Math.sin(t * 1.5 + i) * .03; c.save(); c.translate(x, 300); c.rotate(a); c.fillStyle = '#efe4c4'; c.fillRect(-26, 0, 52, 210); c.fillStyle = '#a3241c'; c.fillRect(-14, 20, 28, 14); for (let k = 0; k < 5; k++) c.fillRect(-8 + (k % 2) * 6, 56 + k * 28, 16, 8); c.restore(); }
    if (p.toc) { const k = (t * 1.6) % 1; if (k < .25) { c.fillStyle = `rgba(255,255,255,${(.25 - k) * .4})`; c.fillRect(120, 280, 840, 1260); } }
  }

  // ---------- dans la voiture, à l'aube ----------
  function voiture(c, t, p) {
    const v = t * (p.vitesse || 600);
    c.fillStyle = vg(c, 0, 1100, ['#4a4a72', '#c88a7a', '#f4c08a']); c.fillRect(0, 0, W, H);
    c.save(); c.beginPath(); c.roundRect(80, 420, 920, 620, 60); c.clip();
    c.fillStyle = '#4a4a5a'; c.beginPath(); c.moveTo(80, 760); for (let x = 80; x <= 1000; x += 40) c.lineTo(x, 740 - Math.abs(Math.sin((x + v * .1) * .004)) * 120); c.lineTo(1000, 1040); c.lineTo(80, 1040); c.fill();
    c.fillStyle = '#5c7a4a'; c.fillRect(80, 840, 920, 200);
    for (let i = 0; i < 12; i++) { const x = ((i * 180 - v) % 1400 + 1400) % 1400 - 200; c.fillStyle = '#2f4a2a'; c.fillRect(x, 820, 8, 60); c.fillStyle = '#3a3a3a'; c.fillRect(x * 1.3 % 1400 - 100, 560, 8, 340); }
    if (p.visage != null) { const a = Math.max(0, Math.min(1, (t - p.visage) / .12)); if (a > 0) { c.globalAlpha = a; c.save(); c.translate(560 + (1 - a) * 300, 980); c.scale(1.9, 1.9);
      c.fillStyle = '#f2efe8'; c.beginPath(); c.moveTo(-230, 220); c.lineTo(-120, -40); c.lineTo(120, -40); c.lineTo(230, 220); c.fill();
      c.fillStyle = '#040406'; c.beginPath(); c.moveTo(-130, 200); c.quadraticCurveTo(-150, -260, 0, -270); c.quadraticCurveTo(150, -260, 130, 200); c.fill();
      c.fillStyle = '#e4ddd2'; c.beginPath(); c.moveTo(-70, -180); c.quadraticCurveTo(-76, -40, 0, -10); c.quadraticCurveTo(76, -40, 70, -180); c.quadraticCurveTo(0, -230, -70, -180); c.fill();
      c.fillStyle = '#020203'; ell(c, -28, -130, 16, 20); c.fill(); ell(c, 28, -130, 16, 20); c.fill();
      c.fillStyle = '#fff'; ell(c, -26, -132, 3, 3); c.fill(); ell(c, 30, -132, 3, 3); c.fill();
      c.fillStyle = '#2a0608'; c.beginPath(); c.moveTo(-50, -70); c.quadraticCurveTo(0, -20, 50, -70); c.quadraticCurveTo(0, -50, -50, -70); c.fill();
      c.fillStyle = '#fbfaf7'; ell(c, 0, -250, 300, 44); c.fill(); c.beginPath(); c.moveTo(-110, -254); c.quadraticCurveTo(-116, -360, 0, -362); c.quadraticCurveTo(116, -360, 110, -254); c.fill();
      c.fillStyle = 'rgba(255,255,255,.75)'; ell(c, -200, 60, 50, 60); c.fill(); for (let k = 0; k < 4; k++) { c.beginPath(); c.roundRect(-240 + k * 26, -60, 20, 100, 10); c.fill(); }
      c.restore(); c.globalAlpha = 1; } }
    c.restore();
    c.fillStyle = 'rgba(255,255,255,.1)'; c.beginPath(); c.moveTo(120, 440); c.lineTo(420, 440); c.lineTo(200, 1020); c.lineTo(100, 1020); c.fill();
    c.fillStyle = '#26262c'; c.fillRect(0, 0, W, 420); c.fillRect(0, 1040, W, H - 1040); c.fillRect(0, 0, 80, H); c.fillRect(1000, 0, 80, H);
    c.strokeStyle = '#3a3a42'; c.lineWidth = 26; c.beginPath(); c.roundRect(80, 420, 920, 620, 60); c.stroke();
    c.fillStyle = '#34343c'; c.beginPath(); c.roundRect(60, 1180, 960, 760, 40); c.fill(); c.fillStyle = '#2c2c33'; for (let i = 0; i < 3; i++) { c.beginPath(); c.roundRect(90 + i * 310, 1210, 290, 700, 30); c.fill(); }
    c.fillStyle = '#1c1c22'; c.fillRect(100, 1100, 300, 30);
  }

  // ---------- noir avec braises (fin) ----------
  G.DECORS = {
    campagne: { fond: campagne }, jizo: { fond: jizo }, haie: { fond: haie, avant: haieAvant, sousHumains: true },
    salon: { fond: salon, avant: salonAvant }, chambre: { fond: chambre }, fenetre: { fond: fenetre }, voiture: { fond: voiture },
  };
})(window);
