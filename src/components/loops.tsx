import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger)

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The reference's GSAP loop overrides. Each builds a paused timeline and a
 * ScrollTrigger that plays it only while the element is on screen.
 */
function useOnScreenLoop(build: (el: HTMLElement) => gsap.core.Animation | gsap.core.Timeline) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const ctx = gsap.context(() => {
      const anim = build(el)
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => anim.resume(),
        onEnterBack: () => anim.resume(),
        onLeave: () => anim.pause(),
        onLeaveBack: () => anim.pause(),
      })
    }, el)
    return () => ctx.revert()
    // `build` is a stable module-level function for every caller below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ref
}

const rotate = (el: HTMLElement) =>
  gsap.to(el, { rotation: 360, duration: 3, ease: 'none', repeat: -1, delay: 0.5, paused: true })

const rotateReverse = (el: HTMLElement) =>
  gsap.to(el, { rotation: -360, duration: 3, ease: 'none', repeat: -1, delay: 0.5, paused: true })

const scaleAt = (delay: number) => (el: HTMLElement) => {
  gsap.set(el, { scale: 0 })
  return gsap.to(el, { scale: 1, duration: 1, delay, ease: 'power2.inOut', repeat: -1, yoyo: true, paused: true })
}
const scaleBuilders = [scaleAt(0), scaleAt(0.1), scaleAt(0.2), scaleAt(0.3)]

interface LoopProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function RotateLoop({ children, className, style, reverse = false }: LoopProps & { reverse?: boolean }) {
  const ref = useOnScreenLoop(reverse ? rotateReverse : rotate)
  return (
    <span ref={ref} className={className} style={{ display: 'inline-block', ...style }}>
      {children}
    </span>
  )
}

export function ScaleLoop({ children, className, style, step = 0 }: LoopProps & { step?: 0 | 1 | 2 | 3 }) {
  const ref = useOnScreenLoop(scaleBuilders[step])
  return (
    <span ref={ref} className={className} style={{ display: 'inline-block', ...style }}>
      {children}
    </span>
  )
}

/** Four-point sparkle used as decoration next to headings. */
export function Sparkle({ size = 18, color = 'var(--ink)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.8 6.4 4.8 10.6 12 12-7.2 1.4-11.2 5.6-12 12-.8-6.4-4.8-10.6-12-12C7.2 10.6 11.2 6.4 12 0z" fill={color} />
    </svg>
  )
}
