import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic tone. Defaults to 'neutral'. */
  variant?: BadgeVariant
  size?: BadgeSize
}

export const Badge = /* @__PURE__ */ forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'neutral', size = 'md', className, ...rest },
  ref,
) {
  return (
    // A badge is a label, not a control: no role, no tabIndex, no click
    // affordance. Anything interactive belongs in a button next to it.
    <span
      {...rest}
      ref={ref}
      className={cx('hal-badge', `hal-badge--${variant}`, `hal-badge--${size}`, className)}
    />
  )
})
