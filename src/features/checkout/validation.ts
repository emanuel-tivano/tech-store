export type DeliveryMethod = 'home-delivery' | 'pickup-point' | 'store-pickup';
export type PaymentMethod = 'credit-card' | 'bank-transfer' | 'cash-on-pickup';

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const argentinaPhonePattern = /^(?:54)?\d{10,13}$/;
const argentinaPostalCodePattern = /^(?:\d{4}|[A-Z]\d{4}[A-Z]{3})$/;

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

export function normalizePostalCode(postalCode: string) {
  return postalCode.trim().toUpperCase();
}

export function validateCheckoutForm(
  values: CheckoutFormValues,
  hasItems: boolean,
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};
  const fullName = values.fullName.trim();
  const email = values.email.trim().toLowerCase();
  const repeatEmail = values.repeatEmail.trim().toLowerCase();
  const phone = normalizePhone(values.phone);
  const address = values.address.trim();
  const city = values.city.trim();
  const province = values.province.trim();
  const postalCode = normalizePostalCode(values.postalCode);

  if (fullName.length < 3) {
    errors.fullName = 'Ingresá un nombre completo válido.';
  }

  if (!email) {
    errors.email = 'El email es obligatorio.';
  } else if (!emailPattern.test(email)) {
    errors.email = 'Ingresá un email válido.';
  }

  if (!repeatEmail) {
    errors.repeatEmail = 'Confirmá tu email.';
  } else if (repeatEmail !== email) {
    errors.repeatEmail = 'Los correos electrónicos deben coincidir.';
  }

  if (!phone) {
    errors.phone = 'El teléfono es obligatorio.';
  } else if (!argentinaPhonePattern.test(phone)) {
    errors.phone = 'Ingresá un teléfono válido de Argentina.';
  }

  if (address.length < 5) {
    errors.address = 'Ingresá una dirección válida.';
  }

  if (city.length < 2) {
    errors.city = 'Ingresá una ciudad válida.';
  }

  if (province.length < 2) {
    errors.province = 'Ingresá una provincia válida.';
  }

  if (!postalCode) {
    errors.postalCode = 'El código postal es obligatorio.';
  } else if (!argentinaPostalCodePattern.test(postalCode)) {
    errors.postalCode = 'Ingresá un código postal argentino válido.';
  }

  if (!values.deliveryMethod) {
    errors.deliveryMethod = 'Seleccioná un método de entrega.';
  }

  if (!values.paymentMethod) {
    errors.paymentMethod = 'Seleccioná un método de pago.';
  }

  if (!hasItems) {
    errors.cart = 'No podés generar una orden con el carrito vacío.';
  }

  return errors;
}
