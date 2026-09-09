import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ToastProvider, useToast } from './Toast'
import type { ToastOptions } from './Toast'

function Notifier({ options, label = 'Notify' }: { options: ToastOptions; label?: string }) {
  const { toast } = useToast()
  return (
    <button type="button" onClick={() => toast(options)}>
      {label}
    </button>
  )
}

/** Keeps the id the hook handed back, so dismiss(id) can be exercised. */
function NotifierWithDismiss({ options }: { options: ToastOptions }) {
  const { toast, dismiss } = useToast()
  const id = useRef<string | null>(null)
  return (
    <>
      <button
        type="button"
        onClick={() => {
          id.current = toast(options)
        }}
      >
        Notify
      </button>
      <button type="button" onClick={() => id.current && dismiss(id.current)}>
        Dismiss by id
      </button>
    </>
  )
}

function renderWithProvider(ui: ReactNode, duration?: number | null) {
  return render(<ToastProvider duration={duration}>{ui}</ToastProvider>)
}

const notify = () => screen.getByRole('button', { name: 'Notify' })
const region = () => screen.getByRole('region', { name: 'Notifications' })
const toastFor = (title: string) => screen.getByText(title).closest('.hal-toast') as HTMLElement

describe('useToast', () => {
  it('throws a message naming ToastProvider when used outside one', () => {
    // React logs the error it re-throws; the noise is not the assertion.
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Orphan() {
      useToast()
      return null
    }

    expect(() => render(<Orphan />)).toThrow(/ToastProvider/)
    error.mockRestore()
  })
})

describe('ToastProvider', () => {
  it('mounts an empty polite live region into the body before anything is queued', () => {
    const { container } = renderWithProvider(<Notifier options={{ title: 'Saved' }} />)

    expect(region()).toHaveAttribute('aria-live', 'polite')
    expect(region().parentElement).toBe(document.body)
    expect(container).not.toContainElement(region())
    expect(region()).toBeEmptyDOMElement()
  })

  it('renders a toast with its title and description', async () => {
    renderWithProvider(
      <Notifier options={{ title: 'Draft saved', description: 'Everyone can see it now.' }} />,
    )
    await userEvent.click(notify())

    expect(screen.getByText('Draft saved')).toBeInTheDocument()
    expect(screen.getByText('Everyone can see it now.')).toBeInTheDocument()
    expect(region()).toContainElement(screen.getByText('Draft saved'))
  })

  it('stacks multiple toasts', async () => {
    renderWithProvider(
      <>
        <Notifier options={{ title: 'First' }} />
        <Notifier options={{ title: 'Second' }} label="Notify again" />
      </>,
    )
    await userEvent.click(notify())
    await userEvent.click(screen.getByRole('button', { name: 'Notify again' }))

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(region().querySelectorAll('.hal-toast')).toHaveLength(2)
  })

  it('gives a danger toast role="alert" and leaves the others to the polite region', async () => {
    renderWithProvider(
      <>
        <Notifier options={{ title: 'Heads up', variant: 'info' }} />
        <Notifier options={{ title: 'Upload failed', variant: 'danger' }} label="Fail" />
      </>,
    )
    await userEvent.click(notify())
    await userEvent.click(screen.getByRole('button', { name: 'Fail' }))

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toHaveTextContent('Upload failed')
    expect(toastFor('Heads up')).not.toHaveAttribute('role')
    expect(region()).toContainElement(toastFor('Heads up'))
  })

  it('applies the variant class', async () => {
    renderWithProvider(<Notifier options={{ title: 'Done', variant: 'success' }} />)
    await userEvent.click(notify())

    expect(toastFor('Done')).toHaveClass('hal-toast', 'hal-toast--success')
  })

  it('defaults to the info variant', async () => {
    renderWithProvider(<Notifier options={{ title: 'Note' }} />)
    await userEvent.click(notify())

    expect(toastFor('Note')).toHaveClass('hal-toast--info')
  })

  it('dismisses one toast from its own button and leaves the rest alone', async () => {
    renderWithProvider(
      <>
        <Notifier options={{ title: 'First' }} />
        <Notifier options={{ title: 'Second' }} label="Notify again" />
      </>,
    )
    await userEvent.click(notify())
    await userEvent.click(screen.getByRole('button', { name: 'Notify again' }))

    const dismiss = within(toastFor('First')).getByRole('button', {
      name: 'Dismiss notification',
    })
    await userEvent.click(dismiss)

    expect(screen.queryByText('First')).toBeNull()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('dismisses by the id the hook returned', async () => {
    renderWithProvider(<NotifierWithDismiss options={{ title: 'Saved' }} />)
    await userEvent.click(notify())
    expect(screen.getByText('Saved')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss by id' }))
    expect(screen.queryByText('Saved')).toBeNull()
  })

  it('has no axe violations with toasts present', async () => {
    renderWithProvider(
      <>
        <Notifier options={{ title: 'Saved', description: 'All good.' }} />
        <Notifier options={{ title: 'Upload failed', variant: 'danger' }} label="Fail" />
      </>,
    )
    await userEvent.click(notify())
    await userEvent.click(screen.getByRole('button', { name: 'Fail' }))

    // The region is portalled, so the assertion reaches past the render
    // container. The landmark rule judges a whole page, not a component.
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations()
  })
})

describe('ToastProvider timers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /*
   * React derives onPointerEnter/onPointerLeave from pointerover/pointerout,
   * which is what a browser actually sends; a synthetic "pointerenter" event
   * would reach no React handler at all.
   */
  const pointerEnter = (element: HTMLElement) =>
    fireEvent.pointerOver(element, { relatedTarget: document.body })
  const pointerLeave = (element: HTMLElement) =>
    fireEvent.pointerOut(element, { relatedTarget: document.body })

  it('auto-dismisses after the default duration', () => {
    renderWithProvider(<Notifier options={{ title: 'Saved' }} />)
    fireEvent.click(notify())

    act(() => vi.advanceTimersByTime(4999))
    expect(screen.getByText('Saved')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(2))
    expect(screen.queryByText('Saved')).toBeNull()
  })

  it('honours a per-toast duration', () => {
    renderWithProvider(<Notifier options={{ title: 'Quick', duration: 1000 }} />)
    fireEvent.click(notify())

    act(() => vi.advanceTimersByTime(999))
    expect(screen.getByText('Quick')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(2))
    expect(screen.queryByText('Quick')).toBeNull()
  })

  it('never auto-dismisses when the duration is null', () => {
    renderWithProvider(<Notifier options={{ title: 'Sticky', duration: null }} />)
    fireEvent.click(notify())

    act(() => vi.advanceTimersByTime(600_000))
    expect(screen.getByText('Sticky')).toBeInTheDocument()
  })

  it('never auto-dismisses when the duration is Infinity', () => {
    renderWithProvider(<Notifier options={{ title: 'Sticky', duration: Infinity }} />)
    fireEvent.click(notify())

    act(() => vi.advanceTimersByTime(600_000))
    expect(screen.getByText('Sticky')).toBeInTheDocument()
  })

  it('pauses the timer while the pointer is over the toast and resumes on leave', () => {
    renderWithProvider(<Notifier options={{ title: 'Saved' }} />)
    fireEvent.click(notify())

    act(() => vi.advanceTimersByTime(2000))
    pointerEnter(toastFor('Saved'))

    // Long past the original deadline, and still up: the clock is stopped.
    act(() => vi.advanceTimersByTime(60_000))
    expect(screen.getByText('Saved')).toBeInTheDocument()

    pointerLeave(toastFor('Saved'))

    // Resuming finishes the remaining 3000ms rather than restarting at 5000.
    act(() => vi.advanceTimersByTime(2900))
    expect(screen.getByText('Saved')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(200))
    expect(screen.queryByText('Saved')).toBeNull()
  })

  it('pauses the timer while focus is inside the toast and resumes on blur', () => {
    renderWithProvider(<Notifier options={{ title: 'Saved' }} />)
    fireEvent.click(notify())

    const dismiss = within(toastFor('Saved')).getByRole('button', {
      name: 'Dismiss notification',
    })
    act(() => dismiss.focus())

    act(() => vi.advanceTimersByTime(60_000))
    expect(screen.getByText('Saved')).toBeInTheDocument()

    act(() => dismiss.blur())
    act(() => vi.advanceTimersByTime(5100))
    expect(screen.queryByText('Saved')).toBeNull()
  })

  it('runs each toast on its own clock', () => {
    renderWithProvider(
      <>
        <Notifier options={{ title: 'First', duration: 1000 }} />
        <Notifier options={{ title: 'Second', duration: 4000 }} label="Notify again" />
      </>,
    )
    fireEvent.click(notify())
    fireEvent.click(screen.getByRole('button', { name: 'Notify again' }))

    act(() => vi.advanceTimersByTime(1500))
    expect(screen.queryByText('First')).toBeNull()
    expect(screen.getByText('Second')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(3000))
    expect(screen.queryByText('Second')).toBeNull()
  })

  it('does not restart a sibling timer when another toast arrives', () => {
    renderWithProvider(
      <>
        <Notifier options={{ title: 'First' }} />
        <Notifier options={{ title: 'Second' }} label="Notify again" />
      </>,
    )
    fireEvent.click(notify())

    act(() => vi.advanceTimersByTime(4000))
    fireEvent.click(screen.getByRole('button', { name: 'Notify again' }))

    act(() => vi.advanceTimersByTime(1100))
    expect(screen.queryByText('First')).toBeNull()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
