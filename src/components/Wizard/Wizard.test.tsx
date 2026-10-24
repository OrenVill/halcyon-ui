import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Wizard } from './Wizard'
import type { WizardStep } from './Wizard'

const STEPS: WizardStep[] = [
  { id: 'one', label: 'Step one', content: 'First panel' },
  { id: 'two', label: 'Step two', content: 'Second panel' },
  { id: 'three', label: 'Step three', content: 'Third panel' },
]

describe('Wizard', () => {
  it('renders only the active step content', () => {
    render(<Wizard steps={STEPS} defaultActiveStep={1} />)
    expect(screen.getByText('Second panel')).toBeInTheDocument()
    expect(screen.queryByText('First panel')).toBeNull()
    expect(screen.queryByText('Third panel')).toBeNull()
  })

  it('advances with the render-prop next control', async () => {
    render(
      <Wizard steps={STEPS}>
        {(api) => (
          <button type="button" onClick={() => api.next()}>
            Continue
          </button>
        )}
      </Wizard>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText('Second panel')).toBeInTheDocument()
  })

  it('awaits validateStep before advancing', async () => {
    const validateStep = vi.fn(async (index: number) => index === 0)
    render(
      <Wizard steps={STEPS} validateStep={validateStep}>
        {(api) => (
          <button type="button" onClick={() => api.next()}>
            Continue
          </button>
        )}
      </Wizard>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByText('Second panel')).toBeInTheDocument())
    expect(validateStep).toHaveBeenCalledWith(0)

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText('Second panel')).toBeInTheDocument()
  })

  it('exposes imperative next and back on the ref', async () => {
    const ref = createRef<{ next: () => Promise<void>; back: () => void }>()
    render(<Wizard ref={ref} steps={STEPS} />)
    await ref.current?.next()
    await waitFor(() => expect(screen.getByText('Second panel')).toBeInTheDocument())
    ref.current?.back()
    await waitFor(() => expect(screen.getByText('First panel')).toBeInTheDocument())
  })

  it('uses hal-wizard classes for the step indicator', () => {
    const { container } = render(<Wizard steps={STEPS} />)
    expect(container.querySelector('.hal-wizard__list')).toBeInTheDocument()
    expect(container.querySelector('.hal-stepper__list')).toBeNull()
  })

  it('defaults to plain medium horizontal styling', () => {
    const { container } = render(<Wizard steps={STEPS} />)
    expect(container.firstChild).toHaveClass(
      'hal-wizard',
      'hal-wizard--plain',
      'hal-wizard--md',
      'hal-wizard--horizontal',
    )
  })

  it('merges className and style on the root', () => {
    const { container } = render(
      <Wizard steps={STEPS} className="custom" style={{ marginTop: '4px' }} />,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('hal-wizard', 'custom')
    expect(root).toHaveStyle({ marginTop: '4px' })
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Wizard steps={STEPS}>
        {(api) => (
          <>
            <button type="button" onClick={() => api.back()}>Back</button>
            <button type="button" onClick={() => api.next()}>Next</button>
          </>
        )}
      </Wizard>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
