import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, wrap } from 'motion/react'
import { useRef } from 'react'
import { REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'

const WORDS = [
  'Java 21',
  'Spring Boot',
  'AWS',
  'SQS FIFO',
  'Terraform',
  'Oracle',
  'REST · SOAP',
  'ECS Fargate',
  'JUnit 5',
  'Microservices',
]

/**
 * One marquee row. It drifts on its own, speeds up with scroll velocity, and
 * flips direction when you scroll back up.
 */
function Row({ base, className }: { base: number; className: string }) {
  const reduced = useMediaQuery(REDUCED_MOTION)
  const offset = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false })
  const direction = useRef(1)
  // The row holds four copies of the words; wrapping at -25% makes the loop seamless.
  const x = useTransform(offset, (v) => `${wrap(-25, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduced) return
    const b = boost.get()
    if (b < 0) direction.current = -1
    else if (b > 0) direction.current = 1
    const move = direction.current * base * (delta / 1000) * (1 + Math.abs(b))
    offset.set(offset.get() + move)
  })

  const items = [...WORDS, ...WORDS, ...WORDS, ...WORDS]
  return (
    <div className={`ticker-row ${className}`}>
      <motion.div className="ticker-track" style={{ x }}>
        {items.map((w, i) => (
          <span key={i}>
            {w}
            <i aria-hidden="true">✦</i>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/** Two crossing tape bands of the stack, between About and Work. */
export function TickerBand() {
  return (
    <div className="ticker" aria-label={`Stack: ${WORDS.join(', ')}`} role="img">
      <Row base={-2.2} className="ticker-a" />
      <Row base={1.6} className="ticker-b" />
    </div>
  )
}
