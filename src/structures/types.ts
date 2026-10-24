import type { ReactNode } from 'react'

export interface SiteNavLink {
  href: string
  label: ReactNode
  active?: boolean
  disabled?: boolean
}

export interface SiteFooterColumn {
  title: ReactNode
  links: SiteNavLink[]
}

export interface SitePagerLink {
  href: string
  label: ReactNode
}
