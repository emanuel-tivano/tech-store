import 'server-only';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import {
  type CreateOrderInput,
  createOrderInputSchema,
} from '@/lib/order-create-schema';
import {
  CREATE_ORDER_ERROR_MESSAGES,
  type CreateOrderErrorCode,
} from '@/lib/order-errors';

export class CreateOrderError extends Error {
  constructor(
    public readonly code: CreateOrderErrorCode,
    message = CREATE_ORDER_ERROR_MESSAGES[code],
  ) {
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
    const hasEmptyCart = parsedInput.error.issues.some(
      (issue) => issue.path[0] === 'items' && issue.path.length === 1,
    );
    const hasInvalidQuantity = parsedInput.error.issues.some(
      (issue) => issue.path[0] === 'items' && issue.path[2] === 'quantity',
    );

    if (hasEmptyCart) {
      throw new CreateOrderError('EMPTY_CART');
    }

    if (hasInvalidQuantity) {
      throw new CreateOrderError('INVALID_QUANTITY');
    }

    throw new CreateOrderError('INVALID_INPUT');
  }

  const {
    buyer,
    deliveryMethod,
    items,
    paymentMethod,
    shippingAddress,
    shippingCity,
    shippingPostalCode,
    shippingProvince,
  } = parsedInput.data;
  const productIds = [...new Set(items.map((item) => item.id))];

  if (productIds.length !== items.length) {
    throw new CreateOrderError('DUPLICATE_PRODUCT');
  }

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        isActive: true,
        price: true,
        stock: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new CreateOrderError('PRODUCT_NOT_FOUND');
    }

    if (products.some((product) => !product.isActive)) {
      throw new CreateOrderError('PRODUCT_INACTIVE');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    let total = new Prisma.Decimal(0);

    const orderItems = items.map((item) => {
      const product = productsById.get(item.id);

      if (!product) {
        throw new CreateOrderError('PRODUCT_NOT_FOUND');
      }

      if (product.stock < item.quantity) {
        throw new CreateOrderError('INSUFFICIENT_STOCK');
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
        throw new CreateOrderError('INSUFFICIENT_STOCK');
      }
    }

    return tx.order.create({
      data: {
        customerName: getCustomerName(buyer),
        customerEmail: buyer.email,
        customerPhone: buyer.phone,
        shippingAddress,
        shippingCity,
        shippingProvince,
        shippingPostalCode,
        deliveryMethod,
        paymentMethod,
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
