import { motion } from 'framer-motion'
import { useStore } from '../state/store'
import { IMPACT_MIX } from '../state/machine'
import { Globe } from '../components/Globe'
import { Counter } from '../components/Counter'
import { Icon } from '../components/Icon'

export function Home() {
  const { stats, live, nodeSeed, give } = useStore()
  const busy = live !== 'IDLE'

  return (
    <div className="tabview">
      <div className="home-head">
        <div className="row" style={{ gap: 9 }}>
          <img className="home-mark" src="./assets/logo-mark.svg" alt="" draggable={false} />
          <div className="col">
            <div className="home-name">AI for All</div>
            <div className="row home-state">
              <span className="live-dot" />
              <span className="mono">ONLINE</span>
            </div>
          </div>
        </div>
        <div className="pill">{give}% give</div>
      </div>

      <div className="scroll home-scroll">
        <div className="home-globe">
          <Globe size={252} seed={nodeSeed} quiet={busy} />
        </div>

        <div className="home-stats">
          {[
            { v: stats.people, d: 0, label: 'People Helped', key: 'p' },
            { v: stats.sessions, d: 0, label: 'Sessions', key: 's' },
            { v: stats.hours, d: 1, label: 'Compute Hours', key: 'h' },
          ].map((s, i) => (
            <motion.div
              key={s.key}
              className="home-stat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <div className="home-stat-v">
                <Counter value={s.v} decimals={s.d} duration={1400} />
              </div>
              <div className="home-stat-l muted">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className={`panel pad-sm home-activity ${busy ? 'busy' : ''}`}>
          <span className={`activity-dot ${busy ? 'busy' : ''}`} />
          <span className="home-activity-t">{busy ? 'Session in progress' : 'Waiting to help…'}</span>
          <span className="mono muted home-activity-r">{busy ? 'LIVE' : 'IDLE'}</span>
        </div>

        {/* Impact details — always available, quietly */}
        <div className="panel pad-md home-impact">
          <div className="home-impact-head">
            <div className="eyebrow">This week your AI supported</div>
            <Icon name="heart" size={13} />
          </div>
          {IMPACT_MIX.map((m, i) => (
            <div className="mix-row" key={m.id}>
              <span className="mix-ico"><Icon name={m.id} size={13} /></span>
              <span className="mix-label">{m.label}</span>
              <div className="mix-bar">
                <motion.div
                  className="mix-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${m.pct}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="mono mix-pct">{m.pct}%</span>
            </div>
          ))}
        </div>

        <div className="home-privacy muted">
          <Icon name="lock" size={12} /> Prompts and conversations never touch this device.
        </div>
      </div>
    </div>
  )
}
