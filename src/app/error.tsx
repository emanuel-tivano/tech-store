'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { PageState } from '@/components/page-state';

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Storefront route error', error);
  }, [error]);

  return (
    <section className="surface-card mx-auto max-w-3xl rounded-3xl border-slate-200/80 p-6 sm:p-10">
      <PageState
        title="No pudimos cargar esta sección"
        description="Hubo un problema temporal al consultar la tienda. Podés reintentar o volver al catálogo."
      />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" className="btn-primary" onClick={reset}>
          Reintentar
        </button>
        <Link href="/" className="btn-secondary">
          Volver al catálogo
        </Link>
      </div>
    </section>
  );
}
