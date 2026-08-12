import { motion } from 'framer-motion'
import './radar.css'

/**
 * System-scan HUD. A conic-gradient sweep is far cheaper than animating an
 * SVG arc — one composited rotation, no repaint of the geometry underneath.
 */
export function RadarScan({ size = 300 }: { size?: number }) {
  const rings = [0.32, 0.55, 0.78, 1]
  return (
    <div className="radar" style={{ width: size, height: size }}>
      <div className="radar-sweep" />

      <svg viewBox="0 0 200 200" className="radar-grid" aria-hidden>
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={100}
            cy={100}
            r={94 * r}
            fill="none"
            stroke="rgba(125,211,252,0.2)"
            strokeWidth={0.7}
            strokeDasharray={i === 3 ? '0' : '3 5'}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 30}
              y1={100 + Math.sin(a) * 30}
              x2={100 + Math.cos(a) * 94}
              y2={100 + Math.sin(a) * 94}
              stroke="rgba(125,211,252,0.11)"
              strokeWidth={0.6}
            />
          )
        })}

        {/* Discovery blips popping in as the sweep passes */}
        {[
          [138, 62], [66, 84], [118, 140], [82, 138], [150, 108], [58, 122],
        ].map(([x, y], i) => (
          <motion.circle
            key={`b${i}`}
            cx={x}
            cy={y}
            r={2.6}
            fill="#7dd3fc"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0.35, 1, 0.5], scale: [0.4, 1.3, 1, 1.2, 1] }}
            transition={{ duration: 3.4, delay: 0.4 + i * 0.42, repeat: Infinity, repeatDelay: 1.2 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        ))}

        <circle cx={100} cy={100} r={4} fill="#eaf7ff" />
      </svg>

      <motion.div
        className="radar-pulse"
        animate={{ scale: [0.6, 1.6], opacity: [0.5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
      />
    </div>
  )
}
