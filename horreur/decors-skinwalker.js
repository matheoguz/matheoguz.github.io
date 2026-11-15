// Le Bestiaire — décors « style rendu » pour le Skinwalker (ranch isolé, Arizona, la nuit).
// Profondeur (perspective), lumières (phares, lampe, télé, lune), brouillard, ombres douces.
(function (G) {
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const ell = (c, x, y, rx, ry, r = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, r, 0, TAU); };
  const vg = (c, y0, y1, cols) => { const g = c.createLinearGradient(0, y0, 0, y1); cols.forEach((k, i) => g.addColorStop(i / (cols.length - 1), k)); return g; };
  const rg = (c, x, y, r0, r1, cols) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); cols.forEach((k, i) => g.addColorStop(i / (cols.length - 1), k)); return g; };
  const rnd = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const P = (c, pts) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };
  const art = () => G.BESTIAIRE_ART.skinwalker.dessin;
  const brouillard = (c, t, y, a = .35) => { for (let i = 0; i < 6; i++) { const x = ((i * 300 + t * 25 * (i % 2 ? 1 : -1)) % 1600 + 1600) % 1600 - 260; c.fillStyle = rg(c, x, y + (i % 3) * 40, 10, 380, [`rgba(160,175,200,${a})`, 'rgba(160,175,200,0)']); c.fillRect(x - 400, y - 400, 800, 800); } };
  const etoiles = (c, n, h) => { const r = rnd(3); for (let i = 0; i < n; i++) { c.fillStyle = `rgba(255,255,255,${.3 + r() * .6})`; c.fillRect(r() * W, r() * h, 2, 2); } };
  const sapin = (c, x, y, h, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - h); for (let i = 0; i <= 6; i++) { const k = i / 6; c.lineTo(x - h * .22 * k - (i % 2) * 10, y - h + h * k); } c.lineTo(x + h * .24, y); for (let i = 6; i >= 0; i--) { const k = i / 6; c.lineTo(x + h * .22 * k + (i % 2) * 10, y - h + h * k); } c.fill(); };

  // ---------- route en forêt, vue du conducteur, phares ----------
  function route(c, t, p) {
    c.fillStyle = vg(c, 0, 900, ['#020309', '#0a0f1e', '#141c2e']); c.fillRect(0, 0, W, H); etoiles(c, 90, 700);
    const r = rnd(7); for (let i = 0; i < 26; i++) sapin(c, r() * W, 930, 260 + r() * 260, '#04060c');
    const vp = [540, 920];
    c.fillStyle = '#0b0d10'; c.fillRect(0, 920, W, H - 920);
    c.fillStyle = '#2a2620'; P(c, [[vp[0] - 30, vp[1]], [vp[0] + 30, vp[1]], [1400, H], [-320, H]]); c.fill();
    const N = 10, v = (t * (p.vitesse ?? .28)) % 1;
    for (let i = 0; i < N; i++) { const k = ((i / N + v) % 1), k2 = k * k; [-1, 1].forEach(g => { const x = vp[0] + g * (90 + 760 * k2), base = vp[1] + 900 * k2, h = 240 + 1900 * k2, w = 6 + 80 * k2;
      c.fillStyle = `rgba(${22 + 40 * k},${19 + 33 * k},${15 + 26 * k},1)`; c.fillRect(x - w / 2, base - h, w, h); }); }
    for (let i = 0; i < 8; i++) { const k = ((i / 8 + v * 1.6) % 1), k2 = k * k; c.fillStyle = `rgba(210,200,160,${.15 + .6 * k})`; const y = vp[1] + 900 * k2, w = 4 + 14 * k2, h = 10 + 140 * k2; c.fillRect(vp[0] - w / 2, y, w, h); }
    // phares
    c.save(); c.globalCompositeOperation = 'lighter';
    const ph = vg(c, vp[1], H, ['rgba(255,240,200,0)', 'rgba(255,235,190,.32)', 'rgba(255,230,180,.55)']);
    c.fillStyle = ph; P(c, [[vp[0] - 160, vp[1] + 10], [vp[0] + 160, vp[1] + 10], [1180, H], [-100, H]]); c.fill();
    c.fillStyle = rg(c, 540, 1150, 20, 520, ['rgba(255,240,200,.25)', 'rgba(255,240,200,0)']); c.fillRect(0, 600, W, 1100); c.restore();
    if (p.figure) { const f = p.figure, a = Math.max(0, Math.min(1, (t - (f.apparait || 0)) / .4)); if (a > 0) {
      c.save(); c.globalAlpha = a; c.translate(f.x, f.y); c.scale(f.echelle, f.echelle); art()(c, t, {}); c.restore();
      c.save(); c.globalAlpha = a * .55; c.fillStyle = rg(c, f.x - 60 * f.echelle * 3, f.y - 400 * f.echelle, 10, 700 * f.echelle, ['rgba(255,230,180,.0)', 'rgba(0,0,0,.8)']); c.fillRect(f.x - 600, f.y - 1400 * f.echelle, 1200, 1500 * f.echelle); c.restore(); } }
    brouillard(c, t, 980, .14);
    c.fillStyle = '#05060a'; c.beginPath(); c.moveTo(0, 1460); c.quadraticCurveTo(540, 1380, W, 1460); c.lineTo(W, H); c.lineTo(0, H); c.fill();
    c.fillStyle = 'rgba(80,200,255,.6)'; ell(c, 360, 1560, 60, 40); c.fill(); ell(c, 720, 1560, 60, 40); c.fill();
    c.fillStyle = '#05060a'; ell(c, 360, 1560, 50, 32); c.fill(); ell(c, 720, 1560, 50, 32); c.fill();
    c.strokeStyle = 'rgba(80,200,255,.8)'; c.lineWidth = 4; c.beginPath(); c.moveTo(360, 1560); c.lineTo(390, 1535); c.moveTo(720, 1560); c.lineTo(700, 1532); c.stroke();
    c.strokeStyle = '#020204'; c.lineWidth = 60; c.beginPath(); c.moveTo(-20, 300); c.lineTo(160, 1460); c.moveTo(1100, 300); c.lineTo(920, 1460); c.stroke();
    c.fillStyle = '#020204'; c.fillRect(0, 0, W, 300);
    c.fillStyle = 'rgba(255,255,255,.04)'; P(c, [[160, 320], [500, 320], [300, 1440], [140, 1440]]); c.fill();
  }

  // ---------- le ranch, de l'extérieur ----------
  function ranch(c, t, p) {
    c.fillStyle = vg(c, 0, 1100, ['#02030a', '#0b1226', '#1a2238']); c.fillRect(0, 0, W, H); etoiles(c, 120, 900);
    c.fillStyle = '#e8ecf4'; c.shadowColor = '#bcd0ff'; c.shadowBlur = 50; ell(c, 840, 260, 48, 48); c.fill(); c.shadowBlur = 0;
    const r = rnd(5); for (let i = 0; i < 30; i++) sapin(c, r() * W, 1040 + r() * 40, 300 + r() * 300, i % 2 ? '#05080f' : '#070b14');
    c.fillStyle = vg(c, 1060, H, ['#121620', '#07090e']); c.fillRect(0, 1060, W, H - 1060);
    c.save(); c.translate(540, 1360);
    c.fillStyle = '#2a1f18'; P(c, [[-420, 0], [420, 0], [420, -380], [-420, -380]]); c.fill();
    for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#2f231b' : '#271c15'; c.fillRect(-420, -380 + i * 42, 840, 40); }
    c.fillStyle = '#14100e'; P(c, [[-480, -370], [0, -560], [480, -370]]); c.fill();
    c.fillStyle = '#100c0a'; c.fillRect(-470, -250, 940, 26); [-440, -150, 150, 440].forEach(x => c.fillRect(x - 10, -230, 20, 230));
    c.fillStyle = p.lumiere === false ? '#0a0c12' : '#141820'; [[-300, -220], [220, -220]].forEach(([x, y]) => { c.fillRect(x, y, 120, 110); c.strokeStyle = '#0b0807'; c.lineWidth = 8; c.strokeRect(x, y, 120, 110); });
    c.fillStyle = '#0c0907'; c.fillRect(-60, -230, 120, 230);
    if (p.lumiere !== false) { const fl = .85 + Math.sin(t * 17) * .08 + (Math.sin(t * 3.1) > .95 ? -.4 : 0);
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, 0, -250, 5, 360, [`rgba(255,200,120,${.6 * fl})`, 'rgba(255,180,90,0)']); c.fillRect(-400, -600, 800, 800); c.restore();
      c.fillStyle = `rgba(255,220,150,${fl})`; ell(c, 0, -262, 12, 12); c.fill();
      c.fillStyle = 'rgba(255,240,200,.9)'; for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.7; ell(c, Math.cos(a) * 40, -262 + Math.sin(a * 1.3) * 30, 3, 2); c.fill(); } }
    c.restore();
    brouillard(c, t, 1380, .25);
    if (p.yeux) yeuxForet(c, t, p.yeux, 1100);
  }
  function yeuxForet(c, t, n, y0) { const r = rnd(21); for (let i = 0; i < n; i++) { const x = 80 + r() * 920, y = y0 - 80 + r() * 160, cl = ((t + i * .7) % 4) < .15; if (cl) continue;
    c.save(); c.shadowColor = '#7dff6a'; c.shadowBlur = 18; c.fillStyle = '#b8ff9e'; ell(c, x - 9, y, 4, 3); c.fill(); ell(c, x + 9, y - 2, 4, 3); c.fill(); c.restore(); } }

  // ---------- le salon du ranch (perspective) ----------
  function salon(c, t, p) {
    const fond = p.eteint ? ['#07080c', '#0b0d12'] : ['#3a2c22', '#2a2019'];
    c.fillStyle = fond[1]; c.fillRect(0, 0, W, H);
    c.fillStyle = fond[0]; P(c, [[0, 0], [180, 380], [180, 1260], [0, 1700]]); c.fill(); P(c, [[W, 0], [900, 380], [900, 1260], [W, 1700]]); c.fill();
    c.fillStyle = p.eteint ? '#0d0f15' : '#47362a'; c.fillRect(180, 380, 720, 880);
    for (let i = 0; i < 12; i++) { c.fillStyle = `rgba(0,0,0,${i % 2 ? .08 : 0})`; c.fillRect(180 + i * 60, 380, 60, 880); }
    c.fillStyle = p.eteint ? '#0a0b0e' : '#5a4433'; P(c, [[180, 1260], [900, 1260], [W, 1700], [W, H], [0, H], [0, 1700]]); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(180 + i * 90, 1260); c.lineTo(-400 + i * 235, H); c.stroke(); }
    // fenêtre (mur gauche, en perspective)
    c.fillStyle = '#0a1226'; P(c, [[40, 600], [140, 640], [140, 1000], [40, 1080]]); c.fill();
    c.fillStyle = 'rgba(150,180,255,.12)'; P(c, [[40, 600], [140, 640], [700, 1700], [200, 1900]]); if (p.eteint) c.fill();
    // porte d'entrée (fond)
    c.fillStyle = p.eteint ? '#060709' : '#2a1d14'; c.fillRect(640, 620, 190, 640); c.fillStyle = '#b89048'; ell(c, 805, 950, 8, 8); c.fill();
    if (p.filet) { c.fillStyle = 'rgba(255,220,160,.6)'; c.fillRect(640, 1254, 190, 6); if (p.ombresPieds) { c.fillStyle = '#000'; c.fillRect(690, 1254, 30, 6); c.fillRect(750, 1254, 30, 6); } }
    // télé
    c.fillStyle = '#0b0b0e'; c.fillRect(250, 820, 260, 170); c.fillStyle = '#16120e'; c.fillRect(230, 990, 300, 200);
    if (!p.eteint) { const tv = .7 + Math.sin(t * 9) * .15 + Math.sin(t * 23) * .1; c.fillStyle = `rgba(110,160,255,${tv})`; c.fillRect(262, 832, 236, 146);
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, 380, 900, 10, 700, [`rgba(80,130,255,${.25 * tv})`, 'rgba(80,130,255,0)']); c.fillRect(0, 300, W, 1400); c.restore(); }
    if (!p.eteint) { c.fillStyle = '#c9a060'; P(c, [[810, 1000], [870, 1000], [890, 1060], [790, 1060]]); c.fill(); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, 840, 1020, 10, 600, ['rgba(255,190,110,.45)', 'rgba(255,170,80,0)']); c.fillRect(200, 400, 880, 1300); c.restore(); }
    if (p.yeuxFenetre) { c.save(); c.shadowColor = '#7dff6a'; c.shadowBlur = 16; c.fillStyle = '#b8ff9e'; ell(c, 80, 820, 4, 3); c.fill(); ell(c, 98, 818, 4, 3); c.fill(); c.restore(); }
  }
  function salonAvant(c, t, p) {
    c.fillStyle = p.eteint ? '#0b0b10' : '#3d2b33'; c.beginPath(); c.roundRect(60, 1560, 960, 260, 50); c.fill();
    c.fillStyle = p.eteint ? '#101016' : '#4a3540'; c.beginPath(); c.roundRect(20, 1500, 120, 380, 40); c.fill(); c.beginPath(); c.roundRect(940, 1500, 120, 380, 40); c.fill();
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(60, 1800, 960, 30);
  }

  // ---------- la porte d'entrée, de près ----------
  function porte(c, t, p) {
    c.fillStyle = '#0a0806'; c.fillRect(0, 0, W, H);
    c.fillStyle = vg(c, 160, 1760, ['#2a1d14', '#1d140e']); c.fillRect(200, 160, 680, 1600);
    c.strokeStyle = '#120c08'; c.lineWidth = 10; [[260, 240, 560, 560], [260, 900, 560, 760]].forEach(([x, y, w, h]) => c.strokeRect(x, y, w, h));
    c.fillStyle = '#c9a050'; ell(c, 800, 960, 18, 18); c.fill(); c.fillStyle = '#7a6030'; c.fillRect(760, 1010, 80, 16);
    c.fillStyle = '#d8b060'; ell(c, 540, 600, 12, 12); c.fill(); c.fillStyle = '#0a0806'; ell(c, 540, 600, 6, 6); c.fill();
    c.strokeStyle = '#9a9a9a'; c.lineWidth = 6; c.beginPath(); c.moveTo(740, 700); for (let i = 0; i < 8; i++) c.lineTo(760 + i * 10, 720 + (i % 2) * 14); c.stroke();
    c.fillStyle = 'rgba(255,220,160,.75)'; c.fillRect(200, 1752, 680, 12);
    if (p.ombresPieds) { const a = Math.max(0, Math.min(1, (t - .4) / 1)); c.fillStyle = `rgba(0,0,0,${a})`; c.fillRect(420, 1752, 60, 12); c.fillRect(560, 1752, 60, 12); }
    if (p.toc) { const k = (t * 1.4) % 1; const s = k < .08 ? 6 : 0; c.save(); c.translate(s, 0); c.restore(); }
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, 540, 1780, 10, 500, ['rgba(255,200,130,.35)', 'rgba(255,200,130,0)']); c.fillRect(0, 1200, W, 720); c.restore();
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 0, W, H);
  }

  // ---------- la fenêtre : la forêt et ce qui regarde ----------
  function fenetre(c, t, p) {
    c.fillStyle = '#0c0907'; c.fillRect(0, 0, W, H);
    c.save(); c.beginPath(); c.rect(140, 320, 800, 1180); c.clip();
    c.fillStyle = vg(c, 320, 1500, ['#03050c', '#0a1022', '#0d1426']); c.fillRect(0, 0, W, H);
    const r = rnd(12); for (let i = 0; i < 18; i++) sapin(c, 100 + r() * 900, 1300 + r() * 80, 500 + r() * 400, '#03050a');
    if (p.yeux) yeuxForet(c, t, p.yeux, 1180);
    if (p.proche != null) { const a = Math.max(0, Math.min(1, (t - p.proche) / .25)); if (a > 0) { c.globalAlpha = a; c.save(); c.translate(600, 2650); c.scale(2.6, 2.6); art()(c, t, {}); c.restore();
      c.fillStyle = rg(c, 600, 700, 50, 700, ['rgba(0,0,0,0)', 'rgba(0,0,0,.75)']); c.fillRect(0, 0, W, H); c.globalAlpha = 1; } }
    c.fillStyle = 'rgba(180,200,255,.06)'; c.fillRect(140, 320, 800, 1180);
    c.restore();
    c.fillStyle = 'rgba(255,255,255,.05)'; P(c, [[160, 340], [460, 340], [300, 1480], [160, 1480]]); c.fill();
    c.strokeStyle = '#1e140d'; c.lineWidth = 36; c.strokeRect(140, 320, 800, 1180); c.lineWidth = 18; c.beginPath(); c.moveTo(540, 320); c.lineTo(540, 1500); c.moveTo(140, 910); c.lineTo(940, 910); c.stroke();
    if (p.main) { c.fillStyle = 'rgba(200,190,175,.55)'; c.save(); c.translate(360, 1120); ell(c, 0, 0, 44, 54); c.fill(); for (let k = 0; k < 4; k++) { c.beginPath(); c.roundRect(-38 + k * 22, -150, 15, 110, 8); c.fill(); } c.restore(); }
  }

  // ---------- la cuisine dans le noir ----------
  function cuisine(c, t, p) {
    c.fillStyle = '#16181e'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#1d2027'; P(c, [[0, 0], [200, 420], [200, 1240], [0, 1700]]); c.fill(); P(c, [[W, 0], [880, 420], [880, 1240], [W, 1700]]); c.fill();
    c.fillStyle = '#23262e'; c.fillRect(200, 420, 680, 820);
    c.fillStyle = '#2d2a26'; P(c, [[200, 1240], [880, 1240], [W, 1700], [W, H], [0, H], [0, 1700]]); c.fill();
    c.fillStyle = '#3a3630'; c.fillRect(220, 900, 640, 30); c.fillStyle = '#2a2722'; c.fillRect(220, 930, 640, 310);
    for (let i = 0; i < 4; i++) { c.strokeStyle = '#1a1814'; c.lineWidth = 4; c.strokeRect(230 + i * 158, 945, 150, 280); }
    c.fillStyle = '#2a2722'; c.fillRect(220, 480, 640, 220); for (let i = 0; i < 4; i++) { c.strokeStyle = '#1a1814'; c.strokeRect(230 + i * 158, 490, 150, 200); }
    c.fillStyle = '#c9ccd2'; c.fillRect(0, 520, 150, 1080); c.strokeStyle = '#9a9ca2'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 900); c.lineTo(150, 900); c.stroke();
    if (p.monstre !== false) { c.save(); c.translate(p.mx ?? 760, 1500); c.scale(p.me ?? 1.18, p.me ?? 1.18); art()(c, t, {}); c.restore(); }
  }

  // ---------- jumpscare : son visage, tout près ----------
  function visage(c, t, p) {
    const a = Math.max(0, Math.min(1, (t - (p.jumpscare || 0)) / .06));
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H); if (a <= 0) return;
    const dt = t - (p.jumpscare || 0), z = 1 + dt * .1, sh = Math.sin(t * 80) * 16 * Math.max(0, 1 - dt);
    c.save(); c.translate(540 + sh, 1000); c.scale(z * 2.3, z * 2.3);
    // peau de coyote (capuche) dans l'ombre
    c.fillStyle = '#2a2018'; c.beginPath(); c.moveTo(-230, 330); c.quadraticCurveTo(-250, -160, -120, -250); c.lineTo(170, -360); c.lineTo(110, -210); c.quadraticCurveTo(240, -80, 230, 330); c.fill();
    c.fillStyle = '#17110c'; P(c, [[-150, -220], [-130, -350], [-80, -240]]); c.fill(); P(c, [[-40, -260], [0, -380], [30, -270]]); c.fill();
    // visage : peau grise tirée, éclairée par en dessous
    const g = c.createLinearGradient(0, -150, 0, 220); g.addColorStop(0, '#4a4440'); g.addColorStop(.55, '#9c9286'); g.addColorStop(1, '#c9bca8');
    c.fillStyle = g; c.beginPath(); c.moveTo(-105, -110); c.quadraticCurveTo(-140, 110, -60, 205); c.quadraticCurveTo(0, 232, 60, 205); c.quadraticCurveTo(140, 110, 105, -110); c.quadraticCurveTo(0, -165, -105, -110); c.fill();
    c.strokeStyle = 'rgba(40,30,25,.55)'; c.lineWidth = 2; [[-70, 40, -40, 120], [75, 20, 50, 110], [-20, -100, -30, -40], [30, 140, 10, 190]].forEach(([x1, y1, x2, y2]) => { c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2 + 8, (y1 + y2) / 2, x2, y2); c.stroke(); });
    // orbites creuses, mal alignées
    c.fillStyle = '#0a0706'; ell(c, -46, -12, 38, 32, -.2); c.fill(); ell(c, 50, -36, 38, 32, .25); c.fill();
    c.save(); c.shadowColor = '#7dff5a'; c.shadowBlur = 25; c.fillStyle = '#b6ff8a'; ell(c, -44, -10, 9, 10); c.fill(); ell(c, 52, -34, 9, 10); c.fill(); c.restore();
    c.fillStyle = '#000'; c.fillRect(-46, -19, 4, 18); c.fillRect(50, -43, 4, 18);
    c.fillStyle = '#1a1210'; ell(c, -10, 70, 7, 11, .3); c.fill(); ell(c, 12, 70, 7, 11, -.3); c.fill();
    // bouche d'une oreille à l'autre
    c.fillStyle = '#120404'; c.beginPath(); c.moveTo(-112, 100); c.quadraticCurveTo(0, 245, 118, 88); c.quadraticCurveTo(0, 150, -112, 100); c.fill();
    c.fillStyle = '#3a0c0c'; c.beginPath(); c.moveTo(-100, 104); c.quadraticCurveTo(0, 150, 106, 94); c.quadraticCurveTo(0, 138, -100, 104); c.fill();
    const r = rnd(8); c.fillStyle = '#d9cfb4';
    for (let i = 0; i < 18; i++) { const k = i / 17, x = -104 + k * 214, y = 102 + Math.sin(k * Math.PI) * 38, h = 14 + r() * 14; P(c, [[x - 5, y], [x + 6, y], [x + 1, y + h]]); c.fill(); }
    for (let i = 0; i < 14; i++) { const k = i / 13, x = -88 + k * 180, y = 128 + Math.sin(k * Math.PI) * 78, h = 12 + r() * 12; P(c, [[x - 5, y], [x + 6, y], [x + 1, y - h]]); c.fill(); }
    c.restore();
    c.fillStyle = rg(c, 540, 1150, 250, 1000, ['rgba(0,0,0,0)', 'rgba(0,0,0,.92)']); c.fillRect(0, 0, W, H);
    if (dt < .12) { c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(0, 0, W, H); }
    c.fillStyle = `rgba(120,0,0,${.18 + Math.max(0, .3 - dt * .3)})`; c.fillRect(0, 0, W, H);
  }

  Object.assign(G.DECORS = G.DECORS || {}, {
    sw_route: { fond: route }, sw_ranch: { fond: ranch }, sw_salon: { fond: salon, avant: salonAvant }, sw_porte: { fond: porte },
    sw_fenetre: { fond: fenetre }, sw_cuisine: { fond: cuisine }, sw_visage: { fond: visage },
  });
})(window);
