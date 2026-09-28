import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { profile } from '../data/profile'
import { useClock } from '../hooks/useClock'
import { emit, PALETTE } from '../lib/events'
import { Magnetic } from './Magnetic'
import { scrollToId, useLenis } from '../lib/lenis'

const SECTIONS = [
  { id: 'top', label: 'Home', icon: <path d="M8 1 1 7h2v8h4v-5h2v5h4V7h2z" /> },
  {
    id: 'about',
    label: 'About',
    icon: <path d="M7 1h2v4.3l3.7-2.2 1 1.8L10 7l3.7 2.1-1 1.8L9 8.7V13H7V8.7l-3.7 2.2-1-1.8L6 7 2.3 4.9l1-1.8L7 5.3z" />,
  },
  { id: 'work', label: 'Work', icon: <path d="M1 3h5l1.5 1.5H15V14H1z" /> },
  { id: 'stack', label: 'Stack', icon: <path d="M2 10h3v5H2zM6.5 6h3v9h-3zM11 2h3v13h-3z" /> },
] as const

export function Nav() {
  const { hm } = useClock(profile.timeZone)
  const lenis = useLenis()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const [active, setActive] = useState<string>('top')

  // Highlight the section in the middle of the viewport.
  useEffect(() => {
    if (!onHome) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.section ?? 'top')
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [onHome])

  const go = (id: string) => {
    if (onHome) scrollToId(lenis, id)
    else navigate('/', { state: { section: id } })
  }

  const current = onHome ? active : pathname.slice(1)

  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-left">
        <button type="button" className="mark" onClick={() => go('top')} aria-label="Back to top">
          {'{ }'}
        </button>
        <div className="nav-links">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={current === s.id ? 'on' : ''}
              aria-current={current === s.id ? 'true' : undefined}
              onClick={() => go(s.id)}
            >
              {current === s.id && (
                <motion.span layoutId="nav-on" className="nav-on" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />
              )}
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                {s.icon}
              </svg>
              <span className="lbl">{s.label}</span>
            </button>
          ))}
          <Link to="/resume" className={current === 'resume' ? 'on' : ''} aria-current={current === 'resume' ? 'page' : undefined}>
            {current === 'resume' && (
              <motion.span layoutId="nav-on" className="nav-on" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />
            )}
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M3 1h7l3 3v11H3zM9 2v3h3M5 8h6v1H5zm0 2.5h6v1H5zm0 2.5h4v1H5z" fillRule="evenodd" />
            </svg>
            <span className="lbl">Resume</span>
          </Link>
          <Link
            to="/playground"
            className={current === 'playground' ? 'on' : ''}
            aria-current={current === 'playground' ? 'page' : undefined}
          >
            {current === 'playground' && (
              <motion.span layoutId="nav-on" className="nav-on" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />
            )}
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM11.5 9 14 11.5 11.5 14 9 11.5z" />
            </svg>
            <span className="lbl">Playground</span>
          </Link>
        </div>
      </div>
      <div className="nav-right">
        <span className="clock" title="My local time">
          HYD <b>{hm}</b> IST
        </span>
        <button type="button" className="cmdk-btn" onClick={() => emit(PALETTE)} aria-label="Open command menu (Ctrl or Cmd + K)">
          <kbd>⌘</kbd>
          <kbd className="kbd-k">K</kbd>
        </button>
        <Magnetic strength={0.25}>
          <button type="button" className="btn-out" onClick={() => go('contact')} aria-label="Contact">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 14.5 1.8 8.6A3.9 3.9 0 0 1 8 3.4a3.9 3.9 0 0 1 6.2 5.2z" />
            </svg>
            <span className="btn-out-lbl">Contact</span>
          </button>
        </Magnetic>
      </div>
    </nav>
  )
}
