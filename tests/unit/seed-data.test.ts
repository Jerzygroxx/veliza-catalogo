import { describe, expect, it } from 'vitest'
import { slugify } from '../../src/lib/slugify'
import { MIN_PRICE } from '../../src/lib/validators'
import { seedData } from '../../src/seed/data'

const { categories, products, siteSettings } = seedData

describe('datos iniciales', () => {
  it('tiene 29 productos: 11 blusas y tops, 12 bodies y 6 vestidos', () => {
    const count = (slug: string) => products.filter((p) => p.category === slug).length
    expect(products).toHaveLength(29)
    expect(count('blusas-y-tops')).toBe(11)
    expect(count('bodies')).toBe(12)
    expect(count('vestidos')).toBe(6)
  })
  it('cada producto apunta a una categoría existente', () => {
    const slugs = new Set(categories.map((c) => c.slug))
    for (const p of products) expect(slugs, p.name).toContain(p.category)
  })
  it('no hay slugs repetidos', () => {
    const slugs = products.map((p) => slugify(p.name))
    expect(new Set(slugs).size).toBe(slugs.length)
  })
  it('todos los precios son enteros desde 1000', () => {
    for (const p of products) {
      expect(Number.isInteger(p.price) && p.price >= MIN_PRICE, p.name).toBe(true)
    }
  })
  it('la configuración trae WhatsApp, pasos y políticas', () => {
    expect(siteSettings.whatsappNumber).toBe('573189952081')
    expect(siteSettings.howToBuySteps).toHaveLength(4)
    expect(siteSettings.exchangePolicies).toHaveLength(4)
  })
})
