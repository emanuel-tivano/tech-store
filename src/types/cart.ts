import type { Product } from '@/types/catalog';

export interface CartItem extends Product {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
