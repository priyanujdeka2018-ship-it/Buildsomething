# CAREER OS — OFFLOAD PROMPTS v1.0
# Pre-built prompt templates for free AI tools (Gemini, ChatGPT, etc.)
# The app generates these with user data injected, user copies to external AI.
# Results return as .md per MD_INTERCHANGE_SPEC.

---

## Prompt Index

| ID | Activity | Recommended Tool | Zone |
|----|----------|-----------------|------|
| OP-01 | Career Profile Interview | Gemini Voice | Zone 1 |
| OP-02 | STAR Story Builder | Gemini Voice | Zone 1 |
| OP-03 | Mock Interview (BQ) | ChatGPT / Gemini | Zone 4 |
| OP-04 | Answer Polishing | Any AI | Zone 4 |
| OP-05 | Negotiation Simulation | ChatGPT | Zone 4 |
| OP-06 | Red Team Review | ChatGPT | Zone 3 |
| OP-07 | Practice Exercises | ChatGPT | Zone 5 |
| OP-08 | Mock Exam | ChatGPT | Zone 5 |
| OP-09 | Transcript Formatter | Any AI | Utility |

---

## OP-01: CAREER PROFILE INTERVIEW (Gemini Voice)

**App generates this when:** User taps "Start Voice Onboarding" in Zone 1

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

<!-- COS_IMPORT zone:1 type:career-profile date:{today} -->

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

## OP-02: STAR STORY BUILDER (Gemini Voice)

**App generates this when:** User taps "Build Stories via Voice" in Zone 1

```
You are a behavioral interview story builder. You'll help me create STAR-format
stories from my career experiences. Each story needs:
- Situation: Business context and problem (2-3 sentences)
- Task: What I was specifically accountable for (1-2 sentences)
- Action: Specific steps I took with granular detail (3-5 sentences)
- Result: Quantified outcomes with numbers (2-3 sentences)

INTERVIEW CATEGORIES TO COVER:
1. Risk/Governance — a time you managed risk, compliance, or quality standards
2. Team Leadership — building, scaling, or developing a team
3. Transformation — redesigning a process or system
4. Stakeholder Management — influencing senior leaders or cross-functional partners
5. Data/Analytics — using data to drive a decision
6. Crisis Management — handling an urgent problem
7. Financial Impact — delivering measurable financial results
8. Building from Scratch — creating something that didn't exist
9. Failure/Learning — something that didn't go as planned (with honest reflection)
10. Assertiveness — pushing back or holding a standard under pressure

For each category, ask me: "Tell me about a time you [category-specific prompt]."
Then probe with follow-up questions to get specific metrics, names, timelines.

After EACH story, ask:
- "What's the key metric that proves this worked?"
- "How long did this take?"
- "Who else was involved and what was YOUR specific contribution?"
- "On a scale of 1-3, how strong is the evidence for this story?"

After collecting all stories, format as markdown:

<!-- COS_IMPORT zone:1 type:star-stories date:{today} -->

## STAR_STORIES

### S1: [Short Title]
category: [from the 13 categories]
starRating: [1-3]
situation: [text]
task: [text]
action: [text]
result: [text]
metrics: [comma-separated key numbers]
source: STATED
interviewNotes: [any coaching notes]

Repeat for each story. Number sequentially (S1, S2, S3...).
Aim for 10-15 stories minimum across the categories.
```

---

## OP-03: MOCK INTERVIEW (ChatGPT / Gemini)

**App generates this when:** User taps "Generate Mock Prompt" in Zone 4, selecting a role

**Note:** The app injects the user's relevant STAR stories and vocabulary table.

```
You are a hiring manager at {company} interviewing a candidate for the role of
{role_title}. Conduct a behavioral interview with 5 questions.

ROLE CONTEXT:
{role_description}

CANDIDATE'S AVAILABLE STORIES (use these to evaluate relevance of answers):
{star_stories_relevant_to_role}

CANDIDATE'S VOCABULARY TABLE (flag if they use the LEFT column instead of RIGHT):
{vocab_table}

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

<!-- COS_IMPORT zone:4 type:mock-results date:{today} -->

## MOCK_RESULTS
role: {role_title}
date: {today}
source: {ai_tool}
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

## OP-04: ANSWER POLISHING (Any AI)

**App generates this when:** User selects a story and taps "Polish" in Zone 4

```
Polish this behavioral interview answer for a {role_title} role at {company}.

ORIGINAL ANSWER:
{raw_answer_text}

RULES:
1. Maintain STAR structure (Situation → Task → Action → Result)
2. Target length: ≤300 words (≈2 minutes spoken)
3. Apply these vocabulary translations (MUST use right column, never left):
{vocab_table}
4. Lead with decisions and actions, not analysis
5. Use "I decided / I built / I held / I escalated" — never "I think" or "we sort of"
6. Include 3+ specific metrics in the Result section
7. End on the outcome, not on what you learned (save learning for follow-up)

OUTPUT:
Provide the polished answer, then a bullet list of what you changed and why.
Do NOT format as .md import — this is for inline review only.
```

---

## OP-05: NEGOTIATION SIMULATION (ChatGPT)

**App generates this when:** User taps "Practice Negotiation" in Zone 4

```
You are an HR Business Partner at {company} extending an offer for {role_title}.
Run a realistic salary negotiation simulation.

OFFER DETAILS:
- Role: {role_title}
- Grade/Level: {level_if_known}
- Base salary offered: {ctc_min} {currency}
- Total comp offered: {ctc_midpoint} {currency}
- The candidate's research suggests market rate is {ctc_max} {currency}

NEGOTIATION COUNTERS TO DEPLOY (vary which ones you use — don't use all):
A. CTC Demand: "We need your current compensation for internal banding."
B. Grade Lock: "This role is graded at [level] and the band is non-negotiable."
C. Title Downgrade: "We can't offer [higher title], but the scope is equivalent."
D. Exploding Offer: "We need your decision by Friday."
E. Benefits Offset: "The benefits package bridges the gap — healthcare, learning budget, etc."
F. Future Promise: "The next review cycle is in 6 months, and high performers get 15-20% bumps."

Deploy 3-4 of these across the conversation. Include at least ONE unexpected counter
not listed above.

CANDIDATE RULES (things they should practice):
- Never volunteer current compensation. Deflect with: "I'd prefer to focus on the
  value I bring and the market rate for this scope."
- Always push one level/band higher than offered
- If pressed on title, negotiate accelerated review timeline
- If exploding offer, request specific extension date

Run the simulation as a natural conversation. After it concludes, provide:
1. Assessment of the candidate's negotiation performance
2. Moments where they conceded too easily
3. Moments where they held well
4. One thing to practice for next time
```

---

## OP-06: RED TEAM REVIEW (ChatGPT)

**App generates this when:** User taps "Red Team" on a playbook or resume in Zone 3

```
You are a skeptical hiring manager at {company} reviewing this candidate's
{artifact_type} for the {role_title} role. Your job is to find weaknesses,
not validate strengths.

{artifact_content}

EVALUATE:
1. GAPS FOUND: What would make you skeptical? Where does the positioning feel
   generic vs. genuinely differentiated? What follow-up questions would you ask
   to expose a weakness?

2. SUGGESTED STRENGTHENING: For each gap, suggest a specific fix. Reference
   content from the artifact that could be reframed or expanded.

3. RED FLAGS: Any vocabulary slips (domain jargon that doesn't belong), inflated
   claims, or missing proof points that a {company} interviewer would catch.

Format your output as:

<!-- COS_IMPORT zone:3 type:red-team date:{today} -->

## RED_TEAM_RESULTS
role: {role_title}
source: chatgpt
date: {today}

## GAPS_FOUND
- [gap 1]
- [gap 2]

## SUGGESTED_STRENGTHENING
- [fix 1]
- [fix 2]

## RED_FLAGS
- [flag 1]
- [flag 2]
```

---

## OP-07: PRACTICE EXERCISES (ChatGPT)

**App generates this when:** User taps "Generate Practice" on a skill track week in Zone 5

```
Generate {count} practice exercises for {skill_name}, Week {week_number}.

TOPIC: {week_title}
OBJECTIVES: {week_objectives}
DIFFICULTY: {beginner|intermediate|advanced}

DOMAIN CONTEXT (use this data for realistic exercises):
{user_domain_description}
{sample_data_schema_if_applicable}

EXERCISE FORMAT:
For each exercise provide:
1. A clear problem statement
2. Expected output or answer
3. Step-by-step explanation
4. One "bonus challenge" extension

Format your output as:

<!-- COS_IMPORT zone:5 type:practice-results date:{today} -->

## PRACTICE_RESULTS
track: {track_id}
skill: {skill_name}
week: {week_number}
date: {today}
source: chatgpt
type: EXERCISE

### Exercise 1: [title]
question: [problem statement]
expectedOutput: [correct answer]
explanation: [step-by-step]
bonusChallenge: [extension]

[repeat for each exercise]
```

---

## OP-08: MOCK EXAM (ChatGPT)

**App generates this when:** User taps "Mock Exam" on a certification track in Zone 5

```
Generate a {question_count}-question mock exam for {cert_name}.

FOCUS AREA: {specific_domain_or_week_topic}
DIFFICULTY: Match the actual exam difficulty for {cert_name}
FORMAT: Multiple choice (4 options each), matching the real exam format

For each question:
1. Question text
2. Four options (A, B, C, D)
3. Correct answer
4. Brief explanation of why it's correct and why the most common wrong answer is wrong

Format your output as:

<!-- COS_IMPORT zone:5 type:practice-results date:{today} -->

## PRACTICE_RESULTS
track: {track_id}
skill: {cert_name}
week: {week_number}
date: {today}
source: chatgpt
type: MOCK_EXAM

### Q1: [question text]
options:
- A: [option]
- B: [option]
- C: [option]
- D: [option]
correct: [letter]
explanation: [why correct + why common wrong answer is wrong]

[repeat]

## ANSWER_KEY
| Q | Correct | Your Answer | Result |
|---|---------|-------------|--------|
| 1 | A | | |
[user fills in "Your Answer" column after attempting]
```

---

## OP-09: TRANSCRIPT FORMATTER (Utility — Any AI)

**App generates this when:** User has a raw transcript/notes and needs it formatted for import

```
Reformat the following raw text into the Career OS import format. Extract all career
facts, metrics, stories, and structured data. Organize under the correct headers.

TARGET FORMAT TYPE: {career-profile | star-stories}

If career-profile, use these exact headers:
<!-- COS_IMPORT zone:1 type:career-profile date:{today} -->
## IDENTITY
## REPORTING_CHAIN
## ORG_STRUCTURE
[...all headers from OP-01]

If star-stories, use:
<!-- COS_IMPORT zone:1 type:star-stories date:{today} -->
## STAR_STORIES
### S1: [title]
[...fields from OP-02]

RAW TEXT TO FORMAT:
{raw_text}

RULES:
- Extract only what's explicitly stated — do not infer or fabricate
- For uncertain items, add "(UNCONFIRMED)" suffix
- Omit headers where no data was provided
- For metrics, note source as STATED (since this is from user notes)
```

---

## App UI for Prompt Delivery

Each offload prompt in the app renders as:

```
┌─────────────────────────────────────┐
│ 🎙️ Voice Onboarding Interview       │
│ Recommended: Gemini Voice (free)    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Prompt preview - scrollable]   │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [📋 Copy Prompt]  [📥 Import .md]  │
│                                     │
│ Tip: Open Gemini, paste this prompt,│
│ then talk through your career for   │
│ ~20 minutes. Copy the formatted     │
│ output and tap "Import .md" above.  │
└─────────────────────────────────────┘
```

---

*CAREER OS OFFLOAD PROMPTS v1.0*
*Pairs with: MD_INTERCHANGE_SPEC.md, API_PROMPTS.md*
