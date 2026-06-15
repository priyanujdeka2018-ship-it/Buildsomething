# Career OS — Answer Polish Prompt Template

**Prompt ID:** OP-04
**Tool:** Any AI (ChatGPT, Gemini, Claude)
**Zone:** Prep Hub (Zone 4 → Stories tab)

---

## How to use

1. In Career OS → Prep → Stories → find the story you want to polish.
2. Tap the **polish** button on that story card.
3. The app generates the prompt below with your story text and vocabulary table injected.
4. Copy → paste into any AI → review the polished version.
5. This prompt is for **inline review only** — it does not produce importable `.md`. Manually update the story in the app if you like the polished version.

This is a lightweight editing loop. For deep multi-turn story coaching, use the Companion Project (MODE 1: DEEP MOCK or the STAR Story Coach AP-06 API call).

---

## Prompt template

```
Polish this behavioral interview answer for a {roleTitle} role at {company}.

ORIGINAL ANSWER:
{rawAnswer — the Situation/Task/Action/Result text from the story}

RULES:
1. Maintain STAR structure (Situation → Task → Action → Result)
2. Target length: ≤300 words (≈2 minutes spoken)
3. Apply these vocabulary translations (MUST use right column, never left):
{source term} → {target term}
{source term} → {target term}
{...one line per mandatory reframe}
4. Lead with decisions and actions, not analysis
5. Use "I decided / I built / I held / I escalated" — never "I think" or "we sort of"
6. Include 3+ specific metrics in the Result section
7. End on the outcome, not on what you learned (save learning for follow-up)

OUTPUT:
Provide the polished answer, then a bullet list of what you changed and why.
Do NOT format as .md import — this is for inline review only.
```

---

## Variable injection map

| Placeholder | Source key | Path |
|-------------|-----------|------|
| `{roleTitle}` | Context | From the role the story is linked to, or "target" if unlinked |
| `{company}` | Context | From the linked role, or omitted |
| `{rawAnswer}` | `cos-stars` | `stories[selected].situation + task + action + result` |
| `{vocabulary table}` | `cos-vocab` | `vocab.mandatoryReframes[]` |

---

## Why no import?

Polishing is subjective — you review the output and cherry-pick improvements manually. The app doesn't overwrite story text from an external AI without your explicit edit. This keeps the STAR bank as your verified source of truth.

---

*Career OS Prompt Kit · OP-04 · Pairs with: MOCK_INTERVIEW_PROMPT_TEMPLATE.md*
