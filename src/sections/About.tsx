import { useRef } from 'react'
import { chips, facts, profile, tickets } from '../data/profile'
import { LineReveal, type RevealPart } from '../components/LineReveal'
import { RotateLoop, Sparkle } from '../components/loops'
import { FadeUp, SpringIn } from '../components/Reveal'
import { Icon } from '../components/Icons'
import { Journey, NowCards } from '../components/Journey'
import { Sticker } from '../components/Sticker'

const statement: RevealPart[] = [
  'A backend engineer',
  {
    bg: 'var(--aws)',
    icon: (
      <svg viewBox="0 0 16 16" fill="#14161F">
        <path d="M4 11a3 3 0 0 1 .4-6 4 4 0 0 1 7.3 1.3A2.4 2.4 0 0 1 12 11z" />
      </svg>
    ),
  },
  'who owns what happens after the code ships',
  {
    bg: 'var(--blue)',
    icon: (
      <svg viewBox="0 0 16 16" fill="#fff">
        <path d="M9 1 3 9h4l-1 6 6-8H8z" />
      </svg>
    ),
  },
]

export function About() {
  const ref = useRef<HTMLElement>(null)
  return (
    <section ref={ref} className="about wrap" id="about" data-section="about">
      <div className="sec-head">
        <SpringIn rotate={-4} className="tagbox sel">
          what's up
          <i className="h tl" aria-hidden="true" />
          <i className="h br" aria-hidden="true" />
        </SpringIn>
      </div>

      {tickets.map((t, i) => (
        <Sticker
          key={t.year}
          className="ticket"
          placeClass="ticket-place"
          place={i === 0 ? { left: 12, top: 150 } : { right: 22, top: 190 }}
          depth={i === 0 ? 22 : 30}
          rotate={t.rotate}
          bounds={ref}
          label={`${t.year}: ${t.caption}`}
        >
          <div className="art" style={{ background: t.bg }}>
            {t.year}
          </div>
          <p>{t.caption}</p>
        </Sticker>
      ))}

      <div className="statement-wrap">
        <RotateLoop className="spark spark-l">
          <Sparkle size={22} color="var(--spring)" />
        </RotateLoop>
        <LineReveal className="statement" parts={statement} />
        <RotateLoop className="spark spark-r" reverse>
          <Sparkle size={16} color="var(--aws)" />
        </RotateLoop>
      </div>
      <FadeUp delay={0.2}>
        <p className="about-copy">{profile.about}</p>
      </FadeUp>

      <FadeUp className="chips" delay={0.3}>
        {chips.map((c) => (
          <span key={c.label} className="chip" style={{ background: c.bg, color: c.fg }}>
            {c.label}{' '}
            <b style={{ color: 'var(--ink)' }}>
              <Icon name={c.icon} />
            </b>
          </span>
        ))}
      </FadeUp>

      <FadeUp className="facts">
        {facts.map((f) => (
          <div key={f.label}>
            <strong>{f.value}</strong>
            <span>{f.label}</span>
          </div>
        ))}
      </FadeUp>

      <NowCards />
      <Journey />
    </section>
  )
}
