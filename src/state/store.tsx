import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef,
} from 'react'
import {
  LIVE_NEXT, LIVE_ORDER, PHASE_NEXT, PHASE_ORDER, REQUESTS, WINDOW_MODE,
  type Live, type Phase, type Tab,
} from './machine'

declare global {
  interface Window {
    afa?: {
      isElectron: boolean
      setMode: (m: 'desk' | 'mobile') => Promise<unknown>
      hide: () => Promise<unknown>
      quit: () => Promise<unknown>
      openDevtools: () => Promise<unknown>
      onTrigger: (cb: (name: string) => void) => () => void
    }
  }
}

type State = {
  phase: Phase
  tab: Tab
  live: Live
  causes: string[]
  give: number
  stats: { people: number; sessions: number; hours: number }
  earnings: { month: number; gaveBack: number; cashedOut: number }
  payout: 'idle' | 'cashed' | 'gave'
  /** Bumped on every completed session so the globe can drop a new node. */
  nodeSeed: number
  showHelp: boolean
  /** Presenter hold: pauses auto-advance so a beat can be lined up on camera. */
  frozen: boolean
  /** Which mocked request is in flight; rotates so runs route to varied models. */
  reqIndex: number
}

const INITIAL: State = {
  phase: 'INTRO',
  tab: 'home',
  live: 'IDLE',
  causes: ['education', 'accessibility', 'research'],
  give: 70,
  stats: { people: 127, sessions: 356, hours: 23.6 },
  earnings: { month: 18.42, gaveBack: 0, cashedOut: 0 },
  payout: 'idle',
  nodeSeed: 0,
  showHelp: false,
  frozen: false,
  reqIndex: 0,
}

type Action =
  | { t: 'phase'; v: Phase }
  | { t: 'tab'; v: Tab }
  | { t: 'live'; v: Live }
  | { t: 'freeze'; v: Live }
  | { t: 'unfreeze' }
  | { t: 'run'; v: number }
  | { t: 'cause'; v: string }
  | { t: 'give'; v: number }
  | { t: 'complete' }
  | { t: 'payout'; v: 'cashed' | 'gave' }
  | { t: 'help' }
  | { t: 'reset' }

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'phase':
      return { ...s, phase: a.v, live: a.v === 'APP' ? s.live : 'IDLE' }
    case 'tab':
      return { ...s, tab: a.v }
    case 'live':
      return { ...s, live: a.v }
    case 'freeze':
      return { ...s, phase: 'APP', tab: 'home', live: a.v, frozen: true }
    case 'unfreeze':
      return { ...s, frozen: false }
    case 'run':
      return {
        ...s,
        phase: 'APP',
        tab: 'home',
        live: 'REQUEST_RECEIVED',
        frozen: false,
        reqIndex: ((a.v % REQUESTS.length) + REQUESTS.length) % REQUESTS.length,
      }
    case 'cause':
      return {
        ...s,
        causes: s.causes.includes(a.v)
          ? s.causes.filter((c) => c !== a.v)
          : [...s.causes, a.v],
      }
    case 'give':
      return { ...s, give: a.v }
    case 'complete':
      return {
        ...s,
        nodeSeed: s.nodeSeed + 1,
        // Advance so the next run routes to a different model.
        reqIndex: (s.reqIndex + 1) % REQUESTS.length,
        stats: {
          people: s.stats.people + 1,
          sessions: s.stats.sessions + 1,
          hours: Math.round((s.stats.hours + 0.2) * 10) / 10,
        },
        earnings: { ...s.earnings, month: Math.round((s.earnings.month + 0.31) * 100) / 100 },
      }
    case 'payout': {
      const half = Math.round((s.earnings.month / 2) * 100) / 100
      return a.v === 'gave'
        ? { ...s, payout: 'gave', earnings: { ...s.earnings, gaveBack: half } }
        : { ...s, payout: 'cashed', earnings: { ...s.earnings, cashedOut: half } }
    }
    case 'help':
      return { ...s, showHelp: !s.showHelp }
    case 'reset':
      return { ...INITIAL, nodeSeed: 0 }
    default:
      return s
  }
}

type Ctx = State & {
  mode: 'desk' | 'mobile'
  half: number
  /** The mocked request currently in flight. */
  request: (typeof REQUESTS)[number]
  runRequest: (i: number) => void
  go: (p: Phase) => void
  setTab: (t: Tab) => void
  setLive: (l: Live) => void
  toggleCause: (id: string) => void
  setGive: (n: number) => void
  triggerRequest: () => void
  payoutAction: (v: 'cashed' | 'gave') => void
  reset: () => void
  toggleHelp: () => void
  step: (dir: 1 | -1) => void
}

const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, dispatch] = useReducer(reducer, INITIAL)
  const mode = WINDOW_MODE[s.phase]

  // ---- window sizing: the only thing the renderer asks the OS for -------
  useEffect(() => {
    window.afa?.setMode(mode)
  }, [mode])

  // ---- phase cinematics auto-advance ------------------------------------
  useEffect(() => {
    const nxt = PHASE_NEXT[s.phase]
    if (!nxt) return
    const [to, ms] = nxt
    const id = window.setTimeout(() => dispatch({ t: 'phase', v: to }), ms)
    return () => window.clearTimeout(id)
  }, [s.phase])

  // ---- live request lifecycle -------------------------------------------
  useEffect(() => {
    if (s.phase !== 'APP' || s.frozen) return
    const nxt = LIVE_NEXT[s.live]
    if (!nxt) return
    const [to, ms] = nxt
    const id = window.setTimeout(() => {
      // Credit the session exactly as the impact overlay dismisses, so the
      // Home counters visibly roll 127 → 128 on reveal.
      if (s.live === 'IMPACT_REWARD') dispatch({ t: 'complete' })
      dispatch({ t: 'live', v: to })
    }, ms)
    return () => window.clearTimeout(id)
  }, [s.live, s.phase, s.frozen])

  // A request always pulls you back to Home — it is a Home event.
  const reqRef = useRef(s.reqIndex)
  reqRef.current = s.reqIndex

  const triggerRequest = useCallback(() => dispatch({ t: 'run', v: reqRef.current }), [])
  const runRequest = useCallback((i: number) => dispatch({ t: 'run', v: i }), [])

  const go = useCallback((p: Phase) => dispatch({ t: 'phase', v: p }), [])

  const value = useMemo<Ctx>(() => {
    const half = Math.round((s.earnings.month / 2) * 100) / 100
    return {
      ...s,
      mode,
      half,
      request: REQUESTS[s.reqIndex] ?? REQUESTS[0],
      runRequest,
      go,
      setTab: (t) => dispatch({ t: 'tab', v: t }),
      setLive: (l) => dispatch({ t: 'live', v: l }),
      toggleCause: (id) => dispatch({ t: 'cause', v: id }),
      setGive: (n) => dispatch({ t: 'give', v: n }),
      triggerRequest,
      payoutAction: (v) => dispatch({ t: 'payout', v }),
      reset: () => dispatch({ t: 'reset' }),
      toggleHelp: () => dispatch({ t: 'help' }),
      step: (dir: 1 | -1) => {
        const i = PHASE_ORDER.indexOf(s.phase)
        const j = Math.max(0, Math.min(PHASE_ORDER.length - 1, (i < 0 ? 6 : i) + dir))
        dispatch({ t: 'phase', v: PHASE_ORDER[j] })
      },
    }
  }, [s, mode, go, triggerRequest, runRequest])

  // ---- demo director: hotkeys + tray triggers ---------------------------
  const api = useRef(value)
  api.current = value

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const a = api.current
      if (e.metaKey && e.key === '/') { e.preventDefault(); a.toggleHelp(); return }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Shift+1…7 holds a single beat of the request lifecycle so it can be
      // framed and recorded without racing the auto-advance timers.
      if (e.shiftKey) {
        const i = '!@#$%^&'.indexOf(e.key)
        if (i >= 0) { dispatch({ t: 'freeze', v: LIVE_ORDER[i] }); return }
      }

      const k = e.key.toLowerCase()
      if (k === 'r') a.triggerRequest()
      else if (k === 'v') a.go(a.phase === 'VISION' ? 'APP' : 'VISION')
      else if (k === 'h') { a.go('APP'); a.setTab('home') }
      else if (k === 'e') { a.go('APP'); a.setTab('earnings') }
      else if (k === 's') { a.go('APP'); a.setTab('settings') }
      else if (k === '0') a.reset()
      // 1–3 run a specific mocked request, so you can call up the model you
      // want on camera instead of cycling through the rotation.
      else if (k >= '1' && k <= '3') a.runRequest(Number(k) - 1)
      else if (k === ']') a.step(1)
      else if (k === '[') a.step(-1)
      else if (k === 'escape') window.afa?.hide()
    }
    window.addEventListener('keydown', onKey)
    // Scriptable handle for driving the demo from devtools or a recorder.
    ;(window as any).__afa = {
      hold: (l: Live) => dispatch({ t: 'freeze', v: l }),
      play: () => api.current.triggerRequest(),
      run: (i: number) => api.current.runRequest(i),
      go: (p: Phase) => api.current.go(p),
      tab: (t: Tab) => api.current.setTab(t),
      reset: () => api.current.reset(),
    }
    const off = window.afa?.onTrigger((name) => {
      const a = api.current
      if (name === 'request') a.triggerRequest()
      else if (name === 'vision') a.go('VISION')
      else if (name === 'reset') a.reset()
    })
    return () => { window.removeEventListener('keydown', onKey); off?.() }
  }, [])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const v = useContext(StoreCtx)
  if (!v) throw new Error('useStore must be used inside <StoreProvider>')
  return v
}
