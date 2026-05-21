import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const currencyFormatter = new Intl.NumberFormat('es-AR');
const PRODUCT_CARD_IMAGE_WIDTH = 320;
const PRODUCT_CARD_IMAGE_HEIGHT = 240;
const FALLBACK_PRODUCT_IMAGE = '/icons/LogoIcon.svg';

export function ProductCard({ product }: ProductCardProps) {
  const imageSrc = product.image || FALLBACK_PRODUCT_IMAGE;

  return (
    <article className='h-full'>
      <Link
        href={`/item/${product.id}`}
        className='group block h-full text-inherit no-underline'
      >
        <div className='surface-card card-hover flex h-full flex-col overflow-hidden rounded-2xl border-slate-200/80 bg-white'>
          <div className='border-b border-slate-100 bg-linear-to-b from-slate-50 to-white p-4 sm:p-5'>
            <div className='mb-4 flex items-center justify-between gap-3'>
              <span className='brand-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]'>
                {product.categoryId}
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
              <p className='text-sm leading-6 text-slate-500'>
                {product.qtySold} vendidos
              </p>
            </div>

            <div className='mt-auto flex items-center justify-between items-centergap-4'>
              <div className='space-y-1'>
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
                <span className='rounded-full bg-amber-50 ms-1 text-lg font-medium'>
                  {product.rating} ({product.opinions})
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
