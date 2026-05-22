import React, { useLayoutEffect, useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CartProvider, useCart } from '@/context/cart-context';
import type { CartLineInput, CartState } from '@/types';

const storedCart: CartState = {
  items: [
    {
      id: 'mouse-1',
      slug: 'mouse-gamer',
      title: 'Mouse gamer',
      description: 'Mouse ergonómico',
      categoryId: 'mouses',
      image: '/mouse.png',
      price: 100,
      stock: 8,
      freeShipment: true,
      quantity: 3,
    },
  ],
};

const product: CartLineInput = {
  id: 'mouse-1',
  slug: 'mouse-gamer',
  title: 'Mouse gamer',
  description: 'Mouse ergonómico',
  categoryId: 'mouses',
  image: '/mouse.png',
  price: 100,
  stock: 8,
  freeShipment: true,
};

function CartSnapshot() {
  const { cart } = useCart();

  return <span>{cart.items[0]?.quantity ?? 0}</span>;
}

function AddItemBeforeHydration() {
  const { addItem, cart } = useCart();
  const hasAddedRef = useRef(false);

  useLayoutEffect(() => {
    if (hasAddedRef.current) {
      return;
    }

    hasAddedRef.current = true;
    addItem(product, 1);
  }, [addItem]);

  return <span>{cart.items[0]?.quantity ?? 0}</span>;
}

describe('CartProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('hidrata desde localStorage antes de volver a persistir el carrito', async () => {
    window.localStorage.setItem('perifericos-cart', JSON.stringify(storedCart));

    render(
      <CartProvider>
        <CartSnapshot />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    expect(window.localStorage.getItem('perifericos-cart')).toBe(JSON.stringify(storedCart));
  });

  it('persiste un carrito vacío cuando localStorage no tiene datos previos', async () => {
    render(
      <CartProvider>
        <CartSnapshot />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    expect(window.localStorage.getItem('perifericos-cart')).toBe(JSON.stringify({ items: [] }));
  });

  it('recupera estado vacío cuando localStorage contiene JSON inválido', async () => {
    window.localStorage.setItem('perifericos-cart', '{broken-json');

    render(
      <CartProvider>
        <CartSnapshot />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    expect(window.localStorage.getItem('perifericos-cart')).toBe(JSON.stringify({ items: [] }));
  });

  it('fusiona la hidratacion con cambios hechos en cliente antes de que termine el efecto', async () => {
    window.localStorage.setItem('perifericos-cart', JSON.stringify(storedCart));

    render(
      <CartProvider>
        <AddItemBeforeHydration />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    expect(window.localStorage.getItem('perifericos-cart')).toBe(
      JSON.stringify({
        items: [{ ...product, quantity: 4 }],
      }),
    );
  });
});
