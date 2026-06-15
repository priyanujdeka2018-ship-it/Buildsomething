# CAREER OS — MD INTERCHANGE SPEC v1.0
# Standardized .md format for cross-AI data handoff.
# Any AI tool (Gemini, ChatGPT, Claude) outputs this format.
# The Career OS app parses it into the data model.

---

## Core Rules

1. Every .md file starts with a metadata comment (line 1):
   `<!-- COS_IMPORT zone:N type:TYPE date:YYYY-MM-DD -->`
   The app auto-routes to the correct parser from this line.

2. Top-level sections use `##` headers, exact spelling, UPPERCASE.
3. Sub-records use `###` headers.
4. Fields within a record use `key: value` on a single line.
5. Multi-line content (story narratives, feedback) goes as prose below the key line.
6. Tables use standard markdown pipe format.
7. Arrays use comma-separated values on one line, or bullet lists for complex items.
8. Dates always ISO-8601 (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS`).
9. Empty/unknown fields: omit the line entirely (parser treats missing = null).

---

## Zone 1: Onboarding — Career Profile Import

Metadata: `<!-- COS_IMPORT zone:1 type:career-profile date:YYYY-MM-DD -->`

```markdown
## IDENTITY
name: Jane Smith
currentTitle: Senior Manager, Revenue Operations
employer: Acme Corp
employerDescription: $2B global logistics company
tenureStart: 2019-06
location: Mumbai, India
targetLocation: Bangalore, India
email: jane@email.com
phone: +91-XXXXXXXXXX
linkedin: linkedin.com/in/janesmith

## REPORTING_CHAIN
reportsTo: VP Revenue, Sarah Chen
chain:
- CEO, Michael Park
- CFO, David Liu
- VP Revenue, Sarah Chen
- **Jane Smith (you)**

## ORG_STRUCTURE
totalHeadcount: 45
breakdown:
- Mumbai: 30
- Manila: 15
directReports:
- Ravi Kumar, Team Lead Collections (12 reports, Mumbai)
- Priya Nair, Manager Analytics (8 reports, Mumbai)
- Alex Torres, Lead Ops (15 reports, Manila)
peers:
- Amit Shah, Senior Manager Sales Ops
- Lisa Wong, Senior Manager Customer Success

## CAREER_GOAL
transitionSummary: Moving from revenue operations into product management / strategic ops at tech companies
targetFunctions: Product Management, Business Operations, Strategy & Operations
targetIndustries: FinTech, SaaS, Enterprise Tech
coreReframe: I've been doing product management for 5 years — I just haven't been calling it that
aiDifferentiator: Built an 8-project automation portfolio that reduced manual ops 60%

## TITLE_PROGRESSION
| Period | Title | Key Event |
|--------|-------|-----------|
| 2019-06 | Associate | Joined as ops analyst |
| 2021-01 | Manager | Promoted, took over collections team |
| 2023-06 | Senior Manager | Expanded to include Manila operations |

## ACHIEVEMENT_STATEMENT
Scaled revenue operations 8x ($50M → $400M ARR, 2019-2025) while reducing bad debt ratio 45% (12% → 6.6%) — proving growth and credit quality aren't in tension.

## PERFORMANCE_METRICS
### Annual
| Year | Revenue Managed | YoY Growth | Bad Debt Ratio |
|------|----------------|------------|----------------|
| 2021 | $120M | — | 10.2% |
| 2022 | $185M | +54% | 8.8% |
| 2023 | $280M | +51% | 7.5% |
| 2024 | $400M | +43% | 6.6% |

### Current Year
target: $520M
H1 actual: $275M (106% of pro-rata)

### Headline Metrics
- 8x revenue scale ($50M → $400M)
- 45% bad debt reduction (12% → 6.6%)
- 45-person team across 2 geographies
- 30+ live dashboards
- $12M annual cost savings from automation portfolio

## PORTFOLIO_SCALE
- Revenue managed: $400M ARR
- Customer accounts: 12,000+
- Team: 45 people, 2 countries
- Entities: 3 business units

## OPERATIONAL_METRICS
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Invoice processing TAT | 15 days | 3 days | 80% reduction |
| Collection rate | 82% | 94% | +12pp |
| Customer dispute resolution | 30 days | 7 days | 77% reduction |

## INTELLIGENCE_PLATFORM
totalArtifacts: 30+
builtPersonally:
- Revenue Forecasting Model (Excel → Python, live since 2021)
- Collections Priority Scorer (rule-based, feeds daily ops)
- Executive Dashboard Suite (6 reports, CEO audience)
builtByTeam:
- 15 operational reports (Mumbai team)
- 9 analytics dashboards (Manila team)

## TECHNOLOGY_STACK
| Platform | Usage | Include in Resume |
|----------|-------|-------------------|
| Salesforce CRM | Led implementation, custom workflows | Yes |
| Python/Pandas | Built forecasting models | Yes |
| Tableau | Executive dashboards | Yes |
| Jira | Team workflow management | Yes |
| WhatsApp Business | Customer outreach | No |

## GOVERNANCE_ARTIFACTS
- REV-PF01: Collections Escalation Policy (CEO-approved, 2022-03)
- REV-PF02: Bad Debt Write-off Framework (CFO-approved, 2023-06)
- REV-PF03: Customer Dispute Resolution SOP (VP-approved, 2024-01)

## EDUCATION
| Qualification | Institution | Years | Note |
|---------------|------------|-------|------|
| MBA | IIM Lucknow | 2017-2019 | |
| B.Tech (CS) | NIT Trichy | 2013-2017 | |

## PSYCHOMETRICS
cliftonStrengths: Achiever, Analytical, Strategic, Relator, Responsibility
disc: High C, High D, Low I, Low S
strengths: Data-driven decision maker, structured executor, builds deep trust
developmentAreas: Delegation under pressure, public speaking at large forums, saying no to scope creep

## RESUME_RULES
neverInclude: WhatsApp Business, internal chat tool names, salary figures
vocabularyOverrides:
- "collections" → "revenue operations"
- "bad debt" → "portfolio risk"
- "dunning" → "lifecycle communication"
framingRules:
- Frame via achievements, not duties
- No fabricated titles
- Round metrics to nearest clean number
```

---

## Zone 1: Onboarding — STAR Stories Import

Metadata: `<!-- COS_IMPORT zone:1 type:star-stories date:YYYY-MM-DD -->`

```markdown
## STAR_STORIES

### S1: Invoice Processing TAT Reduction
category: TRANSFORMATION
starRating: 3
situation: Invoice processing was taking 15 days on average, causing cash flow delays and customer complaints. Finance team flagged it as a top-3 operational risk.
task: Redesign the invoice processing workflow to reduce TAT while maintaining accuracy standards.
action: Mapped the existing 12-step process and identified 4 bottlenecks (manual approval chains, paper-based verification, sequential not parallel processing, no SLA tracking). Designed a 6-step digital workflow with parallel approvals, auto-verification rules, and real-time SLA dashboard. Piloted with 2 business units before full rollout.
result: TAT reduced from 15 days to 3 days (80% reduction). Error rate dropped from 8% to 2%. Scaled to all 3 business units within 90 days. Process adopted as company standard.
metrics: 15→3 days, 80% reduction, 8%→2% error rate, 90-day rollout
source: DOC
applicableRoles: fintech-pm, saas-ops-lead
interviewNotes: Strong opener for "process redesign" questions. Lead with the 80% number.

### S2: Collections Priority Scoring System
category: DATA_OPS
starRating: 3
situation: ...
task: ...
action: ...
result: ...
metrics: ...
```

---

## Zone 3: JD Analyzer — Red Team Results Import

Metadata: `<!-- COS_IMPORT zone:3 type:red-team date:YYYY-MM-DD -->`

```markdown
## RED_TEAM_RESULTS
role: Senior PM at FinCo
source: chatgpt
date: 2026-07-15

## GAPS_FOUND
- No direct FinTech payments experience — hiring manager will probe depth of payments domain knowledge
- "Revenue operations" framing may read as finance/accounting rather than product to a tech PM interviewer
- AI portfolio projects are all internal tools — no customer-facing product experience evident

## SUGGESTED_STRENGTHENING
- Add one STAR story that shows customer-facing product thinking (S4 dispute resolution could reframe)
- Include a "payments adjacent" proof point — invoice processing IS a payment workflow
- Reframe AI portfolio as "internal product launches" not "automation projects"

## RED_FLAGS
- Resume bullet 3 uses "collections" language — should be "revenue lifecycle management"
- No mention of A/B testing or experimentation — PM interviewers may probe
```

---

## Zone 4: Prep Hub — Mock Interview Results Import

Metadata: `<!-- COS_IMPORT zone:4 type:mock-results date:YYYY-MM-DD -->`

```markdown
## MOCK_RESULTS
role: Senior PM at FinCo
date: 2026-07-15
source: chatgpt
questionsAsked: 5

### Q1: Tell me about a time you redesigned a process
storyUsed: S1
structure: 3
specificity: 3
vocabulary: 2
assertiveness: 2
feedback: Strong STAR flow but used "collections" twice instead of "revenue operations". Hedged with "I think we" instead of "I decided to". Lead with the decision next time.

### Q2: How do you handle disagreement with leadership?
storyUsed: S5
structure: 2
specificity: 2
vocabulary: 3
assertiveness: 1
feedback: Story was too long (>3 minutes). Result section was vague — needs the specific metric. Started with "Well, so basically..." — practice a clean opener.

### Q3: ...

## SCORE_SUMMARY
| Dimension | Avg Score | Trend |
|-----------|-----------|-------|
| Structure | 2.5 | — |
| Specificity | 2.5 | — |
| Vocabulary | 2.5 | — |
| Assertiveness | 1.5 | WEAK |

## IMPROVEMENT_ACTIONS
1. Practice assertiveness verb pattern: "I decided / I held / I escalated"
2. Rehearse S1 until it's under 2 minutes
3. Eliminate "collections" — replace with "revenue lifecycle" in all answers
```

---

## Zone 5: Skill Coach — Practice Results Import

Metadata: `<!-- COS_IMPORT zone:5 type:practice-results date:YYYY-MM-DD -->`

```markdown
## PRACTICE_RESULTS
track: TRK-01
skill: SQL
week: 3
date: 2026-07-15
source: chatgpt
type: EXERCISE

### Exercise 1: Window Functions
question: Write a query to calculate the running total of monthly revenue by region using a window function.
userAnswer: SELECT region, month, revenue, SUM(revenue) OVER (PARTITION BY region ORDER BY month) as running_total FROM monthly_revenue;
correct: true
explanation: Correct use of PARTITION BY and ORDER BY. Could add ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for explicitness.

### Exercise 2: ...

## SCORE
total: 5
correct: 4
percentage: 80%
weakAreas: Subqueries with correlated references
strongAreas: Window functions, GROUP BY aggregation
```

---

## Parser Routing Table

The app reads line 1 (`<!-- COS_IMPORT ... -->`) and routes to the correct parser:

| zone | type | Target Storage Key | Parser Action |
|------|------|--------------------|---------------|
| 1 | career-profile | `cos-profile` | Merge into profile fields |
| 1 | star-stories | `cos-stars` | Append/update stories by storyId |
| 3 | red-team | `cos-pipeline` | Append to role's redTeamFindings |
| 4 | mock-results | `cos-stars` | Update rehearsal counts + scores |
| 5 | practice-results | `cos-skills` | Append to track's practiceResults |

---

## Voice Recording Flow

For Gemini Voice or other voice-to-text tools:

1. User starts voice session with the onboarding prompt (from OFFLOAD_PROMPTS)
2. AI conducts conversational interview
3. At end, AI formats everything as `.md` per this spec
4. User copies the formatted output
5. User pastes into app's "Import from AI" modal
6. App parses and populates

The onboarding prompt explicitly instructs the AI to output in this exact format.
If the voice AI can't format properly, user pastes raw transcript into any text AI
with the formatting prompt: "Reformat this career conversation into the following
.md structure: [headers from this spec]"

---

*CAREER OS MD INTERCHANGE SPEC v1.0*
*Pairs with: DATA_MODEL.md, OFFLOAD_PROMPTS.md*
