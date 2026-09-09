import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

// jsdom implements no layout, so scrollIntoView simply does not exist on
// Element. Components that keep an active item in view call it legitimately.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-mode')
  localStorage.clear()
})
