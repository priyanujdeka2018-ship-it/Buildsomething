# Decisions Log

Running log of architecture choices and tradeoffs, per `Repo structure.md`.
Newest entries first. Each entry: what was decided, why, and what it costs.

---

## 2026-07-19 — Job Sourcing Radar v1 (Artifact Edition) — build close-out

Built per `apps/job-sourcing-radar/docs/spec.md`, milestones 1–5 + this close-out.
App file: `apps/job-sourcing-radar/job-sourcing-radar.jsx` (single-file React artifact, ~1,300 lines).

### Decisions, why, and tradeoffs

1. **Artifact-in-Claude.ai over the Cloudflare stack.**
   Why: zero infrastructure, zero marginal cost — scans and storage ride the Claude
   plan; reuses the proven Career OS pattern verbatim.
   Tradeoff: nothing runs when the tab is closed — scheduled scans and digests are
   structurally impossible. The moment automation matters, migrate per the archived
   spec (`apps/job-sourcing-radar/docs/archive/cloudflare-spec.md`): prompts, weights,
   sources config, and the JSON contract port unchanged; `radar:*` keys map 1:1 to D1
   tables. Note: the repo contained no standalone Cloudflare spec at archive time —
   the archive file carries the portfolio-entry excerpt plus a provenance note.

2. **Two orchestrating API calls per scan (one per track), `max_tokens` 1000, compact top-12 JSON.**
   Why: 1000 tokens is the hard per-call output budget in artifacts; 12 roles with
   short strings fits it, and the per-track split maps naturally onto the search-cap
   split (8/4 default) via `max_uses` — the API stops searching at the cap.
   Tradeoff: no full-JD text, capped result density per scan. JD deep-analysis is
   explicitly v2 (handoff to JD Pattern Analyzer).

3. **Deterministic search-plan builder.**
   Queries are constructed mechanically from settings (track × source priority ×
   keyword cluster; Track A alternates company-targeted and portal-targeted queries;
   Track B is portal-only — no company list in v1 by design).
   Why: kills random searching; same settings → same plan, auditable in the prompt.
   Tradeoff: less model discretion — mitigated by letting it skip a planned query
   when earlier results already covered it.

4. **Client-side deterministic fit scoring; the model's estimate is kept only as `model_fit`.**
   Why: ranking must be auditable and editable — weights live in settings, and every
   card shows its breakdown line (`role 30/30 · … · −15 startup markers`), which is
   how a non-developer verifies the scorer. Deductions (startup markers −15,
   pure-tech −20, sub-manager −10) are the Track B stability filter, since Track B
   has no vetted company list.
   Tradeoff: heuristic scoring over extracted signals only (title keywords, comp
   number, shift flag) — it can misread an unusual title. The visible breakdown makes
   such misses spottable; weights/keywords are user-tunable without code.

5. **India-eligibility is enforced twice.**
   The Track B prompt instructs extraction-time drops (with a `dropped_ineligible`
   counter), and the parser re-drops anything not positively `india_eligible: true`
   before storage. The scan log shows the drop count, or explicitly "0 dropped —
   none encountered" (acceptance criterion 4's note-it clause).
   Tradeoff: conservative — a genuinely eligible role with unstated eligibility gets
   dropped. Accepted: false negatives are cheaper than pipeline pollution.

6. **Storage: three `radar:*` keys, whole-array writes, explicit `shared: false` everywhere.**
   Why: matches the storage API's batching guidance; personal scope is a hard privacy
   requirement (spec §8); a few hundred roles is a fraction of the 5MB value limit.
   Dedupe identity is `hash(company + normalized title)`; re-found roles bump
   `last_seen` only, so stars/archives survive every rescan.
   Tradeoff: a retitled posting creates a new row (accepted — no stable external IDs
   exist across job boards).

7. **Settings editor uses a draft + explicit Save with a sanitizer.**
   Why: for a non-developer, "nothing changes until you press Save" is the least
   surprising model; the sanitizer means a half-typed number can never break scans
   (invalid → spec default). Testing caught a real bug here: `Number("") === 0`, so a
   blanked field would have silently become zero — fixed so blank falls back to the
   default while an explicit 0 is honored.

8. **`allowed_domains` restriction ships default-OFF.**
   Why (spec §3): hard-restricting to the source list risks missing company career
   sites hosted on SuccessFactors/Eightfold domains. The toggle exists for when
   evidence says otherwise.

### Verification record

- esbuild clean at every milestone; zero occurrences of browser local/session
  storage APIs or form tags in the file (criterion 7's static half).
- 52 unit-style tests across milestones, all run against code extracted from the
  artifact file itself (not copies): dedupe identity/merge semantics (8), search
  plan + prompts + defensive parser + eligibility gate (17), scoring weights,
  floors, GCC band, deductions (13), settings sanitizer + criterion-6 flow-through
  (14). Test harnesses also live as comments beside the functions.
- **Open item — Milestone 6 (§10 live acceptance run) is user-driven and was not
  yet reported complete at close-out:** live scan quality, the ~2-minute timing,
  cross-device persistence, and criterion 4's "at least one US-only role dropped"
  can only be observed inside Claude.ai. The code-level halves of the criteria are
  covered by the tests above. If the live run surfaces failures, fixes append to
  this entry.

### v2 triggers (from spec §11)

Scheduled scans/digests → migrate to Cloudflare per archived spec. Also queued:
starred-role handoff into JD Pattern Analyzer, Tier 4 promotion from Track B
recurrence evidence, CSV export.
