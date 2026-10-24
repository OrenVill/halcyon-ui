import { forwardRef, useCallback, useState } from 'react'
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { cx } from '../../internal/cx'

export interface ToggleGroupOption {
  value: string
  label: string
  disabled?: boolean
}

export type ToggleGroupType = 'single' | 'multiple'

type ToggleGroupSingleProps = {
  type?: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type ToggleGroupMultipleProps = {
  type: 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type ToggleGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> &
  (ToggleGroupSingleProps | ToggleGroupMultipleProps) & {
    options: ToggleGroupOption[]
    'aria-label'?: string
    'aria-labelledby'?: string
  }

function nextEnabled(options: ToggleGroupOption[], from: number, step: number): number {
  for (let i = from; i >= 0 && i < options.length; i += step) {
    if (!options[i]?.disabled) return i
  }
  return -1
}

export const ToggleGroup = /* @__PURE__ */ forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(props, ref) {
    if (props.type === 'multiple') {
      const {
        type: _type,
        options,
        className,
        value,
        defaultValue,
        onValueChange,
        ...rest
      } = props
      return (
        <ToggleGroupMultiple
          {...rest}
          ref={ref}
          options={options}
          className={className}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
        />
      )
    }

    const {
      type: _type,
      options,
      className,
      onKeyDown,
      value,
      defaultValue,
      onValueChange,
      ...rest
    } = props

    return (
      <ToggleGroupSingle
        {...rest}
        ref={ref}
        options={options}
        className={className}
        onKeyDown={onKeyDown}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
      />
    )
  },
)

interface ToggleGroupSingleInternalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  options: ToggleGroupOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const ToggleGroupSingle = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  ToggleGroupSingleInternalProps
>(function ToggleGroupSingle(
  { options, value, defaultValue, onValueChange, className, onKeyDown, ...rest },
  ref,
) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const current = isControlled ? value : internalValue

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
    }

    if (target >= 0 && target !== index) {
      event.preventDefault()
      const next = options[target]
      if (next && !next.disabled) select(next.value)
    }

    onKeyDown?.(event)
  }

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      className={cx('hal-toggle-group', className)}
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const selected = option.value === current
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            disabled={option.disabled}
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={cx(
              'hal-toggle-group__option',
              selected && 'hal-toggle-group__option--selected',
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

interface ToggleGroupMultipleInternalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  options: ToggleGroupOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

const ToggleGroupMultiple = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  ToggleGroupMultipleInternalProps
>(function ToggleGroupMultiple(
  { options, value, defaultValue, onValueChange, className, ...rest },
  ref,
) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? [])
  const current = isControlled ? value : internalValue

  const toggle = useCallback(
    (optionValue: string) => {
      const next = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue]
      if (!isControlled) setInternalValue(next)
      onValueChange?.(next)
    },
    [current, isControlled, onValueChange],
  )

  return (
    <div {...rest} ref={ref} role="group" className={cx('hal-toggle-group', className)}>
      {options.map((option) => {
        const pressed = current.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            aria-pressed={pressed}
            className={cx(
              'hal-toggle-group__option',
              pressed && 'hal-toggle-group__option--selected',
            )}
            onClick={() => {
              if (!option.disabled) toggle(option.value)
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
})
