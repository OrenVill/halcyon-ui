import type { ReactNode } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { Link } from '../../components/Link'
import { ErrorPageLayout } from '../../structures/ErrorPageLayout'
import { ForgotPasswordLayout } from '../../structures/ForgotPasswordLayout'
import { LoginLayout } from '../../structures/LoginLayout'
import { MarketingSiteLayout } from '../../structures/MarketingSiteLayout'
import { SignupLayout } from '../../structures/SignupLayout'
import type { MarketingSiteLayoutProps } from '../../structures/MarketingSiteLayout'
import type { SiteNavLink } from '../../structures/types'
import type { LoginLayoutProps } from '../../structures/LoginLayout'
import type { SignupLayoutProps } from '../../structures/SignupLayout'
import type { ForgotPasswordLayoutProps } from '../../structures/ForgotPasswordLayout'
import type { ErrorPageLayoutProps } from '../../structures/ErrorPageLayout'
import type { WebsiteRoute } from '../types'
import {
  MarketingForgotPasswordForm,
  MarketingLoginForm,
  MarketingSignupForm,
} from './MarketingAuthForms'

export { MarketingForgotPasswordForm, MarketingLoginForm, MarketingSignupForm } from './MarketingAuthForms'

export const marketingWebsitePaths = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  notFound: '/404',
} as const

export type MarketingWebsitePageId = keyof typeof marketingWebsitePaths

export const marketingWebsiteRoutes: WebsiteRoute[] = [
  { id: 'home', label: 'Home', path: marketingWebsitePaths.home },
  { id: 'login', label: 'Sign in', path: marketingWebsitePaths.login },
  { id: 'signup', label: 'Sign up', path: marketingWebsitePaths.signup },
  { id: 'forgotPassword', label: 'Forgot password', path: marketingWebsitePaths.forgotPassword },
  { id: 'notFound', label: 'Not found', path: marketingWebsitePaths.notFound },
]

const DEFAULT_FEATURES = (
  <div className="hal-marketing-features">
    <article className="hal-marketing-feature">
      <h3 className="hal-marketing-feature__title">Theme tokens</h3>
      <p className="hal-marketing-feature__text">
        Eight curated palettes with light and dark modes, applied with CSS variables only.
      </p>
    </article>
    <article className="hal-marketing-feature">
      <h3 className="hal-marketing-feature__title">Category slices</h3>
      <p className="hal-marketing-feature__text">
        Import atoms, structures like navbars, or full website kits from one package.
      </p>
    </article>
    <article className="hal-marketing-feature">
      <h3 className="hal-marketing-feature__title">Accessible by default</h3>
      <p className="hal-marketing-feature__text">
        Focus rings, landmarks, and contrast targets built into every primitive.
      </p>
    </article>
    <article className="hal-marketing-feature">
      <h3 className="hal-marketing-feature__title">Tiny runtime</h3>
      <p className="hal-marketing-feature__text">
        No CSS-in-JS engine. Styles ship as static classes you can tree-shake.
      </p>
    </article>
  </div>
)

const DEFAULT_HERO_ASIDE = (
  <div className="hal-marketing-hero-panel" aria-hidden="true">
    <p className="hal-marketing-hero-panel__label">Live preview</p>
    <p className="hal-marketing-hero-panel__metric">98.4% contrast pass</p>
    <Card padding="md" variant="subtle">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span style={{ fontWeight: 'var(--hal-weight-medium)' }}>Deploy</span>
        <Badge variant="success">Ready</Badge>
      </div>
      <p style={{ margin: '0.5rem 0 0', color: 'var(--hal-fg-muted)', fontSize: 'var(--hal-text-sm)' }}>
        Marketing, auth, and checkout layouts wired to your routes.
      </p>
    </Card>
    <Card padding="md">
      <div style={{ display: 'grid', gap: '0.35rem', fontSize: 'var(--hal-text-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--hal-fg-muted)' }}>Components</span>
          <strong>24</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--hal-fg-muted)' }}>Themes</span>
          <strong>8</strong>
        </div>
      </div>
    </Card>
  </div>
)

export type MarketingWebsiteHomeProps = Omit<MarketingSiteLayoutProps, 'brand' | 'navLinks'> & {
  brand: ReactNode
  navLinks?: SiteNavLink[]
  /** Main section below the hero (features, pricing cards, etc.). */
  featureSection?: ReactNode
}

function MarketingWebsiteHome({
  brand,
  featureSection,
  navLinks,
  hero,
  children,
  actions,
  footerColumns,
  ...rest
}: MarketingWebsiteHomeProps) {
  const links =
    navLinks ??
    [
      { href: marketingWebsitePaths.home, label: 'Product', active: true },
      { href: marketingWebsitePaths.home, label: 'Pricing' },
      { href: '/docs', label: 'Docs' },
    ]

  const defaultFooter = [
    {
      title: 'Product',
      links: [
        { href: marketingWebsitePaths.home, label: 'Overview' },
        { href: marketingWebsitePaths.signup, label: 'Sign up' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '/blog', label: 'Blog' },
        { href: marketingWebsitePaths.login, label: 'Sign in' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: '/docs', label: 'Documentation' },
        { href: '/gallery', label: 'Gallery' },
      ],
    },
  ]

  return (
    <MarketingSiteLayout
      {...rest}
      brand={brand}
      navLinks={links}
      footerColumns={footerColumns ?? defaultFooter}
      copyright="© Halcyon UI"
      actions={
        actions ?? (
          <Link href={marketingWebsitePaths.signup} className="hal-button hal-button--solid hal-button--sm">
            Start free
          </Link>
        )
      }
      hero={
        hero ?? {
          badge: 'Halcyon v1 — design system release',
          variant: 'split',
          title: 'Ship polished product UI in days, not months',
          description:
            'Composable React primitives, ready-made layouts, and full website kits. Drop in your content and keep your bundle small.',
          actions: (
            <>
              <Link href={marketingWebsitePaths.signup} className="hal-button hal-button--solid hal-button--md">
                Get started free
              </Link>
              <Link href="/gallery" className="hal-button hal-button--outline hal-button--md">
                Browse gallery
              </Link>
            </>
          ),
          aside: DEFAULT_HERO_ASIDE,
        }
      }
    >
      <MarketingSiteLayout.Section title="Trusted by teams who care about craft" variant="muted">
        <div className="hal-marketing-trust" role="list">
          {['Fintech', 'Health', 'DevTools', 'E-commerce', 'Education'].map((name) => (
            <span key={name} className="hal-marketing-trust__item" role="listitem">
              {name}
            </span>
          ))}
        </div>
      </MarketingSiteLayout.Section>

      <MarketingSiteLayout.Section
        title="Everything you need to launch"
        description="From buttons to full marketing and SaaS shells — one import path, consistent tokens."
      >
        {featureSection ?? DEFAULT_FEATURES}
      </MarketingSiteLayout.Section>

      <MarketingSiteLayout.Section title="Simple pricing" description="Start free. Scale when your team grows." variant="muted">
        <div className="hal-marketing-features" style={{ maxWidth: '48rem', marginInline: 'auto' }}>
          <Card padding="lg" className="hal-marketing-feature">
            <h3 className="hal-marketing-feature__title">Starter</h3>
            <p className="hal-marketing-feature__text" style={{ fontSize: 'var(--hal-text-2xl)', fontWeight: 'var(--hal-weight-bold)', color: 'var(--hal-fg)' }}>
              $0
            </p>
            <p className="hal-marketing-feature__text">Open source components and gallery.</p>
            <Link href={marketingWebsitePaths.signup} className="hal-button hal-button--outline hal-button--sm" style={{ marginTop: 'var(--hal-space-3)' }}>
              Create account
            </Link>
          </Card>
          <Card padding="lg" className="hal-marketing-feature" style={{ borderColor: 'var(--hal-accent)' }}>
            <h3 className="hal-marketing-feature__title">Pro</h3>
            <p className="hal-marketing-feature__text" style={{ fontSize: 'var(--hal-text-2xl)', fontWeight: 'var(--hal-weight-bold)', color: 'var(--hal-fg)' }}>
              $29
            </p>
            <p className="hal-marketing-feature__text">Website kits, priority patterns, team themes.</p>
            <Link href={marketingWebsitePaths.signup} className="hal-button hal-button--solid hal-button--sm" style={{ marginTop: 'var(--hal-space-3)' }}>
              Start trial
            </Link>
          </Card>
        </div>
      </MarketingSiteLayout.Section>

      {children}

      <MarketingSiteLayout.Cta
        title="Ready to build something beautiful?"
        description="Spin up login, marketing, and checkout flows with layouts that already match your theme."
        actions={
          <>
            <Link href={marketingWebsitePaths.signup} className="hal-button hal-button--solid hal-button--md">
              Create account
            </Link>
            <Link href={marketingWebsitePaths.login} className="hal-button hal-button--outline hal-button--md">
              Sign in
            </Link>
          </>
        }
      />
    </MarketingSiteLayout>
  )
}

export type MarketingWebsiteLoginProps = Omit<LoginLayoutProps, 'brand' | 'footer' | 'children'> & {
  brand: ReactNode
  signupHref?: string
  children?: ReactNode
}

function MarketingWebsiteLogin({
  brand,
  signupHref = marketingWebsitePaths.signup,
  children,
  ...rest
}: MarketingWebsiteLoginProps) {
  return (
    <LoginLayout
      {...rest}
      brand={brand}
      footer={
        <Link href={signupHref} variant="muted">
          Need an account? Sign up
        </Link>
      }
    >
      {children ?? <MarketingLoginForm />}
    </LoginLayout>
  )
}

export type MarketingWebsiteSignupProps = Omit<SignupLayoutProps, 'brand' | 'footer' | 'children'> & {
  brand: ReactNode
  loginHref?: string
  children?: ReactNode
}

function MarketingWebsiteSignup({
  brand,
  loginHref = marketingWebsitePaths.login,
  children,
  ...rest
}: MarketingWebsiteSignupProps) {
  return (
    <SignupLayout
      {...rest}
      brand={brand}
      footer={
        <Link href={loginHref} variant="muted">
          Already have an account? Sign in
        </Link>
      }
    >
      {children ?? <MarketingSignupForm />}
    </SignupLayout>
  )
}

export type MarketingWebsiteForgotPasswordProps = Omit<
  ForgotPasswordLayoutProps,
  'brand' | 'backHref' | 'children'
> & {
  brand: ReactNode
  loginHref?: string
  children?: ReactNode
}

function MarketingWebsiteForgotPassword({
  brand,
  loginHref = marketingWebsitePaths.login,
  children,
  ...rest
}: MarketingWebsiteForgotPasswordProps) {
  return (
    <ForgotPasswordLayout {...rest} brand={brand} backHref={loginHref}>
      {children ?? <MarketingForgotPasswordForm />}
    </ForgotPasswordLayout>
  )
}

export type MarketingWebsiteNotFoundProps = ErrorPageLayoutProps

function MarketingWebsiteNotFound(props: MarketingWebsiteNotFoundProps) {
  return (
    <ErrorPageLayout
      statusCode="404"
      title="Page not found"
      description="This page does not exist on the marketing site."
      {...props}
    />
  )
}

export interface MarketingWebsiteComponent {
  Home: typeof MarketingWebsiteHome
  Login: typeof MarketingWebsiteLogin
  Signup: typeof MarketingWebsiteSignup
  ForgotPassword: typeof MarketingWebsiteForgotPassword
  NotFound: typeof MarketingWebsiteNotFound
  paths: typeof marketingWebsitePaths
  routes: typeof marketingWebsiteRoutes
}

export const MarketingWebsite = {
  Home: MarketingWebsiteHome,
  Login: MarketingWebsiteLogin,
  Signup: MarketingWebsiteSignup,
  ForgotPassword: MarketingWebsiteForgotPassword,
  NotFound: MarketingWebsiteNotFound,
  paths: marketingWebsitePaths,
  routes: marketingWebsiteRoutes,
} as MarketingWebsiteComponent
