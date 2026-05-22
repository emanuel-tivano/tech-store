# Periféricos de PC

Portfolio e-commerce storefront built with Next.js App Router, Prisma, Neon PostgreSQL, and Tailwind CSS.  
The project focuses on a realistic browsing, cart, and checkout flow for a small product catalog, with honest product constraints and technical SEO in place.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748)
![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20RTL%20%2B%20Playwright-6e9f18)
![Status](https://img.shields.io/badge/Build-Passing-2ea44f)

**Primary stack**

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma + Neon PostgreSQL
- Zod
- Vitest + Testing Library
- Playwright (smoke E2E)

**Demo**

- Deploy: `add-your-production-url-here`

## Screenshots

Replace these placeholders with real screenshots before publishing the repository:

- `docs/screenshots/home.png` - Home
- `docs/screenshots/catalog.png` - Catálogo
- `docs/screenshots/pdp.png` - Product Detail Page
- `docs/screenshots/cart.png` - Carrito
- `docs/screenshots/checkout.png` - Checkout

## Features

### User features

- Product catalog with search, filters, sorting, category navigation, and empty states
- Product detail pages with clean slugs, related products, stock visibility, and purchase CTA
- Editable cart with quantity controls, stock limits, and local persistence
- Simulated checkout with contact, shipping, payment selection, summary, and order creation
- Responsive storefront flow across mobile, tablet, and desktop layouts

### Technical features

- App Router pages with typed metadata and route-level SEO
- Prisma-backed catalog and order persistence on PostgreSQL
- Server-side stock validation and atomic stock decrement inside a transaction
- Structured JSON-LD for website, breadcrumbs, organization, and product pages
- Typed server actions and Zod validation for checkout writes
- Test suite covering cart behavior, search helpers, checkout validation, and order creation

## Technical highlights

### Next.js App Router

The storefront uses App Router pages, layouts, server components, and server actions.  
Catalog and product routes are shaped around route-level metadata, SEO, and server-side data reads instead of a purely client-driven storefront.

### Prisma + Neon

Prisma is the data access layer for categories, products, inventory, and orders.  
Neon PostgreSQL stores the catalog and order model, while Prisma migrations keep schema changes explicit and reviewable.

### Cart persistence

Cart state lives client-side and persists to `localStorage`, with guarded hydration to avoid overwriting an existing cart on first mount.

### Checkout validation

Checkout input is validated in the UI and validated again on the server through Zod before persistence.  
This keeps the form realistic without pretending to be a real payment integration.

### SEO técnico

The project includes canonical URLs, sitemap, robots rules, metadata per page, slug-based product routes, and route-aware Open Graph data.

### JSON-LD

Structured data is included for:

- `WebSite`
- `Store`
- `BreadcrumbList`
- `Product`

### Tests

Vitest and Testing Library cover cart reducer logic, cart persistence hydration, catalog search helpers, checkout validation, order creation, and route fallbacks. A minimal Playwright smoke test covers the main storefront path from catalog to checkout.

### Stock transaction

Orders reload authoritative prices and stock from PostgreSQL, then decrement stock inside a Prisma transaction.  
This is one of the most important integrity guarantees in the project.

### Responsive UI

The storefront is designed as a responsive purchase flow rather than a static landing page: header search, grid behavior, PDP, cart, and checkout all adapt to smaller breakpoints.

## Architecture and decisions

### Why the checkout is simulated

This project is meant to demonstrate a credible commerce flow without faking a real payment gateway.  
The checkout persists buyer, shipping, and payment selection data, but does not process real charges.

### Why there is no authentication

Authentication was intentionally excluded to keep the scope centered on storefront fundamentals: catalog browsing, cart behavior, checkout UX, inventory consistency, and technical SEO.

### Why some routes remain `force-dynamic`

Home, category, product, and sitemap routes still rely on live Prisma reads in the current setup.  
That decision keeps the implementation predictable for this portfolio version, at the cost of a more advanced cache and revalidation strategy that can be added later.

### Current tradeoffs

- The checkout is realistic, but not a real commerce integration
- The data model is clean, but there is no admin back office
- Rendering is stable, but caching and revalidation are still conservative

## Scope / non-goals

Deliberately out of scope for this version:

- Real payment gateway
- Real shipping/logistics integration
- Real transactional emails
- Customer authentication and account area
- Admin panel / CMS
- Order history UI

## SEO

Implemented SEO work includes:

- `sitemap.xml`
- `robots.txt`
- Canonical URLs
- Per-page metadata
- Open Graph fields
- JSON-LD
- Product slug routes under `/products/[slug]`

Cart and checkout are explicitly marked as non-indexable through metadata, not only robots rules.

## Testing

Pre-ship verification for the current repo:

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

Current coverage focus:

- Cart reducer and cart hydration
- Catalog search helpers
- Checkout validation
- Order creation flow
- Not-found route behavior
- Main ecommerce smoke flow: home/catalog -> PDP -> cart -> checkout

## Local setup

```bash
npm install
cp .env.local.example .env.local
npx prisma migrate dev
npm run db:seed
npm run dev
```

To run the smoke E2E locally after setup:

```bash
npx playwright install chromium
npm run test:e2e
```

Required environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SITE_URL`

## Future improvements

- Introduce cache and revalidation strategy for catalog and SEO routes
- Expand end-to-end coverage beyond the initial storefront smoke flow
- Add authentication and order history
- Add a lightweight admin workflow for catalog/order management
