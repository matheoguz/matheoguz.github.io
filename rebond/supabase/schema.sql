-- =====================================================================
-- Rebond : schéma de la base Supabase
-- À exécuter une fois dans Supabase > SQL Editor (projet en région UE).
-- Les règles RLS (Row Level Security) décident qui lit et écrit quoi :
-- le navigateur n'a que la clé publique « anon », tout le reste est ici.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       text not null unique check (username ~ '^[a-z0-9._-]{3,24}$'),
  city           text not null default '' check (char_length(city) <= 60),
  is_admin       boolean not null default false,
  payouts_ready  boolean not null default false,   -- compte Stripe prêt à recevoir des virements
  created_at     timestamptz not null default now()
);

-- Réglages privés (pointure, conversations lues) : visibles par leur seul propriétaire.
create table if not exists public.user_settings (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  my_size     text not null default '' check (char_length(my_size) <= 6),
  seen        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Comptes Stripe Connect des vendeurs : lus et écrits uniquement par les fonctions serveur.
create table if not exists public.seller_accounts (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  stripe_account_id  text not null unique,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Annonces
-- ---------------------------------------------------------------------
create table if not exists public.listings (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references public.profiles(id) on delete cascade,
  title           text not null check (char_length(title) between 3 and 70),
  description     text not null default '' check (char_length(description) <= 1200),
  style           text not null check (style in ('lifestyle','running','basket','skate','outdoor','enfant')),
  brand           text not null check (char_length(brand) between 1 and 30),
  model           text not null default '' check (char_length(model) <= 40),
  colorway        text not null default '' check (char_length(colorway) <= 40),
  color           text not null default '' check (char_length(color) <= 20),
  sku             text not null default '' check (char_length(sku) <= 20),
  box             boolean not null default false,
  size            text not null check (char_length(size) between 1 and 6),
  condition       text not null check (condition in ('Neuve (DS)','Portée 1 à 2 fois','Très bon état','Bon état','Usée')),
  price           numeric(10,2) not null check (price >= 1 and price <= 10000),
  photos          text[] not null default '{}' check (coalesce(array_length(photos, 1), 0) <= 5),
  thumb           text not null default '',
  status          text not null default 'active' check (status in ('active','reserved','sold','removed')),
  reserved_until  timestamptz,
  reserved_by     uuid references public.profiles(id) on delete set null,
  moderation_note text,
  buyer_id        uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.listings add column if not exists reserved_by uuid references public.profiles(id) on delete set null;
alter table public.listings add column if not exists moderation_note text;
create index if not exists listings_feed_idx on public.listings (status, created_at desc);
create index if not exists listings_seller_idx on public.listings (seller_id);

create table if not exists public.likes (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ---------------------------------------------------------------------
-- Messagerie
-- ---------------------------------------------------------------------
create table if not exists public.threads (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid references public.listings(id) on delete set null,
  listing_title   text not null default '',
  buyer_id        uuid references public.profiles(id) on delete set null,
  seller_id       uuid references public.profiles(id) on delete set null,
  accepted_price  numeric(10,2),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table if not exists public.messages (
  id          bigint generated always as identity primary key,
  thread_id   uuid not null references public.threads(id) on delete cascade,
  from_id     uuid references public.profiles(id) on delete set null,
  kind        text not null default 'msg' check (kind in ('msg','offer')),
  body        text not null default '' check (char_length(body) <= 600),
  amount      numeric(10,2) check (amount is null or amount >= 1),
  state       text check (state in ('pending','accepted','declined')),
  created_at  timestamptz not null default now()
);
create index if not exists messages_thread_idx on public.messages (thread_id, id);

-- ---------------------------------------------------------------------
-- Commandes, avis, signalements
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id                     uuid primary key default gen_random_uuid(),
  listing_id             uuid references public.listings(id) on delete set null,
  title                  text not null,
  size                   text not null default '',
  thumb                  text not null default '',
  seller_id              uuid references public.profiles(id) on delete set null,
  buyer_id               uuid references public.profiles(id) on delete set null,
  price                  numeric(10,2) not null,
  protection             numeric(10,2) not null,
  ship_method            text not null check (ship_method in ('relay','home','hand')),
  ship_label             text not null default '',
  ship_price             numeric(10,2) not null default 0,
  auth                   boolean not null default false,
  auth_price             numeric(10,2) not null default 0,
  total                  numeric(10,2) not null,
  status                 text not null default 'paid' check (status in ('paid','shipped','verified','disputed','rejected','done','cancelled')),
  shipping_name          text not null default '',
  shipping_address       text not null default '',
  shipping_zip           text not null default '',
  carrier                text,
  tracking               text,
  shipped_at             timestamptz,
  delivered_at           timestamptz,
  stripe_session_id      text unique,
  stripe_payment_intent  text,
  transfer_id            text,
  payout_status          text not null default 'held' check (payout_status in ('held','awaiting_seller','paid','refunded')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists orders_buyer_idx on public.orders (buyer_id);
create index if not exists orders_seller_idx on public.orders (seller_id);

create table if not exists public.reviews (
  order_id    uuid primary key references public.orders(id) on delete cascade,
  seller_id   uuid references public.profiles(id) on delete cascade,
  buyer_id    uuid references public.profiles(id) on delete set null,
  stars       int not null check (stars between 1 and 5),
  body        text not null default '' check (char_length(body) <= 400),
  created_at  timestamptz not null default now()
);

create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid references public.profiles(id) on delete set null,
  listing_id   uuid references public.listings(id) on delete cascade,
  reason       text not null check (reason in ('contrefacon','interdit','arnaque','inapproprie','autre')),
  details      text not null default '' check (char_length(details) <= 1000),
  status       text not null default 'open' check (status in ('open','actioned','dismissed')),
  decision     text,
  handled_by   uuid references public.profiles(id) on delete set null,
  handled_at   timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Fonctions utilitaires
-- ---------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Crée le profil à l'inscription (le pseudo vient des métadonnées d'inscription).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  wanted text := lower(coalesce(new.raw_user_meta_data->>'username', ''));
begin
  wanted := regexp_replace(wanted, '[^a-z0-9._-]', '', 'g');
  if char_length(wanted) < 3 or char_length(wanted) > 24 or exists (select 1 from public.profiles where username = wanted) then
    wanted := 'membre' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  insert into public.profiles (id, username) values (new.id, wanted);
  insert into public.user_settings (user_id) values (new.id);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un membre ne peut pas se donner les droits admin ni se déclarer payable.
create or replace function public.guard_profile_update() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.is_admin := old.is_admin;
    new.payouts_ready := old.payouts_ready;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;
drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Un vendeur modifie ses annonces actives, et peut seulement les retirer.
-- Réservation et vente passent par le serveur (paiement Stripe).
create or replace function public.guard_listing_update() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.seller_id := old.seller_id;
    new.buyer_id := old.buyer_id;
    new.reserved_until := old.reserved_until;
    new.reserved_by := old.reserved_by;
    new.moderation_note := old.moderation_note;
    new.created_at := old.created_at;
    if new.status is distinct from old.status and not (old.status = 'active' and new.status = 'removed') then
      raise exception 'Seul le paiement peut réserver ou vendre une annonce';
    end if;
    if old.status <> 'active' and new.status = old.status then
      raise exception 'Une annonce réservée, vendue ou retirée ne peut plus être modifiée';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists guard_listing_update on public.listings;
create trigger guard_listing_update before update on public.listings
  for each row execute function public.guard_listing_update();

-- Une offre doit être inférieure au prix affiché et l'annonce encore en vente.
create or replace function public.check_offer() returns trigger
language plpgsql security definer set search_path = public as $$
declare lp numeric; ls text;
begin
  if new.kind = 'offer' then
    select l.price, l.status into lp, ls
      from public.threads t join public.listings l on l.id = t.listing_id where t.id = new.thread_id;
    if lp is null or ls <> 'active' then raise exception 'Cette annonce n’est plus en vente'; end if;
    if new.amount >= lp then raise exception 'L’offre doit être inférieure au prix affiché'; end if;
  end if;
  return new;
end $$;
drop trigger if exists check_offer on public.messages;
create trigger check_offer before insert on public.messages
  for each row execute function public.check_offer();

create or replace function public.touch_thread() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.threads set updated_at = now() where id = new.thread_id;
  return new;
end $$;
drop trigger if exists touch_thread on public.messages;
create trigger touch_thread after insert on public.messages
  for each row execute function public.touch_thread();

-- ---------------------------------------------------------------------
-- Actions protégées appelées par l'appli (RPC)
-- ---------------------------------------------------------------------

-- Le vendeur accepte ou refuse une offre.
create or replace function public.answer_offer(p_message_id bigint, p_accept boolean) returns void
language plpgsql security definer set search_path = public as $$
declare m public.messages; t public.threads;
begin
  select * into m from public.messages where id = p_message_id for update;
  if not found or m.kind <> 'offer' or m.state <> 'pending' then raise exception 'Offre introuvable ou déjà traitée'; end if;
  select * into t from public.threads where id = m.thread_id;
  if t.seller_id is distinct from auth.uid() then raise exception 'Seul le vendeur peut répondre à cette offre'; end if;
  update public.messages set state = case when p_accept then 'accepted' else 'declined' end where id = m.id;
  if p_accept then
    update public.threads set accepted_price = m.amount where id = t.id;
  end if;
  insert into public.messages (thread_id, from_id, kind, body)
  values (t.id, auth.uid(), 'msg',
    case when p_accept then 'C’est d’accord pour ' || to_char(m.amount, 'FM999990D00') || ' €. Tu peux acheter à ce prix.'
         else 'Désolé, je ne peux pas descendre à ce prix.' end);
end $$;

-- Le vendeur déclare l'envoi (transporteur + numéro de suivi).
create or replace function public.mark_shipped(p_order uuid, p_carrier text, p_tracking text) returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found or o.seller_id is distinct from auth.uid() then raise exception 'Commande introuvable'; end if;
  if o.status <> 'paid' then raise exception 'Cette commande a déjà été expédiée'; end if;
  if o.ship_method <> 'hand' and (coalesce(trim(p_tracking), '') = '' or p_carrier not in ('mondialrelay','colissimo','chronopost','laposte','autre')) then
    raise exception 'Indique le transporteur et le numéro de suivi';
  end if;
  update public.orders set status = 'shipped', carrier = nullif(p_carrier, ''), tracking = nullif(trim(p_tracking), ''),
    shipped_at = now(), updated_at = now() where id = p_order;
end $$;

-- Un modérateur traite un signalement (DSA : décision motivée conservée).
create or replace function public.handle_report(p_report uuid, p_remove boolean, p_decision text) returns void
language plpgsql security definer set search_path = public as $$
declare r public.reports;
begin
  if not public.is_admin() then raise exception 'Réservé à la modération'; end if;
  select * into r from public.reports where id = p_report for update;
  if not found or r.status <> 'open' then raise exception 'Signalement introuvable ou déjà traité'; end if;
  if coalesce(trim(p_decision), '') = '' then raise exception 'Indique le motif de la décision'; end if;
  update public.reports set status = case when p_remove then 'actioned' else 'dismissed' end,
    decision = p_decision, handled_by = auth.uid(), handled_at = now() where id = p_report;
  if p_remove then
    update public.listings set status = 'removed', moderation_note = p_decision where id = r.listing_id and status = 'active';
  end if;
end $$;

-- Remet en vente les annonces dont la réservation (paiement abandonné) a expiré.
create or replace function public.release_expired_reservations() returns void
language sql security definer set search_path = public as $$
  update public.listings set status = 'active', reserved_until = null, reserved_by = null
  where status = 'reserved' and reserved_until < now();
$$;

-- Droit à l'effacement (RGPD). Les commandes restent conservées (obligations comptables),
-- mais ne sont plus rattachées au compte.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if exists (select 1 from public.orders where (buyer_id = auth.uid() or seller_id = auth.uid()) and status in ('paid','shipped','verified')) then
    raise exception 'Termine d’abord tes commandes en cours';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke execute on function public.answer_offer(bigint, boolean) from public, anon;
revoke execute on function public.mark_shipped(uuid, text, text) from public, anon;
revoke execute on function public.handle_report(uuid, boolean, text) from public, anon;
revoke execute on function public.delete_my_account() from public, anon;
revoke execute on function public.release_expired_reservations() from public, anon, authenticated;
grant execute on function public.answer_offer(bigint, boolean) to authenticated;
grant execute on function public.mark_shipped(uuid, text, text) to authenticated;
grant execute on function public.handle_report(uuid, boolean, text) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------------------
-- Règles d'accès (RLS)
-- ---------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.user_settings   enable row level security;
alter table public.seller_accounts enable row level security;   -- aucune règle : serveur uniquement
alter table public.listings        enable row level security;
alter table public.likes           enable row level security;
alter table public.threads         enable row level security;
alter table public.messages        enable row level security;
alter table public.orders          enable row level security;   -- écrites uniquement par le serveur et les RPC
alter table public.reviews         enable row level security;
alter table public.reports         enable row level security;

drop policy if exists "profils publics" on public.profiles;
create policy "profils publics" on public.profiles for select using (true);
drop policy if exists "je modifie mon profil" on public.profiles;
create policy "je modifie mon profil" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "mes réglages" on public.user_settings;
create policy "mes réglages" on public.user_settings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "annonces visibles" on public.listings;
create policy "annonces visibles" on public.listings for select
  using (status <> 'removed' or seller_id = auth.uid() or public.is_admin());
drop policy if exists "je publie" on public.listings;
create policy "je publie" on public.listings for insert to authenticated
  with check (seller_id = auth.uid() and status = 'active' and buyer_id is null and reserved_until is null and reserved_by is null and moderation_note is null);
drop policy if exists "je modifie mes annonces" on public.listings;
create policy "je modifie mes annonces" on public.listings for update to authenticated
  using (seller_id = auth.uid()) with check (seller_id = auth.uid());

drop policy if exists "favoris visibles" on public.likes;
create policy "favoris visibles" on public.likes for select using (true);
drop policy if exists "j'ajoute un favori" on public.likes;
create policy "j'ajoute un favori" on public.likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "je retire un favori" on public.likes;
create policy "je retire un favori" on public.likes for delete to authenticated using (user_id = auth.uid());

drop policy if exists "mes conversations" on public.threads;
create policy "mes conversations" on public.threads for select to authenticated
  using (auth.uid() in (buyer_id, seller_id));
drop policy if exists "je contacte un vendeur" on public.threads;
create policy "je contacte un vendeur" on public.threads for insert to authenticated
  with check (
    buyer_id = auth.uid() and accepted_price is null and buyer_id <> seller_id
    and seller_id = (select l.seller_id from public.listings l where l.id = listing_id and l.status = 'active')
  );

drop policy if exists "messages de mes conversations" on public.messages;
create policy "messages de mes conversations" on public.messages for select to authenticated
  using (exists (select 1 from public.threads t where t.id = thread_id and auth.uid() in (t.buyer_id, t.seller_id)));
drop policy if exists "j'écris dans mes conversations" on public.messages;
create policy "j'écris dans mes conversations" on public.messages for insert to authenticated
  with check (
    from_id = auth.uid()
    and exists (select 1 from public.threads t where t.id = thread_id and auth.uid() in (t.buyer_id, t.seller_id))
    and (
      (kind = 'msg' and amount is null and state is null and char_length(trim(body)) > 0)
      or (kind = 'offer' and state = 'pending' and amount is not null
          and exists (select 1 from public.threads t where t.id = thread_id and t.buyer_id = auth.uid()))
    )
  );

drop policy if exists "mes commandes" on public.orders;
create policy "mes commandes" on public.orders for select to authenticated
  using (auth.uid() in (buyer_id, seller_id) or public.is_admin());

drop policy if exists "avis publics" on public.reviews;
create policy "avis publics" on public.reviews for select using (true);
drop policy if exists "j'évalue ma commande" on public.reviews;
create policy "j'évalue ma commande" on public.reviews for insert to authenticated
  with check (
    buyer_id = auth.uid()
    and exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()
                and o.seller_id = reviews.seller_id and o.status = 'done')
  );

drop policy if exists "mes signalements" on public.reports;
create policy "mes signalements" on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());
drop policy if exists "je signale" on public.reports;
create policy "je signale" on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'open' and decision is null and handled_by is null);

-- ---------------------------------------------------------------------
-- Photos (Supabase Storage) : lecture publique, chacun écrit dans son dossier.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
  on conflict (id) do nothing;

drop policy if exists "photos : j'envoie dans mon dossier" on storage.objects;
create policy "photos : j'envoie dans mon dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos : je supprime les miennes" on storage.objects;
create policy "photos : je supprime les miennes" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos : je liste les miennes" on storage.objects;
create policy "photos : je liste les miennes" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------
-- Litiges, préférences e-mail, informations fiscales (DAC7)
-- ---------------------------------------------------------------------
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('paid','shipped','verified','disputed','rejected','done','cancelled'));
alter table public.orders add column if not exists dispute_reason text
  check (dispute_reason is null or dispute_reason in ('non_recue','non_conforme','contrefacon','abimee','autre'));
alter table public.orders add column if not exists dispute_details text check (char_length(dispute_details) <= 1000);
alter table public.orders add column if not exists dispute_opened_at timestamptz;
alter table public.orders add column if not exists dispute_resolution text;

alter table public.user_settings add column if not exists email_notifs boolean not null default true;

-- L'acheteur ouvre un litige avant de confirmer la réception : l'argent reste bloqué
-- jusqu'à la décision de la modération (fonction order-action : dispute-refund / dispute-release).
create or replace function public.open_dispute(p_order uuid, p_reason text, p_details text) returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found or o.buyer_id is distinct from auth.uid() then raise exception 'Commande introuvable'; end if;
  if o.status not in ('shipped','verified') then raise exception 'Un litige s’ouvre après l’envoi et avant la confirmation de réception'; end if;
  if p_reason not in ('non_recue','non_conforme','contrefacon','abimee','autre') then raise exception 'Motif de litige inconnu'; end if;
  if coalesce(trim(p_details), '') = '' then raise exception 'Décris le problème en quelques mots'; end if;
  update public.orders set status = 'disputed', dispute_reason = p_reason, dispute_details = left(trim(p_details), 1000),
    dispute_opened_at = now(), updated_at = now() where id = p_order;
end $$;
revoke execute on function public.open_dispute(uuid, text, text) from public, anon;
grant execute on function public.open_dispute(uuid, text, text) to authenticated;

-- Informations fiscales des vendeurs, demandées pour la déclaration DAC7.
-- Visibles par leur propriétaire et par la modération uniquement.
create table if not exists public.seller_tax_info (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  legal_name  text not null check (char_length(legal_name) between 3 and 120),
  birth_date  date not null check (birth_date < current_date - interval '18 years'),
  address     text not null check (char_length(address) between 5 and 200),
  tin         text not null check (tin ~ '^[0-9 ]{13,17}$'),   -- numéro fiscal français : 13 chiffres
  updated_at  timestamptz not null default now()
);
alter table public.seller_tax_info enable row level security;
drop policy if exists "mes infos fiscales" on public.seller_tax_info;
create policy "mes infos fiscales" on public.seller_tax_info for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "infos fiscales : modération" on public.seller_tax_info;
create policy "infos fiscales : modération" on public.seller_tax_info for select to authenticated
  using (public.is_admin());

-- Rapport annuel DAC7 : vendeurs ayant au moins 30 ventes ou au moins 2 000 € sur l'année civile.
-- Montants = prix des paires (contrepartie reçue par le vendeur), commandes terminées.
create or replace function public.dac7_report(p_year int)
returns table (seller_id uuid, username text, email text, legal_name text, birth_date date, address text, tin text,
               sales_count bigint, sales_total numeric, q1 numeric, q2 numeric, q3 numeric, q4 numeric)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'Réservé à la modération'; end if;
  return query
  with s as (
    select o.seller_id, count(*) as n, sum(o.price) as total,
      sum(o.price) filter (where extract(quarter from coalesce(o.delivered_at, o.created_at)) = 1) as t1,
      sum(o.price) filter (where extract(quarter from coalesce(o.delivered_at, o.created_at)) = 2) as t2,
      sum(o.price) filter (where extract(quarter from coalesce(o.delivered_at, o.created_at)) = 3) as t3,
      sum(o.price) filter (where extract(quarter from coalesce(o.delivered_at, o.created_at)) = 4) as t4
    from public.orders o
    where o.status = 'done' and o.seller_id is not null
      and extract(year from coalesce(o.delivered_at, o.created_at)) = p_year
    group by o.seller_id
  )
  select s.seller_id, p.username, u.email::text, t.legal_name, t.birth_date, t.address, t.tin,
         s.n, s.total, coalesce(s.t1, 0), coalesce(s.t2, 0), coalesce(s.t3, 0), coalesce(s.t4, 0)
  from s
  join public.profiles p on p.id = s.seller_id
  join auth.users u on u.id = s.seller_id
  left join public.seller_tax_info t on t.user_id = s.seller_id
  where s.n >= 30 or s.total >= 2000
  order by s.total desc;
end $$;
revoke execute on function public.dac7_report(int) from public, anon;
grant execute on function public.dac7_report(int) to authenticated;

-- ---------------------------------------------------------------------
-- Temps réel : l'appli se met à jour dès qu'une ligne change.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles','listings','likes','threads','messages','orders','reviews','reports'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
