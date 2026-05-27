'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { HeaderSearch } from '@/components/header-search';
import { useCart } from '@/context/cart-context';
import { CATEGORY_NAV_ITEMS } from '@/lib/catalog-taxonomy';

function getLinkClassName(
  pathname: string,
  href: string,
  selectedCategory?: string | null,
) {
  const isCategoryLink = href.startsWith('/category/');
  const isHomeLink = href === '/';
  const isHelpLink = href === '/help';
  const isActive = isHomeLink
    ? pathname === '/'
    : isHelpLink
      ? pathname === '/help'
      : pathname === href ||
        (pathname === '/' &&
          isCategoryLink &&
          selectedCategory === href.slice('/category/'.length));

  return [
    'inline-flex items-center rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-white text-[var(--brand-600)] shadow-sm shadow-slate-950/5'
      : 'text-white md:hover:border-slate-200 md:hover:bg-white md:hover:text-[var(--brand-600)]',
  ].join(' ');
}

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const selectedCategory =
    pathname === '/' ? searchParams.get('category') : null;

  return (
    <header className='brand-header border-b border-slate-200/70 shadow-md shadow-slate-950/5'>
      <div className='mx-auto flex w-full max-w-[1500px] flex-col px-3 sm:px-6 xl:px-8'>
        <div className='flex flex-col gap-3 py-3'>
          <div className='grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(360px,640px)_minmax(220px,1fr)]'>
            <Link
              href='/'
              className='flex items-center justify-end gap-2 rounded-md text-lg font-semibold tracking-[-0.02em] text-white no-underline focus-visible:outline-white sm:text-2xl'
              aria-label='Ir al inicio'
            >
              <svg
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                width='30'
                height='30'
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

              <span className='hidden sm:inline sm:truncate'>
                Periféricos de PC
              </span>
            </Link>
            <div className='min-w-0 lg:col-span-1 lg:order-2'>
              <Suspense fallback={<HeaderSearchFallback />}>
                <HeaderSearch />
              </Suspense>
            </div>
            <div className='lg:order-3'>
              <Link
                href='/cart'
                className='relative inline-flex items-center justify-center gap-1 py-1 font-medium text-white/[0.92] focus-visible:outline-white'
                aria-label={`Ir al carrito con ${totalItems} productos`}
              >
                <span className='relative inline-flex h-8 w-8 shrink-0 items-center justify-center'>
                  <svg
                    aria-hidden='true'
                    xmlns='http://www.w3.org/2000/svg'
                    width='30'
                    height='30'
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

                <span className='hidden sm:inline text-lg'>Carrito</span>
              </Link>
            </div>
          </div>

          <div className='flex items-center'>
            <nav
              aria-label='Categorías'
              className='w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            >
              <ul className='flex min-w-max items-center gap-1.5 pr-3 sm:min-w-0 sm:flex-wrap sm:justify-center'>
                <li className='rounded-full border border-white/[0.14] bg-white/[0.08] text-sm font-medium md:hover:border-white/[0.22] md:hover:bg-white/[0.14] md:hover:text-white'>
                  <Link
                    href='/'
                    className={getLinkClassName(
                      pathname,
                      '/',
                      selectedCategory,
                    )}
                  >
                    Inicio
                  </Link>
                </li>

                {CATEGORY_NAV_ITEMS.map((category) => (
                  <li
                    key={category.href}
                    className='rounded-full border border-white/[0.14] bg-white/[0.08] text-sm font-medium md:hover:border-white/[0.22] md:hover:bg-white/[0.14] md:hover:text-white'
                  >
                    <Link
                      href={category.href}
                      className={getLinkClassName(
                        pathname,
                        category.href,
                        selectedCategory,
                      )}
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}

                <li className='rounded-full border border-white/[0.14] bg-white/[0.08] text-sm font-medium md:hover:border-white/[0.22] md:hover:bg-white/[0.14] md:hover:text-white'>
                  <Link
                    href='/help'
                    className={getLinkClassName(
                      pathname,
                      '/help',
                      selectedCategory,
                    )}
                  >
                    Ayuda
                  </Link>
                </li>
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
