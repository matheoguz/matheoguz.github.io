// Le Bestiaire — personnages humains (nouveau style : silhouettes fines, petite tête, ombre plate et liseré de lumière).
// humain(c, def, o, t) : pieds en (o.x, o.y), 1000 unités = 1,65 m, o.echelle multiplie.
// def = { peau, cheveux, coiffure: court|chignon|degarni|carre, haut, bas, tenue: tshirt|kimono|polo, taille, lunettes, motif }
// o = { x, y, echelle, expr: neutre|peur|inquiet|parle|choc, dos, pose: normal|telephone|pointe|sac|assis|recule, regard: -1..1 }
(function (G) {
  const TAU = Math.PI * 2;
  const ell = (c, x, y, rx, ry, r = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, r, 0, TAU); };
  const fonce = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.round(v * (1 - k)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  const clair = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.round(v + (255 - v) * k); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };

  function humain(c, def, o, t) {
    const s = (o.echelle || 1) * (def.taille || 1), pose = o.pose || 'normal', expr = o.expr || 'neutre';
    const tremble = expr === 'peur' || expr === 'choc' ? Math.sin(t * 38) * 2.5 : 0;
    const resp = Math.sin(t * 2 + (o.x || 0)) * 4;
    c.save(); c.translate(o.x + tremble, o.y ?? 1700); c.scale(s, s);
    c.fillStyle = 'rgba(0,0,0,.3)'; ell(c, 0, 4, 150, 22); c.fill();
    const assis = pose === 'assis';
    if (assis) c.translate(0, 330);
    // jambes
    const bas = def.bas, peau = def.peau, court = def.tenue === 'tshirt';
    [-1, 1].forEach(g => {
      if (assis) { c.fillStyle = bas; c.beginPath(); c.roundRect(g * 70 - 34, -500, 68, 170, 26); c.fill(); return; }
      const pas = pose === 'marche' ? Math.sin(t * 6) * g * 18 : 0;
      c.fillStyle = court ? peau : bas; c.beginPath(); c.roundRect(g * 42 - 30 + pas, -480, 60, 470, 26); c.fill();
      if (court) { c.fillStyle = bas; c.beginPath(); c.roundRect(g * 42 - 36, -500, 72, 190, 20); c.fill(); }
      c.fillStyle = def.chaussures || '#2a2a2e'; c.beginPath(); c.roundRect(g * 42 - 34 + pas + (o.dos ? 0 : g * 4), -26, 72, 30, 12); c.fill();
    });
    if (def.tenue === 'kimono') { c.fillStyle = def.bas; c.beginPath(); c.moveTo(-110, -520); c.lineTo(110, -520); c.lineTo(130, -20); c.lineTo(-130, -20); c.fill(); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(30, -520, 100, 500); }
    // buste
    c.translate(0, resp * .3);
    const haut = def.haut;
    c.fillStyle = haut; c.beginPath(); c.moveTo(-108, -800); c.quadraticCurveTo(-120, -650, -92, -480); c.lineTo(92, -480); c.quadraticCurveTo(120, -650, 108, -800); c.quadraticCurveTo(0, -830, -108, -800); c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(30, -820); c.quadraticCurveTo(120, -800, 108, -800); c.quadraticCurveTo(120, -650, 92, -480); c.lineTo(40, -480); c.fill();
    if (def.tenue === 'kimono') { c.strokeStyle = clair(haut, .5); c.lineWidth = 10; c.beginPath(); c.moveTo(-50, -805); c.lineTo(30, -600); c.moveTo(50, -805); c.lineTo(-10, -680); c.stroke(); c.fillStyle = def.obi || '#7a2a2a'; c.fillRect(-100, -600, 200, 70); }
    if (def.tenue === 'polo') { c.fillStyle = clair(haut, .25); c.beginPath(); c.moveTo(-40, -810); c.lineTo(0, -760); c.lineTo(40, -810); c.fill(); c.fillStyle = '#e8e2d6'; [-740, -710].forEach(y => { ell(c, 0, y, 4, 4); c.fill(); }); }
    if (def.tenue === 'tshirt' && def.motif && !o.dos) { c.fillStyle = def.motif; c.beginPath(); c.arc(0, -660, 42, 0, TAU); c.fill(); c.fillStyle = haut; c.beginPath(); c.arc(0, -660, 24, 0, TAU); c.fill(); }
    // bras
    const bras = (g, ang) => { c.save(); c.translate(g * 104, -785); c.rotate(ang);
      c.fillStyle = def.tenue === 'tshirt' ? haut : haut; c.beginPath(); c.roundRect(-26, 0, 52, def.tenue === 'tshirt' ? 120 : 260, 22); c.fill();
      if (def.tenue === 'tshirt') { c.fillStyle = peau; c.beginPath(); c.roundRect(-20, 100, 40, 210, 18); c.fill(); }
      c.fillStyle = peau; ell(c, 0, 320, 24, 28); c.fill(); c.restore(); };
    const p = { normal: [.08, -.08], telephone: [.08, 2.6], pointe: [.08, -1.9], sac: [.08, -.05], recule: [.6, -.6], marche: [Math.sin(t * 6) * .2, -Math.sin(t * 6) * .2], assis: [.5, -.5], mains_visage: [2.7, -2.7] }[pose] || [.08, -.08];
    bras(-1, p[0]); bras(1, p[1]);
    if (pose === 'sac') { c.fillStyle = def.sac || '#c8742c'; c.beginPath(); c.roundRect(110, -560, 120, 150, 18); c.fill(); c.strokeStyle = fonce(def.sac || '#c8742c', .3); c.lineWidth = 8; c.beginPath(); c.moveTo(130, -560); c.lineTo(110, -780); c.stroke(); }
    if (pose === 'telephone') { c.fillStyle = '#1b1b1e'; c.save(); c.translate(70, -895); c.rotate(.3); c.fillRect(-12, -40, 24, 70); c.restore(); }
    // cou + tête
    c.fillStyle = fonce(peau, .08); c.fillRect(-22, -840, 44, 50);
    const hy = -905, dx = (o.regard || 0) * 10;
    c.fillStyle = peau; c.beginPath(); c.moveTo(-60, hy - 30); c.quadraticCurveTo(-64, hy + 50, -20, hy + 78); c.quadraticCurveTo(0, hy + 86, 20, hy + 78); c.quadraticCurveTo(64, hy + 50, 60, hy - 30); c.quadraticCurveTo(0, hy - 100, -60, hy - 30); c.fill();
    if (!o.dos) { c.fillStyle = peau; ell(c, -62, hy + 4, 10, 16); c.fill(); ell(c, 62, hy + 4, 10, 16); c.fill(); }
    // cheveux
    c.fillStyle = def.cheveux;
    const coif = def.coiffure || 'court';
    if (o.dos) { c.beginPath(); c.ellipse(0, hy - 6, 66, 84, 0, 0, TAU); c.fill(); if (coif === 'chignon') { ell(c, 0, hy - 80, 34, 28); c.fill(); } }
    else {
      if (coif === 'court') { c.beginPath(); c.moveTo(-66, hy - 10); c.quadraticCurveTo(-70, hy - 96, 0, hy - 100); c.quadraticCurveTo(70, hy - 96, 66, hy - 10); c.lineTo(52, hy - 44); c.lineTo(30, hy - 30); c.lineTo(10, hy - 52); c.lineTo(-14, hy - 34); c.lineTo(-36, hy - 54); c.lineTo(-54, hy - 30); c.closePath(); c.fill(); }
      if (coif === 'chignon') { c.beginPath(); c.moveTo(-64, hy); c.quadraticCurveTo(-70, hy - 96, 0, hy - 98); c.quadraticCurveTo(70, hy - 96, 64, hy); c.quadraticCurveTo(40, hy - 60, 0, hy - 64); c.quadraticCurveTo(-40, hy - 60, -64, hy); c.fill(); ell(c, 0, hy - 102, 34, 26); c.fill(); }
      if (coif === 'degarni') { [-1, 1].forEach(g => { c.beginPath(); c.moveTo(g * 64, hy + 20); c.quadraticCurveTo(g * 70, hy - 50, g * 40, hy - 60); c.lineTo(g * 52, hy - 10); c.fill(); }); }
      if (coif === 'carre') { c.beginPath(); c.moveTo(-70, hy + 40); c.quadraticCurveTo(-76, hy - 100, 0, hy - 100); c.quadraticCurveTo(76, hy - 100, 70, hy + 40); c.lineTo(50, hy + 40); c.lineTo(50, hy - 40); c.quadraticCurveTo(0, hy - 30, -50, hy - 40); c.lineTo(-50, hy + 40); c.fill(); }
      visage(c, def, expr, hy, dx, t, o.x || 0);
    }
    c.restore();
  }

  function visage(c, def, expr, hy, dx, t, seed) {
    const peur = expr === 'peur' || expr === 'choc', inq = expr === 'inquiet';
    const cligne = !peur && ((t + seed * .013) % 3.7) < .12;
    const ey = hy - 4;
    [-1, 1].forEach(g => {
      const ex = g * 26 + dx;
      c.fillStyle = '#f7f3ee'; c.beginPath(); c.ellipse(ex, ey, peur ? 15 : 13, cligne ? 1.5 : (peur ? 13 : 8), 0, 0, TAU); c.fill();
      if (!cligne) { c.fillStyle = '#2a1d16'; c.beginPath(); c.arc(ex + dx * .3, ey + 1, peur ? 5 : 6.5, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.fillRect(ex + dx * .3 - 3, ey - 3, 2.5, 2.5); }
      c.strokeStyle = fonce(def.cheveux === '#d8d8d8' ? '#9a9a9a' : def.cheveux, 0); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath();
      if (peur || inq) { c.moveTo(ex + g * 14, ey - 22); c.lineTo(ex - g * 10, ey - 30); } else { c.moveTo(ex + g * 14, ey - 22); c.lineTo(ex - g * 12, ey - 24); } c.stroke();
    });
    if (def.lunettes) { c.strokeStyle = '#3a3a3a'; c.lineWidth = 4; [-1, 1].forEach(g => { c.beginPath(); c.roundRect(g * 26 + dx - 20, ey - 14, 40, 26, 8); c.stroke(); }); c.beginPath(); c.moveTo(-6 + dx, ey - 2); c.lineTo(6 + dx, ey - 2); c.stroke(); }
    c.strokeStyle = fonce(def.peau, .25); c.lineWidth = 4; c.beginPath(); c.moveTo(dx * .6, ey + 6); c.lineTo(dx * .6 - 4, ey + 30); c.lineTo(dx * .6 + 4, ey + 32); c.stroke();
    const my = hy + 52;
    if (peur) { c.fillStyle = '#3a1716'; ell(c, dx * .5, my, 11, expr === 'choc' ? 17 : 13 + Math.sin(t * 9) * 2); c.fill(); }
    else if (expr === 'parle') { c.fillStyle = '#3a1716'; ell(c, dx * .5, my, 12, 4 + Math.abs(Math.sin(t * 12)) * 7); c.fill(); }
    else { c.strokeStyle = '#6e3a30'; c.lineWidth = 4; c.beginPath(); c.moveTo(-14 + dx * .5, my + (inq ? 3 : 0)); c.quadraticCurveTo(dx * .5, my + (inq ? -4 : 5), 14 + dx * .5, my + (inq ? 3 : 0)); c.stroke(); }
    if (peur) { c.fillStyle = 'rgba(200,220,255,.8)'; const k = (t * 1.5) % 1; ell(c, 54, hy - 30 + k * 60, 4, 7); c.fill(); }
  }

  G.HUMAIN = humain;
})(window);
