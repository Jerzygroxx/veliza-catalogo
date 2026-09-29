import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { siteSettings } from '../../src/seed/data/site-settings'
import { placeholderImage } from '../../src/seed/images'
import { seed } from '../../src/seed/seed'
import type { SeedData } from '../../src/seed/types'
import { NO_REVALIDATE, RUN } from './helpers'

let payload: Payload
const loadImages = async () => [await placeholderImage()]
const data: SeedData = {
  categories: [{ name: `Categoría ${RUN}`, slug: `categoria-${RUN}`, order: 99 }],
  products: [
    { name: `Seed ${RUN}`, category: `categoria-${RUN}`, price: 40000, colors: [{ name: 'Negro', swatch: '#000000' }] },
  ],
  siteSettings,
}
const productSlug = `seed-${RUN}`

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {
  const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: productSlug } }, depth: 0 })
  for (const doc of docs) {
    await payload.delete({ collection: 'products', id: doc.id, context: NO_REVALIDATE })
    for (const image of doc.images) {
      await payload.delete({ collection: 'media', id: image as number, context: NO_REVALIDATE })
    }
  }
  await payload.delete({ collection: 'categories', where: { slug: { equals: `categoria-${RUN}` } }, context: NO_REVALIDATE })
})

describe('seed', () => {
  it('crea lo que falta', async () => {
    const report = await seed(payload, data, loadImages)
    expect(report.categoriesCreated).toBe(1)
    expect(report.productsCreated).toBe(1)
  })
  it('una segunda ejecución no crea nada', async () => {
    const report = await seed(payload, data, loadImages)
    expect(report.categoriesCreated).toBe(0)
    expect(report.productsCreated).toBe(0)
  })
  it('no pisa los cambios hechos desde el panel', async () => {
    const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: productSlug } } })
    await payload.update({ collection: 'products', id: docs[0].id, data: { price: 45000 }, context: NO_REVALIDATE })
    await seed(payload, data, loadImages)
    const after = await payload.findByID({ collection: 'products', id: docs[0].id })
    expect(after.price).toBe(45000)
  })
  it('falla con un mensaje claro si la categoría no existe', async () => {
    const broken: SeedData = { ...data, products: [{ name: `Huérfano ${RUN}`, category: 'no-existe', price: 40000 }] }
    await expect(seed(payload, broken, loadImages)).rejects.toThrow(/Categoría desconocida/)
  })
})
