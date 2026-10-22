// Hyper Modèle · onglet RH (recrutement, rendez-vous, anciens salariés, personnel)
// Module autonome : il injecte son CSS et ne dépend de rien d'autre que ce qu'on lui passe.
// Toutes les personnes et tous les documents sont fictifs (démo). Rien n'est envoyé à personne.
//
//   import { installerRH } from './rh.js';
//   const rh = installerRH({ equipe: EQUIPE, heure: () => t, choisirPersonne: (id) => choisir(id) });
//   rh.rendre(conteneur);   // contenu de l'onglet RH
//   rh.rdvDuJour();         // [{ id, nom, poste, debut, fin }] entretiens d'aujourd'hui (heures décimales)
//   rh.ouvrirDocument(id);  // ouvre le CV / la lettre / le suivi d'un candidat

const CSS = `
.rh-fictif { border: 1px dashed #fca5a5; background: var(--accent-doux, #fee2e2); color: var(--accent, #b91c1c); border-radius: 8px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; margin: 0 0 10px; }
.rh-resume { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin: 0 0 12px; }
.rh-resume div { border: 1px solid var(--ligne, #e5e7eb); border-radius: 8px; padding: 7px 9px; }
.rh-resume b { display: block; font-size: 17px; line-height: 1.2; }
.rh-resume span { color: var(--doux, #6b7280); font-size: 11px; }
.rh-sous { display: flex; gap: 4px; flex-wrap: wrap; margin: 0 0 12px; }
.rh-sous button { border: 1px solid var(--ligne, #e5e7eb); background: var(--carte, #fff); font: inherit; font-size: 12px; font-weight: 600; color: var(--doux, #6b7280); padding: 5px 8px; border-radius: 99px; cursor: pointer; }
.rh-sous button.actif { border-color: var(--accent, #b91c1c); color: var(--accent, #b91c1c); background: var(--accent-doux, #fee2e2); }
.rh-postes { display: grid; gap: 6px; margin: 0 0 14px; }
.rh-poste { text-align: left; border: 1px solid var(--ligne, #e5e7eb); background: var(--carte, #fff); border-radius: 8px; padding: 8px 10px; font: inherit; font-size: 12.5px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.rh-poste:hover { background: var(--gris-doux, #f3f4f6); }
.rh-poste.actif { border-color: var(--accent, #b91c1c); box-shadow: inset 3px 0 0 var(--accent, #b91c1c); }
.rh-poste small { display: block; color: var(--doux, #6b7280); font-size: 11.5px; }
.rh-poste em { font-style: normal; font-weight: 700; font-size: 15px; white-space: nowrap; }
.rh-poste em small { display: inline; font-weight: 500; }
.rh-filtre { font-size: 11.5px; color: var(--doux, #6b7280); margin: -6px 0 10px; }
.rh-filtre button { border: 0; background: none; color: var(--accent, #b91c1c); font: inherit; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline; }
.rh table td b { font-weight: 600; }
.statut.rh-nv { color: #1d4ed8; background: #dbeafe; }
.statut.rh-gris { color: var(--doux, #6b7280); background: var(--gris-doux, #f3f4f6); }
.rh-jour { font-size: 12px; font-weight: 700; margin: 14px 0 6px; }
.rh-jour:first-of-type { margin-top: 0; }
.rh-rdv { border: 1px solid var(--ligne, #e5e7eb); border-radius: 8px; padding: 8px 10px; margin: 0 0 6px; display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 4px 10px; cursor: pointer; font-size: 12.5px; }
.rh-rdv:hover { background: var(--gris-doux, #f3f4f6); }
.rh-rdv.encours { border-color: var(--vert, #15803d); background: var(--vert-doux, #dcfce7); }
.rh-rdv.prochain { border-color: var(--orange, #c2410c); box-shadow: inset 3px 0 0 var(--orange, #c2410c); }
.rh-rdv.passe { opacity: .62; }
.rh-rdv .h { font-weight: 700; font-variant-numeric: tabular-nums; }
.rh-rdv .h small { display: block; font-weight: 500; color: var(--doux, #6b7280); }
.rh-rdv .q { color: var(--doux, #6b7280); font-size: 11.5px; }
.rh-carte { border: 1px solid var(--ligne, #e5e7eb); border-radius: 8px; padding: 9px 11px; margin: 0 0 7px; font-size: 12.5px; }
.rh-carte .tete { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
.rh-carte p { margin: 5px 0 0; color: var(--doux, #6b7280); font-size: 12px; }
.rh-perso { border-bottom: 1px solid var(--ligne, #e5e7eb); }
.rh-perso > button { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 10px; border: 0; background: none; font: inherit; font-size: 12.5px; text-align: left; padding: 8px 4px; cursor: pointer; color: inherit; }
.rh-perso > button:hover { background: var(--gris-doux, #f3f4f6); }
.rh-perso > button small { display: block; color: var(--doux, #6b7280); font-size: 11.5px; }
.rh-perso > button .fl { color: var(--doux, #6b7280); transition: transform .2s; }
.rh-perso.ouvert > button .fl { transform: rotate(90deg); }
.rh-perso .det { padding: 0 4px 10px; }
.rh-perso .lignes { margin-top: 0; }
.rh-tags { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0 8px; }
.rh-tags span { font-size: 11px; border: 1px solid var(--ligne, #e5e7eb); border-radius: 99px; padding: 1px 8px; color: var(--texte, #111827); background: var(--gris-doux, #f3f4f6); }
.rh-bt { border: 1px solid var(--ligne, #e5e7eb); background: var(--carte, #fff); color: var(--texte, #111827); font: inherit; font-size: 12.5px; font-weight: 600; padding: 6px 11px; border-radius: 7px; cursor: pointer; }
.rh-bt.go { background: var(--accent, #b91c1c); border-color: var(--accent, #b91c1c); color: #fff; }
.rh-bt:disabled { opacity: .45; cursor: default; }
.rh-rgpd { margin: 16px 0 0; padding: 9px 11px; border-radius: 8px; background: var(--gris-doux, #f3f4f6); color: var(--doux, #6b7280); font-size: 11.5px; line-height: 1.5; }
.rh-rgpd b { color: var(--texte, #111827); }

/* Fenêtre du candidat */
.rh-voile { position: fixed; inset: 0; background: rgba(17, 24, 39, .55); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
.rh-voile[hidden] { display: none; }
.rh-modale { background: var(--carte, #fff); border-radius: 12px; width: min(860px, 100%); max-height: calc(100vh - 48px); display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(17, 24, 39, .35); overflow: hidden; font: 14px/1.45 Inter, system-ui, -apple-system, "Segoe UI", sans-serif; color: var(--texte, #111827); }
.rh-m-tete { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px 0; }
.rh-m-tete h3 { margin: 0; font-size: 17px; }
.rh-m-tete p { margin: 2px 0 0; color: var(--doux, #6b7280); font-size: 12.5px; }
.rh-m-tete .x { margin-left: auto; border: 0; background: none; font-size: 24px; line-height: 1; color: var(--doux, #6b7280); cursor: pointer; padding: 2px 6px; border-radius: 6px; }
.rh-m-tete .x:hover { background: var(--gris-doux, #f3f4f6); }
.rh-m-onglets { display: flex; gap: 2px; padding: 0 18px; border-bottom: 1px solid var(--ligne, #e5e7eb); margin-top: 10px; }
.rh-m-onglets button { border: 0; background: none; font: inherit; font-size: 13px; font-weight: 600; color: var(--doux, #6b7280); padding: 9px 12px 8px; border-bottom: 2px solid transparent; cursor: pointer; }
.rh-m-onglets button.actif { color: var(--accent, #b91c1c); border-color: var(--accent, #b91c1c); }
.rh-m-corps { overflow-y: auto; padding: 18px; background: #e9e7e1; flex: 1; min-height: 0; }
.rh-m-pied { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 10px 18px; border-top: 1px solid var(--ligne, #e5e7eb); }
.rh-m-pied small { color: var(--doux, #6b7280); font-size: 11.5px; margin-right: auto; }
.rh-papier { background: #fffdf8; color: #1f2937; max-width: 720px; margin: 0 auto; padding: 34px 38px; box-shadow: 0 1px 3px rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.08); border-radius: 2px; font-size: 13px; line-height: 1.5; }
.rh-cv { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 26px; }
.rh-cv-nom { grid-column: 1 / -1; border-bottom: 2px solid #1f2937; padding-bottom: 10px; }
.rh-cv-nom b { display: block; font-size: 22px; letter-spacing: .01em; }
.rh-cv-nom span { font-size: 13.5px; color: #4b5563; }
.rh-cv h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; margin: 0 0 6px; border-bottom: 1px solid #e5e1d8; padding-bottom: 3px; }
.rh-cv section { margin: 0 0 16px; }
.rh-cv ul { margin: 0; padding-left: 16px; }
.rh-cv .col ul { list-style: none; padding: 0; }
.rh-cv .col li { margin: 0 0 3px; overflow-wrap: anywhere; }
.rh-xp { margin: 0 0 11px; }
.rh-xp .t { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.rh-xp .t b { font-size: 13.5px; }
.rh-xp .t span { color: #6b7280; font-size: 12px; white-space: nowrap; }
.rh-xp .o { color: #4b5563; font-size: 12.5px; margin: 0 0 3px; }
.rh-xp li { font-size: 12.5px; }
.rh-lettre { font-family: Georgia, "Times New Roman", serif; font-size: 14px; line-height: 1.6; }
.rh-lettre .exp { margin: 0 0 18px; font-size: 13px; }
.rh-lettre .dest { margin: 0 0 18px auto; width: fit-content; max-width: 100%; font-size: 13px; }
.rh-lettre .date { text-align: right; margin: 0 0 18px; }
.rh-lettre p { margin: 0 0 12px; }
.rh-lettre .sig { margin-top: 22px; }
.rh-suivi { background: var(--carte, #fff); max-width: 720px; margin: 0 auto; border-radius: 10px; padding: 16px 18px; }
.rh-suivi ol { list-style: none; margin: 0; padding: 0; border-left: 2px solid var(--ligne, #e5e7eb); }
.rh-suivi li { position: relative; padding: 0 0 14px 16px; font-size: 13px; }
.rh-suivi li::before { content: ""; position: absolute; left: -6px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: var(--carte, #fff); border: 2px solid var(--doux, #6b7280); }
.rh-suivi li.ok::before { border-color: var(--vert, #15803d); background: var(--vert, #15803d); }
.rh-suivi li.ko::before { border-color: var(--accent, #b91c1c); }
.rh-suivi li.att::before { border-color: var(--orange, #c2410c); }
.rh-suivi li b { display: block; font-size: 12px; color: var(--doux, #6b7280); font-weight: 600; }
.rh-suivi .lignes { margin: 0 0 16px; }
body.rh-bloque { overflow: hidden; }
@media (max-width: 900px) {
  .rh-resume b { font-size: 16px; }
}
@media (max-width: 640px) {
  .rh-sous { display: grid; grid-template-columns: 1fr 1fr; }
  .rh-voile { padding: 0; }
  .rh-modale { width: 100%; height: 100%; max-height: none; border-radius: 0; }
  .rh-m-tete { padding: 12px 14px 0; }
  .rh-m-onglets { padding: 0 8px; }
  .rh-m-corps { padding: 10px; }
  .rh-m-pied { padding: 10px 14px; }
  .rh-papier { padding: 20px 18px; font-size: 12.5px; }
  .rh-cv { grid-template-columns: 1fr; gap: 4px; }
  .rh-cv .col { order: 2; }
  .rh-lettre { font-size: 13.5px; }
}
`;

// ================= Données fictives =================
const RH = { nom: 'Sophie Marchand', titre: 'Responsable des ressources humaines' };
const LIEU = 'Bureau RH, 1er étage';
const MAGASIN = 'Hyper Modèle';

const POSTES = [
  { id: 'p1', titre: 'Hôte ou hôtesse de caisse', contrat: 'CDI, 28 h par semaine', service: 'Caisses', avec: 'Claire Dumont (directrice du magasin)', publie: -21 },
  { id: 'p2', titre: 'Employé·e libre-service, rayon frais', contrat: 'CDD 6 mois, 35 h', service: 'Frais et surgelés', avec: 'Mehdi Larbi (chef de rayon frais)', publie: -16 },
  { id: 'p3', titre: 'Réceptionnaire', contrat: 'CDI, 35 h, prise de poste à 6 h', service: 'Réserve et quai', avec: 'Claire Dumont (directrice du magasin)', publie: -24 },
  { id: 'p4', titre: 'Adjoint·e au chef de rayon épicerie', contrat: 'CDI, 39 h', service: 'Épicerie', avec: 'Laura Pineau (cheffe de rayon épicerie)', publie: -14 },
];

const ETAPES = {
  nouveau: { txt: 'Nouveau', cl: 'rh-nv' },
  preselection: { txt: 'Présélectionné', cl: 'att' },
  entretien: { txt: 'Entretien prévu', cl: 'att' },
  retenu: { txt: 'Retenu', cl: 'ok' },
  refuse: { txt: 'Refusé', cl: 'ko' },
};
const ORDRE = ['entretien', 'preselection', 'nouveau', 'retenu', 'refuse'];

// rdv : [jours ouvrés à partir d'aujourd'hui, début, fin]
// suivi : [jours (négatif = passé), texte, classe]
const CANDIDATS = [
  {
    id: 'k1', prenom: 'Camille', nom: 'Royer', poste: 'p1', etape: 'entretien', recu: -6, source: 'Site du magasin', ville: 'Olivet',
    titre: 'Hôtesse de caisse',
    profil: 'Hôtesse de caisse avec deux saisons d\'expérience en supermarché. À l\'aise avec l\'encaissement, le rendu de monnaie et l\'accueil des clients aux heures d\'affluence.',
    xp: [
      ['Juin 2025', 'Sept. 2025', 'Hôtesse de caisse (CDD saisonnier)', 'Marché Plus, Olivet (enseigne fictive)', ['Encaissement et contrôle des bons de réduction', 'Ouverture et fermeture de caisse, comptage du fond', 'Orientation des clients et gestion de la file']],
      ['Juin 2024', 'Août 2024', 'Hôtesse de caisse (CDD saisonnier)', 'Marché Plus, Olivet (enseigne fictive)', ['Caisse traditionnelle et caisses automatiques', 'Mise en rayon en début de service']],
      ['Sept. 2022', 'Mai 2024', 'Équipière polyvalente (temps partiel)', 'Burger du Centre, Orléans (enseigne fictive)', ['Prise de commande et encaissement', 'Respect des règles d\'hygiène']],
    ],
    formation: [['2024', 'Bac pro Métiers du commerce et de la vente', 'Lycée professionnel (fictif), Orléans']],
    competences: ['Encaissement, rendu de monnaie', 'Caisses automatiques', 'Accueil et sourire client', 'Travail en horaires décalés'],
    langues: ['Français', 'Anglais : niveau scolaire'], permis: 'Permis B',
    lettre: [
      'Je vous adresse ma candidature au poste d\'hôtesse de caisse publié sur le site de votre magasin.',
      'Pendant deux étés, j\'ai tenu une caisse dans un supermarché d\'Olivet. J\'y ai appris à garder le rythme quand la file s\'allonge le samedi, à vérifier mon fond de caisse sans erreur et, surtout, à prendre le temps d\'un mot avec chaque client, même pressé. Mon responsable m\'a confié l\'ouverture des caisses dès ma deuxième saison.',
      'Je cherche aujourd\'hui un poste stable, et le temps partiel de 28 heures que vous proposez me convient très bien. Je suis disponible les samedis et en fin de journée, et j\'habite à un quart d\'heure du magasin.',
      'Je serais heureuse de vous rencontrer pour vous en dire plus.',
    ],
    suivi: [[-6, 'Candidature reçue par le site du magasin', ''], [-4, 'Appel de présélection (15 min) : disponibilités confirmées', 'ok'], [-4, 'Invitée à un entretien', 'att']],
    rdv: [0, 10, 10.75],
  },
  {
    id: 'k2', prenom: 'Bastien', nom: 'Leroux', poste: 'p2', etape: 'entretien', recu: -9, source: 'France Travail', ville: 'Saran',
    titre: 'Employé libre-service, produits frais',
    profil: 'Employé libre-service habitué au froid et aux horaires du matin. Rigoureux sur les dates limites, la rotation des produits et la chaîne du froid.',
    xp: [
      ['Janv. 2025', 'Sept. 2025', 'Préparateur de commandes, entrepôt frigorifique (intérim)', 'Logistique du Loiret (entreprise fictive), Saran', ['Préparation de commandes à 2 °C au scanner', 'Contrôle des dates et des températures à réception']],
      ['Mars 2023', 'Déc. 2024', 'Employé libre-service (intérim, missions régulières)', 'Plusieurs supermarchés de l\'agglomération (fictifs)', ['Mise en rayon du frais et du surgelé avant l\'ouverture', 'Rotation des produits (premier entré, premier sorti)', 'Relevé des ruptures pour le chef de rayon']],
    ],
    formation: [['2022', 'CAP Équipier polyvalent du commerce', 'CFA (fictif), Orléans'], ['2023', 'Formation hygiène alimentaire (HACCP), 14 h', 'Organisme de formation (fictif)']],
    competences: ['Chaîne du froid, HACCP', 'Rotation et contrôle des dates', 'Transpalette manuel et électrique', 'Ponctualité, embauche à 5 h'],
    langues: ['Français', 'Anglais : notions'], permis: 'Permis B, véhiculé',
    lettre: [
      'Votre offre d\'employé libre-service au rayon frais, transmise par France Travail, correspond exactement à ce que je fais depuis trois ans.',
      'En intérim, j\'ai travaillé dans plusieurs supermarchés et dans un entrepôt frigorifique. Je connais l\'importance des contrôles de température et des dates : au rayon frais, une erreur se voit tout de suite, par le client comme par le contrôle sanitaire. Je suis à l\'aise avec les embauches très tôt, et j\'aime que le rayon soit plein et propre à l\'ouverture.',
      'Un contrat de six mois dans une équipe fixe me permettrait de m\'installer dans un magasin et d\'y apprendre davantage, notamment les commandes.',
      'Je reste à votre disposition pour un entretien et vous prie d\'agréer, Madame, l\'expression de mes salutations distinguées.',
    ],
    suivi: [[-9, 'Candidature reçue par France Travail', ''], [-6, 'Appel de présélection : disponible tout de suite', 'ok'], [-6, 'Invité à un entretien avec le chef de rayon frais', 'att']],
    rdv: [0, 14, 14.75],
  },
  {
    id: 'k3', prenom: 'Nadia', nom: 'Ferreira', poste: 'p3', etape: 'entretien', recu: -12, source: 'Cooptation (recommandée par Paul Garnier)', ville: 'Fleury-les-Aubrais',
    titre: 'Magasinière cariste',
    profil: 'Magasinière cariste, cinq ans en plateforme logistique. Réception des camions, contrôle des bons de livraison et rangement en réserve, en sécurité.',
    xp: [
      ['Avr. 2021', 'Aujourd\'hui', 'Magasinière cariste', 'Plateforme logistique Centre (entreprise fictive), Ingré', ['Déchargement de 10 à 15 camions par jour', 'Contrôle des quantités et des bons de livraison, saisie des écarts', 'Rangement en racks au chariot à mât rétractable']],
      ['Sept. 2019', 'Mars 2021', 'Agente de quai', 'Transports du Val (entreprise fictive), Orléans', ['Chargement et filmage des palettes', 'Tenue du quai et du tri des emballages']],
    ],
    formation: [['2019', 'Titre professionnel Agent magasinier', 'AFPA (centre fictif), Orléans'], ['2024', 'CACES R489, catégories 1, 3 et 5 (renouvelé)', 'Organisme de formation (fictif)']],
    competences: ['CACES R489 cat. 1, 3 et 5', 'Contrôle de réception, litiges transporteur', 'Scanner et logiciel de stock', 'Gestes et postures'],
    langues: ['Français', 'Espagnol : intermédiaire'], permis: 'Permis B',
    lettre: [
      'Paul Garnier, réceptionnaire dans votre magasin, m\'a parlé du poste de réceptionnaire que vous cherchez à pourvoir. Je me permets de vous adresser ma candidature.',
      'Depuis cinq ans, je réceptionne chaque jour une dizaine de camions sur une plateforme logistique. Je vérifie les palettes, je note les écarts avant que le chauffeur reparte et je range la marchandise au bon emplacement. Je tiens beaucoup à la sécurité : sur un quai, on va vite, mais jamais au prix d\'un accident.',
      'Travailler en magasin m\'attire parce qu\'on voit où va la marchandise : quand le quai est bien tenu, les rayons sont pleins. La prise de poste à 6 heures ne me pose aucun problème.',
      'Je vous remercie de l\'attention portée à ma candidature et reste disponible pour un entretien.',
    ],
    suivi: [[-12, 'Candidature reçue par cooptation', ''], [-10, 'Appel de présélection : CACES à jour', 'ok'], [-9, 'Invitée à un entretien', 'att']],
    rdv: [0, 16.5, 17.25],
  },
  {
    id: 'k4', prenom: 'Olivier', nom: 'Masson', poste: 'p4', etape: 'entretien', recu: -10, source: 'Site du magasin', ville: 'Saint-Jean-de-Braye',
    titre: 'Adjoint manager de rayon',
    profil: 'Dix ans en grande distribution, dont six comme adjoint de rayon épicerie. Commandes, implantation, inventaires et animation d\'une petite équipe.',
    xp: [
      ['Mars 2019', 'Juil. 2025', 'Adjoint manager rayon épicerie', 'Super Centre, Saint-Jean-de-Braye (enseigne fictive)', ['Passage des commandes sur 1 200 références', 'Encadrement de 4 employés, plannings hebdomadaires', 'Implantation des promotions et des têtes de gondole', 'Inventaires semestriels']],
      ['Sept. 2015', 'Févr. 2019', 'Employé commercial épicerie', 'Super Centre, Saint-Jean-de-Braye (enseigne fictive)', ['Mise en rayon, étiquetage, relevé de prix', 'Réception et contrôle des livraisons du rayon']],
    ],
    formation: [['2015', 'BTS Management commercial opérationnel (MCO)', 'Lycée (fictif), Orléans']],
    competences: ['Commandes et suivi des ruptures', 'Merchandising, implantation', 'Planning d\'équipe', 'Logiciel de gestion de stock', 'Tableur'],
    langues: ['Français', 'Anglais : intermédiaire'], permis: 'Permis B',
    lettre: [
      'Je vous propose ma candidature au poste d\'adjoint au chef de rayon épicerie.',
      'Pendant six ans, j\'ai secondé le manager du rayon épicerie d\'un supermarché de taille comparable au vôtre. Je passais les commandes, je suivais les ruptures chaque matin et j\'organisais le travail de quatre employés. J\'ai notamment réduit les ruptures du rayon en revoyant les quantités commandées avec les chiffres de vente plutôt qu\'au jugé.',
      'Après une pause de quelques mois liée à un projet personnel, je souhaite retrouver un rayon et une équipe. Votre annonce parle d\'un magasin connecté à son logiciel de stock : c\'est un outil que j\'aime utiliser au quotidien.',
      'Je serais ravi d\'échanger avec vous et avec la cheffe de rayon. Veuillez agréer, Madame, mes salutations distinguées.',
    ],
    suivi: [[-10, 'Candidature reçue par le site du magasin', ''], [-7, 'Appel de présélection : très bonne expérience', 'ok'], [-5, 'Invité à un entretien avec la cheffe de rayon épicerie', 'att']],
    rdv: [1, 9.5, 10.5],
  },
  {
    id: 'k5', prenom: 'Justine', nom: 'Carré', poste: 'p1', etape: 'entretien', recu: -4, source: 'Candidature spontanée', ville: 'Orléans',
    titre: 'Vendeuse, accueil clients',
    profil: 'Vendeuse en boulangerie depuis trois ans, habituée à l\'encaissement et aux pics de fréquentation. Souhaite évoluer vers la grande distribution.',
    xp: [
      ['Oct. 2022', 'Aujourd\'hui', 'Vendeuse (CDI temps partiel)', 'Boulangerie du Martroi, Orléans (commerce fictif)', ['Service et encaissement, jusqu\'à 300 clients le dimanche matin', 'Clôture de caisse et dépôt des fonds', 'Mise en place de la vitrine']],
      ['Été 2021', '', 'Employée de restauration (job d\'été)', 'Camping des Bords de Loire (fictif)', ['Service au comptoir et encaissement']],
    ],
    formation: [['2022', 'CAP Équipier polyvalent du commerce', 'Lycée professionnel (fictif), Orléans']],
    competences: ['Encaissement, clôture de caisse', 'Relation client', 'Rapidité aux heures de pointe'],
    langues: ['Français', 'Anglais : notions'], permis: 'Pas de permis (ligne de bus jusqu\'au magasin)',
    lettre: [
      'Cliente de votre magasin, j\'ai remarqué que vous recherchiez des hôtes et hôtesses de caisse. Je me permets de vous adresser une candidature spontanée.',
      'Je travaille depuis trois ans dans une boulangerie du centre-ville. J\'y encaisse tous les jours, je fais la clôture de caisse le soir et je sais garder le sourire quand la file déborde sur le trottoir le dimanche. J\'aimerais aujourd\'hui rejoindre une équipe plus grande, avec des horaires plus réguliers.',
      'Le poste de 28 heures me permettrait de concilier travail et formation : je prépare en parallèle un titre professionnel de vendeuse-conseil.',
      'Je vous remercie de votre lecture et serais heureuse de vous rencontrer.',
    ],
    suivi: [[-4, 'Candidature spontanée reçue par courrier électronique', ''], [-2, 'Appel de présélection : motivée, disponible le samedi', 'ok'], [-2, 'Invitée à un entretien', 'att']],
    rdv: [2, 11, 11.75],
  },
  {
    id: 'k6', prenom: 'Maxime', nom: 'Perrin', poste: 'p2', etape: 'preselection', recu: -3, source: 'Site du magasin', ville: 'Ingré',
    titre: 'Employé commercial',
    profil: 'Employé commercial en magasin de bricolage, je souhaite me spécialiser dans les produits frais. Sérieux, autonome, à l\'aise avec le travail tôt le matin.',
    xp: [
      ['Mai 2023', 'Aujourd\'hui', 'Employé commercial (CDD puis CDI)', 'Brico Loire, Ingré (enseigne fictive)', ['Réception et mise en rayon', 'Conseil client au rayon jardin', 'Inventaires']],
      ['Sept. 2021', 'Avr. 2023', 'Équipier de livraison (temps partiel)', 'Livraison Express (entreprise fictive), Orléans', ['Préparation et livraison de colis']],
    ],
    formation: [['2021', 'Baccalauréat général', 'Lycée (fictif), Orléans']],
    competences: ['Mise en rayon, étiquetage', 'Inventaires', 'Transpalette', 'Travail en équipe'],
    langues: ['Français', 'Anglais : intermédiaire'], permis: 'Permis B',
    lettre: [
      'Je souhaite rejoindre votre équipe du rayon frais en tant qu\'employé libre-service.',
      'Depuis deux ans, je travaille dans un magasin de bricolage où je réceptionne et range la marchandise. J\'aime le travail physique, organisé, quand tout est prêt avant l\'arrivée des clients. Je n\'ai pas encore travaillé sur le frais, mais je suis prêt à me former aux règles d\'hygiène et à la chaîne du froid, et j\'ai déjà demandé à suivre une formation HACCP.',
      'Votre magasin est à dix minutes de chez moi et les horaires du matin me conviennent.',
      'Je reste disponible pour un échange à votre convenance.',
    ],
    suivi: [[-3, 'Candidature reçue par le site du magasin', ''], [-1, 'CV lu : à appeler pour un premier échange', 'att']],
  },
  {
    id: 'k7', prenom: 'Élodie', nom: 'Gaillard', poste: 'p4', etape: 'preselection', recu: -5, source: 'France Travail', ville: 'Olivet',
    titre: 'Cheffe d\'équipe en magasin',
    profil: 'Cheffe d\'équipe en magasin discount, quatre ans d\'encadrement. Cherche un poste d\'adjointe de rayon pour approfondir les commandes et la gestion.',
    xp: [
      ['Sept. 2021', 'Aujourd\'hui', 'Cheffe d\'équipe', 'Discount Malin, Olivet (enseigne fictive)', ['Animation d\'une équipe de 6 personnes', 'Ouverture et fermeture du magasin', 'Suivi de la démarque et des dates courtes']],
      ['Juin 2018', 'Août 2021', 'Employée polyvalente', 'Discount Malin, Olivet (enseigne fictive)', ['Caisse, mise en rayon, réception']],
    ],
    formation: [['2018', 'Bac pro Commerce', 'Lycée professionnel (fictif), Orléans'], ['2023', 'Formation « Manager une équipe de proximité », 3 jours', 'Organisme de formation (fictif)']],
    competences: ['Encadrement', 'Démarque et dates courtes', 'Ouverture et fermeture', 'Planning'],
    langues: ['Français', 'Anglais : notions'], permis: 'Permis B',
    lettre: [
      'C\'est avec intérêt que j\'ai lu votre offre d\'adjoint au chef de rayon épicerie, transmise par France Travail.',
      'Je suis cheffe d\'équipe dans un magasin discount depuis quatre ans. J\'organise le travail de six personnes, j\'ouvre et je ferme le magasin et je suis la démarque au quotidien. Dans un magasin de cette taille, les commandes sont passées par la centrale : c\'est justement la partie du métier que je souhaite maintenant apprendre et maîtriser.',
      'Rejoindre un rayon épicerie de 1 800 produits serait pour moi une vraie progression, aux côtés d\'une cheffe de rayon expérimentée.',
      'Dans l\'attente de votre réponse, je vous prie d\'agréer, Madame, mes salutations respectueuses.',
    ],
    suivi: [[-5, 'Candidature reçue par France Travail', ''], [-2, 'CV transmis à la cheffe de rayon épicerie pour avis', 'att']],
  },
  {
    id: 'k8', prenom: 'Théo', nom: 'Marchetti', poste: 'p3', etape: 'nouveau', recu: -1, source: 'Site du magasin', ville: 'Saint-Jean-de-la-Ruelle',
    titre: 'Préparateur de commandes',
    profil: 'Préparateur de commandes en entrepôt, titulaire du CACES R489 catégorie 1. Je cherche un poste de réceptionnaire en magasin.',
    xp: [
      ['Févr. 2024', 'Aujourd\'hui', 'Préparateur de commandes (intérim)', 'Entrepôt e-commerce (entreprise fictive), Saran', ['Préparation au scanner, 150 lignes par heure', 'Conduite de transpalette électrique']],
      ['Sept. 2022', 'Janv. 2024', 'Manutentionnaire (temps partiel)', 'Déménagements Ligériens (entreprise fictive)', ['Chargement et déchargement de camions']],
    ],
    formation: [['2022', 'CAP Opérateur logistique', 'Lycée professionnel (fictif), Orléans'], ['2024', 'CACES R489, catégorie 1', 'Organisme de formation (fictif)']],
    competences: ['CACES R489 cat. 1', 'Scanner, préparation de commandes', 'Port de charges en sécurité'],
    langues: ['Français', 'Italien : intermédiaire'], permis: 'Permis B',
    lettre: [
      'Je vous écris pour le poste de réceptionnaire publié sur votre site.',
      'Depuis deux ans, je travaille en entrepôt, d\'abord en manutention puis en préparation de commandes. J\'ai passé le CACES catégorie 1 et je souhaite maintenant un poste fixe où je peux suivre la marchandise du camion jusqu\'à la réserve.',
      'Ce qui me plaît dans votre annonce, c\'est le contact avec les chauffeurs et le contrôle des livraisons : j\'aime quand les quantités tombent juste. Je suis prêt à passer les autres catégories du CACES si le poste le demande.',
      'Merci pour votre attention. Je me tiens à votre disposition pour un entretien.',
    ],
    suivi: [[-1, 'Candidature reçue par le site du magasin', '']],
  },
  {
    id: 'k9', prenom: 'Aurélie', nom: 'Blanchard', poste: 'p1', etape: 'nouveau', recu: 0, source: 'Candidature spontanée', ville: 'Saran',
    titre: 'Employée polyvalente',
    profil: 'Employée polyvalente en station-service, je tiens la caisse et la boutique seule en fin de journée. Fiable et à l\'aise avec les clients.',
    xp: [
      ['Mars 2023', 'Aujourd\'hui', 'Employée polyvalente (temps partiel)', 'Station du Rond-Point, Saran (commerce fictif)', ['Encaissement carburant et boutique', 'Réassort de la boutique, contrôle des dates', 'Tenue de la caisse seule en soirée']],
      ['Sept. 2020', 'Févr. 2023', 'Agente d\'entretien (temps partiel)', 'Propreté Service (entreprise fictive), Orléans', ['Entretien de bureaux, horaires de soirée']],
    ],
    formation: [['2020', 'CAP Agent de propreté et d\'hygiène', 'Lycée professionnel (fictif), Orléans']],
    competences: ['Encaissement, terminal de paiement', 'Autonomie en soirée', 'Accueil client'],
    langues: ['Français'], permis: 'Permis B',
    lettre: [
      'Je vous adresse ma candidature spontanée pour un poste d\'hôtesse de caisse dans votre magasin.',
      'Dans la station-service où je travaille, je suis souvent seule en fin de journée : je tiens la caisse, je réponds aux questions et je fais le réassort de la boutique. J\'ai appris à rester calme et précise, même quand plusieurs clients attendent.',
      'Je souhaite rejoindre une équipe plus grande, avec des perspectives d\'évolution, et je suis disponible en soirée comme le samedi.',
      'Je vous remercie de bien vouloir étudier ma candidature.',
    ],
    suivi: [[0, 'Candidature spontanée reçue à l\'accueil du magasin', '']],
  },
  {
    id: 'k10', prenom: 'Karim', nom: 'Benali', poste: 'p2', etape: 'retenu', recu: -20, source: 'Cooptation (recommandé par Kevin Moulin)', ville: 'Orléans',
    titre: 'Employé libre-service',
    profil: 'Employé libre-service polyvalent, quatre ans en supermarché, dont deux au rayon crèmerie. Connaît les règles d\'hygiène et la tenue d\'un rayon frais.',
    xp: [
      ['Janv. 2022', 'Sept. 2025', 'Employé libre-service crèmerie', 'Proxi Marché, Orléans (enseigne fictive)', ['Mise en rayon du frais avant l\'ouverture', 'Relevés de température, retrait des dates courtes', 'Aide aux commandes du rayon']],
      ['Juil. 2020', 'Déc. 2021', 'Employé polyvalent', 'Proxi Marché, Orléans (enseigne fictive)', ['Caisse et mise en rayon']],
    ],
    formation: [['2020', 'CAP Équipier polyvalent du commerce', 'CFA (fictif), Orléans'], ['2022', 'Formation hygiène alimentaire (HACCP), 14 h', 'Organisme de formation (fictif)']],
    competences: ['Rayon frais, crèmerie', 'HACCP, relevés de température', 'Aide aux commandes', 'Travail tôt le matin'],
    langues: ['Français', 'Anglais : notions'], permis: 'Permis B',
    lettre: [
      'Kevin Moulin, qui travaille au libre-service de votre magasin, m\'a informé que vous recrutiez au rayon frais. Je vous propose ma candidature.',
      'J\'ai travaillé quatre ans dans un supermarché de proximité, dont deux ans au rayon crèmerie. Je faisais les relevés de température, je retirais les dates courtes et j\'aidais le responsable à préparer les commandes. Le magasin a fermé ses portes à la fin de l\'été, et je cherche une nouvelle équipe.',
      'Le rayon frais est celui que je préfère : c\'est exigeant, mais on voit tout de suite le résultat de son travail.',
      'Je serais heureux de vous rencontrer avec le chef de rayon. Je vous prie d\'agréer, Madame, mes sincères salutations.',
    ],
    suivi: [[-20, 'Candidature reçue par cooptation', ''], [-18, 'Appel de présélection', 'ok'], [-15, 'Entretien avec Sophie Marchand et Mehdi Larbi', 'ok'], [-14, 'Décision : candidature retenue, prise de poste à confirmer', 'ok']],
  },
  {
    id: 'k11', prenom: 'Lucie', nom: 'Fabre', poste: 'p1', etape: 'refuse', recu: -18, source: 'Site du magasin', ville: 'Olivet',
    titre: 'Étudiante, vendeuse',
    profil: 'Étudiante en deuxième année de licence, avec une expérience de vente en prêt-à-porter. Cherche un emploi à côté de ses études.',
    xp: [
      ['Sept. 2024', 'Juin 2025', 'Vendeuse (contrat étudiant, 10 h par semaine)', 'Boutique Mode du Centre, Orléans (commerce fictif)', ['Accueil, conseil et encaissement', 'Réassort et pliage']],
    ],
    formation: [['En cours', 'Licence de gestion, 2e année', 'Université (fictive), Orléans'], ['2023', 'Baccalauréat général', 'Lycée (fictif), Olivet']],
    competences: ['Encaissement', 'Conseil client', 'Bureautique'],
    langues: ['Français', 'Anglais : courant', 'Allemand : notions'], permis: 'Permis B',
    lettre: [
      'Je me permets de vous adresser ma candidature au poste d\'hôtesse de caisse.',
      'Étudiante en licence de gestion, j\'ai travaillé l\'an dernier dans une boutique de prêt-à-porter, où j\'ai appris à encaisser et à conseiller les clients. Je cherche un emploi qui me permette de financer mes études tout en gardant un lien avec le commerce.',
      'Je suis disponible le mercredi après-midi, le samedi et pendant les vacances universitaires.',
      'Je vous remercie par avance pour votre réponse.',
    ],
    suivi: [[-18, 'Candidature reçue par le site du magasin', ''], [-15, 'Appel de présélection : disponibilités échangées', ''], [-14, 'Décision : candidature non retenue, les disponibilités ne correspondent pas aux horaires du poste (28 h en semaine). Réponse personnalisée préparée, avec proposition de garder le CV pour un contrat étudiant.', 'ko']],
  },
];

const ANCIENS = [
  { nom: 'Gérard Fontaine', poste: 'Chef de rayon fruits et légumes', entree: '1998-02-02', sortie: '2025-06-30', contrat: 'CDI', motif: 'Départ à la retraite', reemb: false, note: 'Départ à la retraite. A formé deux employés du rayon avant de partir ; invité au pot de fin d\'année.' },
  { nom: 'Pauline Arnaud', poste: 'Hôtesse de caisse', entree: '2021-09-06', sortie: '2025-08-29', contrat: 'CDI, 28 h', motif: 'Démission pour une reconversion (formation d\'aide-soignante)', reemb: true, note: 'Très appréciée des clients. Réembauchable sans réserve ; à recontacter pour les remplacements d\'été si elle le souhaite.' },
  { nom: 'Lucas Germain', poste: 'Employé libre-service', entree: '2025-07-01', sortie: '2025-08-31', contrat: 'CDD saisonnier', motif: 'Fin du contrat saisonnier', reemb: true, note: 'Saison sérieuse et ponctuelle. Prioritaire pour la prochaine saison.' },
  { nom: 'Fatou Camara', poste: 'Réceptionnaire', entree: '2016-03-14', sortie: '2025-03-31', contrat: 'CDI', motif: 'Mutation dans un autre magasin du groupe (rapprochement géographique)', reemb: true, note: 'Partie à sa demande dans un magasin plus proche de son domicile. Bonne relation conservée.' },
  { nom: 'Damien Hubert', poste: 'Adjoint au chef de rayon épicerie', entree: '2019-01-07', sortie: '2025-09-30', contrat: 'CDI', motif: 'Rupture conventionnelle (projet de création d\'entreprise)', reemb: true, note: 'Départ d\'un commun accord pour lancer son activité. C\'est son poste qui est ouvert au recrutement.' },
  { nom: 'Margaux Lemaire', poste: 'Hôtesse d\'accueil', entree: '2025-01-06', sortie: '2025-07-04', contrat: 'CDD 6 mois (remplacement)', motif: 'Fin du CDD, retour de la salariée remplacée', reemb: true, note: 'Remplacement mené à bien, à rappeler pour un prochain CDD.' },
  { nom: 'Steven Morin', poste: 'Employé libre-service', entree: '2023-04-03', sortie: '2024-11-15', contrat: 'CDI', motif: 'Démission (a souhaité changer de secteur)', reemb: false, note: 'A choisi de quitter le commerce pour un autre métier ; pas de nouvelle candidature attendue. Départ dans de bonnes conditions.' },
  { nom: 'Clara Joubert', poste: 'Apprentie, BTS MCO', entree: '2023-09-04', sortie: '2025-08-31', contrat: 'Apprentissage (2 ans)', motif: 'Fin du contrat d\'apprentissage, diplôme obtenu', reemb: true, note: 'BTS obtenu. A souhaité poursuivre ses études ; à recontacter pour un poste d\'adjointe à la fin de sa licence.' },
];

// Fiche RH de chaque salarié d'EQUIPE (même ordre) : contrat, entrée, fin éventuelle, h/semaine, congés restants (jours), visite médicale, entretien annuel, formations
const PERSONNEL = [
  ['CDI (cadre, forfait jours)', '2011-09-05', null, '218 jours / an', 14, '2025-03-11', '2027-01-15', ['Management d\'équipe', 'Sauveteur secouriste du travail (SST)', 'Prévention des risques']],
  ['CDI', '2015-04-13', null, 39, 9, '2024-11-19', '2026-11-04', ['Hygiène alimentaire (HACCP)', 'Manager de proximité', 'SST']],
  ['CDI', '2017-02-06', null, 39, 12, '2025-01-28', '2026-11-18', ['Gestion des commandes', 'Merchandising', 'SST']],
  ['CDI', '2019-10-01', null, 35, 18, '2024-06-04', '2026-12-02', ['Gestes et postures', 'Conduite de gerbeur (CACES R485)']],
  ['CDI', '2021-05-17', null, 35, 7, '2025-05-20', '2026-10-28', ['Gestes et postures']],
  ['CDD (6 mois)', '2026-08-01', '2027-01-31', 35, 4.5, '2026-08-05', '2026-12-09', ['Accueil sécurité nouvel arrivant', 'Gestes et postures']],
  ['Apprentissage (BTS MCO, 2 ans)', '2025-09-01', '2027-08-31', '35 (école comprise)', 11, '2025-09-10', '2026-11-25', ['BTS MCO en alternance', 'Gestes et postures']],
  ['CDI', '2008-03-03', null, 35, 20, '2024-09-17', '2027-01-20', ['CACES R489 cat. 1, 3 et 5', 'SST']],
  ['CDI', '2022-01-10', null, 35, 10, '2025-02-11', '2026-10-21', ['CACES R489 cat. 1 et 3', 'Gestes et postures']],
  ['CDI', '2013-06-03', null, 35, 16, '2025-06-24', '2026-11-12', ['Accueil et gestion des réclamations', 'SST']],
  ['CDI', '2020-09-14', null, 30, 8, '2024-10-08', '2026-12-16', ['Accueil client', 'Service après-vente']],
  ['CDI', '2016-11-07', null, 28, 13, '2025-04-15', '2026-11-06', ['Caisse et moyens de paiement', 'Référente caisses automatiques']],
  ['CDI', '2023-03-20', null, 24, 6, '2023-03-28', '2026-10-30', ['Caisse et moyens de paiement']],
  ['CDI', '2018-04-09', null, 32, 15, '2024-12-03', '2026-11-20', ['Caisse et moyens de paiement', 'SST']],
  ['CDI', '2019-06-24', null, 35, 9, '2025-01-14', '2026-12-04', ['Caisse et moyens de paiement']],
  ['CDD (remplacement)', '2026-06-01', '2026-12-31', 35, 5, '2026-06-09', '2026-12-18', ['Caisse et moyens de paiement']],
  ['CDI', '2024-02-05', null, 28, 11, '2024-02-20', '2027-01-08', ['Caisse et moyens de paiement']],
  ['Saisonnier (fêtes de fin d\'année)', '2026-10-01', '2027-01-10', 20, 1.5, '2026-10-06', null, ['Accueil sécurité nouvel arrivant', 'Caisse et moyens de paiement']],
  ['CDI (temps partiel, étudiant)', '2025-09-08', null, 15, 6, '2025-09-16', '2026-11-27', ['Caisse et moyens de paiement']],
  ['Apprentissage (CAP Équipier polyvalent du commerce)', '2026-09-01', '2028-08-31', '35 (école comprise)', 2.5, '2026-09-08', '2027-02-26', ['CAP en alternance', 'Accueil sécurité nouvel arrivant']],
];

// ================= Outils =================
const JOUR = 86400000;
const aujourdhui = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const decale = (n) => new Date(aujourdhui().getTime() + n * JOUR);
// n jours ouvrés (le magasin est ouvert du lundi au samedi) à partir d'aujourd'hui
function ouvre(n) { const d = aujourdhui(); let k = 0; while (k < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) k++; } return d; }
const dCourt = (d) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dLong = (d) => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const dIso = (s) => (s ? new Date(s + 'T00:00:00') : null);
const hTxt = (h) => `${Math.floor(h)}h${h % 1 ? String(Math.round((h % 1) * 60)).padStart(2, '0') : ''}`;
const maj = (x) => x.charAt(0).toUpperCase() + x.slice(1);
const nb = (x) => String(x).replace('.', ',');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const li = (a, b) => `<li><span>${a}</span><b>${b}</b></li>`;
const etape = (k) => `<span class="statut ${ETAPES[k.etape].cl}">${ETAPES[k.etape].txt}</span>`;
const nomK = (k) => `${k.prenom} ${k.nom}`;
const posteDe = (id) => POSTES.find((p) => p.id === id);
const mail = (k) => `${k.prenom}.${k.nom}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z.]/g, '') + '@exemple.fr';
function anciennete(debut, fin = aujourdhui()) {
  let m = (fin.getFullYear() - debut.getFullYear()) * 12 + fin.getMonth() - debut.getMonth(); if (fin.getDate() < debut.getDate()) m--;
  if (m < 1) return 'moins d\'un mois';
  const a = Math.floor(m / 12), r = m % 12;
  return [a ? `${a} an${a > 1 ? 's' : ''}` : '', r ? `${r} mois` : ''].filter(Boolean).join(' et ');
}

export function installerRH({ equipe = [], heure = () => 12, choisirPersonne = () => {} } = {}) {
  if (!document.getElementById('rh-css')) { const s = document.createElement('style'); s.id = 'rh-css'; s.textContent = CSS; document.head.appendChild(s); }

  // état de la démo (copie : les boutons changent l'étape sans toucher aux données d'origine)
  const cands = CANDIDATS.map((k) => ({ ...k, suivi: k.suivi.map((x) => [...x]), rdv: k.rdv ? [...k.rdv] : null }));
  const st = { sous: 'recrutement', filtre: null, ouvert: null, doc: null, vue: 'cv' };
  let dernier = null, racine = null, html = '';
  const dateRdv = (k) => ouvre(k.rdv[0]);

  const tousRdv = () => cands.filter((k) => k.rdv && k.etape !== 'refuse').sort((a, b) => a.rdv[0] - b.rdv[0] || a.rdv[1] - b.rdv[1]);
  function rdvDuJour() { return tousRdv().filter((k) => k.rdv[0] === 0).map((k) => ({ id: k.id, nom: nomK(k), poste: posteDe(k.poste).titre, debut: k.rdv[1], fin: k.rdv[2] })); }

  // ---------- sous-onglets ----------
  function vueRecrutement() {
    const liste = cands.filter((k) => !st.filtre || k.poste === st.filtre).sort((a, b) => ORDRE.indexOf(a.etape) - ORDRE.indexOf(b.etape) || b.recu - a.recu);
    const postes = POSTES.map((p) => { const ks = cands.filter((k) => k.poste === p.id), actifs = ks.filter((k) => k.etape !== 'refuse').length; return `<button class="rh-poste ${st.filtre === p.id ? 'actif' : ''}" data-rh-poste="${p.id}"><span><b>${p.titre}</b><small>${p.contrat} · publié le ${dCourt(decale(p.publie))}</small></span><em>${actifs} <small>candidat${actifs > 1 ? 's' : ''}</small></em></button>`; }).join('');
    const f = st.filtre ? `<p class="rh-filtre">Filtré sur « ${posteDe(st.filtre).titre} » · <button data-rh-poste="">voir tous les candidats</button></p>` : '';
    return `<h2>Postes ouverts</h2><div class="rh-postes">${postes}</div><h2>Candidatures (${liste.length})</h2>${f}<table><thead><tr><th>Candidat</th><th>Étape</th><th class="num">Reçue</th></tr></thead><tbody>${liste.map((k) => `<tr class="clic" data-rh-doc="${k.id}"><td><b>${nomK(k)}</b><br><small class="d">${posteDe(k.poste).titre}</small></td><td>${etape(k)}<br><small class="d">${esc(k.source.split(' (')[0])}</small></td><td class="num">${dCourt(decale(k.recu))}</td></tr>`).join('')}</tbody></table><p style="color:var(--doux);font-size:12px">Un clic sur un candidat ouvre son CV, sa lettre de motivation et son suivi.</p>`;
  }

  function vueRdv() {
    const h = heure(), liste = tousRdv();
    const prochain = liste.find((k) => k.rdv[0] > 0 || k.rdv[2] > h);
    const parJour = {};
    liste.forEach((k) => (parJour[k.rdv[0]] ||= []).push(k));
    const jours = Object.keys(parJour).map(Number).sort((a, b) => a - b);
    if (!jours.length) return '<p>Aucun entretien prévu cette semaine.</p>';
    return `<h2>Entretiens d'embauche</h2>${jours.map((j) => `<p class="rh-jour">${j === 0 ? 'Aujourd\'hui, ' + dLong(ouvre(j)) : j === 1 ? 'Demain, ' + dLong(ouvre(j)) : maj(dLong(ouvre(j)))}</p>${parJour[j].map((k) => {
      const encours = j === 0 && k.rdv[1] <= h && h < k.rdv[2], passe = j === 0 && h >= k.rdv[2];
      const cl = encours ? 'encours' : passe ? 'passe' : k === prochain ? 'prochain' : '';
      const etat = encours ? '<span class="statut ok">En cours</span> ' : passe ? '<span class="statut rh-gris">Terminé</span> ' : k === prochain ? '<span class="statut att">Prochain</span> ' : '';
      return `<div class="rh-rdv ${cl}" data-rh-doc="${k.id}" role="button" tabindex="0"><div class="h">${hTxt(k.rdv[1])}<small>${hTxt(k.rdv[2])}</small></div><div>${etat}<b>${nomK(k)}</b><br>${posteDe(k.poste).titre}<div class="q">Avec ${RH.nom} (RH) et ${posteDe(k.poste).avec} · ${LIEU}</div></div></div>`;
    }).join('')}`).join('')}<p style="color:var(--doux);font-size:12px">Le candidat se présente à l'accueil, qui le conduit au ${LIEU.toLowerCase()}.</p>`;
  }

  function vueAnciens() {
    return `<h2>Ils ont travaillé chez nous (${ANCIENS.length})</h2>${ANCIENS.map((a) => `<div class="rh-carte"><div class="tete"><div><b>${a.nom}</b><br><small class="d">${a.poste} · ${a.contrat}</small></div><span class="statut ${a.reemb ? 'ok' : 'rh-gris'}">${a.reemb ? 'Réembauchable' : 'Non réembauchable'}</span></div><ul class="lignes">${li('Entrée', dCourt(dIso(a.entree)))}${li('Sortie', dCourt(dIso(a.sortie)))}${li('Durée', anciennete(dIso(a.entree), dIso(a.sortie)))}${li('Motif du départ', a.motif)}</ul><p>${a.note}</p></div>`).join('')}`;
  }

  function vuePersonnel() {
    const auj = aujourdhui();
    return `<h2>Dossiers du personnel (${equipe.length})</h2>${equipe.map((e, i) => {
      const p = PERSONNEL[i] || ['CDI', '2020-01-06', null, 35, 10, '2024-01-15', null, []];
      const [contrat, entree, fin, heures, conges, visite, entretien, formations] = p;
      const dE = dIso(entree), dV = dIso(visite), dA = dIso(entretien), ouvert = st.ouvert === e.id;
      const visiteVieille = dV && (auj - dV) / JOUR > 365 * 5;
      const ent = dA ? (dA < auj ? `<span style="color:var(--orange)">${dCourt(dA)}, à reprogrammer</span>` : (dA - auj) / JOUR <= 14 ? `<span style="color:var(--orange)">${dCourt(dA)}, bientôt</span>` : dCourt(dA)) : 'après la fin du contrat';
      return `<div class="rh-perso ${ouvert ? 'ouvert' : ''}"><button data-rh-perso="${e.id}" aria-expanded="${ouvert}"><span><b>${esc(e.nom)}</b><small>${esc(e.poste)} · ${contrat.split(' (')[0]}${fin ? ' jusqu\'au ' + dCourt(dIso(fin)) : ''}</small></span><span class="fl">›</span></button>${ouvert ? `<div class="det"><ul class="lignes">${li('Contrat', contrat)}${li('Entrée', `${dCourt(dE)} (${anciennete(dE)})`)}${fin ? li('Fin prévue', dCourt(dIso(fin))) : ''}${li('Heures par semaine', typeof heures === 'number' ? `${heures} h` : heures)}${li('Congés restants', `${nb(conges)} jour${conges > 1 ? 's' : ''}`)}${li('Dernière visite médicale', `${dCourt(dV)}${visiteVieille ? ' (à renouveler)' : ''}`)}${li('Prochain entretien annuel', ent)}</ul><div class="rh-tags">${formations.map((f) => `<span>${f}</span>`).join('')}</div><button class="rh-bt" data-rh-voir="${e.id}">Voir dans le magasin</button></div>` : ''}</div>`;
    }).join('')}<p style="color:var(--doux);font-size:12px">La visite médicale n'indique qu'une date : le contenu reste chez le médecin du travail.</p>`;
  }

  function rendre(conteneur) {
    if (!conteneur) return;
    dernier = conteneur;
    if (!conteneur.dataset.rh) { conteneur.dataset.rh = '1'; conteneur.addEventListener('click', clicPanneau); conteneur.addEventListener('keydown', (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.closest('.rh-rdv')) { ev.preventDefault(); clicPanneau(ev); } }); }
    const r = rdvDuJour(), ouverts = cands.filter((k) => !['retenu', 'refuse'].includes(k.etape)).length;
    const sous = [['recrutement', 'Recrutement'], ['rdv', 'Rendez-vous'], ['anciens', 'Anciens salariés'], ['personnel', 'Personnel']];
    const corps = { recrutement: vueRecrutement, rdv: vueRdv, anciens: vueAnciens, personnel: vuePersonnel }[st.sous]();
    const h = `<div class="rh"><p class="rh-fictif">Données fictives de démonstration : candidats, salariés et documents sont inventés.</p><div class="rh-resume"><div><b>${POSTES.length}</b><span>postes ouverts</span></div><div><b>${ouverts}</b><span>candidatures en cours</span></div><div><b>${r.length}</b><span>entretien${r.length > 1 ? 's' : ''} aujourd'hui</span></div></div><nav class="rh-sous">${sous.map(([k, t]) => `<button data-rh-sous="${k}" class="${st.sous === k ? 'actif' : ''}">${t}</button>`).join('')}</nav>${corps}<p class="rh-rgpd"><b>Vos données (RGPD).</b> Les candidatures servent uniquement au recrutement du magasin. Celles qui ne sont pas retenues sont conservées 2 ans au plus, puis supprimées. Chaque candidat ou salarié peut demander l'accès à ses données, leur correction ou leur suppression auprès du service RH. Aucune donnée sensible n'est demandée ni enregistrée.</p></div>`;
    if (h === html && racine && conteneur.contains(racine)) return; // rien n'a changé : on ne redessine pas (le panneau est rappelé à chaque minute de démo)
    html = h; conteneur.innerHTML = h; racine = conteneur.firstElementChild;
  }
  const redessiner = () => { html = ''; if (dernier && racine && dernier.contains(racine)) rendre(dernier); };

  function clicPanneau(ev) {
    const el = ev.target.closest('[data-rh-sous],[data-rh-poste],[data-rh-doc],[data-rh-perso],[data-rh-voir]'); if (!el) return;
    if (el.dataset.rhSous) { st.sous = el.dataset.rhSous; redessiner(); }
    else if (el.dataset.rhPoste !== undefined) { st.filtre = el.dataset.rhPoste && st.filtre !== el.dataset.rhPoste ? el.dataset.rhPoste : null; redessiner(); }
    else if (el.dataset.rhDoc) ouvrirDocument(el.dataset.rhDoc);
    else if (el.dataset.rhPerso) { st.ouvert = st.ouvert === el.dataset.rhPerso ? null : el.dataset.rhPerso; redessiner(); }
    else if (el.dataset.rhVoir) choisirPersonne(el.dataset.rhVoir);
  }

  // ---------- fenêtre CV / lettre / suivi ----------
  let voile = null, avantFocus = null;
  function construireVoile() {
    voile = document.createElement('div'); voile.className = 'rh-voile'; voile.hidden = true;
    voile.innerHTML = '<div class="rh-modale" role="dialog" aria-modal="true" aria-labelledby="rh-m-titre"></div>';
    document.body.appendChild(voile);
    voile.addEventListener('click', (ev) => {
      if (ev.target === voile) return fermer();
      const b = ev.target.closest('[data-m]'); if (!b) return;
      const a = b.dataset.m;
      if (a === 'fermer') fermer();
      else if (['cv', 'lettre', 'suivi'].includes(a)) { st.vue = a; dessinerDoc(); }
      else agir(a);
    });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && voile && !voile.hidden) { ev.stopPropagation(); fermer(); } }, true);
  }
  function fermer() { if (!voile || voile.hidden) return; voile.hidden = true; st.doc = null; document.body.classList.remove('rh-bloque'); if (avantFocus && avantFocus.isConnected) avantFocus.focus({ preventScroll: true }); }

  function cv(k) {
    const p = posteDe(k.poste);
    return `<div class="rh-papier"><div class="rh-cv"><div class="rh-cv-nom"><b>${nomK(k)}</b><span>${k.titre}</span></div><div class="col"><section><h4>Coordonnées</h4><ul><li>${k.ville}</li><li>${mail(k)}</li><li>Téléphone : sur demande (démo)</li></ul></section><section><h4>Compétences</h4><ul>${k.competences.map((c) => `<li>${c}</li>`).join('')}</ul></section><section><h4>Langues</h4><ul>${k.langues.map((c) => `<li>${c}</li>`).join('')}</ul></section><section><h4>Permis</h4><ul><li>${k.permis}</li></ul></section></div><div><section><h4>Profil</h4><p style="margin:0">${k.profil}</p></section><section><h4>Expérience professionnelle</h4>${k.xp.map(([de, a, t, o, pts]) => `<div class="rh-xp"><div class="t"><b>${t}</b><span>${a ? `${de} – ${a}` : de}</span></div><div class="o">${o}</div><ul>${pts.map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</section><section><h4>Formation</h4>${k.formation.map(([an, d, o]) => `<div class="rh-xp"><div class="t"><b>${d}</b><span>${an}</span></div><div class="o">${o}</div></div>`).join('')}</section></div></div></div><p style="text-align:center;color:var(--doux);font-size:11.5px;margin:10px 0 0">CV fictif reçu pour le poste « ${p.titre} ».</p>`;
  }
  function lettre(k) {
    const p = posteDe(k.poste);
    return `<div class="rh-papier rh-lettre"><p class="exp">${nomK(k)}<br>${k.ville}<br>${mail(k)}</p><p class="dest">${MAGASIN}<br>À l'attention de ${RH.nom}<br>${RH.titre}</p><p class="date">${k.ville}, le ${decale(k.recu).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p><p><b>Objet : candidature au poste de ${p.titre.toLowerCase()}</b></p><p>Madame,</p>${k.lettre.map((x) => `<p>${x}</p>`).join('')}<p class="sig">${nomK(k)}</p></div>`;
  }
  function suivi(k) {
    const p = posteDe(k.poste);
    const evts = k.suivi.map(([j, t, c]) => `<li class="${c}"><b>${dCourt(decale(j))}</b>${t}</li>`);
    if (k.rdv && k.etape === 'entretien') evts.push(`<li class="att"><b>${dCourt(dateRdv(k))} à ${hTxt(k.rdv[1])}</b>Entretien prévu au ${LIEU.toLowerCase()} avec ${RH.nom} et ${p.avec}</li>`);
    return `<div class="rh-suivi"><ul class="lignes">${li('Poste visé', p.titre)}${li('Contrat proposé', p.contrat)}${li('Source', k.source)}${li('Reçue le', dCourt(decale(k.recu)))}${li('Étape', etape(k))}</ul><h2>Historique</h2><ol>${evts.join('')}</ol></div>`;
  }
  function dessinerDoc() {
    const k = cands.find((x) => x.id === st.doc); if (!k) return;
    const m = voile.firstElementChild, p = posteDe(k.poste), fini = ['retenu', 'refuse'].includes(k.etape);
    const corps = st.vue === 'lettre' ? lettre(k) : st.vue === 'suivi' ? suivi(k) : cv(k);
    m.innerHTML = `<div class="rh-m-tete"><div><h3 id="rh-m-titre">${nomK(k)}</h3><p>${p.titre} · ${etape(k)}</p></div><button class="x" data-m="fermer" aria-label="Fermer">×</button></div><nav class="rh-m-onglets">${[['cv', 'CV'], ['lettre', 'Lettre de motivation'], ['suivi', 'Suivi']].map(([v, t]) => `<button data-m="${v}" class="${st.vue === v ? 'actif' : ''}">${t}</button>`).join('')}</nav><div class="rh-m-corps">${corps}</div><div class="rh-m-pied"><small>Démo : les boutons changent l'étape, rien n'est envoyé au candidat.</small><button class="rh-bt" data-m="refuser" ${fini ? 'disabled' : ''}>Refuser</button>${k.etape === 'entretien' ? `<button class="rh-bt go" data-m="retenir">Retenir</button>` : `<button class="rh-bt go" data-m="inviter" ${fini ? 'disabled' : ''}>Inviter en entretien</button>`}</div>`;
  }
  function creneauLibre() {
    const pris = new Set(cands.filter((k) => k.rdv && k.etape === 'entretien').map((k) => `${k.rdv[0]}-${k.rdv[1]}`));
    const choix = [[3, 10], [3, 11], [3, 15], [4, 10], [4, 11], [4, 14.5], [5, 10], [5, 15]];
    const c = choix.find(([j, h]) => !pris.has(`${j}-${h}`)) || [5, 16];
    return [c[0], c[1], c[1] + 0.75];
  }
  function agir(a) {
    const k = cands.find((x) => x.id === st.doc); if (!k) return;
    if (a === 'inviter' && !['entretien', 'retenu', 'refuse'].includes(k.etape)) {
      k.rdv = creneauLibre(); k.etape = 'entretien';
      k.suivi.push([0, `Invitation à un entretien le ${dLong(dateRdv(k))} à ${hTxt(k.rdv[1])} préparée (démo : rien n'est envoyé)`, 'att']);
      st.vue = 'suivi';
    } else if (a === 'refuser' && !['retenu', 'refuse'].includes(k.etape)) {
      k.etape = 'refuse';
      k.suivi.push([0, 'Décision : candidature non retenue. Réponse courtoise préparée, avec remerciements (démo : rien n\'est envoyé). CV supprimé au plus tard dans 2 ans.', 'ko']);
      st.vue = 'suivi';
    } else if (a === 'retenir' && k.etape === 'entretien') {
      k.etape = 'retenu';
      k.suivi.push([0, 'Décision : candidature retenue. Proposition d\'embauche à préparer (démo : rien n\'est envoyé).', 'ok']);
      st.vue = 'suivi';
    } else return;
    dessinerDoc(); redessiner();
  }

  function ouvrirDocument(id) {
    if (!cands.some((k) => k.id === id)) return false;
    if (!voile) construireVoile();
    if (voile.hidden) avantFocus = document.activeElement;
    st.doc = id; st.vue = 'cv'; dessinerDoc();
    voile.hidden = false; document.body.classList.add('rh-bloque');
    voile.querySelector('.x').focus({ preventScroll: true });
    return true;
  }

  return { rendre, rdvDuJour, ouvrirDocument };
}
