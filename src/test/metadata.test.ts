import { describe, expect, it } from 'vitest';

import { buildWebsiteJsonLd } from '@/lib/metadata';

describe('buildWebsiteJsonLd', () => {
  it('expone un WebSite con SearchAction alineado a la búsqueda real del catálogo', () => {
    const websiteJsonLd = buildWebsiteJsonLd();

    expect(websiteJsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Periféricos de PC',
      inLanguage: 'es-AR',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://tech-store.example.com/?q=%7Bsearch_term_string%7D',
        'query-input': 'required name=search_term_string',
      },
    });
  });
});
