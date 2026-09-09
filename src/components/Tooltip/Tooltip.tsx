import {
  Children,
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react'
import { cx } from '../../internal/cx'
import { useDismissable } from '../../hooks/useDismissable'
import { computePosition } from '../../internal/position'
import type { Align, Placement, Side } from '../../internal/position'

/**
 * ACCESSIBILITY, NOT NEGOTIABLE: a tooltip is unreachable on a touch device.
 * There is no hover and no keyboard focus to open it, so its text may only
 * DESCRIBE something that is already labelled — a hint, an expansion, a
 * keyboard shortcut. It must never be the only place a piece of information
 * appears, and the trigger must make sense with the tooltip removed. If the
 * text is required to understand the control, it belongs in the page.
 *
 * The panel is `aria-describedby`, never `aria-labelledby`, for the same
 * reason, it carries `pointer-events: none` so it can never be interacted
 * with, and it must not contain interactive content: nothing inside it can be
 * reached by keyboard or touch.
 */

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'children'> {
  /** The describing text. Keep it short and non-essential. */
  content: ReactNode
  /** The trigger. A single element that accepts a ref and DOM handlers. */
  children: ReactElement
  /** Preferred side. Defaults to 'top'. Flips when there is no room. */
  side?: Side
  /** Alignment along the trigger's cross axis. Defaults to 'center'. */
  align?: Align
  /** Milliseconds of hover before opening. Defaults to 400. */
  openDelay?: number
}

/** Props we read off and write back onto the cloned trigger. */
type TriggerProps = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as { current: T | null }).current = value
}

/** Runs the caller's handler first, then ours. Theirs may not be dropped. */
function chain<E>(theirs: ((event: E) => void) | undefined, ours: (event: E) => void) {
  return (event: E) => {
    theirs?.(event)
    ours(event)
  }
}

export const Tooltip = /* @__PURE__ */ forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { content, children, side = 'top', align = 'center', openDelay = 400, className, style, ...rest },
  ref,
) {
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<Placement>({ x: 0, y: 0, side })

  const triggerRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const id = useId()

  // The trigger may carry a ref of its own. Stored during render so the merged
  // ref callback below can stay stable and does not detach on every render.
  const childRef = useRef<Ref<HTMLElement> | undefined>(undefined)
  childRef.current = (Children.only(children) as ReactElement<TriggerProps>).props.ref

  const setTriggerRef = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node
    assignRef(childRef.current, node)
  }, [])

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )

  const cancel = useCallback(() => {
    if (timer.current !== undefined) clearTimeout(timer.current)
    timer.current = undefined
  }, [])

  // No delay on the way out. A tooltip that lingers over the thing you have
  // already moved on from is worse than one that is slow to arrive.
  const hide = useCallback(() => {
    cancel()
    setOpen(false)
  }, [cancel])

  const openNow = useCallback(() => {
    cancel()
    setOpen(true)
  }, [cancel])

  const openAfterDelay = useCallback(() => {
    cancel()
    timer.current = setTimeout(() => setOpen(true), openDelay)
  }, [cancel, openDelay])

  useEffect(() => cancel, [cancel])

  // Measured in a layout effect so the first paint is already in place: the
  // panel never appears at the origin and jumps. Fixed coordinates are
  // viewport coordinates, which is exactly what getBoundingClientRect returns.
  useLayoutEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return

    const anchor = trigger.getBoundingClientRect()
    const box = panel.getBoundingClientRect()
    setPlacement(
      computePosition(
        { x: anchor.x, y: anchor.y, width: anchor.width, height: anchor.height },
        { width: box.width, height: box.height },
        { width: window.innerWidth, height: window.innerHeight },
        { side, align },
      ),
    )
  }, [open, side, align, content])

  // Escape closes. Hover and focus already have their own exits; a keyboard
  // user who wants the tooltip out of the way has none without this. Outside
  // clicks are left alone: the panel is not a hit target, and pointer leave
  // and blur already cover every way of moving away from the trigger.
  useDismissable(panelRef, { onDismiss: hide, active: open, closeOnOutside: false })

  const child = Children.only(children) as ReactElement<TriggerProps>
  const childProps = child.props

  const trigger = cloneElement(child, {
    ref: setTriggerRef,
    // Only while the panel exists: a dangling reference describes nothing.
    'aria-describedby': cx(childProps['aria-describedby'], open && id) || undefined,
    onPointerEnter: chain(childProps.onPointerEnter, openAfterDelay),
    onPointerLeave: chain(childProps.onPointerLeave, hide),
    // Focus opens immediately. A keyboard user asked for this explicitly;
    // the delay exists only to keep a drifting pointer quiet.
    onFocus: chain(childProps.onFocus, openNow),
    onBlur: chain(childProps.onBlur, hide),
  } as Partial<TriggerProps>)

  return (
    <>
      {trigger}
      {open
        ? createPortal(
            <div
              {...rest}
              ref={setPanelRef}
              id={id}
              role="tooltip"
              data-side={placement.side}
              className={cx('hal-tooltip', `hal-tooltip--${placement.side}`, className)}
              style={{ position: 'fixed', left: placement.x, top: placement.y, ...style }}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  )
})
