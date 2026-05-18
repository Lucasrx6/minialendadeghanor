-- Sessões de loja com geração aleatória por estágio (TTL 10 min)

create table if not exists public.shop_sessions (
  id           uuid         primary key default gen_random_uuid(),
  stage        smallint     not null check (stage between 1 and 5),
  items        jsonb        not null default '[]',
  created_at   timestamptz  not null default now(),
  expires_at   timestamptz  not null default (now() + interval '10 minutes'),
  created_by   uuid         references auth.users(id) on delete set null
);

alter table public.shop_sessions enable row level security;

create policy "shop_sessions_select"
  on public.shop_sessions for select
  to authenticated using (true);

create policy "shop_sessions_insert"
  on public.shop_sessions for insert
  to authenticated with check (auth.uid() = created_by);

create policy "shop_sessions_update"
  on public.shop_sessions for update
  to authenticated using (true);
