import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { DatePicker } from './DatePicker'

describe('DatePicker', () => {
  it('shows placeholder when empty', () => {
    render(<DatePicker aria-label="Due date" />)
    expect(screen.getByRole('button', { name: /due date/i })).toHaveTextContent('Pick a date…')
  })

  it('applies size and invalid classes', () => {
    const { container } = render(
      <DatePicker size="sm" invalid aria-label="Due date" />,
    )
    expect(container.firstElementChild).toHaveClass(
      'hal-date-picker',
      'hal-date-picker--sm',
      'hal-date-picker--invalid',
    )
  })

  it('opens a calendar and selects a day', async () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker
        defaultValue={new Date(2024, 5, 1)}
        onValueChange={onValueChange}
        aria-label="Due date"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /due date/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    const day = screen.getAllByRole('gridcell').find((cell) => cell.textContent === '15')
    expect(day).toBeTruthy()
    await userEvent.click(day!)
    expect(onValueChange).toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('changes month with PageDown in the grid', async () => {
    render(<DatePicker defaultValue={new Date(2024, 5, 10)} aria-label="Due date" />)
    await userEvent.click(screen.getByRole('button', { name: /due date/i }))
    const titleBefore = screen.getByText(/june 2024/i)
    expect(titleBefore).toBeInTheDocument()
    await userEvent.keyboard('{PageDown}')
    expect(screen.getByText(/july 2024/i)).toBeInTheDocument()
  })

  it('selects a range', async () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker
        mode="range"
        defaultValue={new Date(2024, 5, 1)}
        onValueChange={onValueChange}
        aria-label="Trip"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /trip/i }))
    await userEvent.click(screen.getByRole('gridcell', { name: '10' }))
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }))
    expect(onValueChange).toHaveBeenCalled()
    const value = onValueChange.mock.calls.at(-1)?.[0]
    expect(value).toMatchObject({
      start: expect.any(Date),
      end: expect.any(Date),
    })
  })

  it('renders hidden input when name is set', () => {
    const { container } = render(
      <DatePicker
        name="due"
        defaultValue={new Date(2024, 0, 5)}
        aria-label="Due date"
      />,
    )
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('2024-01-05')
  })

  it('forwards ref to the trigger', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<DatePicker ref={ref} aria-label="Due date" />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('has no axe violations when open', async () => {
    const { container } = render(
      <DatePicker defaultValue={new Date(2024, 5, 1)} aria-label="Due date" />,
    )
    await userEvent.click(screen.getByRole('button', { name: /due date/i }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
