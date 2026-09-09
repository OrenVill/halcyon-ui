/*
 * Reference-counted body scroll lock, shared by every modal surface.
 *
 * Two rules make this less trivial than it looks. It must restore the page's
 * PREVIOUS overflow rather than a hardcoded 'visible', because a page that was
 * already locked must stay locked. And with two overlays open at once, the
 * first one to close must not unlock the page under the second, which is what
 * the count is for.
 *
 * This lives in internal/ so both Modal and Drawer share one counter. The rule
 * that components never import each other is about components; shared helpers
 * are exactly what this directory is for.
 */

let count = 0
let previousOverflow = ''

/** Locks scrolling and returns an idempotent release function. */
export function lockBodyScroll(): () => void {
  if (count === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  count += 1

  let released = false
  return function release() {
    // Idempotent: StrictMode runs cleanup twice, and a double decrement would
    // unlock the page while another overlay is still open.
    if (released) return
    released = true

    count -= 1
    if (count === 0) document.body.style.overflow = previousOverflow
  }
}
