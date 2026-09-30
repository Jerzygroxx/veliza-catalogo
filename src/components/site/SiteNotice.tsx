import React from 'react'

export function SiteNotice({ text }: { text?: string | null }) {
  if (!text) return null
  return <p className="bg-crema px-4 py-2 text-center text-sm tracking-wide">{text}</p>
}
