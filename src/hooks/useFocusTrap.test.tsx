import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { useFocusTrap } from './useFocusTrap'

function Trap({ active, empty = false }: { active: boolean; empty?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, active)
  return (
    <div ref={ref} data-testid="trap">
      {empty ? (
        <p>nothing focusable here</p>
      ) : (
        <>
          <button type="button">first</button>
          <button type="button">middle</button>
          <button type="button">last</button>
        </>
      )}
    </div>
  )
}

function Host({ empty = false }: { empty?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        open
      </button>
      {open ? <Trap active empty={empty} /> : null}
      <button type="button" onClick={() => setOpen(false)}>
        close
      </button>
    </>
  )
}

describe('useFocusTrap', () => {
  it('moves focus into the container on activation', () => {
    render(<Trap active />)
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus()
  })

  it('does nothing while inactive', () => {
    render(<Trap active={false} />)
    expect(screen.getByRole('button', { name: 'first' })).not.toHaveFocus()
  })

  it('wraps Tab from the last element back to the first', async () => {
    render(<Trap active />)
    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus()
  })

  it('wraps Shift+Tab from the first element to the last', async () => {
    render(<Trap active />)
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus()
  })

  it('focuses the container itself when nothing inside is focusable', () => {
    render(<Trap active empty />)
    expect(screen.getByTestId('trap')).toHaveFocus()
  })

  it('restores focus to whatever had it before', async () => {
    render(<Host />)
    const open = screen.getByRole('button', { name: 'open' })
    await userEvent.click(open)
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus()

    await userEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(open).toHaveFocus()
  })

  it('does not throw when the previously focused element is gone', async () => {
    function Vanishing() {
      const [phase, setPhase] = useState<'idle' | 'trapped' | 'done'>('idle')
      return (
        <>
          {phase === 'idle' ? (
            <button type="button" onClick={() => setPhase('trapped')}>
              vanishing
            </button>
          ) : null}
          {phase === 'trapped' ? <Trap active /> : null}
          <button type="button" onClick={() => setPhase('done')}>
            finish
          </button>
        </>
      )
    }
    render(<Vanishing />)
    await userEvent.click(screen.getByRole('button', { name: 'vanishing' }))
    await expect(
      userEvent.click(screen.getByRole('button', { name: 'finish' })),
    ).resolves.not.toThrow()
  })
})
