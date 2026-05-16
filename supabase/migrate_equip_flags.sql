-- ══════════════════════════════════════════════════════════════════════════════
-- Migração: Flags de equipamento/vestuário nos itens do catálogo
-- Execute no SQL Editor do Supabase ANTES de fazer o deploy do código.
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.items
  add column if not exists can_be_held   boolean not null default false,
  add column if not exists can_be_worn   boolean not null default false,
  add column if not exists is_two_handed boolean not null default false;

-- ── Armas: sempre empunháveis; duas mãos se weapon_grip = 'duas_maos'
update public.items
set can_be_held   = true,
    can_be_worn   = false,
    is_two_handed = (weapon_grip = 'duas_maos')
where category = 'arma';

-- ── Escudos: empunháveis com uma mão
update public.items
set can_be_held   = true,
    can_be_worn   = false,
    is_two_handed = false
where category = 'escudo';

-- ── Armaduras: sempre vestíveis
update public.items
set can_be_held   = false,
    can_be_worn   = true,
    is_two_handed = false
where category = 'armadura';

-- ── Vestuário: sempre vestível
update public.items
set can_be_held   = false,
    can_be_worn   = true,
    is_two_handed = false
where category = 'vestuario';

-- ── Esotérico (amuletos, anéis, etc.): vestível
update public.items
set can_be_held   = false,
    can_be_worn   = true,
    is_two_handed = false
where category = 'esoterico';

-- ── Alquímicos: empunháveis (uma mão)
update public.items
set can_be_held   = true,
    can_be_worn   = false,
    is_two_handed = false
where category in ('alquimico_preparado', 'alquimico_catalisador', 'alquimico_veneno', 'alquimia_mistica');

-- ── Tudo o mais (munição, ferramentas, equipamento_aventura, animal, servico,
--    bens_comuns, veiculo): sem flags (default false)
-- Nada a fazer — o default already covers it.

-- ══════════════════════════════════════════════════════════════════════════════
-- Migração corretiva: devolve a "carregado" itens mal equipados/vestidos
-- ══════════════════════════════════════════════════════════════════════════════

-- Itens em 'equipped' que não podem ser empunhados → carregado
update public.character_inventory ci
set location = 'carried'
from public.items i
where ci.item_id = i.id
  and ci.location = 'equipped'
  and i.can_be_held = false;

-- Itens em 'worn' que não podem ser vestidos → carregado
update public.character_inventory ci
set location = 'carried'
from public.items i
where ci.item_id = i.id
  and ci.location = 'worn'
  and i.can_be_worn = false;
