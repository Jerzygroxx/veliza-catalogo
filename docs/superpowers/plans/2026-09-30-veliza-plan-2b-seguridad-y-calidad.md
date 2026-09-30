# Véliza — Plan 2B: seguridad y calidad

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Endurecer la tienda y el panel (cabeceras de seguridad, límite de peticiones, SEO básico), cubrir los flujos clave con pruebas E2E en celular y escritorio (incluida accesibilidad), y dejar la guía de seguridad para las dueñas.

**Architecture:** Las cabeceras se construyen con una función pura (`src/lib/security-headers.ts`) que `next.config.ts` aplica a todas las rutas. El límite de peticiones es un limitador de ventana deslizante en memoria (`src/lib/rate-limit.ts`) usado por `src/proxy.ts` (convención de Next 16, antes `middleware`) solo sobre `/api/*`. `robots.ts` y `sitemap.ts` salen de la capa de datos cacheada. Las pruebas E2E (Playwright) corren contra un build de producción en el puerto 3100 y la rama Neon `test`, con datos propios creados y borrados por un script de *fixtures*.

**Tech Stack:** Next.js 16.3.3, Payload 3.90.2, Vitest, Playwright (`@playwright/test`), `@axe-core/playwright`, `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-28-veliza-catalog-design.md` (§9 Seguridad, §10 Pruebas). Depende del Plan 2A ya implementado.

## Global Constraints

- **No cambia el comportamiento visible** de la tienda ni del panel: solo se agregan cabeceras, protección, SEO y pruebas.
- Cabeceras exigidas por el spec: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictiva y `frame-ancestors 'none'`.
- `Strict-Transport-Security` **solo en producción** (nunca en `localhost`, porque el navegador lo recordaría).
- Nunca `dangerouslySetInnerHTML`; nunca secretos en el repositorio (`.env*` ignorados; ya verificado).
- `/panel-veliza` se mantiene `noindex` y bloqueado en `robots.txt`; la tienda nunca enlaza al panel.
- Los tests de integración y E2E usan la rama Neon **`test`**, nunca `dev` ni producción. Los datos de prueba llevan un sufijo único y se borran al terminar.
- Las cuentas de las dueñas nunca se usan en pruebas automáticas.
- Mensajes para personas (guía de seguridad) en **español (Colombia)**, tono claro y sin jerga.
- Los 120 tests actuales (86 unitarios + 34 de integración) deben seguir pasando.
- El limitador en memoria es **por instancia**: es una capa de defensa adicional. El límite real contra abuso va en Cloudflare (Plan 3).

## Review Focus

- Cabecera `X-Forwarded-For` falsificada o ausente en el limitador: no debe permitir saltarse el límite de forma trivial cuando hay `cf-connecting-ip`, y sin ninguna IP todo el tráfico comparte un solo cubo (falla "hacia seguro"). → Task 2.
- El limitador no debe crecer sin límite en memoria ante muchas IPs distintas (limpieza de entradas vencidas). → Task 2.
- El CSP no debe romper el panel de Payload (editor, subida de fotos, vista previa de imágenes `blob:`/`data:`) ni la tienda (fuentes, imágenes del medio). → Task 1.
- `robots.txt` y `sitemap.xml` con un catálogo vacío o con caracteres especiales en los slugs. → Task 3.
- Un producto agotado o sin foto **sí** aparece en el sitemap (sigue siendo una página válida). → Task 3.
- La E2E no debe dejar datos basura en la base `test` si una prueba falla a mitad (el teardown corre siempre). → Task 4.
- La ruta `/panel-veliza` sin sesión solo muestra el formulario de ingreso y nunca datos. → Task 6.

---

### Task 1: Cabeceras de seguridad

**Files:**
- Create: `src/lib/security-headers.ts`
- Test: `tests/unit/security-headers.test.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `buildSecurityHeaders(opts: { isDev: boolean; extraImgHosts?: string[] }): { key: string; value: string }[]` — lista lista para el `headers()` de Next. Variable opcional `SECURITY_IMG_HOSTS` (hosts separados por coma, p. ej. el bucket de R2) se lee en `next.config.ts` y se pasa como `extraImgHosts`.

- [ ] **Step 1: Test que falla**

`tests/unit/security-headers.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildSecurityHeaders } from '../../src/lib/security-headers'

const get = (h: { key: string; value: string }[], key: string) => h.find((x) => x.key === key)?.value

describe('buildSecurityHeaders (producción)', () => {
  const h = buildSecurityHeaders({ isDev: false })
  const csp = get(h, 'Content-Security-Policy')!

  it('incluye las cabeceras exigidas', () => {
    expect(get(h, 'X-Content-Type-Options')).toBe('nosniff')
    expect(get(h, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(get(h, 'Permissions-Policy')).toMatch(/camera=\(\)/)
    expect(get(h, 'Strict-Transport-Security')).toMatch(/max-age=31536000/)
  })
  it('CSP: nadie puede incrustar el sitio y solo carga lo propio', () => {
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
  })
  it('CSP: no permite eval en producción', () => {
    expect(csp).not.toContain('unsafe-eval')
  })
  it('CSP: permite las imágenes que usa el panel (blob y data)', () => {
    expect(csp).toMatch(/img-src[^;]*blob:/)
    expect(csp).toMatch(/img-src[^;]*data:/)
  })
})

describe('buildSecurityHeaders (desarrollo)', () => {
  const h = buildSecurityHeaders({ isDev: true })
  it('no envía HSTS en desarrollo', () => {
    expect(get(h, 'Strict-Transport-Security')).toBeUndefined()
  })
  it('permite eval en desarrollo (lo necesita el refresco de Next)', () => {
    expect(get(h, 'Content-Security-Policy')).toContain("'unsafe-eval'")
  })
})

describe('hosts de imágenes extra', () => {
  it('se agregan a img-src', () => {
    const csp = get(buildSecurityHeaders({ isDev: false, extraImgHosts: ['https://fotos.ejemplo.com'] }), 'Content-Security-Policy')!
    expect(csp).toMatch(/img-src[^;]*https:\/\/fotos\.ejemplo\.com/)
  })
  it('ignora valores vacíos', () => {
    const csp = get(buildSecurityHeaders({ isDev: false, extraImgHosts: ['', '  '] }), 'Content-Security-Policy')!
    expect(csp).not.toMatch(/img-src[^;]*\s{2}/)
  })
})
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run tests/unit/security-headers.test.ts`
Expected: FAIL — no se encuentra `../../src/lib/security-headers`.

- [ ] **Step 3: Implementar**

`src/lib/security-headers.ts`:

```ts
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
```

`next.config.ts` — reemplazar la función `headers()` (conservando el `X-Robots-Tag` del panel):

```ts
import { buildSecurityHeaders } from './src/lib/security-headers'
// …
  async headers() {
    const security = buildSecurityHeaders({
      isDev: process.env.NODE_ENV !== 'production',
      extraImgHosts: (process.env.SECURITY_IMG_HOSTS || '').split(','),
    })
    return [
      { source: '/:path*', headers: security },
      { source: '/panel-veliza/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
```

Agregar a `.env.example`:

```
# Hosts extra permitidos para imágenes en el CSP (separados por coma). Ej: https://fotos.tudominio.com
SECURITY_IMG_HOSTS=
```

- [ ] **Step 4: Verlo pasar**

Run: `npx vitest run tests/unit/security-headers.test.ts && npx tsc --noEmit`
Expected: PASS (todos los tests) y sin errores de tipos.

- [ ] **Step 5: Verificar que no rompe nada en el navegador**

Reiniciar `npm run dev`. Abrir `/`, `/catalogo`, `/producto/body-m-l` y `/panel-veliza` (con sesión): editar una prenda, abrir el selector de fotos y subir una imagen de prueba al borrador sin guardar. Mirar la consola del navegador (`read_console_messages`).
Expected: **ningún** error «Refused to …» de CSP; las fuentes, fotos y el panel funcionan igual. Si aparece alguno, ajustar la directiva mínima necesaria (p. ej. `connect-src`) y repetir el test correspondiente.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(security): CSP, HSTS and other security headers"
```

---

### Task 2: Límite de peticiones

**Files:**
- Create: `src/lib/rate-limit.ts`
- Create: `src/proxy.ts`
- Test: `tests/unit/rate-limit.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `createRateLimiter(opts: { limit: number; windowMs: number; now?: () => number; maxKeys?: number }): { check(key: string): { allowed: boolean; remaining: number; retryAfterSec: number } }`
  - `clientKey(headers: { get(name: string): string | null }): string` → `cf-connecting-ip`, si no la primera IP de `x-forwarded-for`, si no `'sin-ip'`.
  - `src/proxy.ts`: exporta `proxy(request)` y `config.matcher = '/api/:path*'`. Límites: `POST /api/users/login` 10 por minuto por cliente; el resto de `/api/*` 120 por minuto por cliente. Responde `429` con `Retry-After` y cuerpo JSON en español.

- [ ] **Step 1: Test que falla**

`tests/unit/rate-limit.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { clientKey, createRateLimiter } from '../../src/lib/rate-limit'

const headers = (o: Record<string, string>) => ({ get: (n: string) => o[n.toLowerCase()] ?? null })

describe('createRateLimiter', () => {
  it('permite hasta el límite y luego bloquea', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => t })
    expect(rl.check('a').allowed).toBe(true)
    expect(rl.check('a').allowed).toBe(true)
    const third = rl.check('a')
    expect(third).toMatchObject({ allowed: true, remaining: 0 })
    const fourth = rl.check('a')
    expect(fourth.allowed).toBe(false)
    expect(fourth.retryAfterSec).toBeGreaterThan(0)
  })
  it('cada clave tiene su propio cupo', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0 })
    expect(rl.check('a').allowed).toBe(true)
    expect(rl.check('b').allowed).toBe(true)
    expect(rl.check('a').allowed).toBe(false)
  })
  it('se libera al pasar la ventana', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => t })
    rl.check('a')
    expect(rl.check('a').allowed).toBe(false)
    t = 1_001
    expect(rl.check('a').allowed).toBe(true)
  })
  it('no crece sin límite: descarta claves viejas al llegar a maxKeys', () => {
    let t = 0
    const rl = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => t, maxKeys: 3 })
    for (const k of ['a', 'b', 'c']) rl.check(k)
    t = 5_000
    rl.check('d')
    // tras la limpieza, las claves viejas ya no ocupan cupo: 'a' vuelve a estar permitida
    expect(rl.check('a').allowed).toBe(true)
  })
})

describe('clientKey', () => {
  it('prefiere cf-connecting-ip', () => {
    expect(clientKey(headers({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }))).toBe('1.1.1.1')
  })
  it('usa la primera IP de x-forwarded-for', () => {
    expect(clientKey(headers({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3' }))).toBe('2.2.2.2')
  })
  it('sin IP, todo el tráfico comparte un cubo', () => {
    expect(clientKey(headers({}))).toBe('sin-ip')
  })
})
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run tests/unit/rate-limit.test.ts`
Expected: FAIL — no se encuentra `../../src/lib/rate-limit`.

- [ ] **Step 3: Implementar**

`src/lib/rate-limit.ts`:

```ts
type Options = { limit: number; windowMs: number; now?: () => number; maxKeys?: number }
type Result = { allowed: boolean; remaining: number; retryAfterSec: number }

/** Limitador de ventana deslizante en memoria. Es por instancia: capa extra, no la única defensa. */
export function createRateLimiter({ limit, windowMs, now = Date.now, maxKeys = 10_000 }: Options) {
  const hits = new Map<string, number[]>()

  function prune(t: number) {
    for (const [key, times] of hits) {
      const fresh = times.filter((x) => t - x < windowMs)
      if (fresh.length) hits.set(key, fresh)
      else hits.delete(key)
    }
  }

  return {
    check(key: string): Result {
      const t = now()
      if (hits.size >= maxKeys && !hits.has(key)) prune(t)
      const times = (hits.get(key) ?? []).filter((x) => t - x < windowMs)
      if (times.length >= limit) {
        hits.set(key, times)
        return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((times[0] + windowMs - t) / 1000)) }
      }
      times.push(t)
      hits.set(key, times)
      return { allowed: true, remaining: limit - times.length, retryAfterSec: 0 }
    },
  }
}

/** Identifica al cliente. Detrás de Cloudflare se usa `cf-connecting-ip` (no falsificable desde fuera). */
export function clientKey(headers: { get(name: string): string | null }): string {
  const cf = headers.get('cf-connecting-ip')?.trim()
  if (cf) return cf
  const xff = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return xff || 'sin-ip'
}
```

`src/proxy.ts`:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clientKey, createRateLimiter } from './lib/rate-limit'

const loginLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 })
const apiLimiter = createRateLimiter({ limit: 120, windowMs: 60_000 })

export const config = { matcher: '/api/:path*' }

export function proxy(request: NextRequest) {
  const isLogin = request.method === 'POST' && request.nextUrl.pathname === '/api/users/login'
  const result = (isLogin ? loginLimiter : apiLimiter).check(clientKey(request.headers))

  if (!result.allowed) {
    return NextResponse.json(
      { errors: [{ message: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.' }] },
      { status: 429, headers: { 'Retry-After': String(result.retryAfterSec) } },
    )
  }
  return NextResponse.next()
}
```

- [ ] **Step 4: Verlo pasar**

Run: `npx vitest run tests/unit/rate-limit.test.ts && npx tsc --noEmit`
Expected: PASS (7 tests).

- [ ] **Step 5: Verificar con el servidor real**

Reiniciar `npm run dev`. En una terminal:

```bash
for i in $(seq 1 12); do curl -s -o /dev/null -w "%{http_code} " -X POST http://localhost:3000/api/users/login -H "Content-Type: application/json" -d '{"email":"nadie@example.com","password":"x"}'; done; echo
```

Expected: los primeros 10 devuelven `401` (credenciales inválidas) y los siguientes `429`. **Usa un correo inexistente**, nunca el de una dueña (bloquearía su cuenta). Esperar 60 s y repetir una vez: vuelve a `401`.
Comprobar también que el panel y la tienda cargan igual (el `proxy` solo toca `/api/*`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(security): in-memory rate limiting for /api via proxy"
```

---

### Task 3: SEO básico (robots y sitemap)

**Files:**
- Create: `src/lib/seo.ts`
- Create: `src/app/robots.ts`, `src/app/sitemap.ts`
- Test: `tests/unit/seo.test.ts`

**Interfaces:**
- Consumes: `getProducts()` de `src/lib/data.ts`; tipo `Product`.
- Produces: `buildSitemapEntries(products: { slug: string; updatedAt: string }[], baseUrl: string): { url: string; lastModified: string }[]` (rutas fijas `/`, `/catalogo`, `/quienes-somos`, `/como-comprar` + una por prenda, con el slug codificado); `src/app/robots.ts` (permite `/`, bloquea `/panel-veliza` y `/api/`, apunta al sitemap); `src/app/sitemap.ts`.

- [ ] **Step 1: Test que falla**

`tests/unit/seo.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildSitemapEntries } from '../../src/lib/seo'

const base = 'https://veliza.example'

describe('buildSitemapEntries', () => {
  it('incluye las páginas fijas aunque no haya prendas', () => {
    const urls = buildSitemapEntries([], base).map((e) => e.url)
    expect(urls).toEqual([`${base}/`, `${base}/catalogo`, `${base}/quienes-somos`, `${base}/como-comprar`])
  })
  it('agrega una entrada por prenda con su fecha', () => {
    const e = buildSitemapEntries([{ slug: 'body-cloe', updatedAt: '2026-09-01T10:00:00.000Z' }], base)
    expect(e.at(-1)).toEqual({ url: `${base}/producto/body-cloe`, lastModified: '2026-09-01T10:00:00.000Z' })
  })
  it('codifica los slugs con caracteres especiales', () => {
    const e = buildSitemapEntries([{ slug: 'lía & co', updatedAt: '2026-09-01T00:00:00.000Z' }], base)
    expect(e.at(-1)!.url).toBe(`${base}/producto/l%C3%ADa%20%26%20co`)
  })
  it('quita la barra final de la URL base', () => {
    expect(buildSitemapEntries([], `${base}/`)[0].url).toBe(`${base}/`)
  })
})
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run tests/unit/seo.test.ts`
Expected: FAIL — no se encuentra `../../src/lib/seo`.

- [ ] **Step 3: Implementar**

`src/lib/seo.ts`:

```ts
export function buildSitemapEntries(
  products: { slug: string; updatedAt: string }[],
  baseUrl: string,
): { url: string; lastModified: string }[] {
  const base = baseUrl.replace(/\/+$/, '')
  const now = new Date().toISOString()
  const fixed = ['/', '/catalogo', '/quienes-somos', '/como-comprar'].map((p) => ({ url: `${base}${p}`, lastModified: now }))
  const items = products.map((p) => ({
    url: `${base}/producto/${encodeURIComponent(p.slug)}`,
    lastModified: p.updatedAt,
  }))
  return [...fixed, ...items]
}
```

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { getProducts } from '../lib/data'
import { buildSitemapEntries } from '../lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  return buildSitemapEntries(await getProducts(), base)
}
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/+$/, '')
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/panel-veliza', '/api/'] }],
    sitemap: `${base}/sitemap.xml`,
  }
}
```

- [ ] **Step 4: Verlo pasar y mirar el resultado**

Run: `npx vitest run tests/unit/seo.test.ts && npx tsc --noEmit`
Expected: PASS (4 tests). Con el servidor en marcha: `curl -s http://localhost:3000/robots.txt` muestra `Disallow: /panel-veliza` y `Disallow: /api/`; `curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"` devuelve 33 (4 fijas + 29 prendas).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(seo): robots.txt and sitemap.xml"
```

---

### Task 4: Infraestructura E2E (Playwright + fixtures)

**Files:**
- Create: `playwright.config.ts`
- Create: `scripts/e2e-fixtures.ts`
- Create: `tests/e2e/fixtures.ts` (constantes compartidas)
- Create: `tests/e2e/smoke.spec.ts`
- Modify: `package.json` (scripts `test:e2e`, `e2e:fixtures`; dependencias)
- Modify: `.gitignore` si hace falta (ya ignora `test-results/` y `playwright-report/`)

**Interfaces:**
- Consumes: config de Payload, `createTestImage` (`tests/int/helpers.ts`), `.env.test`.
- Produces:
  - `tests/e2e/fixtures.ts`: `export const E2E = { category: 'e2e-categoria', colorProduct: 'e2e-prenda-color', soldOutProduct: 'e2e-prenda-agotada', plainProduct: 'e2e-prenda-simple', colorName: 'Vinotinto' }`.
  - `scripts/e2e-fixtures.ts up|down`: crea o borra la categoría `e2e-categoria` y 3 prendas (con colores; agotada; sin colores) con una foto de prueba. Es **idempotente**: `up` borra antes lo que quede de una corrida anterior.
  - `npm run test:e2e`: levanta el build en el puerto 3100 con la base `test`, corre las pruebas y **siempre** limpia los fixtures.

- [ ] **Step 1: Instalar**

Run: `npm install -D @playwright/test @axe-core/playwright && npx playwright install chromium`
Expected: instalación sin errores (descarga Chromium, ~150 MB).

- [ ] **Step 2: Constantes compartidas**

`tests/e2e/fixtures.ts`:

```ts
export const E2E = {
  category: 'e2e-categoria',
  colorProduct: 'e2e-prenda-color',
  soldOutProduct: 'e2e-prenda-agotada',
  plainProduct: 'e2e-prenda-simple',
  colorName: 'Vinotinto',
} as const
```

- [ ] **Step 2b: Script de fixtures**

`scripts/e2e-fixtures.ts`:

```ts
import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'
import { E2E } from '../tests/e2e/fixtures'

const NO_REVALIDATE = { disableRevalidate: true }

async function down() {
  const payload = await getPayload({ config })
  const prods = await payload.find({ collection: 'products', where: { slug: { like: 'e2e-' } }, limit: 50, depth: 0 })
  const mediaIds = new Set<number>()
  for (const p of prods.docs) {
    for (const m of p.images ?? []) mediaIds.add(typeof m === 'number' ? m : m.id)
    await payload.delete({ collection: 'products', id: p.id, context: NO_REVALIDATE })
  }
  const cats = await payload.find({ collection: 'categories', where: { slug: { equals: E2E.category } }, limit: 5, depth: 0 })
  for (const c of cats.docs) await payload.delete({ collection: 'categories', id: c.id, context: NO_REVALIDATE })
  for (const id of mediaIds) await payload.delete({ collection: 'media', id, context: NO_REVALIDATE }).catch(() => undefined)
}

async function up() {
  await down()
  const payload = await getPayload({ config })
  const data = await sharp({ create: { width: 1200, height: 1500, channels: 3, background: '#A48D78' } }).jpeg().toBuffer()
  const img = await payload.create({
    collection: 'media',
    data: { alt: 'Foto de prueba E2E' },
    file: { data, mimetype: 'image/jpeg', name: 'e2e-foto.jpg', size: data.length },
    context: NO_REVALIDATE,
  })
  const cat = await payload.create({
    collection: 'categories',
    data: { name: 'Prueba E2E', slug: E2E.category, order: 99 },
    context: NO_REVALIDATE,
  })
  const base = { category: cat.id, images: [img.id] }
  await payload.create({
    collection: 'products',
    data: { ...base, name: 'Prenda con color', slug: E2E.colorProduct, price: 41000, colors: [{ name: 'Negro' }, { name: E2E.colorName, swatch: '#722F37' }] },
    context: NO_REVALIDATE,
  })
  await payload.create({
    collection: 'products',
    data: { ...base, name: 'Prenda agotada', slug: E2E.soldOutProduct, price: 30000, soldOut: true, colors: [{ name: 'Blanco' }] },
    context: NO_REVALIDATE,
  })
  await payload.create({
    collection: 'products',
    data: { ...base, name: 'Prenda simple', slug: E2E.plainProduct, price: 52000 },
    context: NO_REVALIDATE,
  })
}

const mode = process.argv[2]
const run = mode === 'up' ? up : mode === 'down' ? down : null
if (!run) {
  console.error('Uso: e2e-fixtures.ts up|down')
  process.exit(1)
}
run().then(
  () => process.exit(0),
  (e) => {
    console.error(e)
    process.exit(1)
  },
)
```

Nota: las fotos de las pruebas se guardan en `media/` con el mismo nombre (`e2e-foto.jpg`); `down` las borra con su documento.

- [ ] **Step 3: Configuración de Playwright**

`playwright.config.ts`:

```ts
import { config as loadEnv } from 'dotenv'
import { defineConfig, devices } from '@playwright/test'

// Las E2E usan la rama `test` de Neon y su propio puerto: nunca tocan `dev` ni producción.
loadEnv({ path: '.env.test', override: true, quiet: true })

const PORT = 3100
const URL = `http://localhost:${PORT}`
process.env.NEXT_PUBLIC_SERVER_URL = URL

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  retries: 0,
  reporter: [['list']],
  globalTeardown: './tests/e2e/teardown.ts',
  use: { baseURL: URL, trace: 'retain-on-failure' },
  webServer: {
    command: `npm run e2e:fixtures -- up && npm run build && npx next start -p ${PORT}`,
    url: URL,
    timeout: 300_000,
    reuseExistingServer: false,
    env: process.env as Record<string, string>,
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
})
```

`tests/e2e/teardown.ts`:

```ts
import { execSync } from 'node:child_process'

export default async function globalTeardown() {
  execSync('npm run e2e:fixtures -- down', { stdio: 'inherit', env: process.env })
}
```

`package.json` — agregar en `scripts`:

```json
    "test:e2e": "playwright test",
    "e2e:fixtures": "cross-env NODE_OPTIONS=--no-deprecation payload run scripts/e2e-fixtures.ts"
```

Nota: `payload run <archivo> up` pasa los argumentos al script; si `payload run` no reenvía `process.argv[2]`, usar `process.argv.at(-1)` en el script (ajustar y dejar un comentario).

- [ ] **Step 4: Prueba de humo**

`tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('la tienda carga y muestra el encabezado', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Véliza, inicio' })).toBeVisible()
  await expect(page).toHaveTitle(/Véliza/)
})
```

- [ ] **Step 5: Correr**

Run: `npm run test:e2e`
Expected: construye, arranca el servidor en `:3100`, pasa el humo en **escritorio y celular** (2 tests) y limpia los fixtures. Al terminar, `npm run e2e:fixtures -- down` no deja nada (verificar con una consulta rápida o mirando el panel de la rama `test`).
Detener cualquier `npm run dev` **antes** (el build compite por `.next`): mientras dura el build el puerto 3000 debe estar libre o, como mínimo, el dev no debe estar compilando.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test(e2e): Playwright infrastructure with self-cleaning fixtures"
```

---

### Task 5: E2E del flujo de compra

**Files:**
- Create: `tests/e2e/shopping.spec.ts`

**Interfaces:**
- Consumes: `E2E` de `tests/e2e/fixtures.ts`; los fixtures del Task 4; `buildWhatsAppUrl` (mismo formato que produce la app).
- Produces: pruebas del spec §10: inicio → catálogo → filtrar → ordenar → producto → color → enlace de WhatsApp; producto agotado; 404.

- [ ] **Step 1: Escribir las pruebas**

`tests/e2e/shopping.spec.ts`:

```ts
import { expect, test } from '@playwright/test'
import { E2E } from './fixtures'

test.describe('compra', () => {
  test('inicio → catálogo → filtro y orden → prenda → color → WhatsApp', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Ver catálogo' }).click()
    await expect(page).toHaveURL(/\/catalogo$/)

    // Filtrar por la categoría de prueba: quedan 3 prendas.
    await page.getByRole('link', { name: 'Prueba E2E' }).click()
    await expect(page).toHaveURL(new RegExp(`categoria=${E2E.category}`))
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(3)

    // Orden por precio de mayor a menor: la agotada va al final; la más cara disponible primero.
    await page.getByRole('link', { name: 'Precio: mayor a menor' }).click()
    await expect(page).toHaveURL(/orden=precio-desc/)
    const names = await page.getByRole('heading', { level: 3 }).allTextContents()
    expect(names).toEqual(['Prenda simple', 'Prenda con color', 'Prenda agotada'])

    // Abrir la prenda con colores.
    await page.getByRole('link', { name: /Prenda con color/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Prenda con color' })).toBeVisible()

    // Sin color elegido, el botón está deshabilitado.
    await expect(page.getByRole('button', { name: 'Elige un color' })).toBeDisabled()

    // Con color elegido, el enlace de WhatsApp es el esperado.
    await page.getByRole('button', { name: E2E.colorName }).click()
    const order = page.getByRole('link', { name: /Pedir por WhatsApp/ })
    await expect(order).toBeVisible()
    const href = await order.getAttribute('href')
    const url = new URL(href!)
    expect(url.origin + url.pathname).toMatch(/^https:\/\/wa\.me\/\d{10,15}$/)
    expect(url.searchParams.get('text')).toContain(`Me interesa: Prenda con color, color ${E2E.colorName}`)
    expect(url.searchParams.get('text')).toContain(`/producto/${E2E.colorProduct}`)
  })

  test('una prenda sin colores se puede pedir de inmediato', async ({ page }) => {
    await page.goto(`/producto/${E2E.plainProduct}`)
    const order = page.getByRole('link', { name: /Pedir por WhatsApp/ })
    await expect(order).toBeVisible()
    expect(decodeURIComponent((await order.getAttribute('href'))!)).toContain('¿Qué colores tienen disponibles?')
  })

  test('una prenda agotada no se puede pedir', async ({ page }) => {
    await page.goto(`/producto/${E2E.soldOutProduct}`)
    await expect(page.getByRole('button', { name: 'Agotada' })).toBeDisabled()
    await expect(page.getByRole('link', { name: /Pedir por WhatsApp/ })).toHaveCount(0)
  })

  test('parámetros inválidos del catálogo se ignoran', async ({ page }) => {
    const res = await page.goto('/catalogo?categoria=zzz&orden=zzz')
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible()
  })

  test('una ruta inexistente muestra el 404 de la marca', async ({ page }) => {
    const res = await page.goto('/esta-ruta-no-existe')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'No encontramos esa página' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver el catálogo' })).toBeVisible()
  })

  test('el menú móvil abre y navega', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Solo aplica en celular')
    await page.goto('/')
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    await page.getByRole('link', { name: 'Cómo comprar' }).first().click()
    await expect(page).toHaveURL(/\/como-comprar$/)
  })
})
```

- [ ] **Step 2: Correrlas**

Run: `npm run test:e2e -- shopping.spec.ts`
Expected: PASS en escritorio y celular (el test del menú móvil se omite en escritorio). Si un selector falla, arreglar la **prueba** o el componente (no saltarse la aserción) y dejar el motivo en el commit.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test(e2e): shopping flow, sold-out, 404 and mobile menu"
```

---

### Task 6: E2E de seguridad y accesibilidad

**Files:**
- Create: `tests/e2e/security.spec.ts`
- Create: `tests/e2e/a11y.spec.ts`

**Interfaces:**
- Consumes: `E2E`; `@axe-core/playwright`.
- Produces: pruebas de cabeceras, de que el panel sin sesión solo muestra el ingreso, de `robots`/`sitemap`, del límite de peticiones y de accesibilidad (0 violaciones `serious`/`critical`) en las páginas clave.

- [ ] **Step 1: Seguridad**

`tests/e2e/security.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test.describe('seguridad', () => {
  test('las respuestas incluyen las cabeceras de seguridad', async ({ request }) => {
    const res = await request.get('/')
    const h = res.headers()
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(h['x-content-type-options']).toBe('nosniff')
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(h['permissions-policy']).toContain('camera=()')
    expect(h['strict-transport-security']).toContain('max-age=')
  })

  test('el panel sin sesión solo muestra el ingreso y es noindex', async ({ page }) => {
    const res = await page.goto('/panel-veliza')
    expect(res?.headers()['x-robots-tag']).toContain('noindex')
    await expect(page).toHaveURL(/\/panel-veliza\/(login|create-first-user)/)
    await expect(page.getByText('Prendas')).toHaveCount(0)
  })

  test('la API de usuarias no se puede listar sin sesión', async ({ request }) => {
    const res = await request.get('/api/users')
    expect([401, 403]).toContain(res.status())
  })

  test('GraphQL está desactivado', async ({ request }) => {
    const res = await request.post('/api/graphql', { data: { query: '{ __typename }' } })
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })

  test('robots.txt bloquea el panel y el sitemap lista las prendas', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /panel-veliza')
    expect(robots).toContain('Sitemap:')
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/producto/e2e-prenda-color')
  })

  test('el ingreso se limita tras demasiados intentos', async ({ request }) => {
    // Correo inexistente: nunca se usa una cuenta real.
    const codes: number[] = []
    for (let i = 0; i < 12; i++) {
      const res = await request.post('/api/users/login', {
        data: { email: 'nadie-e2e@example.com', password: 'incorrecta-incorrecta' },
      })
      codes.push(res.status())
    }
    expect(codes).toContain(429)
  })
})
```

Nota: este último test consume el cupo del limitador del servidor de E2E (en memoria, por instancia); por eso va al final del archivo y el proyecto no depende de logins reales. Si la ejecución en paralelo entre proyectos (escritorio/celular) lo vuelve intermitente, marcar el archivo con `test.describe.configure({ mode: 'serial' })`.

- [ ] **Step 2: Accesibilidad**

`tests/e2e/a11y.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { E2E } from './fixtures'

const pages = [
  ['inicio', '/'],
  ['catálogo', '/catalogo'],
  ['prenda con colores', `/producto/${E2E.colorProduct}`],
  ['prenda agotada', `/producto/${E2E.soldOutProduct}`],
  ['quiénes somos', '/quienes-somos'],
  ['cómo comprar', '/como-comprar'],
  ['404', '/no-existe-jamas'],
] as const

for (const [name, path] of pages) {
  test(`accesibilidad: ${name}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([])
  })
}
```

- [ ] **Step 3: Correr y corregir**

Run: `npm run test:e2e -- security.spec.ts a11y.spec.ts`
Expected: PASS. Es probable que axe encuentre problemas reales (p. ej. `color-contrast` en textos `text-roca`, `heading-order`, `landmark-unique` por los dos `<nav aria-label="Principal">` de escritorio y móvil). **Cada violación se corrige en el componente** (nunca se silencia una regla sin justificarla en un comentario): contraste con `text-texto-suave` en lugar de `text-roca` para texto pequeño; etiquetas de navegación distintas; niveles de encabezado ordenados. Repetir hasta que quede en verde.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test(e2e): security headers, panel access, rate limit and accessibility"
```

---

### Task 7: Guía de seguridad para las dueñas y Dependabot

**Files:**
- Create: `docs/guia-seguridad-duenas.md`
- Create: `.github/dependabot.yml`
- Modify: `package.json` (script `audit`)

**Interfaces:**
- Consumes: spec §9.4 (qué debe cubrir la guía).
- Produces: documento en español para las dueñas (base de las diapositivas del Plan 3); Dependabot semanal para npm y GitHub Actions; `npm run audit`.

- [ ] **Step 1: Guía**

`docs/guia-seguridad-duenas.md` (texto final; los nombres exactos de los menús de WhatsApp e Instagram pueden cambiar con las actualizaciones: verifícalos en tu teléfono al seguirla):

```markdown
# Cómo cuidar la cuenta de Véliza 💕

Esta guía es para Isabella, Sara y Valerie. Toma 15 minutos y evita el robo más común: que alguien se adueñe del WhatsApp o del Instagram de la tienda y estafe a las clientas.

## Por qué importa
El botón «Pedir por WhatsApp» de la tienda manda a las clientas a **nuestro número**. Si alguien nos roba esa cuenta, las clientas le escribirían a un estafador. Por eso lo más importante es proteger **WhatsApp e Instagram**.

## 1. Activa la verificación en dos pasos de WhatsApp
1. Abre WhatsApp → **Ajustes** → **Cuenta** → **Verificación en dos pasos** → **Activar**.
2. Crea un PIN de 6 dígitos que **no** sea tu cumpleaños ni 123456.
3. Agrega un correo de recuperación que **solo tú** uses.
4. Guarda el PIN en tu gestor de contraseñas.

## 2. Activa la verificación en dos pasos de Instagram
1. Abre Instagram → tu perfil → menú ☰ → **Centro de cuentas** → **Contraseña y seguridad** → **Autenticación en dos pasos**.
2. Elige la cuenta de Véliza y prefiere la opción de **aplicación de autenticación** (mejor que SMS).
3. Guarda los códigos de respaldo en un lugar seguro.

## 3. Reconoce el robo de códigos
- **Nunca** compartas un código de 6 dígitos que te llegue por SMS o WhatsApp, ni siquiera con alguien que diga ser de WhatsApp, de Instagram o «un amigo».
- Si te piden «reenviar un código que te llegó por error», es un intento de robo.
- Si de repente WhatsApp te saca de tu sesión o te pide verificar el número sin que lo hayas pedido: **cambia el PIN de dos pasos y avisa a las otras dueñas**.

## 4. Entra al panel de la tienda de forma segura
- Guarda la dirección del panel en **favoritos** o como ícono en la pantalla de inicio de tu celular, y **entra siempre desde ahí**.
- **Nunca** entres desde un enlace que te llegue por mensaje, correo o redes.
- Usa una contraseña **larga y única** (mínimo 12 caracteres), guardada en un gestor de contraseñas como Bitwarden. No la repitas en otros sitios.
- Si escribes mal la contraseña 5 veces, la cuenta se bloquea **10 minutos**. Es normal: espera y vuelve a intentar.
- Si olvidas la contraseña, pídele a otra dueña (o a quien administra el sitio) que la restablezca desde el panel.

## 5. Si algo sale mal
1. Cambia la contraseña del panel y el PIN de WhatsApp.
2. Avisa por el grupo a las otras dos dueñas.
3. Escribe a quien administra el sitio.
4. Avisa a las clientas por Instagram que solo se atiende por el número oficial.
```

- [ ] **Step 2: Dependabot y auditoría**

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    groups:
      payload:
        patterns: ['payload', '@payloadcms/*']
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

Nota: Payload y sus paquetes deben actualizarse **juntos** a la misma versión exacta (el repo las fija); el grupo `payload` lo garantiza.

`package.json` — en `scripts`: `"audit": "npm audit --omit=dev"`.

- [ ] **Step 3: Verificar**

Run: `npm run audit`
Expected: muestra las advisories conocidas (las 7 moderadas transitivas de payload/drizzle-kit anotadas en el CLAUDE.md). **No** aplicar `npm audit fix --force` (degrada Payload). Verificar que no haya ninguna `high` o `critical`; si aparece alguna nueva, evaluarla antes de publicar.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: owners security guide; chore: Dependabot and audit script"
```

---

### Task 8: Revisión de seguridad y verificación final

**Files:**
- Modify: `info_veliza/CLAUDE.md` (sección «Next steps»)

- [ ] **Step 1: Revisiones con las skills del usuario**

Invocar, en este orden, sobre el código de esta rama:
1. `owasp` — autenticación, control de acceso, subidas, inyección (foco: `src/collections/Users.ts`, `src/access/`, `src/proxy.ts`, `src/lib/security-headers.ts`).
2. `appsec` — dependencias, cabeceras y CORS/CSRF (`next.config.ts`, `src/payload.config.ts`, `package-lock.json`).
3. `security-review` — revisión del diff completo de esta rama.

Corregir lo **Crítico/Importante** con un test que falle primero; anotar lo menor en el `CLAUDE.md` como pendiente.

- [ ] **Step 2: Suite completa**

Run: `npx tsc --noEmit && npm test && npm run test:e2e`
Expected: todo en verde (unitarios + integración + E2E en escritorio y celular).

- [ ] **Step 3: Build y arranque reales**

Run: `npm run build` y luego `npm start`; abrir `http://localhost:3000`, `/catalogo`, una prenda y `/panel-veliza`.
Expected: todo funciona; en la consola del navegador no hay errores de CSP.

- [ ] **Step 4: Actualizar `CLAUDE.md` y commit**

En `info_veliza/CLAUDE.md`, «Next steps»: Plan 2B hecho; siguiente, **Plan 3** (producción): hosting, Cloudflare delante (regla de límite de peticiones real para `/api/users/login` y `/panel-veliza`), respaldos semanales, CI en GitHub Actions, dominio y `NEXT_PUBLIC_SERVER_URL` real, `SECURITY_IMG_HOSTS` para el bucket S3/R2, crear las cuentas de las dueñas **antes** de publicar, y las diapositivas para las dueñas con la herramienta de diseño de Claude (basadas en `docs/guia-seguridad-duenas.md`).

```bash
git add -A
git commit -m "docs: record plan 2B as done"
```
