// Démo « Transports Modèle » : données FICTIVES d'une PME de transport (25 personnes, 20 véhicules, 17 tournées du jour).
// Noms, immatriculations, clients, montants et dates sont inventés. Les échéances sont en jours à partir d'aujourd'hui
// (négatif = déjà dépassée), pour que la démo reste juste quel que soit le jour où on l'ouvre.
//
//   VEHICULES, PERSONNEL, TOURNEES, TABLEAUX_TR (import CSV / Excel), appliquerTR(donnees, demo) -> { VEHICULES, PERSONNEL, notes }

// famille : semi (tracteur + semi-remorque, permis CE) · porteur (19 t, permis C) · util (3,5 t, permis B)
// [id, famille, immatriculation, modèle, km, CT (j), tachygraphe (j), prochaine vidange (km), couleur de cabine, panne]
const V = [
  ['S1', 'semi', 'DM-101-TR', 'Tracteur 44 t + semi tautliner', 412880, 142, 260, 420000, 0x1e3a8a],
  ['S2', 'semi', 'DM-102-TR', 'Tracteur 44 t + semi tautliner', 388210, 2, 410, 395000, 0x1e3a8a],
  ['S3', 'semi', 'DM-103-TR', 'Tracteur 44 t + semi frigorifique', 301540, 87, 9, 310000, 0xf1f5f9],
  ['S4', 'semi', 'DM-104-TR', 'Tracteur 44 t + semi tautliner', 455300, 201, 330, 460000, 0x1e3a8a],
  ['S5', 'semi', 'DM-105-TR', 'Tracteur 44 t + semi plateau', 411950, 64, 180, 412100, 0xb91c1c],
  ['S6', 'semi', 'DM-106-TR', 'Tracteur 44 t + semi tautliner', 268700, 230, 520, 280000, 0x1e3a8a],
  ['P1', 'porteur', 'DM-201-TR', 'Porteur 19 t, caisse et hayon', 241300, 98, 290, 250000, 0xf1f5f9],
  ['P2', 'porteur', 'DM-202-TR', 'Porteur 19 t, caisse et hayon', 186420, 55, 140, 186000, 0xf1f5f9],
  ['P3', 'porteur', 'DM-203-TR', 'Porteur 19 t, caisse et hayon', 205880, 12, 380, 215000, 0xf1f5f9],
  ['P4', 'porteur', 'DM-204-TR', 'Porteur 19 t, caisse et hayon', 174050, 176, 95, 180000, 0x1e3a8a],
  ['P5', 'porteur', 'DM-205-TR', 'Porteur 19 t, caisse et hayon', 198760, 120, 300, 205000, 0xf1f5f9, 'Embrayage à changer, pièce attendue demain'],
  ['P6', 'porteur', 'DM-206-TR', 'Porteur 19 t, caisse et hayon', 152900, 250, 470, 160000, 0x1e3a8a],
  ['P7', 'porteur', 'DM-207-TR', 'Porteur 19 t, caisse et hayon', 133400, 190, 600, 140000, 0xf1f5f9],
  ['P8', 'porteur', 'DM-208-TR', 'Porteur 19 t, caisse et hayon', 219650, 75, 230, 230000, 0xb91c1c],
  ['U1', 'util', 'DM-301-TR', 'Fourgon 3,5 t, 20 m³', 96400, 160, null, 100000, 0xf8fafc],
  ['U2', 'util', 'DM-302-TR', 'Fourgon 3,5 t, 20 m³', 118200, 41, null, 120000, 0xf8fafc],
  ['U3', 'util', 'DM-303-TR', 'Fourgon 3,5 t, 20 m³', 74300, 300, null, 80000, 0xf8fafc],
  ['U4', 'util', 'DM-304-TR', 'Fourgon 3,5 t, 12 m³', 131900, -3, null, 140000, 0xf8fafc],
  ['U5', 'util', 'DM-305-TR', 'Fourgon 3,5 t, 20 m³', 88800, 215, null, 90000, 0xf8fafc],
  ['U6', 'util', 'DM-306-TR', 'Fourgon 3,5 t, 12 m³', 52100, 330, null, 60000, 0xf8fafc],
];
export const VEHICULES = V.map(([id, famille, immat, modele, km, ct, tachy, vidange, couleur, panne]) => ({
  id, famille, immat, modele, km, ct, tachy, vidange, couleur, panne: panne || null,
  nom: { semi: 'Semi', porteur: 'Porteur', util: 'Fourgon' }[famille] + ' ' + id,
}));

// Personnel (25) : service, poste, couleur de tenue ; chauffeurs : permis, carte conducteur, FIMO/FCO, visite médicale (j)
// [id, nom, service, poste, entrée (année), contrat, permis, carte (j), FCO (j), visite (j), absent]
const P = [
  ['g1', 'Isabelle Morel', 'Direction', 'Gérante', 2009, 'CDI'],
  ['e1', 'Franck Delmas', 'Exploitation', 'Chef d\'exploitation', 2012, 'CDI'],
  ['e2', 'Céline Arnaud', 'Exploitation', 'Exploitante transport', 2018, 'CDI'],
  ['a1', 'Patricia Guillot', 'Administration', 'Assistante administrative et facturation', 2015, 'CDI'],
  ['a2', 'Olivier Brun', 'Commercial', 'Responsable commercial', 2020, 'CDI'],
  ['m1', 'Stéphane Vasseur', 'Atelier', 'Chef d\'atelier, mécanicien PL', 2011, 'CDI'],
  ['m2', 'Kevin Lemaire', 'Atelier', 'Mécanicien PL', 2021, 'CDI'],
  ['q1', 'Mickaël Barre', 'Quai', 'Chef de quai', 2014, 'CDI'],
  ['q2', 'Dylan Morin', 'Quai', 'Cariste, préparateur', 2022, 'CDI'],
  ['q3', 'Samia Ouali', 'Quai', 'Cariste, préparatrice', 2023, 'CDD'],
  ['c1', 'Bruno Lefranc', 'Conduite', 'Conducteur super-lourd', 2010, 'CDI', 'CE', 410, 520, 300],
  ['c2', 'Jérôme Castel', 'Conduite', 'Conducteur super-lourd', 2013, 'CDI', 'CE', 620, 25, 410],
  ['c3', 'Nicolas Ferrand', 'Conduite', 'Conducteur super-lourd', 2016, 'CDI', 'CE', 280, 760, 190],
  ['c4', 'Mehdi Belkacem', 'Conduite', 'Conducteur super-lourd', 2017, 'CDI', 'CE', 18, 940, 520],
  ['c5', 'Laurent Picot', 'Conduite', 'Conducteur super-lourd', 2008, 'CDI', 'CE', 830, 310, 95],
  ['c6', 'David Marchetti', 'Conduite', 'Conducteur poids lourd', 2015, 'CDI', 'C', 540, 600, 340],
  ['c7', 'Yannick Prévost', 'Conduite', 'Conducteur poids lourd', 2012, 'CDI', 'C', 370, 6, 260],
  ['c8', 'Sébastien Hoarau', 'Conduite', 'Conducteur poids lourd', 2019, 'CDI', 'C', 700, 1100, 610],
  ['c9', 'Anthony Rivière', 'Conduite', 'Conducteur poids lourd', 2020, 'CDI', 'C', 5, 980, 450],
  ['c10', 'Fabrice Gomes', 'Conduite', 'Conducteur poids lourd', 2014, 'CDI', 'C', 450, 380, 170],
  ['c11', 'Julien Masson', 'Conduite', 'Chauffeur livreur VL', 2022, 'CDI', 'B', null, null, null],
  ['c12', 'Karim Haddadi', 'Conduite', 'Conducteur poids lourd', 2018, 'CDI', 'C', 300, 820, 20],
  ['c13', 'Romain Texier', 'Conduite', 'Chauffeur livreur VL', 2024, 'CDD', 'B', null, null, null],
  ['c14', 'Thierry Navarro', 'Conduite', 'Chauffeur livreur VL', 2016, 'CDI', 'B', null, null, null, 'Arrêt maladie (jusqu\'à vendredi)'],
  ['c15', 'Christophe Bailly', 'Conduite', 'Conducteur relais, super-lourd', 2011, 'CDI', 'CE', 590, 450, 380],
];
export const PERSONNEL = P.map(([id, nom, service, poste, entree, contrat, permis, carte, fco, visite, absent]) => ({
  id, nom, service, poste, entree, contrat, chauffeur: service === 'Conduite', permis: permis || null,
  carte: carte ?? null, fco: fco ?? null, visite: visite ?? null, absent: absent || null,
}));

// Tournées du jour : [code, véhicule, chauffeur, client (fictif), type, départ (h), retour prévu (h), livraisons, km, prix HT,
//                     retard (min), retard connu à (h)]
const T = [
  ['T-01', 'S1', 'c1', 'Plateforme Logimod (fictif)', 'Lot complet', 5.5, 15, 1, 410, 980],
  ['T-02', 'S2', 'c2', 'Papeteries du Val (fictif)', 'Lot complet', 6, 16.5, 2, 520, 1150],
  ['T-03', 'S3', 'c3', 'Frais Express Distribution (fictif)', 'Frigo, lot complet', 6.25, 13.5, 1, 320, 760],
  ['T-04', 'S4', 'c4', 'Matériaux Bertin (fictif)', 'Lot complet, 3 points', 7, 18, 3, 610, 1320, 50, 11],
  ['T-05', 'S5', 'c5', 'Bois & Panneaux Leroy (fictif)', 'Plateau, lot complet', 7.5, 12.75, 1, 260, 640],
  ['T-06', 'P1', 'c6', 'Groupement des commerçants (fictif)', 'Distribution', 6.5, 14, 12, 180, 520],
  ['T-07', 'P2', 'c7', 'Boissons du Centre (fictif)', 'Distribution', 6.75, 15.25, 14, 210, 560],
  ['T-08', 'P3', 'c8', 'Jardineries Verdier (fictif)', 'Distribution', 7, 13, 10, 150, 430],
  ['T-09', 'P4', 'c9', 'Pharma Répartition Sud (fictif)', 'Distribution', 7.25, 15.5, 15, 230, 590, 40, 10.5],
  ['T-10', 'P6', 'c10', 'Électro Pro Grossiste (fictif)', 'Distribution', 8, 16, 11, 190, 500],
  ['T-11', 'U1', 'c11', 'Colis Express Ville (fictif)', 'Messagerie', 6, 11.5, 18, 140, 310],
  ['T-12', 'P5', 'c12', 'Meubles Atelier Carré (fictif)', 'Distribution', 9.5, 17, 12, 200, 540],
  ['T-13', 'U2', 'c13', 'Pièces Auto Rapid (fictif)', 'Messagerie', 7, 12.5, 20, 160, 330],
  ['T-14', 'U1', 'c11', 'Colis Express Ville (fictif)', 'Messagerie, après-midi', 13, 17.5, 14, 120, 280],
  ['T-15', 'U5', null, 'Optique & Santé Livraisons (fictif)', 'Messagerie, après-midi', 13.5, 18.5, 15, 130, 290],
  ['T-16', 'P8', 'c8', 'Jardineries Verdier (fictif)', 'Distribution, après-midi', 14, 19, 9, 140, 410],
  ['T-17', 'U2', 'c13', 'Pièces Auto Rapid (fictif)', 'Messagerie, après-midi', 14.5, 18, 12, 110, 260],
];
export const TOURNEES = T.map(([code, veh, ch, client, type, dep, ret, livr, km, prix, retard = 0, retardDes = null], i) => ({
  id: 't' + (i + 1), code, veh, ch, client, type, dep, ret, livr, km, prix, retard, retardDes, prevu: ch,
}));
// absences : la tournée T-15 devait être faite par Thierry Navarro (en arrêt)
TOURNEES.find((x) => x.code === 'T-15').prevu = 'c14';

// Atelier : véhicules à l'atelier aujourd'hui (immobilisé toute la journée, ou entretien prévu)
export const ATELIER = [
  { veh: 'P5', de: 0, a: 24, quoi: 'Immobilisé : embrayage (pièce attendue)', baie: 0 },
  { veh: 'P8', de: 5, a: 11, quoi: 'Vidange et freins (entretien prévu)', baie: 1 },
];

// ---------- « Essayez avec vos données » ----------
export const TABLEAUX_TR = [
  {
    id: 'vehicules', nom: 'Véhicules', alias: ['vehicule', 'flotte', 'parc', 'camion'], max: 60,
    colonnes: [
      { id: 'immat', nom: 'immatriculation', alias: ['immat', 'plaque', 'numero'], requis: true },
      { id: 'type', nom: 'type', alias: ['categorie', 'genre', 'famille'] },
      { id: 'km', nom: 'km', alias: ['kilometrage', 'compteur'], type: 'entier', min: 0, max: 3000000 },
      { id: 'ct', nom: 'date du CT', alias: ['ct', 'controle technique', 'prochain ct', 'date ct'], type: 'date' },
    ],
    modele: 'immatriculation;type;km;date du CT\nAB-123-CD;Semi;402100;15/03/2027\nEF-456-GH;Porteur 19 t;188700;02/12/2026\nIJ-789-KL;Fourgon 3,5 t;64200;20/06/2027\n',
  },
  {
    id: 'chauffeurs', nom: 'Chauffeurs', alias: ['chauffeur', 'conducteur', 'personnel roulant'], max: 60,
    colonnes: [
      { id: 'nom', nom: 'nom', alias: ['chauffeur', 'conducteur', 'prenom nom', 'nom prenom'], requis: true },
      { id: 'permis', nom: 'permis', alias: ['categorie', 'categorie permis'] },
      { id: 'carte', nom: 'fin carte conducteur', alias: ['carte conducteur', 'carte', 'carte tachygraphe'], type: 'date' },
      { id: 'fco', nom: 'fin FIMO/FCO', alias: ['fco', 'fimo', 'fimo fco', 'formation'], type: 'date' },
    ],
    modele: 'nom;permis;fin carte conducteur;fin FIMO/FCO\nGilles Aubert;CE;12/01/2027;30/11/2026\nNadia Ferreira;C;05/08/2027;14/02/2028\nPaulo Teixeira;B;;\n',
  },
];
const jours = (iso) => { if (!iso) return null; const a = new Date(); a.setHours(0, 0, 0, 0); return Math.round((new Date(iso + 'T00:00:00') - a) / 86400000); };
const familleDe = (s) => (/semi|tracteur|super|44/i.test(s) ? 'semi' : /porteur|19|12 ?t|pl\b/i.test(s) ? 'porteur' : /fourgon|3[,.]5|vl|util/i.test(s) ? 'util' : null);
export function appliquerTR(d, demo) {
  const notes = [], VEHICULES = demo.VEHICULES.map((v) => ({ ...v })), PERSONNEL = demo.PERSONNEL.map((p) => ({ ...p }));
  const lv = d.vehicules || [];
  if (lv.length) {
    const libres = { semi: VEHICULES.filter((v) => v.famille === 'semi'), porteur: VEHICULES.filter((v) => v.famille === 'porteur'), util: VEHICULES.filter((v) => v.famille === 'util') };
    let n = 0; const trop = [];
    for (const x of lv) {
      const f = familleDe(x.type || '') || 'porteur', cible = libres[f].shift();
      if (!cible) { trop.push(x.immat); continue; }
      Object.assign(cible, { immat: x.immat, modele: x.type || cible.modele, km: x.km ?? cible.km, ct: x.ct ? jours(x.ct) : cible.ct }); n++;
    }
    notes.push(`Véhicules : ${n} immatriculation${n > 1 ? 's' : ''} prise${n > 1 ? 's' : ''} en compte (le type choisit la place : semi, porteur ou fourgon). Les CT et les kilomètres servent aux alertes.`);
    if (trop.length) notes.push(`La maquette a 6 semis, 8 porteurs et 6 fourgons : ${trop.join(', ')} ne ${trop.length > 1 ? 'sont' : 'est'} pas dessiné${trop.length > 1 ? 's' : ''}.`);
  } else notes.push('Véhicules : pas de fichier, ceux de la démo sont gardés.');
  const lc = d.chauffeurs || [];
  if (lc.length) {
    const places = PERSONNEL.filter((p) => p.chauffeur);
    lc.slice(0, places.length).forEach((x, i) => Object.assign(places[i], { nom: x.nom, permis: x.permis || places[i].permis, carte: x.carte ? jours(x.carte) : places[i].carte, fco: x.fco ? jours(x.fco) : places[i].fco }));
    notes.push(`Chauffeurs : vos ${Math.min(lc.length, places.length)} premiers chauffeurs prennent, dans l'ordre, la place des ${places.length} de la démo, avec leurs tournées du jour.`);
    if (lc.length > places.length) notes.push(`Au-delà de ${places.length} chauffeurs, les suivants ne sont pas affichés.`);
  } else notes.push('Chauffeurs : pas de fichier, ceux de la démo sont gardés.');
  notes.push('Restent ceux de la démo : les tournées du jour, les clients, les montants et le reste du personnel.');
  return { VEHICULES, PERSONNEL, notes };
}
