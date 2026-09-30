import type { Metadata } from 'next'
import React from 'react'
import { SectionTitle } from '../../../../components/store/SectionTitle'
import { getSiteSettings } from '../../../../lib/data'

export const metadata: Metadata = { title: 'Cómo comprar' }

const List = ({ items, ordered }: { items?: { text: string; id?: string | null }[] | null; ordered?: boolean }) => {
  const rows = items ?? []
  if (!rows.length) return null
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className={`mt-3 grid gap-2 pl-5 ${ordered ? 'list-decimal' : 'list-disc'}`}>
      {rows.map((r, i) => (
        <li key={r.id ?? i}>{r.text}</li>
      ))}
    </Tag>
  )
}

export default async function HowToBuyPage() {
  const s = await getSiteSettings()
  return (
    <div className="mx-auto max-w-2xl px-4 pt-12">
      <SectionTitle script="¡Muy importante!">Cómo comprar</SectionTitle>
      {s.antifraudNotice && <p className="mb-10 bg-crema p-4 text-center">{s.antifraudNotice}</p>}
      <section>
        <h2 className="font-serif text-2xl">Paso a paso</h2>
        <List items={s.howToBuySteps} ordered />
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Entregas y pagos</h2>
        <List items={s.deliveryOptions} />
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Cambios</h2>
        <List items={s.exchangePolicies} />
      </section>
      {s.priceNotice && <p className="mt-10 text-sm text-texto-suave">{s.priceNotice}</p>}
    </div>
  )
}
