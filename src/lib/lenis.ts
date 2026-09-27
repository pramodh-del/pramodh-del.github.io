import type Lenis from 'lenis'
import { createContext, useContext } from 'react'

export const LenisContext = createContext<Lenis | null>(null)

export const useLenis = () => useContext(LenisContext)

/** Scrolls to a section id, smoothly when Lenis is running and natively otherwise. */
export function scrollToId(lenis: Lenis | null, id: string, immediate = false) {
  const el = document.getElementById(id)
  if (!el) return
  const offset = -56
  if (lenis) {
    // Lenis caches the page height; after a route change it may still hold the old one.
    lenis.resize()
    lenis.scrollTo(el, { offset, immediate, force: true })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' })
  }
}
