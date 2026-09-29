import type { Payload } from 'payload'
import { slugify } from '../lib/slugify'
import type { ImageLoader, SeedData } from './types'

export type SeedReport = { categoriesCreated: number; productsCreated: number; settingsFilled: boolean }

const context = { disableRevalidate: true }

/** Crea solo lo que falta. Nunca modifica lo que ya existe (cambios de las dueñas). */
export async function seed(payload: Payload, data: SeedData, loadImages: ImageLoader): Promise<SeedReport> {
  const report: SeedReport = { categoriesCreated: 0, productsCreated: 0, settingsFilled: false }

  const categoryIds = new Map<string, number>()
  for (const category of data.categories) {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
      depth: 0,
    })
    if (docs[0]) {
      categoryIds.set(category.slug, docs[0].id)
      continue
    }
    const created = await payload.create({ collection: 'categories', data: category, context })
    categoryIds.set(category.slug, created.id)
    report.categoriesCreated++
  }

  for (const product of data.products) {
    const slug = slugify(product.name)
    const { totalDocs } = await payload.count({ collection: 'products', where: { slug: { equals: slug } } })
    if (totalDocs > 0) continue

    const categoryId = categoryIds.get(product.category)
    if (categoryId === undefined) {
      throw new Error(`Categoría desconocida "${product.category}" en el producto "${product.name}"`)
    }

    const buffers = await loadImages(product)
    const imageIds: number[] = []
    for (const [index, buffer] of buffers.entries()) {
      const media = await payload.create({
        collection: 'media',
        data: { alt: `${product.name} — foto ${index + 1}` },
        file: { data: buffer, mimetype: 'image/jpeg', name: `${slug}-${index + 1}.jpg`, size: buffer.length },
        context,
      })
      imageIds.push(media.id)
    }

    await payload.create({
      collection: 'products',
      data: {
        name: product.name,
        slug,
        category: categoryId,
        price: product.price,
        colors: product.colors ?? [],
        images: imageIds,
        description: product.description,
        featured: product.featured ?? false,
      },
      context,
    })
    report.productsCreated++
  }

  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (!settings.aboutStory) {
    await payload.updateGlobal({ slug: 'site-settings', data: data.siteSettings, context })
    report.settingsFilled = true
  }

  return report
}
