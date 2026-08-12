import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RadarScan } from '../components/RadarScan'

// Ordered to mirror the four rows the results screen reveals, so the scan
// narrates the same breadth the tagline promises.
const STEPS = [
  'Probing GPU and VRAM…',
  'Reading system memory…',
  'Checking spare storage…',
  'Measuring uplink bandwidth…',
  'Detecting local AI models…',
  'Scoring contribution capacity…',
]

export function SystemScan() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => Math.min(v + 1, STEPS.length - 1)), 950)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="screen">
      <div className="pad center">
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          System scan
        </motion.div>

        <motion.h2
          className="h2 scan-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Reading what this machine can give
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ margin: '26px 0 22px' }}
        >
          <RadarScan size={286} />
        </motion.div>

        <div className="scan-status">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              className="mono scan-step"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {STEPS[i]}
            </motion.div>
          </AnimatePresence>

          <div className="scan-bar">
            <motion.div
              className="scan-fill"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </div>

          <div className="muted scan-note">Everything below stays on your device.</div>
        </div>
      </div>
    </div>
  )
}
