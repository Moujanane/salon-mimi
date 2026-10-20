-- ============================================================
-- Durcissement sécurité de la base — audit du 19/10/2026
-- ============================================================
--
-- À EXÉCUTER dans Supabase > SQL Editor, APRÈS avoir déployé le code qui lit
-- les réservations avec la clé serveur (commits « fix(securite) » de la branche
-- fix/security-hardening) et défini ADMIN_EMAILS dans Railway.
--
-- Pourquoi : l'application n'utilise la clé publique (anon / authenticated)
-- que pour la CONNEXION admin. Toutes les lectures et écritures de
-- reservations / settings / push_subscriptions passent par les routes serveur
-- (clé service_role, qui ignore les règles de sécurité de ligne). Ces règles
-- « anon » et « authenticated » ne servaient donc à rien pour le site, mais elles
-- exposaient la base à n'importe qui possédant la clé publique (visible dans le
-- code du site) :
--   - anon_insert_reservations           : n'importe qui pouvait écrire des
--                                          réservations directement, sans
--                                          validation ni limite de demandes
--   - authenticated_select_reservations  : tout compte (inscriptions ouvertes)
--     authenticated_update_reservations    lisait et modifiait les données clients
--   - anon_select_settings               : n'importe qui lisait les réglages,
--                                          dont l'e-mail de notification
--   - authenticated_all_settings         : tout compte écrivait les réglages
--
-- Ce script est idempotent (peut être relancé sans risque) et ne supprime
-- aucune donnée. Il garde RLS activé : sans règle, anon et authenticated ne
-- voient rien ; service_role (le site) continue de tout faire.
-- Les règles de gallery_items (galerie publique) ne sont PAS touchées.
--
-- Retour arrière : recréer les règles listées dans supabase-schema.sql
-- (historique git : commit précédent ce fichier).
-- ============================================================

begin;

-- 1. RLS reste activé sur les tables sensibles.
alter table public.reservations enable row level security;
alter table public.settings enable row level security;
alter table public.push_subscriptions enable row level security;

-- 2. Supprimer TOUTES les règles qui ne concernent pas uniquement service_role
--    (quel que soit leur nom : la base réelle peut différer du fichier schéma).
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('reservations', 'settings', 'push_subscriptions')
      and not (roles = array['service_role']::name[])
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      p.policyname, p.schemaname, p.tablename
    );
    raise notice 'règle supprimée : %.% -> %', p.schemaname, p.tablename, p.policyname;
  end loop;
end
$$;

-- 3. Ceinture et bretelles : retirer aussi les droits de table à anon et
--    authenticated, pour qu'une règle ajoutée par erreur plus tard ne rouvre rien.
revoke all on table public.reservations from anon, authenticated;
revoke all on table public.settings from anon, authenticated;
revoke all on table public.push_subscriptions from anon, authenticated;

commit;

-- ============================================================
-- VÉRIFICATIONS (à lancer après le script)
-- ============================================================
-- a) Il ne doit rester AUCUNE règle pour anon / authenticated sur ces 3 tables :
--
--   select tablename, policyname, roles, cmd
--   from pg_policies
--   where schemaname = 'public'
--     and tablename in ('reservations', 'settings', 'push_subscriptions')
--   order by tablename, policyname;
--
--   (seules des lignes avec roles = {service_role} sont acceptables)
--
-- b) Stockage des photos (storage.objects) : seule la LECTURE publique des
--    fichiers doit exister. Aucune règle INSERT / UPDATE / DELETE pour anon ou
--    authenticated (les envois passent par le serveur).
--
--   select policyname, roles, cmd
--   from pg_policies
--   where schemaname = 'storage' and tablename = 'objects';
--
-- c) Ce script NE TOUCHE PAS aux comptes ni aux données déjà présentes. Pendant
--    la période où les inscriptions étaient ouvertes, quelqu'un a pu créer un
--    compte ou modifier des données. À relire À LA MAIN :
--
--   -- comptes existants : seuls les tiens doivent apparaître (supprimer les
--   -- autres dans Authentication > Users)
--   select id, email, created_at, email_confirmed_at, last_sign_in_at
--   from auth.users order by created_at;
--
--   -- réglages : vérifier surtout whatsapp_number (utilisé dans les liens
--   -- WhatsApp du site) et notification_email
--   select key, value, updated_at from public.settings order by key;
--
--   -- abonnements aux notifications : seuls tes appareils doivent apparaître
--   select id, left(endpoint, 60) as endpoint, created_at
--   from public.push_subscriptions order by created_at;
--
--   -- réservations suspectes (texte étrange dans heure / nombre de personnes)
--   select id, nom, heure_souhaitee, nombre_personnes, created_at
--   from public.reservations
--   where heure_souhaitee ~ '[<>"''=]' or nombre_personnes ~ '[<>"''=]';
--
-- d) DÉSACTIVER les inscriptions : Supabase > Authentication > Sign In / Providers
--    (désactiver « Allow new users to sign up »). Le code de l'application ne
--    peut pas le garantir ; npm run audit:security le vérifie.
--
-- e) Puis, depuis le dossier du projet :   npm run audit:security
--    (sonde la base comme un visiteur anonyme, en lecture seule)
