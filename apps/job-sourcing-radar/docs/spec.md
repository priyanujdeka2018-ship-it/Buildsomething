# Job Sourcing Radar — v1 Spec (Artifact Edition)

**Supersedes** the Cloudflare spec. Commit this as `apps/job-sourcing-radar/docs/spec.md`; move the old spec to `docs/archive/cloudflare-spec.md` — it is the v2 migration reference, not dead weight.
**How to initiate:** paste the Kickoff Build Brief (bottom) into Claude Code in the repo.

---

## 1. Purpose

On-demand scanner that finds open roles matching the user's criteria, extracts fit signals, ranks results, and stores them in a persistent pipeline. Runs as a **single-file React artifact inside Claude.ai** (the Career OS pattern) — scans and storage are covered by the Claude Pro plan; there is no separate API bill, no deploy, no infrastructure.

## 2. Criteria — two tracks

**Track A — financial services/GCC (India-anchored):**
- Remote or strong-hybrid, India-based
- Non-technical / non-coding roles
- Comp ₹40 LPA+ (accept 30–50L band at financial-services GCCs)
- Manager / Senior Manager / Director band
- Stable, WLB-first companies — no startup chaos
- Shift timing flagged: india_day / mixed / us_night

**Track B — remote-first enterprises (global, USD):**
- Fully remote, **India-eligible is a HARD GATE** — roles restricted to US/EU residency are dropped at extraction, never scored
- Non-technical ops/program/transformation roles
- Comp floor: settings value, default **$50K USD** (≈ the ₹40L line)
- Established companies only — startup-marker deductions are load-bearing here, since there is no pre-vetted company list doing that work
- Same seniority band; shift flagging matters more (expect more us_night — that's the flag working, not noise)

## 3. Targets & sources

**Track A companies** (config, not hardcode):
- Tier 1: Fidelity Investments India, Fidelity International, Northern Trust, State Street, BNY, Wells Fargo India
- Tier 2: Honeywell, Schneider Electric, Siemens, Cummins, Caterpillar, Emerson, ABB, Collins Aerospace
- Tier 3: SAP Labs India, Intuit India, Adobe India

**Track B**: portal-driven discovery, **no company list in v1**. Employers that recur with good roles earn promotion into a Tier 4 list later, from scan evidence — not before.

**Keyword clusters** (both tracks): operations manager/director · process excellence / lean six sigma · revenue operations · collections / receivables / order-to-cash · program manager · business transformation · client operations / implementation

**Sources config** — `{domain, label, track, priority, enabled}`:
| Source | Track | Priority |
|---|---|---|
| naukri.com | A | 1 |
| linkedin.com | A+B | 1 |
| iimjobs.com | A | 1 |
| myworkdayjobs.com | A | 1 |
| indeed.com | A | 2 |
| foundit.in | A | 2 |
| himalayas.app | B | 2 |
| weworkremotely.com | B | 2 |

Sources drive **deterministic search-plan construction** (queries built per track × source priority × keyword cluster — this is what kills random searching). Optional settings toggle passes enabled domains as `allowed_domains` on the search tool (subdomains auto-included) — **default OFF**: hard-restricting risks missing career sites on SuccessFactors/Eightfold.

## 4. Architecture

- **One artifact file:** `apps/job-sourcing-radar/job-sourcing-radar.jsx` — single-file React, default export, run inside Claude.ai. Repo remains source of truth; Claude.ai is the runtime.
- **Search engine:** the artifact calls the Anthropic Messages API directly (`https://api.anthropic.com/v1/messages`) — **no API key in the request; Claude.ai handles auth**, usage draws from the Pro plan. Web search via tool type `web_search_20250305` with `max_uses`.
- **Model:** `claude-sonnet-4-6` (the required model for artifact API calls), name kept in settings.
- **Storage:** `window.storage` (personal scope — every call passes `shared: false` explicitly). No localStorage/sessionStorage anywhere — those fail inside Claude.ai artifacts.
- **Why this stack:** zero infrastructure, zero marginal cost, and it reuses the proven Career OS pattern verbatim. *Alternative:* the archived Cloudflare architecture — deferred to v2, and required the moment scheduled scans matter (see §11).

**Hard artifact constraints (build against these, they are not preferences):**
- `max_tokens` is fixed at 1000 per API call → **one orchestrating call per track per scan** (two calls total), each returning **compact JSON, top-12 roles by fit** — this fits the output budget and splits the search cap naturally.
- Strict JSON output contract: system prompt instructs JSON only, no preamble/markdown; parser strips ```json fences defensively; every call wrapped in try/catch with visible error states.
- No `<form>` tags; standard onClick/onChange handlers.
- Tailwind core utility classes only; imports limited to the artifact-available set (lucide-react, recharts as in Career OS).

## 5. Data model (window.storage — 3 keys, batched by design)

- **`radar:roles`** — single array of role objects: id (hash of company + normalized title), track (A/B), company, title, url, source, location, remote_type, india_eligible (bool), comp_signal `{amount, currency}`, shift_signal, wlb_notes, fit_score, rationale, status (new/starred/archived), first_seen, last_seen
- **`radar:scans`** — array of `{id, timestamp, searches_used_a, searches_used_b, roles_found, roles_new}`
- **`radar:settings`** — one object: company tiers, keyword clusters, sources, scoring weights, comp floors per track, search-cap split, model name, allowed_domains toggle

One key per dataset, read once on load, written whole on mutation — matches storage API guidance (batch related data; avoid sequential per-record calls). At a few hundred roles this is a fraction of the 5MB value limit.

**Dedupe:** on scan, hash(company + normalized title); existing roles update `last_seen` only.

## 6. Fit scoring (0–100, weights in settings)

Role-family 30 · remote/hybrid flexibility 20 · seniority 15 · comp vs per-track floor 15 · shift timing 10 · WLB/stability 10. Deductions: startup markers (funding-stage language, tiny headcount, "wear many hats"), pure-tech requirements, sub-Manager seniority. Track B: india_eligible=false roles are **dropped before scoring**, and startup deductions are the primary stability filter.

## 7. Usage guardrails

- No dollar billing — scans consume **Claude Pro plan usage**. The guardrail target shifts from cost to quota and latency.
- Hard cap: **12 searches per scan total**, split in settings (default 8 Track A / 4 Track B), enforced via `max_uses` per call — the API returns `max_uses_exceeded` rather than searching past it.
- Manual-trigger only. Every scan logs per-track `searches_used`. Raise the cap only if scans come back thin — evidence first.

## 8. Privacy & access

- Auth is the Claude account itself — the artifact and its storage are reachable only from the user's logged-in Claude.ai session. No Access gate, no secrets, nothing to configure.
- `window.storage` personal scope only (`shared: false` on every call). Repo private. No analytics (inherently — no deploy surface exists).
- No API key exists anywhere in this architecture — the previous "key never in client code" criterion is satisfied structurally.

## 9. v1 scope

**In:** manual Scan (both tracks) · deterministic source-driven search plan · capped search via `max_uses` · structured extraction (all §5 fields) · india_eligible hard gate · fit scoring + ranked list with track/source/shift badges · star/archive with persistence · scan log · settings editable in-app (no code changes) · loading states + progressive render + error states.
**Out (v2+):** scheduled scans, digests, JD full-text analysis, Tier 4 auto-promotion, per-company adapters, CSV export.

## 10. Acceptance criteria — "done" means all pass

1. One Scan click runs both track calls and renders a ranked list within ~2 minutes.
2. Second scan immediately after: **zero duplicate rows**; re-found roles update `last_seen` only.
3. Starred roles persist across refresh and across devices (same Claude account).
4. Every Track B result shows india_eligible = true; at least one US-only role was dropped (visible in scan rationale/log if none found, note it).
5. Scan log shows searches_used_a ≤ 8 and searches_used_b ≤ 4 (or current settings values).
6. Settings edits (e.g., comp floor, cap split) take effect on the next scan without touching code.
7. Zero occurrences of `localStorage`/`sessionStorage` in the file; every storage call passes explicit `shared: false`; API/storage failures show a readable error state, not a blank screen.

## 11. v2 migration marker

Scheduled scans + email digests are **impossible in an artifact** (nothing runs when the tab is closed). The moment automation matters, migrate to the archived Cloudflare spec: the scan orchestration prompt, scoring weights, sources config, and JSON contract all port unchanged; storage moves `radar:*` keys into D1 tables 1:1. Also v2: starred-role handoff into JD Pattern Analyzer; Tier 4 promotion from Track B evidence.

## 12. Build plan (Claude Code milestones — pause for user verification after each)

1. Scaffold `job-sourcing-radar.jsx`: layout zones (Scan / Pipeline / Log / Settings), default settings object per §3+§6+§7, storage load/save layer with try/catch, loading and empty states. Follow Career OS file conventions on the branch.
2. Roles CRUD with stub data: list render, track/shift/source badges, star/archive, dedupe function + unit-style test harness in comments → verify UI in claude.ai.
3. Scan orchestration: two Messages API calls (Track A / Track B) with `web_search_20250305` + `max_uses` from settings, deterministic search-plan builder from sources config, strict compact-JSON top-12 contract, defensive parsing, merge + dedupe into `radar:roles`.
4. Scoring + india_eligible hard gate + per-track comp floors; scan log writes.
5. Settings editor UI (tiers, keywords, sources, weights, floors, cap split) persisting to `radar:settings`.
6. Full verification: user loads artifact in Claude.ai, runs §10 checklist on laptop + phone.
7. Close: dated `docs/decisions.md` entry (decisions, why, tradeoffs), commit, push.

---

## Kickoff Build Brief — paste into Claude Code

> Read `apps/job-sourcing-radar/docs/spec.md` and build v1 exactly per its scope. Target is a single-file React artifact `apps/job-sourcing-radar/job-sourcing-radar.jsx` that runs inside Claude.ai — mirror the conventions of `career-os.jsx` on this branch. Hard constraints from the spec §4: Anthropic API calls with NO api key, model `claude-sonnet-4-6`, `max_tokens` 1000, one call per track per scan, web search tool `web_search_20250305` with `max_uses` from settings, compact JSON top-12 output contract with defensive parsing; storage via `window.storage` only with explicit `shared: false` — any use of localStorage or sessionStorage is a build failure; no `<form>` tags; Tailwind core utilities only. Two-track criteria per §2 with india_eligible as a hard drop-gate on Track B. Work milestones in order, pausing after each for my verification; I am a non-developer — keep code plain and commented, reasoning visible, and finish with a dated `docs/decisions.md` entry, then commit and push.
