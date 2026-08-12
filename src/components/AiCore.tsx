import { motion } from 'framer-motion'
import './core.css'

/**
 * The inference core. Same trick as the globe: the brand asset carries its own
 * CSS animation through <img>, and we add reactive layers around it.
 */
export function AiCore({
  size = 190,
  /** 0–1. Drives the aura intensity from live GPU utilisation. */
  intensity = 0.6,
  label,
}: {
  size?: number
  intensity?: number
  label?: string
}) {
  return (
    <div className="core" style={{ width: size, height: size }}>
      <motion.div
        className="core-aura"
        animate={{
          opacity: [0.35 + intensity * 0.3, 0.62 + intensity * 0.35, 0.35 + intensity * 0.3],
          scale: [1, 1.07, 1],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <img className="core-img" src="./assets/ai-core-icon.svg" alt="" draggable={false} />

      <svg className="core-fx" viewBox="0 0 160 160" aria-hidden>
        {[0, 1].map((i) => (
          <motion.circle
            key={i}
            cx={80}
            cy={80}
            fill="none"
            stroke="#7dd3fc"
            strokeWidth={0.9}
            initial={{ r: 30, opacity: 0.5 }}
            animate={{ r: 76, opacity: 0 }}
            transition={{ duration: 2.8, delay: i * 1.4, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {label && <div className="core-label mono">{label}</div>}
    </div>
  )
}
