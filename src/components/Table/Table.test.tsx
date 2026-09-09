import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Table } from './Table'

function Body() {
  return (
    <>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Role</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Ada</td>
          <td>Engineer</td>
        </tr>
        <tr>
          <td>Grace</td>
          <td>Admiral</td>
        </tr>
      </tbody>
    </>
  )
}

describe('Table', () => {
  it('renders a table with its rows and cells', () => {
    render(
      <Table>
        <Body />
      </Table>,
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Grace' })).toBeInTheDocument()
  })

  it('defaults to the medium size and no stripes', () => {
    render(
      <Table>
        <Body />
      </Table>,
    )
    const table = screen.getByRole('table')
    expect(table).toHaveClass('hal-table', 'hal-table--md')
    expect(table).not.toHaveClass('hal-table--striped')
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(
      <Table size={size as 'sm'}>
        <Body />
      </Table>,
    )
    expect(screen.getByRole('table')).toHaveClass(`hal-table--${size}`)
  })

  it('applies the striped class only when asked', () => {
    const { rerender } = render(
      <Table>
        <Body />
      </Table>,
    )
    expect(screen.getByRole('table')).not.toHaveClass('hal-table--striped')
    rerender(
      <Table striped>
        <Body />
      </Table>,
    )
    expect(screen.getByRole('table')).toHaveClass('hal-table--striped')
  })

  it('wraps the table in a scroll container', () => {
    const { container } = render(
      <Table>
        <Body />
      </Table>,
    )
    const scroll = container.querySelector('.hal-table__container')
    expect(scroll).toBeInTheDocument()
    expect(scroll?.firstElementChild).toBe(screen.getByRole('table'))
  })

  it('merges className onto the table rather than replacing it', () => {
    render(
      <Table className="custom">
        <Body />
      </Table>,
    )
    const table = screen.getByRole('table')
    expect(table).toHaveClass('hal-table')
    expect(table).toHaveClass('custom')
    expect(table.parentElement).not.toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(
      <Table style={{ marginTop: '4px' }}>
        <Body />
      </Table>,
    )
    expect(screen.getByRole('table')).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the table element', () => {
    render(
      <Table data-testid="grid" aria-describedby="hint">
        <Body />
      </Table>,
    )
    const table = screen.getByTestId('grid')
    expect(table.tagName).toBe('TABLE')
    expect(table).toHaveAttribute('aria-describedby', 'hint')
  })

  it('forwards the ref to the table element, not the container', () => {
    const ref = createRef<HTMLTableElement>()
    render(
      <Table ref={ref}>
        <Body />
      </Table>,
    )
    expect(ref.current).toBeInstanceOf(HTMLTableElement)
    expect(ref.current).toHaveClass('hal-table')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Table>
        <caption>Crew</caption>
        <Body />
      </Table>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
