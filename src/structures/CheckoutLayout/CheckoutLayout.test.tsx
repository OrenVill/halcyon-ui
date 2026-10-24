import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { CheckoutLayout } from './CheckoutLayout'

describe('CheckoutLayout', () => {
  it('renders form and order summary', () => {
    render(
      <CheckoutLayout brand="Shop" orderSummary={<p>Total $12</p>}>
        <input aria-label="Card" />
      </CheckoutLayout>,
    )
    expect(screen.getByRole('heading', { name: 'Payment details' })).toBeInTheDocument()
    expect(screen.getByLabelText('Order summary')).toHaveTextContent('Total $12')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <CheckoutLayout brand="Shop" orderSummary={<span>—</span>}>
        Form
      </CheckoutLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
