import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types';

const product: Product = {
  id: 'monitor-1',
  title: 'Monitor 27"',
  description: 'Panel IPS',
  categoryId: 'monitores',
  image: '/monitor.png',
  price: 300,
  rating: 4.8,
  opinions: 25,
  qtySold: 12,
  stock: 3,
  freeShipment: true,
};

describe('ProductCard', () => {
  it('renderiza información básica del producto', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByRole('heading', { name: product.title })).toBeInTheDocument();
    expect(screen.getByText('$ 300')).toBeInTheDocument();
    expect(screen.getByText('12 vendidos')).toBeInTheDocument();
  });
});
