import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Tag } from './Tag'

describe('Tag', () => {
  it('renders its children', () => {
    render(<Tag>design</Tag>)
    expect(screen.getByText('design')).toBeInTheDocument()
  })

  it('defaults to the neutral variant at medium size', () => {
    render(<Tag data-testid="tag">design</Tag>)
    expect(screen.getByTestId('tag')).toHaveClass('hal-tag', 'hal-tag--neutral', 'hal-tag--md')
  })

  it.each([['neutral'], ['accent'], ['success'], ['warning'], ['danger']])(
    'applies the %s variant class',
    (variant) => {
      render(
        <Tag data-testid="tag" variant={variant as 'neutral'}>
          design
        </Tag>,
      )
      expect(screen.getByTestId('tag')).toHaveClass(`hal-tag--${variant}`)
    },
  )

  it.each([['sm'], ['md']])('applies the %s size class', (size) => {
    render(
      <Tag data-testid="tag" size={size as 'sm'}>
        design
      </Tag>,
    )
    expect(screen.getByTestId('tag')).toHaveClass(`hal-tag--${size}`)
  })

  it('renders no remove button without onRemove', () => {
    render(<Tag>design</Tag>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders a remove button when onRemove is given and calls it on click', async () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>design</Tag>)
    const remove = screen.getByRole('button')
    expect(remove).toHaveAttribute('type', 'button')
    await userEvent.click(remove)
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('names the remove button after the tag text', () => {
    render(<Tag onRemove={() => {}}>design</Tag>)
    const remove = screen.getByRole('button')
    expect(remove).toHaveAccessibleName(/design/)
    expect(remove).toHaveAccessibleName('Remove design')
  })

  it('accepts removeLabel when the children are not a plain string', () => {
    render(
      <Tag onRemove={() => {}} removeLabel="Remove the design tag">
        <em>design</em>
      </Tag>,
    )
    expect(screen.getByRole('button')).toHaveAccessibleName('Remove the design tag')
  })

  it('reaches the remove button by Tab and activates it with Enter', async () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>design</Tag>)
    await userEvent.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('merges className rather than replacing it', () => {
    render(
      <Tag data-testid="tag" className="custom">
        design
      </Tag>,
    )
    const tag = screen.getByTestId('tag')
    expect(tag).toHaveClass('hal-tag')
    expect(tag).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(
      <Tag data-testid="tag" style={{ marginTop: '4px' }}>
        design
      </Tag>,
    )
    expect(screen.getByTestId('tag')).toHaveStyle({ marginTop: '4px' })
  })

  it('forwards the ref to the span element', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Tag ref={ref}>design</Tag>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current?.textContent).toBe('design')
  })

  it('spreads unknown props onto the element', () => {
    render(
      <Tag data-testid="x" aria-describedby="hint">
        design
      </Tag>,
    )
    expect(screen.getByTestId('x')).toHaveAttribute('aria-describedby', 'hint')
  })

  it('has no axe violations without a remove button', async () => {
    const { container } = render(<Tag variant="success">design</Tag>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations with a remove button', async () => {
    const { container } = render(<Tag onRemove={() => {}}>design</Tag>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
