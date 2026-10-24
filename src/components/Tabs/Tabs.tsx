import { forwardRef, useCallback, useId, useRef, useState } from 'react'
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { cx } from '../../internal/cx'

export type TabsVariant = 'line' | 'enclosed'
export type TabsSize = 'sm' | 'md' | 'lg'

export interface TabItem {
  id: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  tabs: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  variant?: TabsVariant
  size?: TabsSize
}

function firstEnabled(tabs: TabItem[]): number {
  for (let i = 0; i < tabs.length; i += 1) if (!tabs[i]?.disabled) return i
  return -1
}

function lastEnabled(tabs: TabItem[]): number {
  for (let i = tabs.length - 1; i >= 0; i -= 1) if (!tabs[i]?.disabled) return i
  return -1
}

function stepTab(tabs: TabItem[], from: number, direction: 1 | -1): number {
  const count = tabs.length
  if (count === 0) return -1
  if (from < 0) return direction === 1 ? firstEnabled(tabs) : lastEnabled(tabs)

  let index = from
  for (let i = 0; i < count; i += 1) {
    index = (index + direction + count) % count
    if (!tabs[index]?.disabled) return index
  }
  return from
}

export const Tabs = /* @__PURE__ */ forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    tabs,
    value,
    defaultValue,
    onValueChange,
    variant = 'line',
    size = 'md',
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined
  const initial = defaultValue ?? tabs.find((tab) => !tab.disabled)?.id ?? ''
  const [internalValue, setInternalValue] = useState(initial)
  const selectedId = isControlled ? value : internalValue

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()

  const selectedIndex = tabs.findIndex((tab) => tab.id === selectedId)
  const safeSelectedIndex = selectedIndex >= 0 ? selectedIndex : firstEnabled(tabs)

  const select = useCallback(
    (id: string) => {
      const tab = tabs.find((item) => item.id === id)
      if (!tab || tab.disabled) return
      if (!isControlled) setInternalValue(id)
      onValueChange?.(id)
    },
    [isControlled, onValueChange, tabs],
  )

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (safeSelectedIndex < 0) return

    let nextIndex: number
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        nextIndex = stepTab(tabs, safeSelectedIndex, 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        nextIndex = stepTab(tabs, safeSelectedIndex, -1)
        break
      case 'Home':
        event.preventDefault()
        nextIndex = firstEnabled(tabs)
        break
      case 'End':
        event.preventDefault()
        nextIndex = lastEnabled(tabs)
        break
      default:
        return
    }

    if (nextIndex < 0 || nextIndex === safeSelectedIndex) return
    const next = tabs[nextIndex]
    if (!next) return
    select(next.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('hal-tabs', `hal-tabs--${variant}`, `hal-tabs--${size}`, className)}
    >
      <div role="tablist" className="hal-tabs__list" onKeyDown={handleKeyDown}>
        {tabs.map((tab, index) => {
          const selected = tab.id === selectedId
          const tabId = `${baseId}-tab-${tab.id}`
          const panelId = `${baseId}-panel-${tab.id}`
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={selected}
              aria-controls={panelId}
              disabled={tab.disabled}
              tabIndex={selected ? 0 : -1}
              className={cx('hal-tabs__tab', selected && 'hal-tabs__tab--selected')}
              onClick={() => select(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {tabs.map((tab) => {
        const selected = tab.id === selectedId
        const tabId = `${baseId}-tab-${tab.id}`
        const panelId = `${baseId}-panel-${tab.id}`
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            hidden={!selected}
            className="hal-tabs__panel"
            tabIndex={0}
          >
            {selected ? tab.content : null}
          </div>
        )
      })}
    </div>
  )
})
