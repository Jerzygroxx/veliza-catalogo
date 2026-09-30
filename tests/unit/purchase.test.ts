import { describe, expect, it } from 'vitest'
import { purchaseState } from '../../src/lib/purchase'

describe('purchaseState', () => {
  it('agotada gana siempre', () => {
    expect(purchaseState({ colorCount: 3, selected: 'Negro', soldOut: true })).toBe('sold-out')
  })
  it('con colores y ninguno elegido pide elegir', () => {
    expect(purchaseState({ colorCount: 2, selected: null, soldOut: false })).toBe('needs-color')
  })
  it('con color elegido está lista', () => {
    expect(purchaseState({ colorCount: 2, selected: 'Rojo', soldOut: false })).toBe('ready')
  })
  it('sin colores registrados está lista', () => {
    expect(purchaseState({ colorCount: 0, selected: null, soldOut: false })).toBe('ready')
  })
})
