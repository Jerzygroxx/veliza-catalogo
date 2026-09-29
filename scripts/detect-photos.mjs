// Herramienta de apoyo (Tarea 9): detecta los rectángulos de foto de cada página del catálogo
// sobre el fondo crema y los imprime como recortes { left, top, width, height }.
// Uso: node scripts/detect-photos.mjs [página…]
import path from 'node:path'
import sharp from 'sharp'

const assets = process.env.SEED_ASSETS_DIR || 'seed-assets'
const STEP = 4 // se analiza una versión reducida 4 veces
const MIN_AREA = 0.04 // una foto ocupa al menos el 4 % de la página
const INSET = 4 // píxeles que se recortan hacia dentro para no llevarse el borde

const pages = process.argv.slice(2).map(Number)
const list = pages.length ? pages : Array.from({ length: 30 }, (_, i) => i + 4)

for (const page of list) {
  const file = path.join(assets, 'pages', `page-${String(page).padStart(2, '0')}.png`)
  const meta = await sharp(file).metadata()
  const w = Math.floor(meta.width / STEP)
  const h = Math.floor(meta.height / STEP)
  const { data } = await sharp(file).resize(w, h, { kernel: 'nearest' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })

  // Fondo: el color más frecuente (crema) y el blanco de los márgenes.
  const counts = new Map()
  for (let i = 0; i < data.length; i += 3) {
    const key = `${data[i] >> 3},${data[i + 1] >> 3},${data[i + 2] >> 3}`
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  const [bgKey] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  const bg = bgKey.split(',').map((v) => Number(v) * 8 + 4)
  const isBg = (i) => {
    const d = (c) => Math.abs(data[i] - c[0]) + Math.abs(data[i + 1] - c[1]) + Math.abs(data[i + 2] - c[2])
    return d(bg) < 36 || d([255, 255, 255]) < 24
  }

  const seen = new Uint8Array(w * h)
  const boxes = []
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || isBg(start * 3)) continue
    let minX = w, minY = h, maxX = 0, maxY = 0, area = 0
    const stack = [start]
    seen[start] = 1
    while (stack.length) {
      const p = stack.pop()
      const x = p % w
      const y = (p - x) / w
      area++
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const q = ny * w + nx
        if (!seen[q] && !isBg(q * 3)) { seen[q] = 1; stack.push(q) }
      }
    }
    const boxArea = (maxX - minX + 1) * (maxY - minY + 1)
    if (boxArea / (w * h) >= MIN_AREA) boxes.push({ minX, minY, maxX, maxY })
  }

  // Une cajas que se solapan (una foto con zonas claras puede partirse en trozos).
  let merged = true
  while (merged) {
    merged = false
    outer: for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
      const A = boxes[a], B = boxes[b]
      if (A.minX <= B.maxX && B.minX <= A.maxX && A.minY <= B.maxY && B.minY <= A.maxY) {
        boxes[a] = { minX: Math.min(A.minX, B.minX), minY: Math.min(A.minY, B.minY), maxX: Math.max(A.maxX, B.maxX), maxY: Math.max(A.maxY, B.maxY) }
        boxes.splice(b, 1)
        merged = true
        break outer
      }
    }
  }

  const crops = boxes
    .sort((a, b) => a.minY - b.minY || a.minX - b.minX)
    .map((b) => {
      const left = Math.min(meta.width - 1, b.minX * STEP + INSET)
      const top = Math.min(meta.height - 1, b.minY * STEP + INSET)
      return {
        left,
        top,
        width: Math.min(meta.width - left, (b.maxX + 1) * STEP - INSET - left),
        height: Math.min(meta.height - top, (b.maxY + 1) * STEP - INSET - top),
      }
    })
  console.log(`${page}: ${JSON.stringify(crops)}`)
}
