import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Meter } from './Meter'

function fillOf(container: HTMLElement): HTMLElement {
  const fill = container.querySelector<HTMLElement>('.hal-meter__fill')
  if (!fill) throw new Error('no fill element rendered')
  return fill
}

describe('Meter', () => {
  it('exposes the meter role', () => {
    render(<Meter value={40} aria-label="Storage" />)
    expect(screen.getByRole('meter')).toBeInTheDocument()
  })

  it('sets aria values and fill width', () => {
    const { container } = render(<Meter value={40} aria-label="Storage" />)
    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-valuenow', '40')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '100')
    expect(fillOf(container)).toHaveStyle({ width: '40%' })
  })

  it('supports custom min and max', () => {
    const { container } = render(<Meter value={30} min={0} max={60} aria-label="Score" />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuemax', '60')
    expect(fillOf(container)).toHaveStyle({ width: '50%' })
  })

  it('clamps out-of-range values', () => {
    const { container } = render(<Meter value={150} aria-label="Storage" />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100')
    expect(fillOf(container)).toHaveStyle({ width: '100%' })
  })

  it('defaults to accent at medium size', () => {
    render(<Meter value={10} aria-label="Storage" />)
    expect(screen.getByRole('meter')).toHaveClass('hal-meter', 'hal-meter--accent', 'hal-meter--md')
  })

  it('forwards the ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Meter ref={ref} value={10} aria-label="Storage" />)
    expect(ref.current).toHaveClass('hal-meter')
  })

  it('has no axe violations when labelled', async () => {
    const { container } = render(<Meter value={40} aria-label="Storage used" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
