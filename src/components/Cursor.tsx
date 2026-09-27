import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { FINE_POINTER, useMediaQuery } from '../hooks/useMediaQuery'
import { pointerX, pointerY, startPointerTracking } from '../lib/pointer'

/**
 * Figma-style multiplayer cursor, rebuilt from the reference site's Framer "Cursor" component:
 *  - default: 16px white dot + "You" tag, drawn with mix-blend-mode: difference
 *  - expand:  springs into a 350px selection frame with four corner handles
 *  - see:     80px bubble reading "See"
 *  - drag:    the dot with a "Drag" tag
 * Elements opt in with data-cursor="expand|see|drag". Variant changes use the
 * reference's spring (duration 0.4, bounce 0).
 */
type Variant = 'default' | 'expand' | 'see' | 'drag'

const SIZE: Record<Variant, number> = { default: 16, expand: 350, see: 80, drag: 16 }
const SPRING = { type: 'spring', duration: 0.4, bounce: 0 } as const
const HANDLE = 16

function readVariant(target: EventTarget | null): Variant {
  const el = target instanceof Element ? target.closest('[data-cursor]') : null
  const v = el?.getAttribute('data-cursor')
  return v === 'expand' || v === 'see' || v === 'drag' ? v : 'default'
}

export function Cursor() {
  const fine = useMediaQuery(FINE_POINTER)
  const [variant, setVariant] = useState<Variant>('default')
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (!fine) return
    startPointerTracking()
    const root = document.documentElement
    root.classList.add('has-cursor')

    const onOver = (e: PointerEvent) => setVariant(readVariant(e.target))
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') setVisible(true)
    }
    const onLeave = () => setVisible(false)
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointermove', onMove, { passive: true })
    root.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)
    return () => {
      root.classList.remove('has-cursor')
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
    }
  }, [fine])

  if (!fine) return null

  const s = SIZE[variant]
  const expand = variant === 'expand'
  const center = s / 2 - HANDLE / 2
  const corners = [
    { left: 0, top: 0 },
    { left: s - HANDLE, top: 0 },
    { left: 0, top: s - HANDLE },
    { left: s - HANDLE, top: s - HANDLE },
  ]
  const showTag = variant === 'default' || variant === 'drag'

  return (
    <motion.div
      className="cursor-root"
      aria-hidden="true"
      style={{ x: pointerX, y: pointerY }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="cursor-body"
        initial={false}
        animate={{ width: s, height: s, scale: pressed && !expand ? 0.8 : 1 }}
        transition={SPRING}
      >
        <motion.div
          className="cursor-base"
          initial={false}
          animate={{
            top: expand ? 8 : 0,
            left: expand ? 8 : 0,
            right: expand ? 8 : 0,
            bottom: expand ? 8 : 0,
            borderRadius: expand ? 0 : 128,
          }}
          transition={SPRING}
        />
        {corners.map((c, i) => (
          <motion.div
            key={i}
            className="cursor-handle"
            initial={false}
            animate={{
              left: expand ? c.left : center,
              top: expand ? c.top : center,
              borderRadius: expand ? 0 : 16,
            }}
            transition={SPRING}
          />
        ))}
        <motion.div
          className="cursor-tag"
          initial={false}
          animate={{ opacity: showTag ? 1 : 0, scale: showTag ? 1 : 0.4 }}
          transition={SPRING}
        >
          {variant === 'drag' ? 'Drag' : 'You'}
        </motion.div>
        <AnimatePresence>
          {variant === 'see' && (
            <motion.span
              className="cursor-see"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={SPRING}
            >
              See
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
