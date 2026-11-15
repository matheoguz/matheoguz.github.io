// Le Bestiaire — dessins des monstres (canvas 2D, dessinés en code).
// Chaque fonction dessine le monstre les pieds en (0,0), environ 1000 unités de haut, t = temps en secondes (animation).
(function (G) {
  const TAU = Math.PI * 2;
  const P = (c, pts, close = true) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); if (close) c.closePath(); };
  const ell = (c, x, y, rx, ry, r = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, r, 0, TAU); };
  const lueur = (c, col, b, fn) => { c.save(); c.shadowColor = col; c.shadowBlur = b; fn(); c.restore(); };
  const yeux = (c, x, y, ecart, r, col, t) => lueur(c, col, 30, () => { c.fillStyle = col; const f = .85 + Math.sin(t * 4) * .15; ell(c, x - ecart, y, r * 1.4, r * f); c.fill(); ell(c, x + ecart, y, r * 1.4, r * f); c.fill(); });
  const ombre = (c, w) => { c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, 0, 4, w, w * .14); c.fill(); };
  const fourrure = (c, x0, y0, x1, y1, pointes, amp, seed = 1) => { // bord en dents de scie (poils)
    const pts = []; for (let i = 0; i <= pointes; i++) { const k = i / pointes, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k; const o = (i % 2 ? amp : 0) * (0.6 + 0.4 * Math.sin(i * 12.9898 * seed)); pts.push([x + o * .3, y + o]); } return pts; };

  // 1. VAMPIRE — le Comte qui compte
  function vampire(c, t) {
    const s = Math.sin(t * 1.4) * 8; ombre(c, 260);
    c.fillStyle = '#120609'; c.beginPath(); c.moveTo(-70, -800); c.bezierCurveTo(-330, -700, -360, -300, -300 + s, 0); c.lineTo(300 - s, 0); c.bezierCurveTo(360, -300, 330, -700, 70, -800); c.fill();
    c.fillStyle = '#6e0d1a'; c.beginPath(); c.moveTo(-60, -760); c.bezierCurveTo(-270, -650, -290, -300, -240 + s, -10); c.lineTo(240 - s, -10); c.bezierCurveTo(290, -300, 270, -650, 60, -760); c.fill();
    c.fillStyle = '#9b1b2c'; c.beginPath(); c.moveTo(-40, -740); c.bezierCurveTo(-200, -620, -220, -300, -180 + s, -10); c.lineTo(-120, -10); c.bezierCurveTo(-150, -300, -120, -600, -20, -720); c.fill();
    c.fillStyle = '#111'; c.fillRect(-62, -330, 46, 320); c.fillRect(16, -330, 46, 320);
    c.fillStyle = '#050505'; P(c, [[-70, -18], [-10, -18], [-6, 0], [-82, 0]]); c.fill(); P(c, [[10, -18], [70, -18], [84, 0], [6, 0]]); c.fill();
    c.fillStyle = '#16121a'; c.beginPath(); c.moveTo(-100, -650); c.lineTo(100, -650); c.lineTo(120, -300); c.lineTo(-120, -300); c.fill();
    c.fillStyle = '#4a0b15'; P(c, [[-55, -640], [55, -640], [62, -330], [0, -300], [-62, -330]]); c.fill();
    c.fillStyle = '#c8a24a'; [-560, -500, -440, -380].forEach(y => { ell(c, 0, y, 6, 6); c.fill(); });
    c.fillStyle = '#eee8df'; P(c, [[-38, -650], [38, -650], [0, -560]]); c.fill();
    c.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { ell(c, 0, -630 + i * 22, 26 - i * 5, 12); c.fill(); }
    lueur(c, '#ff3040', 20, () => { c.fillStyle = '#b8132a'; ell(c, 0, -540, 18, 22); c.fill(); });
    c.strokeStyle = '#c8a24a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, -650); c.quadraticCurveTo(0, -580, 30, -650); c.stroke();
    c.fillStyle = '#16121a'; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 100, -640); c.quadraticCurveTo(g * 170, -480, g * 160, -330); c.lineTo(g * 120, -330); c.quadraticCurveTo(g * 125, -480, g * 80, -600); c.fill(); });
    c.fillStyle = '#c9d2d8'; c.strokeStyle = '#c9d2d8'; c.lineCap = 'round'; c.lineWidth = 7;
    [-1, 1].forEach(g => { ell(c, g * 142, -318, 22, 20); c.fill(); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(g * (128 + i * 10), -305); c.quadraticCurveTo(g * (130 + i * 12), -250, g * (122 + i * 14), -215 + Math.sin(t * 2 + i) * 6); c.stroke(); } });
    c.fillStyle = '#4a0b15'; [-1, 1].forEach(g => { P(c, [[g * 40, -690], [g * 150, -900], [g * 120, -700], [g * 70, -650]]); c.fill(); });
    c.fillStyle = '#d3dbe0'; c.fillRect(-26, -720, 52, 60);
    c.fillStyle = '#cdd6dc'; [-1, 1].forEach(g => { P(c, [[g * 55, -790], [g * 105, -840], [g * 62, -755]]); c.fill(); });
    c.beginPath(); c.moveTo(-62, -820); c.quadraticCurveTo(-66, -720, -30, -690); c.quadraticCurveTo(0, -670, 30, -690); c.quadraticCurveTo(66, -720, 62, -820); c.quadraticCurveTo(0, -880, -62, -820); c.fill();
    c.fillStyle = '#0a0a0e'; c.beginPath(); c.moveTo(-68, -800); c.quadraticCurveTo(-70, -910, 0, -915); c.quadraticCurveTo(70, -910, 68, -800); c.lineTo(50, -840); c.lineTo(0, -800); c.lineTo(-50, -840); c.closePath(); c.fill();
    c.fillStyle = '#a9b3bb'; ell(c, -26, -780, 18, 8); c.fill(); ell(c, 26, -780, 18, 8); c.fill();
    yeux(c, 0, -782, 26, 6, '#ff2b3d', t);
    c.strokeStyle = '#0a0a0e'; c.lineWidth = 5; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 46, -800); c.lineTo(g * 12, -792); c.stroke(); });
    c.strokeStyle = '#8e99a1'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -775); c.lineTo(-6, -745); c.lineTo(4, -742); c.stroke();
    c.strokeStyle = '#5a1018'; c.lineWidth = 4; c.beginPath(); c.moveTo(-22, -718); c.quadraticCurveTo(0, -710, 22, -718); c.stroke();
    c.fillStyle = '#fff'; P(c, [[-14, -716], [-8, -716], [-11, -700]]); c.fill(); P(c, [[8, -716], [14, -716], [11, -700]]); c.fill();
  }

  // 2. BANSHEE — la pleureuse des familles
  function banshee(c, t) {
    const f = Math.sin(t * 2) * 12; c.save(); c.translate(0, -60 + Math.sin(t * 1.3) * 14);
    const g = c.createLinearGradient(0, -700, 0, 40); g.addColorStop(0, 'rgba(160,190,180,.95)'); g.addColorStop(.7, 'rgba(120,150,145,.6)'); g.addColorStop(1, 'rgba(120,150,145,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(-70, -640);
    c.bezierCurveTo(-180, -400, -220 + f, -150, -240 + f, 40); for (let i = 0; i <= 8; i++) c.lineTo(-240 + i * 60 + (i % 2 ? 0 : f), 40 - (i % 2) * 70);
    c.bezierCurveTo(220 - f, -150, 180, -400, 70, -640); c.fill();
    c.strokeStyle = 'rgba(220,240,235,.35)'; c.lineWidth = 3; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 30, -600); c.quadraticCurveTo(i * 60 + f, -300, i * 80, 0); c.stroke(); }
    c.fillStyle = '#d9e7e3'; c.strokeStyle = '#d9e7e3'; c.lineWidth = 16; c.lineCap = 'round';
    [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s * 60, -620); c.quadraticCurveTo(s * 120, -700, s * 75, -790); c.stroke(); for (let i = 0; i < 4; i++) { c.lineWidth = 5; c.beginPath(); c.moveTo(s * 75, -790); c.lineTo(s * (60 + i * 8), -835); c.stroke(); } c.lineWidth = 16; });
    c.fillStyle = '#a9b8b6'; c.beginPath(); c.moveTo(0, -880); for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI, w = Math.sin(t * 2.4 + i) * 20; c.lineTo(Math.cos(a) * 120 + (i < 7 ? -w - 60 : w + 60) * (1 - Math.abs(i - 7) / 7) * .2, -770 + Math.sin(a) * 110); }
    c.lineTo(260 + f * 2, -520); c.lineTo(160, -560); c.lineTo(200 + f, -380); c.lineTo(80, -560); c.lineTo(-80, -560); c.lineTo(-200 - f, -380); c.lineTo(-160, -560); c.lineTo(-260 - f * 2, -520); c.closePath(); c.fill();
    c.fillStyle = '#e6efec'; c.beginPath(); c.moveTo(-58, -800); c.quadraticCurveTo(-62, -690, -24, -650); c.lineTo(24, -650); c.quadraticCurveTo(62, -690, 58, -800); c.quadraticCurveTo(0, -850, -58, -800); c.fill();
    c.fillStyle = '#1d2a2b'; ell(c, -24, -760, 15, 20); c.fill(); ell(c, 24, -760, 15, 20); c.fill();
    lueur(c, '#bfffee', 20, () => { c.fillStyle = '#e8fff8'; ell(c, -24, -758, 4, 5); c.fill(); ell(c, 24, -758, 4, 5); c.fill(); });
    c.fillStyle = '#0f1617'; const o = 1 + Math.sin(t * 6) * .08; ell(c, 0, -690, 16, 34 * o); c.fill();
    c.strokeStyle = 'rgba(200,255,240,.25)'; c.lineWidth = 4; for (let i = 1; i <= 3; i++) { const k = (t * .8 + i / 3) % 1; c.globalAlpha = 1 - k; c.beginPath(); c.arc(0, -690, 40 + k * 260, Math.PI * .15, Math.PI * .85); c.stroke(); } c.globalAlpha = 1;
    c.fillStyle = '#c0c8cc'; c.save(); c.translate(-80, -830); c.rotate(-.5); c.fillRect(-30, -6, 60, 12); for (let i = 0; i < 7; i++) c.fillRect(-28 + i * 9, 6, 4, 18); c.restore();
    c.restore();
  }

  // 3. LA LLORONA — la mère de la rivière
  function llorona(c, t) {
    ombre(c, 220); c.strokeStyle = 'rgba(180,210,230,.4)'; c.lineWidth = 3; for (let i = 1; i <= 3; i++) { const k = (t * .5 + i / 3) % 1; c.globalAlpha = 1 - k; ell(c, 0, 0, 120 + k * 200, 18 + k * 30); c.stroke(); } c.globalAlpha = 1;
    c.fillStyle = '#e9e6dc'; c.beginPath(); c.moveTo(-70, -620); c.bezierCurveTo(-150, -300, -210, -100, -230, 0);
    for (let i = 0; i <= 10; i++) c.lineTo(-230 + i * 46, -((i % 2) * 40) - Math.sin(t * 2 + i) * 6); c.bezierCurveTo(210, -100, 150, -300, 70, -620); c.fill();
    c.fillStyle = 'rgba(70,90,110,.35)'; c.beginPath(); c.moveTo(-120, -10); c.bezierCurveTo(-140, -150, -100, -240, -150, -330); c.lineTo(150, -330); c.bezierCurveTo(100, -240, 140, -150, 120, -10); c.fill();
    c.strokeStyle = '#cfc9b9'; c.lineWidth = 4; for (let y = -560; y < -80; y += 60) { c.beginPath(); for (let x = -120; x <= 120; x += 20) c.lineTo(x * (1 + (y + 560) / 900), y + (x / 20 % 2 ? 8 : 0)); c.stroke(); }
    c.fillStyle = '#e9e6dc'; P(c, [[-80, -640], [80, -640], [70, -560], [-70, -560]]); c.fill();
    c.strokeStyle = '#d8d0c0'; c.lineWidth = 18; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-70, -610); c.quadraticCurveTo(-170, -520, -230, -560 + Math.sin(t * 1.5) * 10); c.stroke();
    c.beginPath(); c.moveTo(70, -610); c.quadraticCurveTo(170, -520, 230, -570 + Math.sin(t * 1.5 + 1) * 10); c.stroke();
    c.strokeStyle = '#b9c2c4'; c.lineWidth = 5; [-1, 1].forEach(g => { for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(g * 228, -565); c.lineTo(g * (260 + i * 4), -590 + i * 14); c.stroke(); } });
    c.fillStyle = '#c9c6c0'; ell(c, 0, -720, 56, 72); c.fill();
    c.fillStyle = '#07080b'; c.beginPath(); c.moveTo(-70, -740); c.quadraticCurveTo(-60, -810, 0, -812); c.quadraticCurveTo(60, -810, 70, -740);
    c.lineTo(110, -420 + Math.sin(t * 2) * 6); c.lineTo(60, -460); c.lineTo(36, -620); c.lineTo(10, -630); c.lineTo(-10, -630); c.lineTo(-36, -620); c.lineTo(-60, -460); c.lineTo(-110, -420 + Math.sin(t * 2 + 1) * 6); c.closePath(); c.fill();
    c.fillStyle = '#07080b'; P(c, [[-20, -740], [20, -740], [12, -650], [-12, -650]]); c.fill();
    c.fillStyle = '#c9c6c0'; P(c, [[-34, -728], [-14, -735], [-14, -690], [-30, -680]]); c.fill(); P(c, [[34, -728], [14, -735], [14, -690], [30, -680]]); c.fill();
    c.fillStyle = '#111'; ell(c, -24, -712, 7, 9); c.fill(); ell(c, 24, -712, 7, 9); c.fill();
    c.strokeStyle = '#2a2f3a'; c.lineWidth = 4; [-24, 24].forEach(x => { c.beginPath(); c.moveTo(x, -700); c.lineTo(x + 2, -665); c.stroke(); });
    c.fillStyle = 'rgba(240,240,235,.55)'; c.beginPath(); c.moveTo(-50, -800); c.bezierCurveTo(-200, -700, -200, -400, -230, -150); c.lineTo(-140, -200); c.bezierCurveTo(-140, -450, -110, -650, -40, -770); c.fill();
    c.fillStyle = 'rgba(160,200,230,.8)'; for (let i = 0; i < 8; i++) { const k = (t * 1.2 + i * .37) % 1, x = -150 + (i * 47) % 300; ell(c, x, -380 + k * 380, 4, 8); c.fill(); }
  }

  // 4. LA BÊTE DU GÉVAUDAN
  function gevaudan(c, t) {
    const r = Math.sin(t * 2) * 6; ombre(c, 380);
    const roux = '#8c4a26', fonce = '#3b1d10', clair = '#c98a5a';
    c.fillStyle = fonce; [[-260, -10], [-170, -6]].forEach(([x], i) => { P(c, [[x - 30, -330], [x + 30, -330], [x + 26, -40], [x + 50, 0], [x - 30, 0]]); c.fill(); });
    c.fillStyle = roux; c.beginPath(); c.moveTo(-330, -330); c.quadraticCurveTo(-520, -400, -560, -250 + r); c.quadraticCurveTo(-500, -340, -340, -280); c.fill();
    c.fillStyle = fonce; ell(c, -560, -255 + r, 40, 26, .5); c.fill();
    c.fillStyle = roux; c.beginPath(); c.moveTo(-350, -280); c.bezierCurveTo(-370, -470, -120, -470, 40, -560); c.bezierCurveTo(200, -600, 260, -440, 230, -300); c.bezierCurveTo(120, -230, -200, -220, -350, -280); c.fill();
    c.fillStyle = clair; c.beginPath(); c.moveTo(-200, -260); c.bezierCurveTo(-60, -230, 120, -240, 220, -310); c.lineTo(200, -280); c.bezierCurveTo(100, -220, -80, -210, -200, -250); c.fill();
    c.fillStyle = '#1a0d07'; c.beginPath(); c.moveTo(-340, -420); c.bezierCurveTo(-200, -470, -60, -480, 80, -575); c.lineTo(100, -545); c.bezierCurveTo(-40, -460, -200, -440, -330, -400); c.fill();
    c.fillStyle = fonce; P(c, fourrure(c, -330, -420, 120, -580, 18, -26), false); c.lineTo(110, -560); c.lineTo(-320, -405); c.fill();
    c.fillStyle = roux; [[110, 0], [190, 0]].forEach(([x]) => { P(c, [[x - 34, -330], [x + 34, -330], [x + 30, -40], [x + 56, 0], [x - 34, 0]]); c.fill(); });
    c.fillStyle = '#1a0d07'; [-220, -130, 140, 220].forEach(x => { for (let i = 0; i < 3; i++) { P(c, [[x + i * 12, -2], [x + i * 12 + 6, 10], [x + i * 12 + 10, -2]]); c.fill(); } });
    c.save(); c.translate(230, -470); c.rotate(.15 + Math.sin(t * 1.2) * .04);
    c.fillStyle = roux; c.beginPath(); c.moveTo(-60, -90); c.quadraticCurveTo(80, -150, 150, -60); c.lineTo(330, -10); c.quadraticCurveTo(340, 30, 300, 40); c.lineTo(120, 70); c.quadraticCurveTo(0, 110, -60, 40); c.fill();
    c.fillStyle = fonce; P(c, [[-20, -110], [20, -200], [60, -110]]); c.fill(); P(c, [[50, -120], [100, -205], [110, -105]]); c.fill();
    c.fillStyle = '#3d0d0d'; c.beginPath(); c.moveTo(130, 30); c.lineTo(320, 20); c.quadraticCurveTo(250, 110 + r * 2, 120, 80); c.fill();
    c.fillStyle = '#f2ead6'; for (let i = 0; i < 7; i++) { P(c, [[150 + i * 24, 26], [162 + i * 24, 26], [156 + i * 24, 50]]); c.fill(); P(c, [[150 + i * 22, 82 - i * 2], [160 + i * 22, 82 - i * 2], [155 + i * 22, 62 - i * 2]]); c.fill(); }
    c.fillStyle = '#111'; ell(c, 320, -6, 18, 14); c.fill();
    yeux(c, 120, -60, 0, 9, '#ffcf3a', t);
    c.restore();
  }

  // 5. KUCHISAKE-ONNA — la femme au masque
  function kuchisake(c, t, o = {}) {
    ombre(c, 180); const ciseaux = Math.sin(t * 3) * .25;
    c.fillStyle = '#1c1c1f'; c.fillRect(-46, -280, 36, 270); c.fillRect(10, -280, 36, 270);
    c.fillStyle = '#0b0b0c'; ell(c, -30, -8, 34, 14); c.fill(); ell(c, 30, -8, 34, 14); c.fill();
    c.fillStyle = '#b89a6c'; c.beginPath(); c.moveTo(-80, -640); c.lineTo(80, -640); c.lineTo(130, -230); c.lineTo(-130, -230); c.closePath(); c.fill();
    c.fillStyle = '#9b7f55'; P(c, [[-10, -640], [10, -640], [30, -230], [0, -230]]); c.fill(); c.fillRect(-120, -440, 240, 26);
    c.fillStyle = '#6e5a3a'; c.fillRect(-14, -446, 28, 36);
    c.fillStyle = '#a58b60'; P(c, [[-80, -640], [-10, -640], [-50, -540]]); c.fill(); P(c, [[80, -640], [10, -640], [50, -540]]); c.fill();
    c.strokeStyle = '#b89a6c'; c.lineWidth = 34; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-90, -610); c.quadraticCurveTo(-130, -470, -110, -360); c.stroke();
    c.beginPath(); c.moveTo(90, -610); c.quadraticCurveTo(170, -520, 180, -430); c.stroke();
    c.fillStyle = '#e8d5c4'; ell(c, -110, -345, 18, 20); c.fill(); ell(c, 182, -420, 18, 20); c.fill();
    c.save(); c.translate(185, -420); c.rotate(-1.2);
    c.fillStyle = '#c8ccd2'; c.strokeStyle = '#7c838c'; c.lineWidth = 3;
    [-1, 1].forEach(g => { c.save(); c.rotate(g * ciseaux * .5); P(c, [[0, -6 * g], [220, -2 * g], [0, 6 * g]]); c.fill(); c.stroke(); c.restore(); });
    c.strokeStyle = '#222'; c.lineWidth = 9; c.beginPath(); c.arc(-30, -18, 18, 0, TAU); c.stroke(); c.beginPath(); c.arc(-30, 18, 18, 0, TAU); c.stroke();
    c.restore();
    c.fillStyle = '#e8d5c4'; c.fillRect(-20, -690, 40, 60);
    c.fillStyle = '#060606'; c.beginPath(); c.moveTo(-75, -760); c.quadraticCurveTo(-70, -850, 0, -852); c.quadraticCurveTo(70, -850, 75, -760); c.lineTo(85, -520 + Math.sin(t * 2) * 4); c.lineTo(-85, -520 + Math.sin(t * 2 + 1) * 4); c.closePath(); c.fill();
    c.fillStyle = '#ead7c6'; c.beginPath(); c.moveTo(-54, -780); c.quadraticCurveTo(-56, -690, 0, -672); c.quadraticCurveTo(56, -690, 54, -780); c.quadraticCurveTo(0, -800, -54, -780); c.fill();
    c.fillStyle = '#060606'; c.beginPath(); c.moveTo(-58, -790); c.quadraticCurveTo(0, -830, 58, -790); c.lineTo(50, -770); c.quadraticCurveTo(0, -790, -50, -770); c.fill();
    c.fillStyle = '#fff'; ell(c, -22, -755, 14, 7, -.15); c.fill(); ell(c, 22, -755, 14, 7, .15); c.fill();
    c.fillStyle = '#111'; ell(c, -20, -755, 5, 6); c.fill(); ell(c, 20, -755, 5, 6); c.fill();
    c.strokeStyle = '#111'; c.lineWidth = 4; c.beginPath(); c.moveTo(-40, -772); c.lineTo(-8, -765); c.moveTo(40, -772); c.lineTo(8, -765); c.stroke();
    if (o.revele) { c.strokeStyle = '#5a0f12'; c.lineWidth = 6; c.beginPath(); c.moveTo(-54, -745); c.quadraticCurveTo(0, -680, 54, -745); c.stroke(); c.fillStyle = '#3a0608'; c.beginPath(); c.moveTo(-40, -722); c.quadraticCurveTo(0, -690, 40, -722); c.quadraticCurveTo(0, -705, -40, -722); c.fill(); }
    else { c.fillStyle = '#f4f6f8'; c.beginPath(); c.moveTo(-50, -738); c.quadraticCurveTo(0, -748, 50, -738); c.lineTo(46, -688); c.quadraticCurveTo(0, -668, -46, -688); c.fill();
      c.strokeStyle = '#d0d5da'; c.lineWidth = 3; [-722, -708, -694].forEach(y => { c.beginPath(); c.moveTo(-44, y); c.lineTo(44, y); c.stroke(); });
      c.strokeStyle = '#e9edf0'; c.lineWidth = 3; c.beginPath(); c.moveTo(-50, -735); c.lineTo(-60, -760); c.moveTo(50, -735); c.lineTo(60, -760); c.stroke();
      c.strokeStyle = 'rgba(140,20,25,.6)'; c.lineWidth = 4; c.beginPath(); c.moveTo(42, -712); c.lineTo(50, -712); c.stroke(); }
  }

  // 6. JERSEY DEVIL — le 13e enfant
  function jersey(c, t) {
    const a = Math.sin(t * 3.2) * .22, peau = '#4a3326', fonce = '#2a1b13'; ombre(c, 200);
    [-1, 1].forEach(g => { c.save(); c.translate(g * 50, -600); c.scale(g, 1); c.rotate(-a);
      c.fillStyle = '#2b1d16'; c.beginPath(); c.moveTo(0, 0); c.lineTo(160, -200); c.lineTo(420, -230); c.quadraticCurveTo(380, -150, 400, -60); c.quadraticCurveTo(330, -110, 300, -20); c.quadraticCurveTo(240, -80, 200, 20); c.quadraticCurveTo(140, -30, 60, 60); c.closePath(); c.fill();
      c.strokeStyle = '#1a110c'; c.lineWidth = 9; c.beginPath(); c.moveTo(0, 0); c.lineTo(160, -200); c.lineTo(420, -230); c.moveTo(160, -200); c.lineTo(400, -60); c.moveTo(160, -200); c.lineTo(300, -20); c.moveTo(160, -200); c.lineTo(200, 20); c.stroke(); c.restore(); });
    c.strokeStyle = fonce; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(20, -260); c.bezierCurveTo(200, -180, 260, -60, 180 + Math.sin(t * 2) * 20, -10); c.stroke();
    c.fillStyle = fonce; P(c, [[160 + Math.sin(t * 2) * 20, -30], [220 + Math.sin(t * 2) * 20, -10], [170 + Math.sin(t * 2) * 20, 20]]); c.fill();
    c.fillStyle = peau; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 30, -330); c.quadraticCurveTo(g * 120, -260, g * 90, -150); c.lineTo(g * 60, -20); c.lineTo(g * 30, -20); c.lineTo(g * 50, -150); c.quadraticCurveTo(g * 40, -230, g * 10, -280); c.fill(); });
    c.fillStyle = '#120b07'; [-1, 1].forEach(g => { P(c, [[g * 26, -24], [g * 66, -24], [g * 70, 0], [g * 22, 0]]); c.fill(); });
    c.fillStyle = peau; c.beginPath(); c.moveTo(-60, -620); c.bezierCurveTo(-110, -500, -90, -350, -40, -290); c.lineTo(40, -290); c.bezierCurveTo(90, -350, 110, -500, 60, -620); c.fill();
    c.strokeStyle = fonce; c.lineWidth = 4; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-40, -560 + i * 40); c.quadraticCurveTo(0, -550 + i * 40, 40, -560 + i * 40); c.stroke(); }
    c.strokeStyle = peau; c.lineWidth = 16; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 55, -580); c.quadraticCurveTo(g * 110, -500, g * 90, -430); c.stroke(); c.lineWidth = 5; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(g * 90, -430); c.lineTo(g * (95 + i * 12), -395); c.stroke(); } c.lineWidth = 16; });
    c.fillStyle = peau; c.fillRect(-26, -680, 52, 70);
    c.save(); c.translate(0, -720);
    c.fillStyle = peau; c.beginPath(); c.moveTo(-50, -40); c.quadraticCurveTo(-60, 40, -36, 110); c.quadraticCurveTo(0, 140, 36, 110); c.quadraticCurveTo(60, 40, 50, -40); c.quadraticCurveTo(0, -80, -50, -40); c.fill();
    c.fillStyle = '#5b4031'; ell(c, 0, 105, 34, 26); c.fill(); c.fillStyle = '#120b07'; ell(c, -12, 112, 6, 8); c.fill(); ell(c, 12, 112, 6, 8); c.fill();
    c.strokeStyle = '#d8ccb4'; c.lineWidth = 12; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 30, -50); c.quadraticCurveTo(g * 90, -120, g * 70, -170); c.stroke(); });
    c.fillStyle = peau; [-1, 1].forEach(g => { P(c, [[g * 46, -20], [g * 110, -50], [g * 54, 10]]); c.fill(); });
    yeux(c, 0, 0, 24, 7, '#ff3a1a', t);
    c.restore();
  }

  // 7. KRAMPUS — le punisseur de décembre
  function krampus(c, t) {
    const b = Math.sin(t * 5) * 6, poil = '#17120f'; ombre(c, 260);
    c.fillStyle = '#5a3e22'; P(c, [[-150, -760], [150, -760], [170, -380], [-170, -380]]); c.fill();
    c.strokeStyle = '#3e2a16'; c.lineWidth = 6; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-160, -720 + i * 60); c.lineTo(160, -720 + i * 60); c.stroke(); }
    c.fillStyle = poil; c.fillRect(-60, -300, 50, 260); c.fillRect(10, -300, 50, 260);
    c.fillStyle = '#0a0806'; P(c, [[-70, -40], [-4, -40], [-10, 0], [-76, 0]]); c.fill(); ell(c, 40, -12, 40, 16); c.fill();
    c.fillStyle = poil; c.beginPath(); c.moveTo(-140, -650); c.bezierCurveTo(-210, -500, -190, -320, -130, -260); for (let i = 0; i <= 12; i++) c.lineTo(-130 + i * 22, -260 + (i % 2) * 40); c.bezierCurveTo(190, -320, 210, -500, 140, -650); c.closePath(); c.fill();
    c.strokeStyle = '#2b221c'; c.lineWidth = 4; for (let i = 0; i < 30; i++) { const x = -120 + (i * 37) % 240, y = -620 + (i * 53) % 340; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + 26); c.stroke(); }
    c.strokeStyle = '#8b8e94'; c.lineWidth = 9; for (let k = 0; k < 2; k++) { c.beginPath(); for (let i = 0; i <= 12; i++) { const x = -150 + i * 25, y = -560 + k * 120 + i * 18 + Math.sin(i + t * 3) * 5; c[i ? 'lineTo' : 'moveTo'](x, y); } c.stroke(); }
    c.fillStyle = '#c9a03a'; [-90, -30, 30, 90].forEach((x, i) => { c.save(); c.translate(x, -330); c.rotate(Math.sin(t * 6 + i) * .3); P(c, [[-16, 0], [16, 0], [22, 40], [-22, 40]]); c.fill(); c.fillStyle = '#5a4512'; ell(c, 0, 44, 6, 6); c.fill(); c.fillStyle = '#c9a03a'; c.restore(); });
    c.strokeStyle = poil; c.lineWidth = 40; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-140, -620); c.quadraticCurveTo(-230, -480, -190, -360); c.stroke();
    c.beginPath(); c.moveTo(140, -620); c.quadraticCurveTo(230, -520, 230, -420); c.stroke();
    c.fillStyle = '#3a2a22'; ell(c, -190, -345, 22, 24); c.fill(); ell(c, 232, -405, 22, 24); c.fill();
    c.save(); c.translate(232, -410); c.rotate(-.5 + Math.sin(t * 2) * .1); c.strokeStyle = '#6d5a3c'; c.lineWidth = 5;
    for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(i * 8, -120, i * 18, -260); c.stroke(); } c.fillStyle = '#a1271d'; c.fillRect(-14, -20, 28, 18); c.restore();
    c.save(); c.translate(0, -720);
    c.strokeStyle = '#2a2018'; c.lineWidth = 34; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 40, -60); c.bezierCurveTo(g * 150, -170, g * 230, -40, g * 170, 20); c.stroke(); });
    c.fillStyle = poil; P(c, fourrure(c, -90, -70, 90, -70, 10, -30), false); c.lineTo(80, 60); c.lineTo(-80, 60); c.fill();
    c.fillStyle = '#2f241d'; c.beginPath(); c.moveTo(-70, -60); c.quadraticCurveTo(-80, 60, -30, 140); c.lineTo(30, 140); c.quadraticCurveTo(80, 60, 70, -60); c.quadraticCurveTo(0, -100, -70, -60); c.fill();
    c.fillStyle = poil; [-1, 1].forEach(g => { P(c, [[g * 60, -30], [g * 130, -10], [g * 70, 20]]); c.fill(); });
    c.fillStyle = '#110c09'; ell(c, -12, 120, 7, 9); c.fill(); ell(c, 12, 120, 7, 9); c.fill();
    c.fillStyle = '#b3242c'; c.beginPath(); c.moveTo(-14, 138); c.quadraticCurveTo(-20, 230 + b, 6, 280 + b); c.quadraticCurveTo(26, 230 + b, 14, 138); c.fill();
    c.fillStyle = '#f1e6cf'; P(c, [[-26, 136], [-18, 136], [-22, 166]]); c.fill(); P(c, [[18, 136], [26, 136], [22, 166]]); c.fill();
    yeux(c, 0, 10, 28, 7, '#ffb21a', t);
    c.restore();
  }

  // 8. BABA YAGA — la grand-mère des bois
  function babaYaga(c, t) {
    c.save(); c.translate(0, Math.sin(t * 1.6) * 10 - 40);
    c.save(); c.translate(-290, -110); c.scale(.42, .42);
    c.strokeStyle = '#d6b36a'; c.lineWidth = 22; c.lineCap = 'round'; const pa = Math.sin(t * 2) * 30;
    [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 70, -300); c.lineTo(g * 110 + pa * g, -150); c.lineTo(g * 70, 0); c.stroke(); c.lineWidth = 10; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(g * 70, 0); c.lineTo(g * 70 + i * 40, 20); c.stroke(); } c.lineWidth = 22; });
    c.fillStyle = '#4b3524'; c.fillRect(-180, -560, 360, 270); c.strokeStyle = '#2f2014'; c.lineWidth = 8; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(-180, -560 + i * 45); c.lineTo(180, -560 + i * 45); c.stroke(); }
    c.fillStyle = '#3a2a1c'; P(c, [[-220, -540], [0, -720], [220, -540]]); c.fill(); lueur(c, '#ffb04a', 30, () => { c.fillStyle = '#ffc56a'; c.fillRect(-50, -480, 100, 90); }); c.restore();
    c.fillStyle = '#5c4430'; c.beginPath(); c.moveTo(-170, -330); c.lineTo(170, -330); c.lineTo(130, -20); c.quadraticCurveTo(0, 20, -130, -20); c.closePath(); c.fill();
    c.strokeStyle = '#3e2c1d'; c.lineWidth = 6; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-160 + i * 6, -260 + i * 55); c.lineTo(160 - i * 6, -260 + i * 55); c.stroke(); }
    c.fillStyle = '#73573c'; ell(c, 0, -330, 170, 34); c.fill(); c.fillStyle = '#2a1e14'; ell(c, 0, -330, 150, 24); c.fill();
    c.fillStyle = 'rgba(200,200,190,.35)'; for (let i = 0; i < 5; i++) { const k = (t * .6 + i / 5) % 1; c.globalAlpha = (1 - k) * .6; ell(c, -100 + i * 50, 20 + k * 40, 30 + k * 30, 14); c.fill(); } c.globalAlpha = 1;
    c.strokeStyle = '#8a6a42'; c.lineWidth = 16; c.beginPath(); c.moveTo(150, -620); c.lineTo(230, -60); c.stroke();
    c.fillStyle = '#8a6a42'; ell(c, 235, -50, 26, 34, -.15); c.fill();
    c.fillStyle = '#5a2e2a'; c.beginPath(); c.moveTo(-110, -340); c.quadraticCurveTo(-140, -560, -60, -640); c.lineTo(80, -660); c.quadraticCurveTo(150, -560, 110, -340); c.fill();
    c.fillStyle = '#7a3b2c'; P(c, [[-120, -640], [120, -660], [70, -470], [0, -440], [-80, -470]]); c.fill();
    c.fillStyle = '#c9a24a'; for (let i = 0; i < 8; i++) { ell(c, -90 + i * 25, -560 + (i % 2) * 20, 6, 6); c.fill(); }
    c.fillStyle = '#9f8d7a'; ell(c, 150, -620, 22, 22); c.fill();
    c.strokeStyle = '#5a2e2a'; c.lineWidth = 30; c.lineCap = 'round'; c.beginPath(); c.moveTo(70, -620); c.quadraticCurveTo(130, -560, 150, -620); c.stroke();
    c.save(); c.translate(-30, -720);
    c.fillStyle = '#b3a28c'; c.beginPath(); c.moveTo(-55, -40); c.quadraticCurveTo(-60, 60, -10, 80); c.quadraticCurveTo(40, 80, 50, 30); c.quadraticCurveTo(60, -40, -55, -40); c.fill();
    c.beginPath(); c.moveTo(40, -10); c.quadraticCurveTo(110, 20, 96, 46); c.quadraticCurveTo(70, 40, 40, 30); c.fill();
    c.fillStyle = '#8f2b2b'; c.beginPath(); c.moveTo(-90, 30); c.quadraticCurveTo(-100, -110, 10, -110); c.quadraticCurveTo(100, -100, 80, -10); c.lineTo(50, -20); c.quadraticCurveTo(40, -70, -10, -66); c.quadraticCurveTo(-60, -60, -55, 20); c.closePath(); c.fill();
    c.fillStyle = '#d8c7a8'; for (let i = 0; i < 4; i++) { ell(c, -40 + i * 30, -90 + (i % 2) * 6, 7, 7); c.fill(); }
    c.fillStyle = '#e5ddd0'; c.strokeStyle = '#e5ddd0'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-50, -20 + i * 6); c.lineTo(-80 - i * 4, 20 + i * 14); c.stroke(); }
    c.fillStyle = '#fff6c9'; lueur(c, '#e8ff7a', 20, () => { ell(c, 10, -5, 9, 6); c.fill(); });
    c.fillStyle = '#111'; ell(c, 12, -5, 3, 4); c.fill();
    c.strokeStyle = '#4a3b2c'; c.lineWidth = 4; c.beginPath(); c.moveTo(-6, -22); c.lineTo(24, -16); c.stroke();
    c.fillStyle = '#2a1e18'; c.beginPath(); c.moveTo(0, 42); c.quadraticCurveTo(30, 62, 56, 44); c.lineTo(50, 54); c.quadraticCurveTo(28, 70, 4, 52); c.fill();
    c.fillStyle = '#9aa1a8'; for (let i = 0; i < 4; i++) c.fillRect(10 + i * 11, 44, 7, 9);
    c.restore();
    c.save(); c.translate(-150, -400); c.rotate(-.25); c.strokeStyle = '#7a5a36'; c.lineWidth = 10; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 360); c.stroke();
    c.strokeStyle = '#b89a5e'; c.lineWidth = 4; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(0, 340); c.lineTo(i * 9, 440); c.stroke(); } c.restore();
    c.restore();
  }

  // 9. KAPPA — le lutteur des rivières
  function kappa(c, t) {
    const vert = '#4f8a4a', fonce = '#2f5a30', ventre = '#c9c27a'; ombre(c, 180); const b = Math.sin(t * 2.5) * 5;
    c.strokeStyle = 'rgba(160,210,220,.4)'; c.lineWidth = 3; for (let i = 1; i <= 2; i++) { const k = (t * .6 + i / 2) % 1; c.globalAlpha = 1 - k; ell(c, 0, 0, 100 + k * 140, 14 + k * 20); c.stroke(); } c.globalAlpha = 1;
    c.fillStyle = vert; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 30, -230); c.quadraticCurveTo(g * 110, -170, g * 90, -60); c.lineTo(g * 70, -10); c.lineTo(g * 40, -60); c.quadraticCurveTo(g * 50, -150, g * 10, -200); c.fill();
      c.fillStyle = fonce; for (let i = -1; i <= 1; i++) { P(c, [[g * 70, -10], [g * (80 + i * 26), 4], [g * (70 + i * 18), -20]]); c.fill(); } c.fillStyle = vert; });
    c.fillStyle = '#5d4a2a'; ell(c, 0, -390, 150, 190); c.fill();
    c.strokeStyle = '#3c2f1a'; c.lineWidth = 6; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-140, -460 + i * 80); c.lineTo(140, -460 + i * 80); c.stroke(); } c.beginPath(); c.moveTo(-50, -570); c.lineTo(-60, -210); c.moveTo(50, -570); c.lineTo(60, -210); c.stroke();
    c.fillStyle = vert; ell(c, 0, -380, 110, 170); c.fill();
    c.fillStyle = ventre; ell(c, 0, -360, 76, 130); c.fill(); c.strokeStyle = '#a69e5c'; c.lineWidth = 4; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-60, -440 + i * 40); c.quadraticCurveTo(0, -430 + i * 40, 60, -440 + i * 40); c.stroke(); }
    c.strokeStyle = vert; c.lineWidth = 26; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-100, -480); c.quadraticCurveTo(-180, -380, -150, -300); c.stroke();
    c.beginPath(); c.moveTo(100, -480); c.quadraticCurveTo(170, -430, 160, -360 + b); c.stroke();
    c.fillStyle = fonce; [[-150, -295], [162, -352 + b]].forEach(([x, y]) => { for (let i = -1; i <= 1; i++) { ell(c, x + i * 14, y + 14, 8, 18, i * .3); c.fill(); } });
    c.save(); c.translate(150, -330 + b); c.rotate(-.6); c.fillStyle = '#3f8a3a'; c.beginPath(); c.roundRect(-20, -100, 40, 170, 20); c.fill(); c.fillStyle = '#6ab35e'; for (let i = 0; i < 6; i++) { ell(c, -6 + (i % 2) * 12, -80 + i * 26, 4, 4); c.fill(); } c.restore();
    c.save(); c.translate(0, -600);
    c.fillStyle = vert; ell(c, 0, 0, 92, 80); c.fill();
    c.fillStyle = '#d0b35a'; c.beginPath(); c.moveTo(-40, 20); c.quadraticCurveTo(0, 80, 40, 20); c.quadraticCurveTo(0, 40, -40, 20); c.fill();
    c.strokeStyle = '#8a7130'; c.lineWidth = 3; c.beginPath(); c.moveTo(-36, 24); c.quadraticCurveTo(0, 46, 36, 24); c.stroke();
    c.fillStyle = '#fff'; ell(c, -34, -10, 20, 22); c.fill(); ell(c, 34, -10, 20, 22); c.fill();
    c.fillStyle = '#1a1a10'; ell(c, -30, -6, 9, 13); c.fill(); ell(c, 30, -6, 9, 13); c.fill();
    c.fillStyle = '#1c2a1a'; for (let i = 0; i < 16; i++) { const a = Math.PI + i / 15 * Math.PI; P(c, [[Math.cos(a) * 80, -40 + Math.sin(a) * 50], [Math.cos(a) * 104, -36 + Math.sin(a) * 64 + 10], [Math.cos(a + .1) * 80, -40 + Math.sin(a + .1) * 50]]); c.fill(); }
    c.fillStyle = '#d9dcd2'; ell(c, 0, -60, 66, 22); c.fill(); c.fillStyle = '#a7aca0'; ell(c, 0, -64, 56, 15); c.fill();
    c.fillStyle = 'rgba(120,190,230,.9)'; ell(c, 0, -64 + Math.sin(t * 3) * 1.5, 50, 11); c.fill();
    c.fillStyle = 'rgba(255,255,255,.7)'; ell(c, -18, -67, 12, 3); c.fill();
    c.restore();
  }

  // 10. GOLEM — le gardien d'argile
  function golem(c, t) {
    const ar = '#9a5f3c', fonce = '#6c3f25', clair = '#b97c55'; ombre(c, 280); const p = Math.sin(t * 1.4) * 4;
    c.fillStyle = fonce; c.beginPath(); c.roundRect(-110, -330, 90, 330, 30); c.fill(); c.beginPath(); c.roundRect(20, -330, 90, 330, 30); c.fill();
    c.fillStyle = ar; c.beginPath(); c.moveTo(-170, -760); c.quadraticCurveTo(-210, -500, -150, -300); c.lineTo(150, -300); c.quadraticCurveTo(210, -500, 170, -760); c.quadraticCurveTo(0, -800, -170, -760); c.fill();
    c.fillStyle = clair; c.beginPath(); c.moveTo(-120, -740); c.quadraticCurveTo(-140, -560, -100, -420); c.lineTo(-60, -420); c.quadraticCurveTo(-90, -560, -70, -740); c.fill();
    c.strokeStyle = '#4e2b18'; c.lineWidth = 4; [[-80, -700, -40, -620, -60, -560], [60, -680, 90, -600, 70, -520], [-20, -500, 20, -450, 0, -380], [110, -460, 140, -400, 120, -340]].forEach(([a, b, d, e, f, g]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.lineTo(f, g); c.stroke(); });
    c.fillStyle = 'rgba(70,35,20,.35)'; for (let i = 0; i < 14; i++) { ell(c, -140 + (i * 71) % 280, -720 + (i * 97) % 400, 10, 6, i); c.fill(); }
    c.fillStyle = ar; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 160, -740); c.quadraticCurveTo(g * 290, -620, g * 260, -380 + p * g); c.lineTo(g * 190, -380 + p * g); c.quadraticCurveTo(g * 200, -600, g * 120, -700); c.fill();
      c.fillStyle = fonce; c.beginPath(); c.roundRect(g * 225 - 50, -400 + p * g, 100, 110, 30); c.fill(); for (let i = 0; i < 4; i++) { c.beginPath(); c.roundRect(g * 225 - 48 + i * 25, -300 + p * g, 22, 50, 10); c.fill(); } c.fillStyle = ar; });
    c.fillStyle = ar; c.beginPath(); c.roundRect(-75, -920, 150, 170, 40); c.fill();
    c.fillStyle = fonce; c.fillRect(-75, -800, 150, 12);
    c.fillStyle = '#2b170c'; ell(c, -32, -840, 16, 12); c.fill(); ell(c, 32, -840, 16, 12); c.fill();
    lueur(c, '#ffd27a', 18, () => { c.fillStyle = '#ffd27a'; ell(c, -32, -840, 5, 4); c.fill(); ell(c, 32, -840, 5, 4); c.fill(); });
    c.strokeStyle = '#2b170c'; c.lineWidth = 5; c.beginPath(); c.moveTo(-26, -775); c.lineTo(26, -775); c.stroke();
    lueur(c, '#ffcf6b', 25 + Math.sin(t * 3) * 10, () => { c.fillStyle = '#ffe2a0'; c.font = 'bold 44px "DejaVu Sans", serif'; c.textAlign = 'center'; c.fillText('אמת', 0, -872); });
  }

  // 11. WENDIGO — la faim qui marche
  function wendigo(c, t) {
    const peau = '#7d7a76', fonce = '#4c4a47', os = '#e9e2d0', b = Math.sin(t * 1.6) * 6; ombre(c, 220);
    c.strokeStyle = fonce; c.lineWidth = 22; c.lineCap = 'round';
    [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 40, -400); c.lineTo(g * 60, -200); c.lineTo(g * 40, -60); c.lineTo(g * 70, 0); c.stroke(); });
    c.fillStyle = '#3a2f26'; c.beginPath(); c.moveTo(-120, -800); c.lineTo(120, -800); for (let i = 0; i <= 10; i++) c.lineTo(140 - i * 28, -380 + (i % 2) * 60 + Math.sin(t * 2 + i) * 6); c.closePath(); c.fill();
    c.fillStyle = peau; c.beginPath(); c.moveTo(-70, -760); c.quadraticCurveTo(-90, -560, -50, -400); c.lineTo(50, -400); c.quadraticCurveTo(90, -560, 70, -760); c.fill();
    c.strokeStyle = fonce; c.lineWidth = 6; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-60, -700 + i * 36); c.quadraticCurveTo(0, -684 + i * 36, 60, -700 + i * 36); c.stroke(); }
    c.beginPath(); c.moveTo(0, -740); c.lineTo(0, -420); c.stroke();
    c.strokeStyle = peau; c.lineWidth = 20;
    [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 75, -760); c.quadraticCurveTo(g * 170, -560, g * 160 - g * b, -250); c.stroke(); c.lineWidth = 7; c.strokeStyle = '#2b2622';
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(g * 160 - g * b, -250); c.quadraticCurveTo(g * (170 + i * 14), -180, g * (165 + i * 22) - g * b, -120); c.stroke(); } c.lineWidth = 20; c.strokeStyle = peau; });
    c.save(); c.translate(0, -840);
    c.strokeStyle = '#d6cdb6'; c.lineWidth = 13; c.lineCap = 'round';
    [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 36, -30); c.quadraticCurveTo(g * 120, -140, g * 110, -290); c.stroke(); c.lineWidth = 9;
      [[-110, 80, -170], [-190, 150, -230], [-250, 70, -320], [-150, 190, -150]].forEach(([y0, x1, y1]) => { c.beginPath(); c.moveTo(g * (110 + (y0 + 290) * -.05), y0); c.lineTo(g * x1, y1); c.stroke(); }); c.lineWidth = 13; });
    c.fillStyle = os; c.beginPath(); c.moveTo(-58, -40); c.quadraticCurveTo(0, -80, 58, -40); c.lineTo(44, 40); c.lineTo(20, 120); c.quadraticCurveTo(0, 132, -20, 120); c.lineTo(-44, 40); c.closePath(); c.fill();
    c.fillStyle = '#0d0d0f'; ell(c, -26, 0, 17, 22, .2); c.fill(); ell(c, 26, 0, 17, 22, -.2); c.fill(); ell(c, -6, 92, 5, 10); c.fill(); ell(c, 6, 92, 5, 10); c.fill();
    yeux(c, 0, 2, 26, 4, '#c8f6ff', t);
    c.fillStyle = '#0d0d0f'; for (let i = -2; i <= 2; i++) c.fillRect(i * 8 - 2, 112, 4, 14);
    c.restore();
  }

  G.BESTIAIRE_ART = {
    vampire: { dessin: vampire, fond: ['#1a0d14', '#3a1a24'], hauteur: 920 },
    banshee: { dessin: banshee, fond: ['#0f1b1d', '#2f4a48'], hauteur: 900 },
    llorona: { dessin: llorona, fond: ['#0b1424', '#22395a'], hauteur: 830 },
    gevaudan: { dessin: gevaudan, fond: ['#1a1410', '#4a3a24'], hauteur: 720, large: true, dx: -30 },
    kuchisake: { dessin: kuchisake, fond: ['#0f0f1a', '#3a2440'], hauteur: 860 },
    jersey_devil: { dessin: jersey, fond: ['#101410', '#2f3a24'], hauteur: 960 },
    krampus: { dessin: krampus, fond: ['#0e1420', '#30425a'], hauteur: 1020 },
    baba_yaga: { dessin: babaYaga, fond: ['#10180f', '#33452a'], hauteur: 860 },
    kappa: { dessin: kappa, fond: ['#0d1a1c', '#2a4f4c'], hauteur: 720 },
    golem: { dessin: golem, fond: ['#1a120c', '#4a3020'], hauteur: 940 },
    wendigo: { dessin: wendigo, fond: ['#0c1220', '#2c3a52'], hauteur: 1140 },
  };
})(window);
