import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { MarketingWebsite } from './MarketingWebsite'

describe('MarketingWebsite', () => {
  it('exposes pages and suggested paths', () => {
    expect(MarketingWebsite.paths.login).toBe('/login')
    expect(MarketingWebsite.routes.length).toBeGreaterThan(3)
  })

  it('renders login page with cross-link to signup', () => {
    render(
      <MarketingWebsite.Login brand="Halcyon">
        <button type="submit">Sign in</button>
      </MarketingWebsite.Login>,
    )
    expect(screen.getByRole('link', { name: /Sign up/i })).toHaveAttribute('href', '/signup')
  })

  it('has no axe violations on home', async () => {
    const { container } = render(
      <MarketingWebsite.Home brand="Halcyon">
        <p>Features</p>
      </MarketingWebsite.Home>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
