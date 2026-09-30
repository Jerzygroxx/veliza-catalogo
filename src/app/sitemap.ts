import type { MetadataRoute } from 'next'
import { getProducts } from '../lib/data'
import { buildSitemapEntries } from '../lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  return buildSitemapEntries(await getProducts(), base)
}
