export type DashboardCounts = { total: number; soldOut: number }

export function greeting(name?: string | null): string {
  const clean = name?.trim()
  return clean ? `Hola, ${clean} 💕` : 'Hola 💕'
}

export function summarize(counts: DashboardCounts | null): { published: number; soldOut: number } | null {
  if (!counts) return null
  return { published: Math.max(counts.total - counts.soldOut, 0), soldOut: counts.soldOut }
}
