// Démo « Transports Modèle » : alertes « À traiter maintenant », calculées sur l'état de la simulation (rien n'est écrit en dur).
// Règles de la démo :
//   CT            contrôle technique dans 15 jours ou moins (à prévoir) ; 3 jours ou moins, ou dépassé (urgent)
//   tachygraphe   contrôle périodique dans 30 jours ou moins (à prévoir) ; 7 jours ou moins (urgent)
//   entretien     compteur du jour (compteur + km roulés aujourd'hui) à moins de 1 500 km de la vidange (à prévoir), dépassé (urgent)
//   chauffeur     carte conducteur, FIMO/FCO ou visite médicale dans 30 jours ou moins (à prévoir) ; 7 jours ou moins (urgent)
//   immobilisé    véhicule en panne à l'atelier ; urgent s'il porte encore une tournée du jour
//   sans chauffeur tournée sans conducteur affecté ; urgente si le départ est dans moins de 2 h
//   retard        tournée en cours dont le retard est connu, client pas encore prévenu ; urgent à partir de 45 min
//
//   calculerAlertes(e) -> [{ cle, niveau, icone, titre, detail: [..], voir, lieu, actions: [{ act, label, primaire, off, raison }], score }]

export const NIVEAUX = { urgent: { rang: 0, nom: 'Urgent', couleur: '#dc2626', doux: '#fef2f2' }, surveiller: { rang: 1, nom: 'À prévoir', couleur: '#ea580c', doux: '#fff7ed' }, conseil: { rang: 2, nom: 'Conseil', couleur: '#2563eb', doux: '#eff6ff' } };
export const SEUILS = { ctPrevoir: 15, ctUrgent: 3, tachyPrevoir: 30, tachyUrgent: 7, docPrevoir: 30, docUrgent: 7, vidangeAvant: 1500, sansChauffeurUrgent: 2, retardUrgent: 45 };
export const DOCS = { carte: 'Carte conducteur', fco: 'FIMO / FCO', visite: 'Visite médicale' };

const dans = (j) => (j < 0 ? `dépassé depuis ${-j} jour${j < -1 ? 's' : ''}` : j === 0 ? 'aujourd\'hui' : `dans ${j} jour${j > 1 ? 's' : ''}`);
const km = (n) => Math.round(n).toLocaleString('fr-FR') + ' km';

export function calculerAlertes(e) {
  const A = [], { t, hTxt, dateTxt } = e, S = SEUILS;
  const qui = (id) => e.personnel.find((p) => p.id === id);
  const veh = (id) => e.vehicules.find((v) => v.id === id);
  const tourneesDe = (v) => e.tournees.filter((x) => x.veh === v.id && e.rEff(x) > t);

  // ---------- véhicule immobilisé ----------
  for (const v of e.vehicules.filter((x) => x.panne)) {
    const ts = e.tournees.filter((x) => x.veh === v.id && e.rEff(x) > t);
    const T = ts[0], remp = T ? e.vehiculeLibre(T) : null;
    A.push({
      cle: 'immo-' + v.id, niveau: ts.length ? 'urgent' : 'surveiller', icone: 'cle',
      titre: ts.length ? `${v.nom} immobilisé : tournée ${T.code} sans camion` : `${v.nom} immobilisé à l'atelier`,
      detail: [`${v.immat} · ${v.panne}.`, ts.length ? `${T.code} (${T.client}) part à ${hTxt(e.dEff(T))} avec ${qui(T.ch)?.nom || 'personne'} : il faut un autre véhicule.` : 'Plus aucune tournée ne lui est confiée aujourd\'hui.'],
      voir: v.id, lieu: v.id, score: 100,
      actions: T ? [{ act: `remplacer:${T.id}:${remp?.id || ''}`, label: remp ? `Mettre le ${remp.nom} (libre) sur ${T.code}` : 'Aucun véhicule libre', primaire: true, off: !remp, raison: remp ? '' : 'Tous les véhicules compatibles sont pris.' }] : [{ act: 'noter:immo-' + v.id, label: 'Noté' }],
    });
  }
  // ---------- tournée sans chauffeur ----------
  for (const T of e.tournees.filter((x) => !x.ch && e.rEff(x) > t)) {
    const reste = e.dEff(T) - t, c = e.chauffeurLibre(T), v = veh(T.veh), avant = qui(T.prevu);
    A.push({
      cle: 'sansch-' + T.id, niveau: reste < S.sansChauffeurUrgent ? 'urgent' : 'surveiller', icone: 'moniteur',
      titre: `Tournée ${T.code} sans chauffeur`,
      detail: [`Départ prévu à ${hTxt(T.dep)} (${reste > 0 ? `dans ${hTxt(reste).replace(/^0h/, '')}` : 'déjà dépassé'}) · ${T.client} · ${v ? v.nom : ''}, ${T.livr} livraisons.`, avant?.absent ? `${avant.nom} devait la faire : ${avant.absent.toLowerCase()}.` : 'Aucun conducteur affecté.'],
      voir: T.veh, lieu: T.veh, score: 90 - reste,
      actions: [{ act: `affecter:${T.id}:${c?.id || ''}`, label: c ? `Affecter ${c.nom} (libre, permis ${c.permis})` : 'Aucun chauffeur libre', primaire: true, off: !c, raison: c ? '' : 'Aucun chauffeur libre avec le bon permis.' }],
    });
  }
  // ---------- retard de livraison ----------
  for (const T of e.tournees.filter((x) => x.retard && x.retardDes !== null && t >= x.retardDes && t < e.rEff(x) && e.dEff(x) <= t)) {
    if (e.prevenus[T.id] !== undefined) continue;
    A.push({
      cle: 'retard-' + T.id, niveau: T.retard >= S.retardUrgent ? 'urgent' : 'surveiller', icone: 'horloge',
      titre: `Retard de livraison : ${T.code}, +${T.retard} min`,
      detail: [`${T.client} · ${qui(T.ch)?.nom || ''} (${veh(T.veh)?.nom || ''}) signale ${T.retard} min de retard (attente au quai du client et circulation).`, `Retour au dépôt estimé à ${hTxt(e.rEff(T))} au lieu de ${hTxt(T.ret + (e.dEff(T) - T.dep))}. Client pas encore prévenu.`],
      voir: T.id, lieu: T.veh, score: 80 + T.retard / 10,
      actions: [{ act: 'prevenir:' + T.id, label: 'Message au client prêt : noter prévenu', primaire: true }],
    });
  }
  // ---------- contrôle technique, tachygraphe, entretien ----------
  for (const v of e.vehicules) {
    const ts = tourneesDe(v);
    if (v.ct !== null && v.ct <= S.ctPrevoir && !e.rdv.ct[v.id]) {
      const exp = v.ct < 0;
      A.push({
        cle: 'ct-' + v.id, niveau: v.ct <= S.ctUrgent ? 'urgent' : 'surveiller', icone: 'agenda',
        titre: exp ? `CT expiré : ${v.nom} ne doit pas rouler` : `Contrôle technique ${dans(v.ct)} : ${v.nom}`,
        detail: [`${v.immat} · ${v.modele} · échéance le ${dateTxt(v.ct)}.`, exp ? 'Laissé au parc : aucune tournée ne lui est confiée.' : ts.length ? `En tournée aujourd'hui (${ts.map((x) => x.code).join(', ')}) : prendre le rendez-vous au centre de contrôle.` : 'Prendre le rendez-vous au centre de contrôle poids lourds.'],
        voir: v.id, lieu: v.id, score: 60 - v.ct,
        actions: [{ act: 'rdvct:' + v.id, label: 'Noter le RDV CT à prendre', primaire: true }, { act: 'noter:ct-' + v.id, label: 'Plus tard' }],
      });
    }
    if (v.tachy !== null && v.tachy <= S.tachyPrevoir && !e.rdv.tachy[v.id]) {
      A.push({
        cle: 'tachy-' + v.id, niveau: v.tachy <= S.tachyUrgent ? 'urgent' : 'surveiller', icone: 'horloge',
        titre: `Contrôle du tachygraphe ${dans(v.tachy)} : ${v.nom}`,
        detail: [`Contrôle périodique obligatoire (tous les 2 ans), échéance le ${dateTxt(v.tachy)}.`, 'À faire dans un atelier agréé tachygraphe.'],
        voir: v.id, lieu: v.id, score: 40 - v.tachy,
        actions: [{ act: 'rdvtachy:' + v.id, label: 'Noter le RDV à prendre', primaire: true }, { act: 'noter:tachy-' + v.id, label: 'Plus tard' }],
      });
    }
    const k = e.kmDuJour(v), reste = v.vidange - k;
    if (reste <= S.vidangeAvant && !e.rdv.atelier[v.id] && !v.panne) {
      A.push({
        cle: 'entretien-' + v.id, niveau: reste <= 0 ? 'urgent' : 'surveiller', icone: 'cle',
        titre: reste <= 0 ? `Entretien en retard : ${v.nom}, ${km(-reste)} de dépassement` : `Entretien à prévoir : ${v.nom} dans ${km(reste)}`,
        detail: [`Compteur ${km(k)}${ts.length ? ' (roule aujourd\'hui)' : ''} · vidange prévue à ${km(v.vidange)}.`, 'Créneau proposé : demain 7h à l\'atelier, avant les départs du matin.'],
        voir: v.id, lieu: v.id, score: 50 - reste / 100,
        actions: [{ act: 'atelier:' + v.id, label: 'Planifier à l\'atelier demain 7h', primaire: true }, { act: 'noter:entretien-' + v.id, label: 'Plus tard' }],
      });
    }
  }
  // ---------- documents des chauffeurs ----------
  for (const c of e.personnel.filter((p) => p.chauffeur)) {
    for (const d of Object.keys(DOCS)) {
      const j = c[d]; if (j === null || j === undefined || j > S.docPrevoir || e.renouv[c.id + ':' + d]) continue;
      const T = e.tournees.find((x) => x.ch === c.id && e.rEff(x) > t);
      A.push({
        cle: `doc-${c.id}-${d}`, niveau: j <= S.docUrgent ? 'urgent' : 'surveiller', icone: d === 'visite' ? 'eleve' : 'moniteur',
        titre: `${DOCS[d]} de ${c.nom} : fin ${dans(j)}`,
        detail: [`Échéance le ${dateTxt(j)} · permis ${c.permis}.`, j <= 0 ? 'Sans document valable, il ne peut pas conduire : le retirer des tournées.' : d === 'fco' ? 'Stage FCO de 5 jours à réserver dans un centre agréé.' : d === 'carte' ? 'Demande de renouvellement à faire au moins 15 jours avant.' : 'Rendez-vous chez le médecin agréé à prendre.', T ? `En tournée aujourd'hui : ${T.code}.` : ''].filter(Boolean),
        voir: c.id, lieu: T ? T.veh : 'exploitation', score: 30 - j,
        actions: [{ act: `renouv:${c.id}:${d}`, label: d === 'fco' ? 'Noter le stage à réserver' : 'Noter la demande en cours', primaire: true }, { act: `noter:doc-${c.id}-${d}`, label: 'Plus tard' }],
      });
    }
  }
  return A.filter((a) => !(e.masque[a.cle] > t)).sort((a, b) => NIVEAUX[a.niveau].rang - NIVEAUX[b.niveau].rang || b.score - a.score);
}
