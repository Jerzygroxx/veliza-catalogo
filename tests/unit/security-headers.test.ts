import { describe, expect, it } from 'vitest'
import { buildSecurityHeaders } from '../../src/lib/security-headers'

const get = (h: { key: string; value: string }[], key: string) => h.find((x) => x.key === key)?.value

describe('buildSecurityHeaders (producción)', () => {
  const h = buildSecurityHeaders({ isDev: false })
  const csp = get(h, 'Content-Security-Policy')!

  it('incluye las cabeceras exigidas', () => {
    expect(get(h, 'X-Content-Type-Options')).toBe('nosniff')
    expect(get(h, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(get(h, 'Permissions-Policy')).toMatch(/camera=\(\)/)
    expect(get(h, 'Strict-Transport-Security')).toMatch(/max-age=31536000/)
  })
  it('CSP: nadie puede incrustar el sitio y solo carga lo propio', () => {
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
  })
  it('CSP: no permite eval en producción', () => {
    expect(csp).not.toContain('unsafe-eval')
  })
  it('CSP: permite las imágenes que usa el panel (blob y data)', () => {
    expect(csp).toMatch(/img-src[^;]*blob:/)
    expect(csp).toMatch(/img-src[^;]*data:/)
  })
})

describe('buildSecurityHeaders (desarrollo)', () => {
  const h = buildSecurityHeaders({ isDev: true })
  it('no envía HSTS en desarrollo', () => {
    expect(get(h, 'Strict-Transport-Security')).toBeUndefined()
  })
  it('permite eval en desarrollo (lo necesita el refresco de Next)', () => {
    expect(get(h, 'Content-Security-Policy')).toContain("'unsafe-eval'")
  })
})

describe('hosts de imágenes extra', () => {
  it('se agregan a img-src', () => {
    const csp = get(buildSecurityHeaders({ isDev: false, extraImgHosts: ['https://fotos.ejemplo.com'] }), 'Content-Security-Policy')!
    expect(csp).toMatch(/img-src[^;]*https:\/\/fotos\.ejemplo\.com/)
  })
  it('ignora valores vacíos', () => {
    const csp = get(buildSecurityHeaders({ isDev: false, extraImgHosts: ['', '  '] }), 'Content-Security-Policy')!
    expect(csp).not.toMatch(/img-src[^;]*\s{2}/)
  })
})
