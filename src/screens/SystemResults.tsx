import { motion } from 'framer-motion'
import { useStore } from '../state/store'
import { HARDWARE, MODELS } from '../state/machine'
import { Icon } from '../components/Icon'
import { ScoreRing } from '../components/ScoreRing'
import { Counter } from '../components/Counter'

const ICONS: Record<string, string> = { gpu: 'gpu', ram: 'chip', disk: 'layers', net: 'wifi' }

export function SystemResults() {
  const { go } = useStore()

  return (
    <div className="screen">
      <div className="pad results scroll">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="results-head"
        >
          <div className="eyebrow">Scan complete</div>
          <h2 className="h2">Your machine is a strong contributor</h2>
          <p className="sub results-idle">
            Idle <strong>91% of the day</strong> — that's what you'd be sharing.
          </p>
        </motion.div>

        <div className="results-grid">
          {/* ---- hardware, revealed row by row with a check ---- */}
          <div className="results-col">
            <div className="eyebrow results-label">Hardware detected</div>
            {HARDWARE.map((h, i) => (
              <motion.div
                key={h.id}
                className="panel pad-sm hw"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.22, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="hw-ico"><Icon name={ICONS[h.id]} size={17} /></span>
                <div className="hw-text">
                  <div className="hw-label">{h.label}</div>
                  <div className="hw-value">{h.value}</div>
                </div>
                <div className="hw-detail mono muted">{h.detail}</div>
                <motion.span
                  className="hw-check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.22, type: 'spring', stiffness: 480, damping: 20 }}
                >
                  <Icon name="check" size={12} strokeWidth={2.6} />
                </motion.span>
              </motion.div>
            ))}

            <div className="eyebrow results-label" style={{ marginTop: 14 }}>Local models</div>
            {MODELS.map((m, i) => (
              <motion.div
                key={m.id}
                className="panel pad-sm hw model"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.15 + i * 0.26, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="hw-ico model-ico"><Icon name="chip" size={17} /></span>
                <div className="hw-text">
                  <div className="hw-value">{m.name}</div>
                  <div className="hw-label">{m.tag} · ready to serve</div>
                </div>
                <motion.span
                  className="hw-check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.45 + i * 0.26, type: 'spring', stiffness: 480, damping: 20 }}
                >
                  <Icon name="check" size={12} strokeWidth={2.6} />
                </motion.span>
              </motion.div>
            ))}
          </div>

          {/* ---- capability score ---- */}
          <motion.div
            className="panel pad-md results-score"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="eyebrow">Capability score</div>
            <ScoreRing value={94} label="Excellent" size={190} delay={1.7} />

            <div className="score-cap">
              <div className="muted score-cap-l">Estimated capacity</div>
              <div className="score-cap-v">
                ~<Counter value={47} fromZero duration={1600} /> people / day
              </div>
            </div>

            <div className="score-bars">
              {[
                ['Throughput', 96],
                ['Latency', 91],
                ['Availability', 88],
              ].map(([l, v], i) => (
                <div className="score-bar-row" key={l as string}>
                  <span className="muted">{l}</span>
                  <div className="score-bar">
                    <motion.div
                      className="score-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${v}%` }}
                      transition={{ delay: 1.9 + i * 0.14, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="mono score-bar-v">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="results-cta"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
        >
          <button className="btn primary" onClick={() => go('CONTRIBUTION_SETUP')}>
            Choose what I support <Icon name="arrow" size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
