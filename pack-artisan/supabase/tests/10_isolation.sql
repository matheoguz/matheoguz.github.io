-- Tests : une entreprise ne voit et ne modifie jamais les données d'une autre.
-- Chaque vérification lève une erreur si elle échoue ; le script s'arrête alors (ON_ERROR_STOP).
\set ON_ERROR_STOP on
insert into auth.users values ('aaaaaaaa-0000-0000-0000-000000000001', 'julien@exemple.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'paul@exemple.fr'), ('cccccccc-0000-0000-0000-000000000003', 'intrus@exemple.fr');

-- Julien crée Martin Plomberie, Paul crée Durand Chauffage
set role authenticated; set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
select public.creer_entreprise('Martin Plomberie', 'martin-plomberie');
insert into public.clients (entreprise_id, nom, telephone) select id, 'Client de Julien', '0600000001' from public.entreprises;
set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002';
select public.creer_entreprise('Durand Chauffage', 'durand-chauffage');
insert into public.demandes (entreprise_id, nom, telephone) select id, 'Demande chez Paul', '0600000002' from public.entreprises;
reset role;

-- Un visiteur dépose une demande par le formulaire public de Julien
set role anon; reset request.jwt.claim.sub;
select public.envoyer_demande('martin-plomberie', 'Camille Roussel', '06 12 34 56 78', 'Mâcon', 'Chauffe-eau', 'urgent', 'Plus d''eau chaude');
do $$ begin
  begin perform 1 from public.demandes; raise exception 'ÉCHEC : un visiteur peut lire les demandes';
  exception when insufficient_privilege then null; end;
  begin insert into public.demandes (entreprise_id, nom, telephone) values (gen_random_uuid(), 'x', '0600000000'); raise exception 'ÉCHEC : un visiteur peut écrire une demande';
  exception when insufficient_privilege then null; end;
  begin perform public.envoyer_demande('n-existe-pas', 'Bob', '0600000000', '', '', '', ''); raise exception 'ÉCHEC : formulaire inconnu accepté';
  exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
  begin perform public.envoyer_demande('martin-plomberie', 'Bob', 'pas un numéro', '', '', '', ''); raise exception 'ÉCHEC : téléphone invalide accepté';
  exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
  begin perform public.creer_entreprise('Pirate', 'pirate'); raise exception 'ÉCHEC : un visiteur peut créer une entreprise';
  exception when insufficient_privilege then null; end;
end $$;
-- champ piège rempli : accepté en apparence, mais rien n'est enregistré (vérifié plus bas)
select public.envoyer_demande('martin-plomberie', 'Robot', '0600000009', '', '', '', '', null, 'http://spam');
reset role;

-- Julien ne voit que chez lui
set role authenticated; set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ declare n int; e_paul uuid; begin
  select count(*) into n from public.entreprises; if n <> 1 then raise exception 'ÉCHEC : Julien voit % entreprises', n; end if;
  select count(*) into n from public.demandes; if n <> 1 then raise exception 'ÉCHEC : Julien voit % demandes (attendu 1, celle du formulaire)', n; end if;
  select count(*) into n from public.demandes where source = 'site' and nom = 'Camille Roussel' and urgence = 'urgent'; if n <> 1 then raise exception 'ÉCHEC : la demande du formulaire n''est pas arrivée'; end if;
  select count(*) into n from public.demandes where nom = 'Robot'; if n <> 0 then raise exception 'ÉCHEC : le robot est passé'; end if;
  select count(*) into n from public.activites where type = 'reception'; if n <> 1 then raise exception 'ÉCHEC : historique de réception absent'; end if;
  select count(*) into n from public.automatisations; if n <> 6 then raise exception 'ÉCHEC : % automatisations (attendu 6)', n; end if;
  select count(*) into n from public.clients; if n <> 1 then raise exception 'ÉCHEC : Julien voit % clients', n; end if;

  -- tentatives d'aller chez Paul
  set role postgres; select id into e_paul from public.entreprises where slug = 'durand-chauffage'; set role authenticated;
  begin insert into public.demandes (entreprise_id, nom, telephone) values (e_paul, 'Injection', '0600000000'); raise exception 'ÉCHEC : Julien écrit chez Paul';
  exception when insufficient_privilege then null; end;
  update public.demandes set statut = 'perdu' where entreprise_id = e_paul; get diagnostics n = row_count; if n <> 0 then raise exception 'ÉCHEC : Julien modifie chez Paul'; end if;
  delete from public.demandes where entreprise_id = e_paul; get diagnostics n = row_count; if n <> 0 then raise exception 'ÉCHEC : Julien supprime chez Paul'; end if;
  begin update public.demandes set entreprise_id = e_paul; raise exception 'ÉCHEC : Julien déplace une demande chez Paul';
  exception when insufficient_privilege or raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
  begin insert into public.membres (entreprise_id, user_id) values (e_paul, auth.uid()); raise exception 'ÉCHEC : Julien s''ajoute chez Paul';
  exception when insufficient_privilege then null; end;
  update public.entreprises set nom = 'Piraté' where id = e_paul; get diagnostics n = row_count; if n <> 0 then raise exception 'ÉCHEC : Julien renomme l''entreprise de Paul'; end if;
end $$;

-- un client d'une autre entreprise ne peut pas être lié à une demande
do $$ declare c_julien uuid; d_paul uuid; begin
  set role postgres;
  select id into c_julien from public.clients limit 1; select id into d_paul from public.demandes where nom = 'Demande chez Paul';
  begin update public.demandes set client_id = c_julien where id = d_paul; raise exception 'ÉCHEC : client de Julien lié à une demande de Paul';
  exception when foreign_key_violation then null; end;
end $$;

-- statut changé → historique + le rappel « personne n'a appelé » disparaît
set role authenticated; set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
insert into public.activites (entreprise_id, demande_id, type, texte, automatique, prevu_le)
  select entreprise_id, id, 'relance', 'Rappel à Julien si personne n''a appelé', true, now() + interval '1 hour' from public.demandes;
update public.demandes set statut = 'devis', montant = 1390;
do $$ declare n int; begin
  select count(*) into n from public.activites where type = 'statut'; if n <> 1 then raise exception 'ÉCHEC : changement de statut non tracé'; end if;
  select count(*) into n from public.activites where type = 'relance' and fait_le is null; if n <> 0 then raise exception 'ÉCHEC : le rappel est resté'; end if;
end $$;

-- un intrus connecté mais sans entreprise ne voit rien
set request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000003';
do $$ declare n int; begin
  select (select count(*) from public.entreprises) + (select count(*) from public.demandes) + (select count(*) from public.clients) + (select count(*) from public.activites) + (select count(*) from public.membres) into n;
  if n <> 0 then raise exception 'ÉCHEC : un compte sans entreprise voit % lignes', n; end if;
end $$;

-- limite de débit du formulaire : 3 demandes par heure pour un même numéro
reset role; set role anon; reset request.jwt.claim.sub;
select public.envoyer_demande('martin-plomberie', 'Spam', '0611111111', '', '', '', '') from generate_series(1, 3);
do $$ begin
  perform public.envoyer_demande('martin-plomberie', 'Spam', '0611111111', '', '', '', '');
  raise exception 'ÉCHEC : la limite par numéro ne marche pas';
exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end $$;
reset role;
select 'TOUS LES TESTS SONT PASSÉS' as resultat;
