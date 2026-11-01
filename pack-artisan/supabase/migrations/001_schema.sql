-- Pack artisan : base de données (Supabase / PostgreSQL)
-- Règle d'or : chaque donnée appartient à UNE entreprise, et un utilisateur ne voit
-- que les entreprises dont il est membre. La sécurité est dans la base (Row Level
-- Security), pas dans la page : même avec la clé publique, impossible de lire ailleurs.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables
create table public.entreprises (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null check (char_length(nom) between 2 and 120),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  telephone   text check (char_length(telephone) <= 30),
  email       text check (char_length(email) <= 200),
  ville       text check (char_length(ville) <= 120),
  formulaire_actif boolean not null default true,
  cree_le     timestamptz not null default now()
);

create table public.membres (
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'membre' check (role in ('proprietaire', 'membre')),
  cree_le       timestamptz not null default now(),
  primary key (entreprise_id, user_id)
);
create index on public.membres (user_id);

create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  nom           text not null check (char_length(nom) between 1 and 120),
  telephone     text check (char_length(telephone) <= 30),
  email         text check (char_length(email) <= 200),
  ville         text check (char_length(ville) <= 120),
  adresse       text check (char_length(adresse) <= 300),
  notes         text check (char_length(notes) <= 5000),
  cree_le       timestamptz not null default now(),
  unique (id, entreprise_id)
);
create index on public.clients (entreprise_id);

create table public.demandes (
  id            uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  client_id     uuid,
  nom           text not null check (char_length(nom) between 1 and 120),
  telephone     text not null check (char_length(telephone) between 6 and 30),
  email         text check (char_length(email) <= 200),
  ville         text check (char_length(ville) <= 120),
  intervention  text not null default 'Autre' check (char_length(intervention) <= 80),
  urgence       text not null default 'semaine' check (urgence in ('urgent', 'semaine', 'pas')),
  message       text check (char_length(message) <= 3000),
  statut        text not null default 'nouveau' check (statut in ('nouveau', 'rappeler', 'devis', 'gagne', 'perdu')),
  montant       numeric(10,2) check (montant is null or montant >= 0),
  source        text not null default 'manuel' check (source in ('site', 'manuel', 'telephone')),
  notes         text check (char_length(notes) <= 5000),
  recue_le      timestamptz not null default now(),
  maj_le        timestamptz not null default now(),
  unique (id, entreprise_id),
  -- le client lié doit être de la même entreprise
  foreign key (client_id, entreprise_id) references public.clients(id, entreprise_id) on delete set null (client_id)
);
create index on public.demandes (entreprise_id, recue_le desc);
create index on public.demandes (entreprise_id, statut);

create table public.rendez_vous (
  id            uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  demande_id    uuid,
  debut         timestamptz not null,
  fin           timestamptz not null,
  motif         text not null check (char_length(motif) between 1 and 200),
  statut        text not null default 'prevu' check (statut in ('prevu', 'confirme', 'fait', 'annule')),
  cree_le       timestamptz not null default now(),
  check (fin > debut),
  foreign key (demande_id, entreprise_id) references public.demandes(id, entreprise_id) on delete cascade
);
create index on public.rendez_vous (entreprise_id, debut);

-- Historique : tout ce qui arrive à une demande (fait par quelqu'un, automatique, ou programmé).
create table public.activites (
  id            uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  demande_id    uuid,
  type          text not null check (type in ('reception', 'statut', 'note', 'appel', 'rdv', 'message', 'relance', 'avis', 'autre')),
  texte         text not null check (char_length(texte) <= 1000),
  automatique   boolean not null default false,
  prevu_le      timestamptz,          -- rempli = action programmée (pas encore faite)
  fait_le       timestamptz,          -- rempli = action faite
  auteur        uuid references auth.users(id) on delete set null,
  cree_le       timestamptz not null default now(),
  foreign key (demande_id, entreprise_id) references public.demandes(id, entreprise_id) on delete cascade
);
create index on public.activites (entreprise_id, demande_id, cree_le);
create index on public.activites (prevu_le) where fait_le is null and prevu_le is not null;

create table public.automatisations (
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  code          text not null check (code in ('confirmation', 'alerte_urgence', 'rappel_non_traite', 'relance_devis', 'rappel_rdv', 'demande_avis')),
  actif         boolean not null default true,
  primary key (entreprise_id, code)
);

-- ---------------------------------------------------------------- fonctions utiles
create or replace function public.est_membre(e uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membres where entreprise_id = e and user_id = auth.uid());
$$;

create or replace function public.est_proprietaire(e uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membres where entreprise_id = e and user_id = auth.uid() and role = 'proprietaire');
$$;

-- Créer son entreprise (appelé juste après l'inscription). Le créateur devient propriétaire.
create or replace function public.creer_entreprise(p_nom text, p_slug text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'connexion requise'; end if;
  insert into public.entreprises (nom, slug) values (trim(p_nom), lower(trim(p_slug))) returning id into v_id;
  insert into public.membres (entreprise_id, user_id, role) values (v_id, auth.uid(), 'proprietaire');
  insert into public.automatisations (entreprise_id, code, actif)
    select v_id, c, true from unnest(array['confirmation','alerte_urgence','rappel_non_traite','relance_devis','rappel_rdv','demande_avis']) c;
  return v_id;
end $$;

-- Formulaire public du site de l'artisan : seule porte ouverte aux visiteurs (rôle anon).
-- Ils ne peuvent RIEN lire ; ils peuvent seulement déposer une demande chez une entreprise
-- dont le formulaire est actif. Garde-fous : longueurs, champ piège anti-robot, limite de débit.
create or replace function public.envoyer_demande(
  p_slug text, p_nom text, p_telephone text, p_ville text, p_intervention text,
  p_urgence text, p_message text, p_email text default null, p_piege text default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_e uuid; v_d uuid;
begin
  if coalesce(p_piege, '') <> '' then return true; end if;               -- robot : on fait semblant
  select id into v_e from public.entreprises where slug = lower(p_slug) and formulaire_actif;
  if v_e is null then raise exception 'formulaire introuvable'; end if;
  if char_length(coalesce(trim(p_nom), '')) < 2 then raise exception 'nom manquant'; end if;
  if coalesce(p_telephone, '') !~ '^[0-9 +().-]{6,30}$' then raise exception 'téléphone invalide'; end if;
  if (select count(*) from public.demandes where entreprise_id = v_e and source = 'site' and recue_le > now() - interval '10 minutes') >= 20
     or (select count(*) from public.demandes where entreprise_id = v_e and telephone = p_telephone and recue_le > now() - interval '1 hour') >= 3
  then raise exception 'trop de demandes, réessayez plus tard'; end if;
  insert into public.demandes (entreprise_id, nom, telephone, email, ville, intervention, urgence, message, source)
  values (v_e, left(trim(p_nom), 120), trim(p_telephone), nullif(left(trim(coalesce(p_email, '')), 200), ''),
          left(trim(coalesce(p_ville, '')), 120), left(coalesce(nullif(trim(p_intervention), ''), 'Autre'), 80),
          case when p_urgence in ('urgent', 'semaine', 'pas') then p_urgence else 'semaine' end,
          left(coalesce(p_message, ''), 3000), 'site')
  returning id into v_d;
  return true;
end $$;

-- ---------------------------------------------------------------- historique automatique
create or replace function public.trace_demande()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activites (entreprise_id, demande_id, type, texte, automatique, fait_le, auteur)
    values (new.entreprise_id, new.id, 'reception',
            case new.source when 'site' then 'Demande reçue par le formulaire du site' when 'telephone' then 'Demande notée au téléphone' else 'Demande ajoutée à la main' end,
            new.source = 'site', now(), auth.uid());
  elsif new.statut is distinct from old.statut then
    insert into public.activites (entreprise_id, demande_id, type, texte, fait_le, auteur)
    values (new.entreprise_id, new.id, 'statut', 'Statut : ' || old.statut || ' → ' || new.statut, now(), auth.uid());
    -- une demande traitée n'a plus besoin du rappel « personne n'a appelé »
    if new.statut not in ('nouveau', 'rappeler') then
      delete from public.activites where demande_id = new.id and type = 'relance' and fait_le is null and texte like 'Rappel%';
    end if;
  end if;
  new.maj_le := now();
  return new;
end $$;
create trigger demandes_trace_ins after insert on public.demandes for each row execute function public.trace_demande();
create trigger demandes_trace_upd before update on public.demandes for each row execute function public.trace_demande();

-- L'entreprise d'une ligne ne peut pas changer (on ne « déplace » pas une donnée chez un autre).
create or replace function public.entreprise_fixe()
returns trigger language plpgsql as $$
begin
  if new.entreprise_id is distinct from old.entreprise_id then raise exception 'entreprise non modifiable'; end if;
  return new;
end $$;
create trigger clients_fixe before update on public.clients for each row execute function public.entreprise_fixe();
create trigger demandes_fixe before update on public.demandes for each row execute function public.entreprise_fixe();
create trigger rdv_fixe before update on public.rendez_vous for each row execute function public.entreprise_fixe();
create trigger activites_fixe before update on public.activites for each row execute function public.entreprise_fixe();

-- ---------------------------------------------------------------- sécurité (RLS)
alter table public.entreprises     enable row level security;
alter table public.membres         enable row level security;
alter table public.clients         enable row level security;
alter table public.demandes        enable row level security;
alter table public.rendez_vous     enable row level security;
alter table public.activites       enable row level security;
alter table public.automatisations enable row level security;

create policy entreprises_lire on public.entreprises for select to authenticated using (public.est_membre(id));
create policy entreprises_modifier on public.entreprises for update to authenticated using (public.est_proprietaire(id)) with check (public.est_proprietaire(id));

create policy membres_lire on public.membres for select to authenticated using (public.est_membre(entreprise_id));
create policy membres_gerer on public.membres for all to authenticated using (public.est_proprietaire(entreprise_id)) with check (public.est_proprietaire(entreprise_id));

create policy clients_tout on public.clients for all to authenticated using (public.est_membre(entreprise_id)) with check (public.est_membre(entreprise_id));
create policy demandes_tout on public.demandes for all to authenticated using (public.est_membre(entreprise_id)) with check (public.est_membre(entreprise_id));
create policy rdv_tout on public.rendez_vous for all to authenticated using (public.est_membre(entreprise_id)) with check (public.est_membre(entreprise_id));
create policy activites_tout on public.activites for all to authenticated using (public.est_membre(entreprise_id)) with check (public.est_membre(entreprise_id));
create policy automatisations_lire on public.automatisations for select to authenticated using (public.est_membre(entreprise_id));
create policy automatisations_modifier on public.automatisations for update to authenticated using (public.est_membre(entreprise_id)) with check (public.est_membre(entreprise_id));

-- Droits : les visiteurs (anon) n'ont accès à aucune table, seulement au formulaire.
revoke all on all tables in schema public from anon;
revoke all on function public.creer_entreprise(text, text) from public, anon;
revoke all on function public.envoyer_demande(text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.envoyer_demande(text, text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.creer_entreprise(text, text) to authenticated;
grant select, insert, update, delete on public.clients, public.demandes, public.rendez_vous, public.activites to authenticated;
grant select, update on public.entreprises, public.automatisations to authenticated;
grant select, insert, update, delete on public.membres to authenticated;
