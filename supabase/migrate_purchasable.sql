-- Prompt 4/4 — Revisão do catálogo
-- Execute APÓS migrate_equip_flags.sql, migrate_cosmetic.sql e migrate_companions.sql
-- e APÓS seed_items_catalog.sql ter sido inserido.

-- ─── 1. Coluna is_purchasable ────────────────────────────────────────────────
alter table public.items
  add column if not exists is_purchasable boolean not null default true;

-- Armas "naturais" obtidas gratuitamente / como item de classe (preço = 0 PC)
update public.items set is_purchasable = false
where slug in ('bordao', 'tacape', 'funda');

-- ─── 2. Re-aplica flags de equipar para itens novos ─────────────────────────
-- (Idempotente: só define true onde ainda for false por terem sido inseridos
--  após a migration migrate_equip_flags.sql)

-- Itens que podem ser vestidos
update public.items set can_be_worn = true
where category in ('armadura', 'vestuario', 'esoterico')
  and can_be_worn = false;

-- Itens que podem ser empunhados
update public.items set can_be_held = true
where category in ('alquimico_preparado', 'alquimico_catalisador', 'alquimia_mistica')
  and can_be_held = false;

update public.items set can_be_held = true
where category = 'ferramenta'
  and can_be_held = false;

-- Itens mágicos: vestidos ou empunhados conforme o tipo
update public.items set can_be_worn = true
where slug in (
  'botas_velozes', 'capa_sombra', 'luvas_forca', 'elmo_percepcao',
  'cinto_forca', 'talisman_coragem', 'manto_invisibilidade',
  'anel_protecao', 'anel_resistencia', 'amuleto_saude', 'cinto_forca'
);

update public.items set can_be_held = true
where slug in ('bolsa_guardadora', 'pedra_chamado', 'vela_revelacao',
               'cristal_memoria', 'espelho_visoes');

-- ─── 3. Migração corretiva: nada a corrigir neste prompt ─────────────────────
-- (as colunas novas têm default corretos para itens existentes)
