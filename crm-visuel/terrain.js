// Mode « terrain » des démos CRM visuel 3D : un écran simplifié pour la personne sur le terrain (téléphone, une main),
// selon le rôle choisi dans « Voir en tant que ». S'ouvre tout seul si l'écran fait 600 px de large ou moins,
// ou avec le bouton « Mode terrain » de l'en-tête. Module ES sans dépendance ; le style est dans interface.css.
//
//   const T = installerTerrain({
//     cle, hote,                        // clé de mémorisation, conteneur du bouton d'en-tête
//     roles: [{ id, label }], role: () => id, choisirRole: (id) => …,
//     contenu: () => ({ qui, poste, heure, horaires, etat, prochaine: { titre, detail }, journee: [{ h, texte, etat: 'fait'|'encours'|'avenir' }],
//                       alertes: [{ cle, titre, detail: [], couleur, niveau, actions: [{ act, label, primaire, off, raison }] }],
//                       traites: [{ titre, res, h }], equipeTitre, equipe: [{ nom, detail, etat: 'ok'|'occupe'|'pause'|'off' }], zone }),
//     agir: (cle, act) => …,            // une action d'alerte (mêmes règles que l'écran complet)
//     voirPlan: () => …,                // ferme le mode terrain et centre la maquette 3D sur la zone de la personne
//   })
//   T.ouvert() · T.ouvrir() · T.fermer() · T.maj()

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tmp = document.createElement('div');
const txt = (s) => { tmp.innerHTML = String(s ?? ''); return esc(tmp.textContent); }; // texte des alertes (peut contenir du gras)
const ic = (d, w = 22) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC = {
  terrain: ic('<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>', 16),
  journee: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  alertes: ic('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
  equipe: ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.7c1.8.8 3 2.5 3 5.3"/>'),
  plan: ic('<path d="M12 2l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/>'),
  lune: ic('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>', 20),
  soleil: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', 20),
  ok: ic('<path d="M5 12l5 5L20 7"/>', 18),
  retour: ic('<path d="M15 18l-6-6 6-6"/>', 20),
};
const ONGLETS = [['journee', 'Ma journée'], ['alertes', 'Mes alertes'], ['equipe', 'Équipe'], ['plan', 'Plan 3D']];

export function installerTerrain({ cle, hote, roles, role, choisirRole, contenu, agir, voirPlan }) {
  const CLE_F = 'crm-terrain-ferme-' + cle, CLE_T = 'crm-terrain-theme';
  const lire = (k, s = sessionStorage) => { try { return s.getItem(k); } catch { return null; } };
  const ecrire = (k, v, s = sessionStorage) => { try { s.setItem(k, v); } catch { /* stockage bloqué */ } };
  const PETIT = matchMedia('(max-width: 600px)');
  let onglet = 'journee', ouvert = false, minuteur = 0, gel = 0;

  // bouton d'en-tête
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'bt-entete bt-terrain'; b.id = 'btn-terrain'; b.title = 'Mode terrain : l\'écran simplifié du téléphone';
  b.innerHTML = `${IC.terrain}<span>Mode terrain</span>`;
  hote.prepend(b);
  b.addEventListener('click', () => ouvrir());

  // l'écran terrain
  const el = document.createElement('section');
  el.className = 'terrain'; el.id = 'terrain'; el.hidden = true;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Mode terrain');
  if (lire(CLE_T, localStorage) === 'nuit') el.classList.add('nuit');
  el.innerHTML = `<header class="tr-tete">
      <div class="tr-l1"><div class="tr-qui"><b data-z="qui"></b><small data-z="poste"></small></div><span class="tr-heure" data-z="heure"></span></div>
      <div class="tr-l2"><label class="tr-role"><span>Voir en tant que</span><select data-t="role" aria-label="Rôle affiché">${roles.map((r) => `<option value="${esc(r.id)}">${esc(r.label)}</option>`).join('')}</select></label>
        <button type="button" class="tr-bt" data-t="theme" aria-label="Thème Nuit"></button>
        <button type="button" class="tr-bt tr-complet" data-t="fermer">Vue complète</button></div>
    </header>
    <div class="tr-corps" data-z="corps" tabindex="-1"></div>
    <p class="tr-fictif">Démo : personnes et chiffres inventés.</p>
    <nav class="tr-onglets" aria-label="Mode terrain">${ONGLETS.map(([id, l]) => `<button type="button" data-o="${id}">${IC[id]}<span>${l}</span>${id === 'alertes' ? '<i data-n="alertes" hidden></i>' : ''}</button>`).join('')}</nav>`;
  document.body.appendChild(el);
  const retour = document.createElement('button');
  retour.type = 'button'; retour.className = 'tr-revenir'; retour.hidden = true;
  retour.innerHTML = `${IC.retour}<span>Revenir au mode terrain</span>`;
  retour.addEventListener('click', () => ouvrir());
  document.body.appendChild(retour);

  const z = (k) => el.querySelector(`[data-z="${k}"]`);
  const poser = (n, html) => { if (n._h !== html) { n.innerHTML = html; n._h = html; } };
  // corps : on ne remplace que les blocs qui ont changé (une alerte dont le texte bouge), pour que les autres boutons restent sous le doigt
  const patcher = (n, html) => {
    if (n._h === html) return; n._h = html;
    const tpl = document.createElement('template'); tpl.innerHTML = html;
    const cle = (x, i) => x.dataset.k || x.tagName + i;
    const vieux = new Map([...n.children].map((x, i) => [cle(x, i), x]));
    const neufs = [...tpl.content.children].map((x, i) => { const o = vieux.get(cle(x, i)); vieux.delete(cle(x, i)); if (o && o.outerHTML === x.outerHTML) return o; if (o) o.remove(); return x; });
    for (const o of vieux.values()) o.remove();
    neufs.forEach((x, i) => { if (n.children[i] !== x) n.insertBefore(x, n.children[i] || null); });
  };
  const majTheme = () => { const nuit = el.classList.contains('nuit'); const t = el.querySelector('[data-t="theme"]'); t.innerHTML = nuit ? IC.soleil : IC.lune; t.setAttribute('aria-label', nuit ? 'Thème clair' : 'Thème Nuit'); t.title = nuit ? 'Thème clair' : 'Thème Nuit'; };
  majTheme();

  function htmlCorps(C) {
    if (onglet === 'journee') {
      const p = C.prochaine;
      return `<h2 class="tr-h">Ma journée</h2>
        <div class="tr-carte tr-horaires"><span>Mes horaires</span><b>${esc(C.horaires)}</b>${C.etat ? `<small>${esc(C.etat)}</small>` : ''}</div>
        <div class="tr-carte tr-proch"><span>Ma prochaine tâche</span><b>${p ? txt(p.titre) : 'Rien de prévu'}</b>${p && p.detail ? `<small>${txt(p.detail)}</small>` : ''}</div>
        ${C.alertes.length ? `<button type="button" class="tr-gros" data-o="alertes">${IC.alertes}${C.alertes.length} alerte${C.alertes.length > 1 ? 's' : ''} pour moi</button>` : '<p class="tr-calme">Aucune alerte pour vous en ce moment.</p>'}
        ${C.journee.length ? `<ol class="tr-frise">${C.journee.map((x) => `<li class="${x.etat}"><span>${esc(x.h)}</span><p>${esc(x.texte)}</p></li>`).join('')}</ol>` : ''}`;
    }
    if (onglet === 'alertes') {
      const l = C.alertes.map((a) => `<article class="tr-alerte" data-k="${esc(a.cle)}" style="--c:${a.couleur}"><b>${txt(a.titre)}</b><small>${esc(a.niveau)}</small>
          ${a.detail.map((d) => `<p>${txt(d)}</p>`).join('')}
          <div class="tr-act">${a.actions.map((x) => `<button type="button" class="${x.primaire ? 'prim' : ''}" data-a="${esc(a.cle)}" data-act="${esc(x.act)}" ${x.off ? 'disabled' : ''}>${esc(x.label)}</button>`).join('')}</div>
          ${a.actions.filter((x) => x.off && x.raison).map((x) => `<small class="tr-raison">${esc(x.raison)}</small>`).join('')}</article>`).join('');
      return `<h2 class="tr-h">Mes alertes</h2>${l || '<div class="tr-vide">' + IC.ok + '<b>Rien à traiter pour vous</b><small>Les nouvelles alertes apparaîtront ici.</small></div>'}
        ${C.traites.length ? `<h3 class="tr-h3">Traité aujourd'hui</h3><ul class="tr-traites">${C.traites.slice(0, 5).map((x) => `<li>${IC.ok}<p><b>${txt(x.titre)}</b><small>${txt(x.res)} · ${esc(x.h)}</small></p></li>`).join('')}</ul>` : ''}`;
    }
    if (onglet === 'equipe') {
      return `<h2 class="tr-h">${esc(C.equipeTitre)}</h2>${C.equipe.length ? `<ul class="tr-equipe">${C.equipe.map((p) => `<li class="${p.etat}"><i></i><p><b>${esc(p.nom)}</b><small>${txt(p.detail)}</small></p></li>`).join('')}</ul>` : '<p class="tr-calme">Personne à afficher pour ce rôle.</p>'}`;
    }
    return '';
  }
  function maj() {
    if (!ouvert) return;
    const C = contenu();
    poser(z('qui'), esc(C.qui)); poser(z('poste'), esc(C.poste)); poser(z('heure'), esc(C.heure));
    const s = el.querySelector('[data-t="role"]'); if (s.value !== role()) s.value = role();
    if (Date.now() - gel > 1500) patcher(z('corps'), htmlCorps(C)); // pas de remplacement sous le doigt
    el.querySelectorAll('[data-o]').forEach((x) => x.closest('.tr-onglets') && x.setAttribute('aria-current', x.dataset.o === onglet ? 'page' : 'false'));
    const n = el.querySelector('[data-n="alertes"]'); n.textContent = C.alertes.length || ''; n.hidden = !C.alertes.length;
    const pl = el.querySelector('.tr-onglets [data-o="plan"]'); pl.title = C.zone ? 'Voir ma zone sur la maquette : ' + C.zone : 'Voir la maquette';
  }
  function ouvrir() {
    ouvert = true; el.hidden = false; retour.hidden = true; document.documentElement.classList.add('terrain-on');
    ecrire(CLE_F, '0'); maj(); clearInterval(minuteur); minuteur = setInterval(maj, 1000);
  }
  function fermer(vraiment = true) {
    ouvert = false; el.hidden = true; clearInterval(minuteur); document.documentElement.classList.remove('terrain-on');
    if (vraiment) ecrire(CLE_F, '1');
  }
  el.addEventListener('pointerdown', (ev) => { if (ev.target.closest('.tr-corps')) gel = Date.now(); });
  el.addEventListener('click', (ev) => {
    const o = ev.target.closest('[data-o]');
    if (o) {
      if (o.dataset.o === 'plan') { fermer(false); retour.hidden = false; voirPlan(); return; }
      onglet = o.dataset.o; gel = 0; maj(); z('corps').scrollTop = 0; return;
    }
    const a = ev.target.closest('[data-act]');
    if (a && !a.disabled) { agir(a.dataset.a, a.dataset.act); gel = 0; maj(); return; }
    const t = ev.target.closest('[data-t]');
    if (!t) return;
    if (t.dataset.t === 'fermer') { fermer(); retour.hidden = true; }
    else if (t.dataset.t === 'theme') { el.classList.toggle('nuit'); ecrire(CLE_T, el.classList.contains('nuit') ? 'nuit' : 'clair', localStorage); majTheme(); }
  });
  el.querySelector('[data-t="role"]').addEventListener('change', (ev) => { choisirRole(ev.target.value); gel = 0; maj(); });
  addEventListener('keydown', (ev) => { if (ouvert && ev.key === 'Escape' && !document.querySelector('.fen-voile:not([hidden]), .tiroir-voile:not([hidden])')) fermer(); });

  // ouverture automatique sur un petit écran (sauf si la personne a choisi la vue complète dans cet onglet)
  if (PETIT.matches && lire(CLE_F) !== '1') ouvrir();
  PETIT.addEventListener('change', (e) => { if (e.matches && !ouvert && lire(CLE_F) !== '1') ouvrir(); });
  return { ouvert: () => ouvert, ouvrir, fermer, maj };
}
