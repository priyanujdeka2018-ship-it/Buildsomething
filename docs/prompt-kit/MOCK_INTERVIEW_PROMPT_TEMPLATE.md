# Career OS — Mock Interview Prompt Template

**Prompt ID:** OP-03
**Tool:** ChatGPT or Gemini
**Zone:** Prep Hub (Zone 4 → Mock tab)
**Time:** ~15–20 minutes per session

---

## How to use

1. In Career OS → Prep → Mock tab → select a role from your pipeline.
2. The app generates the prompt below with your data injected (stories, vocabulary table, role context).
3. Tap **Copy** → paste into ChatGPT or Gemini → run the mock interview.
4. Answer each question out loud or in text. The AI scores after each answer.
5. When finished, copy the AI's formatted output → upload icon → select "Mock Interview Results" → paste → Import.

The app tracks score trends across sessions. Each imported mock updates rehearsal counts on the stories you used.

---

## Prompt template

The app fills `{variables}` from your stored data. Below is the template with placeholders visible so you can see what gets injected.

```
You are a hiring manager at {company} interviewing a candidate for the role of
{roleTitle}. Conduct a behavioral interview with 5 questions.

ROLE CONTEXT:
{whatItIs — from the role card's decoded requirements}

CANDIDATE'S AVAILABLE STORIES (use these to evaluate relevance of answers):
{S1: Story Title — result summary}
{S2: Story Title — result summary}
{...one line per story mapped to this role}

CANDIDATE'S VOCABULARY TABLE (flag if they use the LEFT column instead of RIGHT):
{source term} → {target term}
{source term} → {target term}
{...one line per mandatory reframe}

INTERVIEW PROTOCOL:
1. Ask ONE question at a time. Wait for the full answer before responding.
2. After each answer, score on 4 dimensions (1-3 scale):
   - Structure: STAR compliance, ≤2 minutes, clear flow
   - Specificity: 3+ metrics, named outcomes, quantified scale
   - Vocabulary: Zero domain-specific jargon from current employer (flag any slips)
   - Assertiveness: Leads with decisions/actions, no hedging ("I think", "we sort of")
3. Give brief feedback after each answer, then move to the next question.
4. Mix question types: at least 1 failure/weakness, 1 leadership, 1 process, 1 data-driven.
5. Include 1 unexpected question not from the standard behavioral set.

AFTER ALL 5 QUESTIONS, format your output as:

<!-- COS_IMPORT zone:4 type:mock-results date:YYYY-MM-DD -->

## MOCK_RESULTS
role: {roleTitle}
date: YYYY-MM-DD
source: chatgpt
questionsAsked: 5

### Q1: [question text]
storyUsed: [S-code if identifiable]
structure: [1-3]
specificity: [1-3]
vocabulary: [1-3]
assertiveness: [1-3]
feedback: [specific coaching]

[repeat for each question]

## SCORE_SUMMARY
| Dimension | Avg Score | Trend |
|-----------|-----------|-------|
| Structure | X.X | — |
| Specificity | X.X | — |
| Vocabulary | X.X | — |
| Assertiveness | X.X | — |

## IMPROVEMENT_ACTIONS
1. [most important fix]
2. [second fix]
3. [third fix]
```

---

## Variable injection map

| Placeholder | Source key | Path |
|-------------|-----------|------|
| `{company}` | `cos-pipeline` | `roles[selected].company` |
| `{roleTitle}` | `cos-pipeline` | `roles[selected].role` |
| `{whatItIs}` | `cos-pipeline` | `roles[selected].whatItIs` or `.top3Requirements` |
| `{stories}` | `cos-stars` | Stories mapped to this role via `starIds`, or all stories if unmapped |
| `{vocabulary table}` | `cos-vocab` | `vocab.mandatoryReframes[]` (`source → target`) |

---

## Scoring rubric (what 1-2-3 means)

| Dimension | 1 | 2 | 3 |
|-----------|---|---|---|
| Structure | Missing components, rambling, >3 min | All components present, rough transitions, 2–3 min | Crisp STAR, natural transitions, ≤2 min |
| Specificity | No metrics, vague outcomes | 1–2 metrics | 3+ concrete data points |
| Vocabulary | 2+ employer-specific terms | Mostly target language, 1 slip | Zero slips |
| Assertiveness | Hedging, passive voice throughout | Mostly active, 1–2 hedges | "I decided / I held / I escalated" |

---

*Career OS Prompt Kit · OP-03 · Pairs with: ANSWER_POLISH_PROMPT_TEMPLATE.md*
