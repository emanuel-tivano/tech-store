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
  readProductCards,
  readProductCardsByCategory,
  readProductDetailBySlug,
  readProductById,
  readProductBySlug,
  readProductIds,
  readProducts,
  readProductsByCategory,
  readProductSlugs,
  readProductSeoBySlug,
} from '@/lib/products-read';
import {
  readCategories,
  readCategoryBySlug,
  readCategorySeoBySlug,
  readCategorySlugs,
} from '@/lib/categories-read';

describe('catalog readers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    existsSyncMock.mockReturnValue(false);
  });

  it('mapea product cards desde Prisma al DTO de listado', async () => {
    existsSyncMock.mockReturnValue(true);
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        slug: 'samsung-odyssey-g5-27',
        name: 'Teclado TKL',
        description: 'Compacto para escritorio',
        createdAt: new Date('2026-05-20T12:00:00.000Z'),
        price: new Number('2499.90'),
        rating: new Number('4.8'),
        opinions: 32,
        qtySold: 120,
        stock: 7,
        imageUrl: null,
        freeShipment: false,
        isFeatured: true,
        category: {
          slug: 'teclados',
        },
      },
    ]);

    const products = await readProductCards();

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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    expect(products).toEqual([
      {
        id: 'prod-1',
        slug: 'samsung-odyssey-g5-27',
        title: 'Teclado TKL',
        description: 'Compacto para escritorio',
        categoryId: 'teclados',
        createdAt: '2026-05-20T12:00:00.000Z',
        image: '/products/samsung-odyssey-g5-27.webp',
        price: 2499.9,
        rating: 4.8,
        opinions: 32,
        qtySold: 120,
        stock: 7,
        freeShipment: false,
        isFeatured: true,
      },
    ]);
  });

  it('mapea product cards por categoría y expone ids/slugs públicos', async () => {
    prismaMock.product.findMany
      .mockResolvedValueOnce([
        {
          id: 'prod-2',
          slug: 'mouse-pro',
          name: 'Mouse Pro',
          description: 'Ergonómico',
          createdAt: new Date('2026-05-19T12:00:00.000Z'),
          price: 1499,
          rating: 4.6,
          opinions: 12,
          qtySold: 45,
          stock: 6,
          imageUrl: '/mouse.png',
          freeShipment: true,
          isFeatured: false,
          category: {
            slug: 'mouses',
          },
        },
      ])
      .mockResolvedValueOnce([{ id: 'prod-2' }, { id: 'prod-3' }]);

    const products = await readProductCardsByCategory('mouses');
    const ids = await readProductIds();

    expect(products).toEqual([
      {
        id: 'prod-2',
        slug: 'mouse-pro',
        title: 'Mouse Pro',
        description: 'Ergonómico',
        categoryId: 'mouses',
        createdAt: '2026-05-19T12:00:00.000Z',
        image: '/mouse.png',
        price: 1499,
        rating: 4.6,
        opinions: 12,
        qtySold: 45,
        stock: 6,
        freeShipment: true,
        isFeatured: false,
      },
    ]);
    expect(ids).toEqual(['prod-2', 'prod-3']);
  });

  it('mapea product detail/seo y devuelve null cuando no existe', async () => {
    prismaMock.product.findFirst
      .mockResolvedValueOnce({
        id: 'prod-3',
        slug: 'monitor-ultrawide',
      })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'prod-5',
        slug: 'auricular-pro',
        name: 'Auricular Pro',
        description: 'Audio cerrado para sesiones largas',
        createdAt: new Date('2026-05-17T12:00:00.000Z'),
        price: 7499,
        rating: 4.4,
        opinions: 22,
        qtySold: 41,
        imageUrl: '/auricular.png',
        stock: 2,
        freeShipment: false,
        isFeatured: false,
        category: {
          slug: 'auriculares',
        },
      })
      .mockResolvedValueOnce({
        id: 'prod-5',
        slug: 'auricular-pro',
        name: 'Auricular Pro',
        description: 'Audio cerrado para sesiones largas',
        createdAt: new Date('2026-05-17T12:00:00.000Z'),
        price: 7499,
        rating: 4.4,
        opinions: 22,
        qtySold: 41,
        imageUrl: '/auricular.png',
        stock: 2,
        freeShipment: false,
        isFeatured: false,
        category: {
          slug: 'auriculares',
        },
      })
      .mockResolvedValueOnce({
        id: 'prod-5',
        slug: 'auricular-pro',
        name: 'Auricular Pro',
        description: 'Audio cerrado para sesiones largas',
        createdAt: new Date('2026-05-17T12:00:00.000Z'),
        price: 7499,
        rating: 4.4,
        opinions: 22,
        qtySold: 41,
        imageUrl: '/auricular.png',
        stock: 2,
        freeShipment: false,
        isFeatured: false,
        category: {
          slug: 'auriculares',
        },
      });

    await expect(readProductById('prod-3')).resolves.toEqual({
      id: 'prod-3',
      slug: 'monitor-ultrawide',
    });
    await expect(readProductById('missing')).resolves.toBeNull();
    await expect(readProductDetailBySlug('auricular-pro')).resolves.toEqual({
      id: 'prod-5',
      slug: 'auricular-pro',
      title: 'Auricular Pro',
      description: 'Audio cerrado para sesiones largas',
      categoryId: 'auriculares',
      createdAt: '2026-05-17T12:00:00.000Z',
      image: '/auricular.png',
      price: 7499,
      rating: 4.4,
      opinions: 22,
      qtySold: 41,
      stock: 2,
      freeShipment: false,
      isFeatured: false,
    });
    await expect(readProductSeoBySlug('auricular-pro')).resolves.toEqual({
      id: 'prod-5',
      slug: 'auricular-pro',
      title: 'Auricular Pro',
      description: 'Audio cerrado para sesiones largas',
      categoryId: 'auriculares',
      createdAt: '2026-05-17T12:00:00.000Z',
      image: '/auricular.png',
      price: 7499,
      rating: 4.4,
      opinions: 22,
      qtySold: 41,
      stock: 2,
      freeShipment: false,
      isFeatured: false,
    });
  });

  it('mantiene compatibilidad con los aliases de readers anteriores', async () => {
    existsSyncMock.mockReturnValue(true);
    prismaMock.product.findMany
      .mockResolvedValueOnce([
        {
          id: 'prod-legacy-list',
          slug: 'legacy-list',
          name: 'Legacy List',
          description: 'Legacy list description',
          createdAt: new Date('2026-05-15T12:00:00.000Z'),
          price: 999,
          rating: 4.1,
          opinions: 2,
          qtySold: 4,
          stock: 5,
          imageUrl: null,
          freeShipment: false,
          isFeatured: false,
          category: {
            slug: 'teclados',
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'prod-legacy-category',
          slug: 'legacy-category',
          name: 'Legacy Category',
          description: 'Legacy category description',
          createdAt: new Date('2026-05-16T12:00:00.000Z'),
          price: 1999,
          rating: 4.9,
          opinions: 10,
          qtySold: 18,
          stock: 9,
          imageUrl: '/legacy.png',
          freeShipment: true,
          isFeatured: true,
        },
      ]);
    prismaMock.product.findFirst.mockResolvedValueOnce({
      id: 'prod-legacy-detail',
      slug: 'legacy-detail',
      name: 'Legacy Detail',
      description: 'Detalle legacy',
      createdAt: new Date('2026-05-14T12:00:00.000Z'),
      price: 3999,
      rating: 4.2,
      opinions: 12,
      qtySold: 22,
      imageUrl: '/legacy-detail.png',
      stock: 5,
      freeShipment: true,
      isFeatured: true,
      category: {
        slug: 'monitores',
      },
    });

    await expect(readProducts()).resolves.toEqual([
      {
        id: 'prod-legacy-list',
        slug: 'legacy-list',
        title: 'Legacy List',
        description: 'Legacy list description',
        categoryId: 'teclados',
        createdAt: '2026-05-15T12:00:00.000Z',
        image: '/icons/LogoIcon.svg',
        price: 999,
        rating: 4.1,
        opinions: 2,
        qtySold: 4,
        stock: 5,
        freeShipment: false,
        isFeatured: false,
      },
    ]);
    await expect(readProductsByCategory('mouses')).resolves.toEqual([
      {
        id: 'prod-legacy-category',
        slug: 'legacy-category',
        title: 'Legacy Category',
        description: 'Legacy category description',
        categoryId: 'mouses',
        createdAt: '2026-05-16T12:00:00.000Z',
        image: '/legacy.png',
        price: 1999,
        rating: 4.9,
        opinions: 10,
        qtySold: 18,
        stock: 9,
        freeShipment: true,
        isFeatured: true,
      },
    ]);
    await expect(readProductBySlug('legacy-detail')).resolves.toEqual({
      id: 'prod-legacy-detail',
      slug: 'legacy-detail',
      title: 'Legacy Detail',
      description: 'Detalle legacy',
      categoryId: 'monitores',
      createdAt: '2026-05-14T12:00:00.000Z',
      image: '/legacy-detail.png',
      price: 3999,
      rating: 4.2,
      opinions: 12,
      qtySold: 22,
      stock: 5,
      freeShipment: true,
      isFeatured: true,
    });
  });

  it('usa la imagen derivada del slug cuando Prisma devuelve el placeholder generico', async () => {
    existsSyncMock.mockReturnValue(true);
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: 'prod-4',
        slug: 'keychron-k8-pro',
        name: 'Keychron K8 Pro',
        description: 'Hot swappable',
        createdAt: new Date('2026-05-13T12:00:00.000Z'),
        price: 1999,
        rating: 4.7,
        opinions: 18,
        qtySold: 9,
        stock: 4,
        imageUrl: '/icons/LogoIcon.svg',
        freeShipment: true,
        isFeatured: true,
        category: {
          slug: 'teclados',
        },
      },
    ]);

    await expect(readProducts()).resolves.toEqual([
      {
        id: 'prod-4',
        slug: 'keychron-k8-pro',
        title: 'Keychron K8 Pro',
        description: 'Hot swappable',
        categoryId: 'teclados',
        createdAt: '2026-05-13T12:00:00.000Z',
        image: '/products/keychron-k8-pro.webp',
        price: 1999,
        rating: 4.7,
        opinions: 18,
        qtySold: 9,
        stock: 4,
        freeShipment: true,
        isFeatured: true,
      },
    ]);
  });

  it('mapea summaries y SEO de categorías', async () => {
    prismaMock.category.findMany.mockResolvedValue([
      { slug: 'monitores', name: 'Monitores' },
      { slug: 'teclados', name: 'Teclados' },
    ]);
    prismaMock.category.findFirst
      .mockResolvedValueOnce({
        slug: 'monitores',
        name: 'Monitores',
        description: 'Pantallas para gaming y productividad.',
        imageUrl: '/categories/monitores.png',
      })
      .mockResolvedValueOnce(null);

    await expect(readCategories()).resolves.toEqual([
      { slug: 'monitores', name: 'Monitores' },
      { slug: 'teclados', name: 'Teclados' },
    ]);
    await expect(readCategorySlugs()).resolves.toEqual(['monitores', 'teclados']);
    await expect(readCategorySeoBySlug('monitores')).resolves.toEqual({
      slug: 'monitores',
      name: 'Monitores',
      description: 'Pantallas para gaming y productividad.',
      imageUrl: '/categories/monitores.png',
    });
    await expect(readCategoryBySlug('auriculares')).resolves.toBeNull();
  });

  it('devuelve slugs públicos de productos', async () => {
    prismaMock.product.findMany.mockResolvedValue([
      { slug: 'logitech-g-pro-x-superlight-2' },
      { slug: 'sony-wh-ch720n' },
    ]);

    await expect(readProductSlugs()).resolves.toEqual([
      'logitech-g-pro-x-superlight-2',
      'sony-wh-ch720n',
    ]);
  });
});
