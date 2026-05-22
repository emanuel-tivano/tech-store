import 'server-only';

import { revalidateTag, unstable_cache } from 'next/cache';
import { cache } from 'react';

export const cacheDataReader: typeof cache =
  process.env.NODE_ENV === 'test' ? ((callback) => callback) as typeof cache : cache;

interface DataCacheOptions {
  revalidate: number;
  tags: string[];
}

export const CATALOG_REVALIDATE_SECONDS = 300;

export const DATA_CACHE_TAGS = {
  catalog: 'catalog',
  products: 'products',
  categories: 'categories',
  sitemap: 'sitemap',
} as const;

export function cacheRouteDataReader<Args extends unknown[], Result>(
  callback: (...args: Args) => Promise<Result>,
  keyParts: string[],
  options: DataCacheOptions,
): (...args: Args) => Promise<Result> {
  if (process.env.NODE_ENV === 'test') {
    return callback;
  }

  return unstable_cache(callback, keyParts, options) as unknown as (...args: Args) => Promise<Result>;
}

export function revalidateCatalogData(): void {
  revalidateTag(DATA_CACHE_TAGS.catalog);
  revalidateTag(DATA_CACHE_TAGS.products);
  revalidateTag(DATA_CACHE_TAGS.categories);
  revalidateTag(DATA_CACHE_TAGS.sitemap);
}
