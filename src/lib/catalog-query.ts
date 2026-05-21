import type { Category, ProductCardDTO } from '@/types';

export type CatalogSortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'latest'
  | 'rating-desc'
  | 'sales-desc';

export interface CatalogFilters {
  category?: Category;
  query: string;
  freeShippingOnly: boolean;
  inStockOnly: boolean;
  minRating?: number;
  maxPrice?: number;
  sort: CatalogSortOption;
}

export interface CatalogState extends CatalogFilters {
  resultCount: number;
}

export function getCatalogHeading(options: {
  categoryLabel?: string;
  query: string;
  sort: CatalogSortOption;
}): string {
  if (options.query.trim()) {
    return options.categoryLabel
      ? `Resultados en ${options.categoryLabel}`
      : 'Resultados de búsqueda';
  }

  if (options.categoryLabel) {
    switch (options.sort) {
      case 'sales-desc':
        return `${options.categoryLabel} más vendidos`;
      case 'rating-desc':
        return `${options.categoryLabel} mejor valorados`;
      case 'price-asc':
      case 'price-desc':
        return `${options.categoryLabel} para comparar precios`;
      default:
        return `${options.categoryLabel} destacados`;
    }
  }

  switch (options.sort) {
    case 'sales-desc':
      return 'Los más vendidos del catálogo';
    case 'rating-desc':
      return 'Periféricos mejor valorados';
    case 'price-asc':
    case 'price-desc':
      return 'Catálogo para comparar precios';
    default:
      return 'Catálogo destacado de periféricos';
  }
}

export function parseCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>,
  options?: { lockedCategory?: Category },
): CatalogFilters {
  const query = getFirstParam(searchParams.q)?.trim() ?? '';
  const rawCategory = options?.lockedCategory ?? getFirstParam(searchParams.category);
  const category = isCategory(rawCategory) ? rawCategory : undefined;
  const maxPrice = toPositiveNumber(getFirstParam(searchParams.maxPrice));
  const minRating = toRating(getFirstParam(searchParams.minRating));
  const sort = toSortOption(getFirstParam(searchParams.sort));

  return {
    category,
    query,
    freeShippingOnly: getFirstParam(searchParams.freeShipping) === '1',
    inStockOnly: getFirstParam(searchParams.inStock) === '1',
    minRating,
    maxPrice,
    sort,
  };
}

export function applyCatalogFilters(
  products: ProductCardDTO[],
  filters: CatalogFilters,
): ProductCardDTO[] {
  const normalizedQuery = normalizeText(filters.query);

  const filteredProducts = products.filter((product) => {
    if (filters.category && product.categoryId !== filters.category) {
      return false;
    }

    if (filters.freeShippingOnly && !product.freeShipment) {
      return false;
    }

    if (filters.inStockOnly && product.stock <= 0) {
      return false;
    }

    if (typeof filters.minRating === 'number' && product.rating < filters.minRating) {
      return false;
    }

    if (typeof filters.maxPrice === 'number' && product.price > filters.maxPrice) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = normalizeText(
      `${product.title} ${product.description} ${product.categoryId}`,
    );

    return searchableText.includes(normalizedQuery);
  });

  return filteredProducts.sort((left, right) => compareProducts(left, right, filters.sort));
}

export function buildCatalogState(
  products: ProductCardDTO[],
  searchParams: Record<string, string | string[] | undefined>,
  options?: { lockedCategory?: Category },
): { filteredProducts: ProductCardDTO[]; state: CatalogState } {
  const filters = parseCatalogFilters(searchParams, options);
  const filteredProducts = applyCatalogFilters(products, filters);

  return {
    filteredProducts,
    state: {
      ...filters,
      resultCount: filteredProducts.length,
    },
  };
}

function compareProducts(
  left: ProductCardDTO,
  right: ProductCardDTO,
  sort: CatalogSortOption,
): number {
  switch (sort) {
    case 'price-asc':
      return left.price - right.price || right.qtySold - left.qtySold;
    case 'price-desc':
      return right.price - left.price || right.qtySold - left.qtySold;
    case 'rating-desc':
      return right.rating - left.rating || right.opinions - left.opinions;
    case 'sales-desc':
      return right.qtySold - left.qtySold || right.rating - left.rating;
    case 'latest':
      return right.createdAt.localeCompare(left.createdAt);
    case 'featured':
    default:
      return (
        Number(right.isFeatured) - Number(left.isFeatured) ||
        right.qtySold - left.qtySold ||
        right.rating - left.rating ||
        left.price - right.price
      );
  }
}

function getFirstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function toRating(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.min(Math.max(parsed, 1), 5);
}

function toSortOption(value: string | undefined): CatalogSortOption {
  switch (value) {
    case 'price-asc':
    case 'price-desc':
    case 'latest':
    case 'rating-desc':
    case 'sales-desc':
      return value;
    default:
      return 'featured';
  }
}

function isCategory(value: string | undefined): value is Category {
  return value === 'monitores' || value === 'teclados' || value === 'mouses' || value === 'auriculares';
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
