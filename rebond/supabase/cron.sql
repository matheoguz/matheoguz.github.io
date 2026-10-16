-- Tâches automatiques (à exécuter APRÈS avoir déployé les fonctions, voir README étape 3.6).
-- Remplace les 3 valeurs entre < > avant d'exécuter.
-- Prérequis : Supabase > Database > Extensions > activer « pg_cron » et « pg_net ».

-- Remet en vente les paires dont le paiement a été abandonné (toutes les 10 minutes).
select cron.schedule('rebond-reservations', '*/10 * * * *', $$ select public.release_expired_reservations(); $$);

-- Paye les vendeurs quand l'acheteur n'a pas répondu 14 jours après l'envoi (toutes les heures).
select cron.schedule('rebond-auto-release', '0 * * * *', $$
  select net.http_post(
    url     := 'https://<REF-DU-PROJET>.supabase.co/functions/v1/order-action',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CLE-ANON-PUBLIQUE>',
      'x-cron-secret', '<CRON_SECRET>'),
    body    := '{"action":"auto-release"}'::jsonb
  );
$$);
