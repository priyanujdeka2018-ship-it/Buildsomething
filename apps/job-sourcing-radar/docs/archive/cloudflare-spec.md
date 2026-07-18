# Job Sourcing Radar — Cloudflare Spec (ARCHIVED — v2 migration reference)

> **Status:** superseded by `../spec.md` (Artifact Edition, v1). Kept as the v2 migration
> reference per spec §11: when scheduled scans / digests matter, the scan orchestration
> prompt, scoring weights, sources config, and JSON contract port unchanged; storage moves
> the `radar:*` keys into D1 tables 1:1.
>
> **Provenance note (archival honesty):** at archive time, the repo did not contain a
> standalone Cloudflare spec document for this app. The only committed Cloudflare-era
> specification was the portfolio entry in `docs/Repo structure.md` §1, reproduced verbatim
> below. If the fuller Cloudflare spec exists in the Claude.ai project, paste it here to
> replace this excerpt.

---

## Portfolio entry (from `docs/Repo structure.md`, §1 — verbatim)

### 1. Job Sourcing Radar
**Purpose:** On-demand scan of target-company career pages and job boards for roles matching your criteria (remote, stable, non-startup, non-technical, ~40 LPA+). Deduplicates, ranks by fit, feeds the pipeline tracker.
**Tool:** Start as a repo-hosted web app (static frontend + serverless function) on Cloudflare Pages + Workers (free, has built-in cron for later automation). *Alternative:* Netlify + scheduled functions.
**v1:** Manual "Scan" trigger; pre-loaded target companies + role keyword clusters; serverless function runs the searches; results ranked and saved; star roles to a pipeline list.
**Later:** scheduled daily scan via Workers Cron; email/WhatsApp digest; auto-handoff of starred roles into the JD Analyzer.

---

## What ports to v2 (per Artifact Edition spec §11)

- Scan orchestration prompt → Worker-side Messages API call (API key moves server-side)
- Scoring weights + sources config → unchanged
- Compact-JSON output contract → unchanged
- `radar:roles` / `radar:scans` / `radar:settings` → D1 tables, 1:1
- Adds: Workers Cron scheduled scans, email/WhatsApp digest, Access gate
