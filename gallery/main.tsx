/*
 * The gallery is a proofing tool, not a docs site. It renders the real
 * components from the real build, painted with the real theme tokens, so what
 * you see is what the package produces.
 *
 * It is dev-only: package.json ships "files": ["dist"], so none of this is
 * published to npm.
 */
import { StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Button,
  Checkbox,
  IconButton,
  Input,
  NumberInput,
  Radio,
  Select,
  Slider,
  Switch,
  Textarea,
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
        </main>
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
)
