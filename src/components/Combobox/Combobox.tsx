import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import type { InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { cx } from '../../internal/cx'
import { computePosition } from '../../internal/position'
import type { Align, Placement, Side } from '../../internal/position'

export type ComboboxSize = 'sm' | 'md' | 'lg'

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'size' | 'role'
  > {
  options: ComboboxOption[]
  /** Controlled selection. String for single mode, string[] for multi. */
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  multi?: boolean
  placeholder?: string
  size?: ComboboxSize
  invalid?: boolean
  /**
   * Renders hidden input(s) for form submission. Multi mode emits one input per
   * selected value, all sharing this name.
   */
  name?: string
  /** Override option filtering. The default matches labels case-insensitively. */
  filterOptions?: (options: ComboboxOption[], inputValue: string) => ComboboxOption[]
  /** Panel placement. Defaults to below, start-aligned, full anchor width. */
  side?: Side
  align?: Align
}

function defaultFilter(options: ComboboxOption[], inputValue: string): ComboboxOption[] {
  const query = inputValue.trim().toLowerCase()
  if (!query) return options
  return options.filter((option) => option.label.toLowerCase().includes(query))
}

function nextEnabled(options: ComboboxOption[], from: number, step: number): number {
  for (let i = from; i >= 0 && i < options.length; i += step) {
    if (!options[i]?.disabled) return i
  }
  return -1
}

function asArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : value ? [value] : []
}

export const Combobox = /* @__PURE__ */ forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      multi = false,
      placeholder = 'Search…',
      size = 'md',
      invalid = false,
      name,
      filterOptions = defaultFilter,
      side = 'bottom',
      align = 'start',
      className,
      disabled,
      onKeyDown,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<string | string[]>(() => {
      if (defaultValue !== undefined) return defaultValue
      return multi ? [] : ''
    })
    const selectedValues = asArray(isControlled ? value : internalValue)

    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [activeIndex, setActiveIndex] = useState(-1)
    const [placement, setPlacement] = useState<Placement>({ x: 0, y: 0, side })

    const rootRef = useRef<HTMLDivElement>(null)
    const fieldRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const listRef = useRef<HTMLUListElement>(null)

    const baseId = useId()
    const listId = `${baseId}-listbox`

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const filtered = filterOptions(options, inputValue)

    const commitSelection = useCallback(
      (option: ComboboxOption) => {
        if (option.disabled) return
        if (multi) {
          const next = selectedValues.includes(option.value)
            ? selectedValues.filter((v) => v !== option.value)
            : [...selectedValues, option.value]
          if (!isControlled) setInternalValue(next)
          onValueChange?.(next)
          setInputValue('')
        } else {
          if (!isControlled) setInternalValue(option.value)
          onValueChange?.(option.value)
          setInputValue(option.label)
          setOpen(false)
          setActiveIndex(-1)
        }
      },
      [isControlled, multi, onValueChange, selectedValues],
    )

    const removeChip = useCallback(
      (optionValue: string) => {
        const next = selectedValues.filter((v) => v !== optionValue)
        if (!isControlled) setInternalValue(next)
        onValueChange?.(next)
        inputRef.current?.focus()
      },
      [isControlled, onValueChange, selectedValues],
    )

    const close = useCallback((restoreFocus = true) => {
      setOpen(false)
      setActiveIndex(-1)
      if (!multi) {
        const selected = options.find((o) => o.value === selectedValues[0])
        setInputValue(selected?.label ?? '')
      } else {
        setInputValue('')
      }
      if (restoreFocus) inputRef.current?.focus()
    }, [multi, options, selectedValues])

    const openList = useCallback(
      (startIndex: number) => {
        if (disabled) return
        if (!multi) setInputValue('')
        setOpen(true)
        const visible = filterOptions(options, '')
        setActiveIndex(
          startIndex >= 0 && !visible[startIndex]?.disabled
            ? startIndex
            : nextEnabled(visible, 0, 1),
        )
      },
      [disabled, filterOptions, multi, options],
    )

    useLayoutEffect(() => {
      if (!open) return
      const anchor = fieldRef.current
      const list = listRef.current
      if (!anchor || !list) return

      const update = () => {
        const rect = anchor.getBoundingClientRect()
        setPlacement(
          computePosition(
            { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            { width: Math.max(list.offsetWidth, rect.width), height: list.offsetHeight },
            { width: window.innerWidth, height: window.innerHeight },
            { side, align },
          ),
        )
      }

      update()
      window.addEventListener('resize', update)
      window.addEventListener('scroll', update, true)
      return () => {
        window.removeEventListener('resize', update)
        window.removeEventListener('scroll', update, true)
      }
    }, [open, side, align, filtered.length])

    useEffect(() => {
      if (!open || activeIndex < 0) return
      listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }, [open, activeIndex])

    useEffect(() => {
      if (!open) return
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node
        if (rootRef.current?.contains(target)) return
        if (listRef.current?.contains(target)) return
        close(false)
      }
      document.addEventListener('pointerdown', onPointerDown)
      return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [open, close])

    // Sync the visible input when the selection changes from outside.
    useEffect(() => {
      if (multi || open) return
      const selected = options.find((o) => o.value === selectedValues[0])
      setInputValue(selected?.label ?? '')
    }, [multi, open, options, selectedValues])

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || disabled) return

      if (!open) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          openList(-1)
          return
        }
        if (event.key === 'Enter') {
          event.preventDefault()
          openList(-1)
        }
        if (multi && event.key === 'Backspace' && !inputValue && selectedValues.length > 0) {
          const last = selectedValues[selectedValues.length - 1]
          if (last) removeChip(last)
        }
        return
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setActiveIndex((index) => {
            const next = nextEnabled(filtered, index + 1, 1)
            return next >= 0 ? next : index
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setActiveIndex((index) => {
            const next = nextEnabled(filtered, index - 1, -1)
            return next >= 0 ? next : index
          })
          break
        case 'Home':
          event.preventDefault()
          setActiveIndex(nextEnabled(filtered, 0, 1))
          break
        case 'End':
          event.preventDefault()
          setActiveIndex(nextEnabled(filtered, filtered.length - 1, -1))
          break
        case 'Enter':
          event.preventDefault()
          if (activeIndex >= 0 && filtered[activeIndex]) commitSelection(filtered[activeIndex])
          break
        case 'Escape':
          event.preventDefault()
          close()
          break
        case 'Tab':
          close(false)
          break
        default:
          break
      }
    }

    const selectedChips = multi
      ? selectedValues
          .map((v) => options.find((o) => o.value === v))
          .filter((o): o is ComboboxOption => Boolean(o))
      : []

    const listbox =
      open
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-multiselectable={multi || undefined}
              className="hal-combobox__list"
              style={{
                position: 'fixed',
                left: placement.x,
                top: placement.y,
                minWidth: fieldRef.current?.offsetWidth,
              }}
            >
              {filtered.length === 0 ? (
                <li className="hal-combobox__empty">No matches</li>
              ) : (
                filtered.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <li
                      key={option.value}
                      id={`${baseId}-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      className={cx(
                        'hal-combobox__option',
                        index === activeIndex && 'hal-combobox__option--active',
                        isSelected && 'hal-combobox__option--selected',
                        option.disabled && 'hal-combobox__option--disabled',
                      )}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => commitSelection(option)}
                      onPointerEnter={() => {
                        if (!option.disabled) setActiveIndex(index)
                      }}
                    >
                      {option.label}
                    </li>
                  )
                })
              )}
            </ul>,
            document.body,
          )
        : null

    return (
      <div
        ref={rootRef}
        className={cx(
          'hal-combobox',
          `hal-combobox--${size}`,
          invalid && 'hal-combobox--invalid',
          className,
        )}
      >
        <div
          ref={fieldRef}
          className={cx('hal-combobox__field', disabled && 'hal-combobox__field--disabled')}
        >
          {selectedChips.map((chip) => (
            <span key={chip.value} className="hal-combobox__chip">
              <span className="hal-combobox__chip-label">{chip.label}</span>
              <button
                type="button"
                className="hal-combobox__chip-remove"
                aria-label={`Remove ${chip.label}`}
                disabled={disabled}
                onClick={() => removeChip(chip.value)}
              >
                <span aria-hidden="true">&#215;</span>
              </button>
            </span>
          ))}
          <input
            {...rest}
            ref={setRefs}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={
              open && activeIndex >= 0 ? `${baseId}-${activeIndex}` : undefined
            }
            aria-invalid={invalid || undefined}
            aria-autocomplete="list"
            disabled={disabled}
            className="hal-combobox__input"
            placeholder={placeholder}
            value={inputValue}
            onChange={(event) => {
              if (event.defaultPrevented) return
              const nextInput = event.target.value
              setInputValue(nextInput)
              const nextFiltered = filterOptions(options, nextInput)
              if (!open) openList(-1)
              else setActiveIndex(nextEnabled(nextFiltered, 0, 1))
            }}
            onFocus={(event) => {
              onFocus?.(event)
              if (event.defaultPrevented || disabled) return
              openList(-1)
            }}
            onBlur={(event) => {
              onBlur?.(event)
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {listbox}

        {name && !multi ? (
          <input type="hidden" name={name} value={selectedValues[0] ?? ''} />
        ) : null}
        {name && multi
          ? selectedValues.map((v) => <input key={v} type="hidden" name={name} value={v} />)
          : null}
      </div>
    )
  },
)
