import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { LoginLayout } from './LoginLayout'

describe('LoginLayout', () => {
  it('renders brand, title, and form slot', () => {
    render(
      <LoginLayout brand="Acme">
        <button type="submit">Continue</button>
      </LoginLayout>,
    )
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <LoginLayout brand="Acme">
        <p>Form</p>
      </LoginLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
