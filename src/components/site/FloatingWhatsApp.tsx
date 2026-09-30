import React from 'react'
import { buildGreetingUrl } from '../../lib/whatsapp'
import { WhatsAppIcon } from './WhatsAppIcon'

export function FloatingWhatsApp({ phone }: { phone: string }) {
  return (
    <a
      href={buildGreetingUrl(phone)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-texto text-fondo shadow-lg transition-transform hover:scale-105 motion-reduce:transition-none"
    >
      <WhatsAppIcon />
    </a>
  )
}
