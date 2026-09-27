import { motionValue } from 'motion/react'

// One shared pointer position for every cursor-reactive effect, so the page
// runs a single pointermove listener instead of one per component.
export const pointerX = motionValue(-200)
export const pointerY = motionValue(-200)

let tracking = false

export function startPointerTracking() {
  if (tracking || typeof window === 'undefined') return
  tracking = true
  window.addEventListener(
    'pointermove',
    (e) => {
      pointerX.set(e.clientX)
      pointerY.set(e.clientY)
    },
    { passive: true },
  )
}

let topZ = 10

/** Brings a dragged item above everything else it shares a stacking context with. */
export function nextZ() {
  topZ += 1
  return topZ
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
