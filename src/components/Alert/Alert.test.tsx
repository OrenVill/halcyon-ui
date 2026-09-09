import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renders its title and children', () => {
    render(<Alert title="Saved">Your changes are live.</Alert>)
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Your changes are live.')).toBeInTheDocument()
  })

  it('renders without a title', () => {
    render(<Alert>Just a note.</Alert>)
    expect(screen.getByText('Just a note.')).toBeInTheDocument()
  })

  it('defaults to the info variant', () => {
    render(<Alert data-testid="alert">Note</Alert>)
    expect(screen.getByTestId('alert')).toHaveClass('hal-alert', 'hal-alert--info')
  })

  it.each([['info'], ['success'], ['warning'], ['danger']])(
    'applies the %s variant class',
    (variant) => {
      render(
        <Alert variant={variant as 'info'} data-testid="alert">
          Note
        </Alert>,
      )
      expect(screen.getByTestId('alert')).toHaveClass(`hal-alert--${variant}`)
    },
  )

  it('gives danger role="alert" so it interrupts', () => {
    render(<Alert variant="danger">Payment failed</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed')
  })

  it.each([['info'], ['success'], ['warning']])(
    'gives %s role="status" so it does not interrupt',
    (variant) => {
      render(<Alert variant={variant as 'info'}>Note</Alert>)
      expect(screen.getByRole('status')).toHaveTextContent('Note')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    },
  )

  it('lets a caller-supplied role win', () => {
    render(
      <Alert variant="danger" role="region" aria-label="Errors">
        Payment failed
      </Alert>,
    )
    expect(screen.getByRole('region', { name: 'Errors' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders no dismiss button without onDismiss', () => {
    render(<Alert>Note</Alert>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders a dismiss button with an accessible name when onDismiss is given', () => {
    render(<Alert onDismiss={() => {}}>Note</Alert>)
    const button = screen.getByRole('button', { name: 'Dismiss' })
    expect(button).toHaveAttribute('type', 'button')
  })

  it('accepts a custom dismiss label', () => {
    render(
      <Alert onDismiss={() => {}} dismissLabel="Close notification">
        Note
      </Alert>,
    )
    expect(screen.getByRole('button', { name: 'Close notification' })).toBeInTheDocument()
  })

  it('calls onDismiss when the button is clicked', async () => {
    const onDismiss = vi.fn()
    render(<Alert onDismiss={onDismiss}>Note</Alert>)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('merges className rather than replacing it', () => {
    render(
      <Alert className="custom" data-testid="alert">
        Note
      </Alert>,
    )
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('hal-alert')
    expect(alert).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(
      <Alert style={{ marginTop: '4px' }} data-testid="alert">
        Note
      </Alert>,
    )
    expect(screen.getByTestId('alert')).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the element', () => {
    render(
      <Alert data-testid="alert" aria-describedby="hint">
        Note
      </Alert>,
    )
    expect(screen.getByTestId('alert')).toHaveAttribute('aria-describedby', 'hint')
  })

  it('forwards the ref to the div element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Alert ref={ref}>Note</Alert>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveClass('hal-alert')
  })

  it('has no axe violations without a dismiss button', async () => {
    const { container } = render(<Alert title="Saved">Your changes are live.</Alert>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations with a dismiss button', async () => {
    const { container } = render(
      <Alert variant="danger" title="Failed" onDismiss={() => {}}>
        Payment failed.
      </Alert>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
