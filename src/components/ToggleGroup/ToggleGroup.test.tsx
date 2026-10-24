import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ToggleGroup } from './ToggleGroup'

const options = [
  { value: 'bold', label: 'Bold' },
  { value: 'italic', label: 'Italic' },
  { value: 'underline', label: 'Underline' },
]

describe('ToggleGroup', () => {
  describe('single', () => {
    it('exposes a radiogroup', () => {
      render(<ToggleGroup options={options} aria-label="Style" />)
      expect(screen.getByRole('radiogroup', { name: 'Style' })).toBeInTheDocument()
    })

    it('selects one option at a time when uncontrolled', async () => {
      render(<ToggleGroup options={options} aria-label="Style" defaultValue="bold" />)
      await userEvent.click(screen.getByRole('radio', { name: 'Italic' }))
      expect(screen.getByRole('radio', { name: 'Italic' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('radio', { name: 'Bold' })).toHaveAttribute('aria-checked', 'false')
    })

    it('calls onValueChange in single mode', async () => {
      const onValueChange = vi.fn()
      render(
        <ToggleGroup options={options} aria-label="Style" onValueChange={onValueChange} />,
      )
      await userEvent.click(screen.getByRole('radio', { name: 'Underline' }))
      expect(onValueChange).toHaveBeenCalledWith('underline')
    })
  })

  describe('multiple', () => {
    it('exposes a group with aria-pressed buttons', () => {
      render(<ToggleGroup type="multiple" options={options} aria-label="Style" />)
      expect(screen.getByRole('group', { name: 'Style' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'false')
    })

    it('toggles membership when uncontrolled', async () => {
      render(
        <ToggleGroup type="multiple" options={options} aria-label="Style" defaultValue={['bold']} />,
      )
      const bold = screen.getByRole('button', { name: 'Bold' })
      const italic = screen.getByRole('button', { name: 'Italic' })
      expect(bold).toHaveAttribute('aria-pressed', 'true')
      await userEvent.click(italic)
      expect(italic).toHaveAttribute('aria-pressed', 'true')
      await userEvent.click(bold)
      expect(bold).toHaveAttribute('aria-pressed', 'false')
    })

    it('calls onValueChange with the next array in multiple mode', async () => {
      const onValueChange = vi.fn()
      render(
        <ToggleGroup
          type="multiple"
          options={options}
          aria-label="Style"
          onValueChange={onValueChange}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: 'Bold' }))
      expect(onValueChange).toHaveBeenCalledWith(['bold'])
    })
  })

  it('forwards the ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ToggleGroup ref={ref} options={options} aria-label="Style" />)
    expect(ref.current).toHaveClass('hal-toggle-group')
  })

  it('has no axe violations when labelled', async () => {
    const { container } = render(<ToggleGroup options={options} aria-label="Style" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
