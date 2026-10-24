import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type InlineMessageVariant = 'info' | 'success' | 'warning' | 'danger'

export interface InlineMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Tone of the message. Defaults to 'info'. */
  variant?: InlineMessageVariant
}

export const InlineMessage = /* @__PURE__ */ forwardRef<HTMLParagraphElement, InlineMessageProps>(
  function InlineMessage({ variant = 'info', className, role, ...rest }, ref) {
    return (
      <p
        {...rest}
        ref={ref}
        // Inline hints sit under a field; only danger interrupts mid-entry.
        role={role ?? (variant === 'danger' ? 'alert' : undefined)}
        className={cx('hal-inline-message', `hal-inline-message--${variant}`, className)}
      />
    )
  },
)
