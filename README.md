# Periféricos de PC

Full-stack e-commerce storefront built with Next.js App Router, Prisma, Neon PostgreSQL, and Tailwind CSS.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript 5 in strict mode
- Tailwind CSS 4
- Prisma 7
- Neon PostgreSQL
- Server Components
- Server Actions
- Zod
- Vitest + Testing Library

## Architecture

- Reads use Server Components and server-only Prisma readers from `src/lib`.
- Writes use typed Server Actions, with validation and persistence handled on the server.
- Prisma is the data access layer for products, categories, and orders.
- PostgreSQL stores the catalog, inventory, and order data model.
- Tailwind CSS powers the storefront UI and shared visual patterns.

## Project Structure

```text
src/
  app/        App Router pages and layouts
  components/ Shared UI components
  context/    Client-side cart state
  features/   Feature-scoped UI and actions
  lib/        Prisma, readers, validation, metadata
  styles/     Global Tailwind styles
  test/       Vitest test suite
  types/      Shared TypeScript types

prisma/
  migrations/ Prisma migrations
  schema.prisma
  seed.ts
```

## Environment Variables

Create `.env.local` from `.env.local.example` and fill in:

- `DATABASE_URL`: Neon pooled connection string for the app and Prisma Client.
- `DIRECT_URL`: Neon direct connection string for Prisma migrations and seeding.
- `NEXT_PUBLIC_SITE_URL`: Public site URL used for metadata and canonical URLs.

Production notes:

- On Vercel, set `DATABASE_URL` to the Neon pooled connection string.
- Set `DIRECT_URL` to the direct Neon connection string for `prisma migrate deploy` and seeding workflows.
- Set `NEXT_PUBLIC_SITE_URL` to the production domain, for example `https://your-store.vercel.app` or your custom domain.
- If `NEXT_PUBLIC_SITE_URL` is not set, metadata falls back to Vercel-provided deployment URLs. The explicit production URL is still the recommended setting.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create the local env file:

```bash
cp .env.local.example .env.local
```

3. Run Prisma migrations:

```bash
npx prisma migrate dev
```

4. Seed the database:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

## Scripts

- `npm run dev`: start the local Next.js dev server
- `npm run build`: create a production build
- `npm run start`: run the production server
- `npm run lint`: run ESLint
- `npm test`: run the Vitest suite
- `npm run db:seed`: seed categories and products

## Vercel Deployment

Recommended deployment setup:

1. Create a Neon project and capture both the pooled and direct connection strings.
2. In the Vercel project settings, configure:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SITE_URL`
3. Apply schema changes with Prisma using the direct connection:

```bash
npx prisma migrate deploy
```

4. Seed only when needed for a fresh environment:

```bash
npm run db:seed
```

Operational notes:

- The application runtime reads through Prisma using `DATABASE_URL`.
- Prisma migrations should use `DIRECT_URL`, not the pooled URL.
- After changing environment variables in Vercel, trigger a new deployment.
- `next.config.ts` does not require special Vercel-only flags for the current architecture.

## Verification

Typical pre-deploy verification:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

## Notes

- Checkout order creation runs on the server and reloads authoritative product prices from PostgreSQL.
- Inventory validation and stock decrement happen inside a Prisma transaction.
- Product and category routes use real App Router 404 behavior for missing resources.
