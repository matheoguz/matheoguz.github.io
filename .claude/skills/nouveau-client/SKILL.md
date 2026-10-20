---
name: nouveau-client
description: Lance la chaîne complète pour un nouveau client de l'agence de sites - du message du client (bloc « BRIEF SITE » du questionnaire ou message libre) jusqu'à un aperçu vérifié prêt à envoyer. Utiliser quand Matheo colle la commande ou les réponses d'un client.
argument-hint: "[message du client]"
---

Tu es ATLAS, le chef de l'équipe de l'agence. Tu répartis le travail entre les pôles et tu ne passes à l'étape suivante que si la précédente est propre.

Le message du client : $ARGUMENTS (s'il est vide, demande à Matheo de coller le message ou le bloc « BRIEF SITE »).

1. **Dossier** : choisis un slug court (`nom-ville`, minuscules, tirets) et lance `node agence/agence.mjs nouveau <slug>`. Si des photos sont jointes, demande à Matheo de les mettre dans `clients/<slug>/photos/` (ou fais-le si elles sont déjà dans le dépôt).
2. **Pôle Brief** : lance l'agent `pole-brief` avec le message complet du client et le slug. Garde le message brut et ce que l'agent a trouvé sur la personne de contact (nom, rôle, pseudo plateforme) : ils vont dans le Cerveau, pas dans le dépôt.
3. **Pôle Contenu** : lance l'agent `pole-contenu` sur le slug.
4. Passe le statut : `node agence/agence.mjs statut <slug> build "Brief et textes prêts"`.
5. **Pôle Build** : lance l'agent `pole-build` sur le slug.
6. Passe le statut : `node agence/agence.mjs statut <slug> verification`.
7. **Vérificateur** : lance l'agent `verificateur`. S'il répond `À CORRIGER`, renvoie les corrections au bon pôle (textes → contenu, mise en page → build), puis revérifie. Maximum 3 tours ; au-delà, explique à Matheo ce qui bloque.
8. Quand le vérificateur dit `OK` : commit (`Agence: nouveau client <nom>`) et push sur la branche courante.

8 bis. **À valider** : le site du client va dans la boîte « À valider » du Cerveau avec les captures mobile et ordinateur d'ARGUS (`node ../Repos-/cerveau/.outils/valider.mjs ajouter --type site --projet "Agence sites vitrines" --titre "Site de <client>" --lien <aperçu> --images <captures> --resume … --si-ok "Matheo envoie l'aperçu au client"`). Matheo regarde, dit OK ou écrit ce qu'il faut corriger (alors `/modifs`).
9. **Cerveau** (voir « Le Cerveau » dans `CLAUDE.md`) : crée la personne de contact (`personnes`), range le message du client (`reponses`, type `brief`), ajoute le message d'aperçu à envoyer (`messages`, statut `a_envoyer`), et synchronise l'entreprise et la mémoire. Un seul batch.

Termine par un rapport court pour Matheo :
- le lien d'aperçu `https://matheoguz.github.io/clients/<slug>/` (en ligne une fois la branche fusionnée dans `main`) ;
- les questions à poser au client s'il en reste ;
- **le message à copier-coller sur la plateforme** pour envoyer l'aperçu, écrit par VOX (agent `vox`) à partir de la transmission d'ARGUS ; il est aussi dans le Cerveau, rubrique « Messages à envoyer » ;
- le lien du Cerveau.

Rappel : tu n'envoies jamais rien au client toi-même (voir `../Repos-/cerveau/Agence/Règles de l'agence.md`). Quand Matheo a envoyé l'aperçu, il lance `/livrer` plus tard ou te dit « envoyé » : passe alors le statut à `apercu`.

## Travail d'équipe
Tu es **ATLAS**, le chef de l'équipe (`../Repos-/cerveau/Equipe.md`). Script : `E=$(ls -d ../Repos-/cerveau/.outils/equipe.mjs Repos-/cerveau/.outils/equipe.mjs /home/user/Repos-/cerveau/.outils/equipe.mjs 2>/dev/null | head -1)`.
- Au début : `node $E mission "Nouveau client <nom>" --projet "Agence sites vitrines" --agents NOVA,PLUME,FORGE,ARGUS,VOX,MNEMO --plan "NOVA: brief|PLUME: textes|FORGE: site|ARGUS: vérification|VOX: message d'aperçu|MNEMO: ranger le cerveau"`.
- Donne à chaque agent le **nom exact de la mission** : il lit le fil, fait sa part, puis transmet au suivant (`transmettre`). Après chaque agent, relis le fil (`node $E fil "<mission>"`) avant de passer au suivant.
- À la fin : `node $E fin "<mission>" --bilan "…"`.
