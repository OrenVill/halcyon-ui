import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps
  // `size` is omitted from the native attributes and redeclared: the DOM's
  // own `size` is a number (visible character width) and would collide with
  // the design-system scale below.
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize
  /** Marks the field as failing validation. */
  invalid?: boolean
}

export const Input = /* @__PURE__ */ forwardRef<HTMLInputElement, InputProps>(function Input(
  // `size` is destructured out and never forwarded: `size="md"` on a real
  // <input> is invalid HTML.
  { size = 'md', invalid = false, className, ...rest },
  ref,
) {
  return (
    <input
      {...rest}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx(
        'hal-input',
        `hal-input--${size}`,
        invalid && 'hal-input--invalid',
        className,
      )}
    />
  )
})
