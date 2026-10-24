import { describe, expect, it } from 'vitest'
import * as display from './display'
import * as form from './form'
import * as hooks from './hooks'
import * as navigation from './navigation'
import * as overlay from './overlay'
import * as primitives from './primitives'

describe('category slices', () => {
  it('navigation exports the nav building blocks', () => {
    expect('Tabs' in navigation).toBe(true)
    expect('Breadcrumb' in navigation).toBe(true)
    expect('Wizard' in navigation).toBe(true)
    expect('Button' in navigation).toBe(false)
  })

  it('form exports inputs and actions', () => {
    expect('Button' in form).toBe(true)
    expect('Combobox' in form).toBe(true)
    expect('Modal' in form).toBe(false)
  })

  it('overlay exports dialogs and positioning', () => {
    expect('Modal' in overlay).toBe(true)
    expect(typeof overlay.computePosition).toBe('function')
  })

  it('display exports read-only surfaces', () => {
    expect('Card' in display).toBe(true)
    expect('Table' in display).toBe(true)
  })

  it('primitives exports layout and field helpers', () => {
    expect('Link' in primitives).toBe(true)
    expect('Field' in primitives).toBe(true)
    expect(typeof primitives.useFieldControlProps).toBe('function')
  })

  it('hooks exports color mode and overlay helpers', () => {
    expect(typeof hooks.useColorMode).toBe('function')
    expect(typeof hooks.useFocusTrap).toBe('function')
  })
})
