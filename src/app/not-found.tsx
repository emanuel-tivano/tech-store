import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex flex-col gap-6 sm:gap-8">
      <div className="surface-card brand-tint-panel overflow-hidden rounded-3xl border-slate-200/80 px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            Error 404
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            No encontramos la página que buscás
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Es posible que el producto o la categoría ya no estén disponibles, o que el enlace sea
            incorrecto.
          </p>

          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/" className="btn-primary">
              Volver al catálogo
            </Link>
            <Link href="/help" className="btn-secondary">
              Ir a ayuda
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
