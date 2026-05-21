import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProductDetailView } from '@/features/product-detail/product-detail-view';
import { buildMissingMetadata, buildStorefrontMetadata } from '@/lib/metadata';
import { readProductById, readProductIds } from '@/lib/products-read';

export const revalidate = 300;

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  const productIds = await readProductIds();

  return productIds.map((id) => ({ id }));
}

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await readProductById(id);

  if (!product) {
    return buildMissingMetadata({
      title: 'Producto no encontrado',
      description: 'El producto solicitado no esta disponible o ya no forma parte del catalogo.',
    });
  }

  const stockLabel = product.stock > 0 ? `${product.stock} unidades disponibles` : 'sin stock';
  const description = `${product.description} Compra ${product.title} con ${stockLabel} en la categoria ${product.categoryId}.`;

  return buildStorefrontMetadata({
    title: product.title,
    description,
    pathname: `/item/${product.id}`,
    image: product.image || undefined,
  });
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const product = await readProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
