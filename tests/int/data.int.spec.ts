import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { categoryOf, getCategories, getProductBySlug, getProducts, getSiteSettings, mediaOf } from '../../src/lib/data'
import { NO_REVALIDATE, RUN, createTestImage } from './helpers'

let payload: Payload
const ids: { cat?: number; img?: number; prods: number[] } = { prods: [] }
const slugCat = `cat-datos-${RUN}`

beforeAll(async () => {
  payload = await getPayload({ config })
  const img = await createTestImage(payload)
  ids.img = img.id
  const cat = await payload.create({
    collection: 'categories',
    data: { name: `Cat ${RUN}`, slug: slugCat, order: 98 },
    context: NO_REVALIDATE,
  })
  ids.cat = cat.id
  for (const [name, price, soldOut] of [['Uno', 30000, false], ['Dos', 20000, true]] as const) {
    const p = await payload.create({
      collection: 'products',
      data: { name: `${name} ${RUN}`, slug: `${name.toLowerCase()}-${RUN}`, category: cat.id, price, soldOut, images: [img.id] },
      context: NO_REVALIDATE,
    })
    ids.prods.push(p.id)
  }
})

afterAll(async () => {
  for (const id of ids.prods) await payload.delete({ collection: 'products', id, context: NO_REVALIDATE })
  if (ids.cat) await payload.delete({ collection: 'categories', id: ids.cat, context: NO_REVALIDATE })
  if (ids.img) await payload.delete({ collection: 'media', id: ids.img, context: NO_REVALIDATE })
})

describe('capa de datos', () => {
  it('lista productos con categoría y fotos pobladas', async () => {
    const mine = (await getProducts()).filter((p) => p.slug.endsWith(`-${RUN}`))
    expect(mine).toHaveLength(2)
    expect(categoryOf(mine[0])?.slug).toBe(slugCat)
    expect(mediaOf(mine[0])[0].alt).toBeTruthy()
  })
  it('busca por slug y devuelve null si no existe', async () => {
    expect((await getProductBySlug(`uno-${RUN}`))?.name).toBe(`Uno ${RUN}`)
    expect(await getProductBySlug('no-existe-jamas')).toBeNull()
  })
  it('lista categorías ordenadas por `order`', async () => {
    const orders = (await getCategories()).map((c) => c.order ?? 0)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })
  it('devuelve la configuración del sitio', async () => {
    expect((await getSiteSettings()).whatsappNumber).toMatch(/^\d{10,15}$/)
  })
})
