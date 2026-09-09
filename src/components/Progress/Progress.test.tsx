import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Progress } from './Progress'

function fillOf(container: HTMLElement): HTMLElement {
  const fill = container.querySelector<HTMLElement>('.hal-progress__fill')
  if (!fill) throw new Error('no fill element rendered')
  return fill
}

describe('Progress', () => {
  it('exposes the progressbar role', () => {
    render(<Progress value={40} aria-label="Upload" />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('defaults to the accent variant at medium size', () => {
    render(<Progress value={40} aria-label="Upload" />)
    expect(screen.getByRole('progressbar')).toHaveClass(
      'hal-progress',
      'hal-progress--accent',
      'hal-progress--md',
    )
  })

  it('sets aria-valuenow and the fill width when a value is given', () => {
    const { container } = render(<Progress value={40} aria-label="Upload" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(fillOf(container)).toHaveStyle({ width: '40%' })
  })

  it('omits aria-valuenow entirely when indeterminate', () => {
    render(<Progress aria-label="Loading" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).not.toHaveAttribute('aria-valuenow')
    expect(bar).toHaveClass('hal-progress--indeterminate')
  })

  it('is not marked indeterminate once a value arrives', () => {
    const { rerender } = render(<Progress aria-label="Loading" />)
    expect(screen.getByRole('progressbar')).toHaveClass('hal-progress--indeterminate')
    rerender(<Progress value={0} aria-label="Loading" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).not.toHaveClass('hal-progress--indeterminate')
    expect(bar).toHaveAttribute('aria-valuenow', '0')
  })

  it('clamps a value below zero', () => {
    const { container } = render(<Progress value={-25} aria-label="Upload" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(fillOf(container)).toHaveStyle({ width: '0%' })
  })

  it('clamps a value above max', () => {
    const { container } = render(<Progress value={180} aria-label="Upload" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    expect(fillOf(container)).toHaveStyle({ width: '100%' })
  })

  it('computes the ratio against a custom max', () => {
    const { container } = render(<Progress value={30} max={60} aria-label="Upload" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '30')
    expect(bar).toHaveAttribute('aria-valuemax', '60')
    expect(fillOf(container)).toHaveStyle({ width: '50%' })
  })

  it('clamps against a custom max as well', () => {
    const { container } = render(<Progress value={90} max={60} aria-label="Upload" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60')
    expect(fillOf(container)).toHaveStyle({ width: '100%' })
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Progress value={10} size={size as 'sm'} aria-label="Upload" />)
    expect(screen.getByRole('progressbar')).toHaveClass(`hal-progress--${size}`)
  })

  it.each([['accent'], ['success'], ['danger']])('applies the %s variant class', (variant) => {
    render(<Progress value={10} variant={variant as 'accent'} aria-label="Upload" />)
    expect(screen.getByRole('progressbar')).toHaveClass(`hal-progress--${variant}`)
  })

  it('merges className rather than replacing it', () => {
    render(<Progress value={10} className="custom" aria-label="Upload" />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveClass('hal-progress')
    expect(bar).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Progress value={10} style={{ marginTop: '4px' }} aria-label="Upload" />)
    expect(screen.getByRole('progressbar')).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the element', () => {
    render(<Progress value={10} data-testid="x" aria-describedby="hint" aria-label="Upload" />)
    expect(screen.getByTestId('x')).toHaveAttribute('aria-describedby', 'hint')
  })

  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Progress value={10} ref={ref} aria-label="Upload" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveClass('hal-progress')
  })

  it('has no axe violations when labelled', async () => {
    const { container } = render(<Progress value={40} aria-label="Upload progress" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations when indeterminate and labelled', async () => {
    const { container } = render(<Progress aria-label="Loading" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
