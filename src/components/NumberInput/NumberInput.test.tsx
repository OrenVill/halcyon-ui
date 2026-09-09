import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { NumberInput } from './NumberInput'

const field = () => screen.getByRole('spinbutton') as HTMLInputElement
// The steppers are aria-hidden, so they have no accessible name to query by.
// That is the point of them; they are reached here the way a mouse reaches
// them, by position in the control.
const stepper = (direction: 'up' | 'down') =>
  document.querySelector(`.hal-number-input__step--${direction}`) as HTMLButtonElement
const stepUp = () => stepper('up')
const stepDown = () => stepper('down')

describe('NumberInput', () => {
  it('renders a spinbutton', () => {
    render(<NumberInput aria-label="Quantity" defaultValue={3} />)
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeInTheDocument()
    expect(field()).toHaveValue('3')
  })

  it('defaults to the medium size', () => {
    const { container } = render(<NumberInput aria-label="Quantity" />)
    expect(container.firstChild).toHaveClass('hal-number-input', 'hal-number-input--md')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    const { container } = render(<NumberInput aria-label="Quantity" size={size as 'sm'} />)
    expect(container.firstChild).toHaveClass('hal-number-input')
    expect(container.firstChild).toHaveClass(`hal-number-input--${size}`)
  })

  it('exposes the value and bounds to assistive technology', () => {
    render(<NumberInput aria-label="Quantity" min={0} max={10} defaultValue={4} />)
    expect(field()).toHaveAttribute('aria-valuenow', '4')
    expect(field()).toHaveAttribute('aria-valuemin', '0')
    expect(field()).toHaveAttribute('aria-valuemax', '10')
  })

  it('omits aria-valuemin and aria-valuemax when there are no bounds', () => {
    render(<NumberInput aria-label="Quantity" defaultValue={4} />)
    expect(field()).not.toHaveAttribute('aria-valuemin')
    expect(field()).not.toHaveAttribute('aria-valuemax')
  })

  it('steps up with ArrowUp and down with ArrowDown', async () => {
    render(<NumberInput aria-label="Quantity" defaultValue={5} />)
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}')
    expect(field()).toHaveValue('6')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(field()).toHaveValue('4')
  })

  it('steps by the step prop', async () => {
    render(<NumberInput aria-label="Quantity" defaultValue={10} step={5} />)
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}')
    expect(field()).toHaveValue('15')
  })

  it('jumps to min with Home and to max with End', async () => {
    render(<NumberInput aria-label="Quantity" min={2} max={20} defaultValue={7} />)
    await userEvent.click(field())
    await userEvent.keyboard('{Home}')
    expect(field()).toHaveValue('2')
    await userEvent.keyboard('{End}')
    expect(field()).toHaveValue('20')
  })

  it('leaves Home and End to the caret when min and max are undefined', async () => {
    render(<NumberInput aria-label="Quantity" defaultValue={7} />)
    await userEvent.click(field())
    await userEvent.keyboard('{Home}')
    expect(field()).toHaveValue('7')
    await userEvent.keyboard('{End}')
    expect(field()).toHaveValue('7')
  })

  it('clamps at the upper bound', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput aria-label="Quantity" max={5} defaultValue={5} onValueChange={onValueChange} />,
    )
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    expect(field()).toHaveValue('5')
    expect(onValueChange).toHaveBeenLastCalledWith(5)
  })

  it('clamps at the lower bound', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput aria-label="Quantity" min={0} defaultValue={0} onValueChange={onValueChange} />,
    )
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(field()).toHaveValue('0')
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })

  it('clamps typed values once the field is left', async () => {
    render(<NumberInput aria-label="Quantity" min={0} max={10} defaultValue={5} />)
    await userEvent.clear(field())
    await userEvent.type(field(), '42')
    await userEvent.tab()
    expect(field()).toHaveValue('10')
  })

  it('increments and decrements from the stepper buttons', async () => {
    render(<NumberInput aria-label="Quantity" defaultValue={3} />)
    await userEvent.click(stepUp())
    expect(field()).toHaveValue('4')
    await userEvent.click(stepDown())
    await userEvent.click(stepDown())
    expect(field()).toHaveValue('2')
  })

  it('hides the steppers from assistive technology and from the tab order', async () => {
    render(<NumberInput aria-label="Quantity" defaultValue={1} />)
    const buttons = [stepDown(), stepUp()]
    for (const button of buttons) {
      expect(button).toHaveAttribute('aria-hidden', 'true')
      expect(button).toHaveAttribute('tabindex', '-1')
    }
    // One control, one tab stop: the field.
    expect(screen.queryAllByRole('button')).toHaveLength(0)

    await userEvent.tab()
    expect(field()).toHaveFocus()
    await userEvent.tab()
    expect(field()).not.toHaveFocus()
    expect(document.body).toHaveFocus()
  })

  it('lets the parent own the value when controlled', async () => {
    const onValueChange = vi.fn()

    function Controlled() {
      const [value, setValue] = useState(2)
      return (
        <NumberInput
          aria-label="Quantity"
          value={value}
          onValueChange={(next) => {
            onValueChange(next)
            setValue(next)
          }}
        />
      )
    }

    render(<Controlled />)
    expect(field()).toHaveValue('2')
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    expect(field()).toHaveValue('3')
  })

  it('does not move when controlled and the parent refuses the change', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Quantity" value={2} onValueChange={onValueChange} />)
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenCalledWith(3)
    expect(field()).toHaveValue('2')
  })

  it('follows a controlled value changed from outside', () => {
    const { rerender } = render(<NumberInput aria-label="Quantity" value={2} />)
    expect(field()).toHaveValue('2')
    rerender(<NumberInput aria-label="Quantity" value={9} />)
    expect(field()).toHaveValue('9')
    expect(field()).toHaveAttribute('aria-valuenow', '9')
  })

  it('owns the value itself when uncontrolled', async () => {
    render(<NumberInput aria-label="Quantity" defaultValue={1} />)
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    expect(field()).toHaveValue('3')
  })

  it('reports numbers, not strings, to onValueChange', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Quantity" defaultValue={1} onValueChange={onValueChange} />)

    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith(2)

    await userEvent.clear(field())
    await userEvent.type(field(), '7')
    const reported = onValueChange.mock.calls.map(([n]) => n)
    expect(reported.every((n) => typeof n === 'number')).toBe(true)
    expect(onValueChange).toHaveBeenLastCalledWith(7)
  })

  it('keeps floating point out of the displayed value', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput aria-label="Amount" step={0.1} defaultValue={0} onValueChange={onValueChange} />,
    )
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}')
    expect(field()).toHaveValue('0.3')
    expect(onValueChange).toHaveBeenLastCalledWith(0.3)
    await userEvent.keyboard('{ArrowDown}')
    expect(field()).toHaveValue('0.2')
  })

  it('keeps the precision of a value finer than the step', async () => {
    render(<NumberInput aria-label="Amount" step={1} defaultValue={5.25} />)
    await userEvent.click(field())
    await userEvent.keyboard('{ArrowUp}')
    expect(field()).toHaveValue('6.25')
  })

  it('refuses non-numeric text instead of emitting NaN', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Quantity" defaultValue={1} onValueChange={onValueChange} />)
    await userEvent.clear(field())
    await userEvent.type(field(), 'abc')
    expect(field()).toHaveValue('')
    expect(onValueChange).not.toHaveBeenCalledWith(NaN)
    expect(onValueChange.mock.calls.every(([n]) => Number.isFinite(n))).toBe(true)
  })

  it('accepts a decimal typed one keystroke at a time', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Amount" onValueChange={onValueChange} />)
    await userEvent.type(field(), '1.25')
    expect(field()).toHaveValue('1.25')
    expect(onValueChange).toHaveBeenLastCalledWith(1.25)
  })

  it('marks itself invalid', () => {
    const { container } = render(<NumberInput aria-label="Quantity" invalid defaultValue={1} />)
    expect(container.firstChild).toHaveClass('hal-number-input--invalid')
    expect(field()).toHaveAttribute('aria-invalid', 'true')
  })

  it('is not invalid by default', () => {
    const { container } = render(<NumberInput aria-label="Quantity" defaultValue={1} />)
    expect(container.firstChild).not.toHaveClass('hal-number-input--invalid')
    expect(field()).not.toHaveAttribute('aria-invalid')
  })

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<NumberInput aria-label="Quantity" ref={ref} defaultValue={8} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.value).toBe('8')
  })

  it('merges className rather than replacing it', () => {
    const { container } = render(<NumberInput aria-label="Quantity" className="custom" />)
    expect(container.firstChild).toHaveClass('hal-number-input')
    expect(container.firstChild).toHaveClass('hal-number-input--md')
    expect(container.firstChild).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    const { container } = render(
      <NumberInput aria-label="Quantity" style={{ marginTop: '4px' }} />,
    )
    expect(container.firstChild).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the input', () => {
    render(<NumberInput aria-label="Quantity" data-testid="x" aria-describedby="hint" />)
    expect(screen.getByTestId('x')).toHaveAttribute('aria-describedby', 'hint')
    expect(screen.getByTestId('x')).toBe(field())
  })

  it('does nothing when disabled', async () => {
    const onValueChange = vi.fn()
    render(
      <NumberInput aria-label="Quantity" disabled defaultValue={5} onValueChange={onValueChange} />,
    )
    expect(field()).toBeDisabled()
    expect(stepUp()).toBeDisabled()
    expect(stepDown()).toBeDisabled()

    await userEvent.click(stepUp())
    await userEvent.tab()
    expect(field()).not.toHaveFocus()
    expect(field()).toHaveValue('5')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <NumberInput aria-label="Quantity" min={0} max={10} defaultValue={5} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
