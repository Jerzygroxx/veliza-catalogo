import { describe, expect, it } from 'vitest'
import { MIN_PASSWORD_LENGTH, sessionCookies, validatePasswordLength } from '../../src/lib/auth-policy'

describe('validatePasswordLength', () => {
  it('exige al menos 12 caracteres', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(12)
    expect(validatePasswordLength('123456')).toEqual(expect.stringContaining('12 caracteres'))
    expect(validatePasswordLength('una-frase-larga-y-segura')).toBe(true)
  })
})

describe('sessionCookies', () => {
  it('marca la cookie como Secure cuando el sitio usa https', () => {
    expect(sessionCookies('https://veliza.co')).toEqual({ secure: true, sameSite: 'Lax' })
  })
  it('en local (http) no, o el inicio de sesión no funcionaría', () => {
    expect(sessionCookies('http://localhost:3000')).toEqual({ secure: false, sameSite: 'Lax' })
  })
})
