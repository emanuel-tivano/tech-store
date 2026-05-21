import type { Category } from '@/types';

export const CATEGORY_SLUGS = [
  'monitores',
  'teclados',
  'mouses',
  'auriculares',
] as const satisfies readonly Category[];

export const CATEGORY_LABELS: Record<Category, string> = {
  monitores: 'Monitores',
  teclados: 'Teclados',
  mouses: 'Mouses',
  auriculares: 'Auriculares',
};

export const CATEGORY_NAV_ITEMS = CATEGORY_SLUGS.map((slug) => ({
  href: `/category/${slug}` as const,
  label: CATEGORY_LABELS[slug],
}));
