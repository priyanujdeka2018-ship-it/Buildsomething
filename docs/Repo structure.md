# Build Studio — Repo Structure & App Portfolio

This document defines how the repo is organised and what each app does. It lives **in the repo**, not in project knowledge, so Claude Code reads it locally at zero cost to your Claude.ai context.

---

## Repo layout

```
build-studio/
├── README.md                 # what this repo is, how to run things
├── docs/
│   ├── portfolio.md          # this file — app specs
│   └── decisions.md          # running log of architecture choices + tradeoffs
├── apps/
│   ├── job-sourcing-radar/
│   │   ├── README.md         # purpose, stack, how to run/deploy
│   │   └── (code)
│   ├── jd-pattern-analyzer/
│   ├── interview-prep-engine/
│   ├── skill-tracker/
│   └── venture-dashboard/
└── shared/                   # reusable bits across apps (optional, later)
```

**The pattern:** each app is self-contained under `apps/`. Each has its own `README.md` (purpose, stack, run/deploy steps). When you work on one app, Claude Code reads only that app's folder — chat context stays lean. `docs/decisions.md` is the audit trail of *why* things were built a certain way; since you can't read the code, this is how you verify the reasoning.

---

## Workflow (repo-connected)

1. Plan in the Claude.ai project (lean, gated).
2. On "build", switch to Claude Code on the laptop.
3. Claude Code edits files in the relevant `apps/` folder, commits, pushes.
4. The connected host (Cloudflare Pages / Netlify / Vercel) auto-deploys on push.
5. Hit a snag → bring the specific file/error back to the Claude.ai project.

---

## App Portfolio

Each spec lists: **purpose · recommended tool (+ alternative) · v1 scope · later.** Tool choices are starting recommendations; the assistant confirms or revises per task at build time.

### 1. Job Sourcing Radar
**Purpose:** On-demand scan of target-company career pages and job boards for roles matching your criteria (remote, stable, non-startup, non-technical, ~40 LPA+). Deduplicates, ranks by fit, feeds the pipeline tracker.
**Tool:** Start as a repo-hosted web app (static frontend + serverless function) on Cloudflare Pages + Workers (free, has built-in cron for later automation). *Alternative:* Netlify + scheduled functions.
**v1:** Manual "Scan" trigger; pre-loaded target companies + role keyword clusters; serverless function runs the searches; results ranked and saved; star roles to a pipeline list.
**Later:** scheduled daily scan via Workers Cron; email/WhatsApp digest; auto-handoff of starred roles into the JD Analyzer.

### 2. JD Pattern Analyzer
**Purpose:** Paste a job description → structured breakdown (required skills, hidden signals, comp range, team-size/WLB signals), fit score vs. your profile, and a positioning suggestion. Accumulates a corpus so cross-JD patterns emerge.
**Tool:** Web app + Anthropic API call from the serverless backend (keeps the API key off the client). Store analyzed JDs in a free DB (Cloudflare D1 or Supabase). *Alternative:* Supabase + edge functions.
**v1:** Single JD in → structured analysis + fit score + positioning line out; every JD stored.
**Later:** cross-corpus pattern reports; interview-question predictor from JD language; feeds Interview Prep Engine.

### 3. Interview Prep Engine
**Purpose:** Given a saved role, generate STAR stories mapped to your real Sobha/collections experience, predicted questions with answer outlines, and a demo-prototype concept to show in interviews.
**Tool:** Web app reading from the JD Analyzer's DB + Anthropic API. *Alternative:* same stack, standalone.
**v1:** Pick a saved JD → 5 STAR stories + 10 predicted questions with outlines.
**Later:** mock-interview mode; auto-generated demo prototypes.

### 4. Skill Milestone Tracker
**Purpose:** Upskilling dashboard derived from JD gap analysis — skills, milestones, progress, mini-projects to demonstrate each.
**Tool:** Repo-hosted frontend + the shared DB. *Alternative:* lightweight client-only app if no cross-device sync needed.
**v1:** Manual skill + milestone entry, progress visualisation.
**Later:** auto-populate gaps from JD Analyzer; link mini-projects to Interview Prep.

### 5. Venture Dashboard
**Purpose:** One view of side ventures — Boo-kery pipeline, tutoring sessions, freelance projects — tracked against your income goal.
**Tool:** Frontend + shared DB; optional Google Sheets pull via MCP if you already track there. *Alternative:* Sheets-as-backend to start.
**v1:** Manual entry, revenue tracking, goal-progress visualisation.
**Later:** Sheets/Calendar integration; trend charts.

### 6. Hobby / Life Tools
Cricket scorekeeping, tennis session logger, house-construction progress, nutrition log. Fast builds reusing the established patterns — pick up as desired.

---

## Sequencing
Build in order 1 → 2 → 3, because each feeds the next (Radar finds roles → Analyzer decodes them → Prep Engine uses the patterns). 4 and 5 slot in once the shared DB exists. 6 is opportunistic.
