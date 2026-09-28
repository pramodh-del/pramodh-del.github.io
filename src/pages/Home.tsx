import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToId, useLenis } from '../lib/lenis'
import { TickerBand } from '../components/TickerBand'
import { About } from '../sections/About'
import { Hero } from '../sections/Hero'
import { Contact } from '../sections/Contact'
import { OffClock, SideBuilds, Stack } from '../sections/More'
import { Work } from '../sections/Work'

export default function Home() {
  const lenis = useLenis()
  const location = useLocation()
  const navigate = useNavigate()
  const section = (location.state as { section?: string } | null)?.section

  // Arriving from another route with a section to jump to (e.g. Playground → Work).
  useEffect(() => {
    if (!section) return
    const id = window.setTimeout(() => {
      scrollToId(lenis, section, true)
      navigate('.', { replace: true, state: null })
    }, 60)
    return () => window.clearTimeout(id)
  }, [section, lenis, navigate])

  return (
    <main>
      <Hero />
      <About />
      <TickerBand />
      <Work />
      <SideBuilds />
      <Stack />
      <OffClock />
      <Contact />
    </main>
  )
}
