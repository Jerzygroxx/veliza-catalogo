import { describe, expect, it } from 'vitest'
import { catalogHref, parseCatalogParams, sortProducts } from '../../src/lib/catalog'

const p = (name: string, price: number, soldOut: boolean, createdAt: string) => ({ name, price, soldOut, createdAt })
const items = [
  p('a', 50000, false, '2026-01-01'),
  p('b', 30000, true, '2026-03-01'),
  p('c', 40000, false, '2026-02-01'),
]

describe('parseCatalogParams', () => {
  it('usa los valores por defecto', () => {
    expect(parseCatalogParams({}, ['bodies'])).toEqual({ categoria: null, orden: 'recientes' })
  })
  it('acepta valores válidos', () => {
    expect(parseCatalogParams({ categoria: 'bodies', orden: 'precio-asc' }, ['bodies'])).toEqual({
      categoria: 'bodies',
      orden: 'precio-asc',
    })
  })
  it('ignora categoría y orden desconocidos', () => {
    expect(parseCatalogParams({ categoria: 'nope', orden: 'zzz' }, ['bodies'])).toEqual({
      categoria: null,
      orden: 'recientes',
    })
  })
  it('usa el primer valor si vienen repetidos', () => {
    expect(parseCatalogParams({ categoria: ['bodies', 'x'], orden: ['precio-desc', 'a'] }, ['bodies'])).toEqual({
      categoria: 'bodies',
      orden: 'precio-desc',
    })
  })
})

describe('sortProducts', () => {
  it('recientes: nuevos primero, agotados al final', () => {
    expect(sortProducts(items, 'recientes').map((i) => i.name)).toEqual(['c', 'a', 'b'])
  })
  it('precio-asc: agotados al final', () => {
    expect(sortProducts(items, 'precio-asc').map((i) => i.name)).toEqual(['c', 'a', 'b'])
  })
  it('precio-desc: agotados al final aunque sean los más baratos', () => {
    expect(sortProducts(items, 'precio-desc').map((i) => i.name)).toEqual(['a', 'c', 'b'])
  })
  it('no muta la lista original', () => {
    const copy = [...items]
    sortProducts(items, 'precio-asc')
    expect(items).toEqual(copy)
  })
})

describe('catalogHref', () => {
  it('sin filtros', () => expect(catalogHref({ categoria: null, orden: 'recientes' })).toBe('/catalogo'))
  it('solo categoría', () => expect(catalogHref({ categoria: 'bodies', orden: 'recientes' })).toBe('/catalogo?categoria=bodies'))
  it('solo orden', () => expect(catalogHref({ categoria: null, orden: 'precio-asc' })).toBe('/catalogo?orden=precio-asc'))
  it('ambos', () =>
    expect(catalogHref({ categoria: 'bodies', orden: 'precio-desc' })).toBe('/catalogo?categoria=bodies&orden=precio-desc'))
})
