import { motion } from 'framer-motion'
import { Counter } from './Counter'

/**
 * Capability score dial. The arc is one <circle> with an animated
 * strokeDashoffset — `pathLength={1}` normalises the geometry so the maths is
 * just `1 - value/100` regardless of the radius.
 */
export function ScoreRing({
  value,
  label,
  size = 172,
  delay = 0.2,
}: {
  value: number
  label: string
  size?: number
  delay?: number
}) {
  const r = 46
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto' }}>
      <svg viewBox="0 0 110 110" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} aria-hidden>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(125,211,252,0.12)" strokeWidth="7" />
        <motion.circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 1 - value / 100 }}
          transition={{ duration: 1.8, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.6))' }}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeContent: 'center',
          textAlign: 'center',
          gap: 2,
          fontSize: size * 0.26,
          fontWeight: 660,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        <Counter value={value} fromZero duration={1800} className="grad" />
        <div className="eyebrow" style={{ fontSize: 9, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}
