import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { HTMLAttributes, ReactNode, Ref, RefObject } from 'react'
import { cx } from '../../internal/cx'
import { useDismissable } from '../../hooks/useDismissable'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { computePosition } from '../../internal/position'
import type { Align, Placement, Side } from '../../internal/position'

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled. The popover renders nothing while false. */
  open: boolean
  /** Called on Escape and on a pointer going down outside the panel. */
  onClose: () => void
  /** The element the panel is positioned against. */
  anchorRef: RefObject<HTMLElement | null>
  /** Preferred side. Defaults to 'bottom'. Flips when there is no room. */
  side?: Side
  /** Alignment along the anchor's cross axis. Defaults to 'center'. */
  align?: Align
  children?: ReactNode
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as { current: T | null }).current = value
}

/**
 * An anchored dialog: focus trapped while open, focus restored on close,
 * dismissed by Escape and by a click outside.
 *
 * LABELLING IS THE CALLER'S JOB. `role="dialog"` needs an accessible name and
 * only the caller knows what this panel is, so pass `aria-label` or
 * `aria-labelledby`. Inventing one here would produce a name that is always
 * wrong rather than sometimes missing.
 */
export const Popover = /* @__PURE__ */ forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { open, onClose, anchorRef, side = 'bottom', align = 'center', className, style, children, ...rest },
  ref,
) {
  const [placement, setPlacement] = useState<Placement>({ x: 0, y: 0, side })
  const panelRef = useRef<HTMLDivElement | null>(null)

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )

  // Measuring is the caller's half of the bargain: computePosition is pure and
  // takes rectangles. Fixed coordinates are viewport coordinates, which is
  // exactly what getBoundingClientRect returns, so no scroll maths is needed.
  const reposition = useCallback(() => {
    const anchor = anchorRef.current
    const panel = panelRef.current
    if (!anchor || !panel) return

    const rect = anchor.getBoundingClientRect()
    const box = panel.getBoundingClientRect()
    setPlacement(
      computePosition(
        { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        { width: box.width, height: box.height },
        { width: window.innerWidth, height: window.innerHeight },
        { side, align },
      ),
    )
  }, [anchorRef, side, align])

  // Before paint, so the panel is never painted at the origin first.
  useLayoutEffect(() => {
    if (open) reposition()
  }, [open, reposition])

  // While open only: the listeners go away with the panel. Scroll is captured
  // because the anchor may sit inside a scroll container, and a scroll there
  // does not reach the window in the bubble phase.
  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [open, reposition])

  useFocusTrap(panelRef, open)
  useDismissable(panelRef, { onDismiss: onClose, active: open })

  if (!open) return null

  return createPortal(
    <div
      {...rest}
      ref={setPanelRef}
      role="dialog"
      data-side={placement.side}
      className={cx('hal-popover', `hal-popover--${placement.side}`, className)}
      style={{ position: 'fixed', left: placement.x, top: placement.y, ...style }}
    >
      {children}
    </div>,
    document.body,
  )
})
