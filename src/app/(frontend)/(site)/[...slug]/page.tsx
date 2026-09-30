import { notFound } from 'next/navigation'

// Captura las URL desconocidas para que muestren el 404 de la marca con el encabezado y el pie.
// Las rutas reales (catálogo, prendas, /panel-veliza, /api) son más específicas y tienen prioridad.
export default function CatchAll() {
  notFound()
}
