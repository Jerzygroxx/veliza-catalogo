import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestImage, NO_REVALIDATE, RUN } from './helpers'

let payload: Payload
let categoryId: number
let imageId: number
const productIds: number[] = []

async function createProduct(data: Record<string, unknown>) {
  const doc = await payload.create({
    collection: 'products',
    data: { category: categoryId, images: [imageId], price: 40000, ...data } as never,
    context: NO_REVALIDATE,
  })
  productIds.push(doc.id)
  return doc
}

beforeAll(async () => {
  payload = await getPayload({ config })
  const category = await payload.create({
    collection: 'categories',
    data: { name: `Bodies ${RUN}`, order: 1 } as never,
    context: NO_REVALIDATE,
  })
  categoryId = category.id
  imageId = (await createTestImage(payload)).id
})

afterAll(async () => {
  for (const id of productIds) await payload.delete({ collection: 'products', id, context: NO_REVALIDATE })
  await payload.delete({ collection: 'categories', id: categoryId, context: NO_REVALIDATE })
  await payload.delete({ collection: 'media', id: imageId, context: NO_REVALIDATE })
})

describe('productos', () => {
  it('genera el slug desde el nombre y pone la talla por defecto', async () => {
    const doc = await createProduct({ name: `Body Lía ${RUN}` })
    expect(doc.slug).toBe(`body-lia-${RUN}`)
    expect(doc.size).toBe('Talla única (S–M)')
    expect(doc.soldOut).toBe(false)
  })
  it('a un nombre repetido le agrega -2 al slug', async () => {
    const doc = await createProduct({ name: `Body Lía ${RUN}` })
    expect(doc.slug).toBe(`body-lia-${RUN}-2`)
  })
  it('al editar solo el precio conserva un slug personalizado', async () => {
    const doc = await createProduct({ name: `Kenda ${RUN}`, slug: `kenda-especial-${RUN}` })
    const updated = await payload.update({
      collection: 'products',
      id: doc.id,
      data: { price: 36000 },
      context: NO_REVALIDATE,
    })
    expect(updated.slug).toBe(`kenda-especial-${RUN}`)
  })
  it('rechaza un precio escrito con punto (35.000 → 35)', async () => {
    await expect(createProduct({ name: `Barato ${RUN}`, price: 35 })).rejects.toThrow()
  })
  it('rechaza un producto sin fotos', async () => {
    await expect(createProduct({ name: `Sin foto ${RUN}`, images: [] })).rejects.toThrow()
  })
  it('rechaza una muestra de color inválida', async () => {
    await expect(
      createProduct({ name: `Color ${RUN}`, colors: [{ name: 'Negro', swatch: '000000' }] }),
    ).rejects.toThrow()
  })
  it('cualquiera puede leer productos, pero no crearlos sin sesión', async () => {
    const found = await payload.find({ collection: 'products', overrideAccess: false, limit: 1 })
    expect(found.totalDocs).toBeGreaterThan(0)
    await expect(
      payload.create({
        collection: 'products',
        overrideAccess: false,
        data: { name: `Intruso ${RUN}`, category: categoryId, images: [imageId], price: 40000 } as never,
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
})

describe('categorías', () => {
  it('no se puede borrar una categoría con productos', async () => {
    await expect(
      payload.delete({ collection: 'categories', id: categoryId, context: NO_REVALIDATE }),
    ).rejects.toThrow(/No puedes borrar/)
  })
})
