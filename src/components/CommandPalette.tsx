import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { profile, resume } from '../data/profile'
import { emit, INCIDENT, PALETTE, SCATTER } from '../lib/events'
import { scrollToId, useLenis } from '../lib/lenis'
import { requestGyro, useGyro } from '../lib/scene'
import { useToast } from '../lib/toast'

interface Command {
  id: string
  label: string
  hint: string
  group: 'Go to' | 'Contact' | 'Play'
  run: () => void
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))

/** ⌘K / Ctrl+K / "/" command menu: jump anywhere, copy the email, or play with the page. */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const lenis = useLenis()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const toast = useToast()
  const gyro = useGyro()

  const close = useCallback(() => setOpen(false), [])

  const commands = useMemo<Command[]>(() => {
    const go = (id: string) => () => {
      if (pathname === '/') scrollToId(lenis, id)
      else navigate('/', { state: { section: id } })
    }
    const list: Command[] = [
      { id: 'home', label: 'Home', hint: 'top of the page', group: 'Go to', run: go('top') },
      { id: 'about', label: 'About', hint: "what's up", group: 'Go to', run: go('about') },
      { id: 'work', label: 'Work', hint: 'four case studies', group: 'Go to', run: go('work') },
      { id: 'stack', label: 'Stack', hint: 'what I work with', group: 'Go to', run: go('stack') },
      { id: 'contact', label: 'Contact', hint: "let's talk", group: 'Go to', run: go('contact') },
      { id: 'playground', label: 'Playground', hint: 'throwable cards', group: 'Go to', run: () => navigate('/playground') },
      { id: 'resume', label: 'View resume', hint: 'opens here, no download', group: 'Go to', run: () => navigate('/resume') },
      {
        id: 'resume-pdf',
        label: 'Download resume (PDF)',
        hint: 'one page',
        group: 'Contact',
        run: () => {
          const a = document.createElement('a')
          a.href = `${import.meta.env.BASE_URL}${resume.pdf}`
          a.download = 'Kadam_Pramodh_Resume.pdf'
          a.click()
        },
      },
      {
        id: 'email',
        label: 'Copy email',
        hint: profile.email,
        group: 'Contact',
        run: () => {
          navigator.clipboard.writeText(profile.email).then(
            () => toast('Email copied to clipboard'),
            () => toast(profile.email),
          )
        },
      },
      {
        id: 'linkedin',
        label: 'Open LinkedIn',
        hint: 'new tab',
        group: 'Contact',
        run: () => window.open(profile.linkedin, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'github',
        label: 'Open GitHub',
        hint: 'new tab',
        group: 'Contact',
        run: () => window.open(profile.github, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'scatter',
        label: 'Scatter the stickers',
        hint: 'or shake your phone',
        group: 'Play',
        run: () => {
          if (pathname !== '/') navigate('/')
          window.setTimeout(() => emit(SCATTER), pathname === '/' ? 0 : 400)
        },
      },
      {
        id: 'incident',
        label: 'Page the on-call bot',
        hint: 'it is 2 AM somewhere',
        group: 'Play',
        run: () => {
          if (pathname === '/') {
            scrollToId(lenis, 'top')
            window.setTimeout(() => emit(INCIDENT), 450)
          } else {
            navigate('/')
            window.setTimeout(() => emit(INCIDENT), 700)
          }
        },
      },
    ]
    if (gyro === 'needs-permission') {
      list.push({ id: 'tilt', label: 'Turn on tilt', hint: 'move your phone', group: 'Play', run: () => void requestGyro() })
    }
    return list
  }, [gyro, lenis, navigate, pathname, toast])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.hint} ${c.group}`.toLowerCase().includes(q))
  }, [commands, query])

  // Open / close from the keyboard or from anywhere via the PALETTE event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === '/' && !open && !isTyping(e.target)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(PALETTE, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(PALETTE, onOpen)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    setQuery('')
    setActive(0)
    lenis?.stop()
    window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => {
      lenis?.start()
      opener?.focus?.()
    }
  }, [open, lenis])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const run = (c: Command) => {
    setOpen(false)
    // Let the dialog close and focus return before acting.
    window.setTimeout(c.run, 60)
  }

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (results.length ? (a + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const c = results[active]
      if (c) run(c)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  }

  let lastGroup = ''
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmdk-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
        >
          <motion.div
            className="cmdk"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="cmdk-input">
              <span aria-hidden="true">⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                placeholder="Type a command or search…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmdk-list"
                aria-activedescendant={results[active] ? `cmdk-${results[active].id}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd>esc</kbd>
            </div>
            <ul ref={listRef} id="cmdk-list" className="cmdk-list" role="listbox" aria-label="Commands">
              {results.length === 0 && <li className="cmdk-empty">No command matches “{query}”.</li>}
              {results.map((c, i) => {
                const header = c.group !== lastGroup ? c.group : null
                lastGroup = c.group
                return (
                  <li key={c.id} role="presentation">
                    {header && <div className="cmdk-group">{header}</div>}
                    <div
                      id={`cmdk-${c.id}`}
                      role="option"
                      aria-selected={i === active}
                      className={`cmdk-item ${i === active ? 'is-active' : ''}`}
                      onMouseMove={() => setActive(i)}
                      onClick={() => run(c)}
                    >
                      <span>{c.label}</span>
                      <small>{c.hint}</small>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="cmdk-foot" aria-hidden="true">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> move
              </span>
              <span>
                <kbd>↵</kbd> run
              </span>
              <span>
                <kbd>⌘</kbd>
                <kbd>K</kbd> toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
