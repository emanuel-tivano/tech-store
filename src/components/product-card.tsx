import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { CATEGORY_LABELS } from '@/lib/catalog-taxonomy';
import type { ProductCardDTO } from '@/types';

interface ProductCardProps {
  product: ProductCardDTO;
  priority?: boolean;
}

const currencyFormatter = new Intl.NumberFormat('es-AR');
const FALLBACK_PRODUCT_IMAGE = '/icons/LogoIcon.svg';

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const imageSrc = product.image || FALLBACK_PRODUCT_IMAGE;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const soldLabel = product.qtySold >= 2 ? `${product.qtySold} vendidos` : null;

  return (
    <article className='h-full'>
      <Link
        href={`/products/${product.slug}`}
        className='group block h-full rounded-2xl text-inherit no-underline focus-visible:outline-[var(--brand-500)]'
      >
        <div className='surface-card card-hover flex h-full flex-col overflow-hidden rounded-2xl border-slate-200/80 bg-white'>
          <div className='border-b border-slate-100 bg-linear-to-b from-slate-50 to-white p-3 sm:p-5'>
            <div className='mb-3 flex flex-wrap items-start justify-between gap-2 sm:mb-4 sm:gap-3'>
              <span className='brand-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]'>
                {CATEGORY_LABELS[product.categoryId]}
              </span>
              {product.freeShipment ? (
                <div className='inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                    <path d='M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
                    <path d='M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
                    <path d='M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5' />
                  </svg>

                  <span className='ms-1'>Envío gratis</span>
                </div>
              ) : 
                <div className='inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-slate-900'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                    <path d='M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
                    <path d='M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
                    <path d='M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5' />
                  </svg>

                  <span className='ms-1'>A coordinar</span>
                </div>}
            </div>

            <div className='relative h-44 sm:h-56 md:h-60'>
              <Image
                src={imageSrc}
                alt={product.title}
                fill
                sizes='(min-width: 1536px) 18rem, (min-width: 1280px) 20rem, (min-width: 640px) 45vw, 90vw'
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                className='object-contain transition-transform duration-300 group-hover:scale-[1.03]'
              />
            </div>
          </div>

          <div className='flex flex-1 flex-col gap-3 px-4 py-4 sm:px-5'>
            <div className='space-y-2'>
              <h2 className='line-clamp-2 text-base font-semibold leading-snug text-slate-950 sm:text-lg'>
                {product.title}
              </h2>
              <p className='line-clamp-2 text-sm leading-6 text-slate-500'>
                {product.description}
              </p>
              <div className='flex flex-wrap gap-2 text-sm font-medium'>
                {soldLabel ? (
                  <span className='text-xs font-medium text-slate-500'>
                    {soldLabel}
                  </span>
                ) : null}

                {isLowStock ? (
                  <span className='rounded-full bg-amber-50 px-2.5 py-1 text-amber-700'>
                    Últimas {product.stock} unidades
                  </span>
                ) : null}
                {product.stock <= 0 ? (
                  <span className='rounded-full bg-red-50 px-2.5 py-1 text-red-700'>
                    Sin stock
                  </span>
                ) : null}
              </div>
            </div>

            <div className='mt-auto flex flex-col gap-3'>
              <div className='flex justify-between gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between'>
                <div className='space-y-1'>
                  <span className='whitespace-nowrap text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl'>
                    $ {currencyFormatter.format(product.price)}
                  </span>
                </div>

                <div className='flex items-center px-2.5 text-sm font-medium text-slate-700'>
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
                  >
                    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                    <path d='M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245' />
                  </svg>
                  <span className='ps-1 text-base'>
                    {product.rating} ({product.opinions})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
