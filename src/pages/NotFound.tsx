import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="notfound wrap">
      <motion.div
        className="nf-card"
        initial={{ rotate: -14, scale: 0.8, opacity: 0 }}
        animate={{ rotate: -4, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 693, damping: 30, mass: 7.3 }}
      >
        <span className="nf-code">404</span>
        <p>This route returned nothing. Probably paged out.</p>
        <Link to="/" className="cta">
          <i aria-hidden="true">«</i>Back home
        </Link>
      </motion.div>
    </main>
  )
}
