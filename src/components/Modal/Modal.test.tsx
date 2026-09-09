import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Modal } from './Modal'

function backdrop(): HTMLElement {
  const element = document.querySelector<HTMLElement>('.hal-modal-backdrop')
  if (!element) throw new Error('no modal backdrop in the document')
  return element
}

/** A real trigger, so focus has somewhere true to return to. */
function Harness({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Settings">
        Body
      </Modal>
    </>
  )
}

afterEach(() => {
  // The lock restores whatever it found; the suite still starts each test from
  // a known page rather than inheriting the last one's preset.
  document.body.style.overflow = ''
})

describe('Modal', () => {
  it('renders nothing when open is false', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Body')).not.toBeInTheDocument()
  })

  it('renders a modal dialog when open', () => {
    render(
      <Modal open onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveTextContent('Body')
  })

  it('portals to the body so no ancestor can clip it', () => {
    const { container } = render(
      <Modal open onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    expect(container).toBeEmptyDOMElement()
    expect(backdrop().parentElement).toBe(document.body)
  })

  it('is labelled by its title', () => {
    render(
      <Modal open onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    const heading = screen.getByRole('heading', { name: 'Settings' })
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id)
    expect(heading.id).not.toBe('')
  })

  it('takes a caller-supplied aria-label when there is no title', () => {
    render(
      <Modal open onClose={() => {}} aria-label="Quick actions">
        Body
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Quick actions' })).toBeInTheDocument()
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby')
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('moves focus into the panel on open', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  it('restores focus to the trigger on close', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open' })

    await user.click(trigger)
    expect(trigger).not.toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Settings">
        Body
      </Modal>,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on a backdrop click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Settings">
        Body
      </Modal>,
    )
    await user.click(backdrop())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on a panel click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Settings">
        Body
      </Modal>,
    )
    await user.click(screen.getByRole('dialog'))
    await user.click(screen.getByText('Body'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes from the close button, which has an accessible name', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Settings">
        Body
      </Modal>,
    )
    const close = screen.getByRole('button', { name: 'Close' })
    expect(close).toHaveAttribute('type', 'button')
    await user.click(close)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('accepts a custom close label', () => {
    render(
      <Modal open onClose={() => {}} title="Settings" closeLabel="Dismiss settings">
        Body
      </Modal>,
    )
    expect(screen.getByRole('button', { name: 'Dismiss settings' })).toBeInTheDocument()
  })

  it('locks body scroll while open and restores the previous value on close', () => {
    document.body.style.overflow = 'scroll'

    const { rerender } = render(
      <Modal open onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Modal open={false} onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('leaves an already-hidden page hidden after it closes', () => {
    document.body.style.overflow = 'hidden'

    const { rerender } = render(
      <Modal open onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    rerender(
      <Modal open={false} onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('keeps the page locked while a second modal is still open', () => {
    document.body.style.overflow = 'scroll'

    function Two({ first, second }: { first: boolean; second: boolean }) {
      return (
        <>
          <Modal open={first} onClose={() => {}} title="First">
            One
          </Modal>
          <Modal open={second} onClose={() => {}} title="Second">
            Two
          </Modal>
        </>
      )
    }

    const { rerender } = render(<Two first second />)
    expect(document.body.style.overflow).toBe('hidden')

    // The first closes; the second is still up, so the page stays locked.
    rerender(<Two first={false} second />)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Two first={false} second={false} />)
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('defaults to the md size', () => {
    render(
      <Modal open onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveClass('hal-modal', 'hal-modal--md')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(
      <Modal open onClose={() => {}} title="Settings" size={size as 'sm'}>
        Body
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveClass(`hal-modal--${size}`)
  })

  it('merges className after the library classes', () => {
    render(
      <Modal open onClose={() => {}} title="Settings" className="custom">
        Body
      </Modal>,
    )
    expect(screen.getByRole('dialog').getAttribute('class')).toBe(
      'hal-modal hal-modal--md custom',
    )
  })

  it('applies a caller style and spreads the rest onto the panel', () => {
    render(
      <Modal
        open
        onClose={() => {}}
        title="Settings"
        style={{ zIndex: 5 }}
        data-testid="panel"
        id="settings-modal"
      >
        Body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBe(screen.getByTestId('panel'))
    expect(dialog).toHaveStyle({ zIndex: '5' })
    expect(dialog).toHaveAttribute('id', 'settings-modal')
  })

  it('forwards the ref to the panel', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Modal open onClose={() => {}} title="Settings" ref={ref}>
        Body
      </Modal>,
    )
    expect(ref.current).toBe(screen.getByRole('dialog'))
    expect(ref.current).toHaveClass('hal-modal')
  })

  it('has no axe violations while open', async () => {
    render(
      <Modal open onClose={() => {}} title="Settings">
        Body
      </Modal>,
    )
    const container = screen.getByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations when labelled by aria-label', async () => {
    render(
      <Modal open onClose={() => {}} aria-label="Quick actions">
        Body
      </Modal>,
    )
    const container = screen.getByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })
})
