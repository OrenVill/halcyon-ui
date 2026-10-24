import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { AppShell } from '../AppShell'
import { Navbar } from '../Navbar'
import { Sidebar } from '../Sidebar'
import type { SiteNavLink } from '../types'
import { cx } from '../../internal/cx'

export interface SettingsLayoutProps extends HTMLAttributes<HTMLDivElement> {
  brand: ReactNode
  sectionLinks: SiteNavLink[]
  sectionTitle?: ReactNode
  pageTitle?: ReactNode
  pageDescription?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

function SettingsLayoutRoot(
  {
    brand,
    sectionLinks,
    sectionTitle = 'Settings',
    pageTitle,
    pageDescription,
    actions,
    children,
    className,
    ...rest
  }: SettingsLayoutProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <AppShell {...rest} ref={ref} className={cx('hal-settings-layout', className)}>
      <AppShell.Header>
        <Navbar variant="raised">
          <Navbar.Brand>{brand}</Navbar.Brand>
          {actions ? <Navbar.Actions>{actions}</Navbar.Actions> : null}
        </Navbar>
      </AppShell.Header>
      <AppShell.Body>
        <AppShell.Sidebar>
          <Sidebar variant="subtle" label="Settings">
            <Sidebar.Header>{sectionTitle}</Sidebar.Header>
            <Sidebar.Nav aria-label="Settings sections">
              <Sidebar.Links>
                {sectionLinks.map((link) => (
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
        <AppShell.Main className="hal-settings-layout__main">
          <div className="hal-settings-layout__page">
            {pageTitle ? <h1 className="hal-settings-layout__title">{pageTitle}</h1> : null}
            {pageDescription ? (
              <p className="hal-settings-layout__description">{pageDescription}</p>
            ) : null}
            <div className="hal-settings-layout__content">{children}</div>
          </div>
        </AppShell.Main>
      </AppShell.Body>
    </AppShell>
  )
}

export const SettingsLayout = /* @__PURE__ */ forwardRef<HTMLDivElement, SettingsLayoutProps>(
  SettingsLayoutRoot,
)
