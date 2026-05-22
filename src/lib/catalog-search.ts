const CATALOG_FILTER_PARAM_KEYS = [
  'category',
  'maxPrice',
  'minRating',
  'sort',
  'freeShipping',
  'inStock',
] as const;

interface BuildCatalogSearchHrefOptions {
  pathname: string;
  query: string;
  searchParams?: URLSearchParams | ReadonlyURLSearchParamsLike;
}

interface ReadonlyURLSearchParamsLike {
  get(name: string): string | null;
}

export function buildCatalogSearchHref({
  pathname,
  query,
  searchParams,
}: BuildCatalogSearchHrefOptions): string {
  const nextParams = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (trimmedQuery) {
    nextParams.set('q', trimmedQuery);
  }

  if (pathname === '/' || isCategoryPathname(pathname)) {
    for (const key of CATALOG_FILTER_PARAM_KEYS) {
      if (key === 'category' && isCategoryPathname(pathname)) {
        continue;
      }

      const value = searchParams?.get(key);
      if (value) {
        nextParams.set(key, value);
      }
    }

    if (isCategoryPathname(pathname)) {
      nextParams.set('category', pathname.slice('/category/'.length));
    }
  }

  const queryString = nextParams.toString();
  return queryString ? `/?${queryString}` : '/';
}

function isCategoryPathname(pathname: string): pathname is `/category/${string}` {
  return pathname.startsWith('/category/');
}
