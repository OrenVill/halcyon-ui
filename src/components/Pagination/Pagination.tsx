import { forwardRef, useMemo } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type PaginationVariant = 'outline' | 'ghost'
export type PaginationSize = 'sm' | 'md' | 'lg'

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Current page, 1-based. */
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** Renders numbered page buttons between prev and next. Defaults to true. */
  showPages?: boolean
  prevLabel?: string
  nextLabel?: string
  variant?: PaginationVariant
  size?: PaginationSize
}

function clampPage(page: number, pageCount: number): number {
  if (pageCount <= 0) return 1
  return Math.min(Math.max(page, 1), pageCount)
}

function pageRange(page: number, pageCount: number): number[] {
  if (pageCount <= 0) return []
  const current = clampPage(page, pageCount)
  const pages: number[] = []
  for (let i = 1; i <= pageCount; i += 1) pages.push(i)
  if (pageCount <= 7) return pages

  const start = Math.max(2, current - 1)
  const end = Math.min(pageCount - 1, current + 1)
  const range = [1]
  if (start > 2) range.push(-1)
  for (let i = start; i <= end; i += 1) range.push(i)
  if (end < pageCount - 1) range.push(-2)
  range.push(pageCount)
  return range
}

export const Pagination = /* @__PURE__ */ forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      page,
      pageCount,
      onPageChange,
      showPages = true,
      prevLabel = 'Previous page',
      nextLabel = 'Next page',
      variant = 'outline',
      size = 'md',
      className,
      ...rest
    },
    ref,
  ) {
    const current = clampPage(page, pageCount)
    const pages = useMemo(() => pageRange(current, pageCount), [current, pageCount])

    const go = (next: number) => {
      const target = clampPage(next, pageCount)
      if (target === current) return
      onPageChange(target)
    }

    return (
      <nav
        {...rest}
        ref={ref}
        className={cx(
          'hal-pagination',
          `hal-pagination--${variant}`,
          `hal-pagination--${size}`,
          className,
        )}
        aria-label="Pagination"
      >
        <button
          type="button"
          className="hal-pagination__control"
          aria-label={prevLabel}
          disabled={current <= 1 || pageCount <= 0}
          onClick={() => go(current - 1)}
        >
          <span aria-hidden="true">‹</span>
        </button>

        {showPages
          ? pages.map((item, index) => {
              if (item < 0) {
                return (
                  <span key={`gap-${index}`} className="hal-pagination__ellipsis" aria-hidden="true">
                    …
                  </span>
                )
              }
              const selected = item === current
              return (
                <button
                  key={item}
                  type="button"
                  className={cx('hal-pagination__page', selected && 'hal-pagination__page--current')}
                  aria-label={`Page ${item}`}
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => go(item)}
                >
                  {item}
                </button>
              )
            })
          : null}

        <button
          type="button"
          className="hal-pagination__control"
          aria-label={nextLabel}
          disabled={current >= pageCount || pageCount <= 0}
          onClick={() => go(current + 1)}
        >
          <span aria-hidden="true">›</span>
        </button>
      </nav>
    )
  },
)
