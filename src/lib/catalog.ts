export type SortKey = 'recientes' | 'precio-asc' | 'precio-desc'
const SORT_KEYS: readonly SortKey[] = ['recientes', 'precio-asc', 'precio-desc']

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)

export function parseCatalogParams(
  raw: { categoria?: string | string[]; orden?: string | string[] },
  validSlugs: string[],
): { categoria: string | null; orden: SortKey } {
  const cat = first(raw.categoria)
  const ord = first(raw.orden)
  return {
    categoria: cat && validSlugs.includes(cat) ? cat : null,
    orden: SORT_KEYS.includes(ord as SortKey) ? (ord as SortKey) : 'recientes',
  }
}

type Sortable = { price: number; soldOut?: boolean | null; createdAt: string }

export function sortProducts<T extends Sortable>(items: T[], orden: SortKey): T[] {
  const key = (a: T, b: T) =>
    orden === 'precio-asc'
      ? a.price - b.price
      : orden === 'precio-desc'
        ? b.price - a.price
        : b.createdAt.localeCompare(a.createdAt)
  return [...items].sort((a, b) => Number(Boolean(a.soldOut)) - Number(Boolean(b.soldOut)) || key(a, b))
}

export function catalogHref({ categoria, orden }: { categoria: string | null; orden: SortKey }): string {
  const q = new URLSearchParams()
  if (categoria) q.set('categoria', categoria)
  if (orden !== 'recientes') q.set('orden', orden)
  const s = q.toString()
  return s ? `/catalogo?${s}` : '/catalogo'
}
