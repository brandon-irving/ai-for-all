import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './state/store'
import { TitleBar, BottomNav, HelpSheet } from './components/Chrome'
import { Intro } from './screens/Intro'
import { Welcome } from './screens/Welcome'
import { SystemScan } from './screens/SystemScan'
import { SystemResults } from './screens/SystemResults'
import { ContributionSetup } from './screens/ContributionSetup'
import { Activating } from './screens/Activating'
import { Home } from './screens/Home'
import { Earnings } from './screens/Earnings'
import { Settings } from './screens/Settings'
import { Vision } from './screens/Vision'
import { RequestFlow } from './overlay/RequestFlow'
import './styles/screens.css'

const swap = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.008 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
}

const ONBOARDING = {
  INTRO: Intro,
  WELCOME: Welcome,
  SYSTEM_SCANNING: SystemScan,
  SYSTEM_RESULTS: SystemResults,
  CONTRIBUTION_SETUP: ContributionSetup,
  ACTIVATING: Activating,
} as const

const TABS = { home: Home, earnings: Earnings, settings: Settings } as const

export default function App() {
  const { phase, tab, mode, live } = useStore()
  const inApp = phase === 'APP'
  const Onboard = ONBOARDING[phase as keyof typeof ONBOARDING]
  const Tab = TABS[tab]

  return (
    <div className={`shell ${mode}`}>
      <TitleBar tag={inApp || phase === 'VISION' ? undefined : 'AI FOR ALL · SETUP'} />

      <div className="body">
        <AnimatePresence mode="wait">
          {phase === 'VISION' ? (
            <motion.div key="vision" className="screen" {...swap}>
              <Vision />
            </motion.div>
          ) : inApp ? (
            // Home / Earnings / Settings stay mounted as the only real
            // destinations; the request lifecycle layers on top of them.
            <motion.div key="app" className="screen" {...swap}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  className="screen"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24 }}
                >
                  <Tab />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>{live !== 'IDLE' && <RequestFlow key="rf" />}</AnimatePresence>
            </motion.div>
          ) : (
            Onboard && (
              <motion.div key={phase} className="screen" {...swap}>
                <Onboard />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {inApp && <BottomNav />}

      <HelpSheet />
    </div>
  )
}
