type Options = { limit: number; windowMs: number; now?: () => number; maxKeys?: number }
type Result = { allowed: boolean; remaining: number; retryAfterSec: number }

/** Limitador de ventana deslizante en memoria. Es por instancia: capa extra, no la única defensa. */
export function createRateLimiter({ limit, windowMs, now = Date.now, maxKeys = 10_000 }: Options) {
  const hits = new Map<string, number[]>()

  function prune(t: number) {
    for (const [key, times] of hits) {
      const fresh = times.filter((x) => t - x < windowMs)
      if (fresh.length) hits.set(key, fresh)
      else hits.delete(key)
    }
  }

  return {
    check(key: string): Result {
      const t = now()
      if (hits.size >= maxKeys && !hits.has(key)) prune(t)
      const times = (hits.get(key) ?? []).filter((x) => t - x < windowMs)
      if (times.length >= limit) {
        hits.set(key, times)
        return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((times[0] + windowMs - t) / 1000)) }
      }
      times.push(t)
      hits.set(key, times)
      return { allowed: true, remaining: limit - times.length, retryAfterSec: 0 }
    },
  }
}

/** Identifica al cliente. Detrás de Cloudflare se usa `cf-connecting-ip` (no falsificable desde fuera). */
export function clientKey(headers: { get(name: string): string | null }): string {
  const cf = headers.get('cf-connecting-ip')?.trim()
  if (cf) return cf
  const xff = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return xff || 'sin-ip'
}
