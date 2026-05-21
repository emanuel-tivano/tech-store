import '@/styles/globals.css';

import type { Metadata } from 'next';

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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: storefrontMetadata.siteName,
    title: storefrontMetadata.siteName,
    description: storefrontMetadata.defaultDescription,
    url: '/',
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
  return (
    <html lang="es">
      <body>
        <Providers>
          <div className="min-h-screen bg-slate-100">
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
