import { forwardRef, useEffect } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type IconButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'danger'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. Defaults to 'solid'. */
  variant?: IconButtonVariant
  size?: IconButtonSize
}

export const IconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { variant = 'solid', size = 'md', className, type = 'button', ...rest },
    ref,
  ) {
    // An icon carries no text, so without one of these the button is an
    // unnamed control: announced as "button" and nothing else.
    const hasAccessibleName =
      rest['aria-label'] != null || rest['aria-labelledby'] != null

    useEffect(() => {
      if (process.env.NODE_ENV !== 'production' && !hasAccessibleName) {
        console.warn(
          'IconButton: an icon-only button needs an accessible name. Pass `aria-label` or `aria-labelledby`.',
        )
      }
    }, [hasAccessibleName])

    return (
      <button
        {...rest}
        ref={ref}
        // Defaulted rather than inherited, exactly as Button does: a button
        // inside a form that submits when the author did not ask it to is a
        // bug that ships constantly.
        type={type}
        className={cx(
          'hal-icon-button',
          `hal-icon-button--${variant}`,
          `hal-icon-button--${size}`,
          className,
        )}
      />
    )
  },
)
