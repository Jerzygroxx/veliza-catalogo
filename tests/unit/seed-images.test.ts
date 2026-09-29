import { mkdtemp, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { createCatalogImageLoader, pagePath, placeholderImage } from '../../src/seed/images'

describe('imágenes del seed', () => {
  it('la imagen provisional es un JPEG de 800x1000', async () => {
    const meta = await sharp(await placeholderImage()).metadata()
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 800, 1000])
  })
  it('sin recortes definidos usa la imagen provisional', async () => {
    const load = createCatalogImageLoader('no-existe')
    const buffers = await load({ name: 'Lía', category: 'blusas-y-tops', price: 45000 })
    expect(buffers).toHaveLength(1)
  })
  it('recorta cada foto de la página indicada', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'veliza-seed-'))
    await mkdir(path.join(dir, 'pages'))
    await sharp({ create: { width: 1000, height: 1400, channels: 3, background: '#FAF9F6' } })
      .png()
      .toFile(pagePath(dir, 7))
    const load = createCatalogImageLoader(dir)
    const buffers = await load({
      name: 'Lía',
      category: 'blusas-y-tops',
      price: 45000,
      source: { page: 7, crops: [{ left: 0, top: 0, width: 400, height: 500 }, { left: 500, top: 600, width: 480, height: 600 }] },
    })
    const sizes = await Promise.all(buffers.map(async (b) => (await sharp(b).metadata()).width))
    expect(sizes).toEqual([400, 480])
  })
  it('explica qué hacer si falta la página', async () => {
    const load = createCatalogImageLoader('no-existe')
    await expect(
      load({ name: 'Lía', category: 'blusas-y-tops', price: 45000, source: { page: 7, crops: [{ left: 0, top: 0, width: 10, height: 10 }] } }),
    ).rejects.toThrow(/npm run seed:pages/)
  })
})
