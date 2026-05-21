import type { CartLineInput, ProductDetailDTO } from '@/types';

export function mapProductDetailToCartLineInput(product: ProductDetailDTO): CartLineInput {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    categoryId: product.categoryId,
    image: product.image,
    price: product.price,
    stock: product.stock,
    freeShipment: product.freeShipment,
  };
}
