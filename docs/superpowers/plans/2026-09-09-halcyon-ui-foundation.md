# halcyon-ui Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the halcyon-ui package end to end — build, theming, color mode, testing, CI, release — proven by one real component (Button) shipping through the whole pipeline.

**Architecture:** Themes are authored as TypeScript token objects, not hand-written CSS. A build script emits each theme's CSS by writing its light and dark tokens into the three-block pattern that makes both `prefers-color-scheme` and an explicit `data-mode` override resolve correctly, then appends the shared structural stylesheet bundled by Lightning CSS. Components never import CSS; all component CSS is `@import`ed by one structure file. This keeps a single stylesheet per theme, makes the contrast checker read the same source of truth as the build, and lets tsup emit unbundled ESM modules that tree-shake cleanly.

**Tech Stack:** TypeScript strict, React 18/19 peer, tsup (ESM, unbundled) + tsc for declarations, Lightning CSS, Vitest + Testing Library + jsdom + vitest-axe, ESLint flat config + Prettier, GitHub Actions, Changesets.

**Plan roadmap.** This is plan 1 of 7:

1. **Foundation** (this plan) — scaffold, tokens, base + midnight themes, color mode, Button, CI, release
2. **Form primitives** — Input, Textarea, Select, Checkbox, Radio, Switch, Slider, NumberInput, IconButton
3. **Display** — Card, Badge, Avatar, Alert, Tag, Progress, Spinner, Skeleton, Table
4. **Overlays** — positioning helper, focus trap, Modal, Drawer, Tooltip, Popover, DropdownMenu, Toast
5. **Navigation** — Tabs, Accordion, Pagination, Breadcrumb, Stepper, Wizard
6. **Complex form** — Combobox, DatePicker, FileUpload
7. **Themes and release** — remaining six themes, README, first publish

---

## File Structure

| File | Responsibility |
| --- | --- |
| `package.json` | Package identity, exports map, scripts, peer and dev deps |
| `tsconfig.json` | Strict TypeScript, declaration emit config |
| `tsup.config.ts` | Unbundled ESM output, React external |
| `vitest.config.ts` | jsdom environment, setup file |
| `vitest.setup.ts` | Testing Library cleanup, axe matcher |
| `eslint.config.js` | Flat config for TS and React Hooks |
| `src/index.ts` | The only public barrel |
| `src/internal/cx.ts` | Class name joiner |
| `src/styles/tokens.ts` | Token types and the camel-to-CSS-variable naming rule |
| `src/styles/themes/base.ts` | Neutral theme, the retheming starting point |
| `src/styles/themes/midnight.ts` | First opinionated theme |
| `src/styles/themes/index.ts` | Theme registry consumed by build and contrast scripts |
| `src/styles/structure.css` | `@import`s every component stylesheet |
| `src/hooks/useColorMode.ts` | Color mode state, persistence, system subscription |
| `src/components/ColorModeScript/ColorModeScript.tsx` | Pre-paint mode script |
| `src/components/Button/Button.tsx` | First component, proves the pattern |
| `src/components/Button/Button.css` | Button structure, all colors via tokens |
| `scripts/build-css.ts` | Emits `dist/<theme>.css` per theme |
| `scripts/check-contrast.ts` | Fails CI on WCAG AA violations |
| `scripts/check-size.ts` | Fails CI on size budget violations |
| `.github/workflows/ci.yml` | Typecheck, lint, test, build, size, contrast |
| `.github/workflows/release.yml` | Changesets release with npm provenance |

---

## Task 1: Repository scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `eslint.config.js`, `.prettierrc`, `LICENSE`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "halcyon-ui",
  "version": "0.0.0",
  "description": "Lightweight, themeable React component library. 34 components, 8 themes with light and dark, zero runtime dependencies.",
  "license": "MIT",
  "author": "OrenVill",
  "repository": { "type": "git", "url": "git+https://github.com/OrenVill/halcyon-ui.git" },
  "homepage": "https://github.com/OrenVill/halcyon-ui#readme",
  "keywords": ["react", "components", "ui", "component-library", "themes", "dark-mode", "css-variables", "typescript"],
  "type": "module",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./base": "./dist/base.css",
    "./midnight": "./dist/midnight.css",
    "./package.json": "./package.json"
  },
  "scripts": {
    "build": "npm run build:js && npm run build:types && npm run build:css",
    "build:js": "tsup",
    "build:types": "tsc -p tsconfig.build.json",
    "build:css": "tsx scripts/build-css.ts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "check:contrast": "tsx scripts/check-contrast.ts",
    "check:size": "tsx scripts/check-size.ts",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "@eslint/js": "^9.17.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "esbuild": "^0.24.0",
    "eslint": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "jsdom": "^25.0.1",
    "lightningcss": "^1.28.0",
    "prettier": "^3.4.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tsup": "^8.3.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.18.0",
    "vitest": "^2.1.8",
    "vitest-axe": "^0.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noEmit": true
  },
  "include": ["src", "scripts", "vitest.setup.ts", "*.config.ts"]
}
```

- [ ] **Step 3: Create `tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"]
}
```

- [ ] **Step 4: Create `tsup.config.ts`**

Unbundled output preserves the module graph, which is what lets a consumer's bundler drop the 33 components they did not import.

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/*.test.tsx'],
  format: ['esm'],
  bundle: false,
  dts: false,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  outDir: 'dist',
})
```

- [ ] **Step 5: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
})
```

- [ ] **Step 6: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-mode')
  localStorage.clear()
})
```

- [ ] **Step 7: Create `eslint.config.js`**

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
)
```

- [ ] **Step 8: Create `.prettierrc`**

```json
{ "semi": false, "singleQuote": true, "printWidth": 100, "trailingComma": "all" }
```

- [ ] **Step 9: Create `LICENSE`**

```
MIT License

Copyright (c) 2026 OrenVill

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 10: Install and verify**

Run: `npm install && npx tsc --noEmit`
Expected: install completes, `tsc` exits 0 with no output. There are no source files yet, which is fine.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold package, build, lint and test tooling"
```

---

## Task 2: The `cx` class name helper

**Files:**
- Create: `src/internal/cx.ts`
- Test: `src/internal/cx.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('joins truthy class names with a single space', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c')
  })

  it('drops false, null and undefined', () => {
    expect(cx('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('returns undefined when nothing survives, so no empty class attribute is rendered', () => {
    expect(cx(false, undefined)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/internal/cx.test.ts`
Expected: FAIL, "Failed to resolve import ./cx"

- [ ] **Step 3: Write the implementation**

```ts
export type ClassValue = string | false | null | undefined

export function cx(...parts: ClassValue[]): string | undefined {
  let out = ''
  for (const part of parts) {
    if (!part) continue
    out = out ? `${out} ${part}` : part
  }
  return out || undefined
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/internal/cx.test.ts`
Expected: PASS, 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/internal/cx.ts src/internal/cx.test.ts
git commit -m "feat: add cx class name helper"
```

---

## Task 3: Token contract and variable naming

**Files:**
- Create: `src/styles/tokens.ts`
- Test: `src/styles/tokens.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { cssVarName } from './tokens'

describe('cssVarName', () => {
  it('converts a camelCase token key to a prefixed CSS variable', () => {
    expect(cssVarName('bgSubtle')).toBe('--hal-bg-subtle')
  })

  it('separates a trailing number into its own segment', () => {
    expect(cssVarName('space1')).toBe('--hal-space-1')
  })

  it('handles a single word', () => {
    expect(cssVarName('accent')).toBe('--hal-accent')
  })

  it('handles a key with both a word break and a number', () => {
    expect(cssVarName('textXs')).toBe('--hal-text-xs')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/styles/tokens.test.ts`
Expected: FAIL, "Failed to resolve import ./tokens"

- [ ] **Step 3: Write the implementation**

```ts
/** Tokens that differ between light and dark. */
export interface ModeTokens {
  bg: string
  bgSubtle: string
  bgRaised: string
  fg: string
  fgMuted: string
  border: string
  borderStrong: string
  accent: string
  accentFg: string
  accentHover: string
  success: string
  successFg: string
  warning: string
  warningFg: string
  danger: string
  dangerFg: string
  info: string
  infoFg: string
  overlay: string
  focusRing: string
  shadowSm: string
  shadow: string
  shadowLg: string
}

/** Tokens that are identical in both modes. */
export interface ScaleTokens {
  space1: string
  space2: string
  space3: string
  space4: string
  space5: string
  space6: string
  space7: string
  space8: string
  radiusSm: string
  radius: string
  radiusLg: string
  radiusFull: string
  fontSans: string
  fontMono: string
  textXs: string
  textSm: string
  textMd: string
  textLg: string
  textXl: string
  weightNormal: string
  weightMedium: string
  weightBold: string
  leading: string
  duration: string
  ease: string
}

export interface Theme {
  name: string
  light: ModeTokens
  dark: ModeTokens
  scale: ScaleTokens
}

/** `bgSubtle` becomes `--hal-bg-subtle`, `space1` becomes `--hal-space-1`. */
export function cssVarName(key: string): string {
  const kebab = key
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .toLowerCase()
  return `--hal-${kebab}`
}

/** The color pairs every theme must clear WCAG AA on, in both modes. */
export const CONTRAST_PAIRS: ReadonlyArray<{ fg: keyof ModeTokens; bg: keyof ModeTokens }> = [
  { fg: 'fg', bg: 'bg' },
  { fg: 'fg', bg: 'bgSubtle' },
  { fg: 'fg', bg: 'bgRaised' },
  { fg: 'fgMuted', bg: 'bg' },
  { fg: 'accentFg', bg: 'accent' },
  { fg: 'dangerFg', bg: 'danger' },
  { fg: 'successFg', bg: 'success' },
  { fg: 'warningFg', bg: 'warning' },
  { fg: 'infoFg', bg: 'info' },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/styles/tokens.test.ts`
Expected: PASS, 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.ts src/styles/tokens.test.ts
git commit -m "feat: define token contract and CSS variable naming"
```

---

## Task 4: The base and midnight themes

**Files:**
- Create: `src/styles/themes/base.ts`, `src/styles/themes/midnight.ts`, `src/styles/themes/index.ts`
- Test: `src/styles/themes/themes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { themes } from './index'
import type { ModeTokens, ScaleTokens } from '../tokens'

const MODE_KEYS: Array<keyof ModeTokens> = [
  'bg', 'bgSubtle', 'bgRaised', 'fg', 'fgMuted', 'border', 'borderStrong',
  'accent', 'accentFg', 'accentHover', 'success', 'successFg', 'warning',
  'warningFg', 'danger', 'dangerFg', 'info', 'infoFg', 'overlay', 'focusRing',
  'shadowSm', 'shadow', 'shadowLg',
]

const SCALE_KEYS: Array<keyof ScaleTokens> = [
  'space1', 'space2', 'space3', 'space4', 'space5', 'space6', 'space7', 'space8',
  'radiusSm', 'radius', 'radiusLg', 'radiusFull', 'fontSans', 'fontMono',
  'textXs', 'textSm', 'textMd', 'textLg', 'textXl',
  'weightNormal', 'weightMedium', 'weightBold', 'leading', 'duration', 'ease',
]

describe('themes', () => {
  it('registers base first, because it is the documented starting point', () => {
    expect(themes[0]?.name).toBe('base')
  })

  it('gives every theme a unique name', () => {
    const names = themes.map((t) => t.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it.each(['base', 'midnight'])('defines every token in both modes for %s', (name) => {
    const theme = themes.find((t) => t.name === name)
    expect(theme).toBeDefined()
    for (const key of MODE_KEYS) {
      expect(theme!.light[key], `${name}.light.${key}`).toBeTruthy()
      expect(theme!.dark[key], `${name}.dark.${key}`).toBeTruthy()
    }
    for (const key of SCALE_KEYS) {
      expect(theme!.scale[key], `${name}.scale.${key}`).toBeTruthy()
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/styles/themes/themes.test.ts`
Expected: FAIL, "Failed to resolve import ./index"

- [ ] **Step 3: Create the shared scale in `src/styles/themes/base.ts`**

Every theme reuses this scale object unless it deliberately changes it. Colors are plain greys with a restrained blue accent, so that `base` reads as unstyled-but-tidy and is easy to override.

```ts
import type { ScaleTokens, Theme } from '../tokens'

export const defaultScale: ScaleTokens = {
  space1: '0.25rem',
  space2: '0.5rem',
  space3: '0.75rem',
  space4: '1rem',
  space5: '1.5rem',
  space6: '2rem',
  space7: '3rem',
  space8: '4rem',
  radiusSm: '4px',
  radius: '8px',
  radiusLg: '14px',
  radiusFull: '9999px',
  fontSans:
    'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontMono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  textXs: '0.75rem',
  textSm: '0.875rem',
  textMd: '1rem',
  textLg: '1.125rem',
  textXl: '1.5rem',
  weightNormal: '400',
  weightMedium: '500',
  weightBold: '650',
  leading: '1.5',
  duration: '150ms',
  ease: 'cubic-bezier(0.2, 0, 0.2, 1)',
}

export const base: Theme = {
  name: 'base',
  scale: defaultScale,
  light: {
    bg: '#ffffff',
    bgSubtle: '#f5f6f7',
    bgRaised: '#ffffff',
    fg: '#16181c',
    fgMuted: '#5c6069',
    border: '#e0e2e6',
    borderStrong: '#c3c6cc',
    accent: '#2a5bd7',
    accentFg: '#ffffff',
    accentHover: '#1f47ab',
    success: '#0f7a44',
    successFg: '#ffffff',
    warning: '#8a5a00',
    warningFg: '#ffffff',
    danger: '#c02525',
    dangerFg: '#ffffff',
    info: '#1f5f8f',
    infoFg: '#ffffff',
    overlay: 'rgba(16, 18, 22, 0.45)',
    focusRing: '#2a5bd7',
    shadowSm: '0 1px 2px rgba(16, 18, 22, 0.08)',
    shadow: '0 2px 8px rgba(16, 18, 22, 0.10)',
    shadowLg: '0 12px 32px rgba(16, 18, 22, 0.16)',
  },
  dark: {
    bg: '#121316',
    bgSubtle: '#1a1c20',
    bgRaised: '#212429',
    fg: '#eceef1',
    fgMuted: '#a0a5ad',
    border: '#2c3036',
    borderStrong: '#434952',
    accent: '#7ba2f5',
    accentFg: '#0d1524',
    accentHover: '#9ab8f8',
    success: '#5ed4a0',
    successFg: '#04231a',
    warning: '#e5b769',
    warningFg: '#291c05',
    danger: '#f08b8b',
    dangerFg: '#2b0c0c',
    info: '#7fc0ef',
    infoFg: '#07202f',
    overlay: 'rgba(0, 0, 0, 0.6)',
    focusRing: '#7ba2f5',
    shadowSm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    shadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    shadowLg: '0 16px 40px rgba(0, 0, 0, 0.6)',
  },
}
```

- [ ] **Step 4: Create `src/styles/themes/midnight.ts`**

Deep blue-violet, higher contrast, larger radii.

```ts
import type { Theme } from '../tokens'
import { defaultScale } from './base'

export const midnight: Theme = {
  name: 'midnight',
  scale: { ...defaultScale, radius: '10px', radiusLg: '18px' },
  light: {
    bg: '#fbfbfe',
    bgSubtle: '#f1f1fa',
    bgRaised: '#ffffff',
    fg: '#14142b',
    fgMuted: '#55557a',
    border: '#dedef0',
    borderStrong: '#b9b9d6',
    accent: '#4c35d4',
    accentFg: '#ffffff',
    accentHover: '#3b28ab',
    success: '#0d7350',
    successFg: '#ffffff',
    warning: '#8a5300',
    warningFg: '#ffffff',
    danger: '#bd2149',
    dangerFg: '#ffffff',
    info: '#2b5aa8',
    infoFg: '#ffffff',
    overlay: 'rgba(12, 12, 32, 0.5)',
    focusRing: '#4c35d4',
    shadowSm: '0 1px 2px rgba(20, 20, 43, 0.10)',
    shadow: '0 4px 14px rgba(20, 20, 43, 0.12)',
    shadowLg: '0 18px 44px rgba(20, 20, 43, 0.20)',
  },
  dark: {
    bg: '#0b0b18',
    bgSubtle: '#131327',
    bgRaised: '#1a1a33',
    fg: '#eeeef8',
    fgMuted: '#a2a2c4',
    border: '#262645',
    borderStrong: '#3d3d66',
    accent: '#9d8bff',
    accentFg: '#0e0a24',
    accentHover: '#b6a8ff',
    success: '#5bd6a5',
    successFg: '#032218',
    warning: '#e8bb6e',
    warningFg: '#2a1c04',
    danger: '#ff8fa8',
    dangerFg: '#2c0713',
    info: '#8ab6ff',
    infoFg: '#061529',
    overlay: 'rgba(0, 0, 0, 0.66)',
    focusRing: '#9d8bff',
    shadowSm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.55)',
    shadowLg: '0 20px 48px rgba(0, 0, 0, 0.68)',
  },
}
```

- [ ] **Step 5: Create `src/styles/themes/index.ts`**

```ts
import type { Theme } from '../tokens'
import { base } from './base'
import { midnight } from './midnight'

export const themes: readonly Theme[] = [base, midnight]
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/styles/themes/themes.test.ts`
Expected: PASS, 4 tests

- [ ] **Step 7: Commit**

```bash
git add src/styles/themes
git commit -m "feat: add base and midnight themes"
```

---

## Task 5: Contrast checker

Written before any component CSS exists, so that no theme can ever be added without being checked.

**Files:**
- Create: `src/internal/contrast.ts`, `scripts/check-contrast.ts`
- Test: `src/internal/contrast.test.ts`

- [ ] **Step 1: Write the failing test**

The two reference values come from the WCAG definition: black on white is exactly 21, and identical colors are exactly 1.

```ts
import { describe, expect, it } from 'vitest'
import { contrastRatio, parseColor } from './contrast'

describe('parseColor', () => {
  it('parses six digit hex', () => {
    expect(parseColor('#ffffff')).toEqual([255, 255, 255])
  })

  it('parses three digit hex', () => {
    expect(parseColor('#000')).toEqual([0, 0, 0])
  })

  it('parses rgba by ignoring alpha', () => {
    expect(parseColor('rgba(16, 18, 22, 0.45)')).toEqual([16, 18, 22])
  })

  it('returns null for a value it cannot read, such as a shadow', () => {
    expect(parseColor('0 1px 2px rgba(0,0,0,0.4)')).toBeNull()
  })
})

describe('contrastRatio', () => {
  it('reports 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2)
  })

  it('reports 1 for a color against itself', () => {
    expect(contrastRatio('#4c35d4', '#4c35d4')).toBeCloseTo(1, 5)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#2a5bd7', '#ffffff')).toBeCloseTo(
      contrastRatio('#ffffff', '#2a5bd7'),
      5,
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/internal/contrast.test.ts`
Expected: FAIL, "Failed to resolve import ./contrast"

- [ ] **Step 3: Write `src/internal/contrast.ts`**

```ts
export type Rgb = [number, number, number]

const HEX6 = /^#([0-9a-f]{6})$/i
const HEX3 = /^#([0-9a-f]{3})$/i
const RGB = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i

export function parseColor(value: string): Rgb | null {
  const input = value.trim()

  const hex6 = HEX6.exec(input)?.[1]
  if (hex6) {
    return [
      Number.parseInt(hex6.slice(0, 2), 16),
      Number.parseInt(hex6.slice(2, 4), 16),
      Number.parseInt(hex6.slice(4, 6), 16),
    ]
  }

  const hex3 = HEX3.exec(input)?.[1]
  if (hex3) {
    const [r, g, b] = hex3
    return [
      Number.parseInt(`${r}${r}`, 16),
      Number.parseInt(`${g}${g}`, 16),
      Number.parseInt(`${b}${b}`, 16),
    ]
  }

  const rgb = RGB.exec(input)
  const [, r, g, b] = rgb ?? []
  if (r && g && b) return [Number(r), Number(g), Number(b)]

  return null
}

function channelLuminance(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance([r, g, b]: Rgb): number {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  )
}

/** Throws if either value is not a color this can read. */
export function contrastRatio(a: string, b: string): number {
  const ca = parseColor(a)
  const cb = parseColor(b)
  if (!ca || !cb) throw new Error(`Cannot compute contrast between "${a}" and "${b}"`)
  const la = relativeLuminance(ca)
  const lb = relativeLuminance(cb)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/internal/contrast.test.ts`
Expected: PASS, 7 tests

- [ ] **Step 5: Write `scripts/check-contrast.ts`**

```ts
import { contrastRatio } from '../src/internal/contrast'
import { CONTRAST_PAIRS } from '../src/styles/tokens'
import { themes } from '../src/styles/themes/index'

const AA_NORMAL = 4.5

let failures = 0

for (const theme of themes) {
  for (const mode of ['light', 'dark'] as const) {
    const tokens = theme[mode]
    for (const pair of CONTRAST_PAIRS) {
      const ratio = contrastRatio(tokens[pair.fg], tokens[pair.bg])
      const label = `${theme.name}/${mode} ${pair.fg} on ${pair.bg}`
      if (ratio < AA_NORMAL) {
        failures += 1
        console.error(`FAIL ${label}: ${ratio.toFixed(2)}:1 (needs ${AA_NORMAL}:1)`)
      } else {
        console.log(`ok   ${label}: ${ratio.toFixed(2)}:1`)
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} contrast violation(s).`)
  process.exit(1)
}
console.log('\nAll theme color pairs clear WCAG AA.')
```

- [ ] **Step 6: Run the checker against the two real themes**

Run: `npm run check:contrast`
Expected: exits 0, every line starts with `ok`. If a pair fails, adjust that token in the theme file until it passes, then rerun. Do not lower the threshold.

- [ ] **Step 7: Commit**

```bash
git add src/internal/contrast.ts src/internal/contrast.test.ts scripts/check-contrast.ts
git commit -m "feat: add WCAG AA contrast checker for all themes"
```

---

## Task 6: `useColorMode`

**Files:**
- Create: `src/hooks/useColorMode.ts`
- Test: `src/hooks/useColorMode.test.tsx`

- [ ] **Step 1: Write the failing test**

jsdom has no real `matchMedia`, so the test installs one it controls.

```tsx
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useColorMode } from './useColorMode'

type Listener = () => void

function mockMatchMedia(prefersDark: boolean) {
  const listeners = new Set<Listener>()
  const mql = {
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, l: Listener) => listeners.add(l),
    removeEventListener: (_: string, l: Listener) => listeners.delete(l),
  }
  vi.stubGlobal('matchMedia', () => mql)
  return {
    setDark(next: boolean) {
      mql.matches = next
      for (const l of listeners) l()
    },
  }
}

describe('useColorMode', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts in system mode and resolves from the system preference', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useColorMode())
    expect(result.current.mode).toBe('system')
    expect(result.current.resolvedMode).toBe('dark')
  })

  it('follows the system preference while it changes', () => {
    const media = mockMatchMedia(false)
    const { result } = renderHook(() => useColorMode())
    expect(result.current.resolvedMode).toBe('light')
    act(() => media.setDark(true))
    expect(result.current.resolvedMode).toBe('dark')
  })

  it('writes data-mode on the document element for an explicit choice', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setMode('dark'))
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
  })

  it('removes data-mode when returning to system', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setMode('dark'))
    act(() => result.current.setMode('system'))
    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })

  it('persists the choice and restores it on the next mount', () => {
    mockMatchMedia(false)
    const first = renderHook(() => useColorMode())
    act(() => first.result.current.setMode('dark'))
    first.unmount()
    const second = renderHook(() => useColorMode())
    expect(second.result.current.mode).toBe('dark')
  })

  it('toggle from system produces the opposite of the resolved mode', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.toggle())
    expect(result.current.mode).toBe('light')
    expect(result.current.resolvedMode).toBe('light')
  })

  it('survives localStorage throwing', () => {
    mockMatchMedia(false)
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const { result } = renderHook(() => useColorMode())
    expect(() => act(() => result.current.setMode('dark'))).not.toThrow()
    expect(result.current.mode).toBe('dark')
    spy.mockRestore()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useColorMode.test.tsx`
Expected: FAIL, "Failed to resolve import ./useColorMode"

- [ ] **Step 3: Write the implementation**

```ts
import { useCallback, useEffect, useState } from 'react'

export type ColorMode = 'light' | 'dark' | 'system'
export type ResolvedColorMode = 'light' | 'dark'

export const COLOR_MODE_STORAGE_KEY = 'halcyon-mode'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredMode(): ColorMode {
  try {
    const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // Storage can be unavailable in private windows or blocked by settings.
  }
  return 'system'
}

function writeStoredMode(mode: ColorMode): void {
  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode)
  } catch {
    // A failed write is not worth breaking the page over.
  }
}

function applyMode(mode: ColorMode): void {
  const root = document.documentElement
  if (mode === 'system') root.removeAttribute('data-mode')
  else root.setAttribute('data-mode', mode)
}

export interface UseColorModeResult {
  mode: ColorMode
  resolvedMode: ResolvedColorMode
  setMode: (mode: ColorMode) => void
  toggle: () => void
}

export function useColorMode(): UseColorModeResult {
  // Starts at 'system' so server and client markup agree; the stored choice is
  // read after mount. Use <ColorModeScript /> to avoid the flash this implies.
  const [mode, setModeState] = useState<ColorMode>('system')
  const [resolvedMode, setResolvedMode] = useState<ResolvedColorMode>('light')

  useEffect(() => {
    const stored = readStoredMode()
    setModeState(stored)
    applyMode(stored)
  }, [])

  useEffect(() => {
    if (mode !== 'system') {
      setResolvedMode(mode)
      return
    }
    const query = window.matchMedia(DARK_QUERY)
    const sync = () => setResolvedMode(query.matches ? 'dark' : 'light')
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [mode])

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next)
    applyMode(next)
    writeStoredMode(next)
  }, [])

  const toggle = useCallback(() => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark')
  }, [resolvedMode, setMode])

  return { mode, resolvedMode, setMode, toggle }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useColorMode.test.tsx`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useColorMode.ts src/hooks/useColorMode.test.tsx
git commit -m "feat: add useColorMode hook"
```

---

## Task 7: `ColorModeScript`

**Files:**
- Create: `src/components/ColorModeScript/ColorModeScript.tsx`, `src/components/ColorModeScript/index.ts`
- Test: `src/components/ColorModeScript/ColorModeScript.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ColorModeScript } from './ColorModeScript'
import { COLOR_MODE_STORAGE_KEY } from '../../hooks/useColorMode'

function scriptSource(container: HTMLElement): string {
  const script = container.querySelector('script')
  expect(script).not.toBeNull()
  return script!.innerHTML
}

describe('ColorModeScript', () => {
  it('renders an inline script that reads the stored key', () => {
    const { container } = render(<ColorModeScript />)
    expect(scriptSource(container)).toContain(COLOR_MODE_STORAGE_KEY)
  })

  it('embeds the default mode it was given', () => {
    const { container } = render(<ColorModeScript defaultMode="dark" />)
    expect(scriptSource(container)).toContain("'dark'")
  })

  it('applies the stored mode when the script actually runs', () => {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'dark')
    const { container } = render(<ColorModeScript />)
    // eslint-disable-next-line no-new-func
    new Function(scriptSource(container))()
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
  })

  it('sets no attribute when the stored mode is system', () => {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'system')
    const { container } = render(<ColorModeScript />)
    // eslint-disable-next-line no-new-func
    new Function(scriptSource(container))()
    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ColorModeScript`
Expected: FAIL, "Failed to resolve import ./ColorModeScript"

- [ ] **Step 3: Write the implementation**

```tsx
import type { ColorMode } from '../../hooks/useColorMode'
import { COLOR_MODE_STORAGE_KEY } from '../../hooks/useColorMode'

export interface ColorModeScriptProps {
  /** Mode to assume when nothing is stored yet. Defaults to 'system'. */
  defaultMode?: ColorMode
  /** Nonce for pages with a strict Content Security Policy. */
  nonce?: string
}

/**
 * Renders a tiny synchronous script that sets `data-mode` before first paint,
 * so a returning visitor never sees a flash of the wrong color mode. Place it
 * in the document head, above the app.
 */
export function ColorModeScript({ defaultMode = 'system', nonce }: ColorModeScriptProps) {
  const source =
    `(function(){try{var m=localStorage.getItem('${COLOR_MODE_STORAGE_KEY}')||'${defaultMode}';` +
    `if(m==='light'||m==='dark'){document.documentElement.setAttribute('data-mode',m)}}catch(e){}})()`

  return <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: source }} />
}
```

- [ ] **Step 4: Create `src/components/ColorModeScript/index.ts`**

```ts
export { ColorModeScript } from './ColorModeScript'
export type { ColorModeScriptProps } from './ColorModeScript'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ColorModeScript`
Expected: PASS, 4 tests

- [ ] **Step 6: Commit**

```bash
git add src/components/ColorModeScript
git commit -m "feat: add ColorModeScript to prevent color mode flash"
```

---

## Task 8: Button

The first real component. Its shape is the template every later component copies: forwarded ref, forwarded rest props, merged `className`, variant and size classes, and all color from tokens.

**Files:**
- Create: `src/components/Button/Button.tsx`, `src/components/Button/Button.css`, `src/components/Button/index.ts`
- Test: `src/components/Button/Button.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children in a button element', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('applies the default variant and size classes', () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hal-button', 'hal-button--primary', 'hal-button--md')
  })

  it('merges a consumer className rather than replacing ours', () => {
    render(<Button className="my-button">Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hal-button')
    expect(button).toHaveClass('my-button')
  })

  it('forwards the ref to the DOM node', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Save</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('forwards unknown props to the DOM node', () => {
    render(<Button data-testid="go" aria-describedby="hint">Save</Button>)
    expect(screen.getByTestId('go')).toHaveAttribute('aria-describedby', 'hint')
  })

  it('defaults to type button but lets the consumer override it', () => {
    const { rerender } = render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    rerender(<Button type="submit">Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('when loading, disables itself and marks itself busy', async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('keeps its accessible name while loading', () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Save</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Button`
Expected: FAIL, "Failed to resolve import ./Button"

- [ ] **Step 3: Write `src/components/Button/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cx } from '../../internal/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Disables the button and shows a spinner without changing its width. */
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        'hal-button',
        `hal-button--${variant}`,
        `hal-button--${size}`,
        fullWidth && 'hal-button--full',
        loading && 'hal-button--loading',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className="hal-button__label">{children}</span>
      {loading ? <span className="hal-button__spinner" aria-hidden="true" /> : null}
    </button>
  )
})
```

- [ ] **Step 4: Write `src/components/Button/Button.css`**

Every color comes from a component token that falls back to a global token. Nothing here is a literal color.

```css
.hal-button {
  --_bg: var(--hal-button-bg, var(--hal-accent));
  --_fg: var(--hal-button-fg, var(--hal-accent-fg));
  --_border: var(--hal-button-border, transparent);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--hal-space-2);
  box-sizing: border-box;
  border: 1px solid var(--_border);
  border-radius: var(--hal-button-radius, var(--hal-radius));
  background: var(--_bg);
  color: var(--_fg);
  font-family: var(--hal-font-sans);
  font-weight: var(--hal-weight-medium);
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--hal-duration) var(--hal-ease),
    border-color var(--hal-duration) var(--hal-ease),
    opacity var(--hal-duration) var(--hal-ease);
}

.hal-button:hover:not(:disabled) {
  background: var(--hal-button-bg-hover, var(--hal-accent-hover));
}

.hal-button:focus-visible {
  outline: 2px solid var(--hal-focus-ring);
  outline-offset: 2px;
}

.hal-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hal-button--sm {
  padding: var(--hal-space-2) var(--hal-space-3);
  font-size: var(--hal-text-sm);
}
.hal-button--md {
  padding: var(--hal-space-3) var(--hal-space-4);
  font-size: var(--hal-text-md);
}
.hal-button--lg {
  padding: var(--hal-space-4) var(--hal-space-5);
  font-size: var(--hal-text-lg);
}

.hal-button--secondary {
  --_bg: var(--hal-bg-raised);
  --_fg: var(--hal-fg);
  --_border: var(--hal-border-strong);
}
.hal-button--secondary:hover:not(:disabled) {
  background: var(--hal-bg-subtle);
}

.hal-button--ghost {
  --_bg: transparent;
  --_fg: var(--hal-fg);
}
.hal-button--ghost:hover:not(:disabled) {
  background: var(--hal-bg-subtle);
}

.hal-button--danger {
  --_bg: var(--hal-danger);
  --_fg: var(--hal-danger-fg);
}
.hal-button--danger:hover:not(:disabled) {
  background: var(--hal-danger);
  filter: brightness(1.08);
}

.hal-button--full {
  display: flex;
  width: 100%;
}

.hal-button--loading .hal-button__label {
  visibility: hidden;
}

.hal-button__spinner {
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--hal-radius-full);
  animation: hal-button-spin 0.7s linear infinite;
}

@keyframes hal-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hal-button {
    transition: none;
  }
  .hal-button__spinner {
    animation-duration: 2s;
  }
}
```

- [ ] **Step 5: Create `src/components/Button/index.ts`**

```ts
export { Button } from './Button'
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button'
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/components/Button`
Expected: PASS, 10 tests

- [ ] **Step 7: Commit**

```bash
git add src/components/Button
git commit -m "feat: add Button component"
```

---

## Task 9: Structure stylesheet and CSS build

**Files:**
- Create: `src/styles/structure.css`, `scripts/build-css.ts`
- Test: `scripts/build-css.test.ts`

- [ ] **Step 1: Create `src/styles/structure.css`**

One `@import` per component stylesheet. Every later plan appends its components here, and this is the only place that list lives.

```css
@import '../components/Button/Button.css';
```

- [ ] **Step 2: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { renderTokenBlocks } from './build-css'
import { themes } from '../src/styles/themes/index'

const midnight = themes.find((t) => t.name === 'midnight')!

describe('renderTokenBlocks', () => {
  const css = renderTokenBlocks(midnight)

  it('emits light tokens on bare :root', () => {
    expect(css).toContain(`--hal-bg: ${midnight.light.bg}`)
  })

  it('emits scale tokens, which do not vary by mode', () => {
    expect(css).toContain(`--hal-radius: ${midnight.scale.radius}`)
  })

  it('guards the media query block so an explicit light choice still wins', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    expect(css).toContain(':root:not([data-mode="light"])')
  })

  it('emits an explicit dark block so the toggle wins in both directions', () => {
    expect(css).toContain(':root[data-mode="dark"]')
  })

  it('writes the dark value for bg exactly twice, once per dark block', () => {
    const matches = css.match(new RegExp(`--hal-bg: ${midnight.dark.bg}`, 'g'))
    expect(matches).toHaveLength(2)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run scripts/build-css.test.ts`
Expected: FAIL, "Failed to resolve import ./build-css"

- [ ] **Step 4: Write `scripts/build-css.ts`**

Note the export of `renderTokenBlocks`: the file is both a script and a testable module, and the build only runs when it is executed directly.

```ts
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { bundle, transform } from 'lightningcss'
import type { ModeTokens, ScaleTokens, Theme } from '../src/styles/tokens'
import { cssVarName } from '../src/styles/tokens'
import { themes } from '../src/styles/themes/index'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

function declarations(tokens: ModeTokens | ScaleTokens, indent: string): string {
  return Object.entries(tokens)
    .map(([key, value]) => `${indent}${cssVarName(key)}: ${value};`)
    .join('\n')
}

/** Emits the three-block pattern that makes system preference and explicit override both resolve. */
export function renderTokenBlocks(theme: Theme): string {
  return [
    ':root {',
    declarations(theme.scale, '  '),
    declarations(theme.light, '  '),
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    '  :root:not([data-mode="light"]) {',
    declarations(theme.dark, '    '),
    '  }',
    '}',
    '',
    ':root[data-mode="dark"] {',
    declarations(theme.dark, '  '),
    '}',
    '',
  ].join('\n')
}

export function buildStructureCss(): string {
  const { code } = bundle({
    filename: resolve(root, 'src/styles/structure.css'),
    minify: false,
  })
  return code.toString()
}

export function buildAll(): void {
  const structure = buildStructureCss()
  const outDir = resolve(root, 'dist')
  mkdirSync(outDir, { recursive: true })

  for (const theme of themes) {
    const source = `${renderTokenBlocks(theme)}\n${structure}`
    const { code } = transform({
      filename: `${theme.name}.css`,
      code: Buffer.from(source),
      minify: true,
    })
    const outFile = resolve(outDir, `${theme.name}.css`)
    writeFileSync(outFile, code)
    console.log(`built dist/${theme.name}.css (${(code.length / 1024).toFixed(1)} KB raw)`)
  }
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) buildAll()
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run scripts/build-css.test.ts`
Expected: PASS, 5 tests

- [ ] **Step 6: Run the real build and inspect the output**

Run: `npm run build:css && head -c 400 dist/midnight.css`
Expected: two files written, `dist/base.css` and `dist/midnight.css`, and the printed head shows minified `:root{--hal-...}` declarations followed by `.hal-button` rules.

- [ ] **Step 7: Commit**

```bash
git add src/styles/structure.css scripts/build-css.ts scripts/build-css.test.ts
git commit -m "feat: build one stylesheet per theme from token objects"
```

---

## Task 10: Public entry point and full build

**Files:**
- Create: `src/index.ts`
- Test: `src/index.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import * as api from './index'

describe('public API', () => {
  it('exports exactly the intended surface', () => {
    expect(Object.keys(api).sort()).toEqual(
      ['Button', 'COLOR_MODE_STORAGE_KEY', 'ColorModeScript', 'useColorMode'].sort(),
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/index.test.ts`
Expected: FAIL, "Failed to resolve import ./index"

- [ ] **Step 3: Write `src/index.ts`**

```ts
export { Button } from './components/Button/index'
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button/index'

export { ColorModeScript } from './components/ColorModeScript/index'
export type { ColorModeScriptProps } from './components/ColorModeScript/index'

export { COLOR_MODE_STORAGE_KEY, useColorMode } from './hooks/useColorMode'
export type { ColorMode, ResolvedColorMode, UseColorModeResult } from './hooks/useColorMode'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/index.test.ts`
Expected: PASS, 1 test

- [ ] **Step 5: Run the whole build**

Run: `npm run build`
Expected: exits 0. `dist/index.js` re-exports from `./components/Button/index.js`, `dist/index.d.ts` exists, and `dist/base.css` and `dist/midnight.css` exist.

- [ ] **Step 6: Verify the package contents are what the exports map promises**

Run: `npm pack --dry-run`
Expected: the listed files include `dist/index.js`, `dist/index.d.ts`, `dist/base.css`, `dist/midnight.css`, and no test files.

- [ ] **Step 7: Commit**

```bash
git add src/index.ts src/index.test.ts
git commit -m "feat: add public entry point"
```

---

## Task 11: Size budget checker

**Files:**
- Create: `scripts/check-size.ts`

- [ ] **Step 1: Write `scripts/check-size.ts`**

It bundles a fixture against the real built output, exactly as a consumer's bundler would, then gzips it.

```ts
import { gzipSync } from 'node:zlib'
import { readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

interface Budget {
  label: string
  limitKb: number
  measure: () => Promise<number>
}

async function bundledGzipKb(contents: string): Promise<number> {
  const result = await build({
    stdin: { contents, resolveDir: root, loader: 'ts' },
    bundle: true,
    format: 'esm',
    minify: true,
    write: false,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    logLevel: 'silent',
  })
  const output = result.outputFiles[0]
  if (!output) throw new Error('esbuild produced no output')
  return gzipSync(Buffer.from(output.contents)).length / 1024
}

function fileGzipKb(path: string): number {
  statSync(path)
  return gzipSync(readFileSync(path)).length / 1024
}

const budgets: Budget[] = [
  {
    label: 'full library',
    limitKb: 45,
    measure: () =>
      bundledGzipKb(`import * as api from './dist/index.js'; console.log(api)`),
  },
  {
    label: 'Button alone',
    limitKb: 2,
    measure: () =>
      bundledGzipKb(`import { Button } from './dist/index.js'; console.log(Button)`),
  },
  {
    label: 'midnight stylesheet',
    limitKb: 10,
    measure: async () => fileGzipKb(resolve(root, 'dist/midnight.css')),
  },
]

let failed = false
for (const budget of budgets) {
  const kb = await budget.measure()
  const verdict = kb <= budget.limitKb ? 'ok  ' : 'FAIL'
  if (kb > budget.limitKb) failed = true
  console.log(`${verdict} ${budget.label}: ${kb.toFixed(2)} KB gzipped (budget ${budget.limitKb} KB)`)
}

if (failed) {
  console.error('\nSize budget exceeded.')
  process.exit(1)
}
console.log('\nAll size budgets met.')
```

- [ ] **Step 2: Run it against the real build**

Run: `npm run build && npm run check:size`
Expected: exits 0, three `ok` lines. Button alone should be well under 1 KB at this stage. If the full library line fails later in the project, that is the signal to investigate, not to raise the number without discussion.

- [ ] **Step 3: Commit**

```bash
git add scripts/check-size.ts
git commit -m "feat: enforce gzipped size budgets"
```

---

## Task 12: Continuous integration

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run check:contrast
      - run: npm run build
      - run: npm run check:size
```

- [ ] **Step 2: Run every CI step locally first**

Run: `npm run typecheck && npm run lint && npm test && npm run check:contrast && npm run build && npm run check:size`
Expected: all six exit 0. Fix anything that fails before pushing.

- [ ] **Step 3: Commit and push, then confirm the run is green**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: verify types, lint, tests, contrast, build and size"
git push origin main
gh run watch
```

Expected: the workflow concludes with success. Do not proceed to Task 13 until it is green.

---

## Task 13: Release pipeline

**Files:**
- Create: `.changeset/config.json`, `.github/workflows/release.yml`

- [ ] **Step 1: Initialize Changesets**

Run: `npx changeset init`
Expected: creates `.changeset/config.json` and `.changeset/README.md`.

- [ ] **Step 2: Point Changesets at the repo in `.changeset/config.json`**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "OrenVill/halcyon-ui" }],
  "commit": false,
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

Run: `npm install --save-dev @changesets/changelog-github`

- [ ] **Step 3: Write `.github/workflows/release.yml`**

`id-token: write` is what lets npm attach a provenance attestation to the published package.

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency: release

permissions:
  contents: write
  pull-requests: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          registry-url: https://registry.npmjs.org
      - run: npm ci
      - run: npm run build
      - uses: changesets/action@v1
        with:
          publish: npm publish --provenance --access public
          title: 'chore: release halcyon-ui'
          commit: 'chore: release halcyon-ui'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 4: Record the manual step**

The workflow needs an `NPM_TOKEN` repository secret, which requires an npm account. That is the user's action, not the implementer's:

```bash
# the user runs these
npm login
npm token create --read-only=false
gh secret set NPM_TOKEN --repo OrenVill/halcyon-ui
```

Do not attempt to publish until that secret exists. Nothing in plans 2 through 6 depends on it.

- [ ] **Step 5: Commit and push**

```bash
git add .changeset .github/workflows/release.yml package.json package-lock.json
git commit -m "ci: add changesets release pipeline with npm provenance"
git push origin main
```

---

## Task 14: README skeleton

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

It is the documentation, so it starts correct and grows a section per component as later plans land.

````markdown
# halcyon-ui

Lightweight, themeable React components. 8 themes, each with light and dark. React is the only dependency.

## Install

```bash
npm install halcyon-ui
```

## Quick start

Import one theme, then use the components.

```jsx
import 'halcyon-ui/midnight'
import { Button } from 'halcyon-ui'

export default function App() {
  return <Button variant="primary">Save</Button>
}
```

## Themes

| Import | Look |
| --- | --- |
| `halcyon-ui/base` | Neutral greys. The starting point for your own theme. |
| `halcyon-ui/midnight` | Deep blue-violet, higher contrast, soft corners. |

Every theme ships light and dark in the same file. There is no second import.

## Light and dark

Dark mode follows the operating system with no JavaScript. To let people choose,
use the hook:

```jsx
import { useColorMode } from 'halcyon-ui'

function ModeToggle() {
  const { resolvedMode, toggle } = useColorMode()
  return <Button variant="ghost" onClick={toggle}>{resolvedMode}</Button>
}
```

`useColorMode()` returns `mode` (`light`, `dark`, or `system`), `resolvedMode`
(the mode actually in effect), `setMode`, and `toggle`. The choice persists in
`localStorage`.

To stop a returning visitor seeing a flash of the wrong mode, render
`<ColorModeScript />` in your document head.

## Customizing

Three layers, each overriding the one above.

**Global tokens.** Override any variable to reskin everything:

```css
:root {
  --hal-accent: #7c5cff;
  --hal-radius: 12px;
}
```

**Component tokens.** Restyle one component without touching the rest:

```css
:root {
  --hal-button-radius: 999px;
}
```

**Direct styling.** Every component forwards `className`, `style`, `ref`, and all
remaining props to its underlying element. Class names are stable and unhashed,
so `.hal-button` is safe to target.

## Components

### Button

```jsx
<Button variant="primary" size="md">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Dismiss</Button>
<Button variant="danger">Delete</Button>
<Button loading>Saving</Button>
<Button fullWidth>Continue</Button>
```

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `primary` \| `secondary` \| `ghost` \| `danger` | `primary` |
| `size` | `sm` \| `md` \| `lg` | `md` |
| `loading` | `boolean` | `false` |
| `fullWidth` | `boolean` | `false` |

## Contributing

```bash
npm install
npm test
npm run build
```

Pull requests need a changeset: run `npx changeset` and describe your change.

## License

MIT
````

- [ ] **Step 2: Commit and push**

```bash
git add README.md
git commit -m "docs: add README with install, theming and Button"
git push origin main
```

---

## Definition of done for this plan

- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run check:contrast`, `npm run build`, `npm run check:size` all pass locally
- [ ] CI is green on `main`
- [ ] `dist/` contains `index.js`, `index.d.ts`, `base.css`, `midnight.css`
- [ ] A consumer can import `halcyon-ui/midnight` and `Button` and get a styled, themed, accessible button in both color modes
- [ ] The only thing standing between this and a publish is the user's `NPM_TOKEN`
