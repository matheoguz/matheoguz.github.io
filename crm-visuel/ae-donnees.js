// « Essayez avec vos données » pour la démo auto-école : tableaux attendus (Moniteurs, Véhicules, Élèves),
// modèles CSV (remplis avec un exemple fictif) et adaptation à la maquette 3D (4 moniteurs, 5 voitures, 2 motos).
//   appliquerAE(donnees, { MONITEURS, VOITURES, MOTOS, ELEVES, PLANNING }) -> mêmes clés + notes

export const TABLEAUX_AE = [
  {
    id: 'moniteurs', nom: 'Moniteurs', alias: ['moniteur', 'formateur', 'enseignant'], max: 20,
    colonnes: [
      { id: 'nom', nom: 'nom', alias: ['moniteur', 'prenom nom', 'nom prenom', 'enseignant', 'formateur'], requis: true },
      { id: 'hsem', nom: 'heures/sem', alias: ['heures sem', 'heures par semaine', 'h semaine', 'h/sem', 'heures hebdo', 'contrat'], type: 'nombre', min: 0, max: 60 },
    ],
    modele: 'nom;heures/sem\nAurélie Fontaine;35\nMehdi Rahmani;35\nPascal Gomez;28\nSandrine Leroux;30\n',
  },
  {
    id: 'vehicules', nom: 'Véhicules', alias: ['vehicule', 'voiture', 'flotte', 'parc'], max: 30,
    colonnes: [
      { id: 'nom', nom: 'nom', alias: ['vehicule', 'immatriculation', 'modele', 'designation'], requis: true },
      { id: 'type', nom: 'type', alias: ['categorie', 'boite', 'genre'] },
      { id: 'km', nom: 'km', alias: ['kilometrage', 'kilometres', 'compteur'], type: 'entier', min: 0, max: 2000000 },
    ],
    modele: 'nom;type;km\nPolo grise;Voiture manuelle;52300\nClio blanche;Voiture manuelle;38750\nC3 rouge;Voiture manuelle;66120\n208 bleue;Voiture manuelle;24900\nMégane E-Tech;Voiture automatique;15400\nMT-07 noire;Moto A2;21800\nMT-07 rouge;Moto A2;18650\n',
  },
  {
    id: 'eleves', nom: 'Élèves', alias: ['eleve', 'candidat', 'inscrit'], max: 200,
    colonnes: [
      { id: 'nom', nom: 'nom', alias: ['eleve', 'prenom nom', 'nom prenom', 'candidat'], requis: true },
      { id: 'forfait', nom: 'forfait h', alias: ['forfait', 'heures forfait', 'forfait heures', 'heures achetees'], type: 'nombre', requis: true, min: 0, max: 200 },
      { id: 'faites', nom: 'heures faites', alias: ['faites', 'heures effectuees', 'heures realisees', 'h faites'], type: 'nombre', requis: true, min: 0, max: 200 },
      { id: 'reste', nom: 'reste à payer', alias: ['reste', 'du', 'solde', 'reste a regler', 'impaye'], type: 'euros', min: 0, max: 100000 },
      { id: 'examen', nom: 'date d\'examen', alias: ['examen', 'date examen', 'date de l examen', 'passage'], type: 'date' },
    ],
    modele: 'nom;forfait h;heures faites;reste à payer;date d\'examen\n'
      + 'Clément Royer;20;15;0;\nAnaïs Lopez;20;19;112;\nJordan Petit;30;8;350;\nSalomé Girard;20;4;0;\nNoé Chauvin;25;22;0;12/12/2026\n'
      + 'Lisa Bertin;20;11;168;\nMatteo Rossi;20;20;0;19/11/2026\nKenza Belkacem;20;6;0;\nAntoine Duval;20;13;56;\nLéna Marchand;13;9;0;\n'
      + 'Bastien Rey;20;17;0;\nYasmine Haddad;20;2;0;\nCorentin Blanc;25;24;420;\nOcéane Leblanc;20;10;0;\n',
  },
];

const tri = (a) => [...new Set(a)];
export function appliquerAE(d, demo) {
  const notes = [];
  const MONITEURS = demo.MONITEURS.map((m) => ({ ...m })), VOITURES = demo.VOITURES.map((v) => ({ ...v })), MOTOS = demo.MOTOS.map((v) => ({ ...v }));
  const M = d.moniteurs || [];
  if (M.length) {
    M.slice(0, MONITEURS.length).forEach((x, i) => Object.assign(MONITEURS[i], { nom: x.nom, hsem: x.hsem }));
    notes.push(`Moniteurs : vos ${Math.min(M.length, MONITEURS.length)} premiers moniteurs prennent la place des ${MONITEURS.length} de la maquette, dans l'ordre, avec leurs leçons du jour.`);
    if (M.length > MONITEURS.length) notes.push(`La maquette a ${MONITEURS.length} moniteurs : ${M.slice(MONITEURS.length).map((x) => x.nom).join(', ')} ne ${M.length - MONITEURS.length > 1 ? 'sont' : 'est'} pas affiché${M.length - MONITEURS.length > 1 ? 's' : ''}.`);
    if (M.length < MONITEURS.length) notes.push(`Vous avez ${M.length} moniteur${M.length > 1 ? 's' : ''} : ${demo.MONITEURS.slice(M.length).map((m) => m.nom).join(', ')} (démo) garde${M.length < MONITEURS.length - 1 ? 'nt' : ''} sa place.`);
  } else notes.push('Moniteurs : pas de fichier, ceux de la démo sont gardés.');

  const V = d.vehicules || [];
  if (V.length) {
    const estMoto = (x) => /moto|scooter|\ba1\b|\ba2\b|\b125\b|deux roues/i.test(`${x.type || ''} ${x.nom}`);
    const voit = V.filter((x) => !estMoto(x)), motos = V.filter(estMoto);
    voit.slice(0, VOITURES.length).forEach((x, i) => Object.assign(VOITURES[i], { nom: x.nom, modele: x.type || VOITURES[i].modele, km: x.km ?? VOITURES[i].km }));
    motos.slice(0, MOTOS.length).forEach((x, i) => Object.assign(MOTOS[i], { nom: x.nom, modele: x.type || MOTOS[i].modele, km: x.km }));
    notes.push(`Véhicules : ${voit.length} voiture${voit.length > 1 ? 's' : ''} et ${motos.length} moto${motos.length > 1 ? 's' : ''} lues (une ligne dont le type contient « moto », « A2 » ou « 125 » est une moto). Elles remplacent, dans l'ordre, les ${VOITURES.length} voitures et ${MOTOS.length} motos de la maquette.`);
    const trop = [...voit.slice(VOITURES.length), ...motos.slice(MOTOS.length)];
    if (trop.length) notes.push(`Non dessiné${trop.length > 1 ? 's' : ''} sur la maquette : ${trop.map((x) => x.nom).join(', ')}.`);
    if (voit.length < VOITURES.length || motos.length < MOTOS.length) notes.push('Les places restantes gardent les véhicules de la démo.');
    if (V.some((x) => x.km === undefined)) notes.push('Kilométrage manquant sur certains véhicules : celui de la démo est gardé (les alertes de révision s\'en servent).');
  } else notes.push('Véhicules : pas de fichier, ceux de la démo sont gardés.');

  let ELEVES = demo.ELEVES, PLANNING = demo.PLANNING;
  const E = d.eleves || [];
  if (E.length) {
    ELEVES = Object.fromEntries(E.map((x) => [x.nom, [x.faites, x.forfait, x.reste ?? 0, x.examen || null]]));
    // les créneaux du planning de la démo sont donnés à vos élèves, dans l'ordre d'apparition
    const noms = tri(demo.PLANNING.map((l) => l.eleve)), cible = Object.keys(ELEVES), map = Object.fromEntries(noms.map((n, i) => [n, cible[i % cible.length]]));
    PLANNING = demo.PLANNING.map((l) => ({ ...l, eleve: map[l.eleve] }));
    notes.push(`Élèves : ${cible.length} élève${cible.length > 1 ? 's' : ''} (forfaits, heures, reste à payer${E.some((x) => x.examen) ? ', dates d\'examen' : ''}). Alertes d'impayés et de fin de forfait, relances et chiffres sont recalculés avec eux.`);
    notes.push(`Le planning du jour garde les ${demo.PLANNING.length} créneaux de la démo, donnés à vos élèves dans l'ordre${cible.length < noms.length ? ' (certains en ont plusieurs)' : ''}.`);
    const dep = E.filter((x) => x.faites > x.forfait);
    if (dep.length) notes.push(`Heures faites au-delà du forfait pour ${dep.map((x) => x.nom).join(', ')} : à vérifier dans votre fichier.`);
    if (!E.some((x) => x.reste !== undefined)) notes.push('Pas de colonne « reste à payer » : tous les élèves sont considérés à jour.');
  } else notes.push('Élèves : pas de fichier, ceux de la démo sont gardés.');
  notes.push('Restent ceux de la démo : la salle de code, l\'historique des examens (6 mois) et le chiffre d\'affaires du mois.');
  return { MONITEURS, VOITURES, MOTOS, ELEVES, PLANNING, notes };
}
