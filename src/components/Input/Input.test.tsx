import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Input } from './Input'

describe('Input', () => {
  it('renders a native input', () => {
    render(<Input aria-label="Email" />)
    expect(screen.getByRole('textbox', { name: 'Email' }).tagName).toBe('INPUT')
  })

  it('defaults to the medium size', () => {
    render(<Input aria-label="Email" />)
    expect(screen.getByRole('textbox')).toHaveClass('hal-input', 'hal-input--md')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Input aria-label="Email" size={size as 'sm'} />)
    expect(screen.getByRole('textbox')).toHaveClass(`hal-input--${size}`)
  })

  it('never leaks the size prop onto the DOM node', () => {
    // The native `size` attribute is a number. Forwarding "md" would be
    // invalid HTML and would resize the field.
    render(<Input aria-label="Email" size="md" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('size')
  })

  it.each([['sm'], ['md'], ['lg']])(
    'leaves the DOM free of a size attribute at %s',
    (size) => {
      render(<Input aria-label="Email" size={size as 'sm'} />)
      expect(screen.getByRole('textbox')).not.toHaveAttribute('size')
    },
  )

  it('marks the field invalid in both class and ARIA when asked', () => {
    render(<Input aria-label="Email" invalid />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('hal-input--invalid')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets neither the invalid class nor aria-invalid by default', () => {
    render(<Input aria-label="Email" />)
    const input = screen.getByRole('textbox')
    expect(input).not.toHaveClass('hal-input--invalid')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('drops both when invalid goes back to false', () => {
    const { rerender } = render(<Input aria-label="Email" invalid />)
    rerender(<Input aria-label="Email" invalid={false} />)
    const input = screen.getByRole('textbox')
    expect(input).not.toHaveClass('hal-input--invalid')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('merges className rather than replacing it', () => {
    render(<Input aria-label="Email" className="custom" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('hal-input')
    expect(input).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Input aria-label="Email" style={{ marginTop: '4px' }} />)
    expect(screen.getByRole('textbox')).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input aria-label="Email" ref={ref} defaultValue="hello" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.value).toBe('hello')
  })

  it('spreads unknown props onto the element', () => {
    render(
      <Input
        aria-label="Email"
        data-testid="x"
        aria-describedby="hint"
        placeholder="you@example.com"
        name="email"
      />,
    )
    const input = screen.getByTestId('x')
    expect(input).toHaveAttribute('aria-describedby', 'hint')
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
    expect(input).toHaveAttribute('name', 'email')
  })

  it('updates its value as the user types', async () => {
    const onChange = vi.fn()
    render(<Input aria-label="Email" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'halcyon')
    expect(input).toHaveValue('halcyon')
    expect(onChange).toHaveBeenCalled()
  })

  it('does not accept typing when disabled', async () => {
    render(<Input aria-label="Email" disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    await userEvent.type(input, 'halcyon')
    expect(input).toHaveValue('')
  })

  it('has no axe violations when labelled', async () => {
    const { container } = render(
      <label>
        Email
        <Input />
      </label>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
