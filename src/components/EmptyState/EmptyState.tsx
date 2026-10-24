import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

// `title` on a div is the native tooltip attribute, a plain string. The
// library's title is a rendered heading node, so the native one is omitted
// from the extended type and redeclared here.
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Primary heading for the empty view. */
  title: ReactNode
  /** Supporting copy under the title. */
  description?: ReactNode
  /** Slot for actions such as links or buttons supplied by the consumer. */
  children?: ReactNode
}

export const EmptyState = /* @__PURE__ */ forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ title, description, className, children, ...rest }, ref) {
    return (
      <div {...rest} ref={ref} className={cx('hal-empty-state', className)}>
        <div className="hal-empty-state__title">{title}</div>
        {description === undefined || description === null ? null : (
          <div className="hal-empty-state__description">{description}</div>
        )}
        {children === undefined || children === null ? null : (
          <div className="hal-empty-state__actions">{children}</div>
        )}
      </div>
    )
  },
)
