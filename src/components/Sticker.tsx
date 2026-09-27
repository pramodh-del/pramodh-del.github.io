import { motion, useSpring } from 'motion/react'
import { useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { DESKTOP_DRAG, useMediaQuery } from '../hooks/useMediaQuery'
import { clamp, nextZ } from '../lib/pointer'

interface StickerProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** Resting tilt in degrees, like a sticker slapped on at an angle. */
  rotate?: number
  /** Keeps the sticker inside this element while dragging. */
  bounds?: RefObject<HTMLElement | null>
  label?: string
  /** Click / Enter action. A drag never counts as a click. */
  onActivate?: () => void
  cursor?: 'drag' | 'see'
}

const TILT_SPRING = { stiffness: 260, damping: 18, mass: 0.6 }
const MAX_TILT = 28

/**
 * A draggable object that behaves like a piece of card in 3D space.
 * Drag follows the reference (Framer `drag`, `dragMomentum: false`, grabbing on tap),
 * and adds a velocity-driven rotateX / rotateY tilt with perspective so it swings
 * as you move it and springs flat when you let go.
 */
export function Sticker({ children, className = '', style, rotate = 0, bounds, label, onActivate, cursor = 'drag' }: StickerProps) {
  const enabled = useMediaQuery(DESKTOP_DRAG)
  const rx = useSpring(0, TILT_SPRING)
  const ry = useSpring(0, TILT_SPRING)
  const [z, setZ] = useState<number | undefined>(undefined)
  const settle = useRef<number | undefined>(undefined)
  const dragged = useRef(false)

  const flatten = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      className={`sticker-3d ${enabled ? 'is-draggable' : ''} ${className}`}
      style={{
        ...style,
        rotate,
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 900,
        zIndex: z ?? style?.zIndex,
      }}
      aria-label={label}
      role={onActivate ? 'button' : undefined}
      tabIndex={onActivate ? 0 : undefined}
      onClick={
        onActivate
          ? () => {
              if (!dragged.current) onActivate()
            }
          : undefined
      }
      onKeyDown={
        onActivate
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onActivate()
              }
            }
          : undefined
      }
      data-cursor={enabled || onActivate ? cursor : undefined}
      drag={enabled}
      dragMomentum={false}
      dragConstraints={bounds}
      dragElastic={0.14}
      whileHover={enabled ? { scale: 1.03 } : undefined}
      whileTap={enabled ? { scale: 1.06, cursor: 'grabbing' } : undefined}
      whileDrag={{ scale: 1.08, filter: 'drop-shadow(0px 22px 26px rgba(20,22,31,0.28))' }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
      onPointerDown={() => {
        dragged.current = false
        if (enabled) setZ(nextZ())
      }}
      onDragStart={() => {
        dragged.current = true
      }}
      onDrag={(_, info) => {
        ry.set(clamp(info.velocity.x / 55, -MAX_TILT, MAX_TILT))
        rx.set(clamp(-info.velocity.y / 55, -MAX_TILT, MAX_TILT))
        window.clearTimeout(settle.current)
        settle.current = window.setTimeout(flatten, 90)
      }}
      onDragEnd={() => {
        window.clearTimeout(settle.current)
        flatten()
      }}
    >
      {children}
    </motion.div>
  )
}
