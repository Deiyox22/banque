-- Schéma Supabase — Dashboard de suivi prospects (ELS Tech)
-- Référence pour J1. À migrer vers supabase/migrations/0001_init.sql tel quel
-- (ou en plusieurs migrations) au démarrage du projet : `supabase migration new init`
-- puis copier ce contenu, ou `supabase db push` directement avec ce fichier.
--
-- Hypothèse : un seul utilisateur aujourd'hui, mais chaque table porte un
-- user_id pour que les politiques RLS restent correctes si un second compte
-- est créé un jour (cf. "Idées pour plus tard" dans ROADMAP.md).

create extension if not exists pgcrypto;

-- Fonction utilitaire pour maintenir updated_at automatiquement.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================================
-- prospects
-- =========================================================================
create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nom text not null,
  activite text,
  localisation text,
  telephone text,
  email text,
  site_actuel text,
  priorite text not null default 'Moyenne'
    check (priorite in ('Haute', 'Moyenne', 'Basse')),
  opportunite text,
  -- Brouillon de message d'approche personnalisé (issu de la feuille
  -- "Prospects" du fichier de seed — absent du schéma initial du brief).
  accroche text,
  statut text not null default 'À contacter'
    check (statut in (
      'À contacter', 'Maquette prête', 'Envoyée', 'Vue', 'Relancée',
      'Intéressé', 'RDV pris', 'Gagné', 'Refus', 'Sans réponse'
    )),
  prochaine_relance date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prospects_user_id_idx on public.prospects(user_id);
create index prospects_statut_idx on public.prospects(statut);
create index prospects_prochaine_relance_idx on public.prospects(prochaine_relance);

create trigger prospects_set_updated_at
  before update on public.prospects
  for each row execute function public.set_updated_at();

alter table public.prospects enable row level security;

create policy "prospects_select_own" on public.prospects
  for select using (auth.uid() = user_id);
create policy "prospects_insert_own" on public.prospects
  for insert with check (auth.uid() = user_id);
create policy "prospects_update_own" on public.prospects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "prospects_delete_own" on public.prospects
  for delete using (auth.uid() = user_id);

-- =========================================================================
-- mockups
-- =========================================================================
create table public.mockups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  nom_fichier text not null,
  version integer not null default 1,
  -- Chemin stable dans le bucket privé "mockups" (PAS une URL signée : elle
  -- expire et serait obsolète en base). L'URL signée est générée à l'affichage.
  storage_path text not null,
  parcours_demo text,
  identite_reprise text,
  a_valider text,
  created_at timestamptz not null default now()
);

create index mockups_user_id_idx on public.mockups(user_id);
create index mockups_prospect_id_idx on public.mockups(prospect_id);

alter table public.mockups enable row level security;

create policy "mockups_select_own" on public.mockups
  for select using (auth.uid() = user_id);
create policy "mockups_insert_own" on public.mockups
  for insert with check (auth.uid() = user_id);
create policy "mockups_update_own" on public.mockups
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mockups_delete_own" on public.mockups
  for delete using (auth.uid() = user_id);

-- =========================================================================
-- activities (journal)
-- =========================================================================
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  mockup_id uuid references public.mockups(id) on delete set null,
  type text not null
    check (type in (
      'mail_envoyé', 'sms_envoyé', 'appel', 'réponse_reçue', 'relance', 'rdv', 'note'
    )),
  canal text,
  contenu text,
  date timestamptz not null default now(),
  issue text
    check (issue is null or issue in ('intéressé', 'pas_intéressé', 'à_rappeler', 'sans_réponse')),
  created_at timestamptz not null default now()
);

create index activities_user_id_idx on public.activities(user_id);
create index activities_prospect_id_idx on public.activities(prospect_id);
create index activities_date_idx on public.activities(date);

alter table public.activities enable row level security;

create policy "activities_select_own" on public.activities
  for select using (auth.uid() = user_id);
create policy "activities_insert_own" on public.activities
  for insert with check (auth.uid() = user_id);
create policy "activities_update_own" on public.activities
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activities_delete_own" on public.activities
  for delete using (auth.uid() = user_id);

-- =========================================================================
-- templates
-- =========================================================================
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nom text not null,
  canal text not null check (canal in ('sms', 'mail')),
  objet text,
  corps text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index templates_user_id_idx on public.templates(user_id);

create trigger templates_set_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

alter table public.templates enable row level security;

create policy "templates_select_own" on public.templates
  for select using (auth.uid() = user_id);
create policy "templates_insert_own" on public.templates
  for insert with check (auth.uid() = user_id);
create policy "templates_update_own" on public.templates
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "templates_delete_own" on public.templates
  for delete using (auth.uid() = user_id);

-- =========================================================================
-- settings (une ligne par utilisateur ; id = user_id)
-- =========================================================================
create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  delai_relance_jours integer not null default 4,
  signature text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

alter table public.settings enable row level security;

create policy "settings_select_own" on public.settings
  for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.settings
  for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- Storage : bucket privé pour les maquettes HTML
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('mockups', 'mockups', false)
on conflict (id) do nothing;

create policy "mockups_storage_owner_select" on storage.objects
  for select using (bucket_id = 'mockups' and auth.uid() = owner);
create policy "mockups_storage_owner_insert" on storage.objects
  for insert with check (bucket_id = 'mockups' and auth.uid() = owner);
create policy "mockups_storage_owner_update" on storage.objects
  for update using (bucket_id = 'mockups' and auth.uid() = owner);
create policy "mockups_storage_owner_delete" on storage.objects
  for delete using (bucket_id = 'mockups' and auth.uid() = owner);
