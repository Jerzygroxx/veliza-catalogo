import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { slugify } from '../src/lib/slugify'
import { products } from '../src/seed/data/products'
import { createCatalogImageLoader } from '../src/seed/images'

const assets = process.env.SEED_ASSETS_DIR || 'seed-assets'
const out = path.join(assets, 'preview')
await mkdir(out, { recursive: true })
const load = createCatalogImageLoader(assets)
for (const product of products) {
  const buffers = await load(product)
  await Promise.all(buffers.map((b, i) => writeFile(path.join(out, `${slugify(product.name)}-${i + 1}.jpg`), b)))
}
console.log(`Vista previa en ${out}`)
