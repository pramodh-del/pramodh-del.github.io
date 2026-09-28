import { AnimatePresence, motion } from 'motion/react'
import { useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons'
import { Magnetic } from '../components/Magnetic'
import { contactEndpoint, profile } from '../data/profile'
import { useToast } from '../lib/toast'

type Mode = 'hi' | 'hire'
type Status = 'idle' | 'sending' | 'sent' | 'error'

const ROLES = [
  { value: 'Java backend', hint: 'APIs, services, the database', icon: 'braces' as const },
  { value: 'Spring Boot microservices', hint: 'Many small services', icon: 'bolt' as const },
  { value: 'Cloud & AWS', hint: 'ECS, SQS, Terraform', icon: 'cloud' as const },
  { value: 'Event-driven systems', hint: 'Queues, retries, DLQs', icon: 'arrow' as const },
  { value: 'Something else', hint: "Tell me in step 3", icon: 'doc' as const },
]
const LOCATIONS = ['Hyderabad', 'Bengaluru', 'Pune', 'Chennai', 'Remote', 'Other']
const BUDGETS = ['Up to 12 LPA', '12 to 16 LPA', '16 to 20 LPA', '20 LPA and up', "Let's discuss"]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface Fields {
  roles: string[]
  company: string
  title: string
  location: string
  budget: string
  message: string
  name: string
  email: string
  call: boolean
  phone: string
  when: string
  honey: string
}

const EMPTY: Fields = {
  roles: [],
  company: '',
  title: '',
  location: '',
  budget: '',
  message: '',
  name: '',
  email: '',
  call: false,
  phone: '',
  when: '',
  honey: '',
}

/** A fixed, seeded star field, so it looks the same on every visit. */
function useStars(count: number) {
  return useMemo(() => {
    let seed = 7
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      top: rand() * 100,
      size: rand() < 0.15 ? 2.5 : rand() < 0.5 ? 1.6 : 1,
      delay: rand() * 5,
      duration: 2.5 + rand() * 3,
    }))
  }, [count])
}

function validate(f: Fields, mode: Mode) {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (f.message.trim().length < 10) e.message = 'A line or two helps: at least 10 characters.'
  if (!f.name.trim()) e.name = 'Your name, so I know who to reply to.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'An email I can reply to.'
  if (f.call && f.phone.replace(/\D/g, '').length < 10) e.phone = 'A number with at least 10 digits.'
  if (mode === 'hire' && f.roles.length === 0) e.roles = 'Pick at least one.'
  return e
}

/**
 * Night-sky contact section. Two ways in: a quick hello, or "Hiring for a role"
 * in three short steps. Messages go to the inbox through FormSubmit; if that
 * fails, the visitor gets a pre-filled email instead, so nothing is lost.
 */
export function Contact() {
  const toast = useToast()
  const stars = useStars(90)
  const uid = useId()
  const [mode, setMode] = useState<Mode>('hi')
  const [step, setStep] = useState(3)
  const [f, setF] = useState<Fields>(EMPTY)
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const errors = validate(f, mode)
  const show = (k: keyof Fields) => (touched ? errors[k] : undefined)
  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => setF((prev) => ({ ...prev, [k]: v }))

  const pickMode = (m: Mode) => {
    setMode(m)
    setStep(m === 'hi' ? 3 : 1)
    setTouched(false)
    if (status !== 'sending') setStatus('idle')
  }

  const onTabKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next: Mode = mode === 'hi' ? 'hire' : 'hi'
    pickMode(next)
    tabRefs.current[next === 'hi' ? 0 : 1]?.focus()
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(profile.email).then(
      () => toast('Email copied to clipboard'),
      () => toast(profile.email),
    )
  }

  const subject =
    mode === 'hire'
      ? `Portfolio: ${f.title.trim() || f.roles[0] || 'A role'}${f.company.trim() ? ` at ${f.company.trim()}` : ''}`
      : `Portfolio: hello from ${f.name.trim() || 'a visitor'}`

  const summary = [
    f.roles.length ? `Role: ${f.roles.join(', ')}` : '',
    f.title.trim() ? `Title: ${f.title.trim()}` : '',
    f.company.trim() ? `Company: ${f.company.trim()}` : '',
    f.location ? `Location: ${f.location}` : '',
    f.budget ? `Budget: ${f.budget}` : '',
  ].filter(Boolean)

  const mailto = () => {
    const body = [
      f.message.trim(),
      '',
      ...(mode === 'hire' ? summary : []),
      f.call ? `Call me: ${f.phone.trim()}${f.when.trim() ? ` (${f.when.trim()})` : ''}` : '',
      '',
      `${f.name.trim()} · ${f.email.trim()}`,
    ]
      .filter((l, i, a) => l !== '' || a[i - 1] !== '')
      .join('\n')
    return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(errors).length) {
      if (errors.roles && mode === 'hire') setStep(1)
      return
    }
    if (f.honey) {
      // A bot filled the hidden field: pretend it worked, send nothing.
      setStatus('sent')
      return
    }
    setStatus('sending')
    const payload: Record<string, string> = {
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
      _replyto: f.email.trim(),
      type: mode === 'hire' ? 'Hiring for a role' : 'Just saying hi',
      name: f.name.trim(),
      email: f.email.trim(),
      message: f.message.trim(),
    }
    if (mode === 'hire') {
      payload.roles = f.roles.join(', ')
      if (f.title.trim()) payload.role_title = f.title.trim()
      if (f.company.trim()) payload.company = f.company.trim()
      if (f.location) payload.location = f.location
      if (f.budget) payload.budget = f.budget
    }
    if (f.call) {
      payload.wants_a_call = 'Yes'
      payload.phone = f.phone.trim()
      if (f.when.trim()) payload.best_time = f.when.trim()
    }
    try {
      const res = await fetch(contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean }
      if (res.ok && String(data.success) === 'true') {
        setStatus('sent')
        toast('Sent. It is in my inbox.')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setF(EMPTY)
    setTouched(false)
    setStatus('idle')
    setStep(mode === 'hi' ? 3 : 1)
  }

  const canNext = step === 1 ? f.roles.length > 0 : true
  const err = (k: keyof Fields) => show(k) && <span className="cf-err" id={`${uid}-${k}-err`}>{show(k)}</span>
  const aria = (k: keyof Fields) =>
    show(k) ? { 'aria-invalid': true as const, 'aria-describedby': `${uid}-${k}-err` } : {}

  return (
    <section className="night" id="contact" data-section="contact" aria-labelledby={`${uid}-title`}>
      <div className="stars" aria-hidden="true">
        {stars.map((s, i) => (
          <i
            key={i}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
        <span className="shooting" />
      </div>
      <svg className="moon" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="#f6ecd9" />
        <circle cx="36" cy="38" r="7" fill="#e6d8bf" />
        <circle cx="62" cy="60" r="10" fill="#e6d8bf" />
        <circle cx="64" cy="30" r="4" fill="#e6d8bf" />
      </svg>

      <div className="wrap night-grid">
        <div className="night-head">
          <motion.p
            className="hand night-hand"
            initial={{ opacity: 0, rotate: -6, y: 10 }}
            whileInView={{ opacity: 1, rotate: -2, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
          >
            the sun's down, but the servers are up
          </motion.p>
          <motion.h2
            id={`${uid}-title`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
          >
            Got a role in mind?
            <br />
            Let's <em>talk</em>.
          </motion.h2>
        </div>

        <div className="night-intro">
          <p>
            Send a quick hello, or share a role in three short steps. I read every message myself and reply within a day.
          </p>
          <div className="direct">
            <span className="mono-label">Prefer email?</span>
            <a className="big-mail" href={`mailto:${profile.email}?subject=${encodeURIComponent('Hello from your portfolio')}`}>
              {profile.email}
              <Icon name="arrow" size={18} />
            </a>
            <div className="mail-chips">
              <Magnetic strength={0.25}>
                <button type="button" className="chip-btn" onClick={copyEmail}>
                  Copy email
                </button>
              </Magnetic>
              <Magnetic strength={0.25}>
                <Link to="/resume" className="chip-btn">
                  <Icon name="doc" size={13} /> View resume
                </Link>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a className="chip-btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a className="chip-btn" href={profile.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        <motion.div
          className="cf-card"
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        >
          <div className="cf-tabs" role="tablist" aria-label="How would you like to get in touch?">
            {(
              [
                ['hi', 'Just say hi', 'A quick message'],
                ['hire', 'Hiring for a role', 'Three short steps'],
              ] as const
            ).map(([m, title, sub], i) => (
              <button
                key={m}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${m}`}
                aria-selected={mode === m}
                aria-controls={`${uid}-panel`}
                tabIndex={mode === m ? 0 : -1}
                className={`cf-tab ${mode === m ? 'is-on' : ''}`}
                onClick={() => pickMode(m)}
                onKeyDown={onTabKey}
              >
                {mode === m && <motion.span layoutId={`${uid}-pill`} className="cf-pill" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />}
                <b>{title}</b>
                <small>{sub}</small>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {status === 'sent' ? (
              <motion.div
                key="sent"
                className="cf-sent"
                initial={{ opacity: 0, scale: 0.94, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                role="status"
              >
                <motion.span
                  className="postmark"
                  initial={{ scale: 2.2, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.15 }}
                  aria-hidden="true"
                >
                  SENT
                  <small>HYD · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</small>
                </motion.span>
                <h3>Thanks{f.name.trim() ? `, ${f.name.trim().split(' ')[0]}` : ''}!</h3>
                <p>It is in my inbox. I reply within a day, usually sooner.</p>
                <button type="button" className="cf-link" onClick={reset}>
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={`${mode}-${step}`}
                id={`${uid}-panel`}
                role="tabpanel"
                aria-labelledby={`${uid}-tab-${mode}`}
                className="cf-form"
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
              >
                {mode === 'hire' && (
                  <ol className="cf-steps" aria-label="Steps">
                    {['Role', 'Details', 'Message'].map((label, i) => (
                      <li key={label}>
                        <button
                          type="button"
                          className={step === i + 1 ? 'is-on' : step > i + 1 ? 'is-done' : ''}
                          aria-current={step === i + 1 ? 'step' : undefined}
                          disabled={i + 1 > 1 && f.roles.length === 0}
                          onClick={() => setStep(i + 1)}
                        >
                          <i>{step > i + 1 ? '✓' : i + 1}</i>
                          {label}
                        </button>
                      </li>
                    ))}
                  </ol>
                )}

                {mode === 'hire' && step === 1 && (
                  <fieldset className="cf-fs">
                    <legend>What's the role?</legend>
                    <p className="cf-sub">Pick one or more.</p>
                    <div className="cf-cards">
                      {ROLES.map((r) => {
                        const on = f.roles.includes(r.value)
                        return (
                          <label key={r.value} className={`cf-rcard ${on ? 'is-on' : ''}`}>
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() =>
                                set('roles', on ? f.roles.filter((v) => v !== r.value) : [...f.roles, r.value])
                              }
                            />
                            <Icon name={r.icon} size={16} />
                            <b>{r.value}</b>
                            <small>{r.hint}</small>
                            <span className="tick" aria-hidden="true">
                              ✓
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    {err('roles')}
                  </fieldset>
                )}

                {mode === 'hire' && step === 2 && (
                  <div className="cf-fs">
                    <p className="cf-legend">Where and how</p>
                    <p className="cf-sub">All optional. Anything you share helps me reply faster.</p>
                    <div className="cf-row2">
                      <label className="cf-field">
                        <span>Company</span>
                        <input value={f.company} onChange={(e) => set('company', e.target.value)} autoComplete="organization" maxLength={120} />
                      </label>
                      <label className="cf-field">
                        <span>Role title</span>
                        <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Software Engineer, Java" maxLength={120} />
                      </label>
                    </div>
                    <fieldset className="cf-opts">
                      <legend>Location</legend>
                      {LOCATIONS.map((l) => (
                        <label key={l} className={`cf-opt ${f.location === l ? 'is-on' : ''}`}>
                          <input type="radio" name={`${uid}-loc`} checked={f.location === l} onChange={() => set('location', l)} />
                          {l}
                        </label>
                      ))}
                    </fieldset>
                    <fieldset className="cf-opts">
                      <legend>Budget for the role</legend>
                      {BUDGETS.map((b) => (
                        <label key={b} className={`cf-opt ${f.budget === b ? 'is-on' : ''}`}>
                          <input type="radio" name={`${uid}-budget`} checked={f.budget === b} onChange={() => set('budget', b)} />
                          {b}
                        </label>
                      ))}
                    </fieldset>
                  </div>
                )}

                {step === 3 && (
                  <>
                    {mode === 'hire' && summary.length > 0 && (
                      <div className="cf-summary" aria-label="Your answers so far">
                        {summary.map((s) => (
                          <span key={s}>{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="postcard">
                      <label className="pc-note">
                        <span className="pc-label">{mode === 'hire' ? "What's the team building?" : 'Your message'}</span>
                        <textarea
                          value={f.message}
                          onChange={(e) => set('message', e.target.value)}
                          rows={6}
                          maxLength={3000}
                          required
                          placeholder={
                            mode === 'hire'
                              ? 'A few lines is plenty. A link to the job description helps too.'
                              : 'A question, an idea, or just hello'
                          }
                          {...aria('message')}
                        />
                        {err('message')}
                      </label>
                      <div className="pc-side">
                        <svg className="stamp" viewBox="0 0 84 100" aria-hidden="true">
                          <rect x="3" y="3" width="78" height="94" rx="3" fill="#fff4e6" stroke="#e2cfb5" strokeDasharray="3 3" />
                          <rect x="10" y="10" width="64" height="62" fill="#ff9900" />
                          <circle cx="42" cy="46" r="16" fill="#ffe58a" />
                          <path d="M10 58h64v14H10z" fill="#14161f" opacity=".85" />
                          <text x="42" y="88" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#6b7080">
                            ₹ 5 · IN
                          </text>
                        </svg>
                        <span className="pc-from">From</span>
                        <label className="cf-line">
                          <span className="sr-only">Your name</span>
                          <input
                            value={f.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="Your name"
                            autoComplete="name"
                            maxLength={80}
                            required
                            {...aria('name')}
                          />
                          {err('name')}
                        </label>
                        <label className="cf-line">
                          <span className="sr-only">Email</span>
                          <input
                            type="email"
                            value={f.email}
                            onChange={(e) => set('email', e.target.value)}
                            placeholder="Email"
                            autoComplete="email"
                            maxLength={120}
                            required
                            {...aria('email')}
                          />
                          {err('email')}
                        </label>
                        <span className="pc-to">To: Pramodh, Hyderabad</span>
                      </div>
                    </div>

                    <label className="cf-toggle">
                      <input type="checkbox" checked={f.call} onChange={(e) => set('call', e.target.checked)} />
                      <span className="knob" aria-hidden="true" />
                      I'd rather talk on a quick call
                    </label>
                    <AnimatePresence initial={false}>
                      {f.call && (
                        <motion.div
                          className="cf-row2 cf-call"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <label className="cf-field">
                            <span>Phone</span>
                            <input
                              type="tel"
                              value={f.phone}
                              onChange={(e) => set('phone', e.target.value)}
                              autoComplete="tel"
                              maxLength={20}
                              {...aria('phone')}
                            />
                            {err('phone')}
                          </label>
                          <label className="cf-field">
                            <span>Best time</span>
                            <input value={f.when} onChange={(e) => set('when', e.target.value)} placeholder="e.g. weekdays after 6 PM" maxLength={80} />
                          </label>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Spam trap: invisible to people, tempting to bots. */}
                    <label className="cf-honey" aria-hidden="true">
                      Leave this empty
                      <input tabIndex={-1} autoComplete="off" value={f.honey} onChange={(e) => set('honey', e.target.value)} />
                    </label>
                  </>
                )}

                <div className="cf-actions">
                  {mode === 'hire' && step > 1 && (
                    <button type="button" className="cf-back" onClick={() => setStep(step - 1)}>
                      ← Back
                    </button>
                  )}
                  {mode === 'hire' && step < 3 ? (
                    <button
                      type="button"
                      className="cf-send"
                      onClick={() => {
                        if (canNext) setStep(step + 1)
                        else setTouched(true)
                      }}
                    >
                      Next <Icon name="arrow" size={15} />
                    </button>
                  ) : (
                    <button type="submit" className="cf-send" disabled={status === 'sending'}>
                      {status === 'sending' ? 'Sending…' : 'Send message'} <Icon name="arrow" size={15} />
                    </button>
                  )}
                </div>

                {status === 'error' && (
                  <p className="cf-fail" role="alert">
                    That didn't go through. <a href={mailto()}>Send it as an email instead</a>, your message is already filled in.
                  </p>
                )}

                <p className="cf-privacy">
                  Your details go straight to my inbox through FormSubmit and are only used to reply. Nothing is stored on
                  this site.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
