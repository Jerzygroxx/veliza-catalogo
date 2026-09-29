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
