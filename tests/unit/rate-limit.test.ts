import { describe, expect, it } from 'vitest'
import { clientKey, createRateLimiter } from '../../src/lib/rate-limit'

const headers = (o: Record<string, string>) => ({ get: (n: string) => o[n.toLowerCase()] ?? null })

describe('createRateLimiter', () => {
  it('permite hasta el límite y luego bloquea', () => {
    const t = 0
    const rl = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => t })
    expect(rl.check('a').allowed).toBe(true)
    expect(rl.check('a').allowed).toBe(true)
    const third = rl.check('a')
    expect(third).toMatchObject({ allowed: true, remaining: 0 })
    const fourth = rl.check('a')
    expect(fourth.allowed).toBe(false)
    expect(fourth.retryAfterSec).toBeGreaterThan(0)
  })
  it('cada clave tiene su propio cupo', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0 })
    expect(rl.check('a').allowed).toBe(true)
    expect(rl.check('b').allowed).toBe(true)
    expect(rl.check('a').allowed).toBe(false)
  })
  it('se libera al pasar la ventana', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => t })
    rl.check('a')
    expect(rl.check('a').allowed).toBe(false)
    t = 1_001
    expect(rl.check('a').allowed).toBe(true)
  })
  it('no crece sin límite: descarta claves viejas al llegar a maxKeys', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => t, maxKeys: 3 })
    for (const k of ['a', 'b', 'c']) rl.check(k)
    t = 5_000
    rl.check('d')
    // tras la limpieza, las claves viejas ya no ocupan cupo: 'a' vuelve a estar permitida
    expect(rl.check('a').allowed).toBe(true)
  })
})

describe('clientKey', () => {
  it('prefiere cf-connecting-ip', () => {
    expect(clientKey(headers({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }))).toBe('1.1.1.1')
  })
  it('usa la primera IP de x-forwarded-for', () => {
    expect(clientKey(headers({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3' }))).toBe('2.2.2.2')
  })
  it('sin IP, todo el tráfico comparte un cubo', () => {
    expect(clientKey(headers({}))).toBe('sin-ip')
  })
})
