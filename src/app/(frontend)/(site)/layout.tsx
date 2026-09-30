import React from 'react'
import { FloatingWhatsApp } from '../../../components/site/FloatingWhatsApp'
import { Footer } from '../../../components/site/Footer'
import { Header } from '../../../components/site/Header'
import { SiteNotice } from '../../../components/site/SiteNotice'
import { getSiteSettings } from '../../../lib/data'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <>
      <SiteNotice text={settings.priceNotice} />
      <Header />
      <main id="contenido">{children}</main>
      <Footer settings={settings} />
      <FloatingWhatsApp phone={settings.whatsappNumber} />
    </>
  )
}
