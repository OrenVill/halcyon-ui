import { useCallback, useEffect, useState } from 'react'

export type ColorMode = 'light' | 'dark' | 'system'
export type ResolvedColorMode = 'light' | 'dark'

export interface UseColorModeResult {
  /** The stored preference, including 'system'. */
  mode: ColorMode
  /** The mode actually in effect. */
  resolvedMode: ResolvedColorMode
  setMode: (mode: ColorMode) => void
  /** Sets an explicit mode opposite to resolvedMode. */
  toggle: () => void
}

export const COLOR_MODE_STORAGE_KEY = 'halcyon-mode'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isColorMode(value: unknown): value is ColorMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readStoredMode(): ColorMode {
  try {
    const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY)
    if (isColorMode(stored)) return stored
  } catch {
    // Storage can be disabled or full. The default is a fine answer.
  }
  return 'system'
}

function writeStoredMode(mode: ColorMode): void {
  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode)
  } catch {
    // A preference that cannot be persisted still applies for this session.
  }
}

export function useColorMode(): UseColorModeResult {
  // Both pieces of state start at a constant so the first render is
  // deterministic and matches server-rendered markup. Effects correct them.
  const [mode, setModeState] = useState<ColorMode>('system')
  const [systemMode, setSystemMode] = useState<ResolvedColorMode>('light')

  useEffect(() => {
    setModeState(readStoredMode())
  }, [])

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const sync = (event: { matches: boolean }) => {
      setSystemMode(event.matches ? 'dark' : 'light')
    }
    sync(query)
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const resolvedMode: ResolvedColorMode = mode === 'system' ? systemMode : mode

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'system') root.removeAttribute('data-mode')
    else root.setAttribute('data-mode', mode)
  }, [mode])

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next)
    writeStoredMode(next)
  }, [])

  const toggle = useCallback(() => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark')
  }, [resolvedMode, setMode])

  return { mode, resolvedMode, setMode, toggle }
}
