import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type TagVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
export type TagSize = 'sm' | 'md'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic tone. Defaults to 'neutral'. */
  variant?: TagVariant
  size?: TagSize
  /** Renders a remove button and runs when it is activated. */
  onRemove?: () => void
  /**
   * Accessible name for the remove button. Needed only when `children` is not
   * a plain string, since that is the one case a name cannot be derived from.
   */
  removeLabel?: string
}

export const Tag = /* @__PURE__ */ forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { variant = 'neutral', size = 'md', onRemove, removeLabel, className, children, ...rest },
  ref,
) {
  // Twenty buttons all named "Remove" are indistinguishable in a screen
  // reader's element list, so the tag's own text goes into the name. String
  // children give it for free; anything else needs `removeLabel`.
  const label =
    removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')

  return (
    <span
      {...rest}
      ref={ref}
      className={cx('hal-tag', `hal-tag--${variant}`, `hal-tag--${size}`, className)}
    >
      <span className="hal-tag__label">{children}</span>
      {onRemove ? (
        <button type="button" className="hal-tag__remove" aria-label={label} onClick={onRemove}>
          <span aria-hidden="true">&#215;</span>
        </button>
      ) : null}
    </span>
  )
})
