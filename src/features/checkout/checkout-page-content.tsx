'use client';

import React from 'react';
import Link from 'next/link';
import { startTransition, useEffect, useState } from 'react';

import { PageState } from '@/components/page-state';
import { TrustSignals } from '@/components/trust-signals';
import { useCart } from '@/context/cart-context';
import { createOrderAction } from '@/features/checkout/actions';
import { formatCheckoutReviewSummary, formatProductCount, pluralize } from '@/lib/copy';

import { deliveryOptions, paymentOptions } from './options';
import { CHECKOUT_FREE_SHIPPING_THRESHOLD, getCheckoutSummary } from './summary';
import {
  clearCheckoutFormSessionStorage,
  readCheckoutFormFromSessionStorage,
  writeCheckoutFormToSessionStorage,
} from './storage';
import {
  normalizePhone,
  type CheckoutFormErrors,
  type CheckoutFormValues,
  validateCheckoutForm,
} from './validation';

type CheckoutStatus = 'idle' | 'loading' | 'success' | 'error';
type CheckoutFieldWithError = Exclude<keyof CheckoutFormErrors, 'cart'>;

interface CheckoutConfirmation {
  orderId: string;
  email: string;
  deliveryMethodLabel: string;
  paymentMethodLabel: string;
}

const initialValues: CheckoutFormValues = {
  fullName: '',
  email: '',
  repeatEmail: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  deliveryMethod: '',
  paymentMethod: '',
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function splitBuyerName(fullName: string) {
  const normalizedFullName = fullName.trim().replace(/\s+/g, ' ');
  const [name, ...lastNameParts] = normalizedFullName.split(' ');

  return {
    name: name ?? '',
    lastName: lastNameParts.join(' ') || undefined,
  };
}

function getStepStyles(status: 'completed' | 'current' | 'upcoming') {
  if (status === 'completed') {
    return {
      container: 'border-emerald-200 bg-emerald-50/80 text-emerald-900',
      badge: 'bg-emerald-600 text-white',
      description: 'text-emerald-800/80',
    };
  }

  if (status === 'current') {
    return {
      container: 'border-slate-950 bg-slate-950 text-white',
      badge: 'bg-white text-slate-950',
      description: 'text-white/70',
    };
  }

  return {
    container: 'border-slate-200 bg-white text-slate-700',
    badge: 'bg-slate-100 text-slate-500',
    description: 'text-slate-500',
  };
}

export function CheckoutPageContent() {
  const { cart, clearCart } = useCart();
  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [confirmation, setConfirmation] = useState<CheckoutConfirmation | null>(null);
  const [isSessionStorageHydrated, setIsSessionStorageHydrated] = useState(false);

  useEffect(() => {
    const storedValues = readCheckoutFormFromSessionStorage();

    startTransition(() => {
      if (storedValues) {
        setValues((currentValues) => ({
          ...currentValues,
          ...storedValues,
        }));
      }

      setIsSessionStorageHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isSessionStorageHydrated || status === 'success') {
      return;
    }

    writeCheckoutFormToSessionStorage(values);
  }, [isSessionStorageHydrated, status, values]);

  const hasItems = cart.items.length > 0;
  const summary = getCheckoutSummary(cart.items, values.deliveryMethod);
  const selectedDeliveryOption = deliveryOptions.find(
    (option) => option.value === values.deliveryMethod,
  );
  const selectedPaymentOption = paymentOptions.find(
    (option) => option.value === values.paymentMethod,
  );
  const progressErrors = validateCheckoutForm(values, true);
  const contactComplete = !progressErrors.fullName && !progressErrors.email && !progressErrors.repeatEmail && !progressErrors.phone;
  const shippingComplete =
    !progressErrors.address &&
    !progressErrors.city &&
    !progressErrors.province &&
    !progressErrors.postalCode &&
    !progressErrors.deliveryMethod;
  const paymentComplete = !progressErrors.paymentMethod;
  const reviewComplete = hasItems && contactComplete && shippingComplete && paymentComplete;
  const formErrorCount = Object.entries(errors).filter(
    ([field, message]) => field !== 'cart' && Boolean(message),
  ).length;

  const steps = [
    {
      title: 'Contacto',
      description: 'Datos para confirmar la orden.',
      status: contactComplete ? 'completed' : 'current',
    },
    {
      title: 'Envío',
      description: 'Dirección y método de entrega.',
      status: contactComplete
        ? shippingComplete
          ? 'completed'
          : 'current'
        : 'upcoming',
    },
    {
      title: 'Pago',
      description: 'Selección simulada para portfolio.',
      status:
        contactComplete && shippingComplete
          ? paymentComplete
            ? 'completed'
            : 'current'
          : 'upcoming',
    },
    {
      title: 'Revisión',
      description: 'Resumen final antes de generar la orden.',
      status: reviewComplete ? 'current' : 'upcoming',
    },
  ] as const;

  function updateField<K extends keyof CheckoutFormValues>(
    field: K,
    value: CheckoutFormValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
      cart: undefined,
    }));

    if (status === 'error') {
      setStatus('idle');
    }
  }

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

    if (status === 'loading') {
      return;
    }

    const nextErrors = validateCheckoutForm(values, hasItems);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus('error');
      return;
    }

    if (!values.deliveryMethod || !values.paymentMethod) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const buyerName = splitBuyerName(values.fullName);
    const result = await createOrderAction({
      buyer: {
        name: buyerName.name,
        lastName: buyerName.lastName,
        phone: normalizePhone(values.phone),
        email: values.email.trim().toLowerCase(),
      },
      shippingAddress: values.address.trim(),
      shippingCity: values.city.trim(),
      shippingProvince: values.province.trim(),
      shippingPostalCode: values.postalCode.trim().toUpperCase(),
      deliveryMethod: values.deliveryMethod,
      paymentMethod: values.paymentMethod,
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    });

    if (result.status === 'success') {
      clearCheckoutFormSessionStorage();
      setConfirmation({
        orderId: result.orderId,
        email: values.email.trim().toLowerCase(),
        deliveryMethodLabel: selectedDeliveryOption?.title ?? 'Método de entrega seleccionado',
        paymentMethodLabel: selectedPaymentOption?.title ?? 'Método de pago seleccionado',
      });
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

  if (status === 'success' && confirmation) {
    return (
      <section className="flex flex-col gap-6 sm:gap-8">
        <div className="surface-card brand-success-panel overflow-hidden rounded-3xl border-slate-200/80 px-5 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Orden confirmada
            </p>
            <PageState
              title="Pedido registrado correctamente"
              description={`La orden ${confirmation.orderId} quedó generada en esta demo de portfolio.`}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Confirmación
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  En una integración real, recibirías el detalle en {confirmation.email}.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Entrega
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {confirmation.deliveryMethodLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Pago
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {confirmation.paymentMethodLabel}. No se procesó un cobro real.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/" className="btn-primary">
                Volver al catálogo
              </Link>
              <Link href="/cart" className="btn-secondary">
                Revisar carrito
              </Link>
            </div>
          </div>
        </div>

        <TrustSignals
          title="Qué mejora esta versión del checkout"
          items={[
            {
              title: 'Datos más completos',
              description: 'El checkout ahora representa contacto, envío, pago y revisión con un flujo más creíble.',
            },
            {
              title: 'Pago honesto',
              description: 'La interfaz aclara que el cobro es simulado para portfolio y evita promesas falsas.',
            },
            {
              title: 'Orden consistente',
              description: 'La creación de orden sigue validando stock y precios en servidor antes de persistir.',
            },
            {
              title: 'Resumen claro',
              description: 'Subtotal, envío y total quedan visibles para revisar el impacto de cada decisión.',
            },
          ]}
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 sm:gap-8">
      <div className="surface-card brand-tint-panel overflow-hidden rounded-3xl border-slate-200/80 px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
                Checkout
              </p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Confirmá tus datos y revisá el pedido
                </h1>
                <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                  Este flujo simula una compra realista para portfolio: contacto, entrega, pago y
                  revisión antes de generar la orden.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Productos
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {summary.totalUnits}
                </p>
                <p className="mt-1 text-sm text-slate-500">Unidades listas para ordenar</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Total actual
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  $ {currencyFormatter.format(summary.total)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Incluye envío cuando el método ya está definido
                </p>
              </div>
            </div>
          </div>

          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => {
              const styles = getStepStyles(step.status);

              return (
                <li
                  key={step.title}
                  className={`rounded-2xl border px-4 py-4 ${styles.container}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${styles.badge}`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className={`mt-1 text-sm leading-6 ${styles.description}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,420px)]">
        <div className="order-2 surface-card rounded-3xl border-slate-200/80 lg:order-1">
          <div className="flex flex-col gap-6 p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-2">
              <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                Información de la orden
              </p>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Contacto, envío y pago
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Los métodos de entrega y pago son simulados para portfolio, pero la orden real
                  sigue validando stock y precios antes de registrarse.
                </p>
              </div>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
              {(formErrorCount > 0 || errors.cart) && status === 'error' ? (
                <div
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  <p className="font-medium text-red-800">
                    Revisá la información antes de confirmar el pedido.
                  </p>
                  <p className="mt-1">
                    {formErrorCount > 0
                      ? `${formErrorCount} ${pluralize(formErrorCount, 'campo')} ${pluralize(formErrorCount, 'requiere', 'requieren')} corrección.`
                      : errors.cart}
                  </p>
                </div>
              ) : null}

              <section className="grid gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Datos de contacto
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Cómo te contactamos
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="form-label">
                      Nombre completo
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      required
                      autoComplete="name"
                      className={getInputClassName('fullName')}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'full-name-error' : undefined}
                      value={values.fullName}
                      onChange={(event) => updateField('fullName', event.target.value)}
                    />
                    {errors.fullName ? (
                      <p id="full-name-error" className="mt-1.5 text-sm text-red-600">
                        {errors.fullName}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      required
                      type="email"
                      autoComplete="email"
                      className={getInputClassName('email')}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      value={values.email}
                      onChange={(event) => updateField('email', event.target.value)}
                    />
                    {errors.email ? (
                      <p id="email-error" className="mt-1.5 text-sm text-red-600">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="repeatEmail" className="form-label">
                      Confirmar email
                    </label>
                    <input
                      id="repeatEmail"
                      name="repeatEmail"
                      required
                      type="email"
                      autoComplete="email"
                      className={getInputClassName('repeatEmail')}
                      aria-invalid={Boolean(errors.repeatEmail)}
                      aria-describedby={errors.repeatEmail ? 'repeat-email-error' : undefined}
                      value={values.repeatEmail}
                      onChange={(event) => updateField('repeatEmail', event.target.value)}
                    />
                    {errors.repeatEmail ? (
                      <p id="repeat-email-error" className="mt-1.5 text-sm text-red-600">
                        {errors.repeatEmail}
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="form-label">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      required
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+54 11 5555 5555"
                      className={getInputClassName('phone')}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'phone-error' : 'phone-help'}
                      value={values.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                    />
                    <p id="phone-help" className="mt-1.5 text-sm text-slate-500">
                      Acepta formatos habituales de Argentina con o sin prefijo país.
                    </p>
                    {errors.phone ? (
                      <p id="phone-error" className="mt-1.5 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 border-t border-slate-200 pt-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Envío
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Dónde y cómo entregarlo
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="form-label">
                      Dirección
                    </label>
                    <input
                      id="address"
                      name="address"
                      required
                      autoComplete="street-address"
                      className={getInputClassName('address')}
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={errors.address ? 'address-error' : undefined}
                      value={values.address}
                      onChange={(event) => updateField('address', event.target.value)}
                    />
                    {errors.address ? (
                      <p id="address-error" className="mt-1.5 text-sm text-red-600">
                        {errors.address}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="city" className="form-label">
                      Ciudad
                    </label>
                    <input
                      id="city"
                      name="city"
                      required
                      autoComplete="address-level2"
                      className={getInputClassName('city')}
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? 'city-error' : undefined}
                      value={values.city}
                      onChange={(event) => updateField('city', event.target.value)}
                    />
                    {errors.city ? (
                      <p id="city-error" className="mt-1.5 text-sm text-red-600">
                        {errors.city}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="province" className="form-label">
                      Provincia
                    </label>
                    <input
                      id="province"
                      name="province"
                      required
                      autoComplete="address-level1"
                      className={getInputClassName('province')}
                      aria-invalid={Boolean(errors.province)}
                      aria-describedby={errors.province ? 'province-error' : undefined}
                      value={values.province}
                      onChange={(event) => updateField('province', event.target.value)}
                    />
                    {errors.province ? (
                      <p id="province-error" className="mt-1.5 text-sm text-red-600">
                        {errors.province}
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="postalCode" className="form-label">
                      Código postal
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      required
                      inputMode="text"
                      autoComplete="postal-code"
                      placeholder="1425 o C1425ABC"
                      className={getInputClassName('postalCode')}
                      aria-invalid={Boolean(errors.postalCode)}
                      aria-describedby={errors.postalCode ? 'postal-code-error' : undefined}
                      value={values.postalCode}
                      onChange={(event) => updateField('postalCode', event.target.value)}
                    />
                    {errors.postalCode ? (
                      <p id="postal-code-error" className="mt-1.5 text-sm text-red-600">
                        {errors.postalCode}
                      </p>
                    ) : null}
                  </div>
                </div>

                <fieldset className="grid gap-3">
                  <legend className="form-label">Método de entrega</legend>
                  <div className="grid gap-3">
                    {deliveryOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`rounded-2xl border px-4 py-4 ${
                          values.deliveryMethod === option.value
                            ? 'border-slate-950 bg-slate-950 text-white'
                            : 'border-slate-200 bg-slate-50/60 text-slate-900'
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value={option.value}
                            checked={values.deliveryMethod === option.value}
                            required
                            className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand-600)]"
                            aria-describedby={errors.deliveryMethod ? 'delivery-method-error' : undefined}
                            onChange={(event) =>
                              updateField('deliveryMethod', event.target.value as CheckoutFormValues['deliveryMethod'])
                            }
                          />
                          <span>
                            <span className="block font-semibold">{option.title}</span>
                            <span
                              className={`mt-1 block text-sm leading-6 ${
                                values.deliveryMethod === option.value
                                  ? 'text-white/70'
                                  : 'text-slate-600'
                              }`}
                            >
                              {option.description}
                            </span>
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.deliveryMethod ? (
                    <p id="delivery-method-error" className="text-sm text-red-600">
                      {errors.deliveryMethod}
                    </p>
                  ) : null}
                </fieldset>
              </section>

              <section className="grid gap-4 border-t border-slate-200 pt-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Pago
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Cómo querés completar la compra
                  </h3>
                </div>

                <fieldset className="grid gap-3">
                  <legend className="form-label">Método de pago</legend>
                  <div className="grid gap-3">
                    {paymentOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`rounded-2xl border px-4 py-4 ${
                          values.paymentMethod === option.value
                            ? 'border-slate-950 bg-slate-950 text-white'
                            : 'border-slate-200 bg-slate-50/60 text-slate-900'
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={option.value}
                            checked={values.paymentMethod === option.value}
                            required
                            className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand-600)]"
                            aria-describedby={errors.paymentMethod ? 'payment-method-error' : undefined}
                            onChange={(event) =>
                              updateField('paymentMethod', event.target.value as CheckoutFormValues['paymentMethod'])
                            }
                          />
                          <span>
                            <span className="block font-semibold">{option.title}</span>
                            <span
                              className={`mt-1 block text-sm leading-6 ${
                                values.paymentMethod === option.value
                                  ? 'text-white/70'
                                  : 'text-slate-600'
                              }`}
                            >
                              {option.description}
                            </span>
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.paymentMethod ? (
                    <p id="payment-method-error" className="text-sm text-red-600">
                      {errors.paymentMethod}
                    </p>
                  ) : null}
                </fieldset>
              </section>

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
                  Al confirmar, se generará la orden y el pago seguirá siendo una simulación de
                  portfolio.
                </p>
                <button
                  type="submit"
                  className="btn-primary sm:min-w-56"
                  disabled={!hasItems || status === 'loading'}
                >
                  {status === 'loading' ? 'Generando orden...' : 'Confirmar pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="order-1 surface-card rounded-3xl border-slate-200/80 lg:order-2 lg:sticky lg:top-6">
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <div>
              <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                Resumen
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Revisá el pedido
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {hasItems
                  ? formatCheckoutReviewSummary(summary.itemCount, summary.totalUnits)
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
                      <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
                        <div>
                          <p className="font-medium text-slate-950">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">Cantidad: {item.quantity}</p>
                          {item.freeShipment ? (
                            <p className="mt-1 text-sm text-emerald-700">Incluye envío gratis</p>
                          ) : null}
                          {item.stock <= 5 ? (
                            <p className="mt-1 text-sm text-amber-700">
                              Stock limitado: quedan {item.stock} unidades.
                            </p>
                          ) : null}
                        </div>
                        <p className="text-sm font-semibold text-slate-950">
                          $ {currencyFormatter.format(item.price * item.quantity)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="grid gap-3">
                  {summary.qualifiesForFreeShipping ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      Envío bonificado por productos con envío gratis o subtotal superior a $
                      {currencyFormatter.format(CHECKOUT_FREE_SHIPPING_THRESHOLD)}.
                    </div>
                  ) : null}

                  {summary.limitedStockItems.length > 0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Hay {formatProductCount(summary.limitedStockItems.length)} con stock limitado
                      en tu pedido.
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-950">
                        $ {currencyFormatter.format(summary.subtotal)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                      <span>Envío</span>
                      <span className="font-semibold text-slate-950">
                        {selectedDeliveryOption
                          ? summary.shippingCost === 0
                            ? 'Gratis'
                            : `$ ${currencyFormatter.format(summary.shippingCost)}`
                          : 'Seleccioná entrega'}
                      </span>
                    </div>
                    {selectedDeliveryOption ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {selectedDeliveryOption.title}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                      <span>Pago</span>
                      <span className="font-semibold text-slate-950">
                        {selectedPaymentOption ? 'Simulado' : 'Seleccioná pago'}
                      </span>
                    </div>
                    {selectedPaymentOption ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {selectedPaymentOption.title}
                      </p>
                    ) : null}
                  </div>

                  <div className="brand-highlight-panel rounded-2xl border px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Total
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                      $ {currencyFormatter.format(summary.total)}
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

      <TrustSignals
        title="Confianza en el checkout"
        items={[
          {
            title: 'Compra simulada segura',
            description: 'Revisá cantidades, stock y total antes de confirmar la orden.',
          },
          {
            title: 'Pago simulado',
            description:
              'Esta etapa representa una compra realista para portfolio, sin prometer una pasarela integrada que no existe.',
          },
          {
            title: 'Envío calculado en checkout',
            description: 'El costo final del envío aparece cuando elegís el método de entrega.',
          },
          {
            title: 'Soporte ante dudas sobre tu compra',
            description: 'La demo mantiene validaciones y contexto suficiente para revisar el pedido con criterio.',
          },
        ]}
      />
    </section>
  );
}
