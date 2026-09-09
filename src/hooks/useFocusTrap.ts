import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * Selector for things a user can Tab to. `[tabindex="-1"]` is excluded on
 * purpose: it is programmatically focusable but deliberately out of the tab
 * order, and pulling it back in would defeat the author's intent.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'

/**
 * `checkVisibility` is the standard test and browsers implement it. jsdom does
 * not, and it performs no layout anyway, so everything counts as visible
 * there. An earlier version filtered on `offsetParent`, which is null for
 * every element under jsdom and silently emptied the list.
 */
function isVisible(element: HTMLElement): boolean {
  return typeof element.checkVisibility === 'function' ? element.checkVisibility() : true
}

function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isVisible)
}

/**
 * Confines Tab to the container while active, and restores focus on the way
 * out. A dialog that closes and drops focus to the body strands a keyboard
 * user at the top of the page.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void {
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    const container = ref.current
    if (!container) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    // A container with nothing focusable still needs focus, or Tab escapes
    // immediately and the trap does nothing at all.
    const initial = focusableWithin(container)[0] ?? container
    if (initial === container && !container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '-1')
    }
    initial.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      // Queried on every Tab, not once on mount: an overlay's contents change
      // while it is open.
      const focusable = focusableWithin(container)
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === first || activeElement === container)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const restore = previouslyFocused.current
      // The element may have been removed while the overlay was open.
      if (restore && restore.isConnected) restore.focus()
    }
  }, [active, ref])
}
