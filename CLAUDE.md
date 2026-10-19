# matheoguz.github.io

Site GitHub Pages de Matheo Guzzi (publié depuis `main`). Chaque dossier est un projet indépendant : portfolio (`index.html`), boutiques (`shop/`, `flocon/`), outils (`outils/`), apps (`lyricmood/`, `fruits/`…) et **l'agence de sites vitrines** (`sites/`, `agence/`, `clients/`).

Écrire en français pour tout ce qui est visible par Matheo ou ses clients.

**Aperçu obligatoire :** dès qu'une page est créée ou modifiée visuellement, commit + push, puis donner à Matheo un **lien cliquable vers la page rendue**, sans attendre qu'il le demande. Ne pas lui envoyer le fichier `.html` (son appli affiche le code, pas le site). Une fois sur `main`, le lien est `https://matheoguz.github.io/<chemin>` (GitHub Pages met une minute à publier). Pour un changement encore sur une branche, le lien est `https://raw.githack.com/matheoguz/matheoguz.github.io/<sha-du-commit>/<chemin>` (une page d'avertissement s'affiche d'abord).

## Agence de sites vitrines

Matheo vend des sites vitrines sur ComeUp / Fiverr (annonce : `sites/ANNONCE.md`, portfolio : `sites/`). Le travail est fait par des agents, Matheo valide et parle aux clients.

**Avant tout travail sur un client, lire `../Repos-/cerveau/Agence/` :** `Règles de l'agence.md` (non négociable), `Tarifs.md`, `Style de l'agence.md`, `Leçons apprises.md`. Une seule mémoire pour tout : le cerveau (`Repos-/cerveau`), affiché dans le Cerveau (page).

### Le workspace
| Rôle | Où | Ce qu'il fait |
|---|---|---|
| Orchestrateur | skills `/nouveau-client`, `/modifs`, `/livrer`, `/point-du-jour` | enchaîne les pôles, gère les statuts |
| NOVA — pôle Brief | agent `pole-brief` | message client → `brief.json` + questions |
| PLUME — pôle Contenu | agent `pole-contenu` | slogan, textes, SEO |
| FORGE — pôle Build | agent `pole-build` | génère le site, sur-mesure |
| ARGUS — vérificateur | agent `verificateur` | contrôle qualité, verdict OK / À CORRIGER |
| Mémoire | `../Repos-/cerveau/Agence/` | règles, tarifs, style, leçons apprises |
| **Le Cerveau** (l'endroit unique) | https://claude.ai/artifact/UPP4jo5X6LqiWXkCpd3mme (source : `agence/cerveau/cerveau.html`) | LE point central, privé : cockpit, entreprises, personnes, réponses, messages à envoyer, mémoire |

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

### Le Cerveau (page privée, tenue par les agents)
Tout ce que Matheo consulte est dans le Cerveau : https://claude.ai/artifact/UPP4jo5X6LqiWXkCpd3mme (outil `ArtifactData` avec cette URL).
Collections :
- `entreprises/<slug>` : copie de la fiche du client (générée, ne pas écrire à la main).
- `personnes/<id>` : `{nom, role, entreprise: <slug>, plateforme, pseudo, telephone, email, notes}`. **Uniquement ici**, jamais dans le dépôt.
- `reponses/<id>` : chaque message reçu d'un client, texte complet : `{entreprise, date, type: brief|retour|message|paiement, resume, contenu}`. **Uniquement ici.**
- `messages/<id>` : chaque message à envoyer par Matheo : `{entreprise, date, objet, texte, statut: a_envoyer|envoye}`. Matheo coche « Je l'ai envoyé » dans la page ; relire ce statut avant d'avancer un client.
- `idees/<id>` : idées que Matheo jette depuis la barre « Demander au cerveau » `{titre, texte, region, liens, date}`. **Au début de chaque session**, les lire et les recopier dans le coffre (`Repos-/cerveau/Idées/AAAA-MM-JJ titre.md`, avec `tags: [idee]` et les liens en `[[...]]`), puis mettre `importee: true` sur le document.
- `notes/<id>` et `journal/<date>` : copie du coffre `Repos-/cerveau` (toutes les notes, dont la mémoire de l'agence ; le journal jour par jour). C'est la rubrique Mémoire, Graphe et Journal.

**Synchroniser** (à la fin de chaque skill de l'agence) :
1. `node agence/agence.mjs cerveau <scratchpad>/cerveau` (entreprises) et `node ../Repos-/cerveau/.outils/vers-cerveau.mjs <scratchpad>/vault` (notes et journal).
2. `ArtifactData list` sur `entreprises`, `notes` et `journal` pour lire les `version`.
3. Un seul `ArtifactData batch` : `set` avec `file_path` pour chaque fichier, `if_version` pour les documents qui existent déjà, plus les personnes / réponses / messages nouveaux ou modifiés.
Ids : `<slug>-<sujet>` (ex. `boulangerie-dupont-retour-2`), en minuscules avec tirets. Le client `exemple-*` est fictif (`test: true`).

## Le cerveau de Matheo (mémoire, journal : ne rien oublier)
- Coffre Obsidian privé : `Repos-/cerveau/` (dépôt privé `matheoguz/Repos-`). `MEMOIRE.md` = le résumé vivant de tout ; `Journal/AAAA-MM-JJ.md` = toute la conversation, écrite automatiquement.
- Hooks (`.claude/settings.json` + `.claude/hooks/cerveau.sh`) : après chaque réponse, avant une compression et en fin de session, `journal.mjs` recopie la conversation et pousse sur GitHub ; au démarrage et après compression, `rappel.mjs` remet `MEMOIRE.md` et la fin du journal dans le contexte. Il faut que `Repos-` soit dans la session.
- **À faire par Claude** : mettre à jour `MEMOIRE.md` (et `Décisions.md`, les notes de projet) dès qu'une décision, une préférence ou un état change. Ne pas éditer le journal à la main.
- Synchro vers le Cerveau (rubriques Graphe et Journal) : `node ../Repos-/cerveau/.outils/vers-cerveau.mjs <scratchpad>/vault`, puis `ArtifactData batch` sur `notes` et `journal` (avec `if_version` pour les documents existants).
- **Night run** : tâche planifiée chaque matin (6h52, Paris) qui importe les idées, fait `/point-du-jour`, met à jour `MEMOIRE.md`, écrit le rapport du matin et synchronise le Cerveau.
- Rubrique Missions du Cerveau : Matheo peut lancer une session Claude Code depuis la page (connecteur Claude Code Remote, titre « Cerveau · … »).
