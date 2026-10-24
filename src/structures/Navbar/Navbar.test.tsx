import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Button } from '../../components/Button'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('renders brand, links, and actions', () => {
    render(
      <Navbar>
        <Navbar.Brand>Halcyon</Navbar.Brand>
        <Navbar.Nav>
          <Navbar.Links>
            <Navbar.Link href="/docs" label="Docs" />
            <Navbar.Link href="/api" label="API" current />
          </Navbar.Links>
        </Navbar.Nav>
        <Navbar.Actions>
          <Button size="sm">Sign in</Button>
        </Navbar.Actions>
      </Navbar>,
    )
    expect(screen.getByText('Halcyon')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'API' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('applies variant and size classes', () => {
    const { container } = render(
      <Navbar variant="raised" size="lg">
        <Navbar.Brand>App</Navbar.Brand>
      </Navbar>,
    )
    expect(container.firstElementChild).toHaveClass('hal-navbar--raised', 'hal-navbar--lg')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Navbar>
        <Navbar.Brand>Halcyon</Navbar.Brand>
        <Navbar.Nav>
          <Navbar.Links>
            <Navbar.Link href="/" label="Home" current />
          </Navbar.Links>
        </Navbar.Nav>
      </Navbar>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
