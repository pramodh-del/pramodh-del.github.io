import { motion } from 'motion/react'
import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { offClock, sideBuilds, stack } from '../data/profile'
import { PhotoWall } from '../components/PhotoWall'
import { FadeUp, Tilt } from '../components/Reveal'
import { Scribble } from '../components/Scribble'
import { Sticker } from '../components/Sticker'

export function SideBuilds() {
  return (
    <section className="side wrap" id="side">
      <div className="sec-head">
        <p className="hand">side builds</p>
        <Scribble />
      </div>
      <div className="side-grid">
        {sideBuilds.map((b, i) => (
          <FadeUp key={b.title} delay={0.1 + i * 0.12}>
            <Tilt className="fcard" max={8}>
              <div className="ftab">{b.tab}</div>
              <div className="inner">
                <div className="shot">
                  <div className="log">
                    {b.log.map((line, li) => (
                      <motion.div
                        key={li}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + li * 0.35, duration: 0.3 }}
                      >
                        {line.map((seg, si) => (
                          <span key={si} className={'k' in seg ? seg.k : undefined}>
                            {seg.t}
                          </span>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            </Tilt>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

export function Stack() {
  return (
    <section className="stack wrap" id="stack" data-section="stack">
      <div className="sec-head">
        <p className="hand">what I work with</p>
        <Scribble />
      </div>
      <FadeUp className="groups">
        {stack.map((g) => (
          <div key={g.group} className="group" style={{ '--c': g.color } as CSSProperties}>
            <h4>
              <i />
              {g.group}
            </h4>
            <ul>
              {g.items.map((item, i) => (
                <motion.li
                  key={item[0]}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                >
                  {item[0]}
                  {item[1] && <small>{item[1]}</small>}
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </FadeUp>
    </section>
  )
}

export function OffClock() {
  const ref = useRef<HTMLElement>(null)
  return (
    <section ref={ref} className="offclock wrap" data-section="stack">
      <div className="sec-head">
        <p className="hand">off the clock</p>
        <Scribble />
      </div>
      <div className="offclock-row">
        <FadeUp delay={0.1}>
          <p>{offClock.text}</p>
          <Link to="/playground" className="pg-link" data-cursor="see">
            Open the playground <span aria-hidden="true">→</span>
          </Link>
        </FadeUp>
        <div className="exif" aria-label="Favourite camera settings">
          {offClock.exif.map((e, i) => (
            <Sticker key={e} className={`exif-chip exif-${i}`} rotate={[0, 3, -2][i]} bounds={ref} depth={10 + i * 8} touchDrag>
              {e}
            </Sticker>
          ))}
        </div>
      </div>
      <PhotoWall />
    </section>
  )
}
