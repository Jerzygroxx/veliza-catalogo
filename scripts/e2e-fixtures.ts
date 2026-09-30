import { config as loadEnv } from 'dotenv'
import config from '../src/payload.config'
import { getPayload } from 'payload'
import sharp from 'sharp'
import { E2E } from '../tests/e2e/fixtures'

const NO_REVALIDATE = { disableRevalidate: true }

// `payload run` carga `.env` (la base de desarrollo) si nadie fijó otra: se exige que sea la de `.env.test`.
const testUrl = loadEnv({ path: '.env.test', processEnv: {}, quiet: true }).parsed?.DATABASE_URL
if (!testUrl || process.env.DATABASE_URL !== testUrl) {
  console.error('Abortado: estos fixtures solo se ejecutan contra la base `test` (DATABASE_URL de .env.test).')
  process.exit(1)
}
const E2E_SLUGS = [E2E.colorProduct, E2E.soldOutProduct, E2E.plainProduct]

async function down() {
  const payload = await getPayload({ config })
  const prods = await payload.find({ collection: 'products', where: { slug: { in: E2E_SLUGS } }, limit: 50, depth: 0 })
  const mediaIds = new Set<number>()
  for (const p of prods.docs) {
    for (const m of p.images ?? []) mediaIds.add(typeof m === 'number' ? m : m.id)
    await payload.delete({ collection: 'products', id: p.id, context: NO_REVALIDATE })
  }
  const cats = await payload.find({ collection: 'categories', where: { slug: { equals: E2E.category } }, limit: 5, depth: 0 })
  for (const c of cats.docs) await payload.delete({ collection: 'categories', id: c.id, context: NO_REVALIDATE })
  for (const id of mediaIds) {
    await payload.delete({ collection: 'media', id, context: NO_REVALIDATE }).catch(() => undefined)
  }
}

async function up() {
  await down()
  const payload = await getPayload({ config })
  const data = await sharp({ create: { width: 1200, height: 1500, channels: 3, background: '#A48D78' } })
    .jpeg()
    .toBuffer()
  const img = await payload.create({
    collection: 'media',
    data: { alt: 'Foto de prueba E2E' },
    file: { data, mimetype: 'image/jpeg', name: 'e2e-foto.jpg', size: data.length },
    context: NO_REVALIDATE,
  })
  const cat = await payload.create({
    collection: 'categories',
    data: { name: 'Prueba E2E', slug: E2E.category, order: 99 },
    context: NO_REVALIDATE,
  })
  const base = { category: cat.id, images: [img.id] }
  await payload.create({
    collection: 'products',
    data: {
      ...base,
      name: 'Prenda con color',
      slug: E2E.colorProduct,
      price: 41000,
      colors: [{ name: 'Negro' }, { name: E2E.colorName, swatch: '#722F37' }],
    },
    context: NO_REVALIDATE,
  })
  await payload.create({
    collection: 'products',
    data: { ...base, name: 'Prenda agotada', slug: E2E.soldOutProduct, price: 30000, soldOut: true, colors: [{ name: 'Blanco' }] },
    context: NO_REVALIDATE,
  })
  await payload.create({
    collection: 'products',
    data: { ...base, name: 'Prenda simple', slug: E2E.plainProduct, price: 52000 },
    context: NO_REVALIDATE,
  })
}

// `payload run` termina en cuanto el módulo se evalúa: por eso se usa await de nivel superior
// (igual que el seed) y no una promesa suelta. El modo llega como último argumento.
const mode = process.argv.at(-1)
if (mode !== 'up' && mode !== 'down') {
  console.error('Uso: e2e-fixtures.ts up|down')
  process.exit(1)
}
try {
  await (mode === 'up' ? up() : down())
  console.log(`E2E fixtures: ${mode} listo`)
  process.exit(0)
} catch (e) {
  console.error(e)
  process.exit(1)
}
