import type { ReactNode } from 'react'
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

function CommerceWebsiteStore({ brand, catalog, hero, navLinks, ...rest }: CommerceWebsiteStoreProps) {
  const links =
    navLinks ??
    [
      { href: commerceWebsitePaths.store, label: 'Shop', active: true },
      { href: commerceWebsitePaths.checkout, label: 'Cart' },
    ]

  return (
    <MarketingSiteLayout
      {...rest}
      brand={brand}
      navLinks={links}
      hero={
        hero ?? {
          title: 'Everything for your desk',
          description: 'Curated tools with fast checkout.',
        }
      }
    >
      {catalog ? (
        <MarketingSiteLayout.Section title="Featured" variant="muted">
          {catalog}
        </MarketingSiteLayout.Section>
      ) : null}
    </MarketingSiteLayout>
  )
}

export type CommerceWebsiteCheckoutProps = Omit<CheckoutLayoutProps, 'brand' | 'orderSummary'> & {
  brand: ReactNode
  orderSummary?: ReactNode
}

function CommerceWebsiteCheckout({
  brand,
  orderSummary,
  stepLabel = 'Step 2 of 3',
  ...rest
}: CommerceWebsiteCheckoutProps) {
  return (
    <CheckoutLayout
      {...rest}
      brand={brand}
      stepLabel={stepLabel}
      orderSummary={
        orderSummary ?? (
          <div>
            <p style={{ margin: 0 }}>Subtotal · $48.00</p>
            <strong style={{ display: 'block', marginTop: '0.5rem' }}>Total · $48.00</strong>
          </div>
        )
      }
    />
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
