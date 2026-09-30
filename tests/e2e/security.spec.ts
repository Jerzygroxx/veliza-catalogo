import { expect, test } from '@playwright/test'
import { E2E } from './fixtures'

test.describe('seguridad', () => {
  test('las respuestas incluyen las cabeceras de seguridad', async ({ request }) => {
    const res = await request.get('/')
    const h = res.headers()
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(h['x-content-type-options']).toBe('nosniff')
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(h['permissions-policy']).toContain('camera=()')
    expect(h['strict-transport-security']).toContain('max-age=')
  })

  test('el panel sin sesión solo muestra el ingreso y es noindex', async ({ page }) => {
    const res = await page.goto('/panel-veliza')
    expect(res?.headers()['x-robots-tag']).toContain('noindex')
    await expect(page).toHaveURL(/\/panel-veliza\/(login|create-first-user)/)
    await expect(page.getByText('Prendas')).toHaveCount(0)
  })

  test('la API de usuarias no se puede listar sin sesión', async ({ request }) => {
    const res = await request.get('/api/users')
    expect([401, 403]).toContain(res.status())
  })

  test('GraphQL está desactivado', async ({ request }) => {
    const res = await request.post('/api/graphql', { data: { query: '{ __typename }' } })
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })

  test('robots.txt bloquea el panel y el sitemap lista las prendas', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /panel-veliza')
    expect(robots).toContain('Sitemap:')
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain(`/producto/${E2E.colorProduct}`)
  })
})

// Este archivo consume el cupo de login del servidor de pruebas (límite en memoria, por instancia),
// así que va aparte y en serie. Usa un correo inexistente: nunca una cuenta real.
test.describe.serial('límite de peticiones', () => {
  test('el ingreso se limita tras demasiados intentos', async ({ request }) => {
    const codes: number[] = []
    for (let i = 0; i < 12; i++) {
      const res = await request.post('/api/users/login', {
        data: { email: 'nadie-e2e@example.com', password: 'incorrecta-incorrecta' },
      })
      codes.push(res.status())
    }
    expect(codes).toContain(429)
  })
})
