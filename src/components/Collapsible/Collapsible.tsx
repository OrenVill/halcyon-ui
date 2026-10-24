import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

interface CollapsibleContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null)

function useCollapsibleContext(): CollapsibleContextValue {
  const ctx = useContext(CollapsibleContext)
  if (!ctx) {
    throw new Error('Collapsible subcomponents must be rendered inside <Collapsible>.')
  }
  return ctx
}

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

const CollapsibleRoot = /* @__PURE__ */ forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible(
    { open, defaultOpen = false, onOpenChange, className, children, ...rest },
    ref,
  ) {
    const isControlled = open !== undefined
    const [internalOpen, setInternalOpen] = useState(defaultOpen)
    const isOpen = isControlled ? open : internalOpen

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next)
        onOpenChange?.(next)
      },
      [isControlled, onOpenChange],
    )

    const value = useMemo(() => ({ open: isOpen, setOpen }), [isOpen, setOpen])

    return (
      <CollapsibleContext.Provider value={value}>
        <div {...rest} ref={ref} className={cx('hal-collapsible', className)} data-state={isOpen ? 'open' : 'closed'}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  },
)

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const CollapsibleTrigger = /* @__PURE__ */ forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(function CollapsibleTrigger({ className, type = 'button', onClick, ...rest }, ref) {
  const { open, setOpen } = useCollapsibleContext()

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      aria-expanded={open}
      className={cx('hal-collapsible__trigger', className)}
      onClick={(event) => {
        setOpen(!open)
        onClick?.(event)
      }}
    />
  )
})

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CollapsibleContent = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(function CollapsibleContent({ className, children, hidden, ...rest }, ref) {
  const { open } = useCollapsibleContext()

  if (!open) return null

  return (
    <div
      {...rest}
      ref={ref}
      hidden={hidden}
      className={cx('hal-collapsible__content', className)}
    >
      {children}
    </div>
  )
})

export interface CollapsibleComponent
  extends ReturnType<typeof forwardRef<HTMLDivElement, CollapsibleProps>> {
  Trigger: typeof CollapsibleTrigger
  Content: typeof CollapsibleContent
}

export const Collapsible = Object.assign(CollapsibleRoot, {
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
}) as CollapsibleComponent
