# Véliza — Plan 2A: tienda pública

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir las páginas públicas de la tienda (inicio, catálogo, detalle de prenda con pedido por WhatsApp, Quiénes somos, Cómo comprar y 404) con el diseño aprobado, leyendo los datos que las dueñas editan en el panel.

**Architecture:** Server Components de Next.js que leen con la Local API de Payload a través de `unstable_cache` con etiquetas (`products`, `categories`, `site-settings`), que los hooks ya existentes invalidan. La lógica (orden, filtros, estado de compra, textos, imágenes) vive en funciones puras en `src/lib/` con pruebas unitarias. El filtro y el orden del catálogo viven en la URL y se resuelven con **enlaces** (sin JavaScript). Solo lo interactivo es Client Component: galería, selector de color + botón de WhatsApp y menú móvil. Estilos con Tailwind v4 y los tokens del spec.

**Tech Stack:** Next.js 16.3.3 (App Router), React 19, Payload 3.90.2, TypeScript estricto, Tailwind CSS v4 (`@tailwindcss/postcss`), `next/font/google`, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-28-veliza-catalog-design.md` (§2 alcance, §3 diseño, §4.3 datos, §6 WhatsApp, §8 casos borde).

## Global Constraints

- Todo el texto visible en **español (Colombia)**, trato de "tú", tono cálido.
- Tokens de color exactos (Tailwind `@theme`; nunca hex sueltos en componentes): `fondo #FAF9F6`, `superficie #F4F1EA`, `crema #E6DAC8`, `arena #CBB9A4`, `roca #A48D78` (solo decoración o texto ≥24 px), `texto #3B2A20`, `texto-suave #6B5646`.
- Fuentes: Cormorant Garamond (títulos; *italic* para nombres de producto), Great Vibes (solo frases cortas), Jost 300/400 (cuerpo) y 500 (botones). Cuerpo mínimo 16 px, interlineado ≈1.6.
- Botón principal y de WhatsApp: fondo `texto` (cacao), texto `fondo`, ícono SVG de WhatsApp. **Nunca verde de WhatsApp.**
- Tema solo claro. Fotos 4:5. Catálogo 2 columnas en celular, 3 en tablet, 4 en escritorio.
- Zonas táctiles ≥ 44×44 px, foco de teclado siempre visible, `prefers-reduced-motion` respetado, motivos SVG decorativos con `aria-hidden`.
- **No hay carrito, pagos ni selector de tallas**: la talla es el texto de `product.size` (por defecto "Talla única (S–M)").
- El número de WhatsApp sale de `site-settings`, nunca fijo en el código. El primer color **no** queda preseleccionado.
- Las consultas públicas pasan **siempre** por `unstable_cache` con las etiquetas de `src/lib/cache-tags.ts`. Ninguna página consulta la base directamente.
- Imágenes con `next/image` y `unoptimized` (Payload ya genera `thumbnail`/`card`/`full` en WebP): así no dependemos de un proveedor de hosting ni de `remotePatterns`.
- Rutas en español: `/`, `/catalogo`, `/producto/[slug]`, `/quienes-somos`, `/como-comprar`. Parámetros: `?categoria=<slug>&orden=<recientes|precio-asc|precio-desc>`.
- Los agotados **siempre** van al final, con cualquier orden, y siguen visibles.
- No se modifica nada de `src/app/(payload)` ni del panel. Los 89 tests existentes deben seguir pasando.
- Los tests de integración usan la rama Neon `test` (ya configurado en `tests/setup.ts`).

## Review Focus

- Parámetros de URL inválidos o repetidos (`?orden=zzz`, `?categoria=no-existe`, `?orden=a&orden=b`): se ignoran y se usan los valores por defecto, sin error. → Task 2.
- Los agotados quedan al final en **los tres** órdenes (también en `precio-desc`). → Task 2.
- Prenda **sin colores**: no hay selector, el botón funciona y el mensaje pregunta por los colores disponibles; **con colores** y ninguno elegido, el botón está deshabilitado y pide elegir. → Task 2 y 6.
- Prenda sin foto o con foto sin tamaños generados: imagen de reserva, sin romper la página. → Task 2.
- Categoría sin prendas: mensaje amable y enlace a todo el catálogo. → Task 5.
- Nombres con caracteres especiales (`Body M.L`, tildes, emojis) dentro del enlace de WhatsApp: bien codificados. → Task 2 (ya cubierto en `tests/unit/whatsapp.test.ts`; se mantiene).
- Texto de "Quiénes somos" vacío o con líneas en blanco de más: no produce párrafos vacíos. → Task 2.

---

### Task 1: Tailwind v4, tokens, fuentes y layout base

**Files:**
- Create: `postcss.config.mjs`
- Create: `src/app/(frontend)/globals.css`
- Modify: `src/app/(frontend)/layout.tsx`
- Modify: `src/app/(frontend)/page.tsx` (marcador temporal)
- Delete: `src/app/(frontend)/styles.css`
- Modify: `package.json`

**Interfaces:**
- Consumes: nada.
- Produces: clases Tailwind de los tokens (`bg-fondo`, `bg-superficie`, `bg-crema`, `border-arena`, `text-roca`, `text-texto`, `text-texto-suave`), familias `font-serif`, `font-script`, `font-sans`; utilidad `.reveal` (aparición al hacer scroll solo con CSS); `<html lang="es-CO">` con las variables de fuente.

- [ ] **Step 1: Instalar**

Run: `npm install tailwindcss @tailwindcss/postcss postcss`
Expected: se agregan a `dependencies`/`devDependencies` sin errores.

- [ ] **Step 2: PostCSS**

`postcss.config.mjs`:

```js
const config = { plugins: { '@tailwindcss/postcss': {} } }
export default config
```

- [ ] **Step 3: Estilos globales**

`src/app/(frontend)/globals.css`:

```css
@import 'tailwindcss';

@theme {
  --color-fondo: #faf9f6;
  --color-superficie: #f4f1ea;
  --color-crema: #e6dac8;
  --color-arena: #cbb9a4;
  --color-roca: #a48d78;
  --color-texto: #3b2a20;
  --color-texto-suave: #6b5646;

  --font-serif: var(--font-cormorant), Georgia, serif;
  --font-script: var(--font-great-vibes), cursive;
  --font-sans: var(--font-jost), system-ui, sans-serif;
}

@layer base {
  html {
    background: var(--color-fondo);
    color: var(--color-texto);
  }
  body {
    font-family: var(--font-sans);
    font-weight: 300;
    font-size: 1rem;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  :focus-visible {
    outline: 3px solid var(--color-texto);
    outline-offset: 3px;
  }
}

/* Aparición suave al hacer scroll: solo CSS, y solo si el navegador lo soporta. */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      animation: reveal-up linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
    @keyframes reveal-up {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
  }
}
```

- [ ] **Step 4: Layout base**

`src/app/(frontend)/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Great_Vibes, Jost } from 'next/font/google'
import React from 'react'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400', variable: '--font-great-vibes', display: 'swap' })
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost', display: 'swap' })

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Véliza · Ropa, estilo, tú', template: '%s · Véliza' },
  description: 'Catálogo de ropa para mujer en Barranquilla. Elige tu prenda y pídela por WhatsApp.',
  openGraph: { siteName: 'Véliza', locale: 'es_CO', type: 'website' },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${cormorant.variable} ${greatVibes.variable} ${jost.variable}`}>
      <body className="min-h-screen bg-fondo text-texto">{children}</body>
    </html>
  )
}
```

`src/app/(frontend)/page.tsx` (marcador temporal, se reemplaza en Task 7):

```tsx
export default function HomePage() {
  return <main className="p-16 text-center font-serif text-4xl">Véliza</main>
}
```

Borrar `src/app/(frontend)/styles.css`.

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: compila. Con `npm run dev`, abrir `http://localhost:3000`: fondo crema, «Véliza» en Cormorant.
**Comprobar también** `http://localhost:3000/panel-veliza`: el panel se ve **igual que antes** (Tailwind no debe filtrarse al panel). Si se ve distinto, mover el `@import 'tailwindcss'` a un `layer` o revisar que `globals.css` solo lo importe el layout de `(frontend)`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(store): Tailwind v4 tokens, fonts and base layout"
```

---

### Task 2: Lógica pura (orden, filtros, compra, textos, imágenes)

**Files:**
- Create: `src/lib/catalog.ts`, `src/lib/purchase.ts`, `src/lib/text.ts`, `src/lib/images.ts`
- Test: `tests/unit/catalog.test.ts`, `tests/unit/purchase.test.ts`, `tests/unit/text.test.ts`, `tests/unit/images.test.ts`

**Interfaces:**
- Consumes: tipos `Product`, `Category`, `Media` de `src/payload-types.ts`.
- Produces:
  - `type SortKey = 'recientes' | 'precio-asc' | 'precio-desc'`
  - `parseCatalogParams(raw: { categoria?: string | string[]; orden?: string | string[] }, validSlugs: string[]): { categoria: string | null; orden: SortKey }`
  - `sortProducts<T extends { price: number; soldOut?: boolean | null; createdAt: string }>(items: T[], orden: SortKey): T[]` (no muta; agotados al final)
  - `catalogHref(params: { categoria: string | null; orden: SortKey }): string` → `/catalogo`, `/catalogo?categoria=bodies`, `/catalogo?orden=precio-asc`, o ambos.
  - `type PurchaseState = 'sold-out' | 'needs-color' | 'ready'`; `purchaseState(input: { colorCount: number; selected: string | null; soldOut: boolean }): PurchaseState`
  - `paragraphs(text: string | null | undefined): string[]`
  - `type Img = { src: string; width: number; height: number; alt: string }`; `pickImage(media: number | Media | null | undefined, size: 'thumbnail' | 'card' | 'full'): Img | null`; `FALLBACK_IMAGE: Img`

- [ ] **Step 1: Tests que fallan**

`tests/unit/catalog.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { catalogHref, parseCatalogParams, sortProducts } from '../../src/lib/catalog'

const p = (name: string, price: number, soldOut: boolean, createdAt: string) => ({ name, price, soldOut, createdAt })
const items = [
  p('a', 50000, false, '2026-01-01'),
  p('b', 30000, true, '2026-03-01'),
  p('c', 40000, false, '2026-02-01'),
]

describe('parseCatalogParams', () => {
  it('usa los valores por defecto', () => {
    expect(parseCatalogParams({}, ['bodies'])).toEqual({ categoria: null, orden: 'recientes' })
  })
  it('acepta valores válidos', () => {
    expect(parseCatalogParams({ categoria: 'bodies', orden: 'precio-asc' }, ['bodies'])).toEqual({
      categoria: 'bodies',
      orden: 'precio-asc',
    })
  })
  it('ignora categoría y orden desconocidos', () => {
    expect(parseCatalogParams({ categoria: 'nope', orden: 'zzz' }, ['bodies'])).toEqual({
      categoria: null,
      orden: 'recientes',
    })
  })
  it('usa el primer valor si vienen repetidos', () => {
    expect(parseCatalogParams({ categoria: ['bodies', 'x'], orden: ['precio-desc', 'a'] }, ['bodies'])).toEqual({
      categoria: 'bodies',
      orden: 'precio-desc',
    })
  })
})

describe('sortProducts', () => {
  it('recientes: nuevos primero, agotados al final', () => {
    expect(sortProducts(items, 'recientes').map((i) => i.name)).toEqual(['c', 'a', 'b'])
  })
  it('precio-asc: agotados al final', () => {
    expect(sortProducts(items, 'precio-asc').map((i) => i.name)).toEqual(['c', 'a', 'b'])
  })
  it('precio-desc: agotados al final aunque sean los más baratos', () => {
    expect(sortProducts(items, 'precio-desc').map((i) => i.name)).toEqual(['a', 'c', 'b'])
  })
  it('no muta la lista original', () => {
    const copy = [...items]
    sortProducts(items, 'precio-asc')
    expect(items).toEqual(copy)
  })
})

describe('catalogHref', () => {
  it('sin filtros', () => expect(catalogHref({ categoria: null, orden: 'recientes' })).toBe('/catalogo'))
  it('solo categoría', () => expect(catalogHref({ categoria: 'bodies', orden: 'recientes' })).toBe('/catalogo?categoria=bodies'))
  it('solo orden', () => expect(catalogHref({ categoria: null, orden: 'precio-asc' })).toBe('/catalogo?orden=precio-asc'))
  it('ambos', () =>
    expect(catalogHref({ categoria: 'bodies', orden: 'precio-desc' })).toBe('/catalogo?categoria=bodies&orden=precio-desc'))
})
```

`tests/unit/purchase.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { purchaseState } from '../../src/lib/purchase'

describe('purchaseState', () => {
  it('agotada gana siempre', () => {
    expect(purchaseState({ colorCount: 3, selected: 'Negro', soldOut: true })).toBe('sold-out')
  })
  it('con colores y ninguno elegido pide elegir', () => {
    expect(purchaseState({ colorCount: 2, selected: null, soldOut: false })).toBe('needs-color')
  })
  it('con color elegido está lista', () => {
    expect(purchaseState({ colorCount: 2, selected: 'Rojo', soldOut: false })).toBe('ready')
  })
  it('sin colores registrados está lista', () => {
    expect(purchaseState({ colorCount: 0, selected: null, soldOut: false })).toBe('ready')
  })
})
```

`tests/unit/text.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { paragraphs } from '../../src/lib/text'

describe('paragraphs', () => {
  it('separa por línea en blanco', () => expect(paragraphs('uno\n\ndos')).toEqual(['uno', 'dos']))
  it('ignora líneas en blanco de más y espacios', () =>
    expect(paragraphs('\n\n  uno  \n\n\n\n dos \n\n')).toEqual(['uno', 'dos']))
  it.each([undefined, null, '', '   \n '])('vacío (%j) → []', (v) => expect(paragraphs(v as string | null | undefined)).toEqual([]))
})
```

`tests/unit/images.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { Media } from '../../src/payload-types'
import { FALLBACK_IMAGE, pickImage } from '../../src/lib/images'

const media = (over: Partial<Media> = {}): Media => ({
  id: 1,
  alt: 'Body Cloe',
  updatedAt: '',
  createdAt: '',
  url: '/api/media/file/orig.jpg',
  width: 1000,
  height: 1250,
  sizes: { card: { url: '/api/media/file/card.webp', width: 800, height: 1000 } },
  ...over,
})

describe('pickImage', () => {
  it('usa el tamaño pedido', () => {
    expect(pickImage(media(), 'card')).toEqual({ src: '/api/media/file/card.webp', width: 800, height: 1000, alt: 'Body Cloe' })
  })
  it('cae al original si falta ese tamaño', () => {
    expect(pickImage(media(), 'full')).toEqual({ src: '/api/media/file/orig.jpg', width: 1000, height: 1250, alt: 'Body Cloe' })
  })
  it('devuelve null si es solo un id o no hay nada', () => {
    expect(pickImage(5, 'card')).toBeNull()
    expect(pickImage(null, 'card')).toBeNull()
    expect(pickImage(undefined, 'card')).toBeNull()
  })
  it('devuelve null si el medio no tiene url', () => {
    expect(pickImage(media({ url: null, sizes: {} }), 'card')).toBeNull()
  })
  it('expone una imagen de reserva', () => {
    expect(FALLBACK_IMAGE.src).toMatch(/^\//)
    expect(FALLBACK_IMAGE.width / FALLBACK_IMAGE.height).toBeCloseTo(0.8)
  })
})
```

- [ ] **Step 2: Verlos fallar**

Run: `npx vitest run tests/unit/catalog.test.ts tests/unit/purchase.test.ts tests/unit/text.test.ts tests/unit/images.test.ts`
Expected: FAIL — no se encuentran los módulos.

- [ ] **Step 3: Implementar**

`src/lib/catalog.ts`:

```ts
export type SortKey = 'recientes' | 'precio-asc' | 'precio-desc'
const SORT_KEYS: readonly SortKey[] = ['recientes', 'precio-asc', 'precio-desc']

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)

export function parseCatalogParams(
  raw: { categoria?: string | string[]; orden?: string | string[] },
  validSlugs: string[],
): { categoria: string | null; orden: SortKey } {
  const cat = first(raw.categoria)
  const ord = first(raw.orden)
  return {
    categoria: cat && validSlugs.includes(cat) ? cat : null,
    orden: SORT_KEYS.includes(ord as SortKey) ? (ord as SortKey) : 'recientes',
  }
}

type Sortable = { price: number; soldOut?: boolean | null; createdAt: string }

export function sortProducts<T extends Sortable>(items: T[], orden: SortKey): T[] {
  const key = (a: T, b: T) =>
    orden === 'precio-asc'
      ? a.price - b.price
      : orden === 'precio-desc'
        ? b.price - a.price
        : b.createdAt.localeCompare(a.createdAt)
  return [...items].sort((a, b) => Number(Boolean(a.soldOut)) - Number(Boolean(b.soldOut)) || key(a, b))
}

export function catalogHref({ categoria, orden }: { categoria: string | null; orden: SortKey }): string {
  const q = new URLSearchParams()
  if (categoria) q.set('categoria', categoria)
  if (orden !== 'recientes') q.set('orden', orden)
  const s = q.toString()
  return s ? `/catalogo?${s}` : '/catalogo'
}
```

`src/lib/purchase.ts`:

```ts
export type PurchaseState = 'sold-out' | 'needs-color' | 'ready'

export function purchaseState({
  colorCount,
  selected,
  soldOut,
}: {
  colorCount: number
  selected: string | null
  soldOut: boolean
}): PurchaseState {
  if (soldOut) return 'sold-out'
  if (colorCount > 0 && !selected) return 'needs-color'
  return 'ready'
}
```

`src/lib/text.ts`:

```ts
/** Separa un texto en párrafos por líneas en blanco, sin párrafos vacíos. */
export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}
```

`src/lib/images.ts`:

```ts
import type { Media } from '../payload-types'

export type Img = { src: string; width: number; height: number; alt: string }
export type ImgSize = 'thumbnail' | 'card' | 'full'

/** Imagen de reserva (crema, 4:5) para cuando una prenda no tiene foto utilizable. */
export const FALLBACK_IMAGE: Img = { src: '/fallback-foto.svg', width: 800, height: 1000, alt: 'Foto próximamente' }

export function pickImage(media: number | Media | null | undefined, size: ImgSize): Img | null {
  if (!media || typeof media === 'number') return null
  const sized = media.sizes?.[size]
  if (sized?.url && sized.width && sized.height) {
    return { src: sized.url, width: sized.width, height: sized.height, alt: media.alt }
  }
  if (media.url && media.width && media.height) {
    return { src: media.url, width: media.width, height: media.height, alt: media.alt }
  }
  return null
}
```

Crear también `public/fallback-foto.svg` (crea la carpeta `public/` si no existe):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="#E6DAC8"/><path d="M400 560s-90-56-90-124a52 52 0 0 1 90-36 52 52 0 0 1 90 36c0 68-90 124-90 124z" fill="none" stroke="#A48D78" stroke-width="6"/></svg>
```

- [ ] **Step 4: Verlos pasar**

Run: `npx vitest run tests/unit/catalog.test.ts tests/unit/purchase.test.ts tests/unit/text.test.ts tests/unit/images.test.ts`
Expected: PASS (todos).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(store): pure catalog, purchase, text and image helpers"
```

---

### Task 3: Capa de datos con caché

**Files:**
- Create: `src/lib/data.ts`
- Test: `tests/int/data.int.spec.ts`

**Interfaces:**
- Consumes: `CACHE_TAGS` de `src/lib/cache-tags.ts`; config de Payload.
- Produces (todas async, cacheadas con `unstable_cache`):
  - `getSiteSettings(): Promise<SiteSetting>`
  - `getCategories(): Promise<Category[]>` (ordenadas por `order`)
  - `getProducts(): Promise<Product[]>` (con `category` e `images` poblados; `depth: 1`; hasta 500)
  - `getProductBySlug(slug: string): Promise<Product | null>`
  - `mediaOf(product: Product): Media[]` → solo las fotos ya pobladas (objetos), en orden.
  - `categoryOf(product: Product): Category | null`.

- [ ] **Step 1: Test que falla**

`tests/int/data.int.spec.ts`:

```ts
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { categoryOf, getCategories, getProductBySlug, getProducts, getSiteSettings, mediaOf } from '../../src/lib/data'
import { NO_REVALIDATE, RUN, createTestImage } from './helpers'

let payload: Payload
const ids: { cat?: number; img?: number; prods: number[] } = { prods: [] }
const slugCat = `cat-datos-${RUN}`

beforeAll(async () => {
  payload = await getPayload({ config })
  const img = await createTestImage(payload)
  ids.img = img.id
  const cat = await payload.create({
    collection: 'categories',
    data: { name: `Cat ${RUN}`, slug: slugCat, order: 98 },
    context: NO_REVALIDATE,
  })
  ids.cat = cat.id
  for (const [name, price, soldOut] of [['Uno', 30000, false], ['Dos', 20000, true]] as const) {
    const p = await payload.create({
      collection: 'products',
      data: { name: `${name} ${RUN}`, slug: `${name.toLowerCase()}-${RUN}`, category: cat.id, price, soldOut, images: [img.id] },
      context: NO_REVALIDATE,
    })
    ids.prods.push(p.id)
  }
})

afterAll(async () => {
  for (const id of ids.prods) await payload.delete({ collection: 'products', id, context: NO_REVALIDATE })
  if (ids.cat) await payload.delete({ collection: 'categories', id: ids.cat, context: NO_REVALIDATE })
  if (ids.img) await payload.delete({ collection: 'media', id: ids.img, context: NO_REVALIDATE })
})

describe('capa de datos', () => {
  it('lista productos con categoría y fotos pobladas', async () => {
    const mine = (await getProducts()).filter((p) => p.slug.endsWith(`-${RUN}`))
    expect(mine).toHaveLength(2)
    expect(categoryOf(mine[0])?.slug).toBe(slugCat)
    expect(mediaOf(mine[0])[0].alt).toBeTruthy()
  })
  it('busca por slug y devuelve null si no existe', async () => {
    expect((await getProductBySlug(`uno-${RUN}`))?.name).toBe(`Uno ${RUN}`)
    expect(await getProductBySlug('no-existe-jamas')).toBeNull()
  })
  it('lista categorías ordenadas por `order`', async () => {
    const orders = (await getCategories()).map((c) => c.order ?? 0)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })
  it('devuelve la configuración del sitio', async () => {
    expect((await getSiteSettings()).whatsappNumber).toMatch(/^\d{10,15}$/)
  })
})
```

- [ ] **Step 2: Verlo fallar**

Run: `npx vitest run tests/int/data.int.spec.ts`
Expected: FAIL — no se encuentra `../../src/lib/data`.

- [ ] **Step 3: Implementar**

`src/lib/data.ts`:

```ts
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import type { Category, Media, Product, SiteSetting } from '../payload-types'
import { CACHE_TAGS } from './cache-tags'

const db = () => getPayload({ config })

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSetting> => (await db()).findGlobal({ slug: 'site-settings' }),
  ['site-settings'],
  { tags: [CACHE_TAGS.siteSettings] },
)

export const getCategories = unstable_cache(
  async (): Promise<Category[]> =>
    (await (await db()).find({ collection: 'categories', sort: 'order', limit: 100, depth: 1 })).docs,
  ['categories'],
  { tags: [CACHE_TAGS.categories, CACHE_TAGS.siteSettings] },
)

export const getProducts = unstable_cache(
  async (): Promise<Product[]> =>
    (await (await db()).find({ collection: 'products', sort: '-createdAt', limit: 500, depth: 1 })).docs,
  ['products'],
  { tags: [CACHE_TAGS.products, CACHE_TAGS.categories] },
)

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.slug === slug) ?? null
}

export const mediaOf = (product: Product): Media[] =>
  (product.images ?? []).filter((m): m is Media => typeof m === 'object' && m !== null)

export const categoryOf = (product: Product): Category | null =>
  typeof product.category === 'object' && product.category !== null ? product.category : null
```

Nota de diseño: `getProductBySlug` filtra la lista ya cacheada (catálogo de ~30 prendas) para no crear una caché por slug que habría que invalidar aparte.

- [ ] **Step 4: Verlo pasar**

Run: `npx tsc --noEmit && npx vitest run tests/int/data.int.spec.ts`
Expected: PASS (4 tests). (`tests/setup.ts` ya mockea `unstable_cache` como passthrough.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(store): cached data layer over Payload Local API"
```

---

### Task 4: Estructura del sitio (encabezado, pie, botón flotante, avisos)

**Files:**
- Create: `src/components/site/Decor.tsx`, `Header.tsx`, `MobileMenu.tsx`, `Footer.tsx`, `FloatingWhatsApp.tsx`, `WhatsAppIcon.tsx`, `SiteNotice.tsx`
- Create: `src/app/(frontend)/(site)/layout.tsx` (grupo de rutas con el marco: encabezado/pie)
- Move: `src/app/(frontend)/page.tsx` → `src/app/(frontend)/(site)/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()`, `buildGreetingUrl(phone)` (`src/lib/whatsapp.ts`).
- Produces: componentes `Heart`, `Sparkle` (SVG decorativos, `aria-hidden`), `WhatsAppIcon`; el marco del sitio envuelve todas las páginas dentro de `(site)`. El 404 (Task 8) también usa este marco.

Nota: se usa el route group `(site)` para que el layout con datos (encabezado, pie) no choque con el layout raíz que define `<html>`.

- [ ] **Step 1: Decoraciones y icono**

`src/components/site/Decor.tsx`:

```tsx
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
```

`src/components/site/WhatsAppIcon.tsx`:

```tsx
import React from 'react'

export const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.27-1.38A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.2 15.04l-.3-.18-3.13.82.84-3.05-.2-.32A8.1 8.1 0 0 1 12.04 3.8zm-3.1 4.1c-.2 0-.5.07-.76.35-.26.28-1 1-1 2.43s1.03 2.82 1.18 3.02c.14.2 2 3.2 4.95 4.37 2.45.97 2.95.78 3.48.73.53-.05 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.34-.29-.15-1.7-.84-1.96-.94-.27-.1-.46-.15-.65.14-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.5.15-.17.2-.29.29-.48.1-.2.05-.36-.02-.5-.07-.15-.65-1.6-.9-2.18-.23-.56-.47-.49-.65-.5h-.55z" />
  </svg>
)
```

- [ ] **Step 2: Encabezado y menú móvil**

`src/components/site/MobileMenu.tsx`:

```tsx
'use client'
import Link from 'next/link'
import React, { useState } from 'react'

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-arena"
      >
        <span aria-hidden="true" className="text-xl leading-none">{open ? '×' : '☰'}</span>
      </button>
      {open && (
        <nav id="menu-movil" aria-label="Principal" className="absolute inset-x-0 top-full border-b border-arena bg-fondo px-4 pb-4">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center text-lg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
```

`src/components/site/Header.tsx`:

```tsx
import Link from 'next/link'
import React from 'react'
import { Heart } from './Decor'
import { MobileMenu } from './MobileMenu'

export const NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/como-comprar', label: 'Cómo comprar' },
]

export function Header() {
  return (
    <header className="relative border-b border-arena bg-fondo">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-fondo focus:p-2">
        Saltar al contenido
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-3xl font-medium" aria-label="Véliza, inicio">
          <Heart className="text-roca" />
          Véliza
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex gap-8 text-sm uppercase tracking-[0.18em]">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileMenu links={NAV_LINKS} />
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Aviso, pie y botón flotante**

`src/components/site/SiteNotice.tsx`:

```tsx
import React from 'react'

export function SiteNotice({ text }: { text?: string | null }) {
  if (!text) return null
  return <p className="bg-crema px-4 py-2 text-center text-sm tracking-wide">{text}</p>
}
```

`src/components/site/Footer.tsx`:

```tsx
import Link from 'next/link'
import React from 'react'
import type { SiteSetting } from '../../payload-types'
import { buildGreetingUrl } from '../../lib/whatsapp'
import { Sparkle } from './Decor'
import { NAV_LINKS } from './Header'

export function Footer({ settings }: { settings: SiteSetting }) {
  const social = [
    { href: settings.instagramUrl, label: 'Instagram' },
    { href: settings.tiktokUrl, label: 'TikTok' },
    { href: buildGreetingUrl(settings.whatsappNumber), label: 'WhatsApp' },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href))

  return (
    <footer className="mt-24 bg-crema">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl">Véliza</p>
          <p className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
            <Sparkle className="text-roca" /> Ropa • Estilo • Tú
          </p>
          {settings.antifraudNotice && <p className="mt-4 text-sm">{settings.antifraudNotice}</p>}
        </div>
        <nav aria-label="Páginas">
          <p className="mb-2 text-xs uppercase tracking-[0.25em]">Explora</p>
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center hover:underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Redes">
          <p className="mb-2 text-xs uppercase tracking-[0.25em]">Escríbenos</p>
          <ul>
            {social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-arena px-4 py-4 text-center text-xs text-texto-suave">
        © {new Date().getFullYear()} Véliza · Barranquilla, Colombia · Con mucho amor 💕
      </p>
    </footer>
  )
}
```

`src/components/site/FloatingWhatsApp.tsx`:

```tsx
import React from 'react'
import { buildGreetingUrl } from '../../lib/whatsapp'
import { WhatsAppIcon } from './WhatsAppIcon'

export function FloatingWhatsApp({ phone }: { phone: string }) {
  return (
    <a
      href={buildGreetingUrl(phone)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-texto text-fondo shadow-lg transition-transform hover:scale-105 motion-reduce:transition-none"
    >
      <WhatsAppIcon />
    </a>
  )
}
```

- [ ] **Step 4: Marco del sitio**

Mover `src/app/(frontend)/page.tsx` a `src/app/(frontend)/(site)/page.tsx` (`git mv`).

`src/app/(frontend)/(site)/layout.tsx`:

```tsx
import React from 'react'
import { FloatingWhatsApp } from '../../../components/site/FloatingWhatsApp'
import { Footer } from '../../../components/site/Footer'
import { Header } from '../../../components/site/Header'
import { SiteNotice } from '../../../components/site/SiteNotice'
import { getSiteSettings } from '../../../lib/data'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <>
      <SiteNotice text={settings.priceNotice} />
      <Header />
      <main id="contenido">{children}</main>
      <Footer settings={settings} />
      <FloatingWhatsApp phone={settings.whatsappNumber} />
    </>
  )
}
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`, luego `npm run dev` y abrir `http://localhost:3000` a 375 px y a 1280 px.
Expected: aviso de precios arriba, encabezado con «Véliza» y navegación (☰ en celular, que abre y cierra), pie con Explora/Escríbenos, botón flotante de WhatsApp cacao abajo a la derecha. Con el teclado, Tab muestra un foco visible y el primer Tab ofrece «Saltar al contenido».

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(store): site shell with header, footer, notice and floating WhatsApp"
```

---

### Task 5: Tarjeta de prenda y catálogo

**Files:**
- Create: `src/components/store/ProductCard.tsx`, `src/components/store/PhotoImage.tsx`, `src/components/store/CatalogControls.tsx`
- Create: `src/app/(frontend)/(site)/catalogo/page.tsx`

**Interfaces:**
- Consumes: `getProducts`, `getCategories`, `categoryOf`, `mediaOf`, `pickImage`, `FALLBACK_IMAGE`, `parseCatalogParams`, `sortProducts`, `catalogHref`, `formatCOP` (`src/lib/price.ts`).
- Produces: `PhotoImage` (props `{ img: Img; sizes: string; priority?: boolean; className?: string; grayscale?: boolean }`), `ProductCard` (props `{ product: Product; priority?: boolean }`).

- [ ] **Step 1: Imagen**

`src/components/store/PhotoImage.tsx`:

```tsx
import Image from 'next/image'
import React from 'react'
import type { Img } from '../../lib/images'

export function PhotoImage({
  img,
  sizes,
  priority,
  className = '',
  grayscale,
}: {
  img: Img
  sizes: string
  priority?: boolean
  className?: string
  grayscale?: boolean
}) {
  return (
    <Image
      src={img.src}
      alt={img.alt}
      width={img.width}
      height={img.height}
      sizes={sizes}
      priority={priority}
      unoptimized
      className={`h-full w-full object-cover ${grayscale ? 'grayscale opacity-60' : ''} ${className}`}
    />
  )
}
```

- [ ] **Step 2: Tarjeta**

`src/components/store/ProductCard.tsx`:

```tsx
import Link from 'next/link'
import React from 'react'
import { mediaOf } from '../../lib/data'
import { FALLBACK_IMAGE, pickImage } from '../../lib/images'
import { formatCOP } from '../../lib/price'
import type { Product } from '../../payload-types'
import { PhotoImage } from './PhotoImage'

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const photos = mediaOf(product)
  const cover = pickImage(photos[0], 'card') ?? FALLBACK_IMAGE
  const hover = pickImage(photos[1], 'card')
  const soldOut = Boolean(product.soldOut)
  const colors = product.colors ?? []

  return (
    <li className="reveal group">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-superficie">
          <PhotoImage
            img={cover}
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
            priority={priority}
            grayscale={soldOut}
          />
          {hover && !soldOut && (
            <PhotoImage
              img={hover}
              sizes="25vw"
              className="absolute inset-0 opacity-0 transition-opacity duration-200 motion-reduce:transition-none md:group-hover:opacity-100"
            />
          )}
          {soldOut && (
            <span className="absolute left-2 top-2 bg-fondo px-2 py-1 text-xs uppercase tracking-[0.2em]">Agotada</span>
          )}
        </div>
        <h3 className="mt-3 font-serif text-xl italic leading-tight">{product.name}</h3>
        <p className="text-texto-suave">{formatCOP(product.price)}</p>
        {colors.length > 0 && (
          <ul className="mt-1 flex gap-1" aria-label={`Colores: ${colors.map((c) => c.name).join(', ')}`}>
            {colors.slice(0, 6).map((c) => (
              <li key={c.id ?? c.name} className="h-3 w-3 rounded-full border border-arena" style={{ background: c.swatch || '#E6DAC8' }} />
            ))}
          </ul>
        )}
      </Link>
    </li>
  )
}
```

- [ ] **Step 3: Controles (solo enlaces)**

`src/components/store/CatalogControls.tsx`:

```tsx
import Link from 'next/link'
import React from 'react'
import { catalogHref, type SortKey } from '../../lib/catalog'
import type { Category } from '../../payload-types'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recientes', label: 'Novedades' },
  { key: 'precio-asc', label: 'Precio: menor a mayor' },
  { key: 'precio-desc', label: 'Precio: mayor a menor' },
]

const chip = (active: boolean) =>
  `inline-flex min-h-11 items-center rounded-full border px-4 text-sm ${active ? 'border-texto bg-texto text-fondo' : 'border-arena hover:bg-superficie'}`

export function CatalogControls({
  categories,
  categoria,
  orden,
}: {
  categories: Category[]
  categoria: string | null
  orden: SortKey
}) {
  return (
    <div className="mb-8 grid gap-4">
      <nav aria-label="Categorías">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link href={catalogHref({ categoria: null, orden })} aria-current={!categoria ? 'page' : undefined} className={chip(!categoria)}>
              Todo
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={catalogHref({ categoria: c.slug, orden })} aria-current={categoria === c.slug ? 'page' : undefined} className={chip(categoria === c.slug)}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="Ordenar">
        <ul className="flex flex-wrap items-center gap-2">
          <li className="text-xs uppercase tracking-[0.2em] text-texto-suave">Ordenar</li>
          {SORTS.map((s) => (
            <li key={s.key}>
              <Link href={catalogHref({ categoria, orden: s.key })} aria-current={orden === s.key ? 'page' : undefined} className={chip(orden === s.key)}>
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
```

- [ ] **Step 4: Página**

`src/app/(frontend)/(site)/catalogo/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { CatalogControls } from '../../../../components/store/CatalogControls'
import { ProductCard } from '../../../../components/store/ProductCard'
import { parseCatalogParams, sortProducts } from '../../../../lib/catalog'
import { categoryOf, getCategories, getProducts } from '../../../../lib/data'

export const metadata: Metadata = { title: 'Catálogo', description: 'Blusas, bodies, vestidos y más. Elige tu prenda y pídela por WhatsApp.' }

type Props = { searchParams: Promise<{ categoria?: string | string[]; orden?: string | string[] }> }

export default async function CatalogPage({ searchParams }: Props) {
  const [categories, products, raw] = await Promise.all([getCategories(), getProducts(), searchParams])
  const { categoria, orden } = parseCatalogParams(raw, categories.map((c) => c.slug))
  const visible = sortProducts(
    categoria ? products.filter((p) => categoryOf(p)?.slug === categoria) : products,
    orden,
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="font-serif text-4xl md:text-5xl">Catálogo</h1>
      <p className="mb-8 mt-2 text-texto-suave">Elige tu prenda y pídela por WhatsApp 💕</p>
      <CatalogControls categories={categories} categoria={categoria} orden={orden} />
      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl">Pronto tendremos novedades aquí 💕</p>
          <Link href="/catalogo" className="mt-4 inline-flex min-h-11 items-center underline">Ver todo el catálogo</Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`; en el navegador: `/catalogo`, `/catalogo?categoria=bodies`, `/catalogo?orden=precio-desc`, `/catalogo?categoria=zzz&orden=zzz`.
Expected: 29 prendas en 2 columnas a 375 px y 4 a 1280 px; los chips filtran y marcan el activo; `precio-desc` empieza por la más cara; los parámetros inválidos muestran el catálogo completo sin error; una prenda agotada (márcala temporalmente desde el panel) sale gris al final con la etiqueta «Agotada». Desmárcala después.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(store): catalog page with category filter and sort"
```

---

### Task 6: Detalle de prenda y pedido por WhatsApp

**Files:**
- Create: `src/components/store/Gallery.tsx`, `src/components/store/PurchasePanel.tsx`
- Create: `src/app/(frontend)/(site)/producto/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProductBySlug`, `getProducts`, `mediaOf`, `categoryOf`, `pickImage`, `purchaseState`, `buildWhatsAppUrl` (`{ phone, productName, color?, productUrl }`), `getSiteSettings`, `formatCOP`.
- Produces: `Gallery` (`{ images: Img[] }`), `PurchasePanel` (`{ phone: string; productName: string; productUrl: string; colors: { name: string; swatch?: string | null }[]; soldOut: boolean }`).

- [ ] **Step 1: Galería**

`src/components/store/Gallery.tsx`:

```tsx
'use client'
import React, { useState } from 'react'
import type { Img } from '../../lib/images'
import { PhotoImage } from './PhotoImage'

export function Gallery({ images, soldOut }: { images: Img[]; soldOut?: boolean }) {
  const [i, setI] = useState(0)
  const current = images[i] ?? images[0]
  return (
    <div>
      <div className="aspect-[4/5] overflow-hidden bg-superficie">
        <PhotoImage img={current} sizes="(min-width:768px) 50vw, 100vw" priority grayscale={soldOut} />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Ver foto ${idx + 1} de ${images.length}`}
                aria-current={idx === i}
                className={`aspect-[4/5] min-h-11 w-full overflow-hidden border ${idx === i ? 'border-texto' : 'border-arena'}`}
              >
                <PhotoImage img={img} sizes="20vw" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Panel de compra (selector de color + WhatsApp)**

`src/components/store/PurchasePanel.tsx`:

```tsx
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
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm ${active ? 'border-texto bg-superficie' : 'border-arena'} disabled:opacity-50`}
                >
                  <span className="h-4 w-4 rounded-full border border-arena" style={{ background: c.swatch || '#E6DAC8' }} aria-hidden="true" />
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
```

- [ ] **Step 3: Página**

`src/app/(frontend)/(site)/producto/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { Gallery } from '../../../../../components/store/Gallery'
import { PurchasePanel } from '../../../../../components/store/PurchasePanel'
import { categoryOf, getProductBySlug, getProducts, getSiteSettings, mediaOf } from '../../../../../lib/data'
import { FALLBACK_IMAGE, pickImage, type Img } from '../../../../../lib/images'
import { formatCOP } from '../../../../../lib/price'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug)
  if (!product) return { title: 'Prenda no encontrada' }
  const cover = pickImage(mediaOf(product)[0], 'full')
  return {
    title: product.name,
    description: product.description || `${product.name} · ${formatCOP(product.price)}. Pídela por WhatsApp.`,
    openGraph: cover ? { images: [{ url: cover.src, width: cover.width, height: cover.height }] } : undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) notFound()

  const images = mediaOf(product).map((m) => pickImage(m, 'full')).filter((i): i is Img => i !== null)
  const category = categoryOf(product)
  const soldOut = Boolean(product.soldOut)
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <nav aria-label="Ruta" className="mb-6 text-sm text-texto-suave">
        <Link href="/catalogo" className="underline">Catálogo</Link>
        {category && (
          <>
            {' / '}
            <Link href={`/catalogo?categoria=${category.slug}`} className="underline">{category.name}</Link>
          </>
        )}
      </nav>
      <div className="grid gap-10 md:grid-cols-2">
        <Gallery images={images.length ? images : [FALLBACK_IMAGE]} soldOut={soldOut} />
        <div>
          <h1 className="font-serif text-4xl italic leading-tight md:text-5xl">{product.name}</h1>
          <p className="mt-2 text-2xl">{formatCOP(product.price)}</p>
          <p className="mt-1 text-sm uppercase tracking-[0.2em] text-texto-suave">{product.size || 'Talla única (S–M)'}</p>
          {product.description && <p className="mt-6">{product.description}</p>}
          <PurchasePanel
            phone={settings.whatsappNumber}
            productName={product.name}
            productUrl={`${base}/producto/${product.slug}`}
            colors={(product.colors ?? []).map((c) => ({ name: c.name, swatch: c.swatch }))}
            soldOut={soldOut}
          />
          {settings.priceNotice && <p className="mt-8 text-sm text-texto-suave">{settings.priceNotice}</p>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`. En el navegador abre `/producto/body-ml` (Body M.L trae 7 colores; si el slug difiere, entra desde el catálogo).
Expected:
1. Botón deshabilitado «Elige un color» y el texto «Elige un color para continuar.».
2. Al elegir un color, el botón pasa a «Pedir por WhatsApp» y su enlace (pasa el ratón o clic derecho → copiar) empieza con `https://wa.me/573189952081?text=` e incluye el nombre, el color y la URL de la prenda.
3. Una prenda sin colores muestra el botón activo de inmediato.
4. `/producto/no-existe` muestra el 404 (aún el de Next; se estiliza en Task 8).
5. Una prenda agotada: foto gris y botón «Agotada» deshabilitado.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(store): product page with gallery, color picker and WhatsApp order"
```

---

### Task 7: Inicio

**Files:**
- Modify: `src/app/(frontend)/(site)/page.tsx`
- Create: `src/components/store/SectionTitle.tsx`

**Interfaces:**
- Consumes: `getProducts`, `getCategories`, `getSiteSettings`, `mediaOf`, `pickImage`, `sortProducts`, `ProductCard`, `PhotoImage`, `paragraphs`, `Heart`, `Sparkle`.
- Produces: la página `/`.

- [ ] **Step 1: Título de sección**

`src/components/store/SectionTitle.tsx`:

```tsx
import React from 'react'
import { Sparkle } from '../site/Decor'

export function SectionTitle({ script, children }: { script?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 text-center">
      {script && <p className="font-script text-3xl text-roca" aria-hidden="true">{script}</p>}
      <h2 className="flex items-center justify-center gap-3 font-serif text-3xl md:text-4xl">
        <Sparkle className="text-roca" />
        {children}
        <Sparkle className="text-roca" />
      </h2>
    </div>
  )
}
```

- [ ] **Step 2: Página de inicio**

`src/app/(frontend)/(site)/page.tsx`:

```tsx
import Link from 'next/link'
import React from 'react'
import { PhotoImage } from '../../../components/store/PhotoImage'
import { ProductCard } from '../../../components/store/ProductCard'
import { SectionTitle } from '../../../components/store/SectionTitle'
import { catalogHref, sortProducts } from '../../../lib/catalog'
import { categoryOf, getCategories, getProducts, getSiteSettings, mediaOf } from '../../../lib/data'
import { FALLBACK_IMAGE, pickImage } from '../../../lib/images'
import type { Category, Product } from '../../../payload-types'

const button = 'inline-flex min-h-12 items-center justify-center bg-texto px-8 text-sm font-medium uppercase tracking-[0.18em] text-fondo hover:opacity-90'

function tileImage(category: Category, products: Product[]) {
  const own = pickImage(category.image, 'card')
  if (own) return own
  const first = products.find((p) => categoryOf(p)?.id === category.id)
  return (first && pickImage(mediaOf(first)[0], 'card')) || FALLBACK_IMAGE
}

export default async function HomePage() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSiteSettings()])
  const available = sortProducts(products, 'recientes')
  const featured = available.filter((p) => p.featured && !p.soldOut)
  const highlights = (featured.length ? featured : available.filter((p) => !p.soldOut)).slice(0, 4)

  return (
    <>
      <section className="bg-superficie px-4 py-20 text-center">
        <p className="font-script text-4xl text-roca" aria-hidden="true">con mucho amor</p>
        <h1 className="mt-2 font-serif text-6xl md:text-8xl">Véliza</h1>
        <p className="mt-3 text-sm uppercase tracking-[0.35em]">Ropa • Estilo • Tú</p>
        <Link href="/catalogo" className={`${button} mt-10`}>Ver catálogo</Link>
      </section>

      {highlights.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20" aria-labelledby="destacados">
          <SectionTitle script="lo que más nos gusta">
            <span id="destacados">Destacados</span>
          </SectionTitle>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {highlights.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </ul>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20" aria-labelledby="categorias">
          <SectionTitle script="encuentra tu estilo">
            <span id="categorias">Categorías</span>
          </SectionTitle>
          <ul className="grid gap-4 md:grid-cols-3">
            {categories.map((c) => (
              <li key={c.id} className="reveal">
                <Link href={catalogHref({ categoria: c.slug, orden: 'recientes' })} className="group relative block aspect-[4/5] overflow-hidden bg-superficie">
                  <PhotoImage img={tileImage(c, products)} sizes="(min-width:768px) 33vw, 100vw" className="transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-fondo/90 py-3 text-center font-serif text-2xl">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {settings.aboutShort && (
        <section className="mx-auto max-w-2xl px-4 pt-20 text-center" aria-labelledby="nosotras">
          <SectionTitle script="¿Quiénes somos?">
            <span id="nosotras">Nuestra historia</span>
          </SectionTitle>
          <p>{settings.aboutShort}</p>
          <Link href="/quienes-somos" className="mt-4 inline-flex min-h-11 items-center underline">Conócenos</Link>
        </section>
      )}

      {(settings.howToBuySteps ?? []).length > 0 && (
        <section className="mx-auto max-w-4xl px-4 pt-20" aria-labelledby="como">
          <SectionTitle script="es muy fácil">
            <span id="como">Cómo comprar</span>
          </SectionTitle>
          <ol className="grid gap-6 md:grid-cols-4">
            {(settings.howToBuySteps ?? []).map((s, i) => (
              <li key={s.id ?? i} className="text-center">
                <span className="font-serif text-5xl text-roca" aria-hidden="true">{i + 1}</span>
                <p className="mt-2">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-center">
            <Link href="/como-comprar" className="inline-flex min-h-11 items-center underline">Ver entregas y cambios</Link>
          </p>
        </section>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`; abre `/` a 375 y 1280 px.
Expected: portada con «Véliza» y el lema, 4 destacadas (la del seed con `featured`, o las 4 más nuevas disponibles), 3 tarjetas de categoría con foto, «Nuestra historia» y los 4 pasos numerados. Sin scroll horizontal.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(store): home page"
```

---

### Task 8: Quiénes somos, Cómo comprar y 404

**Files:**
- Create: `src/app/(frontend)/(site)/quienes-somos/page.tsx`
- Create: `src/app/(frontend)/(site)/como-comprar/page.tsx`
- Create: `src/app/(frontend)/(site)/not-found.tsx`

**Interfaces:**
- Consumes: `getSiteSettings`, `paragraphs`, `SectionTitle`, `Heart`.
- Produces: las tres páginas.

- [ ] **Step 1: Quiénes somos**

`src/app/(frontend)/(site)/quienes-somos/page.tsx`:

```tsx
import type { Metadata } from 'next'
import React from 'react'
import { SectionTitle } from '../../../../components/store/SectionTitle'
import { getSiteSettings } from '../../../../lib/data'
import { paragraphs } from '../../../../lib/text'

export const metadata: Metadata = { title: 'Quiénes somos' }

export default async function AboutPage() {
  const s = await getSiteSettings()
  const story = paragraphs(s.aboutStory)
  return (
    <div className="mx-auto max-w-2xl px-4 pt-12">
      <SectionTitle script="¿Quiénes somos?">Nuestra historia</SectionTitle>
      <div className="grid gap-4 text-lg">
        {story.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {(s.mission || s.vision) && (
        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {s.mission && (
            <section>
              <p className="font-script text-3xl text-roca" aria-hidden="true">Misión</p>
              <h2 className="font-serif text-2xl">Nuestra misión</h2>
              <p className="mt-2">{s.mission}</p>
            </section>
          )}
          {s.vision && (
            <section>
              <p className="font-script text-3xl text-roca" aria-hidden="true">Visión</p>
              <h2 className="font-serif text-2xl">Nuestra visión</h2>
              <p className="mt-2">{s.vision}</p>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Cómo comprar**

`src/app/(frontend)/(site)/como-comprar/page.tsx`:

```tsx
import type { Metadata } from 'next'
import React from 'react'
import { SectionTitle } from '../../../../components/store/SectionTitle'
import { getSiteSettings } from '../../../../lib/data'

export const metadata: Metadata = { title: 'Cómo comprar' }

const List = ({ items, ordered }: { items?: { text: string; id?: string | null }[] | null; ordered?: boolean }) => {
  const rows = items ?? []
  if (!rows.length) return null
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className={`mt-3 grid gap-2 pl-5 ${ordered ? 'list-decimal' : 'list-disc'}`}>
      {rows.map((r, i) => (
        <li key={r.id ?? i}>{r.text}</li>
      ))}
    </Tag>
  )
}

export default async function HowToBuyPage() {
  const s = await getSiteSettings()
  return (
    <div className="mx-auto max-w-2xl px-4 pt-12">
      <SectionTitle script="¡Muy importante!">Cómo comprar</SectionTitle>
      {s.antifraudNotice && <p className="mb-10 bg-crema p-4 text-center">{s.antifraudNotice}</p>}
      <section>
        <h2 className="font-serif text-2xl">Paso a paso</h2>
        <List items={s.howToBuySteps} ordered />
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Entregas y pagos</h2>
        <List items={s.deliveryOptions} />
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Cambios</h2>
        <List items={s.exchangePolicies} />
      </section>
      {s.priceNotice && <p className="mt-10 text-sm text-texto-suave">{s.priceNotice}</p>}
    </div>
  )
}
```

- [ ] **Step 3: 404**

`src/app/(frontend)/(site)/not-found.tsx`:

```tsx
import Link from 'next/link'
import React from 'react'
import { Heart } from '../../../components/site/Decor'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <Heart className="mx-auto text-roca" />
      <h1 className="mt-4 font-serif text-5xl">No encontramos esa página</h1>
      <p className="mt-3">Puede que la prenda ya no esté o que el enlace tenga un error 💕</p>
      <Link href="/catalogo" className="mt-8 inline-flex min-h-12 items-center bg-texto px-8 text-sm uppercase tracking-[0.18em] text-fondo">
        Ver el catálogo
      </Link>
    </div>
  )
}
```

Nota: en Next, `not-found.tsx` de un route group solo se usa cuando la página llama `notFound()`; para URLs que no existen en absoluto (`/xyz`) se necesita también `src/app/(frontend)/not-found.tsx` a nivel raíz del grupo. Crear ese archivo **con el mismo contenido** envuelto en el marco: reexportar el componente:

`src/app/(frontend)/not-found.tsx`:

```tsx
export { default } from './(site)/not-found'
```

(El marco con encabezado y pie no aplica a las URL desconocidas; por eso el contenido es autosuficiente y enlaza al catálogo.)

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`. Abre `/quienes-somos`, `/como-comprar`, `/producto/no-existe` y `/xyz`.
Expected: textos del seed en párrafos, misión y visión en dos columnas en escritorio; pasos numerados; 404 con la estética de la marca y botón al catálogo en ambos casos.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(store): about, how-to-buy and branded 404 pages"
```

---

### Task 9: Verificación final

**Files:**
- Modify: `/CLAUDE.md` del proyecto (`info_veliza/CLAUDE.md`, sección «Next steps»)

- [ ] **Step 1: Tipos y suite completa**

Run: `npx tsc --noEmit && npm test`
Expected: todo en verde (los 89 previos más los nuevos de las Tasks 2 y 3).

- [ ] **Step 2: Build de producción**

Detén `npm run dev` y ejecuta `npm run build`.
Expected: compila sin errores; la tabla de rutas muestra `/`, `/catalogo`, `/producto/[slug]` (con los 29 slugs pregenerados), `/quienes-somos` y `/como-comprar`.

- [ ] **Step 3: Recorrido completo en celular (375 px) y escritorio (1280 px)**

Con `npm run dev` (o `npm start` tras el build): inicio → categoría → prenda → elegir color → botón de WhatsApp → catálogo con orden → Quiénes somos → Cómo comprar → 404.
Expected: sin scroll horizontal, sin texto cortado, zonas táctiles cómodas, foco visible con Tab, y el menú ☰ abre y cierra.

- [ ] **Step 4: Edición en el panel se refleja**

En `/panel-veliza` cambia el precio de una prenda y marca otra como agotada; recarga `/catalogo`.
Expected: el cambio se ve en segundos, sin reconstruir. Revierte los cambios.

- [ ] **Step 5: Comprobar que el panel no cambió**

Abre `/panel-veliza`.
Expected: se ve igual que antes de este plan (Tailwind no se filtró).

- [ ] **Step 6: Actualizar `CLAUDE.md` y commit**

En `info_veliza/CLAUDE.md`, «Next steps»: anotar que el Plan 2A está hecho, que siguen el **Plan 2B** (seguridad y calidad: CSP/HSTS, límite de peticiones, E2E, SEO, accesibilidad, guía de seguridad) y el **Plan 3** (producción + diapositivas para las dueñas), y como **riesgo a resolver en el Plan 3** que las imágenes en producción vendrán de S3/R2 (las URL de `media` dejan de ser `/api/media/file/...`).

```bash
git add -A
git commit -m "docs: record store plan 2A as done"
```
