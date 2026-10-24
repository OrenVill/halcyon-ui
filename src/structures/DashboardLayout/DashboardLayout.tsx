import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
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
  /** Optional secondary links in the top bar (e.g. org switcher). */
  navbarLinks?: SiteNavLink[]
  actions?: ReactNode
  children: ReactNode
}

export const DashboardLayout = /* @__PURE__ */ forwardRef<HTMLDivElement, DashboardLayoutProps>(
  function DashboardLayout(
    {
      brand,
      sidebarLinks,
      sidebarTitle,
      sidebarFooter,
      navbarLinks,
      actions,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <AppShell
        {...rest}
        ref={ref}
        className={cx('hal-dashboard-layout', className)}
      >
        <AppShell.Header>
          <Navbar variant="raised">
            <Navbar.Brand>{brand}</Navbar.Brand>
            {navbarLinks && navbarLinks.length > 0 ? (
              <Navbar.Nav>
                <Navbar.Links>
                  {navbarLinks.map((link) => (
                    <Navbar.Link
                      key={String(link.href)}
                      href={link.href}
                      label={link.label}
                      current={link.active}
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
                      key={String(link.href)}
                      href={link.href}
                      label={link.label}
                      active={link.active}
                    />
                  ))}
                </Sidebar.Links>
              </Sidebar.Nav>
              {sidebarFooter ? <Sidebar.Footer>{sidebarFooter}</Sidebar.Footer> : null}
            </Sidebar>
          </AppShell.Sidebar>
          <AppShell.Main className="hal-dashboard-layout__main">{children}</AppShell.Main>
        </AppShell.Body>
      </AppShell>
    )
  },
)
