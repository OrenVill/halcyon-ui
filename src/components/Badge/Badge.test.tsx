import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Beta</Badge>)
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('defaults to the neutral variant at medium size', () => {
    render(<Badge>Beta</Badge>)
    expect(screen.getByText('Beta')).toHaveClass(
      'hal-badge',
      'hal-badge--neutral',
      'hal-badge--md',
    )
  })

  it.each([
    ['neutral'],
    ['accent'],
    ['success'],
    ['warning'],
    ['danger'],
    ['info'],
  ])('applies the %s variant class', (variant) => {
    render(<Badge variant={variant as 'neutral'}>Beta</Badge>)
    expect(screen.getByText('Beta')).toHaveClass(`hal-badge--${variant}`)
  })

  it.each([['sm'], ['md']])('applies the %s size class', (size) => {
    render(<Badge size={size as 'sm'}>Beta</Badge>)
    expect(screen.getByText('Beta')).toHaveClass(`hal-badge--${size}`)
  })

  it('merges className rather than replacing it', () => {
    render(<Badge className="custom">Beta</Badge>)
    const badge = screen.getByText('Beta')
    expect(badge).toHaveClass('hal-badge')
    expect(badge).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Badge style={{ marginTop: '4px' }}>Beta</Badge>)
    expect(screen.getByText('Beta')).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the span element', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Badge ref={ref}>Beta</Badge>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current?.textContent).toBe('Beta')
  })

  it('spreads unknown props onto the element', () => {
    render(
      <Badge data-testid="x" aria-describedby="hint" title="release stage">
        Beta
      </Badge>,
    )
    const badge = screen.getByTestId('x')
    expect(badge).toHaveAttribute('aria-describedby', 'hint')
    expect(badge).toHaveAttribute('title', 'release stage')
  })

  it('is a label, not a control: no role, tabindex, or button semantics', () => {
    render(<Badge>Beta</Badge>)
    const badge = screen.getByText('Beta')
    expect(badge.tagName).toBe('SPAN')
    expect(badge).not.toHaveAttribute('role')
    expect(badge).not.toHaveAttribute('tabindex')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Badge variant="success">Beta</Badge>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
