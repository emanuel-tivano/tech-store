import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductCard } from '@/components/product-card';
import type { ProductCardDTO } from '@/types';

const product: ProductCardDTO = {
  id: 'monitor-1',
  slug: 'monitor-27',
  title: 'Monitor 27"',
  description: 'Panel IPS para multitarea y juego casual',
  categoryId: 'monitores',
  createdAt: '2026-05-21T12:00:00.000Z',
  image: '/monitor.png',
  price: 300,
  rating: 4.8,
  opinions: 25,
  qtySold: 12,
  stock: 3,
  freeShipment: true,
  isFeatured: true,
};

describe('ProductCard', () => {
  it('renderiza información básica del producto', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByRole('heading', { name: product.title })).toBeInTheDocument();
    expect(screen.getByText('$ 300')).toBeInTheDocument();
    expect(screen.getByText(/12 vendidos/)).toBeInTheDocument();
    expect(screen.getByText('4.8 (25)')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', `/products/${product.slug}`);
  });
});
