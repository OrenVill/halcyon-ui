import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { Breadcrumb } from '../../components/Breadcrumb'
import { AppShell } from '../AppShell'
import { Navbar } from '../Navbar'
import { Sidebar } from '../Sidebar'
import type { SiteNavLink } from '../types'
import { cx } from '../../internal/cx'

export interface DashboardLayoutProps extends HTMLAttributes<HTMLDivElement> {
  brand: ReactNode
  sidebarLinks: SiteNavLink[]
  sidebarTitle?: ReactNode
  sidebarFooter?: ReactNode
  navbarLinks?: SiteNavLink[]
  actions?: ReactNode
  /** Built-in page header above your content. */
  pageTitle?: ReactNode
  pageDescription?: ReactNode
  pageActions?: ReactNode
  breadcrumbs?: SiteNavLink[]
  children: ReactNode
}

export type DashboardPageProps = HTMLAttributes<HTMLDivElement>

export const DashboardPage = /* @__PURE__ */ forwardRef<HTMLDivElement, DashboardPageProps>(
  function DashboardPage({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-dashboard-layout__page', className)} />
  },
)

export interface DashboardPageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export const DashboardPageHeader = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  DashboardPageHeaderProps
>(function DashboardPageHeader({ title, description, actions, className, children, ...rest }, ref) {
  return (
    <div {...rest} ref={ref} className={cx('hal-dashboard-layout__page-header', className)}>
      <div className="hal-dashboard-layout__page-headings">
        {title ? <h1 className="hal-dashboard-layout__page-title">{title}</h1> : null}
        {description ? (
          <p className="hal-dashboard-layout__page-description">{description}</p>
        ) : null}
        {children}
      </div>
      {actions ? <div className="hal-dashboard-layout__page-actions">{actions}</div> : null}
    </div>
  )
})

export type DashboardContentProps = HTMLAttributes<HTMLDivElement>

export const DashboardContent = /* @__PURE__ */ forwardRef<HTMLDivElement, DashboardContentProps>(
  function DashboardContent({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-dashboard-layout__content', className)} />
  },
)

function DashboardLayoutRoot(
  {
    brand,
    sidebarLinks,
    sidebarTitle,
    sidebarFooter,
    navbarLinks,
    actions,
    pageTitle,
    pageDescription,
    pageActions,
    breadcrumbs,
    children,
    className,
    ...rest
  }: DashboardLayoutProps,
  ref: Ref<HTMLDivElement>,
) {
  const showPageHeader = pageTitle || pageDescription || pageActions

  return (
    <AppShell {...rest} ref={ref} className={cx('hal-dashboard-layout', className)}>
      <AppShell.Header>
        <Navbar variant="raised">
          <Navbar.Brand>{brand}</Navbar.Brand>
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
          {actions ? <Navbar.Actions>{actions}</Navbar.Actions> : null}
        </Navbar>
      </AppShell.Header>
      <AppShell.Body>
        <AppShell.Sidebar>
          <Sidebar>
            {sidebarTitle ? <Sidebar.Header>{sidebarTitle}</Sidebar.Header> : null}
            <Sidebar.Nav>
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
            {sidebarFooter ? <Sidebar.Footer>{sidebarFooter}</Sidebar.Footer> : null}
          </Sidebar>
        </AppShell.Sidebar>
        <AppShell.Main className="hal-dashboard-layout__main">
          <DashboardPage>
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <Breadcrumb
                className="hal-dashboard-layout__breadcrumbs"
                items={breadcrumbs.map((item) => ({
                  label: item.label,
                  href: item.active ? undefined : item.href,
                  onClick: item.onClick,
                }))}
              />
            ) : null}
            {showPageHeader ? (
              <DashboardPageHeader
                title={pageTitle}
                description={pageDescription}
                actions={pageActions}
              />
            ) : null}
            <DashboardContent>{children}</DashboardContent>
          </DashboardPage>
        </AppShell.Main>
      </AppShell.Body>
    </AppShell>
  )
}

export interface DashboardLayoutComponent
  extends ReturnType<typeof forwardRef<HTMLDivElement, DashboardLayoutProps>> {
  Page: typeof DashboardPage
  PageHeader: typeof DashboardPageHeader
  Content: typeof DashboardContent
}

export const DashboardLayout = Object.assign(
  /* @__PURE__ */ forwardRef<HTMLDivElement, DashboardLayoutProps>(DashboardLayoutRoot),
  {
    Page: DashboardPage,
    PageHeader: DashboardPageHeader,
    Content: DashboardContent,
  },
) as DashboardLayoutComponent
