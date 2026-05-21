import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { CATEGORY_LABELS } from '@/lib/catalog-taxonomy';
import type { ProductCardDTO } from '@/types';

interface ProductCardProps {
  product: ProductCardDTO;
}

const currencyFormatter = new Intl.NumberFormat('es-AR');
const PRODUCT_CARD_IMAGE_WIDTH = 320;
const PRODUCT_CARD_IMAGE_HEIGHT = 240;
const FALLBACK_PRODUCT_IMAGE = '/icons/LogoIcon.svg';

export function ProductCard({ product }: ProductCardProps) {
  const imageSrc = product.image || FALLBACK_PRODUCT_IMAGE;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <article className='h-full'>
      <Link
        href={`/products/${product.slug}`}
        className='group block h-full text-inherit no-underline'
      >
        <div className='surface-card card-hover flex h-full flex-col overflow-hidden rounded-2xl border-slate-200/80 bg-white'>
          <div className='border-b border-slate-100 bg-linear-to-b from-slate-50 to-white p-4 sm:p-5'>
            <div className='mb-4 flex items-center justify-between gap-3'>
              <span className='brand-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]'>
                {CATEGORY_LABELS[product.categoryId]}
              </span>
              {product.freeShipment ? (
                <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
                  Envío gratis
                </span>
              ) : null}
            </div>

            <div className='flex min-h-64 items-center justify-center'>
              <Image
                src={imageSrc}
                alt={product.title}
                width={PRODUCT_CARD_IMAGE_WIDTH}
                height={PRODUCT_CARD_IMAGE_HEIGHT}
                sizes='(min-width: 1536px) 18rem, (min-width: 1280px) 20rem, (min-width: 640px) 45vw, 90vw'
                className='h-56 w-full object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:h-60'
              />
            </div>
          </div>

          <div className='flex flex-1 flex-col gap-2 px-5 py-4'>
            <div className='space-y-2'>
              <h2 className='line-clamp-2 text-lg font-semibold leading-snug text-slate-950'>
                {product.title}
              </h2>
              <p className='line-clamp-2 text-sm leading-6 text-slate-500'>
                {product.description}
              </p>
              <div className='flex flex-wrap gap-2 text-xs font-medium'>
                <span className='rounded-full bg-slate-100 px-2.5 py-1 text-slate-600'>
                  {product.qtySold} vendidos
                </span>
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

            <div className='mt-auto flex flex-col gap-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>
                    Precio
                  </p>
                  <span className='text-2xl font-semibold tracking-tight text-slate-950'>
                    $ {currencyFormatter.format(product.price)}
                  </span>
                </div>

                <div className='flex items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
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
                  <span className='rounded-full bg-amber-50 ms-1 px-2 py-1 text-sm font-medium text-slate-700'>
                    {product.rating} ({product.opinions})
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold ${
                  product.stock > 0
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 bg-slate-100 text-slate-500'
                }`}
              >
                {product.stock > 0 ? 'Ver producto' : 'Ver detalles'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
