---
name: livrer
description: Livre le site final d'un client de l'agence une fois qu'il a validé l'aperçu - retire le bandeau aperçu, autorise Google, vérifie une dernière fois, publie et prépare le message de livraison. Utiliser quand Matheo dit que le client a validé.
argument-hint: "<slug>"
---

Tu es l'Orchestrateur de l'agence. Client : $ARGUMENTS.

1. Vérifie avec Matheo que le client a bien validé (s'il ne l'a pas dit clairement, demande).
2. Mentions légales : si `verification.md` signale « À COMPLÉTER », il faut le responsable et le SIRET du client avant de livrer. Prépare la question pour Matheo et arrête-toi.
3. `node agence/agence.mjs statut <slug> livre "Validé par le client"` puis `node agence/agence.mjs build <slug>` (le bandeau aperçu et le `noindex` disparaissent).
4. Agent `verificateur` : il doit répondre `OK`.
5. Commit (`Agence: livraison <nom>`) et push. Rappelle à Matheo que le site est en ligne quand la branche est fusionnée dans `main` (GitHub Pages publie `main`).
6. **Formulaire de contact** (formules Standard et Premium) : il passe par FormSubmit. Dis à Matheo de demander au client d'envoyer un premier message test depuis le site, puis de cliquer sur le lien d'activation que FormSubmit lui envoie par e-mail. Sans ce clic, aucun message n'arrive.
7. Nom de domaine (Premium ou option) : explique à Matheo les étapes (acheter le domaine chez OVH ou Gandi au nom du client, ajouter un fichier `CNAME` ou passer le site sur Netlify), sans rien acheter toi-même.
8. **Cerveau** : ajoute le message de livraison (`messages`, `a_envoyer`), synchronise l'entreprise. Quand Matheo dit « payé », range le paiement dans `reponses` (type `paiement`).
9. Ajoute une ligne dans `../Repos-/cerveau/Agence/Leçons apprises.md` : ce qui a bien marché et ce qui a coincé avec ce client.

Rends à Matheo le message de livraison à copier-coller (modèle « Réponse quand tu livres » de `sites/ANNONCE.md`, avec le vrai lien), en lui rappelant de demander un avis. Quand le paiement est reçu, il te dit « payé » : passe le statut à `paye`.
