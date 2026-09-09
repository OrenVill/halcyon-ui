import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Radio } from './Radio'

describe('Radio', () => {
  it('renders a native radio', () => {
    render(<Radio aria-label="Card" />)
    const input = screen.getByRole('radio', { name: 'Card' })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'radio')
  })

  it('defaults to the medium size', () => {
    render(<Radio aria-label="Card" />)
    expect(screen.getByRole('radio')).toHaveClass('hal-radio', 'hal-radio--md')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Radio aria-label="Card" size={size as 'sm'} />)
    expect(screen.getByRole('radio')).toHaveClass('hal-radio', `hal-radio--${size}`)
  })

  it('checks on click', async () => {
    render(<Radio aria-label="Card" />)
    const input = screen.getByRole('radio')
    await userEvent.click(input)
    expect(input).toBeChecked()
  })

  it('keeps radios sharing a name mutually exclusive', async () => {
    render(
      <>
        <Radio aria-label="Card" name="payment" value="card" />
        <Radio aria-label="Cash" name="payment" value="cash" />
      </>,
    )
    const card = screen.getByRole('radio', { name: 'Card' })
    const cash = screen.getByRole('radio', { name: 'Cash' })

    await userEvent.click(card)
    expect(card).toBeChecked()
    expect(cash).not.toBeChecked()

    await userEvent.click(cash)
    expect(cash).toBeChecked()
    expect(card).not.toBeChecked()
  })

  it('honours defaultChecked when uncontrolled', () => {
    render(
      <>
        <Radio aria-label="Card" name="payment" value="card" defaultChecked />
        <Radio aria-label="Cash" name="payment" value="cash" />
      </>,
    )
    expect(screen.getByRole('radio', { name: 'Card' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Cash' })).not.toBeChecked()
  })

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Radio aria-label="Card" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toBe(screen.getByRole('radio'))
  })

  it('never renders a size attribute on the input', () => {
    render(<Radio aria-label="Card" size="lg" />)
    expect(screen.getByRole('radio')).not.toHaveAttribute('size')
  })

  it('merges className rather than replacing it', () => {
    render(<Radio aria-label="Card" className="custom" />)
    const input = screen.getByRole('radio')
    expect(input).toHaveClass('hal-radio')
    expect(input).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Radio aria-label="Card" style={{ marginTop: '4px' }} />)
    expect(screen.getByRole('radio')).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the element', () => {
    render(<Radio aria-label="Card" data-testid="x" value="card" />)
    expect(screen.getByTestId('x')).toHaveAttribute('value', 'card')
  })

  it('does not change when disabled', async () => {
    const onChange = vi.fn()
    render(<Radio aria-label="Card" disabled onChange={onChange} />)
    const input = screen.getByRole('radio')
    expect(input).toBeDisabled()
    await userEvent.click(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(input).not.toBeChecked()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Radio aria-label="Card" name="payment" value="card" />
        <Radio aria-label="Cash" name="payment" value="cash" />
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
