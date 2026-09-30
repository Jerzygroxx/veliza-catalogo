import Link from 'next/link'
import React from 'react'
import { Heart } from '../../../components/site/Decor'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <Heart className="mx-auto text-roca" />
      <h1 className="mt-4 font-serif text-5xl">No encontramos esa página</h1>
      <p className="mt-3">Puede que la prenda ya no esté o que el enlace tenga un error 💕</p>
      <Link
        href="/catalogo"
        className="mt-8 inline-flex min-h-12 items-center bg-texto px-8 text-sm uppercase tracking-[0.18em] text-fondo"
      >
        Ver el catálogo
      </Link>
    </div>
  )
}
