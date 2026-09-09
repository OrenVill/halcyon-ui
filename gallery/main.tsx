/*
 * The gallery is a proofing tool, not a docs site. It renders the real
 * components from the real build, painted with the real theme tokens, so what
 * you see is what the package produces.
 *
 * It is dev-only: package.json ships "files": ["dist"], so none of this is
 * published to npm.
 */
import { StrictMode, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Drawer,
  DropdownMenu,
  Modal,
  Popover,
  IconButton,
  Input,
  NumberInput,
  Radio,
  Progress,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  Tag,
  Textarea,
  ToastProvider,
  Tooltip,
  useToast,
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

const SECTIONS = [
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

const BUTTON_VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'danger'] as const
const SIZES = ['sm', 'md', 'lg'] as const

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
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
        <nav className="rail" aria-label="Components">
          <p className="rail__title">Components</p>
          <ol className="rail__list">
            {SECTIONS.map((name) => (
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
