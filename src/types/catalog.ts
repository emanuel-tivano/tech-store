export type Category = 'monitores' | 'teclados' | 'mouses' | 'auriculares';

export interface Product {
  id: string;
  title: string;
  description: string;
  categoryId: Category;
  image: string;
  price: number;
  rating: number;
  opinions: number;
  qtySold: number;
  stock: number;
  freeShipment: boolean;
}
