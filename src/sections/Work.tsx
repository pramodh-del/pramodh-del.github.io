import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { cases, type CaseStudy } from '../data/profile'
import { Diagram } from '../components/Diagrams'
import { Scribble } from '../components/Scribble'
import { useLenis } from '../lib/lenis'
import { Tilt } from '../components/Reveal'
import { useMediaQuery } from '../hooks/useMediaQuery'

const MODAL_SPRING = { type: 'spring', bounce: 0.3, duration: 0.25 } as const

/**
 * One folder in the sticky stack. While the next folder slides over it, this one
 * sinks back in 3D (rotateX + scale) and its text fades, mirroring the reference's
 * scroll-target opacity effect.
 */
function CaseCard({
  c,
  index,
  nextRef,
  selfRef,
  onOpen,
}: {
  c: CaseStudy
  index: number
  nextRef: RefObject<HTMLElement | null> | null
  selfRef: RefObject<HTMLElement | null>
  onOpen: (c: CaseStudy) => void
}) {
  const { scrollYProgress } = useScroll({ target: nextRef ?? selfRef, offset: ['start end', 'start 15%'] })
  // Cards only stack (position: sticky) on wider screens; on phones they scroll normally.
  const stacked = useMediaQuery('(min-width: 761px)')
  const active = stacked && nextRef !== null
  const scale = useTransform(scrollYProgress, [0, 1], [1, active ? 0.94 : 1])
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, active ? 7 : 0])
  const fade = useTransform(scrollYProgress, [0.35, 1], [1, active ? 0 : 1])

  return (
    <article
      ref={selfRef}
      className="case"
      style={{ '--i': index, '--c': c.color, '--tc': c.tabText } as CSSProperties}
      aria-labelledby={`case-${c.id}`}
    >
      <motion.div className="case-3d" style={{ scale, rotateX, transformPerspective: 1400, transformOrigin: '50% 0%' }}>
        <div className="case-tab">
          ▮ {c.tab}
          <span className="t-long">&nbsp;· {c.tabLong}</span>
        </div>
        <div className="case-body">
          <motion.div className="case-info" style={{ opacity: fade }}>
            <div className="when">{c.when}</div>
            <h3 id={`case-${c.id}`}>{c.title}</h3>
            <p>{c.summary}</p>
            <div className="metric">
              <strong>{c.metric.value}</strong>
              <span>{c.metric.label}</span>
            </div>
            <details>
              <summary>How it went</summary>
              <dl>
                {c.details.map((d) => (
                  <div key={d.term}>
                    <dt>{d.term}</dt>
                    <dd>{d.desc}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <div className="ftags">
              {c.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </motion.div>
          <Tilt className="visual" max={6}>
            <button
              type="button"
              className="frame"
              data-cursor="see"
              onClick={() => onOpen(c)}
              aria-label={`Open the diagram for: ${c.title}`}
            >
              <Diagram kind={c.diagram} />
            </button>
            <span className="badge">{c.badge}</span>
            <i className="h tl" aria-hidden="true" />
            <i className="h tr" aria-hidden="true" />
            <i className="h bl" aria-hidden="true" />
            <i className="h br" aria-hidden="true" />
          </Tilt>
        </div>
      </motion.div>
    </article>
  )
}

function CaseModal({ c, onClose }: { c: CaseStudy; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lenis?.start()
      opener?.focus()
    }
  }, [lenis, onClose])

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{ '--c': c.color } as CSSProperties}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1, transition: MODAL_SPRING }}
        exit={{ opacity: 0, scale: 0.96, transition: MODAL_SPRING }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <span className="modal-tag">
            {c.tab} · {c.tabLong}
          </span>
          <button ref={closeRef} type="button" className="modal-close" onClick={onClose}>
            Close ✕
          </button>
        </div>
        <h3 id="modal-title">{c.title}</h3>
        <div className="modal-frame">
          <Diagram kind={c.diagram} />
        </div>
        <p className="modal-metric">
          <strong>{c.metric.value}</strong> {c.metric.label}
        </p>
      </motion.div>
    </motion.div>
  )
}

export function Work() {
  const [open, setOpen] = useState<CaseStudy | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const r0 = useRef<HTMLElement>(null)
  const r1 = useRef<HTMLElement>(null)
  const r2 = useRef<HTMLElement>(null)
  const r3 = useRef<HTMLElement>(null)
  const refs = [r0, r1, r2, r3]

  return (
    <section className="work wrap" id="work" data-section="work">
      <div className="sec-head">
        <p className="hand">explore my work!</p>
        <Scribble />
      </div>
      <motion.div
        className="note work-note"
        initial={{ rotate: -12, opacity: 0, y: 20 }}
        whileInView={{ rotate: -2, opacity: 1, y: 0 }}
        whileHover={{ rotate: -4, scale: 1.05, transition: { type: 'spring', bounce: 0.3, duration: 0.4 } }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: 'spring', stiffness: 693, damping: 30, mass: 7.3 }}
      >
        <span className="hand">Client and internal system names are left out under NDA. The numbers are real.</span>
      </motion.div>

      <div className="cases">
        {cases.map((c, i) => (
          <CaseCard key={c.id} c={c} index={i} selfRef={refs[i]} nextRef={refs[i + 1] ?? null} onOpen={setOpen} />
        ))}
      </div>

      <AnimatePresence>{open && <CaseModal key={open.id} c={open} onClose={close} />}</AnimatePresence>
    </section>
  )
}
