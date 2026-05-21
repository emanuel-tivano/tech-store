import 'server-only';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import {
  type CreateOrderInput,
  createOrderInputSchema,
} from '@/lib/order-create-schema';

export class CreateOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateOrderError';
  }
}

function getCustomerName(buyer: CreateOrderInput['buyer']): string {
  return [buyer.name, buyer.lastName].filter(Boolean).join(' ');
}

export async function createOrder(input: unknown): Promise<{ id: string }> {
  const parsedInput = createOrderInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new CreateOrderError('Los datos de la orden no son válidos.');
  }

  const { buyer, items } = parsedInput.data;
  const productIds = [...new Set(items.map((item) => item.id))];

  if (productIds.length !== items.length) {
    throw new CreateOrderError('La orden contiene productos duplicados.');
  }

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isActive: true,
      },
      select: {
        id: true,
        price: true,
        stock: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new CreateOrderError('Uno o más productos no están disponibles.');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    let total = new Prisma.Decimal(0);

    const orderItems = items.map((item) => {
      const product = productsById.get(item.id);

      if (!product) {
        throw new CreateOrderError('Uno o más productos no están disponibles.');
      }

      if (product.stock < item.quantity) {
        throw new CreateOrderError('No hay stock suficiente para uno o más productos.');
      }

      const subtotal = product.price.mul(item.quantity);
      total = total.add(subtotal);

      return {
        productId: item.id,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      };
    });

    for (const item of items) {
      const updateResult = await tx.product.updateMany({
        where: {
          id: item.id,
          isActive: true,
          stock: {
            gte: item.quantity,
          },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      if (updateResult.count !== 1) {
        throw new CreateOrderError('No hay stock suficiente para uno o más productos.');
      }
    }

    return tx.order.create({
      data: {
        customerName: getCustomerName(buyer),
        customerEmail: buyer.email,
        customerPhone: buyer.phone,
        total,
        items: {
          create: orderItems,
        },
      },
      select: {
        id: true,
      },
    });
  });
}
