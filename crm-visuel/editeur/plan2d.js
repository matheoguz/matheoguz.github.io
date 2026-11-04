// Vue 2D de dessus de l'éditeur : dessin du plan de fond, des zones, murs, ouvertures, objets et mesures,
// et toutes les interactions à la souris (sélection, déplacement, poignées, tracé des murs et zones, échelle, mesure).
//   creerPlan2d(canvas, ed) -> { dessiner, cadrer, versEcran, versMonde, planVersMonde, finirTrace, annulerTrace }
//   ed = { doc, sel: Set(ids), outil, accroche, nuit, rappels: { valider(libelle), apercu(), selection(), echelle(p1, p2), zoneCreee(z), outil(nom) } }
import { dessiner2d, MODELES } from './catalogue.js';
import { dist, surface, centre, geometrieMur, projeter, nouvelId, nouvelObjet } from './modele.js';

const COUL_ZONES = ['#60a5fa', '#f59e0b', '#a78bfa', '#34d399', '#f472b6', '#f87171', '#22d3ee', '#a3e635'];
const fmt = (m) => (m < 10 ? m.toFixed(2) : m.toFixed(1)).replace('.', ',') + ' m';

export function creerPlan2d(canvas, ed) {
  const g = canvas.getContext('2d');
  const vue = { x: 10, y: 6.5, k: 40 };
  let W = 0, H = 0, dpr = 1, souris = null, sourisEcran = null, geste = null, trace = [], mesure = [], echelle = [], survolMur = null, espace = false, demande = 0;
  const imgPlan = new Image(); let imgSrc = '';
  imgPlan.onload = () => dessiner();

  const versEcran = (x, y) => ({ x: (x - vue.x) * vue.k + W / 2, y: (y - vue.y) * vue.k + H / 2 });
  const versMonde = (sx, sy) => ({ x: (sx - W / 2) / vue.k + vue.x, y: (sy - H / 2) / vue.k + vue.y });
  const px = () => 1 / vue.k;
  function planVersMonde(ix, iy) {
    const P = ed.doc.plan, a = P.rotation * Math.PI / 180, dx = (ix - P.largeurPx / 2) * P.echelle, dy = (iy - P.hauteurPx / 2) * P.echelle;
    return { x: P.x + dx * Math.cos(a) - dy * Math.sin(a), y: P.y + dx * Math.sin(a) + dy * Math.cos(a) };
  }
  const grille = () => ed.doc.reglages.grille || 0.1;
  const arr = (v) => Math.round(v / grille()) * grille();
  const arr3 = (v) => Math.round(v * 1000) / 1000;

  // ---------- recherche ----------
  function extremites(sauf) { const l = []; for (const m of ed.doc.murs) if (m.id !== sauf) l.push(m.a, m.b); return l; }
  // point accroché : extrémités des murs (10 px), sinon grille ; Maj = angle droit par rapport à « depuis »
  function accrocher(p, depuis, maj, sauf) {
    let q = { x: p.x, y: p.y };
    if (maj && depuis) { if (Math.abs(q.x - depuis.x) > Math.abs(q.y - depuis.y)) q.y = depuis.y; else q.x = depuis.x; }
    if (ed.accroche) {
      let best = null, bd = 10 / vue.k;
      for (const e of [...extremites(sauf), ...trace]) { const d = dist(e, q); if (d < bd) { bd = d; best = e; } }
      if (best && (!maj || !depuis || Math.abs(best.x - depuis.x) < 1e-6 || Math.abs(best.y - depuis.y) < 1e-6)) return { x: best.x, y: best.y, colle: true };
      q = { x: arr(q.x), y: arr(q.y) };
      if (maj && depuis) { if (Math.abs(p.x - depuis.x) > Math.abs(p.y - depuis.y)) q.y = depuis.y; else q.x = depuis.x; }
    }
    return { x: arr3(q.x), y: arr3(q.y) };
  }
  function local(o, p) { const a = -o.rotation * Math.PI / 180, dx = p.x - o.x, dy = p.y - o.y; return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) }; }
  function deLocal(o, lx, ly) { const a = o.rotation * Math.PI / 180; return { x: o.x + lx * Math.cos(a) - ly * Math.sin(a), y: o.y + lx * Math.sin(a) + ly * Math.cos(a) }; }
  function dansPoly(p, pts) { let d = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) d = !d; } return d; }
  function toucher(p) {
    const d = ed.doc, C = d.calques, tol = 4 / vue.k;
    if (C.murs) for (const o of d.ouvertures) { const m = d.murs.find((w) => w.id === o.mur); const G = geometrieMur(m, d.ouvertures); const it = G.ouv.find((u) => u.o === o); const pr = projeter(p, m.a, m.b); if (pr.d < m.epaisseur / 2 + tol && pr.t >= it.debut - tol && pr.t <= it.fin + tol) return o; }
    if (C.objets) for (let i = d.objets.length - 1; i >= 0; i--) { const o = d.objets[i], l = local(o, p); if (Math.abs(l.x) <= Math.max(o.largeur / 2, 6 / vue.k) && Math.abs(l.y) <= Math.max(o.profondeur / 2, 6 / vue.k)) return o; }
    if (C.murs) for (const m of d.murs) if (projeter(p, m.a, m.b).d < m.epaisseur / 2 + tol) return m;
    if (C.zones) for (let i = d.zones.length - 1; i >= 0; i--) if (dansPoly(p, d.zones[i].points)) return d.zones[i];
    return null;
  }
  const trouver = (id) => { const d = ed.doc; for (const k of ['objets', 'murs', 'ouvertures', 'zones']) { const e = d[k].find((x) => x.id === id); if (e) return [k, e]; } return [null, null]; };
  const choisis = () => [...ed.sel].map(trouver).filter(([k]) => k);
  // poignées de la sélection (un seul élément)
  function poignees() {
    const s = choisis(); if (s.length !== 1) return [];
    const [k, e] = s[0], l = [];
    if (k === 'objets') { l.push({ type: 'rot', e, p: deLocal(e, 0, -e.profondeur / 2 - 26 / vue.k) }); l.push({ type: 'taille', e, p: deLocal(e, e.largeur / 2, e.profondeur / 2) }); }
    if (k === 'murs') { l.push({ type: 'bout', e, cote: 'a', p: e.a }, { type: 'bout', e, cote: 'b', p: e.b }); }
    if (k === 'zones') e.points.forEach((p, i) => l.push({ type: 'sommet', e, i, p }));
    return l;
  }

  // ---------- dessin ----------
  function taille() { const r = canvas.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); dessiner(); }
  new ResizeObserver(taille).observe(canvas);
  function dessiner() { if (!demande) demande = requestAnimationFrame(() => { demande = 0; peindre(); }); }
  function etiquette(txt, x, y, { fond = 'rgba(255,255,255,.92)', couleur = '#0f172a', taillePx = 11, gras = 600 } = {}) {
    g.font = `${gras} ${taillePx}px Inter, system-ui, sans-serif`; const w = g.measureText(txt).width + 10;
    g.fillStyle = fond; g.beginPath(); g.roundRect ? g.roundRect(x - w / 2, y - taillePx * 0.8 - 2, w, taillePx * 1.6 + 2, 5) : g.rect(x - w / 2, y - 10, w, 20); g.fill();
    g.fillStyle = couleur; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y + 0.5);
  }
  function peindre() {
    const d = ed.doc, C = d.calques, nuit = ed.nuit;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = nuit ? '#0e1424' : '#f4f6fa'; g.fillRect(0, 0, W, H);
    // grille : 1 m (et 10 cm de près), 5 m plus marquée
    const tl = versMonde(0, 0), br = versMonde(W, H);
    const pas = [[0.1, vue.k > 90], [1, vue.k > 9], [5, true]];
    for (const [s, ok] of pas) { if (!ok) continue; g.strokeStyle = nuit ? (s === 5 ? 'rgba(148,163,184,.16)' : 'rgba(148,163,184,.07)') : (s === 5 ? 'rgba(15,23,42,.09)' : s === 1 ? 'rgba(15,23,42,.05)' : 'rgba(15,23,42,.03)'); g.lineWidth = 1; g.beginPath();
      for (let x = Math.floor(tl.x / s) * s; x <= br.x; x += s) { const X = Math.round(versEcran(x, 0).x) + 0.5; g.moveTo(X, 0); g.lineTo(X, H); }
      for (let y = Math.floor(tl.y / s) * s; y <= br.y; y += s) { const Y = Math.round(versEcran(0, y).y) + 0.5; g.moveTo(0, Y); g.lineTo(W, Y); } g.stroke(); }
    g.save(); g.translate(W / 2 - vue.x * vue.k, H / 2 - vue.y * vue.k); g.scale(vue.k, vue.k);
    // plan de fond
    const P = d.plan;
    if (P && C.plan) {
      if (imgSrc !== P.image) { imgSrc = P.image; imgPlan.src = P.image; }
      if (imgPlan.complete && imgPlan.naturalWidth) {
        const rc = P.recadrage, sx = rc.gauche * P.largeurPx, sy = rc.haut * P.hauteurPx, sw = P.largeurPx * (1 - rc.gauche - rc.droite), sh = P.hauteurPx * (1 - rc.haut - rc.bas);
        g.save(); g.translate(P.x, P.y); g.rotate(P.rotation * Math.PI / 180); g.scale(P.echelle, P.echelle); g.globalAlpha = P.opacite;
        g.drawImage(imgPlan, sx * imgPlan.naturalWidth / P.largeurPx, sy * imgPlan.naturalHeight / P.hauteurPx, sw * imgPlan.naturalWidth / P.largeurPx, sh * imgPlan.naturalHeight / P.hauteurPx, sx - P.largeurPx / 2, sy - P.hauteurPx / 2, sw, sh);
        g.restore();
      }
    }
    // zones
    if (C.zones) for (const z of d.zones) {
      g.beginPath(); z.points.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath();
      g.globalAlpha = 0.18; g.fillStyle = z.couleur; g.fill(); g.globalAlpha = 1; g.strokeStyle = z.couleur; g.lineWidth = 1.5 * px(); g.setLineDash([6 * px(), 4 * px()]); g.stroke(); g.setLineDash([]);
    }
    // murs : morceaux pleins, puis ouvertures
    if (C.murs) {
      g.lineCap = 'square'; g.strokeStyle = nuit ? '#8b98bb' : '#1f2b4d';
      for (const m of d.murs) {
        const G = geometrieMur(m, d.ouvertures); g.lineWidth = m.epaisseur;
        let t = 0; const seg = (t0, t1) => { if (t1 - t0 < 0.001) return; g.lineCap = (t0 === 0 && t1 === G.L) ? 'square' : 'butt'; g.beginPath(); g.moveTo(m.a.x + G.ux * t0, m.a.y + G.uy * t0); g.lineTo(m.a.x + G.ux * t1, m.a.y + G.uy * t1); g.stroke(); };
        if (!G.ouv.length) { seg(0, G.L); continue; }
        // coins carrés aux deux bouts
        g.fillStyle = g.strokeStyle; for (const e of [m.a, m.b]) g.fillRect(e.x - m.epaisseur / 2, e.y - m.epaisseur / 2, m.epaisseur, m.epaisseur);
        for (const u of G.ouv) { seg(t, u.debut); t = Math.max(t, u.fin); } seg(t, G.L);
        g.lineCap = 'butt';
        for (const { o, debut, fin } of G.ouv) {
          const ax = m.a.x + G.ux * debut, ay = m.a.y + G.uy * debut, bx = m.a.x + G.ux * fin, by = m.a.y + G.uy * fin;
          if (o.type === 'fenetre') { g.strokeStyle = '#38bdf8'; g.lineWidth = m.epaisseur * 0.45; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.strokeStyle = nuit ? '#0e1424' : '#f4f6fa'; g.lineWidth = m.epaisseur * 0.12; g.stroke(); }
          else { const w = fin - debut, a0 = Math.atan2(G.uy, G.ux); g.strokeStyle = nuit ? '#cbd5e1' : '#475569'; g.lineWidth = 1.2 * px(); g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + G.nx * w, ay + G.ny * w); g.arc(ax, ay, w, a0 + Math.PI / 2, a0, true); g.stroke(); }
          g.strokeStyle = nuit ? '#8b98bb' : '#1f2b4d';
        }
      }
      g.lineCap = 'butt';
    }
    // objets
    if (C.objets) for (const o of d.objets) { g.save(); g.translate(o.x, o.y); g.rotate(o.rotation * Math.PI / 180); dessiner2d(g, o, px()); g.restore(); }
    // sélection
    g.lineWidth = 2 * px(); g.strokeStyle = '#2563eb';
    for (const [k, e] of choisis()) {
      if (k === 'objets') { g.save(); g.translate(e.x, e.y); g.rotate(e.rotation * Math.PI / 180); g.strokeRect(-e.largeur / 2 - 3 * px(), -e.profondeur / 2 - 3 * px(), e.largeur + 6 * px(), e.profondeur + 6 * px()); if (choisis().length === 1) { g.beginPath(); g.moveTo(0, -e.profondeur / 2 - 3 * px()); g.lineTo(0, -e.profondeur / 2 - 26 * px()); g.stroke(); } g.restore(); }
      if (k === 'murs') { g.globalAlpha = 0.35; g.lineWidth = e.epaisseur + 6 * px(); g.lineCap = 'round'; g.beginPath(); g.moveTo(e.a.x, e.a.y); g.lineTo(e.b.x, e.b.y); g.stroke(); g.globalAlpha = 1; g.lineWidth = 2 * px(); g.lineCap = 'butt'; }
      if (k === 'zones') { g.beginPath(); e.points.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.stroke(); }
      if (k === 'ouvertures') { const m = d.murs.find((w) => w.id === e.mur), G = geometrieMur(m, d.ouvertures), u = G.ouv.find((x) => x.o === e); g.globalAlpha = 0.5; g.lineWidth = m.epaisseur + 8 * px(); g.beginPath(); g.moveTo(m.a.x + G.ux * u.debut, m.a.y + G.uy * u.debut); g.lineTo(m.a.x + G.ux * u.fin, m.a.y + G.uy * u.fin); g.stroke(); g.globalAlpha = 1; g.lineWidth = 2 * px(); }
    }
    g.restore();
    // poignées (en pixels)
    for (const h of poignees()) { const s = versEcran(h.p.x, h.p.y); g.beginPath(); g.arc(s.x, s.y, h.type === 'rot' ? 6 : 5, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#2563eb'; g.stroke(); }
    // textes : noms des zones, longueurs des murs, noms des objets
    if (C.zones) for (const z of d.zones) { const c = versEcran(...Object.values(centre(z.points))); etiquette(z.nom, c.x, c.y - 8, { couleur: '#0f172a', taillePx: 12, gras: 700 }); if (vue.k > 14) etiquette(surface(z.points).toFixed(1).replace('.', ',') + ' m²', c.x, c.y + 11, { couleur: '#475569', taillePx: 10, gras: 500 }); }
    if (C.murs && vue.k > 10) for (const m of d.murs) { const L = dist(m.a, m.b); if (L * vue.k < 56) continue; const G = geometrieMur(m, d.ouvertures), off = (m.epaisseur / 2) * vue.k + 11; const c = versEcran((m.a.x + m.b.x) / 2, (m.a.y + m.b.y) / 2); etiquette(fmt(L), c.x + G.nx * off, c.y + G.ny * off, { fond: nuit ? 'rgba(15,23,42,.85)' : 'rgba(255,255,255,.85)', couleur: nuit ? '#cbd5e1' : '#334155', taillePx: 10, gras: 600 }); }
    if (C.objets && vue.k > 22) for (const o of d.objets) { if (Math.max(o.largeur, o.profondeur) * vue.k < 60 || ed.sel.has(o.id)) continue; const c = versEcran(o.x, o.y); etiquette(o.nom, c.x, c.y, { fond: 'rgba(255,255,255,.8)', taillePx: 10, gras: 600 }); }
    const s1 = choisis(); if (s1.length === 1 && s1[0][0] === 'objets') { const e = s1[0][1], c = versEcran(e.x, e.y); etiquette(`${e.nom} · ${fmt(e.largeur)} × ${fmt(e.profondeur)}`, c.x, c.y + (e.profondeur / 2) * vue.k + 18, { fond: '#2563eb', couleur: '#fff', taillePx: 11 }); }
    // aperçus des outils
    const pS = souris && accrocher(souris, trace[trace.length - 1] || mesure[0] || echelle[0], souris.maj);
    const ligne = (pts, coul, l = 2, tir) => { g.strokeStyle = coul; g.lineWidth = l; g.setLineDash(tir || []); g.beginPath(); pts.forEach((p, i) => { const s = versEcran(p.x, p.y); i ? g.lineTo(s.x, s.y) : g.moveTo(s.x, s.y); }); g.stroke(); g.setLineDash([]); };
    if ((ed.outil === 'mur' || ed.outil === 'zone') && pS) {
      const pts = [...trace, pS]; ligne(pts, ed.outil === 'mur' ? '#2563eb' : '#7c3aed', ed.outil === 'mur' ? Math.max(2, ed.doc.reglages.epaisseurMurs * vue.k) : 2, ed.outil === 'zone' ? [6, 4] : null);
      if (ed.outil === 'zone' && trace.length > 1) ligne([pS, trace[0]], '#7c3aed', 1, [3, 4]);
      const s = versEcran(pS.x, pS.y); g.beginPath(); g.arc(s.x, s.y, pS.colle ? 7 : 4, 0, 7); g.fillStyle = pS.colle ? '#16a34a' : '#2563eb'; g.fill();
      if (trace.length) { const a = trace[trace.length - 1]; etiquette(fmt(dist(a, pS)), s.x + 16, s.y - 16, { fond: '#0f172a', couleur: '#fff' }); }
    }
    if ((ed.outil === 'porte' || ed.outil === 'fenetre') && survolMur) { const { m, t, w } = survolMur, G = geometrieMur(m, []); ligne([{ x: m.a.x + G.ux * (t - w / 2), y: m.a.y + G.uy * (t - w / 2) }, { x: m.a.x + G.ux * (t + w / 2), y: m.a.y + G.uy * (t + w / 2) }], ed.outil === 'porte' ? '#ea580c' : '#0ea5e9', m.epaisseur * vue.k + 4); }
    for (const [pts, coul, txt] of [[mesure, '#ea580c', 'mesure'], [echelle, '#dc2626', 'echelle']]) {
      if (ed.outil !== txt && !(txt === 'echelle' && pts.length === 2)) continue;
      const l = pts.length === 2 ? pts : pts.length && pS ? [pts[0], pS] : []; if (!l.length) continue;
      ligne(l, coul, 2); for (const p of l) { const s = versEcran(p.x, p.y); g.beginPath(); g.arc(s.x, s.y, 5, 0, 7); g.fillStyle = coul; g.fill(); }
      const a = versEcran(l[0].x, l[0].y), b = versEcran(l[1].x, l[1].y); etiquette(fmt(dist(l[0], l[1])), (a.x + b.x) / 2, (a.y + b.y) / 2 - 14, { fond: coul, couleur: '#fff' });
    }
    if (geste && geste.type === 'cadre') { const a = geste.e0, b = sourisEcran; g.fillStyle = 'rgba(37,99,235,.08)'; g.strokeStyle = '#2563eb'; g.lineWidth = 1; g.fillRect(a.x, a.y, b.x - a.x, b.y - a.y); g.strokeRect(a.x + 0.5, a.y + 0.5, b.x - a.x, b.y - a.y); }
    // règle d'échelle en bas à gauche
    const lm = [1, 2, 5, 10, 20, 50].find((v) => v * vue.k >= 70) || 100;
    g.fillStyle = nuit ? '#cbd5e1' : '#334155'; g.fillRect(16, H - 22, lm * vue.k, 3); g.fillRect(16, H - 28, 2, 9); g.fillRect(16 + lm * vue.k - 2, H - 28, 2, 9);
    g.font = '600 11px Inter, system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText(lm + ' m', 22 + lm * vue.k, H - 18);
  }

  // ---------- souris ----------
  const pos = (ev) => { const r = canvas.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; };
  canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
  canvas.addEventListener('wheel', (ev) => { ev.preventDefault(); const s = pos(ev), avant = versMonde(s.x, s.y); vue.k = Math.max(4, Math.min(400, vue.k * Math.exp(-ev.deltaY * 0.0015))); const apres = versMonde(s.x, s.y); vue.x += avant.x - apres.x; vue.y += avant.y - apres.y; dessiner(); }, { passive: false });
  canvas.addEventListener('pointerdown', (ev) => {
    canvas.setPointerCapture(ev.pointerId); canvas.focus({ preventScroll: true });
    const s = pos(ev), p = versMonde(s.x, s.y); p.maj = ev.shiftKey;
    if (ev.button === 1 || ev.button === 2 || espace || ed.outil === 'main') { geste = { type: 'vue', e0: s, v0: { ...vue } }; canvas.style.cursor = 'grabbing'; return; }
    if (ev.button !== 0) return;
    const O = ed.outil, d = ed.doc;
    if (O === 'mur') {
      const q = accrocher(p, trace[trace.length - 1], ev.shiftKey);
      if (trace.length) {
        const a = trace[trace.length - 1]; if (dist(a, q) < 0.01) return;
        d.murs.push({ id: nouvelId(d, 'm'), a: { x: a.x, y: a.y }, b: { x: q.x, y: q.y }, epaisseur: d.reglages.epaisseurMurs });
        ed.rappels.valider('Mur tracé');
        if (dist(trace[0], q) < 0.01) { trace = []; dessiner(); return; } // fermé
      }
      trace.push({ x: q.x, y: q.y }); dessiner(); return;
    }
    if (O === 'zone') {
      const q = accrocher(p, trace[trace.length - 1], ev.shiftKey);
      if (trace.length >= 3 && dist(trace[0], q) * vue.k < 12) { finirTrace(); return; }
      if (!trace.length || dist(trace[trace.length - 1], q) > 0.01) trace.push({ x: q.x, y: q.y }); dessiner(); return;
    }
    if (O === 'porte' || O === 'fenetre') {
      if (!survolMur) return; const { m, t, w } = survolMur, porte = O === 'porte';
      const o = { id: nouvelId(d, 'ou'), type: O, mur: m.id, position: arr3(t), largeur: w, hauteur: porte ? 2.1 : 1.2, allege: porte ? 0 : 0.9 };
      d.ouvertures.push(o); ed.sel = new Set([o.id]); ed.rappels.valider(porte ? 'Porte posée' : 'Fenêtre posée'); ed.rappels.selection(); return;
    }
    if (O === 'mesure' || O === 'echelle') {
      const L = O === 'mesure' ? mesure : echelle; const q = accrocher(p, L[0], ev.shiftKey);
      if (L.length >= 2) L.length = 0; L.push({ x: q.x, y: q.y });
      if (O === 'echelle' && L.length === 2) ed.rappels.echelle(L[0], L[1]);
      dessiner(); return;
    }
    // sélection
    const h = poignees().find((h) => { const e = versEcran(h.p.x, h.p.y); return Math.hypot(e.x - s.x, e.y - s.y) < 9; });
    if (h) {
      const lies = h.type === 'bout' ? d.murs.flatMap((m) => ['a', 'b'].filter((c) => m !== h.e && dist(m[c], h.e[h.cote]) < 0.001).map((c) => [m, c])) : [];
      geste = { type: h.type, h, lies, bouge: false }; return;
    }
    const e = toucher(p);
    // une zone pas encore choisie : glisser dessus encadre (les zones couvrent tout), un simple clic la choisit
    if (e && e.points && !ed.sel.has(e.id) && !ev.shiftKey && !ev.ctrlKey && !ev.metaKey) { geste = { type: 'cadre', e0: s, zone: e }; sourisEcran = s; return; }
    if (e) {
      if (ev.shiftKey || ev.ctrlKey || ev.metaKey) { ed.sel.has(e.id) ? ed.sel.delete(e.id) : ed.sel.add(e.id); ed.rappels.selection(); dessiner(); return; }
      if (!ed.sel.has(e.id)) { ed.sel = new Set([e.id]); ed.rappels.selection(); }
      const orig = choisis().map(([k, x]) => [k, x, JSON.parse(JSON.stringify(x))]);
      geste = { type: 'deplacer', p0: p, ref: orig.find(([, x]) => x === e), orig, bouge: false }; dessiner(); return;
    }
    geste = { type: 'cadre', e0: s, ajout: ev.shiftKey }; if (!ev.shiftKey && ed.sel.size) { ed.sel = new Set(); ed.rappels.selection(); }
    sourisEcran = s; dessiner();
  });
  canvas.addEventListener('pointermove', (ev) => {
    const s = pos(ev), p = versMonde(s.x, s.y); p.maj = ev.shiftKey; souris = p; sourisEcran = s;
    const d = ed.doc;
    if (ed.outil === 'porte' || ed.outil === 'fenetre') {
      survolMur = null; let bd = 0.8;
      for (const m of d.murs) { const pr = projeter(p, m.a, m.b); if (pr.d < bd) { bd = pr.d; const L = dist(m.a, m.b), w = Math.min(L, ed.outil === 'porte' ? 0.9 : 1.2); survolMur = { m, w, t: Math.max(w / 2, Math.min(L - w / 2, Math.round(pr.t / 0.05) * 0.05)) }; } }
    }
    if (!geste) { if (ed.outil === 'selection') canvas.style.cursor = espace ? 'grab' : toucher(p) ? 'move' : 'default'; dessiner(); return; }
    if (geste.type === 'vue') { vue.x = geste.v0.x - (s.x - geste.e0.x) / vue.k; vue.y = geste.v0.y - (s.y - geste.e0.y) / vue.k; dessiner(); return; }
    if (geste.type === 'cadre') { dessiner(); return; }
    geste.bouge = true;
    if (geste.type === 'deplacer') {
      let dx = p.x - geste.p0.x, dy = p.y - geste.p0.y;
      if (ev.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
      const [rk, , ro] = geste.ref; const base = rk === 'objets' ? ro : rk === 'murs' ? ro.a : rk === 'zones' ? ro.points[0] : null;
      if (base && ed.accroche) { dx = arr(base.x + dx) - base.x; dy = arr(base.y + dy) - base.y; }
      for (const [k, x, o] of geste.orig) {
        if (k === 'objets') { x.x = arr3(o.x + dx); x.y = arr3(o.y + dy); }
        if (k === 'murs') { for (const c of ['a', 'b']) x[c] = { x: arr3(o[c].x + dx), y: arr3(o[c].y + dy) }; }
        if (k === 'zones') x.points = o.points.map((q) => ({ x: arr3(q.x + dx), y: arr3(q.y + dy) }));
        if (k === 'ouvertures') { const m = d.murs.find((w) => w.id === x.mur), G = geometrieMur(m, []); x.position = arr3(Math.max(x.largeur / 2, Math.min(G.L - x.largeur / 2, Math.round((o.position + (p.x - geste.p0.x) * G.ux + (p.y - geste.p0.y) * G.uy) / 0.05) * 0.05))); }
      }
    } else if (geste.type === 'rot') { const e = geste.h.e; let a = Math.atan2(p.y - e.y, p.x - e.x) * 180 / Math.PI + 90; a = ev.shiftKey ? Math.round(a) : Math.round(a / 15) * 15; e.rotation = ((a % 360) + 360) % 360; }
    else if (geste.type === 'taille') { const e = geste.h.e, l = local(e, p), sn = (v) => Math.max(0.1, ed.accroche ? arr(v) : arr3(v)); e.largeur = sn(Math.abs(l.x) * 2); if (!ev.shiftKey) e.profondeur = sn(Math.abs(l.y) * 2); }
    else if (geste.type === 'bout') { const { e, cote } = geste.h, autre = e[cote === 'a' ? 'b' : 'a'], q = accrocher(p, autre, ev.shiftKey, e.id); e[cote] = { x: q.x, y: q.y }; for (const [m, c] of geste.lies) m[c] = { x: q.x, y: q.y }; }
    else if (geste.type === 'sommet') { const q = accrocher(p, null, false); geste.h.e.points[geste.h.i] = { x: q.x, y: q.y }; }
    ed.rappels.apercu(); dessiner();
  });
  const fin = (ev) => {
    if (!geste) return; const G = geste; geste = null; canvas.style.cursor = '';
    if (G.type === 'cadre') {
      const a = versMonde(G.e0.x, G.e0.y), b = sourisEcran ? versMonde(sourisEcran.x, sourisEcran.y) : a, x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
      if (G.zone && (x1 - x0) * vue.k <= 4 && (y1 - y0) * vue.k <= 4) { ed.sel = new Set([G.zone.id]); ed.rappels.selection(); }
      else if ((x1 - x0) * vue.k > 4 || (y1 - y0) * vue.k > 4) {
        if (G.zone && ed.sel.size) ed.sel = new Set();
        const dedans = (q) => q.x >= x0 && q.x <= x1 && q.y >= y0 && q.y <= y1, d = ed.doc, C = d.calques;
        if (C.objets) d.objets.filter(dedans).forEach((o) => ed.sel.add(o.id));
        if (C.murs) d.murs.filter((m) => dedans(m.a) && dedans(m.b)).forEach((m) => ed.sel.add(m.id));
        if (C.zones) d.zones.filter((z) => dedans(centre(z.points))).forEach((z) => ed.sel.add(z.id));
        ed.rappels.selection();
      }
    } else if (G.bouge) ed.rappels.valider({ deplacer: 'Déplacement', rot: 'Rotation', taille: 'Redimensionnement', bout: 'Mur modifié', sommet: 'Zone modifiée' }[G.type] || 'Modification');
    dessiner();
  };
  canvas.addEventListener('pointerup', fin); canvas.addEventListener('pointercancel', fin);
  canvas.addEventListener('pointerleave', () => { souris = null; survolMur = null; dessiner(); });
  canvas.addEventListener('dblclick', () => { if (ed.outil === 'mur' || ed.outil === 'zone') finirTrace(); });
  addEventListener('keydown', (ev) => { if (ev.code === 'Space' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { espace = true; canvas.style.cursor = 'grab'; ev.preventDefault(); } });
  addEventListener('keyup', (ev) => { if (ev.code === 'Space') { espace = false; canvas.style.cursor = ''; } });

  function finirTrace() {
    if (ed.outil === 'zone' && trace.length >= 3) {
      const d = ed.doc, z = { id: nouvelId(d, 'z'), nom: 'Zone ' + (d.zones.length + 1), type: 'zone', couleur: COUL_ZONES[d.zones.length % COUL_ZONES.length], points: trace.map((p) => ({ x: p.x, y: p.y })) };
      d.zones.push(z); trace = []; ed.sel = new Set([z.id]); ed.rappels.valider('Zone créée'); ed.rappels.zoneCreee(z); return;
    }
    trace = []; dessiner();
  }
  function annulerTrace() { const avait = trace.length || mesure.length || echelle.length; trace = []; mesure = []; echelle = []; survolMur = null; dessiner(); return avait; }
  // cadre la vue sur tout le contenu (ou le plan)
  function cadrer() {
    const r = canvas.getBoundingClientRect(); if (r.width && (r.width !== W || r.height !== H)) taille();
    const d = ed.doc, pts = [];
    d.murs.forEach((m) => pts.push(m.a, m.b)); d.zones.forEach((z) => pts.push(...z.points)); d.objets.forEach((o) => pts.push(o));
    if (!pts.length && d.plan) { const P = d.plan; pts.push(planVersMonde(0, 0), planVersMonde(P.largeurPx, P.hauteurPx), planVersMonde(P.largeurPx, 0), planVersMonde(0, P.hauteurPx)); }
    if (!pts.length) { vue.x = 10; vue.y = 6.5; vue.k = 40; dessiner(); return; }
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    vue.x = (x0 + x1) / 2; vue.y = (y0 + y1) / 2; vue.k = Math.max(4, Math.min(200, Math.min((W - 80) / Math.max(1, x1 - x0), (H - 80) / Math.max(1, y1 - y0))));
    dessiner();
  }
  // pose un objet de la bibliothèque (glisser-déposer ou clic) au point écran donné, ou au centre de la vue
  function poser(modele, sx = W / 2, sy = H / 2) {
    const p = versMonde(sx, sy), d = ed.doc, o = nouvelObjet(d, modele, arr(p.x), arr(p.y));
    d.objets.push(o); ed.sel = new Set([o.id]); ed.rappels.valider('Objet posé : ' + MODELES[modele].nom); ed.rappels.selection(); return o;
  }
  canvas.addEventListener('dragover', (ev) => { if ([...ev.dataTransfer.types].includes('text/x-modele')) { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; } });
  canvas.addEventListener('drop', (ev) => { const m = ev.dataTransfer.getData('text/x-modele'); if (!m) return; ev.preventDefault(); const s = pos(ev); poser(m, s.x, s.y); });

  return { dessiner, cadrer, versEcran, versMonde, planVersMonde, finirTrace, annulerTrace, poser, vue, enTrace: () => trace.length > 0 };
}
