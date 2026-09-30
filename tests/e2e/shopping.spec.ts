import { expect, test } from '@playwright/test'
import { E2E } from './fixtures'

test.describe('compra', () => {
  test('inicio → catálogo → filtro y orden → prenda → color → WhatsApp', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Ver catálogo' }).click()
    await expect(page).toHaveURL(/\/catalogo$/)

    // Filtrar por la categoría de prueba: quedan 3 prendas.
    await page.getByRole('navigation', { name: 'Categorías' }).getByRole('link', { name: 'Prueba E2E' }).click()
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
