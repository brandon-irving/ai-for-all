import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from './Icon'
import { useStore } from '../state/store'
import type { Tab } from '../state/machine'
import './chrome.css'

/** Frameless-window drag strip with minimal traffic lights. */
export function TitleBar({ tag }: { tag?: string }) {
  return (
    <div className="titlebar">
      <div className="dots">
        <button className="dot-btn close" title="Hide (Esc)" onClick={() => window.afa?.hide()} />
        <button className="dot-btn min" title="Hide" onClick={() => window.afa?.hide()} />
      </div>
      <div className="tag">{tag ?? 'AI FOR ALL'}</div>
      <div style={{ width: 29 }} />
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'earnings', label: 'Earnings', icon: 'earnings' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export function BottomNav() {
  const { tab, setTab } = useStore()
  return (
    <nav className="nav">
      {TABS.map((t) => {
        const on = tab === t.id
        return (
          <button key={t.id} className={`nav-btn ${on ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {on && (
              <motion.span
                layoutId="nav-pill"
                className="nav-pill"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="nav-inner">
              <Icon name={t.icon} size={17} strokeWidth={on ? 1.9 : 1.5} />
              <span>{t.label}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}

/** Presenter cheat-sheet. ⌘/ toggles it; it never appears on its own. */
export function HelpSheet() {
  const { showHelp, toggleHelp } = useStore()
  const keys: [string, string][] = [
    ['R', 'Incoming request (full run)'],
    ['⇧1 – ⇧7', 'Hold one beat of the request'],
    ['V', 'Scale vision'],
    ['H / E / S', 'Home · Earnings · Settings'],
    ['[ / ]', 'Step onboarding'],
    ['0', 'Reset to first run'],
    ['Esc', 'Hide to menu bar'],
    ['⌘⇧A', 'Global show/hide'],
  ]
  return (
    <AnimatePresence>
      {showHelp && (
        <motion.div
          className="help"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={toggleHelp}
        >
          <div className="help-card panel">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Demo controls</div>
            {keys.map(([k, v]) => (
              <div className="help-row" key={k}>
                <span className="kbd">{k}</span>
                <span className="muted">{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
