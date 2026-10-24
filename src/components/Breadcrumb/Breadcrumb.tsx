import { forwardRef } from 'react'
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

export type BreadcrumbVariant = 'plain' | 'subtle'
export type BreadcrumbSize = 'sm' | 'md' | 'lg'

export interface BreadcrumbItem {
  label: ReactNode
  href?: string
  onClick?: AnchorHTMLAttributes<HTMLAnchorElement>['onClick']
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[]
  /** Accessible name of the navigation landmark. Defaults to 'Breadcrumb'. */
  label?: string
  variant?: BreadcrumbVariant
  size?: BreadcrumbSize
}

export const Breadcrumb = /* @__PURE__ */ forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb(
    {
      items,
      label = 'Breadcrumb',
      variant = 'plain',
      size = 'md',
      className,
      ...rest
    },
    ref,
  ) {
    if (items.length === 0) {
      return (
        <nav
          {...rest}
          ref={ref}
          aria-label={label}
          className={cx(
            'hal-breadcrumb',
            `hal-breadcrumb--${variant}`,
            `hal-breadcrumb--${size}`,
            className,
          )}
        />
      )
    }

    return (
      <nav
        {...rest}
        ref={ref}
        aria-label={label}
        className={cx(
          'hal-breadcrumb',
          `hal-breadcrumb--${variant}`,
          `hal-breadcrumb--${size}`,
          className,
        )}
      >
        <ol className="hal-breadcrumb__list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const key = `${index}-${typeof item.label === 'string' ? item.label : 'item'}`
            return (
              <li key={key} className="hal-breadcrumb__item">
                {isLast || !item.href ? (
                  <span className="hal-breadcrumb__current" aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                ) : (
                  <a className="hal-breadcrumb__link" href={item.href} onClick={item.onClick}>
                    {item.label}
                  </a>
                )}
                {isLast ? null : (
                  <span className="hal-breadcrumb__separator" aria-hidden="true">/</span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  },
)
