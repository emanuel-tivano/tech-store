import { cache } from 'react';

export const cacheDataReader: typeof cache =
  process.env.NODE_ENV === 'test' ? ((callback) => callback) as typeof cache : cache;
