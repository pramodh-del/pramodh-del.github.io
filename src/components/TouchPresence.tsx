import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'

interface Ripple {
  id: number
  x: number
  y: number
}

/**
 * The phone version of the multiplayer cursor: touch anywhere and a "You" tag
 * springs up under your finger and follows it, with a ripple where you tapped.
 * It never takes the touch: pointer-events are off and listeners are passive,
 * so scrolling and taps behave exactly as before.
 */
export function TouchPresence() {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = useMediaQuery(REDUCED_MOTION)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 35 })
  const sy = useSpring(y, { stiffness: 500, damping: 35 })
  const [visible, setVisible] = useState(false)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const hide = useRef<number | undefined>(undefined)
  const nextId = useRef(0)

  useEffect(() => {
    if (fine) return
    const isTouch = (e: PointerEvent) => e.pointerType === 'touch' || e.pointerType === 'pen'
    const onDown = (e: PointerEvent) => {
      if (!isTouch(e)) return
      window.clearTimeout(hide.current)
      x.jump(e.clientX)
      y.jump(e.clientY)
      sx.jump(e.clientX)
      sy.jump(e.clientY)
      setVisible(true)
      if (!reduced) {
        const id = nextId.current++
        setRipples((r) => [...r.slice(-3), { id, x: e.clientX, y: e.clientY }])
        window.setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 650)
      }
    }
    const onMove = (e: PointerEvent) => {
      if (!isTouch(e)) return
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const onUp = (e: PointerEvent) => {
      if (!isTouch(e)) return
      window.clearTimeout(hide.current)
      hide.current = window.setTimeout(() => setVisible(false), 700)
    }
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    return () => {
      window.clearTimeout(hide.current)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [fine, reduced, x, y, sx, sy])

  if (fine) return null

  return (
    <div className="touch-layer" aria-hidden="true">
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="touch-ripple"
          style={{ left: r.x, top: r.y }}
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
        />
      ))}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="touch-you"
            style={{ x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.4 }}
          >
            <span className="touch-tag">You</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
