import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Popover } from './Popover'
import type { PopoverProps } from './Popover'

/*
 * jsdom performs no layout: every rectangle is zero and the viewport is a
 * fixed 1024x768. These tests therefore assert behaviour — open, close, focus,
 * roles, attributes — and never a coordinate. The arithmetic behind the
 * coordinates has its own exhaustive unit tests in internal/position.
 */

type HostProps = Omit<PopoverProps, 'open' | 'onClose' | 'anchorRef' | 'children'> & {
  onClose?: () => void
  panelRef?: Ref<HTMLDivElement>
  children?: ReactNode
}

function Host({ onClose, panelRef, children, ...popoverProps }: HostProps) {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button type="button" ref={anchorRef} onClick={() => setOpen(true)}>
        Open
      </button>
      <button type="button">Outside</button>
      <Popover
        aria-label="Details"
        {...popoverProps}
        ref={panelRef}
        open={open}
        onClose={() => {
          onClose?.()
          setOpen(false)
        }}
        anchorRef={anchorRef}
      >
        {children ?? (
          <button type="button" onClick={() => undefined}>
            Inside
          </button>
        )}
      </Popover>
    </div>
  )
}

async function open() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Open' }))
  return user
}

describe('Popover', () => {
  it('renders nothing while closed', () => {
    render(<Host />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a dialog when open', async () => {
    render(<Host />)
    await open()
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument()
  })

  it('renders the panel through a portal on the body, not beside the anchor', async () => {
    const { container } = render(<Host />)
    await open()
    const panel = screen.getByRole('dialog')
    expect(container).not.toContainElement(panel)
    expect(panel.parentElement).toBe(document.body)
  })

  it('moves focus into the panel when it opens', async () => {
    render(<Host />)
    await open()
    expect(screen.getByRole('button', { name: 'Inside' })).toHaveFocus()
  })

  it('focuses the panel itself when it holds nothing focusable', async () => {
    render(<Host>just text</Host>)
    await open()
    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('restores focus to the trigger on close', async () => {
    const onClose = vi.fn()
    render(<Host onClose={onClose} />)
    const user = await open()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus()
  })

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn()
    render(<Host onClose={onClose} />)
    const user = await open()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose on a click outside', async () => {
    const onClose = vi.fn()
    render(<Host onClose={onClose} />)
    const user = await open()

    await user.click(screen.getByRole('button', { name: 'Outside' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose on a click inside', async () => {
    const onClose = vi.fn()
    render(<Host onClose={onClose} />)
    const user = await open()

    await user.click(screen.getByRole('button', { name: 'Inside' }))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('sets data-side to the side actually used', async () => {
    render(<Host />)
    await open()
    expect(screen.getByRole('dialog').getAttribute('data-side')).toMatch(/^(top|bottom|left|right)$/)
  })

  it('positions itself with fixed coordinates so no ancestor can clip it', async () => {
    render(<Host />)
    await open()
    expect(screen.getByRole('dialog')).toHaveStyle({ position: 'fixed' })
  })

  it('repositions on resize and on scroll while open, and stops on close', async () => {
    render(<Host />)
    const user = await open()

    const panel = screen.getByRole('dialog')
    const measure = vi.spyOn(panel, 'getBoundingClientRect')

    fireEvent.scroll(document, {})
    fireEvent(window, new Event('resize'))
    expect(measure).toHaveBeenCalled()

    await user.keyboard('{Escape}')
    measure.mockClear()
    fireEvent(window, new Event('resize'))
    expect(measure).not.toHaveBeenCalled()
  })

  it('merges className and style rather than replacing them', async () => {
    render(<Host className="custom" style={{ marginTop: '4px' }} />)
    await open()
    const panel = screen.getByRole('dialog')
    expect(panel).toHaveClass('hal-popover')
    expect(panel).toHaveClass('custom')
    expect(panel).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the panel', async () => {
    render(<Host data-testid="panel" lang="en" />)
    await open()
    const panel = screen.getByTestId('panel')
    expect(panel).toHaveAttribute('role', 'dialog')
    expect(panel).toHaveAttribute('lang', 'en')
  })

  it('takes its accessible name from the caller and invents none', async () => {
    render(<Host aria-label="Filter options" />)
    await open()
    expect(screen.getByRole('dialog', { name: 'Filter options' })).toBeInTheDocument()
  })

  it('forwards the ref to the panel element', async () => {
    const ref = createRef<HTMLDivElement>()
    render(<Host panelRef={ref} />)
    expect(ref.current).toBeNull()

    await open()
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toBe(screen.getByRole('dialog'))
  })

  it('has no axe violations while open', async () => {
    const { container } = render(<Host />)
    await open()

    expect(await axe(container)).toHaveNoViolations()
    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations()
  })
})
