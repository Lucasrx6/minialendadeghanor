# Forja de Ghanor

Mini-aplicativo web para criar personagens de 1º nível de **A Lenda de Ghanor RPG**. É uma ferramenta auxiliar feita por fãs, com wizard de criação, cálculo de atributos derivados, ficha imprimível, Supabase Auth/Database/Storage e retrato por IA.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth, Postgres e Storage
- Zod, React Hook Form e Zustand
- OpenAI Images API
- Vitest

## Configuração

Crie `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://goijhxeefrecehuqobrn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` pode ficar no client. `SUPABASE_SERVICE_ROLE_KEY` e `OPENAI_API_KEY` devem existir apenas no ambiente server/Vercel. Se uma chave secreta foi compartilhada em chat, rotacione no painel do Supabase antes de usar.

## Banco de dados

O schema está em [`lib/supabase/schema.sql`](./lib/supabase/schema.sql).

Aplicar pelo SQL Editor:

1. Abra o projeto no Supabase.
2. Vá em **SQL Editor**.
3. Cole o conteúdo de `lib/supabase/schema.sql`.
4. Execute.

Aplicar pela CLI:

```bash
supabase login
supabase link --project-ref goijhxeefrecehuqobrn
supabase db push
```

O schema cria a tabela `characters`, políticas RLS por `auth.uid()`, trigger de `updated_at` e bucket `character-portraits`.

## Desenvolvimento

```bash
npm run dev
npm run lint
npm run test
npm run build
```

Abra `http://localhost:3000`.

## Deploy na Vercel

Configure as variáveis:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

No Supabase Auth, adicione as URLs de callback:

- `http://localhost:3000/auth/callback`
- `https://SEU-PROJETO.vercel.app/auth/callback`

O cadastro usa nome de usuario + senha. Internamente o app cria um email tecnico
`usuario@users.minialendadeghanor.app` ja confirmado via `SUPABASE_SERVICE_ROLE_KEY`, e salva
o email real informado em `user_metadata.recovery_email` para recuperacao futura.

## Aviso

Ferramenta criada por fãs. A Lenda de Ghanor é marca registrada da Jambô Editora. Este projeto não é afiliado nem endossado por Jovem Nerd ou Jambô.
