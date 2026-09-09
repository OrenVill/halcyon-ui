import { forwardRef, useCallback, useEffect, useRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type CheckboxSize = 'sm' | 'md' | 'lg'

// `size` is dropped from the native attributes: on an input it means a
// character width, and the library uses the name for a visual scale.
export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: CheckboxSize
  /**
   * Renders the mixed state. This is a DOM property rather than an attribute,
   * so it is written to the node in an effect and cannot be rendered.
   */
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ size = 'md', indeterminate = false, className, ...rest }, ref) {
    // The component needs the node itself to set `indeterminate`, and the
    // caller still gets their ref: one callback assigns both.
    const innerRef = useRef<HTMLInputElement | null>(null)

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    // No dependency list on purpose: a native click clears `indeterminate` on
    // the node without React knowing, so the prop is reasserted every render.
    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate
      }
    })

    return (
      <input
        {...rest}
        ref={setRefs}
        type="checkbox"
        className={cx('hal-checkbox', `hal-checkbox--${size}`, className)}
      />
    )
  },
)
