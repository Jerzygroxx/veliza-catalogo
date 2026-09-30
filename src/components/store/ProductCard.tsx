import Link from 'next/link'
import React from 'react'
import { mediaOf } from '../../lib/data'
import { FALLBACK_IMAGE, pickImage } from '../../lib/images'
import { formatCOP } from '../../lib/price'
import type { Product } from '../../payload-types'
import { PhotoImage } from './PhotoImage'

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const photos = mediaOf(product)
  const cover = pickImage(photos[0], 'card') ?? FALLBACK_IMAGE
  const hover = pickImage(photos[1], 'card')
  const soldOut = Boolean(product.soldOut)
  const colors = product.colors ?? []

  return (
    <li className="reveal group">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-superficie">
          <PhotoImage
            img={cover}
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
            priority={priority}
            grayscale={soldOut}
          />
          {hover && !soldOut && (
            <PhotoImage
              img={hover}
              sizes="25vw"
              className="absolute inset-0 opacity-0 transition-opacity duration-200 motion-reduce:transition-none md:group-hover:opacity-100"
            />
          )}
          {soldOut && (
            <span className="absolute left-2 top-2 bg-fondo px-2 py-1 text-xs uppercase tracking-[0.2em]">Agotada</span>
          )}
        </div>
        <h3 className="mt-3 font-serif text-xl italic leading-tight">{product.name}</h3>
        <p className="text-texto-suave">{formatCOP(product.price)}</p>
        {colors.length > 0 && (
          <ul className="mt-1 flex gap-1" aria-label={`Colores: ${colors.map((c) => c.name).join(', ')}`}>
            {colors.slice(0, 6).map((c) => (
              <li
                key={c.id ?? c.name}
                className="h-3 w-3 rounded-full border border-arena"
                style={{ background: c.swatch || '#E6DAC8' }}
              />
            ))}
          </ul>
        )}
      </Link>
    </li>
  )
}
