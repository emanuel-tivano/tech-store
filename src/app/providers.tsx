'use client';

import type { PropsWithChildren } from 'react';

import { CartProvider } from '@/context/cart-context';

export function Providers({ children }: PropsWithChildren) {
  return <CartProvider>{children}</CartProvider>;
}
