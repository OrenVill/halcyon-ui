import type { ReactNode } from 'react'
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
  ...rest
}: MarketingWebsiteHomeProps) {
  const links =
    navLinks ??
    [
      { href: marketingWebsitePaths.home, label: 'Product', active: true },
      { href: marketingWebsitePaths.home, label: 'Pricing' },
      { href: marketingWebsitePaths.home, label: 'Blog' },
    ]

  const features =
    featureSection ??
    (
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
        }}
      >
        <Card padding="md">8 themes</Card>
        <Card padding="md">Tree-shakeable</Card>
        <Card padding="md">WCAG AA</Card>
      </div>
    )

  return (
    <MarketingSiteLayout
      {...rest}
      brand={brand}
      navLinks={links}
      actions={
        actions ?? (
          <Link href={marketingWebsitePaths.login} className="hal-button hal-button--solid hal-button--sm">
            Start free
          </Link>
        )
      }
      hero={
        hero ?? {
          title: 'Ship accessible UI faster',
          description: 'Themeable React components with no runtime CSS engine.',
          actions: (
            <>
              <Link href={marketingWebsitePaths.signup} className="hal-button hal-button--solid hal-button--md">
                Get started
              </Link>
              <Link
                href={marketingWebsitePaths.login}
                className="hal-button hal-button--outline hal-button--md"
              >
                Sign in
              </Link>
            </>
          ),
        }
      }
    >
      <MarketingSiteLayout.Section
        title="Built for product teams"
        description="Atoms, slices, and full site layouts in one package."
        variant="muted"
      >
        {features}
      </MarketingSiteLayout.Section>
      {children}
      <MarketingSiteLayout.Cta
        title="Ready to try it?"
        description="Create an account or sign in to your workspace."
        actions={
          <>
            <Link href={marketingWebsitePaths.signup} className="hal-button hal-button--solid hal-button--md">
              Create account
            </Link>
            <Link
              href={marketingWebsitePaths.login}
              className="hal-button hal-button--outline hal-button--md"
            >
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
