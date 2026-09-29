@AGENTS.md

# CLAUDE.md

Catálogo web de Véliza (ropa femenina, Barranquilla). Next.js 16 + Payload 3 + PostgreSQL (Neon).
Spec: docs/superpowers/specs/2026-09-28-veliza-catalog-design.md · Planes: docs/superpowers/plans/
Material de marca: ../info_veliza (ver su CLAUDE.md). Habla con el usuario en español; está aprendiendo, explica los conceptos nuevos.

## Comandos
- `npm run dev` → tienda en http://localhost:3000, panel en http://localhost:3000/panel-veliza
- `npm run test:unit` (sin base de datos) · `npm run test:int` (rama `test` de Neon, lee `.env.test`)
- `npm run generate:types` después de cambiar colecciones o globals · `npm run generate:importmap` si cambian componentes del panel
- `npm run seed` crea solo lo que falta (nunca modifica) · `npm run seed:pages` / `seed:preview` para las fotos del catálogo
- `node scripts/detect-photos.mjs [página…]` detecta los rectángulos de foto de una página (apoyo para definir recortes)

## Convenciones
- Imports relativos dentro de `src/`. Lógica pura en `src/lib/` con pruebas en `tests/unit/`.
- Etiquetas del panel y textos en español (Colombia, "tú").
- Toda escritura desde scripts o pruebas lleva `context: { disableRevalidate: true }`.
- Nunca hagas commit de `.env*`, `media/` ni `seed-assets/`. Las cadenas de conexión nunca pasan por el chat.
- Todos los paquetes `@payloadcms/*` van en la misma versión exacta que `payload`.

## Datos y entornos
- Neon: proyecto `veliza`; ramas `production` (principal), `dev` (`.env`) y `test` (`.env.test`). Las ramas no expiran.
- Las fotos de los productos son **definitivas**: se recortan del PDF del catálogo (las dueñas no tienen fotos individuales).
  "Blusa manga corta" ocupa las páginas 10 y 11. Los colores de todos los productos, salvo Body M.L, son un borrador por confirmar.
- `mupdf` (AGPL) no debe entrar al proyecto; `pdf-to-img` (MIT) es el que se usa.

## Seguridad (ya aplicado)
- Panel en `/panel-veliza` con `X-Robots-Tag: noindex`; GraphQL desactivado; bloqueo de 10 min tras 5 intentos.
- Contraseñas de 12+ caracteres; cookie de sesión `Secure` cuando `NEXT_PUBLIC_SERVER_URL` es https.
- Subidas: solo JPG/PNG/WebP (Payload detecta el tipo real por contenido), máximo 10 MB.
- Antes de publicar: crear las cuentas **antes** de exponer el sitio (con la base vacía, cualquiera podría crear la primera cuenta).
