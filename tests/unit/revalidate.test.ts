import { revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { expireTags, revalidateAfterChange } from '../../src/hooks/revalidate'
import { CACHE_TAGS } from '../../src/lib/cache-tags'

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear()
})

describe('expireTags', () => {
  it('expira cada etiqueta de inmediato', () => {
    expireTags([CACHE_TAGS.products, CACHE_TAGS.categories], {})
    expect(revalidateTag).toHaveBeenCalledTimes(2)
    expect(revalidateTag).toHaveBeenCalledWith('products', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('categories', { expire: 0 })
  })
  it('no hace nada cuando el contexto lo desactiva (seed y pruebas)', () => {
    expireTags([CACHE_TAGS.products], { disableRevalidate: true })
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('revalidateAfterChange', () => {
  it('devuelve el mismo documento', () => {
    const hook = revalidateAfterChange([CACHE_TAGS.products])
    const doc = { id: 1 }
    const result = hook({ doc, context: {} } as unknown as Parameters<typeof hook>[0])
    expect(result).toBe(doc)
    expect(revalidateTag).toHaveBeenCalledWith('products', { expire: 0 })
  })
})
