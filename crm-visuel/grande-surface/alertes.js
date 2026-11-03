// Onglet « À traiter » de la démo « Hyper Modèle » : alertes calculées à partir de l'état de la simulation.
// Module ES sans import. Rien n'est écrit en dur : chaque alerte vient d'une règle appliquée aux chiffres du moment.
//   calculerAlertes(etat) -> [{ cle, niveau: 'urgent'|'surveiller'|'conseil', icone, titre, detail, voir, actions: [{ act, label, primaire, off, raison }] }]
//   etat est fabriqué par index.html à chaque minute de démo (voir etatDecision()).
// Règles (seuils de la démo) :
//   rayon      stock < 50 % = urgent, < 70 % ou au moins 8 ruptures = à surveiller ; masquée si une commande est en route
//   caisses    file la plus longue >= 4 clients = urgent, 3 = à surveiller ; pic prévu dans 30 min (affluence et planning) = conseil
//   livraison  arrive dans les 45 min = conseil (à surveiller si aucun réceptionnaire ou réserve presque pleine) ; camion au quai sans réceptionnaire = urgent
//   réserve    au moins 2 palettes posées au sol faute de place en rack = à surveiller
//   accueil    personne à l'accueil pendant l'ouverture = à surveiller
//   pauses     pause prévue repoussée de plus de 10 min par une tâche en cours = conseil
//   RH         entretien qui commence dans les 30 min = conseil (à surveiller si la responsable RH est absente)

export const NIVEAUX = { urgent: { rang: 0, nom: 'Urgent', couleur: '#dc2626' }, surveiller: { rang: 1, nom: 'À surveiller', couleur: '#ea580c' }, conseil: { rang: 2, nom: 'Conseil', couleur: '#2563eb' } };

const pc = (x) => Math.round(x * 100) + ' %';
const pl = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
const prenom = (nom) => nom.split(' ')[0];

export function calculerAlertes(e) {
  const A = [], { hTxt, hh } = e;

  // ---------- rayons : stock et ruptures, les plus vendus d'abord ----------
  for (const r of e.rayons) {
    if (r.commande && !r.commande.recue) continue; // déjà commandé : la livraison est en route
    const niveau = r.stock < 0.5 ? 'urgent' : r.stock < 0.7 || r.ruptures >= 8 ? 'surveiller' : null;
    if (!niveau) continue;
    const seuil = r.stock - 0.3, quand = r.conso > 0 && seuil > 0 ? e.t + seuil / r.conso : null;
    const detail = [`Stock ${pc(r.stock)} · ${pl(r.ruptures, 'produit')} en rupture · baisse de ${Math.round(r.conso * 100)} points par heure`];
    if (quand && quand < e.fermeture) detail.push(`À ce rythme, 30 % vers ${hh(quand)}.`);
    if (r.attendues.length) detail.push(`Déjà attendu : ${r.attendues.map((d) => `${d.palettes} palettes à ${hTxt(d.heure)}`).join(', ')}.`);
    detail.push(r.enRayon ? `En rayon : ${r.enRayon}.` : 'Personne en rayon en ce moment.');
    detail.push(r.reserve ? `${pl(r.reserve, 'palette')} en réserve pour ce rayon.` : 'Aucune palette en réserve pour ce rayon.');
    const actions = [{ act: 'commander:' + r.id, label: `Commander ${r.suggestion} palettes`, primaire: true, off: !r.peutCommander, raison: r.peutCommander ? '' : 'plus de livraison possible aujourd\'hui' }];
    if (r.reserve) actions.push({ act: 'rayon:' + r.id, label: r.employe ? `Envoyer ${prenom(r.employe.nom)} en rayon` : 'Envoyer en rayon', off: !r.employe, raison: r.employe ? '' : 'personne de libre en ce moment' });
    A.push({ cle: 'stock-' + r.id, niveau, icone: 'rayon', titre: `${r.stock < 0.5 ? 'Stock critique' : 'Stock bas'} : ${r.nom}`, detail, voir: r.id, actions, score: r.conso * 10 + (1 - r.stock) });
  }

  // ---------- caisses : file d'attente comparée aux caisses ouvertes ----------
  const c = e.caisses;
  if (e.ouvert) {
    const prop = c.proposition, lib = c.caisseLibre;
    const action = { act: 'caisse', label: prop && lib !== null ? `Ouvrir la caisse ${lib + 1} avec ${prenom(prop.nom)}` : 'Ouvrir une caisse', primaire: true, off: !(prop && lib !== null), raison: lib === null ? 'toutes les caisses sont ouvertes' : prop ? '' : 'personne de disponible' };
    const qui = prop ? `Proposé : ${prop.nom} (${prop.poste.toLowerCase()}, ${prop.ou}), le plus près des caisses parmi les personnes libres.` : 'Aucune personne libre pour un renfort en ce moment.';
    if (c.fileMax >= 3) {
      A.push({ cle: 'caisse-file', niveau: c.fileMax >= 4 ? 'urgent' : 'surveiller', icone: 'caisse', titre: `File d'attente en caisse : ${c.fileMax} clients`, detail: [`${c.ouvertes} caisses ouvertes sur ${c.total} · ${c.clients} clients dans le magasin · attente estimée ${c.attente} min`, qui], voir: c.pire !== null ? 'c' + c.pire : 'caisses', actions: [action], score: c.fileMax });
    } else if (c.fileDans30 >= 3 && c.fileDans30 > c.fileMax) {
      A.push({ cle: 'caisse-pic', niveau: 'conseil', icone: 'caisse', titre: `Pic de clients prévu vers ${hh(e.t + 0.5)}`, detail: [`Avec ${c.ouvertesDans30} caisses prévues au planning, la file monterait à ${c.fileDans30} clients (affluence prévue ${pc(c.affluenceDans30)}).`, qui], voir: 'caisses', actions: [action], score: c.fileDans30 });
    }
  }

  // ---------- livraisons et réserve ----------
  for (const d of e.livraisons) {
    if (d.statut === 'prévue' && d.heure - e.t <= 0.75 && d.heure > e.t) {
      const rec = d.receptionnaires, place = e.reserve.libres;
      const manque = !rec.length || place < d.lots;
      const detail = [`${d.fourn} · ${pl(d.palettes, 'palette')} pour le rayon ${d.rayonNom.toLowerCase()}`, rec.length ? `Réceptionnaires présents à ${hTxt(d.heure)} : ${rec.join(', ')}.` : `Aucun réceptionnaire au planning à ${hTxt(d.heure)}.`, `${pl(place, 'emplacement')} libre${place > 1 ? 's' : ''} en réserve pour ${pl(d.lots, 'lot')} à ranger.`];
      A.push({ cle: 'liv-' + d.id, niveau: manque ? 'surveiller' : 'conseil', icone: 'camion', titre: `Livraison à ${hTxt(d.heure)} dans ${Math.max(1, Math.round((d.heure - e.t) * 60))} min`, detail, voir: d.id, actions: [{ act: 'noter:liv-' + d.id, label: 'Marquer comme traité' }], score: 1 - (d.heure - e.t) });
    }
    if (d.statut === 'au quai' && d.dechargees < d.palettes) {
      const rec = d.receptionnairesLa;
      A.push({ cle: 'quai-' + d.id, niveau: rec.length ? 'conseil' : 'urgent', icone: 'camion', titre: rec.length ? `Camion au quai : ${d.dechargees} palettes sur ${d.palettes} déchargées` : 'Camion au quai sans réceptionnaire', detail: [`${d.fourn} · rayon ${d.rayonNom.toLowerCase()}`, rec.length ? `En cours : ${rec.join(', ')}.` : 'Personne de la réception n\'est présent : le camion attend.'], voir: d.id, actions: [{ act: 'noter:quai-' + d.id, label: 'Marquer comme traité' }], score: 2 });
    }
  }
  if (e.reserve.auSol >= 2) {
    const r = e.reserve.auSolRayon;
    A.push({ cle: 'sol', niveau: 'surveiller', icone: 'palette', titre: `${e.reserve.auSol} palettes posées au sol en réserve`, detail: [`Les racks sont pleins (${e.reserve.libresRack} place${e.reserve.libresRack > 1 ? 's' : ''} libre${e.reserve.libresRack > 1 ? 's' : ''}) : ces palettes gênent le passage.`, r ? `À mettre en rayon en premier : ${r.nom.toLowerCase()}.` : ''].filter(Boolean), voir: 'reserve', actions: r ? [{ act: 'rayon:' + r.id, label: r.employe ? `Envoyer ${prenom(r.employe.nom)} en rayon` : 'Envoyer en rayon', primaire: true, off: !r.employe, raison: r.employe ? '' : 'personne de libre en ce moment' }] : [{ act: 'noter:sol', label: 'Marquer comme traité' }], score: e.reserve.auSol });
  }

  // ---------- postes et pauses ----------
  if (e.ouvert && !e.accueil.presents.length) {
    A.push({ cle: 'accueil', niveau: 'surveiller', icone: 'personne', titre: 'Accueil sans personne', detail: [e.accueil.raison], voir: 'accueil', actions: [{ act: 'noter:accueil', label: 'Marquer comme traité' }], score: 1 });
  }
  for (const p of e.pausesEnRetard) {
    A.push({ cle: 'pause-' + p.id, niveau: 'conseil', icone: 'horloge', titre: `Pause en retard : ${p.nom}`, detail: [`${p.poste} · pause prévue à ${hTxt(p.debut)}, toujours occupé·e : ${p.tache}.`, `La pause de 30 min se termine à ${hTxt(p.debut + 0.5)} au planning.`], voir: p.id, actions: [{ act: 'noter:pause-' + p.id, label: 'Marquer comme traité' }], score: 0.5 });
  }

  // ---------- RH : entretien qui approche ----------
  for (const r of e.entretiens) {
    if (r.debut > e.t && r.debut - e.t <= 0.5) {
      A.push({ cle: 'rdv-' + r.id, niveau: e.rh.presente ? 'conseil' : 'surveiller', icone: 'rh', titre: `Entretien à ${hTxt(r.debut)} : ${r.nom}`, detail: [`Candidature : ${r.poste} · bureau RH, 1er étage`, e.rh.presente ? `${e.rh.nom} est présente.` : `${e.rh.nom} n'est pas là à cette heure.`], voir: 'etage-rh', actions: [{ act: 'rh:' + r.id, label: 'Ouvrir le dossier', primaire: true }, { act: 'noter:rdv-' + r.id, label: 'Marquer comme traité' }], score: 1 - (r.debut - e.t) });
    }
  }

  return A.filter((a) => !e.masque[a.cle] || e.masque[a.cle] <= e.t).sort((a, b) => NIVEAUX[a.niveau].rang - NIVEAUX[b.niveau].rang || b.score - a.score);
}

// Icônes SVG en ligne (trait 2 px, couleur du texte)
const T = (d) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICONES = {
  rayon: T('<path d="M4 4v16M20 4v16M4 9h16M4 15h16"/><path d="M7 9V7h3v2M13 15v-3h4v3"/>'),
  caisse: T('<rect x="3" y="10" width="18" height="10" rx="2"/><path d="M7 10V5h10v5M7 15h4"/>'),
  camion: T('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>'),
  palette: T('<path d="M4 14h16v3H4zM6 17v2M12 17v2M18 17v2M6 5h12v9H6z"/>'),
  personne: T('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  horloge: T('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  rh: T('<path d="M8 3h8l4 4v14H4V3h4"/><path d="M8 12h8M8 16h5"/>'),
  voir: T('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  ok: T('<path d="M5 12l5 5 9-10"/>'),
  alerte: T('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h0"/>'),
  info: T('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h0"/>'),
};
