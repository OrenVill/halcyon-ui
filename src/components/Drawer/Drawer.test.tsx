import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Drawer } from './Drawer'

function backdrop(): HTMLElement {
  const element = document.querySelector<HTMLElement>('.hal-drawer-backdrop')
  if (!element) throw new Error('no drawer backdrop in the document')
  return element
}

/** A real trigger, so focus has somewhere true to return to. */
function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Filters">
        Body
      </Drawer>
    </>
  )
}

afterEach(() => {
  // The lock restores whatever it found; the suite still starts each test from
  // a known page rather than inheriting the last one's preset.
  document.body.style.overflow = ''
})

describe('Drawer', () => {
  it('renders nothing when open is false', () => {
    render(
      <Drawer open={false} onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Body')).not.toBeInTheDocument()
  })

  it('renders a modal dialog when open', () => {
    render(
      <Drawer open onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveTextContent('Body')
  })

  it('portals to the body so no ancestor can clip it', () => {
    const { container } = render(
      <Drawer open onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    expect(container).toBeEmptyDOMElement()
    expect(backdrop().parentElement).toBe(document.body)
  })

  it('is labelled by its title', () => {
    render(
      <Drawer open onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Filters' })
    const heading = screen.getByRole('heading', { name: 'Filters' })
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id)
    expect(heading.id).not.toBe('')
  })

  it('takes a caller-supplied aria-label when there is no title', () => {
    render(
      <Drawer open onClose={() => {}} aria-label="Navigation">
        Body
      </Drawer>,
    )
    expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeInTheDocument()
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
      <Drawer open onClose={onClose} title="Filters">
        Body
      </Drawer>,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on a backdrop click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Drawer open onClose={onClose} title="Filters">
        Body
      </Drawer>,
    )
    await user.click(backdrop())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on a panel click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Drawer open onClose={onClose} title="Filters">
        Body
      </Drawer>,
    )
    await user.click(screen.getByRole('dialog'))
    await user.click(screen.getByText('Body'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes from the close button, which has an accessible name', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Drawer open onClose={onClose} title="Filters">
        Body
      </Drawer>,
    )
    const close = screen.getByRole('button', { name: 'Close' })
    expect(close).toHaveAttribute('type', 'button')
    await user.click(close)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('accepts a custom close label', () => {
    render(
      <Drawer open onClose={() => {}} title="Filters" closeLabel="Dismiss filters">
        Body
      </Drawer>,
    )
    expect(screen.getByRole('button', { name: 'Dismiss filters' })).toBeInTheDocument()
  })

  it('locks body scroll while open and restores the previous value on close', () => {
    document.body.style.overflow = 'scroll'

    const { rerender } = render(
      <Drawer open onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Drawer open={false} onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('leaves an already-hidden page hidden after it closes', () => {
    document.body.style.overflow = 'hidden'

    const { rerender } = render(
      <Drawer open onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    rerender(
      <Drawer open={false} onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('keeps the page locked while a second drawer is still open', () => {
    document.body.style.overflow = 'scroll'

    function Two({ first, second }: { first: boolean; second: boolean }) {
      return (
        <>
          <Drawer open={first} onClose={() => {}} title="First">
            One
          </Drawer>
          <Drawer open={second} onClose={() => {}} title="Second" side="left">
            Two
          </Drawer>
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

  it('defaults to the right side at the md size', () => {
    render(
      <Drawer open onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    expect(screen.getByRole('dialog')).toHaveClass(
      'hal-drawer',
      'hal-drawer--right',
      'hal-drawer--md',
    )
  })

  it.each([['left'], ['right'], ['top'], ['bottom']])(
    'applies the %s side class to the panel and the backdrop',
    (side) => {
      render(
        <Drawer open onClose={() => {}} title="Filters" side={side as 'left'}>
          Body
        </Drawer>,
      )
      expect(screen.getByRole('dialog')).toHaveClass(`hal-drawer--${side}`)
      expect(backdrop()).toHaveClass(`hal-drawer-backdrop--${side}`)
    },
  )

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(
      <Drawer open onClose={() => {}} title="Filters" size={size as 'sm'}>
        Body
      </Drawer>,
    )
    expect(screen.getByRole('dialog')).toHaveClass(`hal-drawer--${size}`)
  })

  it('merges className after the library classes', () => {
    render(
      <Drawer open onClose={() => {}} title="Filters" side="top" size="lg" className="custom">
        Body
      </Drawer>,
    )
    expect(screen.getByRole('dialog').getAttribute('class')).toBe(
      'hal-drawer hal-drawer--top hal-drawer--lg custom',
    )
  })

  it('applies a caller style and spreads the rest onto the panel', () => {
    render(
      <Drawer
        open
        onClose={() => {}}
        title="Filters"
        style={{ zIndex: 5 }}
        data-testid="panel"
        id="filters-drawer"
      >
        Body
      </Drawer>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBe(screen.getByTestId('panel'))
    expect(dialog).toHaveStyle({ zIndex: '5' })
    expect(dialog).toHaveAttribute('id', 'filters-drawer')
  })

  it('forwards the ref to the panel', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Drawer open onClose={() => {}} title="Filters" ref={ref}>
        Body
      </Drawer>,
    )
    expect(ref.current).toBe(screen.getByRole('dialog'))
    expect(ref.current).toHaveClass('hal-drawer')
  })

  it('has no axe violations while open', async () => {
    render(
      <Drawer open onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )
    const container = screen.getByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations when labelled by aria-label', async () => {
    render(
      <Drawer open onClose={() => {}} aria-label="Navigation">
        Body
      </Drawer>,
    )
    const container = screen.getByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })
})
