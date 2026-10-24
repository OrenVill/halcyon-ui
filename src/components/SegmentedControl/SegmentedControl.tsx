import { forwardRef, useCallback, useId, useRef, useState } from 'react'
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { cx } from '../../internal/cx'

export interface SegmentedControlOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: SegmentedControlOption[]
  /** Controlled selection. Omit for uncontrolled. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Accessible name when no visible label wraps the group. */
  'aria-label'?: string
  'aria-labelledby'?: string
}

function nextEnabled(options: SegmentedControlOption[], from: number, step: number): number {
  for (let i = from; i >= 0 && i < options.length; i += step) {
    if (!options[i]?.disabled) return i
  }
  return -1
}

export const SegmentedControl = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? '')
  const current = isControlled ? value : internalValue

  const baseId = useId()
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  const select = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((opt) => opt.value === current)
    if (index < 0) {
      onKeyDown?.(event)
      return
    }

    let target = -1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      target = nextEnabled(options, index + 1, 1)
      if (target < 0) target = nextEnabled(options, 0, 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      target = nextEnabled(options, index - 1, -1)
      if (target < 0) target = nextEnabled(options, options.length - 1, -1)
    } else if (event.key === 'Home') {
      target = nextEnabled(options, 0, 1)
    } else if (event.key === 'End') {
      target = nextEnabled(options, options.length - 1, -1)
    }

    if (target >= 0 && target !== index) {
      event.preventDefault()
      const next = options[target]
      if (next && !next.disabled) {
        select(next.value)
        optionRefs.current[target]?.focus()
      }
    }

    onKeyDown?.(event)
  }

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      className={cx('hal-segmented-control', className)}
      onKeyDown={handleKeyDown}
    >
      {options.map((option, index) => {
        const selected = option.value === current
        const optionId = `${baseId}-${option.value}`
        return (
          <button
            key={option.value}
            ref={(node) => {
              optionRefs.current[index] = node
            }}
            type="button"
            id={optionId}
            role="radio"
            disabled={option.disabled}
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={cx(
              'hal-segmented-control__option',
              selected && 'hal-segmented-control__option--selected',
            )}
            onClick={() => {
              if (!option.disabled) select(option.value)
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
})
