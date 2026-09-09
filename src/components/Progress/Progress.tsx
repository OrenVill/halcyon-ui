import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type ProgressSize = 'sm' | 'md' | 'lg'
export type ProgressVariant = 'accent' | 'success' | 'danger'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Completed amount. Omit it for an indeterminate bar: work is happening but
   * its extent is unknown.
   */
  value?: number
  /** Upper bound of `value`. Defaults to 100. */
  max?: number
  size?: ProgressSize
  /** Semantic colour of the fill. Defaults to 'accent'. */
  variant?: ProgressVariant
}

/** Trims float noise so a width reads `33.3333%`, never `33.33333333333336%`. */
function percent(ratio: number): string {
  return `${Number((ratio * 100).toFixed(4))}%`
}

export const Progress = /* @__PURE__ */ forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, size = 'md', variant = 'accent', className, ...rest },
  ref,
) {
  const indeterminate = value === undefined
  // A non-positive max would divide by zero or invert the bar; fall back to
  // the default rather than render something nonsensical.
  const safeMax = max > 0 ? max : 100
  // Clamp before measuring: a value outside the range must not paint a fill
  // outside the track, and must not report an out-of-range aria-valuenow.
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), safeMax)

  return (
    <div
      {...rest}
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      // The ARIA spec expresses "indeterminate" as the *absence* of
      // aria-valuenow, so undefined here is the meaningful value.
      aria-valuenow={indeterminate ? undefined : clamped}
      className={cx(
        'hal-progress',
        `hal-progress--${variant}`,
        `hal-progress--${size}`,
        indeterminate && 'hal-progress--indeterminate',
        className,
      )}
    >
      <div
        className="hal-progress__fill"
        style={indeterminate ? undefined : { width: percent(clamped / safeMax) }}
      />
    </div>
  )
})
