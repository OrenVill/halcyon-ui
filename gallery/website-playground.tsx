import { useEffect, type MouseEvent, type ReactNode } from 'react'
import { Link } from '../src/components/Link'
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

function renderPage(path: string): ReactNode {
  switch (path) {
    case '/':
      return <MarketingWebsite.Home brand="Halcyon" />
    case '/login':
      return <MarketingWebsite.Login brand="Halcyon" />
    case '/signup':
      return <MarketingWebsite.Signup brand="Halcyon" />
    case '/forgot-password':
      return <MarketingWebsite.ForgotPassword brand="Halcyon" />
    case '/app':
      return <SaasWebsite.Dashboard brand="Acme" />
    case '/app/settings':
      return <SaasWebsite.Settings brand="Acme" />
    case '/onboarding':
      return <SaasWebsite.Onboarding brand="Acme" currentStepId="project" />
    case '/docs':
      return (
        <DocsWebsite.Docs brand="halcyon-ui">
          <p>Your MDX or markdown documentation.</p>
        </DocsWebsite.Docs>
      )
    case '/blog':
      return <DocsWebsite.Blog brand="halcyon-ui" />
    case '/checkout':
      return <CommerceWebsite.Checkout brand="Shop" />
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
      return <MarketingWebsite.NotFound actions={<Link href="/">Go home</Link>} />
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
