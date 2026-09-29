# Véliza: sitio catálogo, diseño

- **Fecha:** 2026-09-28
- **Estado:** en revisión por el usuario
- **Material de marca (fuente):** `C:\Users\lol\Desktop\Projetcs\info_veliza` (logo, paleta, textos, PDF del catálogo, fotos)
- **Código:** `C:\Users\lol\Desktop\Projetcs\veliza` (este repositorio)
- **Hosting y dominio:** por definir. El dominio será un regalo y quizá también el hosting. La app se diseña para ser portable (sección 11).

## 1. Propósito

Véliza es una tienda virtual de ropa femenina de Barranquilla (Colombia), creada por tres amigas: Isabella, Sara y Valerie. Hoy su catálogo es un PDF de collages que se comparte por WhatsApp e Instagram. Este proyecto lo reemplaza con un sitio web que:

1. Muestra el catálogo de forma bonita, rápida y fiel a la marca, pensado primero para celular (las clientas llegan desde Instagram y TikTok).
2. Convierte el interés en conversación: cada producto tiene un botón **"Pedir por WhatsApp"** que abre un chat con la referencia y el color ya escritos.
3. Deja que las dueñas actualicen productos, precios, fotos y textos **ellas mismas**, desde el celular, sin depender de un desarrollador.

**Criterios de éxito**

- Una clienta encuentra una prenda, elige un color y llega a WhatsApp con el mensaje listo en 3 toques o menos desde el catálogo.
- Una dueña puede cambiar un precio, marcar una prenda como agotada o subir una foto desde el celular, y el cambio se ve en el sitio en segundos.
- El sitio se ve como Véliza: tonos crema, serif elegante y detalles de corazones y destellos.
- El costo mensual es el mínimo posible: $0 en desarrollo, y en producción lo que permita el hosting regalado o un plan gratuito que admita uso comercial.

**Objetivo secundario:** el desarrollador quiere aprender tecnologías modernas con este proyecto (Next.js App Router, Server Components, Payload CMS, Tailwind v4 y PostgreSQL). El plan de implementación debe explicar los conceptos nuevos a medida que aparecen.

## 2. Alcance

### Dentro del alcance

**Páginas públicas**

| Ruta | Contenido |
|---|---|
| `/` | Logo, productos destacados, accesos por categoría, "quiénes somos" corto, cómo comprar en 4 pasos |
| `/catalogo` | Cuadrícula de productos, filtro por categoría y orden (`?categoria=<slug>&orden=<recientes\|precio-asc\|precio-desc>`) |
| `/producto/[slug]` | Galería, nombre, precio, talla, selector de color, descripción, botón "Pedir por WhatsApp" |
| `/quienes-somos` | Historia, misión y visión |
| `/como-comprar` | Proceso de compra, entregas, métodos de pago y política de cambios |
| 404 | Página "no encontrada" con la estética de la marca y un enlace al catálogo |

**En todo el sitio:** encabezado con logo y navegación (menú hamburguesa en celular), botón flotante de WhatsApp, aviso de que los precios varían según la temporada, aviso antifraude (*"Solo recibimos pedidos por este número 💕"*), y footer con Instagram, TikTok, WhatsApp y enlaces a las páginas informativas.

**Panel de administración (`/panel-veliza`):** productos, categorías, fotos, cuentas de las dueñas y configuración del sitio (sección 5).

**Guía de seguridad para las dueñas:** un documento corto en español (`docs/guia-seguridad-duenas.md`) sobre cómo activar la verificación en dos pasos en WhatsApp e Instagram, cómo reconocer el robo de códigos por SMS, y cómo entrar al panel (sección 9.4).

### Fuera del alcance (por ahora)

Carrito, pagos en línea, cuentas de clientas, inventario por unidades, selector de tallas, newsletter, reseñas, blog, varios idiomas, correos automáticos (incluida la recuperación de contraseña por correo, ver sección 5.3) y **2FA en el panel** (segunda fase, ver sección 9.5).

## 3. Diseño visual

### 3.1 Tipografía (Google Fonts, cargadas con `next/font` para evitar saltos de diseño)

| Uso | Fuente |
|---|---|
| Títulos, logo en texto | Cormorant Garamond (500–600) |
| Nombres de producto | Cormorant Garamond *Italic* |
| Acentos manuscritos (solo frases cortas: "¿Quiénes somos?", "Misión", "¡Muy importante!") | Great Vibes |
| Texto de lectura, precios, botones, etiquetas en MAYÚSCULAS con letras espaciadas | Jost (300–400; 500 para botones) |

El texto de lectura mide como mínimo 16px, con un interlineado de ~1.6.

### 3.2 Tokens de color

Se definen como variables en `@theme` de Tailwind v4. Los componentes nunca usan hex sueltos.

| Token | Hex | Uso | Contraste sobre `fondo` |
|---|---|---|---|
| `fondo` | `#FAF9F6` | Fondo general | — |
| `superficie` | `#F4F1EA` | Tarjetas, secciones alternas | — |
| `crema` | `#E6DAC8` | Bandas decorativas, fondo del footer | — |
| `arena` | `#CBB9A4` | Bordes, separadores | — |
| `roca` | `#A48D78` | Corazones, destellos, títulos grandes (≥24px) | ~3:1 (**no se usa para texto pequeño**) |
| `texto` | `#3B2A20` | Texto principal, fondo del botón principal | ~13:1 |
| `texto-suave` | `#6B5646` | Texto secundario, notas | ~6.6:1 |

- **Botón principal / WhatsApp:** fondo `texto` (cacao), texto `fondo`, ícono de WhatsApp en SVG. Nunca en el verde de WhatsApp.
- **Producto agotado:** foto en escala de grises con opacidad reducida, etiqueta "Agotada", y botón deshabilitado con el texto "Agotada".

### 3.3 Estilo y diseño de página

- Editorial y minimalista, con mucho espacio libre. Las fotos son las protagonistas.
- Motivos en SVG de línea fina: corazones, destellos de 4 puntas y subrayados dibujados a mano. Son decorativos (`aria-hidden`).
- Mobile-first: el catálogo va en 2 columnas en celular, 3 en tablet y 4 en escritorio. Fotos en proporción 4:5.
- **Tarjeta de producto:** foto (la segunda foto aparece al pasar el mouse en escritorio), nombre en cursiva, precio y puntos de color.
- Botones y zonas táctiles de al menos 44×44px. El foco del teclado siempre es visible.
- Animaciones suaves: aparición al hacer scroll y transición de 150–250ms en los estados de hover y foco. Se respeta `prefers-reduced-motion`.
- Solo tema claro. No hay modo oscuro, porque la marca es crema y beige.

### 3.4 Tono del texto

Español de Colombia, trato de "tú", cálido y cercano ("con mucho amor", corazones). Los textos del sitio salen del material de marca (`info.jpeg`, `quien somos.jpeg`, `Mision, vision.jpeg`).

## 4. Arquitectura

### 4.1 Stack

- **Next.js** (App Router) + **Payload CMS 3.x** en la misma app. Se usan las últimas versiones estables compatibles entre sí.
- **TypeScript** en modo estricto, **Tailwind CSS v4**.
- **PostgreSQL** con `@payloadcms/db-postgres`. En desarrollo se usa **Neon** (plan gratis). En producción se usa donde quede el hosting (Neon u otro PostgreSQL). No hace falta Docker.
- **Imágenes:** en desarrollo se guardan en disco local. En producción van a un almacenamiento **compatible con S3** con `@payloadcms/storage-s3`. Candidato: **Cloudflare R2** (10 GB gratis, sin cobro por descargas, permite uso comercial). Payload genera tamaños optimizados con `sharp`.
- **Texto enriquecido:** `@payloadcms/richtext-lexical` queda instalado porque viene con la plantilla, pero ningún campo lo usa por ahora (ver `SiteSettings` en la sección 5.2).
- **Gestor de paquetes:** npm.
- **Nada depende de un proveedor de hosting concreto.** No se usan APIs propias de Vercel, Netlify ni otros. Next.js se construye con `output: 'standalone'` para poder correr en cualquier servidor Node.

### 4.2 Estructura de carpetas

```
src/
  app/
    (frontend)/            tienda pública (layout, páginas, estilos globales)
    (payload)/             panel /panel-veliza y API REST de Payload (generado por Payload)
  collections/             Products.ts, Categories.ts, Media.ts, Users.ts
  globals/                 SiteSettings.ts
  components/              componentes de UI (ProductCard, ColorPicker, WhatsAppButton, …)
  lib/                     lógica pura y testeable (whatsapp.ts, price.ts, catalog.ts)
  hooks/                   hooks de Payload (revalidación)
  seed/                    script y datos de carga inicial
  payload.config.ts
docs/
  superpowers/             specs y planes
  guia-seguridad-duenas.md
tests/
  unit/                    Vitest
  e2e/                     Playwright
```

Los paréntesis son *route groups* de Next.js: agrupan rutas sin cambiar la URL.

### 4.3 Flujo de datos y renderizado

1. Las páginas públicas son **Server Components**. Obtienen los datos con la **Local API** de Payload (`getPayload()` + `payload.find()`), que consulta la base directamente, sin HTTP.
2. **Todas las consultas públicas pasan por la caché de datos de Next.js** con etiquetas (`products`, `categories`, `site-settings`). Eso incluye el catálogo con filtros: las combinaciones de filtro y orden se resuelven sobre datos cacheados, así que ninguna visita pública, sea humana o bot, llega a consultar la base directamente.
3. Las páginas de producto se pregeneran con `generateStaticParams`.
4. **Revalidación:** los hooks `afterChange` y `afterDelete` de productos, categorías y la configuración invalidan la etiqueta que corresponde (y las rutas afectadas). Así un cambio en el panel se ve en segundos sin volver a desplegar.
5. **Client Components** (solo lo interactivo): selector de color, botón "Pedir por WhatsApp", galería, menú móvil y los controles de filtro y orden.
6. El filtro y el orden del catálogo viven en la URL (`searchParams`). Se pueden compartir y el botón "atrás" funciona.

## 5. Panel de administración

### 5.1 Cómo acceden las dueñas

- Es **un solo sitio y un solo despliegue**. El panel vive en el mismo dominio, en **`/panel-veliza`** (se configura con `routes.admin` de Payload). No hay un segundo sitio.
- Entran con **correo y contraseña**. Sin sesión iniciada solo ven el formulario de ingreso.
- La tienda pública **no enlaza** al panel. El panel lleva `noindex` y está bloqueado en `robots.txt`, así que no aparece en buscadores.
- Las dueñas lo guardan en favoritos o como ícono en la pantalla de inicio del celular, y **siempre entran desde ahí**, nunca desde enlaces recibidos por mensaje.
- El panel está **en español** (i18n de Payload con `es` como idioma por defecto). Todas las etiquetas y ayudas de los campos están escritas en español.
- El desarrollador crea las tres cuentas al configurar el sitio.

### 5.2 Colecciones y globals

**Products** (`products`)

| Campo | Tipo | Reglas |
|---|---|---|
| `name` | text | obligatorio; es la "referencia" (por ejemplo "Body Cloe") |
| `slug` | text | único; se genera desde `name` y se puede editar |
| `category` | relationship → categories | obligatorio |
| `price` | number | obligatorio, entero ≥ 1.000, en COP. El mínimo evita un error típico: escribir "35.000" con punto y que se guarde como 35. |
| `size` | text | por defecto "Talla única (S–M)" |
| `colors` | array de `{ name: text (obligatorio), swatch: text hex opcional }` | puede estar vacío |
| `images` | upload → media, varias | al menos 1; la primera es la portada; se reordenan arrastrando |
| `description` | textarea | opcional, corta |
| `featured` | checkbox | aparece en "Destacados" del inicio |
| `soldOut` | checkbox | se muestra en gris y no se puede pedir |

Orden por defecto en el catálogo: disponibles primero, luego los más recientes. Los agotados siempre van al final, con cualquier orden.

**Categories** (`categories`): `name` (obligatorio), `slug` (único), `image` (foto del acceso en el inicio), `order` (número para ordenar). Datos iniciales: Blusas y Tops, Bodies, Vestidos. **No se puede borrar una categoría que tenga productos**: el panel muestra un mensaje que pide mover o borrar esos productos primero.

**Slugs duplicados:** si dos productos (o categorías) generan el mismo slug, al segundo se le agrega `-2`, `-3`, etc., en lugar de mostrar un error de base de datos.

**Media** (`media`): colección de subida de imágenes con `alt` obligatorio. Solo acepta `image/jpeg`, `image/png` y `image/webp`, con un máximo de 10 MB por archivo. Tamaños generados: `thumbnail` (~400px), `card` (~800px, 4:5) y `full` (~1600px), en formato WebP.

**Users** (`users`): colección con autenticación. Solo las dueñas (y el desarrollador). Seguridad: `maxLoginAttempts: 5` y `lockTime` de 10 minutos.

**SiteSettings** (global `site-settings`): organizada en pestañas:
- **Contacto:** `whatsappNumber`. Se aceptan espacios, `+` o guiones, y se guarda solo con dígitos (10–15). También `instagramUrl` y `tiktokUrl`.
- **Avisos:** `priceNotice` y `antifraudNotice`.
- **Quiénes somos:** `aboutShort`, `aboutStory` (los párrafos se separan con una línea en blanco), `mission` y `vision`, todos como área de texto.
- **Cómo comprar:** `howToBuySteps`, `deliveryOptions` y `exchangePolicies`, como listas de frases.

Se usan áreas de texto y listas en lugar de un editor de texto enriquecido, porque son más fáciles de editar desde el celular y no hay HTML que sanear.

### 5.3 Permisos y cuentas

- Lectura pública para `products`, `categories`, `media` y `site-settings`. Escritura solo para usuarias con sesión iniciada.
- `users`: solo las usuarias con sesión iniciada pueden ver o crear cuentas. No hay registro público.
- **Contraseña olvidada:** como no hay correos automáticos, el desarrollador (o cualquiera de las dueñas con sesión iniciada) la restablece desde el panel. Si más adelante hace falta, se agrega un adaptador de correo (por ejemplo Resend).

## 6. Pedido por WhatsApp

`src/lib/whatsapp.ts` expone una función pura:

```ts
buildWhatsAppUrl({ phone, productName, color?, productUrl }): string
```

- Devuelve `https://wa.me/<phone>?text=<mensaje codificado con encodeURIComponent>`.
- Con color: *"¡Hola Véliza! 💕 Me interesa: {producto}, color {color}. ¿Está disponible? {url}"*
- Sin colores registrados: *"¡Hola Véliza! 💕 Me interesa: {producto}. ¿Qué colores tienen disponibles? {url}"*
- Si el producto tiene colores, el botón pide elegir uno antes de continuar (el primero **no** queda preseleccionado, así la clienta elige a conciencia).
- El botón flotante manda un saludo genérico: *"¡Hola Véliza! 💕 Quiero información."*
- El número sale de `SiteSettings`, no está fijo en el código.

## 7. Datos iniciales (seed)

- `src/seed/products.json`: los 29 productos del inventario (11 Blusas y Tops, 12 Bodies, 6 Vestidos) con nombre, categoría y precio. La lista está en el `CLAUDE.md` de `info_veliza`.
- **Colores:** Body M.L trae sus colores escritos (rojo, blanco, negro, amarillo pastel, azul, rosado, animal print). Los demás son un **borrador** que se saca mirando las fotos y que las dueñas deben confirmar.
- **Fotos (definitivas):** las dueñas **no tienen fotos individuales**, así que las fotos del sitio salen de los collages del catálogo. Primero se intenta extraer las fotos originales incrustadas en el PDF, con su resolución nativa. Si no están separadas, se renderizan las páginas en alta resolución y se recortan con `sharp`, con coordenadas definidas en los datos del seed. Como son definitivas, cada recorte se revisa visualmente. Las dueñas pueden reemplazar cualquier foto desde el panel cuando tengan fotos nuevas.
- **Textos:** la configuración del sitio se llena con los textos de `info.jpeg`, `quien somos.jpeg` y `Mision, vision.jpeg`.
- El script (`npm run seed`) es **idempotente y conservador**: crea solo lo que falta (busca por `slug`) y **nunca modifica** lo que ya existe, para no pisar los cambios de las dueñas. La configuración del sitio solo se llena si está vacía. Solo se ejecuta a mano, nunca en el build.
- Si un producto aún no tiene fotos recortadas, el seed usa una imagen provisional color crema, para que el catálogo funcione desde el primer momento.
- Redes: el usuario de Instagram y TikTok se guarda como `veliza_storebq` (sin tilde, porque Instagram no admite tildes en los usuarios). **Hay que confirmarlo con las dueñas.**

## 8. Errores y casos borde

- Producto o categoría inexistente: `notFound()` → página 404 de la marca.
- Categoría sin productos: mensaje amable ("Pronto tendremos novedades aquí 💕") y enlace a todo el catálogo.
- Parámetros de URL inválidos (`orden` o `categoria` desconocidos): se ignoran y se usan los valores por defecto.
- Producto sin foto (no debería pasar, porque es obligatoria): imagen de reserva con el logo.
- Producto agotado: sigue visible (sirve de antojo y de referencia), pero no se puede pedir.
- Imágenes con `width` y `height` definidos (`next/image`) para no provocar saltos de diseño. Carga diferida (lazy) fuera de la primera pantalla.

## 9. Seguridad

Ninguna app es 100% invulnerable. El objetivo es tener varias capas que encarezcan cualquier ataque, limiten el daño y permitan recuperarse rápido. El sitio **no guarda datos de clientas** (no hay cuentas, pagos ni direcciones), así que los activos a proteger son las cuentas de las dueñas, el contenido del catálogo y la disponibilidad del sitio.

### 9.1 Bots y denegación de servicio

- **Arquitectura:** las páginas públicas son estáticas o cacheadas (sección 4.3). El tráfico masivo lo absorbe la caché o la CDN y no llega a la base de datos.
- **Cloudflare delante del sitio (plan gratis):** cuando exista el dominio, su DNS pasa por Cloudflare con proxy activado, sin importar el hosting. Esto aporta:
  - Mitigación DDoS.
  - Reglas contra bots.
  - Una regla de límite de peticiones para `/api/users/login` y `/panel-veliza`.
  - El modo "Under Attack", que se activa con un clic durante un ataque.
- **Menos superficie de ataque:** la API GraphQL y su playground de Payload quedan desactivados, porque no se usan.

### 9.2 Aplicación (OWASP)

- **Headers de seguridad** en `next.config`:
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restrictiva
  - `frame-ancestors 'none'`, para que nadie incruste el sitio
- **CORS y CSRF** de Payload (`cors`, `csrf`) limitados al dominio del sitio.
- **Inyección y XSS:** Payload usa consultas parametrizadas. Los textos del panel son texto plano que React escapa automáticamente. Nunca se usa `dangerouslySetInnerHTML`.
- **Subidas:** solo imágenes, con un máximo de 10 MB (sección 5.2).
- **Login:** bloqueo tras 5 intentos fallidos (10 min), a lo que se suma el límite de peticiones de Cloudflare.
- **Secretos:** `PAYLOAD_SECRET`, `DATABASE_URL` y las credenciales S3 van solo en variables de entorno. Hay `.env` en `.gitignore` y un `.env.example` sin valores reales.

### 9.3 Datos y recuperación

- La base no es pública. Solo la app tiene su cadena de conexión.
- **Copia de seguridad semanal** automática de la base (`pg_dump`, programada con GitHub Actions y guardada en el almacenamiento S3, en una carpeta privada), además de la restauración a un punto en el tiempo del proveedor de PostgreSQL.
- **Dependabot** activado en GitHub. Se ejecuta `npm audit` antes de cada publicación.

### 9.4 Phishing y suplantación

- **Contra las dueñas:**
  - Contraseñas largas y únicas, guardadas en un gestor de contraseñas.
  - Entrar al panel solo desde el favorito.
  - `docs/guia-seguridad-duenas.md`, con los pasos para activar la verificación en dos pasos de **WhatsApp e Instagram** de Véliza y reconocer el robo de códigos por SMS. Si les roban el WhatsApp, el botón de pedidos llevaría a las clientas a un estafador.
- **Contra las clientas:**
  - Aviso visible con el número y las redes oficiales ("Solo recibimos pedidos por este número 💕").
  - El dominio propio da más confianza que un subdominio genérico.

### 9.5 Segunda fase

- 2FA en el panel. Payload no la trae de fábrica: habrá que evaluar un plugin o una implementación propia.

## 10. Pruebas

Se sigue TDD para la lógica.

- **Unitarias (Vitest):**
  - `whatsapp.ts`: con y sin color, caracteres especiales y tildes, número tomado de la configuración.
  - `price.ts`: `formatCOP(35000)` → `"$ 35.000"`.
  - `catalog.ts`: parseo y validación de `searchParams`, orden con los agotados al final.
- **E2E (Playwright), en móvil y escritorio:**
  - Inicio → catálogo → filtrar por categoría → ordenar por precio → abrir un producto → elegir un color → comprobar que el `href` de WhatsApp es el esperado.
  - Producto agotado: el botón está deshabilitado.
  - Una ruta inexistente muestra la 404.
  - `/panel-veliza` sin sesión solo muestra el formulario de ingreso.
  - Las respuestas incluyen los headers de seguridad.
- **Revisiones antes de publicar:** `npm run build` sin errores de tipos, `owasp` sobre la autenticación y el control de acceso, `appsec` sobre las dependencias, headers y CORS, y `security-review` sobre los cambios.

## 11. Despliegue (por definir)

El hosting se decide cuando se confirme el regalo. Todo el desarrollo se hace en local (`npm run dev`) con Neon gratis, así que no bloquea nada.

**Requisitos que debe cumplir el hosting** (para verificar el que regalen):

1. Ejecutar **Node.js 20.9 o superior** como proceso de servidor. Un hosting solo PHP/cPanel **no sirve**.
2. Al menos **1 GB de RAM** para ejecutar la app. El build puede hacerse en GitHub Actions si el servidor tiene menos recursos.
3. Acceso a **PostgreSQL**, sea propio o externo (Neon). Payload no soporta MySQL.
4. **HTTPS**, y la posibilidad de poner el dominio detrás de Cloudflare.
5. **Permitir uso comercial** en sus términos.

**Si no llega un hosting regalado**, las alternativas de bajo costo evaluadas el 2026-09-28 son:
- Cloudflare Workers + D1 + R2: $0, o $5 USD al mes si el panel supera el límite de CPU del plan gratis. Implica adaptar la base a D1 (SQLite) y el redimensionado de imágenes.
- Un servidor propio gratis (Oracle Cloud Always Free) con Cloudflare delante: $0, pero con mantenimiento del servidor a cargo del desarrollador.
- Se descartaron Vercel Hobby (no permite uso comercial) y Netlify gratis (un ataque de bots agota los créditos y pausa el sitio).

Las migraciones de la base se generan con Payload (`payload migrate:create`) y se aplican en cada despliegue.

**Pendientes con las dueñas (no bloquean el desarrollo):**

1. Confirmar los colores de cada producto.
2. Confirmar qué producto es la página 30 del catálogo (hay 30 páginas de producto y 29 productos en la lista), y el usuario de Instagram y TikTok.
3. Confirmar el dominio (regalado) y el hosting.
4. Los correos de las tres cuentas del panel.
