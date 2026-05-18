-- Fase 3 — Sistema de Magias e Poderes
-- Execute após todas as migrations anteriores.
-- Idempotente: pode rodar mais de uma vez sem efeitos colaterais.

-- ─── 1. Coluna active_effects ─────────────────────────────────────────────────
alter table public.characters
  add column if not exists active_effects jsonb not null default '[]'::jsonb;

-- ─── 2. Índices GIN para buscas nos arrays spells / powers ───────────────────
create index if not exists idx_characters_spells  on public.characters using gin (spells);
create index if not exists idx_characters_powers  on public.characters using gin (powers);
create index if not exists idx_characters_effects on public.characters using gin (active_effects);

-- ─── 3. Normalizar spells: converter nomes para slugs ────────────────────────
-- Transforma "Curar Ferimentos" → "curar_ferimentos" em todos os personagens.
-- Apenas afeta entradas que ainda estão no formato antigo (com maiúsculas ou espaços).
update public.characters
set spells = (
  select array_agg(
    regexp_replace(
      lower(
        translate(unnested,
          'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
          'aaaaaeeeeiiiioooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
        )
      ),
      '[^a-z0-9]+', '_', 'g'
    )
  )
  from unnest(spells) as unnested
)
where spells is not null
  and array_length(spells, 1) > 0
  and exists (
    select 1 from unnest(spells) s
    where s ~ '[A-ZÁÉÍÓÚÀÂÊÔÃÕ ]'
  );

-- ─── 4. Normalizar powers: converter nomes para slugs ────────────────────────
update public.characters
set powers = (
  select array_agg(
    regexp_replace(
      lower(
        translate(unnested,
          'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
          'aaaaaeeeeiiiioooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
        )
      ),
      '[^a-z0-9]+', '_', 'g'
    )
  )
  from unnest(powers) as unnested
)
where powers is not null
  and array_length(powers, 1) > 0
  and exists (
    select 1 from unnest(powers) p
    where p ~ '[A-ZÁÉÍÓÚÀÂÊÔÃÕ ]'
  );
