import React from 'react'
import { Sparkle } from '../site/Decor'

export function SectionTitle({ script, children }: { script?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 text-center">
      {script && (
        <p className="font-script text-3xl text-roca-fuerte" aria-hidden="true">
          {script}
        </p>
      )}
      <h2 className="flex items-center justify-center gap-3 font-serif text-3xl md:text-4xl">
        <Sparkle className="text-roca" />
        {children}
        <Sparkle className="text-roca" />
      </h2>
    </div>
  )
}
