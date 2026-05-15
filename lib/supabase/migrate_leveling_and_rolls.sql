-- ============================================================
-- MIGRATION: Evolução de personagem (Level Up) + Testes de Dado
-- App: A Lenda de Ghanor RPG
-- Data: 2026-05-15
--
-- Execute este arquivo inteiro no SQL Editor do Supabase.
-- É seguro rodar mais de uma vez (usa IF NOT EXISTS / ON CONFLICT).
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. NOVOS CAMPOS NA TABELA characters
-- ─────────────────────────────────────────────────────────────

-- Nível atual do personagem (soma de todos os níveis em todas as classes)
alter table public.characters
  add column if not exists current_level smallint not null default 1;

-- Distribuição de níveis por classe (fonte da verdade para multiclasse)
-- Exemplo: {"ladino": 3, "soldado": 1}  =>  personagem ladino 3 / soldado 1, nível 4
-- O campo "class" continua existindo para retrocompatibilidade (representa a classe inicial)
alter table public.characters
  add column if not exists class_levels jsonb not null default '{}'::jsonb;

-- Garante que personagens já existentes tenham class_levels preenchido com a classe original
update public.characters
  set class_levels = jsonb_build_object(class, 1)
  where class_levels = '{}'::jsonb
    and class is not null;


-- ─────────────────────────────────────────────────────────────
-- 2. TABELA level_ups — Histórico de evoluções
-- ─────────────────────────────────────────────────────────────

create table if not exists public.level_ups (
  id            uuid         primary key default uuid_generate_v4(),
  character_id  uuid         not null references public.characters(id) on delete cascade,
  user_id       uuid         not null references auth.users(id) on delete cascade,

  from_level    smallint     not null check (from_level between 1 and 19),
  to_level      smallint     not null check (to_level between 2 and 20),

  -- Classe escolhida para este nível (igual à classe atual ou nova, se multiclasse)
  class_taken   text         not null check (class_taken in (
                               'barbaro','bardo','bucaneiro','cacador','cavaleiro',
                               'clerigo','druida','ladino','mago','nobre','soldado'
                             )),

  is_multiclass boolean      not null default false,

  hp_gained     smallint     not null check (hp_gained >= 1),  -- mínimo 1 conforme regra
  mp_gained     smallint     not null check (mp_gained >= 0),

  -- Poder de classe escolhido (texto livre; pode ser null se o nível não oferecer escolha)
  power_chosen  text,

  -- Magias aprendidas neste level up (Bardo, Druida, Mago)
  new_spells    text[]       not null default '{}',

  -- Se escolheu o poder "Aumento de Atributo", qual atributo recebeu +1
  attr_increased text        check (attr_increased in ('str','dex','con','int','wis','cha')),

  -- Anotações livres (nome da aventura, o que aconteceu, etc.)
  notes         text,

  created_at    timestamptz  not null default now(),

  -- Integridade: to_level = from_level + 1 (nenhum salto de nível duplo)
  constraint level_up_sequential check (to_level = from_level + 1)
);

create index if not exists level_ups_character_idx on public.level_ups (character_id, to_level);
create index if not exists level_ups_user_idx      on public.level_ups (user_id, created_at desc);

-- RLS
alter table public.level_ups enable row level security;

drop policy if exists "Users read own level_ups"   on public.level_ups;
drop policy if exists "Users insert own level_ups" on public.level_ups;
drop policy if exists "Users update own level_ups" on public.level_ups;
drop policy if exists "Users delete own level_ups" on public.level_ups;

create policy "Users read own level_ups"
  on public.level_ups for select
  using (auth.uid() = user_id);

create policy "Users insert own level_ups"
  on public.level_ups for insert
  with check (auth.uid() = user_id);

create policy "Users update own level_ups"
  on public.level_ups for update
  using (auth.uid() = user_id);

create policy "Users delete own level_ups"
  on public.level_ups for delete
  using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 3. TABELA rolls — Histórico de testes de dado
-- ─────────────────────────────────────────────────────────────

create table if not exists public.rolls (
  id              uuid         primary key default uuid_generate_v4(),
  character_id    uuid         not null references public.characters(id) on delete cascade,
  user_id         uuid         not null references auth.users(id) on delete cascade,
  created_at      timestamptz  not null default now(),

  -- Identificação da rolagem
  label           text         not null check (char_length(label) between 1 and 80),
                                              -- ex.: "Cura", "Força", "Teste oposto"

  -- Componentes do modificador (guardados para exibir o cálculo detalhado)
  modifier_base   smallint     not null default 0,   -- atributo-chave
  modifier_train  smallint     not null default 0,   -- bônus de treino (0 se não treinado)
  modifier_level  smallint     not null default 0,   -- bônus de meio nível floor(nivel/2)
  modifier_scene  smallint     not null default 0,   -- modificador de cena (-5 a +5)
  modifier_total  integer      not null,             -- soma de todos os anteriores

  -- CD usada (null = rolagem livre sem CD definida)
  cd              smallint     check (cd between 1 and 99),

  -- Resultado
  natural_roll    smallint     not null check (natural_roll between 1 and 20),
  total           integer      not null,             -- natural_roll + modifier_total

  -- Desfecho
  outcome         text         check (outcome in (
                                 'success',          -- sucesso simples
                                 'failure',          -- falha simples
                                 'crit_success',     -- 20 natural
                                 'crit_failure',     -- 1 natural
                                 'opposed_win',      -- teste oposto: vitória
                                 'opposed_lose',     -- teste oposto: derrota
                                 'opposed_tie',      -- teste oposto: empate (rolar de novo)
                                 'no_cd'             -- rolagem livre sem CD
                               )),

  -- Modo da rolagem
  mode            text         not null default 'standard'
                               check (mode in ('standard', 'opposed', 'aided')),

  -- Dados extras em JSON (adversário, ajudantes, etc.)
  -- Estrutura para 'opposed':  { "opponent_modifier": N, "opponent_roll": N, "opponent_total": N }
  -- Estrutura para 'aided':    { "helpers": [{ "modifier": N, "roll": N, "passed": bool }], "help_bonus": N }
  metadata        jsonb,

  -- Integridade: total = natural_roll + modifier_total
  constraint roll_total_check check (total = natural_roll + modifier_total)
);

create index if not exists rolls_character_idx on public.rolls (character_id, created_at desc);
create index if not exists rolls_user_idx      on public.rolls (user_id, created_at desc);

-- RLS
alter table public.rolls enable row level security;

drop policy if exists "Users read own rolls"   on public.rolls;
drop policy if exists "Users insert own rolls" on public.rolls;
drop policy if exists "Users delete own rolls" on public.rolls;

create policy "Users read own rolls"
  on public.rolls for select
  using (auth.uid() = user_id);

create policy "Users insert own rolls"
  on public.rolls for insert
  with check (auth.uid() = user_id);

create policy "Users delete own rolls"
  on public.rolls for delete
  using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 4. HELPER: função para somar os values de um jsonb
--    (usada internamente para calcular current_level a partir de class_levels)
-- ─────────────────────────────────────────────────────────────

create or replace function public.jsonb_int_sum(j jsonb)
returns integer
language sql
immutable strict
as $$
  select coalesce(sum(value::integer), 0)
  from jsonb_each_text(j);
$$;


-- ─────────────────────────────────────────────────────────────
-- 5. TRIGGER: manter current_level sincronizado com class_levels
-- ─────────────────────────────────────────────────────────────

create or replace function public.sync_current_level()
returns trigger
language plpgsql
as $$
begin
  -- Recalcula current_level como a soma dos valores em class_levels
  if new.class_levels is distinct from old.class_levels then
    new.current_level := public.jsonb_int_sum(new.class_levels);
    -- Garante pelo menos nível 1
    if new.current_level < 1 then
      new.current_level := 1;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists characters_sync_level on public.characters;

create trigger characters_sync_level
  before update on public.characters
  for each row execute procedure public.sync_current_level();


-- ─────────────────────────────────────────────────────────────
-- 6. CORRIGIR current_level de personagens existentes
-- ─────────────────────────────────────────────────────────────

update public.characters
  set current_level = public.jsonb_int_sum(class_levels)
  where current_level = 1
    and class_levels != '{}'::jsonb
    and public.jsonb_int_sum(class_levels) != current_level;


-- ─────────────────────────────────────────────────────────────
-- FIM DA MIGRATION
-- ─────────────────────────────────────────────────────────────
-- Novas tabelas criadas:
--   public.level_ups   — histórico de evoluções de personagem
--   public.rolls       — histórico de testes de dados
--
-- Novos campos em public.characters:
--   current_level  smallint   (nível total atual)
--   class_levels   jsonb      (distribuição por classe)
--
-- Nova função:
--   public.jsonb_int_sum(jsonb)  — soma os valores inteiros de um jsonb
--
-- Novo trigger:
--   characters_sync_level  — mantém current_level atualizado automaticamente
-- ─────────────────────────────────────────────────────────────
