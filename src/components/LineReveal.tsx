import { motion, useInView } from 'motion/react'
import { Fragment, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export type RevealPart = string | { icon: ReactNode; bg: string }

/** GSAP's power3.out as a cubic-bezier. */
const POWER3_OUT = [0.215, 0.61, 0.355, 1] as const

/**
 * Line-by-line text reveal from the reference's inline-image headline:
 * each line rises from y 120% inside a mask (0.7s, power3.out, 0.06s stagger)
 * once the block's top passes 95% of the viewport. Inline icons rock ±15° on a
 * 2s ease-in-out loop.
 */
export function LineReveal({ parts, className }: { parts: RevealPart[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -5% 0px' })
  const [lines, setLines] = useState<number[]>([])

  // Words wrap wherever the layout puts them, so measure which line each one landed on.
  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'))
    let line = -1
    let lastTop = -Infinity
    const next = words.map((w) => {
      const top = w.offsetTop
      if (Math.abs(top - lastTop) > 4) {
        line += 1
        lastTop = top
      }
      return line
    })
    setLines((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next))
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (ref.current) ro.observe(ref.current)
    document.fonts?.ready.then(measure).catch(() => undefined)
    return () => ro.disconnect()
  }, [measure])

  let wordIndex = -1
  let iconIndex = -1
  return (
    <p ref={ref} className={className}>
      {parts.map((part, pi) => {
        if (typeof part !== 'string') {
          wordIndex += 1
          iconIndex += 1
          const line = lines[wordIndex] ?? 0
          const dir = iconIndex % 2 === 0 ? 1 : -1
          return (
            <Fragment key={pi}>
              <span className="mask" data-word>
                <motion.span
                  className="mask-inner"
                  initial={{ y: '120%' }}
                  animate={inView ? { y: '0%' } : { y: '120%' }}
                  transition={{ duration: 0.7, ease: POWER3_OUT, delay: line * 0.06 }}
                >
                  <motion.span
                    className="inline-ico"
                    style={{ background: part.bg }}
                    animate={{ rotate: [0, 15 * dir] }}
                    transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
                  >
                    {part.icon}
                  </motion.span>
                </motion.span>
              </span>{' '}
            </Fragment>
          )
        }
        return part
          .split(' ')
          .filter(Boolean)
          .map((word, wi) => {
            wordIndex += 1
            const line = lines[wordIndex] ?? 0
            return (
              <Fragment key={`${pi}-${wi}`}>
                <span className="mask" data-word>
                  <motion.span
                    className="mask-inner"
                    initial={{ y: '120%' }}
                    animate={inView ? { y: '0%' } : { y: '120%' }}
                    transition={{ duration: 0.7, ease: POWER3_OUT, delay: line * 0.06 }}
                  >
                    {word}
                  </motion.span>
                </span>{' '}
              </Fragment>
            )
          })
      })}
    </p>
  )
}
