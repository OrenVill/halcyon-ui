import type { MouseEvent, ReactNode } from 'react'

export interface SiteNavLink {
  href: string
  label: ReactNode
  active?: boolean
  disabled?: boolean
  /** Use with client routers or in-app navigation (call preventDefault when needed). */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export interface SiteFooterColumn {
  title: ReactNode
  links: SiteNavLink[]
}

export interface SitePagerLink {
  href: string
  label: ReactNode
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}
