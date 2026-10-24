import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Field, useFieldControlProps } from './Field'
import { Input } from '../Input/Input'

function WiredInput() {
  const props = useFieldControlProps()
  return <Input {...props} aria-label="Email" />
}

describe('Field', () => {
  it('wires label htmlFor to the control id', () => {
    render(
      <Field>
        <Field.Label>Email</Field.Label>
        <WiredInput />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Email' })
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', input.id)
  })

  it('wires description and error into aria-describedby', () => {
    render(
      <Field invalid>
        <Field.Label>Name</Field.Label>
        <WiredInput />
        <Field.Description>Your public display name.</Field.Description>
        <Field.Error>Required.</Field.Error>
      </Field>,
    )
    const input = screen.getByRole('textbox')
    const describedBy = input.getAttribute('aria-describedby') ?? ''
    expect(describedBy).toContain(`${input.id}-description`)
    expect(describedBy).toContain(`${input.id}-error`)
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('respects a caller-supplied id', () => {
    render(
      <Field id="email-field">
        <Field.Label>Email</Field.Label>
        <Input id="email-field" aria-label="Email" />
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email-field')
  })

  it('merges className on the root', () => {
    render(
      <Field className="custom" data-testid="field">
        <Field.Label>Email</Field.Label>
      </Field>,
    )
    expect(screen.getByTestId('field')).toHaveClass('hal-field', 'custom')
  })

  it('forwards the ref on the root', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Field ref={ref}>
        <Field.Label>Email</Field.Label>
      </Field>,
    )
    expect(ref.current).toHaveClass('hal-field')
  })

  it('has no axe violations when fully wired', async () => {
    const { container } = render(
      <Field>
        <Field.Label>Email</Field.Label>
        <WiredInput />
        <Field.Description>We never share your email.</Field.Description>
      </Field>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
