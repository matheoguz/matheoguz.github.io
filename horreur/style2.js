// Le Bestiaire — style 2 : illustration vectorielle avec contours, forêts en couches, lumière de feu.
// PERSO2(c, def, o, t) : personnages (pieds en o.x,o.y). Skinwalker v2 + transformation. Décors : s2_foret, s2_camp, s2_bois.
(function (G) {
  const W = 1080, H = 1920, TAU = Math.PI * 2, LIGNE = '#141526';
  const ell = (c, x, y, rx, ry, r = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, r, 0, TAU); };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const vg = (c, y0, y1, cols) => { const g = c.createLinearGradient(0, y0, 0, y1); cols.forEach((k, i) => g.addColorStop(i / (cols.length - 1), k)); return g; };
  const rg = (c, x, y, r0, r1, cols) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); cols.forEach((k, i) => g.addColorStop(i / (cols.length - 1), k)); return g; };
  const rnd = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const P = (c, pts) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); };
  const remplir = (c, col, lw = 7) => { c.fillStyle = col; c.fill(); c.strokeStyle = LIGNE; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); };
  const fonce = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.round(v * (1 - k)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };

  // ================= PERSONNAGES =================
  // def : { peau, cheveux, coiffure: court|boucles|queue|bonnet, sweat, pantalon, chaussures, logo, sac, bonnetCol }
  // o : { x, y, echelle, expr: neutre|sourire|peur|choc|parle|faux, dos, pose: normal|marche|assis|lampe|salut|pointe, logoInverse, tete (inclinaison), regard }
  function perso2(c, def, o, t) {
    const s = o.echelle || 1, pose = o.pose || 'normal', expr = o.expr || 'neutre';
    const trem = expr === 'peur' || expr === 'choc' ? Math.sin(t * 40) * 2 : 0, resp = Math.sin(t * 2.2 + o.x) * 3;
    c.save(); c.translate(o.x + trem, o.y); c.scale(s, s);
    c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, 0, 4, 120, 20); c.fill();
    const assis = pose === 'assis', pas = pose === 'marche' ? Math.sin(t * 6.5) : 0;
    // jambes
    if (assis) { c.translate(0, 120);
      [-1, 1].forEach(g => { rr(c, g * 50 - 30, -340, 60, 150, 26); remplir(c, def.pantalon); rr(c, g * 50 - 26 + g * 40, -200, 56, 190, 24); remplir(c, def.pantalon); rr(c, g * 90 - 36, -26, 76, 34, 14); remplir(c, def.chaussures || '#e9e9ee', 6); }); }
    else [-1, 1].forEach(g => { c.save(); c.translate(g * 36, -330); c.rotate(pas * g * .28); rr(c, -28, 0, 56, 320, 26); remplir(c, def.pantalon); rr(c, -34, 296, 74, 36, 15); remplir(c, def.chaussures || '#e9e9ee', 6); c.restore(); });
    c.translate(0, resp * .3);
    if (def.sac && !o.dos) { rr(c, -100, -600, 200, 260, 40); remplir(c, fonce(def.sac, .2)); }
    // sweat
    c.beginPath(); c.moveTo(-96, -610); c.quadraticCurveTo(-112, -470, -90, -320); c.lineTo(90, -320); c.quadraticCurveTo(112, -470, 96, -610); c.quadraticCurveTo(0, -646, -96, -610); remplir(c, def.sweat);
    c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.moveTo(30, -630); c.quadraticCurveTo(100, -620, 96, -610); c.quadraticCurveTo(112, -470, 90, -320); c.lineTo(40, -320); c.fill();
    if (!o.dos) { rr(c, -56, -430, 112, 60, 18); remplir(c, fonce(def.sweat, .12), 5);
      const lx = (o.logoInverse ? -1 : 1) * 46; c.fillStyle = def.logo || '#f2c94c'; ell(c, lx, -540, 18, 18); c.fill(); c.strokeStyle = LIGNE; c.lineWidth = 4; c.stroke();
      c.strokeStyle = fonce(def.sweat, .35); c.lineWidth = 5; c.beginPath(); c.moveTo(-14, -610); c.lineTo(-20, -540); c.moveTo(14, -610); c.lineTo(20, -540); c.stroke(); }
    else { c.beginPath(); c.moveTo(-70, -640); c.quadraticCurveTo(0, -560, 70, -640); c.quadraticCurveTo(0, -600, -70, -640); remplir(c, fonce(def.sweat, .15), 5);
      if (def.sac) { rr(c, -80, -600, 160, 230, 36); remplir(c, def.sac); rr(c, -50, -470, 100, 70, 16); remplir(c, fonce(def.sac, .15), 5); } }
    // bras
    const bras = (g, ang, long = 270) => { c.save(); c.translate(g * 92, -596); c.rotate(ang); rr(c, -24, 0, 48, long, 22); remplir(c, def.sweat); ell(c, 0, long + 8, 22, 22); remplir(c, def.peau, 6); c.restore(); };
    const P2 = { normal: [.12, -.12], marche: [pas * .35 + .1, -pas * .35 - .1], assis: [.5, -.5], lampe: [.12, -1.25], salut: [.12, -2.6], pointe: [.12, -1.7], bras_croises: [.9, -.9] }[pose] || [.12, -.12];
    bras(-1, P2[0]); bras(1, P2[1]);
    if (pose === 'lampe') { c.save(); c.translate(92, -596); c.rotate(-1.25); c.translate(0, 290); c.rotate(1.25); rr(c, -10, -18, 70, 30, 8); remplir(c, '#3a3d4a', 5); c.restore(); }
    // tête
    c.save(); c.translate(0, -700); c.rotate((o.tete || 0) + (expr === 'faux' ? Math.sin(t * .8) * .05 : 0));
    c.fillStyle = def.peau; ell(c, 0, 0, 92, 100); c.fill(); c.strokeStyle = LIGNE; c.lineWidth = 7; c.stroke();
    if (!o.dos) { ell(c, -92, 8, 16, 22); remplir(c, def.peau, 6); ell(c, 92, 8, 16, 22); remplir(c, def.peau, 6); }
    cheveux(c, def, o.dos);
    if (!o.dos) visage2(c, def, expr, t, o);
    c.restore();
    c.restore();
  }
  function cheveux(c, def, dos) {
    const col = def.cheveux, k = def.coiffure || 'court';
    if (k === 'bonnet') { c.beginPath(); c.moveTo(-96, -20); c.quadraticCurveTo(-100, -120, 0, -122); c.quadraticCurveTo(100, -120, 96, -20); c.closePath(); remplir(c, def.bonnetCol || '#c0392b'); rr(c, -100, -36, 200, 34, 14); remplir(c, fonce(def.bonnetCol || '#c0392b', .2)); ell(c, 0, -126, 20, 20); remplir(c, '#f2f2f2', 5); return; }
    if (dos) { ell(c, 0, -10, 94, 98); remplir(c, col); if (k === 'queue') { ell(c, 0, 80, 26, 60); remplir(c, col); } return; }
    if (k === 'court') { c.beginPath(); c.moveTo(-94, -6); c.quadraticCurveTo(-104, -110, 0, -112); c.quadraticCurveTo(104, -110, 94, -6); c.lineTo(78, -50); c.lineTo(50, -36); c.lineTo(24, -62); c.lineTo(-6, -40); c.lineTo(-36, -64); c.lineTo(-62, -38); c.lineTo(-80, -52); c.closePath(); remplir(c, col); }
    if (k === 'boucles') { for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI; ell(c, Math.cos(a) * 82, -20 + Math.sin(a) * 86, 34, 32); remplir(c, col, 6); } }
    if (k === 'queue') { c.beginPath(); c.moveTo(-96, 20); c.quadraticCurveTo(-104, -112, 0, -112); c.quadraticCurveTo(104, -112, 96, 20); c.quadraticCurveTo(70, -60, 0, -64); c.quadraticCurveTo(-70, -60, -96, 20); remplir(c, col); ell(c, 96, -50, 30, 26); remplir(c, col); }
  }
  function visage2(c, def, expr, t, o) {
    const faux = expr === 'faux', peur = expr === 'peur' || expr === 'choc', dx = (o.regard || 0) * 12;
    const cl = !peur && !faux && ((t + o.x * .01) % 3.6) < .1;
    [-1, 1].forEach(g => { const ex = g * 34 + dx, ey = 6 + (faux && g === 1 ? -8 : 0);
      c.fillStyle = '#fff'; ell(c, ex, ey, peur ? 24 : 21, cl ? 2 : (peur ? 27 : 24)); c.fill(); c.strokeStyle = LIGNE; c.lineWidth = 5; c.stroke();
      if (!cl) { const pr = faux ? 4 : (peur ? 7 : 10); c.fillStyle = faux ? '#2a3a20' : '#1b1b22'; ell(c, ex + dx * .4, ey + 3, pr, pr * (faux ? 1.8 : 1)); c.fill();
        if (faux) { c.save(); c.shadowColor = '#8dff70'; c.shadowBlur = 10; c.fillStyle = 'rgba(160,255,120,.5)'; ell(c, ex + dx * .4, ey + 3, 9, 12); c.fill(); c.restore(); }
        c.fillStyle = '#fff'; ell(c, ex + dx * .4 - 4, ey - 3, 3, 3); c.fill(); } });
    c.strokeStyle = LIGNE; c.lineWidth = 6; c.lineCap = 'round';
    [-1, 1].forEach(g => { c.beginPath(); if (peur) { c.moveTo(g * 50 + dx, -32); c.lineTo(g * 18 + dx, -42); } else if (faux) { c.moveTo(g * 50 + dx, -30); c.lineTo(g * 16 + dx, -26); } else { c.moveTo(g * 50 + dx, -34); c.quadraticCurveTo(g * 34 + dx, -42, g * 18 + dx, -34); } c.stroke(); });
    const my = 60;
    if (expr === 'sourire') { c.beginPath(); c.moveTo(-24, my - 4); c.quadraticCurveTo(0, my + 20, 24, my - 4); c.stroke(); }
    else if (peur) { c.fillStyle = '#3a1418'; ell(c, 0, my, 14, expr === 'choc' ? 22 : 16 + Math.sin(t * 9) * 2); c.fill(); c.stroke(); }
    else if (expr === 'parle') { c.fillStyle = '#3a1418'; ell(c, 0, my, 14, 4 + Math.abs(Math.sin(t * 11)) * 9); c.fill(); }
    else if (faux) { const w = 46 + Math.max(0, Math.sin(t * .5)) * 8; c.fillStyle = '#2a0c0c'; c.beginPath(); c.moveTo(-w, my - 10); c.quadraticCurveTo(0, my + 34, w, my - 10); c.quadraticCurveTo(0, my + 8, -w, my - 10); c.fill(); c.stroke();
      c.fillStyle = '#f2ead8'; for (let i = 0; i < 10; i++) c.fillRect(-w + 8 + i * (w * 2 - 16) / 10, my - 6 + Math.sin(i / 9 * Math.PI) * 10, 5, 7); }
    else { c.beginPath(); c.moveTo(-16, my); c.quadraticCurveTo(0, my + 8, 16, my); c.stroke(); }
    c.fillStyle = 'rgba(230,110,110,.28)'; ell(c, -58, 40, 16, 10); c.fill(); ell(c, 58, 40, 16, 10); c.fill();
  }

  // ================= SKINWALKER v2 (contours) =================
  function skin2(c, t, o = {}) {
    const b = Math.sin(t * 1.6) * 6, gris = '#9a948a', grisF = '#6e695f', poil = '#6b5640', poilF = '#4a3a2b';
    c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, 0, 4, 150, 22); c.fill();
    c.lineCap = 'round'; c.lineJoin = 'round';
    [-1, 1].forEach(g => { const jambe = (lw, col) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(g * 46, -470); c.lineTo(g * 92, -280); c.lineTo(g * 50, -120); c.lineTo(g * 80, -8); c.stroke(); };
      jambe(44, LIGNE); jambe(32, grisF); c.fillStyle = LIGNE; for (let i = -1; i <= 1; i++) { P(c, [[g * 80 + i * 16, -10], [g * 80 + i * 20 + g * 14, 14], [g * 80 + i * 16 + 8, -14]]); c.fill(); } });
    c.beginPath(); c.moveTo(-150, -880); c.quadraticCurveTo(-210, -620, -170, -380);
    for (let i = 0; i <= 12; i++) c.lineTo(-170 + i * 28.3, -380 + (i % 2) * 56 + Math.sin(t * 2 + i) * 5);
    c.quadraticCurveTo(210, -620, 150, -880); c.closePath(); remplir(c, poil);
    c.beginPath(); c.moveTo(-74, -820); c.quadraticCurveTo(-92, -620, -56, -450); c.lineTo(56, -450); c.quadraticCurveTo(92, -620, 74, -820); c.closePath(); remplir(c, gris);
    c.strokeStyle = grisF; c.lineWidth = 5; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-58, -770 + i * 40); c.quadraticCurveTo(0, -752 + i * 40, 58, -770 + i * 40); c.stroke(); }
    const brasD = (g, lw, col) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(g * 84, -800); c.quadraticCurveTo(g * 190, -560, g * (170 + (g > 0 ? -b : b)), -260); c.stroke(); };
    [-1, 1].forEach(g => { brasD(g, 30, LIGNE); brasD(g, 20, gris); c.strokeStyle = '#e8e0cc'; c.lineWidth = 6;
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(g * (170 + (g > 0 ? -b : b)), -262); c.quadraticCurveTo(g * (180 + i * 10), -200, g * (172 + i * 16), -150); c.stroke(); } });
    // tête : visage humain sous une tête de coyote
    c.save(); c.translate(0, -920); c.rotate(o.tete || Math.sin(t * .7) * .06);
    c.beginPath(); c.moveTo(-60, -40); c.quadraticCurveTo(-72, 60, -24, 96); c.quadraticCurveTo(0, 106, 24, 96); c.quadraticCurveTo(72, 60, 60, -40); c.closePath(); remplir(c, '#c9bfae');
    c.fillStyle = '#1a1612'; ell(c, -24, 14, 17, 14); c.fill(); ell(c, 26, 2, 17, 14); c.fill();
    c.save(); c.shadowColor = '#8dff70'; c.shadowBlur = 18; c.fillStyle = '#c4ff9e'; ell(c, -24, 14, 7, 9); c.fill(); ell(c, 26, 2, 7, 9); c.fill(); c.restore();
    c.fillStyle = '#000'; c.fillRect(-25, 7, 3, 14); c.fillRect(25, -5, 3, 14);
    c.fillStyle = '#2a0c0c'; c.beginPath(); c.moveTo(-46, 56); c.quadraticCurveTo(0, 96, 48, 50); c.quadraticCurveTo(0, 70, -46, 56); c.fill(); c.strokeStyle = LIGNE; c.lineWidth = 4; c.stroke();
    c.fillStyle = '#efe6d0'; for (let i = 0; i < 10; i++) c.fillRect(-40 + i * 9, 58 + Math.sin(i / 9 * Math.PI) * 10, 5, 8);
    c.beginPath(); c.moveTo(-86, 50); c.quadraticCurveTo(-110, -80, -30, -110); c.lineTo(150, -170); c.quadraticCurveTo(180, -150, 160, -126); c.lineTo(50, -80); c.quadraticCurveTo(110, -20, 86, 50); c.quadraticCurveTo(70, -50, 0, -58); c.quadraticCurveTo(-70, -50, -86, 50); c.closePath(); remplir(c, poil);
    P(c, [[-64, -98], [-52, -196], [-16, -112]]); remplir(c, poilF, 6); P(c, [[0, -116], [26, -206], [44, -124]]); remplir(c, poilF, 6);
    c.fillStyle = '#16110c'; ell(c, 46, -124, 10, 7, -.4); c.fill(); ell(c, 152, -150, 11, 8); c.fill();
    c.fillStyle = '#e9e0cc'; for (let i = 0; i < 5; i++) { P(c, [[72 + i * 16, -102 - i * 6], [80 + i * 16, -104 - i * 6], [78 + i * 16, -88 - i * 6]]); c.fill(); }
    c.restore();
  }
  G.BESTIAIRE_ART = G.BESTIAIRE_ART || {};
  G.BESTIAIRE_ART.skinwalker_v2 = { dessin: skin2, fond: ['#1a1830', '#3a3260'], hauteur: 1150 };

  // transformation : le monstre devient le pote (ou l'inverse), avec glitch
  function transfo(c, t, k, def, o) {
    const r = rnd(Math.floor(t * 20) + 3);
    const dessinM = () => { c.save(); c.translate(o.x, o.y); c.scale(o.echelleM || .8, (o.echelleM || .8) * (1 + .15 * k)); skin2(c, t, {}); c.restore(); };
    const dessinP = () => perso2(c, def, { ...o, expr: 'faux', echelle: (o.echelle || 1) * (1 + (1 - k) * .25) }, t);
    if (k < 1) { c.save(); c.globalAlpha = 1 - k; dessinM(); c.restore(); }
    if (k > 0) { c.save(); c.globalAlpha = k; dessinP(); c.restore(); }
    if (k > .05 && k < .95) for (let i = 0; i < 7; i++) { const y = o.y - r() * 1100, h = 20 + r() * 60, dx = (r() - .5) * 120; c.save(); c.beginPath(); c.rect(0, y, W, h); c.clip(); c.translate(dx, 0); (r() > .5 ? dessinM : dessinP)(); c.restore(); }
  }

  // ================= DÉCORS =================
  function sapin(c, x, y, h, col, contour) { c.beginPath(); c.moveTo(x, y - h); const n = 4; for (let i = 1; i <= n; i++) { const k = i / n; c.lineTo(x - h * .27 * k, y - h + h * k * .92); c.lineTo(x - h * .16 * k, y - h + h * k * .92); } c.lineTo(x - h * .3, y); c.lineTo(x + h * .3, y); for (let i = n; i >= 1; i--) { const k = i / n; c.lineTo(x + h * .16 * k, y - h + h * k * .92); c.lineTo(x + h * .27 * k, y - h + h * k * .92); } c.closePath(); c.fillStyle = col; c.fill(); if (contour) { c.strokeStyle = contour; c.lineWidth = 4; c.stroke(); } }
  function couches(c, t, defile, nuit) {
    const pal = nuit ? ['#0c0d1e', '#14162c', '#1b1d38', '#222545'] : ['#3a3a72', '#2e2f5e', '#24264c', '#1b1d3c'];
    const r = rnd(4);
    c.fillStyle = nuit ? '#141633' : '#4a4683'; c.beginPath(); c.moveTo(0, 900); for (let x = 0; x <= W; x += 80) c.lineTo(x, 760 - Math.abs(Math.sin(x * .004 + 1)) * 160); c.lineTo(W, 1000); c.lineTo(0, 1000); c.fill();
    [0, 1, 2].forEach(L => { const y = 1000 + L * 70, off = (t * defile * (L + 1) * 18) % 260; const col = pal[L + 1];
      for (let x = -260 - off; x < W + 260; x += 120 - L * 10) { const h = 300 + L * 110 + (Math.sin(x * 1.7 + L) * .5 + .5) * 120; sapin(c, x, y, h, col, L === 2 ? (nuit ? '#0a0b18' : '#16183a') : null); } });
  }
  function ciel(c, nuit) {
    c.fillStyle = nuit ? vg(c, 0, 1100, ['#05060f', '#0e1028', '#1d1e42']) : vg(c, 0, 1100, ['#1e1d45', '#4b3a78', '#a0587a', '#e08a6a']); c.fillRect(0, 0, W, H);
    const r = rnd(2); for (let i = 0; i < 100; i++) { c.fillStyle = `rgba(255,255,255,${.25 + r() * .6})`; c.fillRect(r() * W, r() * 800, 2, 2); }
    c.save(); c.shadowColor = '#fff6d8'; c.shadowBlur = 50; c.fillStyle = '#fff4d6'; ell(c, 820, 330, 54, 54); c.fill(); c.restore();
  }
  // marche en forêt au crépuscule
  function foret(c, t, p) {
    ciel(c, p.nuit); couches(c, t, p.defile ?? 1, p.nuit);
    c.fillStyle = p.nuit ? '#121429' : '#26284d'; c.fillRect(0, 1130, W, H - 1130);
    c.fillStyle = p.nuit ? '#1b1d38' : '#36386a'; c.beginPath(); c.moveTo(440, 1130); c.lineTo(640, 1130); c.lineTo(1000, H); c.lineTo(80, H); c.fill();
    const r = rnd(6); for (let i = 0; i < 40; i++) { const x = ((r() * W - t * (p.defile ?? 1) * 60) % W + W) % W, y = 1260 + r() * 640; c.strokeStyle = p.nuit ? '#262a4a' : '#3e427a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 8, y - 22); c.moveTo(x, y); c.lineTo(x + 8, y - 24); c.stroke(); }
    if (p.guetteur) guetteur(c, t, p.guetteur);
  }
  function guetteur(c, t, g) { const a = Math.max(0, Math.min(1, (t - (g.apparait || 0)) / .8)); if (!a) return;
    c.save(); c.globalAlpha = a; c.translate(g.x, g.y); c.scale(g.echelle, g.echelle); skin2(c, t, {}); c.restore();
    c.save(); c.globalAlpha = a * (g.ombre ?? .55); c.fillStyle = '#0a0a18'; c.fillRect(g.x - 200 * g.echelle, g.y - 1250 * g.echelle, 400 * g.echelle, 1250 * g.echelle); c.restore();
    c.save(); c.shadowColor = '#8dff70'; c.shadowBlur = 14; c.fillStyle = '#c4ff9e'; c.globalAlpha = a; ell(c, g.x - 24 * g.echelle, g.y - 906 * g.echelle, 6, 6); c.fill(); ell(c, g.x + 26 * g.echelle, g.y - 918 * g.echelle, 6, 6); c.fill(); c.restore(); }
  // le camp et le feu
  function feu(c, t, x, y, k = 1) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rg(c, x, y - 60, 20, 900 * k, [`rgba(255,150,60,${.5 * k})`, 'rgba(255,120,40,0)']); c.fillRect(0, 0, W, H); c.restore();
    [[-70, -20, .35], [70, -20, -.35], [0, -10, 0]].forEach(([dx, dy, a]) => { c.save(); c.translate(x + dx, y + dy); c.rotate(a); rr(c, -80, -16, 160, 32, 14); remplir(c, '#5a3a22', 6); c.restore(); });
    if (k <= 0) return; const f = (i) => 1 + Math.sin(t * 13 + i) * .12;
    [['#e8462b', 120, 210], ['#f2902f', 90, 160], ['#ffd25a', 50, 100]].forEach(([col, w, h], i) => { c.beginPath(); c.moveTo(x - w * k, y - 10); c.quadraticCurveTo(x - w * .8 * k, y - h * .6 * k * f(i), x - w * .2, y - h * k * f(i + 2)); c.quadraticCurveTo(x + w * .1, y - h * .5 * k, x + w * .25 * k, y - h * .85 * k * f(i + 4)); c.quadraticCurveTo(x + w * .9 * k, y - h * .5 * k, x + w * k, y - 10); c.closePath(); c.fillStyle = col; c.fill(); });
    const r = rnd(Math.floor(t * 8)); c.fillStyle = '#ffd25a'; for (let i = 0; i < 6; i++) { const kk = (t * .8 + i / 6) % 1; ell(c, x + Math.sin(i * 3 + t) * 60, y - 120 - kk * 500, 4 * (1 - kk), 4 * (1 - kk)); c.fill(); }
  }
  function tente(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); P(c, [[-200, 0], [0, -260], [200, 0]]); remplir(c, col); P(c, [[-60, 0], [0, -180], [60, 0]]); remplir(c, fonce(col, .4), 6); c.restore(); }
  function camp(c, t, p) {
    ciel(c, true); couches(c, t, 0, true);
    c.fillStyle = '#15172c'; c.fillRect(0, 1180, W, H - 1180);
    tente(c, 220, 1330, 1, '#c0583a'); tente(c, 900, 1300, .85, '#3a7a5a');
    if (p.guetteur) guetteur(c, t, p.guetteur);
    if (p.transfo) { const T = p.transfo, k = Math.max(0, Math.min(1, (t - T.t0) / T.dur)); transfo(c, t, T.inverse ? 1 - k : k, EP_PERSO(T.id), T); }
  }
  function campAvant(c, t, p) { feu(c, t, p.feuX ?? 540, p.feuY ?? 1660, p.feu ?? 1); if (p.feu === 0) { c.fillStyle = 'rgba(2,3,10,.55)'; c.fillRect(0, 0, W, H); } }
  // le bois sombre (là où Malik va)
  function bois(c, t, p) {
    c.fillStyle = vg(c, 0, H, ['#0d1024', '#171a34', '#1b1e3a']); c.fillRect(0, 0, W, H);
    const r = rnd(9); for (let i = 0; i < 14; i++) { const x = r() * W, w = 30 + r() * 70, sh = .5 + r() * .5; c.fillStyle = `rgb(${34 * sh},${38 * sh},${66 * sh})`; c.fillRect(x - w / 2, 0, w, 1500 + r() * 300); c.strokeStyle = '#05060e'; c.lineWidth = 5; c.strokeRect(x - w / 2, -10, w, 1520); }
    c.fillStyle = '#1a1d36'; c.fillRect(0, 1500, W, H - 1500);
    for (let i = 0; i < 5; i++) { const x = ((i * 280 + t * 30) % 1500) - 200; c.fillStyle = rg(c, x, 1450, 10, 420, ['rgba(120,130,170,.18)', 'rgba(120,130,170,0)']); c.fillRect(x - 450, 1000, 900, 900); }
    if (p.transfo) { const T = p.transfo, k = Math.max(0, Math.min(1, (t - T.t0) / T.dur)); transfo(c, t, T.inverse ? 1 - k : k, EP_PERSO(T.id), T); }
    if (p.guetteur) guetteur(c, t, p.guetteur);
  }
  const EP_PERSO = id => (G.EP_COURANT && G.EP_COURANT.persos[id]) || {};

  G.PERSO2 = perso2;
  Object.assign(G.DECORS = G.DECORS || {}, {
    s2_foret: { fond: foret }, s2_camp: { fond: camp, avant: campAvant }, s2_bois: { fond: bois },
  });
})(window);
