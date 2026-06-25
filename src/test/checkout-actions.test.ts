import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

const { createOrderMock, noStoreMock, revalidateCatalogDataMock } = vi.hoisted(() => ({
  createOrderMock: vi.fn(),
  noStoreMock: vi.fn(),
  revalidateCatalogDataMock: vi.fn(),
}));

vi.mock('next/cache', () => ({
  unstable_noStore: noStoreMock,
}));

vi.mock('@/lib/server-cache', () => ({
  revalidateCatalogData: revalidateCatalogDataMock,
}));

vi.mock('@/lib/orders-create', () => ({
  CreateOrderError: class CreateOrderError extends Error {
    constructor(
      public readonly code: string,
      message = 'Revisá los datos de contacto y entrega ingresados.',
    ) {
      super(message);
      this.name = 'CreateOrderError';
    }
  },
  createOrder: createOrderMock,
}));

import { createOrderAction, type CreateOrderActionResult } from '@/features/checkout/actions';
import { CreateOrderError } from '@/lib/orders-create';

describe('createOrderAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve un resultado exitoso tipado cuando la orden se crea', async () => {
    createOrderMock.mockResolvedValue({ id: 'order-123' });

    const result = await createOrderAction({
      buyer: {
        name: 'Tomás',
        phone: '541155555555',
        email: 'tomas@example.com',
      },
      shippingAddress: 'Av. Siempre Viva 123',
      shippingCity: 'CABA',
      shippingProvince: 'Buenos Aires',
      shippingPostalCode: '1425',
      deliveryMethod: 'home-delivery',
      paymentMethod: 'credit-card',
      items: [{ id: 'prod-1', quantity: 1 }],
    });

    expect(noStoreMock).toHaveBeenCalledTimes(1);
    expect(revalidateCatalogDataMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: 'success',
      orderId: 'order-123',
    });

    expectTypeOf(result).toEqualTypeOf<CreateOrderActionResult>();

    if (result.status === 'success') {
      expectTypeOf(result.orderId).toEqualTypeOf<string>();
    }
  });

  it('expone errores de validación conocidos como resultado tipado', async () => {
    createOrderMock.mockRejectedValue(
      new CreateOrderError(
        'INVALID_INPUT',
        'Revisá los datos de contacto y entrega ingresados.',
      ),
    );

    const result = await createOrderAction({
      buyer: {
        name: '',
        phone: '',
        email: 'invalido',
      },
      shippingAddress: '',
      shippingCity: '',
      shippingProvince: '',
      shippingPostalCode: '',
      deliveryMethod: 'home-delivery',
      paymentMethod: 'credit-card',
      items: [],
    });

    expect(result).toEqual({
      status: 'error',
      code: 'INVALID_INPUT',
      message: 'Revisá los datos de contacto y entrega ingresados.',
    });
    expect(revalidateCatalogDataMock).not.toHaveBeenCalled();

    if (result.status === 'error') {
      expectTypeOf(result.message).toEqualTypeOf<string>();
    }
  });

  it('oculta errores inesperados detrás del mensaje estable del checkout', async () => {
    createOrderMock.mockRejectedValue(new Error('db down'));

    const result = await createOrderAction({
      buyer: {
        name: 'Tomás',
        phone: '541155555555',
        email: 'tomas@example.com',
      },
      shippingAddress: 'Av. Siempre Viva 123',
      shippingCity: 'CABA',
      shippingProvince: 'Buenos Aires',
      shippingPostalCode: '1425',
      deliveryMethod: 'home-delivery',
      paymentMethod: 'credit-card',
      items: [{ id: 'prod-1', quantity: 1 }],
    });

    expect(result).toEqual({
      status: 'error',
      code: 'UNEXPECTED_ERROR',
      message:
        'No pudimos crear la orden por un problema temporal. Intentá nuevamente en unos instantes.',
    });
    expect(revalidateCatalogDataMock).not.toHaveBeenCalled();
  });
});
