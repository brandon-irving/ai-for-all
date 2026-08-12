import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './globe.css'

/**
 * The brand globe asset, plus a live overlay.
 *
 * The .svg animates itself via CSS keyframes even when loaded through <img>,
 * so we never inline it — that avoids duplicating its gradient/filter `id`s
 * into the document, which would collide across instances. Anything dynamic
 * (contributor nodes, routes, impact ripples) is drawn in a second SVG layered
 * on top and sharing the asset's 400×400 viewBox.
 */

// Parallels lifted from hud-globe.svg so overlay nodes sit on the same sphere.
const PARALLELS = [
  { cy: 104, rx: 115, ry: 29 },
  { cy: 149, rx: 141, ry: 35 },
  { cy: 200, rx: 150, ry: 37 },
  { cy: 251, rx: 141, ry: 35 },
  { cy: 296, rx: 115, ry: 29 },
]

type Node = { x: number; y: number; front: boolean; r: number; delay: number }

/** Deterministic PRNG so a given seed always yields the same node field. */
function rng(seed: number) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildNodes(count: number, seed: number): Node[] {
  const rand = rng(seed + 7)
  const out: Node[] = []
  for (let i = 0; i < count; i++) {
    const p = PARALLELS[Math.floor(rand() * PARALLELS.length)]
    const a = rand() * Math.PI * 2
    out.push({
      x: 200 + p.rx * Math.cos(a),
      y: p.cy + p.ry * Math.sin(a),
      front: Math.sin(a) > -0.15,
      r: 1.7 + rand() * 1.5,
      delay: rand() * 4,
    })
  }
  return out
}

export function Globe({
  size = 300,
  /** Increments once per completed session — drops a new glowing point. */
  seed = 0,
  /** Dims the base globe and hides ambient traffic (used during routing). */
  quiet = false,
  className = '',
}: {
  size?: number
  seed?: number
  quiet?: boolean
  className?: string
}) {
  const nodes = useMemo(() => buildNodes(26, 1), [])
  const earned = useMemo(() => buildNodes(seed, 991), [seed])
  const [ripple, setRipple] = useState<Node | null>(null)
  const prevSeed = useRef(seed)

  useEffect(() => {
    if (seed > prevSeed.current) {
      const n = earned[earned.length - 1]
      if (n) {
        setRipple(n)
        const id = window.setTimeout(() => setRipple(null), 2600)
        return () => window.clearTimeout(id)
      }
    }
    prevSeed.current = seed
  }, [seed, earned])

  return (
    <div className={`globe ${quiet ? 'is-quiet' : ''} ${className}`} style={{ width: size, height: size }}>
      <img className="globe-base" src="./assets/hud-globe.svg" alt="" draggable={false} />

      <svg className="globe-fx" viewBox="0 0 400 400" aria-hidden>
        <defs>
          <radialGradient id="gNode">
            <stop offset="0%" stopColor="#bde9ff" />
            <stop offset="55%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gGift">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient contributor field */}
        {!quiet &&
          nodes.map((n, i) => (
            <circle
              key={i}
              className="fx-node"
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="url(#gNode)"
              opacity={n.front ? 0.85 : 0.28}
              style={{ animationDelay: `${n.delay}s` }}
            />
          ))}

        {/* Sessions this user has personally powered */}
        {earned.map((n, i) => (
          <g key={`e${i}`}>
            <circle cx={n.x} cy={n.y} r={4.6} fill="url(#gGift)" opacity={n.front ? 0.95 : 0.4} />
            <circle cx={n.x} cy={n.y} r={1.5} fill="#eafffb" opacity={n.front ? 1 : 0.5} />
          </g>
        ))}

        {/* Impact ripple on the freshly-lit node */}
        <AnimatePresence>
          {ripple && (
            <motion.circle
              key="ripple"
              cx={ripple.x}
              cy={ripple.y}
              fill="none"
              stroke="#5eead4"
              strokeWidth={1.4}
              initial={{ r: 3, opacity: 0.9 }}
              animate={{ r: 62, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </svg>
    </div>
  )
}
