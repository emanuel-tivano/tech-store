import 'server-only';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import type { Category } from '@/types';

const categorySlugs = ['monitores', 'teclados', 'mouses', 'auriculares'] as const satisfies readonly Category[];

const categoryMetadataSelect = {
  slug: true,
  name: true,
  description: true,
  imageUrl: true,
} satisfies Prisma.CategorySelect;

type CategoryMetadataRecord = Prisma.CategoryGetPayload<{
  select: typeof categoryMetadataSelect;
}>;

export interface CategoryDetails {
  slug: Category;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

function mapCategoryDetails(category: CategoryMetadataRecord): CategoryDetails {
  return {
    slug: category.slug as Category,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl,
  };
}

export async function readCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      slug: {
        in: [...categorySlugs],
      },
    },
    select: {
      slug: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return categories.map((category) => category.slug as Category);
}

export async function readCategoryBySlug(categorySlug: Category): Promise<CategoryDetails | null> {
  const category = await prisma.category.findFirst({
    where: {
      slug: categorySlug,
      isActive: true,
    },
    select: categoryMetadataSelect,
  });

  return category ? mapCategoryDetails(category) : null;
}
