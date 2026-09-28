import { MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CommandPalette } from './components/CommandPalette'
import { Cursor } from './components/Cursor'
import { Nav } from './components/Nav'
import { Ruler } from './components/Ruler'
import { SmoothScroll } from './components/SmoothScroll'
import { ToastProvider } from './components/Toast'
import { TouchPresence } from './components/TouchPresence'
import { FINE_POINTER, useMediaQuery } from './hooks/useMediaQuery'
import { initGyro, startPointerScene } from './lib/scene'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const Playground = lazy(() => import('./pages/Playground'))
const Resume = lazy(() => import('./pages/Resume'))

// Shareable links to a section of the home page, e.g. /#/work from the GitHub profile README.
const SECTION_LINKS = ['about', 'work', 'stack', 'contact']

/** Feeds the shared scene tilt: the cursor on desktop, the phone's tilt on touch screens. */
function SceneDriver() {
  const fine = useMediaQuery(FINE_POINTER)
  useEffect(() => {
    if (fine) startPointerScene()
    else initGyro()
  }, [fine])
  return null
}

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
      pathname === '/playground'
        ? 'Playground · Kadam Pramodh'
        : pathname === '/resume'
          ? 'Resume · Kadam Pramodh'
          : 'Kadam Pramodh · Backend Engineer'
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
            {SECTION_LINKS.map((id) => (
              <Route key={id} path={`/${id}`} element={<Navigate to="/" replace state={{ section: id }} />} />
            ))}
            <Route
              path="/playground"
              element={
                <Suspense fallback={<div className="pg-loading">loading canvas…</div>}>
                  <Playground />
                </Suspense>
              }
            />
            <Route
              path="/resume"
              element={
                <Suspense fallback={<div className="pg-loading">loading resume…</div>}>
                  <Resume />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <Cursor />
          <TouchPresence />
          <CommandPalette />
          <SceneDriver />
        </ToastProvider>
      </SmoothScroll>
    </MotionConfig>
  )
}
