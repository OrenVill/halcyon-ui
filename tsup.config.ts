import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    display: 'src/display.ts',
    form: 'src/form.ts',
    hooks: 'src/hooks.ts',
    navigation: 'src/navigation.ts',
    overlay: 'src/overlay.ts',
    primitives: 'src/primitives.ts',
    structures: 'src/structures.ts',
    'structures/navbar': 'src/structures/Navbar/index.ts',
    'structures/sidebar': 'src/structures/Sidebar/index.ts',
    'structures/form-layout': 'src/structures/FormLayout/index.ts',
    'structures/app-shell': 'src/structures/AppShell/index.ts',
  },
  format: ['esm'],
  dts: true,
  // Runs first in `npm run build`, so it owns wiping dist. The CSS build
  // that follows must not clean.
  clean: true,
  treeshake: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
})
