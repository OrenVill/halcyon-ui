import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { SignupLayout } from './SignupLayout'

describe('SignupLayout', () => {
  it('renders default signup title', () => {
    render(
      <SignupLayout brand="Co">
        <input aria-label="Email" />
      </SignupLayout>,
    )
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <SignupLayout brand="Co">
        <p>Form</p>
      </SignupLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
