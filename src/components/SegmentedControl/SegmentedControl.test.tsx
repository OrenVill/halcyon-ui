import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { SegmentedControl } from './SegmentedControl'

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

describe('SegmentedControl', () => {
  it('exposes a radiogroup', () => {
    render(<SegmentedControl options={options} aria-label="Range" />)
    expect(screen.getByRole('radiogroup', { name: 'Range' })).toBeInTheDocument()
  })

  it('defaults to the first option when uncontrolled', () => {
    render(<SegmentedControl options={options} aria-label="Range" />)
    expect(screen.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onValueChange when an option is selected', async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl options={options} aria-label="Range" onValueChange={onValueChange} />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Week' }))
    expect(onValueChange).toHaveBeenCalledWith('week')
  })

  it('respects a controlled value', async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        options={options}
        aria-label="Range"
        value="month"
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'Day' }))
    expect(onValueChange).toHaveBeenCalledWith('day')
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute('aria-checked', 'true')
  })

  it('forwards the ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<SegmentedControl ref={ref} options={options} aria-label="Range" />)
    expect(ref.current).toHaveClass('hal-segmented-control')
  })

  it('has no axe violations when labelled', async () => {
    const { container } = render(<SegmentedControl options={options} aria-label="Range" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
