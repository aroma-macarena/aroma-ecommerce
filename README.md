# AROMA e-commerce

Web platform for showcasing and managing products from the AROMA alliance.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Drizzle ORM · Neon PostgreSQL · pnpm

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL and DATABASE_URL_UNPOOLED
pnpm db:migrate
pnpm dev
```

App runs at `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

**Neon DB**

| Variable                | Description                              |
| ----------------------- | ---------------------------------------- |
| `DATABASE_URL`          | Pooled connection string (Neon)          |
| `DATABASE_URL_UNPOOLED` | Direct connection string (Neon)          |
| `ALLOW_DB_SEED`         | Set to `true` to enable database seeding |

**Clerk**

| Variable                                          | Description                                   |
| ------------------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`               | Clerk publishable key (client-side)           |
| `CLERK_SECRET_KEY`                                | Clerk secret key (server-side)                |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                   | Sign-in page path (default: `/admin/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Post sign-in redirect (default: `/admin`)     |

## Scripts

| Command            | Action                            |
| ------------------ | --------------------------------- |
| `pnpm dev`         | Start development server          |
| `pnpm build`       | Production build                  |
| `pnpm start`       | Start production server           |
| `pnpm lint`        | Run ESLint                        |
| `pnpm typecheck`   | Type-check without emitting       |
| `pnpm db:generate` | Generate Drizzle migrations       |
| `pnpm db:migrate`  | Apply pending migrations          |
| `pnpm db:check`    | Validate migration consistency    |
| `pnpm db:studio`   | Open Drizzle Studio               |
| `pnpm db:seed`     | Seed the database (⚠ destructive) |
