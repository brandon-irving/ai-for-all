import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../state/store'
import { Counter } from '../components/Counter'
import { Icon } from '../components/Icon'

/** ~$0.05 of routed compute per request, so a give-back converts to reach. */
const REQUESTS_PER_DOLLAR = 20

export function Earnings() {
  const { earnings, half, payout, payoutAction, stats } = useStore()
  const requests = Math.round(half * REQUESTS_PER_DOLLAR)

  return (
    <div className="tabview">
      <div className="tab-head">
        <div className="eyebrow">Earnings</div>
        <h3 className="h3">This month</h3>
      </div>

      <div className="scroll earn-scroll">
        <motion.div
          className="panel pad-md earn-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="earn-amount">
            <Counter value={earnings.month} decimals={2} prefix="$" duration={1400} />
          </div>
          <div className="muted earn-sub">earned this month</div>

          <div className="earn-meta">
            <div className="earn-meta-i">
              <span className="mono earn-meta-v">{stats.sessions}</span>
              <span className="muted">sessions</span>
            </div>
            <div className="earn-meta-i">
              <span className="mono earn-meta-v">{stats.hours.toFixed(1)}h</span>
              <span className="muted">compute</span>
            </div>
            <div className="earn-meta-i">
              <span className="mono earn-meta-v">$0.78</span>
              <span className="muted">/ hour</span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {payout === 'idle' ? (
            <motion.div
              key="choice"
              className="earn-choice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.22 } }}
            >
              <div className="muted earn-choice-l">Split your balance</div>

              <button className="btn ghost block earn-btn" onClick={() => payoutAction('cashed')}>
                <Icon name="card" size={16} />
                <span className="grow" style={{ textAlign: 'left' }}>Cash Out</span>
                <span className="mono">${half.toFixed(2)}</span>
              </button>

              <button className="btn primary block earn-btn" onClick={() => payoutAction('gave')}>
                <Icon name="heart" size={16} />
                <span className="grow" style={{ textAlign: 'left' }}>Give Back</span>
                <span className="mono">${half.toFixed(2)}</span>
              </button>

              <p className="muted earn-note">
                Giving back funds routed compute for people who can't contribute hardware.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              className="panel pad-md earn-done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <motion.div
                className="earn-done-ico"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.18, 1], opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon name="heart" size={26} fill={payout === 'gave' ? 'currentColor' : 'none'} />
              </motion.div>

              <div className="earn-done-t">
                {payout === 'gave' ? (
                  <>${half.toFixed(2)} contributed</>
                ) : (
                  <>${half.toFixed(2)} on its way</>
                )}
              </div>

              <div className="muted earn-done-d">
                {payout === 'gave' ? (
                  <>
                    Estimated to provide <b className="mono earn-hl">~{requests}</b> additional AI
                    requests for people who need them.
                  </>
                ) : (
                  <>Arriving in your account ending 4291 within 2 business days.</>
                )}
              </div>

              {payout === 'gave' && (
                <motion.div
                  className="earn-ripple"
                  initial={{ scale: 0.3, opacity: 0.5 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="panel pad-sm earn-ledger">
          <div className="eyebrow" style={{ marginBottom: 8 }}>Recent</div>
          {[
            ['Education · tutoring', 'Qwen 2.5 32B', '+$0.31'],
            ['Accessibility · captioning', 'Gemma 4', '+$0.44'],
            ['Research · summarisation', 'Qwen 2.5 32B', '+$0.62'],
            ['Accessibility · alt-text', 'Gemma 4', '+$0.28'],
          ].map(([l, m, v]) => (
            <div className="ledger-row" key={l}>
              <span className="ledger-l">
                {l}
                <span className="ledger-m mono">{m}</span>
              </span>
              <span className="mono ledger-v">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
