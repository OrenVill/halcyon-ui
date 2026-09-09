# halcyon-ui Form Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship ten form components with real styling, keyboard and ARIA behavior, tests, and a tree-shaking budget that proves importing one component does not drag in the rest.

**Architecture:** Each component is a folder holding a `.tsx`, a `.css`, a test, and an `index.ts`, with no cross-component imports. The CSS build gains a step that concatenates every component stylesheet after the structure file, so a theme import still delivers everything. Components read their own tokens that fall back to global ones, which is theming layer 2.

**Tech Stack:** React 19, TypeScript strict, Vitest, Testing Library, vitest-axe, Lightning CSS.

**Source spec:** `docs/superpowers/specs/2026-09-09-halcyon-ui-design.md`, sections 3 and 4.

**Depends on:** the foundation and themes plans, both complete.

**Scope:** Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, NumberInput. Combobox, DatePicker and FileUpload are the expensive components and land in the final plan.

---

## Shared conventions

Every component in this library obeys all of these. They are not suggestions; a
component that breaks one is wrong even if its tests pass.

**1. Class names.** Base class `hal-<name>` in kebab case. Variant class
`hal-<name>--<variant>`. Size class `hal-<name>--<size>`. Stable, unhashed,
never generated at runtime.

**2. Escape hatches, all three.** Forward the ref to the real DOM node. Merge
`className` after the library's own classes so the consumer wins on equal
specificity. Spread every remaining prop onto the DOM element. This is theming
layer 3 and it is what makes the library usable when its own API falls short.

**3. Component tokens.** Every visual property reads a component token that
falls back to a global one:

```css
.hal-button {
  background: var(--hal-button-bg, var(--hal-accent));
  border-radius: var(--hal-button-radius, var(--hal-radius));
}
```

This is theming layer 2. A consumer restyles one component without touching
the rest.

**4. Sizes.** `'sm' | 'md' | 'lg'`, default `'md'`, wherever size is meaningful.

**5. No literal colors in any component CSS.** Colors come from tokens only, or
a theme cannot repaint the component. Enforced by a check in Task 12.

**6. Native elements wherever one exists.** A checkbox is an `<input
type="checkbox">`, not a `<div role="checkbox">`. Free keyboard behavior, free
form participation, free assistive-technology support. Style the native element.

**7. Controlled and uncontrolled both work.** Never force a `value` prop on a
component whose native element already supports `defaultValue`.

---

### Task 1: Button, the reference implementation

Every later component copies this one's shape. Build it first and get it right.

**Files:** `src/components/Button/{Button.tsx,Button.css,Button.test.tsx,index.ts}`

**API:**

```ts
type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant   // default 'solid'
  size?: ButtonSize         // default 'md'
  fullWidth?: boolean       // default false
}
```

`type` defaults to `"button"`, not `"submit"`. A button inside a form that
submits when the author did not ask it to is a bug that ships constantly.

- [ ] **Step 1: Write the failing test** covering: renders children; applies
  `hal-button` plus the variant and size classes; defaults to solid, md, and
  `type="button"`; merges `className` rather than replacing; merges `style`;
  forwards the ref to the `<button>` element; spreads unknown props;
  `disabled` works; click fires; axe reports no violations.

- [ ] **Step 2: Run it and confirm it fails** on the unresolved import.

- [ ] **Step 3: Implement** `Button.tsx` with `forwardRef`, `cx` for class
  merging, and rest-prop spreading. Write `Button.css` using component tokens
  with global fallbacks for every property, one block per variant and size.

- [ ] **Step 4: Run the tests and confirm they pass.**

- [ ] **Step 5: Commit** as `feat: add Button`.

---

### Tasks 2 through 10: the remaining nine

Each is one folder, independent of the others, following Button exactly.

- [ ] **Task 2 — IconButton.** Square. Same variants and sizes as Button.
  Requires an accessible name: if neither `aria-label` nor `aria-labelledby` is
  present, warn in development, because an icon-only button with no name is
  invisible to a screen reader.

- [ ] **Task 3 — Input.** `<input>`. Props: `size`, `invalid`. `invalid` sets
  `aria-invalid` and the `hal-input--invalid` class. Note the collision: the
  DOM already has a numeric `size` attribute on inputs, so the prop must be
  omitted from the spread and never reach the element.

- [ ] **Task 4 — Textarea.** `<textarea>`. Props: `size`, `invalid`. Same
  `size` collision does not apply, but keep the prop out of the spread anyway
  for consistency.

- [ ] **Task 5 — Select.** **Revised during execution.** Originally specified as
  a native `<select>`. That was wrong: the browser draws a native dropdown
  itself, so the list ignores every theme token and only the closed trigger
  themes. Rebuilt as a listbox: a `role="combobox"` trigger over a
  `role="listbox"` panel, with `aria-activedescendant`, arrow-key navigation,
  Home and End, type-ahead, Escape, click-outside, focus restored to the
  trigger, disabled options skipped, and flip-up when there is no room below.
  Takes an `options` array rather than `<option>` children, and renders a
  hidden input so the value still participates in form submission.

- [ ] **Task 6 — Checkbox.** `<input type="checkbox">`. Props: `size`,
  `indeterminate`. Indeterminate is not an attribute; it is a DOM property, so
  set it in an effect against a merged ref, and keep the forwarded ref working.

- [ ] **Task 7 — Radio.** `<input type="radio">`. Props: `size`. Grouping is
  the consumer's job via the native `name` attribute.

- [ ] **Task 8 — Switch.** `<input type="checkbox" role="switch">`. Props:
  `size`. Native checkbox semantics with a switch role, so space toggles it for
  free.

- [ ] **Task 9 — Slider.** `<input type="range">`. Props: `size`. Arrow keys,
  Home and End come free from the native element, which is the entire reason to
  use it. Style the track and thumb for both WebKit and Firefox.

- [ ] **Task 10 — NumberInput.** The only composite here. An `<input
  type="text" inputMode="decimal">` flanked by decrement and increment buttons.
  Props: `value`, `defaultValue`, `onValueChange`, `min`, `max`, `step`, `size`,
  `invalid`. Arrow Up and Arrow Down step the value, Home and End jump to min
  and max when those are set. The stepper buttons are `aria-hidden` with
  `tabIndex={-1}`, because the input itself already exposes the behavior to
  assistive technology and duplicating it creates three tab stops for one
  control. Clamps to min and max. Works controlled and uncontrolled.

**Acceptance test, identical for every component.** Substitute the name:

```bash
npx vitest run src/components/<Name>          # all tests pass, axe clean
npx tsc --noEmit                              # exit 0
grep -nE '#[0-9a-fA-F]{3,8}|rgb\(|hsl\(' src/components/<Name>/<Name>.css
# expected: no output. Literal colors cannot be themed.
```

---

### Task 11: Ship the component CSS

The CSS build currently concatenates one theme with `src/styles/base.css` only.
Component stylesheets exist now and must reach `dist`.

- [ ] **Step 1:** In `scripts/build-css.ts`, after reading the structure file,
  read every `src/components/*/*.css` sorted by path and append them, so output
  order is theme tokens, then structure, then components.

- [ ] **Step 2:** Verify `dist/base.css` contains `.hal-button` and that all
  eight themes still build.

- [ ] **Step 3:** Confirm the per-theme 10 KB gzipped budget still holds now
  that component rules are included.

---

### Task 12: Budgets and guards

- [ ] **Step 1: The single-Button budget.** The spec requires one `Button`
  import to stay under 2 KB gzipped. Measuring it needs a bundle containing only
  Button, which `dist/index.js` is not. In `scripts/check-size.ts`, use the
  `esbuild` already present under `tsup` to bundle a synthetic entry that
  imports only `Button` from the built package, minified, with React external,
  and gzip the result. This measures real tree-shaking of the published
  artifact rather than a guess.

- [ ] **Step 2: The no-literal-colors guard.** Add a check that scans every
  component stylesheet for hex, `rgb(` and `hsl(` literals and fails if any is
  found. A literal color is a color no theme can override, and catching it by
  eye does not scale to 34 components.

- [ ] **Step 3:** Wire both into CI and verify the full chain passes.

---

## Execution record

Executed 2026-09-09. Button was built first as the reference; the remaining
nine were authored concurrently by four agents copying it. 231 tests pass with
accessibility checks clean on every component.

Three things changed during the run:

- **Select was rebuilt.** See Task 5. A native select cannot be themed.
- **The tree-shaking budget caught a real defect.** Every component is
  `forwardRef(...)` at module scope, and a bundler cannot prove a bare call has
  no side effects, so a consumer importing one component shipped all of them.
  Marking the calls `/* @__PURE__ */` at the source fixed it: a lone Button
  import fell from 2.88 KB to 0.41 KB. Setting esbuild's `pure` option through
  the tsup config did not work; the annotation has to be in the source.
- **The literal-color guard needed narrowing.** Its first version scanned whole
  lines and flagged the word `white` inside the `white-space` property. It
  scans declaration values only.

| Measure | Result |
| --- | --- |
| Full library, gzipped | 4.54 KB against 45 KB |
| A lone Button import | 0.41 KB against 2 KB |
| Each theme stylesheet | about 3.8 KB against 10 KB |

## Done when

- Ten component folders exist, each with a component, stylesheet, tests and barrel.
- `npm test` passes with axe clean on every component.
- `dist/<theme>.css` contains the component rules for all eight themes.
- A lone `Button` import is under 2 KB gzipped and the full library under 45 KB.
- No component stylesheet contains a literal color.
