import { describe, expect, it } from 'vitest'
import * as api from './index'

describe('public API', () => {
  it('exports the color-mode entry points from the package root', () => {
    expect(typeof api.useColorMode).toBe('function')
    expect(typeof api.ColorModeScript).toBe('function')
  })

  it('exports every component', () => {
    const expected = [
      'Alert',
      'Avatar',
      'Badge',
      'Card',
      'Progress',
      'Skeleton',
      'Spinner',
      'Table',
      'Tag',
      'Button',
      'Checkbox',
      'IconButton',
      'Input',
      'NumberInput',
      'Radio',
      'Select',
      'Slider',
      'Switch',
      'Textarea',
    ]
    const missing = expected.filter((name) => !(name in api))
    expect(missing).toEqual([])
  })

  it('does not leak internal helpers', () => {
    expect('cx' in api).toBe(false)
  })
})
