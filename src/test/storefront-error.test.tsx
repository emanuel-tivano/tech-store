import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import StorefrontError from '@/app/error';

describe('StorefrontError', () => {
  it('muestra un mensaje seguro y permite reintentar', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<StorefrontError error={new Error('database unavailable')} reset={reset} />);

    expect(screen.getByText('No pudimos cargar esta sección')).toBeInTheDocument();
    expect(screen.queryByText('database unavailable')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(reset).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
