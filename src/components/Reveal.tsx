import { motion, useMotionValue, useSpring, type HTMLMotionProps } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { FINE_POINTER, useMediaQuery } from '../hooks/useMediaQuery'

const EASE = [0.44, 0, 0.56, 1] as const

/** Reference "appear" preset: fades up 40px, 0.4s after a 0.45s delay, once. */
export function FadeUp({ children, delay = 0.45, ...rest }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0.001, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * Reference "Text" box entrance: starts rotated -10° and lands on a heavy,
 * wobbly spring (stiffness 693, damping 30, mass 7.3) when half visible.
 */
export function SpringIn({
  children,
  rotate = 0,
  ...rest
}: HTMLMotionProps<'div'> & { rotate?: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ rotate: rotate - 10 }}
      whileInView={{ rotate }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: 'spring', stiffness: 693, damping: 30, mass: 7.3 }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * 3D hover tilt: the card leans towards the cursor (±max°) in perspective and
 * lifts slightly, then springs flat when the cursor leaves.
 */
export function Tilt({
  children,
  max = 7,
  className,
  ...rest
}: HTMLMotionProps<'div'> & { max?: number; children: ReactNode }) {
  const fine = useMediaQuery(FINE_POINTER)
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 220, damping: 20 })
  const sry = useSpring(ry, { stiffness: 220, damping: 20 })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      whileHover={fine ? { scale: 1.015 } : undefined}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
      onPointerMove={(e) => {
        if (!fine || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        ry.set(px * max * 2)
        rx.set(-py * max * 2)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
