import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubMatchMedia } from '../test/matchMedia'
import { useColorMode } from './useColorMode'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useColorMode', () => {
  it('starts in system mode and resolves from the system preference', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useColorMode())

    expect(result.current.mode).toBe('system')
    expect(result.current.resolvedMode).toBe('dark')
    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })

  it('follows the system preference when it changes', () => {
    const setDark = stubMatchMedia(false)
    const { result } = renderHook(() => useColorMode())
    expect(result.current.resolvedMode).toBe('light')

    act(() => setDark(true))
    expect(result.current.resolvedMode).toBe('dark')
  })

  it('writes data-mode on the document for an explicit mode', () => {
    stubMatchMedia(false)
    const { result } = renderHook(() => useColorMode())

    act(() => result.current.setMode('dark'))

    expect(result.current.mode).toBe('dark')
    expect(result.current.resolvedMode).toBe('dark')
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
  })

  it('removes data-mode when returning to system', () => {
    stubMatchMedia(false)
    const { result } = renderHook(() => useColorMode())

    act(() => result.current.setMode('dark'))
    act(() => result.current.setMode('system'))

    expect(document.documentElement.hasAttribute('data-mode')).toBe(false)
  })

  it('ignores the system preference once a mode is explicit', () => {
    const setDark = stubMatchMedia(false)
    const { result } = renderHook(() => useColorMode())

    act(() => result.current.setMode('light'))
    act(() => setDark(true))

    expect(result.current.resolvedMode).toBe('light')
  })

  it('toggle from system produces an explicit opposite mode', () => {
    stubMatchMedia(true)
    const { result } = renderHook(() => useColorMode())

    act(() => result.current.toggle())

    expect(result.current.mode).toBe('light')
    expect(document.documentElement.getAttribute('data-mode')).toBe('light')
  })

  it('persists the choice and restores it on the next mount', () => {
    stubMatchMedia(false)
    const first = renderHook(() => useColorMode())
    act(() => first.result.current.setMode('dark'))
    expect(localStorage.getItem('halcyon-mode')).toBe('dark')
    first.unmount()

    const second = renderHook(() => useColorMode())
    expect(second.result.current.mode).toBe('dark')
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
  })

  it('ignores a corrupt stored value', () => {
    stubMatchMedia(false)
    localStorage.setItem('halcyon-mode', 'chartreuse')

    const { result } = renderHook(() => useColorMode())

    expect(result.current.mode).toBe('system')
  })

  it('renders correctly when storage throws', () => {
    stubMatchMedia(false)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    const { result } = renderHook(() => useColorMode())
    expect(result.current.mode).toBe('system')

    act(() => result.current.setMode('dark'))
    expect(result.current.resolvedMode).toBe('dark')

    vi.restoreAllMocks()
  })
})
