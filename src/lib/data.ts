import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import type { Category, Media, Product, SiteSetting } from '../payload-types'
import { CACHE_TAGS } from './cache-tags'

const db = () => getPayload({ config })

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSetting> => (await db()).findGlobal({ slug: 'site-settings' }),
  ['site-settings'],
  { tags: [CACHE_TAGS.siteSettings] },
)

export const getCategories = unstable_cache(
  async (): Promise<Category[]> =>
    (await (await db()).find({ collection: 'categories', sort: 'order', limit: 100, depth: 1 })).docs,
  ['categories'],
  { tags: [CACHE_TAGS.categories, CACHE_TAGS.siteSettings] },
)

export const getProducts = unstable_cache(
  async (): Promise<Product[]> =>
    (await (await db()).find({ collection: 'products', sort: '-createdAt', limit: 500, depth: 1 })).docs,
  ['products'],
  { tags: [CACHE_TAGS.products, CACHE_TAGS.categories] },
)

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.slug === slug) ?? null
}

export const mediaOf = (product: Product): Media[] =>
  (product.images ?? []).filter((m): m is Media => typeof m === 'object' && m !== null)

export const categoryOf = (product: Product): Category | null =>
  typeof product.category === 'object' && product.category !== null ? product.category : null
