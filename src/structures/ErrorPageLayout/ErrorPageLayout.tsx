import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

export interface ErrorPageLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  statusCode?: ReactNode
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}

export const ErrorPageLayout = /* @__PURE__ */ forwardRef<HTMLDivElement, ErrorPageLayoutProps>(
  function ErrorPageLayout(
    {
      statusCode = '404',
      title = 'Page not found',
      description = 'The page you are looking for does not exist or was moved.',
      actions,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div {...rest} ref={ref} className={cx('hal-error-layout', className)} role="alert">
        <div className="hal-error-layout__inner">
          {statusCode ? <p className="hal-error-layout__code">{statusCode}</p> : null}
          <h1 className="hal-error-layout__title">{title}</h1>
          {description ? <p className="hal-error-layout__description">{description}</p> : null}
          {actions ? <div className="hal-error-layout__actions">{actions}</div> : null}
          {children ? <div className="hal-error-layout__body">{children}</div> : null}
        </div>
      </div>
    )
  },
)
