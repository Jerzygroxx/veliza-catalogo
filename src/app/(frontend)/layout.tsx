import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Catálogo de ropa para mujer en Barranquilla. Pide por WhatsApp.',
  title: 'Véliza',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es-CO">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
