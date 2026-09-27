import { useInView } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'

const COMMAND = 'curl -s /api/pramodh/health'
const TYPE_MS = 38
const LINE_MS = 140

const pad = (n: number) => String(n).padStart(2, '0')
const since = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`
}

/**
 * The hero's health-check card. When it scrolls into view it types the curl
 * command, then prints the JSON response a line at a time, and keeps a live
 * "uptime" counter: how long you've had the page open. Every line is laid out
 * from the start (just hidden), so the card never changes size while typing.
 */
export function TerminalCard() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reduced = useMediaQuery(REDUCED_MOTION)
  const [typed, setTyped] = useState(0)
  const [shown, setShown] = useState(0)
  const [opened] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  const lines: ReactNode[] = [
    '{',
    <>
      &nbsp;&nbsp;<span className="k">"status"</span>: <span className="s">"UP"</span>,
    </>,
    <>
      &nbsp;&nbsp;<span className="k">"java"</span>: <span className="s">21</span>,
    </>,
    <>
      &nbsp;&nbsp;<span className="k">"cloud"</span>: <span className="s">"AWS"</span>,
    </>,
    <>
      &nbsp;&nbsp;<span className="k">"promoted"</span>: <span className="s">"within 2 yrs"</span>,
    </>,
    <>
      &nbsp;&nbsp;<span className="k">"uptime"</span>: <span className="s">"{since(now - opened)}"</span>
    </>,
    '}',
  ]

  const done = reduced || shown >= lines.length
  const typedCount = reduced ? COMMAND.length : typed
  const shownCount = reduced ? lines.length : shown

  useEffect(() => {
    if (!inView || reduced) return
    if (typed < COMMAND.length) {
      const id = window.setTimeout(() => setTyped((n) => n + 1), TYPE_MS)
      return () => window.clearTimeout(id)
    }
    if (shown < lines.length) {
      const id = window.setTimeout(() => setShown((n) => n + 1), shown === 0 ? 260 : LINE_MS)
      return () => window.clearTimeout(id)
    }
  }, [inView, reduced, typed, shown, lines.length])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div ref={ref} className="term">
      <div className="bar" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div>
        <span className="sr-only">$ {COMMAND}</span>
        <span className="p" aria-hidden="true">
          $
        </span>{' '}
        <span aria-hidden="true">{COMMAND.slice(0, typedCount)}</span>
        {!done && typedCount < COMMAND.length && <span className="caret" aria-hidden="true" />}
        <span className="ghost" aria-hidden="true">
          {COMMAND.slice(typedCount)}
        </span>
      </div>
      {lines.map((line, i) => (
        <div key={i} className={i < shownCount ? '' : 'ghost'}>
          {line}
          {done && i === lines.length - 1 && <span className="caret" aria-hidden="true" />}
        </div>
      ))}
    </div>
  )
}
