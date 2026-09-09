# halcyon-ui Display Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the nine display components, the presentational half of the library.

**Architecture:** Identical to the form components: one folder each, no cross-component imports, component tokens over global tokens, native elements where they exist. Nothing here needs new shared infrastructure, which is why it comes before the overlays.

**Tech Stack:** React 19, TypeScript strict, Vitest, Testing Library, vitest-axe.

**Source spec:** `docs/superpowers/specs/2026-09-09-halcyon-ui-design.md`, section 4.

**Depends on:** the form components plan, complete.

**Correction this plan fixes:** the original six-plan split named foundation, themes, form, overlays, navigation and the four expensive components. That accounts for 26 of 34. The nine display components were never assigned to a plan. They are this one.

**Scope:** Card, Badge, Avatar, Alert, Table, Progress, Spinner, Skeleton, Tag.

---

## Shared conventions

Unchanged from the form components plan, and non-negotiable. Read
`src/components/Button/` before writing anything.

1. Base class `hal-<name>`, variant class `hal-<name>--<variant>`, size class
   `hal-<name>--<size>`. Stable and unhashed.
2. Forward the ref to the real DOM node, merge `className` after the library's
   own classes, spread every remaining prop.
3. Every CSS property reads a component token that falls back to a global one.
4. Sizes `'sm' | 'md' | 'lg'`, default `'md'`, where size is meaningful.
5. No literal colors in component CSS. `npm run check:css` fails the build.
6. **Annotate the forwardRef call**: `export const X = /* @__PURE__ */ forwardRef<…>`.
   Without it a bundler cannot prove the call is side-effect-free and every
   consumer ships the whole library. This is not optional; the size budget
   catches it.

---

### Task 1: Card

`<div>`. Props: `variant` (`'outline' | 'raised' | 'subtle'`, default `'outline'`),
`padding` (`'none' | 'sm' | 'md' | 'lg'`, default `'md'`). Not every surface is a
card, so the three variants differ in weight rather than all carrying a shadow:
outline is a hairline border, raised adds elevation, subtle is a filled panel
with no border.

Tests: renders children, variant and padding classes, className and style merge,
ref forwarding, rest-prop spread, axe clean.

### Task 2: Badge

`<span>`. Props: `variant` (`'neutral' | 'accent' | 'success' | 'warning' |
'danger' | 'info'`, default `'neutral'`), `size` (`'sm' | 'md'`, default `'md'`).
A badge is a label, not a control: no click handling, no focus.

Tests: renders children, every variant class, both size classes, className and
style merge, ref forwarding, rest-prop spread, axe clean.

### Task 3: Avatar

Props: `src`, `alt`, `name`, `size` (`'sm' | 'md' | 'lg'`), `shape`
(`'circle' | 'square'`, default `'circle'`).

Renders an `<img>` when `src` is given. **On image load failure it falls back to
initials derived from `name`**, because a broken image icon in a user list is
worse than a monogram. With no `src`, render the initials directly. With neither
`src` nor `name`, render a neutral placeholder that is `aria-hidden`, since an
empty avatar carries no information for a screen reader.

Derive at most two initials from `name`, uppercased, handling a single-word name.

Tests: renders the image with its alt text; falls back to initials when the image
fires an error event (fire it with `fireEvent.error`); renders initials with no
src; two-word and one-word names both produce sensible initials; the empty
placeholder is aria-hidden; size and shape classes; className and style merge;
ref forwarding; axe clean in the image case and the initials case.

### Task 4: Alert

Props: `variant` (`'info' | 'success' | 'warning' | 'danger'`, default `'info'`),
`title`, `onDismiss`.

Role matters and must be chosen, not copied: `danger` gets `role="alert"`, which
interrupts a screen reader; the rest get `role="status"`, which does not. An
informational message that interrupts is a bug.

When `onDismiss` is given, render a close button with an accessible name. Do not
import IconButton; components never import each other. Render a plain button and
style it.

Tests: renders title and children; every variant class; danger uses role alert
and info uses role status; the dismiss button appears only with `onDismiss` and
calls it; the dismiss button has an accessible name; className and style merge;
ref forwarding; axe clean with and without dismissal.

### Task 5: Table

`<table>`. Props: `size`, `striped` (boolean). Style descendant `th` and `td`
from the root class rather than requiring wrapper components, so a consumer can
write ordinary table markup.

The root must sit in a container with `overflow-x: auto`, because a wide table
that makes the page scroll sideways is the single most common table bug.

Tests: renders a table with its rows; size and striped classes; the scroll
container exists; className and style merge; ref forwarding to the table element;
axe clean with a proper header row.

### Task 6: Progress

Props: `value` (number, optional), `max` (default 100), `size`, `variant`
(`'accent' | 'success' | 'danger'`).

With `value` omitted it is indeterminate: animate the bar and omit
`aria-valuenow`, which is exactly what the ARIA spec means by an indeterminate
progressbar. With `value` present set `aria-valuenow`, `aria-valuemin` and
`aria-valuemax`, and clamp the fill between 0 and `max`.

Respect `prefers-reduced-motion` for the indeterminate animation.

Tests: role progressbar; determinate sets aria-valuenow and the fill width;
indeterminate omits aria-valuenow and adds the indeterminate class; clamps below
0 and above max; size and variant classes; className and style merge; ref
forwarding; axe clean, and axe clean when given an aria-label.

### Task 7: Spinner

Props: `size`, `label` (default `'Loading'`).

`role="status"` with an accessible name, and the visual element `aria-hidden`.
A spinner with no name is silence to a screen reader. Provide the name through
visually hidden text using the existing `hal-visually-hidden` class from
`src/styles/base.css`.

Respect `prefers-reduced-motion`: replace the spin with a fade rather than
stopping dead, so the control still reads as busy.

Tests: role status; the label is in the accessible name; a custom label is used;
the graphic is aria-hidden; size classes; className and style merge; ref
forwarding; axe clean.

### Task 8: Skeleton

Props: `variant` (`'text' | 'circle' | 'rect'`, default `'text'`), `width`,
`height`, `lines` (number, default 1, only meaningful for `text`).

`aria-hidden="true"` always: a skeleton is a placeholder for content that does
not exist yet, and announcing it tells the user nothing. Where `lines > 1`,
render that many bars with the last one short, which is what makes a skeleton
read as a paragraph rather than a stack of blocks.

Respect `prefers-reduced-motion`.

Tests: renders one bar by default; `lines` renders that many; the last line is
short; variant classes; width and height apply as inline styles; the root is
aria-hidden; className and style merge; ref forwarding; axe clean.

### Task 9: Tag

Props: `variant` (`'neutral' | 'accent' | 'success' | 'warning' | 'danger'`),
`size` (`'sm' | 'md'`), `onRemove`.

A Tag differs from a Badge by being removable. When `onRemove` is given, render
a remove button with an accessible name that includes the tag's text, so a
screen reader user hears which tag they are removing rather than a wall of
identical "Remove" buttons. The remove button is a real focusable button.

Tests: renders children; variant and size classes; the remove button appears
only with `onRemove` and calls it; its accessible name includes the tag label;
the remove button is focusable and activates on Enter; className and style
merge; ref forwarding; axe clean with and without removal.

---

### Task 10: Wire up

- [ ] Export all nine from `src/index.ts`, alphabetically among the existing
  exports, values and types.
- [ ] Extend `src/index.test.ts` so the expected-export list covers them.
- [ ] Add each to `gallery/main.tsx` with real specimens, and rebuild the sheet.
- [ ] Run the full chain: `npm run typecheck && npm run lint && npm test &&
  npm run build && npm run check:size && npm run check:contrast &&
  npm run check:css`.

---

## Done when

- Nine component folders exist, each with component, stylesheet, tests, barrel.
- Every component is exported and appears on the proof sheet.
- All tests pass with axe clean on every component.
- Budgets hold: full library under 45 KB, a lone Button import under 2 KB.
- No component stylesheet contains a literal color.

## Remaining after this plan

| Plan | Components |
| --- | --- |
| Overlays | Modal, Drawer, Tooltip, Popover, DropdownMenu, Toast, plus `useFocusTrap`, `useDismissable`, `internal/position.ts` |
| Navigation | Tabs, Accordion, Pagination, Breadcrumb, Stepper |
| Expensive | Combobox, DatePicker, FileUpload, Wizard, plus `internal/date.ts` |
| Documentation | README |
