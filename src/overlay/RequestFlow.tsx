import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../state/store'
import { RoutingViz } from '../components/RoutingViz'
import { AiCore } from '../components/AiCore'
import { Icon } from '../components/Icon'
import './request.css'

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
}

const CHAIN = ['Understanding Task', 'Requirements Identified', 'Searching AI for All']

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/**
 * Live-ish telemetry. Small random walks read as real; pure noise does not.
 * Baselines come from the request, so a lighter model visibly runs faster and
 * cooler than a 32B one. All mocked — nothing is actually running.
 */
function useTelemetry(active: boolean, baseTps: number, baseGpu: number) {
  const [tps, setTps] = useState(baseTps)
  const [gpu, setGpu] = useState(baseGpu)
  const [secs, setSecs] = useState(0)
  const t0 = useRef(0)

  useEffect(() => {
    if (!active) { setSecs(0); setTps(baseTps); setGpu(baseGpu); return }
    t0.current = performance.now()
    const tick = window.setInterval(() => {
      setSecs(Math.floor((performance.now() - t0.current) / 1000))
      setTps((v) => clamp(v + (Math.random() - 0.5) * 1.6, baseTps - 3.8, baseTps + 4.2))
      setGpu((v) => Math.round(clamp(v + (Math.random() - 0.5) * 7, baseGpu - 9, baseGpu + 11)))
    }, 420)
    return () => window.clearInterval(tick)
  }, [active, baseTps, baseGpu])

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  return { tps, gpu, clock: `${mm}:${ss}` }
}

export function RequestFlow() {
  const { live, request } = useStore()
  const [chainStep, setChainStep] = useState(0)
  const tele = useTelemetry(live === 'INFERENCE_RUNNING', request.tps, request.gpu)

  useEffect(() => {
    if (live !== 'ANALYZING') return
    setChainStep(0)
    const id = window.setTimeout(() => setChainStep(1), 1250)
    return () => window.clearTimeout(id)
  }, [live])

  if (live === 'IDLE') return null

  const routing = live === 'SEARCHING_NETWORK' || live === 'NODE_SELECTED'
  const activeChain = live === 'SEARCHING_NETWORK' ? 2 : chainStep

  return (
    <motion.div
      className="rf"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="rf-inner">
        <AnimatePresence mode="wait">
          {/* ------------------------------------------------ 1. received */}
          {live === 'REQUEST_RECEIVED' && (
            <motion.div key="recv" className="rf-stage" {...fade}>
              <motion.div
                className="rf-burst"
                initial={{ scale: 0.4, opacity: 0.7 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              />
              <motion.div
                className="rf-ico"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <Icon name="bolt" size={30} />
              </motion.div>
              <div className="rf-title">REQUEST RECEIVED</div>
              <div className="rf-chip">
                <Icon name={request.icon} size={14} />
                {request.cause} · {request.kind}
              </div>
              <div className="rf-privacy muted">
                <Icon name="lock" size={12} /> No prompt, name, or personal information.
              </div>
            </motion.div>
          )}

          {/* ------------------------------------- 2/3. analyze + search */}
          {(live === 'ANALYZING' || routing) && (
            <motion.div key="route" className="rf-stage" {...fade}>
              <div className="rf-kicker eyebrow">
                {live === 'NODE_SELECTED' ? 'Route locked' : 'Routing'}
              </div>

              {live === 'ANALYZING' && (
                <div className="rf-chain">
                  {CHAIN.map((c, i) => {
                    const state = i < activeChain ? 'done' : i === activeChain ? 'on' : 'off'
                    return (
                      <div key={c} className={`chain-row ${state}`}>
                        <span className="chain-node">
                          {state === 'done' ? <Icon name="check" size={11} strokeWidth={3} /> : <span className="chain-dot" />}
                        </span>
                        <span className="chain-label">{c}</span>
                        {i < CHAIN.length - 1 && <span className="chain-line" />}
                      </div>
                    )
                  })}

                  <AnimatePresence>
                    {activeChain >= 1 && (
                      <motion.div
                        className="rf-reqs"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {request.reqs.map((r, i) => (
                          <motion.span
                            key={r}
                            className="rf-req"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.09 }}
                          >
                            {r}
                          </motion.span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {routing && (
                <>
                  <div className="rf-title sm">
                    {live === 'SEARCHING_NETWORK' ? 'Searching AI for All' : 'Best node found'}
                  </div>
                  <RoutingViz
                    stage={live === 'SEARCHING_NETWORK' ? 'searching' : 'selected'}
                    winner={request.node}
                  />

                  <AnimatePresence>
                    {live === 'SEARCHING_NETWORK' && (
                      <motion.div
                        className="mono rf-scanline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        evaluating 1,284 available nodes…
                      </motion.div>
                    )}

                    {live === 'NODE_SELECTED' && (
                      <motion.div
                        className="rf-selected"
                        initial={{ opacity: 0, y: 14, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      >
                        <div className="rf-sel-name">
                          {request.model} <span className="rf-sel-tag">SELECTED</span>
                        </div>
                        <div className="muted rf-sel-meta mono">
                          Best match · {request.latency}ms away
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {/* ------------------------------------------------ 4. inference */}
          {live === 'INFERENCE_RUNNING' && (
            <motion.div key="infer" className="rf-stage" {...fade}>
              <div className="rf-kicker eyebrow">AI inference in progress</div>

              <AiCore size={186} intensity={tele.gpu / 100} />

              <div className="rf-model">{request.model}</div>

              <div className="rf-metrics">
                {[
                  { l: 'tokens/sec', v: tele.tps.toFixed(1) },
                  { l: 'GPU', v: `${tele.gpu}%` },
                  { l: 'duration', v: tele.clock },
                ].map((m) => (
                  <div className="rf-metric" key={m.l}>
                    <div className="mono rf-metric-v">{m.v}</div>
                    <div className="muted rf-metric-l">{m.l}</div>
                  </div>
                ))}
              </div>

              <div className="rf-gpu-bar">
                <motion.div
                  className="rf-gpu-fill"
                  animate={{ width: `${tele.gpu}%` }}
                  transition={{ duration: 0.42, ease: 'linear' }}
                />
              </div>

              <div className="rf-secure">
                <Icon name="lock" size={15} />
                <div>
                  <div className="rf-secure-t">Private &amp; Secure</div>
                  <div className="muted rf-secure-d">No prompts. No personal data.</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------ 5. delivered */}
          {live === 'RESPONSE_DELIVERED' && (
            <motion.div key="done" className="rf-stage" {...fade}>
              <motion.div
                className="rf-check"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 1.15, 1], opacity: 1 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon name="check" size={38} strokeWidth={2.4} />
              </motion.div>
              <div className="rf-title">RESPONSE DELIVERED</div>
              <div className="muted rf-sel-meta mono">{request.summary}</div>
            </motion.div>
          )}

          {/* ------------------------------------------------ 6. impact */}
          {live === 'IMPACT_REWARD' && (
            <motion.div key="impact" className="rf-stage rf-impact" {...fade}>
              <motion.div
                className="rf-heart"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.22, 1], opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon name="heart" size={46} fill="currentColor" strokeWidth={0} />
              </motion.div>
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="rf-heart-ring"
                  initial={{ scale: 0.5, opacity: 0.55 }}
                  animate={{ scale: 2.8, opacity: 0 }}
                  transition={{ duration: 2, delay: 0.3 + i * 0.5, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                className="rf-impact-t"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                YOU HELPED SOMEONE
              </motion.div>
              <motion.div
                className="sub rf-impact-d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {request.impact}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
