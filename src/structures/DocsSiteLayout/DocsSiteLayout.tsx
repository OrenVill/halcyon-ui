import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { Link } from '../../components/Link'
import { AppShell } from '../AppShell'
import { Navbar } from '../Navbar'
import { Sidebar } from '../Sidebar'
import type { SiteNavLink, SitePagerLink } from '../types'
import { cx } from '../../internal/cx'

export interface DocsSiteLayoutProps extends HTMLAttributes<HTMLDivElement> {
  brand: ReactNode
  version?: ReactNode
  sidebarLinks: SiteNavLink[]
  navbarLinks?: SiteNavLink[]
  actions?: ReactNode
  toolbar?: ReactNode
  pageTitle?: ReactNode
  pageDescription?: ReactNode
  prevPage?: SitePagerLink
  nextPage?: SitePagerLink
  children: ReactNode
}

export type DocsArticleProps = HTMLAttributes<HTMLElement>

export const DocsArticle = /* @__PURE__ */ forwardRef<HTMLElement, DocsArticleProps>(
  function DocsArticle({ className, ...rest }, ref) {
    return <article {...rest} ref={ref} className={cx('hal-docs-layout__article', className)} />
  },
)

export type DocsPagerProps = HTMLAttributes<HTMLElement>

export const DocsPager = /* @__PURE__ */ forwardRef<HTMLElement, DocsPagerProps>(
  function DocsPager({ className, ...rest }, ref) {
    return <nav {...rest} ref={ref} className={cx('hal-docs-layout__pager', className)} aria-label="Documentation pages" />
  },
)

function DocsSiteLayoutRoot(
  {
    brand,
    version,
    sidebarLinks,
    navbarLinks,
    actions,
    toolbar,
    pageTitle,
    pageDescription,
    prevPage,
    nextPage,
    children,
    className,
    ...rest
  }: DocsSiteLayoutProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <AppShell {...rest} ref={ref} className={cx('hal-docs-layout', className)}>
      <AppShell.Header>
        <Navbar>
          <Navbar.Brand>
            {brand}
            {version ? <span className="hal-docs-layout__version">{version}</span> : null}
          </Navbar.Brand>
          {navbarLinks && navbarLinks.length > 0 ? (
            <Navbar.Nav>
              <Navbar.Links>
                {navbarLinks.map((link) => (
                  <Navbar.Link
                    key={`${String(link.href)}-${String(link.label)}`}
                    href={link.href}
                    label={link.label}
                    current={link.active}
                    onClick={link.onClick}
                  />
                ))}
              </Navbar.Links>
            </Navbar.Nav>
          ) : null}
          {toolbar ? <div className="hal-docs-layout__toolbar">{toolbar}</div> : null}
          {actions ? <Navbar.Actions>{actions}</Navbar.Actions> : null}
        </Navbar>
      </AppShell.Header>
      <AppShell.Body>
        <AppShell.Sidebar>
          <Sidebar variant="subtle" label="Documentation">
            <Sidebar.Header>On this site</Sidebar.Header>
            <Sidebar.Nav aria-label="Documentation sections">
              <Sidebar.Links>
                {sidebarLinks.map((link) => (
                  <Sidebar.Link
                    key={`${String(link.href)}-${String(link.label)}`}
                    href={link.href}
                    label={link.label}
                    active={link.active}
                    onClick={link.onClick}
                  />
                ))}
              </Sidebar.Links>
            </Sidebar.Nav>
          </Sidebar>
        </AppShell.Sidebar>
        <AppShell.Main className="hal-docs-layout__main">
          <DocsArticle>
            {pageTitle ? <h1 className="hal-docs-layout__title">{pageTitle}</h1> : null}
            {pageDescription ? (
              <p className="hal-docs-layout__lead">{pageDescription}</p>
            ) : null}
            <div className="hal-docs-layout__body">{children}</div>
            {prevPage || nextPage ? (
              <DocsPager>
                {prevPage ? (
                  <Link href={prevPage.href} onClick={prevPage.onClick} className="hal-docs-layout__pager-link">
                    <span className="hal-docs-layout__pager-label">Previous</span>
                    <span>{prevPage.label}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {nextPage ? (
                  <Link
                    href={nextPage.href}
                    onClick={nextPage.onClick}
                    className="hal-docs-layout__pager-link hal-docs-layout__pager-link--next"
                  >
                    <span className="hal-docs-layout__pager-label">Next</span>
                    <span>{nextPage.label}</span>
                  </Link>
                ) : null}
              </DocsPager>
            ) : null}
          </DocsArticle>
        </AppShell.Main>
      </AppShell.Body>
    </AppShell>
  )
}

export interface DocsSiteLayoutComponent
  extends ReturnType<typeof forwardRef<HTMLDivElement, DocsSiteLayoutProps>> {
  Article: typeof DocsArticle
  Pager: typeof DocsPager
}

export const DocsSiteLayout = Object.assign(
  /* @__PURE__ */ forwardRef<HTMLDivElement, DocsSiteLayoutProps>(DocsSiteLayoutRoot),
  {
    Article: DocsArticle,
    Pager: DocsPager,
  },
) as DocsSiteLayoutComponent
