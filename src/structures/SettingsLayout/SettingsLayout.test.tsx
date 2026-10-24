import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { SettingsLayout } from './SettingsLayout'

const LINKS = [{ href: '/profile', label: 'Profile', active: true }]

describe('SettingsLayout', () => {
  it('renders settings nav and content', () => {
    render(
      <SettingsLayout brand="Acme" sectionLinks={LINKS} pageTitle="Profile">
        Form fields
      </SettingsLayout>,
    )
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <SettingsLayout brand="Acme" sectionLinks={LINKS}>Content</SettingsLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
