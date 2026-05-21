import type { MetadataRoute } from 'next';

import { readCategorySlugs } from '@/lib/categories-read';
import { getCanonicalUrl } from '@/lib/metadata';
import { readProductSlugs } from '@/lib/products-read';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let categories: string[] = [];
  let productSlugs: string[] = [];

  try {
    [categories, productSlugs] = await Promise.all([readCategorySlugs(), readProductSlugs()]);
  } catch {
    categories = [];
    productSlugs = [];
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl('/'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: getCanonicalUrl('/help'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  const categoryRoutes = categories.map((categorySlug) => ({
    url: getCanonicalUrl(`/category/${categorySlug}`),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const productRoutes = productSlugs.map((slug) => ({
    url: getCanonicalUrl(`/products/${slug}`),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
