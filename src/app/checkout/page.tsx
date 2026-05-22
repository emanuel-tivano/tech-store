import type { Metadata } from 'next';

import { CheckoutPageContent } from '@/features/checkout/checkout-page-content';
import { buildStorefrontMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildStorefrontMetadata({
  title: 'Checkout',
  description: 'Completá el checkout simulado de esta demo ecommerce de portfolio con validación de datos, envío y pago no reales.',
  pathname: '/checkout',
  robots: {
    index: false,
    follow: false,
  },
});

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
