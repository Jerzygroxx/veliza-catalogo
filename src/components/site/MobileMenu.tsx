'use client'
import Link from 'next/link'
import React, { useState } from 'react'

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-arena"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {open ? '×' : '☰'}
        </span>
      </button>
      {open && (
        <nav id="menu-movil" aria-label="Principal" className="absolute inset-x-0 top-full z-30 border-b border-arena bg-fondo px-4 pb-4">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center text-lg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
