import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../state/store'
import { Counter } from '../components/Counter'
import { Icon } from '../components/Icon'

/**
 * "Vision at scale" — a composition, not a navigable screen.
 *
 * Rendered on <canvas> rather than SVG: at the top of the ramp we're drawing
 * thousands of points every frame, and that many DOM nodes would stall the
 * compositor. Points are placed with a Fibonacci sphere (uniform, no polar
 * clustering) and depth-faded so the back hemisphere reads as behind.
 */

const BEATS = [
  { count: 1, label: 'contributor node', dur: 2600 },
  { count: 100, label: 'contributor nodes', dur: 2600 },
  { count: 10_000, label: 'contributor nodes', dur: 2800 },
  { count: 1_000_000, label: 'contributor nodes', dur: 3400 },
]

const MAX_DRAWN = 2400

const METRICS = [
  { v: '1.2M', l: 'nodes online', i: 'globe' },
  { v: '4.8B', l: 'requests served / yr', i: 'bolt' },
  { v: '190', l: 'countries reached', i: 'users' },
  { v: '$0', l: 'cost to recipients', i: 'heart' },
]

function fibSphere(n: number) {
  const pts = new Float32Array(n * 3)
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const th = phi * i
    pts[i * 3] = Math.cos(th) * r
    pts[i * 3 + 1] = y
    pts[i * 3 + 2] = Math.sin(th) * r
  }
  return pts
}

export function Vision() {
  const { go } = useStore()
  const [beat, setBeat] = useState(0)
  const [stage, setStage] = useState<'ramp' | 'metrics' | 'close'>('ramp')
  const canvas = useRef<HTMLCanvasElement>(null)
  const shown = useRef(1)

  // ---- beat director ----------------------------------------------------
  useEffect(() => {
    const ids: number[] = []
    let t = 0
    BEATS.forEach((b, i) => {
      t += b.dur
      if (i < BEATS.length - 1) ids.push(window.setTimeout(() => setBeat(i + 1), t))
    })
    ids.push(window.setTimeout(() => setStage('metrics'), t + 600))
    // ~8s on the metrics board: four figures need dwell time to actually read.
    ids.push(window.setTimeout(() => setStage('close'), t + 8600))
    return () => ids.forEach(window.clearTimeout)
  }, [])

  // ---- canvas globe -----------------------------------------------------
  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      const r = cv.getBoundingClientRect()
      cv.width = r.width * dpr
      cv.height = r.height * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const pts = fibSphere(MAX_DRAWN)
    let raf = 0
    let angle = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      angle += dt * 0.00016

      const w = cv.width
      const h = cv.height
      const cx = w / 2
      const cy = h / 2
      const R = Math.min(w, h) * 0.36

      ctx.clearRect(0, 0, w, h)

      // Target follows the beat; ease toward it so the field grows visibly.
      const target = Math.min(MAX_DRAWN, Math.max(1, Math.round(
        BEATS[beat].count > MAX_DRAWN ? MAX_DRAWN : BEATS[beat].count
      )))
      shown.current += (target - shown.current) * 0.055
      const n = Math.max(1, Math.round(shown.current))

      // Density boost past the drawable ceiling — implies the extra millions.
      const over = BEATS[beat].count / MAX_DRAWN
      const boost = Math.min(1, Math.max(0, Math.log10(Math.max(1, over)) / 2.7))

      const sin = Math.sin(angle)
      const cos = Math.cos(angle)

      // Faint wireframe
      ctx.strokeStyle = `rgba(56,189,248,${0.06 + boost * 0.05})`
      ctx.lineWidth = dpr
      for (let k = -3; k <= 3; k++) {
        const y = (k / 4) * R
        const rx = Math.sqrt(Math.max(0, R * R - y * y))
        ctx.beginPath()
        ctx.ellipse(cx, cy + y, rx, rx * 0.26, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      for (let i = 0; i < n; i++) {
        const x0 = pts[i * 3]
        const y0 = pts[i * 3 + 1]
        const z0 = pts[i * 3 + 2]
        const x = x0 * cos - z0 * sin
        const z = x0 * sin + z0 * cos

        const sx = cx + x * R
        const sy = cy + y0 * R
        const depth = (z + 1) / 2 // 0 back → 1 front
        const a = (0.14 + depth * 0.8) * (0.65 + boost * 0.35)
        const size = (0.7 + depth * 1.5 + boost * 0.7) * dpr

        ctx.beginPath()
        ctx.fillStyle =
          i % 17 === 0
            ? `rgba(94,234,212,${a})`
            : `rgba(${125 + depth * 60},${211 + depth * 30},252,${a})`
        ctx.arc(sx, sy, size, 0, Math.PI * 2)
        ctx.fill()

        if (depth > 0.86 && i % 23 === 0) {
          ctx.beginPath()
          ctx.fillStyle = `rgba(190,240,255,${a * 0.25})`
          ctx.arc(sx, sy, size * 3.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [beat])

  const b = BEATS[beat]

  return (
    <div className="screen vision">
      {/* Once the message takes over, the field recedes to a backdrop —
          at full density it out-contrasts any text laid over it. */}
      <canvas ref={canvas} className={`vision-canvas ${stage !== 'ramp' ? 'is-back' : ''}`} />

      <div className="vision-overlay">
        <AnimatePresence mode="wait">
          {stage === 'ramp' && (
            <motion.div
              key="ramp"
              className="vision-ramp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
            >
              <div className="vision-count grad">
                <Counter value={b.count} duration={900} />
                {beat === BEATS.length - 1 && <span>+</span>}
              </div>
              <div className="eyebrow vision-count-l">{b.label}</div>
            </motion.div>
          )}

          {stage === 'metrics' && (
            <motion.div
              key="metrics"
              className="vision-metrics"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18, transition: { duration: 0.45 } }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="vision-badge">Vision at scale</div>
              <div className="vision-grid">
                {METRICS.map((m, i) => (
                  <motion.div
                    key={m.l}
                    className="panel pad-md vision-card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="vision-card-i"><Icon name={m.i} size={16} /></span>
                    <div className="vision-card-v num">{m.v}</div>
                    <div className="muted vision-card-l">{m.l}</div>
                  </motion.div>
                ))}
              </div>
              <div className="muted vision-disclaimer mono">
                Illustrative projection · not current figures
              </div>
            </motion.div>
          )}

          {stage === 'close' && (
            <motion.div
              key="close"
              className="vision-close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="h1 vision-line"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                A world where everyone
                <br />
                has <span className="grad">access to AI</span>.
              </motion.div>

              <motion.img
                className="vision-logo"
                src="./assets/logo-lockup-dark.svg"
                alt="AI for All"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.9 }}
                draggable={false}
              />

              <motion.div
                className="vision-tag"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.1, duration: 1 }}
              >
                <span>Turn what your computer has</span>
                <span className="grad">into AI access for everyone.</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button className="btn quiet vision-exit" onClick={() => go('APP')}>
        Back to app
      </button>
    </div>
  )
}
