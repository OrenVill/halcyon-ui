import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type SeparatorOrientation = 'horizontal' | 'vertical'

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout axis. Defaults to 'horizontal'. */
  orientation?: SeparatorOrientation
  /** When true, the line is visual only and is hidden from assistive tech. */
  decorative?: boolean
}

export const Separator = /* @__PURE__ */ forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    { orientation = 'horizontal', decorative = false, className, ...rest },
    ref,
  ) {
    return (
      <div
        {...rest}
        ref={ref}
        role={decorative ? undefined : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        aria-hidden={decorative ? true : undefined}
        className={cx('hal-separator', `hal-separator--${orientation}`, className)}
      />
    )
  },
)
