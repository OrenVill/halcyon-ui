/*
 * Calendar math for DatePicker. Names come from Intl at the call site; this
 * file only moves dates around in local time without pulling in a library.
 */

/** Midnight local time on the same calendar day. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return startOfDay(next)
}

/** First day of the target month, local time. */
export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function compareDays(a: Date, b: Date): number {
  const ta = startOfDay(a).getTime()
  const tb = startOfDay(b).getTime()
  if (ta < tb) return -1
  if (ta > tb) return 1
  return 0
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return compareDays(a, b) < 0
}

export function isAfterDay(a: Date, b: Date): boolean {
  return compareDays(a, b) > 0
}

export interface DateBounds {
  min?: Date
  max?: Date
  disabledDates?: Date[]
  isDisabled?: (date: Date) => boolean
}

export function isDateDisabled(date: Date, bounds: DateBounds = {}): boolean {
  const { min, max, disabledDates, isDisabled } = bounds
  if (min && isBeforeDay(date, min)) return true
  if (max && isAfterDay(date, max)) return true
  if (disabledDates?.some((d) => sameDay(d, date))) return true
  if (isDisabled?.(date)) return true
  return false
}

/**
 * Six weeks of days covering the month that contains `month`, padded so the
 * grid always starts on `weekStartsOn` (0 = Sunday).
 */
export function getCalendarMonthGrid(month: Date, weekStartsOn: 0 | 1 = 0): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const lead = (first.getDay() - weekStartsOn + 7) % 7
  const start = addDays(first, -lead)
  const days: Date[] = []
  for (let i = 0; i < 42; i += 1) days.push(addDays(start, i))
  return days
}

/** Short weekday labels for a calendar header row, in column order. */
export function getWeekdayLabels(locale?: string, weekStartsOn: 0 | 1 = 0): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const sunday = new Date(2023, 0, 1)
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(addDays(sunday, (weekStartsOn + index) % 7)),
  )
}

export function formatMonthYear(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)
}

export function formatDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

export function formatDateRange(start: Date, end: Date, locale?: string): string {
  return `${formatDate(start, locale)} – ${formatDate(end, locale)}`
}

/** ISO date string (YYYY-MM-DD) in local time, for hidden inputs. */
export function toISODateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
