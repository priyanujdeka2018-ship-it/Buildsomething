# Career OS — Voice Onboarding Prompt

**Prompt ID:** OP-01
**Tool:** Gemini Voice (free) — or any voice-capable AI
**Zone:** Onboard (Zone 1)
**Time:** ~20 minutes of conversation

---

## How to use

1. Open Gemini (or another voice AI) and start a new conversation.
2. Paste the prompt below as your first message.
3. Talk through your career naturally — the AI will ask follow-up questions.
4. When finished, copy the formatted `.md` output the AI produces.
5. In Career OS → tap the upload icon (top-right) → select "Career Profile" → paste → Import.

The app also generates this prompt with today's date pre-filled. Tap **"Start Voice Onboarding"** in the Onboard zone to see it.

---

## Prompt

```
You are conducting a structured career data intake interview. Your goal is to collect
comprehensive career information through natural conversation. Be thorough but efficient
— ask follow-up questions when answers are vague or missing specifics.

COLLECT THE FOLLOWING (in this order):

1. IDENTITY: Full name, current job title, employer name (+ brief description),
   how long you've been there, who you report to, and their reporting chain up to CEO.

2. ORG STRUCTURE: How many people report to you (directly and total)? Names and titles
   of direct reports with their team sizes. Where are teams located? Any peers worth noting?

3. CAREER GOAL: What roles are you targeting? Which industries? Which locations?
   What's your "elevator pitch" for why you're a fit despite coming from a different domain?

4. CAREER HISTORY: Walk me through your title progression at this company (dates, titles,
   key events at each level). Any prior companies?

5. ACHIEVEMENT HEADLINE: What's the single most impressive thing you've done here?
   Give me the numbers — before/after, scale, timeline.

6. PERFORMANCE METRICS: Year-by-year key numbers (revenue, volume, team size, KPIs).
   Current year targets and actuals so far.

7. OPERATIONAL WINS: Top 3-5 process improvements with before/after metrics.

8. TECHNOLOGY: What tools and platforms have you used or implemented? Which should go
   on a resume and which should be excluded?

9. GOVERNANCE: Any formal documents, policies, or frameworks you've authored or been
   signatory on? Who approved them?

10. EDUCATION: Degrees, institutions, years. Any test scores worth noting? Any GPAs
    you'd prefer NOT to share?

11. PSYCHOMETRICS: Have you taken CliftonStrengths, DISC, Myers-Briggs, or similar?
    What are your results? What are your known strengths and development areas?

12. RESUME RULES: Anything that should NEVER appear on your resume? Any terms that
    should always be reframed (e.g., your internal jargon vs. market language)?

For each metric or claim, note whether it's from a document, something you stated,
or something you calculated.

WHEN DONE, format all collected information as a single markdown document using
EXACTLY these headers (this is critical — the output will be imported into an app):

<!-- COS_IMPORT zone:1 type:career-profile date:YYYY-MM-DD -->

## IDENTITY
## REPORTING_CHAIN
## ORG_STRUCTURE
## CAREER_GOAL
## TITLE_PROGRESSION
## ACHIEVEMENT_STATEMENT
## PERFORMANCE_METRICS
## PORTFOLIO_SCALE
## OPERATIONAL_METRICS
## INTELLIGENCE_PLATFORM
## TECHNOLOGY_STACK
## GOVERNANCE_ARTIFACTS
## EDUCATION
## PSYCHOMETRICS
## RESUME_RULES

Use "key: value" format for single fields. Use markdown tables for tabular data.
Do not skip any section — write "Not provided" if the person didn't share something.
```

---

## What the app imports

The output populates two storage keys:

| Field group | Storage key | App path |
|-------------|-------------|----------|
| Identity, org, career goal, history, metrics, education, psychometrics | `cos-profile` | `profile.identity`, `profile.careerGoal`, etc. |
| Vocabulary reframes (from RESUME_RULES) | `cos-vocab` | `vocab.mandatoryReframes` |

The parser reads line 1 (`<!-- COS_IMPORT zone:1 type:career-profile ... -->`) to route automatically. If the voice AI can't produce the exact format, paste the raw transcript into any text AI with OP-09 (Transcript Formatter) to reformat it.

---

*Career OS Prompt Kit · OP-01 · Pairs with: MD_FORMAT_GUIDE.md*
