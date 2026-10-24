# halcyon-ui

Lightweight, themeable, accessible React components. React is the only runtime
dependency (peer). Styling is plain CSS custom properties—no CSS-in-JS, no
Tailwind requirement.

## Install

```bash
npm install halcyon-ui react react-dom
```

## Quick start

```tsx
import 'halcyon-ui/midnight'
import { Button, useColorMode } from 'halcyon-ui'

export function App() {
  const { toggle, resolvedMode } = useColorMode()
  return (
    <Button variant="ghost" onClick={toggle}>
      {resolvedMode}
    </Button>
  )
}
```

Import **one theme stylesheet** at app startup. It includes light and dark
tokens; the active mode follows `prefers-color-scheme` unless you set
`data-mode` on `<html>` (see [Color mode](#color-mode)).

## See everything (gallery)

The repo ships a local proof sheet—not published to npm—that renders every
component and structure with live theme tokens and contrast readouts.

```bash
git clone https://github.com/OrenVill/halcyon-ui.git
cd halcyon-ui
npm install
npm run gallery
```

Open the URL printed in the terminal. Use the left rail to jump between
specimens.

## What you can import

### Full package

```tsx
import { Button, Tabs, Navbar } from 'halcyon-ui'
```

### Category slices (smaller JS graph)

| Subpath | Contents |
| --- | --- |
| `halcyon-ui/form` | Button, Input, Select, Combobox, DatePicker, FileUpload, … |
| `halcyon-ui/navigation` | Tabs, Accordion, Pagination, Breadcrumb, Stepper, Wizard |
| `halcyon-ui/overlay` | Modal, Drawer, Tooltip, Popover, DropdownMenu, Toast, `computePosition` |
| `halcyon-ui/display` | Card, Badge, Avatar, Alert, Table, Progress, Spinner, Skeleton, Tag |
| `halcyon-ui/primitives` | Separator, Link, Field, InlineMessage, SegmentedControl, ToggleGroup, Collapsible, Kbd, EmptyState, Meter, DataList |
| `halcyon-ui/hooks` | `useColorMode`, `ColorModeScript`, `useDismissable`, `useFocusTrap` |
| `halcyon-ui/structures` | Navbar, Sidebar, FormLayout, AppShell |

```tsx
import { Tabs, Breadcrumb } from 'halcyon-ui/navigation'
import { Button } from 'halcyon-ui/form'
```

### Layout structures (single import)

Pre-built shells that compose atoms (navbar chrome, sidebar rail, form page,
app frame):

| Subpath | Export |
| --- | --- |
| `halcyon-ui/structures/navbar` | `Navbar` (+ `Navbar.Brand`, `.Nav`, `.Link`, `.Actions`) |
| `halcyon-ui/structures/sidebar` | `Sidebar` (+ header, nav links, footer) |
| `halcyon-ui/structures/form-layout` | `FormLayout` (+ header, body, sections, actions) |
| `halcyon-ui/structures/app-shell` | `AppShell` (+ header, sidebar slot, main) |

```tsx
import { Navbar } from 'halcyon-ui/structures/navbar'
import { AppShell } from 'halcyon-ui/structures/app-shell'
import { Button } from 'halcyon-ui/form'
```

### Themes (CSS only)

| Import | Description |
| --- | --- |
| `halcyon-ui/base` | Plain starter palette |
| `halcyon-ui/midnight` | Default showcase theme |
| `halcyon-ui/aurora` | … |
| `halcyon-ui/ember` | … |
| `halcyon-ui/forest` | … |
| `halcyon-ui/sandstone` | … |
| `halcyon-ui/mono` | … |
| `halcyon-ui/neon` | … |

### API reference in TypeScript

Every public export is typed. In your editor, import from any subpath above and
use autocomplete, or open `node_modules/halcyon-ui/dist/index.d.ts` (and
`dist/navigation.d.ts`, `dist/structures/navbar.d.ts`, etc.) after install.

List published entry points from the package manifest:

```bash
npm run api
```

## Color mode

```tsx
import { ColorModeScript, useColorMode } from 'halcyon-ui/hooks'
```

`useColorMode()` returns `{ mode, resolvedMode, setMode, toggle }`. Persisted
under `halcyon-mode` in `localStorage`. For SSR, render `<ColorModeScript />` in
`<head>` to avoid a flash of the wrong theme.

## Customization

Three layers (all optional):

1. **Global tokens** — override `--hal-*` variables after the theme import.
2. **Component tokens** — e.g. `--hal-button-bg` without touching globals.
3. **Escape hatches** — `className`, `style`, and ref on every component; stable
   `hal-*` class names.

## License

MIT
