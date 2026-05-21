-- ============================================================
-- Schema inicial completo — A Lenda de Ghanor
-- Combinação de todas as migrations para ambiente local.
-- Idempotente: pode ser reexecutado sem risco.
-- ============================================================

-- ─── EXTENSÕES ───────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

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

-- ─── FUNÇÕES HELPERS ─────────────────────────────────────────────────────────

create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.jsonb_int_sum(j jsonb)
returns integer
language sql
immutable strict
as $$
  select coalesce(sum(value::integer), 0)
  from jsonb_each_text(j);
$$;

create or replace function public.sync_current_level()
returns trigger
language plpgsql
as $$
begin
  if new.class_levels is distinct from old.class_levels then
    new.current_level := public.jsonb_int_sum(new.class_levels);
    if new.current_level < 1 then
      new.current_level := 1;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.money_to_pc(po integer, pp integer, pc integer)
returns integer
language sql immutable strict
as $$
  select po * 1000 + pp * 10 + pc;
$$;

-- ─── TABELA characters ───────────────────────────────────────────────────────

create table if not exists public.characters (
  id                    uuid        primary key default uuid_generate_v4(),
  user_id               uuid        not null references auth.users(id) on delete cascade,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  name                  text        not null,
  concept               text,

  attr_method           text        not null check (attr_method in ('points', 'rolls')),
  attr_str              smallint    not null,
  attr_dex              smallint    not null,
  attr_con              smallint    not null,
  attr_int              smallint    not null,
  attr_wis              smallint    not null,
  attr_cha              smallint    not null,

  race                  text        not null check (race in (
                          'humano','anao','elfo','gigante','hobgoblin','meio_elfo','aberrante'
                        )),
  race_choices          jsonb,

  class                 text        not null check (class in (
                          'barbaro','bardo','bucaneiro','cacador','cavaleiro','clerigo',
                          'druida','ladino','mago','nobre','soldado'
                        )),
  class_choices         jsonb,

  origin                text        not null,
  origin_choices        jsonb,
  extra_origin          text,

  trained_skills        text[]      not null default '{}',
  powers                text[]      not null default '{}',
  spells                text[]      not null default '{}',
  active_effects        jsonb       not null default '[]'::jsonb,

  equipment             jsonb       not null default '[]'::jsonb,
  silver_pieces         integer     not null default 0,
  money_pc              integer     not null default 0,

  hp_max                smallint    not null,
  mp_max                smallint    not null,
  defense               smallint    not null,
  size                  text        not null default 'medio'
                          check (size in ('miudo','pequeno','medio','grande','enorme','colossal')),
  movement_m            smallint    not null default 9,

  current_level         smallint    not null default 1,
  class_levels          jsonb       not null default '{}'::jsonb,

  age                   smallint,
  appearance            text,
  personality           text,
  history               text,
  objective             text,

  portrait_url          text,
  portrait_prompt       text,
  portrait_generated_at timestamptz,

  creation_mode         text        default 'manual',
  quiz_answers          jsonb
);

create index if not exists characters_user_idx    on public.characters (user_id);
create index if not exists characters_created_idx on public.characters (created_at desc);
create index if not exists idx_characters_spells  on public.characters using gin (spells);
create index if not exists idx_characters_powers  on public.characters using gin (powers);
create index if not exists idx_characters_effects on public.characters using gin (active_effects);

alter table public.characters enable row level security;

drop policy if exists "Users can read own characters"   on public.characters;
drop policy if exists "Users can insert own characters" on public.characters;
drop policy if exists "Users can update own characters" on public.characters;
drop policy if exists "Users can delete own characters" on public.characters;

create policy "Users can read own characters"
  on public.characters for select using (auth.uid() = user_id);
create policy "Users can insert own characters"
  on public.characters for insert with check (auth.uid() = user_id);
create policy "Users can update own characters"
  on public.characters for update using (auth.uid() = user_id);
create policy "Users can delete own characters"
  on public.characters for delete using (auth.uid() = user_id);

drop trigger if exists characters_touch_updated_at on public.characters;
create trigger characters_touch_updated_at
  before update on public.characters
  for each row execute procedure public.touch_updated_at();

drop trigger if exists characters_sync_level on public.characters;
create trigger characters_sync_level
  before update on public.characters
  for each row execute procedure public.sync_current_level();

-- ─── TABELA level_ups ────────────────────────────────────────────────────────

create table if not exists public.level_ups (
  id              uuid        primary key default uuid_generate_v4(),
  character_id    uuid        not null references public.characters(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,

  from_level      smallint    not null check (from_level between 1 and 19),
  to_level        smallint    not null check (to_level between 2 and 20),

  class_taken     text        not null check (class_taken in (
                                'barbaro','bardo','bucaneiro','cacador','cavaleiro',
                                'clerigo','druida','ladino','mago','nobre','soldado'
                              )),
  is_multiclass   boolean     not null default false,

  hp_gained       smallint    not null check (hp_gained >= 1),
  mp_gained       smallint    not null check (mp_gained >= 0),

  power_chosen    text,
  new_spells      text[]      not null default '{}',
  attr_increased  text        check (attr_increased in ('str','dex','con','int','wis','cha')),
  notes           text,

  created_at      timestamptz not null default now(),

  constraint level_up_sequential check (to_level = from_level + 1)
);

create index if not exists level_ups_character_idx on public.level_ups (character_id, to_level);
create index if not exists level_ups_user_idx      on public.level_ups (user_id, created_at desc);

alter table public.level_ups enable row level security;

drop policy if exists "Users read own level_ups"   on public.level_ups;
drop policy if exists "Users insert own level_ups" on public.level_ups;
drop policy if exists "Users update own level_ups" on public.level_ups;
drop policy if exists "Users delete own level_ups" on public.level_ups;

create policy "Users read own level_ups"   on public.level_ups for select using (auth.uid() = user_id);
create policy "Users insert own level_ups" on public.level_ups for insert with check (auth.uid() = user_id);
create policy "Users update own level_ups" on public.level_ups for update using (auth.uid() = user_id);
create policy "Users delete own level_ups" on public.level_ups for delete using (auth.uid() = user_id);

-- ─── TABELA rolls ────────────────────────────────────────────────────────────

create table if not exists public.rolls (
  id              uuid        primary key default uuid_generate_v4(),
  character_id    uuid        not null references public.characters(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),

  label           text        not null check (char_length(label) between 1 and 80),
  modifier_base   smallint    not null default 0,
  modifier_train  smallint    not null default 0,
  modifier_level  smallint    not null default 0,
  modifier_scene  smallint    not null default 0,
  modifier_total  integer     not null,

  cd              smallint    check (cd between 1 and 99),
  natural_roll    smallint    not null check (natural_roll between 1 and 20),
  total           integer     not null,

  outcome         text        check (outcome in (
                                'success', 'failure', 'crit_success', 'crit_failure',
                                'opposed_win', 'opposed_lose', 'opposed_tie', 'no_cd'
                              )),
  mode            text        not null default 'standard'
                              check (mode in ('standard', 'opposed', 'aided')),
  metadata        jsonb,

  constraint roll_total_check check (total = natural_roll + modifier_total)
);

create index if not exists rolls_character_idx on public.rolls (character_id, created_at desc);
create index if not exists rolls_user_idx      on public.rolls (user_id, created_at desc);

alter table public.rolls enable row level security;

drop policy if exists "Users read own rolls"   on public.rolls;
drop policy if exists "Users insert own rolls" on public.rolls;
drop policy if exists "Users delete own rolls" on public.rolls;

create policy "Users read own rolls"   on public.rolls for select using (auth.uid() = user_id);
create policy "Users insert own rolls" on public.rolls for insert with check (auth.uid() = user_id);
create policy "Users delete own rolls" on public.rolls for delete using (auth.uid() = user_id);

-- ─── TABELA items ────────────────────────────────────────────────────────────

create table if not exists public.items (
  id                    uuid                primary key default uuid_generate_v4(),
  slug                  text                not null unique,
  name                  text                not null,
  category              item_category       not null,
  price_pc              integer             not null default 0,
  spaces                numeric(4,1)        not null default 1,
  description           text,

  weapon_proficiency    weapon_proficiency,
  weapon_grip           weapon_grip,
  weapon_purpose        weapon_purpose,
  weapon_damage_dice    text,
  weapon_critical       text,
  weapon_range          weapon_range,
  weapon_damage_type    damage_type,
  weapon_abilities      text[]              default '{}',

  armor_category        armor_category,
  armor_defense_bonus   smallint,
  armor_penalty         smallint            default 0,

  is_stackable          boolean             not null default false,
  is_starter_eligible   boolean             not null default false,
  source_book           text                not null default 'basico',
  page_ref              smallint,

  min_stage             smallint            not null default 3 check (min_stage between 1 and 5),
  can_be_held           boolean             not null default false,
  can_be_worn           boolean             not null default false,
  is_two_handed         boolean             not null default false,
  is_cosmetic           boolean             not null default false,
  is_purchasable        boolean             not null default true
);

create index if not exists items_category_idx on public.items (category);
create index if not exists items_slug_idx     on public.items (slug);

alter table public.items enable row level security;

drop policy if exists "Authenticated read catalog" on public.items;
create policy "Authenticated read catalog"
  on public.items for select
  to authenticated
  using (true);

-- ─── TABELA companions ───────────────────────────────────────────────────────

create table if not exists public.companions (
  id                    uuid        primary key default uuid_generate_v4(),
  character_id          uuid        not null references public.characters(id) on delete cascade,
  user_id               uuid        not null references auth.users(id) on delete cascade,

  name                  text        not null,
  species               text,
  kind                  text        not null default 'animal',
  companion_type        text,
  power_level           text        not null default 'iniciante',

  acquired_at           timestamptz not null default now(),
  acquired_from         text,
  acquired_cost_pc      integer,

  carry_capacity_spaces smallint    not null default 0,

  is_alive              boolean     not null default true,
  current_hp            smallint,
  max_hp                smallint,
  notes                 text,
  appearance            text,

  hire_cost_per_scene_pc integer,

  constraint companions_kind_check check (kind in ('animal','mercenary','class_companion','follower','custom'))
);

create index if not exists companions_character_id_idx on public.companions (character_id);
create index if not exists companions_alive_idx        on public.companions (character_id, is_alive);

alter table public.companions enable row level security;

drop policy if exists "companions_select" on public.companions;
drop policy if exists "companions_insert" on public.companions;
drop policy if exists "companions_update" on public.companions;
drop policy if exists "companions_delete" on public.companions;

create policy "companions_select" on public.companions for select using (auth.uid() = user_id);
create policy "companions_insert" on public.companions for insert with check (auth.uid() = user_id);
create policy "companions_update" on public.companions for update using (auth.uid() = user_id);
create policy "companions_delete" on public.companions for delete using (auth.uid() = user_id);

-- ─── TABELA vehicles ─────────────────────────────────────────────────────────

create table if not exists public.vehicles (
  id                uuid        primary key default uuid_generate_v4(),
  character_id      uuid        not null references public.characters(id) on delete cascade,
  user_id           uuid        not null references auth.users(id) on delete cascade,

  name              text        not null,
  kind              text        not null default 'outro',
  capacity_spaces   smallint    not null default 80,

  current_hp        smallint    default 50,
  max_hp            smallint    default 50,
  defense           smallint    default 8,
  damage_reduction  smallint    default 5,

  location_text     text,
  acquired_at       timestamptz not null default now(),
  acquired_cost_pc  integer,
  notes             text
);

alter table public.vehicles enable row level security;

drop policy if exists "vehicles_select" on public.vehicles;
drop policy if exists "vehicles_insert" on public.vehicles;
drop policy if exists "vehicles_update" on public.vehicles;
drop policy if exists "vehicles_delete" on public.vehicles;

create policy "vehicles_select" on public.vehicles for select using (auth.uid() = user_id);
create policy "vehicles_insert" on public.vehicles for insert with check (auth.uid() = user_id);
create policy "vehicles_update" on public.vehicles for update using (auth.uid() = user_id);
create policy "vehicles_delete" on public.vehicles for delete using (auth.uid() = user_id);

-- ─── TABELA character_inventory ──────────────────────────────────────────────

create table if not exists public.character_inventory (
  id                      uuid               primary key default uuid_generate_v4(),
  character_id            uuid               not null references public.characters(id) on delete cascade,
  user_id                 uuid               not null references auth.users(id) on delete cascade,

  item_id                 uuid               references public.items(id) on delete restrict,
  custom_name             text,
  custom_data             jsonb,

  quantity                integer            not null default 1 check (quantity > 0),
  location                inventory_location not null default 'carried',
  location_details        text,

  improvements            smallint           not null default 0 check (improvements between 0 and 4),
  is_arcanium             boolean            not null default false,
  arcanium_spell_circle   smallint           check (arcanium_spell_circle between 1 and 5),
  mortifice_improvements  text[]             default '{}',

  notes                   text,
  custom_label            text,

  companion_id            uuid               references public.companions(id) on delete set null,

  acquired_at             timestamptz        not null default now(),
  acquired_from           text               default 'loot'
                          check (acquired_from in (
                            'starter','origin','shop','loot','craft','gift','manual','dm_manual'
                          )),

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

create policy "Users read own inventory"   on public.character_inventory for select using (auth.uid() = user_id);
create policy "Users insert own inventory" on public.character_inventory for insert with check (auth.uid() = user_id);
create policy "Users update own inventory" on public.character_inventory for update using (auth.uid() = user_id);
create policy "Users delete own inventory" on public.character_inventory for delete using (auth.uid() = user_id);

-- ─── TABELA money_transactions ───────────────────────────────────────────────

create table if not exists public.money_transactions (
  id                    uuid        primary key default uuid_generate_v4(),
  character_id          uuid        not null references public.characters(id) on delete cascade,
  user_id               uuid        not null references auth.users(id) on delete cascade,
  amount_pc             integer     not null,
  reason                text        not null,
  related_inventory_id  uuid        references public.character_inventory(id) on delete set null,
  balance_after_pc      integer     not null,
  created_at            timestamptz not null default now()
);

create index if not exists money_tx_character_idx on public.money_transactions (character_id, created_at desc);

alter table public.money_transactions enable row level security;

drop policy if exists "Users read own transactions"   on public.money_transactions;
drop policy if exists "Users insert own transactions" on public.money_transactions;

create policy "Users read own transactions"   on public.money_transactions for select using (auth.uid() = user_id);
create policy "Users insert own transactions" on public.money_transactions for insert with check (auth.uid() = user_id);

-- ─── TABELA shop_inventories ─────────────────────────────────────────────────

create table if not exists public.shop_inventories (
  id              uuid        primary key default uuid_generate_v4(),
  character_id    uuid        not null references public.characters(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  stage           smallint    not null check (stage between 1 and 5),
  merchant_type   text        not null,
  generated_at    timestamptz not null default now(),
  refresh_token   text        not null default gen_random_uuid()::text,
  items_in_stock  jsonb       not null default '{}'::jsonb
);

create index if not exists idx_shop_inventories_char on public.shop_inventories (character_id);
create unique index if not exists uq_shop_inv
  on public.shop_inventories (character_id, stage, merchant_type, refresh_token);

alter table public.shop_inventories enable row level security;

drop policy if exists "Users read own shop inventories"   on public.shop_inventories;
drop policy if exists "Users insert own shop inventories" on public.shop_inventories;
drop policy if exists "Users update own shop inventories" on public.shop_inventories;
drop policy if exists "Users delete own shop inventories" on public.shop_inventories;

create policy "Users read own shop inventories"   on public.shop_inventories for select using (auth.uid() = user_id);
create policy "Users insert own shop inventories" on public.shop_inventories for insert with check (auth.uid() = user_id);
create policy "Users update own shop inventories" on public.shop_inventories for update using (auth.uid() = user_id);
create policy "Users delete own shop inventories" on public.shop_inventories for delete using (auth.uid() = user_id);

-- ─── TABELA shop_sessions ────────────────────────────────────────────────────

create table if not exists public.shop_sessions (
  id          uuid        primary key default gen_random_uuid(),
  stage       smallint    not null check (stage between 1 and 5),
  items       jsonb       not null default '[]',
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '10 minutes'),
  created_by  uuid        references auth.users(id) on delete set null
);

alter table public.shop_sessions enable row level security;

drop policy if exists "shop_sessions_select" on public.shop_sessions;
drop policy if exists "shop_sessions_insert" on public.shop_sessions;
drop policy if exists "shop_sessions_update" on public.shop_sessions;

create policy "shop_sessions_select"
  on public.shop_sessions for select to authenticated using (true);
create policy "shop_sessions_insert"
  on public.shop_sessions for insert to authenticated with check (auth.uid() = created_by);
create policy "shop_sessions_update"
  on public.shop_sessions for update to authenticated using (true);

-- ─── TABELA arenas ───────────────────────────────────────────────────────────

create table if not exists public.arenas (
  id          uuid        default gen_random_uuid() primary key,
  token       text        unique not null,
  name        text        not null,
  dm_user_id  uuid        not null references auth.users(id) on delete cascade,
  is_active   boolean     default true,
  created_at  timestamptz default now()
);

-- ─── TABELA arena_participants ───────────────────────────────────────────────

create table if not exists public.arena_participants (
  id            uuid        default gen_random_uuid() primary key,
  arena_id      uuid        not null references public.arenas(id) on delete cascade,
  character_id  uuid        not null references public.characters(id) on delete cascade,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  hp_current    integer     not null,
  mp_current    integer     not null,
  joined_at     timestamptz default now(),
  unique (arena_id, character_id)
);

alter table public.arenas             enable row level security;
alter table public.arena_participants enable row level security;

do $$ begin
  create policy "arena_dm_all" on public.arenas
    for all using (dm_user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "arena_participant_read" on public.arenas
    for select using (
      exists (
        select 1 from public.arena_participants
        where arena_id = arenas.id and user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "participant_insert_own" on public.arena_participants
    for insert with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "participant_select" on public.arena_participants
    for select using (
      user_id = auth.uid()
      or exists (
        select 1 from public.arenas
        where id = arena_participants.arena_id and dm_user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "participant_dm_update" on public.arena_participants
    for update using (
      exists (
        select 1 from public.arenas
        where id = arena_participants.arena_id and dm_user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "participant_delete_own" on public.arena_participants
    for delete using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ─── STORAGE ─────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('character-portraits', 'character-portraits', true)
on conflict (id) do nothing;

-- ─── REALTIME ────────────────────────────────────────────────────────────────

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
