import Lenis from 'lenis'
import { useEffect, useState, type ReactNode } from 'react'
import { REDUCED_MOTION, useMediaQuery } from '../hooks/useMediaQuery'
import { LenisContext } from '../lib/lenis'

/** Lenis inertia scrolling, the same library the reference site uses. Off for reduced motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useMediaQuery(REDUCED_MOTION)
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return
    const instance = new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true })
    setLenis(instance)
    return () => {
      instance.destroy()
      setLenis(null)
    }
  }, [reduced])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
