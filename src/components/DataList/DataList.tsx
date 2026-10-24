import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export interface DataListItem {
  term: string
  description: string
}

export interface DataListProps extends HTMLAttributes<HTMLDListElement> {
  items: DataListItem[]
}

export const DataList = /* @__PURE__ */ forwardRef<HTMLDListElement, DataListProps>(
  function DataList({ items, className, ...rest }, ref) {
    return (
      <dl {...rest} ref={ref} className={cx('hal-data-list', className)}>
        {items.map((item) => (
          <div key={item.term} className="hal-data-list__item">
            <dt className="hal-data-list__term">{item.term}</dt>
            <dd className="hal-data-list__description">{item.description}</dd>
          </div>
        ))}
      </dl>
    )
  },
)
