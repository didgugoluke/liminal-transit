Goal: Import my existing prototype code (below) and stand up a minimal, production-ready project that I can run locally. Keep the UX identical (lean Y/N flow, Setup screen first, deterministic offline fallback), but evolve the design with minimalist text-first UI principles.

⸻

What to Build
	•	Vite + React + TypeScript app.
	•	File structure (suggested):
	•	/index.html
	•	/src/main.tsx
	•	/src/App.tsx ← main game logic (from prototype)
	•	/src/lib/rng.ts ← mulberry32, hashStringToSeed, pick
	•	/src/lib/gpt.ts ← generateWithGPT
	•	/src/lib/engine.ts ← generateWorld, offlineBeat, buildSystemPrompt
	•	/src/App.css or Tailwind (optional)
	•	/src/__tests__/*.test.ts (vitest)
	•	vitest.config.ts, tsconfig.json, .eslintrc.cjs, .prettierrc, .prettierignore
	•	.env.example, .gitignore, README.md, LICENSE

⸻

Prototype Source
	•	Current code is a single React component with:
	•	Setup Screen (Step 1) → paste API key or choose Offline.
	•	Seed input + “New World” in top bar.
	•	Log area with narrator text.
	•	Self-test results shown above log.
	•	Two buttons: Yes / No (or Restart at tidy ending).
	•	GPT integration via /v1/chat/completions.
	•	Offline fallback via offlineBeat().
	•	✅ Fixed bug: newline join in context (join("\\n")).

⸻

Design Notes (draw from inspirations like Dear Reader, A Dark Room, Device 6, Lifeline, WeCroak, iA Writer):
	•	Typography is the UI.
	•	Use one clean monospace or literary serif font.
	•	Log text looks like a chat thread, each entry separated by whitespace.
	•	No boxes unless essential — whitespace creates rhythm.
	•	Restraint = immersion.
	•	Max 1–2 sentences per narration.
	•	New lines “drop in” like a notification (Lifeline).
	•	Each new choice feels earned.
	•	Conversation-first layout.
	•	Screen = message log.
	•	Narrator lines aligned left, player choices shown as large buttons (thumb-friendly).
	•	Buttons minimal: color-coded (green=Yes, red=No), rounded, high contrast.
	•	Ambient feel.
	•	Log scrolls smoothly; auto-scroll to bottom.
	•	Optional small “…” pulsing indicator while GPT/engine “thinks.”
	•	Minimal chrome.
	•	Top bar only for seed + GPT toggle.
	•	Bottom bar only for Yes/No buttons.
	•	Light/dark themes, no ornamentation.
	•	Whitespace as drama.
	•	Each line gets space around it.
	•	Treat a single line of text as the entire “scene” (like WeCroak).
	•	Accessibility.
	•	Buttons focusable, keyboard navigable.
	•	Large enough tap targets.
	•	Narrator entries announced for screen readers.

⸻

Tests to Include
	•	Unit tests:
	•	hashStringToSeed deterministic.
	•	mulberry32 reproducible sequences.
	•	offlineBeat ends with (Y/N) or (Restart?).
	•	Integration test:
	•	App renders, shows Setup, switches to Offline mode, clicking Yes/No adds log entries.
	•	UI test:
	•	Narration text never exceeds 2 sentences.
	•	Buttons always visible.

⸻

After You Code
	•	Print file tree and all file contents.
	•	Confirm pnpm dev runs, tests pass, lint clean.
	•	Confirm design principles above are visible in App’s layout.
# Merged User Prompt

**Goal:** Import my existing prototype code (in `./context/`) and evolve it into a minimal, production‑ready React + TypeScript project I can run locally. Keep the UX identical (lean Y/N flow, Setup screen first, deterministic offline fallback), but evolve the design with **minimalist text‑first UI principles**.

---

## What to Build
- Vite + React + TypeScript app.
- Suggested file structure:
  ```
  /index.html
  /src/main.tsx
  /src/App.tsx             # main game logic (from prototype)
  /src/lib/rng.ts          # mulberry32, hashStringToSeed, pick
  /src/lib/gpt.ts          # generateWithGPT
  /src/lib/engine.ts       # generateWorld, offlineBeat, buildSystemPrompt
  /src/App.css             # or Tailwind config
  /src/__tests__/*.test.ts # vitest
  vitest.config.ts
  tsconfig.json
  .eslintrc.cjs
  .prettierrc
  .prettierignore
  .env.example
  .gitignore
  README.md
  LICENSE
  ```

---

## Prototype Source
- Current code is a **single React component** with:
  - Setup Screen (Step 1) → paste API key or choose Offline.
  - Seed input + “New World” in top bar.
  - Log area with narrator text.
  - Self‑test results shown above log.
  - Two buttons: Yes / No (or Restart at tidy ending).
  - GPT integration via `/v1/chat/completions`.
  - Offline fallback via `offlineBeat()`.
  - ✅ Fixed bug: newline join in context (`join("\n")`).

---

## Design Notes (inspired by Dear Reader, A Dark Room, Device 6, Lifeline, WeCroak, iA Writer)
- **Typography is the UI.** One clean monospace or literary serif font.
- **Chat‑style log**: narrator text left‑aligned, each entry separated by whitespace.
- **Restraint = immersion**: max 1–2 sentences per narration.
- **Notification feel**: new lines “drop in” like messages (Lifeline).
- **Conversation‑first layout**:
  - Screen = message log.
  - Player choices = large Yes/No buttons (green/red, rounded, high contrast).
- **Ambient feel**: smooth auto‑scroll; optional pulsing “…” during thinking.
- **Minimal chrome**:
  - Top bar only for seed + GPT toggle.
  - Bottom bar only for Yes/No buttons.
- **Whitespace as drama**: each line spaced generously; a single line can be a scene.
- **Accessibility**:
  - Buttons focusable, keyboard navigable, ARIA‑labeled.
  - Large tap targets.
  - Narrator entries announced for screen readers.

---

## Engineering / Architecture Expectations
- **Pure client‑side React/TS app**; no backend. Keys stored only in localStorage.
- Narration must **always end** with `(Y/N)` unless tidy ending `(Restart?)`.
- Extract **core utilities** into `/src/lib` and unit test them.
- **Testing** with Vitest + Testing Library.
- **Linting/formatting** with ESLint (strict) + Prettier.
- **Docker** dev/prod configs for consistency (optional but preferred).
- **Mobile‑first, responsive** design; PWA‑ready.

---

## Tests to Include
- **Unit tests:**
  - `hashStringToSeed` deterministic.
  - `mulberry32` reproducible sequences.
  - `offlineBeat` ends with `(Y/N)` or `(Restart?)`.
- **Integration test:**
  - App renders, shows Setup, switches to Offline mode, clicking Yes/No adds log entries.
- **UI/Accessibility tests:**
  - Narration never exceeds 2 sentences.
  - Buttons always visible and functional.
  - Focus states and ARIA roles validated.

---

## After You Code
- Print **file tree** and **all file contents**.
- Confirm `pnpm dev` runs, tests pass, lint is clean.
- Confirm the minimalist design principles above are visible in the App’s layout.