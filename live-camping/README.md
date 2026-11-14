# Le Camping du Live

Page à afficher pendant un live TikTok (projet à part, sans lien avec la série « Malo & Roger »).

- Un abonnement : un campeur arrive au portail avec une bulle « Pseudo a rejoint le camping ! ».
- Un cadeau : la personne obtient sa place à son nom, qui reste d'un live à l'autre (enregistrée dans le navigateur). 1 diamant ou plus = tente, 30 ou plus = caravane, 200 ou plus = chalet avec feu d'artifice.
- Les likes remplissent une jauge à paliers : feu de camp, lampions, feu d'artifice (1 000 likes par palier).

## Brancher sur le live
1. Installer **TikFinity** (gratuit) sur l'ordinateur du live et le connecter au compte TikTok. Il envoie les événements sur `ws://localhost:21213/`.
2. Dans **TikTok LIVE Studio** (ou OBS) : ajouter une source « Navigateur » avec l'adresse de la page, en 1080 × 1920.
3. Le petit texte en haut à droite passe à « ● en direct » quand TikFinity est branché.

## Réglages dans l'adresse
- `?test` : affiche des boutons pour simuler abonnés, cadeaux et likes.
- `?tente=1&caravane=30&chalet=200` : diamants nécessaires pour chaque place.
- `?likes=1000` : likes par palier.
- `?ws=ws://localhost:21213/` : autre adresse WebSocket.

Rappel à dire en live : la place est dans le camping du live (virtuel), pas un vrai séjour.
