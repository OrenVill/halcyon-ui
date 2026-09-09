/*
 * Fails the build when a shipped file exceeds its gzipped budget.
 * Budgets come from the design spec, section 8.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'esbuild'

interface Budget {
  file: string
  /** Gzipped budget in kilobytes. */
  limitKb: number
  label: string
}

const THEMES = ['base', 'midnight', 'aurora', 'ember', 'forest', 'sandstone', 'mono', 'neon']

const BUDGETS: Budget[] = [
  { file: 'dist/index.js', limitKb: 45, label: 'full library' },
  // Generated, so a new theme cannot be added without also being budgeted.
  ...THEMES.map((theme) => ({
    file: `dist/${theme}.css`,
    limitKb: 10,
    label: `theme stylesheet: ${theme}`,
  })),
]

const root = fileURLToPath(new URL('..', import.meta.url))

function gzippedKb(path: string): number {
  return gzipSync(readFileSync(path), { level: 9 }).length / 1024
}

/**
 * The gzipped size of an app that imports only the named exports.
 *
 * dist/index.js is the whole library, so it cannot answer "what does one
 * Button cost". Bundling a synthetic entry against the built package measures
 * real tree-shaking of the artifact consumers actually install.
 */
async function gzippedKbOfImport(names: string[]): Promise<number> {
  const result = await build({
    stdin: {
      contents: `export { ${names.join(', ')} } from './dist/index.js'`,
      resolveDir: root,
      loader: 'js',
    },
    bundle: true,
    minify: true,
    format: 'esm',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    write: false,
    logLevel: 'silent',
  })

  const output = result.outputFiles[0]
  if (!output) throw new Error('esbuild produced no output')
  return gzipSync(output.contents, { level: 9 }).length / 1024
}

async function main(): Promise<void> {
  const failures: string[] = []

  for (const budget of BUDGETS) {
    const path = join(root, budget.file)

    if (!existsSync(path)) {
      failures.push(`${budget.file} is missing. Run \`npm run build\` first.`)
      continue
    }

    const actual = gzippedKb(path)
    const status = actual <= budget.limitKb ? 'ok  ' : 'OVER'
    console.log(
      `${status} ${budget.file.padEnd(20)} ${actual.toFixed(2)} KB / ${budget.limitKb} KB  (${budget.label})`,
    )

    if (actual > budget.limitKb) {
      failures.push(
        `${budget.label} is ${actual.toFixed(2)} KB gzipped, over its ${budget.limitKb} KB budget.`,
      )
    }
  }

  // Tree-shaking budget: importing one component must not drag in the rest.
  const buttonOnly = await gzippedKbOfImport(['Button'])
  const buttonOk = buttonOnly <= 2
  console.log(
    `${buttonOk ? 'ok  ' : 'OVER'} ${'Button import'.padEnd(20)} ${buttonOnly.toFixed(2)} KB / 2 KB  (single component)`,
  )
  if (!buttonOk) {
    failures.push(
      `a lone Button import is ${buttonOnly.toFixed(2)} KB gzipped, over its 2 KB budget.`,
    )
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} size budget failure(s):`)
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log('\nAll size budgets met.')
}

await main()
