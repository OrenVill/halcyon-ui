import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Separator } from './Separator'

describe('Separator', () => {
  it('exposes the separator role by default', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('defaults to horizontal orientation', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
    expect(screen.getByRole('separator')).toHaveClass('hal-separator--horizontal')
  })

  it('supports vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="sep" />)
    const sep = screen.getByRole('separator')
    expect(sep).toHaveAttribute('aria-orientation', 'vertical')
    expect(sep).toHaveClass('hal-separator--vertical')
  })

  it('is decorative when asked', () => {
    render(<Separator decorative data-testid="sep" />)
    const sep = screen.getByTestId('sep')
    expect(sep).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('merges className', () => {
    render(<Separator className="custom" data-testid="sep" />)
    expect(screen.getByTestId('sep')).toHaveClass('hal-separator', 'custom')
  })

  it('forwards the ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Separator ref={ref} />)
    expect(ref.current).toHaveClass('hal-separator')
  })

  it('has no axe violations when semantic', async () => {
    const { container } = render(<Separator aria-orientation="horizontal" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
