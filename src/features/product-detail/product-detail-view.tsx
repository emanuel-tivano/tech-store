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

function getSoldLabel(qtySold: number) {
  if (qtySold <= 0) {
    return null;
  }

  return qtySold === 1 ? '1 vendido' : `${qtySold} vendidos`;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const imageSrc = product.image || FALLBACK_PRODUCT_IMAGE;
  const soldLabel = getSoldLabel(product.qtySold);
  const deliveryTitle = product.freeShipment
    ? 'Envío gratis'
    : 'A coordinar';
  const deliveryCopy = product.freeShipment
    ? 'Este producto ya incluye el beneficio de envío.'
    : 'Elegís el método de entrega al avanzar en checkout.';
  const statusLabel =
    product.stock > 0 ? 'Disponible para compra' : 'Sin stock por ahora';
  const isAvailable = product.stock > 0;

  return (
    <section className='grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-10'>
      <div className='lg:col-span-2'>
        <Link
          href={product.categoryId ? `/category/${product.categoryId}` : '/'}
          className='btn-link gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900'
        >
          <span aria-hidden='true'>←</span>
          Volver
        </Link>
      </div>

      <div className='space-y-4 lg:space-y-5'>
        <div className='surface-card brand-tint-panel overflow-hidden rounded-3xl border-slate-200/90 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)]'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-4 sm:px-6'>
            <span className='brand-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]'>
              {CATEGORY_LABELS[product.categoryId]}
            </span>
            {soldLabel ? (
              <span className='text-sm font-medium text-slate-500'>
                {soldLabel}
              </span>
            ) : null}
          </div>

          <div className='flex min-h-[300px] items-center justify-center p-6 sm:min-h-[440px] sm:p-12'>
            <Image
              src={imageSrc}
              alt={product.title}
              width={PRODUCT_DETAIL_IMAGE_WIDTH}
              height={PRODUCT_DETAIL_IMAGE_HEIGHT}
              sizes='(min-width: 1024px) 50vw, 100vw'
              priority
              className='product-detail-image w-full object-contain'
            />
          </div>
        </div>

        <div className='grid gap-3 md:grid-cols-3'>
          <div className='surface-card rounded-2xl border-slate-200/80 bg-white/90 p-4 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.28)]'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>
              Valoración
            </p>
            <p className='mt-2 flex items-center gap-2 text-lg font-semibold text-slate-950'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='#0066ff'
                stroke='#0066ff'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245' />
              </svg>
              <span>
                {product.rating}{' '}
                <span className='text-sm font-medium text-slate-500'>de 5</span>
              </span>
            </p>
            <p className='mt-1 text-sm text-slate-500'>
              {product.opinions} opiniones
            </p>
          </div>

          <div className='surface-card rounded-2xl border-slate-200/80 bg-white/90 p-4 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.28)]'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>
              Disponibilidad
            </p>
            <p className='mt-2 text-lg font-semibold text-slate-950'>
              {product.stock} {product.stock >= 1 ? 'unidades' : 'unidad'}
            </p>
            <p className='mt-1 text-sm text-slate-500'>
              {product.stock > 0
                ? 'Listo para sumar al carrito'
                : 'Volvé a consultar pronto'}
            </p>
          </div>

          <div className='surface-card rounded-2xl border-slate-200/80 bg-white/90 p-4 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.28)]'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>
              Entrega
            </p>
            <div
              className={`flex items-center mt-2 text-lg font-semibold ${
                product.freeShipment ? 'text-emerald-700' : 'text-slate-950'
              }`}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                strokeWidth='1.75'
                stroke='currentColor'
                fill='none'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <circle cx='7' cy='17' r='2' />
                <circle cx='17' cy='17' r='2' />
                <path d='M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5' />
              </svg>
              <p className='ms-1'>{deliveryTitle}</p>
            </div>
            <p className='mt-1 text-sm text-slate-500'>{deliveryCopy}</p>
          </div>
        </div>
      </div>

      <div className='lg:sticky lg:top-6'>
        <div className='surface-card overflow-hidden rounded-3xl border-slate-300/80 bg-white shadow-[0_28px_70px_-34px_rgba(15,23,42,0.45),0_14px_32px_-24px_rgba(0,102,255,0.22)]'>
          <div className='flex flex-col gap-7 p-5 pb-0 sm:px-7'>
            <div className='space-y-5'>
              <div className='space-y-4'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]'>
                    Detalle del producto
                  </p>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      isAvailable
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className='space-y-3'>
                  <h1 className='text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.6rem] sm:leading-[1.05]'>
                    {product.title}
                  </h1>
                  <p className='max-w-2xl text-base leading-7 text-slate-600'>
                    {product.description}
                  </p>
                </div>
              </div>

              <div className='rounded-[1.6rem] border border-slate-200 bg-slate-50/85 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-6'>
                <div className='flex flex-col gap-5'>
                  <div className='space-y-2'>
                    <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                      Precio final
                    </p>
                    <p className='text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl'>
                      $ {currencyFormatter.format(product.price)}
                    </p>
                    <p className='text-sm leading-6 text-slate-500'>
                      Precio por unidad. El método de entrega y pago se
                      selecciona en checkout.
                    </p>
                  </div>
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
