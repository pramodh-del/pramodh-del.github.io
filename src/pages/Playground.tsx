import gsap from 'gsap'
import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { profile } from '../data/profile'
import { Icon } from '../components/Icons'
import { useLenis } from '../lib/lenis'

/**
 * Pan / zoom canvas of throwable cards, ported from the reference site's playground
 * component. Behaviour kept from the original:
 *  - cards laid out on a jittered grid (±38% of a cell), each rotated ±8°
 *  - drag empty space to pan; releases settle over 0.5s (power3.out)
 *  - wheel or pinch zooms toward the pointer, clamped 0.5–1, 0.25s (power2.out)
 *  - cards scale to 1.1 on hover / grab, and fly on with their release velocity × 6
 *  - a card with a link opens it on click (movement under 4px)
 */

interface Item {
  size: number
  bg: string
  fg?: string
  link?: string
  note?: string
  noteColor?: string
  body: ReactNode
}

const ITEMS: Item[] = [
  {
    size: 220,
    bg: 'var(--aws)',
    note: 'passed it first try',
    body: (
      <div className="pg-center">
        <Icon name="cloud" size={56} />
        <b>AWS Certified</b>
        <span>Cloud Practitioner</span>
      </div>
    ),
  },
  {
    size: 250,
    bg: 'var(--navy)',
    fg: '#D7DAE3',
    note: 'delete only after commit',
    noteColor: 'var(--spring)',
    body: (
      <pre className="pg-code">
        <span className="c-a">@SqsListener</span>(
        {'\n  '}value = <span className="c-s">"events.fifo"</span>,
        {'\n  '}acknowledgementMode ={'\n    '}
        <span className="c-s">"MANUAL"</span>){'\n'}
        <span className="c-k">void</span> on(Message m,{'\n    '}Acknowledgement ack)
      </pre>
    ),
  },
  {
    size: 200,
    bg: 'var(--note)',
    body: <p className="pg-hand">Learning next: Kafka, and what Spring Cloud does under the hood.</p>,
  },
  {
    size: 220,
    bg: '#fff',
    note: 'favourite settings',
    body: (
      <div className="pg-exif">
        <span>f/2.8</span>
        <span>1/1000s</span>
        <span>ISO 200</span>
        <small>wildlife, when I get out of the city</small>
      </div>
    ),
  },
  {
    size: 290,
    bg: 'var(--navy)',
    fg: '#D7DAE3',
    body: (
      <pre className="pg-code">
        <span className="c-k">try</span> (<span className="c-k">var</span> ex = Executors{'\n    '}.newVirtualThreadPerTaskExecutor()){' '}
        {'{'}
        {'\n  '}ex.submit(() -&gt;{'\n    '}handle(socket));{'\n'}
        {'}'}
      </pre>
    ),
    note: 'Java 21',
  },
  {
    size: 200,
    bg: 'var(--spring)',
    body: (
      <div className="pg-center">
        <span className="pg-year">2026</span>
        <b>Promoted to Analyst</b>
      </div>
    ),
  },
  {
    size: 190,
    bg: '#fff',
    link: profile.github,
    note: 'click me',
    noteColor: 'var(--note)',
    body: (
      <div className="pg-center">
        <svg viewBox="0 0 24 24" width="46" height="46" fill="currentColor" aria-hidden="true">
          <path d="M12 1.5a10.5 10.5 0 0 0-3.3 20.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.3.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.3 0c2-1.4 2.9-1.1 2.9-1.1.6 1.5.2 2.5.1 2.8.7.7 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5z" />
        </svg>
        <b>GitHub</b>
        <span>pramodh-del</span>
      </div>
    ),
  },
  {
    size: 230,
    bg: '#EAF5E2',
    body: (
      <div className="pg-hash">
        <b>WSDL SHA-256</b>
        <span>old C6C9CB…0344A6</span>
        <span>new C6C9CB…0344A6</span>
        <em>identical ✓</em>
      </div>
    ),
    note: '26 ops, 0 breaks',
  },
  {
    size: 200,
    bg: 'var(--blue)',
    fg: '#fff',
    link: profile.linkedin,
    body: (
      <div className="pg-center">
        <span className="pg-big">in</span>
        <b>LinkedIn</b>
        <span>say hi</span>
      </div>
    ),
  },
  {
    size: 210,
    bg: '#fff',
    body: (
      <div className="pg-flow">
        <span>API Gateway</span>
        <i>↓</i>
        <span>VPC Link → ALB</span>
        <i>↓</i>
        <span className="hl">ECS Fargate</span>
        <i>↓</i>
        <span>SQS FIFO + DLQ</span>
      </div>
    ),
  },
  {
    size: 200,
    bg: 'var(--oracle)',
    fg: '#fff',
    body: (
      <div className="pg-center">
        <span className="pg-year">3m→&lt;60s</span>
        <b>one query, paged</b>
      </div>
    ),
    note: 'HAR traces FTW',
  },
  {
    size: 200,
    bg: 'var(--note)',
    body: <p className="pg-hand">Make it work, make it right, make it fast. In that order.</p>,
  },
]

interface Placed extends Item {
  id: string
  x: number
  y: number
  rotation: number
  noteOffset: number
}

function layout(items: Item[]): Placed[] {
  const cell = Math.max(...items.map((i) => i.size)) + 80
  const cols = Math.ceil(Math.sqrt(items.length))
  const rows = Math.ceil(items.length / cols)
  const r = gsap.utils.random
  return items.map((item, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const jitter = cell * 0.38
    return {
      ...item,
      id: `item-${i}`,
      x: (col - (cols - 1) / 2) * cell + r(-jitter, jitter),
      y: (row - (rows - 1) / 2) * cell + r(-jitter, jitter),
      rotation: r(-8, 8),
      noteOffset: r(-item.size * 0.3, item.size * 0.3),
    }
  })
}

type ActiveDrag = {
  local: MutableRefObject<{ x: number; y: number }>
  lastPos: { x: number; y: number }
  velocity: { x: number; y: number }
} | null

function Card({
  item,
  canvasDragging,
  activeDrag,
}: {
  item: Placed
  canvasDragging: MutableRefObject<boolean>
  activeDrag: MutableRefObject<ActiveDrag>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: item.x, y: item.y })
  const isLink = Boolean(item.link)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.set(el, { x: pos.current.x, y: pos.current.y, rotation: item.rotation })
    const tick = () => {
      gsap.set(el, { x: pos.current.x, y: pos.current.y })
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [item.rotation])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (canvasDragging.current) return
    e.stopPropagation()
    const el = ref.current
    if (!el) return
    const velocity = { x: 0, y: 0 }
    const start = { x: e.clientX, y: e.clientY }
    let moved = false
    activeDrag.current = { local: pos, lastPos: { x: e.clientX, y: e.clientY }, velocity }
    gsap.killTweensOf(pos.current)
    gsap.killTweensOf(el)
    gsap.to(el, { scale: 1.1, duration: 0.2, ease: 'power2.out' })
    el.style.zIndex = '100'

    const onMove = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - start.x) > 4 || Math.abs(ev.clientY - start.y) > 4) moved = true
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (activeDrag.current?.local !== pos) return
      activeDrag.current = null
      gsap.to(el, { scale: 1, duration: 0.25, ease: 'power2.out' })
      el.style.zIndex = ''
      if (!moved && item.link) {
        window.open(item.link, '_blank', 'noopener,noreferrer')
        return
      }
      gsap.to(pos.current, {
        x: pos.current.x + velocity.x * 6,
        y: pos.current.y + velocity.y * 6,
        duration: 0.6,
        ease: 'power3.out',
      })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      ref={ref}
      className={`pg-card ${isLink ? 'is-link' : ''}`}
      data-card="true"
      data-cursor={isLink ? 'see' : 'drag'}
      style={{ width: item.size, height: item.size, background: item.bg, color: item.fg ?? 'var(--ink)' }}
      onPointerDown={onPointerDown}
      onPointerEnter={() => {
        if (canvasDragging.current || activeDrag.current) return
        if (ref.current) gsap.to(ref.current, { scale: 1.1, duration: 0.2, ease: 'power2.out' })
      }}
      onPointerLeave={() => {
        if (activeDrag.current?.local === pos) return
        if (ref.current) gsap.to(ref.current, { scale: 1, duration: 0.2, ease: 'power2.out' })
      }}
    >
      {item.body}
      {item.note && (
        <span
          className="pg-note"
          style={{ left: `calc(50% + ${item.noteOffset}px)`, background: item.noteColor ?? '#fff' }}
          aria-hidden="true"
        >
          {item.note}
        </span>
      )}
    </div>
  )
}

export default function Playground() {
  const lenis = useLenis()
  const viewport = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const offset = useRef({ x: 0, y: 0 })
  const scale = useRef(1)
  const panning = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const pinch = useRef<number | null>(null)
  const activeDrag = useRef<ActiveDrag>(null)
  const items = useMemo(() => layout(ITEMS), [])

  // The canvas owns the wheel, so pause page smooth-scrolling while it is mounted.
  useEffect(() => {
    lenis?.stop()
    window.scrollTo(0, 0)
    return () => lenis?.start()
  }, [lenis])

  useEffect(() => {
    const el = world.current
    const vp = viewport.current
    if (!el || !vp) return

    const zoomTo = (target: number, px: number, py: number) => {
      const next = Math.min(1, Math.max(0.5, target))
      const ratio = next / scale.current
      offset.current.x = px + (offset.current.x - px) * ratio
      offset.current.y = py + (offset.current.y - py) * ratio
      scale.current = next
      gsap.to(el, { x: offset.current.x, y: offset.current.y, scale: next, duration: 0.25, ease: 'power2.out' })
    }

    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('[data-card]')) return
      panning.current = true
      last.current = { x: e.clientX, y: e.clientY }
      vp.classList.add('is-panning')
      gsap.killTweensOf(el)
    }
    const onMove = (e: PointerEvent) => {
      if (panning.current) {
        offset.current.x += e.clientX - last.current.x
        offset.current.y += e.clientY - last.current.y
        last.current = { x: e.clientX, y: e.clientY }
        gsap.set(el, { x: offset.current.x, y: offset.current.y })
        return
      }
      const drag = activeDrag.current
      if (drag) {
        const dx = (e.clientX - drag.lastPos.x) / scale.current
        const dy = (e.clientY - drag.lastPos.y) / scale.current
        drag.velocity.x = dx
        drag.velocity.y = dy
        drag.lastPos.x = e.clientX
        drag.lastPos.y = e.clientY
        drag.local.current.x += dx
        drag.local.current.y += dy
      }
    }
    const onUp = () => {
      if (!panning.current) return
      panning.current = false
      vp.classList.remove('is-panning')
      gsap.to(el, { x: offset.current.x, y: offset.current.y, duration: 0.5, ease: 'power3.out' })
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = vp.getBoundingClientRect()
      zoomTo(scale.current + (e.deltaY > 0 ? -0.05 : 0.05), e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2)
    }
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinch.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || pinch.current === null) return
      e.preventDefault()
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      const r = vp.getBoundingClientRect()
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2
      zoomTo(scale.current * (d / pinch.current), mx - r.left - r.width / 2, my - r.top - r.height / 2)
      pinch.current = d
    }
    const onTouchEnd = () => {
      pinch.current = null
    }

    // Start zoomed out a little on small screens so more cards are visible.
    if (window.innerWidth < 760) {
      scale.current = 0.55
      gsap.set(el, { scale: 0.55 })
    } else if (window.innerWidth < 1200) {
      scale.current = 0.75
      gsap.set(el, { scale: 0.75 })
    }

    vp.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    vp.addEventListener('wheel', onWheel, { passive: false })
    vp.addEventListener('touchstart', onTouchStart, { passive: true })
    vp.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      vp.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      vp.removeEventListener('wheel', onWheel)
      vp.removeEventListener('touchstart', onTouchStart)
      vp.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      gsap.killTweensOf(el)
    }
  }, [])

  const recenter = () => {
    const el = world.current
    if (!el) return
    offset.current = { x: 0, y: 0 }
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' })
  }

  return (
    <main className="playground">
      <h1 className="sr-only">Playground: a canvas of notes and snippets</h1>
      <div ref={viewport} className="pg-viewport" data-cursor="drag" data-lenis-prevent>
        <div ref={world} className="pg-world">
          {items.map((item) => (
            <Card key={item.id} item={item} canvasDragging={panning} activeDrag={activeDrag} />
          ))}
        </div>
      </div>
      <motion.div
        className="pg-hud"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', bounce: 0.3, duration: 0.5 }}
      >
        <span className="hud-long">drag to pan · scroll or pinch to zoom · throw the cards</span>
        <span className="hud-short">drag · pinch · throw</span>
        <button type="button" onClick={recenter}>
          Recenter
        </button>
      </motion.div>
    </main>
  )
}
