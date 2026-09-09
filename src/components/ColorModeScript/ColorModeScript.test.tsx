import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ColorModeScript } from './ColorModeScript'

function scriptSource(container: HTMLElement): string {
  const script = container.querySelector('script')
  if (!script) throw new Error('no script rendered')
  return script.innerHTML
}

describe('ColorModeScript', () => {
  it('renders an inline script', () => {
    const { container } = render(<ColorModeScript />)
    expect(container.querySelector('script')).not.toBeNull()
  })

  it('applies a stored explicit mode when run', () => {
    localStorage.setItem('halcyon-mode', 'dark')
    const { container } = render(<ColorModeScript />)

    new Function(scriptSource(container))()

    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
  })

  it('leaves the attribute unset for system mode', () => {
    localStorage.setItem('halcyon-mode', 'system')
    const { container } = render(<ColorModeScript />)

    new Function(scriptSource(container))()

    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })

  it('does not throw when nothing is stored', () => {
    const { container } = render(<ColorModeScript />)
    expect(() => new Function(scriptSource(container))()).not.toThrow()
    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })

  it('accepts a custom nonce for strict content security policies', () => {
    const { container } = render(<ColorModeScript nonce="abc123" />)
    expect(container.querySelector('script')?.getAttribute('nonce')).toBe('abc123')
  })
})
