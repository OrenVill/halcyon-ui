import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Collapsible } from './Collapsible'

describe('Collapsible', () => {
  it('starts closed by default', () => {
    render(
      <Collapsible>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Content>Hidden body</Collapsible.Content>
      </Collapsible>,
    )
    expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument()
  })

  it('opens and closes when the trigger is clicked', async () => {
    render(
      <Collapsible>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Content>Hidden body</Collapsible.Content>
      </Collapsible>,
    )
    const trigger = screen.getByRole('button', { name: 'Details' })
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Hidden body')).toBeInTheDocument()
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument()
  })

  it('calls onOpenChange when toggled', async () => {
    const onOpenChange = vi.fn()
    render(
      <Collapsible onOpenChange={onOpenChange}>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Content>Body</Collapsible.Content>
      </Collapsible>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Details' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('respects a controlled open prop', () => {
    render(
      <Collapsible open>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Content>Body</Collapsible.Content>
      </Collapsible>,
    )
    expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('forwards the ref on the root', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Collapsible ref={ref}>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
      </Collapsible>,
    )
    expect(ref.current).toHaveClass('hal-collapsible')
  })

  it('has no axe violations when closed', async () => {
    const { container } = render(
      <Collapsible>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Content>Body</Collapsible.Content>
      </Collapsible>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
