import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Breadcrumb } from './Breadcrumb'

describe('Breadcrumb', () => {
  it('renders links and marks the current page', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Docs', href: '/docs' },
          { label: 'Components' },
        ]}
      />,
    )
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Components')).toHaveAttribute('aria-current', 'page')
  })

  it('defaults to the plain variant at medium size', () => {
    const { container } = render(<Breadcrumb items={[{ label: 'Only' }]} />)
    expect(container.firstChild).toHaveClass(
      'hal-breadcrumb',
      'hal-breadcrumb--plain',
      'hal-breadcrumb--md',
    )
  })

  it('merges className and style on the root', () => {
    const { container } = render(
      <Breadcrumb items={[{ label: 'Only' }]} className="custom" style={{ marginTop: '4px' }} />,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('hal-breadcrumb', 'custom')
    expect(root).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the nav element', () => {
    const ref = createRef<HTMLElement>()
    render(<Breadcrumb ref={ref} items={[{ label: 'Only' }]} />)
    expect(ref.current?.tagName).toBe('NAV')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Settings' },
        ]}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
