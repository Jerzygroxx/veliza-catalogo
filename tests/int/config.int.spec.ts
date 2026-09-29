import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { beforeAll, describe, expect, it } from 'vitest'
import { createTestImage, NO_REVALIDATE } from './helpers'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('configuración del panel', () => {
  it('vive en /panel-veliza', () => {
    expect(payload.config.routes.admin).toBe('/panel-veliza')
  })
  it('tiene GraphQL desactivado', () => {
    expect(payload.config.graphQL.disable).toBe(true)
  })
  it('está en español', () => {
    expect(payload.config.i18n.fallbackLanguage).toBe('es')
  })
  it('bloquea una cuenta 10 minutos tras 5 intentos fallidos', () => {
    const auth = payload.collections.users.config.auth
    expect(auth.maxLoginAttempts).toBe(5)
    expect(auth.lockTime).toBe(10 * 60 * 1000)
  })
})

describe('acceso sin sesión', () => {
  it('no puede listar usuarias', async () => {
    await expect(payload.find({ collection: 'users', overrideAccess: false })).rejects.toThrow()
  })
  it('no puede subir imágenes', async () => {
    // Un JPEG válido: así el rechazo solo puede venir del control de acceso.
    const data = await sharp({ create: { width: 10, height: 10, channels: 3, background: '#FFFFFF' } })
      .jpeg()
      .toBuffer()
    await expect(
      payload.create({
        collection: 'media',
        overrideAccess: false,
        data: { alt: 'x' },
        file: { data, mimetype: 'image/jpeg', name: 'x.jpg', size: data.length },
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
})

describe('subida de imágenes', () => {
  it('rechaza archivos que no son JPG, PNG ni WebP', async () => {
    const data = Buffer.from('%PDF-1.4\n%falso\n')
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'documento' },
        file: { data, mimetype: 'application/pdf', name: 'documento.pdf', size: data.length },
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
  it('genera los tamaños card (800px, WebP) y thumbnail', async () => {
    const doc = await createTestImage(payload)
    expect(doc.sizes?.card?.width).toBe(800)
    expect(doc.sizes?.card?.mimeType).toBe('image/webp')
    expect(doc.sizes?.thumbnail?.width).toBe(400)
    await payload.delete({ collection: 'media', id: doc.id, context: NO_REVALIDATE })
  })
})
