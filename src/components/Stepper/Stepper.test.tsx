import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Stepper } from './Stepper'

const STEPS = [
  { id: 'one', label: 'Account', description: 'Sign in' },
  { id: 'two', label: 'Profile' },
  { id: 'three', label: 'Review' },
]

describe('Stepper', () => {
  it('renders every step label', () => {
    render(<Stepper steps={STEPS} activeStep={1} />)
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('is aria-hidden because it is decorative', () => {
    const { container } = render(<Stepper steps={STEPS} activeStep={0} />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('defaults to horizontal plain at medium size', () => {
    const { container } = render(<Stepper steps={STEPS} activeStep={0} />)
    expect(container.firstChild).toHaveClass(
      'hal-stepper',
      'hal-stepper--plain',
      'hal-stepper--md',
      'hal-stepper--horizontal',
    )
  })

  it('supports vertical orientation', () => {
    const { container } = render(<Stepper steps={STEPS} activeStep={0} orientation="vertical" />)
    expect(container.firstChild).toHaveClass('hal-stepper--vertical')
  })

  it('merges className and style on the root', () => {
    const { container } = render(
      <Stepper steps={STEPS} activeStep={0} className="custom" style={{ marginTop: '4px' }} />,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('hal-stepper', 'custom')
    expect(root).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Stepper ref={ref} steps={STEPS} activeStep={0} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has no axe violations when used decoratively', async () => {
    const { container } = render(<Stepper steps={STEPS} activeStep={1} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
