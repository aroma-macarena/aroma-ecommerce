# AROMA e-commerce

Web platform for showcasing and managing products from the AROMA alliance.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Drizzle ORM · Neon PostgreSQL · pnpm · Clerk · shadcn/ui

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

**Media storage (Cloudflare R2)**

| Variable                     | Description                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | Public URL of the bucket, such as its custom domain (optional; products show a placeholder image when it is not set) |
| `R2_ACCOUNT_ID`              | Cloudflare account ID (server-side)                                                                                  |
| `R2_ACCESS_KEY_ID`           | R2 API token access key ID (server-side)                                                                             |
| `R2_SECRET_ACCESS_KEY`       | R2 API token secret access key (server-side)                                                                         |
| `R2_BUCKET`                  | Bucket name (server-side)                                                                                            |

Image uploads are available only when all five are set; otherwise the admin explains that uploads are not configured. The `R2_*` values are read only on the server and are never sent to the browser.

To set up R2:

1. Create a bucket in Cloudflare R2.
2. Give it public access, preferably through a custom domain (R2 → bucket → Settings → Public access), and use that URL as `NEXT_PUBLIC_MEDIA_BASE_URL`. The `r2.dev` URL works for testing but is rate limited.
3. Create an R2 API token with **Object Read & Write** permission limited to that bucket, and copy its access key ID and secret into `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.
4. Rebuild after changing `NEXT_PUBLIC_MEDIA_BASE_URL`: Next.js reads it at build time to allow its images.

Product images are stored as `products/{productId}/{uuid}.{webp|jpg|png}`. The database keeps only that key; `getMediaUrl` in `src/lib/media.ts` builds every public URL from it.

**Public site**

| Variable               | Description                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for absolute links in link previews (optional; for example `https://…`) |

**Alliance support**

| Variable                    | Description                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `ALLIANCE_SUPPORT_WHATSAPP` | WhatsApp number of the alliance administration, with country code (optional; access notices hide the contact button without it) |

## Scripts

| Command            | Action                               |
| ------------------ | ------------------------------------ |
| `pnpm dev`         | Start development server             |
| `pnpm build`       | Production build                     |
| `pnpm start`       | Start production server              |
| `pnpm lint`        | Run ESLint                           |
| `pnpm typecheck`   | Type-check without emitting          |
| `pnpm test`        | Run tests (watch mode in a terminal) |
| `pnpm test:ci`     | Run tests once, as in CI             |
| `pnpm db:generate` | Generate Drizzle migrations          |
| `pnpm db:migrate`  | Apply pending migrations             |
| `pnpm db:check`    | Validate migration consistency       |
| `pnpm db:studio`   | Open Drizzle Studio                  |
| `pnpm db:seed`     | Seed the database (⚠ destructive)    |

## Testing

Automated tests use [Vitest](https://vitest.dev) and live next to the code they cover (`*.test.ts`). They focus on business rules such as authorization and product visibility, not on visual snapshots or a coverage target.

- Database queries run against an in-memory PostgreSQL ([PGlite](https://pglite.dev)) with the project's migrations applied, so tests need no credentials or external services.
- Clerk and other external services are mocked where a test needs them.
- Shared helpers live in `src/test`: `createTestDatabase()` and fixtures for associations, categories, products and profiles.
- CI runs `pnpm test:ci` on every pull request to `main`.

End-to-end browser tests are not set up yet.
