'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { HeaderSearch } from '@/components/header-search';
import { useCart } from '@/context/cart-context';
import { CATEGORY_NAV_ITEMS } from '@/lib/catalog-taxonomy';

function getLinkClassName(pathname: string, href: string, selectedCategory?: string | null) {
  const isCategoryLink = href.startsWith('/category/');
  const isActive =
    pathname === href ||
    (href === '/' && pathname === '/' && !selectedCategory) ||
    (pathname === '/' && isCategoryLink && selectedCategory === href.slice('/category/'.length));

  return [
    'inline-flex items-center rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-white text-[var(--brand-600)] shadow-sm shadow-slate-950/5'
      : 'text-white hover:border-slate-200 hover:bg-white hover:text-[var(--brand-600)]',
  ].join(' ');
}

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const selectedCategory = pathname === '/' ? searchParams.get('category') : null;

  return (
    <header className='brand-header border-b border-slate-200/70 shadow-md shadow-slate-950/5'>
      <div className='mx-auto flex w-full max-w-6xl flex-col px-3 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-3 py-3'>
          <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto]'>
            <div className='flex min-w-0 items-center gap-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='28'
                height='28'
                viewBox='0 0 24 24'
                fill='none'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10' />
                <path d='M7 20h10' />
                <path d='M9 16v4' />
                <path d='M15 16v4' />
              </svg>

              <div className='min-w-0'>
                <Link
                  href='/'
                  className='inline-flex max-w-full rounded-md text-lg font-semibold tracking-[-0.02em] text-white no-underline focus-visible:outline-white sm:text-2xl'
                >
                  <span className='truncate'>Periféricos de PC</span>
                </Link>
              </div>
            </div>

            <div className='order-3 col-span-2 min-w-0 lg:order-2 lg:col-span-1'>
              <Suspense fallback={<HeaderSearchFallback />}>
                <HeaderSearch />
              </Suspense>
            </div>

            <div className='order-2 grid grid-cols-2 gap-2 justify-self-end lg:order-3'>
              <Link
                href='/help'
                className='inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-white/[0.15] bg-white/[0.08] px-3 py-2 text-sm font-medium text-white/[0.92] backdrop-blur-sm focus-visible:outline-white'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='22'
                  height='22'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                  <path d='M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' />
                  <path d='M12 17l0 .01' />
                  <path d='M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4' />
                </svg>
                <span>Ayuda</span>
              </Link>
              <Link
                href='/cart'
                className='relative inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.08] px-3 py-2 text-sm font-medium text-white/[0.92] backdrop-blur-sm focus-visible:outline-white'
                aria-label={`Ir al carrito con ${totalItems} productos`}
              >
                <span className='relative inline-flex h-6 w-6 shrink-0 items-center justify-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                    <path d='M4 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
                    <path d='M15 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
                    <path d='M17 17h-11v-14h-2' />
                    <path d='M6 5l14 1l-1 7h-13' />
                  </svg>
                  <span
                    aria-hidden='true'
                    className={[
                      'brand-badge-cart pointer-events-none absolute right-0 top-0 inline-flex h-4 min-w-4 translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none shadow-sm',
                      totalItems > 0
                        ? 'bg-red-600 text-white'
                        : 'bg-white/90 text-[var(--brand-600)]',
                    ].join(' ')}
                  >
                    {totalItems}
                  </span>
                </span>
                <span>Carrito</span>
              </Link>
            </div>
          </div>

          <div className='flex items-center'>
            <nav aria-label='Categorías' className='w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              <ul className='flex min-w-max items-center gap-1.5 pr-3 sm:min-w-0 sm:flex-wrap sm:justify-center'>
                <li className='rounded-full border border-white/[0.14] bg-white/[0.08] text-sm font-medium backdrop-blur-sm hover:border-white/[0.22] hover:bg-white/[0.14] hover:text-white'>
                  <Link href='/' className={getLinkClassName(pathname, '/', selectedCategory)}>
                    Inicio
                  </Link>
                </li>

                {CATEGORY_NAV_ITEMS.map((category) => (
                  <li
                    key={category.href}
                    className='rounded-full border border-white/[0.14] bg-white/[0.08] text-sm font-medium backdrop-blur-sm hover:border-white/[0.22] hover:bg-white/[0.14] hover:text-white'
                  >
                    <Link
                      href={category.href}
                      className={getLinkClassName(pathname, category.href, selectedCategory)}
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderSearchFallback() {
  return (
    <div
      aria-hidden='true'
      className='flex min-h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(15,23,42,0.08)]'
    >
      <div className='min-h-11 flex-1 bg-white' />
      <div className='h-6 w-px bg-slate-200' />
      <div className='h-11 w-11 bg-white' />
    </div>
  );
}
