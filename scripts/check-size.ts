/*
 * Fails the build when a shipped file exceeds its gzipped budget.
 * Budgets come from the design spec, section 8.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

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

function main(): void {
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

  if (failures.length > 0) {
    console.error(`\n${failures.length} size budget failure(s):`)
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log('\nAll size budgets met.')
}

main()
