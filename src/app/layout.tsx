import '@/styles/globals.css';

import { Suspense } from 'react';
import type { Metadata } from 'next';

import { JsonLd } from '@/components/json-ld';
import { SiteHeader } from '@/components/site-header';
import { getMetadataBase, storefrontMetadata } from '@/lib/metadata';

import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: storefrontMetadata.siteName,
    template: `%s | ${storefrontMetadata.siteName}`,
  },
  description: storefrontMetadata.defaultDescription,
  applicationName: storefrontMetadata.siteName,
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: storefrontMetadata.siteName,
    title: storefrontMetadata.siteName,
    description: storefrontMetadata.defaultDescription,
  },
  twitter: {
    card: 'summary',
    title: storefrontMetadata.siteName,
    description: storefrontMetadata.defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: storefrontMetadata.siteName,
    url: storefrontMetadata.siteUrl,
    description: storefrontMetadata.defaultDescription,
    logo: storefrontMetadata.logoUrl,
    inLanguage: 'es-AR',
  };

  return (
    <html lang="es">
      <body>
        <JsonLd data={organizationJsonLd} />
        <Providers>
          <div className="min-h-screen bg-slate-100">
            <Suspense fallback={<SiteHeaderFallback />}>
              <SiteHeader />
            </Suspense>
            <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

function SiteHeaderFallback() {
  return (
    <div
      aria-hidden="true"
      className="brand-header border-b border-slate-200/70 shadow-md shadow-slate-950/5"
    >
      <div className="mx-auto h-[145px] w-full max-w-6xl px-3 sm:px-6 lg:px-8" />
    </div>
  );
}
