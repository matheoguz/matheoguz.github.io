/*
  N°1 — données du classement
  ---------------------------------------------------------------
  C'est le SEUL fichier à modifier chaque semaine.

  config.edition      numéro de l'édition (augmentez-le de 1 chaque semaine)
  config.date         date du relevé, format AAAA-MM-JJ
  config.affiliateTag votre identifiant Partenaires Amazon (ex. "numeroun-21").
                      Laissez "" pour des liens Amazon normaux. S'il est rempli,
                      la mention obligatoire s'affiche automatiquement.
  config.tiktok       votre pseudo TikTok sans le @ (ex. "numeroun.fr").
                      Laissez "" pour masquer les liens TikTok.

  Pour chaque produit :
  id        identifiant court, sans espace ni accent (sert au lien direct #/p/id)
  category  une des clés de la liste "categories" ci-dessous
  verdict   "merite", "reserve" ou "surcote"
  price     une fourchette, jamais un prix exact (il change tout le temps)
  query     ce qu'on tape dans la recherche Amazon, ou laissez vide et mettez
  url       un lien Amazon direct vers la fiche produit
  image     (optionnel) chemin vers VOTRE photo, ex. "img/airtag.jpg".
            N'utilisez pas les photos d'Amazon.
*/

window.TOP1 = {
  config: {
    edition: 1,
    date: "2026-09-28",
    affiliateTag: "",
    tiktok: ""
  },

  categories: {
    "high-tech": { label: "High-tech",    icon: "tag" },
    "cuisine":   { label: "Cuisine",      icon: "pot" },
    "beaute":    { label: "Beauté",       icon: "jar" },
    "gaming":    { label: "Jeux vidéo",   icon: "pad" },
    "jeux":      { label: "Jeux & jouets", icon: "cards" },
    "maison":    { label: "Maison",       icon: "battery" },
    "sport":     { label: "Sport",        icon: "bottle" },
    "hygiene":   { label: "Hygiène",      icon: "brush" }
  },

  products: [
    {
      id: "airtag",
      category: "high-tech",
      brand: "Apple",
      name: "AirTag",
      price: "Moins de 40 €",
      verdict: "merite",
      headline: "Le plus petit objet Apple est aussi le plus utile.",
      why: "Il s'appuie sur le réseau Localiser : tous les iPhone qui passent à proximité signalent sa position, sans que personne ne s'en rende compte. Résultat, il retrouve des clés, un sac ou une valise bien au-delà de la portée Bluetooth.",
      forWho: "Tous ceux qui ont un iPhone et qui perdent leurs clés, leur sac ou leurs bagages en voyage.",
      catch: "Inutile avec un téléphone Android. Et il n'a pas de trou : il faut acheter un porte-clés ou un étui à part.",
      alternative: "Sous Android, un traqueur compatible avec le réseau Localiser de Google fait le même travail.",
      query: "Apple AirTag",
      url: "",
      image: ""
    },
    {
      id: "ninja-dual-zone",
      category: "cuisine",
      brand: "Ninja",
      name: "Foodi Dual Zone AF300EU",
      price: "100 – 200 €",
      verdict: "merite",
      headline: "Deux paniers, un seul repas prêt en même temps.",
      why: "Ses deux tiroirs indépendants cuisent deux aliments différents, chacun avec sa température et son temps, et la fonction Sync les fait terminer ensemble. C'est ce détail qui l'a imposée dans les cuisines familiales.",
      forWho: "Les familles et ceux qui veulent remplacer le four pour les repas du quotidien.",
      catch: "Elle est large et prend une vraie place sur le plan de travail. Mesurez avant de commander.",
      alternative: "Pour une ou deux personnes, une friteuse sans huile à un seul panier (Cosori, par exemple) coûte moins cher et prend moins de place.",
      query: "Ninja Foodi Dual Zone AF300EU",
      url: "",
      image: ""
    },
    {
      id: "cerave-creme",
      category: "beaute",
      brand: "CeraVe",
      name: "Crème Hydratante",
      price: "Moins de 20 €",
      verdict: "merite",
      headline: "Le pot que les dermatologues citent avant les marques de luxe.",
      why: "Céramides, acide hyaluronique, sans parfum : une formule simple qui répare la barrière de la peau. Le grand pot dure des mois, pour le prix d'une crème ordinaire.",
      forWho: "Peaux sèches à normales, visage et corps, et les peaux qui réagissent aux parfums.",
      catch: "La texture est riche. Sur une peau grasse, elle peut paraître lourde en journée.",
      alternative: "Pour une peau mixte ou grasse, la Lotion Hydratante de la même marque est plus légère.",
      query: "CeraVe Crème Hydratante",
      url: "",
      image: ""
    },
    {
      id: "dualsense",
      category: "gaming",
      brand: "Sony",
      name: "Manette sans fil DualSense",
      price: "50 – 80 €",
      verdict: "reserve",
      headline: "Indispensable, mais pas irréprochable.",
      why: "Chaque PS5 n'en livre qu'une : dès qu'on joue à deux, il faut l'acheter. Retour haptique et gâchettes adaptatives, rien d'équivalent chez les manettes tierces.",
      forWho: "Tous les joueurs PS5 qui veulent jouer à deux, ou remplacer une manette fatiguée.",
      catch: "L'autonomie est courte par rapport à la concurrence, et des cas de joystick qui dérive sont régulièrement signalés.",
      alternative: "Une DualSense reconditionnée par un vendeur sérieux, avec garantie, pour payer moins cher.",
      query: "Manette DualSense PS5",
      url: "",
      image: ""
    },
    {
      id: "uno",
      category: "jeux",
      brand: "Mattel",
      name: "UNO",
      price: "Moins de 15 €",
      verdict: "merite",
      headline: "Cinquante ans plus tard, toujours sur la table.",
      why: "Règles comprises en une minute, de 2 à 10 joueurs, dès 7 ans. Il se glisse dans une poche et fonctionne aussi bien en famille qu'entre amis.",
      forWho: "Les soirées, les vacances, les enfants et les grands-parents autour de la même table.",
      catch: "Avec les règles maison qu'ajoute chaque famille, une partie peut ne jamais finir.",
      alternative: "Dobble, encore plus rapide et jouable dès 6 ans.",
      query: "UNO Mattel jeu de cartes",
      url: "",
      image: ""
    },
    {
      id: "duracell-aa",
      category: "maison",
      brand: "Duracell",
      name: "Piles Plus AA",
      price: "Moins de 20 €",
      verdict: "reserve",
      headline: "La valeur sûre du tiroir, pas toujours le bon calcul.",
      why: "Une marque en laquelle on a confiance, des piles qui se conservent longtemps dans un tiroir. Pour une télécommande ou une horloge, c'est parfait.",
      forWho: "Les appareils qui consomment peu : télécommandes, horloges, détecteurs.",
      catch: "Pour une manette ou un jouet qui les vide chaque semaine, les jetables finissent par coûter cher.",
      alternative: "Des piles rechargeables Panasonic Eneloop et un chargeur : plus cher au départ, rentabilisé en quelques mois.",
      query: "Piles Duracell Plus AA",
      url: "",
      image: ""
    },
    {
      id: "stanley-quencher",
      category: "sport",
      brand: "Stanley",
      name: "Quencher H2.0 1,18 L",
      price: "40 – 60 €",
      verdict: "surcote",
      headline: "Numéro un grâce à TikTok. Pas grâce à la gourde.",
      why: "Elle garde la boisson froide des heures, sa poignée est pratique et sa base rentre dans un porte-gobelet de voiture. Mais c'est surtout l'effet de mode qui la porte en tête.",
      forWho: "Ceux qui boivent beaucoup au bureau ou en voiture et veulent un objet qui se remarque.",
      catch: "Elle n'est pas étanche avec la paille : impossible de la mettre dans un sac. Elle est lourde, et chère pour une gourde.",
      alternative: "Une gourde isotherme en inox avec un bouchon vissé : étanche, plus légère, deux fois moins chère.",
      query: "Stanley Quencher H2.0 1,18 L",
      url: "",
      image: ""
    },
    {
      id: "oral-b-pro3",
      category: "hygiene",
      brand: "Oral-B",
      name: "Pro 3 3000",
      price: "Moins de 70 €",
      verdict: "merite",
      headline: "Ce qu'une brosse électrique doit faire, rien de plus.",
      why: "Un capteur de pression visible qui s'allume quand on frotte trop fort, un minuteur de deux minutes, une tête ronde efficace. L'essentiel d'une brosse haut de gamme, sans l'application inutile.",
      forWho: "Ceux qui passent de la brosse manuelle à l'électrique pour la première fois.",
      catch: "Plus bruyante qu'une brosse sonique, et les brossettes de rechange s'additionnent sur l'année.",
      alternative: "Une brosse sonique d'entrée de gamme (Philips Sonicare), plus silencieuse.",
      query: "Oral-B Pro 3 3000",
      url: "",
      image: ""
    }
  ]
};
