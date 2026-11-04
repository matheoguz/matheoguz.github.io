// Visite guidée des démos « CRM visuel 3D » : bulle + halo sur l'élément visé, Suivant / Passer, barre de progression.
// Certaines étapes font faire une vraie action au visiteur (cliquer sur « Voir », ouvrir une caisse…) : l'étape passe
// toute seule quand il clique sur l'élément ; « Le faire pour moi » clique à sa place.
// Ouverte une fois à la première visite (mémorisé en localStorage), relancée par le bouton « Visite guidée ».
// ?visite=0 la désactive (aperçus intégrés). Style dans interface.css (classes vg-*).
//
//   installerVisite({ cle, etapes, hote, auto })
//     etapes : [{ cible: () => Element, titre, texte (chaîne ou fonction), avant?: () => void, action?: true }]

const IC_VISITE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>';
const REDUIT = matchMedia('(prefers-reduced-motion: reduce)');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function installerVisite({ cle, etapes, hote, auto = true, delai = 1200 }) {
  const CLE = 'crm-visite-' + cle;
  const vue = () => { try { return localStorage.getItem(CLE) === 'vue'; } catch { return false; } };
  const marquer = () => { try { localStorage.setItem(CLE, 'vue'); } catch { /* stockage bloqué : la visite reviendra */ } };
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'bt-entete bt-visite'; b.id = 'btn-visite'; b.title = 'Visite guidée (30 secondes)';
  b.innerHTML = `${IC_VISITE}<span>Visite guidée</span>`;
  hote.prepend(b);
  b.addEventListener('click', () => demarrer());

  let i = -1, halo = null, bulle = null, boucle = 0, dernier = '';
  function construire() {
    halo = document.createElement('div'); halo.className = 'vg-halo'; halo.setAttribute('aria-hidden', 'true');
    bulle = document.createElement('div'); bulle.className = 'vg-bulle'; bulle.setAttribute('role', 'dialog'); bulle.setAttribute('aria-live', 'polite'); bulle.setAttribute('aria-label', 'Visite guidée');
    document.body.append(halo, bulle);
    bulle.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-vg="passer"]')) finir();
      else if (ev.target.closest('[data-vg="suivant"]')) { const e = etapes[i]; if (e.action) { const c = e.cible(); if (c) { c.click(); return; } } aller(i + 1); }
    });
    // une étape « action » passe quand le visiteur clique sur l'élément visé (après le traitement de la page)
    // (repéré en phase de capture : la page peut redessiner la liste pendant son propre traitement du clic)
    document.addEventListener('click', (ev) => {
      if (i < 0 || !etapes[i].action) return;
      const c = etapes[i].cible();
      if (c && (ev.target === c || c.contains(ev.target))) { const k = i; setTimeout(() => { if (i === k) aller(i + 1); }, 450); }
    }, true);
    document.addEventListener('keydown', (ev) => { if (i >= 0 && ev.key === 'Escape' && !document.querySelector('.fen-voile:not([hidden])')) finir(); });
  }
  function demarrer() {
    if (!halo) construire();
    document.body.classList.add('vg-active'); aller(0);
  }
  function aller(k) {
    if (k >= etapes.length) return finir();
    i = k; dernier = '';
    const e = etapes[i];
    try { if (e.avant) e.avant(); } catch { /* étape tolérante */ }
    const txt = typeof e.texte === 'function' ? e.texte() : e.texte, fin = i === etapes.length - 1;
    bulle.innerHTML = `<div class="vg-barre" role="progressbar" aria-valuemin="1" aria-valuemax="${etapes.length}" aria-valuenow="${i + 1}" aria-label="Étape ${i + 1} sur ${etapes.length}"><i style="width:${((i + 1) / etapes.length) * 100}%"></i></div>`
      + `<small class="vg-n">Étape ${i + 1} sur ${etapes.length}${e.action ? ' · <b>à vous</b>' : ''}</small><h3>${esc(e.titre)}</h3><p>${txt}</p>`
      + `<div class="vg-bts"><button type="button" class="vg-passer" data-vg="passer">${fin ? 'Fermer' : 'Passer la visite'}</button><button type="button" class="vg-suivant" data-vg="suivant">${fin ? 'Terminer' : e.action ? 'Le faire pour moi' : 'Suivant'}</button></div>`;
    bulle.classList.remove('vg-entre'); void bulle.offsetWidth; bulle.classList.add('vg-entre');
    halo.classList.toggle('vg-action', !!e.action);
    cancelAnimationFrame(boucle); placer();
    setTimeout(() => { const s = bulle.querySelector('.vg-suivant'); if (s && i === k) s.focus({ preventScroll: true }); }, 60);
  }
  function placer() {
    if (i < 0) return;
    const c = etapes[i].cible(), r = c && c.getBoundingClientRect(), W = innerWidth, H = innerHeight;
    const vis = r && r.width > 0 && r.height > 0;
    const m = 6, hr = vis ? { x: Math.max(4, r.left - m), y: Math.max(4, r.top - m), w: Math.min(W - 8, r.width + 2 * m), h: Math.min(H - 8, r.height + 2 * m) } : null;
    const bw = Math.min(340, W - 24), bh = bulle.offsetHeight || 180;
    let x = 12, y = H - bh - 12;
    if (hr) {
      const dessous = hr.y + hr.h + 12, dessus = hr.y - bh - 12, droite = hr.x + hr.w + 14;
      const cy = Math.min(Math.max(12, hr.y + hr.h / 2 - bh / 2), H - bh - 12);
      if (W > 700 && hr.x > W * 0.55 && hr.x - bw - 14 > 12) { x = hr.x - bw - 14; y = cy; }          // cible à droite (panneau) : bulle à sa gauche
      else if (W > 700 && droite + bw < W - 12 && (hr.h > H * 0.4 || hr.x + hr.w < W * 0.3)) { x = droite; y = cy; } // barre de gauche : bulle à droite
      else if (dessous + bh < H - 8) { y = dessous; x = hr.x + hr.w / 2 - bw / 2; }
      else if (dessus > 8) { y = dessus; x = hr.x + hr.w / 2 - bw / 2; }
      else if (W > 700 && hr.x - bw - 14 > 12) { x = hr.x - bw - 14; y = Math.min(Math.max(12, hr.y), H - bh - 12); }
      else { y = hr.y + hr.h / 2 > H / 2 ? 12 : H - bh - 12; x = W / 2 - bw / 2; }
      x = Math.max(12, Math.min(W - bw - 12, x));
    } else x = W / 2 - bw / 2;
    const cle2 = `${hr ? [hr.x, hr.y, hr.w, hr.h].map(Math.round).join(',') : '-'}|${Math.round(x)},${Math.round(y)},${bw}`;
    if (cle2 !== dernier) {
      dernier = cle2;
      if (hr) Object.assign(halo.style, { display: 'block', left: hr.x + 'px', top: hr.y + 'px', width: hr.w + 'px', height: hr.h + 'px' });
      else Object.assign(halo.style, { display: 'block', left: W / 2 + 'px', top: H / 2 + 'px', width: '0px', height: '0px' });
      Object.assign(bulle.style, { left: x + 'px', top: y + 'px', width: bw + 'px' });
    }
    boucle = requestAnimationFrame(placer);
  }
  function finir() {
    i = -1; cancelAnimationFrame(boucle); marquer();
    if (halo) { halo.style.display = 'none'; bulle.innerHTML = ''; bulle.style.left = '-9999px'; }
    document.body.classList.remove('vg-active');
    b.focus({ preventScroll: true });
  }
  const p = new URLSearchParams(location.search);
  if (auto && p.get('visite') !== '0' && p.get('import') !== '1' && !vue()) setTimeout(() => { if (i < 0 && !document.querySelector('.fen-voile:not([hidden])')) demarrer(); }, REDUIT.matches ? 300 : delai);
  return { demarrer, finir, etape: () => i };
}
