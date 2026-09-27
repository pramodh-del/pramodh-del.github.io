import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Mouse or trackpad: the only case where a custom cursor makes sense. */
export const FINE_POINTER = '(hover: hover) and (pointer: fine)'
/** Desktop layout with a mouse: floating stickers are draggable here. */
export const DESKTOP_DRAG = '(min-width: 761px) and (hover: hover) and (pointer: fine)'
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
