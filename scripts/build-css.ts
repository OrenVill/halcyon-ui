/*
 * Builds one stylesheet per theme: theme tokens first, then structure,
 * minified through Lightning CSS. Consumers import exactly one of these.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'

const root = fileURLToPath(new URL('..', import.meta.url))
const structurePath = join(root, 'src/styles/base.css')
const themesDir = join(root, 'src/styles/themes')
const outDir = join(root, 'dist')

function buildTheme(
  themePath: string,
  structure: string,
): { name: string; bytes: number } {
  const name = basename(themePath, '.css')
  const source = `${readFileSync(themePath, 'utf8')}\n${structure}`

  const { code } = transform({
    filename: `${name}.css`,
    code: Buffer.from(source),
    minify: true,
    // Custom properties are never inlined, so no browser targets are needed
    // for correctness here; this only governs syntax lowering.
    targets: { chrome: 111 << 16, firefox: 113 << 16, safari: (16 << 16) | (4 << 8) },
  })

  const outPath = join(outDir, `${name}.css`)
  writeFileSync(outPath, code)
  return { name, bytes: code.length }
}

function main(): void {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const structure = readFileSync(structurePath, 'utf8')
  const themes = readdirSync(themesDir)
    .filter((file) => file.endsWith('.css'))
    .sort()

  if (themes.length === 0) {
    throw new Error(`No theme stylesheets found in ${themesDir}`)
  }

  for (const theme of themes) {
    const { name, bytes } = buildTheme(join(themesDir, theme), structure)
    console.log(`built dist/${name}.css  ${bytes} bytes`)
  }
}

main()
