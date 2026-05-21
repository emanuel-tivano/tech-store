import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

const { createOrderMock, noStoreMock } = vi.hoisted(() => ({
  createOrderMock: vi.fn(),
  noStoreMock: vi.fn(),
}));

vi.mock('next/cache', () => ({
  unstable_noStore: noStoreMock,
}));

vi.mock('@/lib/orders-create', () => ({
  CreateOrderError: class CreateOrderError extends Error {
    constructor(message: string) {
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
        phone: '1234',
        email: 'tomas@example.com',
      },
      items: [{ id: 'prod-1', quantity: 1 }],
    });

    expect(noStoreMock).toHaveBeenCalledTimes(1);
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
      new CreateOrderError('Los datos de la orden no son válidos.'),
    );

    const result = await createOrderAction({
      buyer: {
        name: '',
        phone: '',
        email: 'invalido',
      },
      items: [],
    });

    expect(result).toEqual({
      status: 'error',
      message: 'Los datos de la orden no son válidos.',
    });

    if (result.status === 'error') {
      expectTypeOf(result.message).toEqualTypeOf<string>();
    }
  });

  it('oculta errores inesperados detrás del mensaje estable del checkout', async () => {
    createOrderMock.mockRejectedValue(new Error('db down'));

    const result = await createOrderAction({
      buyer: {
        name: 'Tomás',
        phone: '1234',
        email: 'tomas@example.com',
      },
      items: [{ id: 'prod-1', quantity: 1 }],
    });

    expect(result).toEqual({
      status: 'error',
      message: 'No pudimos crear la orden. Intentá nuevamente en unos instantes.',
    });
  });
});
