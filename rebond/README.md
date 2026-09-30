# Rebond

Marketplace de sneakers de seconde main : 0 % de commission vendeur, vérification d'authenticité dès 80 € (7,90 €), protection acheteur de 3 % plafonnée à 5 €, offres négociées dans la messagerie.

Tout tient dans `index.html` (HTML, CSS et JavaScript, sans dépendance).

## Fonctionnalités
- Fil d'actu, rayon « Dans ta pointure », marques populaires
- Catalogue par style (lifestyle, running, basket, skate, outdoor, enfant) et par marque
- Filtres : pointure EU (avec équivalence US), marque, état, prix, couleur, boîte d'origine, authentifiables ; tri
- Page article : photos, détails (modèle, pointure, état, coloris, boîte, référence SKU), prix moyen du modèle, autres paires du vendeur, paires similaires
- Mise en vente : jusqu'à 5 photos, modèle, pointure, état, SKU, boîte, estimation de ce que touche le vendeur
- Favoris avec compteur de cœurs
- Messagerie avec offres que le vendeur accepte ou refuse
- Paiement : point relais, domicile ou main propre, option vérification d'authenticité, détail des frais
- Suivi de commande (payée, expédiée, authentifiée, reçue) et évaluations du vendeur
- Profil membre (dressing, évaluations) et espace perso

## Deux modes
- **Sur claude.ai (artifact)** : les données sont partagées entre toutes les personnes qui ouvrent la page.
- **Ailleurs (GitHub Pages, fichier local)** : mode démo, les données restent dans le navigateur. Les annonces « Exemple » sont fictives.

## Pour en faire une vraie appli publique
1. Backend : Supabase (comptes, base de données, stockage des photos). Remplacer l'objet `Store` dans `index.html`.
2. Paiement : Stripe Connect ou Mangopay (argent bloqué jusqu'à la réception). Le paiement actuel est une démonstration.
3. Livraison : API Boxtal ou Mondial Relay pour les étiquettes.
4. Légal : structure (micro-entreprise ou SAS), CGU/CGV, RGPD, DSA (signalement), DAC7 (déclaration des vendeurs).
5. Appli mobile : emballer le site avec Capacitor, ou le réécrire en React Native.

Les règles de frais, de livraison et les listes (marques, pointures, états) sont en haut du script (`FEES`, `AUTH`, `SHIPPING`, `BRANDS`, `SIZES`, `CONDS`).
