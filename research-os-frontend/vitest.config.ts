import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['smoke.test.ts'],
    globals: true,
  },
})
