# Format d'une maquette (`.json`) — éditeur de maquette du CRM visuel 3D

Fichier produit par « Fichier › Exporter le projet (.json) » de `crm-visuel/editeur/`, relu tel quel par « Importer un projet ».
Une future version des démos pourra charger ce fichier pour construire la maquette d'un client.
Code de référence : `modele.js` (`normaliser()` nettoie et borne toutes les valeurs), `catalogue.js` (modèles d'objets).

## Repère et unités

- Toutes les longueurs sont en **mètres**, arrondies au millimètre.
- Vue de dessus : `x` vers la droite, `y` vers le bas de l'écran. En 3D : `x` → `x`, `y` → `z` (Three.js), la hauteur est `y`.
- Les angles sont en **degrés**, sens des aiguilles d'une montre vu de dessus (0 à 360).
- Un objet est décrit par son **centre** ; à rotation 0, sa `largeur` suit `x` et sa `profondeur` suit `y` ; sa face « avant » regarde `+y`.

## Racine

| Champ | Type | Sens |
|---|---|---|
| `format` | `"crm-visuel-maquette"` | identifie le fichier |
| `version` | `1` | version du format |
| `nom` | texte | nom de la maquette (ex. « Magasin Dupont ») |
| `unite` | `"m"` | toujours le mètre |
| `modifie` | date ISO | dernière modification |
| `reglages` | objet | `hauteurMurs` (m, 1 à 12), `epaisseurMurs` (m, épaisseur par défaut des nouveaux murs), `grille` (pas d'accrochage, 0,1 m) |
| `plan` | objet ou `null` | plan de fond (voir plus bas) |
| `murs` | liste | segments de mur |
| `ouvertures` | liste | portes et fenêtres, posées sur un mur |
| `zones` | liste | pièces ou zones nommées (polygones) |
| `objets` | liste | objets de la bibliothèque |
| `calques` | objet | `plan`, `murs`, `zones`, `objets` : `true` si visible |

## `plan` (plan de fond, facultatif)

| Champ | Sens |
|---|---|
| `image` | image en `data:image/...;base64` (JPEG réduit à 2 400 px au plus) |
| `largeurPx`, `hauteurPx` | taille de l'image en pixels |
| `echelle` | mètres par pixel de l'image (réglée en 2 clics + distance réelle) |
| `x`, `y` | position du **centre** de l'image, en mètres |
| `rotation` | rotation de l'image en degrés |
| `opacite` | 0 à 1 |
| `recadrage` | `gauche`, `droite`, `haut`, `bas` : part de l'image retirée de chaque bord (0 à 0,45) |
| `echelleFixee` | `true` une fois l'échelle réglée par l'utilisateur |

Un pixel `(px, py)` de l'image est au point : `centre + R(rotation) · ((px − largeurPx/2) · echelle, (py − hauteurPx/2) · echelle)`.

## `murs[]`

`{ "id": "m1", "a": { "x": 0, "y": 0 }, "b": { "x": 20, "y": 0 }, "epaisseur": 0.25 }`
Segment de `a` à `b`, centré sur l'épaisseur. Des murs qui se touchent partagent exactement le même point. La hauteur commune est `reglages.hauteurMurs`.

## `ouvertures[]`

`{ "id": "ou1", "type": "porte" | "fenetre", "mur": "m3", "position": 16, "largeur": 2.4, "hauteur": 2.3, "allege": 0 }`
- `mur` : id du mur porteur ; `position` : distance (m) entre `a` du mur et le **milieu** de l'ouverture.
- `hauteur` : hauteur du passage (porte) ou du vitrage (fenêtre) ; `allege` : hauteur du bas de la fenêtre (0 pour une porte).

## `zones[]`

`{ "id": "z3", "nom": "Réserve", "type": "reserve", "couleur": "#a78bfa", "points": [{ "x": 15, "y": 0 }, …] }`
Polygone fermé (3 points au moins, le dernier rejoint le premier). Types utilisés : `zone`, `vente`, `accueil`, `reserve`, `bureau`, `atelier`, `parking`, `cuisine`, `salle`, `circulation`.

## `objets[]`

```json
{ "id": "o4", "modele": "gondole", "type": "rayon", "nom": "Rayon Épicerie salée",
  "x": 4, "y": 3.2, "rotation": 0, "largeur": 4, "profondeur": 0.9, "hauteur": 1.8,
  "couleur": "#e5e7eb", "donnees": {} }
```

- `modele` : le dessin 2D et 3D (liste ci-dessous). `type` : **ce que l'objet représente pour les données**, modifiable.
- `nom` : libre, c'est par lui que Matheo et le client reconnaissent l'objet (« Caisse 2 », « Rayon Boissons »).
- `donnees` : objet libre réservé au branchement des données (ex. `{ "rayon": "R12", "caisse": 2 }`), vide par défaut et conservé tel quel.

Types : `rayon`, `caisse`, `froid`, `stockage`, `comptoir`, `poste`, `mobilier`, `salle`, `vehicule`, `parking`, `cuisine`, `circulation`, `decor`, `ecran`, `sanitaire`, `personne`, `zone`.

| Famille | Modèles (`modele` → type par défaut, dimensions l × p × h en m) |
|---|---|
| Commerce | `gondole` → rayon 3 × 0,9 × 1,8 (longueur réglable) · `tete-gondole` → rayon 1 × 0,9 × 1,6 · `caisse` → caisse 1,8 × 0,9 × 1 · `frigo` → froid 2,5 × 0,8 × 2 · `bac` → rayon 1,2 × 0,9 × 0,9 · `comptoir` → comptoir 2 × 0,7 × 1,05 · `palette` → stockage 1,2 × 0,8 × 1,2 · `rack` → stockage 2,7 × 1,1 × 3 |
| Bureau | `bureau` → poste 1,4 × 0,7 × 0,75 · `chaise` → mobilier 0,5 × 0,5 × 0,9 · `table-reunion` → salle 2,4 × 1,1 × 0,75 · `armoire` → stockage 1 × 0,45 × 1,9 · `poste-info` → poste 1,2 × 0,7 × 1,2 |
| Auto-école / garage | `voiture` → vehicule 4,2 × 1,8 × 1,5 · `moto` → vehicule 2,1 × 0,8 × 1,2 · `parking` → parking 2,5 × 5 · `salle-code` → salle 5 × 4 × 1,6 |
| Restauration | `table-resto` → mobilier 1,4 × 1,4 × 0,75 · `cuisine` → cuisine 3 × 0,8 × 0,9 · `bar` → comptoir 3 × 1,4 × 1,1 |
| Général | `escalier` → circulation 1,2 × 3 × 2,8 · `plante` → decor 0,6 × 0,6 × 1,3 · `ecran` → ecran 1,2 × 0,3 × 1,7 · `sanitaires` → sanitaire 2 × 1,6 × 2,2 (porte et fenêtre : voir `ouvertures`) |
| Personnes | `repere-poste` → personne 0,7 × 0,7 × 1,7 |

## Règles de lecture

- Un champ manquant prend sa valeur par défaut ; un champ inconnu est ignoré ; un modèle inconnu est retiré.
- Une ouverture dont le mur n'existe pas est retirée ; deux éléments au même `id` : le second est renuméroté.
- Exporter puis réimporter donne exactement le même fichier (testé).
- Rien n'est envoyé : le fichier ne quitte l'ordinateur que si Matheo l'envoie lui-même.
