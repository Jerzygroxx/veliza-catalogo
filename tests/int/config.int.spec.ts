import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { beforeAll, describe, expect, it } from 'vitest'
import { createTestImage, NO_REVALIDATE, RUN } from './helpers'

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

describe('contraseñas', () => {
  it(`rechaza contraseñas de menos de 12 caracteres`, async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: { email: `corta-${RUN}@example.com`, password: '123456' },
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow(/12 caracteres/)
  })
  it('acepta una contraseña larga', async () => {
    const user = await payload.create({
      collection: 'users',
      data: { email: `larga-${RUN}@example.com`, password: 'una-frase-larga-y-segura' },
      context: NO_REVALIDATE,
    })
    await payload.delete({ collection: 'users', id: user.id, context: NO_REVALIDATE })
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

describe('usuarias: solo editan su propia cuenta', () => {
  it('no puede editar ni borrar a otra usuaria', async () => {
    const mk = (n: string) =>
      payload.create({
        collection: 'users',
        data: { email: `${n}-${RUN}@example.com`, password: 'una-frase-larga-y-segura' },
        context: NO_REVALIDATE,
      })
    const a = await mk('a')
    const b = await mk('b')
    try {
      await expect(
        payload.update({ collection: 'users', id: b.id, data: { name: 'x' }, user: a, overrideAccess: false }),
      ).rejects.toThrow()
      await expect(
        payload.delete({ collection: 'users', id: b.id, user: a, overrideAccess: false }),
      ).rejects.toThrow()
      const own = await payload.update({
        collection: 'users',
        id: a.id,
        data: { name: 'yo' },
        user: a,
        overrideAccess: false,
      })
      expect(own.name).toBe('yo')
    } finally {
      await payload.delete({ collection: 'users', id: a.id, context: NO_REVALIDATE })
      await payload.delete({ collection: 'users', id: b.id, context: NO_REVALIDATE })
    }
  })
})
