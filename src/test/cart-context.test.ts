import { describe, expect, it } from 'vitest';

import { cartReducer } from '@/context/cart-context';
import type { CartLineInput, CartState } from '@/types';

const product: CartLineInput = {
  id: 'abc123',
  slug: 'mouse-gamer',
  title: 'Mouse gamer',
  description: 'Mouse ergonómico',
  categoryId: 'mouses',
  image: '/mouse.png',
  price: 100,
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

  it('no supera el stock acumulado del producto', () => {
    const nextState = cartReducer(
      {
        items: [{ ...product, quantity: 7 }],
      },
      {
        type: 'ADD_ITEM',
        payload: { product, quantity: 3 },
      },
    );

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0]).toMatchObject({
      id: product.id,
      quantity: product.stock,
    });
  });

  it('actualiza cantidad manualmente y respeta stock', () => {
    const nextState = cartReducer(
      { items: [{ ...product, quantity: 2 }] },
      {
        type: 'SET_ITEM_QUANTITY',
        payload: { productId: product.id, quantity: 20 },
      },
    );

    expect(nextState.items[0]).toMatchObject({
      id: product.id,
      quantity: product.stock,
    });
  });

  it('elimina el item si la cantidad manual llega a cero', () => {
    const nextState = cartReducer(
      { items: [{ ...product, quantity: 2 }] },
      {
        type: 'SET_ITEM_QUANTITY',
        payload: { productId: product.id, quantity: 0 },
      },
    );

    expect(nextState.items).toHaveLength(0);
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
