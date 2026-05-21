import { notFound, permanentRedirect } from 'next/navigation';

import { readProductById } from '@/lib/products-read';

export const dynamic = 'force-dynamic';

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const product = await readProductById(id);

  if (!product) {
    notFound();
  }

  permanentRedirect(`/products/${product.slug}`);
}
