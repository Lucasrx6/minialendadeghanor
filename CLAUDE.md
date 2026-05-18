@AGENTS.md

# A Lenda de Ghanor — Guia completo do sistema

Aplicação web de fichas de personagem para o TTRPG brasileiro **A Lenda de Ghanor**.
Stack: **Next.js 16.2.6** (app router, React 19) + **Supabase** (Postgres + Auth + RLS) + **Tailwind v4**.

---

## Sumário rápido

| O que fazer | Onde mexer |
|---|---|
| Adicionar item ao catálogo | `lib/supabase/seed_items_catalog.sql` + `npm run validate:seed` |
| Adicionar categoria nova | seed + `VALID_CATEGORIES` em `scripts/validate-seed.js` + labels em `inventory-tab.tsx` e `ShopPage.tsx` |
| Nova migration de schema | `supabase/migrate_*.sql` (executar manualmente no dashboard) |
| Regra de jogo (HP, MP, defesa…) | `lib/ghanor/rules.ts` ou `lib/ghanor/leveling.ts` |
| Nova server action | `app/actions/*.ts` — padrão: retornar `{ error }` nunca throw |
| Novo componente de ficha | `components/character-sheet/` |
| Adicionar raça/classe/origem | `lib/ghanor/races.ts` / `lib/ghanor/classes.ts` / `lib/ghanor/origins.ts` |

---

## 1. Arquitetura geral

```
app/                    → rotas Next.js (app router)
  actions/              → Server Actions (inventory, companions, levelup, dm, shop, roll)
  characters/[id]/      → ficha do personagem
    page.tsx            → carrega dados e passa para CharacterSheet
    shop/page.tsx       → loja de itens
    edit/page.tsx       → edição de personagem
    levelup/page.tsx    → subir de nível

components/
  character-sheet/      → tabs da ficha (CharacterSheet, InventoryTab, CompanionsTab…)
  shop/ShopPage.tsx     → loja interativa
  inventory/            → modais de adicionar item
  layout/               → PageContainer, PageHeader
  ui/                   → Button, Input, ItemIcon, etc.

lib/
  ghanor/               → lógica de regras pura (sem I/O)
    types.ts            → tipos base (Attribute, ClassId, RaceId, CharacterBuild…)
    rules.ts            → cálculos de HP, MP, defesa, perícias, carga, melhorias
    leveling.ts         → computeLevelUp, tierForLevel, SPELL_CIRCLES, HP/MP por nível
    inventory.ts        → carryCapacity, WORN_LIMIT, priceWithArcanium, STARTER_KITS
    animals.ts          → CompanionKind, ANIMAL_CONFIGS, KIND_LABEL, TYPE_LABEL
    classes.ts / races.ts / origins.ts / skills.ts / powers.ts / spells.ts
  supabase/
    server.ts           → createClient() — cliente autenticado com cookies
    admin.ts            → createAdminClient() — bypassa RLS (use só em server actions)
    client.ts           → cliente browser
    seed_items_weapons.sql
    seed_items_general.sql
    seed_items_catalog.sql  ← novo (Prompt 4/4)

supabase/               → migrations SQL (executar no dashboard Supabase em ordem)
scripts/
  validate-seed.js      → npm run validate:seed (roda no build)
  audit-catalog.js      → npm run audit:catalog (cobertura do catálogo)
```

---

## 2. Banco de dados — tabelas principais

### `characters`
Campos relevantes: `id`, `user_id`, `name`, `class`, `race`, `origin`, `extra_origin`,
`current_level`, `class_levels` (jsonb), `attr_str/dex/con/int/wis/cha`, `hp_max`, `mp_max`,
`money_pc` (moeda em PC = peças de cobre).

### `items` — catálogo global
Todos os itens compráveis do jogo. **Nunca altere diretamente** — use os arquivos seed.

| Coluna | Tipo | Descrição |
|---|---|---|
| `slug` | text (PK único) | identificador snake_case sem acento |
| `category` | text | ver lista abaixo |
| `price_pc` | int | preço em Peças de Cobre |
| `spaces` | numeric | espaços de carga (0 = não ocupa) |
| `can_be_held` | bool | pode ser empunhado (armas, escudos, alquímicos) |
| `can_be_worn` | bool | pode ser vestido (armaduras, vestuário, esotérico) |
| `is_two_handed` | bool | usa as 2 mãos |
| `is_cosmetic` | bool | conta 0 espaços, não ocupa slot vestido |
| `is_purchasable` | bool (default true) | false = não aparece na loja, vende por 0 PC |
| `is_starter_eligible` | bool | pode ser item inicial de personagem |
| `is_stackable` | bool | empilhável (munição, poções, etc.) |

**Categorias válidas** (em `VALID_CATEGORIES` no validate-seed):
`arma`, `armadura`, `escudo`, `municao`, `equipamento_aventura`, `ferramenta`,
`vestuario`, `esoterico`, `alquimico_preparado`, `alquimico_catalisador`,
`alquimico_veneno`, `alquimia_mistica`, `animal`, `veiculo`, `servico`,
`bens_comuns`, `item_magico`

**Itens não-comerciais** (is_purchasable = false): `bordao`, `tacape`, `funda`.

### `character_inventory`
Liga personagem ↔ item. Campos: `id`, `character_id`, `user_id`, `item_id` (nullable —
null = item customizado), `quantity`, `location`, `improvements`, `is_arcanium`,
`arcanium_spell_circle`, `custom_name`, `custom_data` (jsonb), `notes`, `custom_label`,
`companion_id` (FK para companions, set null ao remover companion).

**Locations**: `carried`, `equipped`, `worn`, `storage`, `mount`, `sold`

### `companions`
Parceiros do personagem (animais, mercenários, companheiros de classe).
Campos: `id`, `character_id`, `user_id`, `name`, `species`, `kind` (text: `animal`,
`mercenary`, `class_companion`, `follower`, `custom`), `companion_type`, `power_level`
(`iniciante`/`veterano`/`mestre`), `carry_capacity_spaces`, `is_alive`, `current_hp`,
`max_hp`, `notes`, `appearance`, `hire_cost_per_scene_pc`.

### `money_transactions`
Histórico financeiro. Campos: `id`, `character_id`, `user_id`, `amount_pc` (negativo =
débito), `reason`, `balance_after_pc`, `related_inventory_id`.

### `level_up_history`
Histórico de subidas de nível. Campos: `id`, `character_id`, `to_level`, `class_id`,
`hp_gained`, `mp_gained`, `attr_increased`.

---

## 3. Moeda

O sistema usa **PC (peças de cobre)** como unidade interna.
- 1 PO (peça de ouro) = 1000 PC
- 1 PP (peça de prata) = 10 PC
- 1 PC = 1 PC

Funções em `lib/ghanor/inventory.ts`:
- `toPc(po, pp, pc)` → converte para PC
- `fromPc(total)` → `{ po, pp, pc }`
- `formatMoney(pc)` → `"1 PO 2 PP 3 PC"`
- `formatMoneyPP(pc)` → `"1.5 PP"` (para preços na loja)

---

## 4. Sistema de inventário

### Localização dos itens
- **carried** → carregado (conta na carga)
- **equipped** → empunhado (mão, máx 2 slots; arma 2 mãos = 2 slots; escudo = 1 slot)
- **worn** → vestido (máx `WORN_LIMIT = 4`, itens cosméticos não contam)
- **storage** / **mount** → guardado (não conta na carga ativa)
- **sold** → vendido (registro histórico, não exibido)

### Carga
- Capacidade: `10 + 2×For` (For ≥ 0) ou `10 + 1×For` (For < 0)
- Sobrecarga: espaços > capacidade → −5 penalidade armadura, −3m deslocamento
- Bloqueado: espaços > 2× capacidade → zero progresso

### Regras de equipar (`moveItem` em `app/actions/inventory.ts`)
Validações em modo normal (não-DM):
- **equipped**: item precisa `can_be_held`, slots de mão livres, só 1 escudo
- **worn**: item precisa `can_be_worn`, limite de 4, só 1 armadura
- **cosméticos**: não podem ser equipados/vestidos
- Em DM mode: todas as validações são ignoradas

### Venda
- Preço de venda = 50% do preço cheio (com melhorias e Arcanium)
- `is_purchasable = false` → refund = 0 PC, dialog mostra aviso explicativo

### Melhorias de item
- Cada melhoria adiciona +50% cumulativo ao preço base
- Máx 4 melhorias por item
- `priceWithImprovements(basePc, improvements)` em `lib/ghanor/inventory.ts`

### Arcanium
- Custo adicional por círculo (1–5) em `ARCANIUM_COST_PC`
- 1º/2º círculo: +300 PP; 3º/4º: +600 PP; 5º: +900 PP

---

## 5. Sistema de parceiros (`companions`)

### Tipos de parceiro (`CompanionKind` em `lib/ghanor/animals.ts`)
- `animal` — Animais comprados/obtidos (cavalo, mula, falcão, cão, etc.)
- `mercenary` — Mercenários contratados
- `class_companion` — Companheiros de classe
- `follower` — Seguidores
- `custom` — Livre

### Animais do catálogo (`ANIMAL_CONFIGS`)
| Slug | Espécie | Tipo | Capacidade | Bônus Alforje |
|---|---|---|---|---|
| `cavalo` | Cavalo | montaria | 0 | 5 |
| `cavalo_guerra` | Cavalo de guerra | montaria | 0 | 5 |
| `mula` | Mula | besta_carga | 5 | 5 |
| `falcao` | Falcão | vigilante | 0 | 0 |
| `cao_caca` | Cão de caça | perseguidor | 0 | 0 |

**Para adicionar novo animal**: (1) criar entrada em `ANIMAL_CONFIGS`, (2) criar item com
mesma slug e category `animal` no seed, (3) re-rodar seed.

### Server actions de companions (`app/actions/companions.ts`)
- `getCompanions(characterId)` — lista todos
- `addAnimalCompanion({ characterId, animalSlug, customName?, deductCost })` — compra/adiciona animal; se `deductCost=true` debita `items.price_pc` do personagem
- `addCustomCompanion({ characterId, name, kind, ... })` — forma livre
- `updateCompanion({ companionId, name?, notes?, appearance?, currentHp?, carryCapacitySpaces? })`
- `markCompanionDead(companionId)` — is_alive=false, devolve itens para `carried`
- `removeCompanion(companionId)` — deleta, devolve itens para `carried`

---

## 6. Migrations SQL

Executar no **Supabase Dashboard → SQL Editor** na ordem abaixo:

| Arquivo | O que faz |
|---|---|
| `supabase/migrate_equip_flags.sql` | Adiciona `can_be_held`, `can_be_worn`, `is_two_handed` |
| `supabase/migrate_cosmetic.sql` | Adiciona `is_cosmetic`, marca bolsa/mochila/luva/trajes como cosméticos |
| `supabase/migrate_companions.sql` | Cria tabelas `companions` e `vehicles`, adiciona `companion_id` em `character_inventory` |
| `supabase/migrate_purchasable.sql` | Adiciona `is_purchasable`, marca bordão/tacape/funda, re-aplica flags de equipar para novas categorias |

**Após as migrations**, rodar os seeds no SQL Editor também (na ordem):
1. `lib/supabase/seed_items_weapons.sql`
2. `lib/supabase/seed_items_general.sql`
3. `lib/supabase/seed_items_catalog.sql`

Todos os seeds são idempotentes (`ON CONFLICT DO UPDATE`) — pode re-executar sem risco.

---

## 7. Adicionando itens ao catálogo

### Passo a passo

1. **Escolha o arquivo seed correto**:
   - Armas → `seed_items_weapons.sql`
   - Itens gerais (armaduras, escudos, vestuário, ferramentas, etc.) → `seed_items_general.sql`
   - Tudo mais → `seed_items_catalog.sql`

2. **Siga a convenção de slug**: `snake_case`, só `[a-z0-9_]`, sem acentos.
   Exemplos: `espada_longa`, `pocao_cura`, `kit_escalada`

3. **Campos obrigatórios para qualquer item**:
   ```sql
   slug, name, category, price_pc, spaces, description
   ```

4. **Campos extras por categoria**:
   - `arma`: `weapon_proficiency`, `weapon_grip`, `weapon_purpose`, `weapon_damage_dice`,
     `weapon_critical`, `weapon_range`, `weapon_damage_type`, `weapon_abilities` (array)
   - `armadura`/`escudo`: `armor_category`, `armor_defense_bonus`, `armor_penalty`
   - Itens empilháveis: `is_stackable = true`

5. **Sempre termine com**:
   ```sql
   on conflict (slug) do update set name = excluded.name, price_pc = excluded.price_pc;
   ```

6. **Valide**: `npm run validate:seed` (roda automaticamente no build)

7. **Audite a cobertura**: `npm run audit:catalog`

8. **Execute o seed no Supabase** via SQL Editor.

### Exemplo completo — adicionar uma poção nova
```sql
-- Em seed_items_catalog.sql, dentro do bloco de alquimia_mistica:
('pocao_exemplo','Poção de exemplo','alquimia_mistica',400,0.5,'Faz algo interessante.',true,118)
```
Depois adicione `1` ao expected count de `alquimia_mistica` em `scripts/validate-seed.js`
e `scripts/audit-catalog.js`.

### Contagens esperadas (Prompt 4/4 — total: 255 itens)
| Categoria | Qtd |
|---|---|
| arma | 53 |
| armadura | 10 |
| escudo | 3 |
| equipamento_aventura | 24 |
| ferramenta | 14 |
| vestuario | 25 |
| esoterico | 15 |
| alquimico_preparado | 8 |
| alquimico_catalisador | 15 |
| alquimico_veneno | 13 |
| alquimia_mistica | 11 |
| animal | 6 |
| veiculo | 3 |
| servico | 16 |
| bens_comuns | 24 |
| item_magico | 15 |

---

## 8. Server Actions — padrões críticos

### Retorno de erros — NUNCA use throw em actions chamadas de `startTransition`
React 19 propaga exceções de `startTransition` para o error boundary mais próximo,
quebrando a UI silenciosamente. O padrão correto:

```typescript
// ✅ Correto
export async function minhaAction(input: X): Promise<{ ok: true } | { error: string }> {
  try {
    // ...
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// No cliente:
const result = await minhaAction(input);
if ("error" in result) showToast(result.error);
```

### Cliente Supabase — admin vs. user
- `createClient()` — cliente autenticado com cookies do usuário (respeita RLS)
- `createAdminClient()` — service role, bypassa RLS; use para joins com `items` e operações admin
- **Regra**: em toda server action, verificar `user.id` e fazer `.eq("user_id", user.id)` para ownership

### `revalidatePath`
Toda mutation deve chamar `revalidatePath(\`/characters/${characterId}\`)` no final.

---

## 9. Lógica de regras (`lib/ghanor/`)

Esses arquivos contêm **só lógica pura** (sem I/O, sem Supabase):

- **`rules.ts`**: `calculateHp`, `calculateMp`, `calculateDefense`, `carryCapacity`,
  `computeDefenseWithEquipment`, proficiências por classe, penalidade de armadura em perícias
- **`leveling.ts`**: `computeLevelUp`, `tierForLevel`, `HP_PER_LEVEL`, `MP_PER_LEVEL`,
  `SPELL_CIRCLES`, `computeHpGained`, `computeMpGained`
- **`inventory.ts`**: `WORN_LIMIT = 4`, `priceWithArcanium`, `STARTER_KITS`, cálculo de carga
- **`types.ts`**: `Attribute`, `ClassId`, `RaceId`, `CharacterBuild`
- **`classes.ts`**: definições de cada classe (HP base, perícias fixas, etc.)
- **`races.ts`**: raças disponíveis, bônus de atributo, mutações (aberrante)
- **`origins.ts`**: origens, `trainedSkills`, bônus
- **`animals.ts`**: `ANIMAL_CONFIGS`, `CompanionKind`, `TYPE_LABEL`

---

## 10. Ficha do personagem — componentes

### Fluxo de dados
```
app/characters/[id]/page.tsx
  ↳ carrega: character, levelUpHistory, inventory, transactions, catalog, companions
  ↳ <CharacterSheet .../>

CharacterSheet (components/character-sheet/character-sheet.tsx)
  ↳ tab "sheet"     → seção principal (atributos, perícias, HP/MP, ataques)
  ↳ tab "inventory" → <InventoryTab />
  ↳ tab "companions"→ <CompanionsTab />
```

### InventoryTab (`components/character-sheet/inventory-tab.tsx`)
- Sub-tabs: Equipado | Carregado | Guardado | Histórico
- `ItemRow` type inclui: `can_be_held`, `can_be_worn`, `is_two_handed`, `is_cosmetic`, `is_purchasable`
- Badges no card: `cosmético` (cinza), `não-comercial` (âmbar)
- Botões de ação: Empunhar / Vestir / Recuperar / Guardar / Vender
- DM mode: painel indigo com edição de melhorias, Arcanium, rótulo, notas, excluir

### CompanionsTab (`components/character-sheet/companions-tab.tsx`)
- Seções por kind: Animais | Mercenários | Companheiros | Outros
- `CompanionCard`: expand/collapse, edição inline, marcar morto, remover
- `AddCompanionModal`: aba "Animal" (lista ANIMAL_CONFIGS com opção de comprar) + aba "Customizado"

---

## 11. Loja (`app/characters/[id]/shop/`)

### Filtros da query no servidor (`shop/page.tsx`)
```typescript
.not("category", "in", "(bens_comuns,servico,animal,veiculo,municao)")
.eq("is_purchasable", true)
```
Ou seja: não aparecem na loja animais, veículos, serviços, bens comuns, munição e
itens não-comerciais.

### Categorias exibidas no filtro da loja (`ShopPage.tsx`)
Armas, Armaduras, Escudos, Aventura, Vestuário, Ferramentas, Esotérico,
Alquímicos, Catalisadores, Alq. Mística, Venenos, **Bazar Arcano** (item_magico)

---

## 12. Modo Narrador (DM Mode)

Ativado pelo hook `lib/hooks/use-dm-mode.ts` (localStorage).
Quando ativo:
- Validações de equipar são ignoradas em `moveItem`
- Painel de edição indigo aparece em cada item do inventário
- Pode adicionar/remover dinheiro sem obrigatoriedade de motivo
- Pode editar melhorias e Arcanium de itens

---

## 13. Scripts de manutenção

```bash
npm run validate:seed    # Valida sintaxe e contagens dos 3 arquivos seed (roda no build)
npm run audit:catalog    # Relatório de cobertura por categoria vs. expected
npm run build            # validate:seed + next build (TypeScript check incluído)
npm run test             # vitest (testes unitários em lib/ghanor/)
npm run dev              # servidor de desenvolvimento
```

---

## 14. Gotchas e padrões não-óbvios

### TypeScript + Supabase joins
O Supabase infere joins como array em vez do tipo real. Use `as unknown as T`:
```typescript
const item = inv.items as unknown as { name: string; price_pc: number } | null;
```

### Componente `Button`
O `size` prop aceita apenas `"default" | "lg" | "icon"` — não `"sm"`.

### Slugs sem acento
Todo slug no banco deve seguir `/^[a-z0-9_]+$/`. O validate-seed rejeita slugs com
caracteres especiais. Ex: `pocao` não `poção`, `talisman` não `talismã`.

### Supabase admin vs. user client
Joins com a tabela `items` podem ser bloqueados pela RLS quando se usa o cliente de
usuário. Use sempre `createAdminClient()` em server actions.

### `revalidatePath` é obrigatório
Sem ele, a ficha não atualiza após mutations. Toda action que modifica dados deve
chamar `revalidatePath(\`/characters/${characterId}\`)`.

### HP/MP em localStorage
A ficha exibe HP/MP atuais usando `localStorage` (keyed por `character_id`) para
permitir tracking sem servidor. Os valores máximos vêm do banco.

### Contagem de itens vestidos
O `wornCount` exclui itens cosméticos:
```typescript
const wornCount = [...equipped, ...worn].filter(i => !i.items?.is_cosmetic).length;
```

### Categorias excluídas do catálogo passado ao AddItemModal
Em `app/characters/[id]/page.tsx`, o catálogo passado para a ficha exclui `animal` e
`veiculo` (gerenciados pela aba Parceiros):
```typescript
const catalog = catalogData.filter(i => i.category !== "animal" && i.category !== "veiculo");
```

---

## 15. Adicionando nova funcionalidade — checklist

1. **Schema**: criar migration em `supabase/migrate_nova_feature.sql`
2. **Server action**: criar ou editar em `app/actions/nova_feature.ts`
   - Sempre verificar autenticação com `getAuthenticatedUser()`
   - Verificar ownership com `.eq("user_id", user.id)`
   - Retornar `{ error: string } | { ... }` nunca throw
   - Chamar `revalidatePath` no final
3. **Tipo client-side**: adicionar ao tipo correspondente no componente
4. **UI**: editar o componente relevante em `components/`
5. **Carregar dado na página**: adicionar ao `Promise.all` em `app/characters/[id]/page.tsx`
6. **Teste**: `npm run build` deve passar sem erros

---

## 16. Raças e classes disponíveis

**Raças**: humano, anão, elfo, gigante, hobgoblin, meio-elfo, aberrante

**Classes** (11): bárbaro, bardo, bucaneiro, caçador, cavaleiro, clérigo, druida,
ladino, mago, nobre, soldado

**Conjuradores** (têm círculos de magia): bardo, clérigo, druida, mago

**Patamares**: Iniciante (1–4), Veterano (5–10), Campeão (11–16), Lenda (17–20)
