import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { CatalogControls } from '../../../../components/store/CatalogControls'
import { ProductCard } from '../../../../components/store/ProductCard'
import { parseCatalogParams, sortProducts } from '../../../../lib/catalog'
import { categoryOf, getCategories, getProducts } from '../../../../lib/data'

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Blusas, bodies, vestidos y más. Elige tu prenda y pídela por WhatsApp.',
}

type Props = { searchParams: Promise<{ categoria?: string | string[]; orden?: string | string[] }> }

export default async function CatalogPage({ searchParams }: Props) {
  const [categories, products, raw] = await Promise.all([getCategories(), getProducts(), searchParams])
  const { categoria, orden } = parseCatalogParams(
    raw,
    categories.map((c) => c.slug),
  )
  const visible = sortProducts(categoria ? products.filter((p) => categoryOf(p)?.slug === categoria) : products, orden)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="font-serif text-4xl md:text-5xl">Catálogo</h1>
      <p className="mb-8 mt-2 text-texto-suave">Elige tu prenda y pídela por WhatsApp 💕</p>
      <CatalogControls categories={categories} categoria={categoria} orden={orden} />
      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl">Pronto tendremos novedades aquí 💕</p>
          <Link href="/catalogo" className="mt-4 inline-flex min-h-11 items-center underline">
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </ul>
      )}
    </div>
  )
}
