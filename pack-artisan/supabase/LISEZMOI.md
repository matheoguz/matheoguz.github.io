# Base de données du pack artisan (Supabase)

- `migrations/001_schema.sql` : tables (entreprises, membres, clients, demandes, rendez_vous, activites, automatisations), règles de sécurité (une entreprise ne voit que ses données), formulaire public `envoyer_demande` (anti-robot + limite de débit), historique automatique.
- `tests/` : tests sur un PostgreSQL local qui imite Supabase. `bash tests/lancer.sh` doit finir par « TOUS LES TESTS SONT PASSÉS ». Ne jamais exécuter `tests/00_supabase_simule.sql` sur Supabase.

## Installer sur Supabase
1. Créer le projet (région **Europe, Paris ou Francfort**).
2. SQL Editor → coller `migrations/001_schema.sql` → Run.
3. Dans la page, seules l'**URL du projet** et la clé **anon** (publique) sont utilisées. La clé `service_role` ne doit jamais apparaître dans le code ni dans une conversation.
