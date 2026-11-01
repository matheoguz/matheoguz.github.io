// Données 100 % fictives pour la démo. Aucune vraie personne ni vraie entreprise.
const P = (g, n) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const U = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

window.DEMO = {
  aujourdhui: '2026-11-02',
  entreprise: {
    nom: 'Martin Rénovation',
    gerant: 'Julien Martin',
    ville: 'Dijon',
    siret: '000 000 000 00000',
    decennale: 'Assurance décennale n° DEMO-2026-0418 — couverture France métropolitaine',
  },

  salaries: [
    { id: 'julien', prenom: 'Julien', nom: 'Martin', poste: 'Gérant', photo: P('men', 46), contrat: 'Gérant', entree: '2014-03-01', salaire: null, tel: '06 00 00 00 01', email: 'julien@exemple.fr', urgence: 'Claire Martin — 06 00 00 00 11', couleur: '#0f1419', cp: null, heures: 38,
      docs: [] },
    { id: 'karim', prenom: 'Karim', nom: 'Benali', poste: 'Chef de chantier', photo: P('men', 32), contrat: 'CDI', entree: '2017-09-04', salaire: 2850, tel: '06 00 00 00 02', email: 'karim@exemple.fr', urgence: 'Samia Benali — 06 00 00 00 12', couleur: '#e2570f', cp: 21, heures: 39,
      docs: [
        { nom: 'Carte BTP', exp: '2028-05-12' },
        { nom: 'Visite médicale', exp: '2027-02-03' },
        { nom: 'CACES R482 (engins de chantier)', exp: '2029-01-20' },
      ] },
    { id: 'thomas', prenom: 'Thomas', nom: 'Lefèvre', poste: 'Plombier-chauffagiste', photo: P('men', 75), contrat: 'CDI', entree: '2019-01-07', salaire: 2450, tel: '06 00 00 00 03', email: 'thomas@exemple.fr', urgence: 'Julie Lefèvre — 06 00 00 00 13', couleur: '#1d4ed8', cp: 18, heures: 35,
      docs: [
        { nom: 'Carte BTP', exp: '2027-08-30' },
        { nom: 'Visite médicale', exp: '2027-06-14' },
        { nom: 'Attestation fluides frigorigènes', exp: '2030-04-01' },
      ] },
    { id: 'sofiane', prenom: 'Sofiane', nom: 'Haddad', poste: 'Électricien', photo: P('men', 22), contrat: 'CDI', entree: '2020-06-15', salaire: 2400, tel: '06 00 00 00 04', email: 'sofiane@exemple.fr', urgence: 'Nadia Haddad — 06 00 00 00 14', couleur: '#7c3aed', cp: 14, heures: 37,
      docs: [
        { nom: 'Carte BTP', exp: '2027-11-02' },
        { nom: 'Habilitation électrique B2V-BR', exp: '2026-11-20' },
        { nom: 'Visite médicale', exp: '2027-03-09' },
      ] },
    { id: 'lucas', prenom: 'Lucas', nom: 'Moreau', poste: 'Carreleur', photo: P('men', 52), contrat: 'CDI', entree: '2021-02-01', salaire: 2300, tel: '06 00 00 00 05', email: 'lucas@exemple.fr', urgence: 'Anne Moreau — 06 00 00 00 15', couleur: '#0f766e', cp: 9, heures: 39,
      docs: [
        { nom: 'Carte BTP', exp: '2028-01-15' },
        { nom: 'Visite médicale', exp: '2026-10-15' },
      ] },
    { id: 'antoine', prenom: 'Antoine', nom: 'Girard', poste: 'Maçon', photo: P('men', 64), contrat: 'CDD', entree: '2026-09-01', fin: '2027-02-28', salaire: 2250, tel: '06 00 00 00 06', email: 'antoine@exemple.fr', urgence: 'Marc Girard — 06 00 00 00 16', couleur: '#a16207', cp: 4, heures: 39,
      docs: [
        { nom: 'Carte BTP', exp: '2027-02-28' },
        { nom: 'Visite médicale', exp: '2028-09-01' },
      ] },
    { id: 'enzo', prenom: 'Enzo', nom: 'Garcia', poste: 'Apprenti plombier', photo: P('men', 11), contrat: 'Apprentissage', entree: '2025-09-01', fin: '2027-08-31', salaire: 1050, tel: '06 00 00 00 07', email: 'enzo@exemple.fr', urgence: 'Isabel Garcia — 06 00 00 00 17', couleur: '#0369a1', cp: 11, heures: 35,
      docs: [
        { nom: 'Carte BTP', exp: '2026-12-03' },
        { nom: 'Visite médicale', exp: '2027-09-01' },
      ] },
    { id: 'nathalie', prenom: 'Nathalie', nom: 'Roux', poste: 'Assistante administrative', photo: P('women', 44), contrat: 'CDI', entree: '2018-04-03', salaire: 2100, tel: '06 00 00 00 08', email: 'nathalie@exemple.fr', urgence: 'Pierre Roux — 06 00 00 00 18', couleur: '#be185d', cp: 16, heures: 35,
      docs: [
        { nom: 'Visite médicale', exp: '2027-12-01' },
      ] },
  ],

  conges: [
    { salarie: 'thomas', du: '2026-11-23', au: '2026-11-27', jours: 5, type: 'Congés payés', statut: 'en attente' },
    { salarie: 'lucas', du: '2026-12-21', au: '2026-12-31', jours: 7, type: 'Congés payés', statut: 'validé' },
    { salarie: 'nathalie', du: '2026-11-06', au: '2026-11-06', jours: 1, type: 'RTT', statut: 'validé' },
  ],

  clients: [
    { id: 'durand', nom: 'Mme Claire Durand', type: 'Particulier', adresse: '12 rue des Lilas, 21000 Dijon', tel: '06 00 00 01 01', email: 'c.durand@exemple.fr' },
    { id: 'petit', nom: 'M. et Mme Petit', type: 'Particulier', adresse: '4 allée des Saules, 21121 Fontaine-lès-Dijon', tel: '06 00 00 01 02', email: 'petit.famille@exemple.fr' },
    { id: 'bernard', nom: 'M. Olivier Bernard', type: 'Particulier', adresse: '27 avenue Victor-Hugo, 21000 Dijon', tel: '06 00 00 01 03', email: 'o.bernard@exemple.fr' },
    { id: 'tilleuls', nom: 'SCI Les Tilleuls', type: 'Professionnel', adresse: '8 chemin du Moulin, 21160 Marsannay-la-Côte', tel: '03 00 00 01 04', email: 'gestion@exemple.fr' },
    { id: 'girard', nom: 'Mme Hélène Faure', type: 'Particulier', adresse: '3 place du Marché, 21800 Quetigny', tel: '06 00 00 01 05', email: 'h.faure@exemple.fr' },
    { id: 'copro', nom: 'Copropriété Le Parc', type: 'Professionnel', adresse: '45 boulevard de la Marne, 21000 Dijon', tel: '03 00 00 01 06', email: 'syndic@exemple.fr' },
  ],

  chantiers: [
    { id: 'C-041', titre: 'Salle de bain complète', client: 'durand', statut: 'en cours', debut: '2026-10-19', fin: '2026-11-13', avancement: 65,
      budget: 13920, coutMat: 4920, heuresPrevues: 120, heuresReelles: 80, tauxHoraire: 42, equipe: ['thomas', 'lucas', 'enzo'], couleur: '#1d4ed8',
      photo: U('photo-1749532125405-70950966b0e5'),
      etapes: [['Dépose de l\'ancienne salle de bain', true], ['Plomberie et évacuations', true], ['Chape et étanchéité', true], ['Carrelage sol et murs', false], ['Pose douche à l\'italienne et meuble', false], ['Finitions et nettoyage', false]] },
    { id: 'C-043', titre: 'Rénovation cuisine', client: 'petit', statut: 'en cours', debut: '2026-10-26', fin: '2026-11-27', avancement: 30,
      budget: 22400, coutMat: 6100, heuresPrevues: 190, heuresReelles: 56, tauxHoraire: 42, equipe: ['karim', 'antoine', 'sofiane'], couleur: '#e2570f',
      photo: U('photo-1676210134188-4c05dd172f89'),
      etapes: [['Démolition et évacuation', true], ['Réseaux électriques', false], ['Arrivées d\'eau', false], ['Pose des meubles', false], ['Plan de travail et crédence', false]] },
    { id: 'C-039', titre: 'Mise aux normes électriques', client: 'bernard', statut: 'en cours', debut: '2026-10-12', fin: '2026-11-06', avancement: 80,
      budget: 8600, coutMat: 2350, heuresPrevues: 70, heuresReelles: 79, tauxHoraire: 42, equipe: ['sofiane'], couleur: '#7c3aed',
      photo: null,
      etapes: [['Diagnostic', true], ['Nouveau tableau électrique', true], ['Remplacement des circuits', true], ['Consuel', false]] },
    { id: 'C-045', titre: 'Extension de maison (25 m²)', client: 'tilleuls', statut: 'à démarrer', debut: '2026-11-16', fin: '2027-02-12', avancement: 0,
      budget: 61500, coutMat: 0, heuresPrevues: 620, heuresReelles: 0, tauxHoraire: 42, equipe: ['karim', 'antoine'], couleur: '#a16207',
      photo: null,
      etapes: [['Fondations', false], ['Élévation des murs', false], ['Charpente et couverture', false], ['Menuiseries', false], ['Second œuvre', false]] },
    { id: 'C-037', titre: 'Remplacement de chaudière', client: 'girard', statut: 'terminé', debut: '2026-10-05', fin: '2026-10-08', avancement: 100,
      budget: 6900, coutMat: 3980, heuresPrevues: 22, heuresReelles: 20, tauxHoraire: 42, equipe: ['thomas', 'enzo'], couleur: '#0f766e',
      photo: null,
      etapes: [['Dépose ancienne chaudière', true], ['Pose et raccordement', true], ['Mise en service', true]] },
  ],

  devis: [
    { id: 'D-2026-118', client: 'copro', objet: 'Ravalement de façade', date: '2026-10-28', statut: 'envoyé', tva: 10,
      lignes: [
        ['Installation et repli de l\'échafaudage', 1, 'forfait', 4200],
        ['Nettoyage haute pression de la façade', 380, 'm²', 9],
        ['Reprise des fissures', 42, 'ml', 28],
        ['Enduit de finition taloché', 380, 'm²', 38],
      ] },
    { id: 'D-2026-117', client: 'petit', objet: 'Option : îlot central', date: '2026-10-27', statut: 'brouillon', tva: 10,
      lignes: [['Îlot central avec rangements', 1, 'u', 2850], ['Raccordement électrique de l\'îlot', 1, 'forfait', 420]] },
    { id: 'D-2026-115', client: 'tilleuls', objet: 'Extension de maison (25 m²)', date: '2026-10-14', statut: 'signé', tva: 20,
      lignes: [['Gros œuvre : fondations et murs', 1, 'forfait', 28400], ['Charpente et couverture', 1, 'forfait', 14600], ['Menuiseries extérieures', 1, 'forfait', 7900], ['Second œuvre', 1, 'forfait', 10600]] },
    { id: 'D-2026-112', client: 'durand', objet: 'Salle de bain complète', date: '2026-10-02', statut: 'signé', tva: 10,
      lignes: [
        ['Dépose et évacuation de l\'ancienne salle de bain', 1, 'forfait', 1150],
        ['Plomberie : alimentations et évacuations', 1, 'forfait', 2400],
        ['Chape et étanchéité sous carrelage', 7.5, 'm²', 85],
        ['Carrelage sol et murs (fourniture et pose)', 28, 'm²', 120],
        ['Douche à l\'italienne avec paroi vitrée', 1, 'u', 3100],
        ['Meuble vasque double et miroir', 1, 'u', 1480],
        ['Radiateur sèche-serviettes', 1, 'u', 690],
        ['Peinture plafond et finitions', 1, 'forfait', 1102.5],
      ] },
    { id: 'D-2026-109', client: 'bernard', objet: 'Pompe à chaleur air-eau', date: '2026-09-22', statut: 'refusé', tva: 5.5,
      lignes: [['Pompe à chaleur air-eau 8 kW', 1, 'u', 9800], ['Pose et mise en service', 1, 'forfait', 1900]] },
  ],

  factures: [
    { id: 'F-2026-091', client: 'durand', objet: 'Acompte 30 % — Salle de bain', date: '2026-10-05', echeance: '2026-10-05', montantTTC: 4593.6, statut: 'payée' },
    { id: 'F-2026-094', client: 'girard', objet: 'Remplacement de chaudière', date: '2026-10-09', echeance: '2026-10-21', montantTTC: 7279.5, statut: 'en retard', relances: 1 },
    { id: 'F-2026-096', client: 'petit', objet: 'Acompte 30 % — Cuisine', date: '2026-10-20', echeance: '2026-10-27', montantTTC: 7392, statut: 'payée' },
    { id: 'F-2026-098', client: 'bernard', objet: 'Situation n° 2 — Électricité', date: '2026-10-30', echeance: '2026-11-14', montantTTC: 5676, statut: 'envoyée' },
    { id: 'F-2026-099', client: 'tilleuls', objet: 'Acompte 30 % — Extension', date: '2026-10-31', echeance: '2026-11-15', montantTTC: 22140, statut: 'envoyée' },
  ],

  // Planning de la semaine du 2 au 6 novembre : salarié -> 5 jours (id de chantier, 'conge' ou null)
  planning: {
    karim:   ['C-043', 'C-043', 'C-043', 'C-045', 'C-043'],
    thomas:  ['C-041', 'C-041', 'C-041', 'C-041', 'C-041'],
    sofiane: ['C-039', 'C-039', 'C-039', 'C-043', 'C-043'],
    lucas:   ['C-041', 'C-041', 'C-041', 'C-041', 'C-041'],
    antoine: ['C-043', 'C-043', 'C-043', 'C-043', 'C-043'],
    enzo:    ['C-041', 'C-041', 'ecole', 'ecole', 'C-041'],
  },

  caMensuel: [['Mai', 38200], ['Juin', 44100], ['Juil.', 51800], ['Août', 29400], ['Sept.', 46900], ['Oct.', 48320]],
};
