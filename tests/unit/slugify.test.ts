import { describe, expect, it } from 'vitest'
import { slugify } from '../../src/lib/slugify'

describe('slugify', () => {
  it.each([
    ['Body Cloe', 'body-cloe'],
    ['Lía', 'lia'],
    ['Body M.L', 'body-m-l'],
    ['  Top  Blonda   Copa ', 'top-blonda-copa'],
    ['Niña & Ñandú', 'nina-nandu'],
    ['¡Hola!', 'hola'],
    ['', ''],
  ])('convierte %j en %j', (input, expected) => {
    expect(slugify(input)).toBe(expected)
  })
})
