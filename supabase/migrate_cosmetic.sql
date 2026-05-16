-- ══════════════════════════════════════════════════════════════════════════════
-- Migração: Itens cosméticos (sem benefício mecânico)
-- Requer: migrate_equip_flags.sql já executado.
-- Execute no SQL Editor do Supabase ANTES de fazer o deploy do código.
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.items
  add column if not exists is_cosmetic boolean not null default false;

comment on column public.items.is_cosmetic is
  'Item cosmético sem benefício mecânico (livro pág 97). Não conta no limite de 4 itens vestidos nem ocupa espaço de carga.';

-- ── Marcar itens cosméticos
-- Vestuário sem benefício mecânico
update public.items
set is_cosmetic = true,
    can_be_worn = false,
    can_be_held = false
where slug in (
  'traje_viajante',   -- "Não conta para o limite de espaços" — explícito no livro
  'traje_corte',      -- roupa social, sem efeito em combate
  'luva_pelica'       -- puramente decorativo
);

-- Recipientes puros (spaces = 0, não ocupam espaço e não dão benefício)
update public.items
set is_cosmetic = true,
    can_be_worn = false,
    can_be_held = false
where slug in (
  'bolsa_lona',
  'mochila'
);

-- ── Migração corretiva: cosméticos que estavam errados em equipped/worn
update public.character_inventory ci
set location = 'carried'
from public.items i
where ci.item_id = i.id
  and i.is_cosmetic = true
  and ci.location in ('equipped', 'worn');
