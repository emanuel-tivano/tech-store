import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { CatalogControls } from '@/features/catalog/catalog-controls';

const baseState = {
  category: null,
  freeShippingOnly: false,
  inStockOnly: false,
  maxPrice: null,
  minRating: null,
  query: '',
  resultCount: 12,
  sort: 'featured' as const,
};

describe('CatalogControls', () => {
  it('muestra el toggle mobile y alterna visibilidad de filtros', async () => {
    const user = userEvent.setup();

    render(
      <CatalogControls
        basePath="/"
        categoryFilterEnabled
        state={baseState}
      />,
    );

    const toggle = screen.getByRole('button', { name: 'Mostrar filtros' });
    const controls = document.getElementById('catalog-controls');

    expect(toggle).toHaveClass('md:hidden');
    expect(controls).toHaveClass('catalog-controls', 'hidden', 'md:block');

    await user.click(toggle);

    expect(screen.getByRole('button', { name: 'Ocultar filtros' })).toBeVisible();
    expect(controls).toHaveClass('block');

    await user.click(screen.getByRole('button', { name: 'Ocultar filtros' }));

    expect(screen.getByRole('button', { name: 'Mostrar filtros' })).toBeVisible();
    expect(controls).toHaveClass('hidden', 'md:block');
  });
});
