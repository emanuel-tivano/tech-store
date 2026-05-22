import type { CartLineDTO, DeliveryMethod } from '@/types';

export const CHECKOUT_FREE_SHIPPING_THRESHOLD = 350000;

const DELIVERY_COSTS: Record<DeliveryMethod, number> = {
  'home-delivery': 12000,
  'pickup-point': 7000,
  'store-pickup': 0,
};

export interface CheckoutSummary {
  subtotal: number;
  shippingCost: number;
  total: number;
  qualifiesForFreeShipping: boolean;
  itemCount: number;
  totalUnits: number;
  limitedStockItems: CartLineDTO[];
}

export function getCheckoutSummary(
  items: CartLineDTO[],
  deliveryMethod: DeliveryMethod | '',
): CheckoutSummary {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.length;
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0);
  const limitedStockItems = items.filter((item) => item.stock <= 5);
  const everyItemHasFreeShipping = itemCount > 0 && items.every((item) => item.freeShipment);
  const qualifiesForFreeShipping =
    subtotal >= CHECKOUT_FREE_SHIPPING_THRESHOLD || everyItemHasFreeShipping;
  const baseShippingCost = deliveryMethod ? DELIVERY_COSTS[deliveryMethod] : 0;
  const shippingCost = deliveryMethod && !qualifiesForFreeShipping ? baseShippingCost : 0;

  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    qualifiesForFreeShipping,
    itemCount,
    totalUnits,
    limitedStockItems,
  };
}
