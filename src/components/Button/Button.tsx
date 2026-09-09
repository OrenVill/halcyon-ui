import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. Defaults to 'solid'. */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretches the button to fill its container. */
  fullWidth?: boolean
}

export const Button = /* @__PURE__ */ forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', size = 'md', fullWidth = false, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      // Defaulted rather than inherited: a button inside a form that submits
      // when the author did not ask it to is a bug that ships constantly.
      type={type}
      className={cx(
        'hal-button',
        `hal-button--${variant}`,
        `hal-button--${size}`,
        fullWidth && 'hal-button--full',
        className,
      )}
    />
  )
})
