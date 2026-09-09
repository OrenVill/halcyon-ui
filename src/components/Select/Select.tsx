import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type SelectSize = 'sm' | 'md' | 'lg'

// `size` is omitted from the native attributes on purpose: <select> already has
// a numeric `size` attribute controlling how many rows are visible, and this
// library's `size` is a token scale. The prop below shadows it and is never
// forwarded to the DOM.
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize
  /** Marks the field as failing validation. */
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', invalid = false, className, children, ...rest },
  ref,
) {
  return (
    <select
      {...rest}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx(
        'hal-select',
        `hal-select--${size}`,
        invalid && 'hal-select--invalid',
        className,
      )}
    >
      {children}
    </select>
  )
})
