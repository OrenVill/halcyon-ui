import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { DashboardLayout } from './DashboardLayout'

const LINKS = [
  { href: '/overview', label: 'Overview', active: true },
  { href: '/reports', label: 'Reports' },
]

describe('DashboardLayout', () => {
  it('renders brand, sidebar, and main', () => {
    render(
      <DashboardLayout brand="Acme" sidebarTitle="Workspace" sidebarLinks={LINKS}>
        KPI grid
      </DashboardLayout>,
    )
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('main')).toHaveTextContent('KPI grid')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <DashboardLayout brand="Acme" sidebarLinks={LINKS}>Content</DashboardLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
