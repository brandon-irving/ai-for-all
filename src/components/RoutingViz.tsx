import { motion, AnimatePresence } from 'framer-motion'
import './routing.css'

/**
 * The network-search beat: pulse outward, illuminate candidates, draw paths,
 * then collapse everything except the winning route.
 *
 * Node positions are hand-placed rather than random — a composed constellation
 * reads as intentional on video, where a scatter reads as noise.
 */

const CX = 170
const CY = 152

const NODES = [
  { id: 'n1', x: 52, y: 64, ms: 88 },
  { id: 'n2', x: 124, y: 40, ms: 61 },
  { id: 'n3', x: 234, y: 50, ms: 74 },
  { id: 'n4', x: 300, y: 92, ms: 132 },
  { id: 'n5', x: 38, y: 148, ms: 96 },
  { id: 'n6', x: 306, y: 182, ms: 118 },
  { id: 'n7', x: 60, y: 236, ms: 105 },
  { id: 'n8', x: 142, y: 266, ms: 79 },
  { id: 'n9', x: 240, y: 252, ms: 91 },
  { id: 'n10', x: 186, y: 92, ms: 44 },
  { id: 'n11', x: 92, y: 196, ms: 67 },
  { id: 'sel', x: 256, y: 134, ms: 23 },
]

export type RoutingStage = 'analyzing' | 'searching' | 'selected'

/**
 * `winner` is an index into NODES. Different request types resolve to
 * different nodes, so the constellation doesn't collapse to the same spoke
 * every run.
 */
export function RoutingViz({ stage, winner = 11 }: { stage: RoutingStage; winner?: number }) {
  const searching = stage === 'searching'
  const done = stage === 'selected'
  const win = NODES[winner] ? winner : 11

  return (
    <div className="routing">
      <svg viewBox="0 0 340 304" className="routing-svg" aria-hidden>
        <defs>
          <radialGradient id="rHub">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rNode">
            <stop offset="0%" stopColor="#bde9ff" />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rWin">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Search sonar — three staggered rings sweeping the field */}
        <AnimatePresence>
          {searching &&
            [0, 1, 2].map((i) => (
              <motion.circle
                key={`ring${i}`}
                cx={CX}
                cy={CY}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={1.1}
                initial={{ r: 8, opacity: 0.55 }}
                animate={{ r: 190, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.4, delay: i * 0.72, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
        </AnimatePresence>

        {/* Candidate paths. strokeDashoffset → 0 is the classic draw-on. */}
        {NODES.map((n, i) => {
          const isWin = i === win
          const show = searching || (done && isWin)
          return (
            <motion.line
              key={`l${n.id}`}
              x1={CX}
              y1={CY}
              x2={n.x}
              y2={n.y}
              stroke={isWin && done ? '#5eead4' : '#38bdf8'}
              strokeWidth={isWin && done ? 1.7 : 0.9}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              initial={{ strokeDashoffset: 1, opacity: 0 }}
              animate={{
                strokeDashoffset: show ? 0 : 1,
                opacity: show ? (isWin && done ? 0.95 : 0.34) : 0,
              }}
              transition={{
                duration: 0.7,
                delay: searching && !done ? 0.35 + i * 0.11 : 0,
                ease: 'easeOut',
              }}
            />
          )
        })}

        {/* Packet travelling the winning route */}
        {done && (
          <motion.circle
            r={3}
            fill="#eafffb"
            initial={{ cx: CX, cy: CY, opacity: 0 }}
            animate={{ cx: NODES[win].x, cy: NODES[win].y, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
          />
        )}

        {/* Candidate nodes */}
        {NODES.map((n, i) => {
          const isWin = i === win
          const lit = searching || (done && isWin)
          return (
            <motion.g
              key={n.id}
              initial={{ opacity: 0.14 }}
              animate={{ opacity: done ? (isWin ? 1 : 0.1) : lit ? 1 : 0.16 }}
              transition={{ duration: 0.5, delay: searching && !done ? 0.3 + i * 0.11 : 0.1 }}
            >
              <circle cx={n.x} cy={n.y} r={isWin && done ? 17 : 11} fill={isWin && done ? 'url(#rWin)' : 'url(#rNode)'} />
              <circle
                cx={n.x}
                cy={n.y}
                r={isWin && done ? 5 : 3.2}
                fill={isWin && done ? '#eafffb' : '#9ed8ff'}
                className={lit ? 'node-live' : ''}
              />
              {isWin && done && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  fill="none"
                  stroke="#5eead4"
                  strokeWidth={1.2}
                  initial={{ r: 6, opacity: 0.8 }}
                  animate={{ r: 30, opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </motion.g>
          )
        })}

        {/* You — the hub */}
        <circle cx={CX} cy={CY} r={26} fill="url(#rHub)" opacity={0.8} />
        <circle cx={CX} cy={CY} r={6.5} fill="#eaf7ff" />
        <motion.circle
          cx={CX}
          cy={CY}
          fill="none"
          stroke="#7dd3fc"
          strokeWidth={1.3}
          initial={{ r: 9, opacity: 0.7 }}
          animate={{ r: 24, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      </svg>

      {/* Latency tags float in during the search */}
      <AnimatePresence>
        {searching && (
          <motion.div
            className="routing-tags"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Skip the winner: its latency is announced by the result card,
                and a second, different number here would contradict it. */}
            {NODES.filter((_, i) => i % 3 === 0 && i !== win).map((n, i) => (
              <motion.span
                key={n.id}
                className="routing-tag mono"
                style={{ left: `${(n.x / 340) * 100}%`, top: `${(n.y / 304) * 100}%` }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.22 }}
              >
                {n.ms}ms
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
