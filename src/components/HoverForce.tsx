import { motion, useSpring } from 'motion/react'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'

interface HoverForceProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** Radius in px where the cursor starts pushing. */
  threshold?: number
  /** Maximum travel in px when the cursor sits on the element. */
  distance?: number
  mode?: 'repel' | 'attract'
}

/**
 * Port of the "Hover Force" component the reference uses: inside `threshold` px of
 * the cursor the element slides vertically away from it (or towards it), scaled by
 * how close the cursor is. Spring matches its default smoothing of 10
 * (stiffness 1000, damping 150).
 */
export function HoverForce({ children, className, style, threshold = 200, distance = 120, mode = 'repel' }: HoverForceProps) {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = useMediaQuery(REDUCED_MOTION)
  const ref = useRef<HTMLDivElement>(null)
  const y = useSpring(0, { stiffness: 1000, damping: 150, mass: 1 })

  useEffect(() => {
    if (!fine || reduced) {
      y.set(0)
      return
    }
    const sign = mode === 'attract' ? 1 : -1
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        // Measure from the resting position, not the pushed one.
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2 - y.get()
        const d = Math.hypot(e.clientX - cx, e.clientY - cy)
        const strength = Math.max(0, 1 - d / threshold)
        const dir = e.clientY > cy ? 1 : -1
        y.set(strength * distance * dir * sign)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [fine, reduced, threshold, distance, mode, y])

  return (
    <motion.div ref={ref} className={className} style={{ ...style, y }}>
      {children}
    </motion.div>
  )
}
