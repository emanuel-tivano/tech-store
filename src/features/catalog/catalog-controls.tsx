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
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
              Explorar
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Búsqueda, filtros y orden
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {state.resultCount} resultado{state.resultCount === 1 ? '' : 's'}
          </p>
        </div>

        <form action={basePath} className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
            <div>
              <label htmlFor="catalog-search" className="form-label">
                Buscar productos
              </label>
              <input
                id="catalog-search"
                name="q"
                defaultValue={state.query}
                className="input-base"
                placeholder="Buscar por nombre o descripción"
              />
            </div>

            {categoryFilterEnabled ? (
              <div>
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

            <div>
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

            <div>
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

            <div>
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
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="freeShipping"
                  value="1"
                  defaultChecked={state.freeShippingOnly}
                />
                Sólo envío gratis
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="inStock"
                  value="1"
                  defaultChecked={state.inStockOnly}
                />
                Sólo en stock
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary">
                Aplicar filtros
              </button>
              <a href={basePath} className="btn-secondary">
                Limpiar
              </a>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
