export type Category = 'monitores' | 'teclados' | 'mouses' | 'auriculares';

export interface ProductCardDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: Category;
  createdAt: string;
  image: string;
  price: number;
  rating: number;
  opinions: number;
  qtySold: number;
  stock: number;
  freeShipment: boolean;
  isFeatured: boolean;
}

export interface ProductDetailDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: Category;
  createdAt: string;
  image: string;
  price: number;
  rating: number;
  opinions: number;
  qtySold: number;
  stock: number;
  freeShipment: boolean;
  isFeatured: boolean;
}

export type ProductSeoDTO = Pick<
  ProductDetailDTO,
  | 'id'
  | 'slug'
  | 'title'
  | 'description'
  | 'categoryId'
  | 'image'
  | 'price'
  | 'rating'
  | 'opinions'
  | 'stock'
  | 'freeShipment'
>;

export interface CategoryDTO {
  slug: Category;
  name: string;
}

export interface CategorySeoDTO extends CategoryDTO {
  description: string | null;
  imageUrl: string | null;
}
