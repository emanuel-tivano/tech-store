import { CATEGORY_LABELS, CATEGORY_SLUGS } from '@/lib/catalog-taxonomy';
import type { CatalogState } from '@/lib/catalog-query';
import type { Category } from '@/types';

interface CatalogControlsProps {
  basePath: '/' | `/category/${Category}`;
  categoryFilterEnabled: boolean;
  state: CatalogState;
}

const sortOptions = [
  { value: 'featured', label: 'Destacados' },
  { value: 'sales-desc', label: 'Más vendidos' },
  { value: 'rating-desc', label: 'Mejor valorados' },
  { value: 'price-asc', label: 'Precio menor' },
  { value: 'price-desc', label: 'Precio mayor' },
  { value: 'latest', label: 'Más recientes' },
] as const;

const ratingOptions = [
  { value: '', label: 'Cualquier rating' },
  { value: '4', label: '4 estrellas o más' },
  { value: '4.5', label: '4.5 estrellas o más' },
] as const;

export function CatalogControls({
  basePath,
  categoryFilterEnabled,
  state,
}: CatalogControlsProps) {
  return (
    <section className="surface-card rounded-3xl border-slate-200/80">
      <div className="flex flex-col gap-5 p-5 sm:p-6 xl:p-7">
        <form action={basePath} className="grid gap-4">
          <input type="hidden" name="q" value={state.query} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
            {categoryFilterEnabled ? (
              <div className="grid gap-1.5">
                <label htmlFor="catalog-category" className="form-label">
                  Categoría
                </label>
                <select
                  id="catalog-category"
                  name="category"
                  defaultValue={state.category ?? ''}
                  className="input-base"
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORY_SLUGS.map((categorySlug) => (
                    <option key={categorySlug} value={categorySlug}>
                      {CATEGORY_LABELS[categorySlug]}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="grid gap-1.5">
              <label htmlFor="catalog-sort" className="form-label">
                Ordenar por
              </label>
              <select
                id="catalog-sort"
                name="sort"
                defaultValue={state.sort}
                className="input-base"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="catalog-rating" className="form-label">
                Rating mínimo
              </label>
              <select
                id="catalog-rating"
                name="minRating"
                defaultValue={state.minRating?.toString() ?? ''}
                className="input-base"
              >
                {ratingOptions.map((option) => (
                  <option key={option.value || 'any'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="catalog-price" className="form-label">
                Precio máximo
              </label>
              <input
                id="catalog-price"
                name="maxPrice"
                type="number"
                min={0}
                inputMode="numeric"
                defaultValue={state.maxPrice ?? ''}
                className="input-base"
                placeholder="Ej. 250000"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[24rem]">
              <label className="inline-flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="freeShipping"
                  value="1"
                  defaultChecked={state.freeShippingOnly}
                  className="h-4 w-4 accent-[var(--brand-600)]"
                />
                Sólo envío gratis
              </label>
              <label className="inline-flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="inStock"
                  value="1"
                  defaultChecked={state.inStockOnly}
                  className="h-4 w-4 accent-[var(--brand-600)]"
                />
                Sólo en stock
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Aplicar filtros
              </button>
              <a href={basePath} className="btn-secondary w-full sm:w-auto">
                Limpiar
              </a>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
