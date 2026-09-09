import { forwardRef, useCallback, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type AvatarSize = 'sm' | 'md' | 'lg'
export type AvatarShape = 'circle' | 'square'

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image source. Falls back to initials if the image fails to load. */
  src?: string
  /** Alternative text for the image. Defaults to `name`, then to empty. */
  alt?: string
  /** Used to derive initials, both as a fallback and on its own. */
  name?: string
  size?: AvatarSize
  shape?: AvatarShape
}

/**
 * At most two initials, from the first and last whitespace-separated words.
 * A single word yields one initial; an empty or whitespace-only name yields
 * nothing, which the component reads as "render the neutral placeholder".
 */
function initialsFrom(name: string | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export const Avatar = /* @__PURE__ */ forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, name, size = 'md', shape = 'circle', className, children, ...rest },
  ref,
) {
  // A broken-image icon in a user list is worse than a monogram, so a failed
  // image falls back to initials.
  //
  // Remember WHICH src failed rather than a bare boolean. A boolean needs an
  // effect to reset it when src changes, and that effect also runs on mount,
  // where it would undo a failure detected during the commit before it.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = src !== undefined && failedSrc === src

  const markFailed = useCallback(() => setFailedSrc(src ?? null), [src])

  // An image can finish loading, or fail, before React attaches onError:
  // served from cache, or refused by a content security policy. A complete
  // image with no intrinsic width is a failed one, and this is the only way
  // to notice.
  const checkAlreadyFailed = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete && node.naturalWidth === 0) markFailed()
    },
    [markFailed],
  )

  const initials = initialsFrom(name)
  const showImage = Boolean(src) && !failed

  return (
    <span
      {...rest}
      ref={ref}
      className={cx('hal-avatar', `hal-avatar--${size}`, `hal-avatar--${shape}`, className)}
    >
      {showImage ? (
        <img
          ref={checkAlreadyFailed}
          className="hal-avatar__image"
          src={src}
          alt={alt ?? name ?? ''}
          onError={markFailed}
        />
      ) : initials ? (
        <span className="hal-avatar__initials">{initials}</span>
      ) : (
        // Nothing to show and nothing to say: an empty avatar carries no
        // information, so it is hidden from assistive technology entirely.
        <span className="hal-avatar__placeholder" aria-hidden="true" />
      )}
      {children}
    </span>
  )
})
