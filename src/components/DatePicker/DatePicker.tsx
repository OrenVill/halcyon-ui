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
import type { ButtonHTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { cx } from '../../internal/cx'
import {
  addDays,
  addMonths,
  formatDate,
  formatDateRange,
  formatMonthYear,
  getCalendarMonthGrid,
  getWeekdayLabels,
  isAfterDay,
  isBeforeDay,
  isDateDisabled,
  isSameMonth,
  sameDay,
  startOfDay,
  toISODateString,
} from '../../internal/date'
import { computePosition } from '../../internal/position'
import type { Align, Placement, Side } from '../../internal/position'

export type DatePickerSize = 'sm' | 'md' | 'lg'

export interface DateRangeValue {
  start: Date
  end: Date
}

export interface DatePickerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange' | 'size'
  > {
  mode?: 'single' | 'range'
  value?: Date | DateRangeValue | null
  defaultValue?: Date | DateRangeValue | null
  onValueChange?: (value: Date | DateRangeValue | null) => void
  min?: Date
  max?: Date
  disabledDates?: Date[]
  locale?: string
  weekStartsOn?: 0 | 1
  placeholder?: string
  size?: DatePickerSize
  invalid?: boolean
  name?: string
  side?: Side
  align?: Align
}

function isRangeValue(value: Date | DateRangeValue | null | undefined): value is DateRangeValue {
  return Boolean(value && typeof value === 'object' && 'start' in value && 'end' in value)
}

function dayInRange(day: Date, start: Date, end: Date): boolean {
  return !isBeforeDay(day, start) && !isAfterDay(day, end)
}

export const DatePicker = /* @__PURE__ */ forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      mode = 'single',
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      disabledDates,
      locale,
      weekStartsOn = 0,
      placeholder = 'Pick a date…',
      size = 'md',
      invalid = false,
      name,
      side = 'bottom',
      align = 'start',
      className,
      disabled,
      onKeyDown,
      onClick,
      ...rest
    },
    ref,
  ) {
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<Date | DateRangeValue | null>(
      defaultValue ?? null,
    )
    const current = isControlled ? value : internalValue

    const [open, setOpen] = useState(false)
    const [viewMonth, setViewMonth] = useState(() =>
      startOfDay(
        isRangeValue(current)
          ? current.start
          : current instanceof Date
            ? current
            : new Date(),
      ),
    )
    const [focusDay, setFocusDay] = useState<Date | null>(null)
    const [rangeDraft, setRangeDraft] = useState<Date | null>(null)
    const [placement, setPlacement] = useState<Placement>({ x: 0, y: 0, side })

    const rootRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    const baseId = useId()
    const gridId = `${baseId}-grid`

    const bounds = { min, max, disabledDates }

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const close = useCallback((restoreFocus = true) => {
      setOpen(false)
      setRangeDraft(null)
      if (restoreFocus) triggerRef.current?.focus()
    }, [])

    const commit = useCallback(
      (next: Date | DateRangeValue | null) => {
        if (!isControlled) setInternalValue(next)
        onValueChange?.(next)
      },
      [isControlled, onValueChange],
    )

    const selectDay = useCallback(
      (day: Date) => {
        if (isDateDisabled(day, bounds)) return
        const picked = startOfDay(day)
        if (mode === 'single') {
          commit(picked)
          close()
          return
        }

        if (!rangeDraft) {
          setRangeDraft(picked)
          return
        }

        const start = isBeforeDay(picked, rangeDraft) ? picked : rangeDraft
        const end = isBeforeDay(picked, rangeDraft) ? rangeDraft : picked
        commit({ start, end })
        setRangeDraft(null)
        close()
      },
      [bounds, close, commit, mode, rangeDraft],
    )

    const openPanel = useCallback(() => {
      if (disabled) return
      const anchor =
        isRangeValue(current)
          ? current.start
          : current instanceof Date
            ? current
            : new Date()
      setViewMonth(startOfDay(anchor))
      setFocusDay(startOfDay(anchor))
      setOpen(true)
    }, [current, disabled])

    useLayoutEffect(() => {
      if (!open) return
      const anchor = triggerRef.current
      const panel = panelRef.current
      if (!anchor || !panel) return

      const update = () => {
        const rect = anchor.getBoundingClientRect()
        setPlacement(
          computePosition(
            { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            { width: panel.offsetWidth, height: panel.offsetHeight },
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
    }, [open, side, align, viewMonth])

    useEffect(() => {
      if (!open) return
      panelRef.current?.focus()
    }, [open])

    useEffect(() => {
      if (!open) return
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node
        if (rootRef.current?.contains(target)) return
        if (panelRef.current?.contains(target)) return
        close(false)
      }
      document.addEventListener('pointerdown', onPointerDown)
      return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [open, close])

    const gridDays = getCalendarMonthGrid(viewMonth, weekStartsOn)
    const weekdays = getWeekdayLabels(locale, weekStartsOn)

    const moveFocus = (next: Date) => {
      let day = next
      if (isDateDisabled(day, bounds)) {
        for (let i = 0; i < 31; i += 1) {
          const candidate = addDays(day, i)
          if (!isDateDisabled(candidate, bounds)) {
            day = candidate
            break
          }
        }
      }
      setFocusDay(day)
      if (!isSameMonth(day, viewMonth)) setViewMonth(new Date(day.getFullYear(), day.getMonth(), 1))
    }

    const handleGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!focusDay) return
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          moveFocus(addDays(focusDay, -1))
          break
        case 'ArrowRight':
          event.preventDefault()
          moveFocus(addDays(focusDay, 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          moveFocus(addDays(focusDay, -7))
          break
        case 'ArrowDown':
          event.preventDefault()
          moveFocus(addDays(focusDay, 7))
          break
        case 'PageUp':
          event.preventDefault()
          setViewMonth(addMonths(viewMonth, -1))
          break
        case 'PageDown':
          event.preventDefault()
          setViewMonth(addMonths(viewMonth, 1))
          break
        case 'Home':
          event.preventDefault()
          moveFocus(gridDays[0])
          break
        case 'End':
          event.preventDefault()
          moveFocus(gridDays[gridDays.length - 1])
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          selectDay(focusDay)
          break
        case 'Escape':
          event.preventDefault()
          close()
          break
        default:
          break
      }
    }

    const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || disabled) return
      if (!open && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        openPanel()
      }
    }

    const displayLabel = (() => {
      if (mode === 'range' && isRangeValue(current)) {
        return formatDateRange(current.start, current.end, locale)
      }
      if (current instanceof Date) return formatDate(current, locale)
      return placeholder
    })()

    const hasValue =
      current instanceof Date || (mode === 'range' && isRangeValue(current))

    const hiddenValue = (() => {
      if (current instanceof Date) return toISODateString(current)
      if (isRangeValue(current)) {
        return `${toISODateString(current.start)},${toISODateString(current.end)}`
      }
      return ''
    })()

    const rangeStart =
      mode === 'range' && isRangeValue(current)
        ? current.start
        : rangeDraft
    const rangeEnd =
      mode === 'range' && isRangeValue(current) ? current.end : rangeDraft

    const panel = open
      ? createPortal(
          <div
            ref={panelRef}
            id={gridId}
            role="dialog"
            aria-modal="false"
            className="hal-date-picker__panel"
            tabIndex={-1}
            style={{ position: 'fixed', left: placement.x, top: placement.y }}
            onKeyDown={handleGridKeyDown}
          >
            <div className="hal-date-picker__header">
              <button
                type="button"
                className="hal-date-picker__nav"
                aria-label="Previous month"
                onClick={() => setViewMonth(addMonths(viewMonth, -1))}
              >
                ‹
              </button>
              <div className="hal-date-picker__title">{formatMonthYear(viewMonth, locale)}</div>
              <button
                type="button"
                className="hal-date-picker__nav"
                aria-label="Next month"
                onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              >
                ›
              </button>
            </div>
            <div className="hal-date-picker__weekdays" aria-hidden="true">
              {weekdays.map((label) => (
                <span key={label} className="hal-date-picker__weekday">{label}</span>
              ))}
            </div>
            <div className="hal-date-picker__grid" role="grid">
              {gridDays.map((day) => {
                const outside = !isSameMonth(day, viewMonth)
                const selected =
                  (current instanceof Date && sameDay(day, current)) ||
                  (rangeStart && sameDay(day, rangeStart)) ||
                  (rangeEnd && sameDay(day, rangeEnd))
                const inRange =
                  mode === 'range' &&
                  rangeStart &&
                  rangeEnd &&
                  dayInRange(day, rangeStart, rangeEnd)
                const disabledDay = isDateDisabled(day, bounds)
                const focused = focusDay && sameDay(day, focusDay)
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    role="gridcell"
                    tabIndex={focused ? 0 : -1}
                    disabled={disabledDay}
                    aria-selected={selected || undefined}
                    className={cx(
                      'hal-date-picker__day',
                      outside && 'hal-date-picker__day--outside',
                      selected && 'hal-date-picker__day--selected',
                      inRange && !selected && 'hal-date-picker__day--in-range',
                      disabledDay && 'hal-date-picker__day--disabled',
                      focused && 'hal-date-picker__day--focused',
                    )}
                    onClick={() => selectDay(day)}
                    onFocus={() => setFocusDay(day)}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>
          </div>,
          document.body,
        )
      : null

    return (
      <div
        ref={rootRef}
        className={cx(
          'hal-date-picker',
          `hal-date-picker--${size}`,
          invalid && 'hal-date-picker--invalid',
          className,
        )}
      >
        <button
          {...rest}
          ref={setRefs}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? gridId : undefined}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          className="hal-date-picker__trigger"
          onKeyDown={handleTriggerKeyDown}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            if (open) close()
            else openPanel()
          }}
        >
          <span
            className={cx(
              'hal-date-picker__value',
              !hasValue && 'hal-date-picker__value--placeholder',
            )}
          >
            {displayLabel}
          </span>
          <span className="hal-date-picker__icon" aria-hidden="true" />
        </button>

        {panel}

        {name ? <input type="hidden" name={name} value={hiddenValue} /> : null}
      </div>
    )
  },
)
