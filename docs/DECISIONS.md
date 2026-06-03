# Trace — Phase 0 decisions

Locked during Phase 0 for downstream phases.

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Claim granularity | **Proposition-level** | One atomic, checkable statement per claim; spans may be phrases or sentences. |
| 2 | Calibration unit | **Per claim** | Matches product spec (predict per claim, then reveal). |
| 3 | Calibration feedback | **Explicit `recommendedAction`** on each claim | Stable mock feedback; rules can be added in Phase 5+. |
| 4 | Signal panel (Phase 3) | **Persistent sidebar** | Keeps five signals visible while scanning claims. |
| 5 | Target environment | **Local dev + deployable** | Next.js defaults; env pattern in `.env.example`. |
| 6 | Chat UI visual parity | **ChatGPT-like (dark)** | Left sidebar, banded messages, pill composer; Trace eval panel on the right. |

## Stack (Option A)

- **UI:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + CSS design tokens
- **State (later):** React context + hooks
- **API (later):** Next.js route handlers
