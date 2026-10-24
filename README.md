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

Then serve the built file (a static server avoids `file://` restrictions):

```bash
npx --yes serve gallery -p 4173
```

Open **http://localhost:4173/gallery.html** and use the left rail: **Components**
for atoms and primitives, **Site layouts** for individual page shells, and
**Complete websites** for multi-page kits.

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
| `halcyon-ui/structures` | Navbar, Sidebar, FormLayout, AppShell, and all ready site layouts below |

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
| `halcyon-ui/structures/dashboard-layout` | Full dashboard chrome (navbar + sidebar + main) |
| `halcyon-ui/structures/docs-site` | Documentation site (nav + doc sidebar + article column) |
| `halcyon-ui/structures/marketing-site` | Marketing site (sticky nav + hero + sections + footer) |
| `halcyon-ui/structures/login-layout` | Sign-in page (centered card) |
| `halcyon-ui/structures/signup-layout` | Registration page |
| `halcyon-ui/structures/forgot-password-layout` | Password reset request |
| `halcyon-ui/structures/error-page` | 404 / error status page |
| `halcyon-ui/structures/blog` | Blog index or article |
| `halcyon-ui/structures/settings-layout` | Settings sidebar + form column |
| `halcyon-ui/structures/onboarding-layout` | Multi-step onboarding |
| `halcyon-ui/structures/checkout-layout` | Checkout form + order summary |

### Complete websites (multi-page kits)

Each kit groups ready pages (marketing + login + 404, SaaS app + onboarding, etc.)
with shared `paths` and `routes` you map to your router:

| Subpath | Pages |
| --- | --- |
| `halcyon-ui/websites/marketing` | `Home`, `Login`, `Signup`, `ForgotPassword`, `NotFound` |
| `halcyon-ui/websites/saas` | `Dashboard`, `Settings`, `Onboarding`, `Login`, `Signup`, `NotFound` |
| `halcyon-ui/websites/docs` | `Docs`, `Blog`, `BlogPost`, `NotFound` |
| `halcyon-ui/websites/commerce` | `Store`, `Checkout`, `Login`, `NotFound` |

```tsx
import { MarketingWebsite } from 'halcyon-ui/websites/marketing'
import { Button } from 'halcyon-ui/form'

// app/login/page.tsx
<MarketingWebsite.Login brand="Acme">
  <YourLoginForm />
</MarketingWebsite.Login>

// MarketingWebsite.paths.login === '/login' (override hrefs in your router)
```

```tsx
import { LoginLayout } from 'halcyon-ui/structures/login-layout'
import { DashboardLayout } from 'halcyon-ui/structures/dashboard-layout'
import { DocsSiteLayout } from 'halcyon-ui/structures/docs-site'
import { MarketingSiteLayout } from 'halcyon-ui/structures/marketing-site'
import { Button } from 'halcyon-ui/form'

<DashboardLayout
  brand="Acme"
  sidebarTitle="Analytics"
  sidebarLinks={[{ href: '/overview', label: 'Overview', active: true }]}
  pageTitle="Overview"
  pageDescription="Last 30 days"
  pageActions={<Button size="sm">Export</Button>}
>
  {/* your charts and tables only */}
</DashboardLayout>

<DocsSiteLayout
  brand="halcyon-ui"
  sidebarLinks={[{ href: '/install', label: 'Install', active: true }]}
  pageTitle="Install"
  nextPage={{ href: '/themes', label: 'Themes' }}
>
  <p>Your prose or MDX content.</p>
</DocsSiteLayout>

<MarketingSiteLayout
  brand="Halcyon"
  navLinks={[{ href: '/pricing', label: 'Pricing', active: true }]}
  hero={{ title: 'Hello', description: '…', actions: <Button>Start</Button> }}
>
  <MarketingSiteLayout.Section title="Features">…</MarketingSiteLayout.Section>
</MarketingSiteLayout>
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
