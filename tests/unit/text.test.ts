import { describe, expect, it } from 'vitest'
import { paragraphs } from '../../src/lib/text'

describe('paragraphs', () => {
  it('separa por línea en blanco', () => expect(paragraphs('uno\n\ndos')).toEqual(['uno', 'dos']))
  it('ignora líneas en blanco de más y espacios', () =>
    expect(paragraphs('\n\n  uno  \n\n\n\n dos \n\n')).toEqual(['uno', 'dos']))
  it.each([undefined, null, '', '   \n '])('vacío (%j) → []', (v) =>
    expect(paragraphs(v as string | null | undefined)).toEqual([]),
  )
})
