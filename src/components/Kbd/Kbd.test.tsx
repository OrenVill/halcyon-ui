import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Kbd } from './Kbd'

describe('Kbd', () => {
  it('renders a kbd element', () => {
    render(<Kbd>Ctrl</Kbd>)
    expect(screen.getByText('Ctrl').tagName).toBe('KBD')
  })

  it('applies the hal-kbd class', () => {
    render(<Kbd data-testid="kbd">K</Kbd>)
    expect(screen.getByTestId('kbd')).toHaveClass('hal-kbd')
  })

  it('merges className', () => {
    render(<Kbd className="custom">K</Kbd>)
    expect(screen.getByText('K')).toHaveClass('hal-kbd', 'custom')
  })

  it('forwards the ref', () => {
    const ref = createRef<HTMLElement>()
    render(<Kbd ref={ref}>K</Kbd>)
    expect(ref.current?.tagName).toBe('KBD')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Kbd>Ctrl</Kbd>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
