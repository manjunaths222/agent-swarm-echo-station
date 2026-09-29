# Agent Swarm: ECHO Station

**The Last Signal** is a local-first, interactive 3D escape room that makes multi-agent coordination visible. Four specialized agents explore separate rooms, exchange evidence, restore power, reject an obsolete access code, and synchronize a two-relay escape.

The built-in deterministic simulation runs with zero inference tokens. For a real agent run, connect a local Ollama model—no paid API keys, cloud model calls, or external art assets are required.

## What this demonstrates

- **Private knowledge:** each agent begins with access only to evidence discovered in its assigned room.
- **Evidence handoffs:** agents send discoveries to the team and build shared context over time.
- **Coordinated execution:** restoring power and opening the exit require actions from different roles in the correct order.
- **Fault recovery:** inject a relay failure and watch agents discover a bypass, restore the station, and resume the plan.
- **Fair comparisons:** run communicating, independent, and centralized control modes against the same puzzle seed and action limits.
- **Measured local inference:** Ollama token counts, calls, turns, and validated actions are recorded without sending data to a hosted model.

## Run

Requires Node.js 22.13 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by the server, normally [http://localhost:5173](http://localhost:5173). The simulation works immediately. Dependencies require an internet connection for the initial install; the game itself has no external asset or font dependencies.

## Play

- **Start mission** at the top of the page runs the team. Pause, advance one turn, or choose 1× / 2× / 4× playback.
- Drag the 3D scene to orbit; scroll or pinch to zoom. Reset camera restores the initial framing.
- Select an agent in the scene or its card to inspect its current status.
- The **Evidence** tab shows discovered clues and how many agents know each one. Clicking an evidence reference in Comms opens that clue.
- **Introduce a disruption** fails a relay once per run. Nova discovers and installs a bypass; Atlas restores power; the team resumes its escape.
- Change **Agent coordination** to start the same seed with a single controller, independent agents, or a communicating team.
- **Experiments** computes a deterministic comparison using the same puzzle and action cap.
- **Replay** scrubs recorded snapshots without model calls. **Export mission log** downloads full JSON state and history.
- **New scenario** changes the access-code seed; restart preserves it. Layout and puzzle rules remain fixed.
- Space toggles playback when focus is outside an interactive control.

## Simulation versus actual AI

The default **Simulation** engine is an explicitly labeled, deterministic policy. It chooses actions from each agent's known evidence. Its short messages use authored templates. It demonstrates the communication and interlock mechanics; it is not LLM reasoning or a benchmark proving that swarms outperform a central controller.

The **Ollama** engine asks a real locally installed model for each agent's next structured action. The four agents share one model, but retain separate observations. Code exposes currently available actions and enforces device interlocks; the model chooses an action and derives the access code from its evidence. Natural-language messages can still contain inaccuracies; attached evidence and engine-verified outcomes are authoritative. No simulation action is substituted when a model call fails.

To use actual AI:

1. Install Ollama from https://ollama.com and start it on its default local port, 11434.
2. Install a local model compatible with structured JSON output. Choose a model that fits your computer's memory. Cloud-tagged models are excluded.
3. Run this app locally. Open **Mission settings → Detect local models**, then choose the installed model.
4. Start a fresh mission. Model output is validated by the same game engine as simulation.

On this Mac, Ollama is installed through Homebrew. To start it again after a logout or reboot, run `brew services run ollama`.

The hosted version, if deployed, supports simulation. Its server cannot access Ollama on a visitor's computer. Use the local source for actual local-model runs.

### Budget controls

- Only the current agent's evidence, station status, and recent relevant events enter each request.
- One model request at a time, with a 220-token output limit, 4,096-token context, and thinking disabled where supported.
- Maximum 40 model calls. Stop launching new calls once reported usage reaches 23,000 tokens. A final in-flight request can cross that threshold.
- A 90-second timeout stops an unresponsive request. Some models may not honor every inference option or may fail to emit complete JSON within the cap.
- Input/output counters come from Ollama; simulation displays zero model tokens.
- No-progress detection stops a run after 16 turns without a state change, with a global cap of 100 turns.

## Architecture

- `lib/game.ts`: immutable game state, clue ownership, filtered observations, deterministic policy, validation, and fault recovery.
- `components/game/Station.tsx`: procedural Three.js environment, shadows, bloom, orbit controls, robots, reactor, and evidence-transfer effects.
- `app/page.tsx`: mission interface, scheduler, activity/evidence panels, local-model requests, replay, and JSON export.
- `lib/agent-actions.ts`: available-action menu and validation. Excludes duplicate inspections and unavailable interlocked controls; the model selects among offered actions and supplies the authorization code.
- `app/api/agent/route.ts`: loopback-only Ollama adapter with same-origin checks and validated JSON actions. It only contacts the fixed localhost Ollama endpoint.
- `tests/engine.test.ts`: puzzles, information isolation, interlocks, invalid actions, recovery, and replay immutability.
- `tests/adapter.test.ts`: request guards, model discovery, token reporting, malformed responses, and offline behavior using mocked Ollama responses.

React / Vinext, TypeScript, Three.js, Radix primitives, Lucide icons. Mission state is in browser memory and disappears on reload; export a run to retain it. The selected engine and model are remembered in browser-local preferences. This is a demonstration app, not a tamper-resistant multiplayer service. Game rules and clue definitions are present in client source, but agent observation packets exclude undiscovered text.

## Validation

```sh
npm test
npx tsc --noEmit
npm run build
```

20 automated tests pass. The simulation was checked in-browser through a full escape, injected-fault recovery, mode comparison, replay, and a 390px responsive layout. The read-only WebMCP mission tool was tested with valid and invalid inputs.

A real local run with Ollama 0.33.0 and Qwen3 4B completed the escape in 24 turns and 24 model calls, using 11,208 reported input/output tokens, with zero rejected actions, in approximately 66 seconds on this Apple M1 Pro / 16 GB Mac. The complete trace is saved in `validation/live-agent-run.json`. This is one measured run, not a reliability benchmark. Earlier unconstrained prompts stalled; the final integration supplies a validated action menu.

## Comparison interpretation

For the default deterministic seed, the central controller escapes in 24 turns, the team in 28, and isolated agents stall at 24. That honestly demonstrates the value of sharing information relative to isolation, while showing the overhead of coordination. All modes control the same four characters; the single controller pools discovered evidence. Actual model runs can be exported and compared at matched budgets.

## Visual controls and accessibility

Responsive desktop/mobile layout; keyboard-accessible controls and dialogs; agent cards duplicate 3D selection; reduced-motion support; optional sound starts only after a user gesture. If WebGL is unavailable, mission controls and textual evidence continue to work. A GPU with WebGL2 is needed for the 3D view.
