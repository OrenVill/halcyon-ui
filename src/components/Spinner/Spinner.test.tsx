import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('exposes the status role', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('defaults to medium size', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('hal-spinner', 'hal-spinner--md')
  })

  it('uses the default label as its accessible name', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('lets a custom label replace the default', () => {
    render(<Spinner label="Saving your draft" />)
    expect(screen.getByRole('status', { name: 'Saving your draft' })).toBeInTheDocument()
    expect(screen.queryByText('Loading')).not.toBeInTheDocument()
  })

  it('renders the label as real text, not only an aria-label', () => {
    render(<Spinner label="Saving" />)
    expect(screen.getByText('Saving')).toBeInTheDocument()
    expect(screen.getByRole('status')).not.toHaveAttribute('aria-label')
  })

  it('hides the label text visually with the shared utility class', () => {
    render(<Spinner label="Saving" />)
    expect(screen.getByText('Saving')).toHaveClass('hal-visually-hidden')
  })

  it('hides the spinning graphic from assistive technology', () => {
    const { container } = render(<Spinner />)
    const graphic = container.querySelector('.hal-spinner__graphic')
    expect(graphic).not.toBeNull()
    expect(graphic).toHaveAttribute('aria-hidden', 'true')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Spinner size={size as 'sm'} />)
    expect(screen.getByRole('status')).toHaveClass(`hal-spinner--${size}`)
  })

  it('merges className rather than replacing it', () => {
    render(<Spinner className="custom" />)
    const root = screen.getByRole('status')
    expect(root).toHaveClass('hal-spinner')
    expect(root).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Spinner style={{ marginTop: '4px' }} />)
    expect(screen.getByRole('status')).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the element', () => {
    render(<Spinner data-testid="x" aria-describedby="hint" />)
    expect(screen.getByTestId('x')).toHaveAttribute('aria-describedby', 'hint')
  })

  it('forwards the ref to the root span', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Spinner ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current).toHaveClass('hal-spinner')
  })

  it('gives each instance its own label id', () => {
    render(
      <>
        <Spinner label="First" />
        <Spinner label="Second" />
      </>,
    )
    const [first, second] = screen.getAllByRole('status')
    expect(first?.getAttribute('aria-labelledby')).not.toBe(second?.getAttribute('aria-labelledby'))
  })

  it('has no axe violations', async () => {
    const { container } = render(<Spinner />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
