import { describe, expect, it } from 'vitest';

import {
  applyCatalogFilters,
  buildCatalogState,
  getCatalogHeading,
  parseCatalogFilters,
} from '@/lib/catalog-query';
import type { ProductCardDTO } from '@/types';

const products: ProductCardDTO[] = [
  {
    id: '1',
    slug: 'monitor-gamer',
    title: 'Monitor Gamer',
    description: 'Pantalla QHD para gaming competitivo',
    categoryId: 'monitores',
    createdAt: '2026-05-20T12:00:00.000Z',
    image: '/monitor.png',
    price: 400000,
    rating: 4.8,
    opinions: 120,
    qtySold: 450,
    stock: 3,
    freeShipment: true,
    isFeatured: true,
  },
  {
    id: '2',
    slug: 'teclado-mecanico',
    title: 'Teclado Mecánico',
    description: 'Switches lineales y formato TKL',
    categoryId: 'teclados',
    createdAt: '2026-05-18T12:00:00.000Z',
    image: '/keyboard.png',
    price: 180000,
    rating: 4.5,
    opinions: 90,
    qtySold: 220,
    stock: 10,
    freeShipment: false,
    isFeatured: false,
  },
  {
    id: '3',
    slug: 'mouse-pro',
    title: 'Mouse Pro',
    description: 'Mouse liviano para escritorio y gaming',
    categoryId: 'mouses',
    createdAt: '2026-05-21T12:00:00.000Z',
    image: '/mouse.png',
    price: 95000,
    rating: 4.9,
    opinions: 60,
    qtySold: 180,
    stock: 0,
    freeShipment: true,
    isFeatured: true,
  },
];

describe('catalog query', () => {
  it('parsea filtros desde query params y respeta categoría bloqueada', () => {
    const filters = parseCatalogFilters(
      {
        q: 'gamer',
        category: 'teclados',
        freeShipping: '1',
        inStock: '1',
        minRating: '4.5',
        maxPrice: '250000',
        sort: 'price-asc',
      },
      { lockedCategory: 'monitores' },
    );

    expect(filters).toEqual({
      category: 'monitores',
      query: 'gamer',
      freeShippingOnly: true,
      inStockOnly: true,
      minRating: 4.5,
      maxPrice: 250000,
      sort: 'price-asc',
    });
  });

  it('combina búsqueda, filtros y sorting', () => {
    const filtered = applyCatalogFilters(products, {
      category: undefined,
      query: 'gaming',
      freeShippingOnly: true,
      inStockOnly: true,
      minRating: 4,
      maxPrice: 500000,
      sort: 'sales-desc',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe('monitor-gamer');
  });

  it('ordena por más recientes con fecha real', () => {
    const filtered = applyCatalogFilters(products, {
      category: undefined,
      query: '',
      freeShippingOnly: false,
      inStockOnly: false,
      minRating: undefined,
      maxPrice: undefined,
      sort: 'latest',
    });

    expect(filtered.map((product) => product.slug)).toEqual([
      'mouse-pro',
      'monitor-gamer',
      'teclado-mecanico',
    ]);
  });

  it('construye estado del catálogo y heading consistente', () => {
    const { filteredProducts, state } = buildCatalogState(products, {
      q: 'mouse',
      sort: 'rating-desc',
    });

    expect(filteredProducts).toHaveLength(1);
    expect(state.resultCount).toBe(1);
    expect(getCatalogHeading({ query: state.query, sort: state.sort })).toBe(
      'Resultados de búsqueda',
    );
  });
});
