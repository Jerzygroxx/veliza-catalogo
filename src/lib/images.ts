import type { Media } from '../payload-types'

export type Img = { src: string; width: number; height: number; alt: string }
export type ImgSize = 'thumbnail' | 'card' | 'full'

/** Imagen de reserva (crema, 4:5) para cuando una prenda no tiene foto utilizable. */
export const FALLBACK_IMAGE: Img = { src: '/fallback-foto.svg', width: 800, height: 1000, alt: 'Foto próximamente' }

export function pickImage(media: number | Media | null | undefined, size: ImgSize): Img | null {
  if (!media || typeof media === 'number') return null
  const sized = media.sizes?.[size]
  if (sized?.url && sized.width && sized.height) {
    return { src: sized.url, width: sized.width, height: sized.height, alt: media.alt }
  }
  if (media.url && media.width && media.height) {
    return { src: media.url, width: media.width, height: media.height, alt: media.alt }
  }
  return null
}
