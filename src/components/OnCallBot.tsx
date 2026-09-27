import { animate, motion, useAnimationControls, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'
import { INCIDENT } from '../lib/events'
import { clamp } from '../lib/pointer'
import { sceneX, sceneY } from '../lib/scene'
import { useToast } from '../lib/toast'

type Phase = 'idle' | 'alert' | 'fixed'

/**
 * A little on-call server whose eyes follow the cursor and blink.
 * Eye motion is the reference's "follow" loop: offset = distance to cursor × 0.04,
 * spring { damping 40, stiffness 300 }; blink scales Y 1 → 0.15 → 1 over 0.3s,
 * every 2–4s (spring { damping 20, stiffness 300 }).
 * On touch screens the eyes follow your finger, or the phone's tilt.
 * Page it (click / tap, or from ⌘K) and it has a small 2 AM incident, then recovers.
 */
export function OnCallBot() {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = useMediaQuery(REDUCED_MOTION)
  const toast = useToast()
  const eyes = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { damping: 40, stiffness: 300 })
  const sy = useSpring(y, { damping: 40, stiffness: 300 })
  const blink = useMotionValue(1)
  const scaleY = useSpring(blink, { damping: 20, stiffness: 300 })
  const shake = useAnimationControls()
  const [phase, setPhase] = useState<Phase>('idle')

  // Follow the cursor (desktop) or the finger (touch).
  useEffect(() => {
    if (reduced) return
    const look = (cx: number, cy: number) => {
      const el = eyes.current
      if (!el) return
      const r = el.getBoundingClientRect()
      x.set(clamp((cx - (r.left + r.width / 2)) * 0.04, -7, 7))
      y.set(clamp((cy - (r.top + r.height / 2)) * 0.04, -4, 4))
    }
    const onMove = (e: PointerEvent) => look(e.clientX, e.clientY)
    document.addEventListener(fine ? 'pointermove' : 'pointerdown', onMove, { passive: true })
    return () => document.removeEventListener(fine ? 'pointermove' : 'pointerdown', onMove)
  }, [fine, reduced, x, y])

  // Phones: glance around as the phone tilts.
  useEffect(() => {
    if (fine || reduced) return
    const off = [sceneX.on('change', (v) => x.set(v * 7)), sceneY.on('change', (v) => y.set(v * 4))]
    return () => off.forEach((fn) => fn())
  }, [fine, reduced, x, y])

  useEffect(() => {
    if (reduced || phase !== 'idle') return
    const controls = animate(blink, [1, 0.15, 1], {
      duration: 0.3,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 2 + Math.random() * 2,
    })
    return () => {
      controls.stop()
      blink.set(1)
    }
  }, [blink, reduced, phase])

  useEffect(() => {
    let timers: number[] = []
    const onIncident = () => {
      if (timers.length) return
      setPhase('alert')
      navigator.vibrate?.([30, 40, 30])
      toast('🚨 02:00 AM page: p99 latency spiking')
      if (!reduced) shake.start({ x: [0, -5, 5, -4, 4, -2, 2, 0], transition: { duration: 0.5, repeat: 2 } })
      timers = [
        window.setTimeout(() => {
          setPhase('fixed')
          toast('✅ Fixed: added the missing index. Back to sleep.')
        }, 1900),
        window.setTimeout(() => {
          setPhase('idle')
          timers = []
        }, 3900),
      ]
    }
    window.addEventListener(INCIDENT, onIncident)
    return () => {
      window.removeEventListener(INCIDENT, onIncident)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [reduced, shake, toast])

  return (
    <motion.div className={`bot is-${phase}`} animate={shake} aria-hidden="true">
      <div className="bot-screen">
        {phase === 'alert' ? (
          <div className="bot-eyes bot-x">
            <b>×</b>
            <b>×</b>
          </div>
        ) : (
          <motion.div ref={eyes} className={`bot-eyes ${phase === 'fixed' ? 'bot-happy' : ''}`} style={{ x: sx, y: sy, scaleY }}>
            <i />
            <i />
          </motion.div>
        )}
      </div>
      <div className="bot-rack">
        <span className="led ok" />
        <span className="led ok" />
        <span className="led warn" />
        <b>{phase === 'alert' ? 'paged!' : phase === 'fixed' ? 'resolved' : 'on-call'}</b>
      </div>
    </motion.div>
  )
}
