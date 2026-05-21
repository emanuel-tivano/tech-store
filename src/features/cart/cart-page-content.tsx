'use client';

import Link from 'next/link';
import Image from 'next/image';

import { getCartLineTotal, useCart } from '@/context/cart-context';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const CART_IMAGE_WIDTH = 144;
const CART_IMAGE_HEIGHT = 112;
const FALLBACK_PRODUCT_IMAGE = '/icons/LogoIcon.svg';

export function CartPageContent() {
  const { cart, clearCart, getTotalItems, getTotalPrice, removeItem } = useCart();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (cart.items.length === 0) {
    return (
      <section className="flex flex-col gap-6">
        <div className="surface-card brand-tint-panel overflow-hidden rounded-3xl border-slate-200/80 px-5 py-8 text-center sm:px-8 sm:py-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
            <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
              Carrito
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              No hay productos en el carrito
            </h1>
            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Agregá productos desde el catálogo para continuar con la compra.
            </p>
            <Link href="/" className="btn-primary mt-2">
              Explorar catálogo
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 sm:gap-8">
      <div className="surface-card brand-tint-panel overflow-hidden rounded-3xl border-slate-200/80 px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
              Carrito
            </p>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Revisá tu selección
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                Confirmá productos, cantidades y subtotal antes de avanzar al checkout.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Productos
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {totalItems}
              </p>
              <p className="mt-1 text-sm text-slate-500">Unidades en tu carrito</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Total actual
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                $ {currencyFormatter.format(totalPrice)}
              </p>
              <p className="mt-1 text-sm text-slate-500">Antes de costos finales</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          {cart.items.map((item) => {
            const imageSrc = item.image || FALLBACK_PRODUCT_IMAGE;

            return (
              <article key={item.id} className="surface-card overflow-hidden rounded-3xl border-slate-200/80">
                <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center">
                  <div className="flex min-h-32 items-center justify-center rounded-2xl bg-slate-50 p-4 lg:w-36 lg:flex-none">
                    <Image
                      src={imageSrc}
                      alt={item.title}
                      width={CART_IMAGE_WIDTH}
                      height={CART_IMAGE_HEIGHT}
                      sizes="(min-width: 1024px) 9rem, 40vw"
                      className="max-h-28 w-full object-contain"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {item.categoryId}
                        </p>
                        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                          {item.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Cantidad
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">
                            {item.quantity}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Precio unitario
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">
                            $ {currencyFormatter.format(item.price)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
                            Subtotal
                          </p>
                          <p className="mt-1 text-lg font-semibold text-emerald-800">
                            $ {currencyFormatter.format(getCartLineTotal(item))}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:min-w-44 lg:items-end">
                      <Link href={`/item/${item.id}`} className="btn-secondary w-full lg:w-auto">
                        Ver producto
                      </Link>
                      <button
                        type="button"
                        className="btn-danger w-full lg:w-auto"
                        onClick={() => removeItem(item.id)}
                      >
                        Quitar producto
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="surface-card rounded-3xl border-slate-200/80 lg:sticky lg:top-6">
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <div>
              <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                Resumen
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Total del carrito
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                El detalle final se confirma en checkout con tus datos de entrega.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                  <span>Unidades</span>
                  <span className="font-semibold text-slate-950">{totalItems}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-950">
                    $ {currencyFormatter.format(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="brand-highlight-panel rounded-2xl border px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Total estimado
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                $ {currencyFormatter.format(totalPrice)}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/checkout" className="btn-primary w-full">
                Completar compra
              </Link>
              <button type="button" className="btn-secondary w-full" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-500">
              Podés seguir explorando el catálogo y volver cuando quieras.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
