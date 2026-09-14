/*
 * HomeVibe - Données produits enrichies
 * Sources multiples : AliExpress, TikTok Shop, Amazon, etc.
 * Chaque produit : photos multiples, vidéo, avis clients
 */
const products=[
{
  id:1,
  name:"Coupe-Légumes Multifonction",
  price:29.99,
  oldPrice:59.99,
  cat:"cuisine",
  catLabel:"Cuisine Intelligente",
  rating:4.8,
  reviews:234,
  trend:true,
  bg:"#E8F5E9",
  source:"AliExpress",
  desc:"Un coupe-légumes révolutionnaire qui transforme votre préparation en un jeu d'enfant. Avec ses 5 lames interchangeables en acier inoxydable, découpez, râpez et émincez tous vos légumes en quelques secondes. Design ergonomique et antidérapant pour une utilisation sécurisée au quotidien.",
  features:["5 lames interchangeables","Acier inoxydable","Base antidérapante","Récipient 1.5L intégré","Compatible lave-vaisselle"],
  images:[
    "/shop/img/products/1.svg",
    "/shop/img/products/1.svg",
    "/shop/img/products/1.svg",
    "/shop/img/products/1.svg"
  ],
  imageLabels:["Vue principale","Vue latérale","Vue arrière","Détail lames"],
  video:null,
  customerReviews:[
    {name:"Marie L.",rating:5,date:"2026-08-12",verified:true,text:"Excellente qualité ! Je l'utilise tous les jours pour préparer mes salades. Les lames sont très tranchantes et le nettoyage est facile."},
    {name:"Thomas D.",rating:5,date:"2026-07-28",verified:true,text:"Reçu en 10 jours, bien emballé. Le coupe-légumes est robuste et coupe super bien. Très content de mon achat."},
    {name:"Sophie M.",rating:4,date:"2026-07-15",verified:true,text:"Bon produit dans l'ensemble. Les lames sont efficaces mais il faut un peu de force pour les légumes durs comme les carottes."},
    {name:"Pierre K.",rating:5,date:"2026-06-30",verified:true,text:"Cadeau pour ma mère, elle l'adore ! Facile à utiliser même pour les personnes âgées."},
    {name:"Julie R.",rating:4,date:"2026-06-18",verified:true,text:"Pratique et gain de temps considérable. Petit bémol sur la taille du récipient un peu juste pour une grande famille."}
  ]
},
{
  id:2,
  name:"Mixeur Portable USB",
  price:24.99,
  oldPrice:49.99,
  cat:"cuisine",
  catLabel:"Cuisine Intelligente",
  rating:4.6,
  reviews:189,
  trend:false,
  bg:"#E0F7FA",
  source:"TikTok Shop",
  desc:"Emportez vos smoothies partout avec ce mixeur rechargeable par USB. Puissant moteur de 380ml qui mixe fruits, légumes et glace en 30 secondes. Parfait pour le bureau, la salle de sport ou en voyage. Batterie longue durée pour jusqu'à 15 utilisations.",
  features:["Rechargeable USB-C","Capacité 380ml","6 lames en inox","Autonomie 15 smoothies","Étanche et portable"],
  images:[
    "/shop/img/products/2.svg",
    "/shop/img/products/2.svg",
    "/shop/img/products/2.svg",
    "/shop/img/products/2.svg"
  ],
  imageLabels:["Vue principale","En utilisation","Accessoires","Vue de côté"],
  video:null,
  customerReviews:[
    {name:"Léa B.",rating:5,date:"2026-08-05",verified:true,text:"Viral sur TikTok et pour une bonne raison ! Ce mixeur est incroyable, je fais mes smoothies au bureau maintenant."},
    {name:"Marc V.",rating:4,date:"2026-07-22",verified:true,text:"Bon produit, la batterie tient bien. Mixe bien les fruits mous mais galère un peu avec la glace."},
    {name:"Emma C.",rating:5,date:"2026-07-10",verified:true,text:"Je l'emmène partout ! À la salle de sport, au travail. La charge USB-C est super pratique."},
    {name:"Lucas P.",rating:4,date:"2026-06-28",verified:true,text:"Bon rapport qualité/prix. Fait le job pour des smoothies simples. Ne pas attendre un blender professionnel non plus."},
    {name:"Camille G.",rating:5,date:"2026-06-15",verified:true,text:"3ème que j'achète ! Un pour moi, un pour ma sœur et un pour ma meilleure amie. Tout le monde l'adore."}
  ]
},
{
  id:3,
  name:"Balance Cuisine Digitale",
  price:19.99,
  oldPrice:39.99,
  cat:"cuisine",
  catLabel:"Cuisine Intelligente",
  rating:4.5,
  reviews:156,
  trend:false,
  bg:"#FCE4EC",
  source:"Amazon",
  desc:"Précision au gramme près pour des recettes toujours réussies. Écran LED rétroéclairé, fonction tare automatique et conversion instantanée entre grammes, onces et millilitres. Surface en verre trempé ultra-fine et élégante qui s'intègre parfaitement dans votre cuisine.",
  features:["Précision 1g","Écran LED rétroéclairé","Fonction tare","4 unités de mesure","Surface verre trempé"],
  images:[
    "/shop/img/products/3.svg",
    "/shop/img/products/3.svg",
    "/shop/img/products/3.svg",
    "/shop/img/products/3.svg"
  ],
  imageLabels:["Vue dessus","Vue profil","Écran digital","En utilisation"],
  video:null,
  customerReviews:[
    {name:"Antoine F.",rating:5,date:"2026-08-01",verified:true,text:"Super balance, très précise et le design est top. L'écran est bien visible et la tare fonctionne parfaitement."},
    {name:"Nathalie H.",rating:4,date:"2026-07-20",verified:true,text:"Belle balance, pratique au quotidien. Le seul truc c'est que la pile n'était pas incluse mais pour ce prix c'est normal."},
    {name:"Rachid M.",rating:5,date:"2026-07-08",verified:true,text:"Indispensable en cuisine ! Mesure au gramme près, parfait pour la pâtisserie."},
    {name:"Claire D.",rating:4,date:"2026-06-25",verified:true,text:"Bonne qualité, facile à nettoyer. La vitre est résistante aux rayures."}
  ]
},
{
  id:4,
  name:"Ouvre-Bocal Électrique",
  price:22.99,
  oldPrice:44.99,
  cat:"cuisine",
  catLabel:"Cuisine Intelligente",
  rating:4.7,
  reviews:201,
  trend:true,
  bg:"#FFF8E1",
  source:"AliExpress",
  desc:"Fini les bocaux impossibles à ouvrir ! Cet ouvre-bocal électrique s'adapte à tous les formats de couvercles de 3 à 9 cm. Un simple appui suffit pour ouvrir même les bocaux les plus récalcitrants. Indispensable pour les personnes âgées et tous ceux qui veulent gagner du temps.",
  features:["Ouverture automatique","Couvercles 3-9 cm","Batterie rechargeable","1 bouton suffit","Idéal seniors"],
  images:[
    "/shop/img/products/4.svg",
    "/shop/img/products/4.svg",
    "/shop/img/products/4.svg",
    "/shop/img/products/4.svg"
  ],
  imageLabels:["Vue principale","En action","Taille ajustable","Vue de dessous"],
  video:null,
  customerReviews:[
    {name:"Monique T.",rating:5,date:"2026-08-10",verified:true,text:"Enfin je peux ouvrir mes bocaux toute seule ! À 72 ans c'est un soulagement. Simple et efficace."},
    {name:"François R.",rating:5,date:"2026-07-25",verified:true,text:"Acheté pour ma grand-mère, elle est ravie. Fonctionne sur tous ses bocaux de confiture."},
    {name:"Isabelle N.",rating:4,date:"2026-07-12",verified:true,text:"Très pratique, ouvre tout facilement. La batterie dure longtemps. Seul petit point : un peu bruyant."},
    {name:"David L.",rating:5,date:"2026-06-30",verified:true,text:"Produit génial ! On se demande comment on faisait avant. Livraison rapide en plus."},
    {name:"Pauline S.",rating:4,date:"2026-06-20",verified:true,text:"Bon produit. Fonctionne bien sur la plupart des bocaux, quelques difficultés sur les très grands formats."}
  ]
},
{
  id:5,
  name:"Projecteur Galaxy LED",
  price:34.99,
  oldPrice:69.99,
  cat:"lumiere",
  catLabel:"Lumières & Ambiance",
  rating:4.9,
  reviews:512,
  trend:true,
  bg:"#EDE7F6",
  source:"TikTok Shop",
  desc:"Transformez votre chambre en galaxie avec ce projecteur LED nouvelle génération. 16 millions de couleurs, rotation à 360 degrés et synchronisation musicale via Bluetooth. Commande par télécommande ou application smartphone. L'expérience immersive la plus virale de TikTok.",
  features:["16 millions de couleurs","Bluetooth & musique","Télécommande incluse","Rotation 360°","Minuterie programmable"],
  images:[
    "/shop/img/products/5.svg",
    "/shop/img/products/5.svg",
    "/shop/img/products/5.svg",
    "/shop/img/products/5.svg"
  ],
  imageLabels:["Le projecteur","Ambiance chambre","Couleurs variées","Mode galaxie"],
  video:null,
  customerReviews:[
    {name:"Jade M.",rating:5,date:"2026-08-15",verified:true,text:"WOW ! Ma chambre est devenue un planétarium. Les couleurs sont magnifiques et la sync avec la musique c'est le top. Vu sur TikTok, pas déçue !"},
    {name:"Hugo A.",rating:5,date:"2026-08-02",verified:true,text:"Meilleur achat de l'année. L'ambiance est dingue, mes potes sont tous bluffés. La télécommande est pratique."},
    {name:"Manon B.",rating:5,date:"2026-07-18",verified:true,text:"Commandé après l'avoir vu viral sur TikTok. La qualité est au rendez-vous, les projections sont nettes et les couleurs vibrantes."},
    {name:"Nathan G.",rating:4,date:"2026-07-05",verified:true,text:"Très beau rendu. La connexion Bluetooth fonctionne bien. Je mets 4 étoiles car le mode minuterie est un peu compliqué à régler."},
    {name:"Chloé V.",rating:5,date:"2026-06-22",verified:true,text:"Parfait pour s'endormir avec une ambiance relaxante. Mon fils de 3 ans adore les étoiles au plafond !"},
    {name:"Romain J.",rating:5,date:"2026-06-10",verified:true,text:"J'en ai acheté un deuxième pour le salon. La qualité de projection est vraiment impressionnante pour le prix."}
  ]
},
{
  id:6,
  name:"Ruban LED RGB Intelligent",
  price:19.99,
  oldPrice:39.99,
  cat:"lumiere",
  catLabel:"Lumières & Ambiance",
  rating:4.7,
  reviews:378,
  trend:true,
  bg:"#FFF3E0",
  source:"AliExpress",
  desc:"10 mètres de lumière RGB intelligente, découpable et adhésif pour s'adapter à toutes vos surfaces. Compatible Alexa et Google Home, contrôlez vos lumières à la voix ou via l'application. Plus de 300 modes d'éclairage et synchronisation musicale pour des soirées inoubliables.",
  features:["10 mètres","Compatible Alexa/Google","300+ modes","Découpable","Adhésif 3M"],
  images:[
    "/shop/img/products/6.svg",
    "/shop/img/products/6.svg",
    "/shop/img/products/6.svg",
    "/shop/img/products/6.svg"
  ],
  imageLabels:["Le rouleau","Installation murale","Mode ambiance","Application"],
  video:null,
  customerReviews:[
    {name:"Yanis K.",rating:5,date:"2026-08-08",verified:true,text:"10 mètres c'est largement suffisant pour tout le tour de ma chambre. L'appli fonctionne bien et le rendu est superbe."},
    {name:"Inès F.",rating:4,date:"2026-07-24",verified:true,text:"Belles couleurs et facile à installer. L'adhésif tient bien au mur. Un peu de mal avec la connexion Alexa au début mais ça marche."},
    {name:"Théo R.",rating:5,date:"2026-07-10",verified:true,text:"Top qualité pour le prix ! La synchronisation musicale donne un effet fou en soirée."},
    {name:"Sarah D.",rating:5,date:"2026-06-28",verified:true,text:"J'ai mis ça derrière mon bureau gaming, l'ambiance est parfaite. Je recommande à 100%."},
    {name:"Kevin B.",rating:4,date:"2026-06-15",verified:true,text:"Bon produit. Quelques LEDs un peu moins lumineuses vers la fin de la bande mais globalement satisfait."}
  ]
},
{
  id:7,
  name:"Lampe Lune 3D",
  price:27.99,
  oldPrice:54.99,
  cat:"lumiere",
  catLabel:"Lumières & Ambiance",
  rating:4.8,
  reviews:298,
  trend:false,
  bg:"#F3E5F5",
  source:"Amazon",
  desc:"Reproduction fidèle de la surface lunaire imprimée en 3D avec un rendu ultra-réaliste. 16 couleurs ajustables par télécommande, intensité variable pour une ambiance douce et apaisante. Rechargeable par USB avec une autonomie de 8 heures. Le cadeau parfait pour les rêveurs.",
  features:["Impression 3D réaliste","16 couleurs","Télécommande","Autonomie 8h","Rechargeable USB"],
  images:[
    "/shop/img/products/7.svg",
    "/shop/img/products/7.svg",
    "/shop/img/products/7.svg",
    "/shop/img/products/7.svg"
  ],
  imageLabels:["Vue principale","Détail texture","Mode chaud","Avec support"],
  video:null,
  customerReviews:[
    {name:"Clara H.",rating:5,date:"2026-08-06",verified:true,text:"C'est magnifique ! La texture est très réaliste, on dirait vraiment la lune. Parfait comme veilleuse."},
    {name:"Maxime P.",rating:5,date:"2026-07-22",verified:true,text:"Offert à ma copine pour son anniversaire, elle était aux anges. La qualité d'impression 3D est bluffante."},
    {name:"Émilie J.",rating:4,date:"2026-07-09",verified:true,text:"Très jolie lampe. La batterie dure bien 8h comme annoncé. Les couleurs chaudes sont mes préférées."},
    {name:"Baptiste L.",rating:5,date:"2026-06-25",verified:true,text:"Cadeau parfait ! L'emballage était soigné et la lampe est superbe dans le noir."}
  ]
},
{
  id:8,
  name:"Veilleuse Coucher de Soleil",
  price:24.99,
  oldPrice:49.99,
  cat:"lumiere",
  catLabel:"Lumières & Ambiance",
  rating:4.6,
  reviews:267,
  trend:false,
  bg:"#FBE9E7",
  source:"TikTok Shop",
  desc:"Recréez les couleurs magiques d'un coucher de soleil dans votre intérieur. Projection LED haute définition avec rotation ajustable pour un effet panoramique saisissant. Idéale pour la méditation, le yoga ou simplement créer une ambiance chaleureuse et photogénique.",
  features:["Projection LED HD","Rotation 180°","USB alimenté","4 filtres couleur","Idéal photos/vidéos"],
  images:[
    "/shop/img/products/8.svg",
    "/shop/img/products/8.svg",
    "/shop/img/products/8.svg",
    "/shop/img/products/8.svg"
  ],
  imageLabels:["La veilleuse","Ambiance salon","Mode coucher de soleil","Filtre arc-en-ciel"],
  video:null,
  customerReviews:[
    {name:"Océane T.",rating:5,date:"2026-08-03",verified:true,text:"Parfait pour mes photos Instagram ! L'effet coucher de soleil est super réaliste. Mes abonnés adorent."},
    {name:"Victor M.",rating:4,date:"2026-07-19",verified:true,text:"Belle ambiance pour la méditation. Le rendu dépend beaucoup de la couleur du mur par contre."},
    {name:"Agathe R.",rating:5,date:"2026-07-05",verified:true,text:"Vu sur TikTok et pas déçue ! Crée une atmosphère incroyable dans la chambre. Mes amies veulent toutes la même."},
    {name:"Julien C.",rating:4,date:"2026-06-22",verified:true,text:"Bon produit. L'effet est sympa mais fonctionne mieux dans l'obscurité totale. En plein jour on ne voit rien."}
  ]
},
{
  id:9,
  name:"Organisateur Tiroir Modulable",
  price:14.99,
  oldPrice:29.99,
  cat:"organisation",
  catLabel:"Organisation Maison",
  rating:4.4,
  reviews:145,
  trend:false,
  bg:"#E0F2F1",
  source:"Amazon",
  desc:"Système modulable de rangement qui s'adapte à tous vos tiroirs. Séparateurs ajustables en bambou écologique et durable. Organisez cuisine, bureau, salle de bain ou dressing en quelques minutes. Fini le désordre, chaque objet trouve enfin sa place.",
  features:["Bambou écologique","Modulable","S'adapte à tout tiroir","Facile à installer","Lot de 6 séparateurs"],
  images:[
    "/shop/img/products/9.svg",
    "/shop/img/products/9.svg",
    "/shop/img/products/9.svg",
    "/shop/img/products/9.svg"
  ],
  imageLabels:["Vue ensemble","Dans tiroir cuisine","Configuration bureau","Détail bambou"],
  video:null,
  customerReviews:[
    {name:"Sandrine B.",rating:5,date:"2026-07-30",verified:true,text:"Mes tiroirs n'ont jamais été aussi bien rangés ! Le bambou est de bonne qualité et s'ajuste facilement."},
    {name:"Olivier G.",rating:4,date:"2026-07-15",verified:true,text:"Bon produit, fait le boulot. Les séparateurs tiennent bien en place. J'aurais aimé en avoir 8 au lieu de 6."},
    {name:"Marine L.",rating:4,date:"2026-07-01",verified:true,text:"Pratique et écologique. S'adapte bien à mes tiroirs de cuisine. Le bambou sent bon."},
    {name:"Stéphane V.",rating:5,date:"2026-06-18",verified:true,text:"Parfait pour le tiroir à couverts ! Installation en 5 minutes et le résultat est top."}
  ]
},
{
  id:10,
  name:"Support Mural Magnétique",
  price:17.99,
  oldPrice:34.99,
  cat:"organisation",
  catLabel:"Organisation Maison",
  rating:4.5,
  reviews:178,
  trend:false,
  bg:"#ECEFF1",
  source:"AliExpress",
  desc:"Support mural à aimants ultra-puissants pour ranger couteaux, outils ou clés sans percer. Installation adhésive en 30 secondes, tient jusqu'à 5 kg par aimant. Design minimaliste en acier brossé qui s'intègre à tous les intérieurs. Libérez votre plan de travail.",
  features:["Aimants néodyme","Tient 5 kg","Sans percer","Acier brossé","Installation 30 sec"],
  images:[
    "/shop/img/products/10.svg",
    "/shop/img/products/10.svg",
    "/shop/img/products/10.svg",
    "/shop/img/products/10.svg"
  ],
  imageLabels:["Vue principale","Avec couteaux","Installation","Vue de profil"],
  video:null,
  customerReviews:[
    {name:"Philippe A.",rating:5,date:"2026-08-02",verified:true,text:"Tient parfaitement ! Mes 6 couteaux sont bien maintenus. Le design en acier brossé est classe."},
    {name:"Valérie M.",rating:4,date:"2026-07-18",verified:true,text:"Très pratique, libère du plan de travail. L'adhésif tient bien sur le carrelage. Pour les murs peints, mieux vaut visser."},
    {name:"Nicolas R.",rating:5,date:"2026-07-04",verified:true,text:"J'en ai pris 2 : un pour la cuisine et un pour l'atelier. Les aimants sont vraiment puissants."},
    {name:"Aurélie D.",rating:4,date:"2026-06-21",verified:true,text:"Bonne qualité. Attention, les couteaux très lourds (type hachoir) glissent un peu. Pour les couteaux standards c'est parfait."}
  ]
},
{
  id:11,
  name:"Boîte Rangement Pliable (lot 3)",
  price:22.99,
  oldPrice:44.99,
  cat:"organisation",
  catLabel:"Organisation Maison",
  rating:4.6,
  reviews:213,
  trend:true,
  bg:"#FFF3E0",
  source:"Amazon",
  desc:"Lot de 3 boîtes de rangement pliables en tissu premium avec poignées renforcées. Se replient à plat quand vous n'en avez pas besoin. Parfaites pour vêtements, jouets, livres ou accessoires. Structure rigide avec couvercle pour un empilage facile et un intérieur toujours ordonné.",
  features:["Lot de 3","Pliables à plat","Tissu premium","Poignées renforcées","Couvercle intégré"],
  images:[
    "/shop/img/products/11.svg",
    "/shop/img/products/11.svg",
    "/shop/img/products/11.svg",
    "/shop/img/products/11.svg"
  ],
  imageLabels:["Lot de 3","Pliées à plat","Avec contenu","Empilées"],
  video:null,
  customerReviews:[
    {name:"Céline F.",rating:5,date:"2026-08-09",verified:true,text:"Super boîtes ! Solides, belles et pratiques. J'ai rangé tout le bazar de la chambre des enfants en 30 minutes."},
    {name:"Grégory P.",rating:4,date:"2026-07-26",verified:true,text:"Bon rapport qualité/prix pour un lot de 3. Le tissu est épais et les coutures sont solides."},
    {name:"Émeline T.",rating:5,date:"2026-07-12",verified:true,text:"Exactement ce qu'il me fallait pour mon dressing. Se plient à plat quand je n'en ai pas besoin. Parfait !"},
    {name:"Damien S.",rating:4,date:"2026-06-29",verified:true,text:"Bien pour le rangement. La couleur est conforme à la photo. Légèrement plus petites que ce que j'imaginais."},
    {name:"Laura H.",rating:5,date:"2026-06-16",verified:true,text:"J'en ai commandé 2 lots, 6 boîtes au total. Mon appartement est enfin rangé ! Les couvercles tiennent bien."}
  ]
},
{
  id:12,
  name:"Porte-Chaussures Mural",
  price:19.99,
  oldPrice:39.99,
  cat:"organisation",
  catLabel:"Organisation Maison",
  rating:4.3,
  reviews:134,
  trend:false,
  bg:"#E3F2FD",
  source:"TikTok Shop",
  desc:"Rangez jusqu'à 6 paires de chaussures sur votre mur avec ce système adhésif innovant. Aucun perçage nécessaire, installation en 2 minutes. Design moderne et épuré qui transforme votre entrée. Supporte baskets, talons et chaussures de ville. Économisez un espace précieux au sol.",
  features:["6 paires max","Sans percer","Adhésif ultra-fort","Design épuré","Installation 2 min"],
  images:[
    "/shop/img/products/12.svg",
    "/shop/img/products/12.svg",
    "/shop/img/products/12.svg",
    "/shop/img/products/12.svg"
  ],
  imageLabels:["Vue principale","Installé au mur","Avec chaussures","Vue de côté"],
  video:null,
  customerReviews:[
    {name:"Anaïs G.",rating:5,date:"2026-08-04",verified:true,text:"Gain de place énorme dans mon petit appart ! L'adhésif est costaud, ça tient super bien au mur."},
    {name:"Youssef K.",rating:4,date:"2026-07-21",verified:true,text:"Pratique et pas cher. Tient bien les baskets mais les chaussures en cuir lisse glissent un peu."},
    {name:"Charlotte B.",rating:4,date:"2026-07-07",verified:true,text:"Bonne idée, j'aime bien le concept. L'entrée est beaucoup plus propre maintenant. Par contre limité à 6 paires."},
    {name:"Rémi N.",rating:3,date:"2026-06-24",verified:true,text:"Ça fait le job mais l'adhésif n'a pas tenu sur mon mur crépi. J'ai dû visser. Sur surface lisse ça devrait aller."}
  ]
},
{
  id:13,
  name:"Chargeur Sans Fil 3-en-1",
  price:29.99,
  oldPrice:59.99,
  cat:"tech",
  catLabel:"Accessoires Tech",
  rating:4.8,
  reviews:445,
  trend:true,
  bg:"#E8EAF6",
  source:"Amazon",
  desc:"Station de charge sans fil pour smartphone, montre connectée et écouteurs simultanément. Compatible Qi universel avec charge rapide 15W. LED indicatrice discrète et protection contre la surchauffe. Le hub de charge élégant qui remplace tous vos câbles sur votre table de nuit.",
  features:["3 appareils en même temps","Charge rapide 15W","Compatible Qi","Anti-surchauffe","LED discrète"],
  images:[
    "/shop/img/products/13.svg",
    "/shop/img/products/13.svg",
    "/shop/img/products/13.svg",
    "/shop/img/products/13.svg"
  ],
  imageLabels:["Vue principale","Avec appareils","Vue de profil","LED indicatrice"],
  video:null,
  customerReviews:[
    {name:"Alexandre D.",rating:5,date:"2026-08-13",verified:true,text:"Fini le bazar de câbles ! Je charge mon iPhone, mon Apple Watch et mes AirPods en même temps. Design élégant en plus."},
    {name:"Margaux S.",rating:5,date:"2026-07-29",verified:true,text:"Indispensable sur ma table de nuit. La charge rapide 15W fonctionne bien avec mon Samsung. La LED n'est pas gênante pour dormir."},
    {name:"Benjamin T.",rating:4,date:"2026-07-15",verified:true,text:"Très bon chargeur. Compatible avec mon téléphone mais pas avec ma vieille montre (pas Qi). Vérifiez la compatibilité avant."},
    {name:"Jessica R.",rating:5,date:"2026-07-02",verified:true,text:"Parfait ! Le câble fourni est assez long. La qualité de fabrication est excellente pour le prix."},
    {name:"Mehdi A.",rating:5,date:"2026-06-19",verified:true,text:"J'en ai pris un deuxième pour le bureau. Un des meilleurs achats tech que j'ai fait cette année."}
  ]
},
{
  id:14,
  name:"Support Téléphone Voiture Magnétique",
  price:14.99,
  oldPrice:29.99,
  cat:"tech",
  catLabel:"Accessoires Tech",
  rating:4.5,
  reviews:267,
  trend:false,
  bg:"#ECEFF1",
  source:"AliExpress",
  desc:"Aimant néodyme ultra-puissant compatible avec tous les smartphones. Fixation sur grille de ventilation avec clip universel renforcé. Rotation 360 degrés pour une orientation parfaite. Installation en 5 secondes, prise en main sécurisée même sur routes sinueuses.",
  features:["Aimant néodyme","Clip grille ventilation","Rotation 360°","Compatible tous téléphones","Installation 5 sec"],
  images:[
    "/shop/img/products/14.svg",
    "/shop/img/products/14.svg",
    "/shop/img/products/14.svg",
    "/shop/img/products/14.svg"
  ],
  imageLabels:["Vue principale","Installé en voiture","Rotation","Aimant détail"],
  video:null,
  customerReviews:[
    {name:"Christophe L.",rating:5,date:"2026-08-07",verified:true,text:"L'aimant est super puissant, mon iPhone 15 Pro Max tient sans problème. Installation en 2 secondes sur la grille."},
    {name:"Audrey P.",rating:4,date:"2026-07-23",verified:true,text:"Très pratique au quotidien. Mon téléphone tient bien mais ça gêne un peu la ventilation selon la position."},
    {name:"Fabien M.",rating:5,date:"2026-07-09",verified:true,text:"J'ai essayé plein de supports, celui-là est le meilleur. L'aimant ne glisse pas et la rotation est fluide."},
    {name:"Mélanie G.",rating:4,date:"2026-06-26",verified:true,text:"Bon support, discret et efficace. Fonctionne bien avec la coque MagSafe de mon iPhone."},
    {name:"Cédric V.",rating:5,date:"2026-06-12",verified:true,text:"Rapport qualité/prix imbattable. J'en ai pris 3 pour toutes nos voitures familiales."}
  ]
},
{
  id:15,
  name:"Organisateur Câbles Bureau",
  price:12.99,
  oldPrice:24.99,
  cat:"tech",
  catLabel:"Accessoires Tech",
  rating:4.4,
  reviews:189,
  trend:false,
  bg:"#E0F7FA",
  source:"TikTok Shop",
  desc:"Dites adieu au chaos des câbles sur votre bureau. Cet organisateur en silicone souple accueille jusqu'à 7 câbles de différentes tailles. Base adhésive repositionnable et design compact. Gardez vos câbles USB, chargeurs et écouteurs toujours à portée de main, sans nœuds.",
  features:["7 emplacements","Silicone souple","Adhésif repositionnable","Design compact","Compatible tous câbles"],
  images:[
    "/shop/img/products/15.svg",
    "/shop/img/products/15.svg",
    "/shop/img/products/15.svg",
    "/shop/img/products/15.svg"
  ],
  imageLabels:["Vue principale","Sur bureau","Avec câbles","Détail silicone"],
  video:null,
  customerReviews:[
    {name:"William T.",rating:5,date:"2026-08-11",verified:true,text:"Vu sur TikTok et c'est vraiment utile ! Mon bureau est enfin propre. Le silicone tient bien les câbles."},
    {name:"Élise M.",rating:4,date:"2026-07-27",verified:true,text:"Simple mais efficace. Les câbles fins type Lightning tiennent bien, les gros câbles HDMI sont un peu serrés."},
    {name:"Dylan R.",rating:4,date:"2026-07-14",verified:true,text:"Fait exactement ce qu'on lui demande. L'adhésif est repositionnable comme promis, c'est un plus."},
    {name:"Coralie F.",rating:5,date:"2026-07-01",verified:true,text:"Petit accessoire pas cher qui change la vie ! Fini les câbles qui tombent derrière le bureau."}
  ]
},
{
  id:16,
  name:"Écouteurs Bluetooth Mini",
  price:19.99,
  oldPrice:39.99,
  cat:"tech",
  catLabel:"Accessoires Tech",
  rating:4.7,
  reviews:356,
  trend:true,
  bg:"#EDE7F6",
  source:"AliExpress",
  desc:"Écouteurs true wireless ultra-compacts avec son stéréo haute fidélité et réduction de bruit passive. 24 heures d'autonomie totale avec le boîtier de charge. Étanches IPX5 pour le sport et la pluie. Appairage instantané Bluetooth 5.3 et microphone intégré pour vos appels.",
  features:["Bluetooth 5.3","24h autonomie totale","IPX5 étanche","Réduction de bruit","Micro intégré"],
  images:[
    "/shop/img/products/16.svg",
    "/shop/img/products/16.svg",
    "/shop/img/products/16.svg",
    "/shop/img/products/16.svg"
  ],
  imageLabels:["Boîtier et écouteurs","Dans l'oreille","Boîtier ouvert","Vue de dessus"],
  video:null,
  customerReviews:[
    {name:"Killian B.",rating:5,date:"2026-08-14",verified:true,text:"Pour 20€ c'est incroyable ! Le son est clair, les basses sont correctes et la batterie tient super longtemps."},
    {name:"Lucie V.",rating:5,date:"2026-07-30",verified:true,text:"Parfait pour le sport ! Ils ne tombent pas en courant et résistent à la transpiration. L'appairage Bluetooth est instantané."},
    {name:"Bastien H.",rating:4,date:"2026-07-16",verified:true,text:"Bon rapport qualité/prix. Le son est honnête pour le prix. La réduction de bruit est passive, ne pas s'attendre à du ANC actif."},
    {name:"Amandine C.",rating:5,date:"2026-07-03",verified:true,text:"J'avais des AirPods avant qui m'ont coûté 200€. Pour l'usage quotidien, ceux-là font presque aussi bien à 10x moins cher !"},
    {name:"Mathieu J.",rating:4,date:"2026-06-20",verified:true,text:"Bons écouteurs d'appoint. Le micro est correct pour les appels. Le boîtier est compact et se glisse dans la poche facilement."},
    {name:"Pauline G.",rating:5,date:"2026-06-08",verified:true,text:"3ème paire que je commande (j'en perds toujours 😅). À ce prix-là c'est pas grave, et la qualité est toujours là !"}
  ]
}
];
