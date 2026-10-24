import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No results" description="Try another search." />)
    expect(screen.getByText('No results')).toBeInTheDocument()
    expect(screen.getByText('Try another search.')).toBeInTheDocument()
  })

  it('renders action children', () => {
    render(
      <EmptyState title="Empty">
        <a href="/new">Create one</a>
      </EmptyState>,
    )
    expect(screen.getByRole('link', { name: 'Create one' })).toBeInTheDocument()
  })

  it('applies hal-empty-state classes', () => {
    render(<EmptyState title="Empty" data-testid="empty" />)
    expect(screen.getByTestId('empty')).toHaveClass('hal-empty-state')
  })

  it('merges className', () => {
    render(<EmptyState title="Empty" className="custom" data-testid="empty" />)
    expect(screen.getByTestId('empty')).toHaveClass('hal-empty-state', 'custom')
  })

  it('forwards the ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<EmptyState ref={ref} title="Empty" />)
    expect(ref.current).toHaveClass('hal-empty-state')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <EmptyState title="No items" description="Add your first item to get started." />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
