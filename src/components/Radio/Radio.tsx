import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type RadioSize = 'sm' | 'md' | 'lg'

// `size` is dropped from the native attributes: on an input it means a
// character width, and the library uses the name for a visual scale.
export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: RadioSize
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <input
      {...rest}
      ref={ref}
      // Grouping stays the consumer's job: radios that share a `name` are
      // mutually exclusive already, so there is no group component to invent.
      type="radio"
      className={cx('hal-radio', `hal-radio--${size}`, className)}
    />
  )
})
