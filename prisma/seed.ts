import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export const categories: CategorySeed[] = [
  {
    name: 'Monitores',
    slug: 'monitores',
    description: 'Monitores para gaming, trabajo y productividad con paneles IPS, VA y alta tasa de refresco.',
    imageUrl: '/icons/LogoIcon.svg',
  },
  {
    name: 'Teclados',
    slug: 'teclados',
    description: 'Teclados mecánicos e inalámbricos orientados a escritura cómoda, gaming y setup profesional.',
    imageUrl: '/icons/LogoIcon.svg',
  },
  {
    name: 'Mouses',
    slug: 'mouses',
    description: 'Mouses ergonómicos, ultralivianos y de precisión para oficina, creatividad y esports.',
    imageUrl: '/icons/LogoIcon.svg',
  },
  {
    name: 'Auriculares',
    slug: 'auriculares',
    description: 'Auriculares y headsets con foco en comodidad, claridad de micrófono y sonido equilibrado.',
    imageUrl: '/icons/LogoIcon.svg',
  },
];

export interface ProductSeed {
  name: string;
  slug: string;
  description: string;
  price: string;
  rating: string;
  opinions: number;
  qtySold: number;
  stock: number;
  imageUrl: string;
  freeShipment: boolean;
  isFeatured: boolean;
  categorySlug: CategorySeed['slug'];
}

export const products: ProductSeed[] = [
  {
    name: 'Samsung Odyssey G5 27"',
    slug: 'samsung-odyssey-g5-27',
    description: 'Monitor QHD curvo de 27 pulgadas con 165 Hz, 1 ms y compatibilidad con FreeSync para gaming inmersivo.',
    price: '459999.00',
    rating: '4.7',
    opinions: 184,
    qtySold: 312,
    stock: 18,
    imageUrl: '/icons/LogoIcon.svg',
    freeShipment: true,
    isFeatured: true,
    categorySlug: 'monitores',
  },
  {
    name: 'LG UltraWide 29"',
    slug: 'lg-ultrawide-29',
    description: 'Monitor IPS UltraWide Full HD pensado para multitarea, hojas de cálculo y edición liviana.',
    price: '389999.00',
    rating: '4.5',
    opinions: 96,
    qtySold: 148,
    stock: 11,
    imageUrl: '/icons/LogoIcon.svg',
    freeShipment: true,
    isFeatured: false,
    categorySlug: 'monitores',
  },
  {
    name: 'Keychron K8 Pro',
    slug: 'keychron-k8-pro',
    description: 'Teclado mecánico TKL hot-swappable con conexión inalámbrica, keycaps PBT y excelente tacto para escribir.',
    price: '219999.00',
    rating: '4.8',
    opinions: 221,
    qtySold: 427,
    stock: 26,
    imageUrl: '/icons/LogoIcon.svg',
    freeShipment: true,
    isFeatured: true,
    categorySlug: 'teclados',
  },
  {
    name: 'Logitech MX Keys S',
    slug: 'logitech-mx-keys-s',
    description: 'Teclado inalámbrico premium de perfil bajo con iluminación inteligente y soporte multidispositivo.',
    price: '199999.00',
    rating: '4.6',
    opinions: 173,
    qtySold: 289,
    stock: 14,
    imageUrl: '/icons/LogoIcon.svg',
    freeShipment: false,
    isFeatured: false,
    categorySlug: 'teclados',
  },
  {
    name: 'Logitech G Pro X Superlight 2',
    slug: 'logitech-g-pro-x-superlight-2',
    description: 'Mouse gamer ultraliviano con sensor HERO 2, switches híbridos y autonomía extendida para competitivo.',
    price: '189999.00',
    rating: '4.9',
    opinions: 254,
    qtySold: 511,
    stock: 19,
    imageUrl: '/icons/LogoIcon.svg',
    freeShipment: true,
    isFeatured: true,
    categorySlug: 'mouses',
  },
  {
    name: 'Razer DeathAdder V3',
    slug: 'razer-deathadder-v3',
    description: 'Mouse ergonómico para esports con gran precisión, peso reducido y formato cómodo para uso prolongado.',
    price: '129999.00',
    rating: '4.4',
    opinions: 88,
    qtySold: 167,
    stock: 21,
    imageUrl: '/icons/LogoIcon.svg',
    freeShipment: false,
    isFeatured: false,
    categorySlug: 'mouses',
  },
  {
    name: 'HyperX Cloud III Wireless',
    slug: 'hyperx-cloud-iii-wireless',
    description: 'Headset inalámbrico con gran autonomía, audio balanceado y micrófono claro para juego y trabajo remoto.',
    price: '249999.00',
    rating: '4.7',
    opinions: 139,
    qtySold: 236,
    stock: 17,
    imageUrl: '/icons/LogoIcon.svg',
    freeShipment: true,
    isFeatured: true,
    categorySlug: 'auriculares',
  },
  {
    name: 'Sony WH-CH720N',
    slug: 'sony-wh-ch720n',
    description: 'Auriculares livianos con cancelación de ruido, perfil sonoro detallado y batería para todo el día.',
    price: '179999.00',
    rating: '4.3',
    opinions: 64,
    qtySold: 118,
    stock: 29,
    imageUrl: '/icons/LogoIcon.svg',
    freeShipment: true,
    isFeatured: false,
    categorySlug: 'auriculares',
  },
];

function getSeedDatabaseUrl(): string {
  const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DIRECT_URL or DATABASE_URL must be set to seed the database.');
  }

  return databaseUrl;
}

async function main() {
  const pool = new Pool({
    connectionString: getSeedDatabaseUrl(),
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    for (const category of categories) {
      await prisma.category.upsert({
        where: {
          slug: category.slug,
        },
        update: {
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl,
          isActive: true,
        },
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          isActive: true,
        },
      });
    }

    for (const product of products) {
      await prisma.product.upsert({
        where: {
          slug: product.slug,
        },
        update: {
          name: product.name,
          description: product.description,
          price: product.price,
          rating: product.rating,
          opinions: product.opinions,
          qtySold: product.qtySold,
          stock: product.stock,
          imageUrl: product.imageUrl,
          freeShipment: product.freeShipment,
          isFeatured: product.isFeatured,
          isActive: true,
          category: {
            connect: {
              slug: product.categorySlug,
            },
          },
        },
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          rating: product.rating,
          opinions: product.opinions,
          qtySold: product.qtySold,
          stock: product.stock,
          imageUrl: product.imageUrl,
          freeShipment: product.freeShipment,
          isFeatured: product.isFeatured,
          isActive: true,
          category: {
            connect: {
              slug: product.categorySlug,
            },
          },
        },
      });
    }

    console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error('Seed failed.', error);
  process.exitCode = 1;
});
