/*
 * Fails the build when a component stylesheet hard-codes a color.
 *
 * A literal color is a color no theme can override, which quietly breaks the
 * promise that one theme import repaints everything. Catching this by eye does
 * not scale to 34 components.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const componentsDir = join(root, 'src/components')

/** Hex, rgb()/rgba(), hsl()/hsla(), and the bare keywords worth banning. */
const LITERAL_COLOR =
  /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\b(?:black|white|red|blue|green|yellow|orange|purple|gray|grey)\b/

/**
 * Only the value side of a declaration can hold a color. Scanning whole lines
 * matches property names too: `white-space: nowrap` is not a color, and a
 * selector like `.hal-x--red` is a class name, not a paint instruction.
 */
function declarationValues(line: string): string[] {
  return [...line.matchAll(/:\s*([^;{}]+)/g)].map((match) => match[1] ?? '')
}

function main(): void {
  if (!existsSync(componentsDir)) {
    console.log('No components yet; nothing to check.')
    return
  }

  const files = readdirSync(componentsDir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.css'))
    .sort()

  const failures: string[] = []

  for (const file of files) {
    const path = join(componentsDir, file)
    const lines = readFileSync(path, 'utf8').split('\n')

    lines.forEach((line, index) => {
      // Comments may name a color while explaining a decision.
      const code = line.replace(/\/\*.*?\*\//g, '')
      for (const value of declarationValues(code)) {
        const match = LITERAL_COLOR.exec(value)
        if (match) {
          failures.push(
            `src/components/${file}:${index + 1} literal color "${match[0]}" — use a token`,
          )
          break
        }
      }
    })
  }

  console.log(`Scanned ${files.length} component stylesheet(s).`)

  if (failures.length > 0) {
    console.error(`\n${failures.length} literal color(s) found:`)
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log('No literal colors: every component is themeable.')
}

main()
