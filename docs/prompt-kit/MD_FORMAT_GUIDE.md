# Career OS — MD Format Guide

How the `.md` import format works, written for humans (not parsers).

---

## The one rule that matters

Every `.md` file you import must start with this exact line:

```
<!-- COS_IMPORT zone:N type:TYPE date:YYYY-MM-DD -->
```

The app reads this line to figure out where to route the data. If it's missing or misspelled, the import fails.

---

## Format types at a glance

| What you're importing | zone | type | How you got it |
|-----------------------|------|------|----------------|
| Career profile | 1 | `career-profile` | OP-01 voice interview or OP-09 formatter |
| STAR stories | 1 | `star-stories` | OP-02 story builder |
| Red-team findings | 3 | `red-team` | OP-06 red-team review |
| Mock interview results | 4 | `mock-results` | OP-03 mock interview |
| Practice/exam results | 5 | `practice-results` | OP-07 exercises or OP-08 mock exam |

---

## How the format works

### Headers

Top-level sections use `##` (two hashes):
```
## IDENTITY
## CAREER_GOAL
```

Sub-records (individual stories, questions) use `###` (three hashes):
```
### S1: Invoice Processing TAT Reduction
### Q1: Tell me about a time you redesigned a process
```

### Fields

Simple fields are `key: value` on one line:
```
name: Jane Smith
currentTitle: Senior Manager, Revenue Operations
starRating: 3
```

### Tables

Standard markdown pipes:
```
| Year | Revenue | Growth |
|------|---------|--------|
| 2023 | $280M   | +51%   |
```

### Multi-line content

Longer text (story narratives, feedback) goes as prose below the key line:
```
situation: Invoice processing was taking 15 days on average, causing cash flow
delays and customer complaints. Finance team flagged it as a top-3 operational risk.
```

### Missing data

Omit the line entirely — the parser treats missing fields as null. Don't write `name: N/A` or `name: unknown`.

### Dates

Always `YYYY-MM-DD` (e.g., `2026-07-15`). The metadata line date is when the content was generated.

---

## Troubleshooting imports

**"Invalid .md format"** → The first line is missing or malformed. Check:
- It must be an HTML comment: `<!-- COS_IMPORT ... -->`
- `zone:` and `type:` and `date:` must all be present
- No extra spaces inside the comment tags

**Data imported but fields are empty** → The AI probably used different header names. Check:
- Headers must be exact: `## IDENTITY` not `## Identity` or `## PERSONAL INFO`
- Key names must match: `currentTitle:` not `current_title:` or `Current Title:`

**Stories duplicated** → The parser merges by `storyId` (S1, S2, etc.). If you re-import with the same S-codes, existing stories update. If the AI numbered them differently (starting from S1 again when you already have S1–S10), you'll get overwrites. Rename S-codes before importing to avoid this.

**Mock results didn't update rehearsal counts** → The parser looks for `storyUsed: S3` (the S-code) in each question. If the AI wrote the story title instead of the code, rehearsal tracking won't fire.

**Practice results went to the wrong track** → The parser matches on `track: TRK-01` (the trackId). If missing, it falls back to the most recently active track. Include the trackId to be safe.

---

## Fixing malformed AI output

If a voice AI (Gemini, etc.) can't produce the exact format, use **OP-09 (Transcript Formatter)**:

```
Reformat the following raw text into the Career OS import format.
Extract all career facts, metrics, stories, and structured data.

TARGET FORMAT TYPE: {career-profile | star-stories}

If career-profile, use these exact headers:
<!-- COS_IMPORT zone:1 type:career-profile date:YYYY-MM-DD -->
## IDENTITY
## REPORTING_CHAIN
## ORG_STRUCTURE
[...all headers]

If star-stories, use:
<!-- COS_IMPORT zone:1 type:star-stories date:YYYY-MM-DD -->
## STAR_STORIES
### S1: [title]
[...fields]

RAW TEXT TO FORMAT:
{paste the raw transcript here}

RULES:
- Extract only what's explicitly stated — do not infer or fabricate
- For uncertain items, add "(UNCONFIRMED)" suffix
- Omit headers where no data was provided
- For metrics, note source as STATED
```

Paste this into any text AI along with the raw transcript. Copy the formatted output and import normally.

---

## Quick reference: all importable `.md` metadata lines

```
<!-- COS_IMPORT zone:1 type:career-profile date:2026-07-15 -->
<!-- COS_IMPORT zone:1 type:star-stories date:2026-07-15 -->
<!-- COS_IMPORT zone:3 type:red-team date:2026-07-15 -->
<!-- COS_IMPORT zone:4 type:mock-results date:2026-07-15 -->
<!-- COS_IMPORT zone:5 type:practice-results date:2026-07-15 -->
```

---

*Career OS Prompt Kit · MD Format Guide · Pairs with: all prompt templates*
