import type { Metadata } from 'next';

import { CartPageContent } from '@/features/cart/cart-page-content';
import { buildStorefrontMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildStorefrontMetadata({
  title: 'Carrito',
  description: 'Revisá el carrito de esta demo ecommerce de portfolio antes de pasar al checkout.',
  pathname: '/cart',
  robots: {
    index: false,
    follow: false,
  },
});

export default function CartPage() {
  return <CartPageContent />;
}
