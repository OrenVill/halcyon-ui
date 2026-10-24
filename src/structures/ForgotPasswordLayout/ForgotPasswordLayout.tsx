import { forwardRef } from 'react'
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { Link } from '../../components/Link'
import { cx } from '../../internal/cx'

export interface ForgotPasswordLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  brand: ReactNode
  title?: ReactNode
  description?: ReactNode
  backHref?: string
  backLabel?: ReactNode
  onBackClick?: AnchorHTMLAttributes<HTMLAnchorElement>['onClick']
  footer?: ReactNode
  children: ReactNode
}

export const ForgotPasswordLayout = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  ForgotPasswordLayoutProps
>(function ForgotPasswordLayout(
  {
    brand,
    title = 'Reset your password',
    description = 'We will email you a link to choose a new password.',
    backHref = '#',
    backLabel = 'Back to sign in',
    onBackClick,
    footer,
    children,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={cx('hal-auth-layout', 'hal-forgot-layout', className)}>
      <div className="hal-auth-layout__panel">
        <Link
          href={backHref}
          onClick={onBackClick}
          variant="muted"
          className="hal-auth-layout__back"
        >
          ← {backLabel}
        </Link>
        <div className="hal-auth-layout__brand">{brand}</div>
        <h1 className="hal-auth-layout__title">{title}</h1>
        {description ? <p className="hal-auth-layout__description">{description}</p> : null}
        <div className="hal-auth-layout__body">{children}</div>
        {footer ? <div className="hal-auth-layout__footer">{footer}</div> : null}
      </div>
    </div>
  )
})
