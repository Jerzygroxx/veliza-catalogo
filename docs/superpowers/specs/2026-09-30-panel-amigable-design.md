# Panel de Véliza más amigable — diseño

Fecha: 2026-09-30. Complementa §5 (Panel de administración) del spec `2026-09-28-veliza-catalog-design.md`.

## 1. Propósito

Las dueñas (Isabella, Sara y Valerie) no son técnicas y usarán el panel sobre todo desde el celular. Hoy es el panel por defecto de Payload: funcional y en español, pero genérico. Queremos que cambiar un precio, marcar una prenda agotada o subir una foto se sienta hecho para ellas.

**Éxito:** una dueña hace esas tareas sin ayuda y sin miedo a dañar algo.

## 2. Alcance

Dentro:
1. **Marca:** colores, tipografía y logo de Véliza en todo el panel, incluido el login.
2. **Inicio guiado:** dashboard propio con saludo, botones grandes, contadores y ayuda corta.
3. **Lenguaje y celular:** nombres en lenguaje de ellas y áreas táctiles cómodas.

Fuera (por ahora): edición masiva en tabla, pantallas a medida, cambios al editor de productos, 2FA.

## 3. Marca

- Solo vías oficiales de Payload: hoja de estilos propia (`admin.importMap` + SCSS/CSS cargado por el layout de `(payload)`), y componentes propios `admin.components.graphics.Logo` e `Icon`. No se modifica código interno de Payload.
- Se sobrescriben las variables CSS de Payload (`--theme-*`, `--font-body`) con los tokens ya aprobados: fondo `#FAF9F6`, superficie `#F4F1EA`, crema `#E6DAC8`, texto `#3B2A20`, texto suave `#6B5646`; botón primario en cacao con texto blanco.
- Fuentes: Cormorant Garamond en títulos, Jost en cuerpo (las mismas del sitio, cargadas con `next/font`).
- Contraste mínimo 4.5:1 en texto normal. `#A48D78` solo para decoración.

## 4. Inicio guiado

Se reemplaza la vista de inicio (`admin.components.views.dashboard`) con un componente de servidor:

- Saludo con el nombre de la usuaria ("Hola, Isabella 💕"); si no tiene nombre, "Hola 💕".
- Tres botones grandes: **Agregar prenda** (`/panel-veliza/collections/products/create`), **Ver mis prendas** (`/panel-veliza/collections/products`), **Datos de la tienda** (`/panel-veliza/globals/site-settings`).
- Contadores: prendas publicadas y prendas agotadas (consulta con `payload.count`, con la sesión de la usuaria).
- Recuadro de ayuda con 3 pasos para las tareas más comunes: cambiar un precio, marcar agotada, cambiar la foto de portada.

Si la consulta de contadores falla, se ocultan los contadores y el resto sigue funcionando.

## 5. Lenguaje y celular

- Etiquetas: Productos → **Prendas**, Imágenes → **Fotos**, Categorías se mantiene, Usuarias se mantiene; el global pasa a **Datos de la tienda**.
- Grupos del menú lateral: "Catálogo" (Prendas, Categorías, Fotos) y "Tienda" (Datos de la tienda, Usuarias).
- Textos de ayuda (`admin.description`) revisados para evitar términos técnicos.
- Áreas táctiles de botones, enlaces del menú y campos de al menos 44 px en pantallas estrechas.

## 6. Riesgos

- Payload cambia sus clases CSS entre versiones. Mitigación: usar solo variables CSS documentadas y revisar el panel al actualizar (versión actual 3.90.2).
- Renombrar etiquetas no cambia los `slug`, así que los datos y las rutas de la API no se afectan.

## 7. Pruebas

- Unitarias/integración: los slugs no cambian; las etiquetas esperadas; el dashboard renderiza sin sesión rota.
- Manual en celular (ancho 375 px): inicio, editar precio, marcar agotada, subir foto.
- Accesibilidad: contraste y foco visible revisados en login e inicio.
