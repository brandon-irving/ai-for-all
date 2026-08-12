/**
 * Source of truth for the demo.
 *
 * Two orthogonal axes, deliberately:
 *
 *   Phase  — the one-way onboarding spine. Ends at APP and never comes back.
 *   Live   — the temporary experience layered *into* Home. Home/Earnings/
 *            Settings stay mounted underneath the whole time.
 *
 * Keeping Live separate from Phase is what stops this feeling like an
 * infrastructure dashboard: the request lifecycle is an event that happens
 * *to* the home screen, not a place you navigate to.
 */

export type Phase =
  | 'INTRO'
  | 'WELCOME'
  | 'SYSTEM_SCANNING'
  | 'SYSTEM_RESULTS'
  | 'CONTRIBUTION_SETUP'
  | 'ACTIVATING'
  | 'APP'
  | 'VISION'

export type Tab = 'home' | 'earnings' | 'settings'

export type Live =
  | 'IDLE'
  | 'REQUEST_RECEIVED'
  | 'ANALYZING'
  | 'SEARCHING_NETWORK'
  | 'NODE_SELECTED'
  | 'INFERENCE_RUNNING'
  | 'RESPONSE_DELIVERED'
  | 'IMPACT_REWARD'

/** Which window size each phase wants. Driven over IPC to the main process. */
export const WINDOW_MODE: Record<Phase, 'desk' | 'mobile'> = {
  INTRO: 'desk',
  WELCOME: 'desk',
  SYSTEM_SCANNING: 'desk',
  SYSTEM_RESULTS: 'desk',
  CONTRIBUTION_SETUP: 'desk',
  ACTIVATING: 'desk',
  APP: 'mobile',
  VISION: 'desk',
}

/** Linear onboarding order, used by the [ / ] step hotkeys. */
export const PHASE_ORDER: Phase[] = [
  'INTRO',
  'WELCOME',
  'SYSTEM_SCANNING',
  'SYSTEM_RESULTS',
  'CONTRIBUTION_SETUP',
  'ACTIVATING',
  'APP',
]

/**
 * Auto-advance table: [next state, dwell in ms].
 * Total request lifecycle ≈ 30s, with the routing beat (ANALYZING →
 * NODE_SELECTED) landing at ~7.4s as specced.
 */
export const LIVE_NEXT: Partial<Record<Live, [Live, number]>> = {
  REQUEST_RECEIVED: ['ANALYZING', 2400],
  ANALYZING: ['SEARCHING_NETWORK', 2600],
  SEARCHING_NETWORK: ['NODE_SELECTED', 3000],
  NODE_SELECTED: ['INFERENCE_RUNNING', 2400],
  INFERENCE_RUNNING: ['RESPONSE_DELIVERED', 14600],
  RESPONSE_DELIVERED: ['IMPACT_REWARD', 2200],
  IMPACT_REWARD: ['IDLE', 3400],
}

/** Order for the Shift+1…7 "hold this beat" presenter hotkeys. */
export const LIVE_ORDER: Live[] = [
  'REQUEST_RECEIVED',
  'ANALYZING',
  'SEARCHING_NETWORK',
  'NODE_SELECTED',
  'INFERENCE_RUNNING',
  'RESPONSE_DELIVERED',
  'IMPACT_REWARD',
]

/** Phases that auto-advance on their own (scan + activate cinematics). */
export const PHASE_NEXT: Partial<Record<Phase, [Phase, number]>> = {
  SYSTEM_SCANNING: ['SYSTEM_RESULTS', 5200],
  ACTIVATING: ['APP', 4200],
}

// ------------------------------------------------------------------ content

export const CAUSES = [
  { id: 'education', label: 'Education', blurb: 'Tutoring, study help, coursework' },
  { id: 'accessibility', label: 'Accessibility', blurb: 'Captions, description, reading support' },
  { id: 'research', label: 'Research', blurb: 'Independent and academic work' },
  { id: 'nonprofits', label: 'Nonprofits', blurb: 'Orgs without an AI budget' },
  { id: 'communities', label: 'Communities', blurb: 'Local and underserved groups' },
] as const

/**
 * What the node can offer. The four rows deliberately span the whole
 * contribution — not just the model — because the pitch is "what your
 * computer has", and a scan that only found a GPU would undercut it.
 */
export const HARDWARE = [
  { id: 'gpu', label: 'GPU', value: 'NVIDIA RTX 4090', detail: '24 GB VRAM' },
  { id: 'ram', label: 'Memory', value: '64 GB RAM', detail: 'DDR5 · 6000 MT/s' },
  { id: 'disk', label: 'Storage', value: '500 GB free', detail: 'Model cache' },
  { id: 'net', label: 'Bandwidth', value: '1 Gbps', detail: '↓ 1000 · ↑ 940' },
]

export const MODELS = [
  { id: 'qwen', name: 'Qwen 2.5 32B', size: '32B', tag: 'Local' },
  { id: 'gemma', name: 'Gemma 4', size: '27B', tag: 'Local' },
  { id: 'llama', name: 'Llama 3.1 8B', size: '8B', tag: 'Local' },
]

/**
 * Mocked inbound requests. The demo cycles these so consecutive runs route to
 * *different* models — a router that always picks the same node looks like a
 * replayed script, one that picks per workload looks like it is reasoning.
 *
 * Index 0 is the scripted hero run (Education · Tutoring → Qwen, 23ms).
 *
 * NOTE: all of this is mock data. No model is actually invoked.
 */
export const REQUESTS = [
  {
    id: 'tutoring',
    cause: 'Education',
    kind: 'Tutoring',
    icon: 'education',
    model: 'Qwen 2.5 32B',
    latency: 23,
    node: 11,
    tps: 18.2,
    gpu: 67,
    reqs: ['Text generation', '≥7B params', 'Low latency', 'Safe-completion'],
    impact: 'Someone learned something today using your computer.',
    summary: '14.2s · 259 tokens · 0 data retained',
  },
  {
    id: 'captioning',
    cause: 'Accessibility',
    kind: 'Live captioning',
    icon: 'accessibility',
    model: 'Gemma 4',
    latency: 19,
    node: 2,
    tps: 26.4,
    gpu: 54,
    reqs: ['Streaming output', 'Sub-50ms', 'On-device', 'Multilingual'],
    impact: 'Someone followed a conversation they would have missed.',
    summary: '11.8s · 412 tokens · 0 data retained',
  },
  {
    id: 'summarising',
    cause: 'Research',
    kind: 'Paper summarisation',
    icon: 'research',
    model: 'Qwen 2.5 32B',
    latency: 31,
    node: 6,
    tps: 14.6,
    gpu: 79,
    reqs: ['Long context', '128k window', '≥32B params', 'Citation-safe'],
    impact: 'Someone got through research they could not otherwise run.',
    summary: '16.4s · 688 tokens · 0 data retained',
  },
]

export const IMPACT_MIX = [
  { id: 'education', label: 'Education', pct: 68 },
  { id: 'accessibility', label: 'Accessibility', pct: 17 },
  { id: 'research', label: 'Research', pct: 10 },
  { id: 'nonprofits', label: 'Nonprofits', pct: 5 },
]

export const SETTINGS_ROWS = [
  { id: 'mode', label: 'Contribution Mode', value: '70% Give / 30% Earn', icon: 'sliders' },
  { id: 'causes', label: 'Supported Causes', value: '4 selected', icon: 'heart' },
  { id: 'hours', label: 'Active Hours', value: 'Always on', icon: 'clock' },
  { id: 'limits', label: 'Resource Limits', value: 'Max 70% GPU', icon: 'gauge' },
  { id: 'payout', label: 'Payout Method', value: '•••• 4291', icon: 'card' },
  { id: 'privacy', label: 'Privacy', value: 'Zero-knowledge routing', icon: 'lock' },
  { id: 'notify', label: 'Notifications', value: 'Impact only', icon: 'bell' },
]
