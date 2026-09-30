import Link from 'next/link'
import React from 'react'
import { PhotoImage } from '../../../components/store/PhotoImage'
import { ProductCard } from '../../../components/store/ProductCard'
import { SectionTitle } from '../../../components/store/SectionTitle'
import { catalogHref, sortProducts } from '../../../lib/catalog'
import { categoryOf, getCategories, getProducts, getSiteSettings, mediaOf } from '../../../lib/data'
import { FALLBACK_IMAGE, pickImage } from '../../../lib/images'
import type { Category, Product } from '../../../payload-types'

const button =
  'inline-flex min-h-12 items-center justify-center bg-texto px-8 text-sm font-medium uppercase tracking-[0.18em] text-fondo hover:opacity-90'

function tileImage(category: Category, products: Product[]) {
  const own = pickImage(category.image, 'card')
  if (own) return own
  const first = products.find((p) => categoryOf(p)?.id === category.id)
  return (first && pickImage(mediaOf(first)[0], 'card')) || FALLBACK_IMAGE
}

export default async function HomePage() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSiteSettings()])
  const available = sortProducts(products, 'recientes')
  const featured = available.filter((p) => p.featured && !p.soldOut)
  const highlights = (featured.length ? featured : available.filter((p) => !p.soldOut)).slice(0, 4)
  const steps = settings.howToBuySteps ?? []

  return (
    <>
      <section className="bg-superficie px-4 py-20 text-center">
        <p className="font-script text-4xl text-roca-fuerte" aria-hidden="true">
          con mucho amor
        </p>
        <h1 className="mt-2 font-serif text-6xl md:text-8xl">Véliza</h1>
        <p className="mt-3 text-sm uppercase tracking-[0.35em]">Ropa • Estilo • Tú</p>
        <Link href="/catalogo" className={`${button} mt-10`}>
          Ver catálogo
        </Link>
      </section>

      {highlights.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20" aria-labelledby="destacados">
          <SectionTitle script="lo que más nos gusta">
            <span id="destacados">Destacados</span>
          </SectionTitle>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {highlights.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </ul>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20" aria-labelledby="categorias">
          <SectionTitle script="encuentra tu estilo">
            <span id="categorias">Categorías</span>
          </SectionTitle>
          <ul className="grid gap-4 md:grid-cols-3">
            {categories.map((c) => (
              <li key={c.id} className="reveal">
                <Link
                  href={catalogHref({ categoria: c.slug, orden: 'recientes' })}
                  className="group relative block aspect-[4/5] overflow-hidden bg-superficie"
                >
                  <PhotoImage
                    img={tileImage(c, products)}
                    sizes="(min-width:768px) 33vw, 100vw"
                    className="transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-fondo/90 py-3 text-center font-serif text-2xl">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {settings.aboutShort && (
        <section className="mx-auto max-w-2xl px-4 pt-20 text-center" aria-labelledby="nosotras">
          <SectionTitle script="¿Quiénes somos?">
            <span id="nosotras">Nuestra historia</span>
          </SectionTitle>
          <p>{settings.aboutShort}</p>
          <Link href="/quienes-somos" className="mt-4 inline-flex min-h-11 items-center underline">
            Conócenos
          </Link>
        </section>
      )}

      {steps.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 pt-20" aria-labelledby="como">
          <SectionTitle script="es muy fácil">
            <span id="como">Cómo comprar</span>
          </SectionTitle>
          <ol className="grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.id ?? i} className="text-center">
                <span className="font-serif text-5xl text-roca-fuerte" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="mt-2">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-center">
            <Link href="/como-comprar" className="inline-flex min-h-11 items-center underline">
              Ver entregas y cambios
            </Link>
          </p>
        </section>
      )}
    </>
  )
}
