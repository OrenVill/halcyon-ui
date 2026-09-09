import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useDismissable } from './useDismissable'
import type { DismissableOptions } from './useDismissable'

function Host(options: DismissableOptions) {
  const ref = useRef<HTMLDivElement>(null)
  useDismissable(ref, options)
  return (
    <>
      <div ref={ref} data-testid="panel">
        <button type="button">inside</button>
      </div>
      <button type="button">outside</button>
    </>
  )
}

describe('useDismissable', () => {
  it('dismisses on Escape', async () => {
    const onDismiss = vi.fn()
    render(<Host onDismiss={onDismiss} />)
    await userEvent.keyboard('{Escape}')
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('dismisses on a pointer down outside', async () => {
    const onDismiss = vi.fn()
    render(<Host onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'outside' }))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('does not dismiss on a pointer down inside', async () => {
    const onDismiss = vi.fn()
    render(<Host onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'inside' }))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does nothing while inactive', async () => {
    const onDismiss = vi.fn()
    render(<Host onDismiss={onDismiss} active={false} />)
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'outside' }))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('can disable Escape alone', async () => {
    const onDismiss = vi.fn()
    render(<Host onDismiss={onDismiss} closeOnEscape={false} />)
    await userEvent.keyboard('{Escape}')
    expect(onDismiss).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'outside' }))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('can disable outside dismissal alone', async () => {
    const onDismiss = vi.fn()
    render(<Host onDismiss={onDismiss} closeOnOutside={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'outside' }))
    expect(onDismiss).not.toHaveBeenCalled()
    await userEvent.keyboard('{Escape}')
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('removes its listeners on unmount', async () => {
    const onDismiss = vi.fn()
    const { unmount } = render(<Host onDismiss={onDismiss} />)
    unmount()
    await userEvent.keyboard('{Escape}')
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
