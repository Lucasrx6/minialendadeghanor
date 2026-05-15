-- ============================================================
-- MIGRATION 004: Sistema de Equipamento Completo
-- App: A Lenda de Ghanor RPG
-- Baseado nas Tabelas 3-1 a 3-11 (páginas 95-130 do livro básico)
-- Execute no SQL Editor do Supabase.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 0. EXTENSÕES
-- ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ─────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────────────────────

do $$ begin
  create type item_category as enum (
    'arma', 'armadura', 'escudo', 'municao',
    'equipamento_aventura', 'ferramenta', 'vestuario',
    'esoterico', 'alquimico_preparado', 'alquimico_catalisador',
    'alquimico_veneno', 'alquimia_mistica',
    'animal', 'veiculo', 'servico', 'bens_comuns', 'item_magico'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type weapon_proficiency as enum ('simples', 'marcial', 'exotica');
exception when duplicate_object then null; end $$;

do $$ begin
  create type weapon_grip as enum ('leve', 'uma_mao', 'duas_maos');
exception when duplicate_object then null; end $$;

do $$ begin
  create type weapon_purpose as enum ('corpo_a_corpo', 'arremesso', 'disparo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type damage_type as enum (
    'corte', 'impacto', 'perfuracao',
    'corte_perfuracao', 'impacto_perfuracao', 'corte_impacto'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type weapon_range as enum ('curto', 'medio', 'longo', 'nenhum');
exception when duplicate_object then null; end $$;

do $$ begin
  create type armor_category as enum (
    'leve', 'pesada',
    'escudo_leve', 'escudo_pesado', 'escudo_torre'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type inventory_location as enum (
    'equipped', 'worn', 'carried', 'mount', 'storage', 'sold'
  );
exception when duplicate_object then null; end $$;


-- ─────────────────────────────────────────────────────────────
-- 2. TABELA items (catálogo imutável, populado por seed)
-- ─────────────────────────────────────────────────────────────

create table if not exists public.items (
  id                    uuid             primary key default uuid_generate_v4(),
  slug                  text             not null unique,
  name                  text             not null,
  category              item_category    not null,
  price_pc              integer          not null default 0,  -- preço em peças de cobre
  spaces                numeric(4,1)     not null default 1,
  description           text,

  -- Armas
  weapon_proficiency    weapon_proficiency,
  weapon_grip           weapon_grip,
  weapon_purpose        weapon_purpose,
  weapon_damage_dice    text,            -- '1d4', '1d8', '2d4', '1d10/1d12'
  weapon_critical       text,            -- 'x2', 'x3', 'x4', '19', '18', '19/x3'
  weapon_range          weapon_range,
  weapon_damage_type    damage_type,
  weapon_abilities      text[]           default '{}',

  -- Armaduras e escudos
  armor_category        armor_category,
  armor_defense_bonus   smallint,
  armor_penalty         smallint         default 0,

  -- Flags gerais
  is_stackable          boolean          not null default false,  -- flechas, poções, rações…
  is_starter_eligible   boolean          not null default false,
  source_book           text             not null default 'basico',
  page_ref              smallint
);

create index if not exists items_category_idx on public.items (category);
create index if not exists items_slug_idx on public.items (slug);


-- ─────────────────────────────────────────────────────────────
-- 3. TABELA character_inventory
-- ─────────────────────────────────────────────────────────────

create table if not exists public.character_inventory (
  id                      uuid               primary key default uuid_generate_v4(),
  character_id            uuid               not null references public.characters(id) on delete cascade,
  user_id                 uuid               not null references auth.users(id) on delete cascade,

  -- Referência ao catálogo OU item customizado (uma das duas obrigatória)
  item_id                 uuid               references public.items(id) on delete restrict,
  custom_name             text,
  custom_data             jsonb,

  quantity                integer            not null default 1 check (quantity > 0),
  location                inventory_location not null default 'carried',

  -- Melhorias
  improvements            smallint           not null default 0 check (improvements between 0 and 4),
  is_arcanium             boolean            not null default false,
  arcanium_spell_circle   smallint           check (arcanium_spell_circle between 1 and 5),
  mortifice_improvements  text[]             default '{}',

  -- Personalização do jogador
  notes                   text,
  custom_label            text,

  acquired_at             timestamptz        not null default now(),
  acquired_from           text               default 'loot'
                          check (acquired_from in ('starter','origin','shop','loot','craft','gift')),

  constraint check_item_or_custom check (
    (item_id is not null and custom_name is null) or
    (item_id is null and custom_name is not null)
  )
);

create index if not exists inventory_character_idx on public.character_inventory (character_id);
create index if not exists inventory_location_idx  on public.character_inventory (character_id, location);

alter table public.character_inventory enable row level security;

drop policy if exists "Users read own inventory"   on public.character_inventory;
drop policy if exists "Users insert own inventory" on public.character_inventory;
drop policy if exists "Users update own inventory" on public.character_inventory;
drop policy if exists "Users delete own inventory" on public.character_inventory;

create policy "Users read own inventory"
  on public.character_inventory for select using (auth.uid() = user_id);
create policy "Users insert own inventory"
  on public.character_inventory for insert with check (auth.uid() = user_id);
create policy "Users update own inventory"
  on public.character_inventory for update using (auth.uid() = user_id);
create policy "Users delete own inventory"
  on public.character_inventory for delete using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 4. DINHEIRO EM PC NA TABELA characters
-- ─────────────────────────────────────────────────────────────

alter table public.characters
  add column if not exists money_pc integer not null default 0;

-- Migra saldo antigo (silver_pieces estava em PP; 1 PP = 10 PC)
update public.characters
  set money_pc = coalesce(silver_pieces, 0) * 10
  where money_pc = 0 and silver_pieces > 0;


-- ─────────────────────────────────────────────────────────────
-- 5. TABELA money_transactions
-- ─────────────────────────────────────────────────────────────

create table if not exists public.money_transactions (
  id                    uuid         primary key default uuid_generate_v4(),
  character_id          uuid         not null references public.characters(id) on delete cascade,
  user_id               uuid         not null references auth.users(id) on delete cascade,
  amount_pc             integer      not null,          -- positivo = ganho, negativo = gasto
  reason                text         not null,
  related_inventory_id  uuid         references public.character_inventory(id) on delete set null,
  balance_after_pc      integer      not null,
  created_at            timestamptz  not null default now()
);

create index if not exists money_tx_character_idx on public.money_transactions (character_id, created_at desc);

alter table public.money_transactions enable row level security;

drop policy if exists "Users read own transactions"   on public.money_transactions;
drop policy if exists "Users insert own transactions" on public.money_transactions;

create policy "Users read own transactions"
  on public.money_transactions for select using (auth.uid() = user_id);
create policy "Users insert own transactions"
  on public.money_transactions for insert with check (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 6. HELPER: conversão de moeda
-- ─────────────────────────────────────────────────────────────

create or replace function public.money_to_pc(po integer, pp integer, pc integer)
returns integer
language sql immutable strict
as $$
  select po * 1000 + pp * 10 + pc;
$$;

-- Nota: no livro, 1 PO = 10 PP = 100 PC.
-- Armazenamos em PC (menor unidade) para precisão total.
-- Helper front-end formata de volta em PO/PP/PC na exibição.


-- ─────────────────────────────────────────────────────────────
-- FIM DA MIGRATION
-- ─────────────────────────────────────────────────────────────
-- Novas tabelas:
--   public.items                   catálogo (populado por seed)
--   public.character_inventory     inventário de cada personagem
--   public.money_transactions      histórico financeiro
--
-- Novos campos em public.characters:
--   money_pc   integer   saldo em peças de cobre
--
-- Novos enums:
--   item_category, weapon_proficiency, weapon_grip,
--   weapon_purpose, damage_type, weapon_range,
--   armor_category, inventory_location
-- ─────────────────────────────────────────────────────────────
