# N°1 — mode d'emploi

Site : https://matheoguz.github.io/top1/

## Chaque semaine (10 minutes)
1. Ouvre la page « Meilleures ventes » d'Amazon.fr pour chaque rayon.
2. Dans `data.js` : mets à jour `edition` (+1) et `date`.
3. Remplace les produits qui ne sont plus n°1 (nom, marque, fourchette de prix, verdict, textes).
4. Commit + push : le site se met à jour tout seul en 1 à 2 minutes.

## Lien direct pour TikTok
Chaque produit a son lien : `https://matheoguz.github.io/top1/#/p/airtag`
(le bouton « Copier le lien » sur la fiche le donne).

## Réglages (en haut de `data.js`)
- `tiktok` : ton pseudo, pour afficher les liens TikTok.
- `affiliateTag` : ton identifiant Partenaires Amazon. Laisse vide si tu n'en as pas.
- `featured: true` sur un produit : le met « À la une » (sinon c'est le premier).
- `image` : chemin vers TA photo (pas celles d'Amazon).

## À faire une fois
- Compléter l'éditeur dans `mentions-legales.html`.
