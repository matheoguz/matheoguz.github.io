// « Essayez avec vos données » pour la démo supermarché : tableaux attendus (Rayons, Équipe, Caisses),
// modèles CSV (remplis avec un exemple fictif) et adaptation à la maquette 3D (6 rayons, 8 caisses au plus).
//   appliquerGS(donnees, { EQUIPE, RAYONS, NB_CAISSES }) -> { EQUIPE, RAYONS, NB_CAISSES, notes }

import { sans } from '../import.js';

export const TABLEAUX_GS = [
  {
    id: 'rayons', nom: 'Rayons', alias: ['rayon', 'stock'], max: 30,
    colonnes: [
      { id: 'nom', nom: 'nom', alias: ['rayon', 'nom du rayon', 'libelle', 'famille'], requis: true },
      { id: 'stock', nom: 'stock %', alias: ['stock', 'taux de stock', 'remplissage', 'niveau de stock'], type: 'pct', requis: true },
      { id: 'refs', nom: 'références', alias: ['references', 'refs', 'nb references', 'nombre de references', 'produits', 'articles'], type: 'entier', min: 0 },
      { id: 'ruptures', nom: 'ruptures', alias: ['rupture', 'nb ruptures', 'nombre de ruptures'], type: 'entier', min: 0 },
    ],
    modele: 'nom;stock %;références;ruptures\nPrimeur;78 %;290;3\nCrèmerie et fromages;84 %;640;2\nLiquides;66 %;540;7\nSurgelés;72 %;410;4\nDroguerie;91 %;760;1\nBazar et textile;88 %;980;0\n',
  },
  {
    id: 'equipe', nom: 'Équipe', alias: ['equipe', 'personnel', 'planning', 'salaries'], max: 60,
    colonnes: [
      { id: 'nom', nom: 'nom', alias: ['prenom nom', 'nom prenom', 'nom et prenom', 'salarie', 'employe', 'personne', 'collaborateur'], requis: true },
      { id: 'poste', nom: 'poste', alias: ['fonction', 'emploi', 'metier', 'intitule'], requis: true },
      { id: 'service', nom: 'service', alias: ['rayon', 'zone', 'secteur', 'departement', 'affectation'] },
      { id: 'debut', nom: 'début', alias: ['debut', 'heure de debut', 'arrivee', 'prise de service', 'de'], type: 'heure', requis: true },
      { id: 'fin', nom: 'fin', alias: ['heure de fin', 'depart', 'fin de service', 'a'], type: 'heure', requis: true },
      { id: 'pause', nom: 'pause', alias: ['debut de pause', 'heure de pause', 'pause dejeuner'], type: 'heure' },
      { id: 'taux', nom: 'taux horaire', alias: ['taux', 'salaire horaire', 'taux horaire brut', '€/h', 'eur h'], type: 'euros', min: 0, max: 500 },
    ],
    verifier: (o) => (o.debut !== undefined && o.fin !== undefined && o.fin <= o.debut ? 'la fin doit être après le début.' : o.pause !== undefined && o.debut !== undefined && o.fin !== undefined && (o.pause < o.debut || o.pause > o.fin - 0.5) ? 'la pause doit tomber pendant le service.' : ''),
    modele: 'nom;poste;service;début;fin;pause;taux horaire\n'
      + 'Bruno Lemaire;Directeur du magasin;Direction;8:00;18:00;;27,50\n'
      + 'Nadia Ferhat;Responsable RH;RH;9:00;17:00;12:30;21,00\n'
      + 'Paul Vidal;Comptable;Comptabilité;8:30;16:30;12:00;19,00\n'
      + 'Lucie Garnier;Cheffe de rayon frais;Surgelés;6:00;14:00;10:00;17,50\n'
      + 'Karim Saadi;Employé libre-service;Primeur;6:00;13:00;9:30;12,20\n'
      + 'Élodie Masson;Employée libre-service;Liquides;12:00;20:00;16:00;12,20\n'
      + 'Hugo Barre;Employé libre-service;Crèmerie et fromages;8:00;15:00;11:30;12,20\n'
      + 'Zoé Perrin;Employée libre-service;Droguerie;13:00;20:00;16:30;12,20\n'
      + 'Marc Olivier;Réceptionnaire;Réserve;6:00;13:00;9:30;13,00\n'
      + 'Sami Benali;Réceptionnaire;Réserve;12:00;19:00;15:30;13,00\n'
      + 'Julie Caron;Hôtesse d\'accueil;Accueil;8:30;16:00;12:00;12,40\n'
      + 'Théo Lambert;Hôte d\'accueil;Accueil;13:00;20:00;16:30;12,40\n'
      + 'Camille Robin;Hôtesse de caisse;Caisses;8:30;14:00;;11,90\n'
      + 'Yanis Morel;Hôte de caisse;Caisses;8:30;13:00;;11,90\n'
      + 'Inès Royer;Hôtesse de caisse;Caisses;10:00;17:00;;11,90\n'
      + 'Lucas Fabre;Hôte de caisse;Caisses;12:00;20:00;;11,90\n'
      + 'Manon Leroy;Hôtesse de caisse;Caisses;14:00;20:00;;11,90\n'
      + 'Adam Giraud;Hôte de caisse;Caisses;16:00;20:00;;11,90\n',
  },
  {
    id: 'caisses', nom: 'Caisses', alias: ['caisse'], max: 1,
    colonnes: [{ id: 'nombre', nom: 'nombre', alias: ['nombre de caisses', 'caisses', 'nb caisses', 'nb de caisses'], type: 'entier', requis: true, min: 1, max: 99 }],
    modele: 'nombre\n6\n',
  },
];

const ORDRE = ['bureau', 'etage-rh', 'etage-compta', 'accueil', 'reserve'];
function zoneDe(o, rayons) {
  const s = sans(o.service), p = sans(o.poste), sp = `${s} ${p}`;
  if (/caisse/.test(s) || (!s && /caisse/.test(p))) return 'caisse';
  if (s) {
    let k = rayons.findIndex((r) => sans(r.nom) === s);
    if (k < 0) k = rayons.findIndex((r) => s.length > 3 && (sans(r.nom).includes(s) || s.includes(sans(r.nom))));
    if (k >= 0) return 'r' + k;
  }
  if (/reserve|quai|recept|logisti|entrepot/.test(sp)) return 'reserve';
  if (/accueil|service client/.test(sp)) return 'accueil';
  if (/\brh\b|ressources humaines|personnel/.test(sp)) return 'etage-rh';
  if (/compta|paie|administrati/.test(sp)) return 'etage-compta';
  if (/direct|gerant|bureau/.test(sp)) return 'bureau';
  if (/caisse/.test(p)) return 'caisse';
  return null;
}

export function appliquerGS(d, demo) {
  const notes = [], N = demo.RAYONS.length;
  const RAYONS = demo.RAYONS.map((r) => ({ ...r }));
  const R = d.rayons || [];
  if (R.length) {
    R.slice(0, N).forEach((x, i) => Object.assign(RAYONS[i], { nom: x.nom, stock: x.stock, refs: x.refs ?? RAYONS[i].refs, ruptures: x.ruptures ?? RAYONS[i].ruptures }));
    notes.push(`Rayons : vos ${Math.min(R.length, N)} premiers rayons prennent la place des ${N} rayons de la maquette, dans l'ordre (noms, stocks, références, ruptures).`);
    if (R.length > N) notes.push(`La maquette dessine ${N} rayons : ${R.slice(N).map((x) => x.nom).join(', ')} ne ${R.length - N > 1 ? 'sont' : 'est'} pas affiché${R.length - N > 1 ? 's' : ''}.`);
    if (R.length < N) notes.push(`Vous avez ${R.length} rayon${R.length > 1 ? 's' : ''} : les ${N - R.length} suivant${N - R.length > 1 ? 's' : ''} gardent ceux de la démo (${demo.RAYONS.slice(R.length).map((r) => r.nom).join(', ')}).`);
    if (R.some((x) => x.refs === undefined || x.ruptures === undefined)) notes.push('Références ou ruptures manquantes sur certains rayons : les chiffres de la démo sont gardés pour ces cases.');
  } else notes.push('Rayons : pas de fichier, ceux de la démo sont gardés.');

  let NB = demo.NB_CAISSES;
  const n = d.caisses?.[0]?.nombre;
  if (n) { NB = Math.min(demo.NB_CAISSES, n); notes.push(n > demo.NB_CAISSES ? `Caisses : vous en avez ${n}, la maquette en dessine ${demo.NB_CAISSES} ; les caisses ouvertes sont limitées à ${demo.NB_CAISSES}.` : `Caisses : ${n} caisse${n > 1 ? 's' : ''} dessinée${n > 1 ? 's' : ''} sur la maquette.`); }
  else notes.push(`Caisses : pas de fichier, ${NB} caisses comme dans la démo.`);

  let EQUIPE = demo.EQUIPE;
  const E = d.equipe || [];
  if (E.length) {
    const inconnus = [], occ = Array.from({ length: NB }, () => []);
    EQUIPE = E.map((o, i) => {
      let z = zoneDe(o, RAYONS);
      if (z && /^r\d+$/.test(z) && +z.slice(1) >= N) z = null;
      if (!z) { inconnus.push(o.nom); z = 'r' + (i % N); }
      if (z === 'caisse') {
        // la première caisse libre sur ses horaires, sinon la moins chargée
        let k = occ.findIndex((l) => !l.some(([a, b]) => a < o.fin && o.debut < b));
        if (k < 0) k = occ.map((l, j) => [l.length, j]).sort((a, b) => a[0] - b[0])[0][1];
        occ[k].push([o.debut, o.fin]); z = 'c' + k + (occ[k].length > 1 ? 'b'.repeat(occ[k].length - 1) : '');
      }
      return { id: 'e' + i, nom: o.nom, poste: o.poste, debut: o.debut, fin: o.fin, cout: o.taux !== undefined ? Math.round(o.taux * 1.35 * 100) / 100 : 16, zone: z, pause: o.pause, importe: true };
    });
    const nbz = (f) => EQUIPE.filter(f).length;
    notes.push(`Équipe : ${EQUIPE.length} personne${EQUIPE.length > 1 ? 's' : ''} (${nbz((e) => /^c\d/.test(e.zone))} en caisse, ${nbz((e) => /^r\d/.test(e.zone))} en rayon, ${nbz((e) => e.zone === 'reserve')} en réserve, ${nbz((e) => e.zone === 'accueil')} à l'accueil, ${nbz((e) => ORDRE.slice(0, 3).includes(e.zone))} dans les bureaux). Planning, présences, pauses, coût du jour et RH sont recalculés avec elle.`);
    if (inconnus.length) notes.push(`Service non reconnu pour ${inconnus.join(', ')} : placé${inconnus.length > 1 ? 's' : ''} en rayon. Indiquez un service (Caisses, Accueil, Réserve, Direction, RH, Comptabilité ou le nom d'un rayon).`);
    if (E.some((o) => o.taux === undefined)) notes.push('Taux horaire manquant pour certaines personnes : le coût fictif de la démo est utilisé.');
    if (!E.some((o) => o.taux === undefined)) notes.push('Coût de l\'équipe : taux horaire × 1,35 (charges patronales estimées à 35 %, une hypothèse de la démo).');
    if (!nbz((e) => /^c\d/.test(e.zone))) notes.push('Personne en caisse dans votre fichier : les caisses resteront fermées.');
    if (E.length > NB * 3 && nbz((e) => /^c\d/.test(e.zone)) > NB * 2) notes.push(`Plus de ${NB * 2} personnes en caisse pour ${NB} caisses : certaines partagent une caisse à des horaires qui se chevauchent.`);
  } else notes.push('Équipe : pas de fichier, celle de la démo est gardée.');
  notes.push('Restent simulés : clients, affluence, chiffre d\'affaires, livraisons et fournisseurs, recrutement.');
  return { EQUIPE, RAYONS, NB_CAISSES: NB, notes };
}
