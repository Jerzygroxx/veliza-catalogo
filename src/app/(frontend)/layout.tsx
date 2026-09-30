import type { Metadata } from 'next'
import { Cormorant_Garamond, Great_Vibes, Jost } from 'next/font/google'
import React from 'react'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400', variable: '--font-great-vibes', display: 'swap' })
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost', display: 'swap' })

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Véliza · Ropa, estilo, tú', template: '%s · Véliza' },
  description: 'Catálogo de ropa para mujer en Barranquilla. Elige tu prenda y pídela por WhatsApp.',
  openGraph: { siteName: 'Véliza', locale: 'es_CO', type: 'website' },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${cormorant.variable} ${greatVibes.variable} ${jost.variable}`}>
      <body className="min-h-screen bg-fondo text-texto">{children}</body>
    </html>
  )
}
