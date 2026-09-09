import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type SkeletonVariant = 'text' | 'circle' | 'rect'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape of the placeholder. Defaults to 'text'. */
  variant?: SkeletonVariant
  /** A number is treated as pixels. */
  width?: string | number
  /** A number is treated as pixels. */
  height?: string | number
  /** Number of bars to draw. Only meaningful for the 'text' variant. */
  lines?: number
}

/** A bare number in a style prop means pixels, matching React's own rule. */
function toLength(value: string | number | undefined): string | number | undefined {
  return typeof value === 'number' ? `${value}px` : value
}

export const Skeleton = /* @__PURE__ */ forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = 'text', width, height, lines = 1, className, style, ...rest },
  ref,
) {
  // Only paragraphs have multiple lines; a circle or a rectangle is one shape
  // however many lines the caller asks for.
  const count = variant === 'text' ? Math.max(1, Math.floor(lines)) : 1

  const dimensions: CSSProperties = {}
  if (width !== undefined) dimensions.width = toLength(width)
  if (height !== undefined) dimensions.height = toLength(height)

  return (
    <div
      {...rest}
      ref={ref}
      // A skeleton stands in for content that does not exist yet. Announcing
      // it tells the user nothing, so it is always hidden from the tree.
      aria-hidden="true"
      // Spread last so the component's own sizing wins, but only for the
      // properties it actually sets: the caller's other styles survive.
      style={{ ...style, ...dimensions }}
      className={cx(
        'hal-skeleton',
        `hal-skeleton--${variant}`,
        count > 1 && 'hal-skeleton--multiline',
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={cx(
            'hal-skeleton__bar',
            // The short last line is what makes a stack of bars read as a
            // paragraph instead of a pile of identical blocks.
            count > 1 && index === count - 1 && 'hal-skeleton__bar--short',
          )}
        />
      ))}
    </div>
  )
})
