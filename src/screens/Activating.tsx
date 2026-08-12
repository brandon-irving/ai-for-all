import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AiCore } from '../components/AiCore'

/**
 * The activation cinematic. Three beats inside PHASE_NEXT.ACTIVATING (4.2s):
 * charge → expand + link → NODE ONLINE. The window itself collapses to phone
 * size the instant this unmounts, so the last beat is deliberately a clean,
 * centred lockup that survives a resize mid-frame.
 */
const BEATS = [
  { at: 0, label: 'Establishing secure channel' },
  { at: 1100, label: 'Publishing capabilities' },
  { at: 2100, label: 'Joining the network' },
]

const SPOKES = 14

export function Activating() {
  const [beat, setBeat] = useState(0)
  const [online, setOnline] = useState(false)

  useEffect(() => {
    const ids = BEATS.map((b, i) => window.setTimeout(() => setBeat(i), b.at))
    ids.push(window.setTimeout(() => setOnline(true), 2900))
    return () => ids.forEach(window.clearTimeout)
  }, [])

  return (
    <div className="screen">
      <div className="pad center activating">
        {/* Connection lines radiating out as the node registers */}
        <svg className="act-web" viewBox="0 0 600 600" aria-hidden>
          {Array.from({ length: SPOKES }).map((_, i) => {
            const a = (i / SPOKES) * Math.PI * 2 - Math.PI / 2
            return (
              <motion.line
                key={i}
                x1={300}
                y1={300}
                x2={300 + Math.cos(a) * 290}
                y2={300 + Math.sin(a) * 290}
                stroke="#38bdf8"
                strokeWidth={0.9}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                initial={{ strokeDashoffset: 1, opacity: 0 }}
                animate={{ strokeDashoffset: 0, opacity: [0, 0.5, 0.22] }}
                transition={{ duration: 1.1, delay: 1.15 + i * 0.045, ease: 'easeOut' }}
              />
            )
          })}
          {[1, 2, 3].map((i) => (
            <motion.circle
              key={`r${i}`}
              cx={300}
              cy={300}
              fill="none"
              stroke="#7dd3fc"
              strokeWidth={1}
              initial={{ r: 40, opacity: 0.6 }}
              animate={{ r: 300, opacity: 0 }}
              transition={{ duration: 2.2, delay: 1 + i * 0.4, ease: 'easeOut' }}
            />
          ))}
        </svg>

        <motion.div
          initial={{ scale: 0.72, opacity: 0.5 }}
          animate={{ scale: online ? 1.04 : 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <AiCore size={226} intensity={online ? 1 : 0.5} />
        </motion.div>

        <div className="act-status">
          <AnimatePresence mode="wait">
            {!online ? (
              <motion.div
                key={beat}
                className="mono act-beat"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {BEATS[beat].label}…
              </motion.div>
            ) : (
              <motion.div
                key="online"
                className="act-online"
                initial={{ opacity: 0, scale: 0.9, letterSpacing: '0.5em' }}
                animate={{ opacity: 1, scale: 1, letterSpacing: '0.24em' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="live-dot" />
                NODE ONLINE
              </motion.div>
            )}
          </AnimatePresence>

          <div className="act-bar">
            <motion.div
              className="act-fill"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.9, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
