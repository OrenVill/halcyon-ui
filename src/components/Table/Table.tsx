import { forwardRef } from 'react'
import type { TableHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type TableSize = 'sm' | 'md' | 'lg'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  size?: TableSize
  /** Shades alternate body rows. */
  striped?: boolean
}

export const Table = /* @__PURE__ */ forwardRef<HTMLTableElement, TableProps>(function Table(
  { size = 'md', striped = false, className, children, ...rest },
  ref,
) {
  return (
    // The overflow lives here, not on the page: a wide table should scroll
    // inside its own box instead of making the whole document slide sideways.
    <div className="hal-table__container">
      <table
        {...rest}
        ref={ref}
        className={cx(
          'hal-table',
          `hal-table--${size}`,
          striped && 'hal-table--striped',
          className,
        )}
      >
        {children}
      </table>
    </div>
  )
})
