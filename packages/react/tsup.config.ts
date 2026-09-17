import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  banner: {
    js: "'use client';"
  },
  external: ['react', 'viem', '@flashkit/core']
})
