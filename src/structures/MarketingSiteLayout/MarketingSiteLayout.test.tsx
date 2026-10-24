import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { MarketingSiteLayout } from './MarketingSiteLayout'

describe('MarketingSiteLayout', () => {
  it('renders nav, main, and footer', () => {
    render(
      <MarketingSiteLayout
        brand="Halcyon"
        navLinks={[
          { href: '/product', label: 'Product', active: true },
          { href: '/pricing', label: 'Pricing' },
        ]}
        footerColumns={[
          {
            title: 'Company',
            links: [{ href: '/about', label: 'About' }],
          },
        ]}
        copyright="© 2026 Halcyon"
      >
        Hero section
      </MarketingSiteLayout>,
    )
    expect(screen.getByRole('main')).toHaveTextContent('Hero section')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText('© 2026 Halcyon')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <MarketingSiteLayout brand="Co" navLinks={[{ href: '/', label: 'Home', active: true }]}>
        Body
      </MarketingSiteLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
