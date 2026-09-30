import React from 'react'

type P = { className?: string }

export const Heart = ({ className }: P) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <path d="M12 20.5s-7-4.4-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.9c0 5.2-7 9.6-7 9.6z" />
  </svg>
)

export const Sparkle = ({ className }: P) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 1c.6 5.6 2.4 9.4 11 11-8.6 1.6-10.4 5.4-11 11-.6-5.6-2.4-9.4-11-11 8.6-1.6 10.4-5.4 11-11z" />
  </svg>
)
