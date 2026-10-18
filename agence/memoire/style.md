# Style de l'agence

## Les sites
- Sobres, modernes, rapides. Une seule page bien construite vaut mieux que cinq pages vides.
- Mobile d'abord : la majorité des visiteurs d'un commerce local arrivent depuis un téléphone. Le bouton d'appel doit être visible tout de suite.
- Pas d'emojis dans les sites clients. Pas de faux texte. Pas d'animations gadgets.
- **Vraies photos, toujours.** Celles du client en priorité. Sinon la banque du métier dans `agence/photos.mjs` (photos Unsplash gratuites, vérifiées). Jamais de fond en dégradé à la place d'une photo, jamais une photo d'un autre métier. Métier absent de la banque : chercher sur `https://unsplash.com/s/photos/<métier>?license=free` (outil Firecrawl si disponible), prendre uniquement des URLs `images.unsplash.com/photo-…` (pas `plus.unsplash.com`, payant) et les ajouter à la banque.
- Règles de design « anti-IA » de `Repos-/taste-skill` (déjà appliquées par `agence/rendu.mjs`, à respecter dans tout sur-mesure) : aucun tiret long « — », une seule couleur d'accent, pas de palette crème + cuivre, pas d'Inter / Fraunces / Instrument Serif, pas de petit titre en majuscules au-dessus de chaque section, pas de 3 cartes identiques côte à côte, titre du haut de page sur 2 lignes maximum, un mode sombre.
- Toujours : adresse + itinéraire, horaires, téléphone cliquable, mentions légales, fiche Google (données structurées).

## Les textes
- Français simple, chaleureux, concret. On parle comme le commerçant parlerait à ses clients.
- Slogan : une phrase courte, une promesse concrète (« Le bon pain, cuit chaque matin à deux pas de chez vous. »).
- Accroche : 1 ou 2 phrases, ce qu'on trouve ici et pourquoi c'est bien.
- On ne promet rien que le client n'a pas dit (pas de « bio », « fait maison », « depuis 1950 » inventés).

## Les messages aux clients
- Vouvoiement, poli, court, un seul appel à l'action par message.
- Modèles prêts dans `sites/ANNONCE.md`.
