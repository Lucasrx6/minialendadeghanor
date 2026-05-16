-- ══════════════════════════════════════════════════════════════════════════════
-- Migração: Tabelas companions e vehicles
-- Requer: migrate_equip_flags.sql e migrate_cosmetic.sql já executados.
-- Execute no SQL Editor do Supabase ANTES de fazer o deploy do código.
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Tabela companions ─────────────────────────────────────────────────────────

create table if not exists public.companions (
  id                     uuid primary key default uuid_generate_v4(),
  character_id           uuid not null references public.characters(id) on delete cascade,
  user_id                uuid not null references auth.users(id)       on delete cascade,

  -- Identidade
  name                   text       not null,
  species                text,                               -- "Cavalo", "Cão de caça", "Humano"
  kind                   text       not null default 'animal',  -- animal | mercenary | class_companion | follower | custom
  companion_type         text,                               -- montaria | besta_carga | perseguidor | vigilante | ...
  power_level            text       not null default 'iniciante', -- iniciante | veterano | mestre

  -- Origem
  acquired_at            timestamptz not null default now(),
  acquired_from          text,                               -- shop | class_feature | origin | gift | manual
  acquired_cost_pc       integer,

  -- Capacidade de carga (animais)
  carry_capacity_spaces  smallint   not null default 0,

  -- Status
  is_alive               boolean    not null default true,
  current_hp             smallint,
  max_hp                 smallint,
  notes                  text,
  appearance             text,

  -- Mercenários
  hire_cost_per_scene_pc integer,

  constraint companions_kind_check check (kind in ('animal','mercenary','class_companion','follower','custom'))
);

create index if not exists companions_character_id_idx on public.companions (character_id);
create index if not exists companions_alive_idx        on public.companions (character_id, is_alive);

alter table public.companions enable row level security;

create policy "companions_select" on public.companions
  for select using (auth.uid() = user_id);
create policy "companions_insert" on public.companions
  for insert with check (auth.uid() = user_id);
create policy "companions_update" on public.companions
  for update using (auth.uid() = user_id);
create policy "companions_delete" on public.companions
  for delete using (auth.uid() = user_id);

-- ── Tabela vehicles ───────────────────────────────────────────────────────────

create table if not exists public.vehicles (
  id                 uuid primary key default uuid_generate_v4(),
  character_id       uuid not null references public.characters(id) on delete cascade,
  user_id            uuid not null references auth.users(id)       on delete cascade,

  name               text    not null,
  kind               text    not null default 'outro',   -- canoa | carroca | carruagem | outro
  capacity_spaces    smallint not null default 80,

  current_hp         smallint default 50,
  max_hp             smallint default 50,
  defense            smallint default 8,
  damage_reduction   smallint default 5,

  location_text      text,
  acquired_at        timestamptz not null default now(),
  acquired_cost_pc   integer,
  notes              text
);

alter table public.vehicles enable row level security;

create policy "vehicles_select" on public.vehicles
  for select using (auth.uid() = user_id);
create policy "vehicles_insert" on public.vehicles
  for insert with check (auth.uid() = user_id);
create policy "vehicles_update" on public.vehicles
  for update using (auth.uid() = user_id);
create policy "vehicles_delete" on public.vehicles
  for delete using (auth.uid() = user_id);

-- ── Link: itens do personagem para companion/vehicle ─────────────────────────

alter table public.character_inventory
  add column if not exists companion_id uuid references public.companions(id) on delete set null;

-- ══════════════════════════════════════════════════════════════════════════════
-- Migração corretiva: animais e veículos já no inventário → novas tabelas
-- ══════════════════════════════════════════════════════════════════════════════

-- Animais → companions
insert into public.companions
  (character_id, user_id, name, species, kind, companion_type, power_level, acquired_from, acquired_cost_pc, carry_capacity_spaces)
select
  ci.character_id,
  ci.user_id,
  coalesce(ci.custom_label, i.name),
  i.name,
  'animal',
  case i.slug
    when 'cavalo'        then 'montaria'
    when 'cavalo_guerra' then 'montaria'
    when 'mula'          then 'besta_carga'
    when 'falcao'        then 'vigilante'
    when 'cao_caca'      then 'perseguidor'
    else 'outro'
  end,
  'iniciante',
  ci.acquired_from,
  i.price_pc,
  case i.slug when 'mula' then 5 else 0 end
from public.character_inventory ci
join public.items i on i.id = ci.item_id
where i.category = 'animal'
  and ci.location != 'sold';

delete from public.character_inventory ci
using public.items i
where ci.item_id = i.id
  and i.category = 'animal';

-- Veículos → vehicles
insert into public.vehicles
  (character_id, user_id, name, kind, capacity_spaces, acquired_cost_pc)
select
  ci.character_id,
  ci.user_id,
  coalesce(ci.custom_label, i.name),
  case i.slug
    when 'canoa'     then 'canoa'
    when 'carroca'   then 'carroca'
    when 'carruagem' then 'carruagem'
    else 'outro'
  end,
  80,
  i.price_pc
from public.character_inventory ci
join public.items i on i.id = ci.item_id
where i.category = 'veiculo'
  and ci.location != 'sold';

delete from public.character_inventory ci
using public.items i
where ci.item_id = i.id
  and i.category = 'veiculo';
