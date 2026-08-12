import { motion } from 'framer-motion'
import { useStore } from '../state/store'
import { CAUSES } from '../state/machine'
import { Icon } from '../components/Icon'

export function ContributionSetup() {
  const { causes, toggleCause, give, setGive, go } = useStore()
  const earn = 100 - give

  return (
    <div className="screen">
      <div className="pad setup scroll">
        <motion.div
          className="setup-head"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="eyebrow">Step 2 of 2</div>
          <h2 className="h2">What do you want your AI to support?</h2>
          <p className="sub">Requests are matched to the causes you pick. You can change this anytime.</p>
        </motion.div>

        <div className="cause-grid">
          {CAUSES.map((c, i) => {
            const on = causes.includes(c.id)
            return (
              <motion.button
                key={c.id}
                className={`cause ${on ? 'on' : ''}`}
                onClick={() => toggleCause(c.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.975 }}
              >
                <span className="cause-ico"><Icon name={c.id} size={20} /></span>
                <span className="cause-label">{c.label}</span>
                <span className="cause-blurb muted">{c.blurb}</span>
                <span className={`cause-check ${on ? 'on' : ''}`}>
                  {on && <Icon name="check" size={11} strokeWidth={3} />}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* ---- give / earn balance ---- */}
        <motion.div
          className="panel pad-md balance"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="balance-head">
            <div className="eyebrow">Contribution balance</div>
            <div className="balance-read mono">
              <span className="give-v">{give}% Give</span>
              <span className="muted"> / </span>
              <span className="earn-v">{earn}% Earn</span>
            </div>
          </div>

          <div className="balance-labels">
            <span className="row" style={{ gap: 6 }}><Icon name="heart" size={14} /> Donate</span>
            <span className="row" style={{ gap: 6 }}>Earn <Icon name="earnings" size={14} /></span>
          </div>

          <div className="slider-wrap">
            <div className="slider-track">
              <div className="slider-fill" style={{ width: `${give}%` }} />
            </div>
            <input
              className="slider"
              type="range"
              min={0}
              max={100}
              step={5}
              value={give}
              onChange={(e) => setGive(Number(e.target.value))}
              aria-label="Give versus earn balance"
            />
          </div>

          <p className="muted balance-note">
            {give >= 70
              ? 'Most of your capacity goes straight to people who need it.'
              : give >= 40
              ? 'A balanced split between giving and earning.'
              : 'Mostly earning — you can still donate earnings later.'}
          </p>
        </motion.div>

        <motion.div
          className="setup-cta"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.66 }}
        >
          <button
            className="btn primary btn-activate"
            disabled={causes.length === 0}
            onClick={() => go('ACTIVATING')}
          >
            <Icon name="bolt" size={16} /> Activate My AI
          </button>
          <div className="muted setup-hint">
            {causes.length} cause{causes.length === 1 ? '' : 's'} selected
          </div>
        </motion.div>
      </div>
    </div>
  )
}
