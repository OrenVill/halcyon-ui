import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { IconButton } from './IconButton'

// A minimal stand-in for whatever icon a consumer passes.
const Icon = () => <svg aria-hidden="true" focusable="false" />

afterEach(() => {
  vi.restoreAllMocks()
})

describe('IconButton', () => {
  it('renders its icon child', () => {
    render(
      <IconButton aria-label="Close">
        <Icon />
      </IconButton>,
    )
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('defaults to the solid variant at medium size', () => {
    render(<IconButton aria-label="Close" />)
    expect(screen.getByRole('button')).toHaveClass(
      'hal-icon-button',
      'hal-icon-button--solid',
      'hal-icon-button--md',
    )
  })

  it.each([['solid'], ['soft'], ['outline'], ['ghost'], ['danger']])(
    'applies the %s variant class',
    (variant) => {
      render(<IconButton aria-label="Close" variant={variant as 'solid'} />)
      expect(screen.getByRole('button')).toHaveClass(`hal-icon-button--${variant}`)
    },
  )

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<IconButton aria-label="Close" size={size as 'sm'} />)
    expect(screen.getByRole('button')).toHaveClass(`hal-icon-button--${size}`)
  })

  it('defaults type to button so it never submits a form unasked', () => {
    render(<IconButton aria-label="Close" />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('lets the caller override type', () => {
    render(<IconButton aria-label="Close" type="submit" />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('merges className rather than replacing it', () => {
    render(<IconButton aria-label="Close" className="custom" />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hal-icon-button')
    expect(button).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<IconButton aria-label="Close" style={{ marginTop: '4px' }} />)
    expect(screen.getByRole('button')).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<IconButton aria-label="Close" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current).toHaveAttribute('aria-label', 'Close')
  })

  it('spreads unknown props onto the element', () => {
    render(<IconButton aria-label="Close" data-testid="x" aria-describedby="hint" />)
    const button = screen.getByTestId('x')
    expect(button).toHaveAttribute('aria-describedby', 'hint')
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<IconButton aria-label="Close" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<IconButton aria-label="Close" disabled onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('warns in development when it has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<IconButton />)
    expect(warn).toHaveBeenCalledOnce()
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/accessible name/i)
  })

  it('does not warn when aria-label is given', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<IconButton aria-label="Close" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn when aria-labelledby is given', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <>
        <span id="close-label">Close</span>
        <IconButton aria-labelledby="close-label" />
      </>,
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not throw when unnamed', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => render(<IconButton />)).not.toThrow()
  })

  it('has no axe violations when given an accessible name', async () => {
    const { container } = render(
      <IconButton aria-label="Close">
        <Icon />
      </IconButton>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
