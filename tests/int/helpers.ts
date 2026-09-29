import type { Payload } from 'payload'
import sharp from 'sharp'

/** Sufijo único por ejecución, para no chocar con datos de ejecuciones anteriores. */
export const RUN = Date.now().toString(36)

export const NO_REVALIDATE = { disableRevalidate: true }

export async function createTestImage(payload: Payload, alt = `prueba-${RUN}`) {
  const data = await sharp({
    create: { width: 1200, height: 1500, channels: 3, background: '#A48D78' },
  })
    .jpeg()
    .toBuffer()
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/jpeg', name: `${alt}.jpg`, size: data.length },
    context: NO_REVALIDATE,
  })
}
