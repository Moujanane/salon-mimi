-- supabase-schema.sql
-- Documentation du schéma réel — vérifié en base le 5 sept. 2026 (audit RLS).
--
-- ATTENTION : ce fichier est de la DOCUMENTATION, pas la source de vérité.
-- Les politiques RLS réelles vivent dans le dashboard Supabase (Database →
-- Policies). Toute modification RLS doit être appliquée dans le dashboard ET
-- reflétée ici, puis vérifiée manuellement sur /admin/dashboard (voir mémoire
-- projet, leçon RLS).

-- ============================================================
-- Table: reservations
-- ============================================================
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  telephone text not null,
  service text not null,
  date_souhaitee date,
  message text,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'confirmee', 'annulee')),
  created_at timestamptz default now()
);

alter table reservations enable row level security;

-- anon peut insérer (formulaire public /reservation)
create policy "anon_insert_reservations"
  on reservations for insert
  to anon
  with check (true);

-- authenticated peut lire et modifier (dashboard admin /admin/dashboard)
-- CRITIQUE : cette policy SELECT est celle qui a déjà sauté silencieusement
-- lors d'un audit sécurité passé et cassé le dashboard admin. Ne jamais la
-- supprimer sans vérifier /admin/dashboard immédiatement après.
create policy "authenticated_select_reservations"
  on reservations for select
  to authenticated
  using (true);

create policy "authenticated_update_reservations"
  on reservations for update
  to authenticated
  using (true);

-- Pas de policy DELETE pour anon/authenticated — seul service_role (qui
-- bypass RLS) peut supprimer, via les routes API server-side.

-- ============================================================
-- Table: settings
-- ============================================================
-- Table clé-valeur (prix des services, numéro WhatsApp, etc.), lue par le
-- site public et modifiée depuis /admin/settings et la PWA Mimi.
create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table settings enable row level security;

-- anon peut lire (prix affichés sur le site public, sans authentification)
create policy "anon_select_settings"
  on settings for select
  to anon
  using (true);

-- authenticated peut tout faire (large — non exploitée aujourd'hui : le
-- code applicatif (app/api/settings, app/api/mimi-settings) passe toujours
-- par service_role, jamais par une requête authenticated directe. Cette
-- policy reste large ; à resserrer si un jour un composant navigateur
-- authentifié écrit directement dans cette table sans passer par une API).
create policy "authenticated_all_settings"
  on settings for all
  to authenticated
  using (true)
  with check (true);

create policy "service_role_all_settings"
  on settings for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- Table: push_subscriptions
-- ============================================================
-- Abonnements Web Push (notifications à Mimi/Mouj à chaque réservation).
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;

-- Seul service_role accède à cette table — aucune policy anon/authenticated.
-- Cohérent avec le code actuel : tout accès (insert/select/delete) passe par
-- app/api/push, lib/sendPushToMimi.ts, côté serveur avec service_role.
-- ATTENTION : si un composant navigateur authentifié doit un jour lire/écrire
-- cette table directement (ex. gestion des abonnements depuis /admin), il
-- faudra ajouter une policy "authenticated" — sans elle, l'accès échoue
-- silencieusement (0 lignes, pas d'erreur).
create policy "service_role_all"
  on push_subscriptions for all
  to service_role
  using (true)
  with check (true);
