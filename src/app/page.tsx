import type { Metadata } from 'next';

import { readProducts } from '@/lib/products-read';
import { CatalogView } from '@/features/catalog/catalog-view';
import { buildStorefrontMetadata } from '@/lib/metadata';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const products = await readProducts();
  const productCountLabel = `${products.length} producto${products.length === 1 ? '' : 's'}`;
  const featuredProduct = products[0];

  return buildStorefrontMetadata({
    title: 'Catalogo de perifericos',
    description: `Explora ${productCountLabel} en nuestro storefront de monitores, teclados, mouses y auriculares.`,
    pathname: '/',
    image: featuredProduct?.image || undefined,
  });
}

export default async function HomePage() {
  const products = await readProducts();

  return <CatalogView products={products} />;
}
