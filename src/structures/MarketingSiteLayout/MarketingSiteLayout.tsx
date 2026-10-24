import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { Link } from '../../components/Link'
import { Navbar } from '../Navbar'
import type { SiteFooterColumn, SiteNavLink } from '../types'
import { cx } from '../../internal/cx'

export interface MarketingSiteLayoutProps extends HTMLAttributes<HTMLDivElement> {
  brand: ReactNode
  navLinks: SiteNavLink[]
  actions?: ReactNode
  footerColumns?: SiteFooterColumn[]
  copyright?: ReactNode
  children: ReactNode
}

export const MarketingSiteLayout = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  MarketingSiteLayoutProps
>(function MarketingSiteLayout(
  {
    brand,
    navLinks,
    actions,
    footerColumns,
    copyright,
    children,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx('hal-marketing-layout', className)}
    >
      <div className="hal-marketing-layout__header">
        <Navbar variant="raised">
          <Navbar.Brand>{brand}</Navbar.Brand>
          <Navbar.Nav>
            <Navbar.Links>
              {navLinks.map((link) => (
                <Navbar.Link
                  key={String(link.href)}
                  href={link.href}
                  label={link.label}
                  current={link.active}
                />
              ))}
            </Navbar.Links>
          </Navbar.Nav>
          {actions ? <Navbar.Actions>{actions}</Navbar.Actions> : null}
        </Navbar>
      </div>

      <main className="hal-marketing-layout__main">{children}</main>

      {footerColumns && footerColumns.length > 0 ? (
        <footer className="hal-marketing-layout__footer" role="contentinfo">
          <div className="hal-marketing-layout__footer-grid">
            {footerColumns.map((column, index) => (
              <div key={index} className="hal-marketing-layout__footer-col">
                <p className="hal-marketing-layout__footer-title">{column.title}</p>
                <ul className="hal-marketing-layout__footer-links">
                  {column.links.map((link) => (
                    <li key={String(link.href)}>
                      <Link href={link.href} variant="muted" className="hal-marketing-layout__footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {copyright ? (
            <p className="hal-marketing-layout__copyright">{copyright}</p>
          ) : null}
        </footer>
      ) : null}
    </div>
  )
})
