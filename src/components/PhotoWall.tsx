import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { photoSrc, photos, type Photo } from '../data/photos'
import { DESKTOP_DRAG, REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'
import { clamp } from '../lib/pointer'
import { Lightbox } from './Lightbox'
import { nextZ } from '../lib/pointer'
import { Sticker } from './Sticker'

// Hand-placed tilts so the wall looks pinned up, not generated.
const TILTS = [-6, 4, -3, 7, -8, 3, -4, 6, -2, 5, -7, 2, -5, 8, -3, 4, -6]

function Polaroid({ photo, eager }: { photo: Photo; eager?: boolean }) {
  return (
    <figure className="polaroid">
      <div className="polaroid-img" style={{ aspectRatio: `${photo.width} / ${photo.height}`, background: photo.color }}>
        <img
          src={photoSrc(photo, 640)}
          srcSet={`${photoSrc(photo, 640)} 1x, ${photoSrc(photo, 1280)} 2x`}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
        />
      </div>
      {photo.caption && <figcaption>{photo.caption}</figcaption>}
    </figure>
  )
}

/**
 * Photo wall: on desktop a spread of draggable 3D polaroids; on touch screens a
 * swipeable strip. Any photo opens full-screen at full quality.
 */
export function PhotoWall() {
  const desktop = useMediaQuery(DESKTOP_DRAG)
  const wallRef = useRef<HTMLDivElement>(null)
  const reduced = useMediaQuery(REDUCED_MOTION)
  const stripRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])

  // Phone strip as a coverflow: each photo turns and shrinks by its distance from centre.
  useEffect(() => {
    const strip = stripRef.current
    if (desktop || reduced || !strip) return
    let frame = 0
    const paint = () => {
      const mid = window.innerWidth / 2
      for (const el of Array.from(strip.children) as HTMLElement[]) {
        const r = el.getBoundingClientRect()
        const d = clamp((r.left + r.width / 2 - mid) / r.width, -1.6, 1.6)
        const a = Math.min(Math.abs(d), 1)
        el.style.transform = `perspective(900px) rotateY(${(-d * 24).toFixed(2)}deg) scale(${(1 - a * 0.1).toFixed(3)})`
        el.style.zIndex = String(100 - Math.round(Math.abs(d) * 10))
        el.style.opacity = String(1 - a * 0.25)
      }
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(paint)
    }
    paint()
    strip.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      strip.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [desktop, reduced])

  if (photos.length === 0) return null

  return (
    <>
      {desktop ? (
        <div ref={wallRef} className="photo-wall">
          {photos.map((p, i) => (
            <motion.div
              key={p.id}
              className="photo-slot"
              // Each slot is its own stacking context, so raise the slot, not just the sticker.
              onPointerDownCapture={(e) => {
                e.currentTarget.style.zIndex = String(nextZ())
              }}
              initial={{ opacity: 0, y: 40, rotate: TILTS[i % TILTS.length] - 10 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: 'spring', stiffness: 693, damping: 30, mass: 7.3, delay: (i % 4) * 0.06 }}
            >
              <Sticker
                rotate={TILTS[i % TILTS.length]}
                bounds={wallRef}
                cursor="see"
                label={`Open photo ${i + 1}${p.alt ? `: ${p.alt}` : ''}`}
                onActivate={() => setOpen(i)}
              >
                <Polaroid photo={p} />
              </Sticker>
            </motion.div>
          ))}
        </div>
      ) : (
        <div ref={stripRef} className="photo-strip" aria-label="Photos">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="photo-strip-item"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1}`}
            >
              <Polaroid photo={p} eager={i < 2} />
            </button>
          ))}
        </div>
      )}
      {/* Portal to <body> so the viewer sits above the sticky nav, outside main's stacking context. */}
      {createPortal(
        <AnimatePresence>
          {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={close} />}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
