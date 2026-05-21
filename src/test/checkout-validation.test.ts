import { describe, expect, it } from 'vitest';

import { validateCheckoutForm } from '@/features/checkout/validation';

describe('validateCheckoutForm', () => {
  it('valida carrito vacío y campos obligatorios', () => {
    const errors = validateCheckoutForm(
      {
        name: '',
        lastName: '',
        phone: '',
        email: '',
        repeatEmail: '',
      },
      false,
    );

    expect(errors.name).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.cart).toBeTruthy();
  });

  it('detecta emails diferentes', () => {
    const errors = validateCheckoutForm(
      {
        name: 'Tomas',
        lastName: '',
        phone: '1234',
        email: 'uno@mail.com',
        repeatEmail: 'dos@mail.com',
      },
      true,
    );

    expect(errors.repeatEmail).toBe('Los correos electrónicos deben coincidir.');
  });
});
