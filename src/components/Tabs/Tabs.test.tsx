import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Tabs } from './Tabs'
import type { TabItem } from './Tabs'

const TABS: TabItem[] = [
  { id: 'one', label: 'One', content: 'Panel one' },
  { id: 'two', label: 'Two', content: 'Panel two' },
  { id: 'three', label: 'Three', content: 'Panel three', disabled: true },
]

describe('Tabs', () => {
  it('renders tabs and the selected panel', () => {
    render(<Tabs tabs={TABS} defaultValue="one" />)
    expect(screen.getByRole('tab', { name: 'One' })).toBeInTheDocument()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel one')
  })

  it('defaults to the line variant at medium size', () => {
    const { container } = render(<Tabs tabs={TABS} defaultValue="one" />)
    expect(container.firstChild).toHaveClass('hal-tabs', 'hal-tabs--line', 'hal-tabs--md')
  })

  it.each([['line'], ['enclosed']])('applies the %s variant class', (variant) => {
    const { container } = render(
      <Tabs tabs={TABS} defaultValue="one" variant={variant as 'line'} />,
    )
    expect(container.firstChild).toHaveClass(`hal-tabs--${variant}`)
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    const { container } = render(
      <Tabs tabs={TABS} defaultValue="one" size={size as 'sm'} />,
    )
    expect(container.firstChild).toHaveClass(`hal-tabs--${size}`)
  })

  it('switches panels when a tab is clicked', async () => {
    render(<Tabs tabs={TABS} defaultValue="one" />)
    await userEvent.click(screen.getByRole('tab', { name: 'Two' }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two')
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
  })

  it('does not select a disabled tab', async () => {
    render(<Tabs tabs={TABS} defaultValue="one" />)
    await userEvent.click(screen.getByRole('tab', { name: 'Three' }))
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onValueChange when the selection changes', async () => {
    const onValueChange = vi.fn()
    render(<Tabs tabs={TABS} defaultValue="one" onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Two' }))
    expect(onValueChange).toHaveBeenCalledWith('two')
  })

  it('moves selection with arrow keys and roving tabindex', async () => {
    render(<Tabs tabs={TABS} defaultValue="one" />)
    const first = screen.getByRole('tab', { name: 'One' })
    first.focus()
    await userEvent.keyboard('{ArrowRight}')
    const second = screen.getByRole('tab', { name: 'Two' })
    expect(second).toHaveAttribute('aria-selected', 'true')
    expect(second).toHaveAttribute('tabindex', '0')
    expect(first).toHaveAttribute('tabindex', '-1')
  })

  it('jumps to the first and last enabled tabs with Home and End', async () => {
    render(<Tabs tabs={TABS} defaultValue="two" />)
    screen.getByRole('tab', { name: 'Two' }).focus()
    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
  })

  it('merges className and style on the root', () => {
    const { container } = render(
      <Tabs tabs={TABS} defaultValue="one" className="custom" style={{ marginTop: '4px' }} />,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('hal-tabs', 'custom')
    expect(root).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Tabs ref={ref} tabs={TABS} defaultValue="one" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has no axe violations', async () => {
    const { container } = render(<Tabs tabs={TABS} defaultValue="one" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
