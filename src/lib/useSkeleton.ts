import { useEffect, useRef, useState } from 'react'

/**
 * True for `ms` after the first render and after every change of `deps`.
 * Shows the skeleton while a result is being worked out, so cards fade in instead of popping up.
 * The data in this prototype is local, so the short delay is presentational, not a real request.
 */
export function useSkeleton(deps: readonly unknown[], ms = 450, onMount = true): boolean {
  const [pending, setPending] = useState(onMount)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; if (!onMount) return }
    setPending(true)
    const id = window.setTimeout(() => setPending(false), ms)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return pending
}
