import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

// `title` on a div is the native tooltip attribute, a plain string. The
// library's title is a rendered heading node, so the native one is omitted
// from the extended type and redeclared here.
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Tone of the message. Defaults to 'info'. */
  variant?: AlertVariant
  /** Optional heading rendered above the children. */
  title?: ReactNode
  /** When given, a dismiss button is rendered and this is called on click. */
  onDismiss?: () => void
  /** Accessible name of the dismiss button. Defaults to 'Dismiss'. */
  dismissLabel?: string
}

export const Alert = /* @__PURE__ */ forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    variant = 'info',
    title,
    onDismiss,
    dismissLabel = 'Dismiss',
    className,
    children,
    role,
    ...rest
  },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      // role="alert" interrupts a screen reader mid-sentence, which is right
      // for a failure and wrong for anything else. Only `danger` earns it;
      // everything else announces politely. A caller can still override.
      role={role ?? (variant === 'danger' ? 'alert' : 'status')}
      className={cx(
        'hal-alert',
        `hal-alert--${variant}`,
        onDismiss && 'hal-alert--dismissible',
        className,
      )}
    >
      <div className="hal-alert__content">
        {title === undefined || title === null ? null : (
          <div className="hal-alert__title">{title}</div>
        )}
        {children === undefined || children === null ? null : (
          <div className="hal-alert__body">{children}</div>
        )}
      </div>

      {onDismiss ? (
        // A real button, not a clickable span: keyboard focus, Enter and Space
        // all come from the platform.
        <button
          type="button"
          className="hal-alert__dismiss"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <span className="hal-alert__dismiss-glyph" aria-hidden="true">
            &times;
          </span>
        </button>
      ) : null}
    </div>
  )
})
