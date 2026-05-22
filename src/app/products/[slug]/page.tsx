import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { TrustSignals } from '@/components/trust-signals';
import { ProductGrid } from '@/components/product-grid';
import { ProductDetailView } from '@/features/product-detail/product-detail-view';
import { CATEGORY_LABELS } from '@/lib/catalog-taxonomy';
import { pluralize } from '@/lib/copy';
import {
  buildMissingMetadata,
  buildStorefrontMetadata,
  getCanonicalUrl,
  storefrontMetadata,
  toAbsoluteImageUrl,
} from '@/lib/metadata';
import { readProductCardsByCategory, readProductDetailBySlug, readProductSeoBySlug } from '@/lib/products-read';

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await readProductSeoBySlug(slug);

  if (!product) {
    return buildMissingMetadata({
      title: 'Producto no encontrado',
      description: 'El producto solicitado ya no está disponible en nuestro catálogo.',
    });
  }

  const categoryLabel = CATEGORY_LABELS[product.categoryId];
  const shippingLabel = product.freeShipment ? 'con envío gratis' : 'con opciones de entrega';
  const stockLabel =
    product.stock > 0
      ? `${product.stock} ${pluralize(product.stock, 'unidad')} ${pluralize(product.stock, 'disponible')}`
      : 'sin stock por el momento';

  return buildStorefrontMetadata({
    title: `${product.title} | ${categoryLabel}`,
    description: `${product.description} Comprá ${product.title} ${shippingLabel} y ${stockLabel} en ${storefrontMetadata.siteName}.`,
    pathname: `/products/${product.slug}`,
    image: product.image || undefined,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await readProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  const productUrl = getCanonicalUrl(`/products/${product.slug}`);
  const categoryUrl = getCanonicalUrl(`/category/${product.categoryId}`);
  const productImage = product.image ? toAbsoluteImageUrl(product.image) : undefined;
  const relatedProducts = (await readProductCardsByCategory(product.categoryId))
    .filter((relatedProduct) => relatedProduct.slug !== product.slug)
    .sort((left, right) => right.qtySold - left.qtySold || right.rating - left.rating)
    .slice(0, 4);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: getCanonicalUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: CATEGORY_LABELS[product.categoryId],
        item: categoryUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    category: CATEGORY_LABELS[product.categoryId],
    sku: product.id,
    url: productUrl,
    image: productImage ? [productImage] : undefined,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'ARS',
      price: product.price.toFixed(2),
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating:
      product.opinions > 0 && product.rating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.opinions,
          }
        : undefined,
    brand: {
      '@type': 'Brand',
      name: storefrontMetadata.siteName,
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={productJsonLd} />
      <Breadcrumbs
        items={[
          { href: '/', label: 'Inicio' },
          { href: `/category/${product.categoryId}`, label: CATEGORY_LABELS[product.categoryId] },
          { label: product.title },
        ]}
      />
      <ProductDetailView product={product} />
      <div className="mt-6 grid gap-6">
        <TrustSignals
          title="Compra con información clara"
        items={[
          {
            title: product.freeShipment ? 'Envío gratis informado' : 'Envío calculado en checkout',
            description: product.freeShipment
                ? 'Este producto incluye envío gratis.'
                : 'El costo de envío se informa en el checkout.',
          },
          {
            title: 'Compra simulada segura',
            description: 'Revisá cantidades y stock antes de confirmar la orden.',
          },
          {
            title: 'Soporte ante dudas',
            description: 'La sección de ayuda y el carrito acompañan la compra si necesitás contexto adicional.',
          },
          {
            title: 'Pago simulado para portfolio',
            description: 'La experiencia no promete una pasarela real ni tiempos logísticos que no existen.',
          },
        ]}
      />

        {relatedProducts.length > 0 ? (
          <section className="flex flex-col gap-4">
            <div>
              <p className="brand-eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
                Relacionados
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                También te puede interesar
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Más productos de {CATEGORY_LABELS[product.categoryId].toLowerCase()} para seguir comparando antes de decidir.
              </p>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        ) : null}
      </div>
    </>
  );
}
