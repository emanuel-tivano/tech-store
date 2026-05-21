import { describe, expect, it } from 'vitest';

import { cartReducer } from '@/context/cart-context';
import type { CartState, Product } from '@/types';

const product: Product = {
  id: 'abc123',
  title: 'Mouse gamer',
  description: 'Mouse ergonómico',
  categoryId: 'mouses',
  image: '/mouse.png',
  price: 100,
  rating: 4.5,
  opinions: 15,
  qtySold: 20,
  stock: 8,
  freeShipment: true,
};

const initialState: CartState = { items: [] };

describe('cartReducer', () => {
  it('agrega un item al carrito', () => {
    const nextState = cartReducer(initialState, {
      type: 'ADD_ITEM',
      payload: { product, quantity: 2 },
    });

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0]?.quantity).toBe(2);
  });

  it('acumula cantidad cuando el producto ya existe', () => {
    const nextState = cartReducer(
      {
        items: [{ ...product, quantity: 1 }],
      },
      {
        type: 'ADD_ITEM',
        payload: { product, quantity: 3 },
      },
    );

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0]).toMatchObject({
      id: product.id,
      quantity: 4,
    });
  });

  it('elimina un item del carrito', () => {
    const nextState = cartReducer(
      { items: [{ ...product, quantity: 1 }] },
      {
        type: 'REMOVE_ITEM',
        payload: { productId: product.id },
      },
    );

    expect(nextState.items).toHaveLength(0);
  });

  it('vacía el carrito', () => {
    const nextState = cartReducer(
      { items: [{ ...product, quantity: 1 }] },
      { type: 'CLEAR_CART' },
    );

    expect(nextState).toEqual(initialState);
  });

  it('hidrata el estado completo desde storage', () => {
    const hydratedState: CartState = {
      items: [{ ...product, quantity: 5 }],
    };

    const nextState = cartReducer(initialState, {
      type: 'HYDRATE',
      payload: hydratedState,
    });

    expect(nextState).toEqual(hydratedState);
  });
});
