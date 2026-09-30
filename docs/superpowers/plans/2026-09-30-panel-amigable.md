# Panel amigable de Véliza — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el panel `/panel-veliza` tenga la marca de Véliza, un inicio guiado y un lenguaje sencillo, pensado para que las dueñas lo usen desde el celular.

**Architecture:** Solo vías oficiales de Payload 3.90.2: hoja de estilos propia (`custom.scss`, ya importada por el layout de `(payload)`), componentes `graphics.Logo`/`Icon`, vista `views.dashboard` propia como componente de servidor, y `labels`/`admin.group` en las colecciones. La lógica del saludo y los contadores vive en una función pura (`src/lib/dashboard.ts`) con pruebas unitarias. No se cambia ningún `slug` ni campo de datos.

**Tech Stack:** Payload 3.90.2, Next.js 16, React 19, TypeScript, SCSS (`sass` ya instalado), `@fontsource/*` para las fuentes, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-30-panel-amigable-design.md`

## Global Constraints

- Todo el texto visible va en **español (Colombia)**, tono cálido, "tú".
- Tokens de color exactos: fondo `#FAF9F6`, superficie `#F4F1EA`, crema `#E6DAC8`, arena `#CBB9A4`, roca `#A48D78` (solo decoración/texto grande), texto `#3B2A20`, texto suave `#6B5646`.
- Fuentes: Cormorant Garamond (títulos), Jost Light/Regular (cuerpo). Sin peticiones a Google: se sirven desde `node_modules` con `@fontsource`.
- Contraste mínimo 4.5:1 en texto normal. Botón primario: cacao `#3B2A20` con texto blanco.
- Áreas táctiles de al menos 44 px en pantallas estrechas.
- **No cambiar** `slug` de colecciones/globals ni nombres de campos (rompería datos y rutas de la API).
- Payload 3.90.2 usa las variables `--theme-*` (no las `--color-*` de v4). Solo se sobrescriben variables, no clases internas.
- Tema fijo **claro** (`admin.theme: 'light'`): no se diseña modo oscuro.
- Los tests de integración usan la rama Neon `test` (ya configurado en `tests/setup.ts`).

## Review Focus

- Usuaria sin `name` (solo correo): el saludo debe ser "Hola 💕", no "Hola undefined" ni "Hola null". → Task 2.
- Nombre con espacios o vacío (`"  "`): tratarlo como sin nombre. → Task 2.
- Falla la consulta de contadores (base de datos caída o sin permiso): el inicio sigue mostrando los botones y oculta los contadores. → Task 3.
- Cero prendas (catálogo vacío): contadores en 0, sin errores ni divisiones. → Task 2.
- Renombrar etiquetas no debe cambiar los `slug` ni las rutas de la API. → Task 1.

---

### Task 1: Etiquetas en lenguaje sencillo, grupos del menú y tema claro

**Files:**
- Modify: `src/collections/Products.ts:12` (labels)
- Modify: `src/collections/Media.ts:8` (labels)
- Modify: `src/collections/Categories.ts` (admin.group)
- Modify: `src/collections/Users.ts:8` (admin.group)
- Modify: `src/globals/SiteSettings.ts:15` (label + admin.group)
- Modify: `src/payload.config.ts` (admin.theme)
- Test: `tests/int/config.int.spec.ts`

**Interfaces:**
- Consumes: nada.
- Produces: etiquetas finales "Prenda/Prendas", "Foto/Fotos", "Datos de la tienda"; grupos `Catálogo` y `Tienda`. Las rutas del panel (`/panel-veliza/collections/products`, `/panel-veliza/globals/site-settings`) **no cambian**.

- [ ] **Step 1: Write the failing test**

Agregar al final de `tests/int/config.int.spec.ts`:

```ts
describe('panel: lenguaje sencillo', () => {
  it('usa las etiquetas de las dueñas sin cambiar los slugs', () => {
    const { collections, globals } = payload.config
    const bySlug = (s: string) => collections.find((c) => c.slug === s)!
    expect(bySlug('products').labels).toEqual({ singular: 'Prenda', plural: 'Prendas' })
    expect(bySlug('media').labels).toEqual({ singular: 'Foto', plural: 'Fotos' })
    expect(globals.find((g) => g.slug === 'site-settings')?.label).toBe('Datos de la tienda')
  })
  it('agrupa el menú en Catálogo y Tienda', () => {
    const { collections, globals } = payload.config
    const group = (s: string) => collections.find((c) => c.slug === s)!.admin?.group
    expect(group('products')).toBe('Catálogo')
    expect(group('categories')).toBe('Catálogo')
    expect(group('media')).toBe('Catálogo')
    expect(group('users')).toBe('Tienda')
    expect(globals.find((g) => g.slug === 'site-settings')?.admin?.group).toBe('Tienda')
  })
  it('fija el tema claro', () => {
    expect(payload.config.admin.theme).toBe('light')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/int/config.int.spec.ts -t "lenguaje sencillo"`
Expected: FAIL (etiquetas todavía "Producto/Productos", sin grupos).

- [ ] **Step 3: Implement**

`src/collections/Products.ts` — cambiar `labels` y agregar `group` dentro de `admin`:

```ts
  labels: { singular: 'Prenda', plural: 'Prendas' },
  admin: {
    group: 'Catálogo',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'soldOut', 'featured'],
    listSearchableFields: ['name'],
  },
```

`src/collections/Media.ts` — cambiar `labels` y añadir `admin: { group: 'Catálogo' }` (si ya existe un bloque `admin`, agregar solo `group`):

```ts
  labels: { singular: 'Foto', plural: 'Fotos' },
  admin: { group: 'Catálogo' },
```

`src/collections/Categories.ts:13`:

```ts
  admin: { group: 'Catálogo', useAsTitle: 'name', defaultColumns: ['name', 'order', 'updatedAt'] },
```

`src/collections/Users.ts:8`:

```ts
  admin: { group: 'Tienda', useAsTitle: 'email', defaultColumns: ['name', 'email'] },
```

`src/globals/SiteSettings.ts` — reemplazar la línea `label: 'Configuración del sitio',` por:

```ts
  label: 'Datos de la tienda',
  admin: { group: 'Tienda' },
```

`src/payload.config.ts` — dentro de `admin`:

```ts
  admin: {
    user: Users.slug,
    theme: 'light',
    importMap: { /* sin cambios */ },
    meta: { titleSuffix: ' · Véliza' },
  },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsc --noEmit && npx vitest run tests/int/config.int.spec.ts`
Expected: PASS (todos los tests del archivo).

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat(panel): plain-language labels, menu groups and light theme"
```

---

### Task 2: Lógica pura del inicio (saludo y contadores)

**Files:**
- Create: `src/lib/dashboard.ts`
- Test: `tests/unit/dashboard.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `greeting(name?: string | null): string` → `"Hola, Isabella 💕"` o `"Hola 💕"`.
  - `type DashboardCounts = { total: number; soldOut: number }`
  - `summarize(counts: DashboardCounts | null): { published: number; soldOut: number } | null` — `published = total - soldOut` (nunca negativo); `null` entra → `null` sale.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { greeting, summarize } from '../../src/lib/dashboard'

describe('greeting', () => {
  it('saluda con el nombre', () => expect(greeting('Isabella')).toBe('Hola, Isabella 💕'))
  it('recorta espacios', () => expect(greeting('  Sara ')).toBe('Hola, Sara 💕'))
  it.each([undefined, null, '', '   '])('sin nombre (%j) saluda sin nombre', (v) => {
    expect(greeting(v as string | null | undefined)).toBe('Hola 💕')
  })
})

describe('summarize', () => {
  it('separa publicadas de agotadas', () => {
    expect(summarize({ total: 29, soldOut: 4 })).toEqual({ published: 25, soldOut: 4 })
  })
  it('catálogo vacío', () => {
    expect(summarize({ total: 0, soldOut: 0 })).toEqual({ published: 0, soldOut: 0 })
  })
  it('nunca da negativos', () => {
    expect(summarize({ total: 2, soldOut: 5 })).toEqual({ published: 0, soldOut: 5 })
  })
  it('null significa "no se pudo consultar"', () => expect(summarize(null)).toBeNull())
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/dashboard.test.ts`
Expected: FAIL — no se encuentra `../../src/lib/dashboard`.

- [ ] **Step 3: Write minimal implementation**

```ts
export type DashboardCounts = { total: number; soldOut: number }

export function greeting(name?: string | null): string {
  const clean = name?.trim()
  return clean ? `Hola, ${clean} 💕` : 'Hola 💕'
}

export function summarize(counts: DashboardCounts | null): { published: number; soldOut: number } | null {
  if (!counts) return null
  return { published: Math.max(counts.total - counts.soldOut, 0), soldOut: counts.soldOut }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/dashboard.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/dashboard.ts tests/unit/dashboard.test.ts
git commit -m "feat(panel): pure greeting and counts logic for the dashboard"
```

---

### Task 3: Componente del inicio guiado

**Files:**
- Create: `src/components/admin/Dashboard.tsx`
- Create: `src/components/admin/dashboard.scss`
- Modify: `src/payload.config.ts` (admin.components.views.dashboard)
- Modify (generated): `src/app/(payload)/panel-veliza/importMap.js`

**Interfaces:**
- Consumes: `greeting`, `summarize`, `DashboardCounts` de `src/lib/dashboard.ts`.
- Produces: export por defecto `Dashboard` (componente de servidor, props `DashboardViewServerProps` de `payload`), registrado como `'/components/admin/Dashboard'`.

- [ ] **Step 1: Crear el componente**

`src/components/admin/Dashboard.tsx`:

```tsx
import type { DashboardViewServerProps } from 'payload'
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
```

- [ ] **Step 2: Estilos del inicio**

`src/components/admin/dashboard.scss` (usa solo variables `--theme-*` y fuentes de Task 5; funciona aunque las fuentes aún no carguen):

```scss
.veliza-home {
  max-width: 880px;
  padding: 8px 0 48px;

  &__title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(2rem, 6vw, 2.75rem);
    font-weight: 500;
    margin: 0 0 4px;
  }
  &__lead { margin: 0 0 24px; color: var(--theme-elevation-600); }

  &__actions { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

  &__card {
    display: flex; flex-direction: column; gap: 4px; justify-content: center;
    min-height: 88px; padding: 16px 20px; border-radius: 16px;
    background: var(--theme-elevation-50); color: var(--theme-text);
    border: 1px solid var(--theme-elevation-150); text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    strong { font-size: 1.15rem; }
    span { font-size: 0.95rem; color: var(--theme-elevation-600); }
    &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(59, 42, 32, 0.12); }
    &:focus-visible { outline: 3px solid var(--theme-text); outline-offset: 2px; }

    &--primary {
      background: var(--theme-elevation-800); color: #fff;
      span { color: rgba(255, 255, 255, 0.85); }
    }
  }

  &__counts {
    display: flex; flex-wrap: wrap; gap: 12px 28px; list-style: none; padding: 0; margin: 24px 0;
    b { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; margin-right: 6px; }
  }

  &__help {
    margin-top: 16px;
    h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-size: 1.5rem; }
    details { border-top: 1px solid var(--theme-elevation-150); padding: 4px 0; }
    summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; font-weight: 500; }
    ol { margin: 4px 0 12px; padding-left: 1.4rem; line-height: 1.6; }
  }
}

@media (prefers-reduced-motion: reduce) {
  .veliza-home__card { transition: none; &:hover { transform: none; } }
}
```

- [ ] **Step 3: Registrar la vista**

En `src/payload.config.ts`, dentro de `admin`, añadir:

```ts
    components: {
      views: {
        dashboard: { Component: '/components/admin/Dashboard' },
      },
    },
```

- [ ] **Step 4: Regenerar el import map y comprobar tipos**

Run: `npm run generate:importmap && npx tsc --noEmit`
Expected: sin errores; `importMap.js` ahora incluye `/components/admin/Dashboard`.

- [ ] **Step 5: Verificar en el navegador**

Con `npm run dev` en marcha, abrir `http://localhost:3000/panel-veliza` ya con sesión.
Expected: saludo con el nombre (o "Hola 💕"), 3 tarjetas, contadores (29 prendas salvo las agotadas) y la sección «¿Cómo lo hago?». Si no se ve el cambio, reiniciar `npm run dev`.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat(panel): guided dashboard with big buttons, counters and help"
```

---

### Task 4: Logo e ícono de Véliza

**Files:**
- Create: `src/components/admin/Logo.tsx`
- Create: `src/components/admin/Icon.tsx`
- Modify: `src/payload.config.ts` (admin.components.graphics)
- Modify (generated): `src/app/(payload)/panel-veliza/importMap.js`

**Interfaces:**
- Consumes: nada.
- Produces: exports por defecto `Logo` (login) e `Icon` (menú), registrados como `'/components/admin/Logo'` y `'/components/admin/Icon'`.

- [ ] **Step 1: Crear los componentes**

Hechos en SVG/texto (sin depender de la imagen JPEG del logo, que no tiene fondo transparente).

`src/components/admin/Logo.tsx`:

```tsx
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
```

`src/components/admin/Icon.tsx`:

```tsx
import React from 'react'

export default function Icon() {
  return (
    <span
      role="img"
      aria-label="Véliza"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', fontWeight: 500, color: 'currentColor' }}
    >
      V
    </span>
  )
}
```

- [ ] **Step 2: Registrar**

En `admin.components` de `src/payload.config.ts`:

```ts
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
```

- [ ] **Step 3: Regenerar y comprobar tipos**

Run: `npm run generate:importmap && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Verificar en el navegador**

Cerrar sesión y abrir `/panel-veliza/login`: aparece «Véliza» con el corazón y el lema. Dentro del panel, el menú lateral muestra la «V».

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat(panel): Véliza logo and icon"
```

---

### Task 5: Tema de marca (colores y tipografía)

**Files:**
- Modify: `src/app/(payload)/custom.scss` (hoy vacío)
- Modify: `package.json` / `package-lock.json` (dependencias de fuentes)

**Interfaces:**
- Consumes: variables `--theme-*` de Payload 3.90.2 (`--theme-bg`, `--theme-text`, `--theme-elevation-0…1000`, `--font-body`).
- Produces: tema visual global; las fuentes `Cormorant Garamond` y `Jost` quedan disponibles para Tasks 3, 4 y 6.

- [ ] **Step 1: Instalar las fuentes**

Run: `npm install @fontsource/cormorant-garamond @fontsource/jost`
Expected: se agregan a `dependencies`.

- [ ] **Step 2: Escribir `custom.scss`**

```scss
@import '@fontsource/cormorant-garamond/500.css';
@import '@fontsource/cormorant-garamond/500-italic.css';
@import '@fontsource/jost/300.css';
@import '@fontsource/jost/400.css';
@import '@fontsource/jost/500.css';

html[data-theme='light'] {
  --font-body: 'Jost', system-ui, sans-serif;
  --font-serif: 'Cormorant Garamond', Georgia, serif;

  --theme-bg: #faf9f6;
  --theme-input-bg: #ffffff;
  --theme-text: #3b2a20;

  --theme-elevation-0: #faf9f6;
  --theme-elevation-50: #f4f1ea;
  --theme-elevation-100: #efe8dc;
  --theme-elevation-150: #e6dac8;
  --theme-elevation-200: #dccdb9;
  --theme-elevation-250: #cbb9a4;
  --theme-elevation-400: #a48d78;
  --theme-elevation-500: #8c7763;
  --theme-elevation-600: #6b5646;
  --theme-elevation-800: #3b2a20;
  --theme-elevation-900: #2e2019;
  --theme-elevation-1000: #1f1510;
}

html[data-theme='light'] body {
  font-weight: 300;
  background: var(--theme-bg);
}

html[data-theme='light'] h1,
html[data-theme='light'] h2,
html[data-theme='light'] h3 {
  font-family: var(--font-serif);
  font-weight: 500;
}
```

- [ ] **Step 3: Verificar en el navegador**

Recargar `/panel-veliza`.
Expected: fondo crema, texto cacao, botón primario cacao con texto blanco, títulos en Cormorant, cuerpo en Jost. En DevTools → Network, las fuentes salen de `localhost`, no de Google.

Si `@import '@fontsource/…'` falla con "can't find stylesheet": copiar los `.woff2` de `node_modules/@fontsource/*/files/` (pesos usados, subset `latin` y `latin-ext`) a `public/admin-fonts/` y declarar `@font-face { font-family: 'Jost'; font-weight: 300; src: url('/admin-fonts/jost-latin-300-normal.woff2') format('woff2'); font-display: swap; }` para cada peso, en lugar de los `@import`.

- [ ] **Step 4: Revisar el contraste**

Run en la consola del navegador del panel:

```js
const c=(h)=>{const n=parseInt(h.slice(1),16),f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4};const[r,g,b]=[n>>16,(n>>8)&255,n&255].map(f);return .2126*r+.7152*g+.0722*b};
const r=(a,b)=>{const[x,y]=[c(a),c(b)].sort((p,q)=>q-p);return ((x+.05)/(y+.05)).toFixed(2)};
[r('#3B2A20','#FAF9F6'),r('#6B5646','#FAF9F6'),r('#FFFFFF','#3B2A20')]
```

Expected: los tres valores ≥ 4.5 (texto/fondo ≈ 13, texto suave ≈ 6.6, blanco/cacao ≈ 14).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json "src/app/(payload)/custom.scss"
git commit -m "feat(panel): Véliza theme colors and fonts"
```

---

### Task 6: Celular (áreas táctiles y revisión a 375 px)

**Files:**
- Modify: `src/app/(payload)/custom.scss`

**Interfaces:**
- Consumes: tema de Task 5.
- Produces: reglas `@media (max-width: 768px)` con objetivos táctiles de 44 px.

- [ ] **Step 1: Añadir reglas para pantallas estrechas**

Al final de `custom.scss`:

```scss
@media (max-width: 768px) {
  html[data-theme='light'] {
    .btn,
    .nav__link,
    .nav a,
    .checkbox-input__input,
    .tabs-field__tab-button {
      min-height: 44px;
    }
    .field-type input,
    .field-type textarea,
    .field-type select,
    .react-select .rs__control {
      min-height: 44px;
      font-size: 16px; /* evita el zoom automático de iOS al enfocar un campo */
    }
    .checkbox-input__input {
      min-width: 44px;
    }
  }
}
```

- [ ] **Step 2: Revisar a 375 px**

Con el navegador del panel de Claude en modo móvil (preset `mobile`, 375×812) recorrer: login → inicio → Ver mis prendas → abrir una prenda → tocar «Agotada» y «Guardar» (sin guardar cambios reales; volver atrás) → Datos de la tienda.
Expected: sin scroll horizontal, botones y campos cómodos de tocar, texto legible.

Corregir lo que falle con reglas adicionales en este mismo bloque `@media`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(payload)/custom.scss"
git commit -m "feat(panel): 44px touch targets on small screens"
```

---

### Task 7: Verificación final y documentación

**Files:**
- Modify: `CLAUDE.md` (sección de estado: panel amigable hecho)

- [ ] **Step 1: Suite completa**

Run: `npx tsc --noEmit && npm test`
Expected: todo en verde (los 76 tests previos más los nuevos de Tasks 1 y 2).

- [ ] **Step 2: Build de producción**

Run: `npm run build`
Expected: compila sin errores (verifica que las fuentes y el SCSS funcionan fuera de `dev`).

- [ ] **Step 3: Recorrido manual con una dueña (o tú como ella)**

Pedir a una de las dueñas, o hacerlo tú sin ayuda del código: cambiar un precio y marcar una prenda como agotada usando solo el inicio y la sección «¿Cómo lo hago?». Anotar dónde se traba.
Expected: lo logra sin preguntar nada; si se traba, ajustar textos o botones.

- [ ] **Step 4: Actualizar `CLAUDE.md`**

En «Next steps», anotar: panel amigable implementado (commits), y que sigue el Plan 2 (tienda pública).

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: record friendly admin panel as done"
```
