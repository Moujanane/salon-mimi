-- supabase-schema.sql
-- Exécuter dans le SQL Editor du dashboard Supabase

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

-- Activer RLS
alter table reservations enable row level security;

-- anon peut insérer (formulaire public)
create policy "anon_insert_reservations"
  on reservations for insert
  to anon
  with check (true);

-- authenticated peut lire et modifier (dashboard admin)
create policy "authenticated_select_reservations"
  on reservations for select
  to authenticated
  using (true);

create policy "authenticated_update_reservations"
  on reservations for update
  to authenticated
  using (true);
