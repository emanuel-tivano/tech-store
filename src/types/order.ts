export interface Buyer {
  name: string;
  lastName?: string;
  phone: string;
  email: string;
}

export interface OrderItemInput {
  id: string;
  quantity: number;
}

export interface CreateOrderInput {
  buyer: Buyer;
  items: OrderItemInput[];
}
