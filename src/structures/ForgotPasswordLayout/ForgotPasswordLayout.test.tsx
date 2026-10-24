import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { ForgotPasswordLayout } from './ForgotPasswordLayout'

describe('ForgotPasswordLayout', () => {
  it('renders back link and title', () => {
    render(
      <ForgotPasswordLayout brand="Acme">
        <button type="submit">Send link</button>
      </ForgotPasswordLayout>,
    )
    expect(screen.getByRole('link', { name: /Back to sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reset your password' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ForgotPasswordLayout brand="Acme">
        <p>Form</p>
      </ForgotPasswordLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
