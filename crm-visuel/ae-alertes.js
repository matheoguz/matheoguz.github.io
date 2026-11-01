// Onglet « À traiter » de la démo « Auto-école Modèle » : alertes calculées à partir de l'état de la simulation.
// Module ES sans import. Rien n'est écrit en dur : chaque alerte vient d'une règle appliquée aux données du moment
// (planning du jour, forfaits et soldes des élèves, kilométrage, salle de code). Seuils de la démo :
//   impayé     reste à payer > 0 et prochaine leçon dans moins de 1 h 30 (ou en cours) ; urgent dès 300 €
//   forfait    heures faites + heures prévues aujourd'hui >= forfait - 1 h, leçon dans les 3 h ; pas pour un examen
//   examen     examen dans les 2 h (conseil) ; examen terminé sans résultat saisi (à surveiller)
//   révision   révision tous les 10 000 km ; kilométrage du jour = compteur + 25 km par heure de leçon roulée ;
//              à surveiller sous 2 000 km, urgent sous 500 km ; masquée quand le rendez-vous garage est pris
//   créneau    un moniteur sans leçon pendant au moins 1 h dans les 4 h 30 à venir, avec une voiture libre et un élève
//              qui a encore des heures à faire : conseil (à surveiller si le créneau commence dans moins d'une heure)
//   charge     au moins 8 h de leçons prévues pour un moniteur et moins de 1 h 30 de pause entre 11h et 14h,
//              tant qu'une leçon peut encore être reportée (élève prévenu au moins 1 h avant)
//   code       salle de code à 11 places sur 12 ou plus
//
//   calculerAlertes(e) -> [{ cle, niveau, icone, titre, detail: [..], voir, lieu, actions: [{ act, label, primaire, off, raison }], score }]

export const NIVEAUX = { urgent: { rang: 0, nom: 'Urgent', couleur: '#dc2626', doux: '#fef2f2' }, surveiller: { rang: 1, nom: 'À surveiller', couleur: '#ea580c', doux: '#fff7ed' }, conseil: { rang: 2, nom: 'Conseil', couleur: '#2563eb', doux: '#eff6ff' } };
export const SEUILS = { impayeUrgent: 300, creneauMax: 2, pauseMidi: 1.5, impayeAvant: 1.5, forfaitMarge: 1, forfaitAvant: 3, examenAvant: 2, revisionPas: 10000, kmParHeure: 25, revisionAlerte: 2000, revisionUrgent: 500, creneauHorizon: 4.5, chargeMax: 8, codeAlerte: 11 };

const prenom = (nom) => nom.split(' ')[0];
const occupe = (ls, debut, fin) => ls.some((l) => l.debut < fin && debut < l.fin);

export function calculerAlertes(e) {
  const A = [], { t, hTxt, euros } = e, S = SEUILS;
  const P = e.planning, moniteur = (id) => e.moniteurs.find((m) => m.id === id);
  const exam = (l) => l.type.startsWith('Examen');

  // ---------- impayés : à encaisser avant ou pendant la prochaine leçon ----------
  for (const [nom, [faites, forfait, reste]] of Object.entries(e.eleves)) {
    if (reste <= 0) continue;
    const nl = P.filter((l) => l.eleve === nom && l.fin > t).sort((a, b) => a.debut - b.debut)[0];
    if (!nl || nl.debut - t > S.impayeAvant) continue;
    const enCours = nl.debut <= t;
    A.push({
      cle: 'impaye-' + nom, niveau: reste >= S.impayeUrgent ? 'urgent' : 'surveiller', icone: 'euro',
      titre: `Impayé : ${nom} doit ${euros(reste)}`,
      detail: [enCours ? `En leçon jusqu'à ${hTxt(nl.fin)} avec ${moniteur(nl.m).nom} : à encaisser au retour.` : `Leçon à ${hTxt(nl.debut)} avec ${moniteur(nl.m).nom} : à encaisser à son arrivée à l'accueil.`,
        `Forfait ${faites} h faites sur ${forfait} h · ${e.relances[nom] ? 'relancé à ' + hTxt(e.relances[nom]) : 'pas encore relancé'}.`],
      voir: nl.id, lieu: enCours ? nl.veh : 'accueil',
      actions: [{ act: 'encaisser:' + nom, label: `Encaisser ${euros(reste)}`, primaire: true }, { act: 'relancer:' + nom, label: 'Marquer relancé' }],
      score: reste / 100 + (S.impayeAvant - Math.max(0, nl.debut - t)),
    });
  }

  // ---------- forfaits qui se terminent ----------
  for (const [nom, [faites, forfait]] of Object.entries(e.eleves)) {
    const ls = P.filter((l) => l.eleve === nom);
    if (!ls.length || ls.some(exam)) continue;
    const prevues = ls.reduce((s, l) => s + l.duree, 0), total = faites + prevues;
    if (total < forfait - S.forfaitMarge) continue;
    const nl = ls.filter((l) => l.fin > t).sort((a, b) => a.debut - b.debut)[0];
    if (!nl || nl.debut - t > S.forfaitAvant) continue;
    const depasse = Math.max(0, total - forfait);
    A.push({
      cle: 'forfait-' + nom, niveau: 'conseil', icone: 'forfait',
      titre: depasse ? `Forfait dépassé ce soir : ${nom}` : `Forfait bientôt épuisé : ${nom}`,
      detail: [`${faites} h faites + ${String(prevues).replace('.', ',')} h prévues aujourd'hui = ${String(total).replace('.', ',')} h sur un forfait de ${forfait} h.`, depasse ? `${String(depasse).replace('.', ',')} h hors forfait : à proposer avant la leçon de ${hTxt(nl.debut)}.` : `Proposer un complément avant la leçon de ${hTxt(nl.debut)}.`],
      voir: nl.id, lieu: 'accueil',
      actions: [{ act: 'forfait:' + nom, label: `Ajouter 5 h (${euros(5 * e.prixHeure)})`, primaire: true }, { act: 'noter:forfait-' + nom, label: 'Plus tard' }],
      score: total - forfait,
    });
  }

  // ---------- examens ----------
  for (const l of P.filter(exam)) {
    if (l.debut > t && l.debut - t <= S.examenAvant) {
      A.push({ cle: 'examen-' + l.id, niveau: 'conseil', icone: 'examen', titre: `Examen à ${hTxt(l.debut)} : ${l.eleve}`, detail: [`${l.type} · ${moniteur(l.m).nom} · ${e.vehicule(l.veh).nom}.`, `Départ prévu dans ${Math.max(1, Math.round((l.debut - t) * 60))} min.`], voir: l.id, lieu: l.veh, actions: [{ act: 'noter:examen-' + l.id, label: 'Convocation vérifiée', primaire: true }], score: 2 - (l.debut - t) });
    } else if (l.fin <= t && !e.resultats[l.id]) {
      A.push({ cle: 'resultat-' + l.id, niveau: 'surveiller', icone: 'examen', titre: `Résultat d'examen à saisir : ${l.eleve}`, detail: [`${l.type} de ${hTxt(l.debut)} avec ${moniteur(l.m).nom}, terminé à ${hTxt(l.fin)}.`, 'Le dossier de l\'élève reste ouvert tant que le résultat n\'est pas saisi.'], voir: l.id, lieu: l.veh, actions: [{ act: `examen:${l.id}:recu`, label: 'Reçu', primaire: true }, { act: `examen:${l.id}:ajourne`, label: 'Ajourné' }], score: 1 });
    }
  }

  // ---------- révision des voitures (kilométrage) ----------
  for (const v of e.voitures) {
    if (e.rdvGarage[v.id]) continue;
    const km = e.kmDuJour(v), cap = Math.ceil((km + 1) / S.revisionPas) * S.revisionPas, reste = cap - km;
    if (reste > S.revisionAlerte) continue;
    const libre = e.fenetreLibre(v.id, 2);
    A.push({ cle: 'revision-' + v.id, niveau: reste < S.revisionUrgent ? 'urgent' : 'surveiller', icone: 'cle',
      titre: `Révision des ${cap.toLocaleString('fr-FR')} km : ${v.nom}`,
      detail: [`${km.toLocaleString('fr-FR')} km au compteur, révision dans ${reste.toLocaleString('fr-FR')} km (≈ ${Math.round(reste / S.kmParHeure)} h de leçon).`, libre ? `${v.nom} est libre de ${hTxt(libre[0])} à ${hTxt(libre[1])} aujourd'hui.` : `${v.nom} n'a plus de créneau libre de 2 h aujourd'hui.`],
      voir: v.id, lieu: v.id,
      actions: [{ act: 'garage:' + v.id, label: 'Prendre RDV au garage', primaire: true }],
      score: 1 - reste / S.revisionAlerte });
  }

  // ---------- créneaux libres : moniteur sans leçon + voiture libre + élève à placer ----------
  const creneaux = [];
  for (const m of e.moniteurs) {
    const ls = P.filter((l) => l.m === m.id);
    for (let g0 = Math.ceil((t + 0.2) * 2) / 2; g0 + 1 <= e.fermeture && g0 <= t + S.creneauHorizon; g0 += 0.5) {
      if (occupe(ls, g0, g0 + 1)) continue;
      const voiture = e.voituresPour(m).find((v) => !occupe(P.filter((l) => l.veh === v.id), g0 - 0.25, g0 + 1.25));
      if (!voiture) continue;
      const eleve = e.eleveAPlacer(g0, g0 + 1, voiture);
      if (!eleve) continue;
      const fin = Math.min(e.fermeture, ...ls.filter((l) => l.debut >= g0 + 1).map((l) => l.debut));
      const debut = Math.max(t, ...ls.filter((l) => l.fin <= g0).map((l) => l.fin), e.ouverture);
      creneaux.push({ m, g0, voiture, eleve, debut, fin }); break;
    }
  }
  // les deux plus proches seulement (les autres apparaîtront à leur tour)
  for (const { m, g0, voiture, eleve, debut, fin } of creneaux.sort((a, b) => a.g0 - b.g0).slice(0, S.creneauMax)) {
    const proche = g0 - t < 1;
    A.push({ cle: 'creneau-' + m.id, niveau: proche ? 'surveiller' : 'conseil', icone: 'agenda',
      titre: `Créneau libre : ${m.nom} à ${hTxt(g0)}`,
      detail: [`Aucune leçon de ${debut > t ? hTxt(debut) : 'maintenant'} à ${hTxt(fin)} · ${voiture.nom} libre aussi.`, `Proposé : ${eleve.nom}, encore ${String(eleve.restant).replace('.', ',')} h à faire sur son forfait, libre à cette heure.`],
      voir: m.id, lieu: m.id,
      actions: [{ act: `reserver:${m.id}:${voiture.id}:${g0}:${eleve.nom}`, label: `Réserver ${hTxt(g0)} avec ${prenom(eleve.nom)}`, primaire: true }, { act: 'laisser:creneau-' + m.id + ':' + fin, label: 'Laisser libre' }],
      score: 1 / (1 + g0 - t) });
  }

  // ---------- moniteurs trop chargés ----------
  for (const m of e.moniteurs) {
    const ls = P.filter((l) => l.m === m.id), h = ls.reduce((s, l) => s + l.duree, 0);
    if (h < S.chargeMax) continue;
    // pause de midi : plus long moment sans leçon entre 11h et 14h
    let pause = 0, d = 11;
    for (const l of ls.filter((x) => x.fin > 11 && x.debut < 14).sort((a, b) => a.debut - b.debut)) { pause = Math.max(pause, l.debut - d); d = Math.max(d, l.fin); }
    pause = Math.max(pause, 14 - d);
    if (pause >= S.pauseMidi) continue;
    const derniere = ls.filter((l) => l.debut >= t + 1 && !exam(l)).sort((a, b) => b.debut - a.debut)[0];
    if (!derniere) continue;
    A.push({ cle: 'charge-' + m.id, niveau: 'conseil', icone: 'charge',
      titre: `Journée chargée : ${m.nom}, ${String(h).replace('.', ',')} h de leçons`,
      detail: [`Seulement ${String(Math.round(pause * 10) / 10).replace('.', ',')} h de pause à midi (seuil de la démo : ${String(S.pauseMidi).replace('.', ',')} h pour ${S.chargeMax} h de conduite).`, `Dernière leçon : ${hTxt(derniere.debut)} avec ${derniere.eleve}, à prévenir au moins 1 h avant.`],
      voir: m.id, lieu: m.id,
      actions: [{ act: 'reporter:' + derniere.id, label: `Reporter ${hTxt(derniere.debut)} à demain`, primaire: true }, { act: 'laisser:charge-' + m.id + ':' + e.fermeture, label: 'Garder le planning' }],
      score: h - S.chargeMax });
  }

  // ---------- salle de code ----------
  if (e.code.presents >= S.codeAlerte) {
    const plein = e.code.presents >= e.code.places;
    A.push({ cle: 'code', niveau: plein ? 'urgent' : 'surveiller', icone: 'code', titre: plein ? `Salle de code pleine : ${e.code.presents} / ${e.code.places}` : `Salle de code presque pleine : ${e.code.presents} / ${e.code.places}`,
      detail: [`${e.code.places - e.code.presents} poste${e.code.places - e.code.presents > 1 ? 's' : ''} libre${e.code.places - e.code.presents > 1 ? 's' : ''}. Prochaine séance encadrée à 17h30.`, 'Les élèves qui arrivent peuvent faire leur série en ligne depuis l\'accueil.'],
      voir: 'code', lieu: 'code',
      actions: [{ act: 'code-ligne', label: 'Passer 2 élèves en code en ligne', primaire: true }],
      score: e.code.presents });
  }

  return A.filter((a) => !(e.masque[a.cle] > t)).sort((a, b) => NIVEAUX[a.niveau].rang - NIVEAUX[b.niveau].rang || b.score - a.score);
}

// Icônes SVG en ligne (trait 2 px, couleur du texte)
const T = (d) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICONES = {
  euro: T('<path d="M18 7a7 7 0 1 0 0 10"/><path d="M4 10h9M4 14h9"/>'),
  forfait: T('<path d="M6 2h12M6 22h12M7 2c0 5 10 5 10 10S7 17 7 22M17 2c0 5-10 5-10 10s10 5 10 10"/>'),
  examen: T('<path d="M12 3l9 4-9 4-9-4 9-4z"/><path d="M7 9v5c0 1.5 2.5 3 5 3s5-1.5 5-3V9"/><path d="M21 7v6"/>'),
  cle: T('<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>'),
  agenda: T('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M12 13v4M10 15h4"/>'),
  charge: T('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>'),
  code: T('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
  voiture: T('<path d="M5 17h14v-5l-2-5H7l-2 5v5z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/><path d="M5 12h14"/>'),
  moniteur: T('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  eleve: T('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
  argent: T('<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="2.5"/><path d="M6 12.5h0M18 12.5h0"/>'),
  objectif: T('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
  horloge: T('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  jauge: T('<path d="M3 12a9 9 0 0 1 18 0"/><path d="M12 12l4-4"/><path d="M5 19h14"/>'),
  alerte: T('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h0"/>'),
  voir: T('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  ok: T('<path d="M5 12l5 5 9-10"/>'),
  info: T('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h0"/>'),
  pause: T('<path d="M9 5v14M15 5v14"/>'),
  lecture: T('<path d="M7 4l12 8-12 8z"/>'),
  maison: T('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  parking: T('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>'),
  moto: T('<circle cx="5" cy="16" r="3"/><circle cx="19" cy="16" r="3"/><path d="M5 16l4-6h5l3 6M12 10l-1-3h-2M15 7h3l1 3"/>'),
  ensemble: T('<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/>'),
  fermer: T('<path d="M6 6l12 12M18 6L6 18"/>'),
  haut: T('<path d="M6 15l6-6 6 6"/>'),
  tendanceHaut: T('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  tendanceBas: T('<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>'),
  stable: T('<path d="M4 12h16"/>'),
};
