import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { Navbar } from '../Navbar'
import { cx } from '../../internal/cx'

export interface CheckoutLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  brand: ReactNode
  stepLabel?: ReactNode
  title?: ReactNode
  description?: ReactNode
  orderSummary: ReactNode
  secureNote?: ReactNode
  children: ReactNode
}

export const CheckoutLayout = /* @__PURE__ */ forwardRef<HTMLDivElement, CheckoutLayoutProps>(
  function CheckoutLayout(
    {
      brand,
      stepLabel = 'Checkout',
      title = 'Payment details',
      description = 'All transactions are encrypted.',
      orderSummary,
      secureNote,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div {...rest} ref={ref} className={cx('hal-checkout-layout', className)}>
        <div className="hal-checkout-layout__header">
          <Navbar>
            <Navbar.Brand>{brand}</Navbar.Brand>
            {stepLabel ? <span className="hal-checkout-layout__step">{stepLabel}</span> : null}
          </Navbar>
        </div>
        <div className="hal-checkout-layout__body">
          <main className="hal-checkout-layout__main">
            {title ? <h1 className="hal-checkout-layout__title">{title}</h1> : null}
            {description ? <p className="hal-checkout-layout__description">{description}</p> : null}
            <div className="hal-checkout-layout__form">{children}</div>
            {secureNote ? <p className="hal-checkout-layout__secure">{secureNote}</p> : null}
          </main>
          <aside className="hal-checkout-layout__summary" aria-label="Order summary">
            <h2 className="hal-checkout-layout__summary-title">Order summary</h2>
            {orderSummary}
          </aside>
        </div>
      </div>
    )
  },
)
