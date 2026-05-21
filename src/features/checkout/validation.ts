export interface CheckoutFormValues {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  repeatEmail: string;
}

export interface CheckoutFormErrors {
  name?: string;
  phone?: string;
  email?: string;
  repeatEmail?: string;
  cart?: string;
}

export function validateCheckoutForm(
  values: CheckoutFormValues,
  hasItems: boolean,
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'El nombre es obligatorio.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio.';
  }

  if (!values.email.trim()) {
    errors.email = 'El email es obligatorio.';
  }

  if (values.email.trim() && values.repeatEmail.trim() !== values.email.trim()) {
    errors.repeatEmail = 'Los correos electrónicos deben coincidir.';
  }

  if (!hasItems) {
    errors.cart = 'No podés generar una orden con el carrito vacío.';
  }

  return errors;
}
