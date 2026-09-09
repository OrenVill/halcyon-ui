import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders a textarea', () => {
    render(<Textarea aria-label="Notes" />)
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument()
  })

  it('defaults to the medium size', () => {
    render(<Textarea aria-label="Notes" />)
    expect(screen.getByRole('textbox')).toHaveClass('hal-textarea', 'hal-textarea--md')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Textarea aria-label="Notes" size={size as 'sm'} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('hal-textarea')
    expect(textarea).toHaveClass(`hal-textarea--${size}`)
  })

  it('marks the field invalid in both the class and aria-invalid', () => {
    render(<Textarea aria-label="Notes" invalid />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('hal-textarea--invalid')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets neither the invalid class nor aria-invalid by default', () => {
    render(<Textarea aria-label="Notes" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).not.toHaveClass('hal-textarea--invalid')
    expect(textarea).not.toHaveAttribute('aria-invalid')
  })

  it('merges className rather than replacing it', () => {
    render(<Textarea aria-label="Notes" className="custom" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('hal-textarea')
    expect(textarea).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Textarea aria-label="Notes" style={{ marginTop: '4px' }} />)
    expect(screen.getByRole('textbox')).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea aria-label="Notes" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('spreads unknown props onto the element', () => {
    render(<Textarea aria-label="Notes" data-testid="x" aria-describedby="hint" />)
    expect(screen.getByTestId('x')).toHaveAttribute('aria-describedby', 'hint')
  })

  it('does not leak the size prop onto the element', () => {
    render(<Textarea aria-label="Notes" size="lg" />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('size')
  })

  it('updates its value as the user types', async () => {
    render(<Textarea aria-label="Notes" />)
    const textarea = screen.getByRole('textbox')
    await userEvent.type(textarea, 'hello')
    expect(textarea).toHaveValue('hello')
  })

  it('passes the rows attribute through', () => {
    render(<Textarea aria-label="Notes" rows={7} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '7')
  })

  it('does not accept typing when disabled', async () => {
    render(<Textarea aria-label="Notes" disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
    await userEvent.type(textarea, 'hello')
    expect(textarea).toHaveValue('')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Textarea aria-label="Notes" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
