import type { DashboardViewServerProps } from '@payloadcms/next/views'
import Link from 'next/link'
import React from 'react'
import { greeting, summarize, type DashboardCounts } from '../../lib/dashboard'
import './dashboard.scss'

const ADMIN = '/panel-veliza'

async function loadCounts(props: DashboardViewServerProps): Promise<DashboardCounts | null> {
  const { payload, user } = props
  try {
    const opts = { collection: 'products' as const, overrideAccess: false, user }
    const [total, soldOut] = await Promise.all([
      payload.count(opts),
      payload.count({ ...opts, where: { soldOut: { equals: true } } }),
    ])
    return { total: total.totalDocs, soldOut: soldOut.totalDocs }
  } catch {
    return null
  }
}

export default async function Dashboard(props: DashboardViewServerProps) {
  const summary = summarize(await loadCounts(props))
  const name = (props.user as { name?: string | null } | null)?.name

  return (
    <div className="veliza-home">
      <h1 className="veliza-home__title">{greeting(name)}</h1>
      <p className="veliza-home__lead">¿Qué quieres hacer hoy?</p>

      <nav className="veliza-home__actions" aria-label="Acciones principales">
        <Link className="veliza-home__card veliza-home__card--primary" href={`${ADMIN}/collections/products/create`}>
          <strong>Agregar prenda</strong>
          <span>Sube fotos, pon el precio y listo.</span>
        </Link>
        <Link className="veliza-home__card" href={`${ADMIN}/collections/products`}>
          <strong>Ver mis prendas</strong>
          <span>Cambia precios o marca una prenda como agotada.</span>
        </Link>
        <Link className="veliza-home__card" href={`${ADMIN}/globals/site-settings`}>
          <strong>Datos de la tienda</strong>
          <span>WhatsApp, redes sociales y textos.</span>
        </Link>
      </nav>

      {summary && (
        <ul className="veliza-home__counts" aria-label="Resumen del catálogo">
          <li>
            <b>{summary.published}</b> prendas disponibles
          </li>
          <li>
            <b>{summary.soldOut}</b> agotadas
          </li>
        </ul>
      )}

      <section className="veliza-home__help" aria-labelledby="veliza-help">
        <h2 id="veliza-help">¿Cómo lo hago?</h2>
        <details>
          <summary>Cambiar un precio</summary>
          <ol>
            <li>Entra a «Ver mis prendas».</li>
            <li>Toca la prenda y escribe el precio nuevo, solo números (ej. 35000).</li>
            <li>Pulsa «Guardar».</li>
          </ol>
        </details>
        <details>
          <summary>Marcar una prenda como agotada</summary>
          <ol>
            <li>Abre la prenda desde «Ver mis prendas».</li>
            <li>Activa la casilla «Agotada».</li>
            <li>Pulsa «Guardar». En la tienda aparecerá gris con el botón «Agotada».</li>
          </ol>
        </details>
        <details>
          <summary>Cambiar la foto de portada</summary>
          <ol>
            <li>Abre la prenda y ve a «Fotos».</li>
            <li>Arrastra la foto que quieras al primer lugar: la primera es la portada.</li>
            <li>Pulsa «Guardar».</li>
          </ol>
        </details>
      </section>
    </div>
  )
}
