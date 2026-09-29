import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/int/**/*.int.spec.ts'],
    // Las pruebas de integración comparten la base de datos: una a la vez.
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
})
