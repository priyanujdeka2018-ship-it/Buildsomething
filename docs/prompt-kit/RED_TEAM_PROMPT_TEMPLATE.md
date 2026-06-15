# Career OS — Red Team Prompt Template

**Prompt ID:** OP-06
**Tool:** ChatGPT (or any AI)
**Zone:** JD Analyzer (Zone 3 → after scoring/playbook)

---

## How to use

1. In Career OS → Analyze → after scoring a JD (AP-01) and/or generating a playbook (AP-02).
2. Select the artifact to red-team: **Score Card** or **Playbook**.
3. The app generates the prompt below with the artifact content embedded.
4. Copy → paste into ChatGPT → review the findings.
5. Copy the AI's formatted output → upload icon → select "Red Team Results" → paste → Import.

Findings attach to the role card in the Pipeline and appear in the role drawer. Use them to strengthen your positioning before applying.

---

## Prompt template

```
You are a skeptical hiring manager at {company} reviewing this candidate's
{artifactType} for the {roleTitle} role. Your job is to find weaknesses,
not validate strengths.

{artifactContent — the full score card or playbook HTML}

EVALUATE:
1. GAPS FOUND: What would make you skeptical? Where does the positioning feel
   generic vs. genuinely differentiated? What follow-up questions would expose
   a weakness?
2. SUGGESTED STRENGTHENING: For each gap, suggest a specific fix referencing
   the artifact.
3. RED FLAGS: Any vocabulary slips, inflated claims, or missing proof points.

Format your output as:

<!-- COS_IMPORT zone:3 type:red-team date:YYYY-MM-DD -->

## RED_TEAM_RESULTS
role: {roleTitle} at {company}
source: chatgpt
date: YYYY-MM-DD

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

## Variable injection map

| Placeholder | Source | Notes |
|-------------|-------|-------|
| `{company}` | AP-01 scoring result | `score.company` |
| `{roleTitle}` | AP-01 scoring result | `score.role` |
| `{artifactType}` | User selection | "score card" or "playbook" |
| `{artifactContent}` | Runtime | Full score card JSON or playbook HTML from AP-01/AP-02 |

---

## How findings flow back

| Field | Storage key | Path |
|-------|-------------|------|
| Gap list | `cos-pipeline` | `roles[matched].redTeamFindings[].findings` |
| Source | `cos-pipeline` | `roles[matched].redTeamFindings[].source` |
| Addressed flag | `cos-pipeline` | `roles[matched].redTeamFindings[].addressed` |

The parser matches the role by name/company. If no exact match is found, it attaches findings to the most recently active role. You can mark findings as "addressed" in the role drawer after fixing them.

---

*Career OS Prompt Kit · OP-06 · Pairs with: MOCK_INTERVIEW_PROMPT_TEMPLATE.md*
