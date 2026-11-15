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

  // VAMPIRE — le Comte qui compte
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

  // KUCHISAKE-ONNA — la femme au masque
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

  // KRAMPUS — le punisseur de décembre
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

  // WENDIGO — la faim qui marche
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

  // SKINWALKER — le changeur de peau (notre design : peau de coyote, jambes d'animal, visage humain « presque » juste)
  function skinwalker(c, t) {
    const b = Math.sin(t * 1.8) * 5, peau = '#bcae9b', pelage = '#6b5a48', pf = '#4a3d30'; ombre(c, 220);
    c.strokeStyle = '#8e7f6c'; c.lineCap = 'round'; c.lineJoin = 'round';
    [-1, 1].forEach(g => { c.lineWidth = 34; c.beginPath(); c.moveTo(g * 45, -430); c.lineTo(g * 85, -250); c.stroke(); c.lineWidth = 22; c.beginPath(); c.moveTo(g * 85, -250); c.lineTo(g * 45, -100); c.lineTo(g * 75, -6); c.stroke();
      c.fillStyle = '#3a3128'; for (let i = -1; i <= 1; i++) { P(c, [[g * 75 + i * 14, -8], [g * 75 + i * 18 + g * 10, 8], [g * 75 + i * 14 + 6, -10]]); c.fill(); } });
    c.fillStyle = pelage; c.beginPath(); c.moveTo(-110, -760); c.quadraticCurveTo(-170, -560, -150, -330);
    fourrure(c, -150, -330, 150, -330, 16, 46).forEach(p => c.lineTo(p[0], p[1])); c.quadraticCurveTo(170, -560, 110, -760); c.closePath(); c.fill();
    c.fillStyle = peau; c.beginPath(); c.moveTo(-70, -740); c.quadraticCurveTo(-85, -560, -55, -420); c.lineTo(55, -420); c.quadraticCurveTo(85, -560, 70, -740); c.fill();
    c.strokeStyle = '#8f8270'; c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-55, -690 + i * 34); c.quadraticCurveTo(0, -676 + i * 34, 55, -690 + i * 34); c.stroke(); }
    c.strokeStyle = peau; c.lineWidth = 18; c.beginPath(); c.moveTo(-75, -730); c.quadraticCurveTo(-140, -520, -120, -300 + b); c.stroke();
    c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-120, -300 + b); c.lineTo(-130 + i * 8, -230 + b - (i % 2) * 8); c.stroke(); }
    c.strokeStyle = pf; c.lineWidth = 32; c.beginPath(); c.moveTo(80, -730); c.quadraticCurveTo(160, -560, 150, -360 - b); c.stroke();
    c.strokeStyle = '#e8dcc0'; c.lineWidth = 6; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(150 + i * 10, -350 - b); c.quadraticCurveTo(160 + i * 16, -310 - b, 150 + i * 20, -290 - b); c.stroke(); }
    c.save(); c.translate(0, -800);
    c.fillStyle = '#c9bca8'; c.beginPath(); c.moveTo(-48, -40); c.quadraticCurveTo(-58, 40, -20, 76); c.quadraticCurveTo(0, 86, 20, 76); c.quadraticCurveTo(58, 40, 48, -40); c.fill();
    c.fillStyle = '#fff'; ell(c, -20, 2, 13, 9); c.fill(); ell(c, 22, -6, 13, 9); c.fill();
    lueur(c, '#9dff8a', 18, () => { c.fillStyle = '#b8ff9e'; ell(c, -20, 2, 5, 6); c.fill(); ell(c, 22, -6, 5, 6); c.fill(); });
    c.fillStyle = '#3a1414'; c.beginPath(); c.moveTo(-36, 40); c.quadraticCurveTo(0, 64, 38, 36); c.quadraticCurveTo(0, 52, -36, 40); c.fill();
    c.fillStyle = '#f2ead8'; for (let i = 0; i < 9; i++) c.fillRect(-30 + i * 7, 42 + Math.sin(i / 8 * Math.PI) * 6, 4, 6);
    c.fillStyle = pelage; c.beginPath(); c.moveTo(-70, 40); c.quadraticCurveTo(-90, -70, -20, -96); c.lineTo(120, -150); c.quadraticCurveTo(150, -130, 130, -110); c.lineTo(40, -70); c.quadraticCurveTo(90, -20, 70, 40); c.quadraticCurveTo(60, -40, 0, -50); c.quadraticCurveTo(-60, -40, -70, 40); c.fill();
    c.fillStyle = pf; P(c, [[-50, -86], [-40, -170], [-10, -100]]); c.fill(); P(c, [[0, -104], [20, -180], [34, -110]]); c.fill();
    c.fillStyle = '#16110c'; ell(c, 40, -110, 9, 6, -.4); c.fill(); ell(c, 130, -132, 9, 7); c.fill();
    c.fillStyle = '#e9e0cc'; for (let i = 0; i < 5; i++) { P(c, [[60 + i * 14, -96 + i * -4], [66 + i * 14, -98 - i * 4], [64 + i * 14, -84 - i * 4]]); c.fill(); }
    c.restore();
  }

  // MOTHMAN — le messager (notre design : un vrai papillon de nuit géant, ailes à ocelles)
  function mothman(c, t) {
    const f = Math.sin(t * 2.6) * .1; ombre(c, 160);
    const aile = (g, haut) => { c.save(); c.translate(g * 30, haut ? -700 : -560); c.scale(g, 1); c.rotate(haut ? -.15 - f : .1 + f * .6);
      const gr = c.createLinearGradient(0, 0, 420, 0); gr.addColorStop(0, '#5c5246'); gr.addColorStop(1, '#8a7d69'); c.fillStyle = gr;
      c.beginPath(); if (haut) { c.moveTo(0, 0); c.bezierCurveTo(120, -260, 380, -300, 460, -160); c.bezierCurveTo(440, -40, 260, 40, 0, 40); }
      else { c.moveTo(0, 0); c.bezierCurveTo(140, -40, 340, 20, 330, 160); c.bezierCurveTo(260, 260, 100, 200, 0, 60); } c.fill();
      c.strokeStyle = 'rgba(40,32,24,.6)'; c.lineWidth = 6; c.beginPath(); if (haut) { c.moveTo(60, -40); c.quadraticCurveTo(240, -200, 420, -150); c.moveTo(80, 10); c.quadraticCurveTo(260, -40, 420, -100); } else { c.moveTo(40, 30); c.quadraticCurveTo(200, 60, 300, 150); } c.stroke();
      c.fillStyle = 'rgba(230,220,200,.5)'; c.beginPath(); if (haut) { c.moveTo(380, -230); c.quadraticCurveTo(440, -200, 450, -160); c.lineTo(400, -180); } c.fill();
      const [ox, oy, r] = haut ? [260, -120, 62] : [210, 110, 44];
      c.fillStyle = '#e6dcc4'; ell(c, ox, oy, r, r * .9); c.fill(); c.fillStyle = '#1a120c'; ell(c, ox, oy, r * .72, r * .65); c.fill();
      lueur(c, '#ff3a2a', 16, () => { c.fillStyle = '#b3201a'; ell(c, ox, oy, r * .42, r * .38); c.fill(); });
      c.fillStyle = '#fff'; ell(c, ox - r * .15, oy - r * .15, r * .1, r * .1); c.fill(); c.restore(); };
    [-1, 1].forEach(g => aile(g, false)); [-1, 1].forEach(g => aile(g, true));
    c.strokeStyle = '#2a231c'; c.lineWidth = 9; c.lineCap = 'round';
    [-1, 1].forEach(g => { [[-430, 160, -230, 120, 0], [-380, 120, -200, 150, 0]].forEach(([y0, x1, y1, x2]) => { c.beginPath(); c.moveTo(g * 40, y0); c.lineTo(g * x1, y1); c.lineTo(g * x2, 0); c.stroke(); }); });
    c.fillStyle = '#9b8e78'; c.beginPath(); c.moveTo(-60, -520); c.quadraticCurveTo(-70, -350, 0, -260); c.quadraticCurveTo(70, -350, 60, -520); c.fill();
    c.strokeStyle = '#6e6352'; c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-56 + i * 6, -500 + i * 45); c.quadraticCurveTo(0, -488 + i * 45, 56 - i * 6, -500 + i * 45); c.stroke(); }
    c.fillStyle = '#d8ccb4'; ell(c, 0, -620, 92, 120); c.fill();
    c.fillStyle = '#c3b69c'; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU; ell(c, Math.cos(a) * 88, -620 + Math.sin(a) * 114, 16, 10, a); c.fill(); }
    c.strokeStyle = '#d8ccb4'; c.lineWidth = 16; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 70, -680); c.quadraticCurveTo(g * 150, -620, g * 130, -520 + Math.sin(t * 2) * 6); c.stroke(); c.lineWidth = 5; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(g * 130, -520); c.lineTo(g * (130 + i * 10), -480); c.stroke(); } c.lineWidth = 16; });
    c.save(); c.translate(0, -790);
    c.fillStyle = '#cabda4'; ell(c, 0, 0, 70, 62); c.fill();
    lueur(c, '#ff2a1a', 40, () => { c.fillStyle = '#c4161a'; ell(c, -38, -6, 40, 46, -.2); c.fill(); ell(c, 38, -6, 40, 46, .2); c.fill(); });
    c.fillStyle = 'rgba(255,140,120,.35)'; for (let i = 0; i < 18; i++) { const x = (i % 6) * 12 - 30, y = Math.floor(i / 6) * 14 - 18; ell(c, -38 + x * .5, y, 3, 3); c.fill(); ell(c, 38 + x * .5, y, 3, 3); c.fill(); }
    c.strokeStyle = '#6e604c'; c.lineWidth = 5; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 18, -50); c.quadraticCurveTo(g * 70, -170, g * 150, -200 + Math.sin(t * 3 + g) * 8); c.stroke(); c.lineWidth = 3;
      for (let i = 1; i < 12; i++) { const k = i / 12, x = g * (18 + (150 - 18) * k), y = -50 - 150 * k + k * k * 0; c.beginPath(); c.moveTo(x, y - k * 0); c.lineTo(x + g * 14, y - 16); c.moveTo(x, y); c.lineTo(x - g * 6, y - 18); c.stroke(); } c.lineWidth = 5; });
    c.restore();
  }

  // THE RAKE — accroupi au pied du lit, tête basse, griffes en râteau
  function rake(c, t) {
    const peau = '#cfd3cb', ombreP = '#9ea39a', b = Math.sin(t * 1.5) * 5; ombre(c, 300);
    c.lineCap = 'round'; c.lineJoin = 'round';
    [-1, 1].forEach(g => { c.strokeStyle = ombreP; c.lineWidth = 20; c.beginPath(); c.moveTo(g * 50, -250); c.lineTo(g * 200, -330); c.lineTo(g * 230, -10); c.stroke();
      c.strokeStyle = '#2b2d29'; c.lineWidth = 5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(g * 230, -10); c.lineTo(g * (215 + i * 18), 4); c.stroke(); } });
    c.fillStyle = peau; c.beginPath(); c.moveTo(-50, -240); c.lineTo(50, -240); c.quadraticCurveTo(110, -380, 130, -470); c.quadraticCurveTo(0, -520, -130, -470); c.quadraticCurveTo(-110, -380, -50, -240); c.fill();
    c.strokeStyle = ombreP; c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-90 + i * 8, -440 + i * 36); c.quadraticCurveTo(0, -420 + i * 36, 90 - i * 8, -440 + i * 36); c.stroke(); }
    c.fillStyle = ombreP; for (let i = 0; i < 6; i++) { ell(c, 0, -480 + i * 40, 7, 9); c.fill(); }
    [-1, 1].forEach(g => { c.strokeStyle = peau; c.lineWidth = 16; c.beginPath(); c.moveTo(g * 120, -460); c.quadraticCurveTo(g * 200, -300, g * 120 + b * g, -30); c.stroke();
      c.strokeStyle = '#d9ddd5'; c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(g * 120 + b * g, -30); c.quadraticCurveTo(g * (110 + i * 18), 10, g * (50 + i * 30), 20 + (i % 2) * 6); c.stroke(); }
      c.strokeStyle = '#1b1c1a'; c.lineWidth = 4; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(g * (50 + i * 30), 20 + (i % 2) * 6); c.lineTo(g * (34 + i * 30), 30 + (i % 2) * 6); c.stroke(); } });
    c.save(); c.translate(0, -540 + Math.sin(t * .8) * 4); c.rotate(.18 + Math.sin(t * .5) * .08);
    c.fillStyle = peau; c.beginPath(); c.moveTo(-52, -40); c.quadraticCurveTo(-60, 60, -20, 100); c.quadraticCurveTo(0, 110, 20, 100); c.quadraticCurveTo(60, 60, 52, -40); c.quadraticCurveTo(0, -80, -52, -40); c.fill();
    c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, 0, -20, 50, 20); c.fill();
    c.fillStyle = '#030303'; ell(c, -22, 8, 16, 21, .25); c.fill(); ell(c, 22, 8, 16, 21, -.25); c.fill();
    lueur(c, '#ffffff', 8, () => { c.fillStyle = '#fff'; ell(c, -20, 6, 2.5, 2.5); c.fill(); ell(c, 24, 6, 2.5, 2.5); c.fill(); });
    c.fillStyle = '#120a0a'; ell(c, 0, 66, 26, 22 + Math.sin(t * 2) * 4); c.fill();
    c.fillStyle = '#e6e2d6'; for (let i = 0; i < 6; i++) { P(c, [[-20 + i * 8, 48], [-16 + i * 8, 48], [-18 + i * 8, 58]]); c.fill(); P(c, [[-18 + i * 7, 86], [-14 + i * 7, 86], [-16 + i * 7, 76]]); c.fill(); }
    c.restore();
  }

  // HASSHAKU-SAMA — la femme de 2,40 m au chapeau blanc
  function hasshaku(c, t) {
    const v = Math.sin(t * 1.2) * 10; ombre(c, 170);
    c.strokeStyle = '#e4dcd2'; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(-34, -300); c.lineTo(-40, 0); c.moveTo(34, -300); c.lineTo(42, 0); c.stroke();
    c.fillStyle = '#060608'; c.beginPath(); c.moveTo(-80, -1240); c.quadraticCurveTo(-140, -1000, -120 + v, -820); c.lineTo(120 + v, -820); c.quadraticCurveTo(140, -1000, 80, -1240); c.fill();
    c.fillStyle = '#f4f2ee'; c.beginPath(); c.moveTo(-70, -1180); c.lineTo(70, -1180); c.quadraticCurveTo(120, -700, 210 + v, -290); for (let i = 0; i <= 8; i++) c.lineTo(210 + v - i * 52.5, -290 + (i % 2) * 18); c.quadraticCurveTo(-120, -700, -70, -1180); c.fill();
    c.fillStyle = 'rgba(160,170,190,.25)'; c.beginPath(); c.moveTo(20, -1100); c.quadraticCurveTo(60, -700, 140 + v, -300); c.lineTo(60 + v, -300); c.quadraticCurveTo(30, -700, 0, -1100); c.fill();
    c.strokeStyle = '#e4dcd2'; c.lineWidth = 14; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 72, -1160); c.quadraticCurveTo(g * 120, -900, g * 110 + v * .3, -640); c.stroke(); c.lineWidth = 4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(g * 110, -640); c.lineTo(g * (104 + i * 6), -590); c.stroke(); } c.lineWidth = 14; });
    c.fillStyle = '#e4dcd2'; c.fillRect(-14, -1240, 28, 60);
    c.fillStyle = '#e8e2da'; ell(c, 0, -1300, 46, 60); c.fill();
    c.fillStyle = '#060608'; c.beginPath(); c.moveTo(-50, -1320); c.quadraticCurveTo(-60, -1200, -40, -1150); c.lineTo(-30, -1300); c.fill(); c.beginPath(); c.moveTo(50, -1320); c.quadraticCurveTo(60, -1200, 40, -1150); c.lineTo(30, -1300); c.fill();
    c.fillStyle = 'rgba(0,0,0,.75)'; c.beginPath(); c.ellipse(0, -1320, 50, 30, 0, 0, Math.PI); c.fill();
    c.fillStyle = '#5a1015'; c.beginPath(); c.moveTo(-26, -1266); c.quadraticCurveTo(0, -1250, 26, -1266); c.quadraticCurveTo(0, -1258, -26, -1266); c.fill();
    lueur(c, '#ffffff', 12, () => { c.fillStyle = '#fff'; ell(c, 16, -1300, 3, 2); c.fill(); });
    c.fillStyle = '#fbfaf7'; ell(c, 0, -1352, 190, 34); c.fill(); c.beginPath(); c.moveTo(-70, -1356); c.quadraticCurveTo(-74, -1430, 0, -1432); c.quadraticCurveTo(74, -1430, 70, -1356); c.fill();
    c.fillStyle = '#d8d2c6'; c.fillRect(-72, -1378, 144, 18);
    c.fillStyle = 'rgba(255,255,255,.75)'; c.font = '60px "IPAGothic", sans-serif'; c.textAlign = 'center';
    ['ぽ', 'ぽ', 'ぽ'].forEach((p, i) => { const k = (t * .7 + i / 3) % 1; c.globalAlpha = Math.sin(k * Math.PI) * .9; c.fillText(p, 200 + i * 40, -1250 - k * 160); }); c.globalAlpha = 1;
  }

  // BLOODY MARY — dans le miroir
  function bloodyMary(c, t) {
    c.fillStyle = '#3a2a22'; c.fillRect(-320, -90, 640, 90); c.fillStyle = '#4e3a2e'; c.fillRect(-340, -110, 680, 30);
    c.save(); c.translate(-230, -110); c.fillStyle = '#e8dcc0'; c.fillRect(-18, -120, 36, 120);
    lueur(c, '#ffb347', 40, () => { c.fillStyle = '#ffcf6b'; c.beginPath(); c.moveTo(0, -190 + Math.sin(t * 12) * 4); c.quadraticCurveTo(18, -150, 0, -128); c.quadraticCurveTo(-18, -150, 0, -190 + Math.sin(t * 12) * 4); c.fill(); }); c.restore();
    c.save(); c.translate(0, -580);
    c.fillStyle = '#7a5a1e'; ell(c, 0, 0, 300, 420); c.fill(); c.fillStyle = '#b8892e'; ell(c, 0, 0, 282, 402); c.fill();
    c.fillStyle = '#5a4214'; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ell(c, Math.cos(a) * 291, Math.sin(a) * 411, 10, 10); c.fill(); }
    c.save(); ell(c, 0, 0, 255, 375); c.clip();
    const g = c.createRadialGradient(0, -40, 40, 0, 0, 400); g.addColorStop(0, '#2a1a1e'); g.addColorStop(1, '#07050a'); c.fillStyle = g; c.fillRect(-300, -420, 600, 840);
    const ap = .75 + Math.sin(t * 1.4) * .25; c.globalAlpha = ap;
    c.fillStyle = '#16090c'; c.beginPath(); c.moveTo(-200, 380); c.quadraticCurveTo(-170, 60, -60, 20); c.lineTo(60, 20); c.quadraticCurveTo(170, 60, 200, 380); c.fill();
    c.fillStyle = '#0a0406'; c.beginPath(); c.moveTo(-110, -60); c.quadraticCurveTo(-130, -260, 0, -270); c.quadraticCurveTo(130, -260, 110, -60); c.lineTo(150, 200); c.lineTo(-150, 200); c.closePath(); c.fill();
    c.fillStyle = '#d9d0c8'; c.beginPath(); c.moveTo(-62, -170); c.quadraticCurveTo(-68, -40, 0, -10); c.quadraticCurveTo(68, -40, 62, -170); c.quadraticCurveTo(0, -220, -62, -170); c.fill();
    c.fillStyle = '#0a0406'; P(c, [[-66, -180], [-10, -228], [60, -190], [20, -200], [-20, -160]]); c.fill();
    c.fillStyle = '#120608'; ell(c, -26, -120, 17, 13); c.fill(); ell(c, 26, -120, 17, 13); c.fill();
    lueur(c, '#ff1a2a', 20, () => { c.fillStyle = '#e0202e'; ell(c, -26, -120, 6, 6); c.fill(); ell(c, 26, -120, 6, 6); c.fill(); });
    c.strokeStyle = '#8a0f18'; c.lineWidth = 4; [-26, 26].forEach(x => { c.beginPath(); c.moveTo(x, -110); c.lineTo(x - 2, -60); c.stroke(); });
    c.fillStyle = '#2a0508'; ell(c, 0, -52, 14, 20); c.fill();
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(220,210,205,.9)'; [[-150, 40], [140, -10]].forEach(([x, y], i) => { c.save(); c.translate(x, y + Math.sin(t + i) * 3); ell(c, 0, 0, 38, 46); c.fill(); for (let k = 0; k < 4; k++) { c.beginPath(); c.roundRect(-34 + k * 18, -100, 14, 70, 7); c.fill(); } c.restore(); });
    c.fillStyle = 'rgba(150,10,20,.55)'; [[-150, 40], [140, -10]].forEach(([x, y]) => { for (let k = 0; k < 3; k++) { c.fillRect(x - 20 + k * 18, y + 40, 6, 40 + k * 22); } });
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.beginPath(); [[0, 0, 0], [80, -120, 0], [160, -260, 1], [0, 0, 0], [-120, 90, 0], [-230, 160, 1], [0, 0, 0], [60, 160, 0], [100, 330, 1], [0, 0, 0], [-90, -140, 0], [-140, -320, 1]].forEach(([x, y, e], i) => { if (x === 0 && y === 0) c.moveTo(30, -60); else c.lineTo(x + 30, y - 60); }); c.stroke();
    c.restore();
  }

  // TEKE TEKE — elle rampe sur les coudes le long des rails (sans gore : le bas du corps se perd dans l'ombre)
  function tekeTeke(c, t) {
    c.fillStyle = '#5a4a3c'; for (let i = -6; i <= 6; i++) c.fillRect(i * 70 - 22, -40, 44, 50);
    c.fillStyle = '#9aa0a6'; c.fillRect(-480, -40, 960, 10); c.fillRect(-480, -6, 960, 10);
    const m = Math.sin(t * 7), g2 = c.createRadialGradient(0, -60, 20, 0, -60, 260); g2.addColorStop(0, 'rgba(0,0,0,.85)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g2; ell(c, 0, -40, 280, 90); c.fill();
    c.save(); c.translate(0, Math.abs(m) * -10);
    c.fillStyle = '#e9e9ef'; c.beginPath(); c.moveTo(-110, -340); c.lineTo(110, -340); c.quadraticCurveTo(130, -200, 100, -110); c.lineTo(-100, -110); c.quadraticCurveTo(-130, -200, -110, -340); c.fill();
    const fondu = c.createLinearGradient(0, -200, 0, -90); fondu.addColorStop(0, 'rgba(8,8,12,0)'); fondu.addColorStop(1, 'rgba(8,8,12,1)'); c.fillStyle = fondu; c.fillRect(-140, -200, 280, 120);
    c.fillStyle = '#1e2b4a'; P(c, [[-110, -340], [110, -340], [130, -300], [40, -250], [0, -290], [-40, -250], [-130, -300]]); c.fill();
    c.strokeStyle = '#f2f2f2'; c.lineWidth = 4; c.beginPath(); c.moveTo(-118, -322); c.lineTo(-42, -262); c.moveTo(118, -322); c.lineTo(42, -262); c.stroke();
    c.fillStyle = '#c0242c'; P(c, [[-20, -280], [20, -280], [30, -220], [0, -240], [-30, -220]]); c.fill();
    c.strokeStyle = '#e9e9ef'; c.lineWidth = 34; c.lineCap = 'round';
    [-1, 1].forEach(g => { const a = g === 1 ? m : -m; c.beginPath(); c.moveTo(g * 100, -320); c.lineTo(g * (190 + a * 20), -150); c.stroke(); c.strokeStyle = '#e7d2c0'; c.lineWidth = 24; c.beginPath(); c.moveTo(g * (190 + a * 20), -150); c.lineTo(g * (120 + a * 30), -40); c.stroke();
      ell(c, g * (110 + a * 30), -30, 26, 16); c.fillStyle = '#e7d2c0'; c.fill(); c.strokeStyle = '#e9e9ef'; c.lineWidth = 34; });
    c.save(); c.translate(0, -400);
    c.fillStyle = '#070709'; c.beginPath(); c.moveTo(-80, 0); c.quadraticCurveTo(-90, -110, 0, -112); c.quadraticCurveTo(90, -110, 80, 0); c.lineTo(110, 220); c.lineTo(-110, 220); c.closePath(); c.fill();
    c.fillStyle = '#e7d8cc'; c.beginPath(); c.moveTo(-40, -50); c.quadraticCurveTo(-46, 40, 0, 60); c.quadraticCurveTo(46, 40, 40, -50); c.quadraticCurveTo(0, -70, -40, -50); c.fill();
    c.fillStyle = '#070709'; c.beginPath(); c.moveTo(-50, -60); c.lineTo(10, -70); c.lineTo(-6, 80); c.lineTo(-50, 60); c.fill();
    c.fillStyle = '#fff'; ell(c, 20, -6, 12, 14); c.fill(); c.fillStyle = '#111'; ell(c, 20, -4, 4, 5); c.fill();
    c.strokeStyle = '#4a1418'; c.lineWidth = 4; c.beginPath(); c.moveTo(-4, 34); c.quadraticCurveTo(16, 44, 36, 28); c.stroke();
    c.restore(); c.restore();
    c.fillStyle = 'rgba(255,255,255,.6)'; c.font = 'bold 40px "Inter", sans-serif'; c.textAlign = 'center'; const k = (t * 2) % 1;
    c.globalAlpha = 1 - k; c.fillText('teke…', -260, -120 - k * 40); c.fillText('teke…', 270, -90 - k * 40); c.globalAlpha = 1;
  }

  // ENFANTS AUX YEUX NOIRS — « on peut entrer ? »
  function enfants(c, t) {
    const enfant = (x, h, sweat, cheveux, main) => { c.save(); c.translate(x, 0); c.scale(h, h); ombre(c, 110);
      c.fillStyle = '#2b2e36'; c.fillRect(-40, -260, 34, 250); c.fillRect(6, -260, 34, 250); c.fillStyle = '#e9e9e9'; c.beginPath(); c.roundRect(-46, -20, 44, 20, 8); c.fill(); c.beginPath(); c.roundRect(4, -20, 44, 20, 8); c.fill();
      c.fillStyle = sweat; c.beginPath(); c.roundRect(-80, -560, 160, 320, 30); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-56, -360, 112, 60);
      c.fillStyle = sweat; c.beginPath(); c.moveTo(-70, -560); c.quadraticCurveTo(0, -520, 70, -560); c.lineTo(60, -600); c.lineTo(-60, -600); c.fill();
      c.strokeStyle = sweat; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(-74, -530); c.lineTo(-90, -300); c.stroke();
      if (main) { c.beginPath(); c.moveTo(74, -530); c.quadraticCurveTo(140, -560, 150, -660); c.stroke(); c.fillStyle = '#dcdcd6'; ell(c, 150, -690, 24, 28); c.fill(); }
      else { c.beginPath(); c.moveTo(74, -530); c.lineTo(100, -300); c.stroke(); c.fillStyle = '#dcdcd6'; ell(c, 100, -280, 20, 22); c.fill(); }
      c.fillStyle = '#dcdcd6'; ell(c, -90, -280, 20, 22); c.fill(); c.fillRect(-18, -630, 36, 40);
      c.fillStyle = '#dcdcd6'; ell(c, 0, -720, 82, 96); c.fill();
      c.fillStyle = cheveux; c.beginPath(); c.moveTo(-86, -720); c.quadraticCurveTo(-90, -830, 0, -830); c.quadraticCurveTo(90, -830, 86, -720); c.lineTo(70, -770); c.lineTo(30, -750); c.lineTo(-20, -770); c.lineTo(-70, -750); c.closePath(); c.fill();
      c.fillStyle = '#020203'; ell(c, -32, -712, 22, 20); c.fill(); ell(c, 32, -712, 22, 20); c.fill();
      c.fillStyle = 'rgba(255,255,255,.6)'; ell(c, -38, -718, 4, 3); c.fill(); ell(c, 26, -718, 4, 3); c.fill();
      c.strokeStyle = '#7a6e6a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-16, -650); c.lineTo(16, -650); c.stroke();
      c.fillStyle = 'rgba(80,70,90,.25)'; ell(c, -32, -690, 24, 8); c.fill(); ell(c, 32, -690, 24, 8); c.fill(); c.restore(); };
    enfant(-130, .95, '#3d4a3a', '#2a1d14', false); enfant(130, 1.05, '#4a3a4e', '#16110e', true);
  }

  // LOUP-GAROU — la bête de la pleine lune (chemise déchirée, debout)
  function loupGarou(c, t) {
    const poil = '#6a6058', fonce = '#3e3832', b = Math.sin(t * 2) * 6; ombre(c, 260);
    c.strokeStyle = poil; c.lineCap = 'round'; c.lineJoin = 'round';
    [-1, 1].forEach(g => { c.lineWidth = 50; c.beginPath(); c.moveTo(g * 60, -460); c.lineTo(g * 110, -260); c.stroke(); c.lineWidth = 32; c.beginPath(); c.moveTo(g * 110, -260); c.lineTo(g * 60, -110); c.lineTo(g * 100, -10); c.stroke();
      c.fillStyle = '#e8dcc0'; for (let i = -1; i <= 1; i++) { P(c, [[g * 100 + i * 16, -6], [g * 100 + i * 20 + g * 12, 10], [g * 100 + i * 16 + 6, -14]]); c.fill(); } });
    c.fillStyle = '#2f3a52'; c.beginPath(); c.moveTo(-95, -500); c.lineTo(95, -500); c.lineTo(120, -380); fourrure(c, 120, -380, -120, -380, 10, 40).forEach(p => c.lineTo(p[0], p[1])); c.closePath(); c.fill();
    c.fillStyle = poil; c.beginPath(); c.moveTo(-150, -860); c.quadraticCurveTo(-200, -640, -100, -480); c.lineTo(100, -480); c.quadraticCurveTo(200, -640, 150, -860); c.quadraticCurveTo(0, -920, -150, -860); c.fill();
    c.fillStyle = '#8a3a2c'; c.beginPath(); c.moveTo(-150, -830); c.lineTo(-60, -860); c.lineTo(-80, -700); c.lineTo(-130, -640); c.lineTo(-170, -720); c.fill();
    c.beginPath(); c.moveTo(150, -830); c.lineTo(80, -860); c.lineTo(110, -760); c.lineTo(90, -620); c.lineTo(160, -680); c.fill();
    c.strokeStyle = '#5e2418'; c.lineWidth = 4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-160 + i * 25, -830 + i * 4); c.lineTo(-150 + i * 22, -690); c.stroke(); }
    c.fillStyle = '#8e857a'; c.beginPath(); c.moveTo(-60, -820); c.quadraticCurveTo(0, -800, 60, -820); c.quadraticCurveTo(70, -620, 0, -540); c.quadraticCurveTo(-70, -620, -60, -820); c.fill();
    c.strokeStyle = fonce; c.lineWidth = 5; for (let i = 0; i < 20; i++) { const x = -130 + (i * 47) % 260, y = -840 + (i * 61) % 330; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4, y + 22); c.stroke(); }
    c.strokeStyle = poil; [-1, 1].forEach(g => { c.lineWidth = 42; c.beginPath(); c.moveTo(g * 150, -830); c.quadraticCurveTo(g * 250, -620, g * 220, -400 + b * g); c.stroke();
      c.strokeStyle = '#efe6d2'; c.lineWidth = 8; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(g * 220 + i * 10, -390 + b * g); c.quadraticCurveTo(g * (230 + i * 8), -340 + b * g, g * (222 + i * 14), -310 + b * g); c.stroke(); } c.strokeStyle = poil; });
    c.save(); c.translate(0, -930);
    c.fillStyle = poil; P(c, fourrure(c, -120, 40, 120, 40, 12, 40), false); c.lineTo(0, 140); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-80, 40); c.quadraticCurveTo(-100, -70, 0, -80); c.quadraticCurveTo(100, -70, 80, 40); c.quadraticCurveTo(0, 70, -80, 40); c.fill();
    c.fillStyle = fonce; [-1, 1].forEach(g => { P(c, [[g * 30, -70], [g * 90, -170], [g * 85, -50]]); c.fill(); }); c.fillStyle = '#b07a6a'; [-1, 1].forEach(g => { P(c, [[g * 46, -70], [g * 82, -140], [g * 78, -66]]); c.fill(); });
    c.fillStyle = '#8e857a'; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-30, 110); c.quadraticCurveTo(0, 130, 30, 110); c.lineTo(40, 0); c.fill();
    c.fillStyle = '#141110'; ell(c, 0, 108, 22, 14); c.fill();
    c.fillStyle = '#3a0e10'; c.beginPath(); c.moveTo(-36, 80); c.quadraticCurveTo(0, 150 + b, 36, 80); c.fill();
    c.fillStyle = '#f2ead6'; for (let i = 0; i < 6; i++) { P(c, [[-30 + i * 12, 82], [-24 + i * 12, 82], [-27 + i * 12, 100]]); c.fill(); }
    c.strokeStyle = fonce; c.lineWidth = 6; [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 56, -24); c.lineTo(g * 14, 0); c.stroke(); });
    yeux(c, 0, 4, 32, 9, '#ffd21a', t);
    c.restore();
  }

  G.BESTIAIRE_ART = {
    skinwalker: { dessin: skinwalker, fond: ['#14100c', '#3e3226'], hauteur: 1000 },
    mothman: { dessin: mothman, fond: ['#0e0f14', '#33303a'], hauteur: 1020, large: true, largeur: 1000 },
    rake: { dessin: rake, fond: ['#0b0d10', '#262b30'], hauteur: 560, large: true, largeur: 620 },
    hasshaku: { dessin: hasshaku, fond: ['#141c14', '#3c4a34'], hauteur: 1450 },
    kuchisake: { dessin: kuchisake, fond: ['#0f0f1a', '#3a2440'], hauteur: 860 },
    bloody_mary: { dessin: bloodyMary, fond: ['#120a0c', '#33181c'], hauteur: 1010 },
    teke_teke: { dessin: tekeTeke, fond: ['#0c0e14', '#2c2f3a'], hauteur: 520, large: true, largeur: 820 },
    enfants_yeux_noirs: { dessin: enfants, fond: ['#10121a', '#2e3446'], hauteur: 860 },
    wendigo: { dessin: wendigo, fond: ['#0c1220', '#2c3a52'], hauteur: 1140 },
    vampire: { dessin: vampire, fond: ['#1a0d14', '#3a1a24'], hauteur: 920 },
    loup_garou: { dessin: loupGarou, fond: ['#0d1220', '#2e3a56'], hauteur: 1100 },
    krampus: { dessin: krampus, fond: ['#0e1420', '#30425a'], hauteur: 1020 },
  };

})(window);
