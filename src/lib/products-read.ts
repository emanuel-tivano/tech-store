import 'server-only';

import { existsSync } from 'node:fs';
import path from 'node:path';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { cacheDataReader } from '@/lib/server-cache';
import type {
  Category,
  ProductCardDTO,
  ProductDetailDTO,
  ProductSeoDTO,
} from '@/types';

const FALLBACK_PRODUCT_IMAGE = '/icons/LogoIcon.svg';
const PRODUCT_IMAGE_DIRECTORY = path.join(process.cwd(), 'public', 'products');

const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  createdAt: true,
  price: true,
  rating: true,
  opinions: true,
  qtySold: true,
  stock: true,
  imageUrl: true,
  freeShipment: true,
  isFeatured: true,
  category: {
    select: {
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect;

const productDetailSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  createdAt: true,
  price: true,
  rating: true,
  opinions: true,
  qtySold: true,
  stock: true,
  imageUrl: true,
  freeShipment: true,
  isFeatured: true,
  category: {
    select: {
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect;

type ProductCardRecord = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

type ProductDetailRecord = Prisma.ProductGetPayload<{
  select: typeof productDetailSelect;
}>;

function normalizeImageUrl(imageUrl: string): string {
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
}

function resolveProductImage(imageUrl: string | null, slug: string): string {
  const normalizedImageUrl = imageUrl?.trim() ? normalizeImageUrl(imageUrl.trim()) : '';

  if (normalizedImageUrl && normalizedImageUrl !== FALLBACK_PRODUCT_IMAGE) {
    return normalizedImageUrl;
  }

  const derivedImageUrl = `/products/${slug}.webp`;
  const derivedImagePath = path.join(PRODUCT_IMAGE_DIRECTORY, `${slug}.webp`);

  return existsSync(derivedImagePath) ? derivedImageUrl : FALLBACK_PRODUCT_IMAGE;
}

function mapProductCard(record: ProductCardRecord, categoryId: Category): ProductCardDTO {
  return {
    id: record.id,
    slug: record.slug,
    title: record.name,
    description: record.description,
    categoryId,
    createdAt: record.createdAt.toISOString(),
    image: resolveProductImage(record.imageUrl, record.slug),
    price: Number(record.price),
    rating: Number(record.rating),
    opinions: record.opinions,
    qtySold: record.qtySold,
    stock: record.stock,
    freeShipment: record.freeShipment,
    isFeatured: record.isFeatured,
  };
}

function mapProductDetail(record: ProductDetailRecord): ProductDetailDTO {
  return {
    ...mapProductCard(record, record.category.slug as Category),
    description: record.description,
    stock: record.stock,
    freeShipment: record.freeShipment,
    isFeatured: record.isFeatured,
  };
}

const readProductCardRecords = cacheDataReader(async (): Promise<ProductCardRecord[]> => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
      },
    },
    select: productCardSelect,
    orderBy: {
      createdAt: 'asc',
    },
  });

  return products;
});

const readProductCardRecordsByCategory = cacheDataReader(
  async (categorySlug: Category): Promise<ProductCardRecord[]> => {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          slug: categorySlug,
          isActive: true,
        },
      },
      select: productCardSelect,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return products;
  },
);

const readProductDetailRecordBySlug = cacheDataReader(
  async (slug: string): Promise<ProductDetailRecord | null> => {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
        category: {
          isActive: true,
        },
      },
      select: productDetailSelect,
    });

    return product;
  },
);

export async function readProductCards(): Promise<ProductCardDTO[]> {
  const products = await readProductCardRecords();

  return products.map((product) => mapProductCard(product, product.category.slug as Category));
}

export async function readProductCardsByCategory(
  categorySlug: Category,
): Promise<ProductCardDTO[]> {
  const products = await readProductCardRecordsByCategory(categorySlug);

  return products.map((product) => mapProductCard(product, categorySlug));
}

export async function readProductDetailBySlug(slug: string): Promise<ProductDetailDTO | null> {
  const product = await readProductDetailRecordBySlug(slug);

  return product ? mapProductDetail(product) : null;
}

export async function readProductSeoBySlug(slug: string): Promise<ProductSeoDTO | null> {
  return readProductDetailBySlug(slug);
}

export async function readProducts(): Promise<ProductCardDTO[]> {
  return readProductCards();
}

export async function readProductsByCategory(categorySlug: Category): Promise<ProductCardDTO[]> {
  return readProductCardsByCategory(categorySlug);
}

export async function readProductById(
  id: string,
): Promise<Pick<ProductDetailDTO, 'id' | 'slug'> | null> {
  const product = await prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      category: {
        isActive: true,
      },
    },
    select: {
      id: true,
      slug: true,
    },
  });

  return product;
}

export async function readProductBySlug(slug: string): Promise<ProductDetailDTO | null> {
  return readProductDetailBySlug(slug);
}

export async function readProductIds(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return products.map((product) => product.id);
}

export async function readProductSlugs(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
      },
    },
    select: {
      slug: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return products.map((product) => product.slug);
}
