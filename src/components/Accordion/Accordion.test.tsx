import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Accordion } from './Accordion'
import type { AccordionItem } from './Accordion'

const ITEMS: AccordionItem[] = [
  { id: 'a', title: 'Section A', content: 'Content A' },
  { id: 'b', title: 'Section B', content: 'Content B' },
  { id: 'c', title: 'Section C', content: 'Content C', disabled: true },
]

describe('Accordion', () => {
  it('renders every section header', () => {
    render(<Accordion items={ITEMS} />)
    expect(screen.getByRole('button', { name: 'Section A' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Section B' })).toBeInTheDocument()
  })

  it('defaults to the outline variant at medium size', () => {
    const { container } = render(<Accordion items={ITEMS} />)
    expect(container.firstChild).toHaveClass('hal-accordion', 'hal-accordion--outline', 'hal-accordion--md')
  })

  it('opens a single section at a time', async () => {
    render(<Accordion items={ITEMS} defaultValue="a" />)
    expect(screen.getByRole('region', { name: 'Section A' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Section B' }))
    expect(screen.queryByRole('region', { name: 'Section A' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Section B' })).toBeVisible()
  })

  it('allows multiple open sections when type is multiple', async () => {
    render(<Accordion items={ITEMS} type="multiple" defaultValue={['a']} />)
    await userEvent.click(screen.getByRole('button', { name: 'Section B' }))
    expect(screen.getByRole('region', { name: 'Section A' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Section B' })).toBeVisible()
  })

  it('does not toggle a disabled header', async () => {
    render(<Accordion items={ITEMS} />)
    await userEvent.click(screen.getByRole('button', { name: 'Section C' }))
    expect(screen.queryByRole('region', { name: 'Section C' })).toBeNull()
  })

  it('calls onValueChange when a section opens', async () => {
    const onValueChange = vi.fn()
    render(<Accordion items={ITEMS} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Section A' }))
    expect(onValueChange).toHaveBeenCalledWith('a')
  })

  it('merges className and style on the root', () => {
    const { container } = render(
      <Accordion items={ITEMS} className="custom" style={{ marginTop: '4px' }} />,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('hal-accordion', 'custom')
    expect(root).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Accordion ref={ref} items={ITEMS} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('has no axe violations', async () => {
    const { container } = render(<Accordion items={ITEMS} defaultValue="a" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
