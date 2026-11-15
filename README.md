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
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                   | Invitation sign-up path (`/admin/sign-up`)    |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Post sign-up redirect (default: `/admin`)     |

Administrative access is by invitation only. Super admins invite people from **Usuarios** (`/admin/users`): AROMA creates a pending profile and Clerk emails an invitation that leads to `/admin/sign-up`. On the person's first sign-in, the profile is linked to their Clerk user through their verified email. If the email already has a Clerk account, the profile is linked right away and no invitation is sent.

To set up Clerk for this:

1. In the Clerk dashboard, set **Configure → Restrictions → Sign-up mode** to **Restricted**, so only invited people can create an account.
2. Set `NEXT_PUBLIC_SITE_URL`: invitations link to `{NEXT_PUBLIC_SITE_URL}/admin/sign-up`. Without it, Clerk uses its own sign-up page.
3. Optionally, turn off first and last name under **Configure → User & authentication**: AROMA keeps the name given when inviting, so sign-up only needs a password.

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

| Variable               | Description                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for absolute links in link previews and in the product link of WhatsApp messages (optional; for example `https://…`) |

**Alliance support**

| Variable                    | Description                                                                                                                                                                                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ALLIANCE_SUPPORT_WHATSAPP` | Fallback WhatsApp number of the alliance administration, with country code (optional). Super admins manage the number in **Contenido → Contacto de la alianza**; this variable applies only until it is saved there. Access notices and product pages without an association WhatsApp use it; without a number, those buttons are hidden |

## Scripts

| Command            | Action                                     |
| ------------------ | ------------------------------------------ |
| `pnpm dev`         | Start development server                   |
| `pnpm build`       | Production build                           |
| `pnpm start`       | Start production server                    |
| `pnpm lint`        | Run ESLint                                 |
| `pnpm typecheck`   | Type-check without emitting                |
| `pnpm test`        | Run tests (watch mode in a terminal)       |
| `pnpm test:ci`     | Run tests once, as in CI                   |
| `pnpm test:e2e`    | Build and run the end-to-end suite         |
| `pnpm test:e2e:ui` | Open Playwright's UI on the last E2E build |
| `pnpm db:generate` | Generate Drizzle migrations                |
| `pnpm db:migrate`  | Apply pending migrations                   |
| `pnpm db:check`    | Validate migration consistency             |
| `pnpm db:studio`   | Open Drizzle Studio                        |
| `pnpm db:seed`     | Seed the database (⚠ destructive)          |

## Testing

Automated tests use [Vitest](https://vitest.dev) and live next to the code they cover (`*.test.ts`). They focus on business rules such as authorization and product visibility, not on visual snapshots or a coverage target.

- Database queries run against an in-memory PostgreSQL ([PGlite](https://pglite.dev)) with the project's migrations applied, so tests need no credentials or external services.
- Clerk and other external services are mocked where a test needs them.
- Shared helpers live in `src/test`: `createTestDatabase()` and fixtures for associations, categories, products and profiles.
- CI runs `pnpm test:ci` on every pull request to `main`, and then the end-to-end suite.

### Unit and integration tests (Vitest)

Vitest owns the rules: authorization, visibility, validation, invariants and race conditions. Most behavior belongs here, where tests are fast and precise.

### End-to-end tests (Playwright)

[Playwright](https://playwright.dev) covers only the few journeys that need a real browser, routing and rendered pages. The specs live in `e2e/`:

- **Storefront** (`storefront.spec.ts`): a visitor finds a published product on the home page and opens its page; the product's WhatsApp action points to the association's number with a message about the product. The test reads the link's target and never follows it, so no message is sent.
- **Associations** (`associations.spec.ts`): directory → association profile → one of its products.
- **Admin access** (`admin-access.spec.ts`): visiting admin routes without a session leads to sign-in, and sign-up without an invitation is closed.
- **Admin journeys** (`admin-journeys.spec.ts`, only with a Clerk development instance): an association admin creates a product, adds a presentation and publishes it, and it appears on the storefront; an association admin sees only their own sections; a super admin edits an institutional text and sees it on the site.

Prefer roles, labels and visible text over CSS selectors, and do not repeat rules Vitest already covers unless a journey needs them.

```bash
pnpm exec playwright install chromium   # once, to download the browser
pnpm test:e2e                           # build the app for E2E and run the suite
pnpm test:e2e:ui                        # explore or debug, after a build
```

The suite runs in an isolated environment and never touches real data or services:

- **Database**: `e2e/server.ts` starts an in-memory [PGlite](https://pglite.dev) with the project's migrations and the fixed data in `e2e/seed.ts`, served as PostgreSQL on a local port. The app connects to it with `DATABASE_DRIVER=node-postgres`; every run starts from the same data.
- **Clerk**: by default, keys in a valid format that point to no instance. Without a session, Clerk makes no network calls, so every visitor is signed out and the admin journeys are skipped. With a Clerk development instance (below), the suite signs in with Clerk's testing tokens; the app has no authentication shortcut for tests.
- **Media**: no R2; products show their placeholder image.
- **Environment**: `e2e/environment.ts` sets every variable the app reads, so `.env.local` does not leak in. The app is built into `.next-e2e`, apart from `.next`.

#### Admin journeys with a Clerk development instance

1. Use a Clerk **development** instance, never the production one. It can be the instance you use for local development: the suite only adds its two test users. Development keys start with `pk_test_` and `sk_test_`; the suite refuses any other.
2. Locally, put them in `.env.e2e.local` (ignored by git):
   ```bash
   E2E_CLERK_PUBLISHABLE_KEY=pk_test_…
   E2E_CLERK_SECRET_KEY=sk_test_…
   ```
   In CI, add them as repository secrets with the same names.
3. Run `pnpm test:e2e`. The global setup creates the test users if they are missing, `aroma-e2e-superadmin+clerk_test@example.com` and `aroma-e2e-asociacion+clerk_test@example.com` (Clerk test addresses, no email is sent). The E2E seed leaves pending AROMA profiles with those emails, which the app links on their first sign-in, as with any invitation.

On failure, Playwright keeps a trace and a screenshot in `test-results/` and an HTML report in `playwright-report/`. In CI, the `e2e` job runs after the checks, unit tests and build pass, and uploads both as artifacts.
