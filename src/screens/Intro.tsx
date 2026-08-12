import { motion } from 'framer-motion'
import { useStore } from '../state/store'
import { Globe } from '../components/Globe'
import { Icon } from '../components/Icon'

const rise = (d: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] as const },
})

export function Intro() {
  const { go } = useStore()
  return (
    <div className="screen">
      <div className="intro-globe">
        <Globe size={620} />
      </div>

      <div className="pad center intro">
        <motion.div {...rise(0.1)} className="eyebrow">The problem</motion.div>

        <motion.h1 {...rise(0.2)} className="h1 intro-title">
          AI capability is abundant.
          <br />
          <span className="grad">Access isn't.</span>
        </motion.h1>

        <motion.p {...rise(0.32)} className="sub intro-sub">
          Learning, accessibility, research and opportunity increasingly run on AI — but
          who gets to use it still depends on the hardware you own and the subscriptions
          you can afford.
        </motion.p>

        <motion.div {...rise(0.46)} className="intro-stats">
          <div className="panel pad-md intro-stat">
            <Icon name="gpu" size={20} />
            <div className="num intro-stat-n">91%</div>
            <div className="muted intro-stat-l">of the day a capable GPU sits completely idle</div>
          </div>
          <div className="intro-vs mono">meanwhile</div>
          <div className="panel pad-md intro-stat">
            <Icon name="users" size={20} />
            <div className="num intro-stat-n">2.6B</div>
            <div className="muted intro-stat-l">people have no reliable access to AI tools</div>
          </div>
        </motion.div>

        <motion.div {...rise(0.62)} className="intro-cta">
          <button className="btn primary" onClick={() => go('WELCOME')}>
            Get Started <Icon name="arrow" size={16} />
          </button>
          <div className="muted intro-tag">Turn what your computer has into AI access for everyone.</div>
        </motion.div>
      </div>
    </div>
  )
}
