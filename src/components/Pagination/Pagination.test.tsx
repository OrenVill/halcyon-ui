import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders prev and next controls in a navigation landmark', () => {
    render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
  })

  it('marks the current page', () => {
    render(<Pagination page={3} pageCount={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('calls onPageChange when a page is chosen', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    rerender(<Pagination page={5} pageCount={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('defaults to the outline variant at medium size', () => {
    const { container } = render(<Pagination page={1} pageCount={3} onPageChange={() => {}} />)
    expect(container.firstChild).toHaveClass(
      'hal-pagination',
      'hal-pagination--outline',
      'hal-pagination--md',
    )
  })

  it('merges className and style on the root', () => {
    const { container } = render(
      <Pagination
        page={1}
        pageCount={3}
        onPageChange={() => {}}
        className="custom"
        style={{ marginTop: '4px' }}
      />,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('hal-pagination', 'custom')
    expect(root).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the nav element', () => {
    const ref = createRef<HTMLElement>()
    render(<Pagination ref={ref} page={1} pageCount={3} onPageChange={() => {}} />)
    expect(ref.current?.tagName).toBe('NAV')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
