export interface Buyer {
  name: string;
  lastName?: string;
  phone: string;
  email: string;
}

export type DeliveryMethod = 'home-delivery' | 'pickup-point' | 'store-pickup';
export type PaymentMethod = 'credit-card' | 'bank-transfer' | 'cash-on-pickup';

export interface OrderItemInput {
  id: string;
  quantity: number;
}

export interface CreateOrderInput {
  buyer: Buyer;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  items: OrderItemInput[];
}
