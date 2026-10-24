import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type KbdProps = HTMLAttributes<HTMLElement>

export const Kbd = /* @__PURE__ */ forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className, ...rest },
  ref,
) {
  return <kbd {...rest} ref={ref} className={cx('hal-kbd', className)} />
})
