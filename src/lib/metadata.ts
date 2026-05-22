import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://tech-store.example.com';
const SITE_NAME = 'Periféricos de PC';
const DEFAULT_DESCRIPTION =
  'Tienda online de periféricos para PC con monitores, teclados, mouses y auriculares para gaming, trabajo y setups profesionales.';
const SITE_LOGO_PATH = '/icon.png';

function normalizeSiteUrl(value: string): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  return withProtocol.replace(/\/+$/, '');
}

function getSiteUrl(): string {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? '');

  if (siteUrl) {
    return siteUrl;
  }

  const deploymentUrl = normalizeSiteUrl(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? '',
  );

  if (deploymentUrl) {
    return deploymentUrl;
  }

  return DEFAULT_SITE_URL;
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function getCanonicalUrl(pathname: string): string {
  return new URL(pathname, getMetadataBase()).toString();
}

export function toAbsoluteImageUrl(imageUrl: string): string {
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

  return new URL(normalizedPath, getMetadataBase()).toString();
}

export function getSiteLogoUrl(): string {
  return toAbsoluteImageUrl(SITE_LOGO_PATH);
}

export function buildStorefrontMetadata({
  title,
  description,
  pathname,
  image,
  robots,
}: {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  robots?: Metadata['robots'];
}): Metadata {
  const canonicalUrl = getCanonicalUrl(pathname);
  const images = image ? [toAbsoluteImageUrl(image)] : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: canonicalUrl,
      siteName: SITE_NAME,
      title,
      description,
      images,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images,
    },
    robots,
  };
}

export function buildMissingMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export const storefrontMetadata = {
  siteName: SITE_NAME,
  defaultDescription: DEFAULT_DESCRIPTION,
  siteUrl: getSiteUrl(),
  logoUrl: getSiteLogoUrl(),
};
