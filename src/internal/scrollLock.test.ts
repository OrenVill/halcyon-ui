import { afterEach, describe, expect, it } from 'vitest'
import { lockBodyScroll } from './scrollLock'

afterEach(() => {
  document.body.style.overflow = ''
})

describe('lockBodyScroll', () => {
  it('locks and restores the previous value, not a hardcoded default', () => {
    document.body.style.overflow = 'scroll'
    const release = lockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')
    release()
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('leaves an already-hidden page hidden', () => {
    document.body.style.overflow = 'hidden'
    const release = lockBodyScroll()
    release()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('does not unlock while a second overlay still holds the lock', () => {
    document.body.style.overflow = 'auto'
    const first = lockBodyScroll()
    const second = lockBodyScroll()

    first()
    expect(document.body.style.overflow).toBe('hidden')

    second()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('ignores a repeated release, so a double cleanup cannot unlock the page', () => {
    const first = lockBodyScroll()
    const second = lockBodyScroll()

    first()
    first()
    expect(document.body.style.overflow).toBe('hidden')

    second()
    expect(document.body.style.overflow).toBe('')
  })
})
