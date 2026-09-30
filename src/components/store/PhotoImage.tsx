import Image from 'next/image'
import React from 'react'
import type { Img } from '../../lib/images'

export function PhotoImage({
  img,
  sizes,
  priority,
  className = '',
  grayscale,
}: {
  img: Img
  sizes: string
  priority?: boolean
  className?: string
  grayscale?: boolean
}) {
  return (
    <Image
      src={img.src}
      alt={img.alt}
      width={img.width}
      height={img.height}
      sizes={sizes}
      priority={priority}
      unoptimized
      className={`h-full w-full object-cover ${grayscale ? 'grayscale opacity-60' : ''} ${className}`}
    />
  )
}
