import type { ReactNode } from 'react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Link } from '../../components/Link'
import { DashboardLayout } from '../../structures/DashboardLayout'
import { ErrorPageLayout } from '../../structures/ErrorPageLayout'
import { LoginLayout } from '../../structures/LoginLayout'
import { OnboardingLayout } from '../../structures/OnboardingLayout'
import { SettingsLayout } from '../../structures/SettingsLayout'
import { SignupLayout } from '../../structures/SignupLayout'
import type { DashboardLayoutProps } from '../../structures/DashboardLayout'
import type { SettingsLayoutProps } from '../../structures/SettingsLayout'
import type { OnboardingLayoutProps } from '../../structures/OnboardingLayout'
import type { LoginLayoutProps } from '../../structures/LoginLayout'
import type { SignupLayoutProps } from '../../structures/SignupLayout'
import type { ErrorPageLayoutProps } from '../../structures/ErrorPageLayout'
import type { SiteNavLink } from '../../structures/types'
import type { WebsiteRoute } from '../types'
import {
  SaasLoginForm,
  SaasOnboardingProjectForm,
  SaasSettingsProfileForm,
  SaasSignupForm,
} from './SaasForms'

export { SaasLoginForm, SaasOnboardingProjectForm, SaasSettingsProfileForm, SaasSignupForm } from './SaasForms'

export const saasWebsitePaths = {
  dashboard: '/app',
  settings: '/app/settings',
  login: '/login',
  signup: '/signup',
  onboarding: '/onboarding',
  notFound: '/404',
} as const

export type SaasWebsitePageId = keyof typeof saasWebsitePaths

export const saasWebsiteRoutes: WebsiteRoute[] = [
  { id: 'dashboard', label: 'Dashboard', path: saasWebsitePaths.dashboard },
  { id: 'settings', label: 'Settings', path: saasWebsitePaths.settings },
  { id: 'login', label: 'Sign in', path: saasWebsitePaths.login },
  { id: 'signup', label: 'Sign up', path: saasWebsitePaths.signup },
  { id: 'onboarding', label: 'Onboarding', path: saasWebsitePaths.onboarding },
  { id: 'notFound', label: 'Not found', path: saasWebsitePaths.notFound },
]

const DEFAULT_SIDEBAR: SiteNavLink[] = [
  { href: saasWebsitePaths.dashboard, label: 'Overview', active: true },
  { href: saasWebsitePaths.dashboard, label: 'Reports' },
  { href: saasWebsitePaths.settings, label: 'Settings' },
]

const DEFAULT_SETTINGS: SiteNavLink[] = [
  { href: saasWebsitePaths.settings, label: 'Profile', active: true },
  { href: saasWebsitePaths.settings, label: 'Security' },
  { href: saasWebsitePaths.settings, label: 'Billing' },
]

export type SaasWebsiteDashboardProps = Omit<
  DashboardLayoutProps,
  'brand' | 'sidebarLinks' | 'children'
> & {
  brand: ReactNode
  sidebarLinks?: SiteNavLink[]
  children?: ReactNode
}

function SaasWebsiteDashboard({
  brand,
  sidebarLinks,
  pageTitle = 'Overview',
  children,
  ...rest
}: SaasWebsiteDashboardProps) {
  return (
    <DashboardLayout
      {...rest}
      brand={brand}
      sidebarTitle="Workspace"
      sidebarLinks={sidebarLinks ?? DEFAULT_SIDEBAR}
      pageTitle={pageTitle}
      pageDescription="Your team metrics at a glance."
      pageActions={<Button size="sm">Export</Button>}
    >
      {children ?? (
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))' }}>
          <Card variant="subtle" padding="md">
            <strong>MRR</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--hal-fg-muted)' }}>$24,480</p>
          </Card>
          <Card variant="subtle" padding="md">
            <strong>Active users</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--hal-fg-muted)' }}>1,204</p>
          </Card>
          <Card variant="subtle" padding="md">
            <strong>Churn</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--hal-fg-muted)' }}>2.1%</p>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}

export type SaasWebsiteSettingsProps = Omit<
  SettingsLayoutProps,
  'brand' | 'sectionLinks' | 'children'
> & {
  brand: ReactNode
  sectionLinks?: SiteNavLink[]
  children?: ReactNode
}

function SaasWebsiteSettings({
  brand,
  sectionLinks,
  pageTitle = 'Profile',
  children,
  ...rest
}: SaasWebsiteSettingsProps) {
  return (
    <SettingsLayout
      {...rest}
      brand={brand}
      sectionLinks={sectionLinks ?? DEFAULT_SETTINGS}
      pageTitle={pageTitle}
      pageDescription="Manage your account and preferences."
    >
      {children ?? <SaasSettingsProfileForm />}
    </SettingsLayout>
  )
}

export type SaasWebsiteOnboardingProps = Omit<
  OnboardingLayoutProps,
  'brand' | 'steps' | 'children' | 'footer'
> & {
  brand: ReactNode
  steps?: OnboardingLayoutProps['steps']
  children?: ReactNode
  footer?: ReactNode
}

function SaasWebsiteOnboarding({
  brand,
  steps,
  currentStepId = 'project',
  children,
  footer,
  ...rest
}: SaasWebsiteOnboardingProps) {
  return (
    <OnboardingLayout
      {...rest}
      brand={brand}
      currentStepId={currentStepId}
      steps={
        steps ?? [
          { id: 'team', label: 'Team' },
          { id: 'project', label: 'Project' },
          { id: 'done', label: 'Done' },
        ]
      }
      title="Set up your workspace"
      description="A few details and you are ready to invite teammates."
      footer={
        footer ?? (
          <>
            <Button variant="ghost" size="sm" type="button">Back</Button>
            <Button size="sm" type="submit">Continue</Button>
          </>
        )
      }
    >
      {children ?? <SaasOnboardingProjectForm />}
    </OnboardingLayout>
  )
}

export type SaasWebsiteLoginProps = Omit<LoginLayoutProps, 'brand' | 'footer' | 'children'> & {
  brand: ReactNode
  signupHref?: string
  children?: ReactNode
}

function SaasWebsiteLogin({
  brand,
  signupHref = saasWebsitePaths.signup,
  children,
  ...rest
}: SaasWebsiteLoginProps) {
  return (
    <LoginLayout
      {...rest}
      brand={brand}
      footer={
        <Link href={signupHref} variant="muted">
          Create a workspace
        </Link>
      }
    >
      {children ?? <SaasLoginForm />}
    </LoginLayout>
  )
}

export type SaasWebsiteSignupProps = Omit<SignupLayoutProps, 'brand' | 'footer' | 'children'> & {
  brand: ReactNode
  loginHref?: string
  children?: ReactNode
}

function SaasWebsiteSignup({
  brand,
  loginHref = saasWebsitePaths.login,
  children,
  ...rest
}: SaasWebsiteSignupProps) {
  return (
    <SignupLayout
      {...rest}
      brand={brand}
      footer={
        <Link href={loginHref} variant="muted">
          Sign in instead
        </Link>
      }
    >
      {children ?? <SaasSignupForm />}
    </SignupLayout>
  )
}

export type SaasWebsiteNotFoundProps = ErrorPageLayoutProps

function SaasWebsiteNotFound(props: SaasWebsiteNotFoundProps) {
  return (
    <ErrorPageLayout
      statusCode="404"
      title="Page not found"
      description="This page is not part of your workspace."
      {...props}
    />
  )
}

export interface SaasWebsiteComponent {
  Dashboard: typeof SaasWebsiteDashboard
  Settings: typeof SaasWebsiteSettings
  Onboarding: typeof SaasWebsiteOnboarding
  Login: typeof SaasWebsiteLogin
  Signup: typeof SaasWebsiteSignup
  NotFound: typeof SaasWebsiteNotFound
  paths: typeof saasWebsitePaths
  routes: typeof saasWebsiteRoutes
}

export const SaasWebsite = {
  Dashboard: SaasWebsiteDashboard,
  Settings: SaasWebsiteSettings,
  Onboarding: SaasWebsiteOnboarding,
  Login: SaasWebsiteLogin,
  Signup: SaasWebsiteSignup,
  NotFound: SaasWebsiteNotFound,
  paths: saasWebsitePaths,
  routes: saasWebsiteRoutes,
} as SaasWebsiteComponent
