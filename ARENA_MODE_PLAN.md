# Modo Arena — Plano de Implementação

## Visão geral

O Modo Arena é uma mesa virtual em tempo real:

1. Um usuário cria uma sessão como **Mestre** e recebe um **token** de 8 caracteres.
2. Jogadores abrem o link `/arena/[token]`, escolhem seu personagem e entram.
3. O Mestre vê um **dashboard ao vivo** com cards de todos os jogadores.
4. O Mestre pode: dar dano, curar, adicionar itens, ajustar dinheiro e abrir a ficha completa de qualquer jogador.
5. Atualizações de PV/PM aparecem em **tempo real** para todos via Supabase Realtime.

---

## Arquitetura

```
app/arena/
  page.tsx                  → Hub: criar sessão / entrar com token / listar arenas ativas
  [token]/
    page.tsx                → Smart page: detecta papel (Mestre / Jogador / Visitante)

components/arena/
  ArenaDashboard.tsx        → Dashboard do Mestre com Realtime
  ArenaPlayerCard.tsx       → Card de um jogador no dashboard
  DmActionDrawer.tsx        → Gaveta de ações do Mestre sobre um jogador
  ArenaPlayerView.tsx       → View do jogador quando está em uma arena
  ArenaTokenShare.tsx       → UI para copiar/compartilhar token
  ArenaJoinFlow.tsx         → Seleção de personagem + botão entrar

app/actions/arena.ts        → Todas as server actions da arena
supabase/migrate_arena.sql  → Migration de schema
```

### Decisão sobre PV/PM

O app atualmente rastreia PV/PM no `localStorage`. No Modo Arena precisamos de estado
persistido no servidor para que o Mestre veja e altere os valores ao vivo.

**Solução**: A tabela `arena_participants` armazena `hp_current` e `mp_current` por
sessão. Ao entrar na arena, o valor é inicializado a partir de `characters.hp_max /
mp_max`. O Mestre escreve via server action → Realtime notifica todos os inscritos.

---

## Schema de banco (Task 1)

```sql
-- Sessões de arena
create table public.arenas (
  id          uuid    default gen_random_uuid() primary key,
  token       text    unique not null,           -- 8 chars alfanum, ex: "GHANOR42"
  name        text    not null,
  dm_user_id  uuid    not null references auth.users(id) on delete cascade,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Participantes
create table public.arena_participants (
  id           uuid    default gen_random_uuid() primary key,
  arena_id     uuid    not null references public.arenas(id) on delete cascade,
  character_id uuid    not null references public.characters(id) on delete cascade,
  user_id      uuid    not null references auth.users(id) on delete cascade,
  hp_current   integer not null,
  mp_current   integer not null,
  joined_at    timestamptz default now(),
  unique (arena_id, character_id)
);

-- RLS
alter table public.arenas            enable row level security;
alter table public.arena_participants enable row level security;

-- arenas: DM lê e escreve as próprias; participantes leem as que participam
create policy "dm_owns_arena" on public.arenas
  for all using (dm_user_id = auth.uid());

create policy "participant_reads_arena" on public.arenas
  for select using (
    exists (
      select 1 from public.arena_participants
      where arena_id = arenas.id and user_id = auth.uid()
    )
  );

-- arena_participants: jogador insere o próprio; DM da arena lê/atualiza todos
create policy "player_joins" on public.arena_participants
  for insert with check (user_id = auth.uid());

create policy "player_reads_own" on public.arena_participants
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.arenas
      where id = arena_participants.arena_id and dm_user_id = auth.uid()
    )
  );

create policy "dm_manages_participants" on public.arena_participants
  for update using (
    exists (
      select 1 from public.arenas
      where id = arena_participants.arena_id and dm_user_id = auth.uid()
    )
  );

create policy "player_leaves" on public.arena_participants
  for delete using (user_id = auth.uid());

-- Realtime: habilitar para arena_participants
alter publication supabase_realtime add table public.arena_participants;
```

---

## Tasks de implementação

---

### Task 1 — Migration SQL

**Arquivo**: `supabase/migrate_arena.sql`

**Prompt**:
```
Crie o arquivo `supabase/migrate_arena.sql` com o schema exato definido no plano
ARENA_MODE_PLAN.md (tabelas `arenas` e `arena_participants`, RLS completo,
publicação Realtime). O arquivo deve ser idempotente usando
`create table if not exists` e `create policy if not exists` (ou
`do $$ begin ... exception when duplicate_object then null; end $$`
para as policies). Não altere nenhum outro arquivo.
```

---

### Task 2 — Server Actions

**Arquivo**: `app/actions/arena.ts`

**Prompt**:
```
Crie `app/actions/arena.ts` com as seguintes server actions.
Siga o padrão do projeto: sempre retornar `{ error: string } | { ... }`,
nunca throw em startTransition, usar `createAdminClient()` para joins
e `getAuthenticatedUser()` para auth. Chamar `revalidatePath` onde necessário.

Funções a implementar:

1. `createArena({ name: string })`
   → Gera token de 8 chars alfanuméricos maiúsculos (ex: nanoid ou substring de UUID
     sem hífens). Insere em `arenas` com dm_user_id = user.id.
   → Retorna `{ arenaId: string; token: string }`.

2. `getMyArenas()`
   → Retorna arenas onde dm_user_id = user.id OU onde o user tem participante,
     ordenadas por created_at desc. Inclui contagem de participantes.
   → Retorna `{ arenas: ArenaRow[] }`.

3. `getArenaByToken(token: string)`
   → Busca arena pelo token. Se não existir ou is_active = false, retorna erro.
   → Retorna arena + lista de participantes, cada um com dados do personagem:
     `id, name, race, class, current_level, hp_max, mp_max, defense,
      portrait_url, attr_str, attr_dex, attr_con, attr_int, attr_wis, attr_cha`.
   → Também retorna se o usuário atual é DM (dm_user_id === user.id),
     participante (tem registro em arena_participants), ou nenhum dos dois.

4. `joinArena({ token: string; characterId: string })`
   → Valida: arena ativa, personagem pertence ao user, user não está já na arena
     com outro personagem.
   → Busca hp_max e mp_max do personagem para inicializar hp_current/mp_current.
   → Insere em arena_participants.
   → Retorna `{ ok: true }`.

5. `leaveArena({ arenaId: string; characterId: string })`
   → Deleta o registro de arena_participants. Valida ownership.
   → Retorna `{ ok: true }`.

6. `closeArena(arenaId: string)`
   → Apenas DM. Seta is_active = false.
   → Retorna `{ ok: true }`.

7. `dmSetHp({ arenaId: string; characterId: string; hp: number })`
   → Apenas DM da arena. Atualiza hp_current (clamp 0..hp_max do personagem).
   → Retorna `{ ok: true }`.

8. `dmSetMp({ arenaId: string; characterId: string; mp: number })`
   → Apenas DM da arena. Atualiza mp_current (clamp 0..mp_max do personagem).
   → Retorna `{ ok: true }`.

9. `dmAdjustHp({ arenaId: string; characterId: string; delta: number })`
   → Lê hp_current atual, aplica delta, clamp, salva.
   → Retorna `{ ok: true; newHp: number }`.

10. `dmAdjustMp({ arenaId: string; characterId: string; delta: number })`
    → Igual a dmAdjustHp mas para mp.
    → Retorna `{ ok: true; newMp: number }`.

Exporte também os tipos `ArenaRow` e `ArenaWithParticipants` necessários
para as páginas consumirem sem precisar de `as unknown as`.
```

---

### Task 3 — Página Hub `/arena`

**Arquivos**: `app/arena/page.tsx`, `app/arena/layout.tsx`

**Prompt**:
```
Crie a página hub do Modo Arena em `app/arena/page.tsx` (server component).
Também crie `app/arena/layout.tsx` mínimo que simplesmente renderiza `{children}`
com `PageContainer withBottomNav`.

A página deve:
- Verificar autenticação (redirecionar para /login se não logado).
- Chamar `getMyArenas()` para listar arenas ativas do usuário.
- Renderizar três seções:

1. **Header**: título "Modo Arena ⚔️", subtítulo explicativo, ícone de espada.

2. **Criar sessão (DM)**:
   Um Card com um formulário simples (input para nome da sessão + botão "Criar Arena").
   Ao submeter: chama `createArena`, redireciona para `/arena/[token]`.
   Use um Client Component `ArenaCreateForm` para o form (está dentro do page.tsx mesmo
   ou num arquivo separado `components/arena/ArenaCreateForm.tsx`).

3. **Entrar como jogador**:
   Um Card com input para digitar token + botão "Entrar".
   Ao submeter: redireciona para `/arena/[token]`.
   Use um Client Component simples.

4. **Minhas arenas ativas**:
   Lista de cards das arenas já existentes (DM ou participante).
   Cada card mostra: nome da arena, token, Nº participantes, badge "Mestre" ou "Jogador".
   Clique leva para `/arena/[token]`.
   Se vazio, mostra mensagem encorajadora.

Visual: mesma paleta do projeto (âmbar/stone). Use os componentes `Card`,
`Button`, `PageContainer`, `PageHeader` existentes.
```

---

### Task 4 — Smart Page `/arena/[token]`

**Arquivos**: `app/arena/[token]/page.tsx`

**Prompt**:
```
Crie `app/arena/[token]/page.tsx` como server component.

Lógica de roteamento por papel:
1. Chama `getArenaByToken(token)` — se erro (não encontrada/inativa), renderiza
   página de erro amigável com botão "Voltar para Arena".
2. Se o usuário é o DM (`role === "dm"`):
   → Renderiza `<ArenaDashboard arena={arena} />` (client component, Task 5).
3. Se o usuário é participante (`role === "participant"`):
   → Renderiza `<ArenaPlayerView arena={arena} myCharacterId={...} />` (client component, Task 6).
4. Se não é nenhum dos dois (`role === "none"`):
   → Renderiza `<ArenaJoinFlow arena={arena} />` (client component) que permite
     o usuário escolher um personagem e entrar.
     O `ArenaJoinFlow` deve:
     - Buscar os personagens do usuário (via `supabase.from("characters")` no client).
     - Mostrar cards dos personagens para seleção.
     - Chamar `joinArena({ token, characterId })` ao confirmar.
     - Após entrar, recarregar a página (router.refresh()).

A página deve também mostrar o nome da arena no `<title>` via `generateMetadata`.
```

---

### Task 5 — Dashboard do Mestre (com Realtime)

**Arquivos**: `components/arena/ArenaDashboard.tsx`, `components/arena/ArenaPlayerCard.tsx`,
`components/arena/ArenaTokenShare.tsx`

**Prompt**:
```
Crie o dashboard em tempo real do Mestre.

--- ArenaDashboard.tsx ---
Client component que recebe `arena: ArenaWithParticipants`.
- No mount, inicializa estado local `participants` com os dados do server.
- Subscreve via Supabase Realtime ao canal `arena:${arena.id}` ouvindo
  `postgres_changes` na tabela `arena_participants` filtrando por arena_id.
  Quando receber UPDATE, atualiza o participante correspondente no estado local.
  Quando receber INSERT/DELETE, atualiza a lista.
- Renderiza:
  - Header: nome da arena + `<ArenaTokenShare token={arena.token} />` + botão "Encerrar Arena".
  - Grid responsivo (1 col mobile, 2 col tablet, 3 col desktop) com um
    `<ArenaPlayerCard>` por participante.
  - Estado vazio: "Aguardando jogadores... Compartilhe o token acima."
- Ao clicar "Encerrar Arena": confirma com window.confirm, chama `closeArena`,
  redireciona para `/arena`.

--- ArenaPlayerCard.tsx ---
Client component que recebe dados de um participante + callback `onOpenActions`.
Exibe:
- Retrato (portrait_url) ou ícone de classe (ClassIcon).
- Nome, raça, classe, nível (badge de patamar).
- Barra de PV: hp_current / hp_max, cor vermelha, com ícone Heart.
- Barra de PM: mp_current / mp_max, cor azul, com ícone Sparkles.
- Defesa (Shield icon).
- Badge de status: verde se PV > 50%, amarelo 25-50%, vermelho < 25%.
- Botão "⚔ Ações" que chama `onOpenActions(participantId)`.
- O card inteiro é clicável para abrir ações também.

Visual: Card com borda colorida conforme status de saúde. Border-green/yellow/red.
Animação sutil ao receber atualização de HP (shake ou flash).

--- ArenaTokenShare.tsx ---
Componente que exibe o token em fonte grande (monospace, bold),
um botão "Copiar" (usa navigator.clipboard.writeText) e um botão "Compartilhar"
(usa navigator.share se disponível, fallback para copiar o link completo
`/arena/[token]`). Feedback visual de "Copiado!" por 2s.
```

---

### Task 6 — Gaveta de Ações do Mestre

**Arquivos**: `components/arena/DmActionDrawer.tsx`

**Prompt**:
```
Crie `components/arena/DmActionDrawer.tsx` — uma gaveta (bottom sheet) que abre
quando o Mestre toca em "Ações" de um jogador.

Props: `participant: ArenaParticipant | null`, `onClose: () => void`,
`arenaId: string`, `onUpdated: (p: Partial<ArenaParticipant>) => void`.

Quando `participant` é null, a gaveta não renderiza (ou fica fechada).
Quando presente, renderiza como um overlay fixo na parte inferior com animação
slide-up (use a classe CSS existente ou uma keyframe nova no globals.css).

Seções da gaveta:

1. **Header**: nome do personagem, classe/raça, botão fechar (X).

2. **PV (Pontos de Vida)**:
   - Mostra `hp_current / hp_max` com barra de progresso vermelha.
   - Botões rápidos: −10, −5, −1, +1, +5, +10.
   - Input numérico "Definir PV:" com botão confirmar.
   - Ao confirmar: chama `dmAdjustHp` ou `dmSetHp` conforme o caso.
   - Atualiza otimisticamente o estado local via `onUpdated`.

3. **PM (Pontos de Mana)**:
   - Igual ao PV, cor azul, chama `dmAdjustMp` / `dmSetMp`.

4. **Adicionar Item**:
   - Botão "Adicionar item ao inventário" → abre um mini-modal de busca
     (input de texto que filtra o catálogo pelo nome).
   - Ao selecionar o item, chama a server action `addToInventory` existente
     com `characterId = participant.character_id`, `isDmMode: true`, `acquiredFrom: "dm_manual"`.
   - Mostra feedback de sucesso/erro.

5. **Ajustar Dinheiro**:
   - Input de valor em PO (peças de ouro) + campo de motivo + botão "Dar" / "Cobrar".
   - Chama a server action de ajuste de dinheiro existente (`adjustMoney`
     de `app/actions/inventory.ts` ou equivalente).

6. **Ver Ficha**:
   - Link para `/characters/[characterId]` que abre em nova aba.

Visual: fundo âmbar-50, handle pill no topo, sombra xl. Tap fora fecha.
Altura máxima 85dvh com scroll interno.
```

---

### Task 7 — View do Jogador + Integração na Navegação

**Arquivos**: `components/arena/ArenaPlayerView.tsx`,
`components/layout/bottom-nav.tsx`, `components/character-sheet/character-sheet.tsx`

**Prompt**:
```
Implemente três melhorias de integração:

--- 1. ArenaPlayerView.tsx ---
Client component para o jogador que já entrou na arena.
Recebe `arena: ArenaWithParticipants` e `myCharacterId: string`.
- Subscreve via Realtime ao canal `arena:${arena.id}` para receber atualizações
  do próprio participante (hp_current, mp_current).
- Exibe:
  - Banner: "Você está na Arena: [nome da arena]" com ícone de espada.
  - Seus stats atuais: PV e PM com barras (valores vindos do arena_participants,
    não do localStorage).
  - Lista dos outros participantes (read-only): nome, classe, barra de PV status
    (verde/amarelo/vermelho) — sem ver os números exatos, só a barra de saúde.
  - Botão "Sair da Arena" que chama `leaveArena` e redireciona para a ficha.
  - Link "Ver minha ficha" para `/characters/[myCharacterId]`.

--- 2. BottomNav: adicionar item Arena ---
Edite `components/layout/bottom-nav.tsx`:
- Adicione item "Arena" com ícone `Swords` do lucide-react entre "Heróis" e "Criar".
- href: `/arena`
- Match: `p === "/arena" || p.startsWith("/arena/")`
- Atualize `shouldShowNav` para também mostrar a nav em `/arena`.
- O NAV_ITEMS passa de 3 para 4 itens — ajuste o layout para caber bem
  (já usa `flex-1` então deve ser automático).

--- 3. Banner de Arena na Ficha do Personagem ---
Em `components/character-sheet/character-sheet.tsx`, adicione um banner
informativo quando o personagem está em uma arena ativa.
- No mount (useEffect), chame uma server action `getArenaParticipation(characterId)`
  que retorna `{ arenaToken: string; arenaName: string } | null`.
- Se o personagem está em uma arena ativa, exibe um banner âmbar no topo da ficha:
  "⚔ Em Arena: [nome] — Token: [TOKEN]" com link para `/arena/[token]`.
- Não bloqueia nenhuma funcionalidade existente da ficha.
```

---

## Ordem de implementação recomendada

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7
```

Cada task é independente das seguintes, exceto:
- Task 3, 4, 5, 6, 7 dependem das server actions da Task 2.
- Task 4 depende dos componentes da Task 5 e 6 (pode mockar primeiro).

---

## Checklist pós-implementação

- [ ] `npm run build` passa sem erros TypeScript
- [ ] `supabase/migrate_arena.sql` executado no dashboard
- [ ] Realtime habilitado para `arena_participants` no Supabase dashboard
- [ ] Criar arena como DM → token gerado
- [ ] Entrar como jogador com token → personagem vinculado
- [ ] DM vê o card do jogador ao vivo
- [ ] Dar dano via gaveta → PV atualiza no card do DM e na view do jogador
- [ ] Adicionar item via gaveta → item aparece no inventário do personagem
- [ ] Encerrar arena → participantes são desconectados
- [ ] BottomNav mostra item Arena

---

## Notas técnicas

- **Token**: `crypto.randomBytes(4).toString("hex").toUpperCase()` gera 8 chars hex (ex: "A3F2C90B"). Ou `nanoid(8)` se já instalado.
- **Realtime client**: usar `import { createClient } from "@/lib/supabase/client"` nos componentes client. O canal deve ser cancelado no `useEffect` cleanup (`channel.unsubscribe()`).
- **RLS + admin**: As server actions que modificam `arena_participants` em nome do DM devem usar `createAdminClient()` para bypassar RLS, verificando manualmente que o user é DM da arena antes de executar.
- **Catálogo para o mini-modal de itens**: passar o catálogo como prop do server component pai ou fazer fetch no client com `createClient().from("items").select(...)` filtrado por nome.
