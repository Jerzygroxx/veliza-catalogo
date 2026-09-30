import React from 'react'

export default function Logo() {
  return (
    <div style={{ textAlign: 'center', color: '#3B2A20' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A48D78" strokeWidth="1.2" aria-hidden="true">
        <path d="M12 20.5s-7-4.4-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.9c0 5.2-7 9.6-7 9.6z" />
      </svg>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.6rem', lineHeight: 1 }}>Véliza</div>
      <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', marginTop: 6 }}>ROPA • ESTILO • TÚ</div>
    </div>
  )
}
