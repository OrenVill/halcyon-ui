import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type MeterSize = 'sm' | 'md' | 'lg'
export type MeterVariant = 'accent' | 'success' | 'warning' | 'danger'

export interface MeterProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  min?: number
  max?: number
  size?: MeterSize
  variant?: MeterVariant
}

/** Trims float noise so a width reads `33.3333%`, never `33.33333333333336%`. */
function percent(ratio: number): string {
  return `${Number((ratio * 100).toFixed(4))}%`
}

export const Meter = /* @__PURE__ */ forwardRef<HTMLDivElement, MeterProps>(function Meter(
  { value, min = 0, max = 100, size = 'md', variant = 'accent', className, ...rest },
  ref,
) {
  const safeMax = max > min ? max : min + 100
  const range = safeMax - min
  const clamped = Math.min(Math.max(value, min), safeMax)
  const ratio = range > 0 ? (clamped - min) / range : 0

  return (
    <div
      {...rest}
      ref={ref}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      className={cx('hal-meter', `hal-meter--${variant}`, `hal-meter--${size}`, className)}
    >
      <div className="hal-meter__fill" style={{ width: percent(ratio) }} />
    </div>
  )
})
