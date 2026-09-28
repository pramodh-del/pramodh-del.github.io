import { motion, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { journey, now, profile } from '../data/profile'
import { useClock } from '../hooks/useClock'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { Icon } from './Icons'
import { ScaleLoop } from './loops'
import { Scribble } from './Scribble'

/** "Right now": what I'm building, learning, and how fast I reply. Honest, current, short. */
export function NowCards() {
  const { hm } = useClock(profile.timeZone)
  return (
    <div className="now" aria-label="Right now">
      <div className="now-head">
        <span className="dot-wrap" aria-hidden="true">
          <ScaleLoop className="dot-pulse" />
          <span className="dot" />
        </span>
        {profile.city}, right now · <b>{hm}</b> IST
      </div>
      <div className="now-grid">
        {now.map((n, i) => (
          <motion.div
            key={n.label}
            className="now-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: 'spring', bounce: 0.35, duration: 0.6, delay: i * 0.08 }}
            whileHover={{ y: -4, rotate: i % 2 ? 1 : -1 }}
          >
            <span className="now-ico" aria-hidden="true">
              <Icon name={n.icon} size={15} />
            </span>
            <small>{n.label}</small>
            <p>{n.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/** "The road so far": a timeline whose line draws itself as you scroll. */
export function Journey() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] })
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  // Horizontal road on desktop, vertical on phones.
  const vertical = useMediaQuery('(max-width: 760px)')

  return (
    <div className="journey">
      <div className="sec-head journey-head">
        <p className="hand">the road so far</p>
        <Scribble />
      </div>
      <ol ref={ref} className="road">
        <motion.span className="road-line" style={vertical ? { scaleY: draw } : { scaleX: draw }} aria-hidden="true" />
        {journey.map((j, i) => (
          <motion.li
            key={j.when + j.title}
            className={`road-stop ${i === journey.length - 1 ? 'is-now' : ''}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.55, delay: i * 0.05 }}
          >
            <span className="road-dot" aria-hidden="true" />
            <small>{j.when}</small>
            <b>{j.title}</b>
            <span>{j.detail}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
