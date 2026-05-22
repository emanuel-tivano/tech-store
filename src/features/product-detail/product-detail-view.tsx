import Link from 'next/link';
import Image from 'next/image';

import { CATEGORY_LABELS } from '@/lib/catalog-taxonomy';
import { ProductDetailActions } from '@/features/product-detail/product-detail-actions';
import type { ProductDetailDTO } from '@/types';

interface ProductDetailViewProps {
  product: ProductDetailDTO;
}

const currencyFormatter = new Intl.NumberFormat('es-AR');
const PRODUCT_DETAIL_IMAGE_WIDTH = 900;
const PRODUCT_DETAIL_IMAGE_HEIGHT = 900;
const FALLBACK_PRODUCT_IMAGE = '/icons/LogoIcon.svg';

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const imageSrc = product.image || FALLBACK_PRODUCT_IMAGE;

  return (
    <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:gap-8">
      <div className="lg:col-span-2">
        <Link
          href={product.categoryId ? `/category/${product.categoryId}` : '/'}
          className="btn-link gap-2 px-0"
        >
          <span aria-hidden="true">←</span>
          Volver
        </Link>
      </div>

      <div className="space-y-4">
        <div className="surface-card brand-tint-panel overflow-hidden rounded-3xl border-slate-200/80">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <span className="brand-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
              {CATEGORY_LABELS[product.categoryId]}
            </span>
            <span className="text-sm font-medium text-slate-500">
              {product.qtySold} vendidos
            </span>
          </div>

          <div className="flex min-h-[280px] items-center justify-center p-4 sm:min-h-[420px] sm:p-10">
            <Image
              src={imageSrc}
              alt={product.title}
              width={PRODUCT_DETAIL_IMAGE_WIDTH}
              height={PRODUCT_DETAIL_IMAGE_HEIGHT}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="product-detail-image w-full object-contain"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="surface-card rounded-2xl border-slate-200/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Valoración
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {product.rating} <span className="text-sm font-medium text-slate-500">de 5</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">{product.opinions} opiniones</p>
          </div>

          <div className="surface-card rounded-2xl border-slate-200/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Disponibilidad
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{product.stock} unidades</p>
            <p className="mt-1 text-sm text-slate-500">
              {product.stock > 0 ? 'Listo para sumar al carrito' : 'Volvé a consultar pronto'}
            </p>
          </div>

          <div className="surface-card rounded-2xl border-slate-200/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Entrega
            </p>
            <p
              className={`mt-2 text-lg font-semibold ${
                product.freeShipment ? 'text-emerald-700' : 'text-slate-950'
              }`}
            >
              {product.freeShipment ? 'Envío gratis' : 'Envío a coordinar'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {product.freeShipment
                ? 'Disponible para compras seleccionadas.'
                : 'Consultá condiciones al finalizar la compra.'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="surface-card rounded-3xl border-slate-200/80">
          <div className="flex flex-col gap-6 p-4 sm:p-7">
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                  Detalle del producto
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  {product.title}
                </h1>
                <p className="text-base leading-7 text-slate-600">{product.description}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Precio final
                </p>
                <div className="mt-2 flex flex-col gap-4 min-[430px]:flex-row min-[430px]:items-end min-[430px]:justify-between">
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                      $ {currencyFormatter.format(product.price)}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Precio por unidad. Impuestos y medios de pago se calculan en checkout.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Estado
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {product.stock > 0 ? 'Stock disponible' : 'Sin stock'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
                  <p className="font-semibold text-emerald-800">
                    {product.freeShipment ? 'Incluye envío gratis' : 'Envío a coordinar'}
                  </p>
                  <p className="mt-1">
                    {product.freeShipment
                      ? 'Se muestra antes de finalizar la compra.'
                      : 'El costo de envío se define según tu ubicación.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-900">{product.stock} unidades disponibles</p>
                  <p className="mt-1">
                    {product.stock > 0
                      ? 'Sumá la cantidad que necesitás y actualizá tu carrito cuando quieras.'
                      : 'Cuando vuelva a ingresar stock vas a poder sumarlo desde acá.'}
                  </p>
                </div>
              </div>
            </div>

            <ProductDetailActions product={product} />
          </div>
        </div>
      </div>
    </section>
  );
}
