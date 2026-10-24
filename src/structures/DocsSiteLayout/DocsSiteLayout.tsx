import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { AppShell } from '../AppShell'
import { Navbar } from '../Navbar'
import { Sidebar } from '../Sidebar'
import type { SiteNavLink } from '../types'
import { cx } from '../../internal/cx'

export interface DocsSiteLayoutProps extends HTMLAttributes<HTMLDivElement> {
  brand: ReactNode
  version?: ReactNode
  sidebarLinks: SiteNavLink[]
  navbarLinks?: SiteNavLink[]
  actions?: ReactNode
  /** Slot for search or version picker in the header. */
  toolbar?: ReactNode
  children: ReactNode
}

export const DocsSiteLayout = /* @__PURE__ */ forwardRef<HTMLDivElement, DocsSiteLayoutProps>(
  function DocsSiteLayout(
    {
      brand,
      version,
      sidebarLinks,
      navbarLinks,
      actions,
      toolbar,
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
        className={cx('hal-docs-layout', className)}
      >
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
                      key={String(link.href)}
                      href={link.href}
                      label={link.label}
                      current={link.active}
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
            <Sidebar variant="subtle" aria-label="Documentation">
              <Sidebar.Nav aria-label="Documentation sections">
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
            </Sidebar>
          </AppShell.Sidebar>
          <AppShell.Main>
            <article className="hal-docs-layout__article">{children}</article>
          </AppShell.Main>
        </AppShell.Body>
      </AppShell>
    )
  },
)
