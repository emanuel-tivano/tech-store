import { ProductCard } from '@/components/product-card';
import type { ProductCardDTO } from '@/types';

interface ProductGridProps {
  products: ProductCardDTO[];
  prioritizeFirstImage?: boolean;
}

export function ProductGrid({
  products,
  prioritizeFirstImage = false,
}: ProductGridProps) {
  const gridClassName =
    products.length === 1
      ? 'grid max-w-sm grid-cols-1 gap-4'
      : 'grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4';

  return (
    <div className={gridClassName}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={prioritizeFirstImage && index === 0}
        />
      ))}
    </div>
  );
}
