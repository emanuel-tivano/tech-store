import type { Metadata } from 'next';

import { JsonLd } from '@/components/json-ld';
import { TrustSignals } from '@/components/trust-signals';
import { buildCatalogState, getCatalogHeading } from '@/lib/catalog-query';
import { readProductCards } from '@/lib/products-read';
import { CatalogView } from '@/features/catalog/catalog-view';
import { buildStorefrontMetadata, storefrontMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const products = await readProductCards();
  const productCountLabel = `${products.length} producto${products.length === 1 ? '' : 's'}`;
  const featuredProduct = products[0];

  return buildStorefrontMetadata({
    title: 'Periféricos de PC',
    description: `Comprá ${productCountLabel} en monitores, teclados, mouses y auriculares con catálogo online para gaming, trabajo y setups profesionales.`,
    pathname: '/',
    image: featuredProduct?.image || undefined,
  });
}

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const products = await readProductCards();
  const { filteredProducts, state } = buildCatalogState(products, await searchParams);
  const heading = getCatalogHeading({ query: state.query, sort: state.sort });
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: storefrontMetadata.siteName,
    url: storefrontMetadata.siteUrl,
    inLanguage: 'es-AR',
  };

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <CatalogView
        basePath="/"
        categoryFilterEnabled
        emptyDescription="Probá ajustar la búsqueda o limpiar filtros para volver a explorar todo el catálogo."
        heading={heading}
        products={filteredProducts}
        searchEmptyDescription="No encontramos coincidencias con esa búsqueda. Probá otro término o ampliá los filtros."
        state={state}
        supportingText="Explorá periféricos seleccionados para gaming, trabajo y setups profesionales con filtros rápidos y orden comercial."
      />
      <TrustSignals />
    </>
  );
}
