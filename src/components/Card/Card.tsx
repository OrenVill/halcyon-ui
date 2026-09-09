import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type CardVariant = 'outline' | 'raised' | 'subtle'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual weight of the surface. Defaults to 'outline'. */
  variant?: CardVariant
  /** Inner spacing. Defaults to 'md'. */
  padding?: CardPadding
}

export const Card = /* @__PURE__ */ forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'outline', padding = 'md', className, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx('hal-card', `hal-card--${variant}`, `hal-card--${padding}`, className)}
    />
  )
})
