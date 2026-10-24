import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { ErrorPageLayout } from './ErrorPageLayout'

describe('ErrorPageLayout', () => {
  it('renders status and message', () => {
    render(<ErrorPageLayout statusCode="500" title="Server error" />)
    expect(screen.getByRole('alert')).toHaveTextContent('500')
    expect(screen.getByRole('heading', { name: 'Server error' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<ErrorPageLayout />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
