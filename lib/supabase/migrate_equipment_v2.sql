-- ============================================================
-- MIGRATION 005: Equipamento v2 — RLS catálogo, etapas, loja, inventário
-- Execute após migrate_equipment.sql e seeds.
-- ============================================================

-- ── 1. Catálogo legível por usuários autenticados (corrige join do inventário) ──
alter table public.items enable row level security;

drop policy if exists "Authenticated read catalog" on public.items;
create policy "Authenticated read catalog"
  on public.items for select
  to authenticated
  using (true);

-- ── 2. min_stage nos itens ──
alter table public.items
  add column if not exists min_stage smallint not null default 3
  check (min_stage between 1 and 5);

-- ── 3. Detalhes de localização no inventário ──
alter table public.character_inventory
  add column if not exists location_details text;

-- ── 4. acquired_from ampliado ──
alter table public.character_inventory
  drop constraint if exists character_inventory_acquired_from_check;

alter table public.character_inventory
  add constraint character_inventory_acquired_from_check
  check (acquired_from in (
    'starter', 'origin', 'shop', 'loot', 'craft', 'gift',
    'manual', 'dm_manual'
  ));

-- ── 5. Estoque dinâmico da loja ──
create table if not exists public.shop_inventories (
  id uuid primary key default uuid_generate_v4(),
  character_id uuid not null references public.characters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stage smallint not null check (stage between 1 and 5),
  merchant_type text not null,
  generated_at timestamptz not null default now(),
  refresh_token text not null default gen_random_uuid()::text,
  items_in_stock jsonb not null default '{}'::jsonb
);

create index if not exists idx_shop_inventories_char on public.shop_inventories (character_id);

create unique index if not exists uq_shop_inv
  on public.shop_inventories (character_id, stage, merchant_type, refresh_token);

alter table public.shop_inventories enable row level security;

drop policy if exists "Users read own shop inventories" on public.shop_inventories;
drop policy if exists "Users insert own shop inventories" on public.shop_inventories;
drop policy if exists "Users update own shop inventories" on public.shop_inventories;
drop policy if exists "Users delete own shop inventories" on public.shop_inventories;

create policy "Users read own shop inventories"
  on public.shop_inventories for select using (auth.uid() = user_id);
create policy "Users insert own shop inventories"
  on public.shop_inventories for insert with check (auth.uid() = user_id);
create policy "Users update own shop inventories"
  on public.shop_inventories for update using (auth.uid() = user_id);
create policy "Users delete own shop inventories"
  on public.shop_inventories for delete using (auth.uid() = user_id);

-- ── 6. Corrigir inventários órfãos pelo nome customizado ──
update public.character_inventory ci
set item_id = i.id,
    custom_name = null
from public.items i
where ci.item_id is null
  and ci.custom_name is not null
  and (
    lower(i.name) = lower(ci.custom_name)
    or i.slug = lower(replace(regexp_replace(ci.custom_name, '[^a-zA-Z0-9 ]', '', 'g'), ' ', '_'))
  );
