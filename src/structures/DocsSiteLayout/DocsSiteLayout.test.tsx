import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { DocsSiteLayout } from './DocsSiteLayout'

describe('DocsSiteLayout', () => {
  it('renders docs chrome and prose region', () => {
    render(
      <DocsSiteLayout
        brand="halcyon-ui"
        version="v1"
        sidebarLinks={[{ href: '/install', label: 'Install', active: true }]}
      >
        <h1>Install</h1>
        <p>npm install halcyon-ui</p>
      </DocsSiteLayout>,
    )
    expect(screen.getByRole('article')).toHaveTextContent('npm install')
    expect(screen.getByText('v1')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <DocsSiteLayout brand="Docs" sidebarLinks={[{ href: '/', label: 'Home', active: true }]}>
        Page
      </DocsSiteLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
