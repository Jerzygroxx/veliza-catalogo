import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import type { ImageLoader } from './types'

/** Imagen color crema (token `crema`) para productos sin foto recortada. */
export async function placeholderImage(): Promise<Buffer> {
  return sharp({ create: { width: 800, height: 1000, channels: 3, background: '#E6DAC8' } })
    .jpeg({ quality: 80 })
    .toBuffer()
}

export function pagePath(assetsDir: string, page: number): string {
  return path.join(assetsDir, 'pages', `page-${String(page).padStart(2, '0')}.png`)
}

export function createCatalogImageLoader(assetsDir: string): ImageLoader {
  return async (product) => {
    const source = product.source
    if (!source || source.crops.length === 0) return [await placeholderImage()]
    return Promise.all(
      source.crops.map(({ page = source.page, ...region }) => {
        const file = pagePath(assetsDir, page)
        if (!existsSync(file)) {
          throw new Error(`No existe ${file}. Ejecuta primero: npm run seed:pages`)
        }
        return sharp(file).extract(region).jpeg({ quality: 88 }).toBuffer()
      }),
    )
  }
}
