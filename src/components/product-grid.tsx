import { ProductCard } from '@/components/product-card';
import type { ProductCardDTO } from '@/types';

interface ProductGridProps {
  products: ProductCardDTO[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const gridClassName =
    products.length === 1
      ? 'grid max-w-sm grid-cols-1 gap-4'
      : 'grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4';

  return (
    <div className={gridClassName}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
