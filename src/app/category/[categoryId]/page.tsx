import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CatalogView } from '@/features/catalog/catalog-view';
import { readCategories, readCategoryBySlug } from '@/lib/categories-read';
import { readProductsByCategory } from '@/lib/products-read';
import { buildMissingMetadata, buildStorefrontMetadata } from '@/lib/metadata';
import type { Category } from '@/types';

export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{ categoryId: string }>;
}

export async function generateStaticParams(): Promise<Array<{ categoryId: Category }>> {
  const categories = await readCategories();

  return categories.map((categoryId) => ({ categoryId }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await readCategoryBySlug(categoryId as Category);

  if (!category) {
    return buildMissingMetadata({
      title: 'Categoria no encontrada',
      description: 'La categoria solicitada no esta disponible en este momento.',
    });
  }

  const products = await readProductsByCategory(category.slug);
  const productCountLabel = `${products.length} producto${products.length === 1 ? '' : 's'}`;
  const description =
    category.description?.trim() ||
    `Descubre ${productCountLabel} disponibles en la categoria ${category.name}.`;

  return buildStorefrontMetadata({
    title: `${category.name} online`,
    description,
    pathname: `/category/${category.slug}`,
    image: category.imageUrl || products[0]?.image || undefined,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const category = await readCategoryBySlug(categoryId as Category);

  if (!category) {
    notFound();
  }

  const products = await readProductsByCategory(category.slug);

  return <CatalogView products={products} categoryId={category.slug} />;
}
