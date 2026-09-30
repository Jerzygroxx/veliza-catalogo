import { describe, expect, it } from 'vitest'
import { buildSitemapEntries } from '../../src/lib/seo'

const base = 'https://veliza.example'

describe('buildSitemapEntries', () => {
  it('incluye las páginas fijas aunque no haya prendas', () => {
    const urls = buildSitemapEntries([], base).map((e) => e.url)
    expect(urls).toEqual([`${base}/`, `${base}/catalogo`, `${base}/quienes-somos`, `${base}/como-comprar`])
  })
  it('agrega una entrada por prenda con su fecha', () => {
    const e = buildSitemapEntries([{ slug: 'body-cloe', updatedAt: '2026-09-01T10:00:00.000Z' }], base)
    expect(e.at(-1)).toEqual({ url: `${base}/producto/body-cloe`, lastModified: '2026-09-01T10:00:00.000Z' })
  })
  it('codifica los slugs con caracteres especiales', () => {
    const e = buildSitemapEntries([{ slug: 'lía & co', updatedAt: '2026-09-01T00:00:00.000Z' }], base)
    expect(e.at(-1)!.url).toBe(`${base}/producto/l%C3%ADa%20%26%20co`)
  })
  it('quita la barra final de la URL base', () => {
    expect(buildSitemapEntries([], `${base}/`)[0].url).toBe(`${base}/`)
  })
})
