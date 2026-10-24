import { forwardRef } from 'react'
import type { AnchorHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type LinkVariant = 'default' | 'muted' | 'accent'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Visual tone. Defaults to 'default'. */
  variant?: LinkVariant
  /** Opens in a new tab and sets a safe rel when the caller did not supply one. */
  external?: boolean
}

function externalRel(existing: string | undefined): string {
  const parts = new Set((existing ?? '').split(/\s+/).filter(Boolean))
  parts.add('noopener')
  parts.add('noreferrer')
  return [...parts].join(' ')
}

export const Link = /* @__PURE__ */ forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant = 'default', external = false, className, rel, target, ...rest },
  ref,
) {
  const opensNewTab = external || target === '_blank'

  return (
    <a
      {...rest}
      ref={ref}
      target={external ? (target ?? '_blank') : target}
      rel={opensNewTab ? externalRel(rel) : rel}
      className={cx('hal-link', `hal-link--${variant}`, className)}
    />
  )
})
