import { useEffect, type MouseEvent, type ReactNode } from 'react'
import { Button, Card, Field, Input, Link } from '../src/index'
import { CommerceWebsite, DocsWebsite, MarketingWebsite, SaasWebsite } from '../src/websites'

const KIT_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/app',
  '/app/settings',
  '/onboarding',
  '/docs',
  '/blog',
  '/checkout',
  '/404',
])

export function isWebsitePlaygroundPath(pathname: string): boolean {
  const path = normalizePath(pathname)
  return KIT_PATHS.has(path)
}

export function normalizePath(pathname: string): string {
  if (pathname === '/gallery.html') return '/gallery'
  return pathname.replace(/\/$/, '') || '/'
}

type Navigate = (path: string) => void

function AuthFields() {
  return (
    <>
      <Field>
        <Field.Label>Email</Field.Label>
        <Input type="email" aria-label="Email" placeholder="you@example.com" />
      </Field>
      <Field>
        <Field.Label>Password</Field.Label>
        <Input type="password" aria-label="Password" />
      </Field>
    </>
  )
}

function renderPage(path: string): ReactNode {
  switch (path) {
    case '/':
      return (
        <MarketingWebsite.Home brand="Halcyon">
          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Card padding="md">8 themes</Card>
            <Card padding="md">Tree-shakeable</Card>
            <Card padding="md">WCAG AA</Card>
          </div>
        </MarketingWebsite.Home>
      )
    case '/login':
      return (
        <MarketingWebsite.Login brand="Halcyon">
          <AuthFields />
          <Button style={{ width: '100%' }}>Sign in</Button>
        </MarketingWebsite.Login>
      )
    case '/signup':
      return (
        <MarketingWebsite.Signup brand="Halcyon">
          <AuthFields />
          <Button style={{ width: '100%' }}>Create account</Button>
        </MarketingWebsite.Signup>
      )
    case '/forgot-password':
      return (
        <MarketingWebsite.ForgotPassword brand="Halcyon">
          <Field>
            <Field.Label>Email</Field.Label>
            <Input type="email" aria-label="Email" />
          </Field>
          <Button style={{ width: '100%' }}>Send reset link</Button>
        </MarketingWebsite.ForgotPassword>
      )
    case '/app':
      return (
        <SaasWebsite.Dashboard brand="Acme">
          <Card variant="subtle" padding="md">MRR · $24k</Card>
        </SaasWebsite.Dashboard>
      )
    case '/app/settings':
      return (
        <SaasWebsite.Settings brand="Acme">
          <Field>
            <Field.Label>Display name</Field.Label>
            <Input aria-label="Display name" defaultValue="Ada Lovelace" />
          </Field>
          <Button size="sm">Save</Button>
        </SaasWebsite.Settings>
      )
    case '/onboarding':
      return (
        <SaasWebsite.Onboarding
          brand="Acme"
          currentStepId="project"
          footer={
            <>
              <Button variant="ghost" size="sm">Back</Button>
              <Button size="sm">Continue</Button>
            </>
          }
        >
          <Input aria-label="Project name" placeholder="halcyon-ui" />
        </SaasWebsite.Onboarding>
      )
    case '/docs':
      return (
        <DocsWebsite.Docs brand="halcyon-ui">
          <p>Your MDX or markdown documentation.</p>
        </DocsWebsite.Docs>
      )
    case '/blog':
      return <DocsWebsite.Blog brand="halcyon-ui" />
    case '/checkout':
      return (
        <CommerceWebsite.Checkout brand="Shop">
          <Field>
            <Field.Label>Card number</Field.Label>
            <Input aria-label="Card number" placeholder="4242 4242 4242 4242" />
          </Field>
          <Button>Pay now</Button>
        </CommerceWebsite.Checkout>
      )
    case '/404':
      return (
        <MarketingWebsite.NotFound
          actions={
            <>
              <Link href="/">Go home</Link>
              <Link href="/docs" variant="muted">Docs</Link>
            </>
          }
        />
      )
    default:
      return (
        <MarketingWebsite.NotFound
          actions={<Link href="/">Go home</Link>}
        />
      )
  }
}

export function WebsitePlayground({
  path,
  onNavigate,
}: {
  path: string
  onNavigate: Navigate
}) {
  const normalized = normalizePath(path)
  const page = KIT_PATHS.has(normalized) ? normalized : '/404'

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      const url = new URL(anchor.href, window.location.origin)
      if (url.origin !== window.location.origin) return
      const next = normalizePath(url.pathname)
      if (!KIT_PATHS.has(next)) return
      event.preventDefault()
      onNavigate(next)
    }

    document.addEventListener('click', onClick as unknown as EventListener, true)
    return () => document.removeEventListener('click', onClick as unknown as EventListener, true)
  }, [onNavigate])

  return (
    <div className="website-playground" data-path={page}>
      {renderPage(page)}
    </div>
  )
}
