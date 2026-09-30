'use client'
import React, { useState } from 'react'
import type { Img } from '../../lib/images'
import { PhotoImage } from './PhotoImage'

export function Gallery({ images, soldOut }: { images: Img[]; soldOut?: boolean }) {
  const [i, setI] = useState(0)
  const current = images[i] ?? images[0]
  return (
    <div>
      <div className="aspect-[4/5] overflow-hidden bg-superficie">
        <PhotoImage img={current} sizes="(min-width:768px) 50vw, 100vw" priority grayscale={soldOut} />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Ver foto ${idx + 1} de ${images.length}`}
                aria-current={idx === i}
                className={`aspect-[4/5] min-h-11 w-full overflow-hidden border ${idx === i ? 'border-texto' : 'border-arena'}`}
              >
                <PhotoImage img={img} sizes="20vw" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
