# halcyon-ui Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship all eight themes with light and dark palettes that clear WCAG AA by measurement, wired into the package's export map and enforced in CI.

**Architecture:** Each theme is one file of nothing but custom-property values, structurally identical to `src/styles/themes/base.css`. A contrast script parses those files, rebuilds each palette, and computes real contrast ratios; CI fails when any pair falls below AA. The CSS build already turns every theme file into `dist/<theme>.css` with no change.

**Tech Stack:** CSS custom properties, TypeScript, Lightning CSS, GitHub Actions.

**Source spec:** `docs/superpowers/specs/2026-09-09-halcyon-ui-design.md`, sections 3 and 8.

**Depends on:** the foundation plan, complete and merged.

---

## A note on where the palette values come from

This plan gives complete code for everything mechanical: the contrast script, the
export map, the budgets, the CI step. It deliberately does **not** hand you 280
lines of pre-written hex values for the seven themes.

That is not a placeholder. A palette that has not been measured is worthless, and
a palette copied from a plan document is measured only once, by whoever wrote the
plan. The contrast script is the specification for the color work: each theme is
done when the script says every pair clears 4.5:1 in both light and dark. Task 1
builds that script first, so every theme task after it has an objective gate to
work against rather than an opinion to match.

Each theme task below carries a design brief that fixes the theme's character,
and hard structural rules that make the files interchangeable.

---

### Task 1: The contrast checker

**Files:**
- Create: `scripts/check-contrast.ts`

This must land before any theme, because it is how every theme is judged.

It does two jobs. It measures contrast, and it verifies that a theme's two dark
blocks are identical. The second matters because the dark palette is written
twice by design, and an author who edits one and forgets the other produces a
theme that behaves differently depending on whether dark was chosen explicitly
or inherited from the system.

- [ ] **Step 1: Write the script**

Create `scripts/check-contrast.ts`:

```ts
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

function parseHex(value: string, token: string, themeName: string): [number, number, number] {
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

function contrastRatio(a: string, b: string, tokenA: string, tokenB: string, theme: string): number {
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
      failures.push(`${theme} ${mode}: ${pair.label} is missing ${fg === undefined ? pair.fg : pair.bg}`)
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
```

- [ ] **Step 2: Register the script**

Add to `package.json` scripts, after `check:size`:

```json
    "check:contrast": "tsx scripts/check-contrast.ts"
```

- [ ] **Step 3: Run it against the one theme that exists**

Run: `npm run check:contrast`
Expected: a `base` section with seven `ok` lines for light and seven for dark,
ending in `All 1 theme(s) clear WCAG AA.` and exit 0.

If `base` fails, the base palette is wrong and must be corrected before any other
theme is written, since every theme is measured the same way.

- [ ] **Step 4: Prove the checker can fail**

A checker that cannot fail is not a checker. Temporarily break the base theme and
confirm both failure modes fire.

Run:
```bash
sed -i 's/--hal-fg-muted: #5b6270;/--hal-fg-muted: #b9bec7;/' src/styles/themes/base.css
npm run check:contrast; echo "exit: $?"
```
Expected: `FAIL` lines for muted text and `exit: 1`.

Then test the drift check:
```bash
git checkout -- src/styles/themes/base.css
sed -i "0,/--hal-accent: #60a5fa;/s//--hal-accent: #ff0000;/" src/styles/themes/base.css
npm run check:contrast; echo "exit: $?"
```
Expected: a failure reading `dark blocks disagree on --hal-accent`, and `exit: 1`.

Restore: `git checkout -- src/styles/themes/base.css`

- [ ] **Step 5: Commit**

```bash
git add scripts/check-contrast.ts package.json
git commit -m "feat: verify theme contrast against WCAG AA"
```

---

### Tasks 2 through 8: the seven themes

These seven tasks are independent. Each writes exactly one file and nothing else,
so they can run concurrently.

**Rules that apply to every theme, without exception:**

1. Copy `src/styles/themes/base.css` and change only values. Do not add, remove,
   or rename a token. All 45 must be present and spelled identically.
2. Change only the color and shadow tokens. Spacing, radius, type, and motion are
   structural and identical across themes. The two font stacks stay byte-identical
   to `base` unless the brief says otherwise.
3. The dark palette appears twice, once in the `prefers-color-scheme` block and
   once in the `[data-mode='dark']` block, and the two must be **identical**. The
   checker enforces this.
4. Every token compared for contrast must be a plain 6-digit hex color:
   `--hal-bg`, `--hal-bg-subtle`, `--hal-bg-raised`, `--hal-fg`, `--hal-fg-muted`,
   `--hal-accent`, `--hal-accent-fg`, `--hal-danger`, `--hal-danger-fg`.
   `--hal-overlay` stays an `rgb()` with alpha.
5. The file opens with a comment naming the theme and describing its character in
   one or two lines, matching the shape of the comment in `base.css`.

**The acceptance test is identical for every theme.** Substitute the theme name:

```bash
# structure: all 45 tokens present, none invented
diff <(grep -o -- '--hal-[a-z0-9-]*' src/styles/themes/base.css | sort -u) \
     <(grep -o -- '--hal-[a-z0-9-]*' src/styles/themes/<name>.css | sort -u)
# expected: no output. Any output means a token was added, dropped, or misspelled.

npm run check:contrast
# expected: a <name> section, all ok, exit 0

npx tsx scripts/build-css.ts
# expected: builds dist/<name>.css alongside the others
```

Iterate on the values until the checker passes. Darkening a foreground or
lightening a background by a few percent is usually enough; if a hue cannot reach
4.5:1 while staying recognizable, change the pairing rather than abandoning the
hue. For text on a saturated accent, `--hal-accent-fg` is the free variable:
near-white over a deep accent, near-black over a bright one.

- [ ] **Task 2 — `midnight`.** The flagship. Deep blue-black surfaces even in
  light mode's shadows, cool indigo accent, crisp and technical. Light mode reads
  as cool white with blue-grey borders, not neutral grey.

- [ ] **Task 3 — `aurora`.** Cool and luminous. Teal and cyan through green, with
  a violet secondary showing in the info and focus tokens. Dark mode should feel
  like light emitted rather than reflected.

- [ ] **Task 4 — `ember`.** Warm and dark-leaning. Amber and burnt orange accent
  over charcoal that carries a red undertone. The danger token has to stay
  clearly distinct from the accent, which is the hard part of this theme.

- [ ] **Task 5 — `forest`.** Deep greens with warm bark neutrals. Muted and calm,
  the lowest-saturation accent of the eight. Light mode is off-white with a green
  cast, never pure white.

- [ ] **Task 6 — `sandstone`.** Warm neutrals: sand, clay, and terracotta accent.
  Everything shifted toward yellow-red. Light mode is the point of this theme;
  dark mode is a warm brown-black, not a cool one.

- [ ] **Task 7 — `mono`.** Pure greyscale. Zero saturation everywhere except the
  three status colors, which stay chromatic because a red that is grey is not a
  danger signal. The accent is near-black in light mode and near-white in dark.

- [ ] **Task 8 — `neon`.** High chroma on near-black. Magenta accent, electric
  cyan info. This theme will fight the contrast checker hardest: saturated colors
  at full brightness rarely clear 4.5:1 against white, so the light mode must
  deepen the accent considerably while the dark mode lets it glow.

- [ ] **Commit, one per theme**

```bash
git add src/styles/themes/<name>.css
git commit -m "feat: add <name> theme"
```

---

### Task 9: Wire the themes into the package

**Files:**
- Modify: `package.json`
- Modify: `scripts/check-size.ts`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add every theme to the export map**

In `package.json`, replace the `exports` block with:

```json
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./base": "./dist/base.css",
    "./midnight": "./dist/midnight.css",
    "./aurora": "./dist/aurora.css",
    "./ember": "./dist/ember.css",
    "./forest": "./dist/forest.css",
    "./sandstone": "./dist/sandstone.css",
    "./mono": "./dist/mono.css",
    "./neon": "./dist/neon.css"
  },
```

- [ ] **Step 2: Budget every theme stylesheet**

In `scripts/check-size.ts`, replace the `BUDGETS` constant with a generated list,
so a new theme cannot be added without also being budgeted:

```ts
const THEMES = ['base', 'midnight', 'aurora', 'ember', 'forest', 'sandstone', 'mono', 'neon']

const BUDGETS: Budget[] = [
  { file: 'dist/index.js', limitKb: 45, label: 'full library' },
  ...THEMES.map((theme) => ({
    file: `dist/${theme}.css`,
    limitKb: 10,
    label: `theme stylesheet: ${theme}`,
  })),
]
```

- [ ] **Step 3: Add contrast to CI**

In `.github/workflows/ci.yml`, add a step after `Build`:

```yaml
      - name: Contrast
        run: npm run check:contrast
```

- [ ] **Step 4: Verify the whole chain**

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run check:size && npm run check:contrast
```

Expected: all six pass. The size step now prints nine lines, one per theme plus
the library.

- [ ] **Step 5: Verify every export resolves to a real file**

```bash
node -e "
const pkg = require('./package.json');
const fs = require('fs');
let bad = 0;
for (const [key, value] of Object.entries(pkg.exports)) {
  if (typeof value !== 'string') continue;
  if (!fs.existsSync(value.replace('./', ''))) { console.error('MISSING', key, value); bad++; }
}
console.log(bad === 0 ? 'every theme subpath resolves' : bad + ' broken subpath(s)');
process.exit(bad === 0 ? 0 : 1);
"
```
Expected: `every theme subpath resolves`, exit 0.

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/check-size.ts .github/workflows/ci.yml
git commit -m "feat: export all eight themes and enforce contrast in CI"
```

---

## Done when

- Eight files sit in `src/styles/themes/`, each with all 45 tokens and matching dark blocks.
- `npm run check:contrast` reports `All 8 theme(s) clear WCAG AA.`
- `npm run build` writes eight stylesheets to `dist/`, each under its 10 KB gzipped budget.
- Every theme subpath in `exports` resolves to a file that exists.
- CI runs typecheck, lint, test, build, size, and contrast, and is green.

## Execution record

Executed 2026-09-09. All nine tasks complete. The contrast checker landed first,
then the seven themes were authored concurrently by seven agents, then the
packaging task. Every theme was verified independently of its author: token
parity against base, byte-identical structural tokens, and a fresh contrast run.

Measured result, tightest pair per theme:

| Theme | Lowest ratio | Where |
| --- | --- | --- |
| base | 4.83:1 | text on danger, light |
| midnight | 5.67:1 | text on danger, light |
| aurora | 6.09:1 | text on accent, light |
| ember | 6.02:1 | muted text on subtle, light |
| forest | 6.40:1 | muted text on subtle, light |
| sandstone | 5.58:1 | muted text on subtle, light |
| mono | 6.27:1 | muted text on subtle, light |
| neon | 5.61:1 | text on danger, light |

Light mode is the binding constraint in every theme. All eight stylesheets are
under 1 KB gzipped against a 10 KB budget.

Two changes to the plan were made during the run:

- The contrast checker gained an optional theme-name argument. Seven agents
  working in one directory would otherwise each see the others' half-finished
  files fail the shared run.
- Release Please chose 1.0.0 for the first release rather than 0.1.0. From a
  manifest at 0.0.0 that is its documented behavior, and `bump-minor-pre-major`
  does not change it: that option governs how breaking changes behave once the
  version is already below 1.0.0. A `Release-As: 0.1.0` commit footer overrides
  the version for one release.

## What this plan leaves out

| Deferred | Lands in |
| --- | --- |
| Component structure rules in `base.css` | Every component plan |
| The 2 KB single-`Button` budget | Form-components plan |
| A worked custom-theme guide | Documentation plan |
