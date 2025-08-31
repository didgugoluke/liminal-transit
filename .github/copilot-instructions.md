# NOVELI.SH - AI Native Interactive Storytelling Platform

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Project Overview

AI Native interactive storytelling platform with **100% AI-driven development and content generation**. Features **autonomous GitHub Copilot orchestration**, self-optimizing architecture, and **zero human scaffolding**. Built on the **AWS Well-Architected Framework** for enterprise-grade compliance "by design" with automated governance, security, reliability, performance, cost optimization, and sustainability.

The platform begins in a **liminal transit space** (bus/train/queue) that launches completely AI-generated branching storylines. **No hardcoded story elements, business rules, or fallback systems**. All development tasks, from feature implementation to story generation, are handled by AI agents while humans focus on strategic direction.

### AI Native Capabilities

- **Autonomous Development**: GitHub Copilot Workspace handles feature implementation, testing, and deployment
- **Self-Generating Stories**: AI agents create narrative content from themes without human writing
- **Intelligent Orchestration**: Automated project management, bug fixes, and performance optimization
- **Continuous Learning**: AI agents improve based on user engagement and feedback metrics
- **Strategic Human Role**: HITM focuses on vision, themes, and high-value creative decisions
- **Enterprise Compliance**: Automated adherence to all regulatory frameworks with zero overhead

---

## Development Philosophy

- **AI Native Architecture**: GitHub Copilot agents handle entire development lifecycle
- **AWS Well-Architected Foundation**: All decisions align with six pillars (operational excellence, security, reliability, performance efficiency, cost optimization, sustainability)
- **Enterprise Compliance by Design**: Automated adherence to SOC 2, ISO 27001, GDPR, PCI DSS with zero human overhead
- **Zero Human Scaffolding**: Autonomous bootstrapping, debugging, and maintenance
- **Self-Optimizing Systems**: Real-time performance tuning and architectural improvements
- **Bulletproof Code**: strict TypeScript, comprehensive testing, automated quality gates
- **Maximum Modularity**: single responsibility, pure functions, dependency injection
- **Automation First**: CI/CD pipelines, lint/test/format on commit, autonomous deployment
- **Pure AI Architecture**: 100% AI-driven narrative and development, no hardcoded elements
- **Fast Local Dev**: hot reload, dev containers, automated environment setup
- **Clean Architecture**: domain-driven separation with AI-first design patterns
- **Mobile-First**: responsive, thumb-friendly, PWA ready with AI-optimized performance
- **Production Ready**: Docker containers, monitoring, error boundaries, self-healing systems

---

## UX / Design Inspirations

- **Dear Reader** — typographic clarity; text is the surface.
- **A Dark Room** — sparse beginnings, incremental reveal.
- **Device 6** — layout/orientation as story device.
- **Lifeline** — real-time cadence, chat feel.
- **WeCroak** — radical simplicity: one line can be a scene.
- **iA Writer** — focus mode, chrome-free.
- **Twine/Choice games** — binary decisions carry weight.

### Design Principles

- **Typography is the UI** — whitespace, rhythm, weight > chrome.
- **Restraint builds immersion** — 1–2 sentences max.
- **Conversation-first** — log like a chat, Yes/No as large buttons.
- **Whitespace as drama** — each line spaced with intent.
- **Ambient feel** — smooth auto-scroll, optional pulsing “…” while thinking.
- **Minimal palette** — light/dark themes, sparing highlights.
- **Inclusive by default** — diverse characters without fanfare.
- **Accessibility** — ARIA roles, keyboard/touch nav, screen reader support.

---

## Tech Stack

- **Frontend**: Vite + React + TypeScript (+ Tailwind optional)
- **Testing**: Vitest + @testing-library/react
- **Linting**: ESLint (strict) + Prettier
- **Package Manager**: pnpm (fallback npm)
- **Containerization**: Docker + nginx prod

---

## Architecture

- **Domain Layer**: AI narrative generation, story context (pure)
- **Application Layer**: prompt orchestration, AI integration
- **Infrastructure Layer**: AI services, session storage
- **Presentation Layer**: components, hooks, layout

### Core Functions

- `buildContextualPrompt(history, seed)` — dynamic prompt construction with AI optimization
- `generateNarrative(prompt, context)` — AI story generation with provider failover
- `manageStoryContext(choices, narrative)` — intelligent context tracking and optimization
- `seedStoryStart(seedStr)` — consistent story beginnings with AI variation
- `orchestrateAIAgents(task, context)` — coordinate AI agents for autonomous development
- `optimizePerformance(metrics, context)` — self-tuning system optimization
- `generateFeature(requirements, codebase)` — autonomous feature implementation
- `manageInfrastructure(usage, costs)` — self-optimizing AWS resource management
- `enforceCompliance(policies, audit)` — automated governance and regulatory adherence
- `monitorWellArchitected(pillars, metrics)` — continuous Well-Architected Framework validation
- `superviseAgentNetwork(agents, health)` — MetaAgent monitoring and intervention system
- `detectInfiniteLoops(patterns, behavior)` — real-time infinite loop detection and prevention
- `orchestrateRecovery(failure, strategy)` — automated agent recovery and restart procedures
- `predictiveIntervention(metrics, trends)` — proactive issue prevention and optimization

---

## File Structure

```
src/
  main.tsx
  App.tsx
  components/
    ui/
    story/ (StoryInterface, NarrativeDisplay, ChoiceButtons, StorySave)
    auth/ (LoginForm, UserProfile, AuthGuard)
  hooks/
  lib/ (ai-engine.ts, prompt-builder.ts, context-manager.ts, constants.ts, api-client.ts)
  types/
  styles/
  __tests__/
public/
docker/
docs/
infrastructure/
  terraform/
  lambda/
  api-gateway/
.github/
scripts/
```

---

## Development Guidelines

- **AI-First Development**: All features begin with AI agent analysis and implementation
- **Agent Template**: Use `docs/AGENT-TEMPLATE-GOLD-STANDARD.md` for all new GitHub Actions agents
- **Code Quality**: strict TS, ESLint, Prettier, no `any`, comprehensive testing
- **Autonomous Testing**: AI-generated unit, integration, E2E, and accessibility tests
- **Self-Documenting**: AI-generated documentation, JSDoc, and architectural diagrams
- **Components**: functional, typed props, error boundaries, lazy load non-core
- **State Management**: hooks for local, Context for global, session storage, URL seeds
- **Performance**: AI-optimized bundle analysis, code-splitting, memoization
- **Security**: AI-monitored safe errors, automated dependency audits, zero hardcoded content
- **GitHub Integration**: Projects for story management, Actions for AI workflows, Discussions for collaboration
- **Infrastructure**: Terraform modules, GitHub Actions CI/CD, AWS native services
- **Monitoring**: CloudWatch metrics, AI performance tracking, automated optimization
- **TERMINAL SAFETY**: NEVER end git commit messages, gh issue comments, or any shell commands with exclamation marks or special characters that break terminal execution. Always use periods or no punctuation.
- **CONTENT POLICY**: Zero emojis in all user-facing content, narrative text, UI labels, dialogue, or system messages. Use icon libraries for visual elements. Exception: developer logs and build scripts only.

---

## Deployment

- Dev: Docker Compose, hot reload.
- Prod: static hosting + CDN via nginx.
- PWA: offline capable.

---

## Working Effectively

- Bootstrap and setup the repository:
  - `npm install -g pnpm` -- installs the required package manager (1 second)
  - `pnpm install` -- installs all dependencies. Takes 35 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
  - Fix ESLint configuration if needed: The .eslintrc.json should use `"plugin:@typescript-eslint/recommended"` not `"@typescript-eslint/recommended"`

- Build and test the repository:
  - `pnpm build` -- builds the project. Takes 4 seconds. NEVER CANCEL. Set timeout to 15+ minutes.
  - `pnpm typecheck` -- TypeScript type checking. Takes 2 seconds. NEVER CANCEL. Set timeout to 10+ minutes.
  - `pnpm test:run` -- runs all unit tests with Vitest. Takes 2 seconds. NEVER CANCEL. Set timeout to 10+ minutes.

- Run the development environment:
  - ALWAYS run the bootstrapping steps first
  - `pnpm dev` -- starts Vite development server on http://localhost:5173. Takes 200ms to start. NEVER CANCEL.
  - The application loads successfully and displays the NOVELI.SH interactive storytelling interface
  - Counter functionality works correctly (click to increment)

- Code quality and formatting:
  - `pnpm lint` -- runs ESLint. Takes 2 seconds. May show some lint errors which is normal. NEVER CANCEL. Set timeout to 10+ minutes.
  - `pnpm format:check` -- checks Prettier formatting. Takes 1 second. May show format issues which is normal. NEVER CANCEL. Set timeout to 5+ minutes.
  - `pnpm lint:fix` -- automatically fixes ESLint issues where possible
  - `pnpm format` -- automatically formats code with Prettier

## Validation

- ALWAYS manually validate any new code by running the development server and testing functionality
- ALWAYS run through at least one complete end-to-end scenario after making changes:
  1. Start the dev server with `pnpm dev`
  2. Navigate to http://localhost:5173
  3. Verify the application loads with "NOVELI.SH" title
  4. Test the counter button functionality (should increment when clicked)
  5. Verify hot reload works by making a small change to src/App.tsx
- You can build and run the application successfully for testing
- ALWAYS run `pnpm typecheck`, `pnpm lint`, and `pnpm test:run` before you are done or the CI (.github/workflows/ci-cd.yml) will fail
- The build produces a dist/ directory with optimized assets for production

## Common Tasks

The following are outputs from frequently run commands. Reference them instead of viewing, searching, or running bash commands to save time.

### Repository root
```
.env.development
.eslintrc.json
.git/
.github/
.gitignore
.vscode/
DEBUG-STATUS.md
MILESTONE.md
PROJECT-TOKEN-AND-DOCS-SUMMARY.md
README.md
VITE-BUILD-INTEGRATION.md
context/
docs/
index.html
noveli-ai-observatory.code-workspace
observatory/
package.json
scripts/
src/
task_handlers.sh
tsconfig.json
tsconfig.node.json
vite.config.ts
```

### package.json scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

### src/ directory structure
```
src/
├── App.css
├── App.tsx
├── __tests__/
│   ├── build-tooling.test.ts
│   └── unit/
│       └── foundation.test.ts
├── config/
├── copilot-hello/
├── database/
├── hello/
├── index.css
├── lib/
├── main.tsx
├── types/
└── utils/
```

### Technology stack
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Testing**: Vitest (unit tests) + Playwright (e2e tests)
- **Package Manager**: pnpm (required, not npm)
- **Build Tool**: Vite with TypeScript compilation
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **AI Integration**: AWS SDK, Anthropic, OpenAI packages included

### Common Issues and Solutions

1. **ESLint config error**: If you see "ESLint couldn't find the config @typescript-eslint/recommended", ensure .eslintrc.json uses `"plugin:@typescript-eslint/recommended"` (with "plugin:" prefix)

2. **pnpm not found**: Run `npm install -g pnpm` first before any other commands

3. **TypeScript errors**: Always run `pnpm typecheck` to verify TypeScript compilation before building

4. **Playwright browser install**: `npx playwright install` may fail due to network issues but this doesn't affect core development

5. **Development server not starting**: Ensure port 5173 is available, or Vite will automatically use the next available port

### GitHub Actions Integration
- The repository has comprehensive GitHub Actions workflows in `.github/workflows/`
- CI/CD pipeline runs TypeScript checking, linting, testing, and building
- Always ensure local validation passes before pushing to avoid CI failures
- The AI Native development approach uses 11 specialized agent workflows for automation

### AI Native Development Context
- This is an AI Native Interactive Storytelling Platform with 100% AI-driven development
- Features autonomous GitHub Copilot orchestration and AWS Well-Architected Framework
- The platform generates interactive narratives using AI providers (AWS Bedrock, OpenAI, Anthropic)
- Built for enterprise-grade compliance with zero human scaffolding
- Uses React for the frontend with AI-powered story generation backend services
