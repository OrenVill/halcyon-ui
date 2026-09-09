import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger'

export interface ToastOptions {
  title: string
  description?: string
  /** Defaults to 'info'. */
  variant?: ToastVariant
  /**
   * Milliseconds before the toast dismisses itself. `null` or `Infinity` keeps
   * it up until something dismisses it. Defaults to the provider's duration.
   */
  duration?: number | null
}

export interface ToastRecord extends ToastOptions {
  id: string
}

export interface ToastContextValue {
  /** Queues a toast and returns its id. */
  toast: (options: ToastOptions) => string
  /** Removes one toast by id. Unknown ids are ignored. */
  dismiss: (id: string) => void
}

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  variant?: ToastVariant
  /** Renders the dismiss button when supplied. */
  onDismiss?: () => void
  /** Accessible name of the dismiss button. */
  dismissLabel?: string
}

export interface ToastProviderProps {
  children?: ReactNode
  /** Default milliseconds before a toast dismisses itself. Defaults to 5000. */
  duration?: number | null
  /** Accessible name of the region the toasts live in. */
  label?: string
}

const DEFAULT_DURATION = 5000

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * One toast. Exported because a consumer may want the visual without the
 * provider, but the surface that matters is ToastProvider plus useToast.
 *
 * A danger toast takes role="alert", which carries an implicit assertive live
 * region and so interrupts. Everything else inherits the polite region around
 * it: an announcement that talks over the user is a bug unless the message is
 * genuinely urgent.
 */
export const Toast = /* @__PURE__ */ forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    title,
    description,
    variant = 'info',
    onDismiss,
    dismissLabel = 'Dismiss notification',
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      role={variant === 'danger' ? 'alert' : undefined}
      className={cx('hal-toast', `hal-toast--${variant}`, className)}
    >
      <div className="hal-toast__content">
        <p className="hal-toast__title">{title}</p>
        {description ? <p className="hal-toast__description">{description}</p> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="hal-toast__dismiss"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <span className="hal-toast__dismiss-glyph" aria-hidden="true">
            ×
          </span>
        </button>
      ) : null}
    </div>
  )
})

interface TimedToastProps {
  record: ToastRecord
  duration: number | null
  onDismiss: (id: string) => void
}

function TimedToast({ record, duration, onDismiss }: TimedToastProps) {
  const [paused, setPaused] = useState(false)
  const timed = duration !== null && Number.isFinite(duration)
  const remaining = useRef(timed ? Math.max(duration ?? 0, 0) : 0)

  // Held in a ref so a new toast arriving, which re-renders the provider and
  // hands every sibling a fresh callback, does not restart their timers.
  const dismiss = useRef(onDismiss)
  useEffect(() => {
    dismiss.current = onDismiss
  })

  useEffect(() => {
    if (!timed || paused) return

    const startedAt = Date.now()
    const timer = setTimeout(() => dismiss.current(record.id), remaining.current)

    return () => {
      clearTimeout(timer)
      // Bank the time already served, so resuming finishes the countdown
      // instead of starting it over.
      remaining.current = Math.max(remaining.current - (Date.now() - startedAt), 0)
    }
  }, [timed, paused, record.id])

  return (
    <Toast
      title={record.title}
      description={record.description}
      variant={record.variant}
      onDismiss={() => dismiss.current(record.id)}
      // A toast that vanishes mid-sentence, or as the user reaches for its
      // dismiss button, is unreadable. Hovering or focusing stops the clock.
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    />
  )
}

/**
 * Mounts the toast region and provides the queue. The only ambient component
 * in the library: everything else works standalone.
 */
export function ToastProvider({
  children,
  duration = DEFAULT_DURATION,
  label = 'Notifications',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((entry) => entry.id !== id))
  }, [])

  const toast = useCallback((options: ToastOptions) => {
    nextId.current += 1
    const id = `hal-toast-${nextId.current}`
    setToasts((current) => [...current, { ...options, id }])
    return id
  }, [])

  const value = useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss])

  const region =
    typeof document === 'undefined'
      ? null
      : createPortal(
          <div
            className="hal-toast-region"
            // A named landmark, so a screen reader user can navigate back to
            // the toasts they heard announced.
            role="region"
            aria-label={label}
            // Polite: an arriving toast waits for a pause rather than cutting
            // across whatever is being read.
            aria-live="polite"
          >
            {toasts.map((record) => (
              <TimedToast
                key={record.id}
                record={record}
                duration={record.duration === undefined ? duration : record.duration}
                onDismiss={dismiss}
              />
            ))}
          </div>,
          document.body,
        )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {region}
    </ToastContext.Provider>
  )
}

/** Queues and dismisses toasts. Must be called under a ToastProvider. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error(
      'useToast was called outside a ToastProvider. Wrap the tree that calls it, ' +
        'usually your app root, in <ToastProvider> from halcyon-ui.',
    )
  }
  return context
}
