import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders a native checkbox', () => {
    render(<Checkbox aria-label="Subscribe" />)
    const input = screen.getByRole('checkbox', { name: 'Subscribe' })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'checkbox')
  })

  it('defaults to the medium size', () => {
    render(<Checkbox aria-label="Subscribe" />)
    expect(screen.getByRole('checkbox')).toHaveClass('hal-checkbox', 'hal-checkbox--md')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Checkbox aria-label="Subscribe" size={size as 'sm'} />)
    expect(screen.getByRole('checkbox')).toHaveClass(
      'hal-checkbox',
      `hal-checkbox--${size}`,
    )
  })

  it('checks and unchecks on click', async () => {
    render(<Checkbox aria-label="Subscribe" />)
    const input = screen.getByRole('checkbox')
    expect(input).not.toBeChecked()
    await userEvent.click(input)
    expect(input).toBeChecked()
    await userEvent.click(input)
    expect(input).not.toBeChecked()
  })

  it('honours defaultChecked when uncontrolled', async () => {
    render(<Checkbox aria-label="Subscribe" defaultChecked />)
    const input = screen.getByRole('checkbox')
    expect(input).toBeChecked()
    await userEvent.click(input)
    expect(input).not.toBeChecked()
  })

  it('stays controlled by the checked prop', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <Checkbox aria-label="Subscribe" checked={false} onChange={onChange} />,
    )
    const input = screen.getByRole('checkbox')
    await userEvent.click(input)
    expect(onChange).toHaveBeenCalledOnce()
    // The parent never moved the prop, so neither did the checkbox.
    expect(input).not.toBeChecked()
    rerender(<Checkbox aria-label="Subscribe" checked onChange={onChange} />)
    expect(input).toBeChecked()
  })

  it('drives the checked state from a parent', async () => {
    function Controlled() {
      const [checked, setChecked] = useState(false)
      return (
        <Checkbox
          aria-label="Subscribe"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
      )
    }
    render(<Controlled />)
    const input = screen.getByRole('checkbox')
    await userEvent.click(input)
    expect(input).toBeChecked()
  })

  it('sets the indeterminate DOM property and clears it again', () => {
    const { rerender } = render(<Checkbox aria-label="Subscribe" indeterminate />)
    const input = screen.getByRole('checkbox') as HTMLInputElement
    expect(input.indeterminate).toBe(true)
    rerender(<Checkbox aria-label="Subscribe" indeterminate={false} />)
    expect(input.indeterminate).toBe(false)
  })

  it('is not indeterminate by default', () => {
    render(<Checkbox aria-label="Subscribe" />)
    expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(false)
  })

  it('forwards the ref to the input even though it keeps one of its own', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Checkbox aria-label="Subscribe" ref={ref} indeterminate />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toBe(screen.getByRole('checkbox'))
    // Both refs point at the same node: the internal one still did its job.
    expect(ref.current?.indeterminate).toBe(true)
  })

  it('supports a callback ref', () => {
    const seen: (HTMLInputElement | null)[] = []
    render(<Checkbox aria-label="Subscribe" ref={(node) => void seen.push(node)} />)
    expect(seen[0]).toBe(screen.getByRole('checkbox'))
  })

  it('never renders a size attribute on the input', () => {
    render(<Checkbox aria-label="Subscribe" size="lg" />)
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('size')
  })

  it('merges className rather than replacing it', () => {
    render(<Checkbox aria-label="Subscribe" className="custom" />)
    const input = screen.getByRole('checkbox')
    expect(input).toHaveClass('hal-checkbox')
    expect(input).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Checkbox aria-label="Subscribe" style={{ marginTop: '4px' }} />)
    expect(screen.getByRole('checkbox')).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the element', () => {
    render(<Checkbox aria-label="Subscribe" data-testid="x" name="subscribe" />)
    const input = screen.getByTestId('x')
    expect(input).toHaveAttribute('name', 'subscribe')
  })

  it('does not change when disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox aria-label="Subscribe" disabled onChange={onChange} />)
    const input = screen.getByRole('checkbox')
    expect(input).toBeDisabled()
    await userEvent.click(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(input).not.toBeChecked()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Checkbox aria-label="Subscribe" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
