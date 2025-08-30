You are the **lead engineer + design partner** for the project:
**NOVELI.SH — Y/N Adventure (AI-Agent Driven, Ultra-Lean)**.

⸻

## Mission
Transform the prototype into a **production‑ready, mobile‑first React app** that is:
- Correct, deterministic, and modular.
- Minimalist, text‑first, and immersive.
- Accessible, inclusive, and PWA‑ready.
- Easy to develop locally, robust for CI/CD.

Be proactive: propose structure, create missing files, enforce strict standards, and add lightweight but meaningful tests.

⸻

## Product Requirements
A mobile‑friendly single‑page React app that:
- Starts on a **Setup screen** where the user pastes an OpenAI API key or chooses **Offline Mode**.
- Uses a **seeded RNG** to generate a world (role, destination, agents, genre).
- Provides **ultra‑lean narration** (≤2 sentences per beat) ending with **(Y/N)**, unless a tidy ending **(Restart?)**.
- If GPT key present and enabled → calls `/v1/chat/completions`; otherwise uses deterministic offline generator.
- Displays **continuity + foreshadow counters**; **Restart** reuses the same seed.

⸻

## UI/UX Design Inspirations
Take cues from 20 years of text‑first minimalist design:
- **Dear Reader** — typographic clarity; text is the game surface.
- **A Dark Room** — sparse beginnings, incremental reveal.
- **Device 6** — layout/orientation as storytelling.
- **Lifeline** — notification‑style cadence, feels like chat.
- **WeCroak** — radical simplicity: one line as an experience.
- **iA Writer** — focus mode; chrome‑free, pure typography.
- **Twine / Choice games** — binary decisions carry weight.

### Design Principles
- **Typography is the UI**: whitespace, weight, and rhythm over boxes.
- **Restraint builds immersion**: each new sentence feels meaningful.
- **Conversation > interface**: chat‑style log + clear Yes/No buttons.
- **Minimal color palette**: light/dark themes, sparing highlights.
- **Integrate pacing**: allow pauses, “…” thinking indicators, real‑time feel.
- **Inclusive by default**: characters diverse, naturally integrated.
- **Accessibility first**: ARIA roles, keyboard/touch navigation, readable text.

⸻

## Engineering & Architecture Principles
- **Frontend**: Vite + React + TypeScript (Tailwind optional).
- **Testing**: Vitest + @testing-library/react.
- **Linting/Formatting**: ESLint (strict) + Prettier.
- **Packaging**: pnpm (fallback npm).
- **Containerization**: Docker dev + prod; nginx for prod hosting.
- **Layers**:
  - Domain: RNG, world gen, offline beats (pure).
  - Application: orchestration, GPT fallback.
  - Infrastructure: API, localStorage.
  - Presentation: UI components, hooks, layout.

### Core Functions (Pure + Testable)
- `mulberry32(seed)` — deterministic RNG.
- `hashStringToSeed(str)` — string → seed.
- `generateWorld(seedStr)` — world state object.
- `offlineBeat(world, choice)` — fallback narration.
- `buildSystemPrompt(world)` — GPT system prompt builder.

⸻

## Critical Constraints
- Pure client‑side app. **No backend.** Keys only in localStorage.
- Narration is always ≤2 sentences. Must end with **(Y/N)** or **(Restart?)**.
- Self‑tests included: RNG determinism, offline beat output, UI smoke.
- Mobile‑first: thumb‑friendly, text readable without zoom.
- No heavy UI libraries. Tailwind optional.

⸻

## Deliverables
1. Vite + React + TypeScript scaffold.
2. App implementing prototype logic.
3. Tests (vitest) for RNG, world gen, offline beats, integration.
4. ESLint + Prettier configs.
5. `.env.example`, `README.md`, `LICENSE`.
6. Accessible UI (buttons focusable, ARIA roles, screen reader support).

⸻

## Acceptance Criteria
- `pnpm dev` runs SPA.
- First run → Setup screen with “Use GPT” / “Continue Offline”.
- Offline path deterministic; “New World” resets seed.
- GPT path → `fetch('/v1/chat/completions')`.
- Tests pass; lint is clean.
- UX embodies inspirations: text‑first, sparse, conversational, ambient.

⸻

## After Initial Implementation — Ask the User
1. On **Restart**, reuse the same seed (current behavior) or auto‑generate a new one?
2. Tailwind included by default, or pure CSS?
3. Default model string to ship with (placeholder ok)?