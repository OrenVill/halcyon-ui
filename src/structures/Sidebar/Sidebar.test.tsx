import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('renders navigation links with an active item', () => {
    render(
      <Sidebar>
        <Sidebar.Header>Settings</Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Links>
            <Sidebar.Link href="/profile" label="Profile" active />
            <Sidebar.Link href="/billing" label="Billing" />
          </Sidebar.Links>
        </Sidebar.Nav>
        <Sidebar.Footer>v1.0</Sidebar.Footer>
      </Sidebar>,
    )
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('v1.0')).toBeInTheDocument()
  })

  it('applies collapsed class', () => {
    const { container } = render(
      <Sidebar collapsed>
        <Sidebar.Header>App</Sidebar.Header>
      </Sidebar>,
    )
    expect(container.firstElementChild).toHaveClass('hal-sidebar--collapsed')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Sidebar>
        <Sidebar.Nav>
          <Sidebar.Links>
            <Sidebar.Link href="/" label="Home" active />
          </Sidebar.Links>
        </Sidebar.Nav>
      </Sidebar>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
