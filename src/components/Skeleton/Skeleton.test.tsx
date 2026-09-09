import { render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Skeleton } from './Skeleton'

function rootOf(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>('.hal-skeleton')
  if (!root) throw new Error('no skeleton rendered')
  return root
}

function barsOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('.hal-skeleton__bar')]
}

describe('Skeleton', () => {
  it('renders a single bar by default', () => {
    const { container } = render(<Skeleton />)
    expect(barsOf(container)).toHaveLength(1)
  })

  it('defaults to the text variant', () => {
    const { container } = render(<Skeleton />)
    expect(rootOf(container)).toHaveClass('hal-skeleton', 'hal-skeleton--text')
  })

  it('renders one bar per line', () => {
    const { container } = render(<Skeleton lines={3} />)
    expect(barsOf(container)).toHaveLength(3)
  })

  it('marks the last line short so the stack reads as a paragraph', () => {
    const { container } = render(<Skeleton lines={3} />)
    const bars = barsOf(container)
    expect(bars[0]).not.toHaveClass('hal-skeleton__bar--short')
    expect(bars[1]).not.toHaveClass('hal-skeleton__bar--short')
    expect(bars[2]).toHaveClass('hal-skeleton__bar--short')
  })

  it('does not shorten the only bar of a single-line skeleton', () => {
    const { container } = render(<Skeleton />)
    expect(barsOf(container)[0]).not.toHaveClass('hal-skeleton__bar--short')
  })

  it.each([['circle'], ['rect']])('ignores lines for the %s variant', (variant) => {
    const { container } = render(<Skeleton variant={variant as 'circle'} lines={3} />)
    const bars = barsOf(container)
    expect(bars).toHaveLength(1)
    expect(bars[0]).not.toHaveClass('hal-skeleton__bar--short')
  })

  it.each([['text'], ['circle'], ['rect']])('applies the %s variant class', (variant) => {
    const { container } = render(<Skeleton variant={variant as 'text'} />)
    expect(rootOf(container)).toHaveClass(`hal-skeleton--${variant}`)
  })

  it('applies string width and height as inline style', () => {
    const { container } = render(<Skeleton width="12rem" height="3rem" />)
    // Read the inline style directly: getComputedStyle would resolve rem to px
    // and hide whether the unit was passed through untouched.
    const root = rootOf(container)
    expect(root.style.width).toBe('12rem')
    expect(root.style.height).toBe('3rem')
  })

  it('treats a numeric width or height as pixels', () => {
    const { container } = render(<Skeleton width={120} height={40} />)
    expect(rootOf(container)).toHaveStyle({ width: '120px', height: '40px' })
  })

  it('hides itself from assistive technology', () => {
    const { container } = render(<Skeleton />)
    expect(rootOf(container)).toHaveAttribute('aria-hidden', 'true')
  })

  it('merges className rather than replacing it', () => {
    const { container } = render(<Skeleton className="custom" />)
    const root = rootOf(container)
    expect(root).toHaveClass('hal-skeleton')
    expect(root).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    const { container } = render(<Skeleton style={{ marginTop: '4px' }} width={120} />)
    expect(rootOf(container)).toHaveStyle({ marginTop: '4px', width: '120px' })
  })

  it('leaves a caller-supplied width alone when none is given', () => {
    const { container } = render(<Skeleton style={{ width: '7rem' }} />)
    expect(rootOf(container).style.width).toBe('7rem')
  })

  it('spreads unknown props onto the element', () => {
    const { container } = render(<Skeleton data-testid="x" id="ghost" />)
    const root = rootOf(container)
    expect(root).toHaveAttribute('data-testid', 'x')
    expect(root).toHaveAttribute('id', 'ghost')
  })

  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Skeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveClass('hal-skeleton')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Skeleton lines={3} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
