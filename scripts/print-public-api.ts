/*
 * Prints halcyon-ui entry points from package.json exports so consumers know
 * what they can import without opening the repo.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const pkg = JSON.parse(readFileSync(`${root}/package.json`, 'utf8')) as {
  name: string
  exports: Record<string, unknown>
}

const exportsMap = pkg.exports ?? {}
const keys = Object.keys(exportsMap).sort()

console.log(`${pkg.name} public entry points:\n`)
for (const key of keys) {
  const label = key === '.' ? pkg.name : `${pkg.name}${key}`
  console.log(`  ${label}`)
}

console.log('\nCategory slices: form, navigation, overlay, display, primitives, hooks, structures')
console.log('Structure subpaths: structures/navbar, structures/sidebar, structures/form-layout, structures/app-shell')
console.log('Themes: base, midnight, aurora, ember, forest, sandstone, mono, neon (CSS files)')
console.log('\nRun `npm run gallery` in the repo to preview components visually.')
