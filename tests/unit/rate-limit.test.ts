import { describe, expect, it } from 'vitest'
import { clientKey, createRateLimiter, parseTrustedProxy } from '../../src/lib/rate-limit'

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

describe('clientKey con proxy de confianza', () => {
  it('sin proxy de confianza ignora las cabeceras de IP (no se pueden falsificar)', () => {
    expect(clientKey(headers({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }), 'none')).toBe('sin-ip')
  })
  it('con Cloudflare solo confía en cf-connecting-ip', () => {
    expect(clientKey(headers({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }), 'cloudflare')).toBe('1.1.1.1')
    expect(clientKey(headers({ 'x-forwarded-for': '2.2.2.2' }), 'cloudflare')).toBe('sin-ip')
  })
  it('con proxy genérico usa la primera IP de x-forwarded-for', () => {
    expect(clientKey(headers({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3' }), 'forwarded')).toBe('2.2.2.2')
  })
})

describe('createRateLimiter: el tope de claves es real', () => {
  it('nunca supera maxKeys aunque todas las claves sean recientes', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0, maxKeys: 5 })
    for (let i = 0; i < 50; i++) rl.check(`ip-${i}`)
    expect(rl.size()).toBeLessThanOrEqual(5)
  })
  it('una clave expulsada vuelve a tener cupo (falla hacia permitir, no hacia crecer)', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0, maxKeys: 2 })
    rl.check('a')
    rl.check('b')
    rl.check('c') // expulsa a 'a'
    expect(rl.check('a').allowed).toBe(true)
  })
})

describe('parseTrustedProxy', () => {
  it('reconoce los modos válidos', () => {
    expect(parseTrustedProxy('cloudflare')).toBe('cloudflare')
    expect(parseTrustedProxy('forwarded')).toBe('forwarded')
  })
  it.each([undefined, '', 'none', 'Cloudflare', 'cualquier-cosa'])('%j → none', (v) => {
    expect(parseTrustedProxy(v)).toBe('none')
  })
})
