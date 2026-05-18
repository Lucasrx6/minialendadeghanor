# Plano de Implantação: Sistema de Magias e Habilidades
*A Lenda de Ghanor — Livro Básico*

---

## Estado Atual

| O que existe | Estado |
|---|---|
| `lib/ghanor/spells.ts` | Lista de nomes por classe, todos no círculo 1, sem PM/efeito/dados |
| `lib/ghanor/powers.ts` | 6 poderes genéricos com apenas resumo de 1 linha |
| `characters.spells` | `text[]` de nomes brutos (ex: `["Curar Ferimentos"]`) |
| `characters.powers` | `text[]` de nomes brutos |
| Ficha — "Habilidades e magias" | Card estático com texto, sem interação |
| HP/MP atual | `localStorage`, HP/MP máx no banco |
| Level up | Adiciona strings ao array `spells`/`powers`, sem validação de círculo |
| Wizard (criação) | Seleção de magias existe no estado, mas sem catálogo real |

---

## Arquitetura Proposta

```
lib/ghanor/
  spells.ts      ← catálogo completo (dados puros, sem I/O)
  powers.ts      ← catálogo completo (dados puros, sem I/O)

characters (banco)
  spells         text[]   → slugs das magias aprendidas
  powers         text[]   → slugs dos poderes aprendidos
  active_effects jsonb    → efeitos ativos com expiração (concentração, buffs)

localStorage (por character_id)
  hp_{id}        número atual de PV
  mp_{id}        número atual de PM
  uses_{id}      { power_slug: uses_remaining } — recarrega na cena
```

Regra principal: **o catálogo vive em TypeScript** (type-safe, sem roundtrip ao banco).
O banco guarda apenas o estado mutável do personagem (o que ele aprendeu, PM atual, usos).

---

## Fases de Implantação

---

### Fase 1 — Catálogo de Magias (lib)
*Pré-requisito: nenhum. Sem UI, sem banco.*

**1A — Expandir tipo `Spell` em `lib/ghanor/spells.ts`:**

```typescript
type Spell = {
  id: string;           // slug: "curar_ferimentos"
  name: string;
  circle: 1|2|3|4|5;   // círculo mínimo para aprender
  mp_cost: number;      // PM para lançar na versão base
  classes: ClassId[];
  traditions: ("arcana"|"divina")[];
  casting_time: "ação"|"ação rápida"|"reação"|"1 minuto";
  range: "pessoal"|"toque"|"curto"|"médio"|"longo"|string;
  target: string;       // "1 criatura", "você", "área X m", etc.
  duration: string;     // "instantâneo", "cena", "1 turno", "concentração"
  effect_type: "dano"|"cura"|"buff"|"debuff"|"controle"|"utilidade"|"invocação";
  description: string;  // Texto completo do efeito conforme o livro
  dice?: string;        // Fórmula de dano/cura, ex: "2d6" ou "1d8+Int"
  save?: "Fortitude"|"Reflexo"|"Vontade";
  attack?: boolean;     // Requer teste de ataque?
  amplify?: Array<{ extra_mp: number; effect: string }>; // amplificações
};
```

**1B — Popular todas as magias do livro** com os campos acima:
- ~55 magias únicas (bardo 20, clérigo 36, druida 20, mago 55 com sobreposição)
- Atribuir círculos corretos (atual: tudo no círculo 1, incorreto)
- Círculos aproximados pelo livro:
  - Círculo 1: Luz, Curar Ferimentos, Armadura Mágica, Dardo Gélido…
  - Círculo 2: Explosão de Chamas, Infligir Ferimentos, Nevoa…
  - Círculo 3: Conjurar Monstro, Resistência a Energia…
  - Círculo 4-5: magias mais poderosas

**Validação:** `npm run test` — adicionar testes unitários em `lib/ghanor/spells.test.ts`:
- Toda magia tem `mp_cost >= circle`
- Toda magia de classe conjuradora existe no catálogo
- Nenhuma slug duplicada

---

### Fase 2 — Catálogo de Poderes (lib)
*Pré-requisito: Fase 1 completa.*

**2A — Expandir tipo `Power` em `lib/ghanor/powers.ts`:**

```typescript
type Power = {
  id: string;
  name: string;
  type: "geral"|"combate"|"classe"|"origem"|"raca";
  class?: ClassId;          // undefined = poder geral
  tier?: Tier;              // patamar mínimo para adquirir
  activation: "passivo"|"ação"|"ação rápida"|"reação"|"livre";
  prerequisite?: string;    // texto de pré-requisito (ex: "For 1")
  description: string;      // texto completo conforme o livro
  uses_per_scene?: number;  // undefined = ilimitado/passivo
  mp_cost?: number;         // se consome PM ao ativar
  dice?: string;            // se rola dados
};
```

**2B — Popular poderes do livro por categoria:**
- Poderes gerais (~15): Ataque Poderoso, Sortudo, Vontade de Ferro, Esquiva…
- Poderes de combate (~10): Estilo de Arma, Combate Defensivo, Disparo Preciso…
- Poderes de classe (~5-8 por classe × 11 classes = ~60 poderes)
  - Bárbaro: Fúria, Resistência à Dor, Instinto Selvagem…
  - Bardo: Inspiração, Récita, Canção de Cura…
  - Cavaleiro: Baluarte, Proteção, Aura de Coragem…
  - Etc.
- Poderes de origem (~3 por origem = ~30 poderes)
- Poderes raciais (~2 por raça = ~14 poderes)

---

### Fase 3 — Migração de Dados do Banco
*Pré-requisito: Fases 1 e 2.*

**Migration:** `supabase/migrate_spells_powers_slugs.sql`
- Converter `characters.spells` de nomes brutos para slugs
  ```sql
  UPDATE characters SET spells = ARRAY(
    SELECT regexp_replace(lower(unnest(spells)), '[^a-z0-9]+', '_', 'g')
  );
  ```
- Idem para `powers`
- Adicionar coluna `active_effects jsonb default '{}'` em `characters`
- Index em `spells` e `powers` (GIN) para consultas futuras

---

### Fase 4 — Ficha: Seção Magias & Poderes (UI Read-Only)
*Pré-requisito: Fase 1 e 2.*

**4A — Nova sub-aba ou card expandido** na ficha (`character-sheet.tsx`):
- Seção "Poderes": lista de poderes do personagem com nome, tipo, descrição resumida
- Seção "Magias": agrupadas por círculo (1 → 5), com ícone de PM e tipo de efeito
- Badge de tipo: 🗡️ Dano | 💚 Cura | 🔵 Controle | ⚡ Buff | 🌀 Utilidade
- Exibir somente magias que o personagem aprendeu (slugs no array `spells`)
- Exibir magias do nível 1 baseadas na classe automaticamente (sem precisar estar no array)

**4B — Componente `SpellCard`** (`components/character-sheet/spell-card.tsx`):
```
┌─────────────────────────────────────────────────┐
│ 💚 Curar Ferimentos          PM: 1   Círculo 1  │
│ Ação · Toque · 1 criatura · Instantâneo         │
│ Cura 1d8+Sab PV de uma criatura ao alcance.     │
│ ◆ Ampliar (+1 PM): cura +1d8 adicional          │
└─────────────────────────────────────────────────┘
```

**4C — Componente `PowerCard`** (`components/character-sheet/power-card.tsx`):
```
┌─────────────────────────────────────────────────┐
│ ⚔️ Fúria                    Ação Rápida  2/cena  │
│ [Bárbaro · Passivo a partir do Veterano]         │
│ Entra em fúria até o fim da cena...              │
└─────────────────────────────────────────────────┘
```

---

### Fase 5 — Criação de Personagem: Wizard
*Pré-requisito: Fase 1 e 2.*

**5A — Etapa de Magias no Wizard** (classes conjuradoras):
- No Passo 5 ou 6 do wizard, classes conjuradoras (bardo, clérigo, druida, mago) veem seleção de magias
- Mostrar: magias do círculo 1 disponíveis para a classe
- Quantidade inicial: mago escolhe `Int × 2` magias, demais conjuradores escolhem menor número
- Filtro por tipo de efeito (dano, cura, controle…)
- Preview da magia ao selecionar (descrição, PM, dados)

**5B — Etapa de Poderes no Wizard**:
- Após seleção de magias, escolher 1 poder geral (nível 1)
- Classes com poder de nível 1 específico: mostrar automaticamente (ex: Bárbaro → Fúria)

**5C — Criar guiado (`/new/guided`):** mesma lógica da 5A/5B, adaptada ao fluxo narrativo.

---

### Fase 6 — Level Up: Magias e Poderes
*Pré-requisito: Fases 1, 2 e 5.*

**6A — Tela de Level Up** já existe (`app/characters/[id]/levelup`).
Adicionar:
- Mostrar se o nível abre novo círculo de magia (`opensNewSpellCircle()` já existe)
- Quando novo círculo abre: seleção de magias do novo círculo disponível
- Quando nível par (ex): seleção de magia adicional do círculo atual
- Mostrar poderes disponíveis no novo patamar

**6B — Regras de aquisição por nível:**
- Mago: +1 magia todo nível, +todas do novo círculo quando desbloqueado
- Clérigo/Druida: acesso automático a todas magias do círculo disponível
- Bardo: +1 magia nos níveis pares
- Todos: +1 poder a cada patamar (nível 5, 11, 17)

**6C — Validação na action `computeLevelUp`** (`app/actions/levelup.ts`):
- Verificar se magia selecionada está disponível para a classe
- Verificar se círculo da magia está desbloqueado no novo nível
- Verificar se poder selecionado satisfaz pré-requisitos

---

### Fase 7 — Sistema "Utilizável" — Básico
*Pré-requisito: Fase 4.*

**7A — Botão "Usar" nos SpellCards e PowerCards:**
- Magias: abre confirmação com custo de PM, clica → debita PM do `localStorage`
- Poderes com `uses_per_scene`: abre confirmação, clica → decrementa usos no `localStorage`
- Poderes passivos: não têm botão "usar"

**7B — MP tracking refinado:**
- Atual: `localStorage` simples para HP e MP
- Manter no localStorage mas adicionar ação `restoreResources` para "Descanso Curto" e "Descanso Longo"
  - Descanso Curto (10 min): recupera `level × 2` PM
  - Descanso Longo (8h): recupera todos HP e PM
- Botões de descanso na ficha (já existem como delta manual, formalizar)

**7C — Feedback visual ao usar:**
- Toast com nome da magia, PM gasto, saldo restante
- Badge "PM insuficiente" se `mp_current < mp_cost`
- Usos de poder esgotados: botão desabilitado com "0 usos restantes"

---

### Fase 8 — Sistema "Utilizável" — Efeitos com Dados
*Pré-requisito: Fase 7.*

**8A — Integrar com o rolador de dados existente** (o FAB de dados já existe):
- Magias com `dice` definido: ao clicar "Usar" → abre modal de dados pré-configurado
- Ex: "Explosão de Chamas" → abre rolador com `3d6 + Int` pré-preenchido
- O jogador confirma o roll → resultado exibido + PM debitado

**8B — Amplificações:**
- Magias com `amplify[]`: mostrar opções antes de confirmar uso
  ```
  Explosão de Chamas — Círculo 2 (base)
  ○ Gastar 2 PM → dano base: 3d6
  ○ Gastar +1 PM (3 total) → Ampliar: +1d6 de dano
  ○ Gastar +2 PM (4 total) → Ampliar: área dobrada
  ```
- Recalcular custo total dinamicamente

**8C — Testes de resistência:**
- Magias com `save` definido: exibir qual resistência o alvo usa
- Indicador visual: "Alvo faz teste de Reflexo"
- (Resultado do teste é manual — o narrador/jogador informa)

**8D — Magias de ataque:**
- Magias com `attack: true`: abre o dado de ataque primeiro
- Usa o bônus de ataque mágico: `nível + atributo conjurador`

---

### Fase 9 — Modo Narrador: Gerenciar Magias e Poderes
*Pré-requisito: Fases 4 e 5.*

**9A — Painel DM na seção de Magias:**
- Botão "+ Magia" → modal com todo o catálogo (sem filtro de classe)
- Permite dar magias fora da lista da classe do personagem
- Botão de remover magia individual

**9B — Painel DM na seção de Poderes:**
- Botão "+ Poder" → modal com todos os poderes
- Ignora requisitos de patamar/classe
- Permite resetar usos de cena manualmente

**9C — Server actions necessárias:**
- `addSpellToCharacter(characterId, spellId)` — adiciona ao array `spells`
- `removeSpellFromCharacter(characterId, spellId)`
- `addPowerToCharacter(characterId, powerId)`
- `removePowerFromCharacter(characterId, powerId)`
- `grantAllClassSpells(characterId, circleMax)` — concede todas as magias da classe até o círculo

---

### Fase 10 — Efeitos Ativos (Concentração e Duração)
*Pré-requisito: Fase 8.*

**10A — Tracking de efeitos com duração:**
- Magias com `duration: "concentração"` ou `duration: "cena"` criam uma entrada em `active_effects`
- Coluna `active_effects jsonb` no banco (adicionada na Fase 3)
- Estrutura: `{ spell_id, caster_id, ends_at_round, description }`

**10B — Card de "Efeitos Ativos"** na ficha:
```
┌─────────────────────────────────────────────────┐
│ ⏱ Efeitos Ativos                                │
│ 🔵 Armadura Mágica — até fim da cena     [×]   │
│ ⚡ Bênção — 1 turno restante             [×]   │
└─────────────────────────────────────────────────┘
```
- Botão [×] encerra o efeito manualmente (concentração quebrada)
- Efeitos de cena limpam ao clicar "Próxima Cena" (botão no painel DM)

**10C — Ação "Próxima Cena"** (`app/actions/scene.ts`):
- Limpa `active_effects` de todos os personagens da sessão
- Recupera usos de poderes por cena (`uses_per_scene`)
- (Descanso curto/longo em Fase 7 já cobre recuperação de PM)

---

## Resumo das Fases

| Fase | Entregável | Complexidade |
|---|---|---|
| 1 | Catálogo de magias completo (TS) | Média — dados do livro |
| 2 | Catálogo de poderes completo (TS) | Média — dados do livro |
| 3 | Migration: slugs + `active_effects` | Baixa |
| 4 | UI de exibição read-only (ficha) | Baixa |
| 5 | Seleção na criação de personagem | Média |
| 6 | Level up: aquisição de magias/poderes | Média |
| 7 | Botão "Usar" com PM e usos | Média |
| 8 | Rolagem de dados + amplificações | Alta |
| 9 | Modo Narrador: gerenciar catálogo | Baixa |
| 10 | Efeitos ativos (concentração/cena) | Alta |

**Ordem de prioridade recomendada:** 1 → 2 → 3 → 4 → 9 → 7 → 5 → 6 → 8 → 10

---

## Referências no Código

| Conceito | Arquivo |
|---|---|
| Círculos por classe/nível | `lib/ghanor/leveling.ts` → `SPELL_CIRCLES` |
| Classes conjuradoras | `lib/ghanor/leveling.ts` → `SPELLCASTERS` |
| Catálogo de magias | `lib/ghanor/spells.ts` |
| Catálogo de poderes | `lib/ghanor/powers.ts` |
| Level up action | `app/actions/levelup.ts` |
| Ficha principal | `components/character-sheet/character-sheet.tsx` |
| HP/MP localStorage | `character-sheet.tsx` → `hpCurrent`/`mpCurrent` |
| Rolador de dados | FAB na ficha (já funcional) |
| Wizard criação | `components/wizard/character-wizard.tsx` |
| Criação guiada | `app/characters/new/guided/` |
