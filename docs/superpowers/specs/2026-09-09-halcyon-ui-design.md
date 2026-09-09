# halcyon-ui — Design

**Date:** 2026-09-09
**Status:** Approved
**Repo:** github.com/OrenVill/halcyon-ui (public, MIT)
**Package:** `halcyon-ui` on npm

## 1. Goal

A React component library of 34 styled, accessible components that ship with a
real look out of the box, come in 8 themes, and can be rethemed end to end
through CSS custom properties. Lightweight is a hard requirement, not an
aspiration: React is the only dependency and it is a peer dependency.

### Non-goals

- No Storybook or docs site in v1. The README is the documentation.
- No CommonJS build. ESM only.
- No CSS-in-JS, no Tailwind requirement, no build-step requirement beyond a
  bundler that can import a CSS file.
- No form-state, routing, data-fetching, or icon-set functionality. Components
  are presentational plus their own interaction behavior.

## 2. Consumer API

One theme import at app start, one package import for components.

```jsx
import 'halcyon-ui/midnight'          // theme: ships light AND dark
import { Button, Modal, useColorMode } from 'halcyon-ui'

function Header() {
  const { mode, setMode, toggle } = useColorMode()
  return <Button variant="ghost" onClick={toggle}>{mode}</Button>
}
```

Rules this API must satisfy:

- A theme import is the only stylesheet a consumer ever needs.
- Light and dark both arrive with that single import. There is no second import
  and no separate dark stylesheet.
- Someone who wants to build their own theme imports `halcyon-ui/base` instead,
  which carries structure, layout, and states with deliberately plain colors.

### Color mode

Default behavior with no JavaScript involved: the theme stylesheet honors
`prefers-color-scheme`. Explicit choice wins over the system preference through
a `data-mode` attribute on `<html>`.

Each theme stylesheet defines its tokens three times, following this exact
pattern, so that both the system preference and an explicit override resolve
correctly in both directions:

```css
:root                                        { /* light tokens */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-mode="light"])             { /* dark tokens */ }
}
:root[data-mode="dark"]                      { /* dark tokens */ }
```

`useColorMode()` is exported from the package root, so it needs no extra import.
It returns `{ mode, resolvedMode, setMode, toggle }` where `mode` is
`'light' | 'dark' | 'system'` and `resolvedMode` is `'light' | 'dark'`, the mode
actually in effect. `toggle()` sets an explicit mode that is the opposite of
`resolvedMode`, so calling it from `'system'` always produces a definite choice.
It writes `data-mode` on the document element, persists the choice in
`localStorage` under `halcyon-mode`, and subscribes to the system preference
while `mode` is `'system'`. Every read and write of `localStorage` is wrapped in
try/catch, and the hook renders correctly when storage throws or is empty.

Server rendering: the hook reads nothing during render, so server and client
markup match. A `<ColorModeScript />` component is exported for apps that want
to block the flash of the wrong theme; it emits a tiny inline script that sets
`data-mode` before paint.

## 3. Theming architecture

Three layers. Each is overridden by the next.

**Layer 1 — global tokens.** Roughly 40 custom properties, all prefixed `--hal-`,
defined by the theme stylesheet:

- Color: `--hal-bg`, `--hal-bg-subtle`, `--hal-bg-raised`, `--hal-fg`,
  `--hal-fg-muted`, `--hal-border`, `--hal-border-strong`, `--hal-accent`,
  `--hal-accent-fg`, `--hal-accent-hover`, `--hal-success`, `--hal-warning`,
  `--hal-danger`, `--hal-danger-fg`, `--hal-info`, `--hal-overlay`,
  `--hal-focus-ring`
- Spacing: `--hal-space-1` through `--hal-space-8`
- Radius: `--hal-radius-sm`, `--hal-radius`, `--hal-radius-lg`,
  `--hal-radius-full`
- Type: `--hal-font-sans`, `--hal-font-mono`, `--hal-text-xs` through
  `--hal-text-xl`, `--hal-weight-normal`, `--hal-weight-medium`,
  `--hal-weight-bold`, `--hal-leading`
- Elevation and motion: `--hal-shadow-sm`, `--hal-shadow`, `--hal-shadow-lg`,
  `--hal-duration`, `--hal-ease`

**Layer 2 — component tokens.** Every component reads its own variables that
fall back to global tokens, so a consumer can restyle one component without
touching the rest:

```css
.hal-button {
  background: var(--hal-button-bg, var(--hal-accent));
  border-radius: var(--hal-button-radius, var(--hal-radius));
}
```

**Layer 3 — escape hatches.** Every component forwards `className`, `style`, and
all remaining props to its underlying DOM element, and forwards refs. Class
names are stable, unhashed, and prefixed `hal-`, so consumers can target them.

### Theme lineup

Eight themes, each with light and dark: `base`, `midnight`, `aurora`, `ember`,
`forest`, `sandstone`, `mono`, `neon`.

`base` is intentionally plain and is the documented starting point for a custom
theme. Each theme is exported as a package subpath: `halcyon-ui/midnight` and so
on, resolving to a prebuilt CSS file.

Every theme's light and dark palettes must clear WCAG AA contrast for body text
and for text on accent surfaces. This is checked by a script in CI, not by eye.

## 4. Components

34 components, each in its own folder with no cross-component imports, so a
bundler can drop everything untouched.

**Form (13):** Button, IconButton, Input, Textarea, Select, Checkbox, Radio,
Switch, Slider, NumberInput, Combobox, DatePicker, FileUpload
**Display (9):** Card, Badge, Avatar, Alert, Table, Progress, Spinner, Skeleton,
Tag
**Overlay (6):** Modal, Drawer, Tooltip, Popover, DropdownMenu, Toast
**Navigation (6):** Tabs, Accordion, Pagination, Breadcrumb, Stepper, Wizard

Every component: typed props, `variant` and `size` where meaningful, forwarded
ref, forwarded rest props, and keyboard plus ARIA behavior appropriate to its
role.

Toast is the one component with an ambient part: a `<ToastProvider>` mounts a
portal and exposes a `useToast()` hook. Nothing else in the library requires a
provider.

Overlay components additionally handle focus trapping, restoring focus on close,
`Escape` to dismiss, click-outside to dismiss, and `aria-modal` or the correct
role. Tabs, Accordion, DropdownMenu, and Slider implement arrow-key navigation
per the ARIA authoring practices.

### The four expensive components

**Combobox.** Text input filtering a listbox, with keyboard navigation, type-ahead,
optional multi-select rendering selections as `Tag`s, and the full
`combobox`/`listbox`/`option` ARIA pattern including `aria-activedescendant`.
Filtering is overridable so consumers can drive it from a server. It reuses the
shared positioning helper for its panel.

**DatePicker.** Calendar popover built on the native `Date` object, with month
and weekday names formatted through `Intl.DateTimeFormat`, so every locale works
with no dependency. Supports single date and range, arrow-key grid navigation,
`PageUp`/`PageDown` for months, min and max bounds, and disabled dates. Our own
date math stays under roughly 1KB and lives in `internal/date.ts`.

**FileUpload.** Drag-and-drop dropzone with click-to-browse, accept and size
filtering, a file list with previews for images, per-file progress, and remove.
It reports files to the consumer and never uploads anything itself.

**Wizard.** An unopinionated state container. It holds the current step, renders
only the active step, renders a `Stepper` above the content, and exposes
`next`, `back`, `goTo`, and `canGoNext`. Per-step validation is supplied by the
app as an async guard the wizard awaits before advancing. It collects no form
data and makes no branching decisions.

### Positioning

Tooltip, Popover, and DropdownMenu need anchored positioning. Rather than depend
on Floating UI (~10KB), the library includes one shared internal helper of about
1KB that measures the anchor, places the panel on the requested side, flips it
when it would overflow the viewport, and shifts it along the cross axis to stay
in view. Its known limits (no automatic size adjustment, no scroll-container
edge cases beyond the viewport) are documented in the README.

## 5. Repository structure

```
src/
  index.ts                    # public exports, the only barrel
  components/
    Button/
      Button.tsx
      Button.css
      Button.test.tsx
      index.ts
    ...one folder per component
  hooks/
    useColorMode.ts
    useFocusTrap.ts
    useDismissable.ts
  internal/
    position.ts               # the ~1KB anchoring helper
    date.ts                   # calendar math for DatePicker, Intl for names
    cx.ts
  styles/
    base.css                  # structure and layout, plain colors
    themes/
      midnight.css            # tokens only, light + dark
      ...eight files
scripts/
  build-css.ts                # base.css + theme tokens -> dist/<theme>.css
  check-contrast.ts
  check-size.ts
```

## 6. Build and tooling

| Concern | Choice |
| --- | --- |
| Language | TypeScript, `strict: true` |
| JS build | tsup, ESM only, with declaration files |
| CSS build | Lightning CSS, minified, one output file per theme plus `base` |
| React support | peer dependency, `^18 \|\| ^19` |
| Runtime dependencies | none |
| Lint and format | ESLint with the TypeScript and React Hooks configs, Prettier |
| Tests | Vitest, Testing Library, jsdom, `vitest-axe` |
| CI | GitHub Actions: typecheck, lint, test, build, size, contrast |
| Releases | Changesets, publish to npm with provenance from CI |

`package.json` declares `"type": "module"`, `"sideEffects": ["**/*.css"]`, and an
`exports` map with the root entry plus one subpath per theme and `./base`.

## 7. Testing

Every component gets tests covering: it renders, each variant applies the
expected class, `className` and `style` merge rather than replace, the ref
reaches the DOM node, keyboard interaction works, and axe reports no violations.
Overlay components additionally test focus trap, focus restoration, and Escape.

Vitest runs in jsdom. The bar for a component to be considered done is that its
tests pass and axe is clean.

## 8. Size budgets

Enforced by `scripts/check-size.ts` in CI. The build fails if any budget is
exceeded.

| Measure | Budget |
| --- | --- |
| Full library, all 34 components, gzipped | 45 KB |
| A single `Button` import, gzipped | 2 KB |
| One theme stylesheet, gzipped | 10 KB |

## 9. README

The README is the documentation. It contains: install and quick start, the
theme table, the color-mode section, a
customization guide covering all three layers with a worked custom-theme
example, one copyable example per component, the positioning helper's limits,
and contributing plus license sections. Props are documented from the
TypeScript types.

## 10. Open items

- Publishing requires `npm login` on this machine, which only the user can run.
  Everything up to `npm publish` will be prepared and verified first.
- Commits are authored as `OrenVill <124083716+OrenVill@users.noreply.github.com>`
  passed per commit. No git identity is written to any config file.
