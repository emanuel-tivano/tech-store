import { PageState } from '@/components/page-state';
import { ProductGrid } from '@/components/product-grid';
import type { Category, Product } from '@/types';

interface CatalogViewProps {
  products: Product[];
  categoryId?: Category;
}

const labels: Record<Category, string> = {
  monitores: 'Monitores',
  teclados: 'Teclados',
  mouses: 'Mouses',
  auriculares: 'Auriculares',
};

export function CatalogView({ products, categoryId }: CatalogViewProps) {
  const title = categoryId
    ? `${labels[categoryId]} más vendidos`
    : 'Bienvenidos a Periféricos de PC';

  return (
    <section className="flex flex-col gap-6 sm:gap-8">
      <div className="surface-card brand-tint-panel overflow-hidden rounded-3xl border-slate-200/80 px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          {!categoryId ? (
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Descubrí nuestro catálogo completo de periféricos.
            </p>
          ) : null}
          {products.length > 0 ? (
            <p className="text-sm font-medium text-slate-500">
              {products.length} producto{products.length === 1 ? '' : 's'} disponibles
            </p>
          ) : null}
        </div>
      </div>

      {products.length === 0 ? (
        <PageState
          title="No hay productos disponibles"
          description="Todavía no encontramos productos para esta categoría."
        />
      ) : null}

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : null}
    </section>
  );
}
