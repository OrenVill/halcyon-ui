import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { cx } from '../../internal/cx'

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange' | 'size' | 'children'
  > {
  options: SelectOption[]
  /** Controlled value. Omit for uncontrolled. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Shown when nothing is selected. */
  placeholder?: string
  size?: SelectSize
  invalid?: boolean
  /**
   * Renders a hidden input under this name. A native <select> participates in
   * form submission for free; a custom listbox has to earn it back.
   */
  name?: string
}

/** Milliseconds of quiet before the type-ahead buffer resets. */
const TYPEAHEAD_RESET = 500

function nextEnabled(options: SelectOption[], from: number, step: number): number {
  for (let i = from; i >= 0 && i < options.length; i += step) {
    if (!options[i]?.disabled) return i
  }
  return -1
}

export const Select = /* @__PURE__ */ forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder = 'Select…',
    size = 'md',
    invalid = false,
    name,
    className,
    disabled,
    onKeyDown,
    onClick,
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const current = isControlled ? value : internalValue

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropUp, setDropUp] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef({ buffer: '', at: 0 })

  const baseId = useId()
  const listId = `${baseId}-listbox`

  const setRefs = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  const selectedIndex = options.findIndex((option) => option.value === current)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined

  const commit = useCallback(
    (index: number) => {
      const option = options[index]
      if (!option || option.disabled) return
      if (!isControlled) setInternalValue(option.value)
      onValueChange?.(option.value)
    },
    [isControlled, onValueChange, options],
  )

  const close = useCallback((restoreFocus = true) => {
    setOpen(false)
    setActiveIndex(-1)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  const openList = useCallback(
    (startIndex: number) => {
      if (disabled) return
      setOpen(true)
      setActiveIndex(
        startIndex >= 0 && !options[startIndex]?.disabled
          ? startIndex
          : nextEnabled(options, 0, 1),
      )
    },
    [disabled, options],
  )

  // Flip above the trigger when there is not room below. The shared anchoring
  // helper arrives with the overlay components; this is the one case it needs
  // to handle today.
  useLayoutEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const list = listRef.current
    if (!trigger || !list) return

    const rect = trigger.getBoundingClientRect()
    const below = window.innerHeight - rect.bottom
    const needed = list.offsetHeight
    setDropUp(below < needed && rect.top > below)
  }, [open])

  // Keep the active option in view while arrowing through a long list.
  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, close])

  const jumpByTypeahead = useCallback(
    (key: string) => {
      const now = Date.now()
      const buffer =
        now - typeahead.current.at > TYPEAHEAD_RESET
          ? key.toLowerCase()
          : typeahead.current.buffer + key.toLowerCase()
      typeahead.current = { buffer, at: now }

      const index = options.findIndex(
        (option) => !option.disabled && option.label.toLowerCase().startsWith(buffer),
      )
      if (index < 0) return

      if (open) setActiveIndex(index)
      else commit(index)
    },
    [commit, open, options],
  )

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled) return

    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openList(selectedIndex)
        return
      }
      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        jumpByTypeahead(event.key)
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => {
          const next = nextEnabled(options, index + 1, 1)
          return next >= 0 ? next : index
        })
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => {
          const next = nextEnabled(options, index - 1, -1)
          return next >= 0 ? next : index
        })
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(nextEnabled(options, 0, 1))
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(nextEnabled(options, options.length - 1, -1))
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(activeIndex)
        close()
        break
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        close(false)
        break
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault()
          jumpByTypeahead(event.key)
        }
    }
  }

  return (
    <div
      ref={rootRef}
      className={cx('hal-select', `hal-select--${size}`, invalid && 'hal-select--invalid', className)}
    >
      <button
        {...rest}
        ref={setRefs}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${baseId}-${activeIndex}` : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        className="hal-select__trigger"
        onKeyDown={handleKeyDown}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          if (open) close()
          else openList(selectedIndex)
        }}
      >
        <span className={cx('hal-select__value', !selected && 'hal-select__value--placeholder')}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="hal-select__arrow" aria-hidden="true" />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className={cx('hal-select__list', dropUp && 'hal-select__list--up')}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${baseId}-${index}`}
              role="option"
              aria-selected={option.value === current}
              aria-disabled={option.disabled || undefined}
              className={cx(
                'hal-select__option',
                index === activeIndex && 'hal-select__option--active',
                option.value === current && 'hal-select__option--selected',
                option.disabled && 'hal-select__option--disabled',
              )}
              // Pointer down would blur the trigger before the click lands.
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                if (option.disabled) return
                commit(index)
                close()
              }}
              onPointerEnter={() => {
                if (!option.disabled) setActiveIndex(index)
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}

      {name ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  )
})
