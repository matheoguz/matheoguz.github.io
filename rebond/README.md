# Rebond

Appli de revente de vêtements entre particuliers : 0 % de commission vendeur, protection acheteur de 3 % plafonnée à 5 €, offres négociées dans la messagerie.

Tout tient dans `index.html` (HTML, CSS et JavaScript, sans dépendance).

## Fonctionnalités
- Annonces avec jusqu'à 5 photos (compressées dans le navigateur), catégorie, taille, marque, état, prix
- Recherche, filtres (catégorie, taille, état, prix max) et tri
- Favoris
- Messagerie par annonce, avec offres de prix que le vendeur accepte ou refuse
- Achat : choix de livraison (point relais, domicile, main propre) et détail des frais
- Suivi de commande (payée, expédiée, reçue) et avis sur le vendeur
- Espace perso : annonces, ventes, achats, avis, argent gagné

## Deux modes
- **Sur claude.ai (artifact)** : les données sont partagées entre toutes les personnes qui ouvrent la page.
- **Ailleurs (GitHub Pages, fichier local)** : mode démo, les données restent dans le navigateur. Les annonces « Exemple » sont fictives.

## Pour en faire une vraie appli publique
1. Backend : Supabase (comptes, base de données, stockage des photos). Remplacer l'objet `Store` dans `index.html`.
2. Paiement : Stripe Connect ou Mangopay (argent bloqué jusqu'à la réception). Le paiement actuel est une démonstration.
3. Livraison : API Boxtal ou Mondial Relay pour les étiquettes.
4. Légal : structure (micro-entreprise ou SAS), CGU/CGV, RGPD, DSA (signalement), DAC7 (déclaration des vendeurs).
5. Appli mobile : emballer le site avec Capacitor, ou le réécrire en React Native.

Les règles de frais et de livraison sont en haut du script (`FEES`, `SHIPPING`, `CATS`).
