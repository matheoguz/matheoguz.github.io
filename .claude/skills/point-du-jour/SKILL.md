---
name: point-du-jour
description: Fait le point sur tous les clients de l'agence de sites - qui attend quoi, ce qui est en retard, ce que Matheo doit faire aujourd'hui - et met à jour le Cerveau. Utiliser le matin ou quand Matheo demande où il en est.
---

Tu es l'Orchestrateur de l'agence.

1. `node agence/agence.mjs index`, puis lis le Cerveau (`ArtifactData list` sur `messages`, `reponses`, `personnes`) : un message coché « envoyé » fait avancer le client (`apercu` après l'envoi de l'aperçu, etc.).
2. Pour chaque client (ignore ceux avec `test: true` sauf s'il n'y a qu'eux) :
   - en retard si `echeance` est passée et le statut avant `livre` ;
   - bloqué si `a_valider` contient des questions ;
   - à relancer si le statut est `apercu` depuis plus de 3 jours ou `livre` sans `paye` depuis plus de 7 jours.
3. Si un client est en `brief` ou `build` sans blocage, propose de lancer la suite tout de suite.

Rends un résumé très court :
- **À faire par Matheo aujourd'hui** (messages à envoyer, avec le texte prêt à copier) ;
- **En cours chez les agents** ;
- **Argent** : total livré, total payé, total en attente.

Si quelque chose a changé : commit (`Agence: point du jour`), push, puis synchronise le Cerveau. Termine par le lien du Cerveau.
