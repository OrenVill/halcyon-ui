import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type SliderSize = 'sm' | 'md' | 'lg'

// `size` on an <input> is a native numeric attribute (a character count), so
// the prop is omitted from the extended type and redeclared as the library's
// size scale. It is destructured out below and never reaches the DOM.
export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: SliderSize
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { size = 'md', className, ...rest },
  ref,
) {
  return (
    <input
      {...rest}
      ref={ref}
      // A real range input. Arrow keys, Home, End, Page Up/Down, the drag
      // behaviour and the slider role all come from the platform; there is
      // nothing here to reimplement.
      type="range"
      className={cx('hal-slider', `hal-slider--${size}`, className)}
    />
  )
})
