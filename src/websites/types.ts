import type { ReactNode } from 'react'

/** Suggested route for a page in a website kit (wire to your router). */
export interface WebsiteRoute {
  id: string
  label: ReactNode
  path: string
}

export interface WebsiteBrandProps {
  brand: ReactNode
}
