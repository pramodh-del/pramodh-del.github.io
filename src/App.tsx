import { MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Cursor } from './components/Cursor'
import { Nav } from './components/Nav'
import { Ruler } from './components/Ruler'
import { SmoothScroll } from './components/SmoothScroll'
import { ToastProvider } from './components/Toast'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const Playground = lazy(() => import('./pages/Playground'))

function Footer() {
  const { pathname } = useLocation()
  if (pathname === '/playground') return null
  return (
    <footer>
      Designed and built by Kadam Pramodh · Hyderabad · 2026
      <br />
      React · Motion · GSAP · Lenis. Stickers on this page are draggable.
    </footer>
  )
}

function TitleSync() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title =
      pathname === '/playground' ? 'Playground · Kadam Pramodh' : 'Kadam Pramodh · Backend Engineer'
  }, [pathname])
  return null
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <ToastProvider>
          <TitleSync />
          <Nav />
          <Ruler />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/playground"
              element={
                <Suspense fallback={<div className="pg-loading">loading canvas…</div>}>
                  <Playground />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <Cursor />
        </ToastProvider>
      </SmoothScroll>
    </MotionConfig>
  )
}
