export const MIN_PRICE = 1000

const PRICE_HINT = 'Escribe el precio en pesos, sin puntos. Ej: 35000'

export function validatePrice(value: unknown): true | string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return PRICE_HINT
  if (!Number.isInteger(value)) return 'El precio no puede tener decimales. Ej: 35000'
  if (value < MIN_PRICE) {
    return `El precio mínimo es 1000. Si escribiste "35.000", escríbelo sin puntos: 35000`
  }
  return true
}

const HEX = /^#[0-9a-fA-F]{6}$/

export function validateHex(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  return typeof value === 'string' && HEX.test(value) ? true : 'Usa el formato #RRGGBB. Ej: #3B2A20'
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function validateWhatsAppNumber(value: unknown): true | string {
  return typeof value === 'string' && /^\d{10,15}$/.test(value)
    ? true
    : 'Escribe el número con indicativo de país, solo dígitos. Ej: 573189952081'
}

export function validateHttpsUrl(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  if (typeof value !== 'string') return 'Escribe un enlace que empiece por https://'
  try {
    return new URL(value).protocol === 'https:' ? true : 'El enlace debe empezar por https://'
  } catch {
    return 'Escribe un enlace completo. Ej: https://www.instagram.com/veliza_storebq'
  }
}
