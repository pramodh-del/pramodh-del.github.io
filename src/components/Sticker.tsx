import { animate, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { DESKTOP_DRAG, REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'
import { SCATTER } from '../lib/events'
import { clamp, nextZ } from '../lib/pointer'
import { sceneX, sceneY } from '../lib/scene'

interface StickerProps {
  children: ReactNode
  /** Classes for the sticker itself (its look). */
  className?: string
  /** Positioning for the outer wrapper, e.g. { left: 0, top: 380 }. */
  place?: CSSProperties
  placeClass?: string
  /** Resting tilt in degrees, like a sticker slapped on at an angle. */
  rotate?: number
  /** Keeps the sticker inside this element while dragging with a mouse. */
  bounds?: RefObject<HTMLElement | null>
  /** Parallax travel in px at full scene tilt; 0 keeps it still. */
  depth?: number
  /** Allow press-and-hold dragging on touch screens. */
  touchDrag?: boolean
  label?: string
  /** Click / tap / Enter action. A drag never counts as a click. */
  onActivate?: () => void
  cursor?: 'drag' | 'see'
}

const TILT_SPRING = { stiffness: 260, damping: 18, mass: 0.6 }
const DEPTH_SPRING = { stiffness: 90, damping: 18, mass: 0.8 }
const MAX_TILT = 28
const HOLD_MS = 320
const LIFT = { scale: 1.08, filter: 'drop-shadow(0px 22px 26px rgba(20,22,31,0.28))' }
const REST = { scale: 1, filter: 'drop-shadow(0px 0px 0px rgba(20,22,31,0))' }

/**
 * A draggable object that behaves like a piece of card in 3D space.
 *  - Mouse: drag like the reference (no momentum), tilting in rotateX / rotateY with
 *    drag velocity, then springing flat.
 *  - Touch: press and hold to pick it up, then drag. A quick swipe still scrolls.
 *  - Depth: drifts and leans with the scene tilt (cursor on desktop, phone tilt on mobile).
 *  - Scatter: flies to a random spot when the page asks.
 */
export function Sticker({
  children,
  className = '',
  place,
  placeClass = '',
  rotate = 0,
  bounds,
  depth = 0,
  touchDrag = false,
  label,
  onActivate,
  cursor = 'drag',
}: StickerProps) {
  const mouseDrag = useMediaQuery(DESKTOP_DRAG)
  const reduced = useMediaQuery(REDUCED_MOTION)
  const inner = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spin = useMotionValue(rotate)
  const rx = useSpring(0, TILT_SPRING)
  const ry = useSpring(0, TILT_SPRING)

  // Depth parallax + lean from the shared scene tilt. Phones get less travel: the layout is narrower.
  const travel = (mouseDrag ? 1 : 0.5) * depth
  const lean = depth ? 7 : 0
  const px = useSpring(
    useTransform(sceneX, (v) => (reduced ? 0 : v * travel)),
    DEPTH_SPRING,
  )
  const py = useSpring(
    useTransform(sceneY, (v) => (reduced ? 0 : v * travel * 0.6)),
    DEPTH_SPRING,
  )
  const sceneRx = useSpring(
    useTransform(sceneY, (v) => (reduced ? 0 : -v * lean)),
    DEPTH_SPRING,
  )
  const sceneRy = useSpring(
    useTransform(sceneX, (v) => (reduced ? 0 : v * lean)),
    DEPTH_SPRING,
  )
  const rotateX = useTransform(() => rx.get() + sceneRx.get())
  const rotateY = useTransform(() => ry.get() + sceneRy.get())

  const [z, setZ] = useState<number | undefined>(undefined)
  const [lifted, setLifted] = useState(false)
  const settle = useRef<number | undefined>(undefined)
  const dragged = useRef(false)

  const flatten = () => {
    rx.set(0)
    ry.set(0)
  }
  const tiltFrom = (vx: number, vy: number) => {
    ry.set(clamp(vx / 55, -MAX_TILT, MAX_TILT))
    rx.set(clamp(-vy / 55, -MAX_TILT, MAX_TILT))
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(flatten, 90)
  }

  // Scatter: fly somewhere nearby with a spin, like a table being bumped.
  useEffect(() => {
    const onScatter = () => {
      const range = mouseDrag ? { x: 140, y: 90 } : { x: 36, y: 28 }
      const spring = { type: 'spring' as const, stiffness: 120, damping: 11, mass: 0.9 }
      animate(x, x.get() + (Math.random() * 2 - 1) * range.x, spring)
      animate(y, y.get() + (Math.random() * 2 - 1) * range.y, spring)
      animate(spin, rotate + (Math.random() * 2 - 1) * 22, spring)
    }
    window.addEventListener(SCATTER, onScatter)
    return () => window.removeEventListener(SCATTER, onScatter)
  }, [mouseDrag, rotate, spin, x, y])

  // Touch: press-and-hold to lift, then drag. Native scroll wins until the hold completes.
  useEffect(() => {
    const el = inner.current
    if (!el || mouseDrag || !touchDrag) return
    let timer: number | undefined
    let active = false
    let start = { x: 0, y: 0 }
    let origin = { x: 0, y: 0 }
    let last = { x: 0, y: 0, t: 0 }

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      start = { x: t.clientX, y: t.clientY }
      dragged.current = false
      timer = window.setTimeout(() => {
        active = true
        dragged.current = true
        origin = { x: x.get(), y: y.get() }
        last = { x: start.x, y: start.y, t: performance.now() }
        setLifted(true)
        setZ(nextZ())
        navigator.vibrate?.(12)
      }, HOLD_MS)
    }
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!active) {
        if (Math.hypot(t.clientX - start.x, t.clientY - start.y) > 8) window.clearTimeout(timer)
        return
      }
      e.preventDefault()
      x.set(origin.x + t.clientX - start.x)
      y.set(origin.y + t.clientY - start.y)
      const now = performance.now()
      const dt = Math.max(16, now - last.t)
      tiltFrom(((t.clientX - last.x) / dt) * 1000, ((t.clientY - last.y) / dt) * 1000)
      last = { x: t.clientX, y: t.clientY, t: now }
    }
    const onEnd = () => {
      window.clearTimeout(timer)
      if (!active) return
      active = false
      setLifted(false)
      window.clearTimeout(settle.current)
      flatten()
      // Keep at least part of it on screen.
      const r = el.getBoundingClientRect()
      const vw = window.innerWidth
      if (r.right < 60) animate(x, x.get() + (60 - r.right), { type: 'spring', bounce: 0.3 })
      if (r.left > vw - 60) animate(x, x.get() - (r.left - (vw - 60)), { type: 'spring', bounce: 0.3 })
    }
    const noMenu = (e: Event) => {
      if (active || dragged.current) e.preventDefault()
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    el.addEventListener('contextmenu', noMenu)
    return () => {
      window.clearTimeout(timer)
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
      el.removeEventListener('contextmenu', noMenu)
    }
    // tiltFrom / flatten only touch stable motion values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseDrag, touchDrag, x, y])

  const touchMode = !mouseDrag && touchDrag

  return (
    <motion.div className={`sticker-place ${placeClass}`} style={{ ...place, x: px, y: py, zIndex: z ?? place?.zIndex }}>
      <motion.div
        ref={inner}
        className={`sticker-3d ${mouseDrag ? 'is-draggable' : ''} ${touchMode ? 'is-touch-draggable' : ''} ${lifted ? 'is-lifted' : ''} ${className}`}
        style={{ x, y, rotate: spin, rotateX, rotateY, transformPerspective: 900 }}
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
        data-cursor={mouseDrag || onActivate ? cursor : undefined}
        drag={mouseDrag}
        dragMomentum={false}
        dragConstraints={bounds}
        dragElastic={0.14}
        animate={touchMode ? (lifted ? LIFT : REST) : undefined}
        whileHover={mouseDrag ? { scale: 1.03 } : undefined}
        whileTap={mouseDrag ? { scale: 1.06 } : undefined}
        whileDrag={LIFT}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
        onPointerDown={() => {
          if (!mouseDrag) return
          dragged.current = false
          setZ(nextZ())
        }}
        onDragStart={() => {
          dragged.current = true
        }}
        onDrag={(_, info) => tiltFrom(info.velocity.x, info.velocity.y)}
        onDragEnd={() => {
          window.clearTimeout(settle.current)
          flatten()
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
