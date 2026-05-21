import type { MetadataRoute } from 'next';

import { getCanonicalUrl, getMetadataBase } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/cart', '/item/'],
    },
    sitemap: getCanonicalUrl('/sitemap.xml'),
    host: getMetadataBase().toString(),
  };
}
