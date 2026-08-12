# AI for All — demo desktop app

> Turn what your computer has into AI access for everyone.

A menu-bar-resident macOS app (Electron + React) that mocks the full AI for All
contributor experience for the hackathon video. **Frontend only** — no network,
no real inference, no payments. Every number is scripted.

## Run it

```bash
npm install
npm start        # build + launch the Electron app
```

Development with hot reload:

```bash
npm run dev      # vite + electron together
npm run web      # renderer only, in a browser (window IPC is no-op'd)
```

## How it behaves

The app has **no dock icon**. It lives in the menu bar:

| Action | Result |
|---|---|
| Click the tray icon | Show / hide |
| `⌘⇧A` | Global show / hide from anywhere |
| Right-click the tray | Demo triggers + Quit |
| `Esc` | Hide back to the menu bar |

**The window changes size with the flow.** Onboarding runs at a normal desktop
size (1120×760, centred); the moment the node activates, the window animates
down to phone size (400×820) and parks under the tray icon. That collapse is a
native macOS resize, driven over IPC from `WINDOW_MODE` in
`src/state/machine.ts`.

## Presenter controls

Recording the video is easier if you drive the beats yourself. `⌘/` shows this
sheet in-app.

| Key | Does |
|---|---|
| `R` | Fire an incoming request (full ~30s lifecycle) |
| `⇧1` … `⇧7` | **Hold** one beat of the request, no auto-advance |
| `V` | Play the scale-vision finale |
| `H` / `E` / `S` | Jump to Home / Earnings / Settings |
| `[` / `]` | Step backward / forward through onboarding |
| `0` | Reset to first run |
| `⌘/` | Toggle the controls sheet |

`⇧1`–`⇧7` map to `REQUEST_RECEIVED, ANALYZING, SEARCHING_NETWORK,
NODE_SELECTED, INFERENCE_RUNNING, RESPONSE_DELIVERED, IMPACT_REWARD`. Use them
to line up a shot without racing the timers.

There is also a scriptable handle on `window.__afa` (`hold`, `play`, `go`,
`tab`, `reset`) if you want to drive it from devtools or a recorder.

## State machine

`src/state/machine.ts` is the source of truth. Two orthogonal axes:

```
Phase (one-way onboarding spine)
  INTRO → WELCOME → SYSTEM_SCANNING → SYSTEM_RESULTS
        → CONTRIBUTION_SETUP → ACTIVATING → APP

Live (temporary layer over Home — Home stays mounted underneath)
  IDLE → REQUEST_RECEIVED → ANALYZING → SEARCHING_NETWORK → NODE_SELECTED
       → INFERENCE_RUNNING → RESPONSE_DELIVERED → IMPACT_REWARD → IDLE
```

Home, Earnings and Settings are the only persistent destinations. Keeping the
request lifecycle as a *layer* rather than a route is what makes this read as a
consumer app instead of an infrastructure monitor.

Timings live in `LIVE_NEXT` / `PHASE_NEXT` in the same file — one table to
retune the whole pacing.

## Layout

```
electron/main.cjs      tray, window modes, global shortcut, IPC
electron/preload.cjs   contextBridge surface (window.afa)
src/state/machine.ts   state machine, timings, mock content
src/state/store.tsx    reducer, sequencer, hotkey director
src/screens/           one file per Phase
src/overlay/           the REQUEST → IMPACT layer
src/components/        Globe, AiCore, RadarScan, RoutingViz, ScoreRing, …
public/assets/         brand SVGs (self-animating via CSS)
```

## Assets

From `~/Downloads/ai-for-all-assets`. `hud-globe.svg` and `ai-core-icon.svg`
animate themselves with CSS keyframes, so they're loaded via `<img>` rather
than inlined — that keeps their gradient/filter `id`s from colliding across
instances. Anything reactive (contributor nodes, routing paths, impact
ripples) is drawn in an overlay `<svg>` sharing the same viewBox.

Everything else — glows, glass, scanlines, radar sweep, charts, icons — is
generated in CSS/SVG. No raster assets beyond the tray icon.

The wordmark in `logo-lockup-*.svg` is live `<text>`. Outline it before this
becomes a real brand asset (see the asset kit's own README).

## Known gaps

- The scale-vision figures are labelled **illustrative projection · not current
  figures** on screen. Keep that label if you reuse the frame.
- Nothing is persisted; `0` resets to first run, and so does a relaunch.
- Not packaged (`electron-builder` isn't configured) — it runs from source.
