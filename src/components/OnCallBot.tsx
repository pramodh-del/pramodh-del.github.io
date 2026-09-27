import { animate, motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useRef } from 'react'
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'
import { clamp } from '../lib/pointer'

/**
 * A little on-call server whose eyes follow the cursor and blink.
 * Eye motion is the reference's "follow" loop: offset = distance to cursor × 0.04,
 * spring { damping 40, stiffness 300 }; blink scales Y 1 → 0.15 → 1 over 0.3s,
 * every 2–4s (spring { damping 20, stiffness 300 }).
 */
export function OnCallBot() {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = useMediaQuery(REDUCED_MOTION)
  const eyes = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { damping: 40, stiffness: 300 })
  const sy = useSpring(y, { damping: 40, stiffness: 300 })
  const blink = useMotionValue(1)
  const scaleY = useSpring(blink, { damping: 20, stiffness: 300 })

  useEffect(() => {
    if (!fine || reduced) return
    const onMove = (e: MouseEvent) => {
      const el = eyes.current
      if (!el) return
      const r = el.getBoundingClientRect()
      x.set(clamp((e.clientX - (r.left + r.width / 2)) * 0.04, -7, 7))
      y.set(clamp((e.clientY - (r.top + r.height / 2)) * 0.04, -4, 4))
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [fine, reduced, x, y])

  useEffect(() => {
    if (reduced) return
    const controls = animate(blink, [1, 0.15, 1], {
      duration: 0.3,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 2 + Math.random() * 2,
    })
    return () => controls.stop()
  }, [blink, reduced])

  return (
    <div className="bot" aria-hidden="true">
      <div className="bot-screen">
        <motion.div ref={eyes} className="bot-eyes" style={{ x: sx, y: sy, scaleY }}>
          <i />
          <i />
        </motion.div>
      </div>
      <div className="bot-rack">
        <span className="led ok" />
        <span className="led ok" />
        <span className="led warn" />
        <b>on-call</b>
      </div>
    </div>
  )
}
