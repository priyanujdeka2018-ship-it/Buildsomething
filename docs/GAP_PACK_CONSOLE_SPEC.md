# CAREER OS — GAP PACK + INTERVIEW CONSOLE SPEC v1.0

Implements two per-role artifact generators (Batch 9: Gap Pack, Batch 10: Interview Console)
inside `career-os.jsx`, translated from the legacy P-system rules:

| Repo source (commit to `docs/features/`) | Governs |
|---|---|
| `GAP_CLOSURE_RULES_V1.txt` | Gap Pack content rules |
| `GAP_PACK_TEMPLATE.html` | Gap Pack shell (fill, never restructure) |
| `INTERVIEW_CONSOLE_RULES_V1.txt` | Console content rules |
| `CONSOLE_SHELL.html` | Console shell (fill, never restructure) |

---

## 1. P-system → app translation

| Legacy | In-app equivalent |
|---|---|
| P5 trigger (interview-readiness) | User taps "Build Gap Pack" (role drawer) / "Build Console" (Prep → Console tab). No auto-build. |
| Playbook (P0) → round structure, say/don't-say, gaps | Stored score data on the role card (`gaps`, `dimensionScores`, `whatItIs`, `reframeStrategy`). Playbook HTML is not persisted — deviation accepted, same content source. |
| STAR_STORY_BANK (P1) | `cos-stars` by `storyId` |
| Vocab / reframe table (P1) | `cos-vocab.mandatoryReframes` |
| P4 gap-closure status → posture | Derived from linked `cos-skills` tracks at build time; user can override per gap in the build modal. Absent → **open** (R2). |
| Request/return handoff manifests | Not needed — same process; the manifest block in each template is filled with build metadata. |

## 2. Architecture decisions (rationale, one line each)

1. **API returns structured JSON; the app assembles HTML client-side.** The templates are slot/exemplar-row based, so code-side assembly enforces "fill, never restructure" deterministically instead of trusting the model to reproduce 12–26 KB of HTML verbatim. (Alternative rejected: single-call raw HTML generation like AP-02 — can't hit the gap pack's density floors within one 8K-token response.)
2. **Gap Pack = 1 front/back call + 1 call per gap (AP-07a/b).** Per-gap calls keep each response small and reliably dense (≥ floors), and give per-gap progress UI; 5 gaps ≈ 6 calls.
3. **Console = 1 call (AP-08) + client-side story interpolation.** Story tabs are filled from `cos-stars` locally (zero tokens); the API only generates role-specific content (beats, cheat sheets, tagline). Vocabulary correction notes per story are computed locally by scanning story text against `mandatoryReframes`.
4. **Generated HTML is never persisted** — preview via iframe `srcDoc`, deliver via Copy-HTML button + best-effort blob download; only a status flag is stored (mirrors playbook handling, respects storage limits).
5. **Templates embedded as JS string constants** from the repo files. The embedded copies may add invisible repeat markers `<!--R:name--> ... <!--/R:name-->` around exemplar rows for the assembler; no structural or visual change; repo source files stay pristine. Escape backticks and `${` when embedding.
6. **In-memory-only constraint of the console is inherited for free** — the shell's own vanilla JS handles ratings/counters; the app injects no persistence.

## 3. Data model deltas (additive only)

New role-card fields, following the existing `playbookStatus` convention:

```
gapPackStatus: "PENDING" | "BUILT"      // default via read-site fallback: role.gapPackStatus || "PENDING"
consoleStatus: "PENDING" | "BUILT"
gapPackBuiltAt: ISO date | null
consoleBuiltAt: ISO date | null
```

No migration pass — read-site fallbacks only. `makeRoleFromScore` and the manual add-role path set the defaults for new roles.

Gap list source: `role.gaps.split(";").map(s => s.trim()).filter(Boolean)`.

Posture derivation (build time, per gap): if a linked track (`role` linkage in `cos-skills`) is status `COMPLETE` → `closed-via-TRK`; `IN_PROGRESS` → `partial`; otherwise `open`. User-overridable per gap in the build modal.

## 4. Batch 9 — Gap Pack (AP-07)

### UI
Role drawer → **Build Gap Pack** button (disabled when `gaps` empty). Opens modal:
- Per-gap posture dropdown (prefilled from derivation), tier auto-suggested from sub-scores (editable: GENUINE / VOCAB_ONLY / PARTIAL).
- Build → progress state "Front matter…", "Gap 2/5…" → preview iframe + **Copy HTML** + download attempt.
- On success: `gapPackStatus = "BUILT"`, `gapPackBuiltAt = now`, toast. Artifact dot on role card.

### AP-07a — front + back matter (maxTokens 3000)

System prompt:

```
You are building the front and back matter of an interview gap-closure study pack.
This pack makes a candidate speak credibly about scorecard gaps — it is a read-and-drill
document, NOT a skill curriculum. Module test: everything must terminate in something
the candidate can SAY in an interview.

ROLE: {role} at {company}
ROLE CONTEXT: {whatItIs} | Top requirements: {top3Requirements} | Reframe: {reframeStrategy}

GAPS WITH POSTURE AND TIER (user-confirmed):
{gap_list_json}   // [{gap, tier, posture}]

DIMENSION EVIDENCE (for severity/priority):
{dimension_scores_json}

CANDIDATE SUMMARY: {career_profile_summary}
VOCABULARY TABLE (current-employer term → target term):
{vocab_mandatory_reframes}
STORIES MAPPED TO THIS ROLE: {star_titles_for_role}

PRIORITY LOGIC: P0 = "if this fails the interview can fail" · P1 = "credible candidates
speak this fluently" · P2 = "fast to close, still audible".
POSTURE MEANING: open = honest acknowledgment + bridge ("what I am not claiming");
closed-via-TRK = demonstrate with evidence (track work as proof); partial = between.

OUTPUT — respond with ONLY this JSON:
{
  "roleTargetSentence": "", "oneParagraphStance": "", "isIsNotBullets": [""],
  "studyRule": "", "moduleReadingGuide": "", "readinessDefinition": "",
  "classification": [{ "gap": "", "tier": "", "priority": "P0|P1|P2", "posture": "", "oneLineThesis": "" }],
  "sequencingRule": "", "mvc": "", "checklist": [""],
  "translationLab": {
    "rules": ["don't change facts","change vocabulary","keep metrics","map current-employer ops to target ops","don't claim work you didn't do","emphasize operating discipline"],
    "storyMap": [{ "storyId": "", "from": "", "to": "" }],
    "exemplar": { "storyId": "", "rewritten": "" }
  },
  "recallSheet": [""], 
  "mockQs": [{ "question": "", "answerShape": "" }]
}
```

User message: `Build front/back matter for the gap pack: {role} at {company}`

### AP-07b — one call per gap (maxTokens 2500)

System prompt:

```
You are writing ONE gap module for an interview gap-closure study pack.
Everything must terminate in something the candidate can SAY. Do not write a study
plan or curriculum — that lives elsewhere.

ROLE: {role} at {company} | ROLE CONTEXT: {whatItIs}
GAP: {gap}  | TIER: {tier} | POSTURE: {posture}
POSTURE RULES: open → honest acknowledgment + bridge, state plainly what is NOT being
claimed; closed-via-TRK → demonstrate with evidence from completed track work
({track_evidence}); partial → acknowledge remaining edge, evidence what's done.

CANDIDATE SUMMARY: {career_profile_summary}
VOCABULARY TABLE: {vocab_mandatory_reframes}
RELEVANT STORIES: {star_snippets_for_gap}

DENSITY (hard minimums): decoder ≥5 terms · ≥2 likely questions · full 2-minute answer
(~280-320 words) · 60-second compressed answer · ≥4 safe phrases · ≥3 avoid phrases ·
≥5 recall questions · one-line close.
SOURCE INTEGRITY: every external/company claim you use gets a calibration entry —
basis is VERIFIED (from provided data), SOFTENED (reasonable inference, hedged in the
text itself), or UNCONFIRMED (flag, never assert). Soften in-body, not only in the tag.

OUTPUT — respond with ONLY this JSON:
{
  "gap": "", "whatChanged": "", "factsToKnow": [""],
  "decoder": [{ "term": "", "meaning": "", "currentEq": "", "spokenForm": "" }],
  "operatingModel": "",
  "likelyQuestions": [{ "question": "", "type": "" }],
  "fullAnswer": "", "compressedAnswer": "",
  "safePhrases": [""], "avoidPhrases": [""],
  "recallQuestions": [""], "oneLineClose": "",
  "claims": [{ "claim": "", "basis": "VERIFIED|SOFTENED|UNCONFIRMED" }]
}
```

User message: `Write the gap module for: {gap}`

### Assembly
- Clone exemplar rows per repeat marker; fill all `{{TOKEN}}` slots; `{{SOBHA_EQ}}` receives `decoder[].currentEq` (template token name retained — it is just a marker).
- Source Calibration appendix = aggregate of all `claims[]` across gap calls (**mandatory** — if empty, insert a "no external claims used" row, never omit the section).
- Ceiling guard: if `gaps > 6`, P2-tier gaps are compressed client-side to their decoder + one safe phrase + close (1-pp vocab card per R3) — implemented by skipping the full-module render for those gaps, not by an extra API call.
- Manifest block in template footer filled with build date, gaps covered w/ tier+posture, calibration flag count.

## 5. Batch 10 — Interview Console (AP-08)

### UI
Prep Hub → new 5th sub-tab **Console**:
- Role select → rounds checkboxes (Recruiter / Hiring Mgr / Panel / Exec) — **required, none pre-checked, no "all" default (R4)**; build button disabled until ≥1 round picked.
- Featured stories multi-select, default = `role.starIds`.
- Build → single AP-08 call → assemble → preview iframe + Copy HTML + download attempt → `consoleStatus = "BUILT"`.

### AP-08 — console content (maxTokens 3000)

System prompt:

```
You are generating the role-specific content for an interview rehearsal console.
The console renders STAR stories (provided separately by the app) and drills delivery.
You generate ONLY: role brief content, cheat sheets, and round-by-round practice beats.

ROLE: {role} at {company} | ROLE CONTEXT: {whatItIs} | Top requirements: {top3Requirements}
REFRAME STRATEGY: {reframeStrategy}
CANDIDATE SUMMARY: {career_profile_summary}
VOCABULARY TABLE (wrong term → correct term): {vocab_mandatory_reframes}
FEATURED STORIES (titles + results only): {featured_star_titles}
ROUNDS TO BUILD (build these ONLY, no others): {rounds_list}

ROUND DEFINITIONS: RECRUITER = screen (motivation, logistics, headline fit);
HM = behavioral + scenario depth; PANEL = cross-functional (stakeholder angles);
EXEC = strategic altitude (business judgment, brevity).

OUTPUT — respond with ONLY this JSON:
{
  "roleTagline": "", "signatureLine": "",
  "keyFacts": [{ "label": "", "body": "" }],
  "cheatSheet": {
    "say": [""],
    "dontSay": [{ "line": "", "trap": "" }],
    "controlSystem": [{ "keyLine": "" }]
  },
  "rounds": [
    { "round": "RECRUITER|HM|PANEL|EXEC",
      "beats": [{ "question": "", "beats": "", "assetOrScode": "" }] }
  ]
}
Include 4-6 beats per requested round. dontSay traps name the follow-up that exposes the slip.
```

User message: `Build console content for: {role} at {company} — rounds: {rounds_list}`

### Assembly
- One round tab per **requested** round only; canonical label order Recruiter · Hiring Mgr · Panel · Exec (per shell comment).
- Story tabs: filled 100% client-side from `cos-stars` (full STAR text, category, metrics). `{{CORRECTION_NOTES}}` per story = list of vocab-table source terms found in that story's text (`case-insensitive includes` scan) with their target replacements; "none" if clean.
- Assertiveness axis fixed as per shell; stories whose category or notes match assertiveness proof-point tags get the shell's flag treatment.
- `{{N_ROUNDS}}`, `{{BUILD_DATE}}`, `{{PLAYBOOK_REF}}` (= "score card " + role id), `{{FLAGS_FOR_MANIFEST}}` filled from build metadata.
- Shell JS untouched — ratings, counters, reveal/hide stay in-memory and reset on reload by design.

## 6. Acceptance criteria

**Batch 9**
- [ ] Build Gap Pack from a role with ≥2 gaps produces a complete HTML doc: front matter, one module per gap honoring posture, translation lab, recall drill, calibration appendix (never absent), filled manifest.
- [ ] Per-gap progress visible during build; any single-call failure surfaces a toast and aborts cleanly (no partial "BUILT" flag).
- [ ] >6-gap role: P2-tier gaps render as compressed vocab cards.
- [ ] `gapPackStatus/BuiltAt` set; artifact dot appears; Copy HTML works.
- [ ] Templates embedded unmodified except repeat markers; esbuild clean.

**Batch 10**
- [ ] Build blocked until ≥1 round selected; output contains exactly the selected round tabs in canonical order.
- [ ] Story tabs render full STAR content from storage with correction notes; shell quiz/rating JS functions in the generated file (open it standalone).
- [ ] No storage/persistence added to the generated console.
- [ ] `consoleStatus/BuiltAt` set; Copy HTML works; esbuild clean.

---
*Pairs with: docs/features/ source files · API_PROMPTS.md (AP-01–06) · DATA_MODEL.md*
