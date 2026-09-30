-- E-mails automatiques (nouveau message, paire vendue, colis envoyé, argent versé, litige, signalement).
-- À exécuter APRÈS schema.sql et après avoir déployé la fonction « notify » (README étape 5).
-- Prérequis : Supabase > Database > Extensions > activer « pg_net ».
-- Remplace les 2 valeurs entre < > avant d'exécuter.

-- Réglages lus par les déclencheurs (jamais accessibles depuis le navigateur : aucune règle RLS).
create table if not exists public.app_config (key text primary key, value text not null);
alter table public.app_config enable row level security;
insert into public.app_config (key, value) values
  ('notify_url', 'https://<REF-DU-PROJET>.supabase.co/functions/v1/notify'),
  ('notify_secret', '<NOTIFY_SECRET>')
on conflict (key) do update set value = excluded.value;

-- Envoie la ligne modifiée à la fonction « notify ». Ne bloque jamais l'écriture :
-- si l'envoi échoue, l'action de l'utilisateur est quand même enregistrée.
create or replace function public.notify_change() returns trigger
language plpgsql security definer set search_path = public, net as $$
declare url text; secret text;
begin
  select value into url from public.app_config where key = 'notify_url';
  select value into secret from public.app_config where key = 'notify_secret';
  if url is null or url like '%<%' then return new; end if;
  -- Pour les commandes, on ne prévient que lors d'un changement d'étape.
  if tg_table_name = 'orders' and tg_op = 'UPDATE' then
    if (to_jsonb(new)->>'status') is not distinct from (to_jsonb(old)->>'status') then return new; end if;
  end if;
  begin
    perform net.http_post(
      url     := url,
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', secret),
      body    := jsonb_build_object('table', tg_table_name, 'type', tg_op, 'record', to_jsonb(new),
                                    'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) else null end)
    );
  exception when others then
    raise warning 'notification non envoyée : %', sqlerrm;
  end;
  return new;
end $$;

drop trigger if exists notify_message on public.messages;
create trigger notify_message after insert on public.messages for each row execute function public.notify_change();
drop trigger if exists notify_order on public.orders;
create trigger notify_order after insert or update on public.orders for each row execute function public.notify_change();
drop trigger if exists notify_report on public.reports;
create trigger notify_report after insert on public.reports for each row execute function public.notify_change();
