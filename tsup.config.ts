import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  // Runs first in `npm run build`, so it owns wiping dist. The CSS build
  // that follows must not clean.
  clean: true,
  treeshake: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
})
