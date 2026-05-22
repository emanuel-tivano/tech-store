import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createOrderActionMock, clearCartMock, useCartMock } = vi.hoisted(() => ({
  createOrderActionMock: vi.fn(),
  clearCartMock: vi.fn(),
  useCartMock: vi.fn(),
}));

vi.mock('@/features/checkout/actions', () => ({
  createOrderAction: createOrderActionMock,
}));

vi.mock('@/context/cart-context', () => ({
  useCart: useCartMock,
}));

vi.mock('@/components/trust-signals', () => ({
  TrustSignals: () => <div data-testid="trust-signals" />,
}));

vi.mock('@/components/page-state', () => ({
  PageState: ({ title, description }: { title: string; description?: string }) => (
    <div>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  ),
}));

import { CheckoutPageContent } from '@/features/checkout/checkout-page-content';
import { CHECKOUT_SESSION_STORAGE_KEY } from '@/features/checkout/storage';

const cartItem = {
  id: 'mouse-1',
  slug: 'mouse-gamer',
  title: 'Mouse gamer',
  description: 'Mouse ergonomico',
  categoryId: 'mouses' as const,
  image: '/mouse.png',
  price: 100,
  stock: 5,
  freeShipment: true,
  quantity: 1,
};

function renderCheckout() {
  return render(<CheckoutPageContent />);
}

describe('CheckoutPageContent', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();

    useCartMock.mockReturnValue({
      cart: { items: [cartItem] },
      clearCart: clearCartMock,
    });

    createOrderActionMock.mockResolvedValue({
      status: 'success',
      orderId: 'order-123',
    });
  });

  it('hidrata valores desde sessionStorage valido', async () => {
    window.sessionStorage.setItem(
      CHECKOUT_SESSION_STORAGE_KEY,
      JSON.stringify({
        fullName: 'Tomás Ibarra',
        email: 'tomas@example.com',
        phone: '+54 11 5555 5555',
        address: 'Av. Cabildo 1234',
        city: 'Buenos Aires',
        province: 'Buenos Aires',
        postalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
      }),
    );

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre completo')).toHaveValue('Tomás Ibarra');
    });

    expect(screen.getByLabelText('Email')).toHaveValue('tomas@example.com');
    expect(screen.getByLabelText('Teléfono')).toHaveValue('+54 11 5555 5555');
    expect(screen.getByLabelText('Dirección')).toHaveValue('Av. Cabildo 1234');
    expect(screen.getByLabelText('Ciudad')).toHaveValue('Buenos Aires');
    expect(screen.getByLabelText('Provincia')).toHaveValue('Buenos Aires');
    expect(screen.getByLabelText('Código postal')).toHaveValue('1425');
    expect(screen.getByRole('radio', { name: /envío a domicilio/i })).toBeChecked();
    expect(
      screen.getByRole('radio', { name: /tarjeta de crédito o débito/i }),
    ).toBeChecked();
    expect(screen.getByLabelText('Confirmar email')).toHaveValue('');
  });

  it('ignora sessionStorage corrupto', async () => {
    window.sessionStorage.setItem(CHECKOUT_SESSION_STORAGE_KEY, '{broken-json');

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
    });

    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Confirmar email')).toHaveValue('');
  });

  it('guarda cambios en sessionStorage', async () => {
    const user = userEvent.setup();

    renderCheckout();

    await user.type(screen.getByLabelText('Nombre completo'), 'Tomás Ibarra');
    await user.type(screen.getByLabelText('Email'), 'tomas@example.com');

    await waitFor(() => {
      expect(window.sessionStorage.getItem(CHECKOUT_SESSION_STORAGE_KEY)).toBeTruthy();
    });

    expect(JSON.parse(window.sessionStorage.getItem(CHECKOUT_SESSION_STORAGE_KEY) ?? '{}')).toMatchObject({
      fullName: 'Tomás Ibarra',
      email: 'tomas@example.com',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      deliveryMethod: '',
      paymentMethod: '',
    });
  });

  it('limpia sessionStorage tras checkout exitoso', async () => {
    const user = userEvent.setup();

    window.sessionStorage.setItem(
      CHECKOUT_SESSION_STORAGE_KEY,
      JSON.stringify({
        fullName: 'Tomás Ibarra',
        email: 'tomas@example.com',
        phone: '+54 11 5555 5555',
        address: 'Av. Cabildo 1234',
        city: 'Buenos Aires',
        province: 'Buenos Aires',
        postalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
      }),
    );

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre completo')).toHaveValue('Tomás Ibarra');
    });

    await user.type(screen.getByLabelText('Confirmar email'), 'tomas@example.com');
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    await waitFor(() => {
      expect(screen.getByText('Pedido registrado correctamente')).toBeInTheDocument();
    });

    expect(createOrderActionMock).toHaveBeenCalledTimes(1);
    expect(clearCartMock).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(CHECKOUT_SESSION_STORAGE_KEY)).toBeNull();
  });

  it('tolera fallos al guardar en sessionStorage', async () => {
    const user = userEvent.setup();
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });

    renderCheckout();

    await user.type(screen.getByLabelText('Nombre completo'), 'Tomás Ibarra');

    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Tomás Ibarra');
    expect(setItemSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
  });

  it('tolera fallos al limpiar sessionStorage despues de una orden exitosa', async () => {
    const user = userEvent.setup();
    const removeItemSpy = vi
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });

    window.sessionStorage.setItem(
      CHECKOUT_SESSION_STORAGE_KEY,
      JSON.stringify({
        fullName: 'Tomás Ibarra',
        email: 'tomas@example.com',
        phone: '+54 11 5555 5555',
        address: 'Av. Cabildo 1234',
        city: 'Buenos Aires',
        province: 'Buenos Aires',
        postalCode: '1425',
        deliveryMethod: 'home-delivery',
        paymentMethod: 'credit-card',
      }),
    );

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre completo')).toHaveValue('Tomás Ibarra');
    });

    await user.type(screen.getByLabelText('Confirmar email'), 'tomas@example.com');
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    await waitFor(() => {
      expect(screen.getByText('Pedido registrado correctamente')).toBeInTheDocument();
    });

    expect(removeItemSpy).toHaveBeenCalled();
    expect(clearCartMock).toHaveBeenCalledTimes(1);

    removeItemSpy.mockRestore();
  });
});
