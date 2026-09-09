# halcyon-ui Overlay Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the six overlay components on top of three shared pieces of infrastructure: anchored positioning, focus trapping, and dismissal.

**Architecture:** This is the first plan with real shared code. Positioning is a **pure function over rectangles**, which is what makes it testable at all: jsdom implements no layout, so a positioning helper that reads the DOM directly cannot be tested, while one that takes rects and returns coordinates can. The two hooks wrap the browser behavior around it.

**Tech Stack:** React 19, TypeScript strict, Vitest, Testing Library, vitest-axe.

**Source spec:** `docs/superpowers/specs/2026-09-09-halcyon-ui-design.md`, sections 4 and 5.

**Depends on:** foundation, themes, form and display plans, all complete.

**Scope:** `internal/position.ts`, `hooks/useFocusTrap.ts`, `hooks/useDismissable.ts`, then Modal, Drawer, Tooltip, Popover, DropdownMenu, Toast.

---

## Why the infrastructure comes first, and is not delegated

Six components share these three pieces. Six independent interpretations of
"trap focus" would produce six subtly different behaviors, and the differences
would show up as accessibility bugs rather than visual ones. The coordinator
builds all three, with tests, before any component task starts.

---

### Task 1: `internal/position.ts`

The spec budgets roughly 1 KB rather than depending on Floating UI at ~10 KB.

**The design decision that matters:** the exported function is pure. It takes an
anchor rectangle, the panel's size, and the viewport size, and returns
coordinates plus the side actually used. It touches no DOM. Callers do the
measuring. This is what lets it be tested exhaustively in jsdom, which has no
layout engine and reports every rectangle as zero.

```ts
export type Side = 'top' | 'bottom' | 'left' | 'right'
export type Align = 'start' | 'center' | 'end'

export interface Rect { x: number; y: number; width: number; height: number }
export interface Size { width: number; height: number }

export interface PositionOptions {
  side?: Side       // preferred, default 'bottom'
  align?: Align     // default 'center'
  offset?: number   // gap from the anchor, default 8
  padding?: number  // minimum gap from the viewport edge, default 8
}

export interface Placement { x: number; y: number; side: Side }

export function computePosition(
  anchor: Rect,
  panel: Size,
  viewport: Size,
  options?: PositionOptions,
): Placement
```

Behavior, in this order:
1. Place on the requested side, at the requested alignment, `offset` away.
2. **Flip** to the opposite side when the panel would overflow that edge and the
   opposite side has more room.
3. **Shift** along the cross axis so the panel stays inside the viewport, less
   `padding`, without changing sides.
4. Never move the panel so far that it leaves the viewport on the other edge; a
   panel wider than the viewport clamps to `padding` and is allowed to overflow
   the far edge, because there is nowhere else for it to go.

Documented limits, which the README must repeat: no automatic resizing, and no
awareness of scroll containers other than the viewport.

- [ ] Write the failing tests first, covering: each side at each alignment;
  flip up when there is no room below; flip down when there is no room above;
  no flip when both sides are equally cramped, preferring the requested side;
  shift left and right to stay in view; a panel wider than the viewport;
  a panel taller than the viewport; custom offset and padding.
- [ ] Implement, then confirm the tests pass.

### Task 2: `hooks/useFocusTrap.ts`

```ts
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void
```

On activation: remember `document.activeElement`, then move focus to the first
focusable element inside the container, or the container itself when it holds
none. While active: Tab from the last focusable wraps to the first, Shift+Tab
from the first wraps to the last. On deactivation: **restore focus to the
element that had it**, because a dialog that closes and drops focus to the
document body strands a keyboard user at the top of the page.

Query focusable elements at the moment Tab is pressed, not once on mount. An
overlay's contents change while it is open.

- [ ] Tests: focus moves in on activation; Tab wraps forward; Shift+Tab wraps
  backward; focus is restored on deactivation; a container with nothing
  focusable receives focus itself; it does not throw when the previously
  focused element has been removed from the document.

### Task 3: `hooks/useDismissable.ts`

```ts
export interface DismissableOptions {
  onDismiss: () => void
  active?: boolean          // default true
  closeOnEscape?: boolean   // default true
  closeOnOutside?: boolean  // default true
}
export function useDismissable(
  ref: RefObject<HTMLElement | null>,
  options: DismissableOptions,
): void
```

Escape on the document, and pointer-down outside the referenced element. Use
`pointerdown`, not `click`: a click fires after the pointer is released, by
which time focus has already moved and a select-like control has already
mangled its own state.

- [ ] Tests: Escape dismisses; a pointer down outside dismisses; a pointer down
  inside does not; nothing fires while inactive; each flag can be disabled
  independently; listeners are removed on unmount.

---

### Tasks 4 to 9: the components

Every one follows the conventions from the form components plan, including the
`/* @__PURE__ */` annotation on `forwardRef`, and imports nothing from another
component.

- [ ] **Task 4 — Modal.** Portal to `document.body`. `role="dialog"`,
  `aria-modal="true"`, labelled by its title. Focus trapped, focus restored,
  Escape and backdrop click dismiss. **Locks body scroll while open**, and
  restores the previous overflow rather than assuming it was `visible`.

- [ ] **Task 5 — Drawer.** Modal's behavior with a `side` prop
  (`'left' | 'right' | 'top' | 'bottom'`). Same dialog semantics and the same
  scroll lock.

- [ ] **Task 6 — Tooltip.** Shows on hover and on focus, hides on blur, on
  pointer leave, and on Escape. `role="tooltip"`, wired to its trigger with
  `aria-describedby`. A delay before opening, none before closing. **Not
  focusable itself**, and never the only place information appears: a tooltip
  is inaccessible to touch users, so it may only describe, never define.

- [ ] **Task 7 — Popover.** Anchored panel with focus trapping, Escape,
  click-outside, and focus restoration. Uses `computePosition`.

- [ ] **Task 8 — DropdownMenu.** `role="menu"` with `role="menuitem"` children,
  arrow-key navigation, Home and End, type-ahead, Escape, click-outside, and
  focus restoration. Roving focus, not `aria-activedescendant`, because menu
  items are real focus targets in the ARIA authoring practices.

- [ ] **Task 9 — Toast.** The one component with an ambient part. A
  `<ToastProvider>` mounts a portal and exposes `useToast()`. Toasts stack, each
  auto-dismisses on a timer that **pauses on hover and on focus**, and the
  region is `aria-live="polite"` so arrivals are announced without interrupting.
  A danger toast uses `role="alert"`.

---

### Task 10: Wire up

- [ ] Export all six components, `useToast`, and the two hooks from `src/index.ts`.
- [ ] Extend `src/index.test.ts`.
- [ ] Add every overlay to `gallery/main.tsx` and rebuild the sheet.
- [ ] Full chain: typecheck, lint, test, build, size, contrast, css.

---

## Execution record

Executed 2026-09-09. The three shared pieces were built by the coordinator with
34 tests before any component task started; the six components then ran as
three parallel agents. 556 tests pass across the library.

| Measure | Result |
| --- | --- |
| Full library, gzipped | 11.30 KB against 45 KB |
| A lone Button import | 0.48 KB against 2 KB |

Findings worth keeping:

- **The focus trap was silently disabled under test.** Its first version
  filtered focusable elements by `offsetParent`, which jsdom reports as null
  for every element, emptying the list. It now uses `checkVisibility`, which
  browsers implement and jsdom does not, so it degrades to "visible" under test
  and behaves correctly in a browser.
- **The scroll lock moved into `internal/`.** Both Modal and Drawer need one
  shared counter, and the first implementation put it behind a `globalThis` key
  in each component to avoid a cross-component import. The no-cross-import rule
  is about components; a shared helper is what `internal/` is for.
- **Tooltip clones its trigger rather than wrapping it.** A wrapper either
  injects a box into the caller's layout or, with `display: contents`, has no
  box at all, and an element with no box cannot be measured for positioning.
- **user-event deadlocks against fake timers here.** Both agents that needed a
  fake clock hit it independently and fell back to `fireEvent`. Worth knowing
  before writing the next timer-driven component.
- **Portalled content is not inside the render container**, so accessibility
  assertions had to target the live element. Asserting on the container would
  have checked an empty div and passed.

## Done when

- Three shared pieces exist with their own tests.
- Six overlay components ship, each with axe clean.
- Focus is trapped and restored by every modal surface.
- Budgets hold; a lone Button import is unchanged.
