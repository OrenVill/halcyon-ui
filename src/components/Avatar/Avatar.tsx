import { forwardRef, useEffect, useState } from 'react'
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
  // load is remembered and the initials take over.
  const [failed, setFailed] = useState(false)

  // A new src deserves a fresh attempt; otherwise one bad URL would poison
  // every later one rendered by the same element.
  useEffect(() => {
    setFailed(false)
  }, [src])

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
          className="hal-avatar__image"
          src={src}
          alt={alt ?? name ?? ''}
          onError={() => setFailed(true)}
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
