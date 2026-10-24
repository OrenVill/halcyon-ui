import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Combobox } from './Combobox'
import type { ComboboxOption } from './Combobox'

const OPTIONS: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date fruit' },
]

describe('Combobox', () => {
  it('applies base, size and invalid classes', () => {
    const { container } = render(
      <Combobox options={OPTIONS} size="lg" invalid aria-label="Fruit" />,
    )
    expect(container.firstElementChild).toHaveClass(
      'hal-combobox',
      'hal-combobox--lg',
      'hal-combobox--invalid',
    )
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('filters options by input', async () => {
    render(<Combobox options={OPTIONS} aria-label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.type(input, 'ban')
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
  })

  it('selects on click and closes in single mode', async () => {
    const onValueChange = vi.fn()
    render(<Combobox options={OPTIONS} onValueChange={onValueChange} aria-label="Fruit" />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Apple' }))
    expect(onValueChange).toHaveBeenCalledWith('apple')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByRole('combobox')).toHaveValue('Apple')
  })

  it('supports multi-select with chips', async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox options={OPTIONS} multi onValueChange={onValueChange} aria-label="Fruit" />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Apple' }))
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana'])
    expect(document.querySelector('.hal-combobox__chip-label')).toHaveTextContent('Apple')
    await userEvent.click(screen.getByRole('button', { name: 'Remove Apple' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['banana'])
  })

  it('navigates with arrow keys', async () => {
    render(<Combobox options={OPTIONS} aria-label="Fruit" />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant')
    await userEvent.keyboard('{Enter}')
    expect(input).toHaveValue('Banana')
  })

  it('renders hidden input when name is set', async () => {
    const { container } = render(
      <Combobox options={OPTIONS} name="fruit" defaultValue="apple" aria-label="Fruit" />,
    )
    expect(container.querySelector('input[type="hidden"]')).toHaveAttribute('name', 'fruit')
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('apple')
  })

  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(
      <Combobox options={OPTIONS} className="custom" ref={ref} aria-label="Fruit" />,
    )
    expect(container.firstElementChild).toHaveClass('custom')
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('has no axe violations when open', async () => {
    const { container } = render(<Combobox options={OPTIONS} aria-label="Fruit" />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('apple')
      return (
        <Combobox
          options={OPTIONS}
          value={value}
          onValueChange={(v) => setValue(v as string)}
          aria-label="Fruit"
        />
      )
    }
    render(<Controlled />)
    expect(screen.getByRole('combobox')).toHaveValue('Apple')
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }))
    expect(screen.getByRole('combobox')).toHaveValue('Banana')
  })
})
