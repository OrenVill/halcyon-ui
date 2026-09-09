import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Card } from './Card'

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Panel body</Card>)
    expect(screen.getByText('Panel body')).toBeInTheDocument()
  })

  it('defaults to the outline variant with medium padding', () => {
    render(<Card data-testid="card">Panel body</Card>)
    expect(screen.getByTestId('card')).toHaveClass(
      'hal-card',
      'hal-card--outline',
      'hal-card--md',
    )
  })

  it.each([['outline'], ['raised'], ['subtle']])(
    'applies the %s variant class',
    (variant) => {
      render(
        <Card data-testid="card" variant={variant as 'outline'}>
          Panel body
        </Card>,
      )
      expect(screen.getByTestId('card')).toHaveClass(`hal-card--${variant}`)
    },
  )

  it.each([['none'], ['sm'], ['md'], ['lg']])('applies the %s padding class', (padding) => {
    render(
      <Card data-testid="card" padding={padding as 'md'}>
        Panel body
      </Card>,
    )
    expect(screen.getByTestId('card')).toHaveClass(`hal-card--${padding}`)
  })

  it('merges className rather than replacing it', () => {
    render(
      <Card data-testid="card" className="custom">
        Panel body
      </Card>,
    )
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('hal-card')
    expect(card).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(
      <Card data-testid="card" style={{ marginTop: '4px' }}>
        Panel body
      </Card>,
    )
    expect(screen.getByTestId('card')).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the div element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Card ref={ref}>Panel body</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.textContent).toBe('Panel body')
  })

  it('spreads unknown props onto the element', () => {
    render(
      <Card data-testid="x" aria-describedby="hint" role="group">
        Panel body
      </Card>,
    )
    const card = screen.getByTestId('x')
    expect(card).toHaveAttribute('aria-describedby', 'hint')
    expect(card).toHaveAttribute('role', 'group')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Card>Panel body</Card>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
