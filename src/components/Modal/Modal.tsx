import { forwardRef, useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'
import { lockBodyScroll } from '../../internal/scrollLock'
import { useDismissable } from '../../hooks/useDismissable'
import { useFocusTrap } from '../../hooks/useFocusTrap'

export type ModalSize = 'sm' | 'md' | 'lg'

// `title` on a div is the native tooltip attribute, a plain string. The
// library's title is a rendered heading node, so the native one is omitted
// from the extended type and redeclared here.
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the modal is shown. Closed renders nothing at all. */
  open: boolean
  /** Called on Escape, a backdrop click, and the close button. */
  onClose: () => void
  /** Heading for the dialog. Without one, pass an `aria-label`. */
  title?: ReactNode
  /** Maximum width of the panel. Defaults to 'md'. */
  size?: ModalSize
  /** Accessible name of the close button. Defaults to 'Close'. */
  closeLabel?: string
}

export const Modal = /* @__PURE__ */ forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    title,
    size = 'md',
    closeLabel = 'Close',
    className,
    children,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  const titleId = useId()
  const hasTitle = title !== undefined && title !== null

  useFocusTrap(panelRef, open)
  useDismissable(panelRef, { onDismiss: onClose, active: open })

  useEffect(() => {
    if (!open) return
    return lockBodyScroll()
  }, [open])

  // Nothing at all when closed: a hidden panel still holds its children in the
  // accessibility tree and keeps their effects running.
  if (!open) return null

  return createPortal(
    // Portalled to the body so no ancestor's `overflow` can clip the overlay.
    <div className="hal-modal-backdrop" data-hal-overlay="modal">
      <div
        {...rest}
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        // The title names the dialog when there is one; otherwise whatever
        // the caller supplied stands, and no name is invented.
        aria-labelledby={hasTitle ? titleId : ariaLabelledBy}
        className={cx('hal-modal', `hal-modal--${size}`, className)}
      >
        <div className="hal-modal__header">
          {hasTitle ? (
            <h2 className="hal-modal__title" id={titleId}>
              {title}
            </h2>
          ) : null}
          {/* A real button, not a clickable span: keyboard focus, Enter and
              Space all come from the platform. */}
          <button
            type="button"
            className="hal-modal__close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <span className="hal-modal__close-glyph" aria-hidden="true">
              &times;
            </span>
          </button>
        </div>
        <div className="hal-modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
})
