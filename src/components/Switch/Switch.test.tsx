import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Switch } from './Switch'

describe('Switch', () => {
  it('renders a checkbox that announces as a switch', () => {
    render(<Switch aria-label="Wi-Fi" />)
    const input = screen.getByRole('switch', { name: 'Wi-Fi' })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'checkbox')
  })

  it('lets the caller override the role', () => {
    render(<Switch aria-label="Wi-Fi" role="checkbox" />)
    expect(screen.getByRole('checkbox', { name: 'Wi-Fi' })).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('defaults to the medium size', () => {
    render(<Switch aria-label="Wi-Fi" />)
    expect(screen.getByRole('switch')).toHaveClass('hal-switch', 'hal-switch--md')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Switch aria-label="Wi-Fi" size={size as 'sm'} />)
    expect(screen.getByRole('switch')).toHaveClass('hal-switch', `hal-switch--${size}`)
  })

  it('toggles on click', async () => {
    render(<Switch aria-label="Wi-Fi" />)
    const input = screen.getByRole('switch')
    await userEvent.click(input)
    expect(input).toBeChecked()
    await userEvent.click(input)
    expect(input).not.toBeChecked()
  })

  it('toggles on Space, which the native checkbox gives for free', async () => {
    render(<Switch aria-label="Wi-Fi" />)
    const input = screen.getByRole('switch')
    await userEvent.tab()
    expect(input).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(input).toBeChecked()
    await userEvent.keyboard(' ')
    expect(input).not.toBeChecked()
  })

  it('honours defaultChecked when uncontrolled', async () => {
    render(<Switch aria-label="Wi-Fi" defaultChecked />)
    const input = screen.getByRole('switch')
    expect(input).toBeChecked()
    await userEvent.click(input)
    expect(input).not.toBeChecked()
  })

  it('stays controlled by the checked prop', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <Switch aria-label="Wi-Fi" checked={false} onChange={onChange} />,
    )
    const input = screen.getByRole('switch')
    await userEvent.click(input)
    expect(onChange).toHaveBeenCalledOnce()
    expect(input).not.toBeChecked()
    rerender(<Switch aria-label="Wi-Fi" checked onChange={onChange} />)
    expect(input).toBeChecked()
  })

  it('drives the checked state from a parent', async () => {
    function Controlled() {
      const [on, setOn] = useState(false)
      return (
        <Switch
          aria-label="Wi-Fi"
          checked={on}
          onChange={(event) => setOn(event.target.checked)}
        />
      )
    }
    render(<Controlled />)
    const input = screen.getByRole('switch')
    await userEvent.click(input)
    expect(input).toBeChecked()
  })

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Switch aria-label="Wi-Fi" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toBe(screen.getByRole('switch'))
  })

  it('never renders a size attribute on the input', () => {
    render(<Switch aria-label="Wi-Fi" size="lg" />)
    expect(screen.getByRole('switch')).not.toHaveAttribute('size')
  })

  it('merges className rather than replacing it', () => {
    render(<Switch aria-label="Wi-Fi" className="custom" />)
    const input = screen.getByRole('switch')
    expect(input).toHaveClass('hal-switch')
    expect(input).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Switch aria-label="Wi-Fi" style={{ marginTop: '4px' }} />)
    expect(screen.getByRole('switch')).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the element', () => {
    render(<Switch aria-label="Wi-Fi" data-testid="x" name="wifi" />)
    expect(screen.getByTestId('x')).toHaveAttribute('name', 'wifi')
  })

  it('does not change when disabled', async () => {
    const onChange = vi.fn()
    render(<Switch aria-label="Wi-Fi" disabled onChange={onChange} />)
    const input = screen.getByRole('switch')
    expect(input).toBeDisabled()
    await userEvent.click(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(input).not.toBeChecked()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Switch aria-label="Wi-Fi" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
