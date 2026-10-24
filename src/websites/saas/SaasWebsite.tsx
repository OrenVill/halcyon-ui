import type { ReactNode } from 'react'
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

export type SaasWebsiteDashboardProps = Omit<DashboardLayoutProps, 'brand' | 'sidebarLinks'> & {
  brand: ReactNode
  sidebarLinks?: SiteNavLink[]
}

function SaasWebsiteDashboard({ brand, sidebarLinks, pageTitle = 'Overview', ...rest }: SaasWebsiteDashboardProps) {
  return (
    <DashboardLayout
      {...rest}
      brand={brand}
      sidebarTitle="Workspace"
      sidebarLinks={sidebarLinks ?? DEFAULT_SIDEBAR}
      pageTitle={pageTitle}
      pageDescription="Your team metrics at a glance."
    />
  )
}

export type SaasWebsiteSettingsProps = Omit<SettingsLayoutProps, 'brand' | 'sectionLinks'> & {
  brand: ReactNode
  sectionLinks?: SiteNavLink[]
}

function SaasWebsiteSettings({
  brand,
  sectionLinks,
  pageTitle = 'Profile',
  ...rest
}: SaasWebsiteSettingsProps) {
  return (
    <SettingsLayout
      {...rest}
      brand={brand}
      sectionLinks={sectionLinks ?? DEFAULT_SETTINGS}
      pageTitle={pageTitle}
      pageDescription="Manage your account and preferences."
    />
  )
}

export type SaasWebsiteOnboardingProps = Omit<OnboardingLayoutProps, 'brand' | 'steps'> & {
  brand: ReactNode
  steps?: OnboardingLayoutProps['steps']
}

function SaasWebsiteOnboarding({ brand, steps, currentStepId = 'project', ...rest }: SaasWebsiteOnboardingProps) {
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
    />
  )
}

export type SaasWebsiteLoginProps = Omit<LoginLayoutProps, 'brand' | 'footer'> & {
  brand: ReactNode
  signupHref?: string
}

function SaasWebsiteLogin({ brand, signupHref = saasWebsitePaths.signup, ...rest }: SaasWebsiteLoginProps) {
  return (
    <LoginLayout
      {...rest}
      brand={brand}
      footer={
        <Link href={signupHref} variant="muted">
          Create a workspace
        </Link>
      }
    />
  )
}

export type SaasWebsiteSignupProps = Omit<SignupLayoutProps, 'brand' | 'footer'> & {
  brand: ReactNode
  loginHref?: string
}

function SaasWebsiteSignup({ brand, loginHref = saasWebsitePaths.login, ...rest }: SaasWebsiteSignupProps) {
  return (
    <SignupLayout
      {...rest}
      brand={brand}
      footer={
        <Link href={loginHref} variant="muted">
          Sign in instead
        </Link>
      }
    />
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
