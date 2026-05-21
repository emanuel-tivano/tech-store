import 'server-only';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { CATEGORY_SLUGS } from '@/lib/catalog-taxonomy';
import { cacheDataReader } from '@/lib/server-cache';
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

const readCategorySummaryRecords = cacheDataReader(async (): Promise<CategorySummaryRecord[]> => {
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

  return categories;
});

const readCategorySeoRecordBySlug = cacheDataReader(
  async (categorySlug: Category): Promise<CategorySeoRecord | null> => {
    const category = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        isActive: true,
      },
      select: categorySeoSelect,
    });

    return category;
  },
);

export async function readCategories(): Promise<CategoryDTO[]> {
  const categories = await readCategorySummaryRecords();

  return categories.map(mapCategorySummary);
}

export async function readCategorySlugs(): Promise<Category[]> {
  const categories = await readCategorySummaryRecords();

  return categories.map((category) => category.slug as Category);
}

export async function readCategorySeoBySlug(
  categorySlug: Category,
): Promise<CategorySeoDTO | null> {
  const category = await readCategorySeoRecordBySlug(categorySlug);

  return category ? mapCategorySeo(category) : null;
}

export async function readCategoryBySlug(categorySlug: Category): Promise<CategorySeoDTO | null> {
  return readCategorySeoBySlug(categorySlug);
}
