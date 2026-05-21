'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useCart } from '@/context/cart-context';
import { CATEGORY_NAV_ITEMS } from '@/lib/catalog-taxonomy';

function getLinkClassName(pathname: string, href: string) {
  const isActive = pathname === href;

  return [
    'inline-flex items-center rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-white text-[var(--brand-600)] shadow-sm shadow-slate-950/5'
      : 'text-white hover:border-slate-200 hover:bg-white hover:text-[var(--brand-600)]',
  ].join(' ');
}

export function SiteHeader() {
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className='brand-header border-b border-slate-200/70 shadow-md shadow-slate-950/5'>
      <div className='mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-3 py-3 sm:gap-3 sm:py-3'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-center gap-1'>
              <svg
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

              <div className='min-w-0'>
                <Link
                  href='/'
                  className='inline-flex text-xl font-semibold tracking-[-0.02em] text-white no-underline sm:text-2xl'
                >
                  Periféricos de PC
                </Link>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2 sm:justify-end'>
              <Link
                href='/help'
                className='inline-flex items-center justify-center gap-1 px-3.5 py-2 font-medium text-white/[0.88]'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='26'
                  height='26'
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
                className='relative flex items-center justify-center gap-2 px-3.5 py-2 font-medium text-white/[0.88]'
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
                        ? 'bg-red-600 text-white-900'
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

          <div className='flex items-center justify-center '>
            <nav aria-label='Categorías' className='overflow-x-auto px-2'>
              <ul className='flex min-w-max items-center gap-1.5 sm:min-w-0 sm:flex-wrap'>
                <li className='rounded-full border border-white/[0.14] bg-white/[0.08] text-sm font-medium backdrop-blur-sm hover:border-white/[0.22] hover:bg-white/[0.14] hover:text-white'>
                  <Link href='/' className={getLinkClassName(pathname, '/')}>
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
                      className={getLinkClassName(pathname, category.href)}
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
