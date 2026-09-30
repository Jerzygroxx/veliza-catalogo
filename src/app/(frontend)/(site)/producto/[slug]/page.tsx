import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { Gallery } from '../../../../../components/store/Gallery'
import { PurchasePanel } from '../../../../../components/store/PurchasePanel'
import { categoryOf, getProductBySlug, getProducts, getSiteSettings, mediaOf } from '../../../../../lib/data'
import { FALLBACK_IMAGE, pickImage, type Img } from '../../../../../lib/images'
import { formatCOP } from '../../../../../lib/price'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug)
  if (!product) return { title: 'Prenda no encontrada' }
  const cover = pickImage(mediaOf(product)[0], 'full')
  return {
    title: product.name,
    description: product.description || `${product.name} · ${formatCOP(product.price)}. Pídela por WhatsApp.`,
    openGraph: cover ? { images: [{ url: cover.src, width: cover.width, height: cover.height }] } : undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) notFound()

  const images = mediaOf(product)
    .map((m) => pickImage(m, 'full'))
    .filter((i): i is Img => i !== null)
  const category = categoryOf(product)
  const soldOut = Boolean(product.soldOut)
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <nav aria-label="Ruta" className="mb-6 text-sm text-texto-suave">
        <Link href="/catalogo" className="underline">
          Catálogo
        </Link>
        {category && (
          <>
            {' / '}
            <Link href={`/catalogo?categoria=${category.slug}`} className="underline">
              {category.name}
            </Link>
          </>
        )}
      </nav>
      <div className="grid gap-10 md:grid-cols-2">
        <Gallery images={images.length ? images : [FALLBACK_IMAGE]} soldOut={soldOut} />
        <div>
          <h1 className="font-serif text-4xl italic leading-tight md:text-5xl">{product.name}</h1>
          <p className="mt-2 text-2xl">{formatCOP(product.price)}</p>
          <p className="mt-1 text-sm uppercase tracking-[0.2em] text-texto-suave">{product.size || 'Talla única (S–M)'}</p>
          {product.description && <p className="mt-6">{product.description}</p>}
          <PurchasePanel
            phone={settings.whatsappNumber}
            productName={product.name}
            productUrl={`${base}/producto/${product.slug}`}
            colors={(product.colors ?? []).map((c) => ({ name: c.name, swatch: c.swatch }))}
            soldOut={soldOut}
          />
          {settings.priceNotice && <p className="mt-8 text-sm text-texto-suave">{settings.priceNotice}</p>}
        </div>
      </div>
    </div>
  )
}
