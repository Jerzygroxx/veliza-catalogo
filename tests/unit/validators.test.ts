import { describe, expect, it } from 'vitest'
import {
  MIN_PRICE,
  normalizePhone,
  validateHex,
  validateHttpsUrl,
  validatePrice,
  validateWhatsAppNumber,
} from '../../src/lib/validators'

describe('validatePrice', () => {
  it('acepta enteros desde 1000', () => {
    expect(validatePrice(MIN_PRICE)).toBe(true)
    expect(validatePrice(35000)).toBe(true)
  })
  it('rechaza 35 (alguien escribió "35.000" con punto) y explica cómo escribirlo', () => {
    const result = validatePrice(35)
    expect(result).toEqual(expect.stringContaining('sin puntos'))
  })
  it('rechaza decimales, vacíos y negativos', () => {
    expect(validatePrice(35000.5)).not.toBe(true)
    expect(validatePrice(null)).not.toBe(true)
    expect(validatePrice(undefined)).not.toBe(true)
    expect(validatePrice(-5000)).not.toBe(true)
  })
})

describe('validateHex', () => {
  it('acepta vacío y #RRGGBB', () => {
    expect(validateHex(undefined)).toBe(true)
    expect(validateHex('')).toBe(true)
    expect(validateHex('#3B2A20')).toBe(true)
    expect(validateHex('#ffffff')).toBe(true)
  })
  it('rechaza formatos incompletos', () => {
    expect(validateHex('000000')).not.toBe(true)
    expect(validateHex('#FFF')).not.toBe(true)
    expect(validateHex('negro')).not.toBe(true)
  })
})

describe('normalizePhone / validateWhatsAppNumber', () => {
  it('deja solo dígitos', () => {
    expect(normalizePhone('+57 318 995-2081')).toBe('573189952081')
  })
  it('acepta de 10 a 15 dígitos', () => {
    expect(validateWhatsAppNumber('573189952081')).toBe(true)
  })
  it('rechaza textos con símbolos o demasiado cortos', () => {
    expect(validateWhatsAppNumber('+57 318')).not.toBe(true)
    expect(validateWhatsAppNumber('3189952')).not.toBe(true)
    expect(validateWhatsAppNumber(undefined)).not.toBe(true)
  })
})

describe('validateHttpsUrl', () => {
  it('acepta vacío y enlaces https', () => {
    expect(validateHttpsUrl('')).toBe(true)
    expect(validateHttpsUrl(undefined)).toBe(true)
    expect(validateHttpsUrl('https://www.instagram.com/veliza_storebq')).toBe(true)
  })
  it('rechaza javascript:, http: y textos que no son enlaces', () => {
    expect(validateHttpsUrl('javascript:alert(1)')).not.toBe(true)
    expect(validateHttpsUrl('http://instagram.com/x')).not.toBe(true)
    expect(validateHttpsUrl('@veliza_storebq')).not.toBe(true)
  })
})
