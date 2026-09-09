import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Select } from './Select'

const options = (
  <>
    <option value="red">Red</option>
    <option value="green">Green</option>
    <option value="blue">Blue</option>
  </>
)

describe('Select', () => {
  it('renders the options it is given', () => {
    render(<Select aria-label="Color">{options}</Select>)
    expect(screen.getByRole('combobox', { name: 'Color' })).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByRole('option', { name: 'Green' })).toBeInTheDocument()
  })

  it('defaults to the medium size', () => {
    render(<Select aria-label="Color">{options}</Select>)
    expect(screen.getByRole('combobox')).toHaveClass('hal-select', 'hal-select--md')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(
      <Select aria-label="Color" size={size as 'sm'}>
        {options}
      </Select>,
    )
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('hal-select')
    expect(select).toHaveClass(`hal-select--${size}`)
  })

  it('marks the field invalid in both the class and aria-invalid', () => {
    render(
      <Select aria-label="Color" invalid>
        {options}
      </Select>,
    )
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('hal-select--invalid')
    expect(select).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets neither the invalid class nor aria-invalid by default', () => {
    render(<Select aria-label="Color">{options}</Select>)
    const select = screen.getByRole('combobox')
    expect(select).not.toHaveClass('hal-select--invalid')
    expect(select).not.toHaveAttribute('aria-invalid')
  })

  it('never leaks the size prop onto the element, which has a native numeric size', () => {
    render(
      <Select aria-label="Color" size="lg">
        {options}
      </Select>,
    )
    const select = screen.getByRole('combobox')
    expect(select).not.toHaveAttribute('size')
    // The native property reports its default (0 when unset), never "lg".
    expect((select as HTMLSelectElement).size).not.toBe('lg')
  })

  it('merges className rather than replacing it', () => {
    render(
      <Select aria-label="Color" className="custom">
        {options}
      </Select>,
    )
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('hal-select')
    expect(select).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(
      <Select aria-label="Color" style={{ marginTop: '4px' }}>
        {options}
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the select element', () => {
    const ref = createRef<HTMLSelectElement>()
    render(
      <Select aria-label="Color" ref={ref}>
        {options}
      </Select>,
    )
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })

  it('spreads unknown props onto the element', () => {
    render(
      <Select aria-label="Color" data-testid="x" aria-describedby="hint" name="color">
        {options}
      </Select>,
    )
    const select = screen.getByTestId('x')
    expect(select).toHaveAttribute('aria-describedby', 'hint')
    expect(select).toHaveAttribute('name', 'color')
  })

  it('changes value when the user selects an option', async () => {
    render(<Select aria-label="Color">{options}</Select>)
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'blue')
    expect(select).toHaveValue('blue')
  })

  it('honors defaultValue when uncontrolled', () => {
    render(
      <Select aria-label="Color" defaultValue="green">
        {options}
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveValue('green')
  })

  it('is disabled when asked', () => {
    render(
      <Select aria-label="Color" disabled>
        {options}
      </Select>,
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Select aria-label="Color">{options}</Select>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
