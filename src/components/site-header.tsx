'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useCart } from '@/context/cart-context';
import type { Category } from '@/types';

const categories: Array<{ href: `/category/${Category}`; label: string }> = [
  { href: '/category/monitores', label: 'Monitores' },
  { href: '/category/teclados', label: 'Teclados' },
  { href: '/category/mouses', label: 'Mouses' },
  { href: '/category/auriculares', label: 'Auriculares' },
];

function getLinkClassName(pathname: string, href: string) {
  const isActive = pathname === href;

  return [
    'inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
    isActive
      ? 'border-white/70 bg-white brand-eyebrow shadow-sm'
      : 'border-white/10 bg-white/[0.02] text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white',
  ].join(' ');
}

export function SiteHeader() {
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className='brand-header border-b border-white/10 text-white shadow-lg shadow-slate-950/10'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-3 sm:px-6 sm:py-3 lg:px-8'>
        <div className='flex flex-col gap-5'>
          <div className='flex gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex items-center max-w-2xl space-y-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='35'
                height='35'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='mb-0'
              >
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10' />
                <path d='M7 20h10' />
                <path d='M9 16v4' />
                <path d='M15 16v4' />
              </svg>
              <Link
                href='/'
                className='ms-1 inline-flex text-2xl font-semibold tracking-tight text-white no-underline sm:text-3xl'
              >
                Periféricos de PC
              </Link>
            </div>

            <div className='flex flex-col gap-2 sm:flex-row'>
              <Link
                href='/help'
                className='inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:border-white/30 hover:bg-white/10'
              >
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
                  <path d='M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' />
                  <path d='M12 17l0 .01' />
                  <path d='M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4' />
                </svg>
                <span className='ms-1'>Ayuda</span>
              </Link>
              <Link
                href='/cart'
                className='inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-100'
                aria-label={`Ir al carrito con ${totalItems} productos`}
              >
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
                <span>Carrito</span>
                <span className='ms-1 brand-badge inline-flex min-w-7 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold'>
                  {totalItems}
                </span>
              </Link>
            </div>
          </div>

          <div className='rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm'>
            <nav aria-label='Categorías'>
              <ul className='flex flex-wrap justify-center gap-2'>
                <li>
                  <Link href='/' className={getLinkClassName(pathname, '/')}>
                    Inicio
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.href}>
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
