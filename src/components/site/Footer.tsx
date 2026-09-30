import Link from 'next/link'
import React from 'react'
import type { SiteSetting } from '../../payload-types'
import { buildGreetingUrl } from '../../lib/whatsapp'
import { Sparkle } from './Decor'
import { NAV_LINKS } from './Header'

export function Footer({ settings }: { settings: SiteSetting }) {
  const social = [
    { href: settings.instagramUrl, label: 'Instagram' },
    { href: settings.tiktokUrl, label: 'TikTok' },
    { href: buildGreetingUrl(settings.whatsappNumber), label: 'WhatsApp' },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href))

  return (
    <footer className="mt-24 bg-crema">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl">Véliza</p>
          <p className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
            <Sparkle className="text-roca" /> Ropa • Estilo • Tú
          </p>
          {settings.antifraudNotice && <p className="mt-4 text-sm">{settings.antifraudNotice}</p>}
        </div>
        <nav aria-label="Páginas">
          <p className="mb-2 text-xs uppercase tracking-[0.25em]">Explora</p>
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Redes">
          <p className="mb-2 text-xs uppercase tracking-[0.25em]">Escríbenos</p>
          <ul>
            {social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-arena px-4 py-4 text-center text-xs text-texto-suave">
        © {new Date().getFullYear()} Véliza · Barranquilla, Colombia · Con mucho amor 💕
      </p>
    </footer>
  )
}
