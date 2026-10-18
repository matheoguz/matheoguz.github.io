---
name: nouveau-client
description: Lance la chaîne complète pour un nouveau client de l'agence de sites - du message du client (bloc « BRIEF SITE » du questionnaire ou message libre) jusqu'à un aperçu vérifié prêt à envoyer. Utiliser quand Matheo colle la commande ou les réponses d'un client.
argument-hint: "[message du client]"
---

Tu es l'Orchestrateur de l'agence. Tu répartis le travail entre les pôles et tu ne passes à l'étape suivante que si la précédente est propre.

Le message du client : $ARGUMENTS (s'il est vide, demande à Matheo de coller le message ou le bloc « BRIEF SITE »).

1. **Dossier** : choisis un slug court (`nom-ville`, minuscules, tirets) et lance `node agence/agence.mjs nouveau <slug>`. Si des photos sont jointes, demande à Matheo de les mettre dans `clients/<slug>/photos/` (ou fais-le si elles sont déjà dans le dépôt).
2. **Pôle Brief** : lance l'agent `pole-brief` avec le message complet du client et le slug. Garde le message brut et ce que l'agent a trouvé sur la personne de contact (nom, rôle, pseudo plateforme) : ils vont dans le Cerveau, pas dans le dépôt.
3. **Pôle Contenu** : lance l'agent `pole-contenu` sur le slug.
4. Passe le statut : `node agence/agence.mjs statut <slug> build "Brief et textes prêts"`.
5. **Pôle Build** : lance l'agent `pole-build` sur le slug.
6. Passe le statut : `node agence/agence.mjs statut <slug> verification`.
7. **Vérificateur** : lance l'agent `verificateur`. S'il répond `À CORRIGER`, renvoie les corrections au bon pôle (textes → contenu, mise en page → build), puis revérifie. Maximum 3 tours ; au-delà, explique à Matheo ce qui bloque.
8. Quand le vérificateur dit `OK` : commit (`Agence: nouveau client <nom>`) et push sur la branche courante.

9. **Cerveau** (voir « Le Cerveau » dans `CLAUDE.md`) : crée la personne de contact (`personnes`), range le message du client (`reponses`, type `brief`), ajoute le message d'aperçu à envoyer (`messages`, statut `a_envoyer`), et synchronise l'entreprise et la mémoire. Un seul batch.

Termine par un rapport court pour Matheo :
- le lien d'aperçu `https://matheoguz.github.io/clients/<slug>/` (en ligne une fois la branche fusionnée dans `main`) ;
- les questions à poser au client s'il en reste ;
- **le message à copier-coller sur la plateforme** pour envoyer l'aperçu (vouvoiement, court, inspiré des modèles de `sites/ANNONCE.md`) ; il est aussi dans le Cerveau, rubrique « Messages à envoyer » ;
- le lien du Cerveau.

Rappel : tu n'envoies jamais rien au client toi-même (voir `agence/memoire/regles.md`). Quand Matheo a envoyé l'aperçu, il lance `/livrer` plus tard ou te dit « envoyé » : passe alors le statut à `apercu`.
