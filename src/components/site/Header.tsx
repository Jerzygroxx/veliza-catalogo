import Link from 'next/link'
import React from 'react'
import { Heart } from './Decor'
import { MobileMenu } from './MobileMenu'

export const NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/como-comprar', label: 'Cómo comprar' },
]

export function Header() {
  return (
    <header className="relative border-b border-arena bg-fondo">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-fondo focus:p-2">
        Saltar al contenido
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-3xl font-medium" aria-label="Véliza, inicio">
          <Heart className="text-roca" />
          Véliza
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex gap-8 text-sm uppercase tracking-[0.18em]">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileMenu links={NAV_LINKS} />
      </div>
    </header>
  )
}
