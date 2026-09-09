import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Select } from './Select'
import type { SelectOption } from './Select'

const OPTIONS: SelectOption[] = [
  { value: 'ascending', label: 'Ascending' },
  { value: 'modified', label: 'By modified date' },
  { value: 'archived', label: 'Archived', disabled: true },
  { value: 'custom', label: 'Custom order' },
]

function open() {
  return userEvent.click(screen.getByRole('combobox'))
}

describe('Select', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(<Select options={OPTIONS} aria-label="Sort" />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Select…')
  })

  it('shows the selected label, not the raw value', () => {
    render(<Select options={OPTIONS} defaultValue="modified" aria-label="Sort" />)
    expect(screen.getByRole('combobox')).toHaveTextContent('By modified date')
  })

  it('applies the base, size and invalid classes to the root', () => {
    const { container } = render(<Select options={OPTIONS} size="lg" invalid aria-label="Sort" />)
    const root = container.firstElementChild
    expect(root).toHaveClass('hal-select', 'hal-select--lg', 'hal-select--invalid')
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when valid', () => {
    render(<Select options={OPTIONS} aria-label="Sort" />)
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid')
  })

  it('keeps the list closed until asked', () => {
    render(<Select options={OPTIONS} aria-label="Sort" />)
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens on click and lists every option', async () => {
    render(<Select options={OPTIONS} aria-label="Sort" />)
    await open()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(4)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
  })

  it('selects on click and closes', async () => {
    const onValueChange = vi.fn()
    render(<Select options={OPTIONS} onValueChange={onValueChange} aria-label="Sort" />)
    await open()
    await userEvent.click(screen.getByRole('option', { name: 'Custom order' }))

    expect(onValueChange).toHaveBeenCalledWith('custom')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByRole('combobox')).toHaveTextContent('Custom order')
  })

  it('marks the selected option with aria-selected', async () => {
    render(<Select options={OPTIONS} defaultValue="ascending" aria-label="Sort" />)
    await open()
    expect(screen.getByRole('option', { name: 'Ascending' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('option', { name: 'Custom order' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('opens with ArrowDown from the closed state', async () => {
    render(<Select options={OPTIONS} aria-label="Sort" />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('moves the active option with the arrow keys and selects with Enter', async () => {
    const onValueChange = vi.fn()
    render(<Select options={OPTIONS} onValueChange={onValueChange} aria-label="Sort" />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('modified')
  })

  it('skips disabled options when arrowing', async () => {
    const onValueChange = vi.fn()
    render(<Select options={OPTIONS} onValueChange={onValueChange} aria-label="Sort" />)
    await userEvent.tab()
    // ascending -> modified -> (archived is disabled) -> custom
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('custom')
  })

  it('does not select a disabled option on click', async () => {
    const onValueChange = vi.fn()
    render(<Select options={OPTIONS} onValueChange={onValueChange} aria-label="Sort" />)
    await open()
    await userEvent.click(screen.getByRole('option', { name: 'Archived' }))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('Home and End jump to the first and last enabled options', async () => {
    const onValueChange = vi.fn()
    render(<Select options={OPTIONS} onValueChange={onValueChange} aria-label="Sort" />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{End}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('custom')

    await userEvent.keyboard('{ArrowDown}{Home}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('ascending')
  })

  it('tracks the active option with aria-activedescendant', async () => {
    render(<Select options={OPTIONS} aria-label="Sort" />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')

    const combobox = screen.getByRole('combobox')
    const first = combobox.getAttribute('aria-activedescendant')
    expect(first).toBeTruthy()

    await userEvent.keyboard('{ArrowDown}')
    expect(combobox.getAttribute('aria-activedescendant')).not.toBe(first)
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<Select options={OPTIONS} aria-label="Sort" />)
    await open()
    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByRole('combobox')).toHaveFocus()
  })

  it('closes when a pointer goes down outside it', async () => {
    render(
      <>
        <Select options={OPTIONS} aria-label="Sort" />
        <button type="button">elsewhere</button>
      </>,
    )
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'elsewhere' }))
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('jumps by type-ahead while open', async () => {
    const onValueChange = vi.fn()
    render(<Select options={OPTIONS} onValueChange={onValueChange} aria-label="Sort" />)
    await open()
    await userEvent.keyboard('cu{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('custom')
  })

  it('works uncontrolled', async () => {
    render(<Select options={OPTIONS} defaultValue="ascending" aria-label="Sort" />)
    await open()
    await userEvent.click(screen.getByRole('option', { name: 'Custom order' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('Custom order')
  })

  it('respects a controlled value that the parent refuses to change', async () => {
    render(<Select options={OPTIONS} value="ascending" aria-label="Sort" />)
    await open()
    await userEvent.click(screen.getByRole('option', { name: 'Custom order' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('Ascending')
  })

  it('follows a controlled value the parent does change', async () => {
    function Host() {
      const [value, setValue] = useState('ascending')
      return <Select options={OPTIONS} value={value} onValueChange={setValue} aria-label="Sort" />
    }
    render(<Host />)
    await open()
    await userEvent.click(screen.getByRole('option', { name: 'Custom order' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('Custom order')
  })

  it('participates in form submission through a hidden input', () => {
    const { container } = render(
      <Select options={OPTIONS} name="sort" defaultValue="modified" aria-label="Sort" />,
    )
    const hidden = container.querySelector('input[type="hidden"]')
    expect(hidden).toHaveAttribute('name', 'sort')
    expect(hidden).toHaveValue('modified')
  })

  it('renders no hidden input without a name', () => {
    const { container } = render(<Select options={OPTIONS} aria-label="Sort" />)
    expect(container.querySelector('input[type="hidden"]')).toBeNull()
  })

  it('does not open when disabled', async () => {
    render(<Select options={OPTIONS} disabled aria-label="Sort" />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('merges className rather than replacing it', () => {
    const { container } = render(<Select options={OPTIONS} className="custom" aria-label="Sort" />)
    expect(container.firstElementChild).toHaveClass('hal-select', 'custom')
  })

  it('merges style on the trigger', () => {
    render(<Select options={OPTIONS} style={{ marginTop: '4px' }} aria-label="Sort" />)
    expect(screen.getByRole('combobox')).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the trigger button', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Select options={OPTIONS} ref={ref} aria-label="Sort" />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('spreads unknown props onto the trigger', () => {
    render(<Select options={OPTIONS} data-testid="sort" aria-label="Sort" />)
    expect(screen.getByTestId('sort')).toHaveAttribute('role', 'combobox')
  })

  it('has no axe violations when closed', async () => {
    const { container } = render(<Select options={OPTIONS} aria-label="Sort" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations when open', async () => {
    const { container } = render(<Select options={OPTIONS} aria-label="Sort" />)
    await open()
    expect(await axe(container)).toHaveNoViolations()
  })
})
