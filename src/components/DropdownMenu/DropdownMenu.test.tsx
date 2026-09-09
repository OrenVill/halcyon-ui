import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { DropdownMenu } from './DropdownMenu'
import type { DropdownMenuItem } from './DropdownMenu'

function makeItems(): DropdownMenuItem[] {
  return [
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'move', label: 'Move to…' },
    { id: 'archive', label: 'Archive', disabled: true },
    { id: 'delete', label: 'Delete' },
  ]
}

function renderMenu(items: DropdownMenuItem[] = makeItems()) {
  return render(<DropdownMenu trigger="Actions" items={items} />)
}

const trigger = () => screen.getByRole('button', { name: 'Actions' })
const item = (name: string) => screen.getByRole('menuitem', { name })

describe('DropdownMenu', () => {
  it('renders the trigger', () => {
    renderMenu()
    expect(trigger()).toBeInTheDocument()
  })

  it('keeps the menu out of the document until it is opened', () => {
    renderMenu()
    expect(screen.queryByRole('menu')).toBeNull()
    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens on click and lists every item', async () => {
    renderMenu()
    await userEvent.click(trigger())

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(4)
    expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    expect(trigger()).toHaveAttribute('aria-controls', screen.getByRole('menu').id)
  })

  it('opens on ArrowDown from the trigger', async () => {
    renderMenu()
    await userEvent.tab()
    expect(trigger()).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('portals the menu to the document body', async () => {
    const { container } = renderMenu()
    await userEvent.click(trigger())

    const menu = screen.getByRole('menu')
    expect(container).not.toContainElement(menu)
    expect(menu.parentElement).toBe(document.body)
  })

  it('gives the first item real DOM focus when the menu opens', async () => {
    renderMenu()
    await userEvent.click(trigger())

    expect(item('Duplicate')).toHaveFocus()
    // Roving focus, not aria-activedescendant: the menu points at nothing,
    // because the focused item is the active element itself.
    expect(screen.getByRole('menu')).not.toHaveAttribute('aria-activedescendant')
  })

  it('focuses the last item when opened with ArrowUp', async () => {
    renderMenu()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowUp}')

    expect(item('Delete')).toHaveFocus()
  })

  it('moves focus down with ArrowDown and wraps at the end', async () => {
    renderMenu()
    await userEvent.click(trigger())

    await userEvent.keyboard('{ArrowDown}')
    expect(item('Move to…')).toHaveFocus()
    // Archive is disabled, so the next stop is Delete.
    await userEvent.keyboard('{ArrowDown}')
    expect(item('Delete')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(item('Duplicate')).toHaveFocus()
  })

  it('moves focus up with ArrowUp and wraps at the start', async () => {
    renderMenu()
    await userEvent.click(trigger())

    await userEvent.keyboard('{ArrowUp}')
    expect(item('Delete')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    expect(item('Move to…')).toHaveFocus()
  })

  it('jumps to the first and last enabled items with Home and End', async () => {
    renderMenu()
    await userEvent.click(trigger())

    await userEvent.keyboard('{End}')
    expect(item('Delete')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    expect(item('Duplicate')).toHaveFocus()
  })

  it('moves focus to a matching label with type-ahead', async () => {
    renderMenu()
    await userEvent.click(trigger())

    // Two keys in quick succession match on the pair, not on the last key:
    // "d" alone would stop at Duplicate.
    await userEvent.keyboard('de')
    expect(item('Delete')).toHaveFocus()
  })

  it('moves focus on a single type-ahead key', async () => {
    renderMenu()
    await userEvent.click(trigger())

    await userEvent.keyboard('m')
    expect(item('Move to…')).toHaveFocus()
  })

  it('never lands on a disabled item while typing ahead', async () => {
    renderMenu()
    await userEvent.click(trigger())

    await userEvent.keyboard('ar')
    expect(item('Archive')).not.toHaveFocus()
    expect(item('Duplicate')).toHaveFocus()
  })

  it('does not activate a disabled item on click, and stays open', async () => {
    const onSelect = vi.fn()
    renderMenu([
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'archive', label: 'Archive', disabled: true, onSelect },
    ])
    await userEvent.click(trigger())
    await userEvent.click(item('Archive'))

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('marks disabled items with aria-disabled rather than removing them', async () => {
    renderMenu()
    await userEvent.click(trigger())

    expect(item('Archive')).toHaveAttribute('aria-disabled', 'true')
    expect(item('Duplicate')).not.toHaveAttribute('aria-disabled')
  })

  it('activates the focused item with Enter, then closes and restores focus', async () => {
    const onSelect = vi.fn()
    const items = makeItems()
    items[1] = { ...items[1]!, onSelect }
    renderMenu(items)

    await userEvent.click(trigger())
    await userEvent.keyboard('{ArrowDown}{Enter}')

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
    expect(trigger()).toHaveFocus()
  })

  it('activates the focused item with Space', async () => {
    const onSelect = vi.fn()
    const items = makeItems()
    items[0] = { ...items[0]!, onSelect }
    renderMenu(items)

    await userEvent.click(trigger())
    await userEvent.keyboard('[Space]')

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('activates an item on click and closes', async () => {
    const onSelect = vi.fn()
    const items = makeItems()
    items[3] = { ...items[3]!, onSelect }
    renderMenu(items)

    await userEvent.click(trigger())
    await userEvent.click(item('Delete'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    renderMenu()
    await userEvent.click(trigger())
    expect(item('Duplicate')).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(trigger()).toHaveFocus()
  })

  it('closes on Tab', async () => {
    renderMenu()
    await userEvent.click(trigger())
    await userEvent.keyboard('{Tab}')

    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('closes when a pointer goes down outside the menu', async () => {
    render(
      <>
        <DropdownMenu trigger="Actions" items={makeItems()} />
        <button type="button">Elsewhere</button>
      </>,
    )
    await userEvent.click(trigger())
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))

    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('toggles closed when the trigger is clicked a second time', async () => {
    renderMenu()
    await userEvent.click(trigger())
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await userEvent.click(trigger())
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('does not open while disabled', async () => {
    render(<DropdownMenu trigger="Actions" items={makeItems()} disabled />)
    await userEvent.click(trigger())

    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('merges className and style onto the trigger and spreads rest props', () => {
    renderMenuWithExtras()
    const button = trigger()

    expect(button).toHaveClass('hal-dropdown-menu', 'custom')
    expect(button.className.indexOf('hal-dropdown-menu')).toBeLessThan(
      button.className.indexOf('custom'),
    )
    expect(button).toHaveStyle({ marginTop: '4px' })
    expect(button).toHaveAttribute('data-testid', 'menu-trigger')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('forwards its ref to the trigger button', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<DropdownMenu ref={ref} trigger="Actions" items={makeItems()} />)

    expect(ref.current).toBe(trigger())
  })

  it('has no axe violations while closed', async () => {
    const { container } = renderMenu()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations while open', async () => {
    renderMenu()
    await userEvent.click(trigger())
    // The panel is portalled, so the assertion has to reach past the render
    // container to the document that actually holds it. The landmark rule is
    // off because it judges a whole page, and this document is one component.
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations()
  })
})

function renderMenuWithExtras() {
  return render(
    <DropdownMenu
      trigger="Actions"
      items={makeItems()}
      className="custom"
      style={{ marginTop: 4 }}
      data-testid="menu-trigger"
    />,
  )
}
