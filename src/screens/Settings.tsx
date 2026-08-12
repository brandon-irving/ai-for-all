import { motion } from 'framer-motion'
import { useStore } from '../state/store'
import { SETTINGS_ROWS } from '../state/machine'
import { Icon } from '../components/Icon'

export function Settings() {
  const { give, causes, go, reset } = useStore()

  const value = (id: string, fallback: string) => {
    if (id === 'mode') return `${give}% Give / ${100 - give}% Earn`
    if (id === 'causes') return `${causes.length} selected`
    return fallback
  }

  return (
    <div className="tabview">
      <div className="tab-head">
        <div className="eyebrow">Settings</div>
        <h3 className="h3">You stay in control</h3>
      </div>

      <div className="scroll set-scroll">
        <div className="panel set-list">
          {SETTINGS_ROWS.map((r, i) => (
            <motion.button
              key={r.id}
              className="set-row"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.045 }}
            >
              <span className="set-ico"><Icon name={r.icon} size={16} /></span>
              <span className="set-label">{r.label}</span>
              <span className="set-value muted mono">{value(r.id, r.value)}</span>
              <Icon name="chev" size={13} className="set-chev" />
            </motion.button>
          ))}
        </div>

        <div className="panel pad-sm set-privacy">
          <Icon name="shield" size={15} />
          <div>
            <div className="set-privacy-t">Zero-knowledge routing</div>
            <div className="muted set-privacy-d">
              Prompts are encrypted end-to-end between the requester and the model runtime.
              You see workload metadata only.
            </div>
          </div>
        </div>

        <div className="set-footer">
          <button className="btn quiet" onClick={() => go('VISION')}>
            <Icon name="globe" size={13} /> See the vision at scale
          </button>
          <button className="btn quiet" onClick={reset}>Reset demo</button>
          <div className="muted set-version mono">AI for All · demo build 1.0.0</div>
        </div>
      </div>
    </div>
  )
}
