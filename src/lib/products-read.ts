import 'server-only';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import type { Category, Product } from '@/types';

const productListSelect = {
  id: true,
  name: true,
  price: true,
  rating: true,
  opinions: true,
  qtySold: true,
  imageUrl: true,
} satisfies Prisma.ProductSelect;

const productDetailSelect = {
  ...productListSelect,
  description: true,
  stock: true,
  freeShipment: true,
  category: {
    select: {
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect;

type ProductListRecord = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;

type ProductDetailRecord = Prisma.ProductGetPayload<{
  select: typeof productDetailSelect;
}>;

function mapProductList(record: ProductListRecord, categoryId: Category): Product {
  return {
    id: record.id,
    title: record.name,
    description: '',
    categoryId,
    image: record.imageUrl ?? '',
    price: Number(record.price),
    rating: Number(record.rating),
    opinions: record.opinions,
    qtySold: record.qtySold,
    stock: 0,
    freeShipment: false,
  };
}

function mapProductDetail(record: ProductDetailRecord): Product {
  return {
    ...mapProductList(record, record.category.slug as Category),
    description: record.description,
    stock: record.stock,
    freeShipment: record.freeShipment,
  };
}

export async function readProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
      },
    },
    select: {
      ...productListSelect,
      category: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return products.map((product) => mapProductList(product, product.category.slug as Category));
}

export async function readProductsByCategory(categorySlug: Category): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        slug: categorySlug,
        isActive: true,
      },
    },
    select: productListSelect,
    orderBy: {
      createdAt: 'asc',
    },
  });

  return products.map((product) => mapProductList(product, categorySlug));
}

export async function readProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      category: {
        isActive: true,
      },
    },
    select: productDetailSelect,
  });

  return product ? mapProductDetail(product) : null;
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
