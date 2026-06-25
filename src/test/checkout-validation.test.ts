import { describe, expect, it } from 'vitest';

import { normalizePhone, validateCheckoutForm } from '@/features/checkout/validation';
import { createOrderInputSchema } from '@/lib/order-create-schema';

const validValues = {
  fullName: 'Tomás Ibarra',
  email: 'tomas@example.com',
  repeatEmail: 'tomas@example.com',
  phone: '+54 11 5555 5555',
  address: 'Av. Cabildo 1234',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  postalCode: '1425',
  deliveryMethod: 'home-delivery' as const,
  paymentMethod: 'credit-card' as const,
};

describe('validateCheckoutForm', () => {
  it('valida carrito vacío y campos obligatorios', () => {
    const errors = validateCheckoutForm(
      {
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
      },
      false,
    );

    expect(errors.fullName).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.repeatEmail).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.address).toBeTruthy();
    expect(errors.city).toBeTruthy();
    expect(errors.province).toBeTruthy();
    expect(errors.postalCode).toBeTruthy();
    expect(errors.deliveryMethod).toBeTruthy();
    expect(errors.paymentMethod).toBeTruthy();
    expect(errors.cart).toBeTruthy();
  });

  it('detecta email inválido y correos diferentes', () => {
    const errors = validateCheckoutForm(
      {
        ...validValues,
        email: 'correo-invalido',
        repeatEmail: 'otro@mail.com',
      },
      true,
    );

    expect(errors.email).toBe('Ingresá un email válido.');
    expect(errors.repeatEmail).toBe('Los correos electrónicos deben coincidir.');
  });

  it('detecta teléfono inválido para Argentina', () => {
    const errors = validateCheckoutForm(
      {
        ...validValues,
        phone: '123',
      },
      true,
    );

    expect(errors.phone).toBe('Ingresá un teléfono válido de Argentina.');
  });

  it('acepta datos válidos y normaliza teléfono con formato visual', () => {
    const errors = validateCheckoutForm(validValues, true);

    expect(errors).toEqual({});
    expect(normalizePhone('+54 11 5555 5555')).toBe('541155555555');
  });

  it('mantiene las reglas compartidas alineadas con el schema del servidor', () => {
    const result = createOrderInputSchema.safeParse({
      buyer: {
        name: 'Tomás',
        lastName: 'Ibarra',
        phone: validValues.phone,
        email: validValues.email,
      },
      shippingAddress: validValues.address,
      shippingCity: validValues.city,
      shippingProvince: validValues.province,
      shippingPostalCode: validValues.postalCode,
      deliveryMethod: validValues.deliveryMethod,
      paymentMethod: validValues.paymentMethod,
      items: [{ id: 'prod-1', quantity: 1 }],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.buyer.phone).toBe('541155555555');
      expect(result.data.buyer.email).toBe('tomas@example.com');
      expect(result.data.shippingPostalCode).toBe('1425');
    }
  });
});
