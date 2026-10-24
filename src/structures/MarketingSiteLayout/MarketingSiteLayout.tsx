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
  /** When set, renders a built-in hero above {children}. */
  hero?: {
    title: ReactNode
    description?: ReactNode
    actions?: ReactNode
  }
  children?: ReactNode
}

export interface MarketingHeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export const MarketingHero = /* @__PURE__ */ forwardRef<HTMLElement, MarketingHeroProps>(
  function MarketingHero({ title, description, actions, className, children, ...rest }, ref) {
    return (
      <section {...rest} ref={ref} className={cx('hal-marketing-layout__hero', className)}>
        <div className="hal-marketing-layout__hero-inner">
          {title ? <h1 className="hal-marketing-layout__hero-title">{title}</h1> : null}
          {description ? (
            <p className="hal-marketing-layout__hero-description">{description}</p>
          ) : null}
          {actions ? <div className="hal-marketing-layout__hero-actions">{actions}</div> : null}
          {children}
        </div>
      </section>
    )
  },
)

export interface MarketingSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  variant?: 'default' | 'muted'
}

export const MarketingSection = /* @__PURE__ */ forwardRef<HTMLElement, MarketingSectionProps>(
  function MarketingSection(
    { title, description, variant = 'default', className, children, ...rest },
    ref,
  ) {
    return (
      <section
        {...rest}
        ref={ref}
        className={cx(
          'hal-marketing-layout__section',
          variant === 'muted' && 'hal-marketing-layout__section--muted',
          className,
        )}
      >
        <div className="hal-marketing-layout__section-inner">
          {title ? <h2 className="hal-marketing-layout__section-title">{title}</h2> : null}
          {description ? (
            <p className="hal-marketing-layout__section-description">{description}</p>
          ) : null}
          {children}
        </div>
      </section>
    )
  },
)

export interface MarketingCtaProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export const MarketingCta = /* @__PURE__ */ forwardRef<HTMLElement, MarketingCtaProps>(
  function MarketingCta({ title, description, actions, className, children, ...rest }, ref) {
    return (
      <section {...rest} ref={ref} className={cx('hal-marketing-layout__cta', className)}>
        <div className="hal-marketing-layout__cta-inner">
          {title ? <h2 className="hal-marketing-layout__cta-title">{title}</h2> : null}
          {description ? <p className="hal-marketing-layout__cta-description">{description}</p> : null}
          {actions ? <div className="hal-marketing-layout__cta-actions">{actions}</div> : null}
          {children}
        </div>
      </section>
    )
  },
)

const DEFAULT_FOOTER: SiteFooterColumn[] = [
  {
    title: 'Product',
    links: [{ href: '#', label: 'Components' }, { href: '#', label: 'Themes' }],
  },
  {
    title: 'Resources',
    links: [{ href: '#', label: 'Docs' }, { href: '#', label: 'Gallery' }],
  },
]

const MarketingSiteLayoutRoot = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  MarketingSiteLayoutProps
>(function MarketingSiteLayout(
  {
    brand,
    navLinks,
    actions,
    footerColumns,
    copyright = '© Your company',
    hero,
    children,
    className,
    ...rest
  },
  ref,
) {
  const columns = footerColumns ?? DEFAULT_FOOTER

  return (
    <div {...rest} ref={ref} className={cx('hal-marketing-layout', className)}>
      <div className="hal-marketing-layout__header">
        <Navbar>
          <Navbar.Brand>{brand}</Navbar.Brand>
          <Navbar.Nav>
            <Navbar.Links>
              {navLinks.map((link) => (
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
          {actions ? <Navbar.Actions>{actions}</Navbar.Actions> : null}
        </Navbar>
      </div>

      <main className="hal-marketing-layout__main">
        {hero ? (
          <MarketingHero title={hero.title} description={hero.description} actions={hero.actions} />
        ) : null}
        {children}
      </main>

      <footer className="hal-marketing-layout__footer" role="contentinfo">
        <div className="hal-marketing-layout__footer-grid">
          {columns.map((column, index) => (
            <div key={index} className="hal-marketing-layout__footer-col">
              <p className="hal-marketing-layout__footer-title">{column.title}</p>
              <ul className="hal-marketing-layout__footer-links">
                {column.links.map((link) => (
                  <li key={`${String(link.href)}-${String(link.label)}`}>
                    <Link
                      href={link.href}
                      onClick={link.onClick}
                      variant="muted"
                      className="hal-marketing-layout__footer-link"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="hal-marketing-layout__copyright">{copyright}</p>
      </footer>
    </div>
  )
})

export interface MarketingSiteLayoutComponent
  extends ReturnType<typeof forwardRef<HTMLDivElement, MarketingSiteLayoutProps>> {
  Hero: typeof MarketingHero
  Section: typeof MarketingSection
  Cta: typeof MarketingCta
}

export const MarketingSiteLayout = Object.assign(MarketingSiteLayoutRoot, {
  Hero: MarketingHero,
  Section: MarketingSection,
  Cta: MarketingCta,
}) as MarketingSiteLayoutComponent