# Perifericos de PC

Portfolio e-commerce storefront built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, Neon PostgreSQL, and Zod. It demonstrates a realistic catalog, cart, and simulated checkout flow without claiming production commerce features such as real payments, shipping, authentication, or an admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748)
![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20RTL%20%2B%20Playwright-6e9f18)

## Demo

- Live app: https://tech-store-gilt.vercel.app

## Feature summary

- Product catalog with search, filters, sorting, category navigation, and empty states.
- Product detail pages with clean slugs, related products, stock visibility, and purchase CTA.
- Editable cart with quantity controls, stock limits, and local persistence.
- Simulated checkout with contact, shipping, payment selection, summary, and order creation.
- Responsive storefront flow across mobile, tablet, and desktop layouts.
- Cart and checkout are intentionally non-indexable, while catalog and product pages include SEO metadata and structured data.

## Screenshots

Screenshots are stored in `docs/screenshots/`:

| Home | Category/catalog |
| --- | --- |
| ![Home storefront screenshot](docs/screenshots/home.png) | ![Category catalog screenshot](docs/screenshots/catalog.png) |

| Product detail | Cart | Checkout |
| --- | --- | --- |
| ![Product detail screenshot](docs/screenshots/pdp.png) | ![Cart screenshot](docs/screenshots/cart.png) | ![Checkout screenshot](docs/screenshots/checkout.png) |

To refresh them locally, run the app with a valid database-backed `.env.local`, add a product to the cart before visiting checkout, and capture the same routes.

## What this demonstrates

- **App Router architecture:** route-based pages, layouts, metadata, server components, server actions, and server-side data reads.
- **Realistic e-commerce UX:** browsable catalog, category filtering, PDPs, stock-aware cart behavior, empty states, and a checkout form designed as a believable purchase flow.
- **Server-side validation:** checkout input is validated in the UI and then validated again on the server with Zod before any order is persisted.
- **Prisma/PostgreSQL persistence:** product, category, order, and order item data are modeled with Prisma and stored in PostgreSQL.
- **Stock-safe checkout transaction:** order creation reloads authoritative product data from the database and decrements stock inside a Prisma transaction.
- **Technical SEO:** canonical URLs, sitemap, robots rules, route metadata, Open Graph data, slug-based product URLs, and JSON-LD for key page types.
- **Testing strategy:** Vitest and Testing Library cover domain/UI behavior, while Playwright provides a smoke check for the main storefront path.

## Data integrity highlight

The checkout does not trust client-submitted prices, stock, or product availability. When an order is created, the server reloads the selected products from PostgreSQL, rejects missing/inactive/duplicate items, recalculates prices from database data, and decrements inventory inside a Prisma transaction.

That keeps the portfolio scope honest while still showing the core integrity pattern expected from a real commerce backend: the database is the source of truth, and stock changes are committed atomically with the order.

## Technical highlights

### App Router and rendering

The storefront uses App Router pages, layouts, server components, and server actions. Catalog and product routes are built around route-level metadata, SEO, and server-side reads rather than a purely client-driven storefront.

The main catalog, category, product, and sitemap routes use timed revalidation. Catalog reads are wrapped through shared cache utilities so future cache and invalidation changes stay centralized.

### Prisma + Neon PostgreSQL

Prisma is the data access layer for categories, products, inventory, and orders. Neon PostgreSQL stores the catalog and order model, while Prisma migrations keep schema changes explicit and reviewable.

### Cart persistence

Cart state lives client-side and persists to `localStorage`, with guarded hydration to avoid overwriting an existing cart on first mount.

### Checkout validation

Checkout input is validated in the UI and validated again on the server through Zod before persistence. This keeps the form realistic without pretending to process real charges.

### Technical SEO

Implemented SEO work includes:

- `sitemap.xml`
- `robots.txt`
- Canonical URLs
- Per-page metadata
- Open Graph fields
- JSON-LD
- Product slug routes under `/products/[slug]`

Structured data is included for `WebSite`, `Store`, `BreadcrumbList`, and `Product`.

## Testing

Current coverage focuses on:

- Cart reducer and cart hydration.
- Catalog search helpers.
- Checkout validation.
- Order creation flow.
- Not-found route behavior.
- Main ecommerce smoke flow: home/catalog -> PDP -> cart -> checkout.

Pre-ship verification:

```bash
npm run lint
npm test
npm run build
```

E2E smoke:

```bash
npx playwright install chromium
npm run test:e2e
```

## Local setup

```bash
npm install
cp .env.local.example .env.local
npx prisma migrate dev
npm run db:seed
npm run dev
```

On Windows PowerShell, if `cp` is unavailable:

```powershell
Copy-Item .env.local.example .env.local
```

Required environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SITE_URL`

## Scope / non-goals

Deliberately out of scope for this portfolio version:

- Real payment gateway.
- Real shipping/logistics integration.
- Real transactional emails.
- Customer authentication and account area.
- Admin panel or CMS.
- Order history UI.
- Production commerce readiness claims.

## Future improvements

- Refine cache and revalidation strategy for catalog and SEO routes.
- Expand end-to-end coverage beyond the initial storefront smoke flow.
- Add richer stock and checkout error handling.
- Optionally add authentication and customer order history.
- Add a lightweight admin workflow for catalog/order maintenance.
