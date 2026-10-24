import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

export interface SignupLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  brand: ReactNode
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export const SignupLayout = /* @__PURE__ */ forwardRef<HTMLDivElement, SignupLayoutProps>(
  function SignupLayout(
    {
      brand,
      title = 'Create your account',
      description = 'Start with email. You can invite teammates later.',
      footer,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div {...rest} ref={ref} className={cx('hal-auth-layout', 'hal-signup-layout', className)}>
        <div className="hal-auth-layout__panel hal-signup-layout__panel">
          <div className="hal-auth-layout__brand">{brand}</div>
          <h1 className="hal-auth-layout__title">{title}</h1>
          {description ? <p className="hal-auth-layout__description">{description}</p> : null}
          <div className="hal-auth-layout__body">{children}</div>
          {footer ? <div className="hal-auth-layout__footer">{footer}</div> : null}
        </div>
      </div>
    )
  },
)
