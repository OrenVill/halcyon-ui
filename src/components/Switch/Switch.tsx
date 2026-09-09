import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type SwitchSize = 'sm' | 'md' | 'lg'

// `size` is dropped from the native attributes: on an input it means a
// character width, and the library uses the name for a visual scale.
export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: SwitchSize
}

export const Switch = /* @__PURE__ */ forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { size = 'md', className, role = 'switch', ...rest },
  ref,
) {
  return (
    <input
      {...rest}
      ref={ref}
      // A checkbox underneath, so Space toggles it and it posts with a form;
      // the role is what makes it announce as a switch. Destructured with a
      // default so a caller can still override it.
      type="checkbox"
      role={role}
      className={cx('hal-switch', `hal-switch--${size}`, className)}
    />
  )
})
