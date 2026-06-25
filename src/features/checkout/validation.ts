import { z } from 'zod';

import {
  customerEmailSchema,
  customerFullNameSchema,
  customerPhoneSchema,
  deliveryMethodSchema,
  normalizePhone,
  normalizePostalCode,
  paymentMethodSchema,
  shippingAddressSchema,
  shippingCitySchema,
  shippingPostalCodeSchema,
  shippingProvinceSchema,
} from '@/lib/order-create-schema';
import type { DeliveryMethod, PaymentMethod } from '@/types';

export interface CheckoutFormValues {
  fullName: string;
  email: string;
  repeatEmail: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryMethod: DeliveryMethod | '';
  paymentMethod: PaymentMethod | '';
}

export interface CheckoutFormErrors {
  fullName?: string;
  email?: string;
  repeatEmail?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  deliveryMethod?: string;
  paymentMethod?: string;
  cart?: string;
}

function getValidationMessage(schema: z.ZodType, value: unknown) {
  const result = schema.safeParse(value);

  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateCheckoutForm(
  values: CheckoutFormValues,
  hasItems: boolean,
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {
    fullName: getValidationMessage(customerFullNameSchema, values.fullName),
    email: getValidationMessage(customerEmailSchema, values.email),
    phone: getValidationMessage(customerPhoneSchema, values.phone),
    address: getValidationMessage(shippingAddressSchema, values.address),
    city: getValidationMessage(shippingCitySchema, values.city),
    province: getValidationMessage(shippingProvinceSchema, values.province),
    postalCode: getValidationMessage(shippingPostalCodeSchema, values.postalCode),
    deliveryMethod: getValidationMessage(deliveryMethodSchema, values.deliveryMethod),
    paymentMethod: getValidationMessage(paymentMethodSchema, values.paymentMethod),
  };
  const email = values.email.trim().toLowerCase();
  const repeatEmail = values.repeatEmail.trim().toLowerCase();

  if (!repeatEmail) {
    errors.repeatEmail = 'Confirmá tu email.';
  } else if (repeatEmail !== email) {
    errors.repeatEmail = 'Los correos electrónicos deben coincidir.';
  }

  if (!hasItems) {
    errors.cart = 'No podés generar una orden con el carrito vacío.';
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  ) as CheckoutFormErrors;
}

export { normalizePhone, normalizePostalCode };
