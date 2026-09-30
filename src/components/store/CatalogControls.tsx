import Link from 'next/link'
import React from 'react'
import { catalogHref, type SortKey } from '../../lib/catalog'
import type { Category } from '../../payload-types'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recientes', label: 'Novedades' },
  { key: 'precio-asc', label: 'Precio: menor a mayor' },
  { key: 'precio-desc', label: 'Precio: mayor a menor' },
]

const chip = (active: boolean) =>
  `inline-flex min-h-11 items-center rounded-full border px-4 text-sm ${
    active ? 'border-texto bg-texto text-fondo' : 'border-arena hover:bg-superficie'
  }`

export function CatalogControls({
  categories,
  categoria,
  orden,
}: {
  categories: Category[]
  categoria: string | null
  orden: SortKey
}) {
  return (
    <div className="mb-8 grid gap-4">
      <nav aria-label="Categorías">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href={catalogHref({ categoria: null, orden })}
              aria-current={!categoria ? 'page' : undefined}
              className={chip(!categoria)}
            >
              Todo
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={catalogHref({ categoria: c.slug, orden })}
                aria-current={categoria === c.slug ? 'page' : undefined}
                className={chip(categoria === c.slug)}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="Ordenar">
        <ul className="flex flex-wrap items-center gap-2">
          <li className="text-xs uppercase tracking-[0.2em] text-texto-suave">Ordenar</li>
          {SORTS.map((s) => (
            <li key={s.key}>
              <Link
                href={catalogHref({ categoria, orden: s.key })}
                aria-current={orden === s.key ? 'page' : undefined}
                className={chip(orden === s.key)}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
