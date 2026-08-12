import { motion } from 'framer-motion'
import { useStore } from '../state/store'
import { Icon } from '../components/Icon'

const rise = (d: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] as const },
})

const POINTS = [
  { icon: 'shield', t: 'Nothing personal ever reaches you', d: 'No prompts, no names, no conversation content.' },
  { icon: 'sliders', t: 'You set the terms', d: 'Which causes, how much capacity, what hours.' },
  { icon: 'bolt', t: 'Only what you are not using', d: 'Your node yields the moment you need the machine.' },
]

export function Welcome() {
  const { go } = useStore()
  return (
    <div className="screen">
      <div className="pad center welcome">
        <motion.img
          {...rise(0.05)}
          className="welcome-logo"
          src="./assets/logo-lockup-dark.svg"
          alt="AI for All"
          draggable={false}
        />

        <motion.h2 {...rise(0.18)} className="h2 welcome-title">
          Turn what your computer has
          <br />
          into <span className="grad">AI access for everyone</span>.
        </motion.h2>

        <motion.p {...rise(0.28)} className="sub welcome-sub">
          Compute, bandwidth, storage, local models — let's see what your machine can
          offer. The scan stays on this device.
        </motion.p>

        <motion.div {...rise(0.4)} className="welcome-points">
          {POINTS.map((p, i) => (
            <motion.div key={p.t} {...rise(0.46 + i * 0.09)} className="panel pad-md welcome-point">
              <span className="welcome-ico"><Icon name={p.icon} size={17} /></span>
              <div>
                <div className="welcome-pt">{p.t}</div>
                <div className="muted welcome-pd">{p.d}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...rise(0.8)}>
          <button className="btn primary" onClick={() => go('SYSTEM_SCANNING')}>
            <Icon name="spark" size={16} /> Scan My System
          </button>
        </motion.div>
      </div>
    </div>
  )
}
