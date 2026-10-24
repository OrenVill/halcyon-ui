import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Link } from './Link'

describe('Link', () => {
  it('renders an anchor with its children', () => {
    render(<Link href="/docs">Docs</Link>)
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
  })

  it('defaults to the default variant', () => {
    render(<Link href="/">Home</Link>)
    expect(screen.getByRole('link')).toHaveClass('hal-link', 'hal-link--default')
  })

  it.each([['default'], ['muted'], ['accent']])('applies the %s variant class', (variant) => {
    render(<Link href="/" variant={variant as 'default'}>Home</Link>)
    expect(screen.getByRole('link')).toHaveClass(`hal-link--${variant}`)
  })

  it('opens externally with a safe rel when external is set', () => {
    render(<Link href="https://example.com" external>Example</Link>)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
  })

  it('augments rel when target is _blank without dropping existing tokens', () => {
    render(
      <Link href="https://example.com" target="_blank" rel="nofollow">
        Example
      </Link>,
    )
    const rel = screen.getByRole('link').getAttribute('rel') ?? ''
    expect(rel).toContain('nofollow')
    expect(rel).toContain('noopener')
  })

  it('merges className', () => {
    render(<Link href="/" className="custom">Home</Link>)
    expect(screen.getByRole('link')).toHaveClass('hal-link', 'custom')
  })

  it('forwards the ref', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(<Link ref={ref} href="/">Home</Link>)
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
  })

  it('has no axe violations', async () => {
    const { container } = render(<Link href="/docs">Documentation</Link>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
