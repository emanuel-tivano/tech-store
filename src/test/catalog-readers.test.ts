import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    product: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

const { existsSyncMock } = vi.hoisted(() => ({
  existsSyncMock: vi.fn(),
}));

vi.mock('next/cache', () => ({
  unstable_cache: <T extends (...args: readonly unknown[]) => unknown>(callback: T) => callback,
}));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();

  return {
    ...actual,
    existsSync: existsSyncMock,
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

import {
  readProductById,
  readProductIds,
  readProducts,
  readProductsByCategory,
} from '@/lib/products-read';
import { readCategories, readCategoryBySlug } from '@/lib/categories-read';

describe('catalog readers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    existsSyncMock.mockReturnValue(false);
  });

  it('mapea el listado de productos desde Prisma al tipo de catálogo', async () => {
    existsSyncMock.mockReturnValue(true);
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        slug: 'samsung-odyssey-g5-27',
        name: 'Teclado TKL',
        price: new Number('2499.90'),
        rating: new Number('4.8'),
        opinions: 32,
        qtySold: 120,
        imageUrl: null,
        category: {
          slug: 'teclados',
        },
      },
    ]);

    const products = await readProducts();

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        category: {
          isActive: true,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        rating: true,
        opinions: true,
        qtySold: true,
        imageUrl: true,
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

    expect(products).toEqual([
      {
        id: 'prod-1',
        title: 'Teclado TKL',
        description: '',
        categoryId: 'teclados',
        image: '/products/samsung-odyssey-g5-27.webp',
        price: 2499.9,
        rating: 4.8,
        opinions: 32,
        qtySold: 120,
        stock: 0,
        freeShipment: false,
      },
    ]);
  });

  it('mapea productos por categoría y los ids del catálogo', async () => {
    prismaMock.product.findMany
      .mockResolvedValueOnce([
        {
          id: 'prod-2',
          slug: 'mouse-pro',
          name: 'Mouse Pro',
          price: 1499,
          rating: 4.6,
          opinions: 12,
          qtySold: 45,
          imageUrl: '/mouse.png',
        },
      ])
      .mockResolvedValueOnce([{ id: 'prod-2' }, { id: 'prod-3' }]);

    const products = await readProductsByCategory('mouses');
    const ids = await readProductIds();

    expect(products).toEqual([
      {
        id: 'prod-2',
        title: 'Mouse Pro',
        description: '',
        categoryId: 'mouses',
        image: '/mouse.png',
        price: 1499,
        rating: 4.6,
        opinions: 12,
        qtySold: 45,
        stock: 0,
        freeShipment: false,
      },
    ]);
    expect(ids).toEqual(['prod-2', 'prod-3']);
  });

  it('mapea el detalle de producto y devuelve null cuando no existe', async () => {
    prismaMock.product.findFirst
      .mockResolvedValueOnce({
        id: 'prod-3',
        slug: 'monitor-ultrawide',
        name: 'Monitor UltraWide',
        description: 'Panel IPS de 34 pulgadas',
        price: 9999,
        rating: 4.9,
        opinions: 88,
        qtySold: 14,
        imageUrl: '/monitor.png',
        stock: 7,
        freeShipment: true,
        category: {
          slug: 'monitores',
        },
      })
      .mockResolvedValueOnce(null);

    await expect(readProductById('prod-3')).resolves.toEqual({
      id: 'prod-3',
      title: 'Monitor UltraWide',
      description: 'Panel IPS de 34 pulgadas',
      categoryId: 'monitores',
      image: '/monitor.png',
      price: 9999,
      rating: 4.9,
      opinions: 88,
      qtySold: 14,
      stock: 7,
      freeShipment: true,
    });
    await expect(readProductById('missing')).resolves.toBeNull();
  });

  it('usa la imagen derivada del slug cuando Prisma devuelve el placeholder generico', async () => {
    existsSyncMock.mockReturnValue(true);
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: 'prod-4',
        slug: 'keychron-k8-pro',
        name: 'Keychron K8 Pro',
        price: 1999,
        rating: 4.7,
        opinions: 18,
        qtySold: 9,
        imageUrl: '/icons/LogoIcon.svg',
        category: {
          slug: 'teclados',
        },
      },
    ]);

    await expect(readProducts()).resolves.toEqual([
      {
        id: 'prod-4',
        title: 'Keychron K8 Pro',
        description: '',
        categoryId: 'teclados',
        image: '/products/keychron-k8-pro.webp',
        price: 1999,
        rating: 4.7,
        opinions: 18,
        qtySold: 9,
        stock: 0,
        freeShipment: false,
      },
    ]);
  });

  it('mapea categorías y metadatos por slug', async () => {
    prismaMock.category.findMany.mockResolvedValue([
      { slug: 'monitores' },
      { slug: 'teclados' },
    ]);
    prismaMock.category.findFirst
      .mockResolvedValueOnce({
        slug: 'monitores',
        name: 'Monitores',
        description: 'Pantallas para gaming y productividad.',
        imageUrl: '/categories/monitores.png',
      })
      .mockResolvedValueOnce(null);

    await expect(readCategories()).resolves.toEqual(['monitores', 'teclados']);
    await expect(readCategoryBySlug('monitores')).resolves.toEqual({
      slug: 'monitores',
      name: 'Monitores',
      description: 'Pantallas para gaming y productividad.',
      imageUrl: '/categories/monitores.png',
    });
    await expect(readCategoryBySlug('auriculares')).resolves.toBeNull();
  });
});
