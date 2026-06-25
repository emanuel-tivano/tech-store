import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

import { createOrder } from '@/lib/orders-create';

const validBuyer = {
  name: 'Tomás',
  lastName: 'Ibarra',
  phone: '541155555555',
  email: 'tomas@example.com',
};

describe('createOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        product: {
          findMany: vi.fn(),
          updateMany: vi.fn(),
        },
        order: {
          create: vi.fn(),
        },
      }),
    );
  });

  it('rechaza entradas inválidas antes de consultar Prisma', async () => {
    await expect(
      createOrder({
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
      }),
    ).rejects.toMatchObject({
      code: 'EMPTY_CART',
      message: 'No podés generar una orden con el carrito vacío.',
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rechaza datos inválidos del cliente antes de consultar Prisma', async () => {
    await expect(
      createOrder({
        buyer: {
          name: 'T',
          phone: '1234',
          email: 'invalido',
        },
        shippingAddress: 'A',
        shippingCity: '',
        shippingProvince: '',
        shippingPostalCode: 'ABC',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
        items: [{ id: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      message: 'Revisá los datos de contacto y entrega ingresados.',
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rechaza cantidades inválidas antes de consultar Prisma', async () => {
    await expect(
      createOrder({
        buyer: validBuyer,
        shippingAddress: 'Av. Siempre Viva 123',
        shippingCity: 'CABA',
        shippingProvince: 'Buenos Aires',
        shippingPostalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
        items: [{ id: 'prod-1', quantity: 0 }],
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_QUANTITY',
      message: 'La cantidad de cada producto debe ser un número entero mayor a cero.',
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rechaza productos duplicados antes de consultar Prisma', async () => {
    await expect(
      createOrder({
        buyer: validBuyer,
        shippingAddress: 'Av. Siempre Viva 123',
        shippingCity: 'CABA',
        shippingProvince: 'Buenos Aires',
        shippingPostalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
        items: [
          { id: 'prod-1', quantity: 1 },
          { id: 'prod-1', quantity: 2 },
        ],
      }),
    ).rejects.toMatchObject({
      code: 'DUPLICATE_PRODUCT',
      message: 'La orden contiene productos duplicados.',
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rechaza órdenes con productos faltantes o inactivos', async () => {
    const tx = {
      product: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'prod-1',
            price: new Prisma.Decimal('1250.50'),
            stock: 10,
            isActive: true,
          },
        ]),
        updateMany: vi.fn(),
      },
      order: {
        create: vi.fn(),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
      createOrder({
        buyer: validBuyer,
        shippingAddress: 'Av. Siempre Viva 123',
        shippingCity: 'CABA',
        shippingProvince: 'Buenos Aires',
        shippingPostalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
        items: [
          { id: 'prod-1', quantity: 1 },
          { id: 'prod-2', quantity: 2 },
        ],
      }),
    ).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Uno o más productos ya no existen. Actualizá el carrito e intentá nuevamente.',
    });

    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('rechaza productos inactivos', async () => {
    const tx = {
      product: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'prod-1',
            price: new Prisma.Decimal('1250.50'),
            stock: 10,
            isActive: false,
          },
        ]),
        updateMany: vi.fn(),
      },
      order: {
        create: vi.fn(),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
      createOrder({
        buyer: validBuyer,
        shippingAddress: 'Av. Siempre Viva 123',
        shippingCity: 'CABA',
        shippingProvince: 'Buenos Aires',
        shippingPostalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
        items: [{ id: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toMatchObject({
      code: 'PRODUCT_INACTIVE',
      message:
        'Uno o más productos ya no están disponibles para la venta. Quitalos del carrito e intentá nuevamente.',
    });

    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('rechaza órdenes con stock insuficiente antes de persistir la orden', async () => {
    const tx = {
      product: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'prod-1',
            price: new Prisma.Decimal('1250.50'),
            stock: 1,
            isActive: true,
          },
        ]),
        updateMany: vi.fn(),
      },
      order: {
        create: vi.fn(),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
      createOrder({
        buyer: validBuyer,
        shippingAddress: 'Av. Siempre Viva 123',
        shippingCity: 'CABA',
        shippingProvince: 'Buenos Aires',
        shippingPostalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
        items: [{ id: 'prod-1', quantity: 2 }],
      }),
    ).rejects.toMatchObject({
      code: 'INSUFFICIENT_STOCK',
      message:
        'No hay stock suficiente para uno o más productos. Revisá las cantidades del carrito.',
    });

    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('revierte la transacción si el decremento atómico falla durante la compra', async () => {
    const tx = {
      product: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'prod-1',
            price: new Prisma.Decimal('1250.50'),
            stock: 4,
            isActive: true,
          },
        ]),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      order: {
        create: vi.fn(),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(
      createOrder({
        buyer: validBuyer,
        shippingAddress: 'Av. Siempre Viva 123',
        shippingCity: 'CABA',
        shippingProvince: 'Buenos Aires',
        shippingPostalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
        items: [{ id: 'prod-1', quantity: 2 }],
      }),
    ).rejects.toMatchObject({
      code: 'INSUFFICIENT_STOCK',
      message:
        'No hay stock suficiente para uno o más productos. Revisá las cantidades del carrito.',
    });

    expect(tx.product.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('crea la orden y decrementa stock dentro de la transacción', async () => {
    const tx = {
      product: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'prod-1',
            price: new Prisma.Decimal('1250.50'),
            stock: 10,
            isActive: true,
          },
          {
            id: 'prod-2',
            price: new Prisma.Decimal('99.99'),
            stock: 8,
            isActive: true,
          },
        ]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        create: vi.fn().mockResolvedValue({
          id: 'order-123',
        }),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await createOrder({
      buyer: validBuyer,
      shippingAddress: 'Av. Siempre Viva 123',
      shippingCity: 'CABA',
      shippingProvince: 'Buenos Aires',
      shippingPostalCode: '1425',
      deliveryMethod: 'home-delivery',
      paymentMethod: 'credit-card',
      items: [
        { id: 'prod-1', quantity: 2 },
        { id: 'prod-2', quantity: 3 },
      ],
    });

    expect(result).toEqual({ id: 'order-123' });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.product.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ['prod-1', 'prod-2'],
        },
      },
      select: {
        id: true,
        isActive: true,
        price: true,
        stock: true,
      },
    });

    expect(tx.product.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: 'prod-1',
        isActive: true,
        stock: {
          gte: 2,
        },
      },
      data: {
        stock: {
          decrement: 2,
        },
      },
    });
    expect(tx.product.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'prod-2',
        isActive: true,
        stock: {
          gte: 3,
        },
      },
      data: {
        stock: {
          decrement: 3,
        },
      },
    });

    expect(tx.order.create).toHaveBeenCalledTimes(1);

    const createInput = tx.order.create.mock.calls[0]?.[0];

    expect(createInput).toMatchObject({
      data: {
        customerName: 'Tomás Ibarra',
        customerEmail: 'tomas@example.com',
        customerPhone: '541155555555',
        shippingAddress: 'Av. Siempre Viva 123',
        shippingCity: 'CABA',
        shippingProvince: 'Buenos Aires',
        shippingPostalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
      },
      select: {
        id: true,
      },
    });

    const orderData = createInput?.data as {
      total: Prisma.Decimal;
      items: {
        create: Array<{
          productId: string;
          quantity: number;
          unitPrice: Prisma.Decimal;
          subtotal: Prisma.Decimal;
        }>;
      };
    };

    expect(orderData.total.toString()).toBe('2800.97');
    expect(orderData.items.create).toHaveLength(2);
    expect(orderData.items.create[0]).toMatchObject({
      productId: 'prod-1',
      quantity: 2,
    });
    expect(orderData.items.create[0]?.unitPrice.toString()).toBe('1250.5');
    expect(orderData.items.create[0]?.subtotal.toString()).toBe('2501');
    expect(orderData.items.create[1]).toMatchObject({
      productId: 'prod-2',
      quantity: 3,
    });
    expect(orderData.items.create[1]?.unitPrice.toString()).toBe('99.99');
    expect(orderData.items.create[1]?.subtotal.toString()).toBe('299.97');
  });
});
