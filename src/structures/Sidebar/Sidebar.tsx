import { forwardRef } from 'react'
import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from 'react'
import { Link } from '../../components/Link'
import { cx } from '../../internal/cx'

export type SidebarVariant = 'plain' | 'subtle'
export type SidebarSize = 'sm' | 'md' | 'lg'

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  variant?: SidebarVariant
  size?: SidebarSize
  /** Narrows the rail to icons-only width when true. */
  collapsed?: boolean
  label?: string
}

const SidebarRoot = /* @__PURE__ */ forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    variant = 'plain',
    size = 'md',
    collapsed = false,
    label = 'Sidebar',
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <aside
      {...rest}
      ref={ref}
      aria-label={label}
      className={cx(
        'hal-sidebar',
        `hal-sidebar--${variant}`,
        `hal-sidebar--${size}`,
        collapsed && 'hal-sidebar--collapsed',
        className,
      )}
    >
      {children}
    </aside>
  )
})

export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement>

export const SidebarHeader = /* @__PURE__ */ forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-sidebar__header', className)} />
  },
)

export interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  'aria-label'?: string
}

export const SidebarNav = /* @__PURE__ */ forwardRef<HTMLElement, SidebarNavProps>(
  function SidebarNav({ className, 'aria-label': ariaLabel = 'Sections', ...rest }, ref) {
    return (
      <nav
        {...rest}
        ref={ref}
        aria-label={ariaLabel}
        className={cx('hal-sidebar__nav', className)}
      />
    )
  },
)

export type SidebarLinksProps = HTMLAttributes<HTMLUListElement>

export const SidebarLinks = /* @__PURE__ */ forwardRef<HTMLUListElement, SidebarLinksProps>(
  function SidebarLinks({ className, ...rest }, ref) {
    return <ul {...rest} ref={ref} className={cx('hal-sidebar__links', className)} />
  },
)

export interface SidebarLinkProps extends LiHTMLAttributes<HTMLLIElement> {
  href: string
  label: ReactNode
  active?: boolean
}

export const SidebarLink = /* @__PURE__ */ forwardRef<HTMLLIElement, SidebarLinkProps>(
  function SidebarLink({ href, label, active = false, className, ...rest }, ref) {
    return (
      <li {...rest} ref={ref} className={cx('hal-sidebar__item', className)}>
        <Link
          href={href}
          variant="muted"
          className={cx('hal-sidebar__link', active && 'hal-sidebar__link--active')}
          aria-current={active ? 'page' : undefined}
        >
          {label}
        </Link>
      </li>
    )
  },
)

export type SidebarFooterProps = HTMLAttributes<HTMLDivElement>

export const SidebarFooter = /* @__PURE__ */ forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-sidebar__footer', className)} />
  },
)

export interface SidebarComponent extends ReturnType<typeof forwardRef<HTMLElement, SidebarProps>> {
  Header: typeof SidebarHeader
  Nav: typeof SidebarNav
  Links: typeof SidebarLinks
  Link: typeof SidebarLink
  Footer: typeof SidebarFooter
}

export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Nav: SidebarNav,
  Links: SidebarLinks,
  Link: SidebarLink,
  Footer: SidebarFooter,
}) as SidebarComponent
