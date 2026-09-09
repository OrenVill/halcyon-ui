import { vi } from 'vitest'

type Listener = (event: MediaQueryListEvent) => void

/**
 * Replaces window.matchMedia with a controllable stub.
 * Returns a setter that flips the preference and notifies listeners,
 * the way a real browser does when the OS theme changes.
 */
export function stubMatchMedia(initialDark: boolean) {
  let dark = initialDark
  const listeners = new Set<Listener>()

  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return query.includes('dark') ? dark : !dark
    },
    addEventListener: (_: string, listener: Listener) => {
      listeners.add(listener)
    },
    removeEventListener: (_: string, listener: Listener) => {
      listeners.delete(listener)
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }))

  return function setDark(next: boolean) {
    dark = next
    for (const listener of listeners) {
      listener({ matches: next } as MediaQueryListEvent)
    }
  }
}
