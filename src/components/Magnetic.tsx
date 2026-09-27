import { motion, useSpring } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'

/**
 * Pulls its child toward the cursor while the cursor is over it, then springs home.
 * Mouse only; on touch it is a plain wrapper.
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = useMediaQuery(REDUCED_MOTION)
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 })
  const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 })
  const on = fine && !reduced

  return (
    <motion.span
      ref={ref}
      className={`magnetic ${className ?? ''}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (!on || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
