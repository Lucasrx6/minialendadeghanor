create extension if not exists "uuid-ossp";

create table public.characters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  concept text,

  attr_method text not null check (attr_method in ('points', 'rolls')),
  attr_str smallint not null,
  attr_dex smallint not null,
  attr_con smallint not null,
  attr_int smallint not null,
  attr_wis smallint not null,
  attr_cha smallint not null,

  race text not null check (race in ('humano','anao','elfo','gigante','hobgoblin','meio_elfo','aberrante')),
  race_choices jsonb,

  class text not null check (class in (
    'barbaro','bardo','bucaneiro','cacador','cavaleiro','clerigo',
    'druida','ladino','mago','nobre','soldado'
  )),
  class_choices jsonb,

  origin text not null,
  origin_choices jsonb,

  trained_skills text[] not null default '{}',
  powers text[] not null default '{}',
  spells text[] not null default '{}',

  equipment jsonb not null default '[]'::jsonb,
  silver_pieces integer not null default 0,

  hp_max smallint not null,
  mp_max smallint not null,
  defense smallint not null,
  size text not null default 'medio' check (size in ('miudo','pequeno','medio','grande','enorme','colossal')),
  movement_m smallint not null default 9,

  age smallint,
  appearance text,
  personality text,
  history text,
  objective text,

  portrait_url text,
  portrait_prompt text,
  portrait_generated_at timestamptz
);

create index on public.characters (user_id);
create index on public.characters (created_at desc);

alter table public.characters enable row level security;

create policy "Users can read own characters"
  on public.characters for select
  using (auth.uid() = user_id);

create policy "Users can insert own characters"
  on public.characters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own characters"
  on public.characters for update
  using (auth.uid() = user_id);

create policy "Users can delete own characters"
  on public.characters for delete
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('character-portraits', 'character-portraits', true)
on conflict (id) do nothing;

create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists characters_touch_updated_at on public.characters;

create trigger characters_touch_updated_at
  before update on public.characters
  for each row execute procedure public.touch_updated_at();
