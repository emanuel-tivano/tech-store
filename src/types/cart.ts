import type { Category } from '@/types/catalog';

export interface CartLineInput {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: Category;
  image: string;
  price: number;
  stock: number;
  freeShipment: boolean;
}

export interface CartLineDTO extends CartLineInput {
  quantity: number;
}

export interface CartState {
  items: CartLineDTO[];
}
