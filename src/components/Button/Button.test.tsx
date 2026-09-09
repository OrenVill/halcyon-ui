import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('defaults to the solid variant at medium size', () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hal-button', 'hal-button--solid', 'hal-button--md')
  })

  it.each([
    ['solid'],
    ['soft'],
    ['outline'],
    ['ghost'],
    ['danger'],
  ])('applies the %s variant class', (variant) => {
    render(<Button variant={variant as 'solid'}>Save</Button>)
    expect(screen.getByRole('button')).toHaveClass(`hal-button--${variant}`)
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Button size={size as 'sm'}>Save</Button>)
    expect(screen.getByRole('button')).toHaveClass(`hal-button--${size}`)
  })

  it('defaults type to button so it never submits a form unasked', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('lets the caller override type', () => {
    render(<Button type="submit">Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('merges className rather than replacing it', () => {
    render(<Button className="custom">Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hal-button')
    expect(button).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Button style={{ marginTop: '4px' }}>Save</Button>)
    expect(screen.getByRole('button')).toHaveStyle({ marginTop: '4px' })
  })

  it('applies the full-width class only when asked', () => {
    const { rerender } = render(<Button>Save</Button>)
    expect(screen.getByRole('button')).not.toHaveClass('hal-button--full')
    rerender(<Button fullWidth>Save</Button>)
    expect(screen.getByRole('button')).toHaveClass('hal-button--full')
  })

  it('forwards the ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Save</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toBe('Save')
  })

  it('spreads unknown props onto the element', () => {
    render(<Button data-testid="x" aria-describedby="hint">Save</Button>)
    const button = screen.getByTestId('x')
    expect(button).toHaveAttribute('aria-describedby', 'hint')
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Button>Save</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
