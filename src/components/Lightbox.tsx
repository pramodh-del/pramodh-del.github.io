import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { photoSrc, photoSrcSet, type Photo } from '../data/photos'
import { useLenis } from '../lib/lenis'

const SPRING = { type: 'spring', bounce: 0.25, duration: 0.35 } as const

/** Full-screen photo viewer: full-quality image, arrow keys / buttons to move, Esc to close. */
export function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: Photo[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const lenis = useLenis()
  const closeRef = useRef<HTMLButtonElement>(null)
  const photo = photos[index]
  const count = photos.length
  const go = (d: number) => onIndex((index + d + count) % count)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lenis?.start()
      opener?.focus()
    }
  }, [lenis, onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onIndex((index + 1) % count)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + count) % count)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, count, onIndex])

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="lb-bar" onClick={(e) => e.stopPropagation()}>
        <span>
          {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
        </span>
        <button ref={closeRef} type="button" onClick={onClose}>
          Close ✕
        </button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.picture
          key={photo.id}
          className="lb-picture"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1, transition: SPRING }}
          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
          onClick={(e) => e.stopPropagation()}
        >
          <source type="image/webp" srcSet={photoSrcSet(photo)} sizes="100vw" />
          <img
            src={photoSrc(photo, 2560, 'jpg')}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            style={{ background: photo.color }}
          />
        </motion.picture>
      </AnimatePresence>
      {photo.caption && <p className="lb-caption">{photo.caption}</p>}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="lb-nav lb-prev"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
          >
            ←
          </button>
          <button
            type="button"
            className="lb-nav lb-next"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
          >
            →
          </button>
        </>
      )}
    </motion.div>
  )
}
