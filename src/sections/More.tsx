import { motion } from 'motion/react'
import { useRef, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { offClock, profile, sideBuilds, stack } from '../data/profile'
import { RotateLoop, ScaleLoop, Sparkle, WindupSpin } from '../components/loops'
import { PhotoWall } from '../components/PhotoWall'
import { FadeUp, Tilt } from '../components/Reveal'
import { Scribble } from '../components/Scribble'
import { Sticker } from '../components/Sticker'
import { useToast } from '../lib/toast'

export function SideBuilds() {
  return (
    <section className="side wrap" id="side">
      <div className="sec-head">
        <p className="hand">side builds</p>
        <Scribble />
      </div>
      <div className="side-grid">
        {sideBuilds.map((b, i) => (
          <FadeUp key={b.title} delay={0.1 + i * 0.12}>
            <Tilt className="fcard" max={8}>
              <div className="ftab">{b.tab}</div>
              <div className="inner">
                <div className="shot">
                  <div className="log">
                    {b.log.map((line, li) => (
                      <motion.div
                        key={li}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + li * 0.35, duration: 0.3 }}
                      >
                        {line.map((seg, si) => (
                          <span key={si} className={'k' in seg ? seg.k : undefined}>
                            {seg.t}
                          </span>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            </Tilt>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

export function Stack() {
  return (
    <section className="stack wrap" id="stack" data-section="stack">
      <div className="sec-head">
        <p className="hand">what I work with</p>
        <Scribble />
      </div>
      <FadeUp className="groups">
        {stack.map((g) => (
          <div key={g.group} className="group" style={{ '--c': g.color } as CSSProperties}>
            <h4>
              <i />
              {g.group}
            </h4>
            <ul>
              {g.items.map((item, i) => (
                <motion.li
                  key={item[0]}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                >
                  {item[0]}
                  {item[1] && <small>{item[1]}</small>}
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </FadeUp>
    </section>
  )
}

export function OffClock() {
  const ref = useRef<HTMLElement>(null)
  return (
    <section ref={ref} className="offclock wrap" data-section="stack">
      <div className="sec-head">
        <p className="hand">off the clock</p>
        <Scribble />
      </div>
      <div className="offclock-row">
        <FadeUp delay={0.1}>
          <p>{offClock.text}</p>
          <Link to="/playground" className="pg-link" data-cursor="see">
            Open the playground <span aria-hidden="true">→</span>
          </Link>
        </FadeUp>
        <div className="exif" aria-label="Favourite camera settings">
          {offClock.exif.map((e, i) => (
            <Sticker key={e} className={`exif-chip exif-${i}`} rotate={[0, 3, -2][i]} bounds={ref}>
              {e}
            </Sticker>
          ))}
        </div>
      </div>
      <PhotoWall />
    </section>
  )
}

export function Contact() {
  const toast = useToast()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      toast('Email copied to clipboard')
    } catch {
      const el = document.getElementById('email')
      if (el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
      toast('Selected. Press Ctrl+C to copy')
    }
  }

  return (
    <section className="contact wrap" id="contact" data-section="contact">
      <div className="contact-panel">
        <RotateLoop className="c-spark c-spark-1">
          <Sparkle size={26} color="var(--note)" />
        </RotateLoop>
        <RotateLoop className="c-spark c-spark-2" reverse>
          <Sparkle size={18} color="var(--spring)" />
        </RotateLoop>
        <span className="c-dots" aria-hidden="true">
          {([0, 1, 2, 3] as const).map((s) => (
            <ScaleLoop key={s} step={s} className="c-dot" />
          ))}
        </span>
        <motion.div
          className="big-sticker"
          initial={{ rotate: -16, scale: 0.8, opacity: 0 }}
          whileInView={{ rotate: -6, scale: 1, opacity: 1 }}
          whileHover={{ rotate: -2, scale: 1.05, transition: { type: 'spring', bounce: 0.3, duration: 0.4 } }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ type: 'spring', stiffness: 693, damping: 30, mass: 7.3 }}
        >
          <WindupSpin className="diamond">
            <span>»</span>
          </WindupSpin>
          LET'S TALK
          <WindupSpin className="diamond">
            <span>»</span>
          </WindupSpin>
        </motion.div>
        <p>{profile.lookingFor}</p>
        <div className="email-row">
          <code id="email">{profile.email}</code>
          <motion.button type="button" className="copy" onClick={copy} whileTap={{ scale: 0.92 }}>
            Copy
          </motion.button>
        </div>
      </div>
      <div className="dock">
        <DockLink href={profile.linkedin} label="LinkedIn">
          <path d="M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM2.5 8.5h3V21h-3zM9 8.5h2.9v1.7h.1c.4-.8 1.4-1.9 3.1-1.9 3.3 0 3.9 2.2 3.9 5V21h-3v-6.8c0-1.6 0-3.7-2.3-3.7s-2.6 1.8-2.6 3.6V21H9z" />
        </DockLink>
        <DockLink href={profile.github} label="GitHub">
          <path d="M12 1.5a10.5 10.5 0 0 0-3.3 20.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.3.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.3 0c2-1.4 2.9-1.1 2.9-1.1.6 1.5.2 2.5.1 2.8.7.7 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5z" />
        </DockLink>
        <motion.button type="button" className="dock-item" onClick={copy} whileHover={{ y: -6, scale: 1.12 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.35 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          Email
        </motion.button>
      </div>
    </section>
  )
}

function DockLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <motion.a
      className="dock-item"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -6, scale: 1.12 }}
      transition={{ type: 'spring', bounce: 0.5, duration: 0.35 }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {children}
      </svg>
      {label}
    </motion.a>
  )
}
