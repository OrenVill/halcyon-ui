import type { ReactNode } from 'react'
import { Card } from '../../components/Card'
import { Link } from '../../components/Link'
import { CheckoutLayout } from '../../structures/CheckoutLayout'
import { ErrorPageLayout } from '../../structures/ErrorPageLayout'
import { LoginLayout } from '../../structures/LoginLayout'
import { MarketingSiteLayout } from '../../structures/MarketingSiteLayout'
import type { CheckoutLayoutProps } from '../../structures/CheckoutLayout'
import type { LoginLayoutProps } from '../../structures/LoginLayout'
import type { MarketingSiteLayoutProps } from '../../structures/MarketingSiteLayout'
import type { ErrorPageLayoutProps } from '../../structures/ErrorPageLayout'
import type { SiteNavLink } from '../../structures/types'
import type { WebsiteRoute } from '../types'
import { CommerceCheckoutForm, CommerceOrderSummary } from './CommerceCheckoutForm'

export { CommerceCheckoutForm, CommerceOrderSummary } from './CommerceCheckoutForm'

export const commerceWebsitePaths = {
  store: '/',
  checkout: '/checkout',
  login: '/login',
  notFound: '/404',
} as const

export type CommerceWebsitePageId = keyof typeof commerceWebsitePaths

export const commerceWebsiteRoutes: WebsiteRoute[] = [
  { id: 'store', label: 'Store', path: commerceWebsitePaths.store },
  { id: 'checkout', label: 'Checkout', path: commerceWebsitePaths.checkout },
  { id: 'login', label: 'Sign in', path: commerceWebsitePaths.login },
  { id: 'notFound', label: 'Not found', path: commerceWebsitePaths.notFound },
]

export type CommerceWebsiteStoreProps = Omit<MarketingSiteLayoutProps, 'brand' | 'navLinks'> & {
  brand: ReactNode
  navLinks?: SiteNavLink[]
  catalog?: ReactNode
}

function CommerceWebsiteStore({ brand, catalog, hero, navLinks, actions, ...rest }: CommerceWebsiteStoreProps) {
  const links =
    navLinks ??
    [
      { href: commerceWebsitePaths.store, label: 'Shop', active: true },
      { href: commerceWebsitePaths.checkout, label: 'Cart' },
    ]

  const defaultCatalog = (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))',
      }}
    >
      {[
        { name: 'Desk lamp', price: '$32' },
        { name: 'Notebook set', price: '$16' },
        { name: 'Pen trio', price: '$12' },
      ].map((item) => (
        <Card key={item.name} padding="md">
          <strong>{item.name}</strong>
          <p style={{ margin: '0.25rem 0 0.75rem', color: 'var(--hal-fg-muted)' }}>{item.price}</p>
          <Link href={commerceWebsitePaths.checkout} className="hal-button hal-button--soft hal-button--sm">
            Add to cart
          </Link>
        </Card>
      ))}
    </div>
  )

  return (
    <MarketingSiteLayout
      {...rest}
      brand={brand}
      navLinks={links}
      actions={
        actions ?? (
          <Link href={commerceWebsitePaths.checkout} className="hal-button hal-button--solid hal-button--sm">
            Checkout
          </Link>
        )
      }
      hero={
        hero ?? {
          title: 'Everything for your desk',
          description: 'Curated tools with fast checkout.',
          actions: (
            <Link href={commerceWebsitePaths.checkout} className="hal-button hal-button--solid hal-button--md">
              Shop now
            </Link>
          ),
        }
      }
    >
      <MarketingSiteLayout.Section title="Featured" description="Ships in 2–3 days." variant="muted">
        {catalog ?? defaultCatalog}
      </MarketingSiteLayout.Section>
    </MarketingSiteLayout>
  )
}

export type CommerceWebsiteCheckoutProps = Omit<
  CheckoutLayoutProps,
  'brand' | 'orderSummary' | 'children'
> & {
  brand: ReactNode
  orderSummary?: ReactNode
  children?: ReactNode
}

function CommerceWebsiteCheckout({
  brand,
  orderSummary,
  children,
  stepLabel = 'Step 2 of 3',
  secureNote = '256-bit TLS · PCI-ready form layout',
  ...rest
}: CommerceWebsiteCheckoutProps) {
  return (
    <CheckoutLayout
      {...rest}
      brand={brand}
      stepLabel={stepLabel}
      secureNote={secureNote}
      orderSummary={orderSummary ?? <CommerceOrderSummary />}
    >
      {children ?? <CommerceCheckoutForm />}
    </CheckoutLayout>
  )
}

export type CommerceWebsiteLoginProps = Omit<LoginLayoutProps, 'brand' | 'footer'> & {
  brand: ReactNode
  storeHref?: string
}

function CommerceWebsiteLogin({
  brand,
  storeHref = commerceWebsitePaths.store,
  ...rest
}: CommerceWebsiteLoginProps) {
  return (
    <LoginLayout
      {...rest}
      brand={brand}
      title="Sign in to checkout"
      footer={
        <Link href={storeHref} variant="muted">
          Continue shopping
        </Link>
      }
    />
  )
}

export type CommerceWebsiteNotFoundProps = ErrorPageLayoutProps

function CommerceWebsiteNotFound(props: CommerceWebsiteNotFoundProps) {
  return (
    <ErrorPageLayout
      statusCode="404"
      title="Product not found"
      description="That item may have been removed from the catalog."
      {...props}
    />
  )
}

export interface CommerceWebsiteComponent {
  Store: typeof CommerceWebsiteStore
  Checkout: typeof CommerceWebsiteCheckout
  Login: typeof CommerceWebsiteLogin
  NotFound: typeof CommerceWebsiteNotFound
  paths: typeof commerceWebsitePaths
  routes: typeof commerceWebsiteRoutes
}

export const CommerceWebsite = {
  Store: CommerceWebsiteStore,
  Checkout: CommerceWebsiteCheckout,
  Login: CommerceWebsiteLogin,
  NotFound: CommerceWebsiteNotFound,
  paths: commerceWebsitePaths,
  routes: commerceWebsiteRoutes,
} as CommerceWebsiteComponent
