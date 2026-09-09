import { act, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import type { CSSProperties } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Tooltip } from './Tooltip'

/*
 * The open delay is driven with vitest's fake timers and vi.advanceTimersByTime.
 * Interaction goes through fireEvent rather than user-event: user-event's own
 * internal waits deadlock against vitest's fake clock, and the events a hover
 * needs here are exactly the two React already synthesises.
 *
 * jsdom performs no layout, so nothing here asserts a coordinate: every
 * rectangle it reports is zero, and the arithmetic has its own unit tests.
 */

const DELAY = 400

function Basic({ className, style }: { className?: string; style?: CSSProperties } = {}) {
  return (
    <Tooltip content="Copies the current URL" className={className} style={style}>
      <button type="button">Share</button>
    </Tooltip>
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Tooltip', () => {
  it('renders the trigger and no tooltip initially', () => {
    render(<Basic />)
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('opens on pointer enter only after the delay has passed', () => {
    render(<Basic />)

    fireEvent.pointerEnter(screen.getByRole('button'))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(DELAY - 1)
    })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByRole('tooltip')).toHaveTextContent('Copies the current URL')
  })

  it('honours a custom openDelay', () => {
    render(
      <Tooltip content="Hint" openDelay={50}>
        <button type="button">Share</button>
      </Tooltip>,
    )

    fireEvent.pointerEnter(screen.getByRole('button'))
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('opens immediately on focus, with no delay', () => {
    render(<Basic />)
    act(() => {
      screen.getByRole('button').focus()
    })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('hides on blur', () => {
    render(<Basic />)
    const trigger = screen.getByRole('button')

    act(() => {
      trigger.focus()
    })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    act(() => {
      trigger.blur()
    })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('hides on pointer leave with no closing delay', () => {
    render(<Basic />)
    const trigger = screen.getByRole('button')

    fireEvent.pointerEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(DELAY)
    })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.pointerLeave(trigger)
    // No timer advanced: a tooltip that lingers is worse than a slow one.
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('never opens when the pointer leaves before the delay elapses', () => {
    render(<Basic />)
    const trigger = screen.getByRole('button')

    fireEvent.pointerEnter(trigger)
    fireEvent.pointerLeave(trigger)
    act(() => {
      vi.advanceTimersByTime(DELAY * 2)
    })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('hides on Escape', () => {
    render(<Basic />)

    act(() => {
      screen.getByRole('button').focus()
    })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('describes the trigger with the panel id while open, and not before', () => {
    render(<Basic />)
    const trigger = screen.getByRole('button')
    expect(trigger).not.toHaveAttribute('aria-describedby')

    act(() => {
      trigger.focus()
    })
    const panel = screen.getByRole('tooltip')
    expect(panel.id).not.toBe('')
    expect(trigger).toHaveAttribute('aria-describedby', panel.id)
  })

  it("keeps the trigger's own aria-describedby and adds its id to it", () => {
    render(
      <Tooltip content="Hint">
        <button type="button" aria-describedby="hint">
          Share
        </button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button')
    act(() => {
      trigger.focus()
    })
    expect(trigger.getAttribute('aria-describedby')).toContain('hint')
    expect(trigger.getAttribute('aria-describedby')).toContain(screen.getByRole('tooltip').id)
  })

  it("still calls the trigger's own handlers", () => {
    const onFocus = vi.fn()
    render(
      <Tooltip content="Hint">
        <button type="button" onFocus={onFocus}>
          Share
        </button>
      </Tooltip>,
    )
    act(() => {
      screen.getByRole('button').focus()
    })
    expect(onFocus).toHaveBeenCalledOnce()
  })

  it('renders the panel through a portal on the body, not beside the trigger', () => {
    const { container } = render(<Basic />)
    act(() => {
      screen.getByRole('button').focus()
    })
    const panel = screen.getByRole('tooltip')
    expect(container).not.toContainElement(panel)
    expect(panel.parentElement).toBe(document.body)
  })

  it('sets data-side to the side actually used', () => {
    render(<Basic />)
    act(() => {
      screen.getByRole('button').focus()
    })
    expect(screen.getByRole('tooltip').getAttribute('data-side')).toMatch(/^(top|bottom|left|right)$/)
  })

  it('positions itself with fixed coordinates so no ancestor can clip it', () => {
    render(<Basic />)
    act(() => {
      screen.getByRole('button').focus()
    })
    expect(screen.getByRole('tooltip')).toHaveStyle({ position: 'fixed' })
  })

  it('merges className and style rather than replacing them', () => {
    render(<Basic className="custom" style={{ marginTop: '4px' }} />)
    act(() => {
      screen.getByRole('button').focus()
    })
    const panel = screen.getByRole('tooltip')
    expect(panel).toHaveClass('hal-tooltip')
    expect(panel).toHaveClass('custom')
    expect(panel).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the panel', () => {
    render(
      <Tooltip content="Hint" data-testid="panel" lang="en">
        <button type="button">Share</button>
      </Tooltip>,
    )
    act(() => {
      screen.getByRole('button').focus()
    })
    const panel = screen.getByTestId('panel')
    expect(panel).toHaveAttribute('role', 'tooltip')
    expect(panel).toHaveAttribute('lang', 'en')
  })

  it('forwards the ref to the panel element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Tooltip content="Hint" ref={ref}>
        <button type="button">Share</button>
      </Tooltip>,
    )
    expect(ref.current).toBeNull()

    act(() => {
      screen.getByRole('button').focus()
    })
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toBe(screen.getByRole('tooltip'))
  })

  it('has no axe violations while open', async () => {
    // Real timers: axe is asynchronous and would stall behind fake ones.
    vi.useRealTimers()
    const { container } = render(<Basic />)
    act(() => {
      screen.getByRole('button').focus()
    })

    expect(await axe(container)).toHaveNoViolations()
    expect(await axe(screen.getByRole('tooltip'))).toHaveNoViolations()
  })
})
