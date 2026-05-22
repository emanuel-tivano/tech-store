import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { CartProvider } from '@/context/cart-context';
import { ProductDetailActions } from '@/features/product-detail/product-detail-actions';
import type { CartState, ProductDetailDTO } from '@/types';

const product: ProductDetailDTO = {
  id: 'mouse-1',
  slug: 'mouse-gamer',
  title: 'Mouse gamer',
  description: 'Mouse ergonomico',
  categoryId: 'mouses',
  createdAt: '2026-05-22T00:00:00.000Z',
  image: '/mouse.png',
  price: 100,
  rating: 4.8,
  opinions: 120,
  qtySold: 400,
  stock: 5,
  freeShipment: true,
  isFeatured: true,
};

function renderWithCart(cartState?: CartState) {
  window.localStorage.clear();

  if (cartState) {
    window.localStorage.setItem('perifericos-cart', JSON.stringify(cartState));
  }

  render(
    <CartProvider>
      <ProductDetailActions product={product} />
    </CartProvider>,
  );
}

describe('ProductDetailActions', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('permite seleccionar el stock completo cuando el producto no esta en carrito', async () => {
    renderWithCart();

    const quantityInput = await screen.findByLabelText('Cantidad');
    const cta = screen.getByRole('button', { name: 'Agregar al carrito' });

    await waitFor(() => {
      expect(quantityInput).toHaveAttribute('max', '5');
    });

    expect(quantityInput).toHaveValue(1);
    expect(cta).toBeEnabled();
    expect(screen.getByText('Podés agregar hasta 5 unidades más desde esta página.')).toBeInTheDocument();
  });

  it('reduce el maximo seleccionable cuando ya hay unidades en carrito', async () => {
    renderWithCart({
      items: [{ ...product, quantity: 3 }],
    });

    const quantityInput = await screen.findByLabelText('Cantidad');

    await waitFor(() => {
      expect(quantityInput).toHaveAttribute('max', '2');
    });

    expect(screen.getByText('Podés agregar hasta 2 unidades más desde esta página.')).toBeInTheDocument();
    expect(screen.getByText('Ya tenés 3 unidades en tu carrito.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar al carrito' })).toBeEnabled();
  });

  it('deshabilita la compra cuando el carrito ya ocupa todo el stock disponible', async () => {
    renderWithCart({
      items: [{ ...product, quantity: 5 }],
    });

    const quantityInput = await screen.findByLabelText('Cantidad');
    const cta = await screen.findByRole('button', { name: 'No disponible por ahora' });

    await waitFor(() => {
      expect(quantityInput).toHaveAttribute('max', '0');
    });

    expect(quantityInput).toBeDisabled();
    expect(quantityInput).toHaveValue(0);
    expect(cta).toBeDisabled();
    expect(
      screen.getByText('Ya tenés en tu carrito todas las unidades disponibles de este producto.'),
    ).toBeInTheDocument();
  });
});
