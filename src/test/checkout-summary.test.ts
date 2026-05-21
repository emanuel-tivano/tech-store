import { describe, expect, it } from 'vitest';

import {
  CHECKOUT_FREE_SHIPPING_THRESHOLD,
  getCheckoutSummary,
} from '@/features/checkout/summary';
import type { CartLineDTO } from '@/types';

const baseItems: CartLineDTO[] = [
  {
    id: 'prod-1',
    slug: 'monitor-gamer',
    title: 'Monitor Gamer',
    description: 'QHD',
    categoryId: 'monitores',
    image: '/monitor.png',
    price: 220000,
    stock: 3,
    freeShipment: false,
    quantity: 1,
  },
  {
    id: 'prod-2',
    slug: 'mouse-pro',
    title: 'Mouse Pro',
    description: 'Ultraliviano',
    categoryId: 'mouses',
    image: '/mouse.png',
    price: 90000,
    stock: 12,
    freeShipment: false,
    quantity: 2,
  },
];

describe('getCheckoutSummary', () => {
  it('calcula subtotal, envío y total con entrega a domicilio', () => {
    const summary = getCheckoutSummary(baseItems, 'home-delivery');

    expect(summary.subtotal).toBe(400000);
    expect(summary.qualifiesForFreeShipping).toBe(true);
    expect(summary.shippingCost).toBe(0);
    expect(summary.total).toBe(400000);
    expect(summary.totalUnits).toBe(3);
    expect(summary.itemCount).toBe(2);
    expect(summary.limitedStockItems).toHaveLength(1);
  });

  it('cobra envío cuando no aplica bonificación y elige retiro en punto de entrega', () => {
    const summary = getCheckoutSummary(
      [
        {
          ...baseItems[0],
          price: 100000,
          stock: 8,
        },
      ],
      'pickup-point',
    );

    expect(summary.subtotal).toBe(100000);
    expect(summary.qualifiesForFreeShipping).toBe(false);
    expect(summary.shippingCost).toBe(7000);
    expect(summary.total).toBe(107000);
  });

  it('bonifica envío si todos los productos tienen freeShipment aunque no alcancen el umbral', () => {
    const summary = getCheckoutSummary(
      [
        {
          ...baseItems[0],
          price: 80000,
          stock: 8,
          freeShipment: true,
        },
        {
          ...baseItems[1],
          price: 50000,
          quantity: 1,
          freeShipment: true,
        },
      ],
      'home-delivery',
    );

    expect(summary.subtotal).toBeLessThan(CHECKOUT_FREE_SHIPPING_THRESHOLD);
    expect(summary.qualifiesForFreeShipping).toBe(true);
    expect(summary.shippingCost).toBe(0);
  });

  it('mantiene envío pendiente hasta que el usuario elige un método', () => {
    const summary = getCheckoutSummary(
      [
        {
          ...baseItems[0],
          price: 100000,
          stock: 8,
        },
      ],
      '',
    );

    expect(summary.shippingCost).toBe(0);
    expect(summary.total).toBe(100000);
  });
});
