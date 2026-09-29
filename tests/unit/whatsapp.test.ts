import { describe, expect, it } from 'vitest'
import {
  GREETING_MESSAGE,
  buildGreetingUrl,
  buildProductMessage,
  buildWhatsAppUrl,
} from '../../src/lib/whatsapp'

const productUrl = 'https://veliza.co/producto/body-cloe'

function decode(url: string) {
  const parsed = new URL(url)
  return { host: parsed.host, phone: parsed.pathname.slice(1), text: parsed.searchParams.get('text') }
}

describe('buildProductMessage', () => {
  it('incluye el color elegido', () => {
    expect(buildProductMessage({ productName: 'Body Cloe', color: 'Negro', productUrl })).toBe(
      `¡Hola Véliza! 💕 Me interesa: Body Cloe, color Negro. ¿Está disponible? ${productUrl}`,
    )
  })
  it('sin color pregunta por los colores disponibles', () => {
    expect(buildProductMessage({ productName: 'Body Cloe', productUrl })).toBe(
      `¡Hola Véliza! 💕 Me interesa: Body Cloe. ¿Qué colores tienen disponibles? ${productUrl}`,
    )
  })
  it('un color con solo espacios cuenta como "sin color"', () => {
    expect(buildProductMessage({ productName: 'Body Cloe', color: '   ', productUrl })).toContain(
      '¿Qué colores tienen disponibles?',
    )
  })
})

describe('buildWhatsAppUrl', () => {
  it('arma un enlace wa.me con el número limpio y el mensaje codificado', () => {
    const url = buildWhatsAppUrl({ phone: '+57 318 995 2081', productName: 'Lía', color: 'Rosado', productUrl })
    const { host, phone, text } = decode(url)
    expect(host).toBe('wa.me')
    expect(phone).toBe('573189952081')
    expect(text).toBe(`¡Hola Véliza! 💕 Me interesa: Lía, color Rosado. ¿Está disponible? ${productUrl}`)
    expect(url).toContain('%C2%BFEst') // "¿Est" codificado
  })
  it('falla si no hay número', () => {
    expect(() => buildWhatsAppUrl({ phone: '', productName: 'Lía', productUrl })).toThrow()
  })
})

describe('buildGreetingUrl', () => {
  it('manda el saludo genérico', () => {
    expect(decode(buildGreetingUrl('573189952081')).text).toBe(GREETING_MESSAGE)
    expect(GREETING_MESSAGE).toBe('¡Hola Véliza! 💕 Quiero información.')
  })
})
