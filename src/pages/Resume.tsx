import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tilt } from '../components/Reveal'
import { profile, resume } from '../data/profile'
import { resumeText } from '../data/resumeText'
import { useToast } from '../lib/toast'

const base = import.meta.env.BASE_URL

/**
 * The resume, shown inside the site. Recruiters read it here on any device (phones
 * can't show PDFs inline, so the page is a sharp image of the PDF with its text
 * available to screen readers). Downloading is a separate, deliberate button.
 */
export default function Resume() {
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#/resume`
    navigator.clipboard.writeText(url).then(
      () => toast('Resume link copied'),
      () => toast(url),
    )
  }

  const back = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  return (
    <main className="resume-page wrap">
      <div className="resume-bar">
        <button type="button" className="rb-back" onClick={back}>
          <span aria-hidden="true">←</span> Back
        </button>
        <div className="rb-title">
          <h1>Resume</h1>
          <span>
            {profile.fullName} · updated {resume.updated}
          </span>
        </div>
        <div className="rb-actions">
          <button type="button" className="rb-btn" onClick={copyLink}>
            Copy link
          </button>
          <a className="rb-btn" href={`${base}${resume.pdf}`} target="_blank" rel="noopener">
            Open PDF
          </a>
          <a className="rb-btn is-primary" href={`${base}${resume.pdf}`} download="Kadam_Pramodh_Resume.pdf">
            <span aria-hidden="true">↓</span> Download
          </a>
        </div>
      </div>

      <motion.div
        className="resume-stage"
        initial={{ opacity: 0, y: 50, rotate: -2.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.9 }}
      >
        <Tilt className="resume-paper" max={2.5}>
          <img
            src={`${base}${resume.image(1100)}`}
            srcSet={`${base}${resume.image(1100)} 1100w, ${base}${resume.image(2200)} 2200w`}
            sizes="(max-width: 900px) 100vw, 860px"
            width={resume.width}
            height={resume.height}
            alt="Resume of Kadam Pramodh. The full text follows for screen readers."
            decoding="async"
          />
          <span className="paper-clip" aria-hidden="true" />
        </Tilt>
      </motion.div>

      <p className="resume-note">
        Pinch or zoom to read the small print, or <a href={`${base}${resume.pdf}`}>open the PDF</a>.
      </p>

      <section className="sr-only" aria-label="Resume text">
        {resumeText.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>
    </main>
  )
}
