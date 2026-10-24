import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Button } from '../../components/Button'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { FormLayout } from './FormLayout'

describe('FormLayout', () => {
  it('renders header, sections, and actions', () => {
    render(
      <FormLayout width="sm">
        <FormLayout.Header title="Create project" description="Name it for your team." />
        <FormLayout.Body>
          <FormLayout.Section title="Basics">
            <Field>
              <Field.Label>Name</Field.Label>
              <Input aria-label="Name" />
            </Field>
          </FormLayout.Section>
        </FormLayout.Body>
        <FormLayout.Actions>
          <Button variant="ghost">Cancel</Button>
          <Button>Create</Button>
        </FormLayout.Actions>
      </FormLayout>,
    )
    expect(screen.getByRole('heading', { name: 'Create project' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('applies width class', () => {
    const { container } = render(
      <FormLayout width="lg">
        <FormLayout.Body>content</FormLayout.Body>
      </FormLayout>,
    )
    expect(container.firstElementChild).toHaveClass('hal-form-layout--lg')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Header title="Profile" />
        <FormLayout.Body>
          <Input aria-label="Display name" />
        </FormLayout.Body>
      </FormLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
