import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { OnboardingLayout } from './OnboardingLayout'

const STEPS = [
  { id: 'team', label: 'Team' },
  { id: 'project', label: 'Project' },
  { id: 'done', label: 'Done' },
]

describe('OnboardingLayout', () => {
  it('shows current step', () => {
    render(
      <OnboardingLayout brand="Acme" steps={STEPS} currentStepId="project" title="Create project">
        Fields
      </OnboardingLayout>,
    )
    expect(screen.getByRole('heading', { name: 'Create project' })).toBeInTheDocument()
    expect(screen.getByText('Project')).toHaveAttribute('aria-current', 'step')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <OnboardingLayout brand="Acme" steps={STEPS} currentStepId="team">
        Body
      </OnboardingLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
