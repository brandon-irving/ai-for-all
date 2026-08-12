# AI for All

**Turn what your computer has into AI access for everyone.**

*AI for All turns unused compute, bandwidth, storage, and local AI models into shared AI access — letting people donate or earn from resources they aren't using, while expanding access for those who need it.*

## Inspiration

Access to AI still comes down to two things that have nothing to do with a person's ability: the machine they happen to own, and the money they happen to have. A student on a Chromebook and a student on a gaming rig aren't competing on talent — they're competing on hardware.

That bothered us. Someone gets left behind because of their situation, not their capability. And meanwhile there are millions of capable machines sitting idle almost all day. A gaming PC with thousands of dollars of silicon in it spends most of its life doing nothing, and plenty of them already have capable open models installed.

We already share the things we aren't using — food, clothing, time, money. Computing power is becoming that kind of resource. AI for All is the question of what happens if we treat it that way: let people donate the AI capacity they already have to someone who has none.

## What it does

AI for All turns an idle computer into shared AI infrastructure for people who can't afford their own.

It lives in your menu bar, out of the way. Open it and it scans what your machine can offer — GPU, memory, bandwidth, and any local models you already have installed — then scores your contribution capacity and estimates how many people you could serve in a day.

You choose what you want to support (education, accessibility, research, nonprofits, communities) and how you want to split your capacity between **donating** and **earning**. Then you activate your node and the window collapses down to a small ambient panel that sits quietly in the corner.

When someone somewhere needs AI, the network identifies what the request requires, searches available nodes, picks the best model for that specific workload, and routes it to you. You watch it happen as pure telemetry — model name, tokens per second, GPU load, duration — and **never see the prompt, the conversation, or anything identifying the person.** When it finishes, you see the only thing that matters:

> **You helped someone.**

Your impact counter ticks up, a new point lights up on your globe, and your earnings grow. In the Earnings tab you can cash out — or give it straight back to fund more free access for people who can't contribute hardware of their own. That's the loop that makes the network self-sustaining.

## How we built it

A **desktop app**, deliberately — not a web app. The premise is that your computer is the contribution, so the product should live on your computer.

- **Electron** as the shell, running as a macOS menu-bar app. `app.dock.hide()` turns it into an accessory process: no dock icon, no app-switcher entry. It sits in the tray and toggles with `⌘⇧A`. The window is frameless and transparent so the rounded corners are real.
- **React 18 + TypeScript**, bundled with **Vite**.
- **Framer Motion** for sequencing, plus a lot of hand-written CSS and SVG. No chart library, no icon library — every glow, glass panel, scan line, radar sweep, routing path, progress ring and icon is generated in CSS or SVG.
- **Canvas 2D** for the closing sequence, where the globe scales from 1 node to 1,000,000+. Points are placed with a Fibonacci sphere for uniform distribution and depth-faded so the back hemisphere reads as behind. Thousands of DOM nodes would have stalled the compositor; canvas holds 60fps.
- **Hand-authored SVG brand assets** for the globe and inference core, animated with CSS keyframes rather than SMIL so they honor `prefers-reduced-motion`.

The piece we're happiest with is the **window physically changing shape with the flow**. Onboarding runs at a normal desktop size — 1120×760, centered — because scanning your system and choosing your causes is a sit-down setup task. The instant your node activates, the window animates down to phone size (400×820) and parks under the menu-bar icon, because from then on it's an ambient companion, not an application you sit in front of. That's a native macOS resize driven over IPC from the state machine.

Underneath it all is a state machine with two deliberately separate axes:

```
Phase   INTRO → WELCOME → SYSTEM_SCANNING → SYSTEM_RESULTS
              → CONTRIBUTION_SETUP → ACTIVATING → APP

Live    IDLE → REQUEST_RECEIVED → ANALYZING → SEARCHING_NETWORK
             → NODE_SELECTED → INFERENCE_RUNNING → RESPONSE_DELIVERED
             → IMPACT_REWARD → IDLE
```

Home, Earnings and Settings are the *only* navigable destinations. The entire request lifecycle is a temporary layer over Home, not a place you go. Keeping that separation is what makes this feel like something a normal person would use rather than an infrastructure dashboard — a request is an event that happens *to* you, and then you're back to idle.

**This is a high-fidelity prototype of the intended experience.** Every figure on screen is scripted — the hardware scan, the network, the sessions, the earnings. Our goal for the hackathon was to make the idea legible and *felt*, not to stand up a distributed inference network in a weekend.

## Challenges we ran into

**Making mocked data feel alive without misleading anyone.** A demo that replays one identical script reads as fake within about ten seconds. Our first version routed every request to the same node with the same numbers. We rebuilt it so different request types resolve to different models with different characteristics — a captioning request lands on a lighter model that visibly runs faster and cooler than the 32B model handling paper summarization — and so the telemetry does small random walks around a per-model baseline instead of jittering randomly. The router *looks* like it's reasoning because the underlying data actually varies. Meanwhile we kept every projected figure explicitly labeled as a projection on screen, so nothing on the display claims to be measured when it isn't.

**Two coordinate systems that had to agree.** The brand globe is a self-animating SVG loaded through `<img>` so its gradient IDs don't collide across instances — which means we can't reach inside it. Every dynamic element (contributor nodes, impact ripples, the point that lights up when you help someone) is drawn in a second SVG layered on top, sharing the same viewBox and placing points on the same projected parallels so they sit convincingly on the sphere rather than floating over it.

**The window animation kept getting eaten.** To stop a frameless window being dragged out of shape, we clamp its minimum and maximum size. But clamping *before* the resize snapped the window instantly and killed the desk-to-phone transition entirely. The fix was to release the clamp, run the animated resize, then re-clamp once it settles.

**Legibility versus spectacle.** The finale ramps to a dense field of glowing nodes, which looked incredible and made the text on top completely unreadable. Solved by receding the field to a backdrop the moment the message takes over, plus soft radial scrims behind the type. The best-looking frame and the most readable frame were not the same frame, and the readable one had to win.

## Accomplishments that we're proud of

**The privacy model shapes the interface, not the other way around.** We committed to never showing the contributor a prompt or a conversation, and then had to make "your computer is helping a stranger" emotionally legible using nothing but telemetry and outcome. Solving that constraint produced a better product than ignoring it would have.

**The desktop-to-phone transformation.** We haven't seen another hackathon project where the OS window itself changes shape to signal a change in the product's role. It communicates "setup is over, I live in the background now" without a single word of explanation.

**Zero raster assets.** Apart from the tray icon, everything you see is generated — CSS gradients and glows, SVG geometry, canvas particles. The whole interface is code, which means it scales cleanly, animates on the GPU, and respects reduced-motion preferences.

**It demos the same way every time.** We built presenter controls into the app: hotkeys to fire a specific request, hold any single beat of the lifecycle for framing, and reset to first run. No live-demo roulette.

**Restraint on the navigation.** It would have been easy to build six tabs of dashboards. Three destinations and a temporary overlay was the harder, better call.

## What we learned

**Privacy isn't a feature of this product — it *is* the product.** The moment you route a stranger's request onto a volunteer's GPU, you've created two people who need protection from each other. The requester needs to know their prompt isn't being read. The contributor needs to know they aren't being made an unwitting participant in something they'd never agree to.

**Latency is dominated by generation, not transport — which is the entire reason this is viable.** Decomposing end-to-end request time:

$$L_{\text{total}} = L_{\text{route}} + L_{\text{net}} + L_{\text{queue}} + \frac{n_{\text{out}}}{r}$$

where $n_{\text{out}}$ is output tokens and $r$ is the node's generation rate. For a typical tutoring response — $n_{\text{out}} \approx 259$ tokens at $r \approx 18.2$ tok/s over a $23\ \text{ms}$ route:

$$\frac{L_{\text{route}}}{L_{\text{total}}} \approx \frac{0.023}{14.2} \approx 0.16\%$$

Network overhead is rounding error next to the model's own thinking time. That's why donated hardware three states away can serve someone perfectly well, and why the routing layer can afford to be *choosy* about which node it picks rather than just grabbing the nearest one.

**Idle capacity compounds faster than we expected.** For a node contributing $H$ idle hours per day at rate $r$, with average session size $\bar{t}$:

$$N_{\text{day}} = \frac{r \cdot H \cdot 3600}{\bar{t}}$$

A single RTX 4090 giving up $H = 8$ hours at $r = 18$ tok/s, with $\bar{t} \approx 11{,}000$ tokens per session, serves roughly $47$ people a day. One machine. The scaling argument writes itself from there.

## What's next for AI for All

**Real local inference.** The most immediate step is replacing scripted telemetry with a live call to a locally installed open model. Because the design already refuses to display output, this changes nothing on screen — the numbers simply stop being scripted and start being measured.

**The other half of the product.** We built the *contributor* experience. The *recipient* experience — the student on the Chromebook who actually receives the AI — doesn't exist yet, and it's the half that delivers the mission. It should be the lightest possible client: a browser tab, no account, no card.

**A real router.** Right now node selection is a scripted match. Making it real means a coordination service that scores nodes on capability, latency, and current load, then handles hand-off when a volunteer reclaims their GPU mid-request.

**Verification.** How do you know a node actually ran the model rather than returning plausible garbage or a cached response? A volunteer network is trust-minimal by definition, so this needs redundant execution or attestation — and both cost you the efficiency you were trying to gain.

**Contributor safeguards.** Someone could route genuinely harmful requests through a stranger's hardware, making that person an unwitting participant in something they'd never consent to. Before a single real request is routed, this needs content policy, cryptographic guarantees, and a clear answer to "what am I actually agreeing to run?" It's more a policy problem than an engineering one, and it's the one we'd want to solve first.

**Payout rails.** Real earnings, real cash-out, and real charity transfers for the give-back loop.

**Cross-platform.** The idle-GPU thesis points squarely at Windows gaming machines, so that's the next build target after macOS.

None of these are reasons not to build it. They're the reasons it's worth building carefully.
