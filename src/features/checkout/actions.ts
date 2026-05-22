'use server';

import { unstable_noStore as noStore } from 'next/cache';

import { CreateOrderError, createOrder } from '@/lib/orders-create';
import { revalidateCatalogData } from '@/lib/server-cache';
import type { CreateOrderInput } from '@/types';

export type CreateOrderActionResult =
  | { status: 'success'; orderId: string }
  | { status: 'error'; message: string };

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
        message: error.message,
      };
    }

    return {
      status: 'error',
      message: 'No pudimos crear la orden. Intentá nuevamente en unos instantes.',
    };
  }
}
