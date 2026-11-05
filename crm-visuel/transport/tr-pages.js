// Démo « Transports Modèle » : pages pleines (Tournées, Chauffeurs, RH, Documents, Chiffres), sans la 3D.
// Tout vient des données de la démo passées dans ctx (tournées du jour, flotte, personnel, échéances) ; rien n'est envoyé.
//
//   const pages = creerPagesTR(ctx); pages.rendre(rubrique, conteneur); pages.fermer();

import { avatar, kpi, carteGraphe, barres, barresH, anneau, legende, tiroir, source } from '../page.js';
import { cvPdf, ouvrirPdf, telechargerPdf } from '../cv.js';
import { creerPdf } from '../pdf.js';
import { DOCS, SEUILS } from './tr-alertes.js';

const IC = (d) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICK = {
  camion: IC('<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
  ok: IC('<path d="M5 12l5 5 9-10"/>'),
  horloge: IC('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  alerte: IC('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h0"/>'),
  gens: IC('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.7c1.8.8 3 2.5 3 5.3"/>'),
  doc: IC('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>'),
  euro: IC('<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>'),
  route: IC('<path d="M4 20L9 4M20 20L15 4M12 6v2M12 11v2M12 16v2"/>'),
};
const sans = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// classe de pastille et libellé de chaque statut de tournée
export const ST_T = { avenir: ['bleu', 'À venir'], chargement: ['bleu', 'Au chargement'], encours: ['att', 'En cours'], retard: ['ko', 'En retard'], livree: ['ok', 'Livrée'], 'livree-retard': ['att', 'Livrée en retard'], bloquee: ['ko', 'Bloquée'], annulee: ['', 'Non faite'] };
const etatDoc = (j) => (j === null || j === undefined ? null : j < 0 ? ['ko', 'Dépassé'] : j <= SEUILS.docUrgent ? ['ko', 'Urgent'] : j <= SEUILS.docPrevoir ? ['att', 'À prévoir'] : ['ok', 'À jour']);
const etatCT = (j) => (j < 0 ? ['ko', 'Dépassé'] : j <= SEUILS.ctUrgent ? ['ko', 'Urgent'] : j <= SEUILS.ctPrevoir ? ['att', 'À prévoir'] : ['ok', 'À jour']);
const dansTxt = (j) => (j < 0 ? `il y a ${-j} j` : j === 0 ? 'aujourd\'hui' : `dans ${j} j`);

export function creerPagesTR(c) {
  const F = { q: '', filtre: '', service: '', type: '' };
  const t = () => c.t();
  const D = () => (c.droits ? c.droits() : { finances: true, chauffeur: null });
  const veh = (id) => c.VEHICULES.find((v) => v.id === id), pers = (id) => c.PERSONNEL.find((p) => p.id === id);
  const TV = () => (D().chauffeur ? c.TOURNEES.filter((x) => x.ch === D().chauffeur) : c.TOURNEES);
  const libSt = (T) => { const s = c.statutT(T); if (s === 'bloquee') return ['ko', !T.ch ? 'Sans chauffeur' : 'Sans véhicule']; return ST_T[s]; };
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
  const zone = (z) => racine.querySelector(`[data-z="${z}"]`);
  function clic(ev) {
    const pdf = ev.target.closest('[data-pdf]'); if (pdf) { const [k, id, mode] = pdf.dataset.pdf.split(':'); if (k === 'cv') cv(id, mode); else registre(mode); return; }
    const v = ev.target.closest('[data-voir]'); if (v) { c.voir(v.dataset.voir); return; }
    const p = ev.target.closest('[data-pers]'); if (p) { ouvrir('p:' + p.dataset.pers); return; }
    const tt = ev.target.closest('[data-tour]'); if (tt) { ouvrir('t:' + tt.dataset.tour); return; }
    const vv = ev.target.closest('[data-veh]'); if (vv) ouvrir('v:' + vv.dataset.veh);
  }

  // ---------- fiches (tiroir) ----------
  function ficheTournee(id) {
    const T = c.TOURNEES.find((x) => x.id === id); if (!T) return '';
    const [cl, lib] = libSt(T), V = veh(T.veh), C = pers(T.ch), fait = c.livraisonsFaites(T);
    return `<div class="ti-tete"><span class="tr-code">${T.code}</span><div><h2>${T.client}</h2><p>${T.type} · ${T.livr} point${T.livr > 1 ? 's' : ''} de livraison</p><span class="pg-st ${cl}">${lib}</span></div></div>`
      + `<div class="ti-chiffres"><div><small>Départ</small><b>${c.hTxt(c.dEff(T))}</b></div><div><small>Retour ${T.retard && t() >= (T.retardDes ?? 99) ? 'estimé' : 'prévu'}</small><b>${c.hTxt(c.rEff(T))}</b></div><div><small>Livraisons</small><b>${fait} / ${T.livr}</b></div></div>`
      + `<div class="ti-actions"><button type="button" class="pg-bt prim" data-voir="${T.id}">Voir sur la maquette</button>${C ? `<button type="button" class="pg-bt" data-pers="${C.id}">Fiche du chauffeur</button>` : ''}</div>`
      + `<section class="ti-s"><ul class="ti-l"><li><span>Véhicule</span><b>${V ? `${V.nom} · ${V.immat}` : '-'}</b></li><li><span>Chauffeur</span><b>${C ? C.nom : 'aucun'}</b></li><li><span>Distance prévue</span><b>${T.km} km</b></li>${T.retard && t() >= (T.retardDes ?? 99) ? `<li><span>Retard signalé</span><b>+${T.retard} min${c.prevenus[T.id] !== undefined ? ' · client prévenu' : ''}</b></li>` : ''}${D().finances ? `<li><span>Prix HT</span><b>${c.euros(T.prix)}</b></li>` : ''}</ul></section>`
      + '<p class="ti-rgpd">Données fictives · client et tournée inventés.</p>';
  }
  function docsLignes(p) {
    return Object.entries(DOCS).filter(([k]) => p[k] !== null && p[k] !== undefined).map(([k, lib]) => { const e = etatDoc(p[k]); return `<li><span>${lib}<br><small>${c.dateTxt(p[k])} · ${dansTxt(p[k])}</small></span><b><span class="pg-st ${e[0]}">${c.renouv[p.id + ':' + k] !== undefined ? 'Demande en cours' : e[1]}</span></b></li>`; }).join('');
  }
  function fichePersonne(id) {
    const p = pers(id); if (!p) return '';
    const e = c.etatPersonne(p), ts = c.TOURNEES.filter((x) => x.ch === p.id);
    return `<div class="ti-tete">${avatar(p.nom, { taille: 72 })}<div><h2>${p.nom}</h2><p>${p.poste} · ${p.service}</p><span class="pg-st ${e.cl}">${e.txt}</span></div></div>`
      + `<div class="ti-chiffres"><div><small>Contrat</small><b>${p.contrat}</b></div><div><small>Dans l'entreprise depuis</small><b>${p.entree}</b></div>${p.permis ? `<div><small>Permis</small><b>${p.permis}</b></div>` : ''}</div>`
      + `<div class="ti-actions"><button type="button" class="pg-bt prim" data-voir="${p.id}">Voir sur la maquette</button><button type="button" class="pg-bt" data-pdf="cv:${p.id}:voir">CV (PDF)</button><button type="button" class="pg-bt" data-pdf="cv:${p.id}:telecharger">Télécharger</button></div>`
      + (p.chauffeur ? `<section class="ti-s"><h3>Documents du conducteur${source('Dossier du personnel · saisi par l\'exploitation')}</h3>${docsLignes(p) ? `<ul class="ti-l">${docsLignes(p)}</ul>` : '<p class="pg-note">Permis B : pas de carte conducteur ni de FIMO/FCO exigées.</p>'}</section>` : '')
      + (p.chauffeur ? `<section class="ti-s"><h3>Tournées d'aujourd'hui</h3>${ts.length ? `<ul class="ti-l">${ts.map((T) => `<li data-tour="${T.id}" style="cursor:pointer"><span>${T.code} · ${c.hTxt(c.dEff(T))} – ${c.hTxt(c.rEff(T))}<br><small>${T.client} · ${veh(T.veh)?.nom || ''}</small></span><b><span class="pg-st ${libSt(T)[0]}">${libSt(T)[1]}</span></b></li>`).join('')}</ul>` : `<p class="pg-note">${p.absent ? p.absent + '.' : 'Pas de tournée aujourd\'hui.'}</p>`}</section>` : '')
      + '<p class="ti-rgpd">Données fictives · personne inventée, aucune vraie photo. Fiche limitée au suivi du poste et des obligations réglementaires (RGPD).</p>';
  }
  function ficheVehicule(id) {
    const v = veh(id); if (!v) return '';
    const ts = c.TOURNEES.filter((x) => x.veh === v.id), k = c.kmDuJour(v), e = etatCT(v.ct);
    return `<div class="ti-tete"><span class="tr-code">${v.id}</span><div><h2>${v.nom} · ${v.immat}</h2><p>${v.modele}</p><span class="pg-st ${v.panne ? 'ko' : 'ok'}">${c.etatVehicule(v)}</span></div></div>`
      + `<div class="ti-actions"><button type="button" class="pg-bt prim" data-voir="${v.id}">Voir sur la maquette</button></div>`
      + `<section class="ti-s"><ul class="ti-l"><li><span>Kilométrage</span><b>${k.toLocaleString('fr-FR')} km</b></li><li><span>Contrôle technique<br><small>${c.dateTxt(v.ct)} · ${dansTxt(v.ct)}</small></span><b><span class="pg-st ${e[0]}">${c.rdv.ct[v.id] ? 'RDV à prendre' : e[1]}</span></b></li>${v.tachy !== null ? `<li><span>Tachygraphe<br><small>${c.dateTxt(v.tachy)} · ${dansTxt(v.tachy)}</small></span><b><span class="pg-st ${etatDoc(v.tachy)[0]}">${c.rdv.tachy[v.id] ? 'RDV à prendre' : etatDoc(v.tachy)[1]}</span></b></li>` : ''}<li><span>Vidange prévue</span><b>${v.vidange.toLocaleString('fr-FR')} km</b></li></ul></section>`
      + `<section class="ti-s"><h3>Tournées d'aujourd'hui</h3>${ts.length ? `<ul class="ti-l">${ts.map((T) => `<li data-tour="${T.id}" style="cursor:pointer"><span>${T.code} · ${T.client}<br><small>${pers(T.ch)?.nom || 'sans chauffeur'}</small></span><b><span class="pg-st ${libSt(T)[0]}">${libSt(T)[1]}</span></b></li>`).join('')}</ul>` : '<p class="pg-note">Aucune tournée aujourd\'hui.</p>'}</section>`;
  }
  function ouvrir(cle) { const [k, id] = [cle[0], cle.slice(2)]; tiroir.ouvrir(k === 't' ? ficheTournee(id) : k === 'p' ? fichePersonne(id) : ficheVehicule(id), cle); const el = tiroir.element(); if (!el._tr) { el._tr = 1; el.addEventListener('click', clic); } }
  function majTiroir() { const k = tiroir.cle(); if (!k) return; const id = k.slice(2); tiroir.maj(k[0] === 't' ? ficheTournee(id) : k[0] === 'p' ? fichePersonne(id) : ficheVehicule(id)); }

  // ---------- Tournées ----------
  function pageTournees(cont) {
    squelette(cont, 'tournees', `<div class="pg-outils"><input type="search" data-f="q" placeholder="Rechercher une tournée, un client, un chauffeur…" aria-label="Rechercher" value="${F.q}"><select data-f="filtre" aria-label="Filtrer"><option value="">Toutes les tournées</option><option value="encours">En cours</option><option value="retard">En retard</option><option value="livree">Livrées</option><option value="avenir">À venir ou au chargement</option><option value="bloquee">Bloquées</option></select><span class="pg-compte" data-z="compte"></span></div>`);
    const L = TV(), st = (T) => c.statutT(T), n = (f) => L.filter((T) => f(st(T))).length;
    poser(zone('kpis'), [
      kpi({ ic: ICK.camion, c: '#2563eb', cd: '#dbeafe', label: D().chauffeur ? 'Mes tournées' : 'Tournées du jour', val: L.length, det: `${L.reduce((s, T) => s + T.livr, 0)} points de livraison`, src: 'Planning des tournées · saisi par l\'exploitation' }),
      kpi({ ic: ICK.route, c: '#ea580c', cd: '#ffedd5', label: 'En cours', val: n((s) => s === 'encours' || s === 'retard'), det: `à ${c.hh(t())}`, src: 'Départs et retours en direct (simulation)' }),
      kpi({ ic: ICK.ok, c: '#16a34a', cd: '#dcfce7', label: 'Livrées', val: n((s) => s.startsWith('livree')), det: `${n((s) => s === 'livree-retard')} en retard` }),
      kpi({ ic: ICK.horloge, c: '#dc2626', cd: '#fee2e2', label: 'En retard', val: n((s) => s === 'retard'), det: 'retard signalé par le chauffeur' }),
      kpi({ ic: ICK.alerte, c: '#7c3aed', cd: '#ede9fe', label: 'Bloquées', val: n((s) => s === 'bloquee'), det: 'sans chauffeur ou sans véhicule' }),
    ].join(''));
    const q = sans(F.q.trim());
    const l = L.filter((T) => (!q || sans(`${T.code} ${T.client} ${pers(T.ch)?.nom || ''} ${veh(T.veh)?.nom || ''} ${veh(T.veh)?.immat || ''}`).includes(q))
      && (!F.filtre || (F.filtre === 'livree' ? st(T).startsWith('livree') : F.filtre === 'avenir' ? ['avenir', 'chargement'].includes(st(T)) : st(T) === F.filtre))).sort((a, b) => c.dEff(a) - c.dEff(b));
    poser(zone('corps'), (l.length ? `<section class="pg-carte pg-table-l"><table class="pg-table"><thead><tr><th>Départ</th><th>Tournée</th><th>Véhicule</th><th>Chauffeur</th><th class="num">Livraisons</th><th class="num">Retour</th><th>Statut</th></tr></thead><tbody>${l.map((T) => { const [cl, lib] = libSt(T), V = veh(T.veh); return `<tr data-cle="${T.id}" data-tour="${T.id}"><td><b>${c.hTxt(c.dEff(T))}</b></td><td><b>${T.code}</b><br><small>${T.client}</small></td><td>${V ? V.nom : '-'}<br><small>${V ? V.immat : ''}</small></td><td>${pers(T.ch)?.nom || '<span style="color:#dc2626;font-weight:600">aucun</span>'}</td><td class="num">${c.livraisonsFaites(T)} / ${T.livr}</td><td class="num">${c.hTxt(c.rEff(T))}${T.retard && t() >= (T.retardDes ?? 99) ? `<br><small style="color:#dc2626">+${T.retard} min</small>` : ''}</td><td><span class="pg-st ${cl}">${lib}</span></td></tr>`; }).join('')}</tbody></table></section>` : '<div class="pg-vide">Aucune tournée ne correspond à ces filtres.</div>')
      + '<p class="pg-note">Données fictives. Clic sur une tournée : son détail, et « Voir sur la maquette » pour retrouver le camion en 3D.</p>');
    poser(zone('compte'), `${l.length} sur ${L.length}`);
  }

  // ---------- Chauffeurs ----------
  function pageChauffeurs(cont) {
    squelette(cont, 'chauffeurs', `<div class="pg-outils"><input type="search" data-f="q" placeholder="Rechercher un chauffeur…" aria-label="Rechercher" value="${F.q}"><span class="pg-compte" data-z="compte"></span></div>`);
    const C = c.PERSONNEL.filter((p) => p.chauffeur), docsAlerte = C.filter((p) => Object.keys(DOCS).some((k) => p[k] !== null && p[k] <= SEUILS.docPrevoir));
    poser(zone('kpis'), [
      kpi({ ic: ICK.gens, c: '#2563eb', cd: '#dbeafe', label: 'Chauffeurs', val: C.length, det: `${C.filter((p) => p.permis === 'CE').length} CE · ${C.filter((p) => p.permis === 'C').length} C · ${C.filter((p) => p.permis === 'B').length} B` }),
      kpi({ ic: ICK.route, c: '#ea580c', cd: '#ffedd5', label: 'En tournée', val: C.filter((p) => c.etatPersonne(p).cle === 'route').length, det: `à ${c.hh(t())}` }),
      kpi({ ic: ICK.alerte, c: '#dc2626', cd: '#fee2e2', label: 'Absents', val: C.filter((p) => p.absent).length, det: C.filter((p) => p.absent).map((p) => p.nom).join(', ') || 'aucun' }),
      kpi({ ic: ICK.doc, c: '#7c3aed', cd: '#ede9fe', label: 'Documents à renouveler', val: docsAlerte.length, det: 'sous 30 jours', src: 'Calculé : échéances saisies dans le dossier du personnel' }),
    ].join(''));
    const q = sans(F.q.trim()), l = C.filter((p) => !q || sans(p.nom).includes(q));
    poser(zone('corps'), `<div class="pp-grille" style="grid-template-columns:repeat(auto-fill,minmax(290px,1fr))">${l.map((p) => { const e = c.etatPersonne(p), T = c.TOURNEES.filter((x) => x.ch === p.id); return `<button type="button" class="pp" data-pers="${p.id}"><span class="pg-st ${e.cl}">${e.txt}</span><div class="pp-tete">${avatar(p.nom, { taille: 52 })}<div><b>${p.nom}</b><small>${p.poste} · permis ${p.permis}</small></div></div>`
      + `<p class="pp-role">${T.length ? T.map((x) => `${x.code} · ${c.hTxt(c.dEff(x))} – ${c.hTxt(c.rEff(x))} · ${veh(x.veh)?.nom || ''}`).join('<br>') : p.absent || 'Pas de tournée : disponible en relais.'}</p>`
      + `<div class="pp-tags">${Object.entries(DOCS).filter(([k]) => p[k] !== null).map(([k, lib]) => { const s = etatDoc(p[k]); return `<span style="${s[0] === 'ko' ? 'background:#fee2e2;color:#b91c1c' : s[0] === 'att' ? 'background:#ffedd5;color:#c2410c' : ''}">${lib} · ${dansTxt(p[k])}</span>`; }).join('') || '<span>Permis B</span>'}</div></button>`; }).join('')}</div><p class="pg-note">Données fictives. Carte conducteur, FIMO/FCO et visite médicale : alerte 30 jours avant l'échéance, urgente 7 jours avant.</p>`);
    poser(zone('compte'), `${l.length} sur ${C.length}`);
  }

  // ---------- RH ----------
  function pageRH(cont) {
    const services = [...new Set(c.PERSONNEL.map((p) => p.service))];
    squelette(cont, 'rh', `<div class="pg-outils"><input type="search" data-f="q" placeholder="Rechercher une personne…" aria-label="Rechercher" value="${F.q}"><select data-f="service" aria-label="Service"><option value="">Tous les services</option>${services.map((s) => `<option>${s}</option>`).join('')}</select><span class="pg-compte" data-z="compte"></span></div>`);
    const P = c.PERSONNEL, an = new Date().getFullYear(), anc = P.reduce((s, p) => s + (an - p.entree), 0) / P.length;
    poser(zone('kpis'), [
      kpi({ ic: ICK.gens, c: '#2563eb', cd: '#dbeafe', label: 'Effectif', val: P.length, det: `${P.filter((p) => p.chauffeur).length} chauffeurs · ${P.length - P.filter((p) => p.chauffeur).length} sédentaires`, src: 'Registre du personnel (fictif)' }),
      kpi({ ic: ICK.doc, c: '#16a34a', cd: '#dcfce7', label: 'Contrats', val: `${P.filter((p) => p.contrat === 'CDI').length} CDI`, det: `${P.filter((p) => p.contrat === 'CDD').length} CDD` }),
      kpi({ ic: ICK.horloge, c: '#7c3aed', cd: '#ede9fe', label: 'Ancienneté moyenne', val: `${String(Math.round(anc * 10) / 10).replace('.', ',')} ans`, det: 'année d\'entrée dans l\'entreprise' }),
      kpi({ ic: ICK.alerte, c: '#dc2626', cd: '#fee2e2', label: 'Absents aujourd\'hui', val: P.filter((p) => p.absent).length, det: P.filter((p) => p.absent).map((p) => `${p.nom} (${p.absent.split(' (')[0].toLowerCase()})`).join(', ') || 'aucun' }),
    ].join(''));
    const q = sans(F.q.trim()), l = P.filter((p) => (!q || sans(`${p.nom} ${p.poste}`).includes(q)) && (!F.service || p.service === F.service));
    poser(zone('corps'), services.filter((s) => l.some((p) => p.service === s)).map((s) => `<h3 class="tr-service">${s} <small>${l.filter((p) => p.service === s).length}</small></h3><div class="pp-grille" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${l.filter((p) => p.service === s).map((p) => { const e = c.etatPersonne(p); return `<button type="button" class="pp" data-pers="${p.id}"><span class="pg-st ${e.cl}">${e.txt}</span><div class="pp-tete">${avatar(p.nom, { taille: 48 })}<div><b>${p.nom}</b><small>${p.poste}</small></div></div><div class="pp-pied"><div><small>Contrat</small><b>${p.contrat}</b></div><div><small>Depuis</small><b>${p.entree}</b></div></div></button>`; }).join('')}</div>`).join('')
      + '<p class="pg-note">Données fictives · 25 personnes inventées, aucune vraie photo. Clic sur une fiche : le détail et son CV en PDF (fabriqué dans le navigateur).</p>');
    poser(zone('compte'), `${l.length} sur ${P.length}`);
  }
  // CV fictif cohérent avec le poste (fabriqué dans le navigateur par cv.js)
  function donneesCV(p) {
    const an = new Date().getFullYear(), slug = sans(p.nom).replace(/[^a-z]+/g, '.');
    const avant = { Conduite: p.permis === 'B' ? ['Livreur', 'Messagerie Rapide du Sud (fictif)'] : ['Conducteur routier', 'Transports Delorme (fictif)'], Atelier: ['Mécanicien poids lourds', 'Garage PL Central (fictif)'], Quai: ['Préparateur de commandes', 'Logistique Horizon (fictif)'], Exploitation: ['Affréteur', 'Fret Conseil (fictif)'], Direction: ['Responsable d\'exploitation', 'Groupe Transalp (fictif)'], Administration: ['Comptable', 'Cabinet Martel (fictif)'], Commercial: ['Commercial transport', 'Logistique Horizon (fictif)'] }[p.service] || ['Employé', 'Entreprise fictive'];
    const formation = { Conduite: p.permis === 'B' ? [[p.entree - 3, 'Permis B', 'Auto-école (fictive)']] : [[p.entree - 2, `Permis ${p.permis} et FIMO marchandises`, 'Centre de formation routière (fictif)']], Atelier: [[p.entree - 4, 'Bac pro maintenance des véhicules, option véhicules de transport routier', 'Lycée professionnel (fictif)']], Quai: [[p.entree - 1, 'CACES R489 catégories 1, 3 et 5', 'Organisme de formation (fictif)']], Exploitation: [[p.entree - 2, 'BTS Gestion des transports et logistique associée', 'Lycée (fictif)']], Direction: [[p.entree - 8, 'Master logistique et transport', 'Université (fictive)'], [p.entree - 6, 'Attestation de capacité en transport de marchandises', 'Centre agréé (fictif)']], Administration: [[p.entree - 6, 'BTS Comptabilité et gestion', 'Lycée (fictif)']], Commercial: [[p.entree - 5, 'BTS Négociation et relation client', 'Lycée (fictif)']] }[p.service] || [];
    const comp = { Conduite: ['Conduite économique', 'Chargement et arrimage', 'Chronotachygraphe numérique', 'Relation client à la livraison'], Atelier: ['Diagnostic électronique PL', 'Freinage et pneumatiques', 'Entretien préventif'], Quai: ['Chariot élévateur', 'Préparation et contrôle des expéditions', 'Inventaire'], Exploitation: ['Planification des tournées', 'Réglementation sociale européenne', 'Suivi des temps de conduite'], Direction: ['Pilotage d\'entreprise', 'Gestion de flotte', 'Management'], Administration: ['Facturation', 'Paie et variables', 'Relances clients'], Commercial: ['Prospection', 'Cotations', 'Suivi des comptes clients'] }[p.service] || [];
    return { nom: p.nom, titre: p.poste, pour: `Transports Modèle (fictif) · ${p.service}`, ville: 'Ville fictive', email: `${slug}@exemple.invalid`, telephone: '06 00 00 00 00 (fictif)',
      profil: `${p.poste} chez Transports Modèle depuis ${p.entree}. Personne et parcours inventés pour la démonstration.`,
      xp: [[String(p.entree), 'aujourd\'hui', p.poste, 'Transports Modèle (fictif)', comp.slice(0, 2).map((x) => x + ' au quotidien')], [String(Math.max(1990, p.entree - 4)), String(p.entree), avant[0], avant[1], ['Poste occupé avant l\'entrée dans l\'entreprise']]],
      formation, competences: comp, langues: ['Français'], permis: p.permis ? `Permis ${p.permis === 'CE' ? 'B, C, CE' : p.permis === 'C' ? 'B, C' : 'B'}` : (an - p.entree > 0 ? 'Permis B' : ''), couleur: '#1e3a8a' };
  }
  async function cv(id, mode) {
    const p = pers(id); if (!p) return; const blob = await cvPdf(donneesCV(p)), nom = `CV - ${p.nom} (fictif).pdf`;
    if (mode === 'telecharger') telechargerPdf(blob, nom); else ouvrirPdf(blob, nom, `CV de ${p.nom} (fictif)`);
    c.surAction?.(`CV de ${p.nom} ${mode === 'telecharger' ? 'téléchargé' : 'consulté'}`);
  }

  // ---------- Documents et échéances ----------
  function echeances() {
    const L = [];
    for (const v of c.VEHICULES) {
      L.push({ objet: `${v.nom} · ${v.immat}`, doc: 'Contrôle technique', j: v.ct, e: etatCT(v.ct), suite: c.rdv.ct[v.id] ? 'RDV à prendre (noté)' : '', cle: 'v:' + v.id, type: 'vehicule' });
      if (v.tachy !== null) L.push({ objet: `${v.nom} · ${v.immat}`, doc: 'Contrôle du tachygraphe', j: v.tachy, e: etatDoc(v.tachy), suite: c.rdv.tachy[v.id] ? 'RDV à prendre (noté)' : '', cle: 'v:' + v.id, type: 'vehicule' });
    }
    for (const p of c.PERSONNEL.filter((x) => x.chauffeur)) for (const [k, lib] of Object.entries(DOCS)) if (p[k] !== null) L.push({ objet: p.nom, doc: lib, j: p[k], e: etatDoc(p[k]), suite: c.renouv[p.id + ':' + k] !== undefined ? 'Demande en cours (notée)' : '', cle: 'p:' + p.id, type: 'chauffeur' });
    return L.sort((a, b) => a.j - b.j);
  }
  function pageDocuments(cont) {
    squelette(cont, 'documents', `<div class="pg-outils"><input type="search" data-f="q" placeholder="Rechercher un véhicule, une personne…" aria-label="Rechercher" value="${F.q}"><select data-f="type" aria-label="Type"><option value="">Véhicules et chauffeurs</option><option value="vehicule">Véhicules</option><option value="chauffeur">Chauffeurs</option></select><select data-f="filtre" aria-label="Statut"><option value="">Tous les statuts</option><option value="alerte">À prévoir, urgents, dépassés</option><option value="ok">À jour</option></select><button type="button" class="pg-bt" data-pdf="registre::voir">Registre (PDF)</button><span class="pg-compte" data-z="compte"></span></div>`);
    const E = echeances(), n = (f) => E.filter(f).length;
    poser(zone('kpis'), [
      kpi({ ic: ICK.doc, c: '#2563eb', cd: '#dbeafe', label: 'Échéances suivies', val: E.length, det: `${c.VEHICULES.length} véhicules · ${c.PERSONNEL.filter((p) => p.chauffeur).length} chauffeurs`, src: 'Cartes grises, carnets d\'entretien et dossiers du personnel (fictifs)' }),
      kpi({ ic: ICK.alerte, c: '#dc2626', cd: '#fee2e2', label: 'Dépassées ou urgentes', val: n((x) => x.e[0] === 'ko'), det: 'moins de 7 jours (3 pour un CT)' }),
      kpi({ ic: ICK.horloge, c: '#ea580c', cd: '#ffedd5', label: 'À prévoir', val: n((x) => x.e[0] === 'att'), det: 'dans les 30 jours (15 pour un CT)' }),
      kpi({ ic: ICK.ok, c: '#16a34a', cd: '#dcfce7', label: 'Suite donnée', val: n((x) => x.suite), det: 'notée depuis « À traiter »' }),
    ].join(''));
    const q = sans(F.q.trim()), l = E.filter((x) => (!q || sans(`${x.objet} ${x.doc}`).includes(q)) && (!F.type || x.type === F.type) && (!F.filtre || (F.filtre === 'ok' ? x.e[0] === 'ok' : x.e[0] !== 'ok')));
    poser(zone('corps'), (l.length ? `<section class="pg-carte pg-table-l"><table class="pg-table"><thead><tr><th>Véhicule ou personne</th><th>Document</th><th>Échéance</th><th>Statut</th><th>Suite donnée</th></tr></thead><tbody>${l.map((x) => `<tr data-cle="${x.cle}" data-${x.cle[0] === 'v' ? 'veh' : 'pers'}="${x.cle.slice(2)}"><td><b>${x.objet}</b></td><td>${x.doc}</td><td>${c.dateTxt(x.j)}<br><small>${dansTxt(x.j)}</small></td><td><span class="pg-st ${x.e[0]}">${x.e[1]}</span></td><td><small>${x.suite || '-'}</small></td></tr>`).join('')}</tbody></table></section>` : '<div class="pg-vide">Aucune échéance ne correspond à ces filtres.</div>')
      + '<p class="pg-note">Données fictives. Les échéances sont calculées à partir d\'aujourd\'hui ; le registre en PDF est fabriqué dans votre navigateur.</p>');
    poser(zone('compte'), `${l.length} sur ${E.length}`);
  }
  async function registre(mode) {
    const d = creerPdf({ titre: 'Registre des échéances (fictif)', auteur: 'Démonstration CRM visuel 3D' }), E = echeances();
    let y = 0; const tete = () => { d.page(); d.rect(0, 0, d.LARG, 70, '#0f2a5c'); d.texte(40, 32, 'Transports Modèle · registre des échéances', { taille: 16, gras: true, couleur: '#ffffff' }); d.texte(40, 52, `Document fictif (démonstration) · édité le ${c.dateTxt(0)} à ${c.hh(t())}`, { taille: 9, couleur: '#cbd5e1' }); y = 100;
      [['Véhicule ou personne', 40], ['Document', 220], ['Échéance', 360], ['Statut', 460]].forEach(([s, x]) => d.texte(x, y, s, { taille: 9, gras: true, couleur: '#475569' })); y += 8; d.trait(40, y, 555, y, '#cbd5e1'); y += 16; };
    tete();
    for (const x of E) { if (y > d.HAUT - 50) tete(); const col = x.e[0] === 'ko' ? '#b91c1c' : x.e[0] === 'att' ? '#c2410c' : '#15803d';
      d.texte(40, y, x.objet, { taille: 9 }); d.texte(220, y, x.doc, { taille: 9 }); d.texte(360, y, `${c.dateTxt(x.j)} (${dansTxt(x.j)})`, { taille: 9 }); d.texte(460, y, x.e[1] + (x.suite ? ' · suite notée' : ''), { taille: 9, gras: true, couleur: col }); y += 17; }
    const blob = d.blob(), nom = 'Registre des échéances (fictif).pdf';
    if (mode === 'telecharger') telechargerPdf(blob, nom); else ouvrirPdf(blob, nom, 'Registre des échéances (fictif)');
    c.surAction?.('Registre des échéances édité en PDF');
  }

  // ---------- Chiffres ----------
  function pageChiffres(cont) {
    if (!(racine && cont.contains(racine) && rubRendue === 'chiffres')) {
      racine = document.createElement('div'); rubRendue = 'chiffres';
      racine.innerHTML = '<div data-z="kpis-cartes"></div><div data-z="corps"></div>';
      cont.replaceChildren(racine); racine.addEventListener('click', clic);
      zone('kpis-cartes').appendChild(c.kpisEl());
    }
    const h0 = t(), heures = []; for (let h = c.OUVERTURE; h < c.FERMETURE; h++) heures.push(h);
    const fin = c.TOURNEES.filter((T) => !c.bloquee(T));
    const parH = heures.map((h) => fin.filter((T) => c.rEff(T) >= h && c.rEff(T) < h + 1 && c.rEff(T) <= h0).length);
    const ca = heures.map((h) => fin.filter((T) => c.rEff(T) >= h && c.rEff(T) < h + 1 && c.rEff(T) <= h0).reduce((s, T) => s + T.prix, 0));
    const livrees = fin.filter((T) => c.rEff(T) <= h0), alheure = livrees.filter((T) => !T.retard), pct = livrees.length ? (alheure.length / livrees.length) * 100 : 100;
    const kmV = c.VEHICULES.map((v) => [v, c.kmDuJour(v) - v.km]).filter(([, k]) => k > 0).sort((a, b) => b[1] - a[1]);
    const fam = [['semi', 'Semis'], ['porteur', 'Porteurs'], ['util', 'Fourgons']].map(([f, lib]) => { const vs = c.VEHICULES.filter((v) => v.famille === f); return { lib, n: vs.length, sortis: vs.filter((v) => c.TOURNEES.some((T) => T.veh === v.id && !c.bloquee(T) && c.dEff(T) <= h0)).length }; });
    poser(zone('corps'), `<div class="pg-grille">`
      + (D().finances ? carteGraphe('Tournées terminées, par heure de retour', `${c.euros(ca.reduce((s, x) => s + x, 0))} HT facturables aujourd'hui`, barres({ lib: heures.map((h) => h + 'h'), val: ca, coul: '#16a34a', passe: heures.map((h) => h < h0), format: (n) => Math.round(n) + ' €', titreBarre: (i) => `${heures[i]}h-${heures[i] + 1}h : ${parH[i]} tournée(s), ${c.euros(ca[i])}` }) + '<p class="pg-note">Prix HT des tournées revenues au dépôt (fictifs). Les heures à venir restent vides.</p>')
        : carteGraphe('Tournées terminées, par heure de retour', `${livrees.length} aujourd'hui`, barres({ lib: heures.map((h) => h + 'h'), val: parH, coul: '#16a34a', passe: heures.map((h) => h < h0), format: (n) => Math.round(n) })))
      + carteGraphe('Kilomètres roulés aujourd\'hui', `${Math.round(kmV.reduce((s, [, k]) => s + k, 0)).toLocaleString('fr-FR')} km au total`, barresH(kmV.slice(0, 10).map(([v, k]) => ({ label: v.nom, val: k, max: Math.max(1, ...kmV.map(([, x]) => x)), coul: '#2563eb', txt: `${Math.round(k)} km`, cle: v.id }))) + '<p class="pg-note">Estimé : distance de la tournée × part du trajet faite à cette heure.</p>')
      + `</div><div class="pg-grille g3">`
      + carteGraphe('Ponctualité', 'tournées revenues sans retard', (livrees.length ? anneau(pct, '#16a34a', `${Math.round(pct)} %`, `${alheure.length} sur ${livrees.length} livrées`) : '<p class="pg-note">Aucune tournée rentrée pour l\'instant.</p>'))
      + carteGraphe('Véhicules sortis aujourd\'hui', 'par famille', barresH(fam.map((x) => ({ label: x.lib, val: x.sortis, max: x.n, coul: '#ea580c', txt: `${x.sortis} / ${x.n}` }))) + '<p class="pg-note">Un véhicule est « sorti » dès qu\'une tournée est partie avec lui.</p>')
      + carteGraphe('Statut des tournées', `à ${c.hh(h0)}`, barresH(Object.entries(ST_T).map(([k, [, lib]]) => ({ label: lib, val: c.TOURNEES.filter((T) => c.statutT(T) === k).length, max: c.TOURNEES.length, coul: k.startsWith('livree') ? '#16a34a' : k === 'retard' || k === 'bloquee' ? '#dc2626' : '#2563eb', txt: String(c.TOURNEES.filter((T) => c.statutT(T) === k).length) })).filter((x) => x.val)))
      + `</div>` + legende([['données fictives, recalculées chaque minute de démo', '#94a3b8']]));
  }

  function maj() { const cont = racine && racine.parentElement; if (cont) rendre(rubRendue, cont); }
  function rendre(rub, cont) {
    ({ tournees: pageTournees, chauffeurs: pageChauffeurs, rh: pageRH, documents: pageDocuments, chiffres: pageChiffres })[rub]?.(cont);
    majTiroir();
  }
  return { rendre, fermer: () => tiroir.fermer(), ouvrir };
}
