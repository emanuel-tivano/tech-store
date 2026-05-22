import { describe, expect, it } from 'vitest';

import { buildCatalogSearchHref } from '@/lib/catalog-search';

describe('catalog search', () => {
  it('preserva filtros del catálogo en inicio al cambiar la búsqueda desde el header', () => {
    const href = buildCatalogSearchHref({
      pathname: '/',
      query: 'mouse inalámbrico',
      searchParams: new URLSearchParams({
        sort: 'price-asc',
        minRating: '4.5',
        freeShipping: '1',
      }),
    });

    expect(href).toBe('/?q=mouse+inal%C3%A1mbrico&minRating=4.5&sort=price-asc&freeShipping=1');
  });

  it('convierte una búsqueda desde categoría a home preservando la categoría como filtro', () => {
    const href = buildCatalogSearchHref({
      pathname: '/category/teclados',
      query: 'tkl',
      searchParams: new URLSearchParams({
        sort: 'sales-desc',
        inStock: '1',
      }),
    });

    expect(href).toBe('/?q=tkl&sort=sales-desc&inStock=1&category=teclados');
  });

  it('desde páginas no catálogo navega al home sólo con q', () => {
    const href = buildCatalogSearchHref({
      pathname: '/cart',
      query: 'monitor',
      searchParams: new URLSearchParams({
        sort: 'latest',
      }),
    });

    expect(href).toBe('/?q=monitor');
  });

  it('si la búsqueda queda vacía conserva filtros de catálogo sin dejar q vacío', () => {
    const href = buildCatalogSearchHref({
      pathname: '/',
      query: '   ',
      searchParams: new URLSearchParams({
        category: 'mouses',
        sort: 'featured',
      }),
    });

    expect(href).toBe('/?category=mouses&sort=featured');
  });
});
