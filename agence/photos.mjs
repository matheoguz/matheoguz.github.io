// Banque de vraies photos libres de droits (licence Unsplash : usage commercial gratuit,
// sans attribution obligatoire), classées par métier. Utilisées seulement quand le client
// n'a pas envoyé ses propres photos. Le champ "metier" du brief choisit la banque ;
// sinon on prend la banque du thème.
//
// Ajouter un métier : chercher sur https://unsplash.com/s/photos/<métier>?license=free,
// ne prendre que des URLs images.unsplash.com/photo-… (jamais plus.unsplash.com, payant),
// et décrire chaque photo dans "alt".

export const unsplash = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const BANQUES = {
  boulangerie: {
    hero: { id: 'photo-1568254183919-78a4f43a2877', alt: 'Pains alignés sur les étagères de la boutique' },
    about: { id: 'photo-1517686469429-8bdb88b9f907', alt: 'Pâte travaillée à la main au rouleau' },
    galerie: [
      { id: 'photo-1608198093002-ad4e005484ec', alt: 'Pain de campagne dans une corbeille en osier' },
      { id: 'photo-1555507036-ab1f4038808a', alt: 'Croissants dorés' },
      { id: 'photo-1583338917451-face2751d8d5', alt: 'Tartes aux fruits et gâteaux en vitrine' },
      { id: 'photo-1599819055803-717bba43890f', alt: 'Pain frais dans un sac en papier' },
    ],
  },
  restaurant: {
    hero: { id: 'photo-1550966871-3ed3cdb5ed0c', alt: 'La salle du restaurant' },
    about: { id: 'photo-1663530761401-15eefb544889', alt: 'Le chef dresse une assiette' },
    galerie: [{ id: 'photo-1414235077428-338989a2e8c0', alt: 'Une assiette de la maison' }],
  },
  coiffeur: {
    hero: { id: 'photo-1600948836101-f9ffda59d250', alt: "L'intérieur du salon" },
    about: { id: 'photo-1634449571010-02389ed0f9b0', alt: 'Coiffeuse en pleine coupe' },
    galerie: [{ id: 'photo-1695527081848-1e46c06e6458', alt: 'Coloration en cours' }],
  },
  plombier: {
    hero: { id: 'photo-1676210134188-4c05dd172f89', alt: 'Intervention sur un chantier' },
    about: { id: 'photo-1749532125405-70950966b0e5', alt: 'Intervention dans une salle de bain' },
    galerie: [],
  },
};

export const BANQUE_PAR_THEME = { restaurant: 'restaurant', beaute: 'coiffeur', artisan: 'plombier', commerce: null, sante: null };

export function banquePour(brief) {
  const cle = brief.metier && BANQUES[brief.metier] ? brief.metier : BANQUE_PAR_THEME[brief.theme];
  return cle ? BANQUES[cle] : null;
}
