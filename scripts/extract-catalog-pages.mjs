import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pdf } from 'pdf-to-img'

const assets = process.env.SEED_ASSETS_DIR || 'seed-assets'
const outDir = path.join(assets, 'pages')
await mkdir(outDir, { recursive: true })

// Cada página trae el collage como una sola imagen de ~900 px de ancho sobre 810 pt.
// Escala 1.2 (972 px) conserva todo su detalle; más escala solo inventa píxeles.
const document = await pdf(path.join(assets, 'catalogo.pdf'), { scale: 1.2 })
let page = 1
for await (const image of document) {
  await writeFile(path.join(outDir, `page-${String(page).padStart(2, '0')}.png`), image)
  page++
}
console.log(`Listo: ${page - 1} páginas en ${outDir}`)
