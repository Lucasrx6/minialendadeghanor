-- Modo Arena — Mesa virtual em tempo real
-- Execute no Supabase Dashboard → SQL Editor
-- Idempotente: pode reexecutar sem risco

-- ─── Tabela de sessões de arena ───────────────────────────────────────────────

create table if not exists public.arenas (
  id          uuid        default gen_random_uuid() primary key,
  token       text        unique not null,
  name        text        not null,
  dm_user_id  uuid        not null references auth.users(id) on delete cascade,
  is_active   boolean     default true,
  created_at  timestamptz default now()
);

-- ─── Tabela de participantes ──────────────────────────────────────────────────

create table if not exists public.arena_participants (
  id           uuid        default gen_random_uuid() primary key,
  arena_id     uuid        not null references public.arenas(id) on delete cascade,
  character_id uuid        not null references public.characters(id) on delete cascade,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  hp_current   integer     not null,
  mp_current   integer     not null,
  joined_at    timestamptz default now(),
  unique (arena_id, character_id)
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.arenas             enable row level security;
alter table public.arena_participants enable row level security;

-- arenas: DM cria, lê e gerencia as próprias
do $$ begin
  create policy "arena_dm_all" on public.arenas
    for all using (dm_user_id = auth.uid());
exception when duplicate_object then null;
end $$;

-- arenas: participantes podem ler a arena em que estão
do $$ begin
  create policy "arena_participant_read" on public.arenas
    for select using (
      exists (
        select 1 from public.arena_participants
        where arena_id = arenas.id and user_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

-- arena_participants: jogador insere o próprio registro
do $$ begin
  create policy "participant_insert_own" on public.arena_participants
    for insert with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

-- arena_participants: DM da arena ou o próprio jogador podem ler
do $$ begin
  create policy "participant_select" on public.arena_participants
    for select using (
      user_id = auth.uid()
      or exists (
        select 1 from public.arenas
        where id = arena_participants.arena_id and dm_user_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

-- arena_participants: DM pode atualizar qualquer participante da arena
do $$ begin
  create policy "participant_dm_update" on public.arena_participants
    for update using (
      exists (
        select 1 from public.arenas
        where id = arena_participants.arena_id and dm_user_id = auth.uid()
      )
    );
exception when duplicate_object then null;
end $$;

-- arena_participants: jogador remove o próprio registro (sair da arena)
do $$ begin
  create policy "participant_delete_own" on public.arena_participants
    for delete using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Habilita broadcast de mudanças em arena_participants para clientes inscritos.
-- Se a publicação já contém a tabela, o comando é ignorado silenciosamente.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'arena_participants'
  ) then
    alter publication supabase_realtime add table public.arena_participants;
  end if;
end $$;
