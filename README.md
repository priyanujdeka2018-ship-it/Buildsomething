# Career OS

A single-file React artifact (`career-os.jsx`) that runs inside Claude.ai. It's a career-transition operating system — data ingestion, JD scoring, pipeline management, interview prep, and skill coaching — replacing a 9-project Claude setup by encoding the intelligence as API system prompts and offload prompts for free AI tools.

## Running it

This is a **Claude.ai artifact**, not a standalone web app. Paste `career-os.jsx` into a Claude.ai artifact (or open it as an artifact in a conversation). It relies on:

- `window.storage` for persistence (six `cos-*` keys) — available in the artifact runtime
- `fetch` to `api.anthropic.com` — works automatically inside Claude.ai (no API key)
- `react`, `lucide-react`, `recharts` — provided by the artifact runtime

The Claude API features (JD scoring, playbook, curriculum, auto-rescore) only run inside Claude.ai. Everything else — onboarding, pipeline, prompt generation, imports, charts — works anywhere the runtime provides `window.storage`.

## Zones

| Zone | What it does |
|------|--------------|
| **Onboard** | 7-step wizard → `cos-profile`, `cos-stars`, `cos-vocab`. OP-01/OP-02 voice prompts + `.md` import. |
| **Pipeline** | 7-column Kanban with fit/CTC/staleness cards, capacity-enforced moves, role drawer. |
| **Analyze** | Paste JD → AP-01 score card → AP-02 HTML playbook → Save to Pipeline → OP-06 Red Team. |
| **Prep** | Stories browser (OP-04 polish), BQ router, Mock (OP-03 + results import + score trend), Negotiate (OP-05). |
| **Skills** | Track cards → AP-04 curriculum, per-week OP-07/OP-08 practice, milestone complete → AP-05 rescore. |
| **Settings** | Name, data summary, `.md` import, JSON export, clear data. |

## Data & interchange

- **Data model:** six `window.storage` keys, all JSON. See the spec docs.
- **Interchange:** all import/export is `.md` tagged with `<!-- COS_IMPORT zone:N type:TYPE date:... -->`; the app auto-routes to the right parser.
- **Prompts:** API prompts (AP-01…AP-06) run in-app; offload prompts (OP-01…OP-09) are copied to free AI tools and their `.md` output imported back.

Built in batches; each batch is a self-contained commit that expands `career-os.jsx`.
