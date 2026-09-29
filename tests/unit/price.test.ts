import { describe, expect, it } from 'vitest'
import { formatCOP } from '../../src/lib/price'

describe('formatCOP', () => {
  it.each([
    [35000, '$ 35.000'],
    [1000, '$ 1.000'],
    [999, '$ 999'],
    [1250000, '$ 1.250.000'],
    [35000.4, '$ 35.000'],
  ])('formatea %d como %j', (value, expected) => {
    expect(formatCOP(value)).toBe(expected)
  })
})
