# AGENTS.md

## Descripción del proyecto

`tech-store` es una storefront e-commerce de periféricos para PC construida con Next.js App Router. El flujo principal cubre catálogo, PDP, carrito y checkout simulado con persistencia de órdenes y decremento de stock en PostgreSQL vía Prisma.

El repo está orientado a portfolio, pero la lógica de catálogo, SEO técnico, validación y consistencia de stock es real. No hay autenticación, pasarela de pago real ni panel admin.

## Stack

- Next.js 15 (`App Router`)
- React 19
- TypeScript estricto
- Tailwind CSS 4
- Prisma 7 + PostgreSQL (`pg`, `@prisma/adapter-pg`)
- Zod 4
- Vitest 3 + Testing Library + JSDOM
- Playwright para smoke E2E

## Comandos reales del repo

Usar únicamente comandos confirmados en `package.json` o documentados en `README.md`.

### Instalación y setup local

```bash
npm install
cp .env.local.example .env.local
npx prisma migrate dev
npm run db:seed
```

Notas:

- `cp` aparece en el README. En PowerShell suele funcionar como alias, pero no asumir Bash.
- En Windows PowerShell, si `cp .env.local.example .env.local` falla, usar:

```powershell
Copy-Item .env.local.example .env.local
```

- No incluir ni exponer valores de `.env`, `.env.local`, `DATABASE_URL`, `DIRECT_URL` o `NEXT_PUBLIC_SITE_URL`.

### Desarrollo

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Tests unitarios / integración

```bash
npm test
```

### Tests E2E

```bash
npx playwright install chromium
npm run test:e2e
```

### Build

```bash
npm run build
```

### Producción local

```bash
npm run start
```

## Estructura importante del repo

- `src/app`: rutas App Router, `layout`, metadata base, `robots`, `sitemap`, páginas de home, categoría, producto, carrito, checkout y ayuda.
- `src/features`: vistas y lógica de producto, catálogo, carrito y checkout.
- `src/components`: componentes compartidos de UI y SEO (`json-ld`, header, breadcrumbs, grids, states).
- `src/context`: estado global cliente del carrito.
- `src/lib`: lecturas de catálogo, metadata/SEO, validación de orden, escritura de órdenes, caché/revalidación y utilidades de dominio.
- `src/styles/globals.css`: tokens visuales, clases utilitarias de componentes y look & feel global.
- `src/types`: DTOs y tipos compartidos de catálogo, carrito y órdenes.
- `src/test`: suite Vitest/RTL.
- `e2e`: smoke test de Playwright.
- `prisma/schema.prisma`: modelos `Category`, `Product`, `Order`, `OrderItem`.
- `prisma/seed.ts`: seed de categorías y productos.
- `public/products`: imágenes de catálogo.
- `public/icons`: íconos del storefront.

Notas:

- `src/hooks` y `src/services` existen pero hoy están vacíos.
- En PowerShell, para leer o editar rutas con segmentos dinámicos como `src/app/products/[slug]/page.tsx`, usar `-LiteralPath`.
- `.next`, `build`, `node_modules` y `test-results` no son fuentes de verdad para cambios de código.

## Reglas generales para Codex

- No modificar archivos sin que la tarea lo requiera.
- Mantener el diff lo más chico posible.
- No instalar dependencias sin justificarlo antes.
- No cambiar arquitectura por preferencia personal.
- No tocar Prisma schema, migraciones, seed o lógica de stock salvo que la tarea lo pida explícitamente.
- No convertir Server Components en Client Components sin necesidad real.
- No mover lógica server al cliente.
- No romper SEO técnico existente.
- No agregar features fuera de alcance.
- No introducir pagos reales, auth o admin panel salvo instrucción explícita.
- Priorizar estabilidad, mantenibilidad y claridad sobre cambios cosméticos.
- Revisar `git diff` antes de responder.
- Confirmar con `git status --short` que no hay archivos modificados inesperados.
- No hacer commits, push, reset, checkout, rebase ni operaciones destructivas de Git salvo pedido explícito del usuario.

Para tareas medianas o grandes:

- Primero analizar el problema.
- Proponer un plan corto.
- Implementar sólo cuando el alcance esté claro.
- Evitar refactors amplios si el pedido puede resolverse con un cambio local.
- Separar hallazgos de implementación cuando el usuario pida una revisión o auditoría.

## Reglas de arquitectura

- Mantener la separación actual:
  - `src/app` define rutas y metadata.
  - `src/features` compone UI por flujo de negocio.
  - `src/lib` contiene lógica reutilizable de datos, validación y dominio.
  - `src/context` contiene estado cliente compartido.
- Respetar server/client boundaries:
  - usar `'use client'` solo en componentes que realmente necesitan hooks, estado, `localStorage` o interactividad cliente;
  - mantener `server-only` en módulos de datos/servidor cuando ya aplica.
- No mover lógica de acceso a datos Prisma a componentes cliente.
- Reusar `src/lib/metadata.ts` para canonical, Open Graph, Twitter y URLs absolutas; no duplicar lógica SEO por página.
- Reusar `src/lib/server-cache.ts` para lecturas cacheadas y revalidación de catálogo. Si una escritura afecta catálogo/stock, revisar si corresponde llamar `revalidateCatalogData()`.
- El checkout valida dos veces:
  - validación de formulario en `src/features/checkout/validation.ts`;
  - validación de entrada de orden en servidor con Zod (`src/lib/order-create-schema.ts` / `src/lib/orders-create.ts`).
- La creación de órdenes debe preservar integridad:
  - recargar precio/stock desde PostgreSQL;
  - rechazar productos faltantes, inactivos o duplicados;
  - decrementar stock dentro de transacción Prisma;
  - no confiar en precios ni stock enviados desde cliente.
- Mantener alias `@/*` para imports desde `src`.
- No introducir una ruta nueva sin revisar metadata, indexabilidad y sitemap/robots cuando aplique.

## Reglas de UI

- Preservar el idioma y tono actual de la UI: español, foco e-commerce local (`es-AR`).
- Mantener el sistema visual definido en `src/styles/globals.css`:
  - paleta principal azul (`--brand-*`);
  - fondos claros;
  - componentes reutilizables como `surface-card`, `btn-*`, `input-base`, `brand-*`.
- Reusar componentes existentes antes de crear variantes nuevas:
  - `ProductGrid`, `ProductCard`, `PageState`, `SiteHeader`, `TrustSignals`, `Breadcrumbs`.
- Mantener responsive behavior en home, PDP, carrito y checkout.
- Mantener accesibilidad ya presente:
  - `focus-visible` claro;
  - labels y headings consistentes;
  - queries de tests basadas en roles/nombres accesibles.
- Mantener SEO visible/no visible:
  - `JsonLd` en layout y páginas relevantes;
  - cart/checkout como no indexables cuando corresponda.
- No reemplazar el look actual por un diseño genérico o por defaults del framework.

## Reglas de testing

- Si se toca lógica de dominio, catálogo, carrito, checkout, metadata o rutas fallback, agregar o ajustar tests en `src/test`.
- Seguir el setup actual de Vitest:
  - entorno `jsdom`;
  - `src/test/setup.ts`;
  - mock de `next/image`;
  - mock de `server-only`.
- Mantener tests de unidad/integración cerca del dominio real del cambio; no crear suites ad-hoc fuera de `src/test` salvo E2E en `e2e`.
- Para lógica con Prisma, preferir mocks explícitos como en `src/test/orders-create.test.ts`.
- Para UI, preferir Testing Library con roles, labels y texto visible antes que selectores frágiles.
- Si se modifica el flujo principal storefront (`/` -> PDP -> carrito -> checkout), considerar impacto en `e2e/smoke.spec.ts`.
- Comandos de validación esperables antes de cerrar cambios relevantes:
  - `npm run lint`
  - `npm test`
  - `npm run build`
- Para cambios de flujo end-to-end, además:
  - `npm run test:e2e`

## Qué no hacer

- No inventar scripts. En este repo no existe script dedicado de typecheck.
- No modificar `.env`, `.env.local` ni exponer secretos.
- No romper la separación server/client metiendo Prisma, `next/cache` o lógica de servidor en componentes cliente.
- No duplicar lógica de metadata, catálogo o checkout si ya existe en `src/lib` o `src/features`.
- No usar archivos generados (`.next`, `build`, `test-results`) como base para editar.
- No asumir integración de pagos reales, auth, shipping real o admin: hoy son explícitamente out of scope.
- No ocultar errores con `any`, `as unknown as`, `// @ts-ignore` o silencios similares sin justificación fuerte.

## Criterio de terminado

Considerar una tarea terminada cuando:

- el cambio pedido está implementado en los archivos correctos;
- no se modificaron áreas no relacionadas sin motivo;
- el diff fue revisado con `git diff`;
- `git status --short` no muestra archivos inesperados;
- lint/tests/build relevantes al alcance fueron ejecutados o se informa explícitamente si no se pudieron ejecutar;
- se documentan riesgos, notas o dudas reales en vez de inventar supuestos;
- la respuesta final resume cambios, validación y pendientes concretos.

## Formato de resumen final

Al cerrar una tarea en este repo, responder con un resumen corto y específico:

1. `Qué cambié`: 1 párrafo breve o bullets cortos con el resultado funcional.
2. `Archivos modificados`: lista de archivos tocados y motivo breve.
3. `Validación`: comandos ejecutados y resultado. Si algo no se corrió, decirlo explícitamente.
4. `Git`: resultado de `git status --short` y confirmación de que se revisó el diff.
5. `Notas`: riesgos, dudas o follow-ups reales solamente si aportan contexto.

Ejemplo esperado:

- `Qué cambié`: ajusté la validación del checkout y el mensaje de error del carrito vacío.
- `Archivos modificados`: `src/features/checkout/validation.ts`, `src/test/checkout-validation.test.ts`.
- `Validación`: corrí `npm test` y `npm run lint`.
- `Git`: revisé `git diff`; `git status --short` muestra sólo los archivos esperados.
- `Notas`: no corrí `npm run test:e2e`; el cambio no tocó rutas ni navegación.

## Notas abiertas

- El README está desactualizado en la sección sobre `force-dynamic`: hoy `/`, `/category/[categoryId]`, `/products/[slug]` y `/sitemap.xml` usan `revalidate = 300`; `force-dynamic` aparece en la ruta legacy `/item/[id]`.
- No hay script formal de typecheck en `package.json`. Si alguna tarea exige chequeo de tipos, acordarlo con el usuario o dejar explícito qué comando adicional se usó.
