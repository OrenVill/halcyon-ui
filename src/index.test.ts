import { describe, expect, it } from 'vitest'
import * as api from './index'

describe('public API', () => {
  it('exports the color-mode entry points from the package root', () => {
    expect(typeof api.useColorMode).toBe('function')
    expect(typeof api.ColorModeScript).toBe('function')
  })

  it('does not leak internal helpers', () => {
    expect('cx' in api).toBe(false)
  })
})
