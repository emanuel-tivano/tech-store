import { beforeEach, describe, expect, it, vi } from 'vitest';

const { notFoundMock, readProductByIdMock, readCategoryBySlugMock, readProductsByCategoryMock } =
  vi.hoisted(() => ({
    notFoundMock: vi.fn(() => {
      throw new Error('NEXT_NOT_FOUND');
    }),
    readProductByIdMock: vi.fn(),
    readCategoryBySlugMock: vi.fn(),
    readProductsByCategoryMock: vi.fn(),
  }));

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}));

vi.mock('@/lib/products-read', () => ({
  readProductById: readProductByIdMock,
  readProductIds: vi.fn(),
  readProductsByCategory: readProductsByCategoryMock,
}));

vi.mock('@/lib/categories-read', () => ({
  readCategories: vi.fn(),
  readCategoryBySlug: readCategoryBySlugMock,
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
    readCategoryBySlugMock.mockResolvedValue(null);

    await expect(
      CategoryPage({ params: Promise.resolve({ categoryId: 'missing-category' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(readProductsByCategoryMock).not.toHaveBeenCalled();
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
