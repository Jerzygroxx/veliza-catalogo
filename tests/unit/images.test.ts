import { describe, expect, it } from 'vitest'
import type { Media } from '../../src/payload-types'
import { FALLBACK_IMAGE, pickImage } from '../../src/lib/images'

const media = (over: Partial<Media> = {}): Media => ({
  id: 1,
  alt: 'Body Cloe',
  updatedAt: '',
  createdAt: '',
  url: '/api/media/file/orig.jpg',
  width: 1000,
  height: 1250,
  sizes: { card: { url: '/api/media/file/card.webp', width: 800, height: 1000 } },
  ...over,
})

describe('pickImage', () => {
  it('usa el tamaño pedido', () => {
    expect(pickImage(media(), 'card')).toEqual({ src: '/api/media/file/card.webp', width: 800, height: 1000, alt: 'Body Cloe' })
  })
  it('cae al original si falta ese tamaño', () => {
    expect(pickImage(media(), 'full')).toEqual({ src: '/api/media/file/orig.jpg', width: 1000, height: 1250, alt: 'Body Cloe' })
  })
  it('devuelve null si es solo un id o no hay nada', () => {
    expect(pickImage(5, 'card')).toBeNull()
    expect(pickImage(null, 'card')).toBeNull()
    expect(pickImage(undefined, 'card')).toBeNull()
  })
  it('devuelve null si el medio no tiene url', () => {
    expect(pickImage(media({ url: null, sizes: {} }), 'card')).toBeNull()
  })
  it('expone una imagen de reserva', () => {
    expect(FALLBACK_IMAGE.src).toMatch(/^\//)
    expect(FALLBACK_IMAGE.width / FALLBACK_IMAGE.height).toBeCloseTo(0.8)
  })
})
