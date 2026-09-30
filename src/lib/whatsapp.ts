import { normalizePhone } from './validators'

export type ProductInquiry = {
  phone: string
  productName: string
  color?: string | null
  productUrl: string
}

export const GREETING_MESSAGE = '¡Hola Véliza! Quiero información.'

export function buildProductMessage({ productName, color, productUrl }: Omit<ProductInquiry, 'phone'>): string {
  const name = productName.trim()
  const chosen = color?.trim()
  return chosen
    ? `¡Hola Véliza! Me interesa: ${name}, color ${chosen}. ¿Está disponible? ${productUrl}`
    : `¡Hola Véliza! Me interesa: ${name}. ¿Qué colores tienen disponibles? ${productUrl}`
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = normalizePhone(phone)
  if (!digits) throw new Error('Falta el número de WhatsApp en la configuración del sitio')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppUrl(inquiry: ProductInquiry): string {
  return buildWhatsAppLink(inquiry.phone, buildProductMessage(inquiry))
}

export function buildGreetingUrl(phone: string): string {
  return buildWhatsAppLink(phone, GREETING_MESSAGE)
}
