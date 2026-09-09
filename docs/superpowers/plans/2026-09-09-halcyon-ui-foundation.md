# halcyon-ui Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the buildable, testable, themeable shell of `halcyon-ui` — package, build pipeline, test harness, color-mode system, and the `base` theme — with zero components.

**Architecture:** A TypeScript source tree compiled to ESM by tsup and a separate CSS pipeline that concatenates `src/styles/base.css` (structure) with one theme's token file, minifies it through Lightning CSS, and writes `dist/<theme>.css`. Color mode is a hook that writes `data-mode` on the document element and a tiny inline script that does the same before first paint. No runtime dependencies; React is a peer dependency.

**Tech Stack:** TypeScript (strict), tsup, Lightning CSS, Vitest, Testing Library, jsdom, vitest-axe, ESLint, Prettier, Release Please, GitHub Actions.

**Source spec:** `docs/superpowers/specs/2026-09-09-halcyon-ui-design.md`

**Scope note:** This plan is the first of six. It deliberately contains no components. Later plans cover the seven remaining themes plus the contrast checker, the form components, the overlay infrastructure and overlays, navigation, and the four expensive components.

**Deviation from spec, flagged for review:** The spec says `useColorMode` subscribes to the system preference "while `mode` is `'system'`". This plan subscribes unconditionally. Gating the subscription leaves a stale system value behind when a user returns from an explicit mode to `'system'`. The listener is one `matchMedia` handler and costs nothing.

---

### Task 1: Package scaffold and TypeScript config

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "halcyon-ui",
  "version": "0.0.0",
  "description": "A lightweight, themeable, accessible React component library",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/OrenVill/halcyon-ui.git"
  },
  "type": "module",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./base": "./dist/base.css"
  },
  "scripts": {
    "build": "npm run build:js && npm run build:css",
    "build:js": "tsup",
    "build:css": "tsx scripts/build-css.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "check:size": "tsx scripts/check-size.ts"
  },
  "peerDependencies": {
    "react": "^18 || ^19"
  },
  "devDependencies": {},
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

The `exports` map gains one subpath per theme in the themes plan. `devDependencies` is filled by the install command in Step 2, not by hand.

- [ ] **Step 2: Install the toolchain**

```bash
npm install --save-dev \
  typescript tsup tsx lightningcss \
  vitest jsdom @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom vitest-axe axe-core \
  eslint @eslint/js typescript-eslint eslint-plugin-react-hooks \
  prettier @changesets/cli \
  react react-dom @types/react @types/react-dom @types/node
```

`@types/node` is required: `scripts/build-css.ts` and `scripts/check-size.ts`
import Node builtins, and `tsconfig.json` typechecks `scripts/`.

Expected: installs without peer-dependency errors. `react` and `react-dom` are dev dependencies here because tests need them; they stay peer dependencies for consumers.

- [ ] **Step 3: Write `tsconfig.json`**

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
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    // tsup's declaration builder sets baseUrl internally, which TypeScript 6
    // deprecates and errors on. This unblocks the dts step.
    "ignoreDeprecations": "6.0",
    "types": ["vitest/globals", "node"]
  },
  "include": ["src", "scripts", "*.config.ts", "vitest.setup.ts"]
}
```

- [ ] **Step 4: Verify the config compiles**

Run: `npx tsc --noEmit`
Expected: exits 0 with no output. There are no source files yet, which is fine.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json
git commit -m "chore: scaffold package and TypeScript config"
```

---

### Task 2: Test harness

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/test/matchMedia.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

- [ ] **Step 2: Write `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-mode')
  localStorage.clear()
})
```

The `afterEach` block matters: `useColorMode` writes to the document element and to storage, and a leaked `data-mode` attribute would make later tests pass or fail for the wrong reason.

- [ ] **Step 3: Write the `matchMedia` test helper**

jsdom implements `window.matchMedia` but always reports `matches: false`, so a test cannot express "the system prefers dark" without a stub.

Create `src/test/matchMedia.ts`:

```ts
import { vi } from 'vitest'

type Listener = (event: MediaQueryListEvent) => void

/**
 * Replaces window.matchMedia with a controllable stub.
 * Returns a setter that flips the preference and notifies listeners,
 * the way a real browser does when the OS theme changes.
 */
export function stubMatchMedia(initialDark: boolean) {
  let dark = initialDark
  const listeners = new Set<Listener>()

  vi.stubGlobal(
    'matchMedia',
    (query: string) => ({
      media: query,
      get matches() {
        return query.includes('dark') ? dark : !dark
      },
      addEventListener: (_: string, listener: Listener) => {
        listeners.add(listener)
      },
      removeEventListener: (_: string, listener: Listener) => {
        listeners.delete(listener)
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
  )

  return function setDark(next: boolean) {
    dark = next
    for (const listener of listeners) {
      listener({ matches: next } as MediaQueryListEvent)
    }
  }
}
```

- [ ] **Step 4: Verify the runner starts**

Run: `npx vitest run`
Expected: prints "No test files found, exiting with code 1". The non-zero exit
is correct here and not a failure of the harness: Vitest treats an empty run as
an error. The harness itself has loaded.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts src/test/matchMedia.ts
git commit -m "chore: add Vitest harness with jsdom and axe matchers"
```

---

### Task 3: The `cx` class-name helper

Every component joins a base class with conditional variant classes and a consumer's `className`. That join is one function.

**Files:**
- Create: `src/internal/cx.ts`
- Test: `src/internal/cx.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/internal/cx.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('joins class names with a single space', () => {
    expect(cx('hal-button', 'hal-button--lg')).toBe('hal-button hal-button--lg')
  })

  it('drops falsy values so conditionals can be inlined', () => {
    expect(cx('hal-button', false, null, undefined, '')).toBe('hal-button')
  })

  it('returns an empty string when everything is falsy', () => {
    expect(cx(false, undefined)).toBe('')
  })

  it('keeps a consumer className last so it wins on equal specificity', () => {
    expect(cx('hal-card', 'custom')).toBe('hal-card custom')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/internal/cx.test.ts`
Expected: FAIL — "Failed to resolve import './cx'".

- [ ] **Step 3: Write the implementation**

Create `src/internal/cx.ts`:

```ts
export type ClassValue = string | false | null | undefined

/** Joins truthy class names with a space. Order is preserved. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/internal/cx.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/internal/cx.ts src/internal/cx.test.ts
git commit -m "feat: add cx class-name helper"
```

---

### Task 4: The `useColorMode` hook

**Files:**
- Create: `src/hooks/useColorMode.ts`
- Test: `src/hooks/useColorMode.test.ts`

Behavior contract, restated from the spec so you need not read it:

- Returns `{ mode, resolvedMode, setMode, toggle }`.
- `mode` is `'light' | 'dark' | 'system'`; it starts at `'system'` and is corrected from storage in an effect, never during render, so server and client markup match.
- `resolvedMode` is the mode actually in effect, `'light'` or `'dark'`.
- `setMode` persists to `localStorage` under `halcyon-mode`.
- `toggle` sets an explicit mode opposite to `resolvedMode`, so calling it from `'system'` always yields a definite choice.
- `mode === 'system'` removes `data-mode` from `<html>`; any other mode sets it.
- Every storage read and write is wrapped in try/catch.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useColorMode.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubMatchMedia } from '../test/matchMedia'
import { useColorMode } from './useColorMode'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useColorMode', () => {
  it('starts in system mode and resolves from the system preference', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useColorMode())

    expect(result.current.mode).toBe('system')
    expect(result.current.resolvedMode).toBe('dark')
    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })

  it('follows the system preference when it changes', () => {
    const setDark = stubMatchMedia(false)
    const { result } = renderHook(() => useColorMode())
    expect(result.current.resolvedMode).toBe('light')

    act(() => setDark(true))
    expect(result.current.resolvedMode).toBe('dark')
  })

  it('writes data-mode on the document for an explicit mode', () => {
    stubMatchMedia(false)
    const { result } = renderHook(() => useColorMode())

    act(() => result.current.setMode('dark'))

    expect(result.current.mode).toBe('dark')
    expect(result.current.resolvedMode).toBe('dark')
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
  })

  it('removes data-mode when returning to system', () => {
    stubMatchMedia(false)
    const { result } = renderHook(() => useColorMode())

    act(() => result.current.setMode('dark'))
    act(() => result.current.setMode('system'))

    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })

  it('ignores the system preference once a mode is explicit', () => {
    const setDark = stubMatchMedia(false)
    const { result } = renderHook(() => useColorMode())

    act(() => result.current.setMode('light'))
    act(() => setDark(true))

    expect(result.current.resolvedMode).toBe('light')
  })

  it('toggle from system produces an explicit opposite mode', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useColorMode())

    act(() => result.current.toggle())

    expect(result.current.mode).toBe('light')
    expect(document.documentElement.getAttribute('data-mode')).toBe('light')
  })

  it('persists the choice and restores it on the next mount', () => {
    stubMatchMedia(false)
    const first = renderHook(() => useColorMode())
    act(() => first.result.current.setMode('dark'))
    expect(localStorage.getItem('halcyon-mode')).toBe('dark')
    first.unmount()

    const second = renderHook(() => useColorMode())
    expect(second.result.current.mode).toBe('dark')
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
  })

  it('ignores a corrupt stored value', () => {
    stubMatchMedia(false)
    localStorage.setItem('halcyon-mode', 'chartreuse')

    const { result } = renderHook(() => useColorMode())

    expect(result.current.mode).toBe('system')
  })

  it('renders correctly when storage throws', () => {
    stubMatchMedia(false)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    const { result } = renderHook(() => useColorMode())
    expect(result.current.mode).toBe('system')

    act(() => result.current.setMode('dark'))
    expect(result.current.resolvedMode).toBe('dark')

    vi.restoreAllMocks()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/hooks/useColorMode.test.ts`
Expected: FAIL — "Failed to resolve import './useColorMode'".

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useColorMode.ts`:

```ts
import { useCallback, useEffect, useState } from 'react'

export type ColorMode = 'light' | 'dark' | 'system'
export type ResolvedColorMode = 'light' | 'dark'

export interface UseColorModeResult {
  /** The stored preference, including 'system'. */
  mode: ColorMode
  /** The mode actually in effect. */
  resolvedMode: ResolvedColorMode
  setMode: (mode: ColorMode) => void
  /** Sets an explicit mode opposite to resolvedMode. */
  toggle: () => void
}

export const COLOR_MODE_STORAGE_KEY = 'halcyon-mode'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isColorMode(value: unknown): value is ColorMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readStoredMode(): ColorMode {
  try {
    const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY)
    if (isColorMode(stored)) return stored
  } catch {
    // Storage can be disabled or full. The default is a fine answer.
  }
  return 'system'
}

function writeStoredMode(mode: ColorMode): void {
  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode)
  } catch {
    // A preference that cannot be persisted still applies for this session.
  }
}

export function useColorMode(): UseColorModeResult {
  // Both pieces of state start at a constant so the first render is
  // deterministic and matches server-rendered markup. Effects correct them.
  const [mode, setModeState] = useState<ColorMode>('system')
  const [systemMode, setSystemMode] = useState<ResolvedColorMode>('light')

  useEffect(() => {
    setModeState(readStoredMode())
  }, [])

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const sync = (event: { matches: boolean }) => {
      setSystemMode(event.matches ? 'dark' : 'light')
    }
    sync(query)
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const resolvedMode: ResolvedColorMode = mode === 'system' ? systemMode : mode

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'system') root.removeAttribute('data-mode')
    else root.setAttribute('data-mode', mode)
  }, [mode])

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next)
    writeStoredMode(next)
  }, [])

  const toggle = useCallback(() => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark')
  }, [resolvedMode, setMode])

  return { mode, resolvedMode, setMode, toggle }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/hooks/useColorMode.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useColorMode.ts src/hooks/useColorMode.test.ts
git commit -m "feat: add useColorMode hook"
```

---

### Task 5: `ColorModeScript`

An app that server-renders needs `data-mode` set before first paint, or the page paints in the wrong theme and then corrects itself.

**Files:**
- Create: `src/components/ColorModeScript/ColorModeScript.tsx`
- Create: `src/components/ColorModeScript/index.ts`
- Test: `src/components/ColorModeScript/ColorModeScript.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/ColorModeScript/ColorModeScript.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ColorModeScript } from './ColorModeScript'

function scriptSource(container: HTMLElement): string {
  const script = container.querySelector('script')
  if (!script) throw new Error('no script rendered')
  return script.innerHTML
}

describe('ColorModeScript', () => {
  it('renders an inline script', () => {
    const { container } = render(<ColorModeScript />)
    expect(container.querySelector('script')).not.toBeNull()
  })

  it('applies a stored explicit mode when run', () => {
    localStorage.setItem('halcyon-mode', 'dark')
    const { container } = render(<ColorModeScript />)

    new Function(scriptSource(container))()

    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
  })

  it('leaves the attribute unset for system mode', () => {
    localStorage.setItem('halcyon-mode', 'system')
    const { container } = render(<ColorModeScript />)

    new Function(scriptSource(container))()

    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })

  it('does not throw when nothing is stored', () => {
    const { container } = render(<ColorModeScript />)
    expect(() => new Function(scriptSource(container))()).not.toThrow()
    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })

  it('accepts a custom nonce for strict content security policies', () => {
    const { container } = render(<ColorModeScript nonce="abc123" />)
    expect(container.querySelector('script')?.getAttribute('nonce')).toBe('abc123')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/ColorModeScript`
Expected: FAIL — "Failed to resolve import './ColorModeScript'".

- [ ] **Step 3: Write the implementation**

Create `src/components/ColorModeScript/ColorModeScript.tsx`:

```tsx
import { COLOR_MODE_STORAGE_KEY } from '../../hooks/useColorMode'

export interface ColorModeScriptProps {
  /** Passed through for apps with a strict Content-Security-Policy. */
  nonce?: string
}

// Minified by hand: this string ships in the HTML of every page that uses it.
const SOURCE =
  `(function(){try{var m=localStorage.getItem(${JSON.stringify(COLOR_MODE_STORAGE_KEY)});` +
  `if(m==="dark"||m==="light"){document.documentElement.setAttribute("data-mode",m)}}catch(e){}})()`

/**
 * Emits a blocking inline script that applies the stored color mode before
 * first paint. Render it in <head>, above any stylesheet link.
 */
export function ColorModeScript({ nonce }: ColorModeScriptProps) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: SOURCE }} />
}
```

Create `src/components/ColorModeScript/index.ts`:

```ts
export { ColorModeScript } from './ColorModeScript'
export type { ColorModeScriptProps } from './ColorModeScript'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/ColorModeScript`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ColorModeScript
git commit -m "feat: add ColorModeScript for flash-free server rendering"
```

---

### Task 6: The public barrel

**Files:**
- Create: `src/index.ts`
- Test: `src/index.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import * as api from './index'

describe('public API', () => {
  it('exports the color-mode entry points from the package root', () => {
    expect(typeof api.useColorMode).toBe('function')
    expect(typeof api.ColorModeScript).toBe('function')
  })

  it('does not leak internal helpers', () => {
    expect('cx' in api).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/index.test.ts`
Expected: FAIL — "Failed to resolve import './index'".

- [ ] **Step 3: Write the implementation**

Create `src/index.ts`:

```ts
// The only barrel in the package. Components are added here as they land.

export { ColorModeScript } from './components/ColorModeScript'
export type { ColorModeScriptProps } from './components/ColorModeScript'

export { useColorMode, COLOR_MODE_STORAGE_KEY } from './hooks/useColorMode'
export type {
  ColorMode,
  ResolvedColorMode,
  UseColorModeResult,
} from './hooks/useColorMode'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/index.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts src/index.test.ts
git commit -m "feat: add public barrel export"
```

---
### Task 7: Structure stylesheet and the `base` theme tokens

Two files with two different jobs. `base.css` carries structure, layout, and states, and names colors only through `var()`. A theme file carries nothing but token values. The build glues one of each together.

**Files:**
- Create: `src/styles/base.css`
- Create: `src/styles/themes/base.css`

- [ ] **Step 1: Write the structure stylesheet**

Create `src/styles/base.css`:

```css
/*
 * halcyon-ui structure.
 * Layout, sizing, and states for every component. No literal colors:
 * everything here reads a token so any theme can repaint it.
 * Component rules are appended to this file as components land.
 */

*,
*::before,
*::after {
  box-sizing: border-box;
}

[class^='hal-'],
[class*=' hal-'] {
  font-family: var(--hal-font-sans);
  line-height: var(--hal-leading);
}

:where([class^='hal-'], [class*=' hal-']):focus-visible {
  outline: 2px solid var(--hal-focus-ring);
  outline-offset: 2px;
}

/* Available to consumers for labels that must exist for assistive
   technology but not appear on screen. */
.hal-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  [class^='hal-'],
  [class*=' hal-'] {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Write the `base` theme tokens**

Only color and shadow tokens differ between light and dark, so only those are repeated in the two dark blocks. Spacing, radius, and type are declared once.

Create `src/styles/themes/base.css`:

```css
/*
 * halcyon-ui theme: base.
 * Deliberately plain. This is the documented starting point for a custom
 * theme: copy this file, change the values, change nothing else.
 */

:root {
  /* Color */
  --hal-bg: #ffffff;
  --hal-bg-subtle: #f5f6f7;
  --hal-bg-raised: #ffffff;
  --hal-fg: #16181d;
  --hal-fg-muted: #5b6270;
  --hal-border: #e2e5e9;
  --hal-border-strong: #c3c8d0;
  --hal-accent: #2563eb;
  --hal-accent-fg: #ffffff;
  --hal-accent-hover: #1d4ed8;
  --hal-success: #15803d;
  --hal-warning: #b45309;
  --hal-danger: #dc2626;
  --hal-danger-fg: #ffffff;
  --hal-info: #0369a1;
  --hal-overlay: rgb(15 18 25 / 0.5);
  --hal-focus-ring: #2563eb;

  /* Elevation */
  --hal-shadow-sm: 0 1px 2px rgb(15 18 25 / 0.06);
  --hal-shadow: 0 2px 8px rgb(15 18 25 / 0.1);
  --hal-shadow-lg: 0 12px 32px rgb(15 18 25 / 0.16);

  /* Spacing */
  --hal-space-1: 0.25rem;
  --hal-space-2: 0.5rem;
  --hal-space-3: 0.75rem;
  --hal-space-4: 1rem;
  --hal-space-5: 1.25rem;
  --hal-space-6: 1.5rem;
  --hal-space-7: 2rem;
  --hal-space-8: 3rem;

  /* Radius */
  --hal-radius-sm: 0.25rem;
  --hal-radius: 0.5rem;
  --hal-radius-lg: 0.75rem;
  --hal-radius-full: 9999px;

  /* Type */
  --hal-font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  --hal-font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas,
    'Liberation Mono', monospace;
  --hal-text-xs: 0.75rem;
  --hal-text-sm: 0.875rem;
  --hal-text-base: 1rem;
  --hal-text-lg: 1.125rem;
  --hal-text-xl: 1.25rem;
  --hal-weight-normal: 400;
  --hal-weight-medium: 500;
  --hal-weight-bold: 700;
  --hal-leading: 1.5;

  /* Motion */
  --hal-duration: 150ms;
  --hal-ease: cubic-bezier(0.2, 0, 0.2, 1);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-mode='light']) {
    --hal-bg: #0e1116;
    --hal-bg-subtle: #161a21;
    --hal-bg-raised: #1c212a;
    --hal-fg: #e8eaed;
    --hal-fg-muted: #9aa3b2;
    --hal-border: #262c36;
    --hal-border-strong: #39414e;
    --hal-accent: #60a5fa;
    --hal-accent-fg: #0b1220;
    --hal-accent-hover: #93c5fd;
    --hal-success: #4ade80;
    --hal-warning: #fbbf24;
    --hal-danger: #f87171;
    --hal-danger-fg: #1a0a0a;
    --hal-info: #38bdf8;
    --hal-overlay: rgb(0 0 0 / 0.6);
    --hal-focus-ring: #60a5fa;

    --hal-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
    --hal-shadow: 0 2px 8px rgb(0 0 0 / 0.5);
    --hal-shadow-lg: 0 12px 32px rgb(0 0 0 / 0.6);
  }
}

:root[data-mode='dark'] {
  --hal-bg: #0e1116;
  --hal-bg-subtle: #161a21;
  --hal-bg-raised: #1c212a;
  --hal-fg: #e8eaed;
  --hal-fg-muted: #9aa3b2;
  --hal-border: #262c36;
  --hal-border-strong: #39414e;
  --hal-accent: #60a5fa;
  --hal-accent-fg: #0b1220;
  --hal-accent-hover: #93c5fd;
  --hal-success: #4ade80;
  --hal-warning: #fbbf24;
  --hal-danger: #f87171;
  --hal-danger-fg: #1a0a0a;
  --hal-info: #38bdf8;
  --hal-overlay: rgb(0 0 0 / 0.6);
  --hal-focus-ring: #60a5fa;

  --hal-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
  --hal-shadow: 0 2px 8px rgb(0 0 0 / 0.5);
  --hal-shadow-lg: 0 12px 32px rgb(0 0 0 / 0.6);
}
```

The dark block is written twice on purpose. The media query alone cannot express "explicitly chosen dark while the system prefers light," and the attribute selector alone cannot honor the system preference. The build does not deduplicate them; the gzipped cost of the repetition is under 200 bytes.

- [ ] **Step 3: Verify the token count matches the spec**

Run: `grep -c -- '--hal-' src/styles/themes/base.css`
Expected: `65` — 45 distinct tokens, 20 of which repeat in each of the two dark blocks.

Run: `grep -o -- '--hal-[a-z0-9-]*' src/styles/themes/base.css | sort -u | wc -l`
Expected: `45`

- [ ] **Step 4: Confirm no literal colors leaked into the structure file**

Run: `grep -nE '#[0-9a-fA-F]{3,8}|rgb\(|hsl\(' src/styles/base.css`
Expected: no output, exit status 1. Any hit is a color that a theme cannot override and must be replaced with a token.

- [ ] **Step 5: Commit**

```bash
git add src/styles/base.css src/styles/themes/base.css
git commit -m "feat: add structure stylesheet and base theme tokens"
```

---

### Task 8: The CSS build

**Files:**
- Create: `scripts/build-css.ts`

- [ ] **Step 1: Write the script**

Create `scripts/build-css.ts`:

```ts
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

function buildTheme(themePath: string, structure: string): { name: string; bytes: number } {
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
```

- [ ] **Step 2: Run the build**

Run: `npx tsx scripts/build-css.ts`
Expected: prints one line, `built dist/base.css  <n> bytes`.

- [ ] **Step 3: Verify the output resolves a token in all three layers**

Run: `grep -c 'data-mode' dist/base.css`
Expected: `1` or more. Both dark blocks survived minification.

Run: `grep -c 'hal-visually-hidden' dist/base.css`
Expected: `1`. The structure half is present.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-css.ts
git commit -m "build: add per-theme CSS build with Lightning CSS"
```

---

### Task 9: The JavaScript build

**Files:**
- Create: `tsup.config.ts`

- [ ] **Step 1: Write the config**

Create `tsup.config.ts`:

```ts
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
```

- [ ] **Step 2: Run the full build**

Run: `npm run build`
Expected: tsup writes `dist/index.js` and `dist/index.d.ts`, then the CSS step writes `dist/base.css`.

- [ ] **Step 3: Verify React was not bundled**

Run: `grep -c "from 'react'" dist/index.js`
Expected: `1`. React stayed an external import rather than being inlined. Note
the single quotes: tsup emits single-quoted import specifiers, so a
double-quoted pattern silently matches nothing and the check would pass while
proving the opposite.

Run: `node -e "import('./dist/index.js').then(m => console.log(Object.keys(m).sort().join(',')))"`
Expected: `COLOR_MODE_STORAGE_KEY,ColorModeScript,useColorMode`

- [ ] **Step 4: Commit**

```bash
git add tsup.config.ts
git commit -m "build: add tsup ESM build with declarations"
```

---

### Task 10: Size budgets

**Files:**
- Create: `scripts/check-size.ts`

- [ ] **Step 1: Write the script**

Create `scripts/check-size.ts`:

```ts
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

const BUDGETS: Budget[] = [
  { file: 'dist/index.js', limitKb: 45, label: 'full library' },
  { file: 'dist/base.css', limitKb: 10, label: 'theme stylesheet: base' },
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
```

The spec's third budget, a single `Button` import under 2 KB gzipped, needs a second entry point to measure honestly. It is added in the form-components plan, when `Button` exists.

- [ ] **Step 2: Run it against a fresh build**

Run: `npm run build && npm run check:size`
Expected: two `ok` lines and `All size budgets met.` The library is nearly empty at this point, so both numbers should be small.

- [ ] **Step 3: Verify the script actually fails when it should**

The padding has to be incompressible, or gzip erases it and the check still passes. Random bytes in base64 are the cheapest source of that.

Run:
```bash
{ printf '/*'; head -c 300000 /dev/urandom | base64 | tr -d '\n'; printf '*/'; } >> dist/base.css
npx tsx scripts/check-size.ts; echo "exit: $?"
```
Expected: an `OVER` line for `dist/base.css` reporting roughly 300 KB, and `exit: 1`. A budget script that cannot fail is not a budget.

Then restore: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add scripts/check-size.ts
git commit -m "build: enforce gzipped size budgets"
```

---

### Task 11: Lint and format

**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

- [ ] **Step 1: Write the ESLint flat config**

Create `eslint.config.js`:

```js
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      // Empty catch blocks are how the color-mode hook tolerates disabled
      // storage. Allow them; require a comment saying why.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
)
```

- [ ] **Step 2: Write the Prettier config**

Create `.prettierrc.json`:

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 90,
  "trailingComma": "all"
}
```

Create `.prettierignore`:

```
dist
node_modules
package-lock.json
docs
```

`docs` is excluded deliberately. Prettier reformats Markdown, including the
fenced code blocks inside the approved design spec, and the formatter must not
rewrite signed-off documents.

- [ ] **Step 3: Format the tree and fix what lint reports**

Run: `npm run format && npm run lint`
Expected: Prettier rewrites files. ESLint then reports one error, and it is
expected: `react-hooks/set-state-in-effect` on the stored-mode read in
`useColorMode`. That read must stay in an effect, because reading storage
during render is exactly what would break hydration. Suppress that single line
and say why:

```ts
  useEffect(() => {
    // Reading storage during render would make the first client render
    // disagree with server-rendered markup. Correcting it once after mount
    // is the trade the spec asks for, and the empty dependency array means
    // it cannot cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModeState(readStoredMode())
  }, [])
```

Re-run `npm run lint`; it should exit 0. If `consistent-type-imports` flags an
import, change it to `import type`.

- [ ] **Step 4: Confirm the tests still pass after formatting**

Run: `npm test`
Expected: PASS, 20 tests across 4 files.

- [ ] **Step 5: Commit**

```bash
git add eslint.config.js .prettierrc.json .prettierignore src scripts *.ts *.json
git commit -m "chore: add ESLint and Prettier"
```

---

### Task 12: Continuous integration

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/ci.yml`:

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
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build

      - name: Size budgets
        run: npm run check:size
```

The contrast check joins this workflow in the themes plan, as its own step after `Build`.

- [ ] **Step 2: Run every CI step locally before trusting the file**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npm run check:size`
Expected: all five succeed, ending with `All size budgets met.`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: verify typecheck, lint, test, build, and size on every push"
```

---

### Task 13: Release tooling

Superseded. The plan originally specified Changesets, and Changesets was
installed and verified. The user then chose Release Please instead, so
Changesets was removed and replaced. What follows is the replacement as built.

Release Please watches `main`, reads Conventional Commit prefixes, and keeps an
open pull request that bumps the version and writes the changelog. Merging that
pull request cuts a tag and a GitHub release, which triggers the publish job.

**Files:**
- Create: `release-please-config.json`
- Create: `.release-please-manifest.json`
- Create: `.github/workflows/release.yml`
- Delete: `.changeset/`
- Modify: `package.json` (drop the `@changesets/cli` dev dependency)

- [ ] **Step 1: Remove Changesets**

```bash
rm -rf .changeset
npm uninstall @changesets/cli
```

- [ ] **Step 2: Write `release-please-config.json`**

```json
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "packages": {
    ".": {
      "release-type": "node",
      "package-name": "halcyon-ui",
      "changelog-path": "CHANGELOG.md",
      "include-component-in-tag": false,
      "bump-minor-pre-major": true,
      "bump-patch-for-minor-pre-major": false
    }
  }
}
```

`bump-minor-pre-major` keeps a breaking change below 1.0.0 at a minor bump
rather than jumping to 2.0.0, which is what a library with no components yet
wants.

- [ ] **Step 3: Write `.release-please-manifest.json`**

```json
{
  ".": "0.0.0"
}
```

Starting at `0.0.0` means the first `feat:` commit produces `0.1.0`.

- [ ] **Step 4: Write `.github/workflows/release.yml`**

```yaml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs.release_created }}
      tag_name: ${{ steps.release.outputs.tag_name }}
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json

  publish:
    needs: release-please
    if: needs.release-please.outputs.release_created == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      # Required for npm provenance, which package.json requests.
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ needs.release-please.outputs.tag_name }}

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
          cache: npm

      - run: npm ci

      # The tag is already cut, so verify before anything reaches the registry.
      - name: Verify
        run: |
          npm run typecheck
          npm run lint
          npm test
          npm run build
          npm run check:size

      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 5: Verify the configuration parses and the toolchain still builds**

```bash
node -e "JSON.parse(require('fs').readFileSync('release-please-config.json','utf8'))"
node -e "JSON.parse(require('fs').readFileSync('.release-please-manifest.json','utf8'))"
npm run typecheck && npm run lint && npm test && npm run build && npm run check:size
```

Expected: no JSON errors, and the full chain still passes after the dependency
removal.

- [ ] **Step 6: Commit**

```bash
git add release-please-config.json .release-please-manifest.json \
  .github/workflows/release.yml package.json package-lock.json
git commit -m "ci: replace Changesets with Release Please"
```

**Requires user action, cannot be done from here:** an `NPM_TOKEN` repository
secret with publish rights. Without it the publish job fails at `npm publish`;
the release pull request and the tag still work.

---

## Done when

All of the following hold on a clean checkout:

- `npm ci && npm run typecheck && npm run lint && npm test && npm run build && npm run check:size` succeeds end to end.
- `dist/` contains `index.js`, `index.d.ts`, and `base.css`.
- Importing `dist/index.js` yields exactly `ColorModeScript`, `useColorMode`, and `COLOR_MODE_STORAGE_KEY`.
- No runtime dependency appears in `package.json`.

## Execution record

Executed 2026-09-09. All thirteen tasks completed and committed. Tasks 3, 4 and
5, 7 and 8, and 13 ran concurrently as four independent agents; the rest ran
sequentially. Nine corrections were folded back into the text above after the
run. The five that cost real time:

| Surprise | Resolution |
| --- | --- |
| `@types/node` was never installed, and `types: ["vitest/globals"]` suppressed ambient types. Nothing imported a Node builtin until the CSS build, so it surfaced late. | Installed the package, added `"node"` to the types array. |
| TypeScript 6 errors on `baseUrl`, which tsup's declaration builder sets internally. The dts build failed. | `"ignoreDeprecations": "6.0"` in tsconfig. |
| `changeset init` is interactive with no non-interactive flag; it hangs and exits 13. | Wrote `config.json` directly and copied the tool's own bundled README. Later removed entirely, see below. |
| `npm run format` reformatted the approved design spec, rewriting its code fences. | Added `docs` to `.prettierignore` and reverted. |
| `react-hooks/set-state-in-effect` flags the deliberate hydration read in `useColorMode`. | Suppressed that one line with the reason. The rule does not flag the same pattern four lines below. |

Final state: `typecheck`, `lint`, `test` (20 tests in 4 files), `build`, and
`check:size` all pass. The library is 0.83 KB gzipped against a 45 KB budget and
the base stylesheet 0.97 KB against 10 KB.

**Amended after the run.** The user replaced Changesets with Release Please.
Task 13 above is the replacement as built. One consequence is worth recording:
the plan called for Conventional Commit messages and the run used plain ones
instead, so none of the fifteen foundation commits carry a prefix Release Please
recognizes. They will never produce a release. The first release will be `0.1.0`,
cut from the next `feat:` commit. Every commit from here needs a prefix.

## What this plan deliberately leaves out

| Deferred | Lands in |
| --- | --- |
| The other seven themes and `scripts/check-contrast.ts` | Themes plan |
| `useFocusTrap`, `useDismissable`, `internal/position.ts` | Overlay plan |
| `internal/date.ts` | Expensive-components plan |
| The 2 KB single-`Button` size budget | Form-components plan |
| Theming layers 2 and 3: per-component tokens, forwarded `className`, `style`, rest props, and refs | Every component plan, per component |
| README | Documentation plan, last |
