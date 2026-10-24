import { forwardRef, useCallback, useId, useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

export type AccordionVariant = 'outline' | 'ghost'
export type AccordionSize = 'sm' | 'md' | 'lg'

export interface AccordionItem {
  id: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: AccordionItem[]
  type?: 'single' | 'multiple'
  /** When type is single, the open item id. When multiple, open item ids. */
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  /** When type is single, allows every section to be closed. */
  collapsible?: boolean
  variant?: AccordionVariant
  size?: AccordionSize
}

function asArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

export const Accordion = /* @__PURE__ */ forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      items,
      type = 'single',
      value,
      defaultValue,
      onValueChange,
      collapsible = false,
      variant = 'outline',
      size = 'md',
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = value !== undefined
    const [internalOpen, setInternalOpen] = useState<string[]>(() => asArray(defaultValue))
    const openIds = isControlled ? asArray(value) : internalOpen

    const isOpen = useCallback((id: string) => openIds.includes(id), [openIds])

    const setOpen = useCallback(
      (next: string[]) => {
        if (!isControlled) setInternalOpen(next)
        if (type === 'single') onValueChange?.(next[0] ?? '')
        else onValueChange?.(next)
      },
      [isControlled, onValueChange, type],
    )

    const toggle = useCallback(
      (id: string, disabled?: boolean) => {
        if (disabled) return
        if (type === 'multiple') {
          const next = isOpen(id) ? openIds.filter((item) => item !== id) : [...openIds, id]
          setOpen(next)
          return
        }

        if (isOpen(id)) {
          if (!collapsible) return
          setOpen([])
          return
        }
        setOpen([id])
      },
      [collapsible, isOpen, openIds, setOpen, type],
    )

    const baseId = useId()

    return (
      <div
        {...rest}
        ref={ref}
        className={cx(
          'hal-accordion',
          `hal-accordion--${variant}`,
          `hal-accordion--${size}`,
          className,
        )}
      >
        {items.map((item) => {
          const expanded = isOpen(item.id)
          const headerId = `${baseId}-header-${item.id}`
          const panelId = `${baseId}-panel-${item.id}`
          return (
            <div key={item.id} className="hal-accordion__item">
              <h3 className="hal-accordion__heading">
                <button
                  type="button"
                  id={headerId}
                  className="hal-accordion__trigger"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  disabled={item.disabled}
                  onClick={() => toggle(item.id, item.disabled)}
                >
                  <span className="hal-accordion__title">{item.title}</span>
                  <span className="hal-accordion__icon" aria-hidden="true" />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                hidden={!expanded}
                className="hal-accordion__panel"
              >
                {expanded ? item.content : null}
              </div>
            </div>
          )
        })}
      </div>
    )
  },
)
