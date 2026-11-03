// Démo auto-école : pages pleines (Planning, Moniteurs, Élèves, Chiffres), sans la 3D.
// Tout vient des données de la démo (planning du jour, forfaits, paiements, prix) passées dans ctx ;
// aucun salaire de moniteur n'est affiché : la démo n'a pas de coût des moniteurs.
//
//   const pages = creerPagesAE(ctx); pages.rendre(rubrique, conteneur); pages.fermer();

import { avatar, kpi, carteGraphe, barres, courbes, barresH, anneau, legende, tiroir, source } from './page.js';

const IC = (d) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICK = {
  eleves: IC('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c2 2 10 2 12 0v-5"/>'),
  euro: IC('<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>'),
  exam: IC('<circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/>'),
  volant: IC('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 14v7M10 12H3M14 12h7"/>'),
  horloge: IC('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  jauge: IC('<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/>'),
  gens: IC('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.7c1.8.8 3 2.5 3 5.3"/>'),
};
const sans = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const MOIS = (m) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - m); return d.toLocaleDateString('fr-FR', { month: 'long' }); };
const ETAPES = [['debut', 'Début de forfait', '#93c5fd'], ['milieu', 'En cours', '#3b82f6'], ['fin', 'Fin de forfait', '#1d4ed8']];

export function creerPagesAE(c) {
  const F = { q: '', filtre: '', tri: 'nom' };
  const t = () => c.t();
  // ce que voit le rôle choisi (« Voir en tant que ») : finances (gérance), paiements (gérance et secrétariat), moniteurs (moniteur : les siens)
  const D = () => (c.droits ? c.droits() : { finances: true, paiements: true, moniteurs: null });
  const MONS = () => (D().moniteurs ? c.MONITEURS.filter((m) => D().moniteurs.has(m.id)) : c.MONITEURS);
  const elevesVus = () => Object.entries(c.ELEVES).filter(([nom]) => !D().moniteurs || c.PLANNING.some((l) => l.eleve === nom && D().moniteurs.has(l.m)));
  const PL = () => (D().moniteurs ? c.PLANNING.filter((l) => D().moniteurs.has(l.m)) : c.PLANNING);
  const eur = (n) => (D().finances ? c.euros(n) : '');
  const lecons = (nom) => c.PLANNING.filter((l) => l.eleve === nom).sort((a, b) => a.debut - b.debut);
  const monNom = (id) => c.MONITEURS.find((m) => m.id === id)?.nom || '';
  const vehNom = (id) => [...c.VOITURES, ...c.MOTOS].find((v) => v.id === id)?.nom || id;
  const etapeDe = (e) => { const p = e[0] / e[1]; return p >= 0.8 ? 'fin' : p >= 0.3 ? 'milieu' : 'debut'; };
  const ST = { fait: ['', 'terminée'], occupe: ['att', 'en cours'], avenir: ['bleu', 'à venir'] };
  function etatEleve(nom) {
    const ls = lecons(nom), now = ls.find((l) => c.statut(l) === 'occupe'), proch = ls.find((l) => c.statut(l) === 'avenir');
    if (now) return { cl: 'att', txt: 'En leçon', det: `avec ${monNom(now.m)} jusqu'à ${c.hTxt(now.fin)}`, cle: now.id };
    if (proch) return { cl: 'bleu', txt: `Leçon à ${c.hTxt(proch.debut)}`, det: `avec ${monNom(proch.m)}`, cle: proch.id };
    if (ls.length) return { cl: 'ok', txt: 'Leçons faites', det: `${ls.length} aujourd'hui`, cle: ls[ls.length - 1].id };
    return { cl: '', txt: 'Pas de leçon aujourd\'hui', det: '', cle: null };
  }
  const poser = (el, h) => { if (el && el._h !== h) { el.innerHTML = h; el._h = h; } };
  let racine = null, rubRendue = null;
  function squelette(cont, rub, outils = '') {
    if (racine && cont.contains(racine) && rubRendue === rub) return false;
    racine = document.createElement('div'); rubRendue = rub;
    racine.innerHTML = `<div class="pg-kpis" data-z="kpis"></div>${outils}<div data-z="corps"></div>`;
    cont.replaceChildren(racine);
    racine.addEventListener('click', clic);
    racine.addEventListener('input', (ev) => { const el = ev.target.closest('[data-f]'); if (el) { F[el.dataset.f] = el.value; maj(); } });
    return true;
  }
  function clic(ev) {
    const v = ev.target.closest('[data-voir]'); if (v) { c.voir(v.dataset.voir); return; }
    const e = ev.target.closest('[data-eleve]'); if (e) { ouvrirEleve(e.dataset.eleve); return; }
    const m = ev.target.closest('[data-mon]'); if (m) { ouvrirMoniteur(m.dataset.mon); return; }
    const l = ev.target.closest('[data-lecon]'); if (l) ouvrirLecon(l.dataset.lecon);
  }
  const zone = (z) => racine.querySelector(`[data-z="${z}"]`);

  // ---------- Élèves ----------
  function listeEleves() {
    const q = sans(F.q.trim());
    const l = elevesVus().filter(([nom, e]) => (!q || sans(nom).includes(q)) && (
      !F.filtre || (F.filtre === 'payer' ? e[2] > 0 : F.filtre === 'jour' ? lecons(nom).length : F.filtre === 'lecon' ? etatEleve(nom).txt === 'En leçon' : F.filtre === 'exam' ? lecons(nom).some((x) => x.type.startsWith('Examen')) : etapeDe(e) === F.filtre)));
    const tri = { nom: (a, b) => a[0].localeCompare(b[0], 'fr'), avancement: (a, b) => b[1][0] / b[1][1] - a[1][0] / a[1][1], payer: (a, b) => b[1][2] - a[1][2] };
    return l.sort(tri[F.tri] || tri.nom);
  }
  function carteEleve([nom, e]) {
    const s = etatEleve(nom), ls = lecons(nom), exam = ls.some((x) => x.type.startsWith('Examen')), p = Math.min(100, (e[0] / e[1]) * 100);
    return `<button type="button" class="pp" data-eleve="${nom}"><span class="pg-st ${s.cl}">${s.txt}</span><div class="pp-tete">${avatar(nom, { taille: 52 })}<div><b>${nom}</b><small>Permis B · forfait ${e[1]} h</small></div></div>`
      + `<div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin:0 0 6px"><span style="color:var(--doux)">${ETAPES.find((x) => x[0] === etapeDe(e))[1]}</span><b>${e[0]} / ${e[1]} h</b></div><span class="pp-barre"><i style="width:${p}%;background:${p >= 80 ? '#1d4ed8' : '#3b82f6'}"></i></span></div>`
      + `<div class="pp-tags">${exam ? '<span style="background:#fef3c7;color:#92400e">Examen aujourd\'hui</span>' : ''}${ls.length ? `<span>${ls.length} leçon${ls.length > 1 ? 's' : ''} aujourd'hui</span>` : ''}${c.relances[nom] !== undefined ? `<span>relancé à ${c.hTxt(c.relances[nom])}</span>` : ''}</div>`
      + `<div class="pp-pied">${D().paiements ? `<div><small>Reste à payer</small><b style="color:${e[2] ? 'var(--orange, #c2410c)' : '#15803d'}">${e[2] ? c.euros(e[2]) : 'à jour'}</b></div>` : `<div><small>Avancement</small><b>${Math.round(p)} %</b></div>`}<div><small>${s.det ? 'Aujourd\'hui' : 'Heures restantes'}</small><b style="font-size:12.5px;white-space:normal">${s.det || (e[1] - e[0]) + ' h'}</b></div></div></button>`;
  }
  function pageEleves(cont) {
    squelette(cont, 'eleves', `<div class="pg-outils"><input type="search" data-f="q" placeholder="Rechercher un élève…" aria-label="Rechercher" value="${F.q}"><select data-f="filtre" aria-label="Filtrer"><option value="">Tous les élèves</option><option value="jour">Leçon aujourd'hui</option><option value="lecon">En leçon maintenant</option>${D().paiements ? '<option value="payer">À encaisser</option>' : ''}<option value="exam">Examen aujourd'hui</option>${ETAPES.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select><select data-f="tri" aria-label="Trier"><option value="nom">Tri : nom</option><option value="avancement">Tri : avancement</option>${D().paiements ? '<option value="payer">Tri : reste à payer</option>' : ''}</select><span class="pg-compte" data-z="compte"></span></div>`);
    const E = elevesVus(), dus = E.filter(([, e]) => e[2] > 0), enL = E.filter(([n]) => etatEleve(n).txt === 'En leçon').length, X = c.examens ? c.examens() : null;
    const exams = c.PLANNING.filter((l) => l.type.startsWith('Examen'));
    poser(zone('kpis'), [
      kpi({ ic: ICK.eleves, c: '#2563eb', cd: '#dbeafe', label: D().moniteurs ? 'Mes élèves aujourd\'hui' : 'Élèves inscrits', val: E.length, det: D().moniteurs ? 'avec une leçon avec vous' : `${new Set(c.PLANNING.map((l) => l.eleve)).size} ont une leçon aujourd'hui`, src: D().moniteurs ? 'Planning du jour' : 'Dossiers des élèves · saisis par le secrétariat' }),
      kpi({ ic: ICK.volant, c: '#ea580c', cd: '#ffedd5', label: 'En leçon maintenant', val: enL, det: `à ${c.hh(t())}`, src: 'Planning du jour · en direct' }),
      D().paiements ? kpi({ ic: ICK.euro, c: '#be123c', cd: '#ffe4e6', label: 'À encaisser', val: c.euros(dus.reduce((s, [, e]) => s + e[2], 0)), det: `${dus.length} élève${dus.length > 1 ? 's' : ''} concerné${dus.length > 1 ? 's' : ''}`, src: 'Paiements · saisis par le secrétariat' }) : '',
      kpi({ ic: ICK.exam, c: '#7c3aed', cd: '#ede9fe', label: 'Examens du jour', val: exams.length, det: exams.map((l) => `${l.eleve} à ${c.hTxt(l.debut)}`).join(', ') || 'aucun', src: 'Planning du jour (places d\'examen)' }),
      X ? kpi({ ic: ICK.exam, c: '#15803d', cd: '#dcfce7', label: 'Réussite au permis B', val: `${Math.round(X.taux)} %`, det: `${X.recus} reçus sur ${X.total} · 6 mois (fictif)`, src: 'Calculé : résultats d\'examen saisis (historique fictif de 6 mois)' }) : '',
      X ? kpi({ ic: ICK.horloge, c: '#0f766e', cd: '#ccfbf1', label: 'Attente avant examen', val: `${Math.round(X.delai)} jours`, det: 'en moyenne, demande de place → examen', src: 'Calculé : date de demande de place → date d\'examen (historique fictif)' }) : '',
    ].join(''));
    const l = listeEleves();
    poser(zone('corps'), (l.length ? `<div class="pp-grille">${l.map(carteEleve).join('')}</div>` : '<div class="pg-vide">Aucun élève ne correspond à ces filtres.</div>') + '<p class="pg-note">Données fictives · élèves inventés. Avancement = heures faites sur le forfait acheté.</p>');
    poser(zone('compte'), `${l.length} sur ${E.length}`);
  }
  function ficheEleve(nom) {
    const e = c.ELEVES[nom], s = etatEleve(nom), ls = lecons(nom);
    return `<div class="ti-tete">${avatar(nom, { taille: 72 })}<div><h2>${nom}</h2><p>Permis B · ${ETAPES.find((x) => x[0] === etapeDe(e))[1].toLowerCase()}</p><span class="pg-st ${s.cl}">${s.txt}</span></div></div>`
      + `<div class="ti-chiffres"><div><small>Heures faites</small><b>${e[0]} h</b></div><div><small>Forfait</small><b>${e[1]} h</b></div>${D().paiements ? `<div><small>Reste à payer${source('Paiements · saisis par le secrétariat')}</small><b style="color:${e[2] ? '#c2410c' : '#15803d'}">${e[2] ? c.euros(e[2]) : 'à jour'}</b></div>` : ''}</div>`
      + (s.cle ? `<div class="ti-actions"><button type="button" class="pg-bt prim" data-voir="${s.cle}">Voir sa leçon sur la maquette</button></div>` : '')
      + `<section class="ti-s"><h3>Leçons d'aujourd'hui${source('Planning du jour · en direct')}</h3>${ls.length ? `<ul class="ti-l">${ls.map((l) => `<li><span>${c.hTxt(l.debut)} – ${c.hTxt(l.fin)} · ${l.type}<br><small>${monNom(l.m)} · ${vehNom(l.veh)}</small></span><b>${eur(l.prix)}<br><span class="pg-st ${ST[c.statut(l)][0]}">${ST[c.statut(l)][1]}</span></b></li>`).join('')}</ul>` : '<p class="pg-note">Pas de leçon prévue aujourd\'hui.</p>'}</section>`
      + `<section class="ti-s"><h3>Forfait</h3><ul class="ti-l"><li><span>Heures restantes</span><b>${e[1] - e[0]} h</b></li><li><span>Après les leçons du jour</span><b>${e[1] - e[0] - ls.reduce((x, l) => x + l.duree, 0)} h</b></li>${D().paiements && c.relances[nom] !== undefined ? `<li><span>Relance de paiement</span><b>à ${c.hTxt(c.relances[nom])}</b></li>` : ''}</ul></section>`
      + '<p class="ti-rgpd">Données fictives · élève inventé. Fiche limitée au suivi de la formation et des paiements (RGPD).</p>';
  }
  function ouvrirEleve(nom) { tiroir.ouvrir(ficheEleve(nom), 'e:' + nom); brancherTiroir(); }

  // ---------- Moniteurs ----------
  const statsMon = (m) => { const ls = c.PLANNING.filter((l) => l.m === m.id), prev = ls.reduce((s, l) => s + l.duree, 0); return { ls, prev, faites: c.heuresRoulees(t(), (l) => l.m === m.id), ca: ls.reduce((s, l) => s + l.prix, 0), now: ls.find((l) => c.statut(l) === 'occupe') }; };
  const pctH = (h) => ((Math.min(c.FERMETURE, Math.max(c.OUVERTURE, h)) - c.OUVERTURE) / (c.FERMETURE - c.OUVERTURE)) * 100;
  const coulBloc = (l) => ({ fait: ['#eef1f5', '#e2e8f0', '#64748b'], occupe: ['#ffedd5', '#fdba74', '#c2410c'], avenir: ['#dbeafe', '#93c5fd', '#1d4ed8'] }[c.statut(l)]);
  function friseMon(m, petite = false) {
    const traits = []; for (let h = c.OUVERTURE; h <= c.FERMETURE; h++) traits.push(`<b class="h" style="left:${pctH(h)}%"></b>`);
    return `<div class="frise-piste" ${petite ? 'style="height:36px;margin:0"' : ''}>${traits.join('')}${c.PLANNING.filter((l) => l.m === m.id).map((l) => { const [f, b, co] = coulBloc(l); return `<div class="bloc-f" data-lecon="${l.id}" style="left:${pctH(l.debut)}%;width:calc(${pctH(l.fin) - pctH(l.debut)}% - 2px);background:${f};border-color:${b};color:${co}${petite ? ';top:4px;bottom:4px' : ''}" title="${c.hTxt(l.debut)}–${c.hTxt(l.fin)} · ${l.eleve} · ${l.type}">${petite ? '' : l.eleve.split(' ')[0]}</div>`; }).join('')}<i class="maint" style="left:${pctH(t())}%"></i></div>`;
  }
  function pageMoniteurs(cont) {
    squelette(cont, 'moniteurs');
    const S = MONS().map((m) => [m, statsMon(m)]), prev = S.reduce((s, [, x]) => s + x.prev, 0), faites = S.reduce((s, [, x]) => s + x.faites, 0);
    poser(zone('kpis'), [
      kpi({ ic: ICK.gens, c: '#2563eb', cd: '#dbeafe', label: 'À l\'agence', val: `${S.filter(([, x]) => !x.now).length} / ${S.length}`, det: `${S.filter(([, x]) => x.now).length} en leçon` }),
      kpi({ ic: ICK.horloge, c: '#7c3aed', cd: '#ede9fe', label: 'Heures de conduite', val: `${c.virgule(faites)} / ${c.virgule(prev)} h`, det: 'faites / prévues aujourd\'hui' }),
      kpi({ ic: ICK.jauge, c: '#0891b2', cd: '#cffafe', label: 'Remplissage', val: `${Math.round((prev / c.H_DISPO) * 100)} %`, det: `${c.virgule(prev)} h sur ${c.H_DISPO} h possibles` }),
      !D().finances ? '' : kpi({ ic: ICK.euro, c: '#16a34a', cd: '#dcfce7', label: 'Leçons vendues aujourd\'hui', src: 'Calculé : leçons du planning × tarifs saisis à la main', val: c.euros(S.reduce((s, [, x]) => s + x.ca, 0)), det: `${c.PLANNING.length} leçons` }),
    ].join(''));
    poser(zone('corps'), `<div class="pp-grille" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${S.map(([m, x]) => `<button type="button" class="pp" data-mon="${m.id}"><span class="pg-st ${x.now ? 'att' : 'ok'}">${x.now ? 'En leçon' : 'À l\'agence'}</span><div class="pp-tete">${avatar(m.nom, { taille: 56 })}<div><b>${m.nom}</b><small>Moniteur · permis ${m.permis}</small></div></div>`
      + `<p class="pp-role">${x.now ? `En leçon avec ${x.now.eleve} jusqu'à ${c.hTxt(x.now.fin)} (${vehNom(x.now.veh)}).` : (() => { const p = x.ls.find((l) => c.statut(l) === 'avenir'); return p ? `Prochaine leçon à ${c.hTxt(p.debut)} avec ${p.eleve}.` : 'Plus de leçon aujourd\'hui.'; })()}</p>`
      + `<div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin:0 0 6px"><span style="color:var(--doux)">Remplissage du jour</span><b>${c.virgule(x.prev)} / 10 h</b></div><span class="pp-barre"><i style="width:${Math.min(100, x.prev * 10)}%;background:#${m.couleur.toString(16).padStart(6, '0')}"></i></span></div>`
      + `${friseMon(m, true)}<div class="pp-pied"><div><small>Heures faites</small><b>${c.virgule(x.faites)} h</b></div>${D().finances ? `<div><small>Leçons du jour</small><b>${c.euros(x.ca)}</b></div>` : ''}</div></button>`).join('')}</div>`
      + '<p class="pg-note">Données fictives. Pas de salaire affiché : la démo ne contient pas de coût des moniteurs, seulement leurs heures et les leçons vendues.</p>');
  }
  function ficheMoniteur(id) {
    const m = c.MONITEURS.find((x) => x.id === id), x = statsMon(m);
    return `<div class="ti-tete">${avatar(m.nom, { taille: 72 })}<div><h2>${m.nom}</h2><p>Moniteur · permis ${m.permis}</p><span class="pg-st ${x.now ? 'att' : 'ok'}">${x.now ? 'En leçon' : 'À l\'agence'}</span></div></div>`
      + `<div class="ti-chiffres"><div><small>Heures prévues</small><b>${c.virgule(x.prev)} h</b></div><div><small>Remplissage</small><b>${Math.round(x.prev * 10)} %</b></div>${D().finances ? `<div><small>Leçons du jour</small><b>${c.euros(x.ca)}</b></div>` : ''}</div>`
      + `<div class="ti-actions"><button type="button" class="pg-bt prim" data-voir="${m.id}">Voir sur la maquette</button></div>`
      + `<section class="ti-s"><h3>Sa journée</h3><ul class="ti-l">${x.ls.map((l) => `<li data-lecon="${l.id}" style="cursor:pointer"><span>${c.hTxt(l.debut)} – ${c.hTxt(l.fin)} · ${l.eleve}<br><small>${l.type} · ${vehNom(l.veh)}</small></span><b>${eur(l.prix)}<br><span class="pg-st ${ST[c.statut(l)][0]}">${ST[c.statut(l)][1]}</span></b></li>`).join('')}</ul></section>`
      + '<p class="ti-rgpd">Données fictives · moniteur inventé. Pas de salaire : la démo n\'a pas de coût des moniteurs.</p>';
  }
  function ouvrirMoniteur(id) { tiroir.ouvrir(ficheMoniteur(id), 'm:' + id); brancherTiroir(); }
  function ficheLecon(id) {
    const l = c.PLANNING.find((x) => x.id === id); if (!l) return '';
    return `<div class="ti-tete">${avatar(l.eleve, { taille: 64 })}<div><h2>${l.eleve}</h2><p>${l.type} · ${c.hTxt(l.debut)} – ${c.hTxt(l.fin)}</p><span class="pg-st ${ST[c.statut(l)][0]}">${ST[c.statut(l)][1]}</span></div></div>`
      + `<div class="ti-actions"><button type="button" class="pg-bt prim" data-voir="${l.id}">Voir sur la maquette</button><button type="button" class="pg-bt" data-eleve="${l.eleve}">Fiche de l'élève</button></div>`
      + `<section class="ti-s"><ul class="ti-l"><li><span>Moniteur</span><b>${monNom(l.m)}</b></li><li><span>Véhicule</span><b>${vehNom(l.veh)}</b></li><li><span>Durée</span><b>${c.virgule(l.duree)} h</b></li>${D().finances ? `<li><span>Prix</span><b>${c.euros(l.prix)}</b></li>` : ''}</ul></section>`;
  }
  function ouvrirLecon(id) { tiroir.ouvrir(ficheLecon(id), 'l:' + id); brancherTiroir(); }
  function brancherTiroir() { const el = tiroir.element(); if (el._ae) return; el._ae = 1; el.addEventListener('click', clic); }
  function majTiroir() {
    const k = tiroir.cle(); if (!k) return;
    const [type, id] = [k.slice(0, 1), k.slice(2)];
    tiroir.maj(type === 'e' ? ficheEleve(id) : type === 'm' ? ficheMoniteur(id) : ficheLecon(id));
  }

  // ---------- Planning : grille moniteurs × heures ----------
  function pagePlanning(cont) {
    squelette(cont, 'planning');
    const P = PL(), n = (k) => P.filter((l) => c.statut(l) === k).length, prev = P.reduce((s, l) => s + l.duree, 0), HD = D().moniteurs ? D().moniteurs.size * 10 : c.H_DISPO;
    poser(zone('kpis'), [
      kpi({ ic: ICK.volant, c: '#2563eb', cd: '#dbeafe', label: 'Leçons du jour', val: P.length, det: `${n('fait')} terminées · ${n('avenir')} à venir`, src: 'Planning du jour · en direct' }),
      kpi({ ic: ICK.horloge, c: '#ea580c', cd: '#ffedd5', label: 'En cours', val: n('occupe'), det: `à ${c.hh(t())}` }),
      kpi({ ic: ICK.jauge, c: '#0891b2', cd: '#cffafe', label: 'Remplissage', val: `${Math.round((prev / HD) * 100)} %`, det: `${c.virgule(prev)} h sur ${HD} h`, src: 'Calculé : heures prévues ÷ heures possibles' }),
      kpi({ ic: ICK.exam, c: '#7c3aed', cd: '#ede9fe', label: 'Examens', val: P.filter((l) => l.type.startsWith('Examen')).length, det: P.filter((l) => l.type.startsWith('Examen')).map((l) => c.hTxt(l.debut)).join(', ') || 'aucun' }),
    ].join(''));
    const heures = []; for (let h = c.OUVERTURE; h <= c.FERMETURE; h++) heures.push(`<span class="${(h - c.OUVERTURE) % 2 ? 'imp' : ''}" style="left:${pctH(h)}%">${h}h</span>`);
    poser(zone('corps'), `<div class="frise"><div class="frise-l tete"><div style="padding-left:16px">Moniteur</div><div class="frise-piste">${heures.join('')}</div></div>${MONS().map((m) => { const x = statsMon(m); return `<div class="frise-l" style="min-height:64px"><div class="pg-qui" data-mon="${m.id}">${avatar(m.nom, { taille: 36 })}<div><b>${m.nom}</b><small>${c.virgule(x.prev)} h · ${x.now ? 'en leçon' : 'à l\'agence'}</small></div></div>${friseMon(m)}</div>`; }).join('')}</div>`
      + legende([['terminée', '#e2e8f0'], ['en cours', '#fdba74'], ['à venir', '#93c5fd'], ['maintenant', '#dc2626']])
      + (c.reportees.length ? `<section class="pg-carte" style="margin-top:16px"><div class="pg-ch"><h3>Reportées à demain</h3><small>${c.reportees.length}</small></div><table class="pg-table"><tbody>${c.reportees.map((l) => `<tr><td>${c.hTxt(l.debut)}</td><td><b>${l.eleve}</b></td><td>${monNom(l.m)}</td></tr>`).join('')}</tbody></table></section>` : '')
      + '<p class="pg-note">Clic sur une leçon : son détail, et « Voir sur la maquette » pour la retrouver en 3D.</p>');
  }

  // ---------- Chiffres : tableau de bord ----------
  function pageChiffres(cont) {
    if (!(racine && cont.contains(racine) && rubRendue === 'chiffres')) {
      racine = document.createElement('div'); rubRendue = 'chiffres';
      racine.innerHTML = '<div data-z="kpis-cartes"></div><div data-z="corps"></div>';
      cont.replaceChildren(racine); racine.addEventListener('click', clic);
      zone('kpis-cartes').appendChild(c.kpisEl());
    }
    const P = c.PLANNING, h0 = t(), heures = []; for (let h = c.OUVERTURE; h < c.FERMETURE; h++) heures.push(h);
    const enc = heures.map((h) => (h < h0 ? c.caJour(Math.min(h + 1, h0)) - c.caJour(h) : 0));
    const prev = P.reduce((s, l) => s + l.duree, 0);
    const S = c.MONITEURS.map((m) => [m, statsMon(m)]);
    const types = [...new Set(P.map((l) => l.type))].map((ty) => [ty, P.filter((l) => l.type === ty)]).sort((a, b) => b[1].reduce((s, l) => s + l.prix, 0) - a[1].reduce((s, l) => s + l.prix, 0));
    const maxT = Math.max(...types.map(([, ls]) => ls.reduce((s, l) => s + l.prix, 0)));
    const E = Object.values(c.ELEVES), parEtape = ETAPES.map(([k, l, co]) => ({ l, co, n: E.filter((e) => etapeDe(e) === k).length }));
    const xs = []; for (let h = c.OUVERTURE; h <= h0 + 1e-6; h += 0.25) xs.push(h); if (xs[xs.length - 1] < h0) xs.push(h0);
    const libX = []; for (let h = c.OUVERTURE; h <= c.FERMETURE; h += 2) libX.push([h, h + 'h']);
    const veh = [...c.VOITURES, ...c.MOTOS].map((v) => [v, P.filter((l) => l.veh === v.id).reduce((s, l) => s + l.duree, 0)]);
    poser(zone('corps'), `<div class="pg-grille">`
      + carteGraphe('Encaissé par heure', `${c.euros(c.caJour(h0))} aujourd'hui`, barres({ lib: heures.map((h) => h + 'h'), val: enc, coul: '#16a34a', passe: heures.map((h) => h < h0), format: (n) => Math.round(n) + ' €', titreBarre: (i) => `${heures[i]}h-${heures[i] + 1}h : ${c.euros(enc[i])}` }) + '<p class="pg-note">Leçons terminées et paiements reçus, heure par heure. Les heures à venir restent vides.</p>')
      + carteGraphe('Heures de conduite par moniteur', 'faites / prévues aujourd\'hui', barresH(S.map(([m, x]) => ({ label: m.nom, val: x.faites, max: 10, coul: '#' + m.couleur.toString(16).padStart(6, '0'), txt: `${c.virgule(x.faites)} / ${c.virgule(x.prev)} h`, cle: m.id }))) + '<p class="pg-note">Barre pleine = 10 h, la journée possible d\'un moniteur.</p>')
      + `</div><div class="pg-grille g3">`
      + carteGraphe('Remplissage du planning', 'heures vendues / disponibles', anneau((prev / c.H_DISPO) * 100, '#0891b2', `${Math.round((prev / c.H_DISPO) * 100)} %`, `${c.virgule(prev)} h sur ${c.H_DISPO} h`))
      + carteGraphe('Élèves par étape', 'avancement du forfait', barresH(parEtape.map((x) => ({ label: x.l, val: x.n, max: E.length, coul: x.co, txt: `${x.n} élève${x.n > 1 ? 's' : ''}` }))) + '<p class="pg-note">Début : moins de 30 % des heures faites ; fin : 80 % et plus.</p>')
      + carteGraphe('Leçons vendues par prestation', `${c.euros(P.reduce((s, l) => s + l.prix, 0))} au total`, barresH(types.map(([ty, ls]) => ({ label: `${ty} (${ls.length})`, val: ls.reduce((s, l) => s + l.prix, 0), max: maxT, coul: '#7c3aed', txt: c.euros(ls.reduce((s, l) => s + l.prix, 0)) }))))
      + `</div><div class="pg-grille">`
      + carteGraphe('Heures de conduite cumulées', 'depuis l\'ouverture', courbes({ x: xs, xLib: libX, series: [{ val: xs.map((h) => c.heuresRoulees(h)), coul: '#7c3aed', aire: true }], max: prev, format: (n) => Math.round(n) + ' h' }) + legende([[`${c.virgule(c.heuresRoulees(h0))} h faites`, '#7c3aed']]))
      + carteGraphe('Utilisation des véhicules', 'heures prévues aujourd\'hui', barres({ lib: veh.map(([v]) => v.nom.replace('Voiture ', 'V').replace('Moto ', 'M')), val: veh.map(([, h]) => h), coul: '#ea580c', max: 10, format: (n) => Math.round(n) + ' h', titreBarre: (i) => `${veh[i][0].nom} : ${c.virgule(veh[i][1])} h` }))
      + `</div><div class="pg-grille">`
      + (c.examens ? (() => { const X = c.examens(); return carteGraphe('Réussite au permis B par mois', `${Math.round(X.taux)} % sur 6 mois · ${X.recus} reçus sur ${X.total}`, barres({ lib: X.parMois.map((p) => p.lib), val: X.parMois.map((p) => p.taux), coul: '#15803d', max: 100, format: (n) => Math.round(n) + ' %', titreBarre: (i) => `${X.parMois[i].lib} : ${X.parMois[i].recus} reçus sur ${X.parMois[i].n}` }) + `<p class="pg-note">Calculé sur l'historique d'examens de la démo (fictif) et les résultats saisis aujourd'hui. Attente moyenne entre la demande de place et l'examen : <b>${Math.round(X.delai)} jours</b>.</p>`)
        + carteGraphe('Derniers examens', 'historique fictif', `<table class="pg-table"><tbody>${X.tous.slice().sort((a, b) => a.m - b.m || b.j - a.j).slice(0, 6).map((x) => `<tr><td><b>${x.nom}</b><br><small>${x.aujourdhui ? 'aujourd\'hui' : `${x.j} ${MOIS(x.m)}`}</small></td><td><small>${x.attente} jours d'attente</small></td><td class="num"><span class="pg-st ${x.recu ? 'ok' : 'att'}">${x.recu ? 'Reçu' : 'Ajourné'}</span></td></tr>`).join('')}</tbody></table>`); })() : '')
      + `</div>`);
  }

  function maj() {
    const rub = rubRendue, cont = racine && racine.parentElement; if (!cont) return;
    ({ eleves: pageEleves, moniteurs: pageMoniteurs, planning: pagePlanning, chiffres: pageChiffres })[rub]?.(cont);
    majTiroir();
  }
  function rendre(rub, cont) {
    ({ eleves: pageEleves, moniteurs: pageMoniteurs, planning: pagePlanning, chiffres: pageChiffres })[rub]?.(cont);
    majTiroir();
  }
  return { rendre, fermer: () => tiroir.fermer() };
}
