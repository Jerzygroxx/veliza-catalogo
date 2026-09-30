export function buildSitemapEntries(
  products: { slug: string; updatedAt: string }[],
  baseUrl: string,
): { url: string; lastModified: string }[] {
  const base = baseUrl.replace(/\/+$/, '')
  const now = new Date().toISOString()
  const fixed = ['/', '/catalogo', '/quienes-somos', '/como-comprar'].map((p) => ({ url: `${base}${p}`, lastModified: now }))
  const items = products.map((p) => ({
    url: `${base}/producto/${encodeURIComponent(p.slug)}`,
    lastModified: p.updatedAt,
  }))
  return [...fixed, ...items]
}
