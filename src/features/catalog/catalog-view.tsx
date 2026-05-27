import { CatalogControls } from '@/features/catalog/catalog-controls';
import { PageState } from '@/components/page-state';
import { ProductGrid } from '@/components/product-grid';
import { formatProductAvailability } from '@/lib/copy';
import type { CatalogState } from '@/lib/catalog-query';
import type { Category, ProductCardDTO } from '@/types';

interface CatalogViewProps {
  products: ProductCardDTO[];
  basePath: '/' | `/category/${Category}`;
  categoryFilterEnabled: boolean;
  emptyDescription: string;
  heading: string;
  prioritizeFirstImage?: boolean;
  searchEmptyDescription?: string;
  state: CatalogState;
  supportingText?: string;
}

export function CatalogView({
  products,
  basePath,
  categoryFilterEnabled,
  emptyDescription,
  heading,
  prioritizeFirstImage = false,
  searchEmptyDescription,
  state,
  supportingText,
}: CatalogViewProps) {
  const hasActiveSearch = state.query.trim().length > 0;

  return (
    <section className="flex flex-col gap-6 sm:gap-8">
      <div className="surface-card brand-tint-panel overflow-hidden rounded-3xl border-slate-200/80 px-4 py-7 sm:px-8 sm:py-10 xl:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {heading}
          </h1>
          {supportingText ? (
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {supportingText}
            </p>
          ) : null}
          <p className="text-sm font-medium text-slate-500">{formatProductAvailability(state.resultCount)}</p>
        </div>
      </div>

      <CatalogControls
        basePath={basePath}
        categoryFilterEnabled={categoryFilterEnabled}
        state={state}
      />

      {products.length === 0 ? (
        <PageState
          title={hasActiveSearch ? 'No encontramos productos para esa búsqueda' : 'No hay productos disponibles'}
          description={hasActiveSearch ? searchEmptyDescription || emptyDescription : emptyDescription}
        />
      ) : null}

      {products.length > 0 ? (
        <>
          {hasActiveSearch ? (
            <p className="text-sm font-medium text-slate-500">
              Mostrando resultados para{' '}
              <span className="font-semibold text-slate-700">&ldquo;{state.query}&rdquo;</span>.
            </p>
          ) : null}
          <ProductGrid products={products} prioritizeFirstImage={prioritizeFirstImage} />
        </>
      ) : null}
    </section>
  );
}
