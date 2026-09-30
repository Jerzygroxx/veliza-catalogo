import { describe, expect, it } from 'vitest'
import { greeting, summarize } from '../../src/lib/dashboard'

describe('greeting', () => {
  it('saluda con el nombre', () => expect(greeting('Isabella')).toBe('Hola, Isabella 💕'))
  it('recorta espacios', () => expect(greeting('  Sara ')).toBe('Hola, Sara 💕'))
  it.each([undefined, null, '', '   '])('sin nombre (%j) saluda sin nombre', (v) => {
    expect(greeting(v as string | null | undefined)).toBe('Hola 💕')
  })
})

describe('summarize', () => {
  it('separa publicadas de agotadas', () => {
    expect(summarize({ total: 29, soldOut: 4 })).toEqual({ published: 25, soldOut: 4 })
  })
  it('catálogo vacío', () => {
    expect(summarize({ total: 0, soldOut: 0 })).toEqual({ published: 0, soldOut: 0 })
  })
  it('nunca da negativos', () => {
    expect(summarize({ total: 2, soldOut: 5 })).toEqual({ published: 0, soldOut: 5 })
  })
  it('null significa "no se pudo consultar"', () => expect(summarize(null)).toBeNull())
})
