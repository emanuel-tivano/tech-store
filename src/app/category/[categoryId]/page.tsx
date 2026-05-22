import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { TrustSignals } from '@/components/trust-signals';
import { CatalogView } from '@/features/catalog/catalog-view';
import { buildCatalogState, getCatalogHeading } from '@/lib/catalog-query';
import { formatProductCount } from '@/lib/copy';
import { readCategorySeoBySlug } from '@/lib/categories-read';
import { CATEGORY_LABELS } from '@/lib/catalog-taxonomy';
import { readProductCardsByCategory } from '@/lib/products-read';
import { buildMissingMetadata, buildStorefrontMetadata, getCanonicalUrl } from '@/lib/metadata';
import type { Category } from '@/types';

// Prisma-backed category pages are rendered on demand in this demo environment.
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await readCategorySeoBySlug(categoryId as Category);

  if (!category) {
    return buildMissingMetadata({
      title: 'Categoría no encontrada',
      description: 'La categoría solicitada no está disponible en este momento.',
    });
  }

  const products = await readProductCardsByCategory(category.slug);
  const productCountLabel = formatProductCount(products.length);
  const description =
    category.description?.trim() ||
    `Encontrá ${productCountLabel} en ${category.name} para gaming, trabajo y productividad.`;

  return buildStorefrontMetadata({
    title: `${category.name} para PC`,
    description,
    pathname: `/category/${category.slug}`,
    image: category.imageUrl || products[0]?.image || undefined,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categoryId } = await params;
  const category = await readCategorySeoBySlug(categoryId as Category);

  if (!category) {
    notFound();
  }

  const products = await readProductCardsByCategory(category.slug);
  const { filteredProducts, state } = buildCatalogState(products, await searchParams, {
    lockedCategory: category.slug,
  });
  const heading = getCatalogHeading({
    categoryLabel: category.name,
    query: state.query,
    sort: state.sort,
  });
  const categoryUrl = getCanonicalUrl(`/category/${category.slug}`);
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: getCanonicalUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: categoryUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumbs
        items={[
          { href: '/', label: 'Inicio' },
          { label: CATEGORY_LABELS[category.slug] },
        ]}
      />
      <CatalogView
        basePath={`/category/${category.slug}`}
        categoryFilterEnabled={false}
        emptyDescription="No encontramos productos disponibles para esta categoría con los filtros actuales."
        heading={heading}
        products={filteredProducts}
        searchEmptyDescription="Probá ampliar la búsqueda o limpiar filtros para ver más productos de esta categoría."
        state={state}
        supportingText={category.description ?? `Descubrí una selección de ${category.name.toLowerCase()} para setups, trabajo y uso diario.`}
      />
      <TrustSignals
        title="Motivos para comprar con confianza"
        items={[
          {
            title: 'Selección curada',
            description: 'El catálogo agrupa productos activos con información clara de precio, stock y envío.',
          },
          {
            title: 'Envío calculado en checkout',
            description: 'La tienda destaca cuándo hay envío gratis y comunica el resto del costo al avanzar.',
          },
          {
            title: 'Compra simulada segura',
            description: 'Podés revisar cantidades y stock desde el carrito antes de pasar al checkout.',
          },
          {
            title: 'Soporte ante dudas sobre tu compra',
            description: 'La sección de ayuda y el flujo actual facilitan resolver dudas antes de confirmar la orden.',
          },
        ]}
      />
    </>
  );
}
