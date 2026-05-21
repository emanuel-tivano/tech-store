import { ProductCard } from '@/components/product-card';
import type { ProductCardDTO } from '@/types';

interface ProductGridProps {
  products: ProductCardDTO[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
