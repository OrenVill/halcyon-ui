import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Slider } from './Slider'

/*
 * jsdom ships no UI behaviour for <input type="range">: arrow keys move
 * nothing, because nothing in jsdom plays the part of the user agent. Slider
 * deliberately leaves that behaviour to the platform rather than
 * reimplementing it, so the platform is what has to be stood in for here.
 * This listener is the stand-in: it drives the element through its own native
 * stepUp/stepDown/min/max API, exactly as a browser would, and then lets the
 * events propagate so React's onChange and the controlled-value path are
 * genuinely exercised.
 */
function userAgentRangeKeys(event: KeyboardEvent) {
  const el = event.target
  if (!(el instanceof HTMLInputElement) || el.type !== 'range' || el.disabled) return

  try {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        el.stepUp()
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        el.stepDown()
        break
      case 'Home':
        el.value = el.min || '0'
        break
      case 'End':
        el.value = el.max || '100'
        break
      default:
        return
    }
  } catch {
    // Already at a bound: the browser would do nothing here either.
    return
  }

  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('Slider', () => {
  beforeAll(() => document.addEventListener('keydown', userAgentRangeKeys))
  afterAll(() => document.removeEventListener('keydown', userAgentRangeKeys))

  it('renders a native range input with the slider role', () => {
    render(<Slider aria-label="Volume" />)
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('type', 'range')
  })

  it('defaults to the medium size', () => {
    render(<Slider aria-label="Volume" />)
    expect(screen.getByRole('slider')).toHaveClass('hal-slider', 'hal-slider--md')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Slider aria-label="Volume" size={size as 'sm'} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass('hal-slider')
    expect(slider).toHaveClass(`hal-slider--${size}`)
  })

  it('passes min, max and step through to the input', () => {
    render(<Slider aria-label="Volume" min={10} max={90} step={5} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '10')
    expect(slider).toHaveAttribute('max', '90')
    expect(slider).toHaveAttribute('step', '5')
  })

  it('never puts the size prop on the DOM node', () => {
    render(<Slider aria-label="Volume" size="lg" />)
    expect(screen.getByRole('slider')).not.toHaveAttribute('size')
  })

  it('increases the value with ArrowRight and decreases it with ArrowLeft', async () => {
    render(<Slider aria-label="Volume" min={0} max={10} step={1} defaultValue={5} />)
    const slider = screen.getByRole('slider') as HTMLInputElement

    await userEvent.tab()
    expect(slider).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    expect(slider.value).toBe('6')

    await userEvent.keyboard('{ArrowLeft}')
    expect(slider.value).toBe('5')
  })

  it('respects step when arrowing', async () => {
    render(<Slider aria-label="Volume" min={0} max={100} step={10} defaultValue={20} />)
    const slider = screen.getByRole('slider') as HTMLInputElement
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(slider.value).toBe('30')
  })

  it('works as a controlled input', async () => {
    const onChange = vi.fn()

    function Controlled() {
      const [value, setValue] = useState(4)
      return (
        <Slider
          aria-label="Volume"
          min={0}
          max={10}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setValue(Number(event.target.value))
          }}
        />
      )
    }

    render(<Controlled />)
    const slider = screen.getByRole('slider') as HTMLInputElement
    expect(slider.value).toBe('4')

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(onChange).toHaveBeenCalledWith('5')
    expect(slider.value).toBe('5')
  })

  it('holds the value when controlled and the parent ignores the change', async () => {
    render(<Slider aria-label="Volume" min={0} max={10} value={4} onChange={() => {}} />)
    const slider = screen.getByRole('slider') as HTMLInputElement
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(slider.value).toBe('4')
  })

  it('forwards the ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Slider aria-label="Volume" ref={ref} defaultValue={3} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.type).toBe('range')
    expect(ref.current?.value).toBe('3')
  })

  it('merges className rather than replacing it', () => {
    render(<Slider aria-label="Volume" className="custom" />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveClass('hal-slider')
    expect(slider).toHaveClass('hal-slider--md')
    expect(slider).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Slider aria-label="Volume" style={{ marginTop: '4px' }} />)
    expect(screen.getByRole('slider')).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the element', () => {
    render(<Slider aria-label="Volume" data-testid="x" aria-describedby="hint" />)
    expect(screen.getByTestId('x')).toHaveAttribute('aria-describedby', 'hint')
  })

  it('does not change when disabled', async () => {
    render(<Slider aria-label="Volume" disabled min={0} max={10} defaultValue={5} />)
    const slider = screen.getByRole('slider') as HTMLInputElement
    expect(slider).toBeDisabled()

    await userEvent.tab()
    expect(slider).not.toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    expect(slider.value).toBe('5')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Slider aria-label="Volume" min={0} max={10} defaultValue={5} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
