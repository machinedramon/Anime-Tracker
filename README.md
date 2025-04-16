# Anime Tracker

Uma aplicação moderna para rastreamento e organização da sua lista de animes. Acompanhe seus animes favoritos, registre seu progresso, e receba notificações personalizadas.

## Características

- 📊 Dashboard com estatísticas e visualizações
- 📝 Diário de animes com status personalizáveis
- 🔍 Busca de animes com interface moderna
- 🏆 Sistema de conquistas
- 🔔 Notificações push para lembretes

## Tecnologias

- [SvelteKit](https://kit.svelte.dev/) - Framework web
- [Svelte 5 (Runes)](https://svelte.dev/) - Interface reativa
- [Tailwind CSS](https://tailwindcss.com/) - Estilização
- [Drizzle ORM](https://orm.drizzle.team/) - ORM para banco de dados
- [SQLite](https://www.sqlite.org/) - Banco de dados
- [Web Push](https://www.npmjs.com/package/web-push) - Notificações push

## Configuração e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Bun](https://bun.sh/) (para execução rápida)

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/anime-tracker.git
   cd anime-tracker
   ```

2. Instale as dependências
   ```bash
   bun install
   ```

3. Gere as chaves VAPID para notificações push
   ```bash
   npx web-push generate-vapid-keys
   ```
   > **Nota**: Este comando deve ser executado com `npx`, não com `bunx`.

4. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
   ```
   DATABASE_URL=file:local.db
   VITE_VAPID_PUBLIC_KEY=SuaChavePublicaGerada
   VITE_VAPID_PRIVATE_KEY=SuaChavePrivadaGerada
   ```
   Substitua `SuaChavePublicaGerada` e `SuaChavePrivadaGerada` pelas chaves geradas no passo anterior.

5. Inicialize o banco de dados
   ```bash
   bun run db:push
   ```

6. Inicie o servidor de desenvolvimento
   ```bash
   bun run dev
   ```

7. Acesse a aplicação em [http://localhost:5173](http://localhost:5173)

## Scripts Disponíveis

- `bun run dev` - Inicia o servidor de desenvolvimento
- `bun run build` - Cria a versão de produção
- `bun run preview` - Visualiza a versão de produção localmente
- `bun run db:push` - Aplica as migrações ao banco de dados
