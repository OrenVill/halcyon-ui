import { createContext, forwardRef, useContext, useMemo } from 'react'
import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from 'react'
import { Link } from '../../components/Link'
import { cx } from '../../internal/cx'

export type NavbarVariant = 'plain' | 'raised'
export type NavbarSize = 'sm' | 'md' | 'lg'

interface NavbarContextValue {
  size: NavbarSize
}

const NavbarContext = createContext<NavbarContextValue | null>(null)

function useNavbarContext(): NavbarContextValue {
  const ctx = useContext(NavbarContext)
  if (!ctx) throw new Error('Navbar subcomponents must render inside <Navbar>.')
  return ctx
}

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  variant?: NavbarVariant
  size?: NavbarSize
}

const NavbarRoot = /* @__PURE__ */ forwardRef<HTMLElement, NavbarProps>(function Navbar(
  { variant = 'plain', size = 'md', className, children, ...rest },
  ref,
) {
  const value = useMemo(() => ({ size }), [size])
  return (
    <NavbarContext.Provider value={value}>
      <header
        {...rest}
        ref={ref}
        className={cx('hal-navbar', `hal-navbar--${variant}`, `hal-navbar--${size}`, className)}
      >
        <div className="hal-navbar__inner">{children}</div>
      </header>
    </NavbarContext.Provider>
  )
})

export type NavbarBrandProps = HTMLAttributes<HTMLDivElement>

export const NavbarBrand = /* @__PURE__ */ forwardRef<HTMLDivElement, NavbarBrandProps>(
  function NavbarBrand({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-navbar__brand', className)} />
  },
)

export interface NavbarNavProps extends HTMLAttributes<HTMLElement> {
  'aria-label'?: string
}

export const NavbarNav = /* @__PURE__ */ forwardRef<HTMLElement, NavbarNavProps>(
  function NavbarNav({ className, 'aria-label': ariaLabel = 'Main', ...rest }, ref) {
    return (
      <nav
        {...rest}
        ref={ref}
        aria-label={ariaLabel}
        className={cx('hal-navbar__nav', className)}
      />
    )
  },
)

export type NavbarLinksProps = HTMLAttributes<HTMLUListElement>

export const NavbarLinks = /* @__PURE__ */ forwardRef<HTMLUListElement, NavbarLinksProps>(
  function NavbarLinks({ className, ...rest }, ref) {
    return <ul {...rest} ref={ref} className={cx('hal-navbar__links', className)} />
  },
)

export interface NavbarLinkProps extends LiHTMLAttributes<HTMLLIElement> {
  href: string
  label: ReactNode
  current?: boolean
}

export const NavbarLink = /* @__PURE__ */ forwardRef<HTMLLIElement, NavbarLinkProps>(
  function NavbarLink({ href, label, current = false, className, ...rest }, ref) {
    useNavbarContext()
    return (
      <li {...rest} ref={ref} className={cx('hal-navbar__item', className)}>
        <Link
          href={href}
          variant="muted"
          className={cx('hal-navbar__link', current && 'hal-navbar__link--current')}
          aria-current={current ? 'page' : undefined}
        >
          {label}
        </Link>
      </li>
    )
  },
)

export type NavbarActionsProps = HTMLAttributes<HTMLDivElement>

export const NavbarActions = /* @__PURE__ */ forwardRef<HTMLDivElement, NavbarActionsProps>(
  function NavbarActions({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-navbar__actions', className)} />
  },
)

export interface NavbarComponent extends ReturnType<typeof forwardRef<HTMLElement, NavbarProps>> {
  Brand: typeof NavbarBrand
  Nav: typeof NavbarNav
  Links: typeof NavbarLinks
  Link: typeof NavbarLink
  Actions: typeof NavbarActions
}

export const Navbar = Object.assign(NavbarRoot, {
  Brand: NavbarBrand,
  Nav: NavbarNav,
  Links: NavbarLinks,
  Link: NavbarLink,
  Actions: NavbarActions,
}) as NavbarComponent
