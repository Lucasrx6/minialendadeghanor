-- Arena Enemies — Criaturas controladas pelo DM na sessão
-- Execute no Supabase Dashboard → SQL Editor
-- Idempotente: pode reexecutar sem risco

-- ─── Tabela ───────────────────────────────────────────────────────────────────

create table if not exists public.arena_enemies (
  id             uuid        default gen_random_uuid() primary key,
  arena_id       uuid        not null references public.arenas(id) on delete cascade,
  template_id    text        not null,
  custom_name    text,
  hp_max         integer     not null,
  hp_current     integer     not null,
  defense        integer     not null default 10,
  attack_bonus   integer     not null default 0,
  damage_dice    text        not null default '1d6',
  damage_mod     integer     not null default 0,
  status_effects text[]      not null default '{}',
  is_defeated    boolean     not null default false,
  sort_order     integer     not null default 0,
  created_at     timestamptz not null default now()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.arena_enemies enable row level security;

-- DM pode fazer tudo
do $$ begin
  create policy "enemy_dm_all" on public.arena_enemies
    for all using (
      exists (
        select 1 from public.arenas
        where id = arena_enemies.arena_id and dm_user_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

-- Participantes podem ler
do $$ begin
  create policy "enemy_participant_read" on public.arena_enemies
    for select using (
      exists (
        select 1 from public.arena_participants
        where arena_id = arena_enemies.arena_id and user_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

-- ─── Realtime ─────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'arena_enemies'
  ) then
    alter publication supabase_realtime add table public.arena_enemies;
  end if;
end $$;
