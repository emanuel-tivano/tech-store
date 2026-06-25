'use server';

import { unstable_noStore as noStore } from 'next/cache';

import {
  CREATE_ORDER_ERROR_MESSAGES,
  type CreateOrderErrorCode,
} from '@/lib/order-errors';
import { CreateOrderError, createOrder } from '@/lib/orders-create';
import { revalidateCatalogData } from '@/lib/server-cache';
import type { CreateOrderInput } from '@/types';

export type CreateOrderActionResult =
  | { status: 'success'; orderId: string }
  | { status: 'error'; code: CreateOrderErrorCode; message: string };

export async function createOrderAction(
  input: CreateOrderInput,
): Promise<CreateOrderActionResult> {
  noStore();

  try {
    const order = await createOrder(input);
    revalidateCatalogData();

    return {
      status: 'success',
      orderId: order.id,
    };
  } catch (error) {
    if (error instanceof CreateOrderError) {
      return {
        status: 'error',
        code: error.code,
        message: error.message,
      };
    }

    return {
      status: 'error',
      code: 'UNEXPECTED_ERROR',
      message: CREATE_ORDER_ERROR_MESSAGES.UNEXPECTED_ERROR,
    };
  }
}
