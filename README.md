# Career OS

Your career-transition command center — data, scoring, pipeline, interview prep, and skill coaching in one app.

## What this is

Career OS is a single-file React artifact (`career-os.jsx`) that runs inside Claude.ai. It replaces a sprawling 9-project Claude setup by encoding the intelligence as in-app Claude API prompts plus copy-paste "offload" prompts for free AI tools. All your data stays private — stored locally in the artifact, never on a server.

## Quick start

1. **Open** `career-os.jsx` as an artifact in Claude.ai.
2. **Tap "Get Started"** on the welcome card → land on the Onboard zone.
3. **Voice-onboard your career** — copy the OP-01 prompt, talk through your career with Gemini Voice (~20 min), then paste the result back via **Import .md**.
4. **Build your STAR stories** — use the OP-02 prompt the same way.
5. **Score your first JD** — go to **Analyze**, paste a job description, and tap **Score** for a fit score, then **Generate Playbook**.

You don't have to use voice — every step also has manual forms.

## Zones

- **Onboard** — A 7-step wizard for your career profile and STAR stories.
- **Pipeline** — A Kanban board tracking roles from Watch → Active → Interview → Complete.
- **Analyze** — Paste a JD, get a 10-dimension fit score, generate a full HTML playbook, and red-team it.
- **Prep** — Story browser, BQ-question router, mock-interview practice with a score trend, and negotiation drills.
- **Skills** — Skill tracks with auto-built curricula, practice exercises, and milestone tracking that rescores your roles.
- **Settings** — Import/export your data, set your name, and review what's stored.

## AI tools you'll use

| Tool | What for | Free? |
|------|----------|-------|
| **Gemini Voice** | Career onboarding (OP-01) + STAR stories (OP-02) | Yes |
| **ChatGPT** | Mock interviews (OP-03), answer polish (OP-04), negotiation (OP-05), red-team (OP-06), practice/exams (OP-07/08) | Yes (free tier) |
| **Claude API** | JD scoring, playbooks, curricula, auto-rescore | Built in — runs automatically inside Claude.ai, no key needed |

The flow: the app generates a prompt → you run it in the free tool → you paste the tool's `.md` output back into the app via **Import .md**. The app auto-detects the format and routes it to the right place.

> The Claude-API features (scoring, playbook, curriculum, rescore) only run **inside Claude.ai**. Everything else works regardless.

## Prompt kit

Reusable, copy-paste prompt templates live in [`docs/prompt-kit/`](docs/prompt-kit/):

| File | Use |
|------|-----|
| `ONBOARDING_VOICE_PROMPT.md` | OP-01 — conversational career-data intake (Gemini Voice) |
| `STAR_STORY_INTERVIEW_PROMPT.md` | OP-02 — build STAR stories by voice |
| `MOCK_INTERVIEW_PROMPT_TEMPLATE.md` | OP-03 — run a behavioral mock interview |
| `ANSWER_POLISH_PROMPT_TEMPLATE.md` | OP-04 — tighten a single answer |
| `RED_TEAM_PROMPT_TEMPLATE.md` | OP-06 — adversarial review of a playbook/resume |
| `PRACTICE_EXERCISE_PROMPT_TEMPLATE.md` | OP-07/08 — skill exercises and mock exams |
| `MD_FORMAT_GUIDE.md` | The `.md` interchange format every tool outputs |
| `COMPANION_PROJECT_SETUP.md` | Optional Claude project for deep multi-turn work (long mocks, resume iteration) |

## Your data

- **Where it lives:** six `window.storage` keys — `cos-profile`, `cos-stars`, `cos-pipeline`, `cos-skills`, `cos-vocab`, `cos-settings`. All local to the artifact.
- **Export / backup:** Settings → *Export all data as JSON*.
- **Import:** the **Import .md** button (top-right or per-zone) accepts any `.md` tagged with a `COS_IMPORT` header.
- **Reset:** Settings → *Clear all data* (export a backup first — this is irreversible).
