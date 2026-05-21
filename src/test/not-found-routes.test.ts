import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  notFoundMock,
  permanentRedirectMock,
  readProductByIdMock,
  readCategorySeoBySlugMock,
  readProductCardsByCategoryMock,
} =
  vi.hoisted(() => ({
    notFoundMock: vi.fn(() => {
      throw new Error('NEXT_NOT_FOUND');
    }),
    permanentRedirectMock: vi.fn(() => {
      throw new Error('NEXT_REDIRECT');
    }),
    readProductByIdMock: vi.fn(),
    readCategorySeoBySlugMock: vi.fn(),
    readProductCardsByCategoryMock: vi.fn(),
  }));

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
  permanentRedirect: permanentRedirectMock,
}));

vi.mock('@/lib/products-read', () => ({
  readProductById: readProductByIdMock,
  readProductCardsByCategory: readProductCardsByCategoryMock,
}));

vi.mock('@/lib/categories-read', () => ({
  readCategorySeoBySlug: readCategorySeoBySlugMock,
}));

import CategoryPage from '@/app/category/[categoryId]/page';
import ItemPage from '@/app/item/[id]/page';

describe('App Router notFound behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usa notFound() cuando falta el producto solicitado', async () => {
    readProductByIdMock.mockResolvedValue(null);

    await expect(
      ItemPage({ params: Promise.resolve({ id: 'missing-product' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('usa notFound() cuando la categoría no existe', async () => {
    readCategorySeoBySlugMock.mockResolvedValue(null);

    await expect(
      CategoryPage({ params: Promise.resolve({ categoryId: 'missing-category' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(readProductCardsByCategoryMock).not.toHaveBeenCalled();
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('redirige la ruta legacy del producto hacia la URL pública por slug', async () => {
    readProductByIdMock.mockResolvedValue({
      id: 'prod-legacy',
      slug: 'mouse-pro',
    });

    await expect(
      ItemPage({ params: Promise.resolve({ id: 'prod-legacy' }) }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(permanentRedirectMock).toHaveBeenCalledWith('/products/mouse-pro');
  });
});
