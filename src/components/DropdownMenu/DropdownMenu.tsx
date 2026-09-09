import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ButtonHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { cx } from '../../internal/cx'
import { computePosition } from '../../internal/position'
import type { Align, Placement, Side } from '../../internal/position'
import { useDismissable } from '../../hooks/useDismissable'

export interface DropdownMenuItem {
  id: string
  label: string
  onSelect?: () => void
  disabled?: boolean
}

export interface DropdownMenuProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Rendered inside the trigger button. */
  trigger: ReactNode
  items: DropdownMenuItem[]
  /** Preferred side of the trigger. Flips when there is no room. Default 'bottom'. */
  side?: Side
  /** Alignment along the trigger's cross axis. Default 'start'. */
  align?: Align
}

/** Milliseconds of quiet before the type-ahead buffer resets. */
const TYPEAHEAD_RESET = 500

function firstEnabled(items: DropdownMenuItem[]): number {
  for (let i = 0; i < items.length; i += 1) if (!items[i]?.disabled) return i
  return -1
}

function lastEnabled(items: DropdownMenuItem[]): number {
  for (let i = items.length - 1; i >= 0; i -= 1) if (!items[i]?.disabled) return i
  return -1
}

/**
 * The next enabled item in the given direction, wrapping around the ends.
 * A menu wraps where a listbox stops, per the ARIA authoring practices.
 */
function step(items: DropdownMenuItem[], from: number, direction: 1 | -1): number {
  const count = items.length
  if (count === 0) return -1
  if (from < 0) return direction === 1 ? firstEnabled(items) : lastEnabled(items)

  let index = from
  for (let i = 0; i < count; i += 1) {
    index = (index + direction + count) % count
    if (!items[index]?.disabled) return index
  }
  return from
}

/**
 * A menu button and its portalled menu.
 *
 * Focus is roving: the focused item is the DOM's `document.activeElement`, not
 * a row pointed at by `aria-activedescendant`. Menu items are real focus
 * targets in the ARIA authoring practices, where a listbox's options are not,
 * so Select and DropdownMenu solve the same-looking problem differently on
 * purpose.
 */
export const DropdownMenu = /* @__PURE__ */ forwardRef<HTMLButtonElement, DropdownMenuProps>(
  function DropdownMenu(
    {
      trigger,
      items,
      side = 'bottom',
      align = 'start',
      className,
      disabled,
      type = 'button',
      onClick,
      onKeyDown,
      onPointerDown,
      ...rest
    },
    ref,
  ) {
    const [open, setOpen] = useState(false)
    const [focusIndex, setFocusIndex] = useState(-1)
    const [placement, setPlacement] = useState<Placement>({ x: 0, y: 0, side })

    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const panelRef = useRef<HTMLDivElement | null>(null)
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
    const typeahead = useRef({ buffer: '', at: 0 })
    // A pointer down on the trigger while the menu is open is dismissed by the
    // outside-click listener before the click lands. Without this the click
    // would reopen what the user just asked to close.
    const closedByTrigger = useRef(false)

    const baseId = useId()
    const menuId = `${baseId}-menu`
    const triggerId = `${baseId}-trigger`

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const close = useCallback((restoreFocus: boolean) => {
      setOpen(false)
      setFocusIndex(-1)
      if (restoreFocus) triggerRef.current?.focus()
    }, [])

    const openMenu = useCallback(
      (startIndex: number) => {
        if (disabled) return
        setOpen(true)
        setFocusIndex(startIndex)
      },
      [disabled],
    )

    // Escape returns focus to the trigger, because the focused item is about to
    // leave the document and a keyboard user would otherwise land on <body>.
    const dismissByEscape = useCallback(() => close(true), [close])
    // A pointer down elsewhere does not: the browser is already moving focus to
    // whatever was clicked, and yanking it back would fight the user.
    const dismissByOutside = useCallback(() => close(false), [close])

    useDismissable(panelRef, { active: open, closeOnOutside: false, onDismiss: dismissByEscape })
    useDismissable(panelRef, { active: open, closeOnEscape: false, onDismiss: dismissByOutside })

    // Measured here rather than inside computePosition: the helper is pure so it
    // can be tested in jsdom, which has no layout engine at all.
    useLayoutEffect(() => {
      if (!open) return
      const anchor = triggerRef.current
      const panel = panelRef.current
      if (!anchor || !panel) return

      const update = () => {
        const rect = anchor.getBoundingClientRect()
        setPlacement(
          computePosition(
            { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            { width: panel.offsetWidth, height: panel.offsetHeight },
            { width: window.innerWidth, height: window.innerHeight },
            { side, align },
          ),
        )
      }

      update()
      window.addEventListener('resize', update)
      window.addEventListener('scroll', update, true)
      return () => {
        window.removeEventListener('resize', update)
        window.removeEventListener('scroll', update, true)
      }
    }, [open, side, align])

    // The roving part: the focused item actually receives DOM focus.
    useEffect(() => {
      if (!open || focusIndex < 0) return
      itemRefs.current[focusIndex]?.focus()
    }, [open, focusIndex])

    const activate = useCallback(
      (index: number) => {
        const item = items[index]
        if (!item || item.disabled) return
        item.onSelect?.()
        close(true)
      },
      [items, close],
    )

    const jumpByTypeahead = useCallback(
      (key: string) => {
        const now = Date.now()
        const buffer =
          now - typeahead.current.at > TYPEAHEAD_RESET
            ? key.toLowerCase()
            : typeahead.current.buffer + key.toLowerCase()
        typeahead.current = { buffer, at: now }

        const index = items.findIndex(
          (item) => !item.disabled && item.label.toLowerCase().startsWith(buffer),
        )
        if (index >= 0) setFocusIndex(index)
      },
      [items],
    )

    const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || disabled || open) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        openMenu(firstEnabled(items))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        openMenu(lastEnabled(items))
      }
      // Enter and Space are left alone: the browser turns them into a click on
      // a real <button>, which opens the menu through the click handler.
    }

    const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusIndex((index) => step(items, index, 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusIndex((index) => step(items, index, -1))
          break
        case 'Home':
          event.preventDefault()
          setFocusIndex(firstEnabled(items))
          break
        case 'End':
          event.preventDefault()
          setFocusIndex(lastEnabled(items))
          break
        case 'Enter':
        case ' ':
          // Handled here rather than left to the button's native activation, so
          // an item cannot fire twice from one key press.
          event.preventDefault()
          activate(focusIndex)
          break
        case 'Tab':
          close(false)
          break
        default:
          if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            jumpByTypeahead(event.key)
          }
      }
    }

    return (
      <>
        <button
          {...rest}
          ref={setRefs}
          id={triggerId}
          type={type}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          disabled={disabled}
          className={cx('hal-dropdown-menu', className)}
          onPointerDown={(event) => {
            onPointerDown?.(event)
            closedByTrigger.current = open
          }}
          onKeyDown={handleTriggerKeyDown}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            if (closedByTrigger.current) {
              closedByTrigger.current = false
              return
            }
            if (open) close(true)
            else openMenu(firstEnabled(items))
          }}
        >
          {trigger}
        </button>

        {open
          ? createPortal(
              <div
                ref={panelRef}
                id={menuId}
                role="menu"
                aria-labelledby={triggerId}
                className={cx(
                  'hal-dropdown-menu__panel',
                  `hal-dropdown-menu__panel--${placement.side}`,
                )}
                style={{ position: 'fixed', left: placement.x, top: placement.y }}
                onKeyDown={handleMenuKeyDown}
              >
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    ref={(node) => {
                      itemRefs.current[index] = node
                    }}
                    type="button"
                    role="menuitem"
                    // Roving focus: nothing in the menu is in the tab order, and
                    // the item the user arrowed to holds real focus instead.
                    tabIndex={-1}
                    // aria-disabled rather than the disabled attribute: a
                    // disabled button is unreachable, so a screen reader user
                    // never learns the item is there.
                    aria-disabled={item.disabled || undefined}
                    className={cx(
                      'hal-dropdown-menu__item',
                      item.disabled && 'hal-dropdown-menu__item--disabled',
                    )}
                    onClick={() => activate(index)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>,
              document.body,
            )
          : null}
      </>
    )
  },
)
