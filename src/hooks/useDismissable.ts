import { useEffect } from 'react'
import type { RefObject } from 'react'

export interface DismissableOptions {
  onDismiss: () => void
  active?: boolean
  closeOnEscape?: boolean
  closeOnOutside?: boolean
}

/**
 * Dismisses on Escape and on a pointer going down outside the element.
 *
 * Pointer-down rather than click: a click fires only after release, by which
 * time focus has already moved and a control under the pointer has already
 * acted on an interaction the user meant as "close this".
 */
export function useDismissable(
  ref: RefObject<HTMLElement | null>,
  { onDismiss, active = true, closeOnEscape = true, closeOnOutside = true }: DismissableOptions,
): void {
  useEffect(() => {
    if (!active) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') onDismiss()
    }

    const onPointerDown = (event: Event) => {
      if (!closeOnOutside) return
      const element = ref.current
      if (element && !element.contains(event.target as Node)) onDismiss()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [ref, onDismiss, active, closeOnEscape, closeOnOutside])
}
