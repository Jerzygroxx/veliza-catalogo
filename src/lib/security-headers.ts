export type Header = { key: string; value: string }

/**
 * Cabeceras de seguridad para todas las rutas.
 *
 * `script-src` y `style-src` llevan 'unsafe-inline' porque Next.js y Payload inyectan
 * scripts y estilos en línea. Un CSP con *nonce* obligaría a renderizar todas las páginas
 * en cada visita, lo que choca con la caché del catálogo (spec §4.3). A cambio, el sitio no
 * muestra HTML de terceros ni de las usuarias (todo es texto plano que React escapa), y el
 * resto de directivas (`default-src`, `object-src`, `frame-ancestors`, `form-action`) sí se
 * mantiene estricto.
 */
export function buildSecurityHeaders({
  isDev,
  extraImgHosts = [],
}: {
  isDev: boolean
  extraImgHosts?: string[]
}): Header[] {
  const imgHosts = extraImgHosts.map((h) => h.trim()).filter(Boolean)

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    ['img-src', "'self'", 'data:', 'blob:', ...imgHosts].join(' '),
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')

  const headers: Header[] = [
    { key: 'Content-Security-Policy', value: csp },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  ]
  if (!isDev) {
    headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' })
  }
  return headers
}
