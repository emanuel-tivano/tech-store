import type { CheckoutFormValues } from './validation';

import { deliveryOptions, paymentOptions } from './options';

export const CHECKOUT_SESSION_STORAGE_KEY = 'checkout-form';

type PersistedCheckoutValues = Pick<
  CheckoutFormValues,
  | 'fullName'
  | 'email'
  | 'phone'
  | 'address'
  | 'city'
  | 'province'
  | 'postalCode'
  | 'deliveryMethod'
  | 'paymentMethod'
>;

const validDeliveryMethods = deliveryOptions.map((option) => option.value);
const validPaymentMethods = paymentOptions.map((option) => option.value);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string';
}

function isValidDeliveryMethod(
  value: unknown,
): value is PersistedCheckoutValues['deliveryMethod'] {
  return isNonEmptyString(value) && validDeliveryMethods.includes(value as typeof validDeliveryMethods[number]);
}

function isValidPaymentMethod(
  value: unknown,
): value is PersistedCheckoutValues['paymentMethod'] {
  return isNonEmptyString(value) && validPaymentMethods.includes(value as typeof validPaymentMethods[number]);
}

function sanitizePersistedCheckoutValues(
  value: unknown,
): Partial<PersistedCheckoutValues> | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  return {
    fullName: isNonEmptyString(candidate.fullName) ? candidate.fullName : '',
    email: isNonEmptyString(candidate.email) ? candidate.email : '',
    phone: isNonEmptyString(candidate.phone) ? candidate.phone : '',
    address: isNonEmptyString(candidate.address) ? candidate.address : '',
    city: isNonEmptyString(candidate.city) ? candidate.city : '',
    province: isNonEmptyString(candidate.province) ? candidate.province : '',
    postalCode: isNonEmptyString(candidate.postalCode) ? candidate.postalCode : '',
    deliveryMethod: isValidDeliveryMethod(candidate.deliveryMethod)
      ? candidate.deliveryMethod
      : '',
    paymentMethod: isValidPaymentMethod(candidate.paymentMethod)
      ? candidate.paymentMethod
      : '',
  };
}

export function readCheckoutFormFromSessionStorage() {
  try {
    const value = window.sessionStorage.getItem(CHECKOUT_SESSION_STORAGE_KEY);

    if (!value) {
      return null;
    }

    return sanitizePersistedCheckoutValues(JSON.parse(value));
  } catch {
    return null;
  }
}

export function writeCheckoutFormToSessionStorage(values: CheckoutFormValues) {
  const persistedValues: PersistedCheckoutValues = {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    address: values.address,
    city: values.city,
    province: values.province,
    postalCode: values.postalCode,
    deliveryMethod: values.deliveryMethod,
    paymentMethod: values.paymentMethod,
  };

  try {
    window.sessionStorage.setItem(
      CHECKOUT_SESSION_STORAGE_KEY,
      JSON.stringify(persistedValues),
    );
  } catch {}
}

export function clearCheckoutFormSessionStorage() {
  try {
    window.sessionStorage.removeItem(CHECKOUT_SESSION_STORAGE_KEY);
  } catch {}
}
