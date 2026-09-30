type Options = { limit: number; windowMs: number; now?: () => number; maxKeys?: number }
type Result = { allowed: boolean; remaining: number; retryAfterSec: number }

/**
 * Limitador de ventana deslizante en memoria. Es por instancia: capa extra, no la única defensa.
 * El tope `maxKeys` es real: si hay demasiadas claves se expulsan las más antiguas, así un
 * atacante que rote IPs no puede hacer crecer la memoria ni volver lento cada chequeo.
 */
export function createRateLimiter({ limit, windowMs, now = Date.now, maxKeys = 10_000 }: Options) {
  const hits = new Map<string, number[]>() // el orden de inserción del Map es el orden de uso
  let lastPrune = -Infinity

  function makeRoom(t: number, key: string) {
    if (hits.has(key) || hits.size < maxKeys) return
    // Limpieza de vencidas: como máximo una vez por ventana (evita recorrer el mapa en cada petición).
    if (t - lastPrune >= windowMs) {
      lastPrune = t
      for (const [k, times] of hits) {
        if (!times.some((x) => t - x < windowMs)) hits.delete(k)
      }
    }
    // Si sigue lleno, se expulsa la clave más antigua.
    while (hits.size >= maxKeys) {
      const oldest = hits.keys().next().value
      if (oldest === undefined) break
      hits.delete(oldest)
    }
  }

  return {
    check(key: string): Result {
      const t = now()
      makeRoom(t, key)
      const times = (hits.get(key) ?? []).filter((x) => t - x < windowMs)
      hits.delete(key) // se reinserta al final: queda como la más reciente
      if (times.length >= limit) {
        hits.set(key, times)
        return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((times[0] + windowMs - t) / 1000)) }
      }
      times.push(t)
      hits.set(key, times)
      return { allowed: true, remaining: limit - times.length, retryAfterSec: 0 }
    },
    size: () => hits.size,
  }
}

export type TrustedProxy = 'none' | 'cloudflare' | 'forwarded'

/** Lee `TRUSTED_PROXY` (none | cloudflare | forwarded). Cualquier otro valor se trata como `none`. */
export function parseTrustedProxy(value: string | undefined): TrustedProxy {
  return value === 'cloudflare' || value === 'forwarded' ? value : 'none'
}

/**
 * Identifica al cliente. Las cabeceras de IP las manda quien hace la petición, así que
 * solo se confía en ellas si hay un proxy de confianza que las fija (y el origen no es
 * accesible sin pasar por él). Sin proxy de confianza todo el tráfico comparte un cubo.
 */
export function clientKey(headers: { get(name: string): string | null }, trusted: TrustedProxy = 'none'): string {
  if (trusted === 'cloudflare') return headers.get('cf-connecting-ip')?.trim() || 'sin-ip'
  if (trusted === 'forwarded') return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'sin-ip'
  return 'sin-ip'
}
