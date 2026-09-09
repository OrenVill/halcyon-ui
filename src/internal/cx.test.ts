import { describe, expect, it } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('joins class names with a single space', () => {
    expect(cx('hal-button', 'hal-button--lg')).toBe('hal-button hal-button--lg')
  })

  it('drops falsy values so conditionals can be inlined', () => {
    expect(cx('hal-button', false, null, undefined, '')).toBe('hal-button')
  })

  it('returns an empty string when everything is falsy', () => {
    expect(cx(false, undefined)).toBe('')
  })

  it('keeps a consumer className last so it wins on equal specificity', () => {
    expect(cx('hal-card', 'custom')).toBe('hal-card custom')
  })
})
