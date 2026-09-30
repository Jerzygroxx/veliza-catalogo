import { expect, test } from '@playwright/test'

test('la tienda carga y muestra el encabezado', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Véliza, inicio' })).toBeVisible()
  await expect(page).toHaveTitle(/Véliza/)
})
