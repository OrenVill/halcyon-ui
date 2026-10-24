/*
 * The gallery is a proofing tool, not a docs site. It renders the real
 * components from the real build, painted with the real theme tokens, so what
 * you see is what the package produces.
 *
 * It is dev-only: package.json ships "files": ["dist"], so none of this is
 * published to npm.
 */
import { StrictMode, useMemo, useRef, useState, type MouseEvent } from 'react'
import type { SiteNavLink, SitePagerLink } from '../src/structures/types'
import { createRoot } from 'react-dom/client'
import {
  Accordion,
  Alert,
  AppShell,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  DashboardLayout,
  DataList,
  DatePicker,
  DocsSiteLayout,
  Drawer,
  DropdownMenu,
  EmptyState,
  Field,
  FileUpload,
  FormLayout,
  IconButton,
  InlineMessage,
  Input,
  Kbd,
  Link,
  Meter,
  MarketingSiteLayout,
  Modal,
  Navbar,
  NumberInput,
  Pagination,
  Popover,
  Progress,
  Radio,
  SegmentedControl,
  Select,
  Separator,
  Sidebar,
  Skeleton,
  Slider,
  Spinner,
  Stepper,
  Switch,
  Table,
  Tabs,
  Tag,
  Textarea,
  ToastProvider,
  ToggleGroup,
  Tooltip,
  useFieldControlProps,
  useToast,
  Wizard,
} from '../src/index'

declare const __THEMES__: Record<string, Record<'light' | 'dark', Record<string, string>>>

const THEMES = __THEMES__
const THEME_NAMES = Object.keys(THEMES)
type Mode = 'light' | 'dark'

/* ---------- contrast, computed live from whatever tokens are applied ---------- */

function channel(value: number): number {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const n = Number.parseInt(match[1]!, 16)
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  )
}

function ratio(fg: string, bg: string): number | null {
  const a = luminance(fg)
  const b = luminance(bg)
  if (a === null || b === null) return null
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

const PAIRS: Array<[string, string, string]> = [
  ['--hal-fg', '--hal-bg', 'body / page'],
  ['--hal-fg', '--hal-bg-subtle', 'body / subtle'],
  ['--hal-fg', '--hal-bg-raised', 'body / raised'],
  ['--hal-fg-muted', '--hal-bg', 'muted / page'],
  ['--hal-fg-muted', '--hal-bg-subtle', 'muted / subtle'],
  ['--hal-accent-fg', '--hal-accent', 'text / accent'],
  ['--hal-danger-fg', '--hal-danger', 'text / danger'],
]

/* ---------- layout pieces ---------- */

const COMPONENT_SECTIONS = [
  'Button',
  'IconButton',
  'Input',
  'Textarea',
  'Select',
  'Checkbox',
  'Radio',
  'Switch',
  'Slider',
  'NumberInput',
  'Combobox',
  'DatePicker',
  'FileUpload',
  'Separator',
  'Link',
  'Field',
  'InlineMessage',
  'SegmentedControl',
  'ToggleGroup',
  'Collapsible',
  'Kbd',
  'EmptyState',
  'Meter',
  'DataList',
  'Tabs',
  'Accordion',
  'Pagination',
  'Breadcrumb',
  'Stepper',
  'Wizard',
  'Navbar',
  'Sidebar',
  'AppShell',
  'FormLayout',
  'Card',
  'Badge',
  'Tag',
  'Avatar',
  'Alert',
  'Table',
  'Progress',
  'Spinner',
  'Skeleton',
  'Modal',
  'Drawer',
  'Tooltip',
  'Popover',
  'DropdownMenu',
  'Toast',
] as const

const SITE_LAYOUT_SECTIONS = [
  'DashboardLayout',
  'DocsSiteLayout',
  'MarketingSiteLayout',
] as const

const FRUIT_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

const TAB_ITEMS = [
  { id: 'overview', label: 'Overview', content: <p style={{ margin: 0 }}>Summary metrics and health.</p> },
  { id: 'deploys', label: 'Deploys', content: <p style={{ margin: 0 }}>Recent releases across environments.</p> },
  { id: 'settings', label: 'Settings', content: <p style={{ margin: 0 }}>Theme tokens and team access.</p>, disabled: true },
]

const ACCORDION_ITEMS = [
  { id: 'tokens', title: 'Design tokens', content: 'Every component reads layered CSS variables.' },
  { id: 'a11y', title: 'Accessibility', content: 'Keyboard behavior follows the ARIA authoring practices.' },
]


function GalleryFieldInput() {
  const props = useFieldControlProps()
  return <Input {...props} placeholder="you@example.com" />
}

function Specimen({
  name,
  note,
  children,
}: {
  name: string
  note: string
  children: React.ReactNode
}) {
  return (
    <section className="spec" id={name}>
      <div className="spec__head">
        <h2 className="spec__name">{name}</h2>
        <p className="spec__note">{note}</p>
      </div>
      <div className="spec__body">{children}</div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="row__label">{label}</span>
      <div className="row__items">{children}</div>
    </div>
  )
}

// Inlined rather than fetched: a published artifact blocks external image
// hosts, so any remote avatar URL could never load there. Base64 rather than
// percent-encoding, so no quoting or reserved character can be misread on the
// way through JavaScript, the bundler and the HTML attribute.
const PORTRAIT = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM2YjhjYWUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzYzVhNzgiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9InVybCgjZykiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjI1IiByPSIxMSIgZmlsbD0iI2U4ZWVmNSIvPjxwYXRoIGQ9Ik0xMCA2NGMwLTEzIDEwLTIxIDIyLTIxczIyIDggMjIgMjF6IiBmaWxsPSIjZThlZWY1Ii8+PC9zdmc+'

const SORT_OPTIONS = [
  { value: 'ascending', label: 'Ascending' },
  { value: 'modified', label: 'By modified date' },
  { value: 'archived', label: 'Archived', disabled: true },
  { value: 'custom', label: 'Custom order' },
]

const WIZARD_STEPS = [
  { id: 'name', label: 'Name', content: <Input aria-label="Project name" placeholder="halcyon-ui" /> },
  {
    id: 'theme',
    label: 'Theme',
    content: <Select aria-label="Theme" options={SORT_OPTIONS} defaultValue="modified" />,
  },
  { id: 'done', label: 'Done', content: <p style={{ margin: 0 }}>Review and create the project.</p> },
]

const BUTTON_VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'danger'] as const
const SIZES = ['sm', 'md', 'lg'] as const

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function inAppNav(select: () => void): Pick<SiteNavLink, 'href' | 'onClick'> {
  return {
    href: '#',
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      select()
    },
  }
}

function inAppPager(select: () => void): Pick<SitePagerLink, 'href' | 'onClick'> {
  return {
    href: '#',
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      select()
    },
  }
}

const DASHBOARD_PAGES = {
  overview: {
    label: 'Overview',
    title: 'Overview',
    description: 'Metrics for the last 30 days.',
    metric: '12,480 active users today',
  },
  reports: {
    label: 'Reports',
    title: 'Reports',
    description: 'Scheduled and on-demand exports.',
    metric: '6 reports ready to download',
  },
  alerts: {
    label: 'Alerts',
    title: 'Alerts',
    description: 'Open incidents and muted rules.',
    metric: '2 alerts need review',
  },
} as const

type DashboardPageId = keyof typeof DASHBOARD_PAGES

function DashboardLayoutGalleryDemo() {
  const [page, setPage] = useState<DashboardPageId>('overview')
  const active = DASHBOARD_PAGES[page]

  const sidebarLinks: SiteNavLink[] = (Object.keys(DASHBOARD_PAGES) as DashboardPageId[]).map(
    (id) => ({
      label: DASHBOARD_PAGES[id].label,
      active: page === id,
      ...inAppNav(() => setPage(id)),
    }),
  )

  return (
    <DashboardLayout
      brand="Acme Cloud"
      sidebarTitle="Analytics"
      sidebarLinks={sidebarLinks}
      breadcrumbs={[
        { label: 'Home', ...inAppNav(() => setPage('overview')) },
        { label: active.label, href: '#', active: true },
      ]}
      pageTitle={active.title}
      pageDescription={active.description}
      pageActions={<Button size="sm">Export</Button>}
      actions={<Button size="sm" variant="ghost">Help</Button>}
    >
      <Card variant="subtle" padding="md">
        <strong>{active.title}</strong>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--hal-fg-muted)' }}>{active.metric}</p>
      </Card>
    </DashboardLayout>
  )
}

const DOCS_PAGES = [
  {
    id: 'install',
    label: 'Install',
    title: 'Install',
    lead: 'Add the package and import one theme.',
    body: (
      <>
        <p>Run <Kbd>npm install halcyon-ui</Kbd>, then import a theme CSS file at startup.</p>
        <p>Import components from the root or from a category slice.</p>
      </>
    ),
  },
  {
    id: 'themes',
    label: 'Themes',
    title: 'Themes',
    lead: 'Eight palettes with light and dark modes.',
    body: <p>Apply a theme class on a root element and toggle <Kbd>data-mode</Kbd> for dark mode.</p>,
  },
  {
    id: 'components',
    label: 'Components',
    title: 'Components',
    lead: 'Atoms, overlays, and full site layouts.',
    body: <p>Import only what you need from category slices like <Kbd>halcyon-ui/form</Kbd>.</p>,
  },
] as const

function DocsSiteLayoutGalleryDemo() {
  const [index, setIndex] = useState(0)
  const page = DOCS_PAGES[index]!
  const prev = index > 0 ? DOCS_PAGES[index - 1] : undefined
  const next = index < DOCS_PAGES.length - 1 ? DOCS_PAGES[index + 1] : undefined

  const sidebarLinks: SiteNavLink[] = DOCS_PAGES.map((entry, i) => ({
    label: entry.label,
    active: i === index,
    ...inAppNav(() => setIndex(i)),
  }))

  return (
    <DocsSiteLayout
      brand="halcyon-ui"
      version="docs"
      sidebarLinks={sidebarLinks}
      pageTitle={page.title}
      pageDescription={page.lead}
      prevPage={
        prev
          ? { label: prev.label, ...inAppPager(() => setIndex(index - 1)) }
          : undefined
      }
      nextPage={
        next
          ? { label: next.label, ...inAppPager(() => setIndex(index + 1)) }
          : undefined
      }
    >
      {page.body}
    </DocsSiteLayout>
  )
}

const MARKETING_PAGES = {
  product: { label: 'Product', blurb: 'Composable React primitives and full site shells.' },
  pricing: { label: 'Pricing', blurb: 'Free for open source; team plans for design systems.' },
  blog: { label: 'Blog', blurb: 'Release notes, patterns, and accessibility deep dives.' },
} as const

type MarketingPageId = keyof typeof MARKETING_PAGES

function MarketingSiteLayoutGalleryDemo() {
  const [page, setPage] = useState<MarketingPageId>('pricing')
  const active = MARKETING_PAGES[page]

  const navLinks: SiteNavLink[] = (Object.keys(MARKETING_PAGES) as MarketingPageId[]).map(
    (id) => ({
      label: MARKETING_PAGES[id].label,
      active: page === id,
      ...inAppNav(() => setPage(id)),
    }),
  )

  return (
    <MarketingSiteLayout
      brand="Halcyon"
      navLinks={navLinks}
      actions={<Button size="sm">Start free</Button>}
      hero={{
        title: 'Ship accessible UI faster',
        description: 'Themeable React components with no runtime CSS engine.',
        actions: <Button>Get started</Button>,
      }}
      copyright="© Halcyon UI"
      footerColumns={[
        {
          title: 'Product',
          links: [
            { label: 'Components', ...inAppNav(() => setPage('product')) },
            { label: 'Pricing', ...inAppNav(() => setPage('pricing')) },
          ],
        },
        {
          title: 'Learn',
          links: [{ label: 'Blog', ...inAppNav(() => setPage('blog')) }],
        },
      ]}
    >
      <MarketingSiteLayout.Section
        title={`${active.label} spotlight`}
        description={active.blurb}
        variant="muted"
      >
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
          }}
        >
          <Card padding="md">8 themes</Card>
          <Card padding="md">Tree-shakeable</Card>
          <Card padding="md">WCAG AA</Card>
        </div>
      </MarketingSiteLayout.Section>
      <MarketingSiteLayout.Cta
        title="Ready to try it?"
        description="Install from npm and open the gallery proof sheet."
        actions={<Button variant="outline">View docs</Button>}
      />
    </MarketingSiteLayout>
  )
}

/* ---------- the app ---------- */

function ToastButtons() {
  const { toast } = useToast()
  return (
    <>
      {(['info', 'success', 'warning', 'danger'] as const).map((variant) => (
        <Button
          key={variant}
          variant="outline"
          onClick={() =>
            toast({
              variant,
              title: `${variant} toast`,
              description: 'Hover it and the countdown pauses.',
            })
          }
        >
          {variant}
        </Button>
      ))}
    </>
  )
}

function Gallery() {
  const [theme, setTheme] = useState('midnight')
  const [mode, setMode] = useState<Mode>('dark')
  const [showTokens, setShowTokens] = useState(false)

  const [checked, setChecked] = useState(true)
  const [indeterminate, setIndeterminate] = useState(true)
  const [radio, setRadio] = useState('standard')
  const [on, setOn] = useState(true)
  const [volume, setVolume] = useState(60)
  const [quantity, setQuantity] = useState(3)
  const [sort, setSort] = useState('modified')
  const [tags, setTags] = useState(['design', 'accessibility', 'tokens'])
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerSide, setDrawerSide] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popoverAnchor = useRef<HTMLButtonElement>(null)
  const [segment, setSegment] = useState('week')
  const [toggleView, setToggleView] = useState('grid')
  const [page, setPage] = useState(2)
  const [pickedDate, setPickedDate] = useState<Date | null>(new Date())
  const [uploadFiles, setUploadFiles] = useState<File[]>([])

  const tokens = THEMES[theme]![mode]
  const style = useMemo(() => tokens as React.CSSProperties, [tokens])

  const measured = PAIRS.map(([fg, bg, label]) => ({
    label,
    value: ratio(tokens[fg] ?? '', tokens[bg] ?? ''),
  }))
  const worst = measured.reduce(
    (low, pair) => (pair.value !== null && pair.value < low ? pair.value : low),
    Infinity,
  )

  return (
    <>
      <header className="bar">
        <div className="bar__id">
          <span className="bar__mark">halcyon-ui</span>
          <span className="bar__sub">component proof sheet</span>
        </div>

        <div className="bar__themes" role="group" aria-label="Theme">
          {THEME_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              className={`chip${name === theme ? ' chip--on' : ''}`}
              onClick={() => setTheme(name)}
              aria-pressed={name === theme}
            >
              <span
                className="chip__dot"
                style={{ background: THEMES[name]![mode]['--hal-accent'] }}
              />
              {name}
            </button>
          ))}
        </div>

        <div className="bar__modes" role="group" aria-label="Color mode">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`seg${m === mode ? ' seg--on' : ''}`}
              onClick={() => setMode(m)}
              aria-pressed={m === mode}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      <div className="shell">
        <nav className="rail" aria-label="Gallery">
          <p className="rail__title">Components</p>
          <ol className="rail__list">
            {COMPONENT_SECTIONS.map((name) => (
              <li key={name}>
                <a href={`#${name}`}>{name}</a>
              </li>
            ))}
          </ol>

          <p className="rail__title">Site layouts</p>
          <ol className="rail__list">
            <li>
              <a href="#site-layouts">Overview</a>
            </li>
            {SITE_LAYOUT_SECTIONS.map((name) => (
              <li key={name}>
                <a href={`#${name}`}>{name}</a>
              </li>
            ))}
          </ol>

          <p className="rail__title">Contrast, live</p>
          <dl className="meter">
            {measured.map((pair) => (
              <div key={pair.label} className="meter__row">
                <dt>{pair.label}</dt>
                <dd className={pair.value !== null && pair.value < 4.5 ? 'meter__bad' : ''}>
                  {pair.value === null ? '—' : `${pair.value.toFixed(2)}:1`}
                </dd>
              </div>
            ))}
          </dl>
          <p className="rail__foot">
            Lowest {Number.isFinite(worst) ? worst.toFixed(2) : '—'}:1 against a 4.5:1 floor.
            Measured in the browser from the tokens now applied.
          </p>

          <button type="button" className="rail__toggle" onClick={() => setShowTokens((v) => !v)}>
            {showTokens ? 'Hide' : 'Show'} the {Object.keys(tokens).length} tokens
          </button>
        </nav>

        <main className="sheet" style={style} data-theme-name={theme}>
          {showTokens ? (
            <section className="spec">
              <div className="spec__head">
                <h2 className="spec__name">Tokens</h2>
                <p className="spec__note">
                  Every value the {theme} theme defines for {mode} mode.
                </p>
              </div>
              <div className="tokens">
                {Object.entries(tokens).map(([name, value]) => (
                  <div key={name} className="token">
                    {/^(#|rgb)/.test(value) ? (
                      <span className="token__swatch" style={{ background: value }} />
                    ) : (
                      <span className="token__swatch token__swatch--none" />
                    )}
                    <code className="token__name">{name}</code>
                    <code className="token__value">{value}</code>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <Specimen name="Button" note="Five variants, three sizes. Type defaults to button.">
            <Row label="variants">
              {BUTTON_VARIANTS.map((v) => (
                <Button key={v} variant={v}>
                  {v}
                </Button>
              ))}
            </Row>
            <Row label="sizes">
              {SIZES.map((s) => (
                <Button key={s} size={s}>
                  size {s}
                </Button>
              ))}
            </Row>
            <Row label="states">
              <Button disabled>disabled</Button>
              <Button variant="outline" disabled>
                disabled
              </Button>
            </Row>
            <Row label="fullWidth">
              <Button fullWidth>spans its container</Button>
            </Row>
          </Specimen>

          <Specimen name="IconButton" note="Square. Warns in development when it has no accessible name.">
            <Row label="variants">
              {BUTTON_VARIANTS.map((v) => (
                <IconButton key={v} variant={v} aria-label={`Add, ${v}`}>
                  <PlusIcon />
                </IconButton>
              ))}
            </Row>
            <Row label="sizes">
              {SIZES.map((s) => (
                <IconButton key={s} size={s} aria-label={`Add, ${s}`}>
                  <PlusIcon />
                </IconButton>
              ))}
            </Row>
          </Specimen>

          <Specimen name="Input" note="Native input. The size prop never reaches the DOM.">
            <Row label="sizes">
              {SIZES.map((s) => (
                <Input key={s} size={s} aria-label={`Input ${s}`} defaultValue={`size ${s}`} />
              ))}
            </Row>
            <Row label="states">
              <Input aria-label="Placeholder" placeholder="placeholder" />
              <Input aria-label="Invalid" invalid defaultValue="invalid" />
              <Input aria-label="Disabled" disabled defaultValue="disabled" />
            </Row>
          </Specimen>

          <Specimen name="Textarea" note="Resizes vertically only.">
            <Row label="default">
              <Textarea aria-label="Notes" rows={3} defaultValue="Drag the corner: vertical only." />
            </Row>
            <Row label="states">
              <Textarea aria-label="Invalid notes" invalid rows={2} defaultValue="invalid" />
              <Textarea aria-label="Disabled notes" disabled rows={2} defaultValue="disabled" />
            </Row>
          </Specimen>

          <Specimen
            name="Select"
            note="A listbox, not a native select: the browser draws a native dropdown itself and ignores every token in the theme."
          >
            <Row label="sizes">
              {SIZES.map((s) => (
                <Select
                  key={s}
                  size={s}
                  aria-label={`Select ${s}`}
                  defaultValue="modified"
                  options={SORT_OPTIONS}
                />
              ))}
            </Row>
            <Row label={`value ${sort}`}>
              <Select
                aria-label="Controlled sort"
                value={sort}
                onValueChange={setSort}
                options={SORT_OPTIONS}
              />
            </Row>
            <Row label="states">
              <Select aria-label="Placeholder select" options={SORT_OPTIONS} />
              <Select aria-label="Invalid select" invalid options={SORT_OPTIONS} defaultValue="ascending" />
              <Select aria-label="Disabled select" disabled options={SORT_OPTIONS} defaultValue="ascending" />
            </Row>
          </Specimen>

          <Specimen name="Checkbox" note="Indeterminate is a DOM property, set through a merged ref.">
            <Row label="states">
              <label className="field">
                <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                controlled
              </label>
              <label className="field">
                <Checkbox
                  indeterminate={indeterminate}
                  onChange={() => setIndeterminate(false)}
                />
                indeterminate
              </label>
              <label className="field">
                <Checkbox disabled />
                disabled
              </label>
            </Row>
            <Row label="sizes">
              {SIZES.map((s) => (
                <label key={s} className="field">
                  <Checkbox size={s} defaultChecked />
                  {s}
                </label>
              ))}
            </Row>
          </Specimen>

          <Specimen name="Radio" note="Grouped by the native name attribute.">
            <Row label="group">
              {['standard', 'express', 'courier'].map((value) => (
                <label key={value} className="field">
                  <Radio
                    name="shipping"
                    value={value}
                    checked={radio === value}
                    onChange={() => setRadio(value)}
                  />
                  {value}
                </label>
              ))}
            </Row>
          </Specimen>

          <Specimen name="Switch" note="A checkbox with role=switch, so Space toggles it.">
            <Row label="states">
              <label className="field">
                <Switch checked={on} onChange={(e) => setOn(e.target.checked)} />
                {on ? 'on' : 'off'}
              </label>
              <label className="field">
                <Switch disabled />
                disabled
              </label>
            </Row>
            <Row label="sizes">
              {SIZES.map((s) => (
                <label key={s} className="field">
                  <Switch size={s} defaultChecked />
                  {s}
                </label>
              ))}
            </Row>
          </Specimen>

          <Specimen name="Slider" note="Native range input: arrow keys, Home and End come free.">
            <Row label={`value ${volume}`}>
              <Slider
                aria-label="Volume"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </Row>
            <Row label="sizes">
              {SIZES.map((s) => (
                <Slider key={s} size={s} aria-label={`Slider ${s}`} defaultValue={40} />
              ))}
            </Row>
          </Specimen>

          <Specimen
            name="NumberInput"
            note="Steppers are aria-hidden, so one control is one tab stop."
          >
            <Row label={`value ${quantity}`}>
              <NumberInput
                aria-label="Quantity"
                min={0}
                max={10}
                value={quantity}
                onValueChange={setQuantity}
              />
            </Row>
            <Row label="step 0.1">
              <NumberInput aria-label="Rate" step={0.1} defaultValue={0} min={0} max={5} />
            </Row>
            <Row label="states">
              <NumberInput aria-label="Invalid quantity" invalid defaultValue={2} />
              <NumberInput aria-label="Disabled quantity" disabled defaultValue={2} />
            </Row>
          </Specimen>

          <Specimen name="Combobox" note="Filterable listbox with optional multi-select chips.">
            <Row label="single">
              <Combobox options={FRUIT_OPTIONS} aria-label="Fruit" defaultValue="apple" />
            </Row>
            <Row label="multi">
              <Combobox options={FRUIT_OPTIONS} multi aria-label="Fruit basket" defaultValue={['apple']} />
            </Row>
          </Specimen>

          <Specimen name="DatePicker" note="Calendar popover with Intl weekday and month labels.">
            <Row label="single">
              <DatePicker
                aria-label="Ship date"
                value={pickedDate}
                onValueChange={(value) => setPickedDate(value instanceof Date ? value : null)}
              />
            </Row>
          </Specimen>

          <Specimen name="FileUpload" note="Reports files to the app; it never uploads by itself.">
            <Row label="dropzone">
              <FileUpload files={uploadFiles} onFilesChange={setUploadFiles} accept="image/*" multiple />
            </Row>
          </Specimen>

          <Specimen name="Separator" note="Decorative or semantic divider between blocks.">
            <Row label="horizontal">
              <div style={{ width: '100%' }}>
                <p style={{ margin: '0 0 0.5rem' }}>Above</p>
                <Separator />
                <p style={{ margin: '0.5rem 0 0' }}>Below</p>
              </div>
            </Row>
          </Specimen>

          <Specimen name="Link" note="Themed anchor with an external variant.">
            <Row label="variants">
              <Link href="#">default</Link>
              <Link href="#" variant="muted">muted</Link>
              <Link href="https://example.com" external>external</Link>
            </Row>
          </Specimen>

          <Specimen name="Field" note="Wires label, description, and error to the control.">
            <Field invalid style={{ maxWidth: '20rem' }}>
              <Field.Label>Email</Field.Label>
              <GalleryFieldInput />
              <Field.Description>We send receipts here.</Field.Description>
              <Field.Error>Enter a valid address.</Field.Error>
            </Field>
          </Specimen>

          <Specimen name="InlineMessage" note="Compact validation text under a control.">
            <Row label="variants">
              {(['info', 'success', 'warning', 'danger'] as const).map((v) => (
                <InlineMessage key={v} variant={v}>
                  {v} message
                </InlineMessage>
              ))}
            </Row>
          </Specimen>

          <Specimen name="SegmentedControl" note="Radio group styled as a single control.">
            <Row label="period">
              <SegmentedControl
                value={segment}
                onValueChange={setSegment}
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                ]}
                aria-label="Period"
              />
            </Row>
          </Specimen>

          <Specimen name="ToggleGroup" note="Toolbar-style single selection.">
            <Row label="view">
              <ToggleGroup
                type="single"
                value={toggleView}
                onValueChange={(v) => setToggleView(v as string)}
                options={[
                  { value: 'grid', label: 'Grid' },
                  { value: 'list', label: 'List' },
                ]}
                aria-label="View mode"
              />
            </Row>
          </Specimen>

          <Specimen name="Collapsible" note="One disclosure region with an explicit trigger.">
            <Collapsible>
              <CollapsibleTrigger>Token layers</CollapsibleTrigger>
              <CollapsibleContent>
                Global tokens, component tokens, then className escape hatches.
              </CollapsibleContent>
            </Collapsible>
          </Specimen>

          <Specimen name="Kbd" note="Keyboard hints for shortcuts.">
            <Row label="combo">
              <span>
                Save <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd>
              </span>
            </Row>
          </Specimen>

          <Specimen name="EmptyState" note="Centered placeholder when a list has no items.">
            <EmptyState title="No themes yet" description="Import a stylesheet to preview tokens here.">
              <Button variant="outline">Create theme</Button>
            </EmptyState>
          </Specimen>

          <Specimen name="Meter" note="Quota usage with role=meter.">
            <Row label="storage">
              <Meter value={72} min={0} max={100} aria-label="Storage used" />
            </Row>
          </Specimen>

          <Specimen name="DataList" note="Key–value rows without a full table.">
            <DataList
              items={[
                { term: 'Package', description: 'halcyon-ui' },
                { term: 'Themes', description: '8' },
                { term: 'React', description: 'peer dependency' },
              ]}
            />
          </Specimen>

          <Specimen name="Tabs" note="Tablist with arrow-key navigation.">
            <Tabs tabs={TAB_ITEMS} defaultValue="overview" />
          </Specimen>

          <Specimen name="Accordion" note="Expandable sections; danger uses role=alert elsewhere, not here.">
            <Accordion items={ACCORDION_ITEMS} defaultValue={['tokens']} type="multiple" />
          </Specimen>

          <Specimen name="Pagination" note="Previous and next with numbered pages.">
            <Pagination page={page} pageCount={8} onPageChange={setPage} />
          </Specimen>

          <Specimen name="Breadcrumb" note="Navigation trail with aria-current on the last item.">
            <Breadcrumb
              items={[
                { label: 'Home', href: '#' },
                { label: 'Themes', href: '#' },
                { label: 'Midnight' },
              ]}
            />
          </Specimen>

          <Specimen name="Stepper" note="Visual progress through discrete steps.">
            <Stepper
              steps={[
                { id: '1', label: 'Account' },
                { id: '2', label: 'Billing' },
                { id: '3', label: 'Confirm' },
              ]}
              activeStep={1}
            />
          </Specimen>

          <Specimen name="Wizard" note="Step state container with optional per-step validation.">
            <Wizard steps={WIZARD_STEPS} defaultActiveStep={0}>
              {(api) => (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {WIZARD_STEPS[api.activeStep]?.content}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="ghost" disabled={!api.canGoBack} onClick={() => api.back()}>
                      Back
                    </Button>
                    <Button disabled={!api.canGoNext} onClick={() => api.next()}>
                      {api.activeStep === WIZARD_STEPS.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              )}
            </Wizard>
          </Specimen>

          <Specimen name="Navbar" note="Top chrome: brand, inline links, trailing actions.">
            <Navbar variant="raised">
              <Navbar.Brand>
                <Link href="#" variant="accent">halcyon-ui</Link>
              </Navbar.Brand>
              <Navbar.Nav>
                <Navbar.Links>
                  <Navbar.Link href="#" label="Docs" />
                  <Navbar.Link href="#" label="Gallery" current />
                </Navbar.Links>
              </Navbar.Nav>
              <Navbar.Actions>
                <Button variant="ghost" size="sm">Sign in</Button>
              </Navbar.Actions>
            </Navbar>
          </Specimen>

          <Specimen name="Sidebar" note="Vertical section rail for settings or app areas.">
            <div
              style={{
                display: 'flex',
                width: '16rem',
                minHeight: '12rem',
                border: '1px solid var(--hal-border)',
                borderRadius: 'var(--hal-radius)',
              }}
            >
              <Sidebar style={{ width: '100%' }}>
                <Sidebar.Header>Project</Sidebar.Header>
                <Sidebar.Nav>
                  <Sidebar.Links>
                    <Sidebar.Link href="#" label="Overview" active />
                    <Sidebar.Link href="#" label="Themes" />
                    <Sidebar.Link href="#" label="Tokens" />
                  </Sidebar.Links>
                </Sidebar.Nav>
              </Sidebar>
            </div>
          </Specimen>

          <Specimen name="AppShell" note="Navbar plus sidebar and main — a full app frame.">
            <div style={{ border: '1px solid var(--hal-border)', borderRadius: 'var(--hal-radius)' }}>
              <AppShell style={{ minHeight: '14rem' }}>
                <AppShell.Header>
                  <Navbar>
                    <Navbar.Brand>Dashboard</Navbar.Brand>
                  </Navbar>
                </AppShell.Header>
                <AppShell.Body>
                  <AppShell.Sidebar>
                    <Sidebar>
                      <Sidebar.Nav>
                        <Sidebar.Links>
                          <Sidebar.Link href="#" label="Home" active />
                        </Sidebar.Links>
                      </Sidebar.Nav>
                    </Sidebar>
                  </AppShell.Sidebar>
                  <AppShell.Main>Main content area</AppShell.Main>
                </AppShell.Body>
              </AppShell>
            </div>
          </Specimen>

          <Specimen name="FormLayout" note="Opinionated form page: header, sections, action row.">
            <FormLayout width="md">
              <FormLayout.Header title="Invite teammate" description="They receive an email invite." />
              <FormLayout.Body>
                <FormLayout.Section title="Contact">
                  <Field>
                    <Field.Label>Email</Field.Label>
                    <Input aria-label="Email" type="email" />
                  </Field>
                </FormLayout.Section>
              </FormLayout.Body>
              <FormLayout.Actions>
                <Button variant="ghost">Cancel</Button>
                <Button>Send invite</Button>
              </FormLayout.Actions>
            </FormLayout>
          </Specimen>

          <Specimen name="Card" note="Variants differ in weight, not decoration: a border, an elevation, or a fill.">
            <Row label="variants">
              {(['outline', 'raised', 'subtle'] as const).map((v) => (
                <Card key={v} variant={v} style={{ minWidth: '11rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{v}</strong>
                  <span style={{ color: 'var(--hal-fg-muted)', fontSize: '13px' }}>
                    Deploy finished in 42s
                  </span>
                </Card>
              ))}
            </Row>
            <Row label="padding">
              {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
                <Card key={p} padding={p}>
                  {p}
                </Card>
              ))}
            </Row>
          </Specimen>

          <Specimen name="Badge" note="A label, not a control. Success, warning and info are text, never a fill.">
            <Row label="variants">
              {(['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const).map((v) => (
                <Badge key={v} variant={v}>
                  {v}
                </Badge>
              ))}
            </Row>
            <Row label="sizes">
              {(['sm', 'md'] as const).map((s) => (
                <Badge key={s} size={s} variant="accent">
                  size {s}
                </Badge>
              ))}
            </Row>
          </Specimen>

          <Specimen name="Tag" note="A badge that can be removed. Each remove button names its own tag.">
            <Row label="removable">
              {tags.map((tag) => (
                <Tag key={tag} onRemove={() => setTags((all) => all.filter((t) => t !== tag))}>
                  {tag}
                </Tag>
              ))}
              {tags.length === 0 ? (
                <button type="button" className="hal-button hal-button--ghost hal-button--sm" onClick={() => setTags(['design', 'accessibility', 'tokens'])}>
                  restore
                </button>
              ) : null}
            </Row>
            <Row label="variants">
              {(['neutral', 'accent', 'success', 'warning', 'danger'] as const).map((v) => (
                <Tag key={v} variant={v}>
                  {v}
                </Tag>
              ))}
            </Row>
          </Specimen>

          <Specimen
            name="Avatar"
            note="Falls back to initials when an image fails, rather than showing a broken-image icon."
          >
            <Row label="image">
              {SIZES.map((s) => (
                <Avatar key={s} size={s} name="Ada Lovelace" src={PORTRAIT} />
              ))}
              <Avatar name="Ada Lovelace" src={PORTRAIT} shape="square" />
            </Row>
            <Row label="failed src">
              <Avatar name="Ada Lovelace" src="/does-not-exist.png" />
              <Avatar name="Grace Hopper" src="/does-not-exist.png" />
              <Avatar src="/does-not-exist.png" />
            </Row>
            <Row label="initials">
              <Avatar name="Ada Lovelace" />
              <Avatar name="Prince" />
              <Avatar name="Grace Hopper" shape="square" />
            </Row>
            <Row label="empty">
              <Avatar />
            </Row>
          </Specimen>

          <Specimen name="Alert" note="Danger interrupts a screen reader with role alert; the rest use role status.">
            <Row label="variants">
              <div style={{ display: 'grid', gap: '0.5rem', width: '100%' }}>
                {(['info', 'success', 'warning', 'danger'] as const).map((v) => (
                  <Alert key={v} variant={v} title={`${v} alert`}>
                    The build finished with three warnings.
                  </Alert>
                ))}
              </div>
            </Row>
            <Row label="dismissible">
              <Alert variant="info" title="Dismissible" onDismiss={() => {}}>
                Closing this calls onDismiss.
              </Alert>
            </Row>
          </Specimen>

          <Specimen name="Table" note="The horizontal scroll lives in the table's own container, never the page.">
            <Row label="striped">
              <Table striped>
                <thead>
                  <tr>
                    <th scope="col">Theme</th>
                    <th scope="col">Lowest ratio</th>
                    <th scope="col">Stylesheet</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>midnight</td>
                    <td>5.67:1</td>
                    <td>3.76 KB</td>
                  </tr>
                  <tr>
                    <td>sandstone</td>
                    <td>5.58:1</td>
                    <td>3.76 KB</td>
                  </tr>
                  <tr>
                    <td>neon</td>
                    <td>5.61:1</td>
                    <td>3.75 KB</td>
                  </tr>
                </tbody>
              </Table>
            </Row>
          </Specimen>

          <Specimen name="Progress" note="Indeterminate omits aria-valuenow entirely, which is how ARIA expresses it.">
            <Row label="determinate">
              <Progress aria-label="Upload" value={62} />
            </Row>
            <Row label="indeterminate">
              <Progress aria-label="Working" />
            </Row>
            <Row label="variants">
              {(['accent', 'success', 'danger'] as const).map((v) => (
                <Progress key={v} aria-label={`Progress ${v}`} variant={v} value={45} />
              ))}
            </Row>
          </Specimen>

          <Specimen name="Spinner" note="Carries its label as visually hidden text, so it has an accessible name.">
            <Row label="sizes">
              {SIZES.map((s) => (
                <Spinner key={s} size={s} />
              ))}
            </Row>
            <Row label="label">
              <Spinner label="Checking contrast" />
            </Row>
          </Specimen>

          <Specimen name="Skeleton" note="Always aria-hidden. The last line runs short so it reads as a paragraph.">
            <Row label="text">
              <div style={{ width: '100%', maxWidth: '28rem' }}>
                <Skeleton lines={3} />
              </div>
            </Row>
            <Row label="shapes">
              <Skeleton variant="circle" width={40} height={40} />
              <Skeleton variant="rect" width={120} height={40} />
            </Row>
          </Specimen>

          <Specimen name="Modal" note="Traps focus, restores it on close, and locks page scroll while open.">
            <Row label="open it">
              <Button onClick={() => setModalOpen(true)}>Open modal</Button>
              <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Delete this theme?"
              >
                <p style={{ marginTop: 0, color: 'var(--hal-fg-muted)' }}>
                  Removing a theme also removes its stylesheet from the build. Tab around: focus
                  cannot leave this dialog, and Escape returns it to the button behind.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={() => setModalOpen(false)}>
                    Delete
                  </Button>
                </div>
              </Modal>
            </Row>
          </Specimen>

          <Specimen name="Drawer" note="The same dialog semantics, anchored to an edge.">
            <Row label="sides">
              {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
                <Button key={side} variant="outline" onClick={() => setDrawerSide(side)}>
                  {side}
                </Button>
              ))}
              <Drawer
                open={drawerSide !== null}
                side={drawerSide ?? 'right'}
                onClose={() => setDrawerSide(null)}
                title={`Drawer from the ${drawerSide ?? ''}`}
              >
                <p style={{ marginTop: 0, color: 'var(--hal-fg-muted)' }}>
                  Escape, the backdrop, or the close button all dismiss it.
                </p>
              </Drawer>
            </Row>
          </Specimen>

          <Specimen name="Tooltip" note="Describes, never defines: it is unreachable on touch, so nothing lives only here.">
            <Row label="sides">
              {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                <Tooltip key={side} side={side} content={`Anchored ${side}`}>
                  <Button variant="outline">{side}</Button>
                </Tooltip>
              ))}
            </Row>
            <Row label="on focus">
              <Tooltip content="Focus opens it with no delay">
                <Button variant="ghost">Tab to me</Button>
              </Tooltip>
            </Row>
          </Specimen>

          <Specimen name="Popover" note="An anchored dialog: focus trapped, Escape and click-outside dismiss.">
            <Row label="open it">
              <Button ref={popoverAnchor} onClick={() => setPopoverOpen((v) => !v)}>
                Toggle popover
              </Button>
              <Popover
                open={popoverOpen}
                onClose={() => setPopoverOpen(false)}
                anchorRef={popoverAnchor}
                aria-label="Filter results"
              >
                <div style={{ display: 'grid', gap: '0.5rem', minWidth: '14rem' }}>
                  <strong>Filter</strong>
                  <label className="field">
                    <Checkbox defaultChecked /> Passing contrast
                  </label>
                  <label className="field">
                    <Checkbox /> Over budget
                  </label>
                </div>
              </Popover>
            </Row>
          </Specimen>

          <Specimen name="DropdownMenu" note="Roving DOM focus, because menu items are real focus targets.">
            <Row label="menu">
              <DropdownMenu
                trigger="Actions"
                items={[
                  { id: 'rename', label: 'Rename' },
                  { id: 'duplicate', label: 'Duplicate' },
                  { id: 'archive', label: 'Archive', disabled: true },
                  { id: 'delete', label: 'Delete' },
                ]}
              />
            </Row>
          </Specimen>

          <Specimen name="Toast" note="Timers pause on hover and on focus, and bank the remaining time.">
            <Row label="variants">
              <ToastButtons />
            </Row>
          </Specimen>

          <section className="sheet-group" id="site-layouts" aria-labelledby="site-layouts-title">
            <header className="sheet-group__head">
              <h2 className="sheet-group__title" id="site-layouts-title">Site layouts</h2>
              <p className="sheet-group__note">
                Full-page scaffolds from <code>halcyon-ui/structures</code>. Pass nav data and drop your
                content in — headers, sidebars, heroes, and footers are already wired.
              </p>
            </header>

            <Specimen
              name="DashboardLayout"
              note="Interactive preview: sidebar and breadcrumbs switch the page without leaving the gallery."
            >
              <div className="site-layout-preview">
                <DashboardLayoutGalleryDemo />
              </div>
            </Specimen>

            <Specimen
              name="DocsSiteLayout"
              note="Interactive preview: doc nav and prev/next pager update the article in place."
            >
              <div className="site-layout-preview">
                <DocsSiteLayoutGalleryDemo />
              </div>
            </Specimen>

            <Specimen
              name="MarketingSiteLayout"
              note="Interactive preview: top nav and footer links switch the spotlight section."
            >
              <div className="site-layout-preview">
                <MarketingSiteLayoutGalleryDemo />
              </div>
            </Specimen>
          </section>
        </main>
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <Gallery />
    </ToastProvider>
  </StrictMode>,
)
