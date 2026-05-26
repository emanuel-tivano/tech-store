'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { buildCatalogSearchHref } from '@/lib/catalog-search';

export function HeaderSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const href = buildCatalogSearchHref({
      pathname,
      query,
      searchParams,
    });

    router.push(href);
  }

  return (
    <form
      role='search'
      aria-label='Buscar productos en el catálogo'
      className='w-full lg:max-w-3xl xl:max-w-4xl'
      onSubmit={handleSubmit}
    >
      <div className='flex min-h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(15,23,42,0.08)] transition-shadow duration-200 focus-within:shadow-[0_0_0_3px_rgba(0,102,255,0.12),0_8px_24px_rgba(15,23,42,0.08)]'>
        <label htmlFor='header-search' className='sr-only'>
          Buscar productos
        </label>
        <input
          id='header-search'
          name='q'
          type='search'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Buscar productos'
          className='min-h-10 w-full min-w-0 border-0 bg-white px-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus-visible:outline-[var(--brand-500)] sm:px-4'
          aria-label='Buscar productos'
        />
        <div aria-hidden='true' className='h-6 w-px shrink-0 bg-slate-200' />
        <button
          type='submit'
          className='flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:outline-[var(--brand-500)]'
          aria-label='Buscar'
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
            <path d='M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0' />
            <path d='M21 21l-6 -6' />
          </svg>
        </button>
      </div>
    </form>
  );
}
