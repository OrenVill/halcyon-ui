/*
 * vitest-axe ships its matchers but does not register their types with
 * Vitest's Assertion interface, so `toHaveNoViolations` type-checks only once
 * it is declared here. The matcher itself is wired up in vitest.setup.ts.
 */
import 'vitest'
import type { AxeMatchers } from 'vitest-axe/matchers'

declare module 'vitest' {
  // The type parameter is required to merge with Vitest's own generic
  // Assertion interface, even though this declaration does not use it.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Assertion<T = unknown> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
