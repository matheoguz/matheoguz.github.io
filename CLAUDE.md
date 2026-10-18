# matheoguz.github.io

Site GitHub Pages de Matheo Guzzi (publié depuis `main`). Chaque dossier est un projet indépendant : portfolio (`index.html`), boutiques (`shop/`, `flocon/`), outils (`outils/`), apps (`lyricmood/`, `fruits/`…) et **l'agence de sites vitrines** (`sites/`, `agence/`, `clients/`).

Écrire en français pour tout ce qui est visible par Matheo ou ses clients.

**Aperçu obligatoire :** dès qu'une page est créée ou modifiée visuellement, commit + push, puis donner à Matheo un **lien cliquable vers la page rendue**, sans attendre qu'il le demande. Ne pas lui envoyer le fichier `.html` (son appli affiche le code, pas le site). Tant que la branche n'est pas fusionnée dans `main`, le lien est `https://raw.githack.com/matheoguz/matheoguz.github.io/<sha-du-commit>/<chemin>` (une page d'avertissement s'affiche d'abord, il faut cliquer pour continuer) ; une fois fusionné, c'est `https://matheoguz.github.io/<chemin>`.

## Agence de sites vitrines

Matheo vend des sites vitrines sur ComeUp / Fiverr (annonce : `sites/ANNONCE.md`, portfolio : `sites/`). Le travail est fait par des agents, Matheo valide et parle aux clients.

**Avant tout travail sur un client, lire `agence/memoire/` :** `regles.md` (non négociable), `tarifs.md`, `style.md`, `lecons.md`.

### Le workspace
| Rôle | Où | Ce qu'il fait |
|---|---|---|
| Orchestrateur | skills `/nouveau-client`, `/modifs`, `/livrer`, `/point-du-jour` | enchaîne les pôles, gère les statuts |
| NOVA — pôle Brief | agent `pole-brief` | message client → `brief.json` + questions |
| PLUME — pôle Contenu | agent `pole-contenu` | slogan, textes, SEO |
| FORGE — pôle Build | agent `pole-build` | génère le site, sur-mesure |
| ARGUS — vérificateur | agent `verificateur` | contrôle qualité, verdict OK / À CORRIGER |
| Mémoire | `agence/memoire/` | règles, tarifs, style, leçons apprises |
| Cockpit | `agence/workspace/` | vue d'ensemble visuelle, lit `clients/index.json` |

### Outil
`node agence/agence.mjs <commande>` — `nouveau <slug>`, `build <slug>`, `verifier <slug>`, `statut <slug> <etape> [note]`, `index`.
Étapes : `brief → build → verification → apercu → modifs → livre → paye`.

### Un client = un dossier `clients/<slug>/`
- `brief.json` : tout le contenu du site (source de vérité ; modifier ici puis rebuild plutôt qu'éditer le HTML).
- `suivi.json` : statut, formule, prix, échéance, historique, questions `a_valider`.
- `index.html`, `mentions-legales.html` : générés par `build`. Ne pas éditer à la main sauf sur-mesure noté dans `sur-mesure.md`.
- `verification.md` : dernier rapport du vérificateur. `.apercu/` : captures (non versionnées).
- Thèmes : `agence/themes.mjs` (restaurant, beaute, artisan, commerce, sante).
- Questionnaire client : `sites/brief/` → le client colle le bloc « BRIEF SITE » dans la conversation de la plateforme.

`clients/exemple-boulangerie-dupont/` est un client fictif (`test: true`) qui sert d'exemple.
