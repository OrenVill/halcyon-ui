import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { DataList } from './DataList'

const items = [
  { term: 'Status', description: 'Active' },
  { term: 'Owner', description: 'Ada Lovelace' },
]

describe('DataList', () => {
  it('renders a definition list with terms and descriptions', () => {
    render(<DataList items={items} />)
    expect(screen.getByText('Status').tagName).toBe('DT')
    expect(screen.getByText('Active').tagName).toBe('DD')
  })

  it('applies hal-data-list classes', () => {
    const { container } = render(<DataList items={items} data-testid="list" />)
    expect(screen.getByTestId('list')).toHaveClass('hal-data-list')
    expect(container.querySelector('.hal-data-list__term')).toBeInTheDocument()
    expect(container.querySelector('.hal-data-list__description')).toBeInTheDocument()
  })

  it('merges className', () => {
    render(<DataList items={items} className="custom" data-testid="list" />)
    expect(screen.getByTestId('list')).toHaveClass('hal-data-list', 'custom')
  })

  it('forwards the ref', () => {
    const ref = createRef<HTMLDListElement>()
    render(<DataList ref={ref} items={items} />)
    expect(ref.current?.tagName).toBe('DL')
  })

  it('has no axe violations', async () => {
    const { container } = render(<DataList items={items} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
