import { motion, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import { FINE_POINTER, useMediaQuery } from '../hooks/useMediaQuery'
import { pointerX, startPointerTracking } from '../lib/pointer'

/** Figma-style top ruler. A blue marker tracks the cursor and reads out its x position. */
export function Ruler() {
  const fine = useMediaQuery(FINE_POINTER)
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth))
  const label = useTransform(pointerX, (v) => `${Math.max(0, Math.round(v))}`)

  useEffect(() => {
    if (fine) startPointerTracking()
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fine])

  const marks = []
  for (let x = 0; x <= width; x += 100) marks.push(x)

  return (
    <div className="ruler" aria-hidden="true">
      {marks.map((x) => (
        <span key={x} className="ruler-num" style={{ left: x + 3 }}>
          {x}
        </span>
      ))}
      {fine && (
        <motion.div className="ruler-marker" style={{ x: pointerX }}>
          <motion.span>{label}</motion.span>
        </motion.div>
      )}
    </div>
  )
}
