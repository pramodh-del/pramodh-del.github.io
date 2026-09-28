import { motion, useInView, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { profile } from '../data/profile'
import { useClock } from '../hooks/useClock'
import { HoverForce } from '../components/HoverForce'
import { ScaleLoop } from '../components/loops'
import { OnCallBot } from '../components/OnCallBot'
import { scrollToId, useLenis } from '../lib/lenis'
import { Scribble } from '../components/Scribble'
import { Icon } from '../components/Icons'
import { Magnetic } from '../components/Magnetic'
import { Sticker } from '../components/Sticker'
import { TerminalCard } from '../components/TerminalCard'
import { REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'
import { emit, INCIDENT } from '../lib/events'
import { requestGyro, sceneX, sceneY, useGyro } from '../lib/scene'

const LOOP_EASE = [0.44, 0, 0.56, 1] as const

/** Fake multiplayer cursor that drifts on the reference's mirror loops and dodges yours. */
function Presence({
  label,
  color,
  labelBg,
  loop,
  className,
  style,
}: {
  label: string
  color: string
  labelBg: string
  loop: { x: number; y: number; rotate: number; duration: number }
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <HoverForce className={`presence ${className ?? ''}`} style={style} threshold={180} distance={90}>
      <motion.div
        ref={ref}
        className="presence-inner"
        animate={inView ? { x: [0, loop.x], y: [0, loop.y], rotate: [0, loop.rotate] } : undefined}
        transition={{ duration: loop.duration, ease: LOOP_EASE, repeat: Infinity, repeatType: 'mirror' }}
      >
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <path d="M2 1 16 8.5 9.5 10 7 16.5z" fill={color} stroke="#14161F" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        <span style={{ background: labelBg }}>{label}</span>
      </motion.div>
    </HoverForce>
  )
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const [frame, setFrame] = useState({ w: 0, h: 0 })
  const { full } = useClock(profile.timeZone)
  const lenis = useLenis()
  const gyro = useGyro()
  const reduced = useMediaQuery(REDUCED_MOTION)
  // The name frame leans a little toward the cursor / with the phone, like a card on a desk.
  const nameRx = useSpring(
    useTransform(sceneY, (v) => (reduced ? 0 : -v * 5)),
    { stiffness: 80, damping: 16 },
  )
  const nameRy = useSpring(
    useTransform(sceneX, (v) => (reduced ? 0 : v * 7)),
    { stiffness: 80, damping: 16 },
  )

  useEffect(() => {
    const el = nameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      setFrame({ w: Math.round(r.width), h: Math.round(r.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <section ref={heroRef} className="hero wrap" id="top" data-section="top">
      <div className="hero-core">
        <motion.div
          className="live"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {profile.city}, India · {full}
        </motion.div>
        <motion.p
          className="hi hand"
          initial={{ opacity: 0, rotate: -8, y: 10 }}
          animate={{ opacity: 1, rotate: 0, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.8, delay: 0.2 }}
        >
          hey, my name is
        </motion.p>
        <Scribble />
        <motion.h1
          ref={nameRef}
          className="name sel"
          data-cursor="expand"
          style={{ rotateX: nameRx, rotateY: nameRy, transformPerspective: 1100 }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.9, delay: 0.3 }}
        >
          <span className="sr-only">{profile.fullName}, </span>
          {profile.name}
          <i className="h tl" aria-hidden="true" />
          <i className="h tr" aria-hidden="true" />
          <i className="h bl" aria-hidden="true" />
          <i className="h br" aria-hidden="true" />
          <span className="size" aria-hidden="true">
            Frame · {frame.w} × {frame.h}
          </span>
        </motion.h1>

        <motion.div
          className="available"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <span className="dot-wrap" aria-hidden="true">
            <ScaleLoop className="dot-pulse" />
            <span className="dot" />
          </span>
          {profile.availability}
        </motion.div>

        <motion.p
          className="tagline"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
        >
          {profile.tagline[0]}{' '}
          <span className="inline-ico" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="#14161F">
              <path d="M3 2h7l3 3v9H3z" />
            </svg>
          </span>{' '}
          {profile.tagline[1]}
        </motion.p>
        <div className="cta-row">
          <Magnetic>
            <motion.button
              type="button"
              className="cta"
              onClick={() => scrollToId(lenis, 'work')}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.5, delay: 0.95 }}
            >
              <i aria-hidden="true">»</i>See my work
            </motion.button>
          </Magnetic>
          <Magnetic strength={0.3}>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.5, delay: 1.05 }}
              style={{ display: 'inline-block' }}
            >
              <Link to="/resume" className="cta-ghost">
                <Icon name="doc" size={14} /> View resume
              </Link>
            </motion.span>
          </Magnetic>
        </div>
        {gyro === 'needs-permission' && (
          <motion.button
            type="button"
            className="tilt-btn"
            onClick={() => void requestGyro()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <span aria-hidden="true">✦</span> Turn on tilt: move your phone
          </motion.button>
        )}
      </div>

      <div className="floats">
        <Sticker
          className="terminal"
          placeClass="float"
          place={{ left: 0, top: 380 }}
          rotate={-4}
          bounds={heroRef}
          depth={18}
          touchDrag
          label="Health check card"
        >
          <TerminalCard />
        </Sticker>
        <Sticker
          className="sticker tone-spring"
          placeClass="float"
          place={{ left: '17%', top: 300 }}
          rotate={-8}
          bounds={heroRef}
          depth={34}
          touchDrag
        >
          Currently @ Accenture
        </Sticker>
        <Sticker
          className="sticker tone-aws"
          placeClass="float"
          place={{ right: '4%', top: 190 }}
          rotate={6}
          bounds={heroRef}
          depth={28}
          touchDrag
        >
          <Icon name="cloud" size={15} /> AWS Certified Cloud Practitioner
        </Sticker>
        <Sticker
          className="note"
          placeClass="float"
          place={{ right: 12, top: 410 }}
          rotate={3}
          bounds={heroRef}
          depth={24}
          touchDrag
        >
          <span className="hand note-text">Promoted to Analyst in under 2 years.</span>
        </Sticker>
        <Sticker
          placeClass="float bot-sticker"
          place={{ left: '4%', top: 110 }}
          rotate={-3}
          bounds={heroRef}
          depth={40}
          touchDrag
          label="On-call bot. Click to page it."
          onActivate={() => emit(INCIDENT)}
        >
          <OnCallBot />
        </Sticker>
        <Presence
          className="hide-sm"
          style={{ left: '24%', top: 710 }}
          label={profile.role}
          color="#6DB33F"
          labelBg="var(--spring)"
          loop={{ x: -59, y: -110, rotate: 30, duration: 4 }}
        />
        <Presence
          className="hide-sm"
          style={{ right: '6%', top: 700 }}
          label={profile.city}
          color="#FF9900"
          labelBg="var(--note)"
          loop={{ x: -150, y: -130, rotate: 18, duration: 2.5 }}
        />
      </div>
    </section>
  )
}
