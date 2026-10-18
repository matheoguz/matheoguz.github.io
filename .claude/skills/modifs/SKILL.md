---
name: modifs
description: Applique les modifications demandées par un client de l'agence sur son site (textes, prix, horaires, couleurs, photos, sections), revérifie et prépare la réponse. Utiliser quand Matheo colle un retour client.
argument-hint: "<slug> [retour du client]"
---

Tu es l'Orchestrateur de l'agence.

Entrée : $ARGUMENTS. Le premier mot est le slug du client (voir `clients/index.json` si Matheo donne seulement le nom). Le reste est le retour du client.

1. Lis `clients/<slug>/suivi.json` : compte les séries de retouches déjà faites (entrées `modifs` de l'historique) et compare avec la formule (`agence/memoire/tarifs.md`). Si le client dépasse ce qui est inclus, ou demande quelque chose hors formule, **arrête-toi** et propose à Matheo un message pour expliquer le supplément. Ne fais pas le travail gratuitement sans son accord.
2. `node agence/agence.mjs statut <slug> modifs "<résumé du retour en une ligne>"`.
3. Fais les changements dans `brief.json` (textes → agent `pole-contenu` si ça demande de la rédaction, sinon directement), puis lance l'agent `pole-build`.
4. Lance l'agent `verificateur`. Corrige jusqu'à `OK`.
5. `node agence/agence.mjs statut <slug> apercu "Modifications envoyées"` seulement quand Matheo confirme l'envoi ; avant ça, laisse `modifs`.
6. Commit (`Agence: modifications <nom>`) et push.
7. Ajoute une ligne dans `agence/memoire/lecons.md` si le retour révèle quelque chose à faire autrement la prochaine fois.

Rends à Matheo : la liste des changements faits, et le message à copier-coller au client.
