import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('falls back when the image already failed before React could listen', () => {
    // A cached or policy-blocked image completes before onError is attached.
    // The browser reports it as complete with no intrinsic width.
    const complete = vi
      .spyOn(HTMLImageElement.prototype, 'complete', 'get')
      .mockReturnValue(true)
    const width = vi
      .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
      .mockReturnValue(0)

    render(<Avatar src="/blocked.png" name="Ada Lovelace" />)
    expect(screen.getByText('AL')).toBeInTheDocument()

    complete.mockRestore()
    width.mockRestore()
  })

  it('renders the image with its alt text', () => {
    render(<Avatar src="/ada.png" alt="Ada Lovelace" />)
    const image = screen.getByRole('img', { name: 'Ada Lovelace' })
    expect(image).toHaveAttribute('src', '/ada.png')
  })

  it('falls back to initials when the image fails to load', () => {
    render(<Avatar src="/broken.png" alt="Ada Lovelace" name="Ada Lovelace" />)
    const image = screen.getByRole('img', { name: 'Ada Lovelace' })

    fireEvent.error(image)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('renders initials when there is no src', () => {
    render(<Avatar name="Ada Lovelace" />)
    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('takes the first and last initial of a two-word name', () => {
    render(<Avatar name="Ada Lovelace" />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('takes one initial from a single-word name', () => {
    render(<Avatar name="Prince" />)
    expect(screen.getByText('P')).toBeInTheDocument()
  })

  it('uses the first and last word of a three-word name', () => {
    render(<Avatar name="Ada Byron Lovelace" />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('uppercases initials taken from a lowercase name', () => {
    render(<Avatar name="ada lovelace" />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('does not crash on a whitespace-only name', () => {
    const { container } = render(<Avatar name="   " data-testid="avatar" />)
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
    expect(container.querySelector('.hal-avatar__placeholder')).toBeInTheDocument()
  })

  it('does not crash on an empty name', () => {
    const { container } = render(<Avatar name="" />)
    expect(container.querySelector('.hal-avatar__placeholder')).toBeInTheDocument()
  })

  it('hides the empty placeholder from assistive technology', () => {
    const { container } = render(<Avatar />)
    const placeholder = container.querySelector('.hal-avatar__placeholder')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toHaveAttribute('aria-hidden', 'true')
  })

  it('defaults to a medium circle', () => {
    render(<Avatar name="Ada" data-testid="avatar" />)
    expect(screen.getByTestId('avatar')).toHaveClass(
      'hal-avatar',
      'hal-avatar--md',
      'hal-avatar--circle',
    )
  })

  it.each([['sm'], ['md'], ['lg']])('applies the %s size class', (size) => {
    render(<Avatar name="Ada" size={size as 'sm'} data-testid="avatar" />)
    expect(screen.getByTestId('avatar')).toHaveClass(`hal-avatar--${size}`)
  })

  it.each([['circle'], ['square']])('applies the %s shape class', (shape) => {
    render(<Avatar name="Ada" shape={shape as 'circle'} data-testid="avatar" />)
    expect(screen.getByTestId('avatar')).toHaveClass(`hal-avatar--${shape}`)
  })

  it('merges className rather than replacing it', () => {
    render(<Avatar name="Ada" className="custom" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar).toHaveClass('hal-avatar')
    expect(avatar).toHaveClass('custom')
  })

  it('merges style rather than replacing it', () => {
    render(<Avatar name="Ada" style={{ marginTop: '4px' }} data-testid="avatar" />)
    expect(screen.getByTestId('avatar')).toHaveStyle({ marginTop: '4px' })
  })

  it('spreads unknown props onto the element', () => {
    render(<Avatar name="Ada" data-testid="avatar" aria-describedby="hint" />)
    expect(screen.getByTestId('avatar')).toHaveAttribute('aria-describedby', 'hint')
  })

  it('forwards the ref to the span element', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Avatar name="Ada Lovelace" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current?.textContent).toBe('AL')
  })

  it('has no axe violations with an image', async () => {
    const { container } = render(<Avatar src="/ada.png" alt="Ada Lovelace" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations with initials', async () => {
    const { container } = render(<Avatar name="Ada Lovelace" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations with the empty placeholder', async () => {
    const { container } = render(<Avatar />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
