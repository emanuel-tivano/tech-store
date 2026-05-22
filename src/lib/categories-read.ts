import 'server-only';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { CATEGORY_SLUGS } from '@/lib/catalog-taxonomy';
import {
  cacheDataReader,
  cacheRouteDataReader,
  CATALOG_REVALIDATE_SECONDS,
  DATA_CACHE_TAGS,
} from '@/lib/server-cache';
import type { Category, CategoryDTO, CategorySeoDTO } from '@/types';

const categorySummarySelect = {
  slug: true,
  name: true,
} satisfies Prisma.CategorySelect;

const categorySeoSelect = {
  slug: true,
  name: true,
  description: true,
  imageUrl: true,
} satisfies Prisma.CategorySelect;

type CategorySummaryRecord = Prisma.CategoryGetPayload<{
  select: typeof categorySummarySelect;
}>;

type CategorySeoRecord = Prisma.CategoryGetPayload<{
  select: typeof categorySeoSelect;
}>;

function mapCategorySummary(category: CategorySummaryRecord): CategoryDTO {
  return {
    slug: category.slug as Category,
    name: category.name,
  };
}

function mapCategorySeo(category: CategorySeoRecord): CategorySeoDTO {
  return {
    slug: category.slug as Category,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl,
  };
}

const readCategoriesCached = cacheDataReader(
  cacheRouteDataReader(
    async (): Promise<CategoryDTO[]> => {
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          slug: {
            in: [...CATEGORY_SLUGS],
          },
        },
        select: categorySummarySelect,
        orderBy: {
          createdAt: 'asc',
        },
      });

      return categories.map(mapCategorySummary);
    },
    ['categories-summary'],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [DATA_CACHE_TAGS.catalog, DATA_CACHE_TAGS.categories, DATA_CACHE_TAGS.sitemap],
    },
  ),
);

const readCategorySeoBySlugCached = cacheDataReader(
  cacheRouteDataReader(
    async (categorySlug: Category): Promise<CategorySeoDTO | null> => {
      const category = await prisma.category.findFirst({
        where: {
          slug: categorySlug,
          isActive: true,
        },
        select: categorySeoSelect,
      });

      return category ? mapCategorySeo(category) : null;
    },
    ['category-seo-by-slug'],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [DATA_CACHE_TAGS.catalog, DATA_CACHE_TAGS.categories, DATA_CACHE_TAGS.sitemap],
    },
  ),
);

export async function readCategories(): Promise<CategoryDTO[]> {
  return readCategoriesCached();
}

export async function readCategorySlugs(): Promise<Category[]> {
  const categories = await readCategoriesCached();

  return categories.map((category) => category.slug as Category);
}

export async function readCategorySeoBySlug(
  categorySlug: Category,
): Promise<CategorySeoDTO | null> {
  return readCategorySeoBySlugCached(categorySlug);
}

export async function readCategoryBySlug(categorySlug: Category): Promise<CategorySeoDTO | null> {
  return readCategorySeoBySlug(categorySlug);
}
