import { forwardRef, useState } from 'react'
import type { ChangeEvent, FocusEvent, InputHTMLAttributes, KeyboardEvent } from 'react'
import { cx } from '../../internal/cx'

export type NumberInputSize = 'sm' | 'md' | 'lg'

/**
 * The native props this component owns are omitted from the extended type and
 * redeclared: `value`/`defaultValue`/`min`/`max`/`step` are numbers rather
 * than strings here, `onChange` is replaced by `onValueChange`, and `size` is
 * the library's size scale rather than the input's character count.
 */
export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'size' | 'min' | 'max' | 'step'
  > {
  /** Controlled value. When provided, the parent owns the value. */
  value?: number
  /** Starting value when uncontrolled. */
  defaultValue?: number
  /** Fires with the numeric value on every change, typed or stepped. */
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  /** Amount a single step moves the value by. Defaults to 1. */
  step?: number
  size?: NumberInputSize
  /** Marks the field as failing validation. */
  invalid?: boolean
}

/** Text that is on its way to being a number: '', '-', '1.', '-1.25'. */
const PARTIAL_NUMBER = /^-?\d*\.?\d*$/

function decimalsOf(n: number): number {
  if (!Number.isFinite(n)) return 0
  const text = String(n)
  // Exponent form ('1e-7') has no literal decimals to count; fall back to a
  // precision that survives the round trip.
  if (text.includes('e') || text.includes('E')) {
    const exponent = Number(text.split(/e/i)[1])
    return exponent < 0 ? Math.min(Math.abs(exponent) + 2, 20) : 0
  }
  return text.split('.')[1]?.length ?? 0
}

function formatNumber(n: number): string {
  return Number.isFinite(n) ? String(n) : ''
}

export const NumberInput = /* @__PURE__ */ forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      size = 'md',
      invalid = false,
      className,
      style,
      disabled,
      onKeyDown,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const isControlled = value !== undefined

    // The draft is the text in the box, which is not always a finished number:
    // '-' and '1.' are valid things to be halfway through typing. When
    // controlled it is only ever a display overlay — the `value` prop stays
    // the source of truth, and the draft is shown only while it parses to
    // exactly that number.
    const [draft, setDraft] = useState<string>(() => {
      if (defaultValue !== undefined) return formatNumber(defaultValue)
      if (value !== undefined) return formatNumber(value)
      return ''
    })

    const draftMatchesValue =
      isControlled && draft.trim() !== '' && Number(draft) === value
    const text = isControlled ? (draftMatchesValue ? draft : formatNumber(value)) : draft

    const parsed = text.trim() === '' ? NaN : Number(text)
    const current = Number.isFinite(parsed) ? parsed : NaN

    function clamp(n: number): number {
      let next = n
      if (min !== undefined) next = Math.max(next, min)
      if (max !== undefined) next = Math.min(next, max)
      return next
    }

    /**
     * Binary floating point cannot hold 0.1, so 0.1 + 0.1 + 0.1 lands on
     * 0.30000000000000004. Rounding to the decimals the inputs actually carry
     * puts the result back on the grid the user is typing on.
     */
    function round(n: number, ...sources: number[]): number {
      const decimals = Math.min(
        Math.max(decimalsOf(step), ...sources.map(decimalsOf)),
        20,
      )
      return Number(n.toFixed(decimals))
    }

    function commit(next: number, ...sources: number[]) {
      if (!Number.isFinite(next)) return
      const settled = round(clamp(next), ...sources)
      // Written unconditionally: when controlled and the parent declines the
      // change, the prop no longer matches the draft and the prop wins on the
      // next render.
      setDraft(formatNumber(settled))
      onValueChange?.(settled)
    }

    function step_(direction: 1 | -1) {
      const base = Number.isFinite(current) ? current : (min ?? 0)
      commit(base + direction * step, base)
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      onKeyDown?.(event)
      if (event.defaultPrevented || disabled) return

      switch (event.key) {
        case 'ArrowUp':
          // Otherwise the caret jumps to the start of the text as well.
          event.preventDefault()
          step_(1)
          break
        case 'ArrowDown':
          event.preventDefault()
          step_(-1)
          break
        case 'Home':
          if (min === undefined) return
          event.preventDefault()
          commit(min)
          break
        case 'End':
          if (max === undefined) return
          event.preventDefault()
          commit(max)
          break
        default:
          break
      }
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      const raw = event.target.value
      // Letters and stray symbols are refused outright rather than parsed into
      // NaN and handed to the caller.
      if (!PARTIAL_NUMBER.test(raw)) return

      setDraft(raw)
      if (raw.trim() === '') return

      const next = Number(raw)
      if (!Number.isFinite(next)) return
      onValueChange?.(round(clamp(next), next))
    }

    function handleBlur(event: FocusEvent<HTMLInputElement>) {
      // Half-typed text ('1.', '-') and out-of-range entries settle here
      // rather than fighting the user mid-keystroke.
      const raw = event.target.value
      const next = raw.trim() === '' ? NaN : Number(raw)
      if (Number.isFinite(next)) {
        const settled = round(clamp(next), next)
        setDraft(formatNumber(settled))
        if (settled !== next) onValueChange?.(settled)
      } else if (raw !== '') {
        setDraft(isControlled ? formatNumber(value as number) : '')
      }
      onBlur?.(event)
    }

    return (
      <div
        className={cx(
          'hal-number-input',
          `hal-number-input--${size}`,
          invalid && 'hal-number-input--invalid',
          disabled && 'hal-number-input--disabled',
          className,
        )}
        style={style}
      >
        {/*
          The steppers are hidden from assistive technology and taken out of
          the tab order on purpose. The input is already a spinbutton: it
          exposes the value and its own keyboard model, so exposing the
          buttons too would turn one control into three tab stops that all
          say the same thing.
        */}
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          disabled={disabled}
          className="hal-number-input__step hal-number-input__step--down"
          onClick={() => step_(-1)}
        >
          &minus;
        </button>
        <input
          {...rest}
          ref={ref}
          // Not type="number": it silently drops invalid text, brings a
          // scroll-wheel trap and a spinner no theme can restyle.
          type="text"
          inputMode="decimal"
          role="spinbutton"
          value={text}
          disabled={disabled}
          aria-valuenow={Number.isFinite(current) ? current : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-invalid={invalid || undefined}
          className="hal-number-input__field"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          disabled={disabled}
          className="hal-number-input__step hal-number-input__step--up"
          onClick={() => step_(1)}
        >
          +
        </button>
      </div>
    )
  },
)
