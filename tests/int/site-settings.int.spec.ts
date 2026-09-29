import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'
import { NO_REVALIDATE } from './helpers'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('configuración del sitio', () => {
  it('cualquiera puede leerla', async () => {
    const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
    expect(settings).toBeDefined()
  })
  it('nadie sin sesión puede modificarla', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        overrideAccess: false,
        data: { priceNotice: 'hackeado' },
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
  it('guarda el WhatsApp solo con dígitos aunque se escriba con + y espacios', async () => {
    const updated = await payload.updateGlobal({
      slug: 'site-settings',
      data: { whatsappNumber: '+57 318 995 2081' },
      context: NO_REVALIDATE,
    })
    expect(updated.whatsappNumber).toBe('573189952081')
  })
  it('rechaza enlaces de redes que no sean https', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: { instagramUrl: 'javascript:alert(1)' },
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
})
