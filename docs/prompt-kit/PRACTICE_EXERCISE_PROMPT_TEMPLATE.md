# Career OS — Practice Exercise Prompt Templates

**Prompt IDs:** OP-07 (exercises) and OP-08 (mock exams)
**Tool:** ChatGPT
**Zone:** Skill Coach (Zone 5 → track drawer → per-week actions)

---

## How to use

1. In Career OS → Skills → open a track → expand a week.
2. Tap **Generate Practice** (OP-07) for open-ended exercises, or **Mock Exam** (OP-08) for multiple-choice cert prep.
3. The app generates the prompt with your track and week context injected.
4. Copy → paste into ChatGPT → work through the exercises or exam.
5. After completing, copy the AI's formatted output → upload icon → select "Practice Results" → paste → Import.

Results log against the skill track. If a milestone is marked complete, the app triggers an auto-rescore (AP-05) on linked pipeline roles.

---

## OP-07: Practice Exercises

```
Generate {count} practice exercises for {trackName}, Week {weekNumber}.

TOPIC: {weekTitle}
OBJECTIVES: {objectives, semicolon-separated}
DIFFICULTY: {beginner | intermediate | advanced}

DOMAIN CONTEXT (use this data for realistic exercises):
Milestone: {milestone description for this week}

EXERCISE FORMAT:
For each exercise provide: (1) a clear problem statement, (2) expected output or answer,
(3) step-by-step explanation, (4) one "bonus challenge" extension.

Format your output as:

<!-- COS_IMPORT zone:5 type:practice-results date:YYYY-MM-DD -->

## PRACTICE_RESULTS
track: {trackId}
skill: {trackName}
week: {weekNumber}
date: YYYY-MM-DD
source: chatgpt
type: EXERCISE

### Exercise 1: [title]
question: [problem statement]
expectedOutput: [correct answer]
explanation: [step-by-step]
bonusChallenge: [extension]

[repeat for each exercise]

## SCORE
total: {count}
correct: [fill in after attempting]
percentage: [fill in]%
weakAreas: [fill in]
strongAreas: [fill in]
```

---

## OP-08: Mock Exam (cert-specific)

Only appears for tracks with `type: CERT`. Generates multiple-choice questions matching the real exam format.

```
Generate a {questionCount}-question mock exam for {trackName}.

FOCUS AREA: {weekTitle or "full syllabus"}
DIFFICULTY: Match the actual exam difficulty for {trackName}
FORMAT: Multiple choice (4 options each), matching the real exam format

For each question: (1) question text, (2) four options A-D, (3) correct answer,
(4) brief explanation of why it's correct and why the common wrong answer is wrong.

Format your output as:

<!-- COS_IMPORT zone:5 type:practice-results date:YYYY-MM-DD -->

## PRACTICE_RESULTS
track: {trackId}
skill: {trackName}
week: {weekNumber}
date: YYYY-MM-DD
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

## SCORE
total: {questionCount}
correct: [fill in after attempting]
percentage: [fill in]%
weakAreas: [fill in]
strongAreas: [fill in]
```

---

## Variable injection map

| Placeholder | Source key | Path |
|-------------|-----------|------|
| `{trackId}` | `cos-skills` | `tracks[selected].trackId` |
| `{trackName}` | `cos-skills` | `tracks[selected].name` |
| `{weekNumber}` | `cos-skills` | `tracks[selected].curriculum.weeks[n].weekNumber` |
| `{weekTitle}` | `cos-skills` | `tracks[selected].curriculum.weeks[n].title` |
| `{objectives}` | `cos-skills` | `tracks[selected].curriculum.weeks[n].objectives[]` |
| `{milestone}` | `cos-skills` | `tracks[selected].curriculum.weeks[n].milestone` |
| `{count}` | App default | 5 for exercises, 10 for exams |
| `{difficulty}` | App default | "intermediate" |

---

## How results flow back

Imported practice results update the track:

- `track.practiceResults[]` gets a new entry with date, score, and weak/strong areas.
- The Skills zone shows a score trend chart across sessions.
- Completing a week's milestone (separate action) triggers AP-05 auto-rescore on linked roles — if the score crosses 80 or the gap drops to ≤10, a promotion toast fires.

---

*Career OS Prompt Kit · OP-07 / OP-08 · Pairs with: MD_FORMAT_GUIDE.md*
