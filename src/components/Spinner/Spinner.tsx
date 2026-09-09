import { forwardRef, useId } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
  /**
   * Announced while the spinner is present. Defaults to 'Loading'.
   * Rendered as real text — visually hidden, not an aria-label — so a caller
   * can unhide it, and so assistive technology has something to read.
   */
  label?: string
}

export const Spinner = /* @__PURE__ */ forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label = 'Loading', className, ...rest },
  ref,
) {
  const reactId = useId()
  const labelId = `${reactId}-label`

  return (
    <span
      {...rest}
      ref={ref}
      role="status"
      // role="status" takes its name from the author, not from its contents,
      // so the hidden text is pointed at rather than merely nested. A spinner
      // with no accessible name is silence to a screen reader.
      aria-labelledby={labelId}
      className={cx('hal-spinner', `hal-spinner--${size}`, className)}
    >
      {/* Decoration: the meaning is carried entirely by the label. */}
      <span className="hal-spinner__graphic" aria-hidden="true" />
      <span id={labelId} className="hal-visually-hidden">
        {label}
      </span>
    </span>
  )
})
