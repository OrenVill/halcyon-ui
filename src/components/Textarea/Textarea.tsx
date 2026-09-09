import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type TextareaSize = 'sm' | 'md' | 'lg'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextareaSize
  /** Marks the field as failing validation. */
  invalid?: boolean
}

export const Textarea = /* @__PURE__ */ forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  // `size` is destructured out even though <textarea> has no native size
  // attribute, so every field in the set treats the prop identically.
  { size = 'md', invalid = false, className, ...rest },
  ref,
) {
  return (
    <textarea
      {...rest}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx(
        'hal-textarea',
        `hal-textarea--${size}`,
        invalid && 'hal-textarea--invalid',
        className,
      )}
    />
  )
})
