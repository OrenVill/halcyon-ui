import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  compareDays,
  formatMonthYear,
  getCalendarMonthGrid,
  getWeekdayLabels,
  isDateDisabled,
  sameDay,
  startOfDay,
  toISODateString,
} from './date'

describe('startOfDay', () => {
  it('strips the time portion', () => {
    const d = startOfDay(new Date(2024, 5, 15, 14, 30))
    expect(d.getHours()).toBe(0)
    expect(d.getDate()).toBe(15)
  })
})

describe('addDays', () => {
  it('moves across month boundaries', () => {
    const d = addDays(new Date(2024, 0, 31), 1)
    expect(d.getMonth()).toBe(1)
    expect(d.getDate()).toBe(1)
  })
})

describe('addMonths', () => {
  it('lands on the first of the target month', () => {
    const d = addMonths(new Date(2024, 5, 20), 2)
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(7)
    expect(d.getDate()).toBe(1)
  })
})

describe('compareDays', () => {
  it('orders calendar days', () => {
    expect(compareDays(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(-1)
    expect(compareDays(new Date(2024, 0, 2), new Date(2024, 0, 2))).toBe(0)
  })
})

describe('sameDay', () => {
  it('ignores time', () => {
    expect(sameDay(new Date(2024, 3, 10, 0), new Date(2024, 3, 10, 23))).toBe(true)
    expect(sameDay(new Date(2024, 3, 10), new Date(2024, 3, 11))).toBe(false)
  })
})

describe('isDateDisabled', () => {
  const min = new Date(2024, 5, 10)
  const max = new Date(2024, 5, 20)

  it('respects min and max', () => {
    expect(isDateDisabled(new Date(2024, 5, 9), { min, max })).toBe(true)
    expect(isDateDisabled(new Date(2024, 5, 15), { min, max })).toBe(false)
    expect(isDateDisabled(new Date(2024, 5, 21), { min, max })).toBe(true)
  })

  it('matches explicit disabled dates', () => {
    expect(
      isDateDisabled(new Date(2024, 5, 12), { disabledDates: [new Date(2024, 5, 12)] }),
    ).toBe(true)
  })
})

describe('getCalendarMonthGrid', () => {
  it('returns forty-two days starting on the configured week start', () => {
    const june = new Date(2024, 5, 1)
    const grid = getCalendarMonthGrid(june, 0)
    expect(grid).toHaveLength(42)
    expect(grid[0].getDay()).toBe(0)
    expect(grid.some((d) => sameDay(d, new Date(2024, 5, 1)))).toBe(true)
  })
})

describe('getWeekdayLabels', () => {
  it('returns seven short labels', () => {
    expect(getWeekdayLabels('en-US')).toHaveLength(7)
  })
})

describe('formatMonthYear', () => {
  it('includes the month name', () => {
    expect(formatMonthYear(new Date(2024, 0, 1), 'en-US')).toMatch(/January/)
  })
})

describe('toISODateString', () => {
  it('zero-pads month and day', () => {
    expect(toISODateString(new Date(2024, 0, 5))).toBe('2024-01-05')
  })
})
