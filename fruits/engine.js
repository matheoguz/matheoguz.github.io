// =============================================================================
// FruitStudio - Moteur de rendu (fruits, visages, décors, sous-titres)
// Tout est dessiné en Canvas 2D, rien n'est envoyé à un serveur.
// =============================================================================
(function () {
  'use strict';

  const W = 720, H = 1280;
  const GROUND = H * 0.76;

  // ---------------------------------------------------------------------------
  // Utilitaires
  // ---------------------------------------------------------------------------
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);

  function shade(ctx, cx, cy, r, light, base, dark) {
    const g = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.08, cx, cy, r * 1.15);
    g.addColorStop(0, light);
    g.addColorStop(0.5, base);
    g.addColorStop(1, dark);
    return g;
  }

  function gloss(ctx, x, y, rx, ry, rot) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot || -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function leaf(ctx, x, y, len, wid, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const g = ctx.createLinearGradient(0, -wid, 0, wid);
    g.addColorStop(0, color[0]);
    g.addColorStop(1, color[1]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -wid, len, 0);
    ctx.quadraticCurveTo(len * 0.5, wid, 0, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(len * 0.85, 0);
    ctx.stroke();
    ctx.restore();
  }

  const GREEN_LEAF = ['#7ed957', '#2e8b3a'];

  // ---------------------------------------------------------------------------
  // Fruits : chaque fruit est dessiné autour de (0,0) avec une taille ~200 unités.
  // top/bottom = étendue verticale, face = position et échelle du visage.
  // ---------------------------------------------------------------------------
  const FRUITS = {
    pomme: {
      label: 'Pomme', emoji: '🍎', color: '#e53935', top: -118, bottom: 98,
      face: { x: 0, y: 8, s: 1 },
      draw(ctx) {
        const p = new Path2D();
        p.moveTo(0, -70);
        p.bezierCurveTo(40, -102, 102, -86, 102, -18);
        p.bezierCurveTo(102, 52, 62, 100, 25, 96);
        p.bezierCurveTo(10, 93, -10, 93, -25, 96);
        p.bezierCurveTo(-62, 100, -102, 52, -102, -18);
        p.bezierCurveTo(-102, -86, -40, -102, 0, -70);
        ctx.fillStyle = shade(ctx, 0, 0, 105, '#ff8a80', '#e53935', '#8e1414');
        ctx.fill(p);
        ctx.strokeStyle = '#6d3b1e';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -68);
        ctx.quadraticCurveTo(-2, -95, 10, -116);
        ctx.stroke();
        leaf(ctx, 8, -100, 52, 18, -0.45, GREEN_LEAF);
        gloss(ctx, -52, -42, 18, 30);
      },
    },
    banane: {
      label: 'Banane', emoji: '🍌', color: '#fdd835', top: -62, bottom: 112,
      face: { x: 0, y: 48, s: 0.82 },
      draw(ctx) {
        const p = new Path2D();
        p.moveTo(-108, -46);
        p.quadraticCurveTo(0, 270, 108, -46);
        p.quadraticCurveTo(0, 60, -108, -46);
        const g = ctx.createLinearGradient(0, -40, 0, 115);
        g.addColorStop(0, '#fff59d');
        g.addColorStop(0.45, '#fdd835');
        g.addColorStop(1, '#c79a00');
        ctx.fillStyle = g;
        ctx.fill(p);
        ctx.strokeStyle = 'rgba(150,110,0,0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-92, -30);
        ctx.quadraticCurveTo(0, 180, 92, -30);
        ctx.stroke();
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.ellipse(-106, -45, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(106, -46);
        ctx.rotate(-0.9);
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(-6, -22, 12, 24);
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(-6, -26, 12, 6);
        ctx.restore();
      },
    },
    fraise: {
      label: 'Fraise', emoji: '🍓', color: '#e91e3c', top: -118, bottom: 112,
      face: { x: 0, y: -8, s: 0.92 },
      draw(ctx) {
        const p = new Path2D();
        p.moveTo(0, 112);
        p.bezierCurveTo(-62, 92, -106, 12, -100, -40);
        p.bezierCurveTo(-95, -86, -50, -96, 0, -86);
        p.bezierCurveTo(50, -96, 95, -86, 100, -40);
        p.bezierCurveTo(106, 12, 62, 92, 0, 112);
        ctx.fillStyle = shade(ctx, 0, 0, 110, '#ff8a9a', '#e91e3c', '#8a0a1f');
        ctx.fill(p);
        ctx.fillStyle = '#ffe082';
        let row = 0;
        for (let y = -62; y < 98; y += 23, row++) {
          for (let x = -96 + (row % 2) * 13; x < 100; x += 26) {
            if (!ctx.isPointInPath(p, x, y + 6) || Math.abs(x) < 52 && y > -40 && y < 58) continue;
            ctx.beginPath();
            ctx.ellipse(x, y, 3.2, 5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        for (let i = 0; i < 6; i++) {
          leaf(ctx, 0, -86, 46, 14, Math.PI * (0.05 + i * 0.18), GREEN_LEAF);
        }
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -90);
        ctx.quadraticCurveTo(4, -108, -4, -120);
        ctx.stroke();
        gloss(ctx, -50, -50, 14, 24);
      },
    },
    orange: {
      label: 'Orange', emoji: '🍊', color: '#fb8c00', top: -112, bottom: 100,
      face: { x: 0, y: 4, s: 1 },
      draw(ctx) {
        ctx.fillStyle = shade(ctx, 0, 0, 100, '#ffcc80', '#fb8c00', '#b35400');
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.fill();
        const r = rng(7);
        ctx.fillStyle = 'rgba(150,60,0,0.16)';
        for (let i = 0; i < 90; i++) {
          const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 94;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.arc(0, -98, 6, 0, Math.PI * 2);
        ctx.fill();
        leaf(ctx, 2, -100, 50, 17, -0.35, GREEN_LEAF);
        gloss(ctx, -48, -46, 16, 28);
      },
    },
    citron: {
      label: 'Citron', emoji: '🍋', color: '#fbe33b', top: -84, bottom: 84,
      face: { x: 0, y: 4, s: 0.9 },
      draw(ctx) {
        const p = new Path2D();
        p.ellipse(0, 0, 108, 80, 0, 0, Math.PI * 2);
        p.ellipse(112, 0, 22, 14, 0, 0, Math.PI * 2);
        p.ellipse(-112, 0, 22, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = shade(ctx, 0, 0, 105, '#fffde7', '#fbe33b', '#c9a800');
        ctx.fill(p);
        gloss(ctx, -50, -36, 22, 13, -0.3);
      },
    },
    pasteque: {
      label: 'Pastèque', emoji: '🍉', color: '#ef3b4f', top: -112, bottom: 122,
      face: { x: 0, y: -14, s: 0.86 },
      draw(ctx) {
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.moveTo(-122, -62);
        ctx.quadraticCurveTo(0, -140, 122, -62);
        ctx.lineTo(0, 122);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e8f5c8';
        ctx.beginPath();
        ctx.moveTo(-110, -54);
        ctx.quadraticCurveTo(0, -124, 110, -54);
        ctx.lineTo(0, 110);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = shade(ctx, 0, -10, 110, '#ff8a95', '#ef3b4f', '#b0162a');
        ctx.beginPath();
        ctx.moveTo(-100, -48);
        ctx.quadraticCurveTo(0, -112, 100, -48);
        ctx.lineTo(0, 100);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#1b1b1b';
        [[-40, 45], [38, 42], [0, 72], [-62, 6], [60, 4]].forEach(([x, y]) => {
          ctx.beginPath();
          ctx.ellipse(x, y, 5, 9, x * 0.006, 0, Math.PI * 2);
          ctx.fill();
        });
      },
    },
    avocat: {
      label: 'Avocat', emoji: '🥑', color: '#7cb342', top: -112, bottom: 112,
      face: { x: 0, y: -36, s: 0.76 },
      draw(ctx) {
        const p = new Path2D();
        p.moveTo(0, -112);
        p.bezierCurveTo(46, -112, 56, -56, 66, -16);
        p.bezierCurveTo(102, 30, 92, 112, 0, 112);
        p.bezierCurveTo(-92, 112, -102, 30, -66, -16);
        p.bezierCurveTo(-56, -56, -46, -112, 0, -112);
        ctx.fillStyle = '#33691e';
        ctx.fill(p);
        ctx.save();
        ctx.translate(0, 4);
        ctx.scale(0.86, 0.88);
        const g = ctx.createRadialGradient(-20, -30, 10, 0, 20, 130);
        g.addColorStop(0, '#f4ffb0');
        g.addColorStop(0.6, '#cddc39');
        g.addColorStop(1, '#8bc34a');
        ctx.fillStyle = g;
        ctx.fill(p);
        ctx.restore();
        ctx.fillStyle = shade(ctx, 0, 52, 36, '#c58b5a', '#8d5524', '#5a2f0e');
        ctx.beginPath();
        ctx.arc(0, 52, 36, 0, Math.PI * 2);
        ctx.fill();
        gloss(ctx, -12, 40, 8, 13);
      },
    },
    peche: {
      label: 'Pêche', emoji: '🍑', color: '#ff8a65', top: -116, bottom: 100,
      face: { x: 8, y: 10, s: 0.98 },
      draw(ctx) {
        ctx.fillStyle = shade(ctx, 0, 0, 100, '#ffe0c2', '#ff9e7a', '#d9534a');
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(180,60,40,0.4)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-4, -96);
        ctx.bezierCurveTo(-34, -60, -40, -10, -30, 30);
        ctx.stroke();
        ctx.strokeStyle = '#6d3b1e';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(-2, -96);
        ctx.lineTo(4, -114);
        ctx.stroke();
        leaf(ctx, 4, -108, 50, 17, -0.3, GREEN_LEAF);
        gloss(ctx, -55, -40, 14, 24);
      },
    },
    ananas: {
      label: 'Ananas', emoji: '🍍', color: '#f9a825', top: -205, bottom: 106,
      face: { x: 0, y: 12, s: 0.9 },
      draw(ctx) {
        for (let i = 0; i < 7; i++) {
          const a = -Math.PI / 2 + (i - 3) * 0.32;
          leaf(ctx, 0, -92, 110 - Math.abs(i - 3) * 14, 14, a, ['#9ccc65', '#33691e']);
        }
        const p = new Path2D();
        p.ellipse(0, 6, 86, 102, 0, 0, Math.PI * 2);
        ctx.fillStyle = shade(ctx, 0, 6, 100, '#fff176', '#f9a825', '#a86a00');
        ctx.fill(p);
        ctx.save();
        ctx.clip(p);
        ctx.strokeStyle = 'rgba(120,70,0,0.35)';
        ctx.lineWidth = 3;
        for (let k = -260; k < 260; k += 34) {
          ctx.beginPath();
          ctx.moveTo(k - 120, -110);
          ctx.lineTo(k + 120, 120);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(k + 120, -110);
          ctx.lineTo(k - 120, 120);
          ctx.stroke();
        }
        ctx.restore();
        gloss(ctx, -44, -40, 14, 26);
      },
    },
    tomate: {
      label: 'Tomate', emoji: '🍅', color: '#e53935', top: -108, bottom: 90,
      face: { x: 0, y: 6, s: 0.98 },
      draw(ctx) {
        ctx.fillStyle = shade(ctx, 0, 0, 105, '#ff8a80', '#e53935', '#a31515');
        ctx.beginPath();
        ctx.ellipse(0, 0, 108, 90, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 5; i++) {
          leaf(ctx, 0, -84, 44, 11, Math.PI * (0.1 + i * 0.2), GREEN_LEAF);
        }
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -86);
        ctx.lineTo(3, -106);
        ctx.stroke();
        gloss(ctx, -52, -36, 16, 26);
      },
    },
    kiwi: {
      label: 'Kiwi', emoji: '🥝', color: '#8d6e3f', top: -92, bottom: 90,
      face: { x: 0, y: 4, s: 0.95 },
      draw(ctx) {
        ctx.fillStyle = shade(ctx, 0, 0, 100, '#c9a77a', '#8d6e3f', '#4e3a1f');
        ctx.beginPath();
        ctx.ellipse(0, 0, 104, 90, 0, 0, Math.PI * 2);
        ctx.fill();
        const r = rng(11);
        ctx.strokeStyle = 'rgba(60,40,15,0.35)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 160; i++) {
          const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 96;
          const x = Math.cos(a) * d, y = Math.sin(a) * d * 0.86;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (r() - 0.5) * 6, y + (r() - 0.5) * 6);
          ctx.stroke();
        }
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.ellipse(-104, 0, 6, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        gloss(ctx, -50, -40, 14, 24);
      },
    },
    cerise: {
      label: 'Cerise', emoji: '🍒', color: '#c2185b', top: -178, bottom: 92,
      face: { x: 0, y: 8, s: 0.95 },
      draw(ctx) {
        ctx.strokeStyle = '#5d7a2a';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -84);
        ctx.quadraticCurveTo(10, -140, 40, -172);
        ctx.stroke();
        leaf(ctx, 38, -170, 56, 18, -0.2, GREEN_LEAF);
        const p = new Path2D();
        p.moveTo(0, -78);
        p.bezierCurveTo(30, -102, 96, -82, 96, -6);
        p.bezierCurveTo(96, 60, 50, 92, 0, 92);
        p.bezierCurveTo(-50, 92, -96, 60, -96, -6);
        p.bezierCurveTo(-96, -82, -30, -102, 0, -78);
        ctx.fillStyle = shade(ctx, 0, 0, 100, '#ff6f91', '#c2185b', '#5e0a2a');
        ctx.fill(p);
        gloss(ctx, -46, -40, 16, 28);
      },
    },
    poire: {
      label: 'Poire', emoji: '🍐', color: '#9ccc3c', top: -158, bottom: 124,
      face: { x: 0, y: 38, s: 0.92 },
      draw(ctx) {
        const p = new Path2D();
        p.moveTo(0, -122);
        p.bezierCurveTo(34, -122, 44, -82, 50, -44);
        p.bezierCurveTo(56, -10, 102, 10, 102, 58);
        p.bezierCurveTo(102, 104, 60, 124, 0, 124);
        p.bezierCurveTo(-60, 124, -102, 104, -102, 58);
        p.bezierCurveTo(-102, 10, -56, -10, -50, -44);
        p.bezierCurveTo(-44, -82, -34, -122, 0, -122);
        ctx.fillStyle = shade(ctx, 0, 20, 115, '#e6f59d', '#9ccc3c', '#5b7f12');
        ctx.fill(p);
        ctx.strokeStyle = '#6d3b1e';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -120);
        ctx.quadraticCurveTo(4, -140, -6, -156);
        ctx.stroke();
        leaf(ctx, 0, -138, 46, 15, -0.5, GREEN_LEAF);
        gloss(ctx, -44, 10, 16, 32);
      },
    },
    raisin: {
      label: 'Raisin', emoji: '🍇', color: '#7b3fa0', top: -150, bottom: 140,
      face: { x: 0, y: -18, s: 0.88 },
      draw(ctx) {
        ctx.strokeStyle = '#6d4c2a';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -112);
        ctx.quadraticCurveTo(-4, -134, 8, -148);
        ctx.stroke();
        leaf(ctx, 4, -130, 60, 22, -0.25, GREEN_LEAF);
        const rows = [[-75, 4], [-22, 4], [30, 3], [78, 2], [116, 1]];
        rows.forEach(([y, n]) => {
          for (let i = 0; i < n; i++) {
            const x = (i - (n - 1) / 2) * 52;
            ctx.fillStyle = shade(ctx, x, y, 32, '#d7a8f0', '#8e44ad', '#4a1a63');
            ctx.beginPath();
            ctx.arc(x, y - 6, 31, 0, Math.PI * 2);
            ctx.fill();
            gloss(ctx, x - 11, y - 18, 5, 9);
          }
        });
      },
    },
    coco: {
      label: 'Noix de coco', emoji: '🥥', color: '#6d4c41', top: -100, bottom: 100,
      face: { x: 0, y: 6, s: 1 },
      draw(ctx) {
        ctx.fillStyle = shade(ctx, 0, 0, 100, '#a1887f', '#6d4c41', '#3e2723');
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.clip();
        const r = rng(5);
        ctx.strokeStyle = 'rgba(30,15,5,0.35)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 70; i++) {
          const x = r() * 200 - 100, y = r() * 200 - 100;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + 8, y + 10, x + (r() - 0.5) * 10, y + 22);
          ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = '#2b1a14';
        [[-16, -78], [16, -78], [0, -62]].forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        });
        gloss(ctx, -50, -40, 13, 22);
      },
    },
    carotte: {
      label: 'Carotte', emoji: '🥕', color: '#f57c00', top: -178, bottom: 150,
      face: { x: 0, y: -26, s: 0.78 },
      draw(ctx) {
        for (let i = 0; i < 5; i++) leaf(ctx, 0, -86, 90 - Math.abs(i - 2) * 12, 14, -Math.PI / 2 + (i - 2) * 0.3, GREEN_LEAF);
        const p = new Path2D();
        p.moveTo(-74, -88);
        p.quadraticCurveTo(0, -112, 74, -88);
        p.quadraticCurveTo(84, -20, 12, 146);
        p.quadraticCurveTo(0, 156, -12, 146);
        p.quadraticCurveTo(-84, -20, -74, -88);
        const g = ctx.createLinearGradient(-80, 0, 80, 0);
        g.addColorStop(0, '#c65100');
        g.addColorStop(0.35, '#ffa040');
        g.addColorStop(1, '#d35400');
        ctx.fillStyle = g;
        ctx.fill(p);
        ctx.strokeStyle = 'rgba(120,50,0,0.35)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        [[-40, 30], [10, -26], [50, 18], [90, -10], [120, 6]].forEach(([y, x]) => {
          ctx.beginPath();
          ctx.moveTo(x - 14, y);
          ctx.lineTo(x + 14, y + 4);
          ctx.stroke();
        });
      },
    },
  };

  // ---------------------------------------------------------------------------
  // Visage
  // ---------------------------------------------------------------------------
  const EMOTIONS = {
    neutre: 'Neutre', content: 'Content', fache: 'Fâché', triste: 'Triste', choque: 'Choqué', amoureux: 'Amoureux', malin: 'Malin',
  };

  function drawFace(ctx, f, st) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.s, f.s);
    const em = st.emotion || 'neutre';
    const open = clamp(st.open || 0, 0, 1);
    const blink = em === 'malin' ? 0.45 : clamp(st.blink || 0, 0, 1);
    const look = clamp(st.look || 0, -1, 1);

    // joues
    ctx.fillStyle = em === 'amoureux' || em === 'fache' ? 'rgba(255,40,80,0.4)' : 'rgba(255,90,120,0.28)';
    [-1, 1].forEach((d) => {
      ctx.beginPath();
      ctx.ellipse(d * 50, 24, 15, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // yeux
    const eyeY = -18, eyeX = 33, erx = 17, ery = em === 'choque' ? 25 : 21;
    [-1, 1].forEach((d) => {
      ctx.save();
      ctx.translate(d * eyeX, eyeY);
      const ry = ery * (1 - blink * 0.94);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#2b1a1a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, erx, Math.max(ry, 1.5), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (ry > 5) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, erx, ry, 0, 0, Math.PI * 2);
        ctx.clip();
        const px = look * 6, py = em === 'triste' ? 4 : 2;
        if (em === 'amoureux') {
          ctx.fillStyle = '#e91e63';
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(0.6, 0.6);
          ctx.beginPath();
          ctx.moveTo(0, 6);
          ctx.bezierCurveTo(-20, -8, -10, -24, 0, -12);
          ctx.bezierCurveTo(10, -24, 20, -8, 0, 6);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = '#1d1010';
          ctx.beginPath();
          ctx.arc(px, py, em === 'choque' ? 7 : 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(px - 3.5, py - 4, 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
    });

    // sourcils
    ctx.strokeStyle = '#2b1a1a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const browY = eyeY - ery - 9;
    [-1, 1].forEach((d) => {
      ctx.beginPath();
      if (em === 'fache') {
        ctx.moveTo(d * (eyeX + 16), browY - 6);
        ctx.lineTo(d * (eyeX - 14), browY + 6);
      } else if (em === 'triste') {
        ctx.moveTo(d * (eyeX + 16), browY + 5);
        ctx.lineTo(d * (eyeX - 14), browY - 5);
      } else if (em === 'choque') {
        ctx.arc(d * eyeX, browY + 2, 14, Math.PI * 1.15, Math.PI * 1.85);
      } else if (em === 'malin') {
        if (d < 0) { ctx.moveTo(-eyeX - 15, browY + 4); ctx.lineTo(-eyeX + 14, browY + 2); }
        else ctx.arc(eyeX, browY + 6, 14, Math.PI * 1.15, Math.PI * 1.85);
      } else {
        ctx.arc(d * eyeX, browY + 10, 13, Math.PI * 1.25, Math.PI * 1.75);
      }
      ctx.stroke();
    });

    // bouche
    const my = 34;
    if (open > 0.06) {
      const mw = 20 + open * 8 + (em === 'content' ? 6 : 0);
      const mh = 6 + open * 26;
      ctx.fillStyle = '#4a0f1e';
      ctx.strokeStyle = '#2b1a1a';
      ctx.lineWidth = 3;
      const mouth = new Path2D();
      if (em === 'content' || em === 'amoureux' || em === 'malin') {
        mouth.moveTo(-mw, my - 2);
        mouth.quadraticCurveTo(0, my + 2, mw, my - 2);
        mouth.quadraticCurveTo(mw * 0.9, my + mh * 1.5, 0, my + mh * 1.4);
        mouth.quadraticCurveTo(-mw * 0.9, my + mh * 1.5, -mw, my - 2);
      } else {
        mouth.ellipse(0, my + mh * 0.5, mw * 0.8, mh * 0.75 + 2, 0, 0, Math.PI * 2);
      }
      ctx.fill(mouth);
      ctx.save();
      ctx.clip(mouth);
      ctx.fillStyle = '#ff6f8a';
      ctx.beginPath();
      ctx.ellipse(0, my + mh * 1.25, mw * 0.55, mh * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      if (open > 0.3) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(-mw * 0.55, my - 4, mw * 1.1, 6);
      }
      ctx.restore();
      ctx.stroke(mouth);
    } else {
      ctx.strokeStyle = '#2b1a1a';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (em === 'triste') ctx.arc(0, my + 18, 16, Math.PI * 1.2, Math.PI * 1.8);
      else if (em === 'fache') { ctx.moveTo(-14, my + 4); ctx.lineTo(14, my + 2); }
      else if (em === 'choque') { ctx.ellipse(0, my + 6, 7, 9, 0, 0, Math.PI * 2); }
      else if (em === 'malin') { ctx.moveTo(-14, my + 2); ctx.quadraticCurveTo(4, my + 12, 18, my - 4); }
      else ctx.arc(0, my - 8, 18, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Décors
  // ---------------------------------------------------------------------------
  const BACKGROUNDS = {
    cuisine: 'Cuisine', frigo: 'Frigo', plage: 'Plage', nuit: 'Nuit', studio: 'Studio', marche: 'Marché',
  };

  function drawBackground(ctx, key, t, img) {
    if (key === 'perso' && img) {
      const s = Math.max(W / img.width, H / img.height);
      const iw = img.width * s, ih = img.height * s;
      ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      const g = ctx.createLinearGradient(0, GROUND - 200, 0, H);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      return;
    }
    let g;
    switch (key) {
      case 'frigo': {
        g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#eaf6ff');
        g.addColorStop(1, '#bcdcf2');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(0, 0, 40, H);
        ctx.fillRect(W - 40, 0, 40, H);
        [H * 0.22, H * 0.48].forEach((y) => {
          ctx.fillStyle = 'rgba(140,190,225,0.55)';
          ctx.fillRect(40, y, W - 80, 10);
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillRect(40, y - 3, W - 80, 3);
        });
        const lg = ctx.createRadialGradient(W / 2, 0, 10, W / 2, 0, 600);
        lg.addColorStop(0, 'rgba(255,255,240,0.9)');
        lg.addColorStop(1, 'rgba(255,255,240,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#d8ecf8';
        ctx.fillRect(0, GROUND - 8, W, H);
        ctx.fillStyle = '#a9cde6';
        ctx.fillRect(0, GROUND - 8, W, 8);
        break;
      }
      case 'plage': {
        g = ctx.createLinearGradient(0, 0, 0, H * 0.55);
        g.addColorStop(0, '#4fc3f7');
        g.addColorStop(1, '#b3e5fc');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff59d';
        ctx.beginPath();
        ctx.arc(W * 0.78, H * 0.13, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0288d1';
        ctx.fillRect(0, H * 0.5, W, H * 0.16);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 4;
        for (let i = 0; i < 4; i++) {
          const y = H * 0.53 + i * 38;
          ctx.beginPath();
          for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x / 40 + t * 2 + i) * 5);
          ctx.stroke();
        }
        g = ctx.createLinearGradient(0, H * 0.64, 0, H);
        g.addColorStop(0, '#ffe0a3');
        g.addColorStop(1, '#e9b872');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, H * 0.66);
        ctx.quadraticCurveTo(W / 2, H * 0.62, W, H * 0.66);
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.fill();
        break;
      }
      case 'nuit': {
        g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#0b1033');
        g.addColorStop(1, '#3a2466');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        const r = rng(3);
        for (let i = 0; i < 90; i++) {
          const x = r() * W, y = r() * H * 0.6, s = r() * 2 + 0.6;
          ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i));
          ctx.fillStyle = '#fff';
          ctx.fillRect(x, y, s, s);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff8e1';
        ctx.beginPath();
        ctx.arc(W * 0.24, H * 0.14, 56, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f1640';
        ctx.beginPath();
        ctx.arc(W * 0.24 + 24, H * 0.14 - 12, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1d1440';
        ctx.fillRect(0, GROUND, W, H);
        break;
      }
      case 'studio': {
        g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#ff5fa2');
        g.addColorStop(1, '#6c3cff');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        [[W * 0.2, 0], [W * 0.8, 0]].forEach(([x, y], i) => {
          const sg = ctx.createRadialGradient(x, y, 10, x, y, 700);
          sg.addColorStop(0, 'rgba(255,255,255,' + (0.35 + 0.1 * Math.sin(t * 2 + i)) + ')');
          sg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = sg;
          ctx.fillRect(0, 0, W, H);
        });
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, GROUND, W, H);
        break;
      }
      case 'marche': {
        g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#fff3e0');
        g.addColorStop(1, '#ffe0b2');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        const stripes = 9;
        for (let i = 0; i < stripes; i++) {
          ctx.fillStyle = i % 2 ? '#fff' : '#e53935';
          ctx.beginPath();
          const x0 = (W / stripes) * i, x1 = (W / stripes) * (i + 1);
          ctx.moveTo(x0, 0);
          ctx.lineTo(x1, 0);
          ctx.lineTo(x1, 150);
          ctx.quadraticCurveTo((x0 + x1) / 2, 190, x0, 150);
          ctx.fill();
        }
        ctx.fillStyle = '#8d5a2b';
        ctx.fillRect(0, GROUND - 6, W, H);
        ctx.fillStyle = '#a86b35';
        ctx.fillRect(0, GROUND - 6, W, 18);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 3;
        for (let y = GROUND + 50; y < H; y += 60) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }
        break;
      }
      default: { // cuisine
        g = ctx.createLinearGradient(0, 0, 0, GROUND);
        g.addColorStop(0, '#fff8ec');
        g.addColorStop(1, '#f3e3c8');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(160,130,90,0.18)';
        ctx.lineWidth = 2;
        for (let y = GROUND - 380; y < GROUND; y += 64) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        for (let x = 0; x < W; x += 64) {
          ctx.beginPath(); ctx.moveTo(x, GROUND - 380); ctx.lineTo(x, GROUND); ctx.stroke();
        }
        ctx.fillStyle = '#cfe8ff';
        ctx.fillRect(W * 0.58, 110, 230, 260);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 14;
        ctx.strokeRect(W * 0.58, 110, 230, 260);
        ctx.beginPath();
        ctx.moveTo(W * 0.58 + 115, 110);
        ctx.lineTo(W * 0.58 + 115, 370);
        ctx.stroke();
        g = ctx.createLinearGradient(0, GROUND, 0, H);
        g.addColorStop(0, '#b97a4a');
        g.addColorStop(1, '#7a4a28');
        ctx.fillStyle = g;
        ctx.fillRect(0, GROUND - 10, W, H);
        ctx.fillStyle = '#d9a274';
        ctx.fillRect(0, GROUND - 10, W, 14);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Timeline : calcule quand chaque réplique et chaque mot commencent.
  // ---------------------------------------------------------------------------
  const RATES = { normal: 1, aigue: 1.22, 'tres-aigue': 1.5, grave: 0.82 };

  function buildTimeline(project) {
    let t = 0.4;
    const items = [];
    project.lines.forEach((line, idx) => {
      const words = (line.text || '').trim().split(/\s+/).filter(Boolean);
      if (!words.length && !line.audio) return;
      const ch = project.cast.find((c) => c.id === line.charId) || project.cast[0];
      const rate = RATES[ch && ch.voice] || 1;
      let dur;
      if (line.audio) dur = line.audio.duration / rate;
      else dur = Math.max(1.1, words.reduce((s, w) => s + 0.16 + w.length * 0.055, 0) + 0.3);
      const weights = words.map((w) => w.length + 2);
      const total = weights.reduce((a, b) => a + b, 0) || 1;
      let acc = 0;
      const ws = words.map((w, i) => {
        const s = t + (acc / total) * dur;
        acc += weights[i];
        return { w, start: s, end: t + (acc / total) * dur };
      });
      items.push({ idx, charId: ch ? ch.id : null, start: t, end: t + dur, words: ws, line, rate });
      t += dur + 0.28;
    });
    const end = t + 0.5;
    return { items, end, total: project.outro ? end + 2 : end };
  }

  function currentItem(tl, t) {
    for (const it of tl.items) if (t >= it.start && t < it.end + 0.28) return it;
    return null;
  }

  function syntheticMouth(it, t) {
    if (!it || t > it.end) return 0;
    for (const w of it.words) {
      if (t >= w.start && t < w.end) {
        const syl = Math.max(1, Math.round(w.w.length / 3));
        const p = (t - w.start) / (w.end - w.start);
        return 0.2 + 0.8 * Math.abs(Math.sin(Math.PI * p * syl));
      }
    }
    return 0;
  }

  // ---------------------------------------------------------------------------
  // Sous-titres style TikTok
  // ---------------------------------------------------------------------------
  function chunkWords(words) {
    const chunks = [];
    let cur = [];
    let len = 0;
    words.forEach((w, i) => {
      if (cur.length && (cur.length >= 4 || len + w.w.length > 20)) {
        chunks.push(cur);
        cur = [];
        len = 0;
      }
      cur.push(i);
      len += w.w.length + 1;
    });
    if (cur.length) chunks.push(cur);
    return chunks;
  }

  function drawCaptions(ctx, it, t, ch) {
    if (!it || !it.words.length) return;
    let wi = it.words.findIndex((w) => t >= w.start && t < w.end);
    if (wi < 0) wi = t >= it.end ? it.words.length - 1 : 0;
    const chunks = chunkWords(it.words);
    const chunk = chunks.find((c) => c.includes(wi)) || chunks[0];
    const y0 = H * 0.2;

    // étiquette du nom
    if (ch) {
      const label = (FRUITS[ch.fruit] ? FRUITS[ch.fruit].emoji + ' ' : '') + (ch.name || '');
      ctx.font = '700 34px "Baloo 2", system-ui, sans-serif';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = (FRUITS[ch.fruit] && FRUITS[ch.fruit].color) || '#333';
      roundRect(ctx, W / 2 - tw / 2 - 20, y0 - 112, tw + 40, 54, 27);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, W / 2, y0 - 84);
    }

    // mots du bloc en cours
    ctx.font = '800 64px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const words = chunk.map((i) => it.words[i].w.toUpperCase());
    const space = 24;
    let widths = words.map((w) => ctx.measureText(w).width);
    // mot trop long pour l'écran (ex : « NOOOOOOOOON ») : on réduit la police
    const widest = Math.max(...widths);
    if (widest > W - 80) {
      ctx.font = `800 ${Math.floor(64 * (W - 80) / widest)}px "Baloo 2", system-ui, sans-serif`;
      widths = words.map((w) => ctx.measureText(w).width);
    }
    // retour à la ligne si trop large
    const lines = [[]];
    let lw = 0;
    words.forEach((w, k) => {
      if (lines[lines.length - 1].length && lw + widths[k] > W - 80) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push(k);
      lw += widths[k] + space;
    });
    lines.forEach((ln, li) => {
      const total = ln.reduce((s, k) => s + widths[k], 0) + space * (ln.length - 1);
      let x = (W - total) / 2;
      const y = y0 + li * 76;
      ln.forEach((k) => {
        const active = chunk[k] === wi;
        const pop = active ? 1 + 0.08 * (1 - ease((t - it.words[wi].start) / 0.12)) : 1;
        ctx.save();
        ctx.translate(x + widths[k] / 2, y);
        ctx.scale(pop, pop);
        ctx.lineJoin = 'round';
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#111';
        ctx.strokeText(words[k], -widths[k] / 2, 0);
        ctx.fillStyle = active ? '#ffe14d' : '#fff';
        ctx.fillText(words[k], -widths[k] / 2, 0);
        ctx.restore();
        x += widths[k] + space;
      });
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---------------------------------------------------------------------------
  // Rendu d'une image complète à l'instant t
  // ---------------------------------------------------------------------------
  function layout(n) {
    if (n <= 1) return [{ x: W / 2, s: 2.3 }];
    if (n === 2) return [{ x: W * 0.27, s: 1.6 }, { x: W * 0.73, s: 1.6 }];
    return [{ x: W * 0.18, s: 1.15 }, { x: W * 0.5, s: 1.15 }, { x: W * 0.82, s: 1.15 }];
  }

  function blinkAt(t, phase) {
    const period = 3.4 + phase * 1.3;
    const x = (t + phase * 2.1) % period;
    return x < 0.14 ? Math.sin((x / 0.14) * Math.PI) : 0;
  }

  function drawCharacter(ctx, ch, x, s, st, t, phase) {
    const fr = FRUITS[ch.fruit] || FRUITS.pomme;
    const talk = st.open || 0;
    const sy = 1 + 0.012 * Math.sin(t * 2.2 + phase * 3) + 0.04 * talk;
    const sx = 1 / Math.sqrt(sy);
    const hop = st.hop || 0;
    // ombre
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(x, GROUND + 6, 95 * s * (1 - hop * 0.002), 16 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // tremblement quand il est fâché ou choqué
    let shake = 0;
    if (st.fxTime != null && (st.emotion === 'fache' || st.emotion === 'choque') && st.fxTime < 0.6) {
      shake = Math.sin(st.fxTime * 70) * 5 * (1 - st.fxTime / 0.6);
    }

    ctx.save();
    ctx.translate(x + shake, GROUND - hop);
    ctx.scale(s * sx, s * sy);
    ctx.rotate((st.speaking ? 0.035 * Math.sin(t * 3.1 + phase) : 0.01 * Math.sin(t * 1.3 + phase)));
    ctx.translate(0, -fr.bottom);
    if (st.dim) ctx.filter = 'saturate(0.85) brightness(0.96)';
    fr.draw(ctx);
    ctx.filter = 'none';
    drawFace(ctx, fr.face, st);
    if (st.fxTime != null) drawFx(ctx, fr, st.emotion, st.fxTime);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Effets d'émotion (cœurs, larmes, vapeur…) autour de celui qui parle
  // ---------------------------------------------------------------------------
  function heart(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.9);
    ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.5, x, y - r * 0.5);
    ctx.bezierCurveTo(x + r * 0.7, y - r * 1.5, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
    ctx.fill();
  }

  function drawFx(ctx, fr, emotion, lt) {
    const f = fr.face;
    const top = fr.top;
    ctx.save();
    switch (emotion) {
      case 'amoureux':
        for (let i = 0; i < 4; i++) {
          const p = ((lt * 0.7 + i / 4) % 1);
          ctx.globalAlpha = Math.sin(p * Math.PI);
          ctx.fillStyle = i % 2 ? '#ff4d8d' : '#ff7aa8';
          heart(ctx, (i - 1.5) * 50 + Math.sin(lt * 3 + i) * 10, top - 10 - p * 110, 14 + (i % 2) * 5);
        }
        break;
      case 'triste': {
        ctx.fillStyle = '#6ec6ff';
        [-1, 1].forEach((d) => {
          const p = (lt * 1.2 + (d > 0 ? 0.5 : 0)) % 1;
          const x = f.x + d * 33 * f.s, y = f.y + (-2 + p * 70) * f.s;
          ctx.globalAlpha = 1 - p * 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y - 12);
          ctx.quadraticCurveTo(x + 9, y + 2, x, y + 8);
          ctx.quadraticCurveTo(x - 9, y + 2, x, y - 12);
          ctx.fill();
        });
        break;
      }
      case 'fache':
        for (let i = 0; i < 6; i++) {
          const p = ((lt * 1.4 + i / 6) % 1);
          const d = i % 2 ? 1 : -1;
          ctx.globalAlpha = 0.75 * (1 - p);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(d * (60 + p * 40), top + 20 - p * 70, 10 + p * 16, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#e53935';
        ctx.font = '800 54px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💢', 70, top + 10);
        break;
      case 'choque': {
        const pop = Math.min(1, lt / 0.15);
        ctx.globalAlpha = pop;
        ctx.font = `900 ${Math.round(70 * (0.6 + 0.4 * pop))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#111';
        ctx.fillStyle = '#ffe14d';
        ctx.strokeText('!', 0, top - 10);
        ctx.fillText('!', 0, top - 10);
        ctx.fillStyle = '#9fe0ff';
        const sy = f.y - 50 + (lt % 1.2) * 20;
        ctx.beginPath();
        ctx.moveTo(f.x + 78, sy - 16);
        ctx.quadraticCurveTo(f.x + 90, sy + 4, f.x + 78, sy + 10);
        ctx.quadraticCurveTo(f.x + 66, sy + 4, f.x + 78, sy - 16);
        ctx.fill();
        break;
      }
      case 'content':
        ctx.fillStyle = '#fff59d';
        for (let i = 0; i < 5; i++) {
          const a = i * 1.26 + lt * 0.8;
          const tw = 0.5 + 0.5 * Math.sin(lt * 6 + i * 2);
          const x = Math.cos(a) * 125, y = (top + 60) + Math.sin(a) * 70;
          ctx.globalAlpha = tw;
          ctx.beginPath();
          for (let k = 0; k < 8; k++) {
            const rr = k % 2 ? 4 : 13 * (0.6 + 0.4 * tw);
            ctx.lineTo(x + Math.cos(k * Math.PI / 4) * rr, y + Math.sin(k * Math.PI / 4) * rr);
          }
          ctx.fill();
        }
        break;
      default:
        break;
    }
    ctx.restore();
  }

  function renderFrame(ctx, project, tl, t, opts) {
    opts = opts || {};
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    const it = currentItem(tl, t);
    const speakerId = it && t < it.end ? it.charId : null;
    const cast = project.cast;

    let camZoom = 1;
    if (project.camera === 'focus' && it) {
      camZoom = 1 + 0.06 * ease((t - it.start) / 0.25);
    }
    ctx.translate(W / 2, GROUND);
    ctx.scale(camZoom, camZoom);
    ctx.translate(-W / 2, -GROUND);
    drawBackground(ctx, project.background, t, opts.bgImage);

    const level = opts.level != null ? opts.level : null;
    const visible = project.camera === 'focus'
      ? [cast.find((c) => c.id === (it ? it.charId : null)) || cast[0]].filter(Boolean)
      : cast;
    const pos = layout(visible.length);
    const speakerIdx = visible.findIndex((c) => c.id === speakerId);

    visible.forEach((ch, i) => {
      const speaking = ch.id === speakerId;
      const lineIt = it && it.charId === ch.id ? it : null;
      let open = 0;
      if (speaking) open = level != null && (it.line.audio || it.line.voiced) ? level : syntheticMouth(it, t);
      const lookTarget = speaking ? 0 : speakerIdx >= 0 ? Math.sign(pos[speakerIdx].x - pos[i].x) : 0;
      const hop = lineIt ? 26 * Math.max(0, Math.sin(clamp((t - lineIt.start) / 0.3, 0, 1) * Math.PI)) : 0;
      // garde l'émotion de sa dernière réplique
      let emotion = 'neutre';
      for (const x of tl.items) if (x.charId === ch.id && x.start <= t) emotion = x.line.emotion || 'neutre';
      const fxTime = speaking && project.effects !== false ? t - lineIt.start : null;
      // les fruits hauts (carotte, ananas…) sont réduits pour ne pas cacher les sous-titres
      const fr = FRUITS[ch.fruit] || FRUITS.pomme;
      const s = Math.min(pos[i].s * (visible.length > 1 ? (speaking ? 1.07 : 0.97) : 1), 540 / (fr.bottom - fr.top));
      drawCharacter(ctx, ch, pos[i].x, s, {
        open, blink: blinkAt(t, i * 0.37 + 0.2), emotion, look: lookTarget, speaking, hop, fxTime,
        dim: visible.length > 1 && speakerId && !speaking,
      }, t, i);
    });
    ctx.restore();

    if (project.captions !== false) {
      const ch = it ? cast.find((c) => c.id === it.charId) : null;
      drawCaptions(ctx, it && t < it.end + 0.2 ? it : null, t, ch);
    }

    if (project.title) drawTitle(ctx, project.title);

    if (tl.end != null && tl.total > tl.end && t >= tl.end) drawOutro(ctx, t - tl.end, opts.watermark);

    if (opts.watermark && !(tl.end != null && tl.total > tl.end && t >= tl.end)) {
      ctx.font = '600 24px "Baloo 2", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 5;
      ctx.strokeText(opts.watermark, W / 2, GROUND + 70);
      ctx.fillText(opts.watermark, W / 2, GROUND + 70);
    }
  }

  // Titre fixe en haut de la vidéo (l'accroche TikTok)
  function drawTitle(ctx, title) {
    ctx.save();
    let size = 40;
    ctx.font = `800 ${size}px "Baloo 2", system-ui, sans-serif`;
    let tw = ctx.measureText(title).width;
    if (tw > W - 100) {
      size = Math.floor(size * (W - 100) / tw);
      ctx.font = `800 ${size}px "Baloo 2", system-ui, sans-serif`;
      tw = ctx.measureText(title).width;
    }
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 12;
    roundRect(ctx, W / 2 - tw / 2 - 24, 40, tw + 48, size + 26, 16);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, W / 2, 40 + (size + 26) / 2 + 2);
    ctx.restore();
  }

  // Écran de fin : renvoie vers le site (c'est ce qui fait venir de nouveaux visiteurs)
  function drawOutro(ctx, lt, site) {
    const a = ease(lt / 0.4);
    ctx.save();
    ctx.globalAlpha = a * 0.82;
    ctx.fillStyle = '#1a0f0a';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '120px system-ui, sans-serif';
    const bob = Math.sin(lt * 6) * 10;
    ctx.fillText('🍓🍌🥑', W / 2, H * 0.36 + bob);
    ctx.font = '800 56px "Baloo 2", system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('Crée ta vidéo', W / 2, H * 0.5);
    ctx.fillText('de fruits qui parlent', W / 2, H * 0.5 + 66);
    if (site) {
      ctx.font = '800 40px "Baloo 2", system-ui, sans-serif';
      const tw = ctx.measureText(site).width;
      ctx.fillStyle = '#ffe14d';
      roundRect(ctx, W / 2 - tw / 2 - 26, H * 0.66 - 36, tw + 52, 72, 36);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.fillText(site, W / 2, H * 0.66 + 2);
    }
    ctx.restore();
  }

  window.FruitEngine = {
    W, H, FRUITS, EMOTIONS, BACKGROUNDS, RATES,
    buildTimeline, currentItem, renderFrame, drawFace,
  };
})();
