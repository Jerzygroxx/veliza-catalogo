# Véliza — Plan 1: Fundación, panel y datos iniciales

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar funcionando el proyecto Next.js + Payload con el panel en español en `/panel-veliza`, las colecciones (Productos, Categorías, Imágenes, Usuarias), la configuración del sitio y los 29 productos cargados. La tienda pública se construye en el Plan 2.

**Architecture:** Una sola app Next.js 16 con Payload 3 embebido. Payload define colecciones en TypeScript y genera el panel, la API REST y el esquema de PostgreSQL (Neon). La lógica pura (precios, WhatsApp, slugs y validaciones) vive en `src/lib/` y se prueba con Vitest sin base de datos. El comportamiento de las colecciones se prueba con Vitest contra una rama `test` de Neon.

**Tech Stack:** Next.js 16 · Payload 3.x (3.90+) · TypeScript estricto · PostgreSQL (Neon) · sharp · Vitest · npm · Node 24

**Spec:** `docs/superpowers/specs/2026-09-28-veliza-catalog-design.md`

**Alcance de este plan:** secciones 4, 5, 6 (solo la lógica), 7 y 9.2 (panel y subidas) del spec.
**Plan 2 (se escribe después):** tienda pública (secciones 2, 3, 4.3, 6 UI, 8), headers de seguridad, E2E, guía para las dueñas y copias de seguridad.

## Global Constraints

- Node ≥ 20.9 (la máquina tiene Node 24.19). npm es el único gestor de paquetes.
- Payload 3.x última estable. Next.js dentro del rango que exige `@payloadcms/next` (≥ 16.3.3). Todos los paquetes `@payloadcms/*` van en **la misma versión exacta** que `payload`.
- TypeScript en modo `strict`. Dentro de `src/` se usan **imports relativos**. El alias `@payload-config` solo se usa en `tests/`.
- Panel en **`/panel-veliza`**. `/admin` no debe existir.
- Todas las etiquetas y descripciones del panel están en **español**. Los textos para clientas van en español de Colombia, con "tú".
- Variables de entorno: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `SEED_ASSETS_DIR`.
- Nunca se hace commit de `.env`, `.env.test`, `media/` ni `seed-assets/`.
- Precio: entero en COP, ≥ 1000, mostrado como `$ 35.000`.
- WhatsApp por defecto: `573189952081`.
- Talla por defecto: `Talla única (S–M)` (con guion largo `–`).
- El seed **nunca modifica** documentos existentes. Toda escritura del seed o de las pruebas lleva `context: { disableRevalidate: true }`.
- Las pruebas unitarias (`tests/unit`) no tocan la base. Las de integración (`tests/int`) usan la rama `test` de Neon mediante `.env.test`.
- Todo mensaje de commit termina con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Los comandos son para Git Bash en Windows, ejecutados desde `C:\Users\lol\Desktop\Projetcs\veliza` salvo que se indique otra carpeta.
- **Aprendizaje:** el usuario está aprendiendo estas tecnologías. Al ejecutar cada tarea, explícale en español los conceptos nuevos marcados con 💡.

## Review Focus

1. **Precio escrito con puntos ("35.000"):** el campo numérico lo guardaría como 35. Se espera que el panel lo rechace con un mensaje que explique cómo escribirlo (prueba en la Tarea 2 y la Tarea 6).
2. **Dos productos con el mismo nombre:** se espera que el segundo reciba el slug `-2`, sin un error de base de datos (prueba en la Tarea 6).
3. **WhatsApp escrito como `+57 318 995 2081`:** se espera que se guarde como `573189952081` (prueba en la Tarea 7).
4. **Borrar una categoría que tiene productos:** se espera un bloqueo con un mensaje claro, sin dejar productos huérfanos (prueba en la Tarea 6).
5. **Subir un archivo que no es JPG, PNG ni WebP (por ejemplo un PDF o una foto HEIC):** se espera un rechazo (prueba en la Tarea 4).

Extra: un enlace de red social con `javascript:` sería un vector de XSS en el footer, así que el validador exige `https://` (prueba en la Tarea 2).

---

### Task 1: Base de datos, proyecto base y primer arranque

**Files:**
- Create (generados por la plantilla): `package.json`, `next.config.mjs`, `tsconfig.json`, `src/payload.config.ts`, `src/app/**`, `src/collections/Users.ts`, `src/collections/Media.ts`, `.env`, `.env.example`, `.gitignore`
- Create: `.env.test`

**Interfaces:**
- Produces: un proyecto que arranca con `npm run dev`, la variable `DATABASE_URL` en `.env` y `.env.test`, y los scripts `dev`, `build`, `generate:types` y `generate:importmap`.

💡 Conceptos: qué es Neon y sus **ramas de base de datos** (copias independientes: `dev` para trabajar y `test` para pruebas, así las pruebas nunca tocan tus datos), qué hace `create-payload-app`, y qué son las variables de entorno y el archivo `.env`.

- [ ] **Step 1: El usuario configura su identidad de git (una sola vez)**

Pídele al usuario que ejecute, con sus datos:

```bash
git config --global user.name "Su Nombre"
git config --global user.email "su@correo.com"
```

Verifica: `git config user.name` debe mostrar el nombre.

- [ ] **Step 2: Commit del spec y el plan**

```bash
git add docs
git commit -m "docs: add Véliza catalog spec and plan 1" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 3: El usuario crea la base de datos en Neon**

Guía al usuario:
1. Crear una cuenta gratis en https://neon.tech.
2. Crear el proyecto `veliza`, con PostgreSQL de la versión más reciente y la región **AWS US East (N. Virginia)**.
3. En **Branches**, crear dos ramas a partir de `main`: `dev` y `test`.
4. En cada rama, entrar a **Connect**, activar **Connection pooling** y copiar la cadena de conexión (empieza por `postgresql://` y termina en `?sslmode=require`).

Guarda las dos cadenas (`DEV_URL` y `TEST_URL`) para los pasos siguientes. **No las pegues en ningún archivo que vaya a git.**

- [ ] **Step 4: Generar el proyecto con la plantilla `blank` en el scratchpad**

Se genera en una carpeta temporal, porque `veliza/` ya tiene `.git` y `docs/`:

```bash
SCRATCH="C:/Users/lol/AppData/Local/Temp/claude/C--Users-lol-Desktop-Projetcs-info-veliza/eac0f8b8-7d7d-4f72-a73b-bebd2010428e/scratchpad"
cd "$SCRATCH" && npx create-payload-app@latest -n veliza-scaffold -t blank --db postgres --db-connection-string "postgresql://placeholder" --use-npm --no-deps --no-git --no-agent
```

Se usa una cadena de conexión falsa a propósito: **la real nunca pasa por el chat ni por la línea de comandos**. El usuario la pega en el Paso 7.

Esperado: la carpeta `veliza-scaffold/` con `package.json`, `src/payload.config.ts` y `.env`. Si la CLI hace alguna pregunta, respóndela con la opción equivalente a los flags anteriores.

- [ ] **Step 5: Copiar el proyecto a `veliza/` sin sobrescribir `docs/` ni `.git`**

```bash
cp -rn "$SCRATCH/veliza-scaffold/." /c/Users/lol/Desktop/Projetcs/veliza/
cd /c/Users/lol/Desktop/Projetcs/veliza && ls -a
```

Esperado: aparecen `package.json`, `src/`, `.env`, `.env.example`, `.gitignore`, `next.config.mjs` y `tsconfig.json`, y siguen `docs/` y `.git`.

- [ ] **Step 6: Unificar el nombre de la variable a `DATABASE_URL`**

```bash
grep -rn "DATABASE_UR[IL]" .env .env.example src/payload.config.ts
```

Si la plantilla usa `DATABASE_URI`, cámbiala a `DATABASE_URL` en esos tres archivos:

```bash
sed -i 's/DATABASE_URI/DATABASE_URL/g' .env .env.example src/payload.config.ts
```

Luego añade al final de `.env` y de `.env.example`:

```bash
printf '\nNEXT_PUBLIC_SERVER_URL=http://localhost:3000\n' >> .env
printf '\nNEXT_PUBLIC_SERVER_URL=http://localhost:3000\n# Almacenamiento S3 (solo producción; vacío = disco local)\nS3_BUCKET=\nS3_ENDPOINT=\nS3_REGION=auto\nS3_ACCESS_KEY_ID=\nS3_SECRET_ACCESS_KEY=\n# Carpeta con el PDF y las páginas del catálogo para el seed\nSEED_ASSETS_DIR=seed-assets\n' >> .env.example
```

- [ ] **Step 7: Crear `.env.test`; el usuario pega las cadenas reales**

```bash
printf 'DATABASE_URL=PEGA_AQUI_LA_CADENA_DE_LA_RAMA_TEST\nPAYLOAD_SECRET=%s\nNEXT_PUBLIC_SERVER_URL=http://localhost:3000\n' "$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'))")" > .env.test
```

Pídele al usuario que abra en VS Code:
- `.env`: reemplazar el valor de `DATABASE_URL` por la cadena de la rama **`dev`**.
- `.env.test`: reemplazar `PEGA_AQUI_LA_CADENA_DE_LA_RAMA_TEST` por la cadena de la rama **`test`**.

Luego verifica, sin mostrar los valores: `grep -c "neon.tech" .env .env.test` debe dar `1` en cada archivo.

- [ ] **Step 8: Asegurar el `.gitignore`**

```bash
for line in ".env" ".env.test" ".env*.local" "/media" "/seed-assets"; do grep -qxF "$line" .gitignore || echo "$line" >> .gitignore; done
git status --short
```

Esperado: `.env` y `.env.test` **no** aparecen en `git status`.

- [ ] **Step 9: Instalar dependencias y arrancar**

```bash
npm install
npm run dev
```

Abre http://localhost:3000/admin. Esperado: la pantalla de Payload para "crear el primer usuario". **Todavía no crees la cuenta**, porque la ruta cambia en la Tarea 4. Detén el servidor con Ctrl+C.

- [ ] **Step 10: Commit**

```bash
git add -A
git status --short   # confirma que no hay .env ni .env.test
git commit -m "chore: scaffold Next.js + Payload (blank template, Postgres)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Pruebas unitarias y utilidades puras (slug, precio, validaciones)

**Files:**
- Create: `vitest.config.mts` (reemplaza el de la plantilla si existe), `tests/setup.ts`
- Create: `src/lib/slugify.ts`, `src/lib/price.ts`, `src/lib/validators.ts`
- Test: `tests/unit/slugify.test.ts`, `tests/unit/price.test.ts`, `tests/unit/validators.test.ts`
- Delete: las pruebas de ejemplo de la plantilla en `tests/int/` y `tests/e2e/`, si existen
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces:
  - `slugify(input: string): string`
  - `formatCOP(value: number): string`
  - `MIN_PRICE = 1000`
  - `validatePrice(value: unknown): true | string`
  - `validateHex(value: unknown): true | string`
  - `normalizePhone(value: string): string`
  - `validateWhatsAppNumber(value: unknown): true | string`
  - `validateHttpsUrl(value: unknown): true | string`

💡 Conceptos: TDD (primero la prueba que falla, luego el código), Vitest, y por qué la lógica pura va separada de Payload y de React.

- [ ] **Step 1: Instalar herramientas de prueba y configurar Vitest**

```bash
npm i -D vitest vite-tsconfig-paths dotenv@^17
rm -rf tests/int tests/e2e
```

`vitest.config.mts`:

```ts
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/int/**/*.int.spec.ts'],
    // Las pruebas de integración comparten la base de datos: una a la vez.
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
})
```

`tests/setup.ts`:

```ts
import { config } from 'dotenv'
import { vi } from 'vitest'

// Las pruebas de integración usan la rama `test` de Neon, nunca la de desarrollo.
config({ path: '.env.test', override: true, quiet: true })

// Fuera de Next.js no existe su caché: revalidateTag lanzaría un error.
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: <T>(fn: T) => fn,
}))
```

En `package.json`, dentro de `"scripts"`, deja estas entradas (reemplaza `test`, `test:int` y `test:e2e` si la plantilla los trae):

```json
"test": "npm run test:unit && npm run test:int",
"test:unit": "vitest run tests/unit",
"test:int": "cross-env NODE_OPTIONS=--no-deprecation vitest run tests/int",
"typecheck": "tsc --noEmit"
```

Si `cross-env` no está en `devDependencies`, instálalo: `npm i -D cross-env`.

- [ ] **Step 2: Escribir las pruebas que fallan**

`tests/unit/slugify.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { slugify } from '../../src/lib/slugify'

describe('slugify', () => {
  it.each([
    ['Body Cloe', 'body-cloe'],
    ['Lía', 'lia'],
    ['Body M.L', 'body-m-l'],
    ['  Top  Blonda   Copa ', 'top-blonda-copa'],
    ['Niña & Ñandú', 'nina-nandu'],
    ['¡Hola!', 'hola'],
    ['', ''],
  ])('convierte %j en %j', (input, expected) => {
    expect(slugify(input)).toBe(expected)
  })
})
```

`tests/unit/price.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { formatCOP } from '../../src/lib/price'

describe('formatCOP', () => {
  it.each([
    [35000, '$ 35.000'],
    [1000, '$ 1.000'],
    [999, '$ 999'],
    [1250000, '$ 1.250.000'],
    [35000.4, '$ 35.000'],
  ])('formatea %d como %j', (value, expected) => {
    expect(formatCOP(value)).toBe(expected)
  })
})
```

`tests/unit/validators.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  MIN_PRICE,
  normalizePhone,
  validateHex,
  validateHttpsUrl,
  validatePrice,
  validateWhatsAppNumber,
} from '../../src/lib/validators'

describe('validatePrice', () => {
  it('acepta enteros desde 1000', () => {
    expect(validatePrice(MIN_PRICE)).toBe(true)
    expect(validatePrice(35000)).toBe(true)
  })
  it('rechaza 35 (alguien escribió "35.000" con punto) y explica cómo escribirlo', () => {
    const result = validatePrice(35)
    expect(result).toEqual(expect.stringContaining('sin puntos'))
  })
  it('rechaza decimales, vacíos y negativos', () => {
    expect(validatePrice(35000.5)).not.toBe(true)
    expect(validatePrice(null)).not.toBe(true)
    expect(validatePrice(undefined)).not.toBe(true)
    expect(validatePrice(-5000)).not.toBe(true)
  })
})

describe('validateHex', () => {
  it('acepta vacío y #RRGGBB', () => {
    expect(validateHex(undefined)).toBe(true)
    expect(validateHex('')).toBe(true)
    expect(validateHex('#3B2A20')).toBe(true)
    expect(validateHex('#ffffff')).toBe(true)
  })
  it('rechaza formatos incompletos', () => {
    expect(validateHex('000000')).not.toBe(true)
    expect(validateHex('#FFF')).not.toBe(true)
    expect(validateHex('negro')).not.toBe(true)
  })
})

describe('normalizePhone / validateWhatsAppNumber', () => {
  it('deja solo dígitos', () => {
    expect(normalizePhone('+57 318 995-2081')).toBe('573189952081')
  })
  it('acepta de 10 a 15 dígitos', () => {
    expect(validateWhatsAppNumber('573189952081')).toBe(true)
  })
  it('rechaza textos con símbolos o demasiado cortos', () => {
    expect(validateWhatsAppNumber('+57 318')).not.toBe(true)
    expect(validateWhatsAppNumber('3189952')).not.toBe(true)
    expect(validateWhatsAppNumber(undefined)).not.toBe(true)
  })
})

describe('validateHttpsUrl', () => {
  it('acepta vacío y enlaces https', () => {
    expect(validateHttpsUrl('')).toBe(true)
    expect(validateHttpsUrl(undefined)).toBe(true)
    expect(validateHttpsUrl('https://www.instagram.com/veliza_storebq')).toBe(true)
  })
  it('rechaza javascript:, http: y textos que no son enlaces', () => {
    expect(validateHttpsUrl('javascript:alert(1)')).not.toBe(true)
    expect(validateHttpsUrl('http://instagram.com/x')).not.toBe(true)
    expect(validateHttpsUrl('@veliza_storebq')).not.toBe(true)
  })
})
```

- [ ] **Step 3: Ejecutar y ver que fallan**

Run: `npm run test:unit`
Expected: FAIL. Los módulos `src/lib/slugify`, `src/lib/price` y `src/lib/validators` no existen.

- [ ] **Step 4: Implementar**

`src/lib/slugify.ts`:

```ts
/** Convierte un nombre en un fragmento de URL: "Lía Top" → "lia-top". */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

`src/lib/price.ts`:

```ts
/** Formatea pesos colombianos sin decimales: 35000 → "$ 35.000". */
export function formatCOP(value: number): string {
  const rounded = Math.round(value)
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${rounded < 0 ? '-' : ''}$ ${digits}`
}
```

`src/lib/validators.ts`:

```ts
export const MIN_PRICE = 1000

const PRICE_HINT = 'Escribe el precio en pesos, sin puntos. Ej: 35000'

export function validatePrice(value: unknown): true | string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return PRICE_HINT
  if (!Number.isInteger(value)) return 'El precio no puede tener decimales. Ej: 35000'
  if (value < MIN_PRICE) {
    return `El precio mínimo es 1000. Si escribiste "35.000", escríbelo sin puntos: 35000`
  }
  return true
}

const HEX = /^#[0-9a-fA-F]{6}$/

export function validateHex(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  return typeof value === 'string' && HEX.test(value) ? true : 'Usa el formato #RRGGBB. Ej: #3B2A20'
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function validateWhatsAppNumber(value: unknown): true | string {
  return typeof value === 'string' && /^\d{10,15}$/.test(value)
    ? true
    : 'Escribe el número con indicativo de país, solo dígitos. Ej: 573189952081'
}

export function validateHttpsUrl(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  if (typeof value !== 'string') return 'Escribe un enlace que empiece por https://'
  try {
    return new URL(value).protocol === 'https:' ? true : 'El enlace debe empezar por https://'
  } catch {
    return 'Escribe un enlace completo. Ej: https://www.instagram.com/veliza_storebq'
  }
}
```

- [ ] **Step 5: Ejecutar y ver que pasan**

Run: `npm run test:unit`
Expected: PASS (3 archivos).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add slug, COP price and validation utilities with tests" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Enlaces de WhatsApp

**Files:**
- Create: `src/lib/whatsapp.ts`
- Test: `tests/unit/whatsapp.test.ts`

**Interfaces:**
- Consumes: `normalizePhone(value: string): string` (Tarea 2)
- Produces:
  - `type ProductInquiry = { phone: string; productName: string; color?: string | null; productUrl: string }`
  - `GREETING_MESSAGE: string`
  - `buildProductMessage(input: Omit<ProductInquiry, 'phone'>): string`
  - `buildWhatsAppLink(phone: string, message: string): string`
  - `buildWhatsAppUrl(inquiry: ProductInquiry): string`
  - `buildGreetingUrl(phone: string): string`

💡 Concepto: cómo funciona `wa.me` y por qué el mensaje se codifica con `encodeURIComponent` (tildes, `¿`, emojis y espacios).

- [ ] **Step 1: Escribir la prueba que falla**

`tests/unit/whatsapp.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  GREETING_MESSAGE,
  buildGreetingUrl,
  buildProductMessage,
  buildWhatsAppUrl,
} from '../../src/lib/whatsapp'

const productUrl = 'https://veliza.co/producto/body-cloe'

function decode(url: string) {
  const parsed = new URL(url)
  return { host: parsed.host, phone: parsed.pathname.slice(1), text: parsed.searchParams.get('text') }
}

describe('buildProductMessage', () => {
  it('incluye el color elegido', () => {
    expect(buildProductMessage({ productName: 'Body Cloe', color: 'Negro', productUrl })).toBe(
      `¡Hola Véliza! 💕 Me interesa: Body Cloe, color Negro. ¿Está disponible? ${productUrl}`,
    )
  })
  it('sin color pregunta por los colores disponibles', () => {
    expect(buildProductMessage({ productName: 'Body Cloe', productUrl })).toBe(
      `¡Hola Véliza! 💕 Me interesa: Body Cloe. ¿Qué colores tienen disponibles? ${productUrl}`,
    )
  })
  it('un color con solo espacios cuenta como "sin color"', () => {
    expect(buildProductMessage({ productName: 'Body Cloe', color: '   ', productUrl })).toContain(
      '¿Qué colores tienen disponibles?',
    )
  })
})

describe('buildWhatsAppUrl', () => {
  it('arma un enlace wa.me con el número limpio y el mensaje codificado', () => {
    const url = buildWhatsAppUrl({ phone: '+57 318 995 2081', productName: 'Lía', color: 'Rosado', productUrl })
    const { host, phone, text } = decode(url)
    expect(host).toBe('wa.me')
    expect(phone).toBe('573189952081')
    expect(text).toBe(`¡Hola Véliza! 💕 Me interesa: Lía, color Rosado. ¿Está disponible? ${productUrl}`)
    expect(url).toContain('%C2%BFEst') // "¿Est" codificado
  })
  it('falla si no hay número', () => {
    expect(() => buildWhatsAppUrl({ phone: '', productName: 'Lía', productUrl })).toThrow()
  })
})

describe('buildGreetingUrl', () => {
  it('manda el saludo genérico', () => {
    expect(decode(buildGreetingUrl('573189952081')).text).toBe(GREETING_MESSAGE)
    expect(GREETING_MESSAGE).toBe('¡Hola Véliza! 💕 Quiero información.')
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npm run test:unit -- whatsapp`
Expected: FAIL. `src/lib/whatsapp` no existe.

- [ ] **Step 3: Implementar**

`src/lib/whatsapp.ts`:

```ts
import { normalizePhone } from './validators'

export type ProductInquiry = {
  phone: string
  productName: string
  color?: string | null
  productUrl: string
}

export const GREETING_MESSAGE = '¡Hola Véliza! 💕 Quiero información.'

export function buildProductMessage({ productName, color, productUrl }: Omit<ProductInquiry, 'phone'>): string {
  const name = productName.trim()
  const chosen = color?.trim()
  return chosen
    ? `¡Hola Véliza! 💕 Me interesa: ${name}, color ${chosen}. ¿Está disponible? ${productUrl}`
    : `¡Hola Véliza! 💕 Me interesa: ${name}. ¿Qué colores tienen disponibles? ${productUrl}`
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = normalizePhone(phone)
  if (!digits) throw new Error('Falta el número de WhatsApp en la configuración del sitio')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppUrl(inquiry: ProductInquiry): string {
  return buildWhatsAppLink(inquiry.phone, buildProductMessage(inquiry))
}

export function buildGreetingUrl(phone: string): string {
  return buildWhatsAppLink(phone, GREETING_MESSAGE)
}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npm run test:unit`
Expected: PASS (4 archivos).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add WhatsApp link builder with tests" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Configuración segura de Payload, usuarias e imágenes

**Files:**
- Create: `src/access/index.ts`, `tests/int/helpers.ts`
- Modify: `src/payload.config.ts` (reemplazo completo), `src/collections/Users.ts` (reemplazo completo), `src/collections/Media.ts` (reemplazo completo), `next.config.mjs`, `src/app/(frontend)/page.tsx` (reemplazo completo)
- Move: `src/app/(payload)/admin/` → `src/app/(payload)/panel-veliza/`
- Delete: `src/app/(payload)/api/graphql/`, `src/app/(payload)/api/graphql-playground/`
- Test: `tests/int/config.int.spec.ts`

**Interfaces:**
- Produces:
  - `anyone: Access` y `authenticated: Access`, exportados desde `src/access/index.ts`
  - `createTestImage(payload: Payload, alt?: string): Promise<Media>` en `tests/int/helpers.ts`
  - `RUN: string`, un sufijo único por ejecución, en `tests/int/helpers.ts`
  - las colecciones `users` y `media`

💡 Conceptos: el archivo `payload.config.ts` como "fuente de verdad", el **control de acceso** (funciones que responden "¿puede esta persona hacer esto?"), i18n, *route groups*, el **import map** del panel y los headers HTTP (`X-Robots-Tag`).

- [ ] **Step 1: Instalar los paquetes de Payload en la misma versión**

```bash
PV=$(node -p "require('./package.json').dependencies.payload")
npm i @payloadcms/storage-s3@$PV @payloadcms/translations@$PV
```

- [ ] **Step 2: Escribir la prueba que falla**

`tests/int/helpers.ts`:

```ts
import type { Payload } from 'payload'
import sharp from 'sharp'

/** Sufijo único por ejecución, para no chocar con datos de ejecuciones anteriores. */
export const RUN = Date.now().toString(36)

export const NO_REVALIDATE = { disableRevalidate: true }

export async function createTestImage(payload: Payload, alt = `prueba-${RUN}`) {
  const data = await sharp({
    create: { width: 1200, height: 1500, channels: 3, background: '#A48D78' },
  })
    .jpeg()
    .toBuffer()
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/jpeg', name: `${alt}.jpg`, size: data.length },
    context: NO_REVALIDATE,
  })
}
```

`tests/int/config.int.spec.ts`:

```ts
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { beforeAll, describe, expect, it } from 'vitest'
import { createTestImage, NO_REVALIDATE } from './helpers'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('configuración del panel', () => {
  it('vive en /panel-veliza', () => {
    expect(payload.config.routes.admin).toBe('/panel-veliza')
  })
  it('tiene GraphQL desactivado', () => {
    expect(payload.config.graphQL.disable).toBe(true)
  })
  it('está en español', () => {
    expect(payload.config.i18n.fallbackLanguage).toBe('es')
  })
  it('bloquea una cuenta 10 minutos tras 5 intentos fallidos', () => {
    const auth = payload.collections.users.config.auth
    expect(auth.maxLoginAttempts).toBe(5)
    expect(auth.lockTime).toBe(10 * 60 * 1000)
  })
})

describe('acceso sin sesión', () => {
  it('no puede listar usuarias', async () => {
    await expect(payload.find({ collection: 'users', overrideAccess: false })).rejects.toThrow()
  })
  it('no puede subir imágenes', async () => {
    // Un JPEG válido: así el rechazo solo puede venir del control de acceso.
    const data = await sharp({ create: { width: 10, height: 10, channels: 3, background: '#FFFFFF' } })
      .jpeg()
      .toBuffer()
    await expect(
      payload.create({
        collection: 'media',
        overrideAccess: false,
        data: { alt: 'x' },
        file: { data, mimetype: 'image/jpeg', name: 'x.jpg', size: data.length },
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
})

describe('subida de imágenes', () => {
  it('rechaza archivos que no son JPG, PNG ni WebP', async () => {
    const data = Buffer.from('%PDF-1.4\n%falso\n')
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'documento' },
        file: { data, mimetype: 'application/pdf', name: 'documento.pdf', size: data.length },
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
  it('genera los tamaños card (800px, WebP) y thumbnail', async () => {
    const doc = await createTestImage(payload)
    expect(doc.sizes?.card?.width).toBe(800)
    expect(doc.sizes?.card?.mimeType).toBe('image/webp')
    expect(doc.sizes?.thumbnail?.width).toBe(400)
    await payload.delete({ collection: 'media', id: doc.id, context: NO_REVALIDATE })
  })
})
```

- [ ] **Step 3: Ejecutar y ver que falla**

Run: `npm run test:int`
Expected: FAIL en `vive en /panel-veliza` (es `/admin`), en GraphQL, en el idioma, en el bloqueo y en los tamaños.

- [ ] **Step 4: Crear las reglas de acceso**

`src/access/index.ts`:

```ts
import type { Access } from 'payload'

/** Cualquier visitante, con o sin sesión. */
export const anyone: Access = () => true

/** Solo usuarias con sesión iniciada en el panel. */
export const authenticated: Access = ({ req }) => Boolean(req.user)
```

- [ ] **Step 5: Reemplazar `src/collections/Users.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuaria', plural: 'Usuarias' },
  admin: { useAsTitle: 'email', defaultColumns: ['name', 'email'] },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [{ name: 'name', type: 'text', label: 'Nombre' }],
}
```

- [ ] **Step 6: Reemplazar `src/collections/Media.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

const webp = { format: 'webp' as const, options: { quality: 82 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Descripción de la imagen',
      admin: {
        description: 'Para personas con lector de pantalla. Ej: "Body Cloe negro, vista de frente".',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 500, position: 'centre', formatOptions: webp },
      { name: 'card', width: 800, height: 1000, position: 'centre', formatOptions: webp },
      { name: 'full', width: 1600, withoutEnlargement: true, formatOptions: webp },
    ],
  },
}
```

- [ ] **Step 7: Mover el panel a `/panel-veliza` y quitar GraphQL**

```bash
git mv "src/app/(payload)/admin" "src/app/(payload)/panel-veliza"
rm -rf "src/app/(payload)/api/graphql" "src/app/(payload)/api/graphql-playground"
grep -rn "admin/importMap" src || echo "sin referencias"
```

Si `grep` encuentra referencias (normalmente en `src/app/(payload)/layout.tsx`), cambia `admin/importMap` por `panel-veliza/importMap` en esas líneas:

```bash
grep -rl "admin/importMap" src | xargs -r sed -i 's#admin/importMap#panel-veliza/importMap#g'
```

- [ ] **Step 8: Reemplazar `src/payload.config.ts`**

```ts
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
      importMapFile: path.resolve(dirname, 'app/(payload)/panel-veliza/importMap.js'),
    },
    meta: { titleSuffix: ' · Véliza' },
  },
  routes: { admin: '/panel-veliza' },
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  graphQL: { disable: true },
  cors: [serverURL],
  csrf: [serverURL],
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  sharp,
  plugins: [
    s3Storage({
      // Sin bucket configurado (desarrollo) las imágenes van a disco local, en /media.
      enabled: Boolean(process.env.S3_BUCKET),
      collections: { media: true },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
```

- [ ] **Step 9: `next.config.mjs`: salida portable y `noindex` para el panel**

Dentro del objeto `nextConfig` que ya existe (sin quitar nada de lo que trae la plantilla), añade:

```js
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/panel-veliza/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
```

- [ ] **Step 10: Quitar el enlace al panel de la página de inicio de la plantilla**

Reemplaza `src/app/(frontend)/page.tsx` completo (el Plan 2 construye el inicio real):

```tsx
export default function HomePage() {
  return (
    <main style={{ fontFamily: 'serif', padding: '4rem 1rem', textAlign: 'center' }}>
      <h1>Véliza</h1>
      <p>Muy pronto, nuestro catálogo 💕</p>
    </main>
  )
}
```

- [ ] **Step 11: Regenerar el import map y los tipos**

```bash
npm run generate:importmap
npm run generate:types
```

Esperado: existe `src/app/(payload)/panel-veliza/importMap.js`, y `src/payload-types.ts` incluye `sizes` en `Media`.

- [ ] **Step 12: Ejecutar las pruebas y ver que pasan**

Run: `npm run test:int`
Expected: PASS (7 pruebas). La primera ejecución tarda más, porque Payload crea las tablas en la rama `test`.

- [ ] **Step 13: Verificar a mano**

```bash
npm run dev
```

En otra terminal:

```bash
curl -sI http://localhost:3000/panel-veliza | grep -i x-robots-tag
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin
```

Esperado: `X-Robots-Tag: noindex, nofollow` y `404`.

Abre http://localhost:3000/panel-veliza. La pantalla de crear el primer usuario debe estar **en español**. Crea la cuenta del desarrollador (el usuario elige el correo y una contraseña larga). Luego detén el servidor.

- [ ] **Step 14: Typecheck y commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: harden Payload config (Spanish panel at /panel-veliza, lockout, image rules)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Revalidación de la caché

**Files:**
- Create: `src/lib/cache-tags.ts`, `src/hooks/revalidate.ts`
- Test: `tests/unit/revalidate.test.ts`

**Interfaces:**
- Produces:
  - `CACHE_TAGS = { products: 'products', categories: 'categories', siteSettings: 'site-settings' } as const`
  - `type CacheTag`
  - `expireTags(tags: readonly CacheTag[], context: RequestContext): void`
  - `revalidateAfterChange(tags): CollectionAfterChangeHook`
  - `revalidateAfterDelete(tags): CollectionAfterDeleteHook`
  - `revalidateGlobalAfterChange(tags): GlobalAfterChangeHook`
  - El Plan 2 envuelve sus consultas con `unstable_cache(..., { tags: [CACHE_TAGS.x] })`.

💡 Conceptos: la **caché de datos de Next.js con etiquetas**, los **hooks** de Payload (código que corre cuando se guarda algo), y por qué `{ expire: 0 }` hace que las dueñas vean su cambio al recargar.

- [ ] **Step 1: Escribir la prueba que falla**

`tests/unit/revalidate.test.ts`:

```ts
import { revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { expireTags, revalidateAfterChange } from '../../src/hooks/revalidate'
import { CACHE_TAGS } from '../../src/lib/cache-tags'

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear()
})

describe('expireTags', () => {
  it('expira cada etiqueta de inmediato', () => {
    expireTags([CACHE_TAGS.products, CACHE_TAGS.categories], {})
    expect(revalidateTag).toHaveBeenCalledTimes(2)
    expect(revalidateTag).toHaveBeenCalledWith('products', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('categories', { expire: 0 })
  })
  it('no hace nada cuando el contexto lo desactiva (seed y pruebas)', () => {
    expireTags([CACHE_TAGS.products], { disableRevalidate: true })
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('revalidateAfterChange', () => {
  it('devuelve el mismo documento', () => {
    const hook = revalidateAfterChange([CACHE_TAGS.products])
    const doc = { id: 1 }
    const result = hook({ doc, context: {} } as unknown as Parameters<typeof hook>[0])
    expect(result).toBe(doc)
    expect(revalidateTag).toHaveBeenCalledWith('products', { expire: 0 })
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npm run test:unit -- revalidate`
Expected: FAIL. Los módulos no existen.

- [ ] **Step 3: Implementar**

`src/lib/cache-tags.ts`:

```ts
export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  siteSettings: 'site-settings',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
```

`src/hooks/revalidate.ts`:

```ts
import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  RequestContext,
} from 'payload'
import type { CacheTag } from '../lib/cache-tags'

/** Marca las etiquetas como vencidas: la siguiente visita trae datos frescos. */
export function expireTags(tags: readonly CacheTag[], context: RequestContext): void {
  if (context.disableRevalidate) return
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
}

export const revalidateAfterChange =
  (tags: readonly CacheTag[]): CollectionAfterChangeHook =>
  ({ doc, context }) => {
    expireTags(tags, context)
    return doc
  }

export const revalidateAfterDelete =
  (tags: readonly CacheTag[]): CollectionAfterDeleteHook =>
  ({ doc, context }) => {
    expireTags(tags, context)
    return doc
  }

export const revalidateGlobalAfterChange =
  (tags: readonly CacheTag[]): GlobalAfterChangeHook =>
  ({ doc, context }) => {
    expireTags(tags, context)
    return doc
  }
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npm run test:unit`
Expected: PASS (5 archivos).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add cache tags and revalidation hooks" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Colecciones Categorías y Productos

**Files:**
- Create: `src/fields/slug.ts`, `src/hooks/preventDeleteCategoryInUse.ts`, `src/collections/Categories.ts`, `src/collections/Products.ts`
- Modify: `src/payload.config.ts` (imports y la lista `collections`)
- Test: `tests/unit/slug-field.test.ts`, `tests/int/catalog.int.spec.ts`

**Interfaces:**
- Consumes:
  - `slugify` y `validatePrice`/`validateHex` (Tarea 2)
  - `anyone` y `authenticated` (Tarea 4)
  - `CACHE_TAGS`, `revalidateAfterChange` y `revalidateAfterDelete` (Tarea 5)
  - `createTestImage`, `RUN` y `NO_REVALIDATE` (Tarea 4)
- Produces:
  - `findAvailableSlug(base: string, isTaken: (candidate: string) => Promise<boolean>): Promise<string>`
  - `slugField(collection: 'products' | 'categories', source?: string): Field`
  - La colección `categories` con `name`, `slug`, `image` y `order`.
  - La colección `products` con `name`, `slug`, `category`, `price`, `size`, `colors[{name, swatch}]`, `images` (hasMany), `description`, `featured` y `soldOut`.

💡 Conceptos: campos de **relación** (un producto apunta a una categoría), las subidas `hasMany`, los hooks `beforeValidate` y `beforeDelete`, y `payload generate:types` (TypeScript conoce la forma exacta de un producto).

- [ ] **Step 1: Escribir la prueba unitaria que falla (sufijo de slug)**

`tests/unit/slug-field.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { findAvailableSlug } from '../../src/fields/slug'

const takenBy = (...taken: string[]) => async (candidate: string) => taken.includes(candidate)

describe('findAvailableSlug', () => {
  it('usa el slug base si está libre', async () => {
    expect(await findAvailableSlug('body-cloe', takenBy())).toBe('body-cloe')
  })
  it('agrega -2 si el base está ocupado', async () => {
    expect(await findAvailableSlug('body-cloe', takenBy('body-cloe'))).toBe('body-cloe-2')
  })
  it('sigue contando: -3 si -2 también está ocupado', async () => {
    expect(await findAvailableSlug('body', takenBy('body', 'body-2'))).toBe('body-3')
  })
})
```

- [ ] **Step 2: Escribir la prueba de integración que falla**

`tests/int/catalog.int.spec.ts`:

```ts
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestImage, NO_REVALIDATE, RUN } from './helpers'

let payload: Payload
let categoryId: number
let imageId: number
const productIds: number[] = []

async function createProduct(data: Record<string, unknown>) {
  const doc = await payload.create({
    collection: 'products',
    data: { category: categoryId, images: [imageId], price: 40000, ...data } as never,
    context: NO_REVALIDATE,
  })
  productIds.push(doc.id)
  return doc
}

beforeAll(async () => {
  payload = await getPayload({ config })
  const category = await payload.create({
    collection: 'categories',
    data: { name: `Bodies ${RUN}`, order: 1 } as never,
    context: NO_REVALIDATE,
  })
  categoryId = category.id
  imageId = (await createTestImage(payload)).id
})

afterAll(async () => {
  for (const id of productIds) await payload.delete({ collection: 'products', id, context: NO_REVALIDATE })
  await payload.delete({ collection: 'categories', id: categoryId, context: NO_REVALIDATE })
  await payload.delete({ collection: 'media', id: imageId, context: NO_REVALIDATE })
})

describe('productos', () => {
  it('genera el slug desde el nombre y pone la talla por defecto', async () => {
    const doc = await createProduct({ name: `Body Lía ${RUN}` })
    expect(doc.slug).toBe(`body-lia-${RUN}`)
    expect(doc.size).toBe('Talla única (S–M)')
    expect(doc.soldOut).toBe(false)
  })
  it('a un nombre repetido le agrega -2 al slug', async () => {
    const doc = await createProduct({ name: `Body Lía ${RUN}` })
    expect(doc.slug).toBe(`body-lia-${RUN}-2`)
  })
  it('al editar solo el precio conserva un slug personalizado', async () => {
    const doc = await createProduct({ name: `Kenda ${RUN}`, slug: `kenda-especial-${RUN}` })
    const updated = await payload.update({
      collection: 'products',
      id: doc.id,
      data: { price: 36000 },
      context: NO_REVALIDATE,
    })
    expect(updated.slug).toBe(`kenda-especial-${RUN}`)
  })
  it('rechaza un precio escrito con punto (35.000 → 35)', async () => {
    await expect(createProduct({ name: `Barato ${RUN}`, price: 35 })).rejects.toThrow()
  })
  it('rechaza un producto sin fotos', async () => {
    await expect(createProduct({ name: `Sin foto ${RUN}`, images: [] })).rejects.toThrow()
  })
  it('rechaza una muestra de color inválida', async () => {
    await expect(
      createProduct({ name: `Color ${RUN}`, colors: [{ name: 'Negro', swatch: '000000' }] }),
    ).rejects.toThrow()
  })
  it('cualquiera puede leer productos, pero no crearlos sin sesión', async () => {
    const found = await payload.find({ collection: 'products', overrideAccess: false, limit: 1 })
    expect(found.totalDocs).toBeGreaterThan(0)
    await expect(
      payload.create({
        collection: 'products',
        overrideAccess: false,
        data: { name: `Intruso ${RUN}`, category: categoryId, images: [imageId], price: 40000 } as never,
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
})

describe('categorías', () => {
  it('no se puede borrar una categoría con productos', async () => {
    await expect(
      payload.delete({ collection: 'categories', id: categoryId, context: NO_REVALIDATE }),
    ).rejects.toThrow(/No puedes borrar/)
  })
})
```

- [ ] **Step 3: Ejecutar y ver que fallan**

Run: `npm run test:unit -- slug-field` y `npm run test:int -- catalog`
Expected: FAIL. `src/fields/slug` no existe y las colecciones `products` y `categories` no existen.

- [ ] **Step 4: Implementar el campo slug**

`src/fields/slug.ts`:

```ts
import type { Field, FieldHook } from 'payload'
import { slugify } from '../lib/slugify'

type SluggedCollection = 'products' | 'categories'

/** Devuelve `base`, o `base-2`, `base-3`… según el primero que esté libre. */
export async function findAvailableSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base
  for (let n = 2; await isTaken(candidate); n++) candidate = `${base}-${n}`
  return candidate
}

const formatSlug =
  (collection: SluggedCollection, source: string): FieldHook =>
  async ({ value, data, originalDoc, req }) => {
    const typed = typeof value === 'string' && value.trim() ? value : undefined
    // Si no llega un slug (p. ej. solo se editó el precio), se conserva el actual.
    const raw = typed ?? originalDoc?.slug ?? String(data?.[source] ?? '')
    const base = slugify(raw)
    if (!base) return base
    const currentId = originalDoc?.id
    return findAvailableSlug(base, async (candidate) => {
      const { totalDocs } = await req.payload.count({
        collection,
        where: {
          and: [
            { slug: { equals: candidate } },
            ...(currentId ? [{ id: { not_equals: currentId } }] : []),
          ],
        },
        overrideAccess: true,
        req,
      })
      return totalDocs > 0
    })
  }

export const slugField = (collection: SluggedCollection, source = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Slug (dirección web)',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Se genera solo a partir del nombre. Ej: "Body Cloe" → body-cloe.',
  },
  hooks: { beforeValidate: [formatSlug(collection, source)] },
})
```

- [ ] **Step 5: Implementar la protección al borrar categorías**

`src/hooks/preventDeleteCategoryInUse.ts`:

```ts
import { APIError, type CollectionBeforeDeleteHook } from 'payload'

export const preventDeleteCategoryInUse: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const { totalDocs } = await req.payload.count({
    collection: 'products',
    where: { category: { equals: id } },
    overrideAccess: true,
    req,
  })
  if (totalDocs > 0) {
    throw new APIError(
      `No puedes borrar esta categoría porque tiene ${totalDocs} producto(s). Muévelos a otra categoría o bórralos primero.`,
      400,
      undefined,
      true,
    )
  }
}
```

- [ ] **Step 6: Implementar las colecciones**

`src/collections/Categories.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'
import { preventDeleteCategoryInUse } from '../hooks/preventDeleteCategoryInUse'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { CACHE_TAGS } from '../lib/cache-tags'

const tags = [CACHE_TAGS.categories, CACHE_TAGS.products] as const

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categoría', plural: 'Categorías' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'order', 'updatedAt'] },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    beforeDelete: [preventDeleteCategoryInUse],
    afterChange: [revalidateAfterChange(tags)],
    afterDelete: [revalidateAfterDelete(tags)],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre' },
    slugField('categories'),
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Foto para el inicio' },
    {
      name: 'order',
      type: 'number',
      label: 'Orden',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Se muestran de menor a mayor.' },
    },
  ],
}
```

`src/collections/Products.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { CACHE_TAGS } from '../lib/cache-tags'
import { validateHex, validatePrice } from '../lib/validators'

const tags = [CACHE_TAGS.products] as const

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Producto', plural: 'Productos' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'soldOut', 'featured'],
    listSearchableFields: ['name'],
  },
  defaultSort: '-createdAt',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    afterChange: [revalidateAfterChange(tags)],
    afterDelete: [revalidateAfterDelete(tags)],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre / referencia' },
    slugField('products'),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Categoría',
      admin: { position: 'sidebar' },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Precio (COP)',
      validate: validatePrice,
      admin: { step: 1000, description: 'En pesos, sin puntos ni signos. Ej: 35000' },
    },
    { name: 'size', type: 'text', label: 'Talla', defaultValue: 'Talla única (S–M)' },
    {
      name: 'colors',
      type: 'array',
      label: 'Colores',
      labels: { singular: 'Color', plural: 'Colores' },
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nombre del color' },
        {
          name: 'swatch',
          type: 'text',
          label: 'Muestra (opcional)',
          validate: validateHex,
          admin: { description: 'Código de color. Ej: #000000 para negro.' },
        },
      ],
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: 'Fotos',
      admin: { description: 'La primera es la portada. Arrastra para cambiar el orden.' },
    },
    { name: 'description', type: 'textarea', label: 'Descripción corta' },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacado (aparece en el inicio)',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'soldOut',
      type: 'checkbox',
      label: 'Agotada',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
```

En `src/payload.config.ts`, añade los imports y actualiza la lista:

```ts
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
```

```ts
  collections: [Users, Media, Categories, Products],
```

- [ ] **Step 7: Regenerar los tipos y ejecutar las pruebas**

```bash
npm run generate:types
npm run test:unit && npm run test:int
```

Expected: PASS (unitarias: 6 archivos; integración: `config` y `catalog`).

- [ ] **Step 8: Typecheck y commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add Products and Categories collections with slug and delete guards" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Configuración del sitio (global)

**Files:**
- Create: `src/globals/SiteSettings.ts`
- Modify: `src/payload.config.ts` (`globals`)
- Test: `tests/int/site-settings.int.spec.ts`

**Interfaces:**
- Consumes:
  - `normalizePhone`, `validateWhatsAppNumber` y `validateHttpsUrl` (Tarea 2)
  - `revalidateGlobalAfterChange` y `CACHE_TAGS` (Tarea 5)
- Produces: el global `site-settings` con los campos
  - `whatsappNumber`, `instagramUrl`, `tiktokUrl`
  - `priceNotice`, `antifraudNotice`
  - `aboutShort`, `aboutStory`, `mission`, `vision`
  - `howToBuySteps[{text}]`, `deliveryOptions[{text}]`, `exchangePolicies[{text}]`

💡 Conceptos: un **global** es un documento único, no una lista. Las **pestañas** organizan el formulario sin cambiar los datos.

- [ ] **Step 1: Escribir la prueba que falla**

`tests/int/site-settings.int.spec.ts`:

```ts
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'
import { NO_REVALIDATE } from './helpers'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('configuración del sitio', () => {
  it('cualquiera puede leerla', async () => {
    const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
    expect(settings).toBeDefined()
  })
  it('nadie sin sesión puede modificarla', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        overrideAccess: false,
        data: { priceNotice: 'hackeado' },
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
  it('guarda el WhatsApp solo con dígitos aunque se escriba con + y espacios', async () => {
    const updated = await payload.updateGlobal({
      slug: 'site-settings',
      data: { whatsappNumber: '+57 318 995 2081' },
      context: NO_REVALIDATE,
    })
    expect(updated.whatsappNumber).toBe('573189952081')
  })
  it('rechaza enlaces de redes que no sean https', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: { instagramUrl: 'javascript:alert(1)' },
        context: NO_REVALIDATE,
      }),
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npm run test:int -- site-settings`
Expected: FAIL. El global `site-settings` no existe.

- [ ] **Step 3: Implementar**

`src/globals/SiteSettings.ts`:

```ts
import type { Field, GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'
import { CACHE_TAGS } from '../lib/cache-tags'
import { normalizePhone, validateHttpsUrl, validateWhatsAppNumber } from '../lib/validators'

const textList = (name: string, label: string, singular: string, plural: string): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular, plural },
  fields: [{ name: 'text', type: 'text', required: true, label: 'Texto' }],
})

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configuración del sitio',
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalAfterChange([CACHE_TAGS.siteSettings])] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contacto',
          fields: [
            {
              name: 'whatsappNumber',
              type: 'text',
              required: true,
              label: 'Número de WhatsApp',
              defaultValue: '573189952081',
              validate: validateWhatsAppNumber,
              hooks: {
                beforeValidate: [({ value }) => (typeof value === 'string' ? normalizePhone(value) : value)],
              },
              admin: {
                description: 'Con indicativo de país. Puedes escribir +57 318 995 2081; se guarda solo con números.',
              },
            },
            { name: 'instagramUrl', type: 'text', label: 'Instagram (enlace)', validate: validateHttpsUrl },
            { name: 'tiktokUrl', type: 'text', label: 'TikTok (enlace)', validate: validateHttpsUrl },
          ],
        },
        {
          label: 'Avisos',
          fields: [
            {
              name: 'priceNotice',
              type: 'text',
              label: 'Aviso de precios',
              defaultValue: 'Los precios varían por temporada, no manejamos precios fijos.',
            },
            {
              name: 'antifraudNotice',
              type: 'text',
              label: 'Aviso antifraude',
              defaultValue: 'Solo recibimos pedidos por nuestro WhatsApp oficial 💕',
            },
          ],
        },
        {
          label: 'Quiénes somos',
          fields: [
            { name: 'aboutShort', type: 'textarea', label: 'Resumen para el inicio' },
            {
              name: 'aboutStory',
              type: 'textarea',
              label: 'Nuestra historia',
              admin: { description: 'Separa los párrafos con una línea en blanco.' },
            },
            { name: 'mission', type: 'textarea', label: 'Misión' },
            { name: 'vision', type: 'textarea', label: 'Visión' },
          ],
        },
        {
          label: 'Cómo comprar',
          fields: [
            textList('howToBuySteps', 'Pasos para comprar', 'Paso', 'Pasos'),
            textList('deliveryOptions', 'Formas de entrega', 'Opción', 'Opciones'),
            textList('exchangePolicies', 'Políticas de cambio', 'Política', 'Políticas'),
          ],
        },
      ],
    },
  ],
}
```

En `src/payload.config.ts`:

```ts
import { SiteSettings } from './globals/SiteSettings'
```

```ts
  globals: [SiteSettings],
```

(Va justo después de `collections`.)

- [ ] **Step 4: Regenerar los tipos y ejecutar las pruebas**

```bash
npm run generate:types
npm run test:int
```

Expected: PASS (`config`, `catalog` y `site-settings`).

- [ ] **Step 5: Typecheck y commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add site settings global (contact, notices, about, how to buy)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Motor del seed y datos iniciales

**Files:**
- Create: `src/seed/types.ts`, `src/seed/images.ts`, `src/seed/seed.ts`, `src/seed/index.ts`
- Create: `src/seed/data/categories.ts`, `src/seed/data/products.ts`, `src/seed/data/site-settings.ts`, `src/seed/data/index.ts`
- Modify: `package.json` (script `seed`)
- Test: `tests/unit/seed-data.test.ts`, `tests/unit/seed-images.test.ts`, `tests/int/seed.int.spec.ts`

**Interfaces:**
- Consumes: `slugify` (Tarea 2), las colecciones y el global (Tareas 4, 6 y 7), y `NO_REVALIDATE` y `RUN` de `tests/int/helpers.ts` (Tarea 4)
- Produces:
  - `type Crop = { left: number; top: number; width: number; height: number }`
  - `type SeedProduct = { name; category; price; colors?; featured?; description?; source?: { page: number; crops: Crop[] } }`
  - `type SeedData`
  - `type ImageLoader = (product: SeedProduct) => Promise<Buffer[]>`
  - `seed(payload, data, loadImages): Promise<SeedReport>`
  - `placeholderImage(): Promise<Buffer>`
  - `pagePath(assetsDir: string, page: number): string`
  - `createCatalogImageLoader(assetsDir: string): ImageLoader`
  - `seedData: SeedData`

💡 Conceptos: qué es un **seed**, qué significa **idempotente** (ejecutarlo dos veces da el mismo resultado), y la **inyección de dependencias** (el seed recibe cómo cargar las fotos, así las pruebas pueden darle fotos falsas).

- [ ] **Step 1: Escribir las pruebas unitarias que fallan**

`tests/unit/seed-data.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { slugify } from '../../src/lib/slugify'
import { MIN_PRICE } from '../../src/lib/validators'
import { seedData } from '../../src/seed/data'

const { categories, products, siteSettings } = seedData

describe('datos iniciales', () => {
  it('tiene 29 productos: 11 blusas y tops, 12 bodies y 6 vestidos', () => {
    const count = (slug: string) => products.filter((p) => p.category === slug).length
    expect(products).toHaveLength(29)
    expect(count('blusas-y-tops')).toBe(11)
    expect(count('bodies')).toBe(12)
    expect(count('vestidos')).toBe(6)
  })
  it('cada producto apunta a una categoría existente', () => {
    const slugs = new Set(categories.map((c) => c.slug))
    for (const p of products) expect(slugs, p.name).toContain(p.category)
  })
  it('no hay slugs repetidos', () => {
    const slugs = products.map((p) => slugify(p.name))
    expect(new Set(slugs).size).toBe(slugs.length)
  })
  it('todos los precios son enteros desde 1000', () => {
    for (const p of products) {
      expect(Number.isInteger(p.price) && p.price >= MIN_PRICE, p.name).toBe(true)
    }
  })
  it('la configuración trae WhatsApp, pasos y políticas', () => {
    expect(siteSettings.whatsappNumber).toBe('573189952081')
    expect(siteSettings.howToBuySteps).toHaveLength(4)
    expect(siteSettings.exchangePolicies).toHaveLength(4)
  })
})
```

`tests/unit/seed-images.test.ts`:

```ts
import { mkdtemp, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { createCatalogImageLoader, pagePath, placeholderImage } from '../../src/seed/images'

describe('imágenes del seed', () => {
  it('la imagen provisional es un JPEG de 800x1000', async () => {
    const meta = await sharp(await placeholderImage()).metadata()
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 800, 1000])
  })
  it('sin recortes definidos usa la imagen provisional', async () => {
    const load = createCatalogImageLoader('no-existe')
    const buffers = await load({ name: 'Lía', category: 'blusas-y-tops', price: 45000 })
    expect(buffers).toHaveLength(1)
  })
  it('recorta cada foto de la página indicada', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'veliza-seed-'))
    await mkdir(path.join(dir, 'pages'))
    await sharp({ create: { width: 1000, height: 1400, channels: 3, background: '#FAF9F6' } })
      .png()
      .toFile(pagePath(dir, 7))
    const load = createCatalogImageLoader(dir)
    const buffers = await load({
      name: 'Lía',
      category: 'blusas-y-tops',
      price: 45000,
      source: { page: 7, crops: [{ left: 0, top: 0, width: 400, height: 500 }, { left: 500, top: 600, width: 480, height: 600 }] },
    })
    const sizes = await Promise.all(buffers.map(async (b) => (await sharp(b).metadata()).width))
    expect(sizes).toEqual([400, 480])
  })
  it('explica qué hacer si falta la página', async () => {
    const load = createCatalogImageLoader('no-existe')
    await expect(
      load({ name: 'Lía', category: 'blusas-y-tops', price: 45000, source: { page: 7, crops: [{ left: 0, top: 0, width: 10, height: 10 }] } }),
    ).rejects.toThrow(/npm run seed:pages/)
  })
})
```

- [ ] **Step 2: Escribir la prueba de integración que falla**

`tests/int/seed.int.spec.ts`:

```ts
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { siteSettings } from '../../src/seed/data/site-settings'
import { placeholderImage } from '../../src/seed/images'
import { seed } from '../../src/seed/seed'
import type { SeedData } from '../../src/seed/types'
import { NO_REVALIDATE, RUN } from './helpers'

let payload: Payload
const loadImages = async () => [await placeholderImage()]
const data: SeedData = {
  categories: [{ name: `Categoría ${RUN}`, slug: `categoria-${RUN}`, order: 99 }],
  products: [
    { name: `Seed ${RUN}`, category: `categoria-${RUN}`, price: 40000, colors: [{ name: 'Negro', swatch: '#000000' }] },
  ],
  siteSettings,
}
const productSlug = `seed-${RUN}`

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {
  const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: productSlug } }, depth: 0 })
  for (const doc of docs) {
    await payload.delete({ collection: 'products', id: doc.id, context: NO_REVALIDATE })
    for (const image of doc.images) {
      await payload.delete({ collection: 'media', id: image as number, context: NO_REVALIDATE })
    }
  }
  await payload.delete({ collection: 'categories', where: { slug: { equals: `categoria-${RUN}` } }, context: NO_REVALIDATE })
})

describe('seed', () => {
  it('crea lo que falta', async () => {
    const report = await seed(payload, data, loadImages)
    expect(report.categoriesCreated).toBe(1)
    expect(report.productsCreated).toBe(1)
  })
  it('una segunda ejecución no crea nada', async () => {
    const report = await seed(payload, data, loadImages)
    expect(report.categoriesCreated).toBe(0)
    expect(report.productsCreated).toBe(0)
  })
  it('no pisa los cambios hechos desde el panel', async () => {
    const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: productSlug } } })
    await payload.update({ collection: 'products', id: docs[0].id, data: { price: 45000 }, context: NO_REVALIDATE })
    await seed(payload, data, loadImages)
    const after = await payload.findByID({ collection: 'products', id: docs[0].id })
    expect(after.price).toBe(45000)
  })
  it('falla con un mensaje claro si la categoría no existe', async () => {
    const broken: SeedData = { ...data, products: [{ name: `Huérfano ${RUN}`, category: 'no-existe', price: 40000 }] }
    await expect(seed(payload, broken, loadImages)).rejects.toThrow(/Categoría desconocida/)
  })
})
```

- [ ] **Step 3: Ejecutar y ver que fallan**

Run: `npm run test:unit -- seed` y `npm run test:int -- seed`
Expected: FAIL. Los módulos de `src/seed` no existen.

- [ ] **Step 4: Implementar los tipos y las imágenes**

`src/seed/types.ts`:

```ts
export type Crop = { left: number; top: number; width: number; height: number }

export type SeedCategory = { name: string; slug: string; order: number }

export type SeedProduct = {
  name: string
  /** slug de la categoría */
  category: string
  price: number
  colors?: { name: string; swatch?: string }[]
  featured?: boolean
  description?: string
  /** página del PDF del catálogo (1 = portada) y recortes de cada foto */
  source?: { page: number; crops: Crop[] }
}

export type SiteSettingsSeed = {
  whatsappNumber: string
  instagramUrl: string
  tiktokUrl: string
  priceNotice: string
  antifraudNotice: string
  aboutShort: string
  aboutStory: string
  mission: string
  vision: string
  howToBuySteps: { text: string }[]
  deliveryOptions: { text: string }[]
  exchangePolicies: { text: string }[]
}

export type SeedData = {
  categories: SeedCategory[]
  products: SeedProduct[]
  siteSettings: SiteSettingsSeed
}

export type ImageLoader = (product: SeedProduct) => Promise<Buffer[]>
```

`src/seed/images.ts`:

```ts
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import type { ImageLoader } from './types'

/** Imagen color crema (token `crema`) para productos sin foto recortada. */
export async function placeholderImage(): Promise<Buffer> {
  return sharp({ create: { width: 800, height: 1000, channels: 3, background: '#E6DAC8' } })
    .jpeg({ quality: 80 })
    .toBuffer()
}

export function pagePath(assetsDir: string, page: number): string {
  return path.join(assetsDir, 'pages', `page-${String(page).padStart(2, '0')}.png`)
}

export function createCatalogImageLoader(assetsDir: string): ImageLoader {
  return async (product) => {
    const source = product.source
    if (!source || source.crops.length === 0) return [await placeholderImage()]
    const file = pagePath(assetsDir, source.page)
    if (!existsSync(file)) {
      throw new Error(`No existe ${file}. Ejecuta primero: npm run seed:pages`)
    }
    return Promise.all(source.crops.map((crop) => sharp(file).extract(crop).jpeg({ quality: 88 }).toBuffer()))
  }
}
```

- [ ] **Step 5: Implementar el motor del seed**

`src/seed/seed.ts`:

```ts
import type { Payload } from 'payload'
import { slugify } from '../lib/slugify'
import type { ImageLoader, SeedData } from './types'

export type SeedReport = { categoriesCreated: number; productsCreated: number; settingsFilled: boolean }

const context = { disableRevalidate: true }

/** Crea solo lo que falta. Nunca modifica lo que ya existe (cambios de las dueñas). */
export async function seed(payload: Payload, data: SeedData, loadImages: ImageLoader): Promise<SeedReport> {
  const report: SeedReport = { categoriesCreated: 0, productsCreated: 0, settingsFilled: false }

  const categoryIds = new Map<string, number>()
  for (const category of data.categories) {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
      depth: 0,
    })
    if (docs[0]) {
      categoryIds.set(category.slug, docs[0].id)
      continue
    }
    const created = await payload.create({ collection: 'categories', data: category, context })
    categoryIds.set(category.slug, created.id)
    report.categoriesCreated++
  }

  for (const product of data.products) {
    const slug = slugify(product.name)
    const { totalDocs } = await payload.count({ collection: 'products', where: { slug: { equals: slug } } })
    if (totalDocs > 0) continue

    const categoryId = categoryIds.get(product.category)
    if (categoryId === undefined) {
      throw new Error(`Categoría desconocida "${product.category}" en el producto "${product.name}"`)
    }

    const buffers = await loadImages(product)
    const imageIds: number[] = []
    for (const [index, buffer] of buffers.entries()) {
      const media = await payload.create({
        collection: 'media',
        data: { alt: `${product.name} — foto ${index + 1}` },
        file: { data: buffer, mimetype: 'image/jpeg', name: `${slug}-${index + 1}.jpg`, size: buffer.length },
        context,
      })
      imageIds.push(media.id)
    }

    await payload.create({
      collection: 'products',
      data: {
        name: product.name,
        slug,
        category: categoryId,
        price: product.price,
        colors: product.colors ?? [],
        images: imageIds,
        description: product.description,
        featured: product.featured ?? false,
      },
      context,
    })
    report.productsCreated++
  }

  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (!settings.aboutStory) {
    await payload.updateGlobal({ slug: 'site-settings', data: data.siteSettings, context })
    report.settingsFilled = true
  }

  return report
}
```

- [ ] **Step 6: Escribir los datos**

`src/seed/data/categories.ts`:

```ts
import type { SeedCategory } from '../types'

export const categories: SeedCategory[] = [
  { name: 'Blusas y Tops', slug: 'blusas-y-tops', order: 1 },
  { name: 'Bodies', slug: 'bodies', order: 2 },
  { name: 'Vestidos', slug: 'vestidos', order: 3 },
]
```

`src/seed/data/products.ts` (los `source` y los colores provisionales se completan en la Tarea 9):

```ts
import type { SeedProduct } from '../types'

const blusa = (name: string, price: number, extra: Partial<SeedProduct> = {}): SeedProduct => ({
  name,
  price,
  category: 'blusas-y-tops',
  ...extra,
})
const body = (name: string, price: number, extra: Partial<SeedProduct> = {}): SeedProduct => ({
  name,
  price,
  category: 'bodies',
  ...extra,
})
const vestido = (name: string, price: number, extra: Partial<SeedProduct> = {}): SeedProduct => ({
  name,
  price,
  category: 'vestidos',
  ...extra,
})

export const products: SeedProduct[] = [
  // Blusas y Tops (11)
  blusa('Boss', 35000),
  blusa('Gladys', 36000),
  blusa('Venecia', 34000),
  blusa('Kenda', 34000),
  blusa('Buzo encaje', 46000),
  blusa('Blusa nudo', 35000),
  blusa('Blusa manga corta', 26000),
  blusa('Blusa Hebilla', 35000),
  blusa('Blusa manga larga', 30000),
  blusa('Lía', 45000, { featured: true }),
  blusa('Top Blonda Copa', 50000, { featured: true }),
  // Bodies (12)
  body('Body Wooz', 40000),
  body('Body básico', 38000),
  body('Body Varilla W', 48000),
  body('Body malla', 43000),
  body('Body M.L', 48000, {
    featured: true,
    colors: [
      { name: 'Rojo', swatch: '#B3261E' },
      { name: 'Blanco', swatch: '#FFFFFF' },
      { name: 'Negro', swatch: '#000000' },
      { name: 'Amarillo pastel', swatch: '#F6E7A1' },
      { name: 'Azul', swatch: '#2F5DA8' },
      { name: 'Rosado', swatch: '#F2B8C6' },
      { name: 'Animal print' },
    ],
  }),
  body('Body Hillary', 40000),
  body('Body Cuello U', 40000),
  body('Body Cloe', 40000),
  body('Body Lazo Hombro', 40000),
  body('Body Xiomara', 43000),
  body('Body Sky', 38000),
  body('Body encaje', 47000),
  // Vestidos (6)
  vestido('Vestido ojalillo', 80000, { featured: true }),
  vestido('Amanda', 56000),
  vestido('Lazo Corto', 55000),
  vestido('Babero Corto', 58000),
  vestido('Babero Parte Trasera', 58000),
  vestido('Elida', 55000),
]
```

`src/seed/data/site-settings.ts` (textos de `info.jpeg`, `quien somos.jpeg` y `Mision, vision.jpeg`):

```ts
import type { SiteSettingsSeed } from '../types'

export const siteSettings: SiteSettingsSeed = {
  whatsappNumber: '573189952081',
  // Confirmar con las dueñas: Instagram no admite tildes en los usuarios.
  instagramUrl: 'https://www.instagram.com/veliza_storebq',
  tiktokUrl: 'https://www.tiktok.com/@veliza_storebq',
  priceNotice: 'Los precios varían por temporada, no manejamos precios fijos.',
  antifraudNotice: 'Solo recibimos pedidos por nuestro WhatsApp oficial: +57 318 995 2081 💕',
  aboutShort:
    'Véliza nació de una idea entre amigas, Isabella, Sara y Valerie, que soñaban con tener su propia marca. Hoy representa nuestra amistad, nuestro esfuerzo y nuestra pasión por la moda.',
  aboutStory: [
    'Véliza nació de una idea entre amigas, Isabella, Sara y Valerie, que soñaban con tener su propia marca.',
    'Lo que comenzó como una simple idea se convirtió en un proyecto lleno de ilusión, creatividad y muchas ganas de crecer juntas.',
    'Hoy, Véliza representa nuestra amistad, nuestro esfuerzo y nuestra pasión por la moda.',
    'Gracias por ser parte de este sueño 💕',
  ].join('\n\n'),
  mission:
    'En Véliza queremos ofrecer productos de calidad, con estilo y personalidad, que te hagan sentir única y segura. Nos enfocamos en brindar una experiencia de compra cercana, confiable y especial, siempre con mucho amor y dedicación.',
  vision:
    'Ser un emprendimiento reconocido y en constante crecimiento, llevando nuestra esencia a más personas, convirtiéndonos en una marca que inspire, con estilo, autenticidad y propósito.',
  howToBuySteps: [
    { text: 'Ingresa a nuestro catálogo y elige la prenda que te guste.' },
    { text: 'Envíanos la referencia, la talla y el color que deseas para confirmar la disponibilidad.' },
    { text: 'Completa tus datos personales y elige la forma de entrega.' },
    { text: 'Realiza el pago y envíanos el comprobante para confirmar tu pedido.' },
  ],
  deliveryOptions: [
    { text: 'Pago por transferencia o contra entrega en Barranquilla y Soledad.' },
    { text: 'Envíos nacionales.' },
  ],
  exchangePolicies: [
    { text: 'Cambios solo si es error de la marca.' },
    { text: 'Notifícanos al instante, apenas revises tu prenda.' },
    { text: 'La prenda no debe haber sido usada, lavada, dañada ni cambiada previamente por gusto.' },
    { text: 'No hacemos devolución de dinero.' },
  ],
}
```

`src/seed/data/index.ts`:

```ts
import type { SeedData } from '../types'
import { categories } from './categories'
import { products } from './products'
import { siteSettings } from './site-settings'

export const seedData: SeedData = { categories, products, siteSettings }
```

`src/seed/index.ts`:

```ts
import { getPayload } from 'payload'
import config from '../payload.config'
import { seedData } from './data'
import { createCatalogImageLoader } from './images'
import { seed } from './seed'

const payload = await getPayload({ config })
const report = await seed(payload, seedData, createCatalogImageLoader(process.env.SEED_ASSETS_DIR || 'seed-assets'))
payload.logger.info(
  `Seed listo: ${report.categoriesCreated} categorías y ${report.productsCreated} productos nuevos; ` +
    `configuración ${report.settingsFilled ? 'llenada' : 'sin cambios (ya tenía datos)'}.`,
)
process.exit(0)
```

En `package.json` → `"scripts"`:

```json
"seed": "cross-env NODE_OPTIONS=--no-deprecation payload run src/seed/index.ts"
```

- [ ] **Step 7: Ejecutar y ver que pasan**

Run: `npm run test:unit && npm run test:int`
Expected: PASS (unitarias: 8 archivos; integración: 4 archivos).

- [ ] **Step 8: Typecheck y commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add idempotent seed with catalog data and brand texts" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Fotos de los productos (definitivas) y colores provisionales

> **Importante:** las dueñas **no tienen fotos individuales**. Estas fotos son las que verán las clientas, no un relleno temporal. Prioriza la calidad: la máxima resolución, sin texto ni destellos sobreimpresos, y con la prenda completa.

- [ ] **Step 0 (exploración): ¿el PDF trae las fotos originales separadas?**

Los PDF exportados de Canva suelen incrustar cada foto como una imagen independiente, en resolución original. Extráelas en el scratchpad con `mupdf` (`npm i -D mupdf`, y usa su API para recorrer las imágenes de cada página) y revisa algunas con Read.
- **Si salen fotos limpias**, individuales y de buena resolución: úsalas directamente. Guárdalas en `seed-assets/photos/<slug>-N.jpg`, añade a `SeedProduct` un campo opcional `photos?: string[]` y haz que `createCatalogImageLoader` lo prefiera sobre `source`. Aplica TDD, con una prueba en `tests/unit/seed-images.test.ts`, y ajusta los pasos siguientes.
- **Si vienen aplanadas** en una sola imagen por página: sigue con los recortes (pasos 1 a 6), con `scale: 3` en lugar de `2` para tener más resolución.

Cuéntale al usuario qué encontraste antes de seguir.

**Files:**
- Create: `scripts/extract-catalog-pages.mjs`, `scripts/preview-crops.ts`
- Modify: `src/seed/data/products.ts` (añade `source` y `colors` a cada producto), `package.json` (scripts `seed:pages` y `seed:preview`)
- Test: `tests/unit/seed-data.test.ts` (añade una prueba)

**Interfaces:**
- Consumes: `pagePath` y `createCatalogImageLoader` (Tarea 8), `slugify` (Tarea 2)
- Produces: `seed-assets/pages/page-NN.png` (no va a git) y `source` definido en los 29 productos.

💡 Concepto: se convierte el PDF a imágenes y se recorta con coordenadas (`left`, `top`, `width`, `height`, en píxeles desde la esquina superior izquierda).

- [ ] **Step 1: Extraer las páginas del PDF**

```bash
npm i -D pdf-to-img tsx
mkdir -p seed-assets
cp /c/Users/lol/Desktop/Projetcs/info_veliza/Catalogo*.pdf seed-assets/catalogo.pdf
```

`scripts/extract-catalog-pages.mjs`:

```js
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pdf } from 'pdf-to-img'

const assets = process.env.SEED_ASSETS_DIR || 'seed-assets'
const outDir = path.join(assets, 'pages')
await mkdir(outDir, { recursive: true })

const document = await pdf(path.join(assets, 'catalogo.pdf'), { scale: 2 })
let page = 1
for await (const image of document) {
  await writeFile(path.join(outDir, `page-${String(page).padStart(2, '0')}.png`), image)
  page++
}
console.log(`Listo: ${page - 1} páginas en ${outDir}`)
```

`scripts/preview-crops.ts`:

```ts
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { slugify } from '../src/lib/slugify'
import { products } from '../src/seed/data/products'
import { createCatalogImageLoader } from '../src/seed/images'

const assets = process.env.SEED_ASSETS_DIR || 'seed-assets'
const out = path.join(assets, 'preview')
await mkdir(out, { recursive: true })
const load = createCatalogImageLoader(assets)
for (const product of products) {
  const buffers = await load(product)
  await Promise.all(buffers.map((b, i) => writeFile(path.join(out, `${slugify(product.name)}-${i + 1}.jpg`), b)))
}
console.log(`Vista previa en ${out}`)
```

En `package.json` → `"scripts"`:

```json
"seed:pages": "node scripts/extract-catalog-pages.mjs",
"seed:preview": "tsx scripts/preview-crops.ts"
```

Run: `npm run seed:pages`
Expected: `Listo: 33 páginas en seed-assets/pages`.

- [ ] **Step 2: Medir las páginas**

```bash
node -e "const s=require('sharp');s('seed-assets/pages/page-04.png').metadata().then(m=>console.log(m.width,m.height))"
```

Anota el ancho y el alto: todas las páginas miden lo mismo.

- [ ] **Step 3: Definir los recortes y los colores de cada producto**

Para cada página de la 4 a la 33 (la 1 es la portada, la 2 "quiénes somos" y la 3 misión y visión):
1. Abre `seed-assets/pages/page-NN.png` con la herramienta Read (muestra la imagen).
2. Identifica el producto por el nombre sobreimpreso y búscalo en `products.ts`. Si la página muestra un producto que no está en la lista (hay 30 páginas y 29 productos), anótalo y **pregúntale al usuario** antes de añadirlo.
3. Define de 1 a 3 recortes, uno por foto individual, **sin el texto ni los destellos sobreimpresos**, con una proporción cercana a 4:5 (alto ≈ ancho × 1.25). El primero es la foto más clara de la prenda completa.
4. Anota los colores **que se ven** en las fotos como borrador, con un `swatch` aproximado. No toques los colores de `Body M.L`, que ya están confirmados.
5. Escríbelo en `products.ts`. Ejemplo de forma (los números son ilustrativos; usa los que midas):

```ts
body('Body Cloe', 40000, {
  source: { page: 12, crops: [{ left: 60, top: 180, width: 560, height: 700 }, { left: 660, top: 180, width: 560, height: 700 }] },
  colors: [{ name: 'Negro', swatch: '#000000' }, { name: 'Blanco', swatch: '#FFFFFF' }],
}),
```

- [ ] **Step 4: Revisar visualmente los recortes**

Run: `npm run seed:preview`
Abre algunas imágenes de `seed-assets/preview/` con Read. Corrige los recortes que corten la prenda o incluyan texto. Repite hasta que todos se vean bien.

- [ ] **Step 5: Añadir una prueba que exige recortes en todos los productos**

En `tests/unit/seed-data.test.ts`, dentro del `describe`:

```ts
  it('cada producto tiene al menos un recorte definido', () => {
    for (const p of products) expect(p.source?.crops.length ?? 0, p.name).toBeGreaterThan(0)
  })
```

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git status --short   # confirma que seed-assets/ NO aparece
git commit -m "feat: add catalog page extraction and placeholder photo crops" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Cargar la rama de desarrollo y verificar el panel de principio a fin

**Files:**
- Create: `CLAUDE.md` (del repositorio `veliza`)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: la rama `dev` de Neon con 3 categorías, 29 productos y la configuración, más un `CLAUDE.md` para futuras sesiones.

- [ ] **Step 1: Ejecutar el seed contra la rama `dev`**

Run: `npm run seed`
Expected: `Seed listo: 3 categorías y 29 productos nuevos; configuración llenada.`

Run: `npm run seed` otra vez.
Expected: `Seed listo: 0 categorías y 0 productos nuevos; configuración sin cambios (ya tenía datos).`

- [ ] **Step 2: Recorrer el panel con el usuario**

`npm run dev`. Luego, con el usuario, en http://localhost:3000/panel-veliza:
1. Todo el panel está en español.
2. **Productos** muestra 29 productos con fotos, y **Categorías** muestra 3.
3. Editar el precio de un producto a `35.000` (con punto) → el panel muestra el mensaje "sin puntos". Con `35000` se guarda.
4. Intentar borrar la categoría "Bodies" → aparece el mensaje "No puedes borrar esta categoría…".
5. En **Configuración del sitio → Contacto**, escribir `+57 318 995 2081` y guardar → queda `573189952081`.
6. Subir un PDF en **Imágenes** → es rechazado.
7. Cerrar sesión y fallar la contraseña 5 veces → la cuenta queda bloqueada. Espera 10 minutos o desbloquéala desde otra cuenta.

- [ ] **Step 3: Verificaciones finales**

```bash
npm run test:unit && npm run test:int
npm run typecheck
npm run build
```

Expected: todo pasa y el build termina sin errores.

- [ ] **Step 4: Revisión de seguridad**

Ejecuta la skill `owasp` sobre `src/access/`, `src/collections/Users.ts`, `src/collections/Media.ts`, `src/globals/SiteSettings.ts` y `src/payload.config.ts`. Corrige los hallazgos confirmados con TDD antes de continuar.

- [ ] **Step 5: `CLAUDE.md` del repositorio**

```markdown
# CLAUDE.md

Catálogo web de Véliza (ropa femenina, Barranquilla). Next.js 16 + Payload 3 + PostgreSQL (Neon).
Spec: docs/superpowers/specs/2026-09-28-veliza-catalog-design.md · Planes: docs/superpowers/plans/
Material de marca: ../info_veliza (ver su CLAUDE.md). Habla con el usuario en español; está aprendiendo, explica los conceptos nuevos.

## Comandos
- `npm run dev` → tienda en http://localhost:3000, panel en http://localhost:3000/panel-veliza
- `npm run test:unit` (sin base de datos) · `npm run test:int` (rama `test` de Neon, lee `.env.test`)
- `npm run generate:types` después de cambiar colecciones o globals · `npm run generate:importmap` si cambian componentes del panel
- `npm run seed` crea solo lo que falta (nunca modifica) · `npm run seed:pages` / `seed:preview` para las fotos provisionales

## Convenciones
- Imports relativos dentro de `src/`. Lógica pura en `src/lib/` con pruebas en `tests/unit/`.
- Etiquetas del panel y textos en español (Colombia, "tú").
- Toda escritura desde scripts o pruebas lleva `context: { disableRevalidate: true }`.
- Nunca hagas commit de `.env*`, `media/` ni `seed-assets/`.
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: add repository CLAUDE.md" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**Al terminar el Plan 1:** escribir el Plan 2 (tienda pública, headers de seguridad, E2E, guía para las dueñas y copias de seguridad) a partir del código real y de `src/payload-types.ts`.
