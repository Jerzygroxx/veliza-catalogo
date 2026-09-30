'use client'
import React, { useState } from 'react'
import { purchaseState } from '../../lib/purchase'
import { buildWhatsAppUrl } from '../../lib/whatsapp'
import { WhatsAppIcon } from '../site/WhatsAppIcon'

type Color = { name: string; swatch?: string | null }

export function PurchasePanel({
  phone,
  productName,
  productUrl,
  colors,
  soldOut,
}: {
  phone: string
  productName: string
  productUrl: string
  colors: Color[]
  soldOut: boolean
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const state = purchaseState({ colorCount: colors.length, selected, soldOut })
  const href = state === 'ready' ? buildWhatsAppUrl({ phone, productName, color: selected, productUrl }) : undefined

  const base =
    'inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-medium uppercase tracking-[0.18em]'

  return (
    <div className="mt-6">
      {colors.length > 0 && (
        <fieldset disabled={soldOut}>
          <legend className="mb-2 text-xs uppercase tracking-[0.25em] text-texto-suave">
            Color{selected ? `: ${selected}` : ''}
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const active = selected === c.name
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelected(c.name)}
                  aria-pressed={active}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm ${
                    active ? 'border-texto bg-superficie' : 'border-arena'
                  } disabled:opacity-50`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-arena"
                    style={{ background: c.swatch || '#E6DAC8' }}
                    aria-hidden="true"
                  />
                  {c.name}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-6">
        {state === 'ready' && href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} bg-texto text-fondo hover:opacity-90`}>
            <WhatsAppIcon /> Pedir por WhatsApp
          </a>
        ) : (
          <button type="button" disabled className={`${base} cursor-not-allowed bg-texto/40 text-fondo`}>
            {state === 'sold-out' ? 'Agotada' : 'Elige un color'}
          </button>
        )}
        <p className="mt-2 text-sm text-texto-suave" aria-live="polite">
          {state === 'needs-color' && 'Elige un color para continuar.'}
          {state === 'sold-out' && 'Esta prenda se agotó por ahora.'}
        </p>
      </div>
    </div>
  )
}
