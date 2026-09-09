/*
 * Verifies every theme's light and dark palettes against WCAG AA, and verifies
 * that each theme's two dark blocks agree.
 *
 * The dark palette is declared twice on purpose: a media query cannot express
 * "explicitly chosen dark while the system prefers light", and an attribute
 * selector cannot honor the system preference. Two copies means they can drift,
 * so drift is what this script checks first.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** WCAG AA for normal-size text. */
const AA_NORMAL = 4.5

type Tokens = Record<string, string>

interface Pair {
  fg: string
  bg: string
  label: string
}

/** Text-on-surface pairs the spec requires to clear AA. */
const PAIRS: Pair[] = [
  { fg: '--hal-fg', bg: '--hal-bg', label: 'body text on page' },
  { fg: '--hal-fg', bg: '--hal-bg-subtle', label: 'body text on subtle' },
  { fg: '--hal-fg', bg: '--hal-bg-raised', label: 'body text on raised' },
  { fg: '--hal-fg-muted', bg: '--hal-bg', label: 'muted text on page' },
  { fg: '--hal-fg-muted', bg: '--hal-bg-subtle', label: 'muted text on subtle' },
  { fg: '--hal-accent-fg', bg: '--hal-accent', label: 'text on accent' },
  { fg: '--hal-danger-fg', bg: '--hal-danger', label: 'text on danger' },
]

const LIGHT_SELECTOR = /:root\s*\{/
const DARK_MEDIA_SELECTOR = /:root:not\(\[data-mode=['"]light['"]\]\)\s*\{/
const DARK_ATTR_SELECTOR = /:root\[data-mode=['"]dark['"]\]\s*\{/

/** Reads the declarations of the first block matching `selector`. */
function extractBlock(css: string, selector: RegExp, themeName: string): Tokens {
  const match = selector.exec(css)
  if (!match) {
    throw new Error(`${themeName}: no block matching ${selector} found`)
  }

  let index = css.indexOf('{', match.index)
  const start = index + 1
  let depth = 0

  for (; index < css.length; index++) {
    if (css[index] === '{') depth++
    else if (css[index] === '}') {
      depth--
      if (depth === 0) break
    }
  }

  const body = css.slice(start, index)
  const tokens: Tokens = {}
  for (const declaration of body.matchAll(/(--hal-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens[declaration[1]!] = declaration[2]!.trim().replace(/\s+/g, ' ')
  }
  return tokens
}

function parseHex(
  value: string,
  token: string,
  themeName: string,
): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(value.trim())
  if (!match) {
    throw new Error(
      `${themeName}: ${token} is "${value}", which is not a 6-digit hex color. ` +
        `Tokens compared for contrast must be plain hex so they can be measured.`,
    )
  }
  const n = Number.parseInt(match[1]!, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** sRGB relative luminance, per the WCAG definition. */
function luminance([r, g, b]: [number, number, number]): number {
  const linear = (value: number): number => {
    const c = value / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function contrastRatio(
  a: string,
  b: string,
  tokenA: string,
  tokenB: string,
  theme: string,
): number {
  const la = luminance(parseHex(a, tokenA, theme))
  const lb = luminance(parseHex(b, tokenB, theme))
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Dark blocks are partial: they restate colors over the light base. */
function resolve(light: Tokens, overrides: Tokens): Tokens {
  return { ...light, ...overrides }
}

function compareDarkBlocks(media: Tokens, attr: Tokens, theme: string): string[] {
  const failures: string[] = []
  const keys = new Set([...Object.keys(media), ...Object.keys(attr)])

  for (const key of [...keys].sort()) {
    const inMedia = media[key]
    const inAttr = attr[key]
    if (inMedia !== inAttr) {
      failures.push(
        `${theme}: dark blocks disagree on ${key}: ` +
          `media query says ${inMedia ?? '(absent)'}, ` +
          `data-mode says ${inAttr ?? '(absent)'}`,
      )
    }
  }
  return failures
}

function checkPalette(tokens: Tokens, theme: string, mode: string): string[] {
  const failures: string[] = []

  for (const pair of PAIRS) {
    const fg = tokens[pair.fg]
    const bg = tokens[pair.bg]

    if (fg === undefined || bg === undefined) {
      failures.push(
        `${theme} ${mode}: ${pair.label} is missing ${fg === undefined ? pair.fg : pair.bg}`,
      )
      continue
    }

    const ratio = contrastRatio(fg, bg, pair.fg, pair.bg, theme)
    const ok = ratio >= AA_NORMAL
    console.log(
      `  ${ok ? 'ok  ' : 'FAIL'} ${mode.padEnd(5)} ${pair.label.padEnd(24)} ${ratio.toFixed(2)}:1`,
    )
    if (!ok) {
      failures.push(
        `${theme} ${mode}: ${pair.label} is ${ratio.toFixed(2)}:1, below the ${AA_NORMAL}:1 minimum ` +
          `(${pair.fg} ${fg} on ${pair.bg} ${bg})`,
      )
    }
  }
  return failures
}

function main(): void {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const themesDir = join(root, 'src/styles/themes')
  const themes = readdirSync(themesDir)
    .filter((file) => file.endsWith('.css'))
    .sort()

  if (themes.length === 0) {
    throw new Error(`No theme stylesheets found in ${themesDir}`)
  }

  const failures: string[] = []

  for (const file of themes) {
    const theme = basename(file, '.css')
    const css = readFileSync(join(themesDir, file), 'utf8')
    console.log(`\n${theme}`)

    const light = extractBlock(css, LIGHT_SELECTOR, theme)
    const darkMedia = extractBlock(css, DARK_MEDIA_SELECTOR, theme)
    const darkAttr = extractBlock(css, DARK_ATTR_SELECTOR, theme)

    failures.push(...compareDarkBlocks(darkMedia, darkAttr, theme))
    failures.push(...checkPalette(light, theme, 'light'))
    failures.push(...checkPalette(resolve(light, darkAttr), theme, 'dark'))
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} contrast failure(s):`)
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log(`\nAll ${themes.length} theme(s) clear WCAG AA.`)
}

main()
