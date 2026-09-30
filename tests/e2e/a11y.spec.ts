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
    // La aparición al hacer scroll es decorativa y deja el texto a media opacidad: axe la leería como bajo contraste.
    // Se emula «reducir movimiento», la preferencia que el sitio debe respetar.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(
      serious.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ') + ' [' + (n.any[0]?.message ?? '') + ']').join(' | ')}`),
    ).toEqual([])
  })
}
