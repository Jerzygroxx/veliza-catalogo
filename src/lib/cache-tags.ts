export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  siteSettings: 'site-settings',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
