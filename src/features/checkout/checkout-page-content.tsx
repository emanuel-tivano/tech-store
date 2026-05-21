'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { PageState } from '@/components/page-state';
import { useCart } from '@/context/cart-context';
import { createOrderAction } from '@/features/checkout/actions';
import type { Buyer } from '@/types';

import {
  type CheckoutFormErrors,
  type CheckoutFormValues,
  validateCheckoutForm,
} from './validation';

type CheckoutStatus = 'idle' | 'loading' | 'success' | 'error';
type CheckoutFieldWithError = 'name' | 'phone' | 'email' | 'repeatEmail';

const initialValues: CheckoutFormValues = {
  name: '',
  lastName: '',
  phone: '',
  email: '',
  repeatEmail: '',
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function CheckoutPageContent() {
  const { cart, clearCart, getTotalPrice } = useCart();
  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);

  const hasItems = cart.items.length > 0;
  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const fieldErrorCount = [errors.name, errors.phone, errors.email, errors.repeatEmail].filter(
    Boolean,
  ).length;

  function getInputClassName(field?: CheckoutFieldWithError) {
    return [
      'input-base',
      field && errors[field]
        ? 'border-red-300 bg-red-50/50 text-red-950 focus:border-red-500'
        : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateCheckoutForm(values, hasItems);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const buyer: Buyer = {
      name: values.name.trim(),
      lastName: values.lastName.trim() || undefined,
      phone: values.phone.trim(),
      email: values.email.trim(),
    };

    const result = await createOrderAction({
      buyer,
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    });

    if (result.status === 'success') {
      setOrderId(result.orderId);
      setStatus('success');
      setErrors({});
      clearCart();
      setValues(initialValues);
      return;
    }

    setStatus('error');
    setErrors({
      cart: result.message,
    });
  }

  if (status === 'success' && orderId) {
    return (
      <section className="flex flex-col gap-6">
        <div className="surface-card brand-success-panel overflow-hidden rounded-3xl border-slate-200/80 px-5 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Orden confirmada
            </p>
            <PageState
              title="Compra realizada correctamente"
              description={`Tu orden fue registrada con el ID ${orderId}.`}
            />
            <Link href="/" className="btn-primary mt-2">
              Volver al catálogo
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
              Checkout
            </p>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Completá tus datos para generar la orden
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                Revisá tu resumen y confirmá la información del comprador antes de finalizar la
                compra.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Productos
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {cart.items.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">Ítems listos para ordenar</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Total estimado
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                $ {currencyFormatter.format(totalPrice)}
              </p>
              <p className="mt-1 text-sm text-slate-500">Se mantiene el flujo actual del checkout</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,420px)]">
        <div className="surface-card rounded-3xl border-slate-200/80">
          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-2">
              <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                Información del comprador
              </p>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Datos de contacto
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Usaremos estos datos para registrar la orden exactamente como lo hace el flujo
                  actual.
                </p>
              </div>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
              {(fieldErrorCount > 0 || errors.cart) && status === 'error' ? (
                <div
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  <p className="font-medium text-red-800">
                    Revisá los campos marcados antes de finalizar la compra.
                  </p>
                  <p className="mt-1">
                    {fieldErrorCount > 0
                      ? `${fieldErrorCount} campo(s) requieren corrección.`
                      : errors.cart}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="form-label">
                    Nombre
                  </label>
                  <input
                    id="name"
                    className={getInputClassName('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    value={values.name}
                    onChange={(event) =>
                      setValues((currentValues) => ({
                        ...currentValues,
                        name: event.target.value,
                      }))
                    }
                  />
                  {errors.name ? (
                    <p id="name-error" className="mt-1.5 text-sm text-red-600">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="lastName" className="form-label">
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    className={getInputClassName()}
                    value={values.lastName}
                    onChange={(event) =>
                      setValues((currentValues) => ({
                        ...currentValues,
                        lastName: event.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    className={getInputClassName('phone')}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    value={values.phone}
                    onChange={(event) =>
                      setValues((currentValues) => ({
                        ...currentValues,
                        phone: event.target.value,
                      }))
                    }
                  />
                  {errors.phone ? (
                    <p id="phone-error" className="mt-1.5 text-sm text-red-600">
                      {errors.phone}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={getInputClassName('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    value={values.email}
                    onChange={(event) =>
                      setValues((currentValues) => ({
                        ...currentValues,
                        email: event.target.value,
                      }))
                    }
                  />
                  {errors.email ? (
                    <p id="email-error" className="mt-1.5 text-sm text-red-600">
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="repeatEmail" className="form-label">
                    Repetir email
                  </label>
                  <input
                    id="repeatEmail"
                    type="email"
                    className={getInputClassName('repeatEmail')}
                    aria-invalid={Boolean(errors.repeatEmail)}
                    aria-describedby={errors.repeatEmail ? 'repeat-email-error' : undefined}
                    value={values.repeatEmail}
                    onChange={(event) =>
                      setValues((currentValues) => ({
                        ...currentValues,
                        repeatEmail: event.target.value,
                      }))
                    }
                  />
                  {errors.repeatEmail ? (
                    <p id="repeat-email-error" className="mt-1.5 text-sm text-red-600">
                      {errors.repeatEmail}
                    </p>
                  ) : null}
                </div>
              </div>

              {errors.cart ? (
                <div
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {errors.cart}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-slate-500">
                  Al confirmar, se generará la orden con los productos actuales del carrito.
                </p>
                <button type="submit" className="btn-primary sm:min-w-52" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Procesando orden...' : 'Finalizar compra'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="surface-card rounded-3xl border-slate-200/80 lg:sticky lg:top-6">
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <div>
              <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                Resumen
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Tu pedido
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {hasItems
                  ? `${cart.items.length} producto(s) listos para registrarse en la orden.`
                  : 'Tu carrito está vacío.'}
              </p>
            </div>

            {hasItems ? (
              <>
                <ul className="grid gap-3">
                  {cart.items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-950">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-950">
                          $ {currencyFormatter.format(item.price * item.quantity)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                      <span>Productos</span>
                      <span className="font-semibold text-slate-950">{cart.items.length}</span>
                    </div>
                  </div>

                  <div className="brand-highlight-panel rounded-2xl border px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Total
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                      $ {currencyFormatter.format(totalPrice)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <PageState
                  title="Carrito vacío"
                  description="Volvé al catálogo para agregar productos antes de finalizar."
                />
              </div>
            )}

            <Link href="/cart" className="btn-secondary w-full">
              Volver al carrito
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
