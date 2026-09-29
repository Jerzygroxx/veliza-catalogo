import { describe, expect, it } from 'vitest'
import { findAvailableSlug } from '../../src/fields/slug'

const takenBy = (...taken: string[]) => async (candidate: string) => taken.includes(candidate)

describe('findAvailableSlug', () => {
  it('usa el slug base si está libre', async () => {
    expect(await findAvailableSlug('body-cloe', takenBy())).toBe('body-cloe')
  })
  it('agrega -2 si el base está ocupado', async () => {
    expect(await findAvailableSlug('body-cloe', takenBy('body-cloe'))).toBe('body-cloe-2')
  })
  it('sigue contando: -3 si -2 también está ocupado', async () => {
    expect(await findAvailableSlug('body', takenBy('body', 'body-2'))).toBe('body-3')
  })
})
