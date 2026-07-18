# Job Sourcing Radar

On-demand two-track job scanner that runs as a **single-file React artifact inside Claude.ai**
(the Career OS pattern). Finds open roles matching your criteria, extracts fit signals,
ranks them, and stores a persistent pipeline in `window.storage`.

- **Spec:** `docs/spec.md` (v1, Artifact Edition — the source of truth)
- **Archived:** `docs/archive/cloudflare-spec.md` (v2 migration reference)
- **App file:** `job-sourcing-radar.jsx` — paste/load as an artifact in Claude.ai to run

## Status

| Milestone | State |
|---|---|
| 1. App shell: zones, default settings, storage layer, empty/error states | ✅ built |
| 2. Roles list + star/archive + dedupe (stub data) | ✅ built |
| 3. Scan engine (2 API calls, web search, capped) | ⏳ next |
| 4. Scoring + india_eligible gate + scan log | — |
| 5. Settings editor | — |
| 6. Full acceptance run (spec §10) | — |
| 7. decisions.md close-out | — |

## Hard constraints (do not violate — spec §4)

No API key anywhere · model `claude-sonnet-4-6` · `max_tokens` 1000 · two calls per scan ·
`window.storage` with explicit `shared: false` · **never** localStorage/sessionStorage ·
no `<form>` tags · Tailwind core utilities only.
